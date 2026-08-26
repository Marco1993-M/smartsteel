"use client"

import Image from "next/image"
import { useState } from "react"
import { Check, Clock3, PauseCircle, Phone, RefreshCw } from "lucide-react"

const OPTIONS = [
  {
    key: "call_me",
    label: "I'm interested - please call me",
    helper: "The Smart Steel team will contact you to discuss the next step.",
    icon: Phone,
  },
  {
    key: "request_changes",
    label: "I'd like to change the estimate",
    helper: "We will contact you to understand what should be revised.",
    icon: RefreshCw,
  },
  {
    key: "considering",
    label: "I'm still considering it",
    helper: "No pressure. We will keep the estimate open and check in later.",
    icon: Clock3,
  },
  {
    key: "not_proceeding",
    label: "I'm not proceeding right now",
    helper: "We will pause the follow-ups. You can return whenever the timing is right.",
    icon: PauseCircle,
  },
]

export default function EstimateResponseClient({ token, estimateTitle, clientName, initialChoice, isAtlas }) {
  const validInitialChoice = OPTIONS.some((option) => option.key === initialChoice) ? initialChoice : ""
  const [choice, setChoice] = useState(validInitialChoice)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(null)
  const [error, setError] = useState("")
  const selected = OPTIONS.find((option) => option.key === choice)

  const submitResponse = async () => {
    if (!choice || submitting) return
    setSubmitting(true)
    setError("")
    try {
      const response = await fetch("/api/crm/estimate-follow-ups/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, choice }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || "We could not record your response.")
      setSubmitted(result)
    } catch (submitError) {
      setError(submitError.message || "We could not record your response. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className={`min-h-screen px-4 py-6 sm:px-6 sm:py-10 ${
      isAtlas
        ? "bg-[linear-gradient(180deg,#ffffff_0px,#eef5f8_150px)]"
        : "bg-[linear-gradient(180deg,#ffffff_0px,#f1f5f9_150px)]"
    }`}>
      <div className="mx-auto max-w-3xl overflow-hidden border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)]">
        <header className={`relative overflow-hidden px-6 py-7 text-white sm:px-10 sm:py-9 ${
          isAtlas ? "bg-[linear-gradient(120deg,#001d2e_0%,#073b88_58%,#0043f3_100%)]" : "bg-slate-950"
        }`}>
          {isAtlas ? <div className="pointer-events-none absolute -right-24 top-0 h-full w-80 rotate-[38deg] bg-white/10" /> : null}
          <div className="relative">
            <Image
              src={isAtlas ? "/atlas/atlas-logo-horizontal-light.png" : "/LogoWhite.png"}
              alt={isAtlas ? "Atlas developed by Smart Steel" : "Smart Steel"}
              width={isAtlas ? 300 : 180}
              height={70}
              className="h-10 w-auto object-contain object-left"
              priority
            />
            <p className="mt-8 text-xs font-bold uppercase tracking-[0.22em] text-[#c1d9e5]">Estimate follow-up</p>
            <h1 className="mt-2 max-w-xl text-3xl font-bold leading-tight sm:text-4xl">One quick project update.</h1>
          </div>
        </header>

        <section className="px-5 py-7 sm:px-10 sm:py-10">
          {submitted ? (
            <div className="py-8 text-center sm:py-12">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <Check size={30} strokeWidth={2.5} />
              </span>
              <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-[#0043f3]">Response received</p>
              <h2 className="mx-auto mt-2 max-w-lg text-3xl font-bold text-slate-950">Thank you, {clientName || "we have your update"}.</h2>
              <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600">
                {submitted.choice === "call_me"
                  ? "The Smart Steel team will contact you to discuss the estimate."
                  : submitted.choice === "request_changes"
                    ? "We will contact you to confirm the changes you would like us to make."
                    : submitted.choice === "considering"
                      ? "Your estimate remains open while you consider the project."
                      : "We have paused the scheduled follow-ups. You are welcome to return whenever the timing is right."}
              </p>
              <a href="https://www.smartsteel.co.za" className="mt-8 inline-flex bg-[#0043f3] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#0033bd]">
                Return to Smart Steel
              </a>
            </div>
          ) : (
            <>
              <p className="text-sm font-semibold text-[#0043f3]">Prepared for {clientName || "you"}</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">Where are you with your project?</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                Select the closest answer for <strong className="text-slate-800">{estimateTitle}</strong>. It helps our team support you without unnecessary back-and-forth.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {OPTIONS.map((option) => {
                  const Icon = option.icon
                  const active = choice === option.key
                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => setChoice(option.key)}
                      className={`flex min-h-32 items-start gap-4 border p-5 text-left transition ${
                        active
                          ? "border-[#0043f3] bg-[#eef4ff] shadow-[inset_0_0_0_1px_#0043f3]"
                          : "border-slate-200 bg-white hover:border-[#8eb1ff] hover:bg-slate-50"
                      }`}
                    >
                      <span className={`flex h-11 w-11 shrink-0 items-center justify-center ${active ? "bg-[#0043f3] text-white" : "bg-[#c1d9e5] text-[#001d2e]"}`}>
                        <Icon size={21} />
                      </span>
                      <span>
                        <span className="block text-sm font-bold leading-5 text-slate-950">{option.label}</span>
                        <span className="mt-2 block text-xs leading-5 text-slate-500">{option.helper}</span>
                      </span>
                    </button>
                  )
                })}
              </div>

              {selected ? (
                <div className="mt-6 flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-600">Selected: <strong className="text-slate-900">{selected.label}</strong></p>
                  <button
                    type="button"
                    onClick={submitResponse}
                    disabled={submitting}
                    className="inline-flex min-h-12 items-center justify-center bg-[#0043f3] px-7 py-3 text-sm font-bold text-white transition hover:bg-[#0033bd] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? "Sending response..." : "Confirm response"}
                  </button>
                </div>
              ) : (
                <p className="mt-6 border-t border-slate-200 pt-5 text-sm text-slate-500">Choose one option to continue.</p>
              )}
              {error ? <p className="mt-4 bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p> : null}
            </>
          )}
        </section>

        <footer className="border-t border-slate-200 bg-slate-50 px-6 py-5 text-xs leading-5 text-slate-500 sm:px-10">
          Smart Steel · info@smartsteel.co.za · +27 82 846 4555
        </footer>
      </div>
    </main>
  )
}
