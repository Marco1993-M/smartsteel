"use client"

import { useEffect, useState } from "react"
import { ArrowRight, CalendarDays, CheckCircle2, ChevronDown, ClipboardCheck, Factory, FileText, LockKeyhole, MapPin, PackageCheck, PauseCircle, Printer, RefreshCw, ShieldCheck, Truck, UserRound, X } from "lucide-react"
import { getOsAuthHeaders } from "../../lib/osClientAuth"

const STAGES = [
  ["production_planning", "Planning"],
  ["in_production", "In production"],
  ["ready_for_dispatch", "Dispatch ready"],
  ["delivered", "Delivered"],
  ["complete", "Complete"],
]

const NEXT_STAGE = Object.fromEntries(STAGES.slice(0, -1).map(([value], index) => [value, STAGES[index + 1][0]]))

const DEFAULT_CHECKLIST = [
  ["release", "Approved scope and configuration confirmed"],
  ["materials", "Material finish and quantities confirmed"],
  ["members", "Structural members manufactured"],
  ["connections", "Brackets and connection pack prepared"],
  ["quality", "Final quality check completed"],
  ["packaging", "Packaging and dispatch labels completed"],
].map(([id, label]) => ({ id, label, complete: false }))

function stageLabel(status) {
  return STAGES.find(([value]) => value === status)?.[1] || "Planning"
}

function normalizedStatus(record) {
  return record.fulfilmentStatus === "not_started" ? "production_planning" : record.fulfilmentStatus || "production_planning"
}

function formatDate(value) {
  if (!value) return "Not scheduled"
  return new Intl.DateTimeFormat("en-ZA", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${value}T12:00:00`))
}

export default function ManufacturingWorkspace() {
  const [records, setRecords] = useState([])
  const [filter, setFilter] = useState("active")
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState("")
  const [error, setError] = useState("")
  const [packRecord, setPackRecord] = useState(null)

  async function loadRecords() {
    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/os/partner-opportunities?partner=afgri", { cache: "no-store", headers: await getOsAuthHeaders() })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Could not load production orders.")
      setRecords((payload.records || []).filter((record) => record.status === "closed" && record.internalProjectId))
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadRecords() }, [])

  async function moveOrder(record, fulfilmentStatus) {
    setSavingId(record.id)
    setError("")
    try {
      const response = await fetch("/api/os/partner-opportunities", {
        method: "PATCH",
        headers: await getOsAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          id: record.id,
          action: "update_fulfilment",
          fulfilmentStatus,
          estimatedDispatchDate: record.estimatedDispatchDate || "",
          estimatedDeliveryDate: record.estimatedDeliveryDate || "",
          fulfilmentNote: record.fulfilmentNote || "",
        }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Could not update the production stage.")
      setRecords((current) => current.map((item) => item.id === payload.record.id ? payload.record : item))
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setSavingId("")
    }
  }

  async function updatePlan(record, plan) {
    setSavingId(record.id)
    setError("")
    try {
      const response = await fetch("/api/os/partner-opportunities", {
        method: "PATCH",
        headers: await getOsAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ id: record.id, action: "update_production_plan", ...plan }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Could not save the production plan.")
      setRecords((current) => current.map((item) => item.id === payload.record.id ? payload.record : item))
    } catch (saveError) {
      setError(saveError.message)
      throw saveError
    } finally {
      setSavingId("")
    }
  }

  async function updateRelease(record, release) {
    setSavingId(record.id)
    setError("")
    try {
      const response = await fetch("/api/os/partner-opportunities", {
        method: "PATCH",
        headers: await getOsAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          id: record.id,
          action: "release_production",
          release,
          releasedBy: "Smart Steel production team",
          revision: record.productionReleaseRevision || "R1",
          note: release ? "Configuration and production prerequisites checked." : "Release returned to planning for review.",
        }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Could not update the production release.")
      setRecords((current) => current.map((item) => item.id === payload.record.id ? payload.record : item))
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setSavingId("")
    }
  }

  const active = records.filter((record) => normalizedStatus(record) !== "complete")
  const shown = filter === "active" ? active : records.filter((record) => normalizedStatus(record) === filter)
  const productionCount = records.filter((record) => normalizedStatus(record) === "in_production").length
  const dispatchCount = records.filter((record) => normalizedStatus(record) === "ready_for_dispatch").length

  if (packRecord) return <ManufacturingPack record={packRecord} onClose={() => setPackRecord(null)} />

  return <div className="min-w-0 space-y-5 px-4 py-5 sm:px-6 sm:py-6">
    <section className="overflow-hidden rounded-[28px] border border-[#0043f3] bg-[linear-gradient(125deg,#001d2e_0%,#063379_58%,#0043f3_100%)] p-5 text-white shadow-xl sm:p-7">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div><div className="flex items-center gap-2 text-[#c1d9e5]"><Factory className="h-4 w-4" /><p className="text-[11px] font-bold uppercase tracking-[0.2em]">Manufacturing control</p></div><h1 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">From accepted order to delivery.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100">One operational view for planning, production, dispatch, and completed Atlas orders.</p></div>
        <button type="button" onClick={loadRecords} className="inline-flex min-h-11 items-center justify-center gap-2 border border-white/20 bg-white/10 px-4 text-sm font-bold hover:bg-white/15"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />Refresh</button>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-px overflow-hidden bg-white/15"><Metric label="Active orders" value={active.length} /><Metric label="In production" value={productionCount} /><Metric label="Dispatch ready" value={dispatchCount} /></div>
    </section>

    {error ? <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</p> : null}

    <section className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center"><div><p className="text-[11px] font-bold uppercase tracking-[0.17em] text-slate-500">Production queue</p><h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">Orders in motion</h2></div><div className="flex gap-2 overflow-x-auto">{[["active", "Active"], ...STAGES].map(([value, label]) => <button key={value} type="button" onClick={() => setFilter(value)} className={`whitespace-nowrap rounded-full px-3 py-2 text-xs font-bold ${filter === value ? "bg-[#001d2e] text-white" : "bg-slate-100 text-slate-600"}`}>{label}</button>)}</div></div>
      <div className="mt-5 space-y-3">{loading ? <p className="py-12 text-center text-sm text-slate-500">Loading production orders...</p> : shown.length ? shown.map((record) => <ProductionCard key={record.id} record={record} saving={savingId === record.id} onMove={moveOrder} onUpdatePlan={updatePlan} onUpdateRelease={updateRelease} onOpenPack={setPackRecord} />) : <div className="grid min-h-52 place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center"><div><PackageCheck className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-3 font-bold text-slate-600">No orders in this stage.</p></div></div>}</div>
    </section>
  </div>
}

function Metric({ label, value }) {
  return <div className="bg-[#063379]/75 p-4"><p className="text-2xl font-black sm:text-3xl">{value}</p><p className="mt-1 text-[9px] font-bold uppercase tracking-[0.14em] text-blue-100 sm:text-[10px]">{label}</p></div>
}

function ProductionCard({ record, saving, onMove, onUpdatePlan, onUpdateRelease, onOpenPack }) {
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(false)
  const [plan, setPlan] = useState(() => makePlan(record))
  const status = normalizedStatus(record)
  const currentIndex = Math.max(0, STAGES.findIndex(([value]) => value === status))
  const config = record.configuration || {}
  const next = NEXT_STAGE[status]
  const completedChecks = plan.manufacturingChecklist.filter((item) => item.complete).length
  const onHold = Boolean(record.productionHoldReason)
  const readiness = getReadiness(record, plan)
  const released = record.productionReleaseStatus === "released"
  useEffect(() => { setPlan(makePlan(record)) }, [record])
  async function savePlan() {
    setSaved(false)
    try {
      await onUpdatePlan(record, plan)
      setSaved(true)
      setEditing(false)
    } catch {
      // The workspace-level error keeps the failure visible.
    }
  }
  return <article className="rounded-2xl border border-slate-200 p-4 sm:p-5"><div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-blue-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.13em] text-blue-800">AFGRI partner</span><span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.13em] text-emerald-800">{stageLabel(status)}</span></div><h3 className="mt-3 truncate text-xl font-black text-slate-950">{record.customerName}</h3><p className="mt-1 font-mono text-xs font-bold text-[#0043f3]">{record.afgriOrderReference || record.reference}</p></div><div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3"><Detail label="Configuration" value={`${config.width}m × ${config.length}m × ${config.wallHeight}m`} /><Detail label="Dispatch" value={formatDate(record.estimatedDispatchDate)} /><Detail label="Delivery" value={formatDate(record.estimatedDeliveryDate)} /></div></div>
    <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4"><div className="grid grid-cols-5 gap-1.5">{STAGES.map(([value, label], index) => <div key={value} className="min-w-0"><div className={`h-2 rounded-full ${index <= currentIndex ? "bg-[#0043f3]" : "bg-slate-200"}`} /><p className={`mt-1 hidden truncate text-[8px] font-bold sm:block ${index === currentIndex ? "text-[#0043f3]" : "text-slate-400"}`}>{label}</p></div>)}</div></div>
    <div className="mt-4 grid gap-2 border-t border-slate-100 pt-4 sm:grid-cols-4"><PlanSignal icon={UserRound} label="Owner" value={record.productionOwner || "Unassigned"} warning={!record.productionOwner} /><PlanSignal icon={CalendarDays} label="Planned start" value={formatDate(record.plannedStartDate)} warning={!record.plannedStartDate} /><PlanSignal icon={CalendarDays} label="Target finish" value={formatDate(record.plannedCompletionDate)} warning={!record.plannedCompletionDate} /><PlanSignal icon={ClipboardCheck} label="Checklist" value={`${completedChecks} of ${plan.manufacturingChecklist.length}`} /></div>
    <div className={`mt-3 border p-4 ${released ? "border-emerald-300 bg-emerald-50" : readiness.ready ? "border-blue-300 bg-blue-50" : "border-amber-300 bg-amber-50"}`}>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div className="flex items-start gap-3">{released ? <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-700" /> : <LockKeyhole className={`mt-0.5 h-5 w-5 ${readiness.ready ? "text-blue-700" : "text-amber-700"}`} />}<div><p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Production release</p><p className="mt-1 text-sm font-black text-slate-950">{released ? `${record.productionReleaseRevision || "R1"} released for manufacture` : readiness.ready ? "Ready for release" : `${readiness.missing.length} requirement${readiness.missing.length === 1 ? "" : "s"} outstanding`}</p>{!released && readiness.missing.length ? <p className="mt-1 text-xs text-slate-600">{readiness.missing.join(" · ")}</p> : null}{released ? <p className="mt-1 text-xs text-slate-600">{record.productionReleasedBy} · {formatDateTime(record.productionReleasedAt)}</p> : null}</div></div><div className="flex gap-2"><button type="button" onClick={() => onOpenPack(record)} className="inline-flex min-h-10 items-center justify-center gap-2 border border-slate-300 bg-white px-3 text-xs font-black text-slate-800"><FileText className="h-4 w-4" />View pack</button><button type="button" disabled={saving || (!released && !readiness.ready)} onClick={() => onUpdateRelease(record, !released)} className={`min-h-10 px-3 text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-40 ${released ? "bg-slate-700" : "bg-[#0043f3]"}`}>{released ? "Revoke release" : "Release production"}</button></div></div>
    </div>
    {onHold ? <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-bold text-amber-900"><PauseCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>On hold: {record.productionHoldReason}</span></div> : null}
    <button type="button" onClick={() => setEditing((current) => !current)} className="mt-3 flex min-h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-700"><span>{editing ? "Close production plan" : "Manage production plan"}</span><ChevronDown className={`h-4 w-4 transition ${editing ? "rotate-180" : ""}`} /></button>
    {editing ? <ProductionPlanEditor plan={plan} setPlan={setPlan} saving={saving} onSave={savePlan} /> : saved ? <p className="mt-2 text-xs font-bold text-emerald-700">Production plan saved.</p> : null}
    <div className="mt-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">{record.siteLocation ? <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{record.siteLocation}</span> : null}{record.estimatedDispatchDate ? <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />Dispatch {formatDate(record.estimatedDispatchDate)}</span> : null}{status === "ready_for_dispatch" ? <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700"><Truck className="h-3.5 w-3.5" />Ready to move</span> : null}</div>{next ? <button type="button" disabled={saving || onHold || (next === "in_production" && !released)} onClick={() => onMove(record, next)} title={next === "in_production" && !released ? "Release the manufacturing pack before production starts." : onHold ? "Clear the production hold before advancing this order." : ""} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#001d2e] px-4 text-xs font-black text-white disabled:opacity-40">{saving ? "Updating..." : `Move to ${stageLabel(next)}`}<ArrowRight className="h-4 w-4" /></button> : <span className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-50 px-4 text-xs font-black text-emerald-800"><CheckCircle2 className="h-4 w-4" />Order complete</span>}</div>
  </article>
}

function getReadiness(record, plan) {
  const missing = []
  if (!record.productionOwner) missing.push("Assign owner")
  if (!record.plannedStartDate) missing.push("Set start date")
  if (!record.plannedCompletionDate) missing.push("Set finish date")
  if (record.productionHoldReason) missing.push("Clear hold")
  if (!plan.manufacturingChecklist.some((item) => item.id === "release" && item.complete)) missing.push("Approve scope")
  if (!plan.manufacturingChecklist.some((item) => item.id === "materials" && item.complete)) missing.push("Confirm materials")
  return { ready: missing.length === 0, missing }
}

function formatDateTime(value) {
  if (!value) return "Not recorded"
  return new Intl.DateTimeFormat("en-ZA", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value))
}

function makePlan(record) {
  return {
    productionOwner: record.productionOwner || "",
    plannedStartDate: record.plannedStartDate || "",
    plannedCompletionDate: record.plannedCompletionDate || "",
    productionHoldReason: record.productionHoldReason || "",
    manufacturingChecklist: record.manufacturingChecklist?.length ? record.manufacturingChecklist : DEFAULT_CHECKLIST,
  }
}

function ProductionPlanEditor({ plan, setPlan, saving, onSave }) {
  function update(field, value) { setPlan((current) => ({ ...current, [field]: value })) }
  function toggleCheck(id) { setPlan((current) => ({ ...current, manufacturingChecklist: current.manufacturingChecklist.map((item) => item.id === id ? { ...item, complete: !item.complete } : item) })) }
  return <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50/60 p-4"><div className="grid gap-3 sm:grid-cols-3"><Field label="Production owner"><input value={plan.productionOwner} onChange={(event) => update("productionOwner", event.target.value)} placeholder="Assign team member" /></Field><Field label="Planned start"><input type="date" value={plan.plannedStartDate} onChange={(event) => update("plannedStartDate", event.target.value)} /></Field><Field label="Planned completion"><input type="date" value={plan.plannedCompletionDate} onChange={(event) => update("plannedCompletionDate", event.target.value)} /></Field></div><div className="mt-4"><p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Manufacturing checklist</p><div className="mt-2 grid gap-2 lg:grid-cols-2">{plan.manufacturingChecklist.map((item) => <button key={item.id} type="button" onClick={() => toggleCheck(item.id)} className={`flex min-h-11 items-center gap-3 rounded-xl border px-3 text-left text-xs font-bold ${item.complete ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-white text-slate-700"}`}><span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${item.complete ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300"}`}>{item.complete ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}</span>{item.label}</button>)}</div></div><Field label="Hold reason"><textarea rows="2" value={plan.productionHoldReason} onChange={(event) => update("productionHoldReason", event.target.value)} placeholder="Leave blank when the order can proceed" /></Field><button type="button" disabled={saving} onClick={onSave} className="mt-3 min-h-11 w-full rounded-xl bg-[#0043f3] px-4 text-xs font-black text-white disabled:opacity-50">{saving ? "Saving..." : "Save production plan"}</button></div>
}

function ManufacturingPack({ record, onClose }) {
  const config = record.configuration || {}
  const checklist = record.manufacturingChecklist?.length ? record.manufacturingChecklist : DEFAULT_CHECKLIST
  const released = record.productionReleaseStatus === "released"
  const scope = config.gableMode === "structure_only" ? "Structure only" : config.gableMode === "roof_only" ? "Roof sheeted" : "Roof and side walls sheeted"
  return <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/75 p-3 backdrop-blur-sm print:static print:bg-white print:p-0">
    <div className="mx-auto mb-3 flex max-w-[210mm] items-center justify-between gap-3 print:hidden"><p className="text-sm font-bold text-white">Internal manufacturing pack</p><div className="flex gap-2"><button type="button" onClick={() => window.print()} className="inline-flex min-h-11 items-center gap-2 bg-white px-4 text-sm font-black text-slate-950"><Printer className="h-4 w-4" />Print / save PDF</button><button type="button" onClick={onClose} className="grid h-11 w-11 place-items-center border border-white/30 text-white"><X className="h-5 w-5" /></button></div></div>
    <article className="mx-auto min-h-[297mm] w-full max-w-[210mm] bg-white p-7 text-slate-950 shadow-2xl print:min-h-0 print:max-w-none print:p-[14mm] print:shadow-none sm:p-10">
      <header className="border-b-4 border-[#0043f3] pb-6"><div className="flex items-start justify-between gap-6"><div><p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#0043f3]">Atlas System · Manufacturing</p><h1 className="mt-3 text-3xl font-black tracking-[-0.04em]">Production pack</h1><p className="mt-2 font-mono text-sm font-bold text-slate-500">{record.afgriOrderReference || record.reference}</p></div><span className={`border px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] ${released ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-amber-400 bg-amber-50 text-amber-900"}`}>{released ? `Released · ${record.productionReleaseRevision || "R1"}` : "Not released"}</span></div></header>
      <section className="mt-7 grid gap-px bg-slate-200 sm:grid-cols-2"><PackDetail label="Customer / project" value={record.customerName} /><PackDetail label="Internal project" value={record.internalProjectId} /><PackDetail label="Configuration" value={`${config.width || "-"}m × ${config.length || "-"}m × ${config.wallHeight || "-"}m`} /><PackDetail label="Scope" value={scope} /><PackDetail label="Steel finish" value={config.steelFinish || "Not confirmed"} /><PackDetail label="Sheeting" value={scope === "Structure only" ? "Not included" : `${config.sheetingProfile || "IBR"} · ${config.sheetingFinish || "Galvanised"}`} /><PackDetail label="Production owner" value={record.productionOwner || "Unassigned"} /><PackDetail label="Planned window" value={`${formatDate(record.plannedStartDate)} – ${formatDate(record.plannedCompletionDate)}`} /></section>
      <section className="mt-8"><div className="flex items-end justify-between gap-4 border-b border-slate-300 pb-3"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Release checks</p><h2 className="mt-1 text-xl font-black">Manufacturing readiness</h2></div><p className="text-xs font-bold text-slate-500">{checklist.filter((item) => item.complete).length} / {checklist.length} complete</p></div><div className="mt-3 divide-y divide-slate-200">{checklist.map((item, index) => <div key={item.id} className="grid grid-cols-[28px_1fr_auto] items-center gap-3 py-3"><span className="font-mono text-[10px] text-slate-400">{String(index + 1).padStart(2, "0")}</span><p className="text-sm font-bold">{item.label}</p><span className={`text-[10px] font-black uppercase tracking-[0.1em] ${item.complete ? "text-emerald-700" : "text-amber-700"}`}>{item.complete ? "Complete" : "Open"}</span></div>)}</div></section>
      <section className="mt-8 border border-slate-300 p-5"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Controlled material schedule</p><h2 className="mt-1 text-xl font-black">Approved BOM required for issue</h2><p className="mt-3 text-sm leading-6 text-slate-600">This pack confirms the production instruction and configuration. Component quantities, cut lengths, connection hardware, drawings, and labels must be issued from the approved Atlas product BOM before manufacture begins.</p></section>
      {record.productionHoldReason ? <section className="mt-5 border border-amber-300 bg-amber-50 p-4"><p className="text-[10px] font-black uppercase tracking-[0.15em] text-amber-800">Production hold</p><p className="mt-2 text-sm font-bold text-amber-950">{record.productionHoldReason}</p></section> : null}
      <footer className="mt-10 grid gap-4 border-t border-slate-300 pt-5 text-xs text-slate-500 sm:grid-cols-2"><div><p className="font-black uppercase tracking-[0.12em] text-slate-800">Release record</p><p className="mt-2">{released ? `${record.productionReleasedBy} · ${formatDateTime(record.productionReleasedAt)}` : "Release authority not yet recorded."}</p></div><div className="sm:text-right"><p className="font-black uppercase tracking-[0.12em] text-slate-800">Source references</p><p className="mt-2">Partner: {record.reference}<br />Order: {record.afgriOrderReference || "Temporary reference"}</p></div></footer>
    </article>
  </div>
}

function PackDetail({ label, value }) {
  return <div className="bg-slate-50 p-4"><p className="text-[9px] font-black uppercase tracking-[0.13em] text-slate-400">{label}</p><p className="mt-1.5 text-sm font-black text-slate-900">{value || "Not recorded"}</p></div>
}

function Field({ label, children }) {
  return <label className="mt-3 block text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">{label}<span className="mt-1.5 block [&>input]:min-h-11 [&>input]:w-full [&>input]:rounded-xl [&>input]:border [&>input]:border-slate-200 [&>input]:bg-white [&>input]:px-3 [&>input]:text-base [&>textarea]:w-full [&>textarea]:rounded-xl [&>textarea]:border [&>textarea]:border-slate-200 [&>textarea]:bg-white [&>textarea]:p-3 [&>textarea]:text-base [&>textarea]:normal-case [&>textarea]:tracking-normal">{children}</span></label>
}

function PlanSignal({ icon: Icon, label, value, warning = false }) {
  return <div className={`rounded-xl p-3 ${warning ? "bg-amber-50" : "bg-slate-50"}`}><div className="flex items-center gap-2"><Icon className={`h-3.5 w-3.5 ${warning ? "text-amber-600" : "text-slate-400"}`} /><p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">{label}</p></div><p className={`mt-1 text-xs font-black ${warning ? "text-amber-800" : "text-slate-800"}`}>{value}</p></div>
}

function Detail({ label, value }) {
  return <div><p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">{label}</p><p className="mt-1 font-bold text-slate-800">{value}</p></div>
}
