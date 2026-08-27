"use client"

import Image from "next/image"
import { useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import {
  ArrowsRightLeftIcon,
  ArrowsUpDownIcon,
  ArrowUturnLeftIcon,
  CheckIcon,
  ChevronDownIcon,
  CheckBadgeIcon,
  DocumentTextIcon,
  HomeModernIcon,
  ShareIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TruckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline"
import WarehouseBuilderScene from "../../components/warehouse-builder/WarehouseBuilderScene"
import { calculateEstimateByProductType } from "../../lib/estimates/estimateFactory"
import { calculateAtlasWarehouseEstimate } from "../../lib/estimates/atlasWarehouseEstimate"
import {
  ATLAS_LENGTH_OPTIONS,
  DEFAULT_ATLAS_CONFIGURATION,
  createAtlasConfigurationReference,
  normalizeAtlasConfiguration,
} from "../../lib/atlasConfiguration"
import {
  ATLAS_WAREHOUSE_SHEETING_OPTIONS,
  ATLAS_WAREHOUSE_STEEL_FINISH_OPTIONS,
  ATLAS_WAREHOUSE_WIDTH_OPTIONS,
} from "../../lib/estimates/atlasWarehouseOptions"
import {
  formatCurrency,
  WAREHOUSE_CLADDING_OPTIONS,
  WAREHOUSE_ENCLOSURE_OPTIONS,
  WAREHOUSE_GARAGE_OPENING_OPTIONS,
  WAREHOUSE_HEIGHT_OPTIONS,
  WAREHOUSE_LENGTH_OPTIONS,
} from "../../lib/estimates/warehouseEstimate"
import {
  useWarehouseBuilderStore,
  WAREHOUSE_OPENING_FACE_OPTIONS,
  WAREHOUSE_SHEETING_COLORS,
} from "../../lib/warehouseBuilderStore"

const ATLAS_WAREHOUSE_LENGTH_OPTIONS = ATLAS_LENGTH_OPTIONS

const PROVINCES = [
  "Gauteng",
  "Western Cape",
  "KwaZulu-Natal",
  "Eastern Cape",
  "Free State",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Northern Cape",
]

const SMART_STEEL_WHATSAPP_NUMBER = "27828464555"
const WAREHOUSE_BUILDER_AUTOSAVE_KEY = "smartsteel.warehouse-builder.atlas-v2"

const CFLC_SYSTEM_DEFAULTS = DEFAULT_ATLAS_CONFIGURATION

const INTENDED_USE_OPTIONS = [
  "Storage",
  "Workshop",
  "Agricultural",
  "Commercial / retail",
  "Industrial",
  "Vehicle / equipment cover",
  "Other",
]

const PROJECT_STAGE_OPTIONS = [
  "Early planning",
  "Comparing options",
  "Ready to request a formal quote",
  "Ready to order soon",
]

const TARGET_TIMELINE_OPTIONS = [
  "As soon as possible",
  "1-3 months",
  "3-6 months",
  "6+ months",
  "Not sure yet",
]

const SHAREABLE_BUILDER_FIELDS = {
  productType: "productType",
  width: "width",
  length: "length",
  wallHeight: "height",
  cladding: "cladding",
  sheetingProfile: "sheetingProfile",
  sheetingFinish: "sheetingFinish",
  enclosureType: "enclosure",
  rollerDoorCount: "rollerDoors",
  garageDoorOpeningType: "openingSize",
  rollerDoorFace: "rollerFace",
  pedestrianDoorCount: "personnelDoors",
  pedestrianDoorFace: "personnelFace",
  sheetingColor: "sheetingColor",
  steelFinish: "steelFinish",
  gableMode: "sheeting",
}

function getShareableConfiguration(config) {
  return Object.keys(SHAREABLE_BUILDER_FIELDS).reduce((result, field) => {
    result[field] = config[field]
    return result
  }, {})
}

function createDesignReference(configuration) {
  return createAtlasConfigurationReference(configuration)
}

function buildShareableBuilderUrl(configuration, pathname = "/warehouse-builder") {
  const url = new URL(window.location.href)
  const params = new URLSearchParams()

  Object.entries(SHAREABLE_BUILDER_FIELDS).forEach(([field, parameter]) => {
    const value = configuration[field]
    if (value !== undefined && value !== null && value !== "") params.set(parameter, String(value))
  })

  url.pathname = pathname
  url.search = params.toString()
  url.hash = ""
  return url.toString()
}

function trackBuilderEvent(eventName, details = {}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return
  window.gtag("event", eventName, {
    builder: "warehouse",
    ...details,
  })
}

const LENGTH_DESCRIPTORS = {
  5: "Very compact",
  7.5: "Compact",
  10: "Starter size",
  12.5: "Practical",
  15: "Popular",
  17.5: "Growing space",
  20: "Expanded",
  22.5: "Larger format",
  25: "Large format",
  27.5: "Extra capacity",
  30: "Extended layout",
  32.5: "Long format",
  35: "Large project",
  37.5: "Extra large",
  40: "Commercial span",
  42.5: "Commercial plus",
  45: "High-capacity",
  47.5: "Large-scale",
  50: "Maximum standard",
}

function FieldLabel({ title, hint }) {
  return (
    <div className="mb-2">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
    </div>
  )
}

function StepLabel({ step, title, hint }) {
  return (
    <div className="mb-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--builder-accent,#da1a33)]">{step}</p>
      <h3 className="mt-1 text-base font-semibold text-slate-950">{title}</h3>
      {hint ? <p className="mt-1 text-xs leading-5 text-slate-500">{hint}</p> : null}
    </div>
  )
}

const ENCLOSURE_IMAGE_MAP = {
  structure_only: "/warehouse-builder/enclosure-structure-only.png",
  roof_only: "/warehouse-builder/enclosure-roof-only.png",
  open_sides: "/warehouse-builder/enclosure-open-sides.png",
  fully_enclosed: "/warehouse-builder/enclosure-fully-enclosed.png",
}

function RoofEnclosureThumbnail({ variant = "roof_only", active = false }) {
  return (
    <div
      className={`relative h-28 overflow-hidden rounded-[1.2rem] border ${
        active ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"
      }`}
    >
      <Image
        src={ENCLOSURE_IMAGE_MAP[variant] || ENCLOSURE_IMAGE_MAP.roof_only}
        alt=""
        fill
        sizes="(min-width: 640px) 180px, 100vw"
        className={`object-contain object-center p-2 transition ${
          active ? "opacity-92" : "opacity-100"
        }`}
      />
      <div
        className={`absolute inset-0 ${
          active ? "bg-slate-900/12" : "bg-transparent"
        }`}
      />
    </div>
  )
}

function VisualChoiceCard({ icon: Icon, image, title, active, onClick, thumbnail, brand = "lsf", compact = false }) {
  const isAtlas = brand === "atlas"

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${compact ? "min-h-[88px] rounded-[1.15rem] px-3 py-3 sm:min-h-[108px] sm:rounded-[1.4rem] sm:px-4 sm:py-3.5" : "min-h-[108px] rounded-[1.4rem] px-4 py-3.5"} border text-left transition ${
        active
          ? isAtlas
            ? "border-[#0043f3] bg-[linear-gradient(145deg,#001d2e,#0043f3)] text-white shadow-[0_20px_50px_-30px_rgba(0,67,243,0.9)]"
            : "border-slate-900 bg-slate-900 text-white shadow-[0_20px_50px_-30px_rgba(15,23,42,0.95)]"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:shadow-[0_20px_40px_-35px_rgba(15,23,42,0.35)]"
      }`}
    >
      {thumbnail ? (
        <div className="mb-3">{thumbnail}</div>
      ) : (
        <div
          className={`${compact ? "mb-2 h-9 w-9 rounded-xl sm:mb-3 sm:h-11 sm:w-11 sm:rounded-2xl" : "mb-3 h-11 w-11 rounded-2xl"} inline-flex items-center justify-center border ${
            active ? "border-white/20 bg-white/10 text-white" : "border-slate-200 bg-slate-50 text-slate-700"
          }`}
        >
          {image ? (
            <Image src={image} alt="" width={24} height={24} className={`${compact ? "h-5 w-5 sm:h-6 sm:w-6" : "h-6 w-6"} object-contain ${active ? "brightness-0 invert" : ""}`} />
          ) : (
            <Icon className="h-5 w-5" />
          )}
        </div>
      )}
      <p className={`${compact ? "text-xs leading-4 sm:text-sm" : "text-sm"} font-semibold`}>{title}</p>
    </button>
  )
}

function PrimaryFinishControls({
  isLcssWarehouse,
  steelFinish,
  gableMode,
  cladding,
  enclosureType,
  updateField,
}) {
  if (isLcssWarehouse) {
    return (
      <div className="grid gap-4">
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Steel finish</label>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            {ATLAS_WAREHOUSE_STEEL_FINISH_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => updateField("steelFinish", option)}
                className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                  steelFinish === option
                    ? "border-[var(--builder-accent)] bg-[var(--builder-selection)] text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Sheeting add-ons</label>
          <div className="mt-1.5 grid gap-2 sm:grid-cols-3">
            {ATLAS_WAREHOUSE_SHEETING_OPTIONS.map((option) => (
              <VisualChoiceCard
                key={option.value}
                icon={option.value === "roof_only" ? HomeModernIcon : ShieldCheckIcon}
                title={option.label}
                active={gableMode === option.value}
                brand="atlas"
                thumbnail={
                  <RoofEnclosureThumbnail
                    variant={option.value}
                    active={gableMode === option.value}
                  />
                }
                onClick={() => {
                  updateField("gableMode", option.value)
                  if (option.value !== "structure_only" && cladding === "None") updateField("cladding", "IBR")
                }}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      <div>
        <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Cladding profile</label>
        <div className="mt-1.5 grid grid-cols-3 gap-2">
          {WAREHOUSE_CLADDING_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => updateField("cladding", option)}
              className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                cladding === option
                  ? "border-[var(--builder-accent)] bg-[var(--builder-selection)] text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Enclosure</label>
        <div className="mt-1.5 grid gap-2 sm:grid-cols-3">
          {WAREHOUSE_ENCLOSURE_OPTIONS.map((option) => (
            <VisualChoiceCard
              key={option.value}
              icon={
                option.value === "fully_enclosed"
                  ? ShieldCheckIcon
                  : option.value === "open_sides"
                    ? ArrowsRightLeftIcon
                    : HomeModernIcon
              }
              title={option.label}
              active={enclosureType === option.value}
              thumbnail={<RoofEnclosureThumbnail variant={option.value} active={enclosureType === option.value} />}
              onClick={() => updateField("enclosureType", option.value)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function ContactField({ label, type = "text", value, onChange, placeholder, required = false }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500"
      />
    </label>
  )
}

function getSystemLabel(productType) {
  return productType === "LCSS Warehouse" ? "Atlas Lip Channel Warehouse" : "Custom Engineered Warehouse"
}

function getClientFacingLineItemLabel(label) {
  return label
    .replace(/^Garage door openings/i, "Main door openings")
    .replace(/^Pedestrian door openings/i, "Personnel door openings")
    .replace(/^Purlins \/ top hats$/i, "Roof and wall framing")
    .replace(/^Purlins, hats and wall hats$/i, "Roof and wall framing")
    .replace(/^Trusses$/i, "Main frame trusses")
    .replace(/^Columns$/i, "Main frame columns")
    .replace(/^Rafters/i, "Main frame rafters")
    .replace(/^X-bracing/i, "Cross-bracing")
    .replace(/^A-bracing/i, "Portal bracing")
}

export default function WarehouseBuilderClient() {
  const searchParams = useSearchParams()
  const config = useWarehouseBuilderStore()
  const updateStoreField = useWarehouseBuilderStore((state) => state.updateField)
  const patchFields = useWarehouseBuilderStore((state) => state.patchFields)
  const reset = useWarehouseBuilderStore((state) => state.reset)
  const [showLeadForm, setShowLeadForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submissionResult, setSubmissionResult] = useState(null)
  const [submitError, setSubmitError] = useState("")
  const [budgetDelta, setBudgetDelta] = useState(0)
  const [budgetPulse, setBudgetPulse] = useState(false)
  const [saveStatus, setSaveStatus] = useState("")
  const [changeNotice, setChangeNotice] = useState("")
  const [deviceSaveStatus, setDeviceSaveStatus] = useState("")
  const [activeMobileSceneControl, setActiveMobileSceneControl] = useState(null)
  const [undoSnapshot, setUndoSnapshot] = useState(null)
  const [isSceneVisible, setIsSceneVisible] = useState(true)
  const [sceneSectionHeight, setSceneSectionHeight] = useState(820)
  const [leadForm, setLeadForm] = useState({
    name: "",
    lastName: "",
    email: "",
    phone: "",
  })
  const previousBudgetRef = useRef(null)
  const changeNoticeTimeoutRef = useRef(null)
  const hasInitialisedBuilderRef = useRef(false)
  const sceneSectionRef = useRef(null)

  const isLcssWarehouse = true
  const builderTheme = isLcssWarehouse
    ? {
        name: "Atlas W-Series",
        eyebrow: "Atlas warehouse builder",
        title: "Build and price your Atlas warehouse",
        description: "Configure a modular, bolted lip channel warehouse and see the footprint and supply-only budget update live.",
        logo: "/atlas/atlas-logo-horizontal-light.png",
        accent: "#0043f3",
        selection: "#0043f3",
        shadow: "rgba(0,67,243,0.9)",
      }
    : {
        name: "Smart Steel LSF",
        eyebrow: "LSF warehouse builder",
        title: "Build and price your engineered LSF warehouse",
        description: "Shape a project-specific lightweight steel warehouse and see the footprint and supply-only budget update live.",
        logo: "/LogoWhite.png",
        accent: "#da1a33",
        selection: "#0f172a",
        shadow: "rgba(15,23,42,0.95)",
      }
  const systemLabel = getSystemLabel(config.productType)
  const widthOptions = ATLAS_WAREHOUSE_WIDTH_OPTIONS
  const lengthOptions = ATLAS_WAREHOUSE_LENGTH_OPTIONS
  const enclosureLabel =
    WAREHOUSE_ENCLOSURE_OPTIONS.find((option) => option.value === config.enclosureType)?.label ||
    config.enclosureType
  const roofTypeLabel = "Dual pitch roof"
  const garageDoorOpeningTypeLabel =
    WAREHOUSE_GARAGE_OPENING_OPTIONS.find((option) => option.value === config.garageDoorOpeningType)?.label ||
    config.garageDoorOpeningType
  const steelFinishLabel = config.steelFinish || "Galv"
  const gableModeLabel =
    ATLAS_WAREHOUSE_SHEETING_OPTIONS.find((option) => option.value === config.gableMode)?.label || config.gableMode
  const sheetingColor =
    WAREHOUSE_SHEETING_COLORS.find((option) => option.value === config.sheetingColor) ||
    WAREHOUSE_SHEETING_COLORS[0]
  const updateField = (field, value) => {
    setUndoSnapshot(getShareableConfiguration(config))
    updateStoreField(field, value)

    const notice = {
      width: `Width updated to ${value}m`,
      length: `Length updated to ${value}m`,
      wallHeight: `Height updated to ${value}m`,
      cladding: `${value} cladding selected`,
      sheetingProfile: `${value} sheeting selected`,
      sheetingFinish: `${value === "chromadek" ? "Chromadek" : "Galvanised"} finish selected`,
      steelFinish: `${value} steel finish selected`,
      enclosureType: WAREHOUSE_ENCLOSURE_OPTIONS.find((option) => option.value === value)?.label,
      gableMode: ATLAS_WAREHOUSE_SHEETING_OPTIONS.find((option) => option.value === value)?.label,
      sheetingColor: WAREHOUSE_SHEETING_COLORS.find((option) => option.value === value)?.label,
      rollerDoorFace: `Main openings moved to the ${value}`,
      pedestrianDoorFace: `Personnel openings moved to the ${value}`,
    }[field]

    if (!notice) return
    setChangeNotice(notice)
    window.clearTimeout(changeNoticeTimeoutRef.current)
    changeNoticeTimeoutRef.current = window.setTimeout(() => setChangeNotice(""), 1900)
  }
  const mobileSceneSummary = isLcssWarehouse
    ? `${config.width}m x ${config.length}m · ${gableModeLabel}`
    : `${config.width}m x ${config.length}m · ${enclosureLabel}`
  const mobileSceneControls = [
    {
      key: "width",
      label: "Width",
      shortLabel: `${config.width}m`,
      icon: ArrowsRightLeftIcon,
    },
    {
      key: "length",
      label: "Length",
      shortLabel: `${config.length}m`,
      icon: ArrowsUpDownIcon,
    },
    {
      key: "enclosure",
      label: isLcssWarehouse ? "Sheeting" : "Walls",
      shortLabel: isLcssWarehouse ? gableModeLabel : enclosureLabel,
      icon: isLcssWarehouse ? HomeModernIcon : ShieldCheckIcon,
    },
  ]
  const shareableConfiguration = useMemo(() => getShareableConfiguration(config), [config])
  const designReference = useMemo(
    () => createDesignReference(shareableConfiguration),
    [shareableConfiguration]
  )

  useEffect(() => {
    const element = sceneSectionRef.current
    if (!element) return undefined

    const visibilityObserver = typeof IntersectionObserver === "undefined"
      ? null
      : new IntersectionObserver(
          ([entry]) => setIsSceneVisible(entry.isIntersecting),
          { threshold: 0.18 }
        )
    const sizeObserver = typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(() => {
          setSceneSectionHeight(Math.ceil(element.getBoundingClientRect().height))
        })

    setSceneSectionHeight(Math.ceil(element.getBoundingClientRect().height))
    visibilityObserver?.observe(element)
    sizeObserver?.observe(element)

    return () => {
      visibilityObserver?.disconnect()
      sizeObserver?.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!showLeadForm) return undefined
    const previousOverflow = document.body.style.overflow
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !submitting) setShowLeadForm(false)
    }
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [showLeadForm, submitting])

  useEffect(() => {
    if (hasInitialisedBuilderRef.current) return
    hasInitialisedBuilderRef.current = true

    const hasSharedConfiguration = Object.values(SHAREABLE_BUILDER_FIELDS).some((parameter) => searchParams.has(parameter))
    if (!hasSharedConfiguration) {
      try {
        const savedConfiguration = JSON.parse(window.localStorage.getItem(WAREHOUSE_BUILDER_AUTOSAVE_KEY) || "null")
        if (savedConfiguration && typeof savedConfiguration === "object") {
          patchFields({
            ...normalizeAtlasConfiguration(savedConfiguration),
            sheetingProfile: ["Corrugated", "IBR", "Concealed Fix"].includes(savedConfiguration.sheetingProfile)
              ? savedConfiguration.sheetingProfile
              : "IBR",
            sheetingFinish: ["galvanised", "chromadek"].includes(savedConfiguration.sheetingFinish)
              ? savedConfiguration.sheetingFinish
              : savedConfiguration.cladding === "Chromadek"
                ? "chromadek"
                : "galvanised",
            gableMode: ATLAS_WAREHOUSE_SHEETING_OPTIONS.some((option) => option.value === savedConfiguration.gableMode)
              ? savedConfiguration.gableMode
              : "structure_only",
          })
          setDeviceSaveStatus("Previous design restored")
          window.setTimeout(() => setDeviceSaveStatus("Saved on this device"), 2200)
        }
      } catch {
        window.localStorage.removeItem(WAREHOUSE_BUILDER_AUTOSAVE_KEY)
      }
      return
    }

    const widthParam = Number(searchParams.get("width"))
    const lengthParam = Number(searchParams.get("length"))
    const nextWidthOptions = ATLAS_WAREHOUSE_WIDTH_OPTIONS

    const nextValues = { productType: "LCSS Warehouse" }

    if (Number.isFinite(widthParam) && nextWidthOptions.includes(widthParam)) {
      nextValues.width = widthParam
    }

    if (Number.isFinite(lengthParam) && ATLAS_WAREHOUSE_LENGTH_OPTIONS.includes(lengthParam)) {
      nextValues.length = lengthParam
    }

    const heightParam = Number(searchParams.get("height"))
    const claddingParam = searchParams.get("cladding")
    const enclosureParam = searchParams.get("enclosure")
    const rollerDoorParam = Number(searchParams.get("rollerDoors"))
    const openingSizeParam = searchParams.get("openingSize")
    const rollerFaceParam = searchParams.get("rollerFace")
    const personnelDoorParam = Number(searchParams.get("personnelDoors"))
    const personnelFaceParam = searchParams.get("personnelFace")
    const sheetingColorParam = searchParams.get("sheetingColor")
    const sheetingProfileParam = searchParams.get("sheetingProfile")
    const sheetingFinishParam = searchParams.get("sheetingFinish")
    const steelFinishParam = searchParams.get("steelFinish")
    const sheetingParam = searchParams.get("sheeting")

    if (WAREHOUSE_HEIGHT_OPTIONS.includes(heightParam)) nextValues.wallHeight = heightParam
    if (WAREHOUSE_CLADDING_OPTIONS.includes(claddingParam)) nextValues.cladding = claddingParam
    if (WAREHOUSE_ENCLOSURE_OPTIONS.some((option) => option.value === enclosureParam)) nextValues.enclosureType = enclosureParam
    if (searchParams.has("rollerDoors") && Number.isFinite(rollerDoorParam)) nextValues.rollerDoorCount = Math.min(6, Math.max(0, rollerDoorParam))
    if (WAREHOUSE_GARAGE_OPENING_OPTIONS.some((option) => option.value === openingSizeParam)) nextValues.garageDoorOpeningType = openingSizeParam
    if (WAREHOUSE_OPENING_FACE_OPTIONS.some((option) => option.value === rollerFaceParam)) nextValues.rollerDoorFace = rollerFaceParam
    if (searchParams.has("personnelDoors") && Number.isFinite(personnelDoorParam)) nextValues.pedestrianDoorCount = Math.min(6, Math.max(0, personnelDoorParam))
    if (WAREHOUSE_OPENING_FACE_OPTIONS.some((option) => option.value === personnelFaceParam)) nextValues.pedestrianDoorFace = personnelFaceParam
    if (WAREHOUSE_SHEETING_COLORS.some((option) => option.value === sheetingColorParam)) nextValues.sheetingColor = sheetingColorParam
    if (["Corrugated", "IBR", "Concealed Fix"].includes(sheetingProfileParam)) nextValues.sheetingProfile = sheetingProfileParam
    if (["galvanised", "chromadek"].includes(sheetingFinishParam)) nextValues.sheetingFinish = sheetingFinishParam
    if (ATLAS_WAREHOUSE_STEEL_FINISH_OPTIONS.includes(steelFinishParam)) nextValues.steelFinish = steelFinishParam
    if (ATLAS_WAREHOUSE_SHEETING_OPTIONS.some((option) => option.value === sheetingParam)) nextValues.gableMode = sheetingParam

    if (Object.keys(nextValues).length > 0) {
      patchFields(nextValues)
      setSubmitted(false)
      setSubmissionResult(null)
      setShowLeadForm(false)
      setSubmitError("")
    }
  }, [searchParams, config.productType, patchFields])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      window.localStorage.setItem(WAREHOUSE_BUILDER_AUTOSAVE_KEY, JSON.stringify(shareableConfiguration))
      setDeviceSaveStatus("Saved on this device")
    }, 500)

    return () => window.clearTimeout(timeoutId)
  }, [shareableConfiguration])

  const estimateInput = useMemo(() => {
    if (isLcssWarehouse) {
      const structureOnly = config.gableMode === "structure_only"
      return {
        systemVariant: "atlas",
        pricingModel: "atlas_os_v1",
        width: config.width,
        length: config.length,
        wallHeight: config.wallHeight,
        steelFinish: config.steelFinish,
        gableMode: config.gableMode,
        cladding: structureOnly ? "None" : config.sheetingFinish === "chromadek" ? "Chromadek" : "IBR",
        sheetingProfile: config.sheetingProfile,
        sheetingFinish: config.sheetingFinish,
      }
    }

    return {
      ...config,
      scope: "supply_only",
      deliveryRequired: false,
      deliveryDistance: 0,
      claddingInstalled: false,
    }
  }, [config, isLcssWarehouse])

  const estimate = useMemo(
    () => isLcssWarehouse
      ? calculateAtlasWarehouseEstimate(estimateInput)
      : calculateEstimateByProductType(config.productType, estimateInput),
    [config.productType, estimateInput, isLcssWarehouse]
  )

  const budgetValue =
    estimate.pricing.estimatedTotal ?? estimate.pricing.baseTotal ?? estimate.pricing.totalInclVat
  const lcssSheetingCoverage =
    isLcssWarehouse
      ? estimate.sheeting?.totalSheetingArea ?? estimate.sheeting?.roofSheetingArea ?? 0
      : 0
  const lcssRoofCoverage = isLcssWarehouse ? estimate.sheeting?.roofSheetingArea ?? 0 : 0
  const pricePerSquareMeter =
    config.width && config.length ? Math.round(budgetValue / (config.width * config.length)) : 0

  useEffect(() => {
    if (previousBudgetRef.current === null) {
      previousBudgetRef.current = budgetValue
      return
    }

    const delta = budgetValue - previousBudgetRef.current
    previousBudgetRef.current = budgetValue
    setBudgetDelta(delta)

    if (delta !== 0) {
      setBudgetPulse(true)
      const timeoutId = window.setTimeout(() => setBudgetPulse(false), 1200)
      return () => window.clearTimeout(timeoutId)
    }

    return undefined
  }, [budgetValue])

  const sceneProps = useMemo(() => {
    if (isLcssWarehouse) {
      return {
        systemVariant: "atlas",
        width: config.width,
        length: config.length,
        wallHeight: config.wallHeight,
        roofPitch: 15,
        cladding: config.gableMode === "structure_only" ? "None" : config.sheetingProfile,
        enclosureType: config.gableMode === "structure_only" ? "open_sides" : config.gableMode === "roof_only" ? "roof_only" : "side_walls",
        rollerDoorCount: 0,
        garageDoorOpeningType: "single",
        pedestrianDoorCount: 0,
        sheetingColor: config.sheetingFinish === "chromadek" ? config.sheetingColor : "galvanised",
        steelFinish: config.steelFinish,
      }
    }

    return {
      systemVariant: "lsf",
      width: config.width,
      length: config.length,
      wallHeight: config.wallHeight,
      roofPitch: config.roofPitch,
        cladding: config.gableMode === "structure_only" ? "None" : config.cladding,
      enclosureType: config.enclosureType,
      rollerDoorCount: config.rollerDoorCount,
      garageDoorOpeningType: config.garageDoorOpeningType,
      pedestrianDoorCount: config.pedestrianDoorCount,
      rollerDoorFace: config.rollerDoorFace,
      pedestrianDoorFace: config.pedestrianDoorFace,
      sheetingColor: config.sheetingColor,
    }
  }, [config, isLcssWarehouse])

  const handleSaveDesign = async () => {
    const shareUrl = buildShareableBuilderUrl(shareableConfiguration)

    try {
      if (typeof navigator.share === "function") {
        await navigator.share({
          title: `${systemLabel} ${designReference}`,
          text: `Smart Steel warehouse design ${designReference}`,
          url: shareUrl,
        })
        setSaveStatus("Design shared")
      } else {
        await navigator.clipboard.writeText(shareUrl)
        setSaveStatus("Design link copied")
      }
    } catch {
      try {
        await navigator.clipboard.writeText(shareUrl)
        setSaveStatus("Design link copied")
      } catch {
        window.history.replaceState({}, "", shareUrl)
        setSaveStatus("Design saved in this link")
      }
    }

    trackBuilderEvent("warehouse_builder_design_saved", { system: isLcssWarehouse ? "atlas" : "lsf" })

    window.setTimeout(() => setSaveStatus(""), 2400)
  }

  const handleWhatsAppDesign = () => {
    const shareUrl = buildShareableBuilderUrl(shareableConfiguration)
    const message = [
      "Hi Smart Steel, I would like help with this warehouse design:",
      `${systemLabel} · ${config.width}m x ${config.length}m x ${config.wallHeight}m`,
      `Budget guide excl. VAT: ${formatCurrency(budgetValue)}`,
      ...(isLcssWarehouse ? [`Atlas SKU: ${estimate.meta.sku}`] : []),
      `Design reference: ${designReference}`,
      shareUrl,
    ].join("\n")

    window.open(`https://wa.me/${SMART_STEEL_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer")
    trackBuilderEvent("warehouse_builder_whatsapp_opened", { system: isLcssWarehouse ? "atlas" : "lsf" })
  }

  const handleOpenDesignSummary = () => {
    window.open(buildShareableBuilderUrl(shareableConfiguration, "/warehouse-builder/summary"), "_blank", "noopener,noreferrer")
    trackBuilderEvent("warehouse_builder_summary_opened", { system: isLcssWarehouse ? "atlas" : "lsf" })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!config.projectStage) {
      setSubmitError("Please choose your project stage before sending the project for review.")
      return
    }

    if (!config.location.trim()) {
      setSubmitError("Please add the town, suburb, or site area for this project.")
      return
    }

    setSubmitting(true)
    setSubmitError("")

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...leadForm,
          lead_source: "Warehouse Builder",
          productType: config.productType,
          systemLabel,
          userNotes: config.notes,
          intendedUse: config.intendedUse,
          projectStage: config.projectStage,
          targetTimeline: config.targetTimeline,
          province: config.province,
          location: config.location,
          scope: "supply_only",
          scopeLabel: "Supply only",
          installationInterest: config.installationInterest,
          enclosureType: isLcssWarehouse ? null : config.enclosureType,
          enclosureLabel: isLcssWarehouse ? null : enclosureLabel,
          roofType: config.roofType,
          roofTypeLabel,
          cladding: config.gableMode === "structure_only" ? "None" : config.sheetingProfile,
          sheetingProfile: config.gableMode === "structure_only" ? null : config.sheetingProfile,
          sheetingFinish: config.gableMode === "structure_only" ? null : config.sheetingFinish,
          rollerDoorCount: isLcssWarehouse ? 0 : config.rollerDoorCount,
          garageDoorOpeningType: isLcssWarehouse ? null : config.garageDoorOpeningType,
          garageDoorOpeningTypeLabel: isLcssWarehouse ? null : garageDoorOpeningTypeLabel,
          pedestrianDoorCount: isLcssWarehouse ? 0 : config.pedestrianDoorCount,
          rollerDoorFace: isLcssWarehouse ? null : config.rollerDoorFace,
          pedestrianDoorFace: isLcssWarehouse ? null : config.pedestrianDoorFace,
          sheetingColor: config.gableMode === "structure_only" ? null : config.sheetingFinish === "chromadek" ? config.sheetingColor : "galvanised",
          sheetingColorLabel: config.gableMode === "structure_only" ? "Not selected" : config.sheetingFinish === "chromadek" ? sheetingColor.label : "Galvanised",
          steelFinish: isLcssWarehouse ? config.steelFinish : null,
          gableMode: isLcssWarehouse ? config.gableMode : null,
          gableModeLabel: isLcssWarehouse ? gableModeLabel : null,
          deliveryRequired: config.deliveryRequired,
          deliveryDistance: config.deliveryRequired ? config.deliveryDistance : 0,
          estimateRequest: estimate.summary.estimateRequest,
          estimatedTotal: budgetValue,
          priceLabel: formatCurrency(budgetValue),
          designReference,
          atlasSku: isLcssWarehouse ? estimate.meta.sku : null,
          atlasFamilyCode: isLcssWarehouse ? estimate.meta.productCode : null,
          configurationUrl: buildShareableBuilderUrl(shareableConfiguration),
          summaryNote: estimate.summary.layoutNote,
          configuration: {
            productType: config.productType,
            sku: isLcssWarehouse ? estimate.meta.sku : null,
            familyCode: isLcssWarehouse ? estimate.meta.productCode : null,
            width: config.width,
            length: config.length,
            wallHeight: config.wallHeight,
            roofType: config.roofType,
            roofPitch: config.roofPitch,
            cladding: config.gableMode === "structure_only" ? "None" : config.sheetingProfile,
            sheetingProfile: config.gableMode === "structure_only" ? null : config.sheetingProfile,
            sheetingFinish: config.gableMode === "structure_only" ? null : config.sheetingFinish,
            scope: "supply_only",
            installationInterest: config.installationInterest,
            enclosureType: config.enclosureType,
            rollerDoorCount: config.rollerDoorCount,
            garageDoorOpeningType: config.garageDoorOpeningType,
            pedestrianDoorCount: config.pedestrianDoorCount,
            rollerDoorFace: config.rollerDoorFace,
            pedestrianDoorFace: config.pedestrianDoorFace,
            sheetingColor: config.gableMode === "structure_only" ? null : config.sheetingFinish === "chromadek" ? config.sheetingColor : "galvanised",
            sheetingColorLabel: config.gableMode === "structure_only" ? "Not selected" : config.sheetingFinish === "chromadek" ? sheetingColor.label : "Galvanised",
            steelFinish: config.steelFinish,
            gableMode: config.gableMode,
            deliveryRequired: config.deliveryRequired,
            deliveryDistance: config.deliveryRequired ? config.deliveryDistance : 0,
            province: config.province,
            location: config.location,
            intendedUse: config.intendedUse,
            projectStage: config.projectStage,
            targetTimeline: config.targetTimeline,
            notes: config.notes,
          },
          summary: {
            systemLabel,
            sku: isLcssWarehouse ? estimate.meta.sku : null,
            familyCode: isLcssWarehouse ? estimate.meta.productCode : null,
            scopeLabel: "Supply only",
            installationInterest: config.installationInterest,
            enclosureLabel: isLcssWarehouse ? null : enclosureLabel,
            roofTypeLabel,
            priceLabel: formatCurrency(budgetValue),
            estimateRequest: estimate.summary.estimateRequest,
            layoutNote: estimate.summary.layoutNote,
            dimensionsLabel: `${config.width}m x ${config.length}m x ${config.wallHeight}m`,
            rollerDoorCount: isLcssWarehouse ? 0 : config.rollerDoorCount,
            garageDoorOpeningType: isLcssWarehouse ? null : config.garageDoorOpeningType,
            garageDoorOpeningTypeLabel: isLcssWarehouse ? null : garageDoorOpeningTypeLabel,
            pedestrianDoorCount: isLcssWarehouse ? 0 : config.pedestrianDoorCount,
            rollerDoorFace: isLcssWarehouse ? null : config.rollerDoorFace,
            pedestrianDoorFace: isLcssWarehouse ? null : config.pedestrianDoorFace,
            sheetingProfile: config.gableMode === "structure_only" ? null : config.sheetingProfile,
            sheetingFinish: config.gableMode === "structure_only" ? null : config.sheetingFinish,
            sheetingColor: config.gableMode === "structure_only" ? null : config.sheetingFinish === "chromadek" ? config.sheetingColor : "galvanised",
            sheetingColorLabel: config.gableMode === "structure_only" ? "Not selected" : config.sheetingFinish === "chromadek" ? sheetingColor.label : "Galvanised",
            steelFinish: isLcssWarehouse ? config.steelFinish : null,
            gableMode: isLcssWarehouse ? config.gableMode : null,
            gableModeLabel: isLcssWarehouse ? gableModeLabel : null,
          },
        }),
      })

      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload?.error || "Could not send your design.")
      }

      setSubmissionResult(payload)
      setSubmitted(true)
      setLeadForm({ name: "", lastName: "", email: "", phone: "" })
      trackBuilderEvent("warehouse_builder_enquiry_submitted", {
        system: isLcssWarehouse ? "atlas" : "lsf",
        value: budgetValue,
        currency: "ZAR",
      })
    } catch (error) {
      setSubmitError(error?.message || "Could not send your design.")
    } finally {
      setSubmitting(false)
    }
  }

  const summaryItems = isLcssWarehouse
    ? [
        { label: "System", value: systemLabel },
        { label: "Warehouse", value: `${config.width}m x ${config.length}m` },
        { label: "Height", value: `${config.wallHeight}m wall height` },
        { label: "Steel finish", value: steelFinishLabel },
        { label: "Sheeting add-on", value: gableModeLabel },
        { label: "Sheeting profile", value: config.gableMode === "structure_only" ? "Not selected" : config.sheetingProfile },
        { label: "Sheeting finish", value: config.gableMode === "structure_only" ? "Not selected" : config.sheetingFinish === "chromadek" ? `Chromadek · ${sheetingColor.label}` : "Galvanised" },
        { label: "Project stage", value: config.projectStage || "Not selected" },
      ]
    : [
        { label: "System", value: systemLabel },
        { label: "Warehouse", value: `${config.width}m x ${config.length}m` },
        { label: "Height", value: `${config.wallHeight}m eave` },
        { label: "Cladding", value: config.cladding },
        { label: "Enclosure", value: enclosureLabel },
        { label: "Project stage", value: config.projectStage || "Not selected" },
      ]

  const budgetItems = isLcssWarehouse
    ? [
        { label: "Size", value: `${config.width}m x ${config.length}m x ${config.wallHeight}m` },
        { label: "System", value: systemLabel },
        { label: "Steel finish", value: steelFinishLabel },
        { label: "Sheeting add-on", value: gableModeLabel },
        { label: "Sheeting profile", value: config.gableMode === "structure_only" ? "Not selected" : config.sheetingProfile },
        { label: "Sheeting finish", value: config.gableMode === "structure_only" ? "Not selected" : config.sheetingFinish === "chromadek" ? `Chromadek · ${sheetingColor.label}` : "Galvanised" },
        { label: "Sheeting coverage", value: `${Math.round(lcssSheetingCoverage).toLocaleString()} sqm` },
      ]
    : [
        { label: "Size", value: `${config.width}m x ${config.length}m x ${config.wallHeight}m` },
        { label: "Budget basis", value: "Supply only" },
        { label: "Enclosure", value: enclosureLabel },
        {
          label: "Access",
          value: `${config.rollerDoorCount} garage${config.rollerDoorCount > 0 ? ` (${garageDoorOpeningTypeLabel})` : ""} / ${config.pedestrianDoorCount} pedestrian`,
        },
      ]

  const submittedSummaryItems = isLcssWarehouse
    ? [
        { label: "Atlas SKU", value: estimate.meta.sku },
        { label: "System", value: systemLabel },
        { label: "Steel finish", value: steelFinishLabel },
        { label: "Sheeting add-on", value: gableModeLabel },
        { label: "Sheeting profile", value: config.gableMode === "structure_only" ? "Not selected" : config.sheetingProfile },
        { label: "Use", value: config.intendedUse || "Not supplied" },
        { label: "Stage", value: config.projectStage },
        { label: "Timeline", value: config.targetTimeline },
        {
          label: "Project location",
          value: `${config.province}${config.location ? `, ${config.location}` : ""}`,
        },
        {
          label: "Status",
          value: "Received",
        },
      ]
    : [
        { label: "Budget basis", value: "Supply only" },
        { label: "Enclosure", value: enclosureLabel },
        { label: "Cladding", value: config.cladding },
        {
          label: "Openings",
          value: `${config.rollerDoorCount} garage${config.rollerDoorCount > 0 ? ` (${garageDoorOpeningTypeLabel})` : ""} / ${config.pedestrianDoorCount} pedestrian`,
        },
        { label: "Use", value: config.intendedUse || "Not supplied" },
        { label: "Stage", value: config.projectStage },
        { label: "Timeline", value: config.targetTimeline },
        {
          label: "Project location",
          value: `${config.province}${config.location ? `, ${config.location}` : ""}`,
        },
        {
          label: "Status",
          value: "Received",
        },
      ]

  const budgetBreakdownItems = useMemo(() => {
    if (isLcssWarehouse) {
      return [
        { label: "Atlas structural steel", value: "Included" },
        { label: "Brackets and connection hardware", value: "Included" },
        ...(config.gableMode === "structure_only"
          ? []
          : [{ label: `${config.sheetingProfile} sheeting`, value: "Included" }]),
      ]
    }

    const sortedItems = [...(estimate.lineItems || [])]
      .filter((item) => Number(item?.total) > 0)
      .sort((left, right) => Number(right.total || 0) - Number(left.total || 0))
      .slice(0, 4)

    return sortedItems.map((item) => ({
      label: getClientFacingLineItemLabel(item.label || "Item"),
      value: formatCurrency(Number(item.total || 0)),
    }))
  }, [config.gableMode, config.sheetingProfile, estimate.lineItems, isLcssWarehouse])

  const priceChangeLabel =
    budgetDelta === 0
      ? "No budget change on the last edit"
      : `${budgetDelta > 0 ? "+" : "-"}${formatCurrency(Math.abs(budgetDelta))} on your last change`

  const priceChangeTone =
    budgetDelta === 0 ? "text-slate-300" : budgetDelta > 0 ? "text-amber-300" : "text-emerald-300"

  const reviewCtaLabel =
    config.projectStage === "Ready to order soon" || config.projectStage === "Ready to request a formal quote"
      ? "Request my reviewed quote"
      : "Request my project review"

  const includedItems = isLcssWarehouse
    ? [
      "The main steel structure sized to your selected warehouse footprint",
        "Column bases, ridge and eave brackets, bracing brackets, and M10 connection fixings",
        ...(config.gableMode === "structure_only" ? [] : [`${config.sheetingProfile} sheeting with a ${config.sheetingFinish === "chromadek" ? "Chromadek" : "galvanised"} finish across approximately ${Math.round(lcssSheetingCoverage).toLocaleString()} sqm of coverage`]),
        config.gableMode === "structure_only"
          ? "Sheeting remains optional and can be added before requesting a reviewed quote"
          : gableModeLabel === "Roof sheeting"
          ? `Roof sheeting priced on approximately ${Math.round(lcssRoofCoverage).toLocaleString()} sqm`
          : "Roof and wall sheeting allowance based on the selected warehouse footprint",
        "Project context so the next conversation starts with the right detail",
      ]
    : [
        "The main steel structure sized to your selected footprint",
        "A practical allowance for roof and wall finishes plus main openings",
        "Project context so the next conversation starts with the right detail",
      ]

  const stillToConfirmItems = [
    "Final engineering, foundations, and site-specific requirements",
    "Delivery and installation support, if requested",
    "Any changes to layout, finishes, openings, access, or additional building requirements",
  ]
  const builderStages = [
    { label: "Configure", target: "size-style", complete: Boolean(config.width && config.length && config.wallHeight) },
    { label: "Project", target: "project-context", complete: Boolean(config.projectStage && config.location.trim()) },
    { label: "Review", target: "review-summary", complete: showLeadForm || submitted },
  ]

  const scrollToBuilderStage = (target) => {
    document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <main
      className={`min-h-screen overflow-x-hidden px-4 py-8 transition-colors duration-500 sm:px-6 sm:py-10 lg:px-8 ${
        isLcssWarehouse
          ? "bg-[linear-gradient(180deg,#ffffff_0%,#eef6fa_24%,#ffffff_48%,#edf2f6_100%)]"
          : "bg-[linear-gradient(180deg,#ffffff_0%,#ffffff_12%,#fff8f6_24%,#ffffff_42%,#eef3f7_100%)]"
      }`}
      style={{
        "--builder-accent": builderTheme.accent,
        "--builder-selection": builderTheme.selection,
        "--builder-shadow": builderTheme.shadow,
      }}
    >
      <div className="mx-auto min-w-0 max-w-[1540px]">
        <section
          className={`relative overflow-hidden rounded-[1.3rem] border px-4 py-3 shadow-sm transition-all duration-500 sm:rounded-[1.6rem] sm:px-6 sm:py-5 ${
            isLcssWarehouse
              ? "border-[#0043f3]/25 bg-[linear-gradient(120deg,#001d2e_0%,#073584_58%,#0043f3_100%)] text-white"
              : "border-slate-200 bg-[linear-gradient(120deg,#020617,#172033)] text-white"
          }`}
        >
          <div className="pointer-events-none absolute -right-24 -top-36 h-72 w-72 rotate-45 border-[28px] border-white/[0.07]" />
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-2 flex items-center gap-3 sm:mb-4">
                <Image
                  src={builderTheme.logo}
                  alt={builderTheme.name}
                  width={isLcssWarehouse ? 240 : 150}
                  height={48}
                  className={isLcssWarehouse ? "h-6 max-w-[190px] object-contain object-left sm:h-8 sm:max-w-none" : "h-7 w-auto object-contain object-left sm:h-9"}
                  priority
                />
                <span className="hidden h-7 w-px bg-white/20 sm:block" />
                <p className="hidden text-[10px] font-semibold uppercase tracking-[0.24em] text-white/65 sm:block">Live configuration</p>
              </div>
              <p className={`hidden text-[11px] font-semibold uppercase tracking-[0.26em] sm:block ${isLcssWarehouse ? "text-[#c1d9e5]" : "text-red-300"}`}>
                {builderTheme.eyebrow}
              </p>
              <h1 className="text-xl font-semibold tracking-tight text-white sm:mt-2 sm:text-3xl lg:text-[2rem]">
                {builderTheme.title}
              </h1>
              <p className="mt-2 hidden max-w-2xl text-sm leading-6 text-white/70 sm:block">
                {builderTheme.description}
              </p>
            </div>
            <div className="hidden flex-wrap gap-2 sm:flex lg:max-w-[460px] lg:justify-end">
              {["Live 3D preview", "Budget guide excl. VAT", "Built for South African projects"].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/75 backdrop-blur"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <div className="sticky top-3 z-30 mt-3 hidden items-center justify-between gap-5 rounded-2xl border border-slate-200 bg-white/95 px-5 py-3 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.55)] backdrop-blur xl:flex">
          <div className="flex min-w-0 items-center gap-5">
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-slate-500">
                {systemLabel} · {isLcssWarehouse ? estimate.meta.sku : designReference}
              </p>
              <p className="mt-0.5 text-sm font-semibold text-slate-950">{config.width}m × {config.length}m × {config.wallHeight}m</p>
            </div>
            <span className="h-9 w-px bg-slate-200" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Live guide excl. VAT</p>
              <p className="mt-0.5 text-lg font-semibold text-slate-950">{formatCurrency(budgetValue)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={handleSaveDesign} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              {saveStatus || "Save design"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowLeadForm(true)
                trackBuilderEvent("warehouse_builder_review_opened", { system: isLcssWarehouse ? "atlas" : "lsf" })
              }}
              className="rounded-xl bg-[var(--builder-accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-90"
            >
              Request reviewed quote
            </button>
          </div>
        </div>

        <div className="mt-8 grid min-w-0 grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-[440px_minmax(0,1.4fr)] xl:items-start">
          <section
            className="order-2 min-w-0 space-y-4 xl:order-1 xl:h-[var(--builder-workspace-height)] xl:overflow-y-auto xl:overscroll-contain xl:pr-2 [scrollbar-color:#cbd5e1_transparent] [scrollbar-width:thin]"
            style={{ "--builder-workspace-height": `${sceneSectionHeight}px` }}
          >
            <section className="min-w-0 overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Plan details</h2>
                  <p className="mt-1 text-xs text-slate-500">{deviceSaveStatus || "Move from layout to budget in a few clear steps."}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={!undoSnapshot}
                    onClick={() => {
                      if (!undoSnapshot) return
                      const current = getShareableConfiguration(config)
                      patchFields(undoSnapshot)
                      setUndoSnapshot(current)
                      setChangeNotice("Last change undone")
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ArrowUturnLeftIcon className="h-3.5 w-3.5" />
                    Undo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!window.confirm("Reset this warehouse design and start again?")) return
                      setUndoSnapshot(getShareableConfiguration(config))
                      reset()
                      setSubmitted(false)
                      setSubmissionResult(null)
                      trackBuilderEvent("warehouse_builder_reset", { system: isLcssWarehouse ? "atlas" : "lsf" })
                    }}
                    className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <nav aria-label="Builder progress" className="mb-4 grid grid-cols-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                {builderStages.map((stage, index) => (
                  <button
                    key={stage.label}
                    type="button"
                    onClick={() => {
                      if (stage.target === "review-summary") {
                        setShowLeadForm(true)
                        trackBuilderEvent("warehouse_builder_review_opened", { system: isLcssWarehouse ? "atlas" : "lsf" })
                        return
                      }
                      scrollToBuilderStage(stage.target)
                    }}
                    className={`flex min-w-0 items-center justify-center gap-1.5 border-r border-slate-200 px-1.5 py-2.5 text-[10px] font-semibold transition last:border-r-0 sm:text-xs ${
                      stage.complete ? "bg-white text-slate-900" : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    <span className={`grid h-4 w-4 shrink-0 place-items-center rounded-full text-[9px] ${
                      stage.complete ? "bg-[var(--builder-selection)] text-white" : "border border-slate-300 bg-white"
                    }`}>
                      {stage.complete ? <CheckIcon className="h-2.5 w-2.5" /> : index + 1}
                    </span>
                    <span className="truncate">{stage.label}</span>
                  </button>
                ))}
              </nav>

              <div className="space-y-4">
                <div id="size-style" className="scroll-mt-28 rounded-[1.6rem] border border-slate-200 bg-slate-50/80 p-4">
                  <StepLabel
                    step="Step 1"
                    title="Set the warehouse size"
                  />
                  <div className="space-y-4">
                    <div>
                      <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Width</label>
                      <div className="mt-1.5 flex gap-2 overflow-x-auto pb-1">
                        {widthOptions.map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => updateField("width", option)}
                            className={`min-w-[64px] flex-1 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                              config.width === option
                                ? "border-[var(--builder-accent)] bg-[var(--builder-selection)] text-white"
                                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                            }`}
                          >
                            {option}m
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                      <div>
                        <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Length</label>
                        <select
                          value={config.length}
                          onChange={(event) => updateField("length", Number(event.target.value))}
                          className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900"
                        >
                          {lengthOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}m{LENGTH_DESCRIPTORS[option] ? ` · ${LENGTH_DESCRIPTORS[option]}` : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                          {isLcssWarehouse ? "Wall height" : "Eave height"}
                        </label>
                        <div className="mt-1.5 grid grid-cols-3 gap-2">
                          {WAREHOUSE_HEIGHT_OPTIONS.map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => updateField("wallHeight", option)}
                              className={`rounded-xl border px-2 py-2.5 text-sm font-semibold transition ${
                                config.wallHeight === option
                                  ? "border-[var(--builder-accent)] bg-[var(--builder-selection)] text-white"
                                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                              }`}
                            >
                              {option}m
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Current size</p>
                      <p className="text-sm font-semibold text-slate-900">{config.width}m × {config.length}m × {config.wallHeight}m</p>
                    </div>
                    <div className="border-t border-slate-200 pt-4">
                      <PrimaryFinishControls
                        isLcssWarehouse={isLcssWarehouse}
                        steelFinish={config.steelFinish}
                        gableMode={config.gableMode}
                        cladding={config.cladding}
                        enclosureType={config.enclosureType}
                        updateField={updateField}
                      />
                    </div>
                    {config.gableMode !== "structure_only" ? (
                      <div className="border-t border-slate-200 pt-4">
                        <FieldLabel title="Sheeting profile" />
                        <div className="mb-4 grid grid-cols-3 gap-2">
                          {[
                            "Corrugated",
                            "IBR",
                            "Concealed Fix",
                          ].map((option) => (
                            <button key={option} type="button" onClick={() => updateField("sheetingProfile", option)} className={`rounded-xl border px-2 py-2.5 text-xs font-semibold transition sm:text-sm ${config.sheetingProfile === option ? "border-[var(--builder-accent)] bg-[var(--builder-selection)] text-white" : "border-slate-200 bg-white text-slate-700"}`}>{option}</button>
                          ))}
                        </div>
                        <FieldLabel title="Sheeting finish" />
                        <div className="mb-4 grid grid-cols-2 gap-2">
                          {[
                            { value: "galvanised", label: "Galvanised" },
                            { value: "chromadek", label: "Chromadek" },
                          ].map((option) => (
                            <button key={option.value} type="button" onClick={() => updateField("sheetingFinish", option.value)} className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${config.sheetingFinish === option.value ? "border-[var(--builder-accent)] bg-[var(--builder-selection)] text-white" : "border-slate-200 bg-white text-slate-700"}`}>{option.label}</button>
                          ))}
                        </div>
                        {config.sheetingFinish === "chromadek" ? (
                          <>
                        <div className="flex items-center justify-between gap-3">
                          <FieldLabel title="Chromadek colour" />
                          <span className="text-xs font-semibold text-slate-500">{sheetingColor.label}</span>
                        </div>
                        <div className="grid grid-cols-7 gap-2" role="radiogroup" aria-label="Sheeting colour">
                          {WAREHOUSE_SHEETING_COLORS.filter((option) => option.value !== "galvanised").map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              role="radio"
                              aria-checked={config.sheetingColor === option.value}
                              aria-label={option.label}
                              title={option.label}
                              onClick={() => updateField("sheetingColor", option.value)}
                              className={`aspect-square rounded-full border-2 p-0.5 transition hover:scale-105 ${
                                config.sheetingColor === option.value
                                  ? "border-[var(--builder-accent)] shadow-sm"
                                  : "border-slate-200"
                              }`}
                            >
                              <span className="block h-full w-full rounded-full border border-black/10" style={{ backgroundColor: option.hex }} />
                            </button>
                          ))}
                        </div>
                        <p className="mt-2 text-[11px] leading-5 text-slate-400">Visual guide only. Final colour availability is confirmed with your quote.</p>
                          </>
                        ) : <p className="text-xs text-slate-500">Standard unpainted galvanised finish.</p>}
                      </div>
                    ) : null}
                  </div>
                </div>

                {!isLcssWarehouse ? (
                    <div id="openings" className="scroll-mt-28 rounded-[1.6rem] border border-slate-200 bg-slate-50/80 p-4">
                      <StepLabel
                        step="Step 3"
                        title="Set doors and openings"
                        hint="Add the main access openings you already know about."
                      />
                      <FieldLabel title="Access openings" />
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Roller door openings
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="6"
                            value={config.rollerDoorCount}
                            onChange={(event) =>
                              updateField("rollerDoorCount", Math.max(0, Number(event.target.value) || 0))
                            }
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Personnel door openings
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="6"
                            value={config.pedestrianDoorCount}
                            onChange={(event) =>
                              updateField("pedestrianDoorCount", Math.max(0, Number(event.target.value) || 0))
                            }
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                          />
                        </div>
                      </div>
                      {config.rollerDoorCount > 0 ? (
                        <div className="mt-3 grid gap-3">
                          <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Roller door opening size
                          </label>
                          <div className="mt-1 grid gap-3 sm:grid-cols-3">
                            {WAREHOUSE_GARAGE_OPENING_OPTIONS.map((option) => (
                              <VisualChoiceCard
                                key={option.value}
                                icon={ArrowsRightLeftIcon}
                                title={option.label}
                                active={config.garageDoorOpeningType === option.value}
                                onClick={() => updateField("garageDoorOpeningType", option.value)}
                              />
                            ))}
                          </div>
                          <div>
                            <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Main opening wall</label>
                            <div className="mt-1 grid grid-cols-4 gap-2">
                              {WAREHOUSE_OPENING_FACE_OPTIONS.map((option) => (
                                <button key={option.value} type="button" onClick={() => updateField("rollerDoorFace", option.value)} className={`rounded-xl border px-2 py-2 text-xs font-semibold transition ${config.rollerDoorFace === option.value ? "border-[var(--builder-accent)] bg-[var(--builder-selection)] text-white" : "border-slate-200 bg-white text-slate-600"}`}>{option.label}</button>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : null}
                      {config.pedestrianDoorCount > 0 ? (
                        <div className="mt-3">
                          <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Personnel opening wall</label>
                          <div className="mt-1 grid grid-cols-4 gap-2">
                            {WAREHOUSE_OPENING_FACE_OPTIONS.map((option) => (
                              <button key={option.value} type="button" onClick={() => updateField("pedestrianDoorFace", option.value)} className={`rounded-xl border px-2 py-2 text-xs font-semibold transition ${config.pedestrianDoorFace === option.value ? "border-[var(--builder-accent)] bg-[var(--builder-selection)] text-white" : "border-slate-200 bg-white text-slate-600"}`}>{option.label}</button>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                ) : null}

                <div id="project-context" className="scroll-mt-28 rounded-[1.6rem] border border-slate-200 bg-slate-50/80 p-4">
                  <StepLabel
                    step={isLcssWarehouse ? "Step 3" : "Step 4"}
                    title="Tell us about the project"
                    hint="A little project context helps us respond better."
                  />
                  <div className="grid gap-3">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Intended use
                      </label>
                      <select
                        value={config.intendedUse}
                        onChange={(event) => updateField("intendedUse", event.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                      >
                        <option value="">Select intended use</option>
                        {INTENDED_USE_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Project stage required
                      </label>
                      <select
                        value={config.projectStage}
                        onChange={(event) => {
                          updateField("projectStage", event.target.value)
                          if (submitError) setSubmitError("")
                        }}
                        className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                      >
                        <option value="">Select project stage</option>
                        {PROJECT_STAGE_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Target timeline
                      </label>
                      <select
                        value={config.targetTimeline}
                        onChange={(event) => updateField("targetTimeline", event.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                      >
                        {TARGET_TIMELINE_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={config.installationInterest}
                        onChange={(event) => updateField("installationInterest", event.target.checked)}
                        className="mt-1"
                      />
                      <span>
                        <span className="block font-semibold text-slate-900">I may need installation support</span>
                        <span className="mt-1 block text-xs leading-5 text-slate-500">Installation is reviewed separately after submission.</span>
                      </span>
                    </label>
                  </div>
                </div>

                <div id="delivery" className="scroll-mt-28 rounded-[1.6rem] border border-slate-200 bg-slate-50/80 p-4">
                  <StepLabel
                    step={isLcssWarehouse ? "Step 4" : "Step 5"}
                    title="Add project location"
                    hint="Location helps us keep the follow-up practical."
                  />
                  <FieldLabel title="Project location" hint="Town, suburb, or site area is required before submission." />
                  <div className="mt-2 grid gap-3">
                    <select
                      value={config.province}
                      onChange={(event) => updateField("province", event.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                    >
                      {PROVINCES.map((province) => (
                        <option key={province} value={province}>
                          {province}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={config.location}
                      onChange={(event) => {
                        updateField("location", event.target.value)
                        if (submitError) setSubmitError("")
                      }}
                      placeholder="Town, suburb, or site area"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                    />
                    <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={config.deliveryRequired}
                        onChange={(event) => updateField("deliveryRequired", event.target.checked)}
                        className="mt-1"
                      />
                      <span>
                        <span className="block font-semibold text-slate-900">I may need delivery support</span>
                        <span className="mt-1 block text-xs leading-5 text-slate-500">Delivery is reviewed separately after submission.</span>
                      </span>
                    </label>
                  </div>
                </div>

                <div id="notes" className="scroll-mt-28 rounded-[1.6rem] border border-slate-200 bg-slate-50/80 p-4">
                  <StepLabel
                    step={isLcssWarehouse ? "Step 5" : "Step 6"}
                    title="Add anything we should know"
                    hint="Optional notes that could help us review faster."
                  />
                  <FieldLabel title="Project notes" />
                  <textarea
                    rows={4}
                    value={config.notes}
                    onChange={(event) => updateField("notes", event.target.value)}
                    placeholder="Anything unusual about access, use, site conditions, clearance, or the system you need?"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm"
                  />
                </div>
              </div>
            </section>
 
            {submitted ? (
              <section className="rounded-[2rem] border border-emerald-200 bg-[linear-gradient(180deg,_#ecfdf5,_#f6fffb)] p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-2xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
                      Project Request Received
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-emerald-950">
                      Your {systemLabel.toLowerCase()} project is now with Smart Steel
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-emerald-900/80">
                      We&apos;ve received your planning details, supply-only budget guide, and project notes so we can review the enquiry properly.
                    </p>
                    {submissionResult?.confirmationEmailSent ? (
                      <p className="mt-2 text-sm font-semibold text-emerald-800">A configuration summary has been sent to your email.</p>
                    ) : null}
                  </div>
                  <div className="rounded-[1.5rem] border border-emerald-200 bg-white px-5 py-4 text-left shadow-sm lg:min-w-[260px]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-600">
                      Supply-only Budget Guide Excl. VAT
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-slate-950">
                      {formatCurrency(budgetValue)}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      {config.width}m x {config.length}m x {config.wallHeight}m
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-[1.5rem] border border-emerald-200 bg-white p-4 shadow-sm">
                    <p className="text-sm font-semibold text-slate-900">Submitted summary</p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {submittedSummaryItems.map((item) => (
                        <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                            {item.label}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-900">{item.value}</p>
                        </div>
                      ))}
                    </div>
                    {config.notes ? (
                      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                          Project notes
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-700">{config.notes}</p>
                      </div>
                    ) : null}
                  </div>

                  <div className="rounded-[1.5rem] border border-emerald-200 bg-white p-4 shadow-sm">
                    <p className="text-sm font-semibold text-slate-900">What happens next</p>
                    <div className="mt-3 space-y-3 text-sm leading-6 text-slate-600">
                      <p>1. Smart Steel reviews your size, layout, and location details.</p>
                      <p>2. We check the project stage, location, access, and any notes you&apos;ve added.</p>
                      <p>3. We follow up with the right next step, whether that&apos;s refining the plan or preparing a formal quote.</p>
                    </div>
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
                      This supply-only budget is still indicative and will be refined once the team confirms
                      project scope, access, and final building requirements. Delivery and installation are reviewed separately.
                    </div>
                    {submissionResult?.submissionWarning ? (
                      <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        {submissionResult.submissionWarning}
                      </div>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitted(false)
                        setSubmissionResult(null)
                      }}
                      className="mt-4 inline-flex items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Start a new design
                    </button>
                  </div>
                </div>
              </section>
            ) : null}
          </section>

          <aside className="order-1 min-w-0 space-y-5 xl:order-2 xl:sticky xl:top-24">
            <div ref={sceneSectionRef} className="min-w-0 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white p-3 shadow-sm sm:rounded-[2rem] sm:p-5">
              <div className="mb-3 flex min-w-0 flex-col gap-2 sm:mb-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">Live warehouse preview</p>
                  <p className="hidden text-sm text-slate-500 sm:block">Rotate, zoom, and watch the footprint update as you edit the build.</p>
                </div>
                <div className={`inline-flex min-w-0 max-w-full self-start items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold sm:max-w-[58%] sm:self-auto ${
                  isLcssWarehouse ? "bg-[#c1d9e5]/55 text-[#001d2e]" : "bg-slate-100 text-slate-600"
                }`}>
                  {isLcssWarehouse ? (
                    <Image src="/atlas/atlas-mark-dark.png" alt="" width={18} height={18} className="h-4 w-4 shrink-0 object-contain" />
                  ) : null}
                  <span className="truncate">{systemLabel} · {roofTypeLabel}</span>
                </div>
              </div>

              <div className="relative">
                <WarehouseBuilderScene {...sceneProps} className="lg:h-[560px] xl:h-[620px]" />

                <div aria-live="polite" className={`pointer-events-none absolute left-1/2 top-16 z-20 -translate-x-1/2 transition-all duration-300 ${changeNotice ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"}`}>
                  <p className="whitespace-nowrap rounded-full border border-white/70 bg-slate-950/90 px-3.5 py-2 text-[11px] font-semibold text-white shadow-lg backdrop-blur">
                    {changeNotice || "Configuration updated"}
                  </p>
                </div>

                <div className="pointer-events-none absolute inset-x-3 bottom-3 z-20 xl:hidden">
                  <div className="flex items-end justify-between gap-2">
                    <div className="pointer-events-auto relative min-w-0 max-w-[calc(100%-3.5rem)] rounded-full border border-slate-200/90 bg-white/94 px-3 py-2 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.55)] backdrop-blur">
                      <div className="flex min-w-0 items-center gap-2">
                        <p className="shrink-0 text-sm font-semibold text-slate-950">
                          {formatCurrency(budgetValue)} <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">excl. VAT</span>
                        </p>
                        <span className="h-1 w-1 shrink-0 rounded-full bg-slate-300" />
                        <p className="truncate text-xs text-slate-500">{mobileSceneSummary}</p>
                      </div>
                      {budgetPulse && budgetDelta !== 0 ? (
                        <div className="pointer-events-none absolute left-2 top-full mt-1.5 inline-flex items-center gap-1 rounded-full bg-slate-950 px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm">
                          <span className="text-slate-300">Updated</span>
                          <span>{budgetDelta > 0 ? "+" : "-"}{formatCurrency(Math.abs(budgetDelta))}</span>
                        </div>
                      ) : null}
                    </div>

                    <div className="pointer-events-auto flex flex-col gap-2 transition-all duration-200 ease-out">
                      {mobileSceneControls
                        .filter((control) => !activeMobileSceneControl || control.key !== activeMobileSceneControl)
                        .map((control) => {
                        const Icon = control.icon
                        const isActive = activeMobileSceneControl === control.key

                        return (
                          <button
                            key={control.key}
                            type="button"
                            onClick={() =>
                              setActiveMobileSceneControl((current) =>
                                current === control.key ? null : control.key
                              )
                            }
                            className={`flex h-11 w-11 items-center justify-center rounded-full border shadow-sm backdrop-blur transition ${
                              isActive
                                ? isLcssWarehouse
                                  ? "border-[#0043f3] bg-[#0043f3] text-white"
                                  : "border-slate-900 bg-slate-900 text-white"
                                : "border-slate-200/90 bg-white/94 text-slate-700"
                            }`}
                            aria-label={control.label}
                            title={control.label}
                          >
                            <Icon className="h-4.5 w-4.5" />
                          </button>
                        )
                        })}
                    </div>
                  </div>

                  {activeMobileSceneControl ? (
                    <div className="pointer-events-auto mt-2 rounded-[1.2rem] border border-slate-200/90 bg-white/95 p-3 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.55)] backdrop-blur">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                            {mobileSceneControls.find((item) => item.key === activeMobileSceneControl)?.label}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {mobileSceneControls.find((item) => item.key === activeMobileSceneControl)?.shortLabel}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveMobileSceneControl(null)}
                          className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600"
                        >
                          Close
                          <ChevronDownIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {activeMobileSceneControl === "width" ? (
                        <div className="grid grid-cols-3 gap-2">
                          {widthOptions.map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => {
                                updateField("width", option)
                                setActiveMobileSceneControl(null)
                              }}
                              className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                                config.width === option
                                  ? "border-slate-900 bg-slate-900 text-white"
                                  : "border-slate-200 bg-white text-slate-700"
                              }`}
                            >
                              {option}m
                            </button>
                          ))}
                        </div>
                      ) : null}

                      {activeMobileSceneControl === "length" ? (
                        <select
                          value={config.length}
                          onChange={(event) => {
                            updateField("length", Number(event.target.value))
                            setActiveMobileSceneControl(null)
                          }}
                          className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900"
                        >
                          {lengthOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}m long
                            </option>
                          ))}
                        </select>
                      ) : null}

                      {activeMobileSceneControl === "enclosure" ? (
                        <select
                          value={isLcssWarehouse ? config.gableMode : config.enclosureType}
                          onChange={(event) => {
                            const value = event.target.value
                            updateField(isLcssWarehouse ? "gableMode" : "enclosureType", value)
                            if (isLcssWarehouse && value !== "structure_only" && config.cladding === "None") updateField("cladding", "IBR")
                            setActiveMobileSceneControl(null)
                          }}
                          className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900"
                        >
                          {(isLcssWarehouse ? ATLAS_WAREHOUSE_SHEETING_OPTIONS : WAREHOUSE_ENCLOSURE_OPTIONS).map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="mt-4 hidden gap-3 xl:grid xl:grid-cols-4">
                <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Current design</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {config.width}m x {config.length}m x {config.wallHeight}m
                  </p>
                </div>
                <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Build direction</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {isLcssWarehouse ? `${steelFinishLabel} · ${gableModeLabel}` : enclosureLabel}
                  </p>
                </div>
                <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Guide rate</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {formatCurrency(pricePerSquareMeter)}/sqm excl. VAT
                  </p>
                </div>
              </div>

              <details className="mt-3 rounded-xl border border-slate-200 bg-slate-50 xl:hidden">
                <summary className="cursor-pointer list-none px-3 py-2.5 text-xs font-semibold text-slate-700">
                  View budget details
                </summary>
                <div className="grid grid-cols-2 gap-2 border-t border-slate-200 p-3">
                  {budgetBreakdownItems.map((item) => (
                    <div key={item.label} className="rounded-xl bg-white px-3 py-2">
                      <p className="text-[10px] text-slate-400">{item.label}</p>
                      <p className="mt-0.5 text-xs font-semibold text-slate-900">{item.value}</p>
                    </div>
                  ))}
                </div>
              </details>
            </div>

            <section id="review-summary" className={`hidden scroll-mt-28 rounded-[2rem] border p-5 text-white shadow-sm transition-all duration-500 sm:p-6 xl:block ${
              isLcssWarehouse
                ? "border-[#0043f3]/40 bg-[linear-gradient(140deg,#001d2e_0%,#06347e_58%,#0043f3_130%)]"
                : "border-slate-200 bg-slate-950"
            }`}>
              <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-4 sm:p-5">
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                      Supply-only budget guide excl. VAT
                    </p>
                    <p className={`mt-3 text-4xl font-semibold leading-none transition sm:text-5xl ${budgetPulse ? "scale-[1.015]" : "scale-100"}`}>
                      {formatCurrency(budgetValue)}
                    </p>
                    <p aria-live="polite" className={`mt-2 text-sm font-medium ${priceChangeTone}`}>
                      {priceChangeLabel}
                    </p>
                    <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300">
                      {isLcssWarehouse
                        ? "Based on your selected size, wall height, steel finish, and sheeting choice."
                        : "Based on your current structure, enclosure, and opening selections."}
                    </p>
                    <p className="mt-3 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/65">
                      {isLcssWarehouse ? `Atlas SKU ${estimate.meta.sku}` : `Design ${designReference}`}
                    </p>
                  </div>
                  <div className="rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Important to know
                    </p>
                    <div className="mt-3 space-y-3">
                      <div className="flex items-start gap-2 text-sm text-slate-100">
                        <CheckBadgeIcon className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
                        <span>Guide price excludes VAT.</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-slate-100">
                        <TruckIcon className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
                        <span>Delivery and installation are reviewed separately.</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-slate-100">
                        <SparklesIcon className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
                        <span>The budget updates live as you edit the build.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowLeadForm((open) => !open)
                    if (!showLeadForm) trackBuilderEvent("warehouse_builder_review_opened", { system: isLcssWarehouse ? "atlas" : "lsf" })
                  }}
                  className={`inline-flex items-center justify-center rounded-2xl px-5 py-3.5 text-sm font-semibold text-white transition ${
                    isLcssWarehouse ? "bg-[#0043f3] hover:bg-[#0036c7]" : "bg-[#da1a33] hover:bg-[#bf172d]"
                  }`}
                >
                  {showLeadForm ? "Hide review form" : reviewCtaLabel}
                </button>
                <button
                  type="button"
                  onClick={handleWhatsAppDesign}
                  className="inline-flex items-center justify-center rounded-2xl bg-[#25d366] px-5 py-3.5 text-sm font-semibold text-[#062d17] transition hover:bg-[#20bd5b]"
                >
                  Send via WhatsApp
                </button>
                <button
                  type="button"
                  onClick={handleSaveDesign}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  {saveStatus ? <CheckIcon className="h-4 w-4" /> : <ShareIcon className="h-4 w-4" />}
                  {saveStatus || "Save design"}
                </button>
                <button
                  type="button"
                  onClick={handleOpenDesignSummary}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  <DocumentTextIcon className="h-4 w-4" />
                  Design summary
                </button>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {budgetItems.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                      {item.label}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Indicative budget breakdown
                  </p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {budgetBreakdownItems.map((item) => (
                      <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                        <p className="text-xs text-slate-300">{item.label}</p>
                        <p className="mt-1 text-sm font-semibold text-white">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    What this guide means
                  </p>
                  <div className="mt-3 rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-4">
                    <p className="text-sm leading-6 text-slate-200">
                      Supply-only budget guide only. Final pricing still depends on confirmed scope, site access, and final design review by the Smart Steel team.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Included in this estimate
                  </p>
                  <div className="mt-3 space-y-2">
                    {includedItems.map((item) => (
                      <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Still subject to confirmation
                  </p>
                  <div className="mt-3 space-y-2">
                    {stillToConfirmItems.map((item) => (
                      <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="hidden rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm xl:block">
              <h2 className="text-lg font-semibold text-slate-900">What happens next</h2>
              <p className="mt-1 text-sm text-slate-500">A quick summary of what happens after you send the project through.</p>
              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                <p>1. You send your layout, budget guide, and project details to Smart Steel.</p>
                <p>2. We review the size, layout, project stage, location, and support preferences you&apos;ve shared.</p>
                <p>3. We follow up with the right next step, whether that&apos;s refining the plan, confirming scope, or preparing a formal quote.</p>
              </div>
            </section>
          </aside>
        </div>
      </div>
      {showLeadForm ? (
        <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6">
          <button
            type="button"
            aria-label="Close project review"
            onClick={() => !submitting && setShowLeadForm(false)}
            className="absolute inset-0 bg-slate-950/65 backdrop-blur-sm"
          />
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="warehouse-review-title"
            className="relative z-10 max-h-[94dvh] w-full overflow-y-auto rounded-t-[2rem] bg-white shadow-2xl sm:max-w-2xl sm:rounded-[2rem]"
          >
            <div className={`relative p-5 text-white sm:p-7 ${isLcssWarehouse ? "bg-[linear-gradient(120deg,#001d2e,#0043f3)]" : "bg-[linear-gradient(120deg,#020617,#172033)]"}`}>
              <button
                type="button"
                aria-label="Close"
                disabled={submitting}
                onClick={() => setShowLeadForm(false)}
                className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-50"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
              <p className="pr-12 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">
                {isLcssWarehouse ? `Atlas SKU ${estimate.meta.sku}` : `Design ${designReference}`}
              </p>
              <h2 id="warehouse-review-title" className="mt-2 pr-12 text-2xl font-semibold sm:text-3xl">
                {submitted ? "Your project is with Smart Steel" : "Request a reviewed quote"}
              </h2>
              <div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur sm:grid-cols-3">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-white/55">Warehouse</p>
                  <p className="mt-1 text-sm font-semibold">{config.width}m × {config.length}m × {config.wallHeight}m</p>
                </div>
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-white/55">System</p>
                  <p className="mt-1 truncate text-sm font-semibold">{systemLabel}</p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-white/55">Guide excl. VAT</p>
                  <p className="mt-1 text-sm font-semibold">{formatCurrency(budgetValue)}</p>
                </div>
              </div>
            </div>

            {submitted ? (
              <div className="p-6 text-center sm:p-8">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                  <CheckIcon className="h-7 w-7" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-slate-950">Request received</h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">We have your complete warehouse design and project context. The Smart Steel team can now review it and follow up with the right next step.</p>
                {submissionResult?.confirmationEmailSent ? (
                  <p className="mx-auto mt-3 max-w-md text-sm font-semibold text-emerald-700">Your configuration summary is on its way to your inbox.</p>
                ) : null}
                {submissionResult?.submissionWarning ? (
                  <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{submissionResult.submissionWarning}</p>
                ) : null}
                <button type="button" onClick={() => setShowLeadForm(false)} className="mt-6 w-full rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white">Return to my design</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid gap-4 p-5 sm:grid-cols-2 sm:p-7">
                <ContactField label="First name" value={leadForm.name} onChange={(event) => setLeadForm((current) => ({ ...current, name: event.target.value }))} placeholder="First name" required />
                <ContactField label="Last name" value={leadForm.lastName} onChange={(event) => setLeadForm((current) => ({ ...current, lastName: event.target.value }))} placeholder="Last name" />
                <ContactField label="Email" type="email" value={leadForm.email} onChange={(event) => setLeadForm((current) => ({ ...current, email: event.target.value }))} placeholder="Email address" required />
                <ContactField label="Phone" type="tel" value={leadForm.phone} onChange={(event) => setLeadForm((current) => ({ ...current, phone: event.target.value }))} placeholder="Phone number" required />
                <div className="sm:col-span-2">
                  <button type="submit" disabled={submitting} className={`w-full rounded-2xl px-5 py-3.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${isLcssWarehouse ? "bg-[#0043f3] hover:bg-[#0036c7]" : "bg-slate-950 hover:bg-slate-800"}`}>
                    {submitting ? "Sending your project..." : "Send for review"}
                  </button>
                  <p className="mt-3 text-center text-xs leading-5 text-slate-500">Your saved configuration and project details will be sent together. No payment is required.</p>
                  {submitError ? <p className="mt-3 text-center text-sm text-red-600">{submitError}</p> : null}
                </div>
              </form>
            )}
          </section>
        </div>
      ) : null}
      {!isSceneVisible && !submitted ? (
        <div className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-50 xl:hidden">
          <div className="mx-auto flex max-w-xl items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/95 p-2.5 pl-4 shadow-[0_20px_55px_-20px_rgba(15,23,42,0.5)] backdrop-blur">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-950">{formatCurrency(budgetValue)} <span className="text-[9px] uppercase tracking-[0.08em] text-slate-400">excl. VAT</span></p>
              <p className="truncate text-[11px] text-slate-500">{mobileSceneSummary}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowLeadForm(true)
                trackBuilderEvent("warehouse_builder_review_opened", { system: isLcssWarehouse ? "atlas" : "lsf" })
              }}
              className="shrink-0 rounded-xl bg-[var(--builder-accent)] px-4 py-3 text-xs font-semibold text-white"
            >
              Review my warehouse
            </button>
          </div>
        </div>
      ) : null}
    </main>
  )
}
