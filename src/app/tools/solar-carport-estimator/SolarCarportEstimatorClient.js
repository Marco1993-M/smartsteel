"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { calculateSolarEstimate, formatCurrency, SOLAR_SCOPE_OPTIONS } from "../../../lib/estimates/solarEstimate"

const DEFAULT_CLEARANCE_HEIGHT = 2.4
const DEFAULT_SOLAR_PANEL_WATTAGE = 550
const DEFAULT_SOLAR_PANEL_LENGTH_METERS = 2.278
const DEFAULT_SOLAR_PANEL_WIDTH_METERS = 1.134
const SOLAR_CARPORT_WIDTH_OPTIONS = Array.from({ length: 20 }, (_, index) => {
  const parkingCount = index + 1
  const width = parkingCount === 1 ? 3 : 5 + (parkingCount - 2) * 2.5
  return {
    parkingCount,
    width,
    label:
      parkingCount === 1
        ? "Single Parking (3m)"
        : parkingCount === 2
          ? "Double Parking (5m)"
          : `${parkingCount} Parking Bays (${width}m)`,
  }
})
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
    `Estimated budget (excl. VAT): ${formatCurrency(estimate.pricing.estimatedTotal)}`,
    `Indicative area: ${estimate.labels.area}`,
    `Modules: ${estimate.labels.modules}`,
    `Delivery: ${estimate.labels.delivery}`,
    formState.proceedTiming ? `Looking to proceed: ${PROCEED_TIMING_OPTIONS.find((option) => option.value === formState.proceedTiming)?.label || formState.proceedTiming}` : null,
    formState.projectNotes?.trim() ? `Project notes: ${formState.projectNotes.trim()}` : null,
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
  const initialDeliveryDistance = Number(initialInput.deliveryDistance)
  const initialScope = initialInput.scope
  const defaultWidth = SOLAR_CARPORT_WIDTH_OPTIONS.some((option) => option.width === initialWidth)
    ? initialWidth
    : 5
  const defaultLength = SOLAR_CARPORT_LENGTH_OPTIONS.some((option) => option.value === initialLength)
    ? initialLength
    : 6
  const [formState, setFormState] = useState({
    width: defaultWidth,
    length: defaultLength,
    wallHeight: DEFAULT_CLEARANCE_HEIGHT,
    quantity: initialQuantity > 0 ? initialQuantity : 1,
    moduleCount: calculateEstimatedPanelCount(defaultWidth, defaultLength),
    deliveryDistance: initialDeliveryDistance >= 0 ? initialDeliveryDistance : 0,
    scope: SOLAR_SCOPE_OPTIONS.some((option) => option.value === initialScope)
      ? initialScope
      : "supply_only",
    proceedTiming: "",
    projectNotes: "",
  })
  const [showEnquiryForm, setShowEnquiryForm] = useState(false)
  const [enquiryState, setEnquiryState] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [submitSuccess, setSubmitSuccess] = useState("")

  const estimate = useMemo(
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
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc,_#ffffff_30%,_#fff7f5)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-[2.25rem] border border-slate-200 bg-white px-6 py-10 shadow-sm sm:px-8 lg:px-10">
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#da1a33]">
              Solar Carport Estimator
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Estimate a solar carport before you enquire
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
              Get a clearer starting budget for a Smart Steel solar carport before you speak to the
              team. If the estimate looks right, you can send your details through for the next
              step and the enquiry will be saved in our CRM.
            </p>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
              Your Details
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              Choose the main solar carport details
            </h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold text-slate-700">
                Parking size
                <select
                  className="mt-2 block w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900"
                  value={formState.width}
                  onChange={(event) => handleFieldChange("width", Number(event.target.value))}
                >
                  {SOLAR_CARPORT_WIDTH_OPTIONS.map((option) => (
                    <option key={option.parkingCount} value={option.width}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-semibold text-slate-700">
                Parking layout
                <select
                  className="mt-2 block w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900"
                  value={formState.length}
                  onChange={(event) => handleFieldChange("length", Number(event.target.value))}
                >
                  {SOLAR_CARPORT_LENGTH_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-semibold text-slate-700">
                Number of structures
                <input
                  type="number"
                  min="1"
                  step="1"
                  className="mt-2 block w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900"
                  value={formState.quantity}
                  onChange={(event) =>
                    handleFieldChange("quantity", Math.max(1, Number(event.target.value) || 1))
                  }
                />
              </label>

              <label className="text-sm font-semibold text-slate-700">
                Estimated solar panels per structure
                <div className="mt-2 rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-900">{formState.moduleCount} panels</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Based on a standard {DEFAULT_SOLAR_PANEL_WATTAGE}W panel layout.
                  </p>
                </div>
              </label>

              <label className="text-sm font-semibold text-slate-700">
                Delivery distance (km)
                <input
                  type="number"
                  min="0"
                  step="1"
                  className="mt-2 block w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900"
                  value={formState.deliveryDistance}
                  onChange={(event) =>
                    handleFieldChange("deliveryDistance", Math.max(0, Number(event.target.value) || 0))
                  }
                />
              </label>
            </div>

            <label className="mt-4 block text-sm font-semibold text-slate-700">
              Project notes
              <textarea
                rows={4}
                placeholder="Add any useful notes, site details, or special requirements."
                className="mt-2 block w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900"
                value={formState.projectNotes}
                onChange={(event) => handleFieldChange("projectNotes", event.target.value)}
              />
            </label>

            <div className="mt-4">
              <p className="text-sm font-semibold text-slate-700">Scope</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {SOLAR_SCOPE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleFieldChange("scope", option.value)}
                    className={`rounded-2xl border px-4 py-4 text-left text-sm font-semibold transition ${
                      formState.scope === option.value
                        ? "border-slate-950 bg-slate-950 text-white"
                        : "border-slate-300 bg-white text-slate-900 hover:border-slate-500"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
              This estimate is a starting point. Final pricing still depends on layout, structural
              detailing, foundations, solar scope, and site conditions. A minimum clearance height
              of 2.4m is included as standard. Estimated panel quantities are based on a standard{" "}
              {DEFAULT_SOLAR_PANEL_WATTAGE}W panel layout.
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
              Estimate
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              Your estimated solar carport budget
            </h2>

            <div className="mt-6 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-950 text-white">
              <div className="px-6 py-6">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
                  Indicative budget
                </p>
                <p className="mt-3 text-4xl font-semibold">
                  {formatCurrency(estimate.pricing.estimatedTotal)}
                </p>
                <p className="mt-2 text-sm text-slate-300">
                  Excl. VAT
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Size
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {formatDimension(formState.width)} x {formatDimension(formState.length)}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Structures
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{formState.quantity}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Solar panels
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{estimate.labels.modules}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Scope
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{estimate.labels.scope}</p>
              </div>
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-white p-5">
              <p className="text-sm font-semibold text-slate-900">Included in this estimate</p>
              <div className="mt-4 space-y-3">
                {estimate.lineItems.map((item) => (
                  <div key={item.code} className="flex items-start gap-3 text-sm">
                    <span className="mt-1 h-2 w-2 rounded-full bg-[#da1a33]" />
                    <p className="font-medium text-slate-900">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setShowEnquiryForm((current) => !current)}
                className="rounded-full bg-[#da1a33] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#bf172d]"
              >
                {showEnquiryForm ? "Hide contact form" : "Continue with this estimate"}
              </button>
              <Link
                href="/solar"
                className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Back to solar page
              </Link>
            </div>

            {showEnquiryForm ? (
              <form onSubmit={handleSubmit} className="mt-8 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6">
                <h3 className="text-lg font-semibold text-slate-950">
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
                      className="mt-2 block w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900"
                      value={enquiryState.name}
                      onChange={(event) => handleEnquiryChange("name", event.target.value)}
                    />
                  </label>

                  <label className="text-sm font-semibold text-slate-700">
                    Email
                    <input
                      type="email"
                      className="mt-2 block w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900"
                      value={enquiryState.email}
                      onChange={(event) => handleEnquiryChange("email", event.target.value)}
                    />
                  </label>

                  <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
                    Phone
                    <input
                      type="text"
                      className="mt-2 block w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900"
                      value={enquiryState.phone}
                      onChange={(event) => handleEnquiryChange("phone", event.target.value)}
                    />
                  </label>

                  <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
                    How soon are you looking to proceed?
                    <select
                      className="mt-2 block w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900"
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
                      className="mt-2 block w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900"
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
                    disabled={isSubmitting}
                    className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? "Saving enquiry..." : "Send enquiry"}
                  </button>
                </div>
              </form>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  )
}
