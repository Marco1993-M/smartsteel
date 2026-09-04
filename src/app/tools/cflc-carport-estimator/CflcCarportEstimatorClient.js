"use client"

import Image from "next/image"
import Link from "next/link"
import { useMemo, useState } from "react"
import {
  calculateCflcCarportEstimate,
  CFLC_CARPORT_SIZE_OPTIONS,
} from "../../../lib/estimates/cflcCarportEstimate"
import { formatCurrency } from "../../../lib/estimates/warehouseEstimate"

const PROCEED_TIMING_OPTIONS = [
  { value: "ready_now", label: "Ready now" },
  { value: "within_30_days", label: "Within 30 days" },
  { value: "one_to_three_months", label: "1 to 3 months" },
  { value: "just_pricing", label: "Just pricing for now" },
]

function createDesignReference() {
  const stamp = new Date().toISOString().slice(2, 10).replaceAll("-", "")
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `ATC-${stamp}-${suffix}`
}

function buildEstimatorNotes({ estimate, formState, enquiryNotes, designReference }) {
  return [
    "Atlas Carport Estimator enquiry",
    `Design reference: ${designReference}`,
    `Configuration: ${estimate.labels.size}`,
    `Number of structures: ${formState.quantity}`,
    `Structure guide (excl. VAT): ${formatCurrency(estimate.pricing.totalExVat)}`,
    `Structure guide (incl. VAT): ${formatCurrency(estimate.pricing.totalInclVat)}`,
    `Project location: ${formState.projectLocation.trim() || "To be confirmed"}`,
    "Delivery: To be calculated after location and access review",
    "Source page: /tools/cflc-carport-estimator",
    formState.proceedTiming
      ? `Looking to proceed: ${PROCEED_TIMING_OPTIONS.find((option) => option.value === formState.proceedTiming)?.label}`
      : null,
    formState.projectNotes.trim() ? `Project notes: ${formState.projectNotes.trim()}` : null,
    enquiryNotes.trim() ? `Additional client notes: ${enquiryNotes.trim()}` : null,
  ].filter(Boolean).join("\n")
}

function Field({ label, optional = false, children, className = "" }) {
  return (
    <label className={`text-sm font-bold ${className}`}>
      {label} {optional ? <span className="font-normal text-[#001d2e]/45">(optional)</span> : null}
      {children}
    </label>
  )
}

export default function CflcCarportEstimatorClient({ initialInput = {} }) {
  const initialQuantity = Number(initialInput.quantity)
  const initialSize = CFLC_CARPORT_SIZE_OPTIONS.some((option) => option.value === initialInput.size)
    ? initialInput.size
    : CFLC_CARPORT_SIZE_OPTIONS[0].value
  const [step, setStep] = useState(1)
  const [formState, setFormState] = useState({
    size: initialSize,
    quantity: initialQuantity > 0 ? initialQuantity : 1,
    projectLocation: initialInput.projectLocation || "",
    proceedTiming: "",
    projectNotes: "",
  })
  const [enquiryState, setEnquiryState] = useState({ name: "", email: "", phone: "", notes: "" })
  const [designReference] = useState(createDesignReference)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [submitSuccess, setSubmitSuccess] = useState("")
  const estimate = useMemo(() => calculateCflcCarportEstimate(formState), [formState])
  const selectedOption = CFLC_CARPORT_SIZE_OPTIONS.find((option) => option.value === formState.size)

  const changeField = (field, value) => {
    setFormState((current) => ({ ...current, [field]: value }))
    setSubmitError("")
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!enquiryState.name.trim() || !enquiryState.email.trim() || !enquiryState.phone.trim()) {
      setSubmitError("Please add your name, email, and phone number.")
      return
    }

    setIsSubmitting(true)
    setSubmitError("")
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: enquiryState.name.trim(),
          lastName: "Atlas Carport Enquiry",
          email: enquiryState.email.trim(),
          phone: enquiryState.phone.trim(),
          lead_source: "Atlas Carport Estimator",
          product_type: "Atlas Carport",
          estimate_request: `${estimate.summary.estimateRequest} · Ref ${designReference}`,
          quote_value: estimate.pricing.totalExVat,
          next_action:
            "Review the Atlas carport configuration, confirm site and delivery requirements, and contact the client.",
          notes: buildEstimatorNotes({
            estimate,
            formState,
            enquiryNotes: enquiryState.notes,
            designReference,
          }),
        }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload?.error || "Could not save your Atlas carport enquiry.")
      setSubmitSuccess(`Enquiry received. Keep ${designReference} as your project reference.`)
    } catch (error) {
      setSubmitError(error?.message || "Could not save your Atlas carport enquiry.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="atlas-brand min-h-screen bg-[linear-gradient(180deg,#fff_0%,#fff_7rem,#eef6fa_18rem,#eef6fa_100%)] px-4 pb-32 pt-24 text-[#001d2e] sm:px-6 sm:pt-28 lg:px-8 lg:pb-12">
      <div className="mx-auto max-w-6xl">
        <section className="overflow-hidden border border-[#001d2e]/15 bg-[linear-gradient(125deg,#001d2e_0%,#073274_52%,#0043f3_100%)] text-white shadow-[0_28px_70px_-52px_rgba(0,29,46,0.9)]">
          <div className="relative px-6 py-8 sm:px-9 sm:py-10">
            <div className="pointer-events-none absolute -right-24 -top-40 h-96 w-52 rotate-45 bg-white/10" />
            <Image
              src="/atlas/atlas-logo-horizontal-light.png"
              alt="Atlas by Smart Steel"
              width={270}
              height={56}
              className="relative h-10 w-auto object-contain object-left"
              priority
            />
            <div className="relative mt-8 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#c1d9e5]">
                  Atlas Carport Calculator
                </p>
                <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-[0.98] tracking-[-0.05em] sm:text-5xl">
                  Price your parking cover in three quick steps.
                </h1>
              </div>
              <Link href="/products/cflc-solar-carports" className="border-b border-white/50 pb-1 text-sm font-semibold hover:border-white">
                Looking for a solar carport?
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="border border-[#001d2e]/15 bg-white p-5 shadow-sm sm:p-7">
            <div className="grid grid-cols-3 border border-[#001d2e]/12 text-center text-[10px] font-bold uppercase tracking-[0.14em] sm:text-xs">
              {["Parking", "Project", "Contact"].map((label, index) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => index + 1 < step && setStep(index + 1)}
                  className={`min-w-0 px-2 py-3 ${step === index + 1 ? "bg-[#0043f3] text-white" : "bg-[#f7fafc] text-[#001d2e]/45"}`}
                >
                  {index + 1}. {label}
                </button>
              ))}
            </div>

            {step === 1 ? (
              <div className="mt-7">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0043f3]">Step 1</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em]">
                  How many vehicles are you covering?
                </h2>
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {CFLC_CARPORT_SIZE_OPTIONS.map((option, index) => {
                    const active = formState.size === option.value
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => changeField("size", option.value)}
                        className={`relative min-w-0 border p-4 text-left transition ${active ? "border-[#0043f3] bg-[#eaf2ff]" : "border-[#001d2e]/15 bg-white hover:border-[#0043f3]/55"}`}
                      >
                        {index === 1 ? (
                          <span className="absolute right-0 top-0 bg-[#0043f3] px-2 py-1 text-[8px] font-bold uppercase tracking-[0.12em] text-white">
                            Popular
                          </span>
                        ) : null}
                        <div className="grid h-10 max-w-full grid-flow-col auto-cols-[24px] items-center justify-center gap-1 overflow-hidden">
                          {Array.from({ length: index + 1 }, (_, carIndex) => (
                            <Image
                              key={carIndex}
                              src="/car.png"
                              alt=""
                              width={24}
                              height={24}
                              className="h-6 w-6 object-contain"
                            />
                          ))}
                        </div>
                        <p className="mt-4 text-sm font-bold">
                          {index + 1} {index === 0 ? "parking bay" : "parking bays"}
                        </p>
                        <p className="mt-1 text-xs text-[#001d2e]/55">{option.width}m × {option.length}m</p>
                      </button>
                    )
                  })}
                </div>
                <button type="button" onClick={() => setStep(2)} className="mt-7 flex w-full items-center justify-between bg-[#0043f3] px-5 py-4 font-bold text-white hover:bg-[#0036c7]">
                  Continue <span aria-hidden="true">→</span>
                </button>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="mt-7">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0043f3]">Step 2</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em]">Where is the carport going?</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Field label="Number of structures">
                    <input type="number" min="1" step="1" value={formState.quantity} onChange={(event) => changeField("quantity", Math.max(1, Number(event.target.value) || 1))} className="mt-2 block w-full border border-[#001d2e]/20 px-4 py-3 text-base outline-none focus:border-[#0043f3]" />
                  </Field>
                  <Field label="Project town or location">
                    <input type="text" value={formState.projectLocation} onChange={(event) => changeField("projectLocation", event.target.value)} placeholder="e.g. Cullinan, Gauteng" className="mt-2 block w-full border border-[#001d2e]/20 px-4 py-3 text-base outline-none focus:border-[#0043f3]" />
                  </Field>
                  <Field label="Project notes" optional className="sm:col-span-2">
                    <textarea rows={3} value={formState.projectNotes} onChange={(event) => changeField("projectNotes", event.target.value)} placeholder="Tell us about access, intended use, or special requirements." className="mt-2 block w-full border border-[#001d2e]/20 px-4 py-3 text-base outline-none focus:border-[#0043f3]" />
                  </Field>
                </div>
                <p className="mt-4 text-sm leading-6 text-[#001d2e]/60">
                  Delivery and installation are reviewed around the location, access, and final scope.
                </p>
                <div className="mt-7 flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="border border-[#001d2e]/20 px-5 py-4 font-bold">Back</button>
                  <button type="button" onClick={() => setStep(3)} className="flex flex-1 items-center justify-between bg-[#0043f3] px-5 py-4 font-bold text-white">
                    Request a reviewed quote <span>→</span>
                  </button>
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <form onSubmit={handleSubmit} className="mt-7">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0043f3]">Step 3</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em]">Where should we send the next step?</h2>
                <p className="mt-2 text-sm text-[#001d2e]/55">Reference {designReference}</p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {[
                    ["name", "Name", "text"],
                    ["email", "Email", "email"],
                    ["phone", "Phone", "tel"],
                  ].map(([field, label, type]) => (
                    <Field key={field} label={label} className={field === "phone" ? "sm:col-span-2" : ""}>
                      <input type={type} value={enquiryState[field]} onChange={(event) => setEnquiryState((current) => ({ ...current, [field]: event.target.value }))} className="mt-2 block w-full border border-[#001d2e]/20 px-4 py-3 text-base outline-none focus:border-[#0043f3]" />
                    </Field>
                  ))}
                  <Field label="How soon are you looking to proceed?" optional className="sm:col-span-2">
                    <select value={formState.proceedTiming} onChange={(event) => changeField("proceedTiming", event.target.value)} className="mt-2 block w-full border border-[#001d2e]/20 bg-white px-4 py-3 text-base">
                      <option value="">Select an option</option>
                      {PROCEED_TIMING_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  </Field>
                  <Field label="Anything else we should know?" optional className="sm:col-span-2">
                    <textarea rows={3} value={enquiryState.notes} onChange={(event) => setEnquiryState((current) => ({ ...current, notes: event.target.value }))} className="mt-2 block w-full border border-[#001d2e]/20 px-4 py-3 text-base" />
                  </Field>
                </div>
                {submitError ? <p className="mt-4 text-sm font-bold text-red-600">{submitError}</p> : null}
                {submitSuccess ? <p className="mt-4 border border-emerald-300 bg-emerald-50 p-4 text-sm font-bold text-emerald-800">{submitSuccess}</p> : null}
                <div className="mt-7 flex gap-3">
                  <button type="button" onClick={() => setStep(2)} className="border border-[#001d2e]/20 px-5 py-4 font-bold">Back</button>
                  <button type="submit" disabled={isSubmitting || Boolean(submitSuccess)} className="flex flex-1 items-center justify-center bg-[#0043f3] px-5 py-4 font-bold text-white disabled:opacity-50">
                    {isSubmitting ? "Sending..." : submitSuccess ? "Enquiry sent" : "Send enquiry"}
                  </button>
                </div>
              </form>
            ) : null}
          </div>

          <aside className="self-start border border-[#001d2e]/15 bg-white lg:sticky lg:top-24">
            <div className="bg-[#001d2e] p-6 text-white sm:p-7">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#c1d9e5]">Structure price guide</p>
              <p className="mt-3 text-4xl font-semibold tracking-[-0.04em]">{formatCurrency(estimate.pricing.totalExVat)}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-white/55">Excluding VAT</p>
              <p className="mt-5 border-t border-white/15 pt-4 text-sm font-semibold">{selectedOption?.label}</p>
              {formState.quantity > 1 ? <p className="mt-1 text-sm text-white/60">{formState.quantity} structures included</p> : null}
            </div>
            <div className="p-6 sm:p-7">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0043f3]">Included</p>
              <ul className="mt-4 grid gap-3 text-sm font-semibold">
                {estimate.lineItems.map((item) => <li key={item.code} className="flex gap-3"><span className="text-[#0043f3]">✓</span>{item.label}</li>)}
              </ul>
              <p className="mt-6 border-t border-[#001d2e]/10 pt-5 text-sm leading-6 text-[#001d2e]/60">
                A planning guide for the Atlas structure. Sheeting, foundations, delivery, and installation are reviewed separately.
              </p>
              <div className="mt-5 flex flex-wrap gap-4 text-sm font-bold">
                <Link href="/products/cflc-carport-kits" className="border-b border-[#001d2e]/30">Atlas carports</Link>
                <Link href="/products/cflc-solar-carports" className="border-b border-[#001d2e]/30">Solar carports</Link>
              </div>
            </div>
          </aside>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#001d2e]/15 bg-white/95 p-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#001d2e]/45">Guide excl. VAT</p>
            <p className="text-xl font-bold">{formatCurrency(estimate.pricing.totalExVat)}</p>
          </div>
          {step < 3 ? (
            <button type="button" onClick={() => setStep(step + 1)} className="bg-[#0043f3] px-5 py-3 text-sm font-bold text-white">Continue</button>
          ) : (
            <span className="text-xs font-bold text-[#001d2e]/55">Complete the form above</span>
          )}
        </div>
      </div>
    </main>
  )
}
