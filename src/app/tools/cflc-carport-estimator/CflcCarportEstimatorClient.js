"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  calculateCflcCarportEstimate,
  CFLC_CARPORT_SIZE_OPTIONS,
} from "../../../lib/estimates/cflcCarportEstimate"
import { formatCurrency } from "../../../lib/estimates/warehouseEstimate"

function buildEstimatorNotes({ estimate, formState, enquiryNotes }) {
  const lines = [
    "CFLC carport estimator enquiry",
    `Size: ${estimate.labels.size}`,
    `Quantity: ${formState.quantity}`,
    `Estimated budget (incl. VAT): ${formatCurrency(estimate.pricing.totalInclVat)}`,
    `Delivery: ${estimate.labels.delivery}`,
    formState.projectNotes?.trim() ? `Project notes: ${formState.projectNotes.trim()}` : null,
    enquiryNotes?.trim() ? `Client notes: ${enquiryNotes.trim()}` : null,
  ].filter(Boolean)

  return lines.join("\n")
}

export default function CflcCarportEstimatorClient({ initialInput = {} }) {
  const initialQuantity = Number(initialInput.quantity)
  const initialDeliveryDistance = Number(initialInput.deliveryDistance)
  const initialSize = initialInput.size

  const [formState, setFormState] = useState({
    size: CFLC_CARPORT_SIZE_OPTIONS.some((option) => option.value === initialSize)
      ? initialSize
      : CFLC_CARPORT_SIZE_OPTIONS[0].value,
    quantity: initialQuantity > 0 ? initialQuantity : 1,
    deliveryDistance: initialDeliveryDistance >= 0 ? initialDeliveryDistance : 0,
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

  const estimate = useMemo(() => calculateCflcCarportEstimate(formState), [formState])

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
          lastName: "CFLC Carport Enquiry",
          email: enquiryState.email.trim(),
          phone: enquiryState.phone.trim(),
          lead_source: "CFLC Carport Estimator",
          product_type: "CFLC Carport",
          estimate_request: estimate.summary.estimateRequest,
          quote_value: estimate.pricing.totalInclVat,
          next_action:
            "Review CFLC carport estimator enquiry, confirm delivery and site details, and contact the client with the next step.",
          notes: buildEstimatorNotes({
            estimate,
            formState,
            enquiryNotes: enquiryState.notes,
          }),
        }),
      })

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload?.error || "Could not save the CFLC carport enquiry.")
      }

      setSubmitSuccess(
        "Your CFLC carport enquiry has been saved. The Smart Steel team can now pick it up in the CRM and follow up properly."
      )
      setShowEnquiryForm(false)
      setEnquiryState({
        name: "",
        email: "",
        phone: "",
        notes: "",
      })
    } catch (error) {
      setSubmitError(error?.message || "Could not save the CFLC carport enquiry.")
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
              CFLC Carport Estimator
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Estimate a CFLC carport kit before you enquire
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
              Get a clearer starting budget for a Smart Steel lip channel carport kit before you
              speak to the team. If the estimate looks right, you can send your details through for
              the next step and the enquiry will be saved in our CRM.
            </p>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
              Your Details
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              Choose the main carport details
            </h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
                Carport size
                <select
                  className="mt-2 block w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900"
                  value={formState.size}
                  onChange={(event) => handleFieldChange("size", event.target.value)}
                >
                  {CFLC_CARPORT_SIZE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-semibold text-slate-700">
                Number of kits
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

            <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
              This estimate is a starting point for a standard CFLC carport kit. Final pricing can
              still change if the delivery, finish, or project scope changes.
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
              Estimate
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              Your estimated carport kit budget
            </h2>

            <div className="mt-6 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-950 text-white">
              <div className="px-6 py-6">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
                  Estimated budget
                </p>
                <p className="mt-3 text-4xl font-semibold">
                  {formatCurrency(estimate.pricing.totalInclVat)}
                </p>
                <p className="mt-2 text-sm text-slate-300">
                  Incl. VAT
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Carport size
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{estimate.labels.size}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Quantity
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{estimate.labels.quantity}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Delivery
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{estimate.labels.delivery}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Excl. VAT
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {formatCurrency(estimate.pricing.totalExVat)}
                </p>
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
                href="/products/cflc-carport-kits"
                className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Back to carport page
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
                    Anything else we should know?
                    <textarea
                      rows={4}
                      className="mt-2 block w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900"
                      value={enquiryState.notes}
                      onChange={(event) => handleEnquiryChange("notes", event.target.value)}
                    />
                  </label>
                </div>

                {submitError ? <p className="mt-4 text-sm font-medium text-red-600">{submitError}</p> : null}
                {submitSuccess ? <p className="mt-4 text-sm font-medium text-green-700">{submitSuccess}</p> : null}

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
