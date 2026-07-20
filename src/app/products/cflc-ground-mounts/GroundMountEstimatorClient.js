"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  calculateSolarEstimate,
  getGroundMountLayout,
  GROUND_MOUNT_PANELS_PER_BAY,
  formatCurrency,
} from "../../../lib/estimates/solarEstimate"

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

const STEP_CONFIG = [
  {
    step: 1,
    label: "Step 1 of 3",
    title: "Choose your starting size",
    description: "Begin with your panel count and see the structure budget update.",
  },
  {
    step: 2,
    label: "Step 2 of 3",
    title: "Add project details",
    description: "Tell us where the project is and whether you want installation reviewed.",
  },
  {
    step: 3,
    label: "Step 3 of 3",
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
  return `${Number(value)}m`
}

function buildEstimatorNotes({ estimate, formState, enquiryNotes, layout }) {
  const lines = [
    "Solar ground mount estimator enquiry",
    `Requested panel count: ${formState.panelCount}`,
    `Priced panel count: ${layout.pricedPanelCount}`,
    `Bay count: ${layout.bayCount}`,
    `Indicative layout: ${formatDimension(layout.width)} x ${formatDimension(layout.length)}`,
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
  const [formState, setFormState] = useState({
    panelCount: 36,
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

  const layout = useMemo(() => getGroundMountLayout(formState.panelCount), [formState.panelCount])

  const estimate = useMemo(
    () =>
      calculateSolarEstimate({
        productType: "Solar ground mount",
        width: layout.width,
        length: layout.length,
        wallHeight: 0,
        quantity: 1,
        moduleCount: formState.panelCount,
        deliveryDistance: 0,
        scope: "supply_only",
        includeStructureLabour: false,
        includeSolarBrackets: false,
        includeTransport: false,
        transportTrips: 0,
      }),
    [formState.panelCount, layout.length, layout.width]
  )

  const isHeroVariant = variant === "hero"
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

  const goNext = () => setCurrentStep((step) => Math.min(3, step + 1))
  const goBack = () => setCurrentStep((step) => Math.max(1, step - 1))

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
            layout,
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

  return (
    <section
      id="ground-mount-estimator"
      className={isHeroVariant ? "w-full" : "mt-8 max-w-3xl"}
    >
      <div className="border border-[#121a20]/20 bg-white p-5 shadow-[0_24px_50px_-42px_rgba(18,26,32,0.8)] sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#1c5b57]">
              {isHeroVariant ? "Build and Price Online" : "Instant Estimator"}
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">{activeStep.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{activeStep.description}</p>
          </div>
          <div className="shrink-0 border border-[#121a20]/15 bg-[#f3f0e9] px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#121a20]/70">
            {activeStep.label}
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          {STEP_CONFIG.map((item) => (
            <div
              key={item.step}
              className={`h-1 flex-1 ${
                item.step <= currentStep ? "bg-[#d9a441]" : "bg-[#121a20]/10"
              }`}
            />
          ))}
        </div>

        <div className="mt-6 border border-[#121a20]/12 bg-[#f3f0e9]/65 p-5">
          {currentStep === 1 ? (
            <div className="space-y-5">
              <label className="block text-sm font-semibold text-slate-700">
                Number of solar panels
                <input
                  type="number"
                  min="1"
                  step="1"
                  className="mt-2 block w-full border border-[#121a20]/25 bg-white px-4 py-3 text-base font-semibold text-[#121a20] outline-none transition focus:border-[#1c5b57] focus:ring-2 focus:ring-[#1c5b57]/15"
                  value={formState.panelCount}
                  onChange={(event) =>
                    handleFieldChange("panelCount", Math.max(1, Number(event.target.value) || 1))
                  }
                />
              </label>

              <div className="border-l-2 border-[#d9a441] bg-white px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Estimate basis
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">Supply only structure budget</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Installation is reviewed after enquiry because site conditions, access, and location
                  affect the final install price too much for a clean instant estimate.
                </p>
              </div>
            </div>
          ) : null}

          {currentStep === 2 ? (
            <div className="space-y-5">
              <label className="block text-sm font-semibold text-slate-700">
                Province
                <select
                  className="mt-2 block w-full border border-[#121a20]/25 bg-white px-4 py-3 text-sm font-medium text-[#121a20] outline-none focus:border-[#1c5b57]"
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
                  className="mt-2 block w-full border border-[#121a20]/25 bg-white px-4 py-3 text-sm font-medium text-[#121a20] outline-none focus:border-[#1c5b57]"
                  value={formState.projectLocation}
                  onChange={(event) => handleFieldChange("projectLocation", event.target.value)}
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Project notes
                <textarea
                  rows={3}
                  placeholder="Add any useful site notes or project requirements."
                  className="mt-2 block w-full border border-[#121a20]/25 bg-white px-4 py-3 text-sm font-medium text-[#121a20] outline-none focus:border-[#1c5b57]"
                  value={formState.projectNotes}
                  onChange={(event) => handleFieldChange("projectNotes", event.target.value)}
                />
              </label>

              <label className="flex items-start gap-3 border border-[#121a20]/15 bg-white px-4 py-4">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 border-slate-300 text-[#1c5b57] focus:ring-[#1c5b57]"
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
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold text-slate-700">
                  Name
                  <input
                    type="text"
                    className="mt-2 block w-full border border-[#121a20]/25 bg-white px-4 py-3 text-sm font-medium text-[#121a20] outline-none focus:border-[#1c5b57]"
                    value={enquiryState.name}
                    onChange={(event) => handleEnquiryChange("name", event.target.value)}
                  />
                </label>

                <label className="text-sm font-semibold text-slate-700">
                  Email
                  <input
                    type="email"
                    className="mt-2 block w-full border border-[#121a20]/25 bg-white px-4 py-3 text-sm font-medium text-[#121a20] outline-none focus:border-[#1c5b57]"
                    value={enquiryState.email}
                    onChange={(event) => handleEnquiryChange("email", event.target.value)}
                  />
                </label>
              </div>

              <label className="block text-sm font-semibold text-slate-700">
                Phone
                <input
                  type="text"
                  className="mt-2 block w-full border border-[#121a20]/25 bg-white px-4 py-3 text-sm font-medium text-[#121a20] outline-none focus:border-[#1c5b57]"
                  value={enquiryState.phone}
                  onChange={(event) => handleEnquiryChange("phone", event.target.value)}
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                How soon are you looking to proceed?
                <select
                  className="mt-2 block w-full border border-[#121a20]/25 bg-white px-4 py-3 text-sm font-medium text-[#121a20] outline-none focus:border-[#1c5b57]"
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
                  className="mt-2 block w-full border border-[#121a20]/25 bg-white px-4 py-3 text-sm font-medium text-[#121a20] outline-none focus:border-[#1c5b57]"
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
                  className="border border-[#121a20]/25 px-6 py-3 text-sm font-semibold transition hover:border-[#121a20] hover:bg-white"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#d9a441] px-6 py-3 text-sm font-semibold text-[#121a20] transition hover:bg-[#ebbd5f] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Saving enquiry..." : "Send enquiry"}
                </button>
              </div>
            </form>
          ) : null}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="border border-[#121a20]/15 bg-[#121a20] px-4 py-4 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Indicative budget
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {formatCurrency(estimate.pricing.estimatedTotal)}
            </p>
            <p className="mt-1 text-xs text-white/60">Excl. VAT · structure only</p>
          </div>
          <div className="border border-[#121a20]/15 bg-white px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Current plan
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {layout.requestedPanels} panels · {layout.bayCount} bay{layout.bayCount === 1 ? "" : "s"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {formatDimension(layout.width)} x {formatDimension(layout.length)}{formState.province ? ` · ${formState.province}` : ""}
            </p>
          </div>
        </div>

        {currentStep < 3 ? (
          <div className="mt-6 flex flex-wrap gap-3">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={goBack}
                className="border border-[#121a20]/25 px-6 py-3 text-sm font-semibold transition hover:border-[#121a20] hover:bg-white"
              >
                Back
              </button>
            ) : null}
            <button
              type="button"
              onClick={goNext}
              className="bg-[#d9a441] px-6 py-3 text-sm font-semibold text-[#121a20] transition hover:bg-[#ebbd5f]"
            >
              Next
            </button>
            <Link
              href="/contact"
              className="border border-[#121a20]/25 px-6 py-3 text-sm font-semibold transition hover:border-[#121a20] hover:bg-white"
            >
              Talk to Smart Steel
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  )
}
