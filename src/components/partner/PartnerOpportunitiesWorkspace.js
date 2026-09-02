"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, Download, LoaderCircle, LogOut, RotateCcw, Search } from "lucide-react"
import { getPartnerAuthHeaders } from "../../lib/partnerClientAuth"
import { partnerSupabase } from "../../lib/partnerSupabase"
import { closeProtectedPdfWindow, openProtectedPdfWindow, showProtectedPdf } from "../../lib/openProtectedPdf"
import PartnerAtlasConfigurator from "./PartnerAtlasConfigurator"
import { PartnerOrderHandoff } from "./PartnerDashboard"

const currency = new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 })
const FILTERS = [
  ["all", "All"],
  ["action", "Needs action"],
  ["draft", "Drafts"],
  ["waiting", "With Smart Steel"],
  ["quoted", "Price approved"],
  ["orders", "Orders"],
]

function matchesFilter(record, filter) {
  if (filter === "all") return true
  if (filter === "action") return ["draft", "changes_requested"].includes(record.status) || record.partner_order_status === "ready_for_order"
  if (filter === "waiting") return ["submitted", "in_review"].includes(record.status)
  if (filter === "quoted") return record.status === "quoted"
  if (filter === "orders") return ["order_submitted", "acknowledged"].includes(record.partner_order_status)
  return record.status === filter
}

function statusLabel(record) {
  if (record.partner_order_status === "ready_for_order") return "Your action"
  if (record.partner_order_status === "order_submitted") return "Order submitted"
  if (record.partner_order_status === "acknowledged") return record.fulfilment_status === "complete" ? "Complete" : (record.fulfilment_status || "production planning").replaceAll("_", " ")
  return ({ draft: "Draft", submitted: "Submitted", in_review: "In review", changes_requested: "Update requested", quoted: "Price approved", closed: "Order active" })[record.status] || record.status
}

export default function PartnerOpportunitiesWorkspace() {
  const router = useRouter()
  const [session, setSession] = useState(null)
  const [products, setProducts] = useState([])
  const [records, setRecords] = useState([])
  const [filter, setFilter] = useState("action")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [editing, setEditing] = useState(null)
  const [preparingId, setPreparingId] = useState("")

  async function load() {
    setError("")
    try {
      const headers = await getPartnerAuthHeaders()
      const responses = await Promise.all([
        fetch("/api/partner/session", { cache: "no-store", headers }),
        fetch("/api/partner/catalogue", { cache: "no-store", headers }),
        fetch("/api/partner/opportunities", { cache: "no-store", headers }),
      ])
      if ([401, 403].includes(responses[0].status)) return router.replace("/partner/login")
      const payloads = await Promise.all(responses.map((response) => response.json()))
      responses.forEach((response, index) => { if (!response.ok) throw new Error(payloads[index].error || "The opportunity workspace could not be loaded.") })
      setSession(payloads[0])
      setProducts(payloads[1].products || [])
      setRecords(payloads[2].opportunities || [])
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const shown = useMemo(() => {
    const query = search.trim().toLowerCase()
    const priority = (record) => {
      if (record.status === "changes_requested") return 0
      if (record.partner_order_status === "ready_for_order") return 1
      if (record.status === "draft") return 2
      if (["submitted", "in_review"].includes(record.status)) return 3
      if (record.status === "quoted") return 4
      return 5
    }
    return records
      .filter((record) => matchesFilter(record, filter))
      .filter((record) => !query || [record.customer_name, record.reference, record.configuration?.sku, record.site_location, record.afgri_order_reference].some((value) => String(value || "").toLowerCase().includes(query)))
      .sort((left, right) => priority(left) - priority(right))
  }, [records, filter, search])

  async function openPriceConfirmation(record) {
    const previewWindow = openProtectedPdfWindow("Preparing AFGRI price confirmation")
    setPreparingId(record.id)
    try {
      const response = await fetch(`/api/partner/opportunities/${record.id}/price-confirmation`, { headers: await getPartnerAuthHeaders() })
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload.error || "The price confirmation could not be opened.")
      }
      showProtectedPdf(previewWindow, await response.blob())
    } catch (documentError) {
      closeProtectedPdfWindow(previewWindow)
      setError(documentError.message)
    } finally {
      setPreparingId("")
    }
  }

  if (loading) return <main className="grid min-h-screen place-items-center bg-[#eef4f8] text-sm font-bold text-slate-500">Loading opportunities...</main>

  return <main className="min-h-screen bg-[#eef4f8] text-[#001d2e]">
    <header className="border-b border-slate-200 bg-white px-4 py-3 sm:px-6 lg:px-10"><div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4"><div className="flex min-w-0 items-center gap-3"><Link href="/partner" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-slate-200" aria-label="Dashboard"><ArrowLeft className="h-4 w-4" /></Link><Image src="/atlas/atlas-logo-horizontal-dark.png" alt="Atlas by Smart Steel" width={155} height={45} className="h-9 w-auto object-contain" priority /></div><div className="flex items-center gap-3"><p className="hidden text-sm font-bold sm:block">{session?.membership?.partner?.name}</p><button type="button" onClick={async () => { await partnerSupabase.auth.signOut(); router.replace("/partner/login") }} className="grid h-10 w-10 place-items-center rounded-full border border-slate-200" aria-label="Sign out"><LogOut className="h-4 w-4" /></button></div></div></header>
    <div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 sm:py-8 lg:px-10">
      <section className="rounded-[1.75rem] bg-[linear-gradient(130deg,#001d2e,#063783_55%,#0043f3)] p-6 text-white sm:p-8"><p className="text-xs font-black uppercase tracking-[0.2em] text-[#c1d9e5]">AFGRI opportunities</p><h1 className="mt-2 text-4xl font-black tracking-[-0.05em]">Every opportunity, one clear next step.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-white/70">Search the complete history while keeping records requiring your action at the top.</p></section>
      {error ? <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
      <section className="mt-5 rounded-[1.5rem] border border-slate-200 bg-white p-4 sm:p-5"><div className="relative"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search customer, reference, SKU or location" className="min-h-12 w-full rounded-xl border border-slate-200 pl-11 pr-4 text-base outline-none focus:border-[#0043f3]" /></div><div className="mt-3 flex gap-2 overflow-x-auto pb-1">{FILTERS.map(([value, label]) => <button key={value} type="button" onClick={() => setFilter(value)} className={`whitespace-nowrap rounded-full px-3 py-2 text-xs font-black ${filter === value ? "bg-[#001d2e] text-white" : "bg-slate-100 text-slate-600"}`}>{label}</button>)}</div></section>
      <div className="mt-5 flex items-center justify-between"><p className="text-sm font-bold text-slate-500">{shown.length} {shown.length === 1 ? "opportunity" : "opportunities"}</p><Link href="/partner" className="text-sm font-black text-[#0043f3]">Dashboard</Link></div>
      <section className="mt-3 space-y-3">{shown.length ? shown.map((record) => <OpportunityCard key={record.id} record={record} product={products[0]} onEdit={() => setEditing(record)} onDocument={() => openPriceConfirmation(record)} preparing={preparingId === record.id} onUpdated={load} />) : <div className="grid min-h-52 place-items-center rounded-[1.5rem] border border-dashed border-slate-300 bg-white text-sm font-bold text-slate-500">No opportunities match this view.</div>}</section>
    </div>
    {editing && products[0]?.price ? <PartnerAtlasConfigurator product={products[0]} initialOpportunity={editing} onClose={() => setEditing(null)} onCreated={async () => { setEditing(null); await load() }} /> : null}
  </main>
}

function OpportunityCard({ record, onEdit, onDocument, preparing, onUpdated }) {
  const config = record.configuration || {}
  const canEdit = ["draft", "changes_requested"].includes(record.status)
  const informationRequest = record.current_information_request
    || record.partner_information_requests?.find((request) => request.status === "open")
  const submissionVersion = record.submission_version
    || Math.max(0, ...(record.partner_submissions || []).map((submission) => Number(submission.version || 0)))
  return <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="truncate text-lg font-black">{record.customer_name}</h2><span className="rounded-full bg-[#c1d9e5] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#0043f3]">{statusLabel(record)}</span></div><p className="mt-1 text-xs text-slate-500">{record.reference}{record.site_location ? ` · ${record.site_location}` : ""}</p>{config.sku ? <p className="mt-2 break-all font-mono text-[10px] font-black text-[#0043f3]">{config.sku}</p> : null}</div><div className="sm:text-right"><p className="text-sm font-black">{config.width}m × {config.length}m × {config.wallHeight}m</p><p className="mt-1 text-xs text-slate-500">{config.steelFinish} · {config.gableMode === "structure_only" ? "Structure only" : "Sheeting selected"}</p>{record.final_quote_amount_ex_vat ? <p className="mt-2 font-black text-[#0043f3]">{currency.format(record.final_quote_amount_ex_vat)} excl. VAT</p> : null}</div></div>
    {record.status === "changes_requested" && informationRequest ? <div className="mt-4 rounded-2xl border border-orange-200 bg-orange-50 p-4"><div className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-orange-100 text-orange-700"><RotateCcw className="h-4 w-4" /></span><div><p className="text-[9px] font-black uppercase tracking-[0.15em] text-orange-700">Smart Steel needs an update{submissionVersion ? ` · Submission V${submissionVersion}` : ""}</p><p className="mt-1.5 whitespace-pre-wrap text-sm font-semibold leading-6 text-slate-800">{informationRequest.request_text || informationRequest.requestText}</p>{informationRequest.due_at || informationRequest.dueAt ? <p className="mt-2 text-xs font-black text-orange-800">Requested by {formatDate(informationRequest.due_at || informationRequest.dueAt)}</p> : null}</div></div></div> : null}
    <div className="mt-4 border-t border-slate-200 pt-4">{canEdit ? <button type="button" onClick={onEdit} className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-black text-white sm:w-auto ${record.status === "changes_requested" ? "bg-orange-600" : "bg-[#0043f3]"}`}>{record.status === "changes_requested" ? <RotateCcw className="h-4 w-4" /> : null}{record.status === "changes_requested" ? "Update and resubmit" : "Continue draft"}</button> : ["submitted", "in_review"].includes(record.status) ? <p className="text-sm font-semibold text-slate-500">Smart Steel is reviewing submission V{submissionVersion || 1}. No action is needed from you.</p> : ["quoted", "closed"].includes(record.status) ? <div>{record.status === "quoted" ? <button type="button" disabled={preparing} onClick={onDocument} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#0043f3] px-4 text-sm font-black text-[#0043f3] sm:w-auto">{preparing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}{preparing ? "Preparing..." : "Price confirmation"}</button> : null}<PartnerOrderHandoff record={record} onSubmitted={onUpdated} /></div> : null}</div>
  </article>
}

function formatDate(value) {
  if (!value) return ""
  return new Intl.DateTimeFormat("en-ZA", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value))
}
