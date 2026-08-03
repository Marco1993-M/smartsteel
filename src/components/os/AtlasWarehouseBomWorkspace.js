"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, ArrowUpRight, Check, ChevronDown, GitBranch, Layers3, Plus, ShieldAlert } from "lucide-react"
import { getOsAuthHeaders } from "../../lib/osClientAuth"
import { getAtlasPricingCompleteness, summarizeAtlasPricing } from "../../lib/atlasCosting"

const LENGTHS = [4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48]
const BAY_SPACING = 4
const ROOF_PITCH_DEGREES = 15
const ROOF_PURLIN_ROWS = 8
const SCOPES = [
  { value: "structure", label: "Structure only" },
  { value: "roof", label: "Roof sheeted" },
  { value: "walls", label: "Fully enclosed" },
]

const CONTROLLED_LINES = [
  { lineNumber: 10, code: "W08-COL", title: "W08 column set", category: "Primary framing", unit: "set", scope: "standard", rule: "Portal count = length / 4 + 1", notes: "Column set for confirmed 3m to 5m W08 eave configurations.", profile: "Atlas lip channel column assembly", size: "3m to 5m eave · W08 geometry", material: "ZAM-coated structural steel", finish: "ZAM", use: "Forms the vertical support at every portal position.", specReady: true },
  { lineNumber: 20, code: "W08-RAF", title: "W08 dual-pitch rafter set", category: "Primary framing", unit: "set", scope: "standard", rule: "One rafter set per portal", notes: "Standard 8m-span dual-pitch rafter geometry.", profile: "Atlas lip channel rafter assembly", size: "8m span · dual pitch", material: "ZAM-coated structural steel", finish: "ZAM", use: "Forms the roof frame across each portal.", specReady: true },
  { lineNumber: 30, code: "W08-XBR", title: "W08 X-bracing set", category: "Bracing", unit: "set", scope: "standard", rule: "Braced bays at positions 1, 5, 9 and onward", notes: "Brace count follows the confirmed every-fourth-position sequence.", profile: "Atlas X-bracing assembly", size: "Matched to selected bay arrangement", material: "Structural steel · grade to be confirmed", finish: "Finish to be confirmed", use: "Provides longitudinal stability at confirmed braced bay positions.", specReady: false },
  { lineNumber: 40, code: "W08-SEC", title: "W08 purlin and wall-hat pack", category: "Secondary steel", unit: "m", scope: "standard", rule: "Eight roof rows at maximum 1500mm c/c; wall support follows selected scope", notes: "Includes confirmed roof purlin spacing and applicable wall support members.", profile: "Atlas secondary lipped-channel profile", size: "4m modules · maximum 1500mm c/c roof spacing", material: "ZAM-coated structural steel", finish: "ZAM", use: "Supports roof sheeting and selected wall sheeting.", specReady: true },
  { lineNumber: 50, code: "W08-CON", title: "W08 bolted connection set", category: "Connections and fittings", unit: "set", scope: "project_specific", rule: "Matched to portal and bracing count", notes: "Hold for approved Atlas connection schedule before final issue.", profile: "Brackets, bolts, nuts and washers", size: "Per approved W08 connection schedule", material: "Structural steel and graded fasteners", finish: "Corrosion-protection specification pending", use: "Connects columns, rafters, bracing and secondary members.", specReady: false },
  { lineNumber: 60, code: "W08-RCL", title: "W08 roof sheeting pack", category: "Cladding", unit: "m2", scope: "optional", rule: "Dual-pitch roof coverage plus standard allowance", notes: "Only included when roof sheeting is selected.", profile: "IBR roof sheeting", size: "Cut lengths from roof geometry · thickness to confirm", material: "Coated steel sheeting", finish: "Colour and coating selected per project", use: "Weatherproof roof covering for both roof slopes.", specReady: false },
  { lineNumber: 70, code: "W08-WCL", title: "W08 long-wall sheeting pack", category: "Cladding", unit: "m2", scope: "optional", rule: "Two long walls plus both closed gable ends", notes: "Closed gables are the default W08 sheeted configuration.", profile: "Corrugated, IBR, or concealed-fix wall sheeting", size: "3m to 5m wall height · 0.47mm standard thickness", material: "Galvanised or Chromadek coated steel", finish: "Galvanised or selected Chromadek colour", use: "Closes both long walls and the default closed gable ends.", specReady: true },
]

const CATEGORY_ORDER = ["Primary framing", "Bracing", "Secondary steel", "Connections and fittings", "Cladding"]

function scopeTone(scope) {
  if (scope === "standard") return "bg-sky-100 text-sky-700"
  if (scope === "optional") return "bg-violet-100 text-violet-700"
  return "bg-amber-100 text-amber-800"
}

function formatNumber(value, digits = 0) {
  return Number(value || 0).toLocaleString("en-ZA", { maximumFractionDigits: digits })
}

export default function AtlasWarehouseBomWorkspace() {
  const [records, setRecords] = useState([])
  const [components, setComponents] = useState([])
  const [pricingRecords, setPricingRecords] = useState([])
  const [familyId, setFamilyId] = useState("")
  const [length, setLength] = useState(20)
  const [scope, setScope] = useState("walls")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [expandedCode, setExpandedCode] = useState("W08-COL")
  const [viewMode, setViewMode] = useState("sales")

  async function loadWorkspace() {
    setLoading(true)
    setError("")
    try {
      const headers = await getOsAuthHeaders()
      const responses = await Promise.all([
        fetch("/api/os/boms?platform=atlas", { cache: "no-store", headers }),
        fetch("/api/os/catalog-items?platform=atlas&kind=component", { cache: "no-store", headers }),
        fetch("/api/os/product-families?platform=atlas", { cache: "no-store", headers }),
        fetch("/api/os/atlas-pricing?product=W08", { cache: "no-store", headers }),
      ])
      const payloads = await Promise.all(responses.map((response) => response.json()))
      const failedIndex = responses.findIndex((response) => !response.ok)
      if (failedIndex >= 0) throw new Error(payloads[failedIndex].error || "Could not load the W08 BOM workspace.")
      setRecords((payloads[0].records || []).filter((record) => record.code === "ATL-WH-8M-SHELL"))
      setComponents((payloads[1].records || []).filter((record) => record.productFamilyKey === "warehouses"))
      setFamilyId((payloads[2].records || []).find((family) => family.key === "warehouses")?.id || "")
      setPricingRecords(payloads[3].records || [])
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadWorkspace() }, [])

  const selectedScope = SCOPES.find((item) => item.value === scope) || SCOPES[0]
  const preview = useMemo(() => {
    const bays = length / BAY_SPACING
    const portals = bays + 1
    const roofSlopeLength = 4 / Math.cos((ROOF_PITCH_DEGREES * Math.PI) / 180)
    const roofRise = 4 * Math.tan((ROOF_PITCH_DEGREES * Math.PI) / 180)
    const roofSheetingArea = roofSlopeLength * 2 * length
    const wallSheetingArea = (2 * length * 3) + (2 * 8 * 3) + (8 * roofRise)
    return {
      dimensions: {
        bays,
        portals,
        xBraceSets: Math.ceil(bays / 4),
      },
      materials: {
        roofPurlinLengthMeters: ROOF_PURLIN_ROWS * length,
      },
      sheeting: {
        roofSheetingArea,
        wallSheetingArea,
      },
    }
  }, [length])
  const currentBom = [...records].sort((a, b) => Number(String(b.revisionCode).replace(/\D/g, "")) - Number(String(a.revisionCode).replace(/\D/g, "")))[0]
  const controlledBom = records.find((record) => record.revisionCode === "R2")
  const componentMap = new Map(components.map((component) => [component.title, component]))
  const componentCoverage = CONTROLLED_LINES.filter((line) => componentMap.has(line.title)).length
  const groupedLines = CATEGORY_ORDER.map((category) => ({
    category,
    lines: CONTROLLED_LINES.filter((line) => line.category === category),
  }))
  const previewValues = {
    "W08-COL": `${preview.dimensions.portals} portal sets`,
    "W08-RAF": `${preview.dimensions.portals} rafter sets`,
    "W08-XBR": `${preview.dimensions.xBraceSets} brace sets · bays 1, 5, 9...`,
    "W08-SEC": `${formatNumber(preview.materials.roofPurlinLengthMeters, 1)}m roof purlins`,
    "W08-CON": `${preview.dimensions.portals} portal connections + bracing`,
    "W08-RCL": scope === "structure" ? "Not selected" : `${formatNumber(preview.sheeting.roofSheetingArea, 1)}m²`,
    "W08-WCL": scope === "walls" ? `${formatNumber(preview.sheeting.wallSheetingArea, 1)}m²` : "Not selected",
  }
  const includedLineCount = CONTROLLED_LINES.filter((line) => !previewValues[line.code].includes("Not selected")).length
  const pricingSummary = summarizeAtlasPricing(pricingRecords)
  const pricingMap = new Map(pricingRecords.map((record) => [record.componentCode, record]))

  async function createControlledBom() {
    if (!familyId || controlledBom || componentCoverage !== CONTROLLED_LINES.length) return
    setSaving(true)
    setError("")
    setMessage("")
    try {
      let response = await fetch("/api/os/boms", {
        method: "POST",
        headers: await getOsAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ platformKey: "atlas", productFamilyId: familyId, code: "ATL-WH-8M-SHELL", title: "Atlas W08 controlled modular BOM", description: "Rule-based W08 baseline. Project quantities follow confirmed 4m bays, 1500mm purlin spacing, closed gables, and selected sheeting scope.", revisionCode: "R2", status: "needs_review", owner: "Marco" }),
      })
      let payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Could not create the controlled W08 BOM.")
      let nextBom = payload.record

      for (const line of CONTROLLED_LINES) {
        response = await fetch("/api/os/boms", {
          method: "PATCH",
          headers: await getOsAuthHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify({ action: "add_line", bomId: nextBom.id, componentId: componentMap.get(line.title)?.id, lineNumber: line.lineNumber, category: line.category, description: line.title, quantity: 1, unit: line.unit, wasteFactor: line.code.includes("CL") ? 0.1 : 0, scope: line.scope, notes: line.notes, quantityRule: line.rule, sourceCode: line.code }),
        })
        payload = await response.json()
        if (!response.ok) throw new Error(payload.error || `Could not add ${line.title}.`)
        nextBom = payload.record
      }
      setRecords((current) => [nextBom, ...current])
      setMessage("W08 R2 controlled BOM created. Review the connection schedule before approval.")
    } catch (saveError) {
      setError(saveError.message)
      await loadWorkspace()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5 px-3 py-4 sm:space-y-6 sm:px-6 sm:py-6">
      <section className="overflow-hidden rounded-[1.75rem] border border-[#001d2e] bg-[radial-gradient(circle_at_90%_0%,_rgba(193,217,229,0.2),_transparent_32%),linear-gradient(145deg,_#001d2e,_#0043f3)] text-white shadow-[0_22px_55px_rgba(0,29,46,0.2)]">
        <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
          <div><Link href="/os/atlas/components" className="inline-flex items-center gap-2 text-xs font-semibold text-[#c1d9e5] transition hover:text-white"><ArrowLeft className="h-3.5 w-3.5" /> W08 components</Link><p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-[#c1d9e5]">ATL-WH-8M-SHELL</p><h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] sm:text-5xl">A BOM that scales by bay.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-white/75">Keep one W08 product baseline, then calculate material quantities from modular length and selected sheeting scope.</p></div>
          <div className="rounded-2xl border border-white/15 bg-white/10 p-5"><div className="flex items-center justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#c1d9e5]">Current controlled revision</p><p className="mt-2 text-3xl font-bold">{loading ? "--" : controlledBom ? "R2" : currentBom?.revisionCode || "None"}</p></div><GitBranch className="h-8 w-8 text-[#c1d9e5]" /></div><p className="mt-3 text-xs leading-5 text-white/65">{controlledBom ? `${controlledBom.lines.length} rule-linked lines · ${controlledBom.status.replace("_", " ")}` : "R2 will preserve R1 and introduce controlled quantity rules."}</p></div>
        </div>
      </section>

      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
      {message ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}

      <section className="grid overflow-hidden rounded-[1.4rem] border border-slate-200 bg-white shadow-sm md:grid-cols-3">
        {[
          ["01", "Choose the building", "Set the modular length and decide whether sheeting is included."],
          ["02", "Read required quantities", "The schedule recalculates portals, steel, connections, and sheeting coverage."],
          ["03", "Open component details", "Check the profile, size, material, finish, use, and calculation before handoff."],
        ].map(([number, title, copy], index) => <div key={number} className={`p-5 sm:p-6 ${index < 2 ? "border-b border-slate-200 md:border-b-0 md:border-r" : ""}`}><div className="flex items-start gap-4"><span className="font-mono text-xs font-bold text-sky-700">{number}</span><div><h2 className="text-sm font-bold text-slate-950">{title}</h2><p className="mt-1.5 text-xs leading-5 text-slate-500">{copy}</p></div></div></div>)}
      </section>

      <section className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
        <aside className="border-b border-slate-200 bg-slate-50 p-4 sm:p-5">
          <div className="grid gap-4 xl:grid-cols-[minmax(210px,0.8fr)_minmax(460px,1.8fr)_110px_140px] xl:items-end">
            <div>
              <label className="text-xs font-semibold text-slate-700">Building length</label>
              <select value={length} onChange={(event) => setLength(Number(event.target.value))} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900">
                {LENGTHS.map((item) => <option key={item} value={item}>{item}m · {item / 4} bays</option>)}
              </select>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700">Commercial scope</p>
              <div className="mt-1 grid grid-cols-3 gap-1.5">
                {SCOPES.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setScope(item.value)}
                    className={`min-h-10 rounded-xl border px-2 py-2 text-center text-[11px] font-semibold leading-4 transition sm:text-xs ${
                      scope === item.value
                        ? "border-slate-950 bg-slate-950 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">Portals</p>
              <p className="mt-0.5 text-xl font-bold text-slate-950">{preview.dimensions.portals}</p>
            </div>
            <div className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2.5">
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-sky-700">Calculated steel</p>
              <p className="mt-0.5 text-xl font-bold text-slate-950">{ROOF_PURLIN_ROWS} rows</p>
            </div>
          </div>
        </aside>
        <article className="min-w-0 p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Quick material schedule</p><h2 className="mt-1 text-2xl font-bold text-slate-950">W08 · 8m x {length}m x 3m</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Scan the quantity first, then open any component for its profile, material, finish, use, and calculation basis.</p></div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-sky-100 px-3 py-1.5 text-xs font-bold text-sky-700">{selectedScope.label}</span>
              <div className="inline-flex rounded-full border border-slate-200 bg-slate-100 p-1">
                <button type="button" onClick={() => setViewMode("sales")} className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${viewMode === "sales" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"}`}>Sales view</button>
                <button type="button" onClick={() => setViewMode("technical")} className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${viewMode === "technical" ? "bg-slate-950 text-white" : "text-slate-500"}`}>Technical view</button>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            {viewMode === "sales" ? (
              <>
                <div className="rounded-xl bg-slate-950 p-3 text-white"><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">Included material groups</p><p className="mt-1 text-xl font-bold">{includedLineCount}</p></div>
                <div className="rounded-xl bg-slate-100 p-3"><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">Portal frames</p><p className="mt-1 text-xl font-bold text-slate-950">{preview.dimensions.portals}</p></div>
                <div className="rounded-xl bg-sky-50 p-3"><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-sky-700">Roof purlin rows</p><p className="mt-1 text-xl font-bold text-slate-950">{ROOF_PURLIN_ROWS}</p></div>
              </>
            ) : (
              <>
                <div className="rounded-xl bg-slate-950 p-3 text-white"><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">Component groups</p><p className="mt-1 text-xl font-bold">{CATEGORY_ORDER.length}</p></div>
                <div className="rounded-xl bg-slate-100 p-3"><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">Registered components</p><p className="mt-1 text-xl font-bold text-slate-950">{componentCoverage}/{CONTROLLED_LINES.length}</p></div>
                <div className={pricingSummary.holdCount ? "rounded-xl bg-amber-50 p-3" : "rounded-xl bg-emerald-50 p-3"}><p className={`text-[9px] font-bold uppercase tracking-[0.14em] ${pricingSummary.holdCount ? "text-amber-700" : "text-emerald-700"}`}>Pricing readiness</p><p className={`mt-1 text-xl font-bold ${pricingSummary.holdCount ? "text-amber-950" : "text-emerald-950"}`}>{pricingSummary.readyCount}/{pricingRecords.length || 0}</p></div>
              </>
            )}
          </div>

          <div className="mt-7 space-y-6">
            {groupedLines.map((group, groupIndex) => (
              <section key={group.category}>
                <div className="flex items-center gap-3 border-b border-slate-300 pb-2">
                  <span className="font-mono text-[10px] text-slate-400">{String(groupIndex + 1).padStart(2, "0")}</span>
                  <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-slate-700">{group.category}</h3>
                  <span className="ml-auto text-[10px] font-semibold text-slate-400">{group.lines.length} item{group.lines.length === 1 ? "" : "s"}</span>
                </div>
                <div className="divide-y divide-slate-200">
                  {group.lines.map((line) => {
                    const selected = !previewValues[line.code].includes("Not selected")
                    const registered = componentMap.has(line.title)
                    const pricingRecord = pricingMap.get(line.code)
                    const pricingCompleteness = pricingRecord ? getAtlasPricingCompleteness(pricingRecord) : null
                    const expanded = expandedCode === line.code
                    return (
                      <div key={line.code} className={selected ? "" : "opacity-45"}>
                        <button type="button" onClick={() => setExpandedCode(expanded ? "" : line.code)} className={`grid w-full gap-3 py-4 text-left sm:items-center ${viewMode === "sales" ? "sm:grid-cols-[minmax(0,1fr)_150px_110px_24px]" : "sm:grid-cols-[72px_minmax(0,1fr)_150px_24px]"}`}>
                          {viewMode === "technical" ? <span className="font-mono text-[11px] font-bold text-sky-700">{line.code}</span> : null}
                          <div>
                            <div className="flex flex-wrap items-center gap-2"><p className="text-sm font-bold text-slate-900">{line.title.replace(/^W08\s/, "")}</p>{viewMode === "technical" ? <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] ${scopeTone(line.scope)}`}>{line.scope.replace("_", " ")}</span> : null}</div>
                            <p className="mt-1 text-xs leading-5 text-slate-500">{viewMode === "sales" ? line.use : line.profile}</p>
                          </div>
                          <div className="sm:text-right"><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">Required quantity</p><p className="mt-1 text-sm font-bold text-slate-950">{previewValues[line.code]}</p></div>
                          {viewMode === "sales" ? <span className={`w-fit rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] ${selected ? scopeTone(line.scope) : "bg-slate-100 text-slate-500"}`}>{selected ? line.scope === "standard" ? "Included" : line.scope === "optional" ? "Selected" : "Confirm" : "Not selected"}</span> : null}
                          <ChevronDown className={`h-4 w-4 text-slate-400 transition ${expanded ? "rotate-180" : ""}`} />
                        </button>

                        {expanded ? (
                          <div className={`mb-4 border-l-4 border-sky-500 bg-slate-50 p-4 sm:p-5 ${viewMode === "technical" ? "sm:ml-[72px]" : ""}`}>
                            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                              <div><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">Component reference</p><p className="mt-1 font-mono text-xs font-bold text-sky-700">{line.code}</p></div>
                              <button type="button" onClick={(event) => { event.stopPropagation(); setViewMode("technical") }} className="text-xs font-bold text-sky-700">Open full technical view</button>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                              {[["Profile / component", line.profile], ["Size / geometry", line.size], ["Material", line.material], ["Finish", line.finish]].map(([label, value]) => <div key={label}><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">{label}</p><p className="mt-1.5 text-sm font-semibold leading-5 text-slate-800">{value}</p></div>)}
                            </div>
                            <div className="mt-5 grid gap-4 border-t border-slate-200 pt-4 sm:grid-cols-2">
                              <div><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">Where it is used</p><p className="mt-1.5 text-sm leading-6 text-slate-700">{line.use}</p></div>
                              <div><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">Quantity calculation</p><p className="mt-1.5 text-sm leading-6 text-slate-700">{line.rule}</p></div>
                            </div>
                            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                              <div className="flex items-center gap-2"><span className={`grid h-7 w-7 place-items-center rounded-lg ${registered ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"}`}>{registered ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}</span><p className="text-xs font-semibold text-slate-600">{registered ? "Registered component record" : "Component record still required"}</p></div>
                              <div className="flex flex-wrap gap-2">
                                <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] ${line.specReady ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{line.specReady ? "Specification ready" : "Specification to confirm"}</span>
                                <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] ${pricingCompleteness?.ready && pricingRecord?.status === "confirmed" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{pricingCompleteness?.ready && pricingRecord?.status === "confirmed" ? "Pricing approved" : pricingRecord ? "Pricing hold" : "Pricing not linked"}</span>
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        </article>
      </section>

      <section className="grid overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm lg:grid-cols-[minmax(0,1fr)_330px]">
        <div className="p-5 sm:p-7"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-sky-100 text-sky-700"><Layers3 className="h-5 w-5" /></span><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Controlled revision</p><h2 className="text-xl font-bold text-slate-950">Preserve R1, create R2</h2></div></div><p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">R2 links each BOM line to the registered W08 component and stores the quantity rule used by the modular calculator. It remains in review until the connection schedule is approved.</p><button type="button" onClick={createControlledBom} disabled={saving || loading || Boolean(controlledBom) || componentCoverage !== CONTROLLED_LINES.length} className="mt-5 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500">{saving ? "Creating R2..." : controlledBom ? "R2 already created" : componentCoverage !== CONTROLLED_LINES.length ? `Register ${CONTROLLED_LINES.length - componentCoverage} missing components first` : "Create controlled R2 BOM"}</button></div>
        <aside className="border-t border-slate-200 bg-amber-50 p-5 sm:p-7 lg:border-l lg:border-t-0"><span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-400 text-slate-950"><ShieldAlert className="h-5 w-5" /></span><p className="mt-4 text-sm font-bold text-slate-950">Approval hold point</p><p className="mt-2 text-sm leading-6 text-slate-700">Do not approve R2 until the W08 bolted connection schedule is confirmed. Pricing can continue from the verified calculator while that technical record remains visible.</p><Link href="/os/atlas/engineering" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-amber-900">Open engineering <ArrowUpRight className="h-4 w-4" /></Link></aside>
      </section>
    </div>
  )
}
