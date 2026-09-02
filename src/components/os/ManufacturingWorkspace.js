"use client"

import { useEffect, useState } from "react"
import { ArrowRight, CalendarDays, CheckCircle2, Factory, MapPin, PackageCheck, RefreshCw, Truck } from "lucide-react"
import { getOsAuthHeaders } from "../../lib/osClientAuth"

const STAGES = [
  ["production_planning", "Planning"],
  ["in_production", "In production"],
  ["ready_for_dispatch", "Dispatch ready"],
  ["delivered", "Delivered"],
  ["complete", "Complete"],
]

const NEXT_STAGE = Object.fromEntries(STAGES.slice(0, -1).map(([value], index) => [value, STAGES[index + 1][0]]))

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

  const active = records.filter((record) => normalizedStatus(record) !== "complete")
  const shown = filter === "active" ? active : records.filter((record) => normalizedStatus(record) === filter)
  const productionCount = records.filter((record) => normalizedStatus(record) === "in_production").length
  const dispatchCount = records.filter((record) => normalizedStatus(record) === "ready_for_dispatch").length

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
      <div className="mt-5 space-y-3">{loading ? <p className="py-12 text-center text-sm text-slate-500">Loading production orders...</p> : shown.length ? shown.map((record) => <ProductionCard key={record.id} record={record} saving={savingId === record.id} onMove={moveOrder} />) : <div className="grid min-h-52 place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center"><div><PackageCheck className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-3 font-bold text-slate-600">No orders in this stage.</p></div></div>}</div>
    </section>
  </div>
}

function Metric({ label, value }) {
  return <div className="bg-[#063379]/75 p-4"><p className="text-2xl font-black sm:text-3xl">{value}</p><p className="mt-1 text-[9px] font-bold uppercase tracking-[0.14em] text-blue-100 sm:text-[10px]">{label}</p></div>
}

function ProductionCard({ record, saving, onMove }) {
  const status = normalizedStatus(record)
  const currentIndex = Math.max(0, STAGES.findIndex(([value]) => value === status))
  const config = record.configuration || {}
  const next = NEXT_STAGE[status]
  return <article className="rounded-2xl border border-slate-200 p-4 sm:p-5"><div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-blue-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.13em] text-blue-800">AFGRI partner</span><span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.13em] text-emerald-800">{stageLabel(status)}</span></div><h3 className="mt-3 truncate text-xl font-black text-slate-950">{record.customerName}</h3><p className="mt-1 font-mono text-xs font-bold text-[#0043f3]">{record.afgriOrderReference || record.reference}</p></div><div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3"><Detail label="Configuration" value={`${config.width}m × ${config.length}m × ${config.wallHeight}m`} /><Detail label="Dispatch" value={formatDate(record.estimatedDispatchDate)} /><Detail label="Delivery" value={formatDate(record.estimatedDeliveryDate)} /></div></div>
    <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4"><div className="grid grid-cols-5 gap-1.5">{STAGES.map(([value, label], index) => <div key={value} className="min-w-0"><div className={`h-2 rounded-full ${index <= currentIndex ? "bg-[#0043f3]" : "bg-slate-200"}`} /><p className={`mt-1 hidden truncate text-[8px] font-bold sm:block ${index === currentIndex ? "text-[#0043f3]" : "text-slate-400"}`}>{label}</p></div>)}</div></div>
    <div className="mt-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">{record.siteLocation ? <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{record.siteLocation}</span> : null}{record.estimatedDispatchDate ? <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />Dispatch {formatDate(record.estimatedDispatchDate)}</span> : null}{status === "ready_for_dispatch" ? <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700"><Truck className="h-3.5 w-3.5" />Ready to move</span> : null}</div>{next ? <button type="button" disabled={saving} onClick={() => onMove(record, next)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#001d2e] px-4 text-xs font-black text-white disabled:opacity-50">{saving ? "Updating..." : `Move to ${stageLabel(next)}`}<ArrowRight className="h-4 w-4" /></button> : <span className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-50 px-4 text-xs font-black text-emerald-800"><CheckCircle2 className="h-4 w-4" />Order complete</span>}</div>
  </article>
}

function Detail({ label, value }) {
  return <div><p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">{label}</p><p className="mt-1 font-bold text-slate-800">{value}</p></div>
}
