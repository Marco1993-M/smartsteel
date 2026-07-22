"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, ArrowUpRight, Check, ChevronDown, GitBranch, Layers3, Plus, ShieldAlert } from "lucide-react"
import { getOsAuthHeaders } from "../../lib/osClientAuth"
import { calculateLcssWarehouseEstimate } from "../../lib/estimates/warehouseEstimateLcss"

const LENGTHS = [10, 12.5, 15, 17.5, 20, 22.5, 25, 27.5, 30]
const SCOPES = [
  { value: "structure", label: "Structure only", cladding: "None", gableMode: "roof_only" },
  { value: "roof", label: "Roof sheeted", cladding: "IBR", gableMode: "roof_only" },
  { value: "walls", label: "Roof and walls sheeted", cladding: "IBR", gableMode: "fully_enclosed" },
]

const CONTROLLED_LINES = [
  { lineNumber: 10, code: "W08-COL", title: "W08 column set", category: "Primary framing", unit: "set", scope: "standard", rule: "Portal count = length / 2.5 + 1", notes: "Standard 3m-eave column set for each portal position.", profile: "Atlas lip channel column assembly", size: "3m eave · W08 geometry", material: "ZAM-coated structural steel", finish: "ZAM", use: "Forms the vertical support at every portal position.", specReady: true },
  { lineNumber: 20, code: "W08-RAF", title: "W08 dual-pitch rafter set", category: "Primary framing", unit: "set", scope: "standard", rule: "One rafter set per portal", notes: "Standard 8m-span dual-pitch rafter geometry.", profile: "Atlas lip channel rafter assembly", size: "8m span · dual pitch", material: "ZAM-coated structural steel", finish: "ZAM", use: "Forms the roof frame across each portal.", specReady: true },
  { lineNumber: 30, code: "W08-XBR", title: "W08 X-bracing set", category: "Bracing", unit: "set", scope: "standard", rule: "floor(bays / 4) + 1", notes: "Brace count scales with the modular bay count.", profile: "Atlas X-bracing assembly", size: "Matched to selected bay arrangement", material: "Structural steel · grade to be confirmed", finish: "Finish to be confirmed", use: "Provides longitudinal stability between selected portal bays.", specReady: false },
  { lineNumber: 40, code: "W08-SEC", title: "W08 purlin and wall-hat pack", category: "Secondary steel", unit: "m", scope: "standard", rule: "Calculated linear metres from length and selected scope", notes: "Includes roof purlins and applicable long-wall hats.", profile: "Top-hat secondary profile", size: "Cut schedule generated from building length", material: "ZAM-coated structural steel", finish: "ZAM", use: "Supports roof sheeting and selected long-wall sheeting.", specReady: true },
  { lineNumber: 50, code: "W08-CON", title: "W08 bolted connection set", category: "Connections and fittings", unit: "set", scope: "project_specific", rule: "Matched to portal and bracing count", notes: "Hold for approved Atlas connection schedule before final issue.", profile: "Brackets, bolts, nuts and washers", size: "Per approved W08 connection schedule", material: "Structural steel and graded fasteners", finish: "Corrosion-protection specification pending", use: "Connects columns, rafters, bracing and secondary members.", specReady: false },
  { lineNumber: 60, code: "W08-RCL", title: "W08 roof sheeting pack", category: "Cladding", unit: "m2", scope: "optional", rule: "Dual-pitch roof coverage plus standard allowance", notes: "Only included when roof sheeting is selected.", profile: "IBR roof sheeting", size: "Cut lengths from roof geometry · thickness to confirm", material: "Coated steel sheeting", finish: "Colour and coating selected per project", use: "Weatherproof roof covering for both roof slopes.", specReady: false },
  { lineNumber: 70, code: "W08-WCL", title: "W08 long-wall sheeting pack", category: "Cladding", unit: "m2", scope: "optional", rule: "Two long walls x length x eave height plus allowance", notes: "Both standard gable ends remain open.", profile: "IBR wall sheeting", size: "3m wall height · thickness to confirm", material: "Coated steel sheeting", finish: "Colour and coating selected per project", use: "Closes both long walls while standard gable ends remain open.", specReady: false },
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
  const [familyId, setFamilyId] = useState("")
  const [length, setLength] = useState(20)
  const [scope, setScope] = useState("structure")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [expandedCode, setExpandedCode] = useState("W08-COL")

  async function loadWorkspace() {
    setLoading(true)
    setError("")
    try {
      const headers = await getOsAuthHeaders()
      const responses = await Promise.all([
        fetch("/api/os/boms?platform=atlas", { cache: "no-store", headers }),
        fetch("/api/os/catalog-items?platform=atlas&kind=component", { cache: "no-store", headers }),
        fetch("/api/os/product-families?platform=atlas", { cache: "no-store", headers }),
      ])
      const payloads = await Promise.all(responses.map((response) => response.json()))
      const failedIndex = responses.findIndex((response) => !response.ok)
      if (failedIndex >= 0) throw new Error(payloads[failedIndex].error || "Could not load the W08 BOM workspace.")
      setRecords((payloads[0].records || []).filter((record) => record.code === "ATL-WH-8M-SHELL"))
      setComponents((payloads[1].records || []).filter((record) => record.productFamilyKey === "warehouses"))
      setFamilyId((payloads[2].records || []).find((family) => family.key === "warehouses")?.id || "")
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadWorkspace() }, [])

  const selectedScope = SCOPES.find((item) => item.value === scope) || SCOPES[0]
  const preview = useMemo(() => calculateLcssWarehouseEstimate({
    width: 8,
    length,
    wallHeight: 3,
    quantity: 1,
    steelFinish: "Galv",
    cladding: selectedScope.cladding,
    gableMode: selectedScope.gableMode,
    claddingInstalled: false,
  }), [length, selectedScope])
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
    "W08-XBR": `${preview.dimensions.xBraceSets || Math.floor(preview.dimensions.bays / 4) + 1} brace sets`,
    "W08-SEC": `${formatNumber(preview.materials.totalHatLengthMeters, 1)}m`,
    "W08-CON": `${preview.dimensions.portals} portal connections + bracing`,
    "W08-RCL": selectedScope.cladding === "None" ? "Not selected" : `${formatNumber(preview.sheeting.roofSheetingArea, 1)}m²`,
    "W08-WCL": scope === "walls" ? `${formatNumber(preview.sheeting.wallSheetingArea, 1)}m²` : "Not selected",
  }

  async function createControlledBom() {
    if (!familyId || controlledBom || componentCoverage !== CONTROLLED_LINES.length) return
    setSaving(true)
    setError("")
    setMessage("")
    try {
      let response = await fetch("/api/os/boms", {
        method: "POST",
        headers: await getOsAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ platformKey: "atlas", productFamilyId: familyId, code: "ATL-WH-8M-SHELL", title: "Atlas W08 controlled modular BOM", description: "Rule-based W08 baseline. Project quantities are generated from 2.5m bays and selected sheeting scope.", revisionCode: "R2", status: "needs_review", owner: "Marco" }),
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
      <section className="overflow-hidden rounded-[1.75rem] border border-slate-800 bg-[radial-gradient(circle_at_90%_0%,_rgba(14,165,233,0.2),_transparent_30%),linear-gradient(145deg,_#020617,_#172033)] text-white shadow-[0_22px_55px_rgba(15,23,42,0.16)]">
        <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
          <div><Link href="/os/atlas/components" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 transition hover:text-white"><ArrowLeft className="h-3.5 w-3.5" /> W08 components</Link><p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">ATL-WH-8M-SHELL</p><h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] sm:text-5xl">A BOM that scales by bay.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Keep one W08 product baseline, then calculate material quantities from modular length and selected sheeting scope.</p></div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5"><div className="flex items-center justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Current controlled revision</p><p className="mt-2 text-3xl font-bold">{loading ? "--" : controlledBom ? "R2" : currentBom?.revisionCode || "None"}</p></div><GitBranch className="h-8 w-8 text-amber-300" /></div><p className="mt-3 text-xs leading-5 text-slate-400">{controlledBom ? `${controlledBom.lines.length} rule-linked lines · ${controlledBom.status.replace("_", " ")}` : "R2 will preserve R1 and introduce controlled quantity rules."}</p></div>
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

      <section className="grid overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm xl:grid-cols-[330px_minmax(0,1fr)]">
        <aside className="border-b border-slate-200 bg-slate-50 p-5 sm:p-6 xl:border-b-0 xl:border-r">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Configuration preview</p>
          <div className="mt-5"><label className="text-xs font-semibold text-slate-700">Building length</label><select value={length} onChange={(event) => setLength(Number(event.target.value))} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900">{LENGTHS.map((item) => <option key={item} value={item}>{item}m · {item / 2.5} bays</option>)}</select></div>
          <div className="mt-4"><p className="text-xs font-semibold text-slate-700">Commercial scope</p><div className="mt-2 space-y-2">{SCOPES.map((item) => <button key={item.value} type="button" onClick={() => setScope(item.value)} className={`w-full rounded-xl border px-3 py-2.5 text-left text-xs font-semibold transition ${scope === item.value ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-700"}`}>{item.label}</button>)}</div></div>
          <div className="mt-5 grid grid-cols-2 gap-2"><div className="rounded-xl bg-white p-3"><p className="text-[10px] uppercase tracking-[0.12em] text-slate-400">Portals</p><p className="mt-1 text-xl font-bold text-slate-950">{preview.dimensions.portals}</p></div><div className="rounded-xl bg-white p-3"><p className="text-[10px] uppercase tracking-[0.12em] text-slate-400">Steel</p><p className="mt-1 text-xl font-bold text-slate-950">{formatNumber(preview.materials.totalSteelKg)}kg</p></div></div>
        </aside>
        <article className="min-w-0 p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Quick material schedule</p><h2 className="mt-1 text-2xl font-bold text-slate-950">W08 · 8m x {length}m x 3m</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Scan the quantity first, then open any component for its profile, material, finish, use, and calculation basis.</p></div>
            <span className="rounded-full bg-sky-100 px-3 py-1.5 text-xs font-bold text-sky-700">{selectedScope.label}</span>
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-950 p-3 text-white"><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">Component groups</p><p className="mt-1 text-xl font-bold">{CATEGORY_ORDER.length}</p></div>
            <div className="rounded-xl bg-slate-100 p-3"><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">Registered components</p><p className="mt-1 text-xl font-bold text-slate-950">{componentCoverage}/{CONTROLLED_LINES.length}</p></div>
            <div className="rounded-xl bg-amber-50 p-3"><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-amber-700">Specifications to confirm</p><p className="mt-1 text-xl font-bold text-amber-950">{CONTROLLED_LINES.filter((line) => !line.specReady).length}</p></div>
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
                    const expanded = expandedCode === line.code
                    return (
                      <div key={line.code} className={selected ? "" : "opacity-45"}>
                        <button type="button" onClick={() => setExpandedCode(expanded ? "" : line.code)} className="grid w-full gap-3 py-4 text-left sm:grid-cols-[72px_minmax(0,1fr)_150px_24px] sm:items-center">
                          <span className="font-mono text-[11px] font-bold text-sky-700">{line.code}</span>
                          <div>
                            <div className="flex flex-wrap items-center gap-2"><p className="text-sm font-bold text-slate-900">{line.title}</p><span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] ${scopeTone(line.scope)}`}>{line.scope.replace("_", " ")}</span></div>
                            <p className="mt-1 text-xs text-slate-500">{line.profile}</p>
                          </div>
                          <div className="sm:text-right"><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">Required quantity</p><p className="mt-1 text-sm font-bold text-slate-950">{previewValues[line.code]}</p></div>
                          <ChevronDown className={`h-4 w-4 text-slate-400 transition ${expanded ? "rotate-180" : ""}`} />
                        </button>

                        {expanded ? (
                          <div className="mb-4 border-l-4 border-sky-500 bg-slate-50 p-4 sm:ml-[72px] sm:p-5">
                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                              {[["Profile / component", line.profile], ["Size / geometry", line.size], ["Material", line.material], ["Finish", line.finish]].map(([label, value]) => <div key={label}><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">{label}</p><p className="mt-1.5 text-sm font-semibold leading-5 text-slate-800">{value}</p></div>)}
                            </div>
                            <div className="mt-5 grid gap-4 border-t border-slate-200 pt-4 sm:grid-cols-2">
                              <div><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">Where it is used</p><p className="mt-1.5 text-sm leading-6 text-slate-700">{line.use}</p></div>
                              <div><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">Quantity calculation</p><p className="mt-1.5 text-sm leading-6 text-slate-700">{line.rule}</p></div>
                            </div>
                            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                              <div className="flex items-center gap-2"><span className={`grid h-7 w-7 place-items-center rounded-lg ${registered ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"}`}>{registered ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}</span><p className="text-xs font-semibold text-slate-600">{registered ? "Registered component record" : "Component record still required"}</p></div>
                              <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] ${line.specReady ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{line.specReady ? "Specification ready" : "Specification to confirm"}</span>
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
