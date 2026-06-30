"use client"

import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import {
  ArrowsRightLeftIcon,
  ArrowsUpDownIcon,
  BuildingOffice2Icon,
  CubeIcon,
  DocumentTextIcon,
  HomeModernIcon,
  ShieldCheckIcon,
  Squares2X2Icon,
  TruckIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline"
import WarehouseBuilderScene from "../../components/warehouse-builder/WarehouseBuilderScene"
import { calculateEstimateByProductType } from "../../lib/estimates/estimateFactory"
import {
  formatCurrency,
  WAREHOUSE_CLADDING_OPTIONS,
  WAREHOUSE_ENCLOSURE_OPTIONS,
  WAREHOUSE_GARAGE_OPENING_OPTIONS,
  WAREHOUSE_HEIGHT_OPTIONS,
  WAREHOUSE_LENGTH_OPTIONS,
  WAREHOUSE_SCOPE_OPTIONS,
  WAREHOUSE_WIDTH_OPTIONS,
} from "../../lib/estimates/warehouseEstimate"
import {
  LCSS_WAREHOUSE_GABLE_OPTIONS,
  LCSS_WAREHOUSE_STEEL_FINISH_OPTIONS,
  LCSS_WAREHOUSE_WIDTH_OPTIONS,
} from "../../lib/estimates/warehouseEstimateLcss"
import { useWarehouseBuilderStore } from "../../lib/warehouseBuilderStore"

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

const WAREHOUSE_SYSTEM_OPTIONS = [
  {
    value: "LSF Warehouse",
    label: "LSF Warehouse",
    description: "Modular warehouse pricing with scope, cladding, enclosure, and opening selections.",
    icon: BuildingOffice2Icon,
  },
  {
    value: "LCSS Warehouse",
    label: "CFLC Warehouse",
    description: "A practical cold formed steel warehouse option with a simple design path.",
    icon: Squares2X2Icon,
  },
]

const LSF_SYSTEM_DEFAULTS = {
  productType: "LSF Warehouse",
  width: 10,
  length: 20,
  wallHeight: 3,
  cladding: "IBR",
  scope: "supply_only",
  enclosureType: "fully_enclosed",
  rollerDoorCount: 1,
  garageDoorOpeningType: "single",
  pedestrianDoorCount: 1,
}

const CFLC_SYSTEM_DEFAULTS = {
  productType: "LCSS Warehouse",
  width: 8,
  length: 20,
  wallHeight: 3,
  steelFinish: "Galv",
  gableMode: "sheeted_gable",
  cladding: "IBR",
  scope: "supply_only",
  enclosureType: "fully_enclosed",
  rollerDoorCount: 0,
  garageDoorOpeningType: "single",
  pedestrianDoorCount: 0,
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
    <div className="mb-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#da1a33]">{step}</p>
      <h3 className="mt-1 text-base font-semibold text-slate-950">{title}</h3>
      {hint ? <p className="mt-1 text-sm leading-6 text-slate-500">{hint}</p> : null}
    </div>
  )
}

const ENCLOSURE_IMAGE_MAP = {
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

function GableThumbnail({ variant = "sheeted_gable", active = false }) {
  return (
    <div className={`relative h-20 rounded-[1.2rem] border ${active ? "border-white/10 bg-white/10" : "border-slate-200 bg-slate-50"}`}>
      <div className={`absolute left-1/2 top-[25px] h-[7px] w-[62px] -translate-x-1/2 -rotate-[18deg] rounded-full ${active ? "bg-white/90" : "bg-[#94a3b8]"}`} />
      <div className={`absolute left-1/2 top-[25px] h-[7px] w-[62px] -translate-x-1/2 rotate-[18deg] rounded-full ${active ? "bg-white/90" : "bg-[#94a3b8]"}`} />
      <div className={`absolute left-[calc(50%-24px)] top-[31px] h-9 w-[5px] rounded-full ${active ? "bg-white/80" : "bg-slate-400"}`} />
      <div className={`absolute left-[calc(50%+19px)] top-[31px] h-9 w-[5px] rounded-full ${active ? "bg-white/80" : "bg-slate-400"}`} />
      {variant === "sheeted_gable" ? (
        <div className={`absolute left-1/2 top-[37px] h-5 w-[38px] -translate-x-1/2 rounded-md ${active ? "bg-white/55" : "bg-slate-200"}`} />
      ) : (
        <div className={`absolute left-1/2 top-[39px] h-[2px] w-[38px] -translate-x-1/2 ${active ? "bg-white/55" : "bg-slate-300"}`} />
      )}
    </div>
  )
}

function VisualChoiceCard({ icon: Icon, title, subtitle, active, onClick, thumbnail }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[1.4rem] border px-4 py-4 text-left transition ${
        active
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      {thumbnail ? (
        <div className="mb-3">{thumbnail}</div>
      ) : (
        <div
          className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl border ${
            active ? "border-white/20 bg-white/10 text-white" : "border-slate-200 bg-slate-50 text-slate-700"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
      )}
      <p className="text-sm font-semibold">{title}</p>
      {subtitle ? (
        <p className={`mt-1 text-xs leading-5 ${active ? "text-slate-200" : "text-slate-500"}`}>{subtitle}</p>
      ) : null}
    </button>
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
  return productType === "LCSS Warehouse" ? "CFLC Warehouse" : "LSF Warehouse"
}

export default function WarehouseBuilderClient() {
  const searchParams = useSearchParams()
  const config = useWarehouseBuilderStore()
  const updateField = useWarehouseBuilderStore((state) => state.updateField)
  const patchFields = useWarehouseBuilderStore((state) => state.patchFields)
  const reset = useWarehouseBuilderStore((state) => state.reset)
  const [showLeadForm, setShowLeadForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submissionResult, setSubmissionResult] = useState(null)
  const [submitError, setSubmitError] = useState("")
  const [leadForm, setLeadForm] = useState({
    name: "",
    lastName: "",
    email: "",
    phone: "",
  })

  const isLcssWarehouse = config.productType === "LCSS Warehouse"
  const systemLabel = getSystemLabel(config.productType)
  const widthOptions = isLcssWarehouse ? LCSS_WAREHOUSE_WIDTH_OPTIONS : WAREHOUSE_WIDTH_OPTIONS
  const scopeLabel = WAREHOUSE_SCOPE_OPTIONS.find((option) => option.value === config.scope)?.label || config.scope
  const enclosureLabel =
    WAREHOUSE_ENCLOSURE_OPTIONS.find((option) => option.value === config.enclosureType)?.label ||
    config.enclosureType
  const roofTypeLabel = "Dual pitch roof"
  const garageDoorOpeningTypeLabel =
    WAREHOUSE_GARAGE_OPENING_OPTIONS.find((option) => option.value === config.garageDoorOpeningType)?.label ||
    config.garageDoorOpeningType
  const steelFinishLabel = config.steelFinish || "Galv"
  const gableModeLabel =
    LCSS_WAREHOUSE_GABLE_OPTIONS.find((option) => option.value === config.gableMode)?.label || config.gableMode

  useEffect(() => {
    const widthParam = Number(searchParams.get("width"))
    const lengthParam = Number(searchParams.get("length"))
    const productTypeParam = searchParams.get("productType")

    const nextProductType =
      productTypeParam === "LCSS Warehouse" || productTypeParam === "LSF Warehouse"
        ? productTypeParam
        : null

    const nextWidthOptions =
      nextProductType === "LCSS Warehouse" ? LCSS_WAREHOUSE_WIDTH_OPTIONS : WAREHOUSE_WIDTH_OPTIONS

    const nextValues = {}

    if (nextProductType && nextProductType !== config.productType) {
      Object.assign(nextValues, nextProductType === "LCSS Warehouse" ? CFLC_SYSTEM_DEFAULTS : LSF_SYSTEM_DEFAULTS)
    }

    if (Number.isFinite(widthParam) && nextWidthOptions.includes(widthParam)) {
      nextValues.width = widthParam
    }

    if (Number.isFinite(lengthParam) && WAREHOUSE_LENGTH_OPTIONS.includes(lengthParam)) {
      nextValues.length = lengthParam
    }

    if (Object.keys(nextValues).length > 0) {
      patchFields(nextValues)
      setSubmitted(false)
      setSubmissionResult(null)
      setShowLeadForm(false)
      setSubmitError("")
    }
  }, [searchParams, config.productType, patchFields])

  const estimateInput = useMemo(() => {
    if (isLcssWarehouse) {
      return {
        width: config.width,
        length: config.length,
        wallHeight: config.wallHeight,
        steelFinish: config.steelFinish,
        gableMode: config.gableMode,
      }
    }

    return {
      ...config,
      claddingInstalled: config.scope === "supply_install",
    }
  }, [config, isLcssWarehouse])

  const estimate = useMemo(
    () => calculateEstimateByProductType(config.productType, estimateInput),
    [config.productType, estimateInput]
  )

  const budgetValue = estimate.pricing.totalInclVat ?? estimate.pricing.estimatedTotal

  const sceneProps = useMemo(() => {
    if (isLcssWarehouse) {
      return {
        width: config.width,
        length: config.length,
        wallHeight: config.wallHeight,
        roofPitch: 15,
        cladding: "IBR",
        enclosureType: config.gableMode === "open_gable" ? "open_sides" : "fully_enclosed",
        rollerDoorCount: 0,
        garageDoorOpeningType: "single",
        pedestrianDoorCount: 0,
      }
    }

    return {
      width: config.width,
      length: config.length,
      wallHeight: config.wallHeight,
      roofPitch: config.roofPitch,
      cladding: config.cladding,
      enclosureType: config.enclosureType,
      rollerDoorCount: config.rollerDoorCount,
      garageDoorOpeningType: config.garageDoorOpeningType,
      pedestrianDoorCount: config.pedestrianDoorCount,
    }
  }, [config, isLcssWarehouse])

  const applySystem = (productType) => {
    patchFields(productType === "LCSS Warehouse" ? CFLC_SYSTEM_DEFAULTS : LSF_SYSTEM_DEFAULTS)
    setSubmitted(false)
    setSubmissionResult(null)
    setShowLeadForm(false)
    setSubmitError("")
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
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
          province: config.province,
          location: config.location,
          scope: isLcssWarehouse ? null : config.scope,
          scopeLabel: isLcssWarehouse ? null : scopeLabel,
          enclosureType: isLcssWarehouse ? null : config.enclosureType,
          enclosureLabel: isLcssWarehouse ? null : enclosureLabel,
          roofType: config.roofType,
          roofTypeLabel,
          cladding: isLcssWarehouse ? null : config.cladding,
          rollerDoorCount: isLcssWarehouse ? 0 : config.rollerDoorCount,
          garageDoorOpeningType: isLcssWarehouse ? null : config.garageDoorOpeningType,
          garageDoorOpeningTypeLabel: isLcssWarehouse ? null : garageDoorOpeningTypeLabel,
          pedestrianDoorCount: isLcssWarehouse ? 0 : config.pedestrianDoorCount,
          steelFinish: isLcssWarehouse ? config.steelFinish : null,
          gableMode: isLcssWarehouse ? config.gableMode : null,
          gableModeLabel: isLcssWarehouse ? gableModeLabel : null,
          deliveryRequired: config.deliveryRequired,
          deliveryDistance: config.deliveryRequired ? config.deliveryDistance : 0,
          estimateRequest: estimate.summary.estimateRequest,
          estimatedTotal: budgetValue,
          priceLabel: formatCurrency(budgetValue),
          summaryNote: estimate.summary.layoutNote,
          configuration: {
            productType: config.productType,
            width: config.width,
            length: config.length,
            wallHeight: config.wallHeight,
            roofType: config.roofType,
            roofPitch: config.roofPitch,
            cladding: config.cladding,
            scope: config.scope,
            enclosureType: config.enclosureType,
            rollerDoorCount: config.rollerDoorCount,
            garageDoorOpeningType: config.garageDoorOpeningType,
            pedestrianDoorCount: config.pedestrianDoorCount,
            steelFinish: config.steelFinish,
            gableMode: config.gableMode,
            deliveryRequired: config.deliveryRequired,
            deliveryDistance: config.deliveryRequired ? config.deliveryDistance : 0,
            province: config.province,
            location: config.location,
            notes: config.notes,
          },
          summary: {
            systemLabel,
            scopeLabel: isLcssWarehouse ? null : scopeLabel,
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
      setShowLeadForm(false)
      setLeadForm({ name: "", lastName: "", email: "", phone: "" })
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
        { label: "Gable type", value: gableModeLabel },
        {
          label: "Delivery",
          value: config.deliveryRequired
            ? `${config.province}${config.location ? `, ${config.location}` : ""}`
            : "Collection / no delivery",
        },
      ]
    : [
        { label: "System", value: systemLabel },
        { label: "Warehouse", value: `${config.width}m x ${config.length}m` },
        { label: "Height", value: `${config.wallHeight}m eave` },
        { label: "Cladding", value: config.cladding },
        { label: "Scope", value: scopeLabel },
        { label: "Enclosure", value: enclosureLabel },
      ]

  const budgetItems = isLcssWarehouse
    ? [
        { label: "Size", value: `${config.width}m x ${config.length}m x ${config.wallHeight}m` },
        { label: "System", value: systemLabel },
        { label: "Steel finish", value: steelFinishLabel },
        { label: "Gable type", value: gableModeLabel },
      ]
    : [
        { label: "Size", value: `${config.width}m x ${config.length}m x ${config.wallHeight}m` },
        { label: "Scope", value: scopeLabel },
        { label: "Enclosure", value: enclosureLabel },
        {
          label: "Access",
          value: `${config.rollerDoorCount} garage${config.rollerDoorCount > 0 ? ` (${garageDoorOpeningTypeLabel})` : ""} / ${config.pedestrianDoorCount} pedestrian`,
        },
      ]

  const submittedSummaryItems = isLcssWarehouse
    ? [
        { label: "System", value: systemLabel },
        { label: "Steel finish", value: steelFinishLabel },
        { label: "Gable type", value: gableModeLabel },
        {
          label: "Delivery",
          value: config.deliveryRequired
            ? `${config.province}${config.location ? `, ${config.location}` : ""}`
            : "Collection / no delivery",
        },
        {
          label: "Status",
          value: "Received",
        },
      ]
    : [
        { label: "Scope", value: scopeLabel },
        { label: "Enclosure", value: enclosureLabel },
        { label: "Cladding", value: config.cladding },
        {
          label: "Openings",
          value: `${config.rollerDoorCount} garage${config.rollerDoorCount > 0 ? ` (${garageDoorOpeningTypeLabel})` : ""} / ${config.pedestrianDoorCount} pedestrian`,
        },
        {
          label: "Delivery",
          value: config.deliveryRequired
            ? `${config.province}${config.location ? `, ${config.location}` : ""}`
            : "Collection / no delivery",
        },
        {
          label: "Status",
          value: "Received",
        },
      ]

  const includedItems = isLcssWarehouse
    ? [
        "Primary framing sized to your selected warehouse footprint",
        "Indicative structural allowances based on your steel finish and gable choice",
        "Delivery context captured for a cleaner follow-up",
      ]
    : [
        "Primary steel structure sized to your selected footprint",
        "Indicative cladding, enclosure, and framed opening allowances",
        "Delivery context captured so the next step starts with better project detail",
      ]

  const stillToConfirmItems = [
    "Final engineering, site conditions, and foundation requirements",
    "Confirmed delivery distance, access, and unloading arrangements",
    "Any changes to layout, finishes, or additional building requirements",
  ]

  const configSections = isLcssWarehouse
    ? [
        { id: "building-type", label: "Building type", icon: BuildingOffice2Icon },
        { id: "size-style", label: "Size and style", icon: ArrowsUpDownIcon },
        { id: "build-details", label: "Build details", icon: ShieldCheckIcon },
        { id: "delivery", label: "Delivery", icon: TruckIcon },
        { id: "notes", label: "Notes", icon: DocumentTextIcon },
      ]
    : [
        { id: "building-type", label: "Building type", icon: BuildingOffice2Icon },
        { id: "size-style", label: "Size and style", icon: ArrowsUpDownIcon },
        { id: "cladding", label: "Sides and roof", icon: CubeIcon },
        { id: "openings", label: "Doors and openings", icon: ArrowsRightLeftIcon },
        { id: "delivery", label: "Delivery", icon: TruckIcon },
        { id: "notes", label: "Notes", icon: DocumentTextIcon },
      ]

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#fff8f6,_#ffffff_24%,_#eef3f7)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1540px]">
        <section className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur sm:p-8">
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#da1a33]">
              Build Your Warehouse
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Customize your warehouse and get an instant budget guide
            </h1>
            <div className="mt-6 flex flex-wrap gap-2">
              {["Live 3D preview", "Instant budget guide"].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-6 xl:grid-cols-[360px_minmax(0,1.55fr)] xl:items-start">
          <section className="space-y-5">
            <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mt-5 flex flex-wrap gap-2">
                {configSections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600 transition hover:border-slate-300 hover:bg-slate-100"
                  >
                    <section.icon className="h-3.5 w-3.5" />
                    {section.label}
                  </a>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Configuration</h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    reset()
                    setSubmitted(false)
                    setSubmissionResult(null)
                  }}
                  className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                >
                  Reset
                </button>
              </div>

              <div className="space-y-5">
                <div id="building-type" className="scroll-mt-28 rounded-[1.6rem] border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
                  <StepLabel
                    step="Step 1"
                    title="Choose your building type"
                  />
                  <FieldLabel
                    title="Warehouse system"
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    {WAREHOUSE_SYSTEM_OPTIONS.map((option) => {
                      const isActive = config.productType === option.value

                      return (
                        <VisualChoiceCard
                          key={option.value}
                          icon={option.icon}
                          title={option.label}
                          subtitle={option.description}
                          active={isActive}
                          onClick={() => applySystem(option.value)}
                        />
                      )
                    })}
                  </div>
                </div>

                <div id="size-style" className="scroll-mt-28 rounded-[1.6rem] border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
                  <StepLabel
                    step="Step 2"
                    title="Customize size and style"
                  />
                  <FieldLabel
                    title={isLcssWarehouse ? "CFLC warehouse size" : "Warehouse size"}
                  />
                  <div className="grid grid-cols-3 gap-2">
                    {widthOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => updateField("width", option)}
                        className={`rounded-2xl border px-3 py-3 text-sm font-semibold transition ${
                          config.width === option
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {option}m W
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Length
                      </label>
                      <select
                        value={config.length}
                        onChange={(event) => updateField("length", Number(event.target.value))}
                        className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                      >
                        {WAREHOUSE_LENGTH_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}m
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        {isLcssWarehouse ? "Wall height" : "Eave height"}
                      </label>
                      <select
                        value={config.wallHeight}
                        onChange={(event) => updateField("wallHeight", Number(event.target.value))}
                        className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                      >
                        {WAREHOUSE_HEIGHT_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}m
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {isLcssWarehouse ? (
                  <div id="build-details" className="scroll-mt-28 rounded-[1.6rem] border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
                    <StepLabel
                      step="Step 3"
                      title="Set the main build details"
                    />
                    <FieldLabel title="CFLC assumptions" />
                    <div className="grid gap-3">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                          Steel finish
                        </label>
                        <div className="mt-1 grid grid-cols-2 gap-3">
                          {LCSS_WAREHOUSE_STEEL_FINISH_OPTIONS.map((option) => (
                            <VisualChoiceCard
                              key={option}
                              icon={option === "Galv" ? ShieldCheckIcon : CubeIcon}
                              title={option}
                              active={config.steelFinish === option}
                              onClick={() => updateField("steelFinish", option)}
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                          Gable type
                        </label>
                        <div className="mt-1 grid gap-3 sm:grid-cols-2">
                          {LCSS_WAREHOUSE_GABLE_OPTIONS.map((option) => (
                            <VisualChoiceCard
                              key={option.value}
                              icon={option.value === "open_gable" ? ArrowsRightLeftIcon : HomeModernIcon}
                              title={option.label}
                              active={config.gableMode === option.value}
                              thumbnail={
                                <GableThumbnail
                                  variant={option.value}
                                  active={config.gableMode === option.value}
                                />
                              }
                              onClick={() => updateField("gableMode", option.value)}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div id="cladding" className="scroll-mt-28 rounded-[1.6rem] border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
                      <StepLabel
                        step="Step 3"
                        title="Choose the roof and side enclosure"
                      />
                      <FieldLabel title="Project scope" />
                      <div className="grid gap-3 sm:grid-cols-2">
                        {WAREHOUSE_SCOPE_OPTIONS.map((option) => (
                          <VisualChoiceCard
                            key={option.value}
                            icon={option.value === "supply_install" ? WrenchScrewdriverIcon : CubeIcon}
                            title={option.label}
                            active={config.scope === option.value}
                            onClick={() => updateField("scope", option.value)}
                          />
                        ))}
                      </div>
                      <div className="mt-5">
                      <FieldLabel title="Cladding and enclosure" />
                      <div className="grid grid-cols-3 gap-2">
                        {WAREHOUSE_CLADDING_OPTIONS.map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => updateField("cladding", option)}
                            className={`rounded-2xl border px-3 py-3 text-sm font-semibold transition ${
                              config.cladding === option
                                ? "border-slate-900 bg-slate-900 text-white"
                                : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-3">
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
                            active={config.enclosureType === option.value}
                            thumbnail={
                              <RoofEnclosureThumbnail
                                variant={option.value}
                                active={config.enclosureType === option.value}
                              />
                            }
                            onClick={() => updateField("enclosureType", option.value)}
                          />
                        ))}
                      </div>
                      </div>
                    </div>

                    <div id="openings" className="scroll-mt-28 rounded-[1.6rem] border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
                      <StepLabel
                        step="Step 4"
                        title="Set doors and openings"
                      />
                      <FieldLabel title="Access openings" />
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Garage door openings
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
                            Pedestrian door openings
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
                        <div className="mt-3">
                          <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Garage opening size
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
                        </div>
                      ) : null}
                    </div>
                  </>
                )}

                <div id="delivery" className="scroll-mt-28 rounded-[1.6rem] border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
                  <StepLabel
                    step={isLcssWarehouse ? "Step 4" : "Step 5"}
                    title="Add delivery details"
                  />
                  <FieldLabel title="Delivery" />
                  <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={config.deliveryRequired}
                      onChange={(event) => updateField("deliveryRequired", event.target.checked)}
                    />
                    Delivery required
                  </label>
                  <div className="mt-3 grid gap-3">
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
                      onChange={(event) => updateField("location", event.target.value)}
                      placeholder="Town, suburb, or project location"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                    />
                    {config.deliveryRequired ? (
                      <input
                        type="number"
                        min="0"
                        step="5"
                        value={config.deliveryDistance}
                        onChange={(event) =>
                          updateField("deliveryDistance", Math.max(0, Number(event.target.value) || 0))
                        }
                        placeholder="Estimated delivery distance (km)"
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                      />
                    ) : null}
                  </div>
                </div>

                <div id="notes" className="scroll-mt-28 rounded-[1.6rem] border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
                  <StepLabel
                    step={isLcssWarehouse ? "Step 5" : "Step 6"}
                    title="Add anything we should know"
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
 
            {showLeadForm ? (
              <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="max-w-2xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
                    Send My Design
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                    Send this {systemLabel.toLowerCase()} enquiry to Smart Steel
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Send the design details through and we&apos;ll review the project with the right context from the start.
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    The more accurate the contact details, location, and notes, the easier it is for us to respond well.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
                  <ContactField
                    label="First name"
                    value={leadForm.name}
                    onChange={(event) => setLeadForm((current) => ({ ...current, name: event.target.value }))}
                    placeholder="First name"
                    required
                  />
                  <ContactField
                    label="Last name"
                    value={leadForm.lastName}
                    onChange={(event) => setLeadForm((current) => ({ ...current, lastName: event.target.value }))}
                    placeholder="Last name"
                  />
                  <ContactField
                    label="Email"
                    type="email"
                    value={leadForm.email}
                    onChange={(event) => setLeadForm((current) => ({ ...current, email: event.target.value }))}
                    placeholder="Email address"
                    required
                  />
                  <ContactField
                    label="Phone"
                    type="tel"
                    value={leadForm.phone}
                    onChange={(event) => setLeadForm((current) => ({ ...current, phone: event.target.value }))}
                    placeholder="Phone number"
                    required
                  />
                  <div className="md:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting ? "Sending enquiry..." : "Send My Design"}
                    </button>
                    <p className="text-sm text-slate-500">We&apos;ll use this information to review your project and respond properly.</p>
                  </div>
                  {submitError ? (
                    <p className="md:col-span-2 text-sm text-red-600">{submitError}</p>
                  ) : null}
                </form>
              </section>
            ) : null}

            {submitted ? (
              <section className="rounded-[2rem] border border-emerald-200 bg-[linear-gradient(180deg,_#ecfdf5,_#f6fffb)] p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-2xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
                      Design Received
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-emerald-950">
                      Your {systemLabel.toLowerCase()} enquiry is now with Smart Steel
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-emerald-900/80">
                      We&apos;ve received your design details, indicative budget, and project notes so we can review the enquiry properly.
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] border border-emerald-200 bg-white px-5 py-4 text-left shadow-sm lg:min-w-[260px]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-600">
                      Indicative Budget
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
                      <p>1. Smart Steel reviews the structure size and your project notes.</p>
                      <p>2. We review the design details and project requirements you&apos;ve shared.</p>
                      <p>3. You get a follow-up with the next step or a refined quotation path.</p>
                    </div>
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
                      This budget is still indicative only and will be refined once the team confirms
                      project scope, access, delivery, and final building requirements.
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

          <aside className="space-y-5 xl:sticky xl:top-6">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Live warehouse preview</p>
                  <p className="text-sm text-slate-500">Rotate and zoom</p>
                </div>
                <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {systemLabel} · {roofTypeLabel}
                </div>
              </div>

              <WarehouseBuilderScene {...sceneProps} className="lg:h-[720px] xl:h-[780px]" />

              <div className="mt-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Your current design
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {systemLabel} warehouse · {config.width}m x {config.length}m x {config.wallHeight}m
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {isLcssWarehouse
                    ? `${steelFinishLabel} finish · ${gableModeLabel}`
                    : `${scopeLabel} · ${enclosureLabel}`}
                </p>
              </div>
            </div>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Design snapshot</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {summaryItems.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                      {item.label}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{item.value}</p>
                  </div>
                ))}
              </div>
              {estimate.summary.layoutNote ? (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  {estimate.summary.layoutNote}
                </div>
              ) : null}
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-slate-950 p-5 text-white shadow-sm sm:p-6">
              <div className="flex flex-col gap-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
                    Estimated project budget
                  </p>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
                    {isLcssWarehouse
                      ? "A fast guide based on your selected size, wall height, steel finish, and gable type."
                      : "A fast commercial guide based on your current structure, enclosure, and opening selections."}
                  </p>
                  <p className="mt-3 text-4xl font-semibold sm:text-5xl">
                    {formatCurrency(budgetValue)}
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setShowLeadForm((open) => !open)}
                    className="inline-flex items-center justify-center rounded-2xl bg-[#da1a33] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#bf172d]"
                  >
                    {showLeadForm ? "Hide enquiry form" : "Send this design to Smart Steel"}
                  </button>
                  <button
                    type="button"
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Refine this design
                  </button>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {budgetItems.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                      {item.label}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">{item.value}</p>
                  </div>
                ))}
              </div>

              <p className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-slate-200">
                Indicative budget only. Final pricing still depends on confirmed scope, delivery,
                site access, and final design review by the Smart Steel team.
              </p>
              <div className="mt-5 grid gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
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
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
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

            <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">What happens next</h2>
              <p className="mt-1 text-sm text-slate-500">A quick summary of what happens after you send your enquiry.</p>
              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                <p>1. You send your design enquiry to Smart Steel.</p>
                <p>2. We review the size, layout, and project details you&apos;ve shared.</p>
                <p>3. We follow up with the next practical step, whether that&apos;s refining the design or preparing a quotation.</p>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  )
}
