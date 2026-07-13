"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { calculateSolarEstimate, formatCurrency } from "../../../lib/estimates/solarEstimate"

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
const QUICK_PARKING_OPTIONS = SOLAR_CARPORT_WIDTH_OPTIONS.filter((option) => option.parkingCount <= 4)
const EXTENDED_PARKING_OPTIONS = SOLAR_CARPORT_WIDTH_OPTIONS.filter((option) => option.parkingCount > 4)
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
    deliveryDistance: 0,
    scope: "supply_only",
    proceedTiming: "",
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
    <main className="min-h-screen bg-[linear-gradient(180deg,#ffffff_0%,#ffffff_7rem,#f3f0e9_17rem,#f3f0e9_100%)] px-4 pb-10 pt-24 text-[#121a20] sm:px-6 sm:pt-28 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <section className="border border-[#121a20]/15 bg-[linear-gradient(145deg,#ffffff_0%,#faf9f5_50%,#ebe8dd_100%)] px-6 py-10 shadow-sm sm:px-8 lg:px-10">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center border border-[#d9a441] font-mono text-sm font-semibold text-[#1c5b57]">A</span>
              <div>
                <p className="text-sm font-semibold tracking-[0.2em]">ATLAS SYSTEM</p>
                <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#121a20]/55">Developed by Smart Steel</p>
              </div>
            </div>
            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.24em] text-[#1c5b57]">
              Atlas Solar Carport Estimator
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-[#121a20] sm:text-5xl">
              Price your Atlas solar carport before you enquire.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-[#121a20]/70 sm:text-lg">
              Choose the parking layout and see a practical structure-only starting budget immediately. No contact details are needed until you decide to continue.
            </p>
            <Link
              href="/products"
              className="mt-5 inline-flex border-b border-[#1c5b57]/35 pb-1 text-sm font-semibold text-[#1c5b57] transition hover:border-[#1c5b57] hover:text-[#121a20]"
            >
              Explore all Smart Steel products
            </Link>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#1c5b57]">
              Step 1: Your starting layout
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              Choose the parking layout
            </h2>

            <div className="mt-6">
              <p className="text-sm font-semibold text-slate-700">How many parking bays do you need?</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {QUICK_PARKING_OPTIONS.map((option) => {
                  const isSelected = formState.width === option.width
                  return (
                    <button
                      key={option.parkingCount}
                      type="button"
                      onClick={() => handleFieldChange("width", option.width)}
                      className={`min-h-[104px] border p-4 text-left transition ${
                        isSelected
                          ? "border-[#1c5b57] bg-[#1c5b57] text-[#f3f0e9] shadow-[0_16px_30px_-24px_rgba(18,26,32,0.8)]"
                          : "border-slate-200 bg-[#f7f8f7] text-[#121a20] hover:border-[#1c5b57]"
                      }`}
                    >
                      <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${isSelected ? "text-[#d9a441]" : "text-[#1c5b57]"}`}>{option.parkingCount === 1 ? "Single" : option.parkingCount === 2 ? "Double" : `${option.parkingCount} bays`}</p>
                      <p className="mt-3 text-xl font-semibold">{option.width}m wide</p>
                    </button>
                  )
                })}
              </div>
              <label className="mt-4 block text-sm font-semibold text-slate-700">
                Need more parking bays?
                <select
                  className="mt-2 block w-full border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900"
                  value={EXTENDED_PARKING_OPTIONS.some((option) => option.width === formState.width) ? formState.width : ""}
                  onChange={(event) => {
                    if (event.target.value) handleFieldChange("width", Number(event.target.value))
                  }}
                >
                  <option value="">Choose 5 to 20 parking bays</option>
                  {EXTENDED_PARKING_OPTIONS.map((option) => (
                    <option key={option.parkingCount} value={option.width}>{option.label}</option>
                  ))}
                </select>
              </label>
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
                          ? "border-[#1c5b57] bg-[#1c5b57] text-[#f3f0e9]"
                          : "border-slate-200 bg-[#f7f8f7] text-[#121a20] hover:border-[#1c5b57]"
                      }`}
                    >
                      <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${isSelected ? "text-[#d9a441]" : "text-[#1c5b57]"}`}>{option.label}</p>
                      <p className="mt-2 text-sm leading-5 opacity-75">{option.value === 6 ? "One practical parking row" : "Parking on both sides of the structure"}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-[0.8fr_1.2fr]">
              <div className="border border-slate-200 bg-white p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1c5b57]">Structures</p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <button type="button" onClick={() => handleFieldChange("quantity", Math.max(1, formState.quantity - 1))} className="grid h-9 w-9 place-items-center rounded-full border border-slate-300 text-lg font-semibold text-[#121a20] transition hover:border-[#1c5b57]" aria-label="Remove structure">-</button>
                  <p className="text-lg font-semibold">{formState.quantity}</p>
                  <button type="button" onClick={() => handleFieldChange("quantity", formState.quantity + 1)} className="grid h-9 w-9 place-items-center rounded-full border border-slate-300 text-lg font-semibold text-[#121a20] transition hover:border-[#1c5b57]" aria-label="Add structure">+</button>
                </div>
              </div>
              <div className="border border-[#1c5b57]/20 bg-[#eaf3f1] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1c5b57]">Estimated solar capacity</p>
                <p className="mt-2 text-lg font-semibold text-[#121a20]">{formState.moduleCount} panels per structure</p>
                <p className="mt-1 text-xs leading-5 text-[#121a20]/60">Based on a standard {DEFAULT_SOLAR_PANEL_WATTAGE}W panel layout.</p>
              </div>
            </div>

            <div className="mt-6 border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
              This is a structure-only starting guide. Delivery, foundations, installation, electrical scope, and site conditions are reviewed properly after enquiry. A minimum clearance height of 2.4m is included as standard. Estimated panel quantities are based on a standard {DEFAULT_SOLAR_PANEL_WATTAGE}W panel layout.
            </div>
          </div>

          <div className="border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#1c5b57]">
              Step 2: Your starting budget
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              Your Atlas solar carport estimate
            </h2>

            <div className="mt-6 overflow-hidden border border-[#121a20] bg-[#121a20] text-white">
              <div className="px-6 py-6">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#d9a441]">
                  Structure-only starting budget
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
              <div className="border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Size
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {formatDimension(formState.width)} x {formatDimension(formState.length)}
                </p>
              </div>
              <div className="border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Structures
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{formState.quantity}</p>
              </div>
              <div className="border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Solar panels
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{estimate.labels.modules}</p>
              </div>
              <div className="border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Estimate scope
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{estimate.labels.scope}</p>
              </div>
            </div>

            <div className="mt-6 border border-slate-200 bg-white p-5">
              <p className="text-sm font-semibold text-slate-900">Included in this estimate</p>
              <div className="mt-4 space-y-3">
                {estimate.lineItems.map((item) => (
                  <div key={item.code} className="flex items-start gap-3 text-sm">
                    <span className="mt-1 h-2 w-2 rounded-full bg-[#1c5b57]" />
                    <p className="font-medium text-slate-900">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setShowEnquiryForm((current) => !current)}
                className="rounded-full bg-[#d9a441] px-6 py-3 text-sm font-semibold text-[#121a20] transition hover:bg-[#ebbd5f]"
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
              <form onSubmit={handleSubmit} className="mt-8 border border-slate-200 bg-slate-50 p-6">
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

        <section className="grid gap-8 border-t border-[#121a20]/15 py-14 sm:py-18 lg:grid-cols-[0.8fr_1.2fr] lg:py-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#1c5b57]">
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
              className="mt-6 inline-flex border-b border-[#1c5b57]/35 pb-1 text-sm font-semibold text-[#1c5b57] transition hover:border-[#1c5b57] hover:text-[#121a20]"
            >
              Learn more about Atlas solar carports
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
