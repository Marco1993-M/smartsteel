"use client"

import { useEffect, useState } from "react"
import { ArrowRight, Building2, CheckCircle2, Clock3, FileCheck2, Inbox, Mail, MapPin, PackageCheck, Phone, RefreshCw, Search, UserRound, X } from "lucide-react"
import { getOsAuthHeaders } from "../../lib/osClientAuth"
import PartnerOpportunityReviewDrawer from "./PartnerOpportunityReviewDrawer"

const STATUS_META = {
  submitted: { label: "New request", className: "bg-amber-100 text-amber-800", action: "Begin review", next: "in_review" },
  in_review: { label: "In review", className: "bg-blue-100 text-blue-800", action: "Approve price", next: "quoted" },
  changes_requested: { label: "Partner update", className: "bg-orange-100 text-orange-800", action: "Resume review", next: "in_review" },
  quoted: { label: "Price approved", className: "bg-emerald-100 text-emerald-800", action: "Accept Partner instruction", next: "closed" },
  closed: { label: "Order active", className: "bg-blue-100 text-blue-800", action: "", next: "closed" },
}

const money = new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 })

const FULFILMENT_STEPS = [
  ["production_planning", "Planning"],
  ["in_production", "In production"],
  ["ready_for_dispatch", "Dispatch ready"],
  ["delivered", "Delivered"],
  ["complete", "Complete"],
]

function isActiveOrder(record) {
  return record.status === "closed" && !["complete", "cancelled"].includes(record.fulfilmentStatus)
}

export default function PartnerOpportunityWorkspace({ partnerKey = "afgri" }) {
  const [records, setRecords] = useState([])
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState("active")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [reviewNotes, setReviewNotes] = useState("")
  const [quoteResponse, setQuoteResponse] = useState({ finalQuoteAmountExVat: "", quoteUrl: "", partnerQuoteMessage: "" })

  async function loadRecords() {
    setLoading(true)
    setError("")
    try {
      const response = await fetch(`/api/os/partner-opportunities?partner=${encodeURIComponent(partnerKey)}`, { cache: "no-store", headers: await getOsAuthHeaders() })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Could not load Partner opportunities.")
      setRecords(payload.records || [])
      if (!payload.schemaReady) setError("Run the partner portal foundation SQL to activate the opportunity queue.")
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadRecords() }, [])

  function openRecord(record) {
    setSelected(record)
    setReviewNotes(record.internalReviewNotes || "")
    setQuoteResponse({
      finalQuoteAmountExVat: record.finalQuoteAmountExVat ?? record.proposedQuote?.amountExVat ?? record.indicativeAmountExVat ?? "",
      quoteUrl: record.quoteUrl || "",
      partnerQuoteMessage: record.partnerQuoteMessage || "",
    })
  }

  async function deleteOpportunity() {
    if (saving || !selected || !window.confirm(`Permanently delete opportunity ${selected.reference}? Its review and handoff history will also be removed.`)) return
    setSaving(true)
    setError("")
    try {
      const response = await fetch(`/api/os/partner-opportunities?id=${encodeURIComponent(selected.id)}`, {
        method: "DELETE",
        headers: await getOsAuthHeaders(),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Could not delete the opportunity.")
      setRecords(current => current.filter(record => record.id !== payload.id))
      setSelected(null)
    } catch (deleteError) {
      setError(deleteError.message)
    } finally {
      setSaving(false)
    }
  }

  async function advanceRecord(status, extra = {}) {
    setSaving(true)
    setError("")
    try {
      const response = await fetch("/api/os/partner-opportunities", {
        method: "PATCH",
        headers: await getOsAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ id: selected.id, status, internalReviewNotes: reviewNotes, ...quoteResponse, ...extra }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Could not update the opportunity.")
      setSelected(payload.record)
      setRecords((current) => current.map((record) => record.id === payload.record.id ? payload.record : record))
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setSaving(false)
    }
  }

  async function updateFulfilment(fields) {
    setSaving(true)
    setError("")
    try {
      const response = await fetch("/api/os/partner-opportunities", {
        method: "PATCH",
        headers: await getOsAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ id: selected.id, action: "update_fulfilment", ...fields }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Could not update fulfilment.")
      setSelected(payload.record)
      setRecords((current) => current.map((record) => record.id === payload.record.id ? payload.record : record))
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setSaving(false)
    }
  }

  const opportunities = records.filter((record) => record.status !== "closed")
  const filtered = filter === "active"
    ? opportunities
    : filter === "orders"
      ? records.filter(isActiveOrder)
      : filter === "complete"
        ? records.filter((record) => record.status === "closed" && record.fulfilmentStatus === "complete")
        : records.filter((record) => record.status === filter)
  const shown = filtered.filter(record => [record.customerName, record.reference, record.partner?.name, record.siteLocation, record.afgriOrderReference].some(value => String(value || "").toLowerCase().includes(search.trim().toLowerCase())))
  const newCount = records.filter((record) => record.status === "submitted").length
  const reviewingCount = records.filter((record) => record.status === "in_review").length
  const changesCount = records.filter((record) => record.status === "changes_requested").length
  const quotedCount = records.filter((record) => record.status === "quoted").length
  const orderCount = records.filter(isActiveOrder).length

  return (
    <div className="min-w-0 space-y-5 px-4 py-5 sm:px-6 sm:py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#001d2e]">Project pipeline</h2>
          <p className="mt-1 text-sm text-slate-500">Select a stage to review its projects.</p>
        </div>
        <button type="button" onClick={loadRecords} disabled={loading} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh</button>
      </div>

      {error ? <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p> : null}

      <nav aria-label="Pipeline stages" className="grid grid-cols-2 gap-2 lg:grid-cols-5">
        {[
          ["submitted", "New requests", newCount, "Ready for your review"],
          ["in_review", "In review", reviewingCount, "Confirm scope and pricing"],
          ["changes_requested", "With partner", changesCount, "Awaiting project updates"],
          ["quoted", "Price approved", quotedCount, "Awaiting order instruction"],
          ["orders", "Active orders", orderCount, "Track production and delivery"],
        ].map(([value, label, count, hint]) => (
          <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(filter === value ? "active" : value)} className={`rounded-2xl border p-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0043f3] ${filter === value ? "border-[#0043f3] bg-blue-50 ring-1 ring-[#0043f3]" : "border-slate-200 bg-white hover:border-blue-300"}`}>
            <div className="flex items-center justify-between gap-2"><span className="text-xs font-semibold text-slate-600">{label}</span><ArrowRight className={`h-3.5 w-3.5 ${filter === value ? "text-[#0043f3]" : "text-slate-300"}`} /></div>
            <p className="mt-2 text-3xl font-bold tracking-tight text-[#001d2e]">{loading ? "—" : count}</p>
            <p className="mt-2 text-xs text-slate-500">{hint}</p>
          </button>
        ))}
      </nav>

      <section aria-busy={loading} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
          <div className="flex flex-wrap gap-1">
            {[["active", "All opportunities", opportunities.length], ["orders", "Orders", orderCount], ["complete", "Completed", records.filter(record => record.status === "closed" && record.fulfilmentStatus === "complete").length]].map(([value, label, count]) => <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)} className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${filter === value ? "bg-[#001d2e] text-white" : "text-slate-500 hover:bg-slate-100"}`}>{label}<span className="ml-2 opacity-60">{loading ? "—" : count}</span></button>)}
          </div>
          <label className="flex min-h-10 w-full items-center gap-2 rounded-xl border border-slate-200 px-3 sm:w-64"><Search className="h-4 w-4 shrink-0 text-slate-400" /><input aria-label="Search partner projects" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search name or reference…" className="min-w-0 w-full bg-transparent py-2 text-sm outline-none" /></label>
        </div>
        <div className="p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3"><h3 className="text-sm font-bold text-[#001d2e]">{filter === "active" ? "Open opportunities" : filter === "orders" ? "Active orders" : filter === "complete" ? "Completed projects" : filter === "changes_requested" ? "With partner" : STATUS_META[filter]?.label}</h3><span className="text-xs text-slate-500" aria-live="polite">{loading ? "Loading…" : `${shown.length} project${shown.length === 1 ? "" : "s"}`}</span></div>
          <div className="space-y-3">
            {loading ? <p className="py-10 text-center text-sm text-slate-500">Loading opportunities...</p> : shown.length === 0 ? <div className="grid min-h-40 place-items-center rounded-xl bg-slate-50 p-5 text-center"><div><Inbox className="mx-auto h-6 w-6 text-slate-300" /><p className="mt-3 text-sm font-semibold text-slate-600">{search ? "No projects match your search." : "No projects at this stage yet."}</p><p className="mt-1 text-xs text-slate-500">{search ? "Try a customer name or opportunity reference." : "Submitted partner requests will appear here."}</p></div></div> : shown.map(record => <OpportunityRow key={record.id} record={record} onOpen={() => openRecord(record)} />)}
          </div>
        </div>
      </section>

      {selected ? <PartnerOpportunityReviewDrawer record={selected} notes={reviewNotes} setNotes={setReviewNotes} quoteResponse={quoteResponse} setQuoteResponse={setQuoteResponse} saving={saving} onClose={() => setSelected(null)} onAdvance={advanceRecord} onFulfilmentUpdate={updateFulfilment} onDelete={deleteOpportunity} deleteError={error} /> : null}
    </div>
  )
}

function OpportunityRow({ record, onOpen }) {
  const meta = STATUS_META[record.status] || STATUS_META.submitted
  const config = record.configuration || {}
  const order = record.status === "closed"
  return <button type="button" onClick={onOpen} className="grid w-full gap-4 rounded-2xl border border-slate-200 p-4 text-left transition hover:border-[#0043f3] hover:bg-blue-50/30 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto] sm:items-center"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="truncate font-black text-slate-950">{record.customerName}</p><span className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] ${meta.className}`}>{meta.label}</span>{record.partnerOrderStatus === "ready_for_order" ? <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-blue-800">Partner action</span> : null}{record.partnerOrderStatus === "order_submitted" ? <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-emerald-800">Order received</span> : null}</div><p className="mt-1 truncate text-xs text-slate-500">{record.reference} · {record.partner?.name || "Partner"}</p></div><div><p className="font-bold text-slate-900">W{String(config.width || "").padStart(2, "0")} · {config.width}m × {config.length}m × {config.wallHeight}m</p><p className="mt-1 text-xs text-slate-500">{config.steelFinish} · {config.gableMode === "structure_only" ? "Structure only" : "Sheeting selected"}</p>{record.afgriOrderReference ? <p className="mt-1 font-mono text-[10px] font-bold text-emerald-700">{record.afgriOrderReference}</p> : null}</div><div className="flex items-center justify-between gap-4 sm:justify-end"><p className="font-black text-[#0043f3]">{money.format(record.indicativeAmountExVat)}</p><ArrowRight className="h-4 w-4 text-slate-400" /></div>{order ? <div className="sm:col-span-3"><OrderProgress status={record.fulfilmentStatus} /></div> : null}</button>
}

function OrderProgress({ status = "production_planning" }) {
  const currentIndex = Math.max(0, FULFILMENT_STEPS.findIndex(([value]) => value === status))
  return <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 sm:p-4"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2 text-emerald-800"><PackageCheck className="h-4 w-4" /><p className="text-[10px] font-black uppercase tracking-[0.14em]">Order progress</p></div><p className="text-xs font-black text-emerald-800">{FULFILMENT_STEPS[currentIndex]?.[1]}</p></div><div className="mt-3 grid grid-cols-5 gap-1.5">{FULFILMENT_STEPS.map(([value, label], index) => <div key={value} className="min-w-0"><div className={`h-1.5 rounded-full ${index <= currentIndex ? "bg-[#0043f3]" : "bg-slate-200"}`} /><p className={`mt-1 hidden truncate text-[8px] font-bold sm:block ${index === currentIndex ? "text-[#0043f3]" : "text-slate-400"}`}>{label}</p></div>)}</div></div>
}

function OpportunityDrawer({ record, notes, setNotes, quoteResponse, setQuoteResponse, saving, onClose, onAdvance }) {
  const meta = STATUS_META[record.status] || STATUS_META.submitted
  const config = record.configuration || {}
  return <div className="fixed inset-0 z-[100] bg-[#001d2e]/45 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><aside className="ml-auto flex h-full w-full max-w-xl flex-col bg-white shadow-2xl"><header className="border-b border-slate-200 p-5 sm:p-6"><div className="flex items-start justify-between gap-5"><div><span className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] ${meta.className}`}>{meta.label}</span><h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-slate-950">{record.customerName}</h2><p className="mt-1 text-sm text-slate-500">{record.reference}</p></div><button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-slate-100" aria-label="Close"><X className="h-5 w-5" /></button></div></header><div className="flex-1 space-y-6 overflow-y-auto p-5 sm:p-6"><section><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Customer</p><div className="mt-3 grid gap-2"><ContactLine icon={UserRound} value={record.customerName} />{record.customerPhone ? <ContactLine icon={Phone} value={record.customerPhone} /> : null}{record.customerEmail ? <ContactLine icon={Mail} value={record.customerEmail} /> : null}{record.siteLocation ? <ContactLine icon={MapPin} value={record.siteLocation} /> : null}</div></section><section className="rounded-2xl bg-[#eef4f8] p-5"><div className="flex items-center gap-3"><Building2 className="h-5 w-5 text-[#0043f3]" /><div><p className="font-black">{record.product?.name || "Atlas Warehouse"}</p><p className="text-xs text-slate-500">Release {record.product?.releaseVersion || "—"}</p></div></div><div className="mt-5 grid grid-cols-2 gap-4 text-sm"><Detail label="Size" value={`${config.width}m × ${config.length}m × ${config.wallHeight}m`} /><Detail label="Steel finish" value={config.steelFinish} /><Detail label="Sheeting" value={config.gableMode === "structure_only" ? "Structure only" : config.gableMode} /><Detail label="Guide excl. VAT" value={money.format(record.indicativeAmountExVat)} /></div></section>{record.partnerNotes ? <section><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Salesperson notes</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{record.partnerNotes}</p></section> : null}<label className="block"><span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Internal review note</span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows="4" placeholder="Record the next step or anything the team must confirm." className="mt-2 w-full rounded-xl border border-slate-300 p-4 text-base outline-none focus:border-[#0043f3]" /></label>{record.status === "in_review" || record.status === "quoted" ? <section className="rounded-2xl border border-blue-200 bg-blue-50 p-4"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#0043f3]">Partner quote response</p><div className="mt-4 space-y-3"><QuoteField label="Final amount excl. VAT"><input type="number" min="0" step="0.01" value={quoteResponse.finalQuoteAmountExVat} onChange={(event) => setQuoteResponse((current) => ({ ...current, finalQuoteAmountExVat: event.target.value }))} /></QuoteField><QuoteField label="Quote link"><input value={quoteResponse.quoteUrl} onChange={(event) => setQuoteResponse((current) => ({ ...current, quoteUrl: event.target.value }))} placeholder="/quotes/... or https://..." /></QuoteField><QuoteField label="Message to salesperson"><textarea rows="3" value={quoteResponse.partnerQuoteMessage} onChange={(event) => setQuoteResponse((current) => ({ ...current, partnerQuoteMessage: event.target.value }))} placeholder="Optional short handoff note" /></QuoteField></div></section> : null}</div><footer className="border-t border-slate-200 bg-white p-4 sm:p-5"><button type="button" disabled={saving} onClick={() => onAdvance(meta.next)} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0043f3] px-5 text-sm font-black text-white disabled:opacity-50">{record.status === "in_review" ? <FileCheck2 className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}{saving ? "Saving..." : meta.action}</button></footer></aside></div>
}

function ContactLine({ icon: Icon, value }) { return <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm"><Icon className="h-4 w-4 shrink-0 text-slate-400" /><span className="min-w-0 break-words font-semibold text-slate-700">{value}</span></div> }
function Detail({ label, value }) { return <div><p className="text-xs text-slate-500">{label}</p><p className="mt-1 font-black text-slate-900">{value || "—"}</p></div> }
function QuoteField({ label, children }) { return <label className="block text-xs font-bold text-slate-700">{label}<span className="mt-1.5 block [&>input]:min-h-11 [&>input]:w-full [&>input]:rounded-xl [&>input]:border [&>input]:border-blue-200 [&>input]:bg-white [&>input]:px-3 [&>input]:text-base [&>textarea]:w-full [&>textarea]:rounded-xl [&>textarea]:border [&>textarea]:border-blue-200 [&>textarea]:bg-white [&>textarea]:p-3 [&>textarea]:text-base">{children}</span></label> }
