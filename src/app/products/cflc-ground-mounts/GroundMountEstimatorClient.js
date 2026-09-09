"use client"

import dynamic from "next/dynamic"
import { useMemo, useState } from "react"
import Link from "next/link"
import {
  calculateSolarEstimate,
  getGroundMountLayout,
  GROUND_MOUNT_BAY_WIDTH_METERS,
  GROUND_MOUNT_PANELS_PER_BAY,
  formatCurrency,
} from "../../../lib/estimates/solarEstimate"

const GroundMountPreview = dynamic(
  () => import("../../../components/ground-mount/GroundMountPreview"),
  {
    ssr: false,
    loading: () => <div className="h-[430px] animate-pulse rounded-[1.6rem] border border-slate-200 bg-[#edf3f7]" />,
  }
)

const SOUTH_AFRICA_PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Northern Cape",
  "Western Cape",
]

const PROCEED_TIMING_OPTIONS = [
  { value: "ready_now", label: "Ready now" },
  { value: "within_30_days", label: "Within 30 days" },
  { value: "one_to_three_months", label: "1 to 3 months" },
  { value: "just_pricing", label: "Just pricing for now" },
]

const GROUND_MOUNT_QUICK_PANEL_OPTIONS = [6, 12, 18, 24, 30]
const GROUND_MOUNT_MORE_PANEL_OPTIONS = [36, 42, 48, 54, 60]
const GROUND_MOUNT_MAX_PANELS_PER_RUN = 60

const STEP_CONFIG = [
  {
    step: 1,
    label: "Configure",
    title: "Choose your starting size",
    description: "Begin with your panel count and see the structure budget update.",
  },
  {
    step: 2,
    label: "Project",
    title: "Add project details",
    description: "Tell us where the project is and whether you want installation reviewed.",
  },
  {
    step: 3,
    label: "Enquire",
    title: "Send your enquiry",
    description: "Add your contact details and let Smart Steel pick up the next step.",
  },
]

function reportGroundMountLeadConversion() {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return

  window.gtag("event", "conversion", {
    send_to: "AW-17629050810/8i3TCP-Wv8kcELrvl9ZB",
    value: 1.0,
    currency: "ZAR",
  })
}

function formatDimension(value) {
  const rounded = Math.round(Number(value) * 10) / 10
  return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)}m`
}

function buildEstimatorNotes({ estimate, formState, enquiryNotes, runLayouts }) {
  const totalPanels = runLayouts.reduce((total, run) => total + run.requestedPanels, 0)
  const totalBays = runLayouts.reduce((total, run) => total + run.bayCount, 0)
  const lines = [
    "Solar ground mount estimator enquiry",
    `Total panel count: ${totalPanels}`,
    `Ground-mount runs: ${runLayouts.length}`,
    `Total bay count: ${totalBays}`,
    ...runLayouts.map((run, index) => `Run ${String.fromCharCode(65 + index)}: ${run.requestedPanels} panels · ${run.bayCount} bays · ${formatDimension(run.width)} x ${formatDimension(run.length)}`),
    "Scope: Supply only structure budget",
    `Estimated budget (excl. VAT): ${formatCurrency(estimate.pricing.estimatedTotal)}`,
    formState.province ? `Province: ${formState.province}` : null,
    formState.projectLocation?.trim() ? `Project location: ${formState.projectLocation.trim()}` : null,
    formState.needsInstallationReview ? "Installation required: Yes, review after enquiry" : "Installation required: Not requested yet",
    formState.proceedTiming
      ? `Looking to proceed: ${PROCEED_TIMING_OPTIONS.find((option) => option.value === formState.proceedTiming)?.label || formState.proceedTiming}`
      : null,
    formState.projectNotes?.trim() ? `Project notes: ${formState.projectNotes.trim()}` : null,
    enquiryNotes?.trim() ? `Client notes: ${enquiryNotes.trim()}` : null,
  ].filter(Boolean)

  return lines.join("\n")
}

export default function GroundMountEstimatorClient({ variant = "section" }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [groundMountRuns, setGroundMountRuns] = useState([{ id: "run-1", panelCount: 36 }])
  const [selectedRunId, setSelectedRunId] = useState("run-1")
  const [formState, setFormState] = useState({
    province: "Gauteng",
    needsInstallationReview: false,
    proceedTiming: "",
    projectLocation: "",
    projectNotes: "",
  })
  const [enquiryState, setEnquiryState] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [submitSuccess, setSubmitSuccess] = useState("")

  const runLayouts = useMemo(
    () => groundMountRuns.map((run) => ({ ...getGroundMountLayout(run.panelCount), id: run.id })),
    [groundMountRuns]
  )
  const selectedRun = groundMountRuns.find((run) => run.id === selectedRunId) || groundMountRuns[0]
  const layout = runLayouts.find((run) => run.id === selectedRun?.id) || runLayouts[0]
  const totalPanelCount = groundMountRuns.reduce((total, run) => total + run.panelCount, 0)
  const totalBayCount = runLayouts.reduce((total, run) => total + run.bayCount, 0)

  const estimate = useMemo(() => {
    const calculateRun = (runLayout) => calculateSolarEstimate({
        productType: "Solar ground mount",
        width: runLayout.width,
        length: runLayout.length,
        wallHeight: 0,
        quantity: 1,
        moduleCount: runLayout.requestedPanels,
        deliveryDistance: 0,
        scope: "supply_only",
        includeStructureLabour: false,
        includeSolarBrackets: false,
        includeTransport: false,
        transportTrips: 0,
      })
    const runEstimates = runLayouts.map(calculateRun)
    const combinedTotal = runEstimates.reduce((total, item) => total + item.pricing.estimatedTotal, 0)
    const summaryEstimate = calculateRun({ ...layout, requestedPanels: totalPanelCount })
    return {
      ...summaryEstimate,
      pricing: { ...summaryEstimate.pricing, estimatedTotal: combinedTotal },
      summary: {
        ...summaryEstimate.summary,
        estimateRequest: `${groundMountRuns.length} ground-mount run${groundMountRuns.length === 1 ? "" : "s"} · ${totalPanelCount} panels`,
      },
    }
  }, [groundMountRuns.length, layout, runLayouts, totalPanelCount])

  const isHeroVariant = variant === "hero"
  const isWorkspaceVariant = variant === "workspace"
  const activeStep = STEP_CONFIG.find((item) => item.step === currentStep) || STEP_CONFIG[0]

  const handleFieldChange = (field, value) => {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }))
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

  const updateSelectedRunPanels = (value) => {
    const panelCount = Math.max(
      GROUND_MOUNT_PANELS_PER_BAY,
      Math.min(
        GROUND_MOUNT_MAX_PANELS_PER_RUN,
        Math.round(Number(value || GROUND_MOUNT_PANELS_PER_BAY) / GROUND_MOUNT_PANELS_PER_BAY) * GROUND_MOUNT_PANELS_PER_BAY
      )
    )
    setGroundMountRuns((runs) => runs.map((run) => run.id === selectedRunId ? { ...run, panelCount } : run))
    setSubmitError("")
    setSubmitSuccess("")
  }

  const addGroundMountRun = () => {
    const id = `run-${Date.now()}`
    setGroundMountRuns((runs) => [...runs, { id, panelCount: 36 }])
    setSelectedRunId(id)
  }

  const duplicateGroundMountRun = () => {
    const id = `run-${Date.now()}`
    setGroundMountRuns((runs) => [...runs, { id, panelCount: selectedRun?.panelCount || 36 }])
    setSelectedRunId(id)
  }

  const removeGroundMountRun = (id) => {
    if (groundMountRuns.length === 1) return
    const remaining = groundMountRuns.filter((run) => run.id !== id)
    setGroundMountRuns(remaining)
    if (selectedRunId === id) setSelectedRunId(remaining[0].id)
  }

  const goNext = () => setCurrentStep((step) => Math.min(3, step + 1))
  const goBack = () => setCurrentStep((step) => Math.max(1, step - 1))
  const resetConfiguration = () => {
    setCurrentStep(1)
    setGroundMountRuns([{ id: "run-1", panelCount: 36 }])
    setSelectedRunId("run-1")
    setFormState({
      province: "Gauteng",
      needsInstallationReview: false,
      proceedTiming: "",
      projectLocation: "",
      projectNotes: "",
    })
    setEnquiryState({ name: "", email: "", phone: "", notes: "" })
    setSubmitError("")
    setSubmitSuccess("")
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

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
          lastName: "Solar Ground Mount Enquiry",
          email: enquiryState.email.trim(),
          phone: enquiryState.phone.trim(),
          lead_source: "Solar Ground Mount Estimator",
          product_type: "Solar ground mount",
          estimate_request: estimate.summary.estimateRequest,
          quote_value: estimate.pricing.estimatedTotal,
          next_action:
            "Review solar ground mount estimator enquiry, confirm panel count and site location, then send the next quote step.",
          notes: buildEstimatorNotes({
            estimate,
            formState,
            enquiryNotes: enquiryState.notes,
            runLayouts,
          }),
        }),
      })

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload?.error || "Could not save the solar ground mount enquiry.")
      }

      reportGroundMountLeadConversion()
      setSubmitSuccess(
        "Your solar ground mount enquiry has been saved. The Smart Steel team can now review it in the CRM and follow up with the next step."
      )
    } catch (error) {
      setSubmitError(error?.message || "Could not save the solar ground mount enquiry.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const continueToEnquiry = () => {
    setCurrentStep(3)
    window.setTimeout(() => {
      document.querySelector("#ground-mount-estimator")?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 0)
  }

  return (
    <div className={isWorkspaceVariant ? "mx-4 sm:mx-6 lg:mx-8" : ""}>
      {isWorkspaceVariant ? (
        <div className="sticky top-3 z-40 mt-4 hidden border border-[#001d2e]/15 bg-white/95 px-5 py-3 shadow-[0_18px_40px_-28px_rgba(0,29,46,0.85)] backdrop-blur lg:flex lg:items-center lg:justify-between lg:gap-6">
          <div className="flex min-w-0 items-center gap-5">
            <div className="min-w-0 border-r border-[#c1d9e5] pr-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0043f3]">Current configuration</p>
              <p className="mt-1 truncate text-sm font-bold text-[#001d2e]">{groundMountRuns.length} run{groundMountRuns.length === 1 ? "" : "s"} · {totalBayCount} bays · {totalPanelCount} panels</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8295b3]">Guide excl. VAT</p>
              <p className="mt-1 text-xl font-bold tracking-[-0.03em] text-[#001d2e]">{formatCurrency(estimate.pricing.estimatedTotal)}</p>
            </div>
          </div>
          <button type="button" onClick={continueToEnquiry} className="shrink-0 bg-[#0043f3] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#073c8d]">Continue with this estimate</button>
        </div>
      ) : null}

    <section
      id="ground-mount-estimator"
      className={isWorkspaceVariant
        ? "atlas-ground-mount-workspace mt-6 grid scroll-mt-24 gap-6 lg:grid-cols-12"
        : isHeroVariant ? "w-full" : "mt-8 max-w-3xl"}
    >
      {isWorkspaceVariant ? (
        <div className="min-w-0 rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:sticky lg:top-24 lg:col-span-7">
          <GroundMountPreview layouts={runLayouts} selectedRunId={selectedRunId} onSelectRun={setSelectedRunId} />
        </div>
      ) : null}
      <div className={`overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5 ${isWorkspaceVariant ? "min-w-0 lg:col-span-5" : ""}`}>
        <div className="mb-4 flex items-center justify-between gap-3 px-1">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Plan details</h2>
            <p className="mt-1 text-xs text-slate-500">Move from panel count to enquiry in three clear steps.</p>
          </div>
          <button type="button" onClick={resetConfiguration} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200">Reset</button>
        </div>

        <nav aria-label="Estimator progress" className="mb-4 grid grid-cols-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          {STEP_CONFIG.map((item) => (
            <button
              key={item.step}
              type="button"
              onClick={() => setCurrentStep(item.step)}
              className={`flex min-w-0 items-center justify-center gap-1.5 border-r border-slate-200 px-1.5 py-2.5 text-[10px] font-semibold transition last:border-r-0 sm:text-xs ${currentStep === item.step ? "bg-white text-slate-900" : "text-slate-400 hover:text-slate-600"}`}
            >
              <span className={`grid h-4 w-4 shrink-0 place-items-center rounded-full text-[9px] ${item.step <= currentStep ? "bg-[#0043f3] text-white" : "border border-slate-300 bg-white"}`}>{item.step}</span>
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="rounded-[1.6rem] border border-slate-200 bg-slate-50/80 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0043f3]">Step {currentStep}</p>
          <h2 className="mt-2 text-xl font-bold tracking-[-0.025em] text-[#001d2e]">{activeStep.title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{activeStep.description}</p>
          {currentStep === 1 ? (
            <div className="mt-5 space-y-4">
              <div>
                <p className="text-sm font-semibold text-slate-700">How many panels should this run support?</p>
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
                  {GROUND_MOUNT_QUICK_PANEL_OPTIONS.map((panelCount) => {
                    const isSelected = selectedRun?.panelCount === panelCount
                    return (
                      <button
                        key={panelCount}
                        type="button"
                        onClick={() => updateSelectedRunPanels(panelCount)}
                        aria-pressed={isSelected}
                        className={`min-h-[92px] min-w-[88px] flex-1 rounded-xl border px-2.5 py-3 text-center transition ${isSelected ? "border-[#0043f3] bg-[#0043f3] text-white shadow-[0_12px_24px_-20px_rgba(0,67,243,0.9)]" : "border-[#c1d9e5] bg-[#f6f9fb] text-[#001d2e] hover:border-[#0043f3] hover:bg-white"}`}
                      >
                        <p className={`text-[10px] font-bold uppercase tracking-[0.12em] ${isSelected ? "text-white/70" : "text-slate-400"}`}>{panelCount / GROUND_MOUNT_PANELS_PER_BAY} bay{panelCount === 6 ? "" : "s"}</p>
                        <p className="mt-2 text-sm font-bold">{panelCount} panels</p>
                        <p className={`mt-0.5 text-[11px] font-semibold ${isSelected ? "text-[#c1d9e5]" : "text-[#667b91]"}`}>{formatDimension((panelCount / GROUND_MOUNT_PANELS_PER_BAY) * GROUND_MOUNT_BAY_WIDTH_METERS)} wide</p>
                      </button>
                    )
                  })}
                </div>
                <label className="mt-3 block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                  More sizes
                  <select
                    value={GROUND_MOUNT_MORE_PANEL_OPTIONS.includes(selectedRun?.panelCount) ? selectedRun.panelCount : ""}
                    onChange={(event) => event.target.value && updateSelectedRunPanels(event.target.value)}
                    className="mt-1.5 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold normal-case tracking-normal text-[#001d2e]"
                  >
                    <option value="">Choose 36 to 60 panels</option>
                    {GROUND_MOUNT_MORE_PANEL_OPTIONS.map((panelCount) => (
                      <option key={panelCount} value={panelCount}>{panelCount} panels · {panelCount / GROUND_MOUNT_PANELS_PER_BAY} bays · {formatDimension((panelCount / GROUND_MOUNT_PANELS_PER_BAY) * GROUND_MOUNT_BAY_WIDTH_METERS)} wide</option>
                    ))}
                  </select>
                </label>
              </div>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0043f3]">Ground-mount runs</p>
                  <div className="flex gap-2">
                    <button type="button" onClick={duplicateGroundMountRun} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200">Duplicate</button>
                    <button type="button" onClick={addGroundMountRun} className="rounded-full bg-[#0043f3] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#073c8d]">+ Add run</button>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  {groundMountRuns.map((run, index) => (
                    <div key={run.id} className={`flex items-center gap-2 rounded-xl border p-2 ${run.id === selectedRunId ? "border-[#0043f3] bg-[#edf4ff]" : "border-slate-200 bg-white"}`}>
                      <button type="button" onClick={() => setSelectedRunId(run.id)} className="min-w-0 flex-1 px-2 py-1 text-left">
                        <span className="text-xs font-bold text-[#0043f3]">Run {String.fromCharCode(65 + index)}</span>
                        <span className="ml-2 text-sm font-semibold text-[#001d2e]">{run.panelCount} panels · {run.panelCount / GROUND_MOUNT_PANELS_PER_BAY} bays</span>
                      </button>
                      <button type="button" disabled={groundMountRuns.length === 1} onClick={() => removeGroundMountRun(run.id)} className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-400 hover:bg-white hover:text-red-600 disabled:opacity-30">Remove</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-[#0043f3]/15 bg-white px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Estimate basis
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">Supply only structure budget</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Each run expands in six-panel bays. Installation is reviewed after enquiry because site conditions, access, and location
                  affect the final install price too much for a clean instant estimate.
                </p>
              </div>
            </div>
          ) : null}

          {currentStep === 2 ? (
            <div className="mt-5 space-y-4">
              <label className="block text-sm font-semibold text-slate-700">
                Province
                <select
                  className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-[#001d2e] outline-none focus:border-[#0043f3]"
                  value={formState.province}
                  onChange={(event) => handleFieldChange("province", event.target.value)}
                >
                  {SOUTH_AFRICA_PROVINCES.map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Project location
                <input
                  type="text"
                  placeholder="Town, city, or site location"
                  className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-[#001d2e] outline-none focus:border-[#0043f3]"
                  value={formState.projectLocation}
                  onChange={(event) => handleFieldChange("projectLocation", event.target.value)}
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Project notes
                <textarea
                  rows={3}
                  placeholder="Add any useful site notes or project requirements."
                  className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-[#001d2e] outline-none focus:border-[#0043f3]"
                  value={formState.projectNotes}
                  onChange={(event) => handleFieldChange("projectNotes", event.target.value)}
                />
              </label>

              <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-4">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 border-slate-300 text-[#0043f3] focus:ring-[#0043f3]"
                  checked={formState.needsInstallationReview}
                  onChange={(event) => handleFieldChange("needsInstallationReview", event.target.checked)}
                />
                <span>
                  <span className="block text-sm font-semibold text-slate-900">
                    I also need installation pricing
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-slate-600">
                    We will review installation after enquiry once we understand the site access,
                    foundations, and delivery conditions.
                  </span>
                </span>
              </label>
            </div>
          ) : null}

          {currentStep === 3 ? (
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold text-slate-700">
                  Name
                  <input
                    type="text"
                    className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-[#001d2e] outline-none focus:border-[#0043f3]"
                    value={enquiryState.name}
                    onChange={(event) => handleEnquiryChange("name", event.target.value)}
                  />
                </label>

                <label className="text-sm font-semibold text-slate-700">
                  Email
                  <input
                    type="email"
                    className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-[#001d2e] outline-none focus:border-[#0043f3]"
                    value={enquiryState.email}
                    onChange={(event) => handleEnquiryChange("email", event.target.value)}
                  />
                </label>
              </div>

              <label className="block text-sm font-semibold text-slate-700">
                Phone
                <input
                  type="text"
                  className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-[#001d2e] outline-none focus:border-[#0043f3]"
                  value={enquiryState.phone}
                  onChange={(event) => handleEnquiryChange("phone", event.target.value)}
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                How soon are you looking to proceed?
                <select
                  className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-[#001d2e] outline-none focus:border-[#0043f3]"
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

              <label className="block text-sm font-semibold text-slate-700">
                Anything else we should know?
                <textarea
                  rows={3}
                  className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-[#001d2e] outline-none focus:border-[#0043f3]"
                  value={enquiryState.notes}
                  onChange={(event) => handleEnquiryChange("notes", event.target.value)}
                />
              </label>

              {submitError ? <p className="text-sm font-medium text-red-600">{submitError}</p> : null}
              {submitSuccess ? <p className="text-sm font-medium text-green-700">{submitSuccess}</p> : null}

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={goBack}
                  className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:bg-white"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-[#0043f3] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#073c8d] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Saving enquiry..." : "Send enquiry"}
                </button>
              </div>
            </form>
          ) : null}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-[#0043f3]/20 bg-white px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#0043f3]">
              Indicative budget
            </p>
            <p className="mt-1 text-xl font-bold tracking-[-0.03em] text-[#001d2e]">
              {formatCurrency(estimate.pricing.estimatedTotal)}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">Excl. VAT · structure only</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-[#edf4f8] px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#0043f3]">
              Current plan
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {totalPanelCount} panels · {groundMountRuns.length} run{groundMountRuns.length === 1 ? "" : "s"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {runLayouts.reduce((total, run) => total + run.bayCount, 0)} bays total{formState.province ? ` · ${formState.province}` : ""}
            </p>
          </div>
        </div>

        {currentStep < 3 ? (
          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-200 pt-4">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={goBack}
                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Back
              </button>
            ) : null}
            <button
              type="button"
              onClick={goNext}
              className="rounded-xl bg-[#0043f3] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#073c8d]"
            >
              Next
            </button>
            <Link
              href="/contact"
              className="rounded-xl px-2 py-3 text-sm font-semibold text-slate-500 transition hover:text-[#001d2e]"
            >
              Talk to Smart Steel
            </Link>
          </div>
        ) : null}
      </div>
    </section>

      {isWorkspaceVariant ? (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[#121a20]/15 bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_28px_-24px_rgba(18,26,32,0.7)] backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#0043f3]">Current guide</p>
              <p className="mt-0.5 truncate text-lg font-semibold tracking-[-0.03em] text-[#121a20]">{formatCurrency(estimate.pricing.estimatedTotal)}<span className="ml-1 text-xs font-medium tracking-normal text-[#121a20]/55">excl. VAT</span></p>
              <p className="truncate text-[10px] font-medium text-slate-500">{groundMountRuns.length} run{groundMountRuns.length === 1 ? "" : "s"} · {totalPanelCount} panels</p>
            </div>
            <button type="button" onClick={continueToEnquiry} className="shrink-0 bg-[#0043f3] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#073c8d]">Continue</button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
