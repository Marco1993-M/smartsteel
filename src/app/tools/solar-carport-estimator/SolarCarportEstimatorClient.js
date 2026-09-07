"use client"

import Image from "next/image"
import dynamic from "next/dynamic"
import { useMemo, useState } from "react"
import Link from "next/link"
import { useSolarCarportEstimate } from 'lib/useSolarCarportEstimate'
import { ATLAS_SOLAR_CARPORT_PARKING_WIDTH_METRES } from "lib/atlasSolarCarportProfiles"
import { calculateSolarEstimate, formatCurrency } from "../../../lib/estimates/solarEstimate"

const DEFAULT_CLEARANCE_HEIGHT = 2.4
const DEFAULT_SOLAR_PANEL_WATTAGE = 550
const DEFAULT_SOLAR_PANEL_LENGTH_METERS = 2.278
const DEFAULT_SOLAR_PANEL_WIDTH_METERS = 1.134
const SMART_STEEL_WHATSAPP_NUMBER = "27828464555"
const SolarCarportPreview = dynamic(
  () => import("../../../components/solar-carport/SolarCarportPreview"),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-[290px] place-items-center rounded-[1.6rem] border border-slate-200 bg-[radial-gradient(circle_at_top,_#ffffff_0%,_#edf3f8_58%,_#d8e2eb_100%)] sm:h-[360px]">
        <div className="text-center">
          <span className="mx-auto block h-2 w-24 animate-pulse rounded-full bg-[#0043f3]/25" />
          <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#667b91]">Preparing Atlas 3D view</p>
        </div>
      </div>
    ),
  }
)

const SOLAR_CARPORT_WIDTH_OPTIONS = [1, 2, 4, 6, 8].map((parkingCount) => ({
  parkingCount,
  width: parkingCount * ATLAS_SOLAR_CARPORT_PARKING_WIDTH_METRES,
  label: parkingCount === 1 ? "Single car" : `${parkingCount} cars`,
}))
const SOLAR_CARPORT_LENGTH_OPTIONS = [
  { value: 6, label: "Single Row (6m)" },
  { value: 12, label: "Double Row (12m)" },
]
const PROCEED_TIMING_OPTIONS = [
  { value: "ready_now", label: "Ready now" },
  { value: "within_30_days", label: "Within 30 days" },
  { value: "one_to_three_months", label: "1 to 3 months" },
  { value: "just_pricing", label: "Just pricing for now" },
]

function reportAtlasSolarCarportConversion() {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return

  window.gtag("event", "conversion", {
    send_to: "AW-17629050810/hIhiCNzz6tAcELrvl9ZB",
    value: 1.0,
    currency: "ZAR",
  })
}

function formatDimension(value) {
  return `${Number(value)}m`
}

function calculateEstimatedPanelCount(width, length) {
  const usableArea = Number(width) * Number(length)
  const panelArea = DEFAULT_SOLAR_PANEL_LENGTH_METERS * DEFAULT_SOLAR_PANEL_WIDTH_METERS

  if (!Number.isFinite(usableArea) || usableArea <= 0 || !Number.isFinite(panelArea) || panelArea <= 0) {
    return 0
  }

  // Keep a practical allowance for spacing, edge offsets, and structure layout.
  return Math.max(1, Math.floor((usableArea * 0.82) / panelArea))
}

function buildEstimatorNotes({ estimate, formState, enquiryNotes }) {
  const lines = [
    "Solar carport estimator enquiry",
    `Scope: ${estimate.labels.scope}`,
    `Estimated budget (excl. VAT): ${priceLabel}`,
    `Indicative area: ${estimate.labels.area}`,
    `Modules: ${estimate.labels.modules}`,
    `Delivery: ${estimate.labels.delivery}`,
    formState.proceedTiming ? `Looking to proceed: ${PROCEED_TIMING_OPTIONS.find((option) => option.value === formState.proceedTiming)?.label || formState.proceedTiming}` : null,
    enquiryNotes?.trim() ? `Client notes: ${enquiryNotes.trim()}` : null,
    `Selected width: ${formatDimension(formState.width)}`,
    `Selected length: ${formatDimension(formState.length)}`,
    `Quantity: ${formState.quantity}`,
  ].filter(Boolean)

  return lines.join("\n")
}

export default function SolarCarportEstimatorClient({ initialInput = {} }) {
  const initialWidth = Number(initialInput.width)
  const initialLength = Number(initialInput.length)
  const initialQuantity = Number(initialInput.quantity)
  const defaultWidth = SOLAR_CARPORT_WIDTH_OPTIONS.some((option) => option.width === initialWidth)
    ? initialWidth
    : SOLAR_CARPORT_WIDTH_OPTIONS[1].width
  const defaultLength = SOLAR_CARPORT_LENGTH_OPTIONS.some((option) => option.value === initialLength)
    ? initialLength
    : 6
  const [formState, setFormState] = useState({
    width: defaultWidth,
    length: defaultLength,
    wallHeight: DEFAULT_CLEARANCE_HEIGHT,
    quantity: initialQuantity > 0 ? initialQuantity : 1,
    moduleCount: calculateEstimatedPanelCount(defaultWidth, defaultLength),
    deliveryDistance: 0,
    scope: "supply_only",
    proceedTiming: "",
  })
  const [showEnquiryForm, setShowEnquiryForm] = useState(false)
  const [activeStage, setActiveStage] = useState("configure")
  const [enquiryState, setEnquiryState] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [submitSuccess, setSubmitSuccess] = useState("")

  const unpricedEstimate = useMemo(
    () =>
      calculateSolarEstimate({
        productType: "Solar carport",
        width: formState.width,
        length: formState.length,
        wallHeight: formState.wallHeight,
        quantity: formState.quantity,
        moduleCount: formState.moduleCount,
        deliveryDistance: formState.deliveryDistance,
        scope: formState.scope,
      }),
    [formState]
  )
  const livePricing = useSolarCarportEstimate(unpricedEstimate.input)
  const estimate = livePricing.estimate || unpricedEstimate
  const priceLabel = estimate.meta.pricingReady ? formatCurrency(estimate.pricing.estimatedTotal) : livePricing.error ? 'Price on request' : 'Loading price…'
  const selectedParkingCount = SOLAR_CARPORT_WIDTH_OPTIONS.find(
    (option) => option.width === formState.width
  )?.parkingCount || 2

  const whatsappMessage = [
    "Hi Smart Steel, I'd like to discuss an Atlas solar carport.",
    "",
    `Layout: ${formState.quantity} ${formState.quantity === 1 ? "structure" : "structures"}, ${formatDimension(formState.width)} wide x ${formatDimension(formState.length)}`,
    `Estimated panel capacity: ${formState.moduleCount} panels per structure`,
    `Structure-only starting budget: ${priceLabel} excl. VAT`,
    "",
    "Please get in touch with me about the next step.",
  ].join("\n")
  const whatsappHref = `https://wa.me/${SMART_STEEL_WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`

  const handleFieldChange = (field, value) => {
    setFormState((current) => {
      const nextState = {
        ...current,
        [field]: value,
      }

      if (field === "width" || field === "length") {
        nextState.moduleCount = calculateEstimatedPanelCount(nextState.width, nextState.length)
      }

      return nextState
    })
    setSubmitError("")
    setSubmitSuccess("")
  }

  const handleEnquiryChange = (field, value) => {
    setEnquiryState((current) => ({
      ...current,
      [field]: value,
    }))
    setSubmitError("")
    setSubmitSuccess("")
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!estimate.meta.pricingReady) { setSubmitError('Please wait for current pricing before submitting.'); return }

    if (!enquiryState.name.trim() || !enquiryState.email.trim() || !enquiryState.phone.trim()) {
      setSubmitError("Please add your name, email, and phone number before sending the enquiry.")
      return
    }

    setIsSubmitting(true)
    setSubmitError("")
    setSubmitSuccess("")

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: enquiryState.name.trim(),
          lastName: "Solar Carport Enquiry",
          email: enquiryState.email.trim(),
          phone: enquiryState.phone.trim(),
          lead_source: "Solar Carport Estimator",
          product_type: "Solar carport",
          estimate_request: estimate.summary.estimateRequest,
          quote_value: estimate.pricing.estimatedTotal,
          solarInput: estimate.input,
          solarPricingRevision: estimate.meta.pricingRevision,
          next_action:
            "Review solar carport estimator enquiry, confirm parking layout, and contact the client with the next step.",
          notes: buildEstimatorNotes({
            estimate,
            formState,
            enquiryNotes: enquiryState.notes,
          }),
        }),
      })

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload?.error || "Could not save the solar carport enquiry.")
      }

      reportAtlasSolarCarportConversion()

      setSubmitSuccess(
        "Your solar carport enquiry has been saved. The Smart Steel team can now pick it up in the CRM and follow up properly."
      )
      setShowEnquiryForm(false)
      setEnquiryState({
        name: "",
        email: "",
        phone: "",
        notes: "",
      })
    } catch (error) {
      setSubmitError(error?.message || "Could not save the solar carport enquiry.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#ffffff_7rem,#edf4f8_18rem,#edf4f8_100%)] px-4 pb-28 pt-24 text-[#001d2e] sm:px-6 sm:pt-28 lg:px-8 lg:pb-10">
      <div className="mx-auto max-w-[1380px]">
        <section
          className="relative overflow-hidden rounded-[1.3rem] border border-[#0043f3]/25 bg-[#001d2e] px-4 py-4 text-white shadow-sm sm:rounded-[1.6rem] sm:px-6 sm:py-5"
          style={{ background: "linear-gradient(118deg, #001d2e 0%, #073c8d 58%, #0043f3 100%)" }}
        >
          <div className="pointer-events-none absolute -right-24 -top-36 h-72 w-72 rotate-45 border-[28px] border-white/[0.07]" />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-2 flex items-center gap-3 sm:mb-4">
                <Image src="/atlas/atlas-logo-horizontal-light.png" alt="Atlas by Smart Steel" width={240} height={48} className="h-6 max-w-[190px] object-contain object-left sm:h-8 sm:max-w-none" priority />
                <span className="hidden h-7 w-px bg-white/20 sm:block" />
                <p className="hidden text-[10px] font-semibold uppercase tracking-[0.24em] text-white/65 sm:block">Live configuration</p>
              </div>
              <p className="hidden text-[11px] font-semibold uppercase tracking-[0.26em] text-[#c1d9e5] sm:block">Atlas solar carport estimator</p>
              <h1 className="text-xl font-semibold tracking-tight text-white sm:mt-2 sm:text-3xl lg:text-[2rem]">
                Build and price your Atlas solar carport
              </h1>
              <p className="mt-2 hidden max-w-2xl text-sm leading-6 text-white/70 sm:block">
                Configure a modular ZAM steel carport and see the structure-only budget update live.
              </p>
            </div>
            <div className="hidden flex-wrap gap-2 sm:flex lg:max-w-[460px] lg:justify-end">
              {["Interactive 3D preview", "Live guide excl. VAT", "ZAM steel system"].map((item) => (
                <span key={item} className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/75 backdrop-blur">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <div className="sticky top-3 z-40 mt-4 hidden border border-[#001d2e]/15 bg-white/95 px-5 py-3 shadow-[0_18px_40px_-28px_rgba(0,29,46,0.85)] backdrop-blur lg:flex lg:items-center lg:justify-between lg:gap-6">
          <div className="flex min-w-0 items-center gap-5">
            <div className="min-w-0 border-r border-[#c1d9e5] pr-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0043f3]">Current configuration</p>
              <p className="mt-1 truncate text-sm font-bold text-[#001d2e]">
                {selectedParkingCount === 1 ? "Single car" : `${selectedParkingCount} cars`} · {formState.length === 6 ? "Single row" : "Double row"} · {formState.moduleCount} panels
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8295b3]">Guide excl. VAT</p>
              <p className="mt-1 text-xl font-bold tracking-[-0.03em] text-[#001d2e]">{priceLabel}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setShowEnquiryForm(true)
              setActiveStage("enquire")
              window.setTimeout(() => document.querySelector("#solar-carport-workspace")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0)
            }}
            className="shrink-0 bg-[#0043f3] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#073c8d]"
          >
            Continue with this estimate
          </button>
        </div>

        <section className="mt-6 grid items-start gap-6 lg:grid-cols-12">
          <div className="min-w-0 border border-[#c1d9e5] bg-white p-4 shadow-[0_24px_60px_-48px_rgba(0,29,46,0.8)] sm:p-6 lg:sticky lg:top-24 lg:col-span-7">
            <SolarCarportPreview parkingCount={selectedParkingCount} rowLength={formState.length} />
          </div>

          <div id="solar-carport-workspace" className="min-w-0 space-y-4 scroll-mt-24 lg:col-span-5">
          <div className="grid grid-cols-3 border border-[#c1d9e5] bg-white p-1 shadow-[0_18px_40px_-32px_rgba(0,29,46,0.75)]">
            {[
              { id: "configure", label: "Configure" },
              { id: "review", label: "Review" },
              { id: "enquire", label: "Enquire" },
            ].map((stage, index) => (
              <button
                key={stage.id}
                type="button"
                onClick={() => {
                  setActiveStage(stage.id)
                  setShowEnquiryForm(stage.id === "enquire")
                }}
                className={`flex min-h-12 items-center justify-center gap-2 px-2 text-xs font-bold transition sm:text-sm ${
                  activeStage === stage.id
                    ? "bg-[#001d2e] text-white"
                    : "text-[#52647f] hover:bg-[#edf4f8] hover:text-[#001d2e]"
                }`}
              >
                <span className={`grid h-5 w-5 place-items-center rounded-full text-[10px] ${activeStage === stage.id ? "bg-[#0043f3]" : "border border-[#c1d9e5]"}`}>
                  {index + 1}
                </span>
                {stage.label}
              </button>
            ))}
          </div>

          <div className={`${activeStage === "configure" ? "block" : "hidden"} border border-[#c1d9e5] bg-white p-4 shadow-[0_24px_60px_-48px_rgba(0,29,46,0.8)] sm:p-6`}>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0043f3]">
              <span className="mt-6 block">Step 1: Your starting layout</span>
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-[-0.035em] text-[#001d2e] sm:text-3xl">
              Choose the parking layout
            </h2>

            <div className="mt-6">
              <p className="text-sm font-semibold text-slate-700">How many cars should the structure cover?</p>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
                {SOLAR_CARPORT_WIDTH_OPTIONS.map((option) => {
                  const isSelected = formState.width === option.width
                  return (
                    <button
                      key={option.parkingCount}
                      type="button"
                      onClick={() => handleFieldChange("width", option.width)}
                      className={`relative min-h-[112px] border p-4 text-left transition ${
                        isSelected
                          ? "border-[#0043f3] bg-[#0043f3] text-white shadow-[0_16px_30px_-24px_rgba(0,67,243,0.9)]"
                          : "border-[#c1d9e5] bg-[#f6f9fb] text-[#001d2e] hover:border-[#0043f3]"
                      }`}
                    >
                      <div
                        className="grid h-7 w-full max-w-[116px] items-center gap-1 overflow-hidden"
                        style={{ gridTemplateColumns: `repeat(${option.parkingCount}, minmax(0, 1fr))` }}
                        aria-hidden="true"
                      >
                        {Array.from({ length: option.parkingCount }, (_, index) => (
                          <img
                            key={index}
                            src="/car.png"
                            alt=""
                            className={`h-6 min-w-0 max-w-full justify-self-center object-contain ${isSelected ? "brightness-0 invert" : ""}`}
                          />
                        ))}
                      </div>
                      <p className={`mt-3 text-xs font-bold uppercase tracking-[0.16em] ${isSelected ? "text-[#c1d9e5]" : "text-[#0043f3]"}`}>{option.label}</p>
                      <p className="mt-2 text-xl font-semibold">{option.width}m wide</p>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm font-semibold text-slate-700">How should the parking run?</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {SOLAR_CARPORT_LENGTH_OPTIONS.map((option) => {
                  const isSelected = formState.length === option.value
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleFieldChange("length", option.value)}
                      className={`border p-4 text-left transition ${
                        isSelected
                          ? "border-[#0043f3] bg-[#0043f3] text-white"
                          : "border-[#c1d9e5] bg-[#f6f9fb] text-[#001d2e] hover:border-[#0043f3]"
                      }`}
                    >
                      <p className={`text-xs font-bold uppercase tracking-[0.16em] ${isSelected ? "text-[#c1d9e5]" : "text-[#0043f3]"}`}>{option.label}</p>
                      <p className="mt-2 text-sm leading-5 opacity-75">{option.value === 6 ? "One practical parking row" : "Parking on both sides of the structure"}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-[0.8fr_1.2fr]">
              <div className="border border-[#c1d9e5] bg-white p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0043f3]">Structures</p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <button type="button" onClick={() => handleFieldChange("quantity", Math.max(1, formState.quantity - 1))} className="grid h-9 w-9 place-items-center border border-[#c1d9e5] text-lg font-semibold text-[#001d2e] transition hover:border-[#0043f3]" aria-label="Remove structure">-</button>
                  <p className="text-lg font-semibold">{formState.quantity}</p>
                  <button type="button" onClick={() => handleFieldChange("quantity", formState.quantity + 1)} className="grid h-9 w-9 place-items-center border border-[#c1d9e5] text-lg font-semibold text-[#001d2e] transition hover:border-[#0043f3]" aria-label="Add structure">+</button>
                </div>
              </div>
              <div className="border border-[#c1d9e5] bg-[#edf4f8] p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0043f3]">Estimated solar capacity</p>
                <p className="mt-2 text-lg font-semibold text-[#121a20]">{formState.moduleCount} panels per structure</p>
                <p className="mt-1 text-xs leading-5 text-[#121a20]/60">Based on a standard {DEFAULT_SOLAR_PANEL_WATTAGE}W panel layout.</p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-4 border-t border-[#c1d9e5] pt-5">
              <p className="text-sm font-semibold text-[#52647f]">{formState.moduleCount} panels · ZAM steel</p>
              <button type="button" onClick={() => setActiveStage("review")} className="bg-[#0043f3] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#073c8d]">
                Review estimate
              </button>
            </div>
          </div>

          <div className={`${activeStage === "configure" ? "hidden" : "block"} border border-[#001d2e] bg-[#001d2e] p-5 text-white shadow-[0_24px_60px_-44px_rgba(0,29,46,0.95)] sm:p-6`}>
            {activeStage === "review" ? (
            <>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#c1d9e5]">
              Step 2: Your starting budget
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-[-0.035em] text-white">
              Your Atlas solar carport estimate
            </h2>

            <div className="mt-6 overflow-hidden border border-white/15 bg-[linear-gradient(125deg,#073c8d_0%,#0043f3_100%)] text-white">
              <div className="px-6 py-6">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#c1d9e5]">
                  Structure-only starting budget
                </p>
                <p className="mt-3 text-4xl font-bold tracking-[-0.04em] sm:text-5xl">
                  {priceLabel}
                </p>
                <p className="mt-2 text-sm text-slate-300">
                  Excl. VAT
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="border border-white/15 bg-white/[0.06] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Size
                </p>
                <p className="mt-2 text-sm font-semibold text-white">
                  {formatDimension(formState.width)} x {formatDimension(formState.length)}
                </p>
              </div>
              <div className="border border-white/15 bg-white/[0.06] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Structures
                </p>
                <p className="mt-2 text-sm font-semibold text-white">{formState.quantity}</p>
              </div>
              <div className="border border-white/15 bg-white/[0.06] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Solar panels
                </p>
                <p className="mt-2 text-sm font-semibold text-white">{estimate.labels.modules}</p>
              </div>
              <div className="border border-white/15 bg-white/[0.06] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Estimate scope
                </p>
                <p className="mt-2 text-sm font-semibold text-white">{estimate.labels.scope}</p>
              </div>
            </div>

            <div className="mt-6 border border-white/15 bg-white/[0.06] p-5">
              <p className="text-sm font-semibold text-white">Included in this estimate</p>
              <div className="mt-4 space-y-3">
                {estimate.lineItems.map((item) => (
                  <div key={item.code} className="flex items-start gap-3 text-sm">
                    <span className="mt-1 h-2 w-2 bg-[#c1d9e5]" />
                    <p className="font-medium text-white/80">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowEnquiryForm(true)
                  setActiveStage("enquire")
                }}
                className="bg-white px-6 py-3 text-sm font-bold text-[#0043f3] transition hover:bg-[#c1d9e5]"
              >
                Continue with this estimate
              </button>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                onClick={reportAtlasSolarCarportConversion}
                className="border border-[#25D366] bg-[#25D366] px-6 py-3 text-sm font-bold text-[#0b2715] transition hover:bg-[#1fbd58]"
              >
                Send via WhatsApp
              </a>
              <Link
                href="/solar"
                className="border border-white/30 px-6 py-3 text-sm font-bold text-white transition hover:border-white hover:bg-white/10"
              >
                Back to solar page
              </Link>
            </div>
            </>
            ) : null}

            {activeStage === "enquire" && showEnquiryForm ? (
              <form id="solar-carport-enquiry" onSubmit={handleSubmit} className="border border-[#c1d9e5] bg-white p-5 text-[#001d2e] sm:p-6">
                <button type="button" onClick={() => setActiveStage("review")} className="mb-5 text-xs font-bold uppercase tracking-[0.16em] text-[#0043f3]">
                  ← Back to estimate
                </button>
                <h3 className="text-lg font-bold text-[#001d2e]">
                  Send your details to Smart Steel
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Once you send this through, your enquiry is saved in our CRM and the team can
                  follow up with the next step.
                </p>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Name
                    <input
                      type="text"
                      className="mt-2 block w-full border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900"
                      value={enquiryState.name}
                      onChange={(event) => handleEnquiryChange("name", event.target.value)}
                    />
                  </label>

                  <label className="text-sm font-semibold text-slate-700">
                    Email
                    <input
                      type="email"
                      className="mt-2 block w-full border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900"
                      value={enquiryState.email}
                      onChange={(event) => handleEnquiryChange("email", event.target.value)}
                    />
                  </label>

                  <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
                    Phone
                    <input
                      type="text"
                      className="mt-2 block w-full border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900"
                      value={enquiryState.phone}
                      onChange={(event) => handleEnquiryChange("phone", event.target.value)}
                    />
                  </label>

                  <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
                    How soon are you looking to proceed?
                    <select
                      className="mt-2 block w-full border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900"
                      value={formState.proceedTiming}
                      onChange={(event) => handleFieldChange("proceedTiming", event.target.value)}
                    >
                      <option value="">Select if you would like to</option>
                      {PROCEED_TIMING_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
                    Anything else we should know?
                    <textarea
                      rows={4}
                      className="mt-2 block w-full border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900"
                      value={enquiryState.notes}
                      onChange={(event) => handleEnquiryChange("notes", event.target.value)}
                    />
                  </label>
                </div>

                {submitError ? (
                  <p className="mt-4 text-sm font-medium text-red-600">{submitError}</p>
                ) : null}
                {submitSuccess ? (
                  <p className="mt-4 text-sm font-medium text-green-700">{submitSuccess}</p>
                ) : null}

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting || !estimate.meta.pricingReady}
                    className="bg-[#0043f3] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#073c8d] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? "Saving enquiry..." : "Send enquiry"}
                  </button>
                </div>
              </form>
            ) : null}
          </div>
          </div>
        </section>

        <section className="grid gap-8 border-t border-[#c1d9e5] py-14 sm:py-18 lg:grid-cols-[0.8fr_1.2fr] lg:py-20">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0043f3]">
              The Atlas design approach
            </p>
            <h2 className="mt-4 max-w-md text-3xl font-semibold tracking-[-0.04em] text-[#121a20] sm:text-4xl">
              Practical solar parking, built around a repeatable system.
            </h2>
          </div>
          <div className="max-w-2xl text-base leading-7 text-[#121a20]/70 sm:text-lg">
            <p>
              Atlas solar carports use modular layouts and bolted assembly principles to create a practical starting point for covered parking with solar capacity above it. The structure is designed for clear planning, adaptable bay configurations, and a more considered route from early budget to a site-specific proposal.
            </p>
            <p className="mt-5">
              The online estimate gives you a transparent structure-only guide first. Smart Steel then reviews foundations, delivery, installation, access, and final project requirements with you before confirming the full scope.
            </p>
            <Link
              href="/products/cflc-solar-carports"
              className="mt-6 inline-flex border-b border-[#0043f3]/35 pb-1 text-sm font-bold text-[#0043f3] transition hover:border-[#0043f3] hover:text-[#001d2e]"
            >
              Learn more about Atlas solar carports
            </Link>
          </div>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[#121a20]/15 bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_28px_-24px_rgba(18,26,32,0.7)] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#0043f3]">
              Current guide
            </p>
            <p className="mt-0.5 truncate text-lg font-semibold tracking-[-0.03em] text-[#121a20]">
              {priceLabel}
              <span className="ml-1 text-xs font-medium tracking-normal text-[#121a20]/55">excl. VAT</span>
            </p>
          </div>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            onClick={reportAtlasSolarCarportConversion}
            className="inline-flex shrink-0 items-center gap-2 bg-[#25D366] px-4 py-3 text-sm font-semibold text-[#0b2715] shadow-sm transition hover:bg-[#1fbd58]"
          >
            <svg viewBox="0 0 32 32" aria-hidden="true" className="h-5 w-5 fill-current">
              <path d="M16 3.2a12.7 12.7 0 0 0-10.9 19.2L3.5 28.8l6.6-1.7A12.8 12.8 0 1 0 16 3.2Zm0 23.2a10.4 10.4 0 0 1-5.3-1.5l-.4-.2-3.9 1 1-3.8-.3-.4A10.4 10.4 0 1 1 16 26.4Zm5.7-7.8c-.3-.1-1.7-.9-2-.9s-.5-.1-.7.2-.8.9-.9 1.1-.4.3-.7.1a8.5 8.5 0 0 1-2.5-1.5 9.4 9.4 0 0 1-1.8-2.2c-.2-.3 0-.5.1-.6l.5-.6c.2-.2.2-.3.3-.5s0-.4 0-.5l-.9-2.1c-.2-.5-.5-.4-.7-.4h-.6c-.2 0-.5.1-.8.4s-1 1-1 2.4 1 2.8 1.2 3 .2.3.3.5a12 12 0 0 0 4.6 4c.6.3 1 .5 1.4.6.6.2 1.2.2 1.6.1.5-.1 1.7-.7 1.9-1.4s.2-1.2.1-1.4-.3-.2-.6-.4Z" />
            </svg>
            WhatsApp
          </a>
        </div>
      </div>
    </main>
  )
}
