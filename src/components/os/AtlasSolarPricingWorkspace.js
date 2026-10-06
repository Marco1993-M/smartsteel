"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Download, ExternalLink, Plus, RotateCcw, Trash2 } from "lucide-react"
import { getOsAuthHeaders } from "../../lib/osClientAuth"
import { SOLAR_COST_DEFAULTS, SOLAR_COST_LABELS, calculateAtlasSolarCarportEstimate } from "../../lib/estimates/atlasSolarCarportEstimate"
import {
  ATLAS_SOLAR_CARPORT_PARKING_COUNTS,
  getAtlasSolarCarportPanelCount,
  getAtlasSolarCarportSiteLayout,
  getAtlasSolarCarportWidth,
  placeAtlasSolarCarportRun,
} from "../../lib/atlasSolarCarportLayouts"
import AtlasSolarCarportPlan from "../atlas/AtlasSolarCarportPlan"

const GROUPS = [
  { title: "Steel & production", keys: ["zamRatePerTon", "wastePercent", "fabricationPerKg"] },
  { title: "Connections", keys: ["anchorBracketEach", "armBracketEach", "purlinBracketEach", "anchorBoltEach", "connectionBoltSetEach"] },
  { title: "Project allowances", keys: ["moduleSupportEach", "installationPerSquareMetre", "deliveryPerKm", "deliveryMinimum", "upliftPercent"] },
]
const money = (value) => value == null ? "—" : `R ${Number(value).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const amount = (value, digits = 0) => Number(value || 0).toLocaleString("en-ZA", { maximumFractionDigits: digits })
const inputClass = "mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-[#001d2e] outline-none transition focus:border-[#0043f3] focus:ring-2 focus:ring-blue-100"

function makeRun(id, parkingCount = 2, length = 6) {
  const width = getAtlasSolarCarportWidth(parkingCount)
  return { id, parkingCount, width, length, moduleCount: getAtlasSolarCarportPanelCount(width, length), x: 0, z: 0, rotationDeg: 0 }
}

function Eyebrow({ children }) {
  return <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0043f3]">{children}</p>
}

export default function AtlasSolarPricingWorkspace() {
  const [release, setRelease] = useState(null)
  const [costs, setCosts] = useState(null)
  const [runs, setRuns] = useState([makeRun("run-1")])
  const [revisionNote, setRevisionNote] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const response = await fetch("/api/os/solar-carport-pricing", { headers: await getOsAuthHeaders(), cache: "no-store" })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || "Could not load solar pricing.")
        if (active) {
          setRelease(data.release)
          setCosts({ ...SOLAR_COST_DEFAULTS, ...(data.release?.costs || data.defaults) })
        }
      } catch (loadError) {
        if (active) setError(loadError.message)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [])

  const layout = useMemo(() => getAtlasSolarCarportSiteLayout(runs), [runs])
  const input = useMemo(() => ({
    parkingRuns: runs.map(({ width, length, parkingCount, moduleCount }) => ({ width, length, parkingCount, moduleCount })),
    scope: "supply_only",
    deliveryDistance: 0,
  }), [runs])
  const live = useMemo(() => release ? calculateAtlasSolarCarportEstimate(input, release) : null, [input, release])
  const draft = useMemo(() => costs ? calculateAtlasSolarCarportEstimate(input, { costs, revision: release?.revision || 0 }) : null, [input, costs, release?.revision])
  const differences = costs ? Object.keys(SOLAR_COST_DEFAULTS).filter((key) => !release || Number(costs[key]) !== Number(release.costs?.[key] ?? SOLAR_COST_DEFAULTS[key])) : []
  const invalid = costs && Object.keys(SOLAR_COST_DEFAULTS).some((key) => costs[key] === "" || !Number.isFinite(Number(costs[key])) || Number(costs[key]) < 0)
  const totalSpaces = runs.reduce((sum, run) => sum + run.parkingCount * (run.length === 12 ? 2 : 1), 0)
  const longest = Math.max(0, ...(draft?.members || []).map((member) => member.cutLengthM))
  const canPublish = Boolean(costs && differences.length && !invalid && revisionNote.trim().length >= 8 && !saving)

  function changeRun(id, key, value) {
    setRuns((current) => current.map((run) => {
      if (run.id !== id) return run
      const next = { ...run, [key]: Number(value) }
      if (key === "parkingCount") next.width = getAtlasSolarCarportWidth(next.parkingCount)
      next.moduleCount = getAtlasSolarCarportPanelCount(next.width, next.length)
      return next
    }))
  }

  function addRun() {
    if (runs.length >= 8) return
    setRuns((current) => [...current, placeAtlasSolarCarportRun(current, makeRun(`run-${Date.now()}`))])
  }

  async function download() {
    if (downloading) return
    setDownloading(true)
    setError("")
    try {
      const params = new URLSearchParams({ runs: runs.map((run) => `${run.width}x${run.length}`).join(",") })
      const response = await fetch(`/api/os/solar-carport-pricing/datasheet?${params}`, { headers: await getOsAuthHeaders() })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || "Could not create the transport sheet.")
      }
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `atlas-solar-carport-${runs.length}-run-transport-sheet.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (downloadError) {
      setError(downloadError.message)
    } finally {
      setDownloading(false)
    }
  }

  async function publish() {
    if (!canPublish) return
    setSaving(true)
    setError("")
    setMessage("")
    try {
      const response = await fetch("/api/os/solar-carport-pricing", {
        method: "PUT",
        headers: { ...await getOsAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ costs, revision: release?.revision || 0, note: revisionNote.trim() }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Could not publish solar pricing.")
      setRelease(data.release)
      setCosts({ ...SOLAR_COST_DEFAULTS, ...data.release.costs })
      setRevisionNote("")
      setMessage(`Revision ${data.release.revision} published. The website and CRM now use these rates.`)
    } catch (publishError) {
      setError(publishError.message)
    } finally {
      setSaving(false)
    }
  }

  return <main className="space-y-6 px-3 py-4 text-[#001d2e] sm:px-6 sm:py-6">
    <header className="overflow-hidden rounded-[1.5rem] bg-[linear-gradient(120deg,#001d2e,#073c8d_68%,#0043f3)] p-6 text-white shadow-lg sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-6"><div><p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#c1d9e5]">Atlas system · Solar carports</p><h1 className="mt-3 max-w-3xl text-3xl font-black tracking-[-0.04em] sm:text-4xl">Configuration & pricing</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-white/75">Build the parking layout, check the released guide and transport schedule, then review the rates that feed the website and CRM.</p></div><div className="flex flex-wrap items-center gap-2"><span className="rounded-full border border-white/25 bg-white/10 px-3 py-2 text-xs font-bold">{release ? `Revision ${release.revision} live` : loading ? "Loading release" : "No release"}</span><Link href="/tools/solar-carport-estimator" target="_blank" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-[#001d2e]"><ExternalLink className="h-3.5 w-3.5" />Open builder</Link></div></div>
    </header>

    <nav aria-label="Solar pricing sections" className="sticky top-3 z-20 flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white/95 p-2 shadow-sm backdrop-blur">{[["configuration", "Configure"], ["schedule", "Schedule"], ["benchmark", "Benchmark"], ["pricing", "Pricing control"]].map(([id, label]) => <a key={id} href={`#${id}`} className="rounded-lg px-3 py-2 text-xs font-bold text-slate-600 hover:bg-blue-50 hover:text-[#0043f3]">{label}</a>)}</nav>
    {error ? <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">{error}</p> : null}
    {message ? <p role="status" className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-800">{message}</p> : null}
    {!loading && !release ? <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">No published solar pricing release is available. The rates below are an internal draft until published.</p> : null}

    {costs && draft ? <>
      <section id="configuration" className="scroll-mt-24 grid gap-5 xl:grid-cols-[minmax(300px,0.85fr)_minmax(0,1.45fr)]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <Eyebrow>01 · Configure</Eyebrow><h2 className="mt-2 text-xl font-black">Parking runs</h2><p className="mt-2 text-sm leading-6 text-slate-600">Choose the same modules and row types as the public builder. Each run is priced separately.</p>
          <div className="mt-5 space-y-3">{runs.map((run, index) => <div key={run.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-start justify-between gap-2"><div><p className="text-xs font-black uppercase tracking-[0.12em] text-[#0043f3]">Run {String.fromCharCode(65 + index)}</p><p className="mt-1 text-sm font-bold">{run.parkingCount * (run.length === 12 ? 2 : 1)} spaces · {run.moduleCount} panels</p></div>{runs.length > 1 ? <button type="button" onClick={() => setRuns((current) => current.filter((item) => item.id !== run.id))} aria-label={`Remove run ${String.fromCharCode(65 + index)}`} className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-700"><Trash2 className="h-4 w-4" /></button> : null}</div><div className="mt-3 grid grid-cols-2 gap-3"><label className="text-[11px] font-bold text-slate-600">Spaces per side<select className={inputClass} value={run.parkingCount} onChange={(event) => changeRun(run.id, "parkingCount", event.target.value)}>{ATLAS_SOLAR_CARPORT_PARKING_COUNTS.map((count) => <option key={count} value={count}>{count} · {getAtlasSolarCarportWidth(count)}m</option>)}</select></label><label className="text-[11px] font-bold text-slate-600">Row type<select className={inputClass} value={run.length} onChange={(event) => changeRun(run.id, "length", event.target.value)}><option value={6}>Single · 6m</option><option value={12}>Double · 12m</option></select></label></div></div>)}</div>
          <div className="mt-4 flex gap-2"><button type="button" onClick={addRun} disabled={runs.length >= 8} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0043f3] px-4 py-3 text-sm font-bold text-white disabled:opacity-50"><Plus className="h-4 w-4" />Add run</button><button type="button" onClick={() => setRuns([makeRun("run-1")])} title="Reset layout" className="rounded-xl border border-slate-200 px-3 text-slate-600 hover:bg-slate-50"><RotateCcw className="h-4 w-4" /></button></div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-5"><div><Eyebrow>Indicative top layout</Eyebrow><p className="mt-1 text-sm text-slate-600">Column locations and parking envelope · site positions to confirm</p></div><button type="button" onClick={download} disabled={downloading} className="inline-flex items-center gap-2 rounded-xl bg-[#001d2e] px-4 py-3 text-xs font-bold text-white disabled:opacity-50"><Download className="h-4 w-4" />{downloading ? "Preparing PDF..." : "Download transport sheet"}</button></div><div className="flex h-[270px] items-center justify-center bg-[#edf4f8] p-3 sm:h-[340px]"><AtlasSolarCarportPlan runs={runs} className="h-full w-full" /></div><div className="grid gap-px bg-slate-200 sm:grid-cols-4">{[["Runs", runs.length], ["Spaces", totalSpaces], ["Panels", draft.totals.totalModules], ["Envelope", `${amount(layout.width, 2)} × ${amount(layout.depth, 2)}m`]].map(([label, value]) => <div key={label} className="bg-white p-4"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p><p className="mt-1 text-lg font-black">{value}</p></div>)}</div></div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_repeat(3,minmax(140px,0.5fr))]"><div className="rounded-2xl bg-[linear-gradient(125deg,#001d2e,#0043f3)] p-6 text-white shadow-lg"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#c1d9e5]">Published client guide · supply only</p><p className="mt-3 text-3xl font-black sm:text-4xl">{live ? money(live.pricing.estimatedTotal) : "Not published"}</p><p className="mt-2 text-xs text-white/70">Excluding VAT · {totalSpaces} spaces. Delivery, installation and site-specific works are quoted separately.</p>{differences.length ? <p className="mt-4 border-t border-white/25 pt-3 text-xs">Unpublished draft for this layout: <strong>{money(draft.pricing.estimatedTotal)}</strong></p> : null}</div>{[["Structural steel", `${amount(draft.totals.steelKg, 1)}kg`], ["Longest member", `${amount(longest, 3)}m`], ["Published uplift", release ? `${release.costs.upliftPercent}%` : "—"]].map(([label, value]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p><p className="mt-3 text-xl font-black">{value}</p></div>)}</section>

      <section id="schedule" className="scroll-mt-24 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 p-5 sm:p-6"><Eyebrow>02 · Material & transport schedule</Eyebrow><h2 className="mt-2 text-xl font-black">Know what needs to be made and moved.</h2><p className="mt-2 text-sm text-slate-600">The selected runs drive the member profile, cut length, quantity and steel mass below.</p></div><div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-[#001d2e] text-[10px] uppercase tracking-wider text-white"><tr>{["Run", "Member", "Profile / gauge", "Qty", "Cut length", "Steel mass"].map((label) => <th className="p-3" key={label}>{label}</th>)}</tr></thead><tbody>{draft.members.map((item, index) => <tr key={`${item.run}-${item.code}-${index}`} className="border-t border-slate-100 even:bg-slate-50"><td className="p-3 font-bold">{String.fromCharCode(64 + item.run)}</td><td className="p-3"><strong>{item.label}</strong><span className="block text-[10px] text-slate-400">{item.code}</span></td><td className="p-3">{item.profile.section}</td><td className="p-3">{item.quantity}</td><td className="p-3 font-semibold">{amount(item.cutLengthM, 3)}m</td><td className="p-3 font-semibold">{amount(item.totalMassKg, 1)}kg</td></tr>)}</tbody></table></div><div className="divide-y divide-slate-100 md:hidden">{draft.members.map((item, index) => <div key={`${item.run}-${item.code}-${index}`} className="p-4 even:bg-slate-50"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-wider text-[#0043f3]">Run {String.fromCharCode(64 + item.run)} · {item.code}</p><h3 className="mt-1 text-sm font-bold">{item.label}</h3></div><span className="shrink-0 text-sm font-black">{amount(item.totalMassKg, 1)}kg</span></div><p className="mt-2 text-xs text-slate-600">{item.profile.section} · {item.quantity} × {amount(item.cutLengthM, 3)}m</p></div>)}</div><details className="group border-t border-slate-200"><summary className="cursor-pointer p-5 text-sm font-bold">Brackets, anchors & fixings · {draft.connections.length} lines</summary><div className="grid gap-2 border-t border-slate-200 p-4 sm:grid-cols-2 xl:grid-cols-4">{draft.connections.map((item, index) => <div key={`${item.run}-${item.code}-${index}`} className="rounded-lg border border-slate-200 p-3"><p className="text-[10px] font-bold text-[#0043f3]">RUN {String.fromCharCode(64 + item.run)} · {item.code}</p><p className="mt-1 text-xs font-semibold">{item.label}</p><p className="mt-2 text-sm font-black">{item.quantity} each</p></div>)}</div></details><details className="group border-t border-slate-200"><summary className="cursor-pointer p-5 text-sm font-bold">Priced line items · {draft.lineItems.length} lines</summary><div className="overflow-x-auto border-t"><table className="w-full min-w-[700px] text-left text-xs"><thead className="bg-slate-100 text-slate-500"><tr>{["Code", "Item", "Quantity", "Rate", "Total"].map((label) => <th key={label} className="p-3">{label}</th>)}</tr></thead><tbody>{draft.lineItems.map((item, index) => <tr key={`${item.code}-${index}`} className="border-t"><td className="p-3 font-mono text-[#0043f3]">{item.code}</td><td className="p-3">{item.label}</td><td className="p-3">{amount(item.quantity, 2)} {item.unit}</td><td className="p-3">{money(item.unitRate)}</td><td className="p-3 font-bold">{money(item.total)}</td></tr>)}</tbody></table></div></details><p className="border-t bg-slate-50 p-4 text-xs leading-5 text-slate-600">Connection quantities and rates are provisional until bracket drawings, bolt specifications and foundation anchors are approved. Confirm cut lengths and bundles before dispatch.</p></section>

      <section id="benchmark" className="scroll-mt-24 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6"><Eyebrow>03 · Benchmark control</Eyebrow><h2 className="mt-2 text-xl font-black">Independent benchmark pending</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">The live guide is generated from the released Atlas rates, but we do not yet have a verified completed solar carport costing to compare against it. Add one supplier or completed-job schedule with steel mass, connections, fabrication, delivery and selling price before marking the benchmark verified.</p></section>

      <section id="pricing" className="scroll-mt-24 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 p-5 sm:p-6"><Eyebrow>04 · Pricing control</Eyebrow><h2 className="mt-2 text-xl font-black">Review the inputs before publishing.</h2><p className="mt-2 text-sm text-slate-600">Editing rates changes only this draft. The website and CRM continue using revision {release?.revision || "—"} until a new release is published.</p></div><div className="grid gap-4 p-5 xl:grid-cols-3">{GROUPS.map((group) => <div key={group.title} className="rounded-xl border border-slate-200 bg-slate-50 p-4"><h3 className="font-black">{group.title}</h3><div className="mt-4 space-y-4">{group.keys.map((key) => <label key={key} className="block text-[11px] font-bold text-slate-600">{SOLAR_COST_LABELS[key]}<input type="number" min="0" step="0.01" value={costs[key]} onChange={(event) => { setCosts((current) => ({ ...current, [key]: event.target.value === "" ? "" : Number(event.target.value) })); setMessage("") }} className={inputClass} /></label>)}</div></div>)}</div><div className="border-t border-slate-200 bg-[#f5f9ff] p-5 sm:p-6"><div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.85fr)]"><div><h3 className="font-black">Publish review</h3>{differences.length ? <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200 bg-white"><table className="w-full min-w-[440px] text-left text-xs"><thead className="bg-slate-50 text-slate-500"><tr><th className="p-3">Input</th><th className="p-3">Live</th><th className="p-3">Draft</th></tr></thead><tbody>{differences.map((key) => <tr key={key} className="border-t"><td className="p-3 font-semibold">{SOLAR_COST_LABELS[key]}</td><td className="p-3">{release ? amount(release.costs?.[key] ?? SOLAR_COST_DEFAULTS[key], 2) : "—"}</td><td className="p-3 font-bold text-[#0043f3]">{costs[key] === "" ? "Invalid" : amount(costs[key], 2)}</td></tr>)}</tbody></table></div> : <p className="mt-3 text-sm text-slate-500">No unpublished rate changes.</p>}</div><div><label className="text-xs font-bold text-slate-700">Revision note<textarea value={revisionNote} onChange={(event) => setRevisionNote(event.target.value)} maxLength={500} rows={3} placeholder="What changed, and why?" className={`${inputClass} resize-none`} /></label><p className="mt-2 text-xs text-slate-500">Required before publishing; 8–500 characters.</p><button type="button" onClick={publish} disabled={!canPublish} className="mt-4 w-full rounded-xl bg-[#0043f3] px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Publishing..." : "Publish pricing revision"}</button><button type="button" onClick={() => { setCosts({ ...SOLAR_COST_DEFAULTS, ...(release?.costs || {}) }); setRevisionNote("") }} disabled={!differences.length} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-600 disabled:opacity-50">Discard draft changes</button></div></div></div></section>
      {release?.history?.length ? <section className="rounded-2xl border border-slate-200 bg-white p-5"><Eyebrow>Release history</Eyebrow><div className="mt-3 divide-y divide-slate-100">{[...release.history].reverse().slice(0, 5).map((item) => <div key={item.revision} className="flex flex-wrap justify-between gap-2 py-3 text-xs"><span className="font-bold">Revision {item.revision} · {item.note || "No note recorded"}</span><span className="text-slate-500">{item.savedAt ? new Date(item.savedAt).toLocaleDateString("en-ZA") : ""}</span></div>)}</div></section> : null}
    </> : loading ? <div className="rounded-2xl border border-slate-200 bg-white p-10 text-sm text-slate-500">Loading solar pricing...</div> : null}
  </main>
}
