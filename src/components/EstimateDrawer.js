"use client"

import { Fragment, useEffect, useMemo, useState } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { ArrowLeft, Link2, Plus, Printer, Save, Trash2 } from "lucide-react"
import {
  calculateWarehouseEstimate,
  formatCurrency,
  WAREHOUSE_CLADDING_OPTIONS,
  WAREHOUSE_LENGTH_OPTIONS,
  WAREHOUSE_WIDTH_OPTIONS,
} from "../lib/estimates/warehouseEstimate"

function roundMoney(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100
}

function isCatalogSize(width, length) {
  return WAREHOUSE_WIDTH_OPTIONS.includes(Number(width)) && WAREHOUSE_LENGTH_OPTIONS.includes(Number(length))
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

function buildInitialState(lead, existingEstimates) {
  const latestEstimate = getLatestEstimate(existingEstimates)
  const latestInput = latestEstimate?.input_data || {}
  const width = Number(latestInput.width || lead?.width || 8)
  const length = Number(latestInput.length || lead?.length || 10)
  const useCustomSize =
    typeof latestInput.useCustomSize === "boolean"
      ? latestInput.useCustomSize
      : !isCatalogSize(width, length)

  return {
    width,
    length,
    useCustomSize,
    wallHeight: Number(latestInput.wallHeight || lead?.wall_height || 3),
    quantity: Math.max(1, Number(latestInput.quantity || 1)),
    cladding: latestInput.cladding || lead?.cladding || "None",
    claddingInstalled:
      typeof latestInput.claddingInstalled === "boolean"
        ? latestInput.claddingInstalled
        : String(lead?.installation || "").toLowerCase() === "installed",
    deliveryDistance: Number(latestInput.deliveryDistance || lead?.delivery_distance || 0),
    notes: latestEstimate?.notes || "",
  }
}

function buildEditableLineItem(item, overrides = {}) {
  const quantity = Number(overrides.quantity ?? item.quantity ?? 0)
  const unitRate = Number(overrides.unitRate ?? item.unitRate ?? 0)
  const label = overrides.label ?? item.label
  const unit = overrides.unit ?? item.unit
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
    overrideReason: overrides.overrideReason || "",
  }
}

function buildEditableLineItemsFromEstimate(previewLineItems, existingEstimates) {
  const latestEstimate = getLatestEstimate(existingEstimates)
  const savedItems = Array.isArray(latestEstimate?.line_items) ? latestEstimate.line_items : []

  if (savedItems.length === 0) {
    return previewLineItems.map((item) => buildEditableLineItem(item))
  }

  const previewByCode = new Map(previewLineItems.map((item) => [item.code, item]))

  return savedItems.map((savedItem) => {
    const previewItem = previewByCode.get(savedItem.code)

    if (previewItem) {
      return buildEditableLineItem(previewItem, savedItem)
    }

    return buildEditableLineItem(savedItem, {
      ...savedItem,
      id: savedItem.id || savedItem.code,
      manual: true,
    })
  })
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

export default function EstimateDrawer({
  lead,
  estimates,
  onClose,
  onSaveEstimate,
}) {
  const [formState, setFormState] = useState(() => buildInitialState(lead, estimates))
  const [isSaving, setIsSaving] = useState(false)
  const [prefersSameTabPreview, setPrefersSameTabPreview] = useState(false)

  const preview = useMemo(() => calculateWarehouseEstimate(formState), [formState])
  const [editableLineItems, setEditableLineItems] = useState(() =>
    buildEditableLineItemsFromEstimate(preview.lineItems, estimates)
  )

  useEffect(() => {
    setFormState(buildInitialState(lead, estimates))
  }, [lead, estimates])

  useEffect(() => {
    setEditableLineItems(buildEditableLineItemsFromEstimate(preview.lineItems, estimates))
  }, [estimates, preview.lineItems])

  useEffect(() => {
    setEditableLineItems((currentItems) => {
      const currentByCode = new Map(
        currentItems
          .filter((item) => !item.manual)
          .map((item) => [item.code, item])
      )

      const mergedBaseItems = preview.lineItems.map((item) =>
        buildEditableLineItem(item, currentByCode.get(item.code))
      )

      const manualItems = currentItems.filter((item) => item.manual)
      return [...mergedBaseItems, ...manualItems]
    })
  }, [preview.lineItems])

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
  const subtotal = useMemo(
    () => roundMoney(editableLineItems.reduce((sum, item) => sum + Number(item.total || 0), 0)),
    [editableLineItems]
  )
  const estimatedTotal = roundMoney(subtotal * preview.pricing.markupMultiplier)
  const hasOverrides = editableLineItems.some(
    (item) =>
      item.manual ||
      item.label !== (item.manual ? item.label : preview.lineItems.find((base) => base.code === item.code)?.label) ||
      Number(item.quantity) !== Number(item.originalQuantity) ||
      Number(item.unitRate) !== Number(item.originalUnitRate)
  )

  const handleChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }))
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
    const savedEstimate = await onSaveEstimate({
      lead,
      version_no: nextVersion,
      product_type: "Warehouse",
      title: `${preview.summary.title} V${nextVersion}`,
      input_data: { ...preview.input, useCustomSize: formState.useCustomSize },
      original_line_items: preview.lineItems,
      line_items: editableLineItems,
      subtotal,
      markup_multiplier: preview.pricing.markupMultiplier,
      total: estimatedTotal,
      notes: formState.notes,
      estimate_request: preview.summary.estimateRequest,
    })
    setIsSaving(false)

    if (savedEstimate) {
      onClose()
    }
  }

  const handleSaveAndOpen = async () => {
    setIsSaving(true)
    const savedEstimate = await onSaveEstimate({
      lead,
      version_no: nextVersion,
      product_type: "Warehouse",
      title: `${preview.summary.title} V${nextVersion}`,
      input_data: { ...preview.input, useCustomSize: formState.useCustomSize },
      original_line_items: preview.lineItems,
      line_items: editableLineItems,
      subtotal,
      markup_multiplier: preview.pricing.markupMultiplier,
      total: estimatedTotal,
      notes: formState.notes,
      estimate_request: preview.summary.estimateRequest,
    })
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
                        Create Estimate
                      </Dialog.Title>
                      <p className="truncate text-sm text-slate-500">
                        {lead?.name} {lead?.last_name} · Version {nextVersion}
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
                      Use the catalog sizes for standard warehouse quotes, or switch to custom mode
                      when a client sends a non-standard structure request.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
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

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-slate-700">Width</label>
                        {formState.useCustomSize ? (
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
                        <label className="block text-sm font-medium text-slate-700">Length / depth</label>
                        {formState.useCustomSize ? (
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

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Height</label>
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

                  <div className="grid gap-4 sm:grid-cols-2">
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

                  {preview.summary.layoutNote ? (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                      {preview.summary.layoutNote}
                    </div>
                  ) : null}

                  <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={formState.claddingInstalled}
                      onChange={(event) =>
                        handleChange("claddingInstalled", event.target.checked)
                      }
                    />
                    Include installation for the structure
                  </label>

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
                        <p>Subtotal: {formatCurrency(subtotal)}</p>
                        <p>Markup: {preview.pricing.markupMultiplier}x</p>
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
                    This estimate will save against the lead, mark the lead as quoted, update the
                    quote value, and log the activity in the CRM.
                    {hasOverrides && (
                      <span className="mt-2 block text-amber-700">
                        This revision includes manual line-item adjustments.
                      </span>
                    )}
                  </div>

                  {estimates?.length > 0 && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium text-slate-900">Saved estimate versions</p>
                          <p className="mt-1 text-sm text-slate-500">
                            Open a clean print view for any saved estimate revision.
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 space-y-3">
                        {estimates.map((estimate) => {
                          const canGeneratePdf = !isLocalEstimateId(estimate.id)

                          return (
                          <div
                            key={estimate.id}
                            className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                          >
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{estimate.title}</p>
                              <p className="mt-1 text-xs text-slate-500">
                                Version {estimate.version_no} · {formatCurrency(estimate.total || 0)}
                              </p>
                            </div>
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
                  {isSaving ? "Saving..." : "Save & Open PDF"}
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save size={16} />
                  {isSaving ? "Saving..." : "Save Estimate"}
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
