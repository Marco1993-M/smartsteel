"use client"

import { useEffect, useState } from "react"
import { ArrowRight, Building2, CheckCircle2, Clock3, FileCheck2, Inbox, Mail, MapPin, Phone, RefreshCw, UserRound, X } from "lucide-react"
import { getOsAuthHeaders } from "../../lib/osClientAuth"
import PartnerOpportunityReviewDrawer from "./PartnerOpportunityReviewDrawer"

const STATUS_META = {
  submitted: { label: "New request", className: "bg-amber-100 text-amber-800", action: "Begin review", next: "in_review" },
  in_review: { label: "In review", className: "bg-blue-100 text-blue-800", action: "Approve price", next: "quoted" },
  quoted: { label: "Price approved", className: "bg-emerald-100 text-emerald-800", action: "Close opportunity", next: "closed" },
  closed: { label: "Closed", className: "bg-slate-100 text-slate-600", action: "Reopen review", next: "in_review" },
}

const money = new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 })

export default function PartnerOpportunityWorkspace() {
  const [records, setRecords] = useState([])
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState("active")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [reviewNotes, setReviewNotes] = useState("")
  const [quoteResponse, setQuoteResponse] = useState({ finalQuoteAmountExVat: "", quoteUrl: "", partnerQuoteMessage: "" })

  async function loadRecords() {
    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/os/partner-opportunities?partner=afgri", { cache: "no-store", headers: await getOsAuthHeaders() })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Could not load AFGRI opportunities.")
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

  async function advanceRecord(status) {
    setSaving(true)
    setError("")
    try {
      const response = await fetch("/api/os/partner-opportunities", {
        method: "PATCH",
        headers: await getOsAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ id: selected.id, status, internalReviewNotes: reviewNotes, ...quoteResponse }),
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

  const active = records.filter((record) => record.status !== "closed")
  const shown = filter === "active" ? active : records.filter((record) => record.status === filter)
  const newCount = records.filter((record) => record.status === "submitted").length
  const reviewingCount = records.filter((record) => record.status === "in_review").length
  const quotedCount = records.filter((record) => record.status === "quoted").length

  return (
    <div className="min-w-0 space-y-5 px-4 py-5 sm:px-6 sm:py-6">
      <section className="overflow-hidden rounded-[28px] border border-[#0043f3] bg-[linear-gradient(130deg,#001d2e_0%,#063379_54%,#0043f3_100%)] p-5 text-white shadow-xl sm:p-7">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div><p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#c1d9e5]">AFGRI opportunity desk</p><h2 className="mt-3 max-w-3xl text-3xl font-black tracking-[-0.04em] sm:text-4xl">Turn partner interest into a reviewed quote.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100">Only submitted requests appear here. Open one, confirm the project detail and move it to the next clear step.</p></div>
          <button type="button" onClick={loadRecords} className="inline-flex min-h-11 items-center justify-center gap-2 border border-white/20 bg-white/10 px-4 text-sm font-bold transition hover:bg-white/15"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh</button>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-px overflow-hidden bg-white/15">
          {[["New", newCount], ["In review", reviewingCount], ["Quoted", quotedCount]].map(([label, count]) => <div key={label} className="bg-[#063379]/75 p-4"><p className="text-2xl font-black sm:text-3xl">{count}</p><p className="mt-1 text-[9px] font-bold uppercase tracking-[0.14em] text-blue-100 sm:text-[10px]">{label}</p></div>)}
        </div>
      </section>

      {error ? <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p> : null}

      <section className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="text-[11px] font-bold uppercase tracking-[0.17em] text-slate-500">Review queue</p><h3 className="mt-1 text-2xl font-black tracking-tight text-slate-950">Partner opportunities</h3></div><div className="flex gap-2 overflow-x-auto">{[["active", "Active"], ["submitted", "New"], ["in_review", "In review"], ["quoted", "Quoted"], ["closed", "Closed"]].map(([value, label]) => <button key={value} type="button" onClick={() => setFilter(value)} className={`whitespace-nowrap rounded-full px-3 py-2 text-xs font-bold ${filter === value ? "bg-[#001d2e] text-white" : "bg-slate-100 text-slate-600"}`}>{label}</button>)}</div></div>
        <div className="mt-5 space-y-3">
          {loading ? <p className="py-10 text-center text-sm text-slate-500">Loading opportunities...</p> : shown.length === 0 ? <div className="grid min-h-48 place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center"><div><Inbox className="mx-auto h-7 w-7 text-slate-300" /><p className="mt-3 text-sm font-bold text-slate-600">No opportunities in this view.</p></div></div> : shown.map((record) => <OpportunityRow key={record.id} record={record} onOpen={() => openRecord(record)} />)}
        </div>
      </section>

      {selected ? <PartnerOpportunityReviewDrawer record={selected} notes={reviewNotes} setNotes={setReviewNotes} quoteResponse={quoteResponse} setQuoteResponse={setQuoteResponse} saving={saving} onClose={() => setSelected(null)} onAdvance={advanceRecord} /> : null}
    </div>
  )
}

function OpportunityRow({ record, onOpen }) {
  const meta = STATUS_META[record.status] || STATUS_META.submitted
  const config = record.configuration || {}
  return <button type="button" onClick={onOpen} className="grid w-full gap-4 rounded-2xl border border-slate-200 p-4 text-left transition hover:border-[#0043f3] hover:bg-blue-50/30 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto] sm:items-center"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="truncate font-black text-slate-950">{record.customerName}</p><span className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] ${meta.className}`}>{meta.label}</span>{record.partnerOrderStatus === "ready_for_order" ? <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-blue-800">AFGRI action</span> : null}{record.partnerOrderStatus === "order_submitted" ? <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-emerald-800">Order received</span> : null}</div><p className="mt-1 truncate text-xs text-slate-500">{record.reference} · {record.partner?.name || "AFGRI"}</p></div><div><p className="font-bold text-slate-900">W{String(config.width || "").padStart(2, "0")} · {config.width}m × {config.length}m × {config.wallHeight}m</p><p className="mt-1 text-xs text-slate-500">{config.steelFinish} · {config.gableMode === "structure_only" ? "Structure only" : "Sheeting selected"}</p>{record.afgriOrderReference ? <p className="mt-1 font-mono text-[10px] font-bold text-emerald-700">{record.afgriOrderReference}</p> : null}</div><div className="flex items-center justify-between gap-4 sm:justify-end"><p className="font-black text-[#0043f3]">{money.format(record.indicativeAmountExVat)}</p><ArrowRight className="h-4 w-4 text-slate-400" /></div></button>
}

function OpportunityDrawer({ record, notes, setNotes, quoteResponse, setQuoteResponse, saving, onClose, onAdvance }) {
  const meta = STATUS_META[record.status] || STATUS_META.submitted
  const config = record.configuration || {}
  return <div className="fixed inset-0 z-[100] bg-[#001d2e]/45 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><aside className="ml-auto flex h-full w-full max-w-xl flex-col bg-white shadow-2xl"><header className="border-b border-slate-200 p-5 sm:p-6"><div className="flex items-start justify-between gap-5"><div><span className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] ${meta.className}`}>{meta.label}</span><h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-slate-950">{record.customerName}</h2><p className="mt-1 text-sm text-slate-500">{record.reference}</p></div><button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-slate-100" aria-label="Close"><X className="h-5 w-5" /></button></div></header><div className="flex-1 space-y-6 overflow-y-auto p-5 sm:p-6"><section><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Customer</p><div className="mt-3 grid gap-2"><ContactLine icon={UserRound} value={record.customerName} />{record.customerPhone ? <ContactLine icon={Phone} value={record.customerPhone} /> : null}{record.customerEmail ? <ContactLine icon={Mail} value={record.customerEmail} /> : null}{record.siteLocation ? <ContactLine icon={MapPin} value={record.siteLocation} /> : null}</div></section><section className="rounded-2xl bg-[#eef4f8] p-5"><div className="flex items-center gap-3"><Building2 className="h-5 w-5 text-[#0043f3]" /><div><p className="font-black">{record.product?.name || "Atlas Warehouse"}</p><p className="text-xs text-slate-500">Release {record.product?.releaseVersion || "—"}</p></div></div><div className="mt-5 grid grid-cols-2 gap-4 text-sm"><Detail label="Size" value={`${config.width}m × ${config.length}m × ${config.wallHeight}m`} /><Detail label="Steel finish" value={config.steelFinish} /><Detail label="Sheeting" value={config.gableMode === "structure_only" ? "Structure only" : config.gableMode} /><Detail label="Guide excl. VAT" value={money.format(record.indicativeAmountExVat)} /></div></section>{record.partnerNotes ? <section><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Salesperson notes</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{record.partnerNotes}</p></section> : null}<label className="block"><span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Internal review note</span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows="4" placeholder="Record the next step or anything the team must confirm." className="mt-2 w-full rounded-xl border border-slate-300 p-4 text-base outline-none focus:border-[#0043f3]" /></label>{record.status === "in_review" || record.status === "quoted" ? <section className="rounded-2xl border border-blue-200 bg-blue-50 p-4"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#0043f3]">Partner quote response</p><div className="mt-4 space-y-3"><QuoteField label="Final amount excl. VAT"><input type="number" min="0" step="0.01" value={quoteResponse.finalQuoteAmountExVat} onChange={(event) => setQuoteResponse((current) => ({ ...current, finalQuoteAmountExVat: event.target.value }))} /></QuoteField><QuoteField label="Quote link"><input value={quoteResponse.quoteUrl} onChange={(event) => setQuoteResponse((current) => ({ ...current, quoteUrl: event.target.value }))} placeholder="/quotes/... or https://..." /></QuoteField><QuoteField label="Message to salesperson"><textarea rows="3" value={quoteResponse.partnerQuoteMessage} onChange={(event) => setQuoteResponse((current) => ({ ...current, partnerQuoteMessage: event.target.value }))} placeholder="Optional short handoff note" /></QuoteField></div></section> : null}</div><footer className="border-t border-slate-200 bg-white p-4 sm:p-5"><button type="button" disabled={saving} onClick={() => onAdvance(meta.next)} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0043f3] px-5 text-sm font-black text-white disabled:opacity-50">{record.status === "in_review" ? <FileCheck2 className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}{saving ? "Saving..." : meta.action}</button></footer></aside></div>
}

function ContactLine({ icon: Icon, value }) { return <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm"><Icon className="h-4 w-4 shrink-0 text-slate-400" /><span className="min-w-0 break-words font-semibold text-slate-700">{value}</span></div> }
function Detail({ label, value }) { return <div><p className="text-xs text-slate-500">{label}</p><p className="mt-1 font-black text-slate-900">{value || "—"}</p></div> }
function QuoteField({ label, children }) { return <label className="block text-xs font-bold text-slate-700">{label}<span className="mt-1.5 block [&>input]:min-h-11 [&>input]:w-full [&>input]:rounded-xl [&>input]:border [&>input]:border-blue-200 [&>input]:bg-white [&>input]:px-3 [&>input]:text-base [&>textarea]:w-full [&>textarea]:rounded-xl [&>textarea]:border [&>textarea]:border-blue-200 [&>textarea]:bg-white [&>textarea]:p-3 [&>textarea]:text-base">{children}</span></label> }
