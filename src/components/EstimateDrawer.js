"use client"

import { Fragment, useEffect, useMemo, useRef, useState } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { ArrowLeft, Link2, Plus, Printer, Save, Trash2 } from "lucide-react"
import {
  formatCurrency,
  WAREHOUSE_CLADDING_OPTIONS,
  WAREHOUSE_LENGTH_OPTIONS,
  WAREHOUSE_WIDTH_OPTIONS,
} from "../lib/estimates/warehouseEstimate"
import {
  getGroundMountLayout,
  SOLAR_PRODUCT_TYPE_OPTIONS,
} from "../lib/estimates/solarEstimate"
import {
  calculateEstimateByProductType,
  isLcssEstimateProduct,
  isSolarEstimateProduct,
  isTrussEstimateProduct,
} from "../lib/estimates/estimateFactory"
import { TRUSS_ROOF_STYLE_OPTIONS } from "../lib/estimates/trussEstimate"

const ESTIMATE_PRODUCT_TYPE_OPTIONS = [
  { value: "LSF Warehouse", label: "LSF Warehouse" },
  { value: "LCSS Warehouse", label: "LCSS Warehouse" },
  { value: "LSF trusses", label: "LSF trusses" },
  { value: "CFLC trusses", label: "CFLC trusses" },
  ...SOLAR_PRODUCT_TYPE_OPTIONS,
]
const INTERNAL_PRODUCT_LABELS = [
  "LSF Warehouse",
  "LCSS Warehouse",
  "LCSS warehouse",
  "CFLC Warehouse",
  "CFLC warehouse",
  "Solar carport",
  "Solar ground mount",
  "Solar structure",
  "LSF trusses",
  "CFLC trusses",
]
const LCSS_ALLOWED_WIDTHS = [3, 6, 8, 10, 12]
const LCSS_ALLOWED_STEEL_FINISHES = ["Galv", "Mild"]
const LCSS_ALLOWED_GABLE_MODES = ["sheeted_gable", "open_gable"]
const TRUSS_ROOF_STYLES = TRUSS_ROOF_STYLE_OPTIONS.map((option) => option.value)

function roundMoney(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100
}

function isCatalogSize(width, length) {
  return WAREHOUSE_WIDTH_OPTIONS.includes(Number(width)) && WAREHOUSE_LENGTH_OPTIONS.includes(Number(length))
}

function isValidLcssLength(width, length) {
  const normalizedWidth = Number(width)
  const normalizedLength = Number(length)

  if (normalizedWidth === 3 && normalizedLength === 6) return true
  return Math.abs(normalizedLength / 2.5 - Math.round(normalizedLength / 2.5)) <= 0.0001
}

function applyGroundMountDefaults(previousState) {
  const moduleCount = Math.max(1, Number(previousState.moduleCount) || 36)
  const layout = getGroundMountLayout(moduleCount)

  return {
    ...previousState,
    useCustomSize: true,
    moduleCount,
    width: layout.width,
    length: layout.length,
    wallHeight: 0,
    steelFinish: "ZAM",
    includeStructureLabour: false,
    includeSolarBrackets: false,
    includeTransport: false,
    transportTrips: 0,
    claddingInstalled: false,
  }
}

function buildProductTypeAdjustedState(previousState, nextProductType) {
  const nextState = {
    ...previousState,
    productType: nextProductType,
  }

  if (!previousState.productTypeLabel?.trim() || INTERNAL_PRODUCT_LABELS.includes(previousState.productTypeLabel)) {
    nextState.productTypeLabel = nextProductType
  }

  if (isLcssEstimateProduct(nextProductType)) {
    const width = Number(previousState.width)
    const length = Number(previousState.length)

    nextState.width = LCSS_ALLOWED_WIDTHS.includes(width) ? width : 6
    nextState.length = isValidLcssLength(nextState.width, length) ? length : 10
    nextState.wallHeight =
      Number.isFinite(Number(previousState.wallHeight)) && Number(previousState.wallHeight) > 0
        ? Number(previousState.wallHeight)
        : 3
    nextState.useCustomSize = true
    nextState.steelFinish = LCSS_ALLOWED_STEEL_FINISHES.includes(previousState.steelFinish)
      ? previousState.steelFinish
      : "Galv"
    nextState.gableMode = LCSS_ALLOWED_GABLE_MODES.includes(previousState.gableMode)
      ? previousState.gableMode
      : "sheeted_gable"
    return nextState
  }

  if (nextProductType === "LSF Warehouse") {
    const width = Number(previousState.width)
    const length = Number(previousState.length)

    nextState.width = WAREHOUSE_WIDTH_OPTIONS.includes(width) ? width : 8
    nextState.length = WAREHOUSE_LENGTH_OPTIONS.includes(length) ? length : 10
    nextState.useCustomSize =
      typeof previousState.useCustomSize === "boolean" ? previousState.useCustomSize : false
    return nextState
  }

  if (isTrussEstimateProduct(nextProductType)) {
    nextState.useCustomSize = true
    nextState.width = Math.max(0.1, Number(previousState.width) || 8)
    nextState.length = Math.max(0.1, Number(previousState.length) || 10)
    nextState.roofStyle = TRUSS_ROOF_STYLES.includes(previousState.roofStyle)
      ? previousState.roofStyle
      : "dual_pitch"
    nextState.roofPitch = Math.max(1, Number(previousState.roofPitch) || 15)
    nextState.trussSpacing = Math.max(0.1, Number(previousState.trussSpacing) || 1.2)
    return nextState
  }

  if (isSolarEstimateProduct(nextProductType)) {
    nextState.useCustomSize = true
    nextState.moduleCount = Math.max(0, Number(previousState.moduleCount) || 0)
    nextState.width = Math.max(0.1, Number(previousState.width) || 6)
    nextState.length = Math.max(0.1, Number(previousState.length) || 6)
    nextState.wallHeight = Math.max(0.1, Number(previousState.wallHeight) || 3)
    nextState.transportTrips = Math.max(0, Math.round(Number(previousState.transportTrips) || 0))
    nextState.includeStructureLabour = Boolean(previousState.includeStructureLabour)
    nextState.includeSolarBrackets =
      typeof previousState.includeSolarBrackets === "boolean" ? previousState.includeSolarBrackets : false
    nextState.includeTransport =
      typeof previousState.includeTransport === "boolean" ? previousState.includeTransport : false
    nextState.steelFinish = previousState.steelFinish || "Galv"

    if (nextProductType === "Solar ground mount") {
      return applyGroundMountDefaults(nextState)
    }

    return nextState
  }

  return nextState
}

function getLatestEstimate(existingEstimates) {
  return [...(existingEstimates || [])]
    .sort((a, b) => {
      const versionDiff = Number(b?.version_no || 0) - Number(a?.version_no || 0)
      if (versionDiff !== 0) return versionDiff

      const dateA = new Date(a?.created_at || 0).getTime()
      const dateB = new Date(b?.created_at || 0).getTime()
      return dateB - dateA
    })[0]
}

function stripVersionSuffix(title) {
  return String(title || "").replace(/\s+V\d+$/i, "").trim()
}

function buildInitialState(lead, estimate) {
  const latestInput = estimate?.input_data || {}
  const productType =
    latestInput.productType ||
    estimate?.product_type ||
    lead?.product_type ||
    "LSF Warehouse"
  const width = Number(latestInput.width || lead?.width || 8)
  const length = Number(latestInput.length || lead?.length || 10)
  const solarProduct = isSolarEstimateProduct(productType)
  const useCustomSize =
    typeof latestInput.useCustomSize === "boolean"
      ? latestInput.useCustomSize
      : solarProduct || !isCatalogSize(width, length)

  const initialState = {
    productType,
    productTypeLabel:
      latestInput.productTypeLabel ||
      estimate?.product_type_display ||
      estimate?.product_type ||
      lead?.product_type ||
      productType,
    width,
    length,
    useCustomSize,
    wallHeight: Number(latestInput.wallHeight || lead?.wall_height || 3),
    quantity: Math.max(1, Number(latestInput.quantity || 1)),
    roofStyle: latestInput.roofStyle || "dual_pitch",
    roofPitch: Math.max(1, Number(latestInput.roofPitch || 15)),
    trussSpacing: Math.max(0.1, Number(latestInput.trussSpacing || 1.2)),
    moduleCount: Math.max(0, Number(latestInput.moduleCount || 0)),
    cladding: latestInput.cladding || lead?.cladding || "None",
    claddingInstalled:
      typeof latestInput.claddingInstalled === "boolean"
        ? latestInput.claddingInstalled
        : String(lead?.installation || "").toLowerCase() === "installed",
    deliveryDistance: Number(latestInput.deliveryDistance || lead?.delivery_distance || 0),
    transportTrips: Math.max(0, Number(latestInput.transportTrips || 0)),
    includeStructureLabour:
      typeof latestInput.includeStructureLabour === "boolean"
        ? latestInput.includeStructureLabour
        : false,
    includeSolarBrackets:
      typeof latestInput.includeSolarBrackets === "boolean"
        ? latestInput.includeSolarBrackets
        : true,
    includeTransport:
      typeof latestInput.includeTransport === "boolean"
        ? latestInput.includeTransport
        : false,
    steelFinish: latestInput.steelFinish || "Galv",
    notes: estimate?.notes || "",
    estimateName: stripVersionSuffix(estimate?.title) || "",
  }

  return buildProductTypeAdjustedState(initialState, productType)
}

function buildDefaultEstimateTitle(previewTitle, productTypeLabel) {
  if (!productTypeLabel?.trim()) return previewTitle

  let output = String(previewTitle || "")
  INTERNAL_PRODUCT_LABELS.forEach((label) => {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    output = output.replace(new RegExp(escaped, "g"), productTypeLabel.trim())
  })
  return output
}

function buildEstimateRequestLabel(previewRequest, productTypeLabel) {
  if (!productTypeLabel?.trim()) return previewRequest

  let output = String(previewRequest || "")
  INTERNAL_PRODUCT_LABELS.forEach((label) => {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    output = output.replace(new RegExp(escaped, "g"), productTypeLabel.trim())
  })
  return output
}

function buildEditableLineItem(item, overrides = {}) {
  const quantity = Number(overrides.quantity ?? item.quantity ?? 0)
  const unitRate = Number(overrides.unitRate ?? item.unitRate ?? 0)
  const label = overrides.label ?? item.label
  const unit = overrides.unit ?? item.unit
  const priceIncludesMarkup =
    typeof overrides.priceIncludesMarkup === "boolean"
      ? overrides.priceIncludesMarkup
      : Boolean(overrides.manual)
  return {
    id: overrides.id || item.code,
    code: item.code,
    label,
    quantity,
    unit,
    unitRate,
    total: roundMoney(quantity * unitRate),
    originalQuantity: Number(item.quantity ?? 0),
    originalUnitRate: Number(item.unitRate ?? 0),
    originalTotal: roundMoney(item.total ?? quantity * unitRate),
    manual: Boolean(overrides.manual),
    priceIncludesMarkup,
    userEdited: Boolean(overrides.userEdited),
    overrideReason: overrides.overrideReason || "",
  }
}

function applyMarkupToLineItem(item, markupMultiplier) {
  const quantity = Number(item.quantity ?? 0)
  const unitRate = Number(item.unitRate ?? 0)
  const baseTotal = Number(item.total ?? quantity * unitRate)
  const sellTotal = roundMoney(baseTotal * markupMultiplier)
  const sellUnitRate = quantity > 0 ? roundMoney(sellTotal / quantity) : roundMoney(unitRate * markupMultiplier)

  return {
    ...item,
    unitRate: sellUnitRate,
    total: sellTotal,
    priceIncludesMarkup: true,
  }
}

function buildEditableLineItemsFromEstimate(previewLineItems, estimate, markupMultiplier) {
  const savedItems = Array.isArray(estimate?.line_items) ? estimate.line_items : []
  const savedOriginalItems = Array.isArray(estimate?.original_line_items) ? estimate.original_line_items : []

  if (savedItems.length === 0) {
    return previewLineItems.map((item) =>
      buildEditableLineItem(applyMarkupToLineItem(item, markupMultiplier), {
        priceIncludesMarkup: true,
      })
    )
  }

  const previewByCode = new Map(previewLineItems.map((item) => [item.code, item]))
  const savedOriginalByCode = new Map(savedOriginalItems.map((item) => [item.code, item]))

  return savedItems.map((savedItem) => {
    const previewItem = previewByCode.get(savedItem.code)
    const normalizedSavedItem = savedItem.priceIncludesMarkup
      ? savedItem
      : applyMarkupToLineItem(savedItem, markupMultiplier)
    const matchingOriginalItem = savedOriginalByCode.get(savedItem.code)
    const normalizedOriginalItem = matchingOriginalItem
      ? applyMarkupToLineItem(matchingOriginalItem, markupMultiplier)
      : null
    const savedItemWasEdited = normalizedOriginalItem
      ? Number(normalizedSavedItem.quantity ?? 0) !== Number(normalizedOriginalItem.quantity ?? 0) ||
        Number(normalizedSavedItem.unitRate ?? 0) !== Number(normalizedOriginalItem.unitRate ?? 0) ||
        String(normalizedSavedItem.label || "") !== String(normalizedOriginalItem.label || "")
      : Boolean(savedItem.manual)

    if (previewItem) {
      return buildEditableLineItem(
        applyMarkupToLineItem(previewItem, markupMultiplier),
        {
          ...normalizedSavedItem,
          userEdited: savedItemWasEdited,
        }
      )
    }

    return buildEditableLineItem(normalizedSavedItem, {
      ...normalizedSavedItem,
      id: savedItem.id || savedItem.code,
      manual: true,
      userEdited: true,
    })
  })
}

function hasLineItemOverrides(item, previewLabel) {
  if (!item.userEdited) return false

  return (
    Number(item.quantity) !== Number(item.originalQuantity) ||
    Number(item.unitRate) !== Number(item.originalUnitRate) ||
    item.label !== previewLabel
  )
}

function openEstimateDocument(url) {
  if (!url || typeof window === "undefined") return
  const prefersSameTab =
    window.matchMedia?.("(max-width: 768px)").matches ||
    window.matchMedia?.("(pointer: coarse)").matches

  if (prefersSameTab) {
    window.location.href = url
    return
  }

  window.open(url, "_blank", "noopener,noreferrer")
}

function buildShareUrl(shareToken) {
  if (!shareToken || typeof window === "undefined") return ""
  return `${window.location.origin}/quotes/${shareToken}`
}

function buildEstimatePreviewUrl(estimateId) {
  if (!estimateId) return ""
  return `/kanban/estimates/${estimateId}`
}

function buildEstimatePdfUrl(estimateId) {
  if (!estimateId) return ""
  return `/api/estimates/${estimateId}/pdf`
}

function isLocalEstimateId(estimateId) {
  return String(estimateId || "").startsWith("local-")
}

function getNextEstimateVersion(estimates = []) {
  const maxVersion = estimates.reduce((highest, estimate) => {
    const version = Number(estimate?.version_no || 0)
    return Number.isFinite(version) ? Math.max(highest, version) : highest
  }, 0)

  return maxVersion + 1
}

function buildEstimateDraft({
  lead,
  versionNo,
  formState,
  preview,
  editableLineItems,
  subtotal,
  estimatedTotal,
  existingEstimate,
  saveMode = "new",
}) {
  return {
    id: existingEstimate?.id,
    lead,
    version_no: versionNo,
    product_type: formState.productType,
    product_type_display: formState.productTypeLabel?.trim() || formState.productType,
    title: `${(
      formState.estimateName ||
      buildDefaultEstimateTitle(preview.summary.title, formState.productTypeLabel)
    ).trim()} V${versionNo}`,
    input_data: {
      ...preview.input,
      useCustomSize: formState.useCustomSize,
      productType: formState.productType,
      productTypeLabel: formState.productTypeLabel?.trim() || formState.productType,
    },
    original_line_items: preview.lineItems,
    line_items: editableLineItems,
    subtotal,
    markup_multiplier: preview.pricing.markupMultiplier,
    total: estimatedTotal,
    notes: formState.notes,
    estimate_request: buildEstimateRequestLabel(
      preview.summary.estimateRequest,
      formState.productTypeLabel
    ),
    save_mode: saveMode,
    share_token: existingEstimate?.share_token,
  }
}

export default function EstimateDrawer({
  lead,
  estimates,
  onClose,
  onSaveEstimate,
}) {
  const latestEstimate = useMemo(() => getLatestEstimate(estimates), [estimates])
  const [loadedEstimateId, setLoadedEstimateId] = useState(() => latestEstimate?.id || null)
  const loadedEstimate = useMemo(() => {
    if (!loadedEstimateId) return latestEstimate || null
    return estimates.find((estimate) => estimate.id === loadedEstimateId) || latestEstimate || null
  }, [estimates, latestEstimate, loadedEstimateId])
  const [formState, setFormState] = useState(() => buildInitialState(lead, latestEstimate))
  const [isSaving, setIsSaving] = useState(false)
  const [prefersSameTabPreview, setPrefersSameTabPreview] = useState(false)
  const previousProductTypeRef = useRef(buildInitialState(lead, latestEstimate).productType)
  const isSolarEstimate = isSolarEstimateProduct(formState.productType)
  const isGroundMountEstimate = formState.productType === "Solar ground mount"
  const isTrussEstimate = isTrussEstimateProduct(formState.productType)
  const preview = useMemo(
    () => calculateEstimateByProductType(formState.productType, formState),
    [formState]
  )
  const [editableLineItems, setEditableLineItems] = useState(() =>
    buildEditableLineItemsFromEstimate(
      preview.lineItems,
      latestEstimate,
      preview.pricing.markupMultiplier
    )
  )

  useEffect(() => {
    setLoadedEstimateId(latestEstimate?.id || null)
  }, [lead?.id, latestEstimate?.id])

  useEffect(() => {
    const nextFormState = buildInitialState(lead, loadedEstimate)
    setFormState(nextFormState)
    previousProductTypeRef.current = nextFormState.productType

    const nextPreview = calculateEstimateByProductType(nextFormState.productType, nextFormState)
    setEditableLineItems(
      buildEditableLineItemsFromEstimate(
        nextPreview.lineItems,
        loadedEstimate,
        nextPreview.pricing.markupMultiplier
      )
    )
  }, [lead, loadedEstimate])

  useEffect(() => {
    setEditableLineItems((currentItems) => {
      const productTypeChanged = previousProductTypeRef.current !== formState.productType
      previousProductTypeRef.current = formState.productType

      if (productTypeChanged || currentItems.length === 0) {
        return preview.lineItems.map((item) =>
          buildEditableLineItem(applyMarkupToLineItem(item, preview.pricing.markupMultiplier), {
            priceIncludesMarkup: true,
          })
        )
      }

      const previewByCode = new Map(preview.lineItems.map((item) => [item.code, item]))
      const mergedBaseItems = currentItems
        .filter((item) => !item.manual)
        .map((item) => {
          const previewItem = previewByCode.get(item.code)
          if (!previewItem) return null

          const pricedPreviewItem = applyMarkupToLineItem(previewItem, preview.pricing.markupMultiplier)

          if (!hasLineItemOverrides(item, pricedPreviewItem.label)) {
            return buildEditableLineItem(pricedPreviewItem, {
              id: item.id || previewItem.code,
              priceIncludesMarkup: true,
            })
          }

          return buildEditableLineItem(pricedPreviewItem, item)
        })
        .filter(Boolean)

      const manualItems = currentItems.filter((item) => item.manual)
      return [...mergedBaseItems, ...manualItems]
    })
  }, [formState.productType, preview.lineItems, preview.pricing.markupMultiplier])

  useEffect(() => {
    if (typeof window === "undefined") return

    const mobileMedia = window.matchMedia("(max-width: 768px)")
    const coarseMedia = window.matchMedia("(pointer: coarse)")

    const updatePreference = () => {
      setPrefersSameTabPreview(mobileMedia.matches || coarseMedia.matches)
    }

    updatePreference()
    mobileMedia.addEventListener?.("change", updatePreference)
    coarseMedia.addEventListener?.("change", updatePreference)

    return () => {
      mobileMedia.removeEventListener?.("change", updatePreference)
      coarseMedia.removeEventListener?.("change", updatePreference)
    }
  }, [])

  const nextVersion = getNextEstimateVersion(estimates)
  const canUpdateLoadedEstimate = Boolean(loadedEstimate?.id)
  const sortedEstimates = useMemo(() => [...(estimates || [])].sort((a, b) => {
    const versionDiff = Number(b?.version_no || 0) - Number(a?.version_no || 0)
    if (versionDiff !== 0) return versionDiff

    const dateA = new Date(a?.created_at || 0).getTime()
    const dateB = new Date(b?.created_at || 0).getTime()
    return dateB - dateA
  }), [estimates])
  const subtotal = useMemo(
    () => roundMoney(editableLineItems.reduce((sum, item) => sum + Number(item.total || 0), 0)),
    [editableLineItems]
  )
  const estimatedTotal = subtotal
  const hasOverrides = editableLineItems.some(
    (item) =>
      item.manual ||
      item.label !== (item.manual ? item.label : preview.lineItems.find((base) => base.code === item.code)?.label) ||
      Number(item.quantity) !== Number(item.originalQuantity) ||
      Number(item.unitRate) !== Number(item.originalUnitRate)
  )

  const handleChange = (field, value) => {
    setFormState((prev) => {
      const nextState =
        field === "productType"
          ? buildProductTypeAdjustedState(prev, value)
          : { ...prev, [field]: value }

      if ((field === "moduleCount" || field === "productType") && nextState.productType === "Solar ground mount") {
        return applyGroundMountDefaults(nextState)
      }

      return nextState
    })
  }

  const updateLineItem = (id, updates) => {
    setEditableLineItems((current) =>
      current.map((item) => {
        if (item.id !== id) return item
        const nextItem = { ...item, ...updates }
        return {
          ...nextItem,
          quantity: Number(nextItem.quantity) || 0,
          unitRate: Number(nextItem.unitRate) || 0,
          total: roundMoney((Number(nextItem.quantity) || 0) * (Number(nextItem.unitRate) || 0)),
          userEdited: true,
        }
      })
    )
  }

  const addManualItem = () => {
    const id = `manual-${Date.now()}`
    setEditableLineItems((current) => [
      ...current,
      {
        id,
        code: id,
        label: "Manual line item",
        quantity: 1,
        unit: "item",
        unitRate: 0,
        total: 0,
        originalQuantity: 0,
        originalUnitRate: 0,
        originalTotal: 0,
        manual: true,
        priceIncludesMarkup: true,
        userEdited: true,
        overrideReason: "Added manually",
      },
    ])
  }

  const removeLineItem = (id) => {
    setEditableLineItems((current) => current.filter((item) => item.id !== id))
  }

  const handleCopyShareLink = async (shareToken) => {
    const shareUrl = buildShareUrl(shareToken)
    if (!shareUrl) return
    await navigator.clipboard.writeText(shareUrl)
  }

  const handleSave = async () => {
    setIsSaving(true)
    const savedEstimate = await onSaveEstimate(
      buildEstimateDraft({
        lead,
        versionNo: nextVersion,
        formState,
        preview,
        editableLineItems,
        subtotal,
        estimatedTotal,
      })
    )
    setIsSaving(false)

    if (savedEstimate) {
      onClose()
    }
  }

  const handleSaveAndOpen = async () => {
    setIsSaving(true)
    const savedEstimate = await onSaveEstimate(
      buildEstimateDraft({
        lead,
        versionNo: nextVersion,
        formState,
        preview,
        editableLineItems,
        subtotal,
        estimatedTotal,
      })
    )
    setIsSaving(false)

    if (savedEstimate?.id) {
      openEstimateDocument(
        isLocalEstimateId(savedEstimate.id)
          ? buildEstimatePreviewUrl(savedEstimate.id)
          : buildEstimatePdfUrl(savedEstimate.id)
      )
      if (!prefersSameTabPreview) {
        onClose()
      }
    }
  }

  const handleUpdateLoadedEstimate = async (openAfterSave = false) => {
    if (!loadedEstimate?.id) return

    setIsSaving(true)
    const savedEstimate = await onSaveEstimate(
      buildEstimateDraft({
        lead,
        versionNo: Number(loadedEstimate.version_no) || nextVersion,
        formState,
        preview,
        editableLineItems,
        subtotal,
        estimatedTotal,
        existingEstimate: loadedEstimate,
        saveMode: "update",
      })
    )
    setIsSaving(false)

    if (savedEstimate?.id && openAfterSave) {
      openEstimateDocument(
        isLocalEstimateId(savedEstimate.id)
          ? buildEstimatePreviewUrl(savedEstimate.id)
          : buildEstimatePdfUrl(savedEstimate.id)
      )
      if (!prefersSameTabPreview) {
        onClose()
      }
      return
    }

    if (savedEstimate) {
      onClose()
    }
  }

  return (
    <Transition.Root show={!!lead} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex justify-end">
          <Transition.Child
            as="div"
            enter="transform transition ease-in-out duration-300"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transform transition ease-in-out duration-200"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <Dialog.Panel className="flex h-full w-screen max-w-full flex-col overflow-hidden bg-white shadow-xl sm:w-[520px] sm:max-w-[520px]">
              <div className="sticky top-0 z-10 border-b bg-white px-4 py-3 sm:px-6 sm:py-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <button onClick={onClose} className="shrink-0 rounded-full p-2 transition hover:bg-gray-100">
                      <ArrowLeft size={20} />
                    </button>
                    <div className="min-w-0">
                      <Dialog.Title className="text-lg font-semibold text-slate-900 sm:text-xl">
                        {canUpdateLoadedEstimate ? "Edit Estimate" : "Create Estimate"}
                      </Dialog.Title>
                      <p className="truncate text-sm text-slate-500">
                        {lead?.name} {lead?.last_name} · {canUpdateLoadedEstimate ? `Loaded version ${loadedEstimate?.version_no}` : `New version ${nextVersion}`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
                <div className="space-y-6">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-900">Estimate type</p>
                    <p className="mt-1 text-sm text-slate-600">
                      Choose the structure category first, then shape the estimate inputs for that product.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">Product type</label>
                    <select
                      value={formState.productType}
                      onChange={(event) => handleChange("productType", event.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    >
                      {ESTIMATE_PRODUCT_TYPE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">Estimate name</label>
                    <input
                      type="text"
                      value={formState.estimateName}
                      onChange={(event) => handleChange("estimateName", event.target.value)}
                      placeholder={buildDefaultEstimateTitle(preview.summary.title, formState.productTypeLabel)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">Client-facing product label</label>
                    <input
                      type="text"
                      value={formState.productTypeLabel}
                      onChange={(event) => handleChange("productTypeLabel", event.target.value)}
                      placeholder={formState.productType}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      Use this when the quote should say something more specific than the internal product type.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    {!isSolarEstimate && !isTrussEstimate ? (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleChange("useCustomSize", false)}
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                            !formState.useCustomSize
                              ? "bg-slate-900 text-white"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          Catalog sizes
                        </button>
                        <button
                          type="button"
                          onClick={() => handleChange("useCustomSize", true)}
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                            formState.useCustomSize
                              ? "bg-slate-900 text-white"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          Custom request
                        </button>
                      </div>
                    ) : null}

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-slate-700">
                          {isTrussEstimate ? "Span" : isGroundMountEstimate ? "Calculated width" : isSolarEstimate ? "Width / span" : "Width"}
                        </label>
                        {isGroundMountEstimate ? (
                          <div className="mt-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900">
                            {formState.width}m
                          </div>
                        ) : formState.useCustomSize || isSolarEstimate || isTrussEstimate ? (
                          <input
                            type="number"
                            min="0.1"
                            step="0.1"
                            value={formState.width}
                            onChange={(event) =>
                              handleChange("width", Math.max(0.1, Number(event.target.value) || 0.1))
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                          />
                        ) : (
                          <select
                            value={formState.width}
                            onChange={(event) => handleChange("width", Number(event.target.value))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                          >
                            {WAREHOUSE_WIDTH_OPTIONS.map((option) => (
                              <option key={option} value={option}>
                                {option}m
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700">
                          {isTrussEstimate ? "Building length" : isGroundMountEstimate ? "Calculated length" : isSolarEstimate ? "Length" : "Length / depth"}
                        </label>
                        {isGroundMountEstimate ? (
                          <div className="mt-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900">
                            {formState.length}m
                          </div>
                        ) : formState.useCustomSize || isSolarEstimate || isTrussEstimate ? (
                          <input
                            type="number"
                            min="0.1"
                            step="0.1"
                            value={formState.length}
                            onChange={(event) =>
                              handleChange("length", Math.max(0.1, Number(event.target.value) || 0.1))
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                          />
                        ) : (
                          <select
                            value={formState.length}
                            onChange={(event) => handleChange("length", Number(event.target.value))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                          >
                            {WAREHOUSE_LENGTH_OPTIONS.map((option) => (
                              <option key={option} value={option}>
                                {option}m
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                  </div>

                  {isTrussEstimate ? (
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700">Roof style</label>
                        <select
                          value={formState.roofStyle}
                          onChange={(event) => handleChange("roofStyle", event.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        >
                          {TRUSS_ROOF_STYLE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700">Roof pitch (°)</label>
                        <input
                          type="number"
                          min="1"
                          step="0.5"
                          value={formState.roofPitch}
                          onChange={(event) =>
                            handleChange("roofPitch", Math.max(1, Number(event.target.value) || 1))
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700">Truss spacing (m)</label>
                        <input
                          type="number"
                          min="0.1"
                          step="0.1"
                          value={formState.trussSpacing}
                          onChange={(event) =>
                            handleChange("trussSpacing", Math.max(0.1, Number(event.target.value) || 0.1))
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-slate-700">
                          {isGroundMountEstimate ? "Estimate basis" : isSolarEstimate ? "Clearance height" : "Height"}
                        </label>
                        {isGroundMountEstimate ? (
                          <div className="mt-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900">
                            Structure-only baseline
                          </div>
                        ) : (
                          <input
                            type="number"
                            min="0.1"
                            step="0.1"
                            value={formState.wallHeight}
                            onChange={(event) =>
                              handleChange("wallHeight", Math.max(0.1, Number(event.target.value) || 0.1))
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                          />
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={formState.quantity}
                          onChange={(event) => handleChange("quantity", Math.max(1, Number(event.target.value) || 1))}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        />
                      </div>
                    </div>
                  )}

                  {isTrussEstimate ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-slate-700">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={formState.quantity}
                          onChange={(event) => handleChange("quantity", Math.max(1, Number(event.target.value) || 1))}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700">
                          Delivery distance (km)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formState.deliveryDistance}
                          onChange={(event) =>
                            handleChange("deliveryDistance", Number(event.target.value) || 0)
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        />
                      </div>
                    </div>
                  ) : null}

                  {!isTrussEstimate ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {!isSolarEstimate ? (
                      <div>
                        <label className="block text-sm font-medium text-slate-700">Cladding</label>
                        <select
                          value={formState.cladding}
                          onChange={(event) => handleChange("cladding", event.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        >
                          {WAREHOUSE_CLADDING_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-slate-700">Module count</label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={formState.moduleCount}
                          onChange={(event) =>
                            handleChange("moduleCount", Math.max(0, Number(event.target.value) || 0))
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        {isGroundMountEstimate ? "Calculated layout" : "Delivery distance (km)"}
                      </label>
                      {isGroundMountEstimate ? (
                        <div className="mt-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900">
                          {preview.totals?.bayCount || 0} bay{preview.totals?.bayCount === 1 ? "" : "s"} · {preview.totals?.pricedPanels || 0} priced panels
                        </div>
                      ) : (
                        <input
                          type="number"
                          min="0"
                          value={formState.deliveryDistance}
                          onChange={(event) =>
                            handleChange("deliveryDistance", Number(event.target.value) || 0)
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        />
                      )}
                    </div>
                  </div>
                  ) : null}

                  {isGroundMountEstimate ? (
                    <>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                        This CRM estimate now follows the same panel-count pricing logic as the public
                        ground mount estimator. Panel count drives the layout automatically, ZAM steel is
                        standard, and the quote starts from a structure-only baseline for faster pricing.
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium text-slate-700">Steel finish</label>
                          <div className="mt-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900">
                            ZAM
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700">Hardware basis</label>
                          <div className="mt-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900">
                            Structure only by default
                          </div>
                        </div>
                      </div>
                    </>
                  ) : null}

                  {!isSolarEstimate && preview.summary.layoutNote ? (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                      {preview.summary.layoutNote}
                    </div>
                  ) : null}

                  {!isGroundMountEstimate ? (
                    <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={formState.claddingInstalled}
                        onChange={(event) =>
                          handleChange("claddingInstalled", event.target.checked)
                        }
                      />
                      {isTrussEstimate
                        ? "Include installation"
                        : isSolarEstimate
                          ? "Include installation and site assembly"
                          : "Include installation for the structure"}
                    </label>
                  ) : null}

                  <div>
                    <label className="block text-sm font-medium text-slate-700">Estimate notes</label>
                    <textarea
                      rows={3}
                      value={formState.notes}
                      onChange={(event) => handleChange("notes", event.target.value)}
                      placeholder="Optional notes for this revision..."
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    />
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
                      <div>
                        <p className="text-sm font-medium text-slate-700">Estimated total</p>
                        <p className="mt-2 text-3xl font-bold text-emerald-600">
                          {formatCurrency(estimatedTotal)}
                        </p>
                      </div>
                      <div className="text-sm text-slate-500 sm:text-right">
                        <p>Line-item total: {formatCurrency(subtotal)}</p>
                        <p>Prices shown include margin</p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm font-medium text-slate-900">Line items</p>
                      <button
                        type="button"
                        onClick={addManualItem}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 sm:w-auto"
                      >
                        <Plus size={16} />
                        Add manual item
                      </button>
                    </div>

                    <div className="mt-4 space-y-3">
                      {editableLineItems.map((item) => {
                        const isOverridden =
                          item.manual ||
                          Number(item.quantity) !== Number(item.originalQuantity) ||
                          Number(item.unitRate) !== Number(item.originalUnitRate) ||
                          item.label !==
                            (preview.lineItems.find((base) => base.code === item.code)?.label || item.label)

                        return (
                          <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-4">
                            <div className="grid gap-3 md:grid-cols-[1.6fr_0.7fr_0.7fr_0.8fr_auto]">
                              <div>
                                <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                                  Item
                                </label>
                                <input
                                  type="text"
                                  value={item.label}
                                  onChange={(event) => updateLineItem(item.id, { label: event.target.value })}
                                  className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                                  Qty
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={item.quantity}
                                  onChange={(event) =>
                                    updateLineItem(item.id, { quantity: event.target.value })
                                  }
                                  className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                                  Unit
                                </label>
                                <input
                                  type="text"
                                  value={item.unit}
                                  onChange={(event) => updateLineItem(item.id, { unit: event.target.value })}
                                  className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                                  Unit rate
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={item.unitRate}
                                  onChange={(event) =>
                                    updateLineItem(item.id, { unitRate: event.target.value })
                                  }
                                  className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm"
                                />
                              </div>
                              <div className="flex items-end justify-end">
                                {(item.manual || editableLineItems.length > 1) && (
                                  <button
                                    type="button"
                                    onClick={() => removeLineItem(item.id)}
                                    className="rounded-lg border border-red-200 bg-red-50 p-2 text-red-600 transition hover:bg-red-100"
                                    title="Remove line item"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
                              <div>
                                <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                                  Override reason
                                </label>
                                <input
                                  type="text"
                                  value={item.overrideReason}
                                  onChange={(event) =>
                                    updateLineItem(item.id, { overrideReason: event.target.value })
                                  }
                                  placeholder={item.manual ? "Why was this added?" : "Why was this changed?"}
                                  className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm"
                                />
                                {item.manual && item.priceIncludesMarkup && (
                                  <p className="mt-1 text-xs text-slate-500">
                                    Manual items are treated as final sell prices and are not marked up again.
                                  </p>
                                )}
                              </div>
                              <div className="text-left md:text-right">
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                  Line total
                                </p>
                                <p className="mt-1 text-sm font-semibold text-slate-900">
                                  {formatCurrency(item.total)}
                                </p>
                                {isOverridden && !item.manual && (
                                  <p className="mt-1 text-xs text-amber-600">
                                    Base: {formatCurrency(item.originalTotal)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-600">
                    {canUpdateLoadedEstimate
                      ? "You can update the loaded estimate in place, or save these changes as a new version. The CRM will still refresh the lead quote value and activity log."
                      : "This estimate will save against the lead, mark the lead as quoted, update the quote value, and log the activity in the CRM."}
                    {hasOverrides && (
                      <span className="mt-2 block text-amber-700">
                        This revision includes manual line-item adjustments.
                      </span>
                    )}
                  </div>

                  {sortedEstimates.length > 0 && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium text-slate-900">Saved estimate versions</p>
                          <p className="mt-1 text-sm text-slate-500">
                            Open a quote, or load a saved version back into the editor as the base for a new revision.
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 space-y-3">
                        {sortedEstimates.map((estimate) => {
                          const canGeneratePdf = !isLocalEstimateId(estimate.id)
                          const isLoaded = estimate.id === loadedEstimate?.id

                          return (
                          <div
                            key={estimate.id}
                            className={`flex flex-col gap-3 rounded-xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 ${
                              isLoaded
                                ? "border-slate-900 bg-slate-100"
                                : "border-slate-200 bg-slate-50"
                            }`}
                          >
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{estimate.title}</p>
                              <p className="mt-1 text-xs text-slate-500">
                                Version {estimate.version_no} · {formatCurrency(estimate.total || 0)}
                              </p>
                              {isLoaded ? (
                                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700">
                                  Loaded in editor
                                </p>
                              ) : null}
                            </div>
                            <button
                              type="button"
                              onClick={() => setLoadedEstimateId(estimate.id)}
                              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 sm:w-auto"
                            >
                              <Save size={16} />
                              {isLoaded ? "Loaded" : "Load into editor"}
                            </button>
                            {canGeneratePdf ? (
                              <button
                                type="button"
                                onClick={() => openEstimateDocument(buildEstimatePdfUrl(estimate.id))}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 sm:w-auto"
                              >
                                <Printer size={16} />
                                Open PDF
                              </button>
                            ) : null}
                            <button
                              type="button"
                              onClick={() => openEstimateDocument(buildEstimatePreviewUrl(estimate.id))}
                              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 sm:w-auto"
                            >
                              <Printer size={16} />
                              Preview Quote
                            </button>
                            {estimate.share_token ? (
                              <button
                                type="button"
                                onClick={() => handleCopyShareLink(estimate.share_token)}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 sm:w-auto"
                              >
                                <Link2 size={16} />
                                Copy Share Link
                              </button>
                            ) : null}
                          </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="sticky bottom-0 z-10 flex flex-col-reverse gap-2 border-t bg-white px-4 py-3 sm:flex-row sm:justify-end sm:px-6 sm:py-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveAndOpen}
                  disabled={isSaving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Printer size={16} />
                  {isSaving ? "Saving..." : canUpdateLoadedEstimate ? "Save New Version & Open PDF" : "Save & Open PDF"}
                </button>
                {canUpdateLoadedEstimate ? (
                  <button
                    type="button"
                    onClick={() => handleUpdateLoadedEstimate(false)}
                    disabled={isSaving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Save size={16} />
                    {isSaving ? "Saving..." : `Update Loaded V${loadedEstimate?.version_no}`}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save size={16} />
                  {isSaving ? "Saving..." : canUpdateLoadedEstimate ? "Save New Version" : "Save Estimate"}
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
