"use client"

import Image from "next/image"
import Link from "next/link"
import { useMemo, useState } from "react"
import {
  ATLAS_WAREHOUSE_SHEETING_OPTIONS,
  ATLAS_WAREHOUSE_STEEL_FINISH_OPTIONS,
  ATLAS_WAREHOUSE_WIDTH_OPTIONS,
  calculateAtlasWarehouseEstimate,
} from "../../../lib/estimates/atlasWarehouseEstimate"
import { formatCurrency } from "../../../lib/estimates/warehouseEstimate"

const LENGTH_OPTIONS = Array.from({ length: 15 }, (_, index) => (index + 1) * 4)
const SHEETING_PROFILES = ["Corrugated", "IBR", "Concealed Fix"]
const SHEETING_FINISHES = [
  { value: "galvanised", label: "Galvanised" },
  { value: "chromadek", label: "Chromadek colour" },
]

function getDefaultHeight(width) {
  return Number(width) >= 10 ? 4.5 : 3
}

function splitClientName(value) {
  const parts = String(value || "").trim().split(/\s+/).filter(Boolean)
  return {
    name: parts.shift() || "",
    lastName: parts.join(" ") || "Website Enquiry",
  }
}

export default function EstimatorPage() {
  const [width, setWidth] = useState(8)
  const [length, setLength] = useState(20)
  const [wallHeight, setWallHeight] = useState(3)
  const [steelFinish, setSteelFinish] = useState("ZAM")
  const [gableMode, setGableMode] = useState("structure_only")
  const [sheetingProfile, setSheetingProfile] = useState("IBR")
  const [sheetingFinish, setSheetingFinish] = useState("galvanised")
  const [hasCalculated, setHasCalculated] = useState(false)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [projectLocation, setProjectLocation] = useState("")
  const [projectNotes, setProjectNotes] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [submissionMessage, setSubmissionMessage] = useState("")

  const estimate = useMemo(() => calculateAtlasWarehouseEstimate({
    width,
    length,
    wallHeight,
    steelFinish,
    gableMode,
    sheetingProfile,
    sheetingFinish,
  }), [gableMode, length, sheetingFinish, sheetingProfile, steelFinish, wallHeight, width])

  const budgetValue = estimate?.pricing?.estimatedTotal || 0
  const sheetingLabel = ATLAS_WAREHOUSE_SHEETING_OPTIONS.find((option) => option.value === gableMode)?.label || "Structure only"
  const estimateRequest = `Atlas W${String(width).padStart(2, "0")} Warehouse: ${width}m x ${length}m x ${wallHeight}m, ${steelFinish}, ${sheetingLabel}${gableMode === "structure_only" ? "" : `, ${sheetingProfile}, ${sheetingFinish === "chromadek" ? "Chromadek" : "galvanised"}`}, supply only. Installation and delivery quoted separately.`
  const whatsappMessage = [
    "Hi Smart Steel, I would like to discuss this Atlas warehouse estimate:",
    `${width}m x ${length}m x ${wallHeight}m · ${steelFinish} · ${sheetingLabel}`,
    `Budget guide excl. VAT: ${formatCurrency(budgetValue)}`,
  ].join("\n")

  const handleWidthChange = (event) => {
    const nextWidth = Number(event.target.value)
    setWidth(nextWidth)
    setWallHeight(getDefaultHeight(nextWidth))
    setHasCalculated(false)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSending(true)
    setSubmissionMessage("")

    try {
      const clientName = splitClientName(fullName)
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...clientName,
          email,
          phone,
          lead_source: "Quick Warehouse Estimator",
          product_type: "Atlas Warehouse",
          estimate_request: estimateRequest,
          quote_value: budgetValue,
          notes: [
            `Steel finish: ${steelFinish}`,
            `Sheeting: ${sheetingLabel}`,
            gableMode === "structure_only" ? null : `Sheeting profile: ${sheetingProfile}`,
            gableMode === "structure_only" ? null : `Sheeting finish: ${sheetingFinish === "chromadek" ? "Chromadek" : "Galvanised"}`,
            projectLocation ? `Project location: ${projectLocation}` : null,
            projectNotes ? `Client notes: ${projectNotes}` : null,
            "Installation: Quoted separately",
            "Delivery: Quoted separately",
          ].filter(Boolean).join("\n"),
          next_action: "Review the quick Atlas estimate and contact the client to confirm site and project requirements.",
        }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || "Could not submit the estimate request.")

      setSubmissionMessage("Your estimate request has been received. The Smart Steel team will review it and contact you.")
      setFullName("")
      setEmail("")
      setPhone("")
      setProjectLocation("")
      setProjectNotes("")
    } catch (error) {
      setSubmissionMessage(error?.message || "Something went wrong. Please try again.")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#ffffff_0%,#eef6fa_100%)] px-4 py-10 text-[#001d2e] sm:px-6 sm:py-16">
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[0.82fr_1.18fr]">
        <section className="overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#001d2e_0%,#073b86_55%,#0043f3_100%)] p-7 text-white shadow-xl sm:p-10 lg:sticky lg:top-8 lg:self-start">
          <Image src="/atlas/atlas-logo-horizontal-light.png" alt="Atlas by Smart Steel" width={230} height={70} className="h-auto w-[190px] sm:w-[230px]" priority />
          <p className="mt-12 text-xs font-bold uppercase tracking-[0.28em] text-[#c1d9e5]">Quick warehouse estimator</p>
          <h1 className="mt-4 text-4xl font-black leading-[1.04] sm:text-5xl">Price an Atlas warehouse in minutes.</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-[#dceaf1]">Choose a standard Atlas configuration and get an immediate supply-only budget guide before you enquire.</p>
          <div className="mt-8 border-t border-white/20 pt-6 text-sm leading-6 text-[#c1d9e5]">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div><strong className="block text-xl text-white">4m</strong><span className="text-xs">modular bays</span></div>
              <div><strong className="block text-xl text-white">60m</strong><span className="text-xs">length options</span></div>
              <div><strong className="block text-xl text-white">3</strong><span className="text-xs">steel finishes</span></div>
            </div>
          </div>
          <Link href="/warehouse-builder" className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-[#0043f3] transition hover:-translate-y-0.5">
            Open the 3D warehouse builder <span aria-hidden="true">↗</span>
          </Link>
        </section>

        <section className="rounded-[2rem] border border-[#cbdde6] bg-white p-5 shadow-xl sm:p-8">
          <div className="flex items-end justify-between gap-4 border-b border-[#dbe7ed] pb-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#0043f3]">Atlas W-Series</p>
              <h2 className="mt-2 text-2xl font-black sm:text-3xl">Build your starting estimate</h2>
            </div>
            <span className="hidden rounded-full bg-[#e9f3f8] px-4 py-2 text-xs font-bold text-[#001d2e] sm:block">Supply only</span>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-bold">Warehouse width
              <select value={width} onChange={handleWidthChange} className="mt-2 w-full rounded-xl border border-[#cbdde6] bg-white p-3 text-base outline-none focus:border-[#0043f3]">
                {ATLAS_WAREHOUSE_WIDTH_OPTIONS.map((option) => <option key={option} value={option}>{option}m</option>)}
              </select>
            </label>
            <label className="text-sm font-bold">Warehouse length
              <select value={length} onChange={(event) => { setLength(Number(event.target.value)); setHasCalculated(false) }} className="mt-2 w-full rounded-xl border border-[#cbdde6] bg-white p-3 text-base outline-none focus:border-[#0043f3]">
                {LENGTH_OPTIONS.map((option) => <option key={option} value={option}>{option}m · {option / 4} bay{option === 4 ? "" : "s"}</option>)}
              </select>
            </label>
            <label className="text-sm font-bold">Eave height
              <select value={wallHeight} onChange={(event) => { setWallHeight(Number(event.target.value)); setHasCalculated(false) }} className="mt-2 w-full rounded-xl border border-[#cbdde6] bg-white p-3 text-base outline-none focus:border-[#0043f3]">
                {[3, 3.5, 4, 4.5, 5].map((option) => <option key={option} value={option}>{option}m</option>)}
              </select>
            </label>
            <label className="text-sm font-bold">Steel finish
              <select value={steelFinish} onChange={(event) => { setSteelFinish(event.target.value); setHasCalculated(false) }} className="mt-2 w-full rounded-xl border border-[#cbdde6] bg-white p-3 text-base outline-none focus:border-[#0043f3]">
                {ATLAS_WAREHOUSE_STEEL_FINISH_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
          </div>

          <fieldset className="mt-6">
            <legend className="text-sm font-bold">Sheeting add-on</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {ATLAS_WAREHOUSE_SHEETING_OPTIONS.map((option) => (
                <button key={option.value} type="button" onClick={() => { setGableMode(option.value); setHasCalculated(false) }} className={`rounded-xl border px-3 py-3 text-sm font-bold transition ${gableMode === option.value ? "border-[#0043f3] bg-[#0043f3] text-white" : "border-[#cbdde6] bg-white hover:border-[#0043f3]"}`}>
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>

          {gableMode !== "structure_only" ? (
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-bold">Sheeting profile
                <select value={sheetingProfile} onChange={(event) => { setSheetingProfile(event.target.value); setHasCalculated(false) }} className="mt-2 w-full rounded-xl border border-[#cbdde6] bg-white p-3 text-base outline-none focus:border-[#0043f3]">
                  {SHEETING_PROFILES.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </label>
              <label className="text-sm font-bold">Sheeting finish
                <select value={sheetingFinish} onChange={(event) => { setSheetingFinish(event.target.value); setHasCalculated(false) }} className="mt-2 w-full rounded-xl border border-[#cbdde6] bg-white p-3 text-base outline-none focus:border-[#0043f3]">
                  {SHEETING_FINISHES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
            </div>
          ) : null}

          <button type="button" onClick={() => setHasCalculated(true)} className="mt-7 w-full rounded-xl bg-[#001d2e] px-5 py-4 text-base font-black text-white transition hover:bg-[#0043f3]">
            Calculate my estimate
          </button>

          {hasCalculated ? (
            <div className="mt-6 overflow-hidden rounded-2xl bg-[#001d2e] text-white">
              <div className="p-6 sm:flex sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#c1d9e5]">Budget guide excl. VAT</p>
                  <p className="mt-2 text-4xl font-black sm:text-5xl">{formatCurrency(budgetValue)}</p>
                </div>
                <p className="mt-3 text-sm text-[#c1d9e5] sm:mt-0">{width}m × {length}m × {wallHeight}m</p>
              </div>
              <div className="grid grid-cols-2 gap-px bg-white/15 border-y border-white/15 sm:grid-cols-4">
                {[
                  ["System", `Atlas W${String(width).padStart(2, "0")}`],
                  ["Steel", steelFinish],
                  ["Sheeting", sheetingLabel],
                  ["Basis", "Supply only"],
                ].map(([label, value]) => (
                  <div key={label} className="bg-[#001d2e] px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8fb4c6]">{label}</p>
                    <p className="mt-1 truncate text-sm font-bold text-white">{value}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 bg-[#f3f8fa] p-5 text-[#001d2e] sm:p-6">
                <h3 className="text-xl font-black">Request a reviewed estimate</h3>
                <p className="text-sm text-[#4b6473]">Leave your details and we will check this configuration before preparing the next step.</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-bold sm:col-span-2">Full name
                    <input required value={fullName} onChange={(event) => setFullName(event.target.value)} className="mt-2 w-full rounded-xl border border-[#cbdde6] bg-white p-3 text-base outline-none focus:border-[#0043f3]" />
                  </label>
                  <label className="text-sm font-bold">Email
                    <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-[#cbdde6] bg-white p-3 text-base outline-none focus:border-[#0043f3]" />
                  </label>
                  <label className="text-sm font-bold">Phone
                    <input required type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-2 w-full rounded-xl border border-[#cbdde6] bg-white p-3 text-base outline-none focus:border-[#0043f3]" />
                  </label>
                  <label className="text-sm font-bold sm:col-span-2">Project town or area <span className="font-normal text-[#69808d]">(optional)</span>
                    <input value={projectLocation} onChange={(event) => setProjectLocation(event.target.value)} placeholder="For example, Pretoria or Nelspruit" className="mt-2 w-full rounded-xl border border-[#cbdde6] bg-white p-3 text-base outline-none focus:border-[#0043f3]" />
                  </label>
                  <label className="text-sm font-bold sm:col-span-2">Anything we should know? <span className="font-normal text-[#69808d]">(optional)</span>
                    <textarea value={projectNotes} onChange={(event) => setProjectNotes(event.target.value)} rows={3} placeholder="Use, access requirements, preferred timing, or any questions" className="mt-2 w-full resize-none rounded-xl border border-[#cbdde6] bg-white p-3 text-base outline-none focus:border-[#0043f3]" />
                  </label>
                </div>
                <button disabled={isSending} className="w-full rounded-xl bg-[#0043f3] px-5 py-4 font-black text-white disabled:opacity-60">
                  {isSending ? "Sending…" : "Send estimate request"}
                </button>
                <a href={`https://wa.me/27828464555?text=${encodeURIComponent(whatsappMessage)}`} target="_blank" rel="noreferrer" className="block w-full rounded-xl border border-[#25D366] bg-white px-5 py-3 text-center text-sm font-black text-[#128C4A] transition hover:bg-[#effcf4]">
                  Discuss this estimate on WhatsApp
                </a>
                {submissionMessage ? <p className="text-sm font-semibold text-[#334d5c]" role="status">{submissionMessage}</p> : null}
              </form>
            </div>
          ) : null}
        </section>
      </div>

      <section className="mx-auto mt-10 w-full max-w-6xl border-y border-[#bfd5df] py-7">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            ["Current Atlas pricing", "The amount responds to your selected warehouse size, steel finish and sheeting scope."],
            ["Clear commercial basis", "The guide covers supply only and excludes VAT. Delivery and installation are reviewed separately."],
            ["Reviewed before quoting", "Your configuration is checked by Smart Steel before it becomes a formal project proposal."],
          ].map(([title, copy], index) => (
            <div key={title} className="grid grid-cols-[auto_1fr] gap-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0043f3] text-xs font-black text-white">0{index + 1}</span>
              <div><h2 className="font-black">{title}</h2><p className="mt-1 text-sm leading-6 text-[#526b79]">{copy}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 grid w-full max-w-6xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#0043f3]">What your estimate covers</p>
          <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">A useful starting price, without hiding the next decisions.</h2>
          <p className="mt-5 text-base leading-7 text-[#526b79]">The estimator is designed to help you establish whether an Atlas warehouse fits your project and budget. It does not force uncertain delivery, installation or site assumptions into the amount.</p>
          <Link href="/warehouses/cflc" className="mt-6 inline-flex font-black text-[#0043f3] underline decoration-[#c1d9e5] decoration-4 underline-offset-4">Explore the Atlas warehouse system</Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ["Included in the guide", "Atlas structural members, controlled connection allowances and your selected sheeting add-on."],
            ["Reviewed separately", "Delivery distance, site access, installation requirements and any project-specific engineering."],
            ["Structure-only option", "Start with the complete steel structure, then add roof sheeting or full wall sheeting when required."],
            ["Three steel finishes", "Compare Mild Steel, ZAM and Galvanised options against the same warehouse configuration."],
          ].map(([title, copy]) => (
            <article key={title} className="rounded-2xl border border-[#cbdde6] bg-white p-5">
              <h3 className="font-black">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#526b79]">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 w-full max-w-6xl rounded-[2rem] bg-[#c1d9e5] p-6 sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#0043f3]">Quick answers</p>
            <h2 className="mt-3 text-3xl font-black">Before you calculate</h2>
          </div>
          <div className="divide-y divide-[#91afbd]">
            {[
              ["Is this a final quotation?", "No. It is an indicative supply-only budget excluding VAT. We review your configuration before issuing a formal proposal."],
              ["Why are delivery and installation separate?", "Distance, access, ground conditions and the selected installation scope differ by project. Reviewing them separately produces a fairer figure."],
              ["Can I price a warehouse longer than 20 metres?", "Yes. Atlas warehouses use 4 metre modular bays, with estimator options extending to 60 metres."],
              ["Can I request a custom configuration?", "Yes. Use the 3D warehouse builder or send the closest standard estimate and explain the custom requirement in the notes."],
            ].map(([question, answer]) => (
              <details key={question} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-black"><span>{question}</span><span className="text-xl text-[#0043f3] transition group-open:rotate-45">+</span></summary>
                <p className="max-w-2xl pt-3 text-sm leading-6 text-[#334f5d]">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-16 w-full max-w-6xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#0043f3]">Need more control?</p>
        <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-black sm:text-4xl">See the warehouse change as you configure it.</h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#526b79]">Use the full 3D builder to compare structure and sheeting options visually, save the design and submit a more detailed project request.</p>
        <Link href="/warehouse-builder" className="mt-7 inline-flex rounded-full bg-[#0043f3] px-7 py-4 font-black text-white transition hover:-translate-y-0.5">Build my warehouse in 3D</Link>
      </section>
    </main>
  )
}
