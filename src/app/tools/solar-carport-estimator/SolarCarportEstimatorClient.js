"use client"

import Image from "next/image"
import dynamic from "next/dynamic"
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSolarCarportEstimate } from 'lib/useSolarCarportEstimate'
import { ATLAS_SOLAR_CARPORT_PARKING_WIDTH_METRES } from "lib/atlasSolarCarportProfiles"
import { calculateSolarEstimate, formatCurrency } from "../../../lib/estimates/solarEstimate"

const DEFAULT_CLEARANCE_HEIGHT = 2.4
const DEFAULT_SOLAR_PANEL_WATTAGE = 550
const SMART_STEEL_WHATSAPP_NUMBER = "27828464555"
const SOLAR_CARPORT_PLAN_STORAGE_KEY = "atlas-solar-carport-plan-v1"
const PARKING_RUN_CLEARANCE_METRES = 7.5
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
  const parkingBaysPerSide = Number(width) / ATLAS_SOLAR_CARPORT_PARKING_WIDTH_METRES
  const cantileverSides = Number(length) / 6

  if (!Number.isFinite(parkingBaysPerSide) || parkingBaysPerSide <= 0 || ![1, 2].includes(cantileverSides)) {
    return 0
  }

  // The Atlas roof grid carries six panels per parking bay on each cantilever side.
  return Math.round(parkingBaysPerSide * 6 * cantileverSides)
}

function buildEstimatorNotes({ estimate, formState, enquiryNotes, priceLabel, parkingRuns }) {
  const lines = [
    "Solar carport estimator enquiry",
    `Scope: ${estimate.labels.scope}`,
    `Estimated budget (excl. VAT): ${priceLabel}`,
    `Indicative area: ${estimate.labels.area}`,
    `Modules: ${estimate.labels.modules}`,
    `Delivery: ${estimate.labels.delivery}`,
    formState.proceedTiming ? `Looking to proceed: ${PROCEED_TIMING_OPTIONS.find((option) => option.value === formState.proceedTiming)?.label || formState.proceedTiming}` : null,
    enquiryNotes?.trim() ? `Client notes: ${enquiryNotes.trim()}` : null,
    ...parkingRuns.map((run, index) => `Run ${String.fromCharCode(65 + index)}: ${run.parkingCount * (run.length === 12 ? 2 : 1)} spaces · ${run.length === 12 ? "double-sided butterfly" : "single-sided"}`),
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
  const [parkingRuns, setParkingRuns] = useState(() => [{
    id: "run-1",
    width: defaultWidth,
    length: defaultLength,
    parkingCount: defaultWidth / ATLAS_SOLAR_CARPORT_PARKING_WIDTH_METRES,
    moduleCount: calculateEstimatedPanelCount(defaultWidth, defaultLength),
  }])
  const [selectedRunId, setSelectedRunId] = useState("run-1")
  const [planLoaded, setPlanLoaded] = useState(false)
  const [saveStatus, setSaveStatus] = useState("Loading saved plan...")
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
        parkingRuns,
      }),
    [formState, parkingRuns]
  )
  const livePricing = useSolarCarportEstimate(unpricedEstimate.input)
  const estimate = livePricing.estimate || unpricedEstimate
  const priceLabel = estimate.meta.pricingReady ? formatCurrency(estimate.pricing.estimatedTotal) : livePricing.error ? 'Price on request' : 'Loading price…'
  const selectedRun = parkingRuns.find((run) => run.id === selectedRunId) || parkingRuns[0]
  const selectedParkingCount = selectedRun?.parkingCount || 2
  const totalParkingSpaces = parkingRuns.reduce((sum, run) => sum + run.parkingCount * (run.length === 12 ? 2 : 1), 0)
  const totalPanelCapacity = parkingRuns.reduce((sum, run) => sum + run.moduleCount, 0)
  const estimatedPowerKwp = totalPanelCapacity * DEFAULT_SOLAR_PANEL_WATTAGE / 1000
  const siteWidth = Math.max(...parkingRuns.map((run) => run.width))
  const siteDepth = parkingRuns.reduce((sum, run) => sum + run.length, 0)
    + Math.max(0, parkingRuns.length - 1) * PARKING_RUN_CLEARANCE_METRES

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(SOLAR_CARPORT_PLAN_STORAGE_KEY) || "null")
      if (Array.isArray(saved?.parkingRuns) && saved.parkingRuns.length > 0) {
        const validRuns = saved.parkingRuns
          .filter((run) =>
            SOLAR_CARPORT_WIDTH_OPTIONS.some((option) => option.width === Number(run.width))
            && SOLAR_CARPORT_LENGTH_OPTIONS.some((option) => option.value === Number(run.length))
          )
          .map((run) => ({
            ...run,
            moduleCount: calculateEstimatedPanelCount(Number(run.width), Number(run.length)),
          }))
        if (validRuns.length > 0) {
          setParkingRuns(validRuns)
          const run = validRuns.find((item) => item.id === saved.selectedRunId) || validRuns[0]
          setSelectedRunId(run.id)
          setFormState((current) => ({ ...current, width: run.width, length: run.length, moduleCount: run.moduleCount }))
        }
      }
    } catch {
      window.localStorage.removeItem(SOLAR_CARPORT_PLAN_STORAGE_KEY)
    } finally {
      setPlanLoaded(true)
      setSaveStatus("Saved on this device")
    }
  }, [])

  useEffect(() => {
    if (!planLoaded) return undefined
    setSaveStatus("Saving...")
    const timer = window.setTimeout(() => {
      window.localStorage.setItem(SOLAR_CARPORT_PLAN_STORAGE_KEY, JSON.stringify({ parkingRuns, selectedRunId }))
      setSaveStatus("Saved on this device")
    }, 350)
    return () => window.clearTimeout(timer)
  }, [parkingRuns, planLoaded, selectedRunId])

  const whatsappMessage = [
    "Hi Smart Steel, I'd like to discuss an Atlas solar carport.",
    "",
    `Layout: ${parkingRuns.length} parking run${parkingRuns.length === 1 ? "" : "s"}, ${totalParkingSpaces} spaces total`,
    ...parkingRuns.map((run, index) => `Run ${String.fromCharCode(65 + index)}: ${run.parkingCount * (run.length === 12 ? 2 : 1)} spaces, ${run.length === 12 ? "double-sided butterfly" : "single-sided"}`),
    `Estimated panel capacity: ${totalPanelCapacity} panels total`,
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
    if (field === "width" || field === "length") {
      setParkingRuns((runs) => runs.map((run) => {
        if (run.id !== selectedRunId) return run
        const next = { ...run, [field]: value }
        next.parkingCount = next.width / ATLAS_SOLAR_CARPORT_PARKING_WIDTH_METRES
        next.moduleCount = calculateEstimatedPanelCount(next.width, next.length)
        return next
      }))
    }
    setSubmitError("")
    setSubmitSuccess("")
  }

  const selectParkingRun = (run) => {
    setSelectedRunId(run.id)
    setFormState((current) => ({
      ...current,
      width: run.width,
      length: run.length,
      moduleCount: run.moduleCount,
    }))
  }

  const addParkingRun = () => {
    const width = SOLAR_CARPORT_WIDTH_OPTIONS[1].width
    const length = 6
    const nextRun = {
      id: `run-${Date.now()}`,
      width,
      length,
      parkingCount: 2,
      moduleCount: calculateEstimatedPanelCount(width, length),
    }
    setParkingRuns((runs) => [...runs, nextRun])
    selectParkingRun(nextRun)
  }

  const duplicateParkingRun = () => {
    if (!selectedRun) return
    const nextRun = { ...selectedRun, id: `run-${Date.now()}` }
    setParkingRuns((runs) => [...runs, nextRun])
    selectParkingRun(nextRun)
  }

  const removeParkingRun = (runId) => {
    if (parkingRuns.length === 1) return
    const nextRuns = parkingRuns.filter((run) => run.id !== runId)
    setParkingRuns(nextRuns)
    if (selectedRunId === runId) selectParkingRun(nextRuns[0])
  }

  const handleEnquiryChange = (field, value) => {
    setEnquiryState((current) => ({
      ...current,
      [field]: value,
    }))
    setSubmitError("")
    setSubmitSuccess("")
  }

  const resetConfiguration = () => {
    setFormState({
      width: defaultWidth,
      length: defaultLength,
      wallHeight: DEFAULT_CLEARANCE_HEIGHT,
      quantity: initialQuantity > 0 ? initialQuantity : 1,
      moduleCount: calculateEstimatedPanelCount(defaultWidth, defaultLength),
      deliveryDistance: 0,
      scope: "supply_only",
      proceedTiming: "",
    })
    setActiveStage("configure")
    setParkingRuns([{
      id: "run-1",
      width: defaultWidth,
      length: defaultLength,
      parkingCount: defaultWidth / ATLAS_SOLAR_CARPORT_PARKING_WIDTH_METRES,
      moduleCount: calculateEstimatedPanelCount(defaultWidth, defaultLength),
    }])
    setSelectedRunId("run-1")
    setShowEnquiryForm(false)
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
            priceLabel,
            parkingRuns,
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
                {parkingRuns.length} run{parkingRuns.length === 1 ? "" : "s"} · {totalParkingSpaces} spaces · {totalPanelCapacity} panels
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
            <SolarCarportPreview
              parkingCount={selectedParkingCount}
              rowLength={selectedRun?.length || 6}
              parkingRuns={parkingRuns}
              selectedRunId={selectedRunId}
              onSelectRun={(runId) => {
                const run = parkingRuns.find((item) => item.id === runId)
                if (run) selectParkingRun(run)
              }}
            />
          </div>

          <div id="solar-carport-workspace" className="min-w-0 scroll-mt-24 lg:col-span-5">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3 px-1">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Plan details</h2>
              <p className="mt-1 text-xs text-slate-500">{saveStatus}</p>
            </div>
            <button
              type="button"
              onClick={resetConfiguration}
              className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              Reset
            </button>
          </div>

          <nav aria-label="Estimator progress" className="mb-4 grid grid-cols-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
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
                className={`flex min-w-0 items-center justify-center gap-1.5 border-r border-slate-200 px-1.5 py-2.5 text-[10px] font-semibold transition last:border-r-0 sm:text-xs ${
                  activeStage === stage.id
                    ? "bg-white text-slate-900"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <span className={`grid h-4 w-4 shrink-0 place-items-center rounded-full text-[9px] ${activeStage === stage.id ? "bg-[#0043f3] text-white" : "border border-slate-300 bg-white"}`}>
                  {index + 1}
                </span>
                <span className="truncate">{stage.label}</span>
              </button>
            ))}
          </nav>

          <div className={`${activeStage === "configure" ? "block" : "hidden"} rounded-[1.6rem] border border-slate-200 bg-slate-50/80 p-4`}>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0043f3]">
              Step 1
            </p>
            <h2 className="mt-2 text-xl font-bold tracking-[-0.025em] text-[#001d2e]">
              Set the parking layout
            </h2>

            <div className="mt-6">
              <p className="text-sm font-semibold text-slate-700">How many spaces should this run cover{selectedRun?.length === 12 ? " per side" : ""}?</p>
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
                {SOLAR_CARPORT_WIDTH_OPTIONS.map((option) => {
                  const isSelected = selectedRun?.width === option.width
                  return (
                    <button
                      key={option.parkingCount}
                      type="button"
                      onClick={() => handleFieldChange("width", option.width)}
                      aria-pressed={isSelected}
                      className={`group relative min-h-[92px] min-w-[88px] flex-1 rounded-xl border px-2.5 py-3 text-center transition ${
                        isSelected
                          ? "border-[#0043f3] bg-[#0043f3] text-white shadow-[0_12px_24px_-20px_rgba(0,67,243,0.9)]"
                          : "border-[#c1d9e5] bg-[#f6f9fb] text-[#001d2e] hover:border-[#0043f3] hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1.5" aria-hidden="true">
                        <img
                          src="/car.png"
                          alt=""
                          className={`h-6 w-4 object-contain ${isSelected ? "brightness-0 invert" : ""}`}
                        />
                        <span className={`text-[10px] font-bold ${isSelected ? "text-white/70" : "text-slate-400"}`}>
                          ×{option.parkingCount}
                        </span>
                      </div>
                      <p className="mt-2 text-sm font-bold">{option.parkingCount === 1 ? "Single" : `${option.parkingCount} cars`}</p>
                      <p className={`mt-0.5 text-[11px] font-semibold ${isSelected ? "text-[#c1d9e5]" : "text-[#667b91]"}`}>{option.width}m</p>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm font-semibold text-slate-700">How should the parking run?</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {SOLAR_CARPORT_LENGTH_OPTIONS.map((option) => {
                  const isSelected = selectedRun?.length === option.value
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleFieldChange("length", option.value)}
                      aria-pressed={isSelected}
                      className={`min-h-[72px] rounded-xl border px-3 py-3 text-left transition ${
                        isSelected
                          ? "border-[#0043f3] bg-[#0043f3] text-white"
                          : "border-[#c1d9e5] bg-[#f6f9fb] text-[#001d2e] hover:border-[#0043f3] hover:bg-white"
                      }`}
                    >
                      <p className="text-sm font-bold">{option.value === 6 ? "Single row" : "Double row"}</p>
                      <p className={`mt-1 text-xs leading-4 ${isSelected ? "text-white/70" : "text-[#667b91]"}`}>
                        {option.value === 6 ? "6m · one side" : "12m · back to back"}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0043f3]">Parking runs</p>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={duplicateParkingRun} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200">Duplicate</button>
                  <button type="button" onClick={addParkingRun} className="rounded-full bg-[#0043f3] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#073c8d]">+ Add run</button>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                {parkingRuns.map((run, index) => {
                  const isSelected = run.id === selectedRunId
                  const spaces = run.parkingCount * (run.length === 12 ? 2 : 1)
                  return (
                    <div key={run.id} className={`flex items-center gap-2 rounded-xl border p-2 transition ${isSelected ? "border-[#0043f3] bg-[#edf4ff]" : "border-slate-200 bg-white"}`}>
                      <button type="button" onClick={() => selectParkingRun(run)} className="min-w-0 flex-1 px-2 py-1 text-left">
                        <span className="text-xs font-bold text-[#0043f3]">Run {String.fromCharCode(65 + index)}</span>
                        <span className="ml-2 text-sm font-semibold text-[#001d2e]">{spaces} spaces · {run.length === 12 ? "Butterfly" : "Single-sided"}</span>
                      </button>
                      <button type="button" onClick={() => removeParkingRun(run.id)} disabled={parkingRuns.length === 1} className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-400 hover:bg-white hover:text-red-600 disabled:opacity-30">Remove</button>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-[#c1d9e5] bg-white p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#0043f3]">Spaces</p>
                <p className="mt-1 text-lg font-semibold text-[#121a20]">{totalParkingSpaces}</p>
                <p className="text-xs text-[#121a20]/60">{parkingRuns.length} run{parkingRuns.length === 1 ? "" : "s"}</p>
              </div>
              <div className="rounded-xl border border-[#c1d9e5] bg-[#edf4f8] p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#0043f3]">Footprint</p>
                <p className="mt-1 text-lg font-semibold text-[#121a20]">{formatDimension(siteWidth)} × {formatDimension(siteDepth)}</p>
                <p className="text-xs text-[#121a20]/60">Includes 7.5m clear aisles</p>
              </div>
              <div className="rounded-xl border border-[#c1d9e5] bg-[#edf4f8] p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#0043f3]">Panels</p>
                <p className="mt-1 text-lg font-semibold text-[#121a20]">{totalPanelCapacity}</p>
                <p className="text-xs text-[#121a20]/60">Indicative layout</p>
              </div>
              <div className="rounded-xl border border-[#c1d9e5] bg-white p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#0043f3]">Solar capacity</p>
                <p className="mt-1 text-lg font-semibold text-[#121a20]">{estimatedPowerKwp.toFixed(1)} kWp</p>
                <p className="text-xs text-[#121a20]/60">At {DEFAULT_SOLAR_PANEL_WATTAGE}W per panel</p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-4 border-t border-[#c1d9e5] pt-5">
              <p className="text-sm font-semibold text-[#52647f]">{parkingRuns.length} run{parkingRuns.length === 1 ? "" : "s"} · ZAM steel</p>
              <button type="button" onClick={() => setActiveStage("review")} className="rounded-xl bg-[#0043f3] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#073c8d]">
                Review estimate
              </button>
            </div>
          </div>

          <div className={`${activeStage === "configure" ? "hidden" : "block"} rounded-[1.6rem] border border-slate-200 bg-slate-50/80 p-4`}>
            {activeStage === "review" ? (
            <>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0043f3]">
              Step 2
            </p>
            <h2 className="mt-2 text-xl font-bold tracking-[-0.025em] text-[#001d2e]">
              Review your starting plan
            </h2>

            <div className="mt-5 rounded-2xl border border-[#0043f3]/20 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#0043f3]">Structure-only guide</p>
                  <p className="mt-1 text-3xl font-bold tracking-[-0.04em] text-[#001d2e]">{priceLabel}</p>
                </div>
                <p className="pb-1 text-xs font-semibold text-slate-500">Excl. VAT</p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Layout</p>
                <p className="mt-1 text-sm font-semibold text-[#001d2e]">{parkingRuns.length} run{parkingRuns.length === 1 ? "" : "s"} · {totalParkingSpaces} spaces</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Footprint</p>
                <p className="mt-1 text-sm font-semibold text-[#001d2e]">{formatDimension(siteWidth)} × {formatDimension(siteDepth)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Solar</p>
                <p className="mt-1 text-sm font-semibold text-[#001d2e]">{totalPanelCapacity} panels · {estimatedPowerKwp.toFixed(1)} kWp</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Scope</p>
                <p className="mt-1 text-sm font-semibold text-[#001d2e]">{estimate.labels.scope} · ZAM</p>
              </div>
            </div>

            <p className="mt-4 text-xs leading-5 text-slate-500">Includes the configured ZAM steel structures, connection allowances, and module-support interfaces. Final foundations, delivery, and site requirements are reviewed with your enquiry.</p>

            <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={() => setActiveStage("configure")}
                className="px-2 py-2 text-sm font-semibold text-slate-500 transition hover:text-[#001d2e]"
              >
                Back to layout
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowEnquiryForm(true)
                  setActiveStage("enquire")
                }}
                className="rounded-xl bg-[#0043f3] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#073c8d]"
              >
                Request reviewed quote
              </button>
            </div>
            </>
            ) : null}

            {activeStage === "enquire" && showEnquiryForm ? (
              <form id="solar-carport-enquiry" onSubmit={handleSubmit} className="text-[#001d2e]">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0043f3]">Step 3</p>
                <h2 className="mt-2 text-xl font-bold tracking-[-0.025em] text-[#001d2e]">Request a reviewed quote</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">Send the plan to Smart Steel and we’ll confirm the site-specific scope with you.</p>

                <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-[#0043f3]/15 bg-white px-4 py-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Your saved plan</p>
                    <p className="mt-1 text-sm font-semibold text-[#001d2e]">{totalParkingSpaces} spaces · {parkingRuns.length} run{parkingRuns.length === 1 ? "" : "s"}</p>
                  </div>
                  <p className="shrink-0 text-sm font-bold text-[#0043f3]">{priceLabel}</p>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Name
                    <input
                      type="text"
                      className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900"
                      value={enquiryState.name}
                      onChange={(event) => handleEnquiryChange("name", event.target.value)}
                    />
                  </label>

                  <label className="text-sm font-semibold text-slate-700">
                    Email
                    <input
                      type="email"
                      className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900"
                      value={enquiryState.email}
                      onChange={(event) => handleEnquiryChange("email", event.target.value)}
                    />
                  </label>

                  <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
                    Phone
                    <input
                      type="text"
                      className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900"
                      value={enquiryState.phone}
                      onChange={(event) => handleEnquiryChange("phone", event.target.value)}
                    />
                  </label>

                  <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
                    How soon are you looking to proceed?
                    <select
                      className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900"
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
                      className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900"
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

                <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
                  <button type="button" onClick={() => setActiveStage("review")} className="px-2 py-2 text-sm font-semibold text-slate-500 transition hover:text-[#001d2e]">
                    Back to review
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !estimate.meta.pricingReady}
                    className="rounded-xl bg-[#0043f3] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#073c8d] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? "Sending..." : "Send to Smart Steel"}
                  </button>
                </div>
              </form>
            ) : null}
          </div>
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
