"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Check, CheckCircle2, Clock3, Download, FileText, LoaderCircle, LogOut, MessageSquareText, PackageCheck, Paperclip, PauseCircle, Plus, Send, Upload } from "lucide-react"
import { partnerSupabase } from "../../lib/partnerSupabase"
import { getPartnerAuthHeaders } from "../../lib/partnerClientAuth"
import { closeProtectedPdfWindow, openProtectedPdfWindow, showProtectedPdf } from "../../lib/openProtectedPdf"
import PartnerAtlasConfigurator from "./PartnerAtlasConfigurator"

const currency = new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 })
const FULFILMENT_STEPS = [
  ["production_planning", "Planning"],
  ["in_production", "In production"],
  ["ready_for_dispatch", "Dispatch ready"],
  ["delivered", "Delivered"],
  ["complete", "Complete"],
]

function temporaryReference(record) {
  return `TEMP-${String(record.reference || "AFGRI").toUpperCase()}`
}

export default function PartnerDashboard() {
  const router = useRouter()
  const [session, setSession] = useState(null)
  const [products, setProducts] = useState([])
  const [opportunities, setOpportunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [editingOpportunity, setEditingOpportunity] = useState(null)
  const [priceConfirmationLoadingId, setPriceConfirmationLoadingId] = useState("")

  async function openPriceConfirmation(record) {
    const previewWindow = openProtectedPdfWindow("Preparing AFGRI price confirmation")
    try {
      setError("")
      setPriceConfirmationLoadingId(record.id)
      const response = await fetch(`/api/partner/opportunities/${record.id}/price-confirmation`, {
        headers: await getPartnerAuthHeaders(),
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload.error || "The price confirmation could not be opened.")
      }
      showProtectedPdf(previewWindow, await response.blob())
    } catch (downloadError) {
      closeProtectedPdfWindow(previewWindow)
      setError(downloadError.message)
    } finally {
      setPriceConfirmationLoadingId("")
    }
  }

  async function loadPortal() {
    try {
      const headers = await getPartnerAuthHeaders()
      const [sessionResponse, catalogueResponse, opportunitiesResponse] = await Promise.all([
        fetch("/api/partner/session", { cache: "no-store", headers }),
        fetch("/api/partner/catalogue", { cache: "no-store", headers }),
        fetch("/api/partner/opportunities", { cache: "no-store", headers }),
      ])
      if (sessionResponse.status === 401 || sessionResponse.status === 403) {
        router.replace("/partner/login")
        return
      }
      const [sessionPayload, cataloguePayload, opportunitiesPayload] = await Promise.all([
        sessionResponse.json(), catalogueResponse.json(), opportunitiesResponse.json(),
      ])
      if (!sessionResponse.ok) throw new Error(sessionPayload.error || "Partner access could not be loaded.")
      if (!catalogueResponse.ok) throw new Error(cataloguePayload.error || "Products could not be loaded.")
      if (!opportunitiesResponse.ok) throw new Error(opportunitiesPayload.error || "Opportunities could not be loaded.")
      setSession(sessionPayload)
      setProducts(cataloguePayload.products || [])
      setOpportunities(opportunitiesPayload.opportunities || [])
    } catch (loadError) {
      if (loadError.message === "Please sign in to continue.") {
        router.replace("/partner/login")
        return
      }
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadPortal() }, [])

  const drafts = opportunities.filter((item) => item.status === "draft")
  const quotePriority = { ready_for_order: 0, not_ready: 1, order_submitted: 2, acknowledged: 3 }
  const quotes = opportunities
    .filter((item) => ["submitted", "in_review", "quoted", "closed"].includes(item.status))
    .sort((left, right) => (quotePriority[left.partner_order_status] ?? 1) - (quotePriority[right.partner_order_status] ?? 1))
  const primaryProduct = products[0]

  if (loading) return <main className="grid min-h-screen place-items-center bg-[#eef4f8] text-sm font-bold text-slate-500">Opening AFGRI Sales Portal...</main>

  return (
    <main className="min-h-screen bg-[#eef4f8] text-[#001d2e]">
      <header className="border-b border-slate-200 bg-white px-4 py-3 sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <Image src="/atlas/atlas-logo-horizontal-dark.png" alt="Atlas by Smart Steel" width={165} height={48} className="h-9 w-auto object-contain sm:h-11" priority />
            <span className="hidden h-8 w-px bg-slate-200 sm:block" />
            <Image src="/afgri-logo-colour-cropped.png" alt="AFGRI" width={105} height={38} className="hidden h-8 w-auto object-contain sm:block" priority />
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block"><p className="text-sm font-bold">{session?.membership?.partner?.name}</p><p className="text-xs capitalize text-slate-500">{session?.membership?.role?.replaceAll("_", " ")}</p></div>
            <button type="button" onClick={async () => { await partnerSupabase.auth.signOut(); router.replace("/partner/login") }} className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:text-slate-900" aria-label="Sign out"><LogOut className="h-4 w-4" /></button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 sm:py-8 lg:px-10">
        <section className="overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#001d2e] via-[#063783] to-[#0043f3] p-6 text-white shadow-xl shadow-blue-950/10 sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#c1d9e5]">AFGRI Sales Portal</p>
          <div className="mt-3 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div><h1 className="max-w-3xl text-4xl font-black tracking-[-0.05em] sm:text-5xl">Sell Atlas with confidence.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-white/70 sm:text-base">Start with the customer. Smart Steel will review the final project detail.</p></div>
            <button type="button" onClick={() => setFormOpen(true)} disabled={!primaryProduct?.price} className="inline-flex min-h-13 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-black text-[#0043f3] transition hover:bg-[#c1d9e5] disabled:opacity-50"><Plus className="h-5 w-5" /> Start opportunity</button>
          </div>
        </section>

        {error ? <p className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

        <section className="mt-5 grid gap-3 sm:grid-cols-3">
          <button type="button" onClick={() => setFormOpen(true)} className="flex items-center justify-between rounded-2xl border border-[#0043f3] bg-[#c1d9e5] p-5 text-left"><span><span className="block text-xs font-bold uppercase tracking-[0.16em] text-[#0043f3]">New</span><span className="mt-1 block text-lg font-black">Start opportunity</span></span><Plus className="h-5 w-5" /></button>
          <a href="#drafts" className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5"><span><span className="block text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Drafts</span><span className="mt-1 block text-lg font-black">Continue {drafts.length || "draft"}</span></span><ArrowRight className="h-5 w-5" /></a>
          <Link href="/partner/opportunities" className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5"><span><span className="block text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Opportunities</span><span className="mt-1 block text-lg font-black">View all {opportunities.length || "records"}</span></span><FileText className="h-5 w-5" /></Link>
        </section>

        <section className="mt-7 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 sm:p-7">
            <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0043f3]">Ready to sell</p><h2 className="mt-2 text-2xl font-black">Approved Atlas product</h2></div><span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">Live</span></div>
            {primaryProduct ? <div className="mt-6 rounded-2xl bg-[#eef4f8] p-5"><p className="text-xs font-black uppercase tracking-[0.16em] text-[#0043f3]">Atlas W08 configurable range</p><h3 className="mt-1 text-2xl font-black">Choose the customer’s structure</h3><p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">Select the size, steel and sheeting. The portal assigns the exact Atlas SKU and prepares the proposed AFGRI line item automatically.</p><div className="mt-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4"><div><p className="text-slate-500">Lengths</p><p className="mt-1 font-black">4m to 20m</p></div><div><p className="text-slate-500">Steel</p><p className="mt-1 font-black">Mild · ZAM · Galv</p></div><div><p className="text-slate-500">Cover</p><p className="mt-1 font-black">Optional</p></div><div><p className="text-slate-500">Pricing</p><p className="mt-1 font-black text-[#0043f3]">Live by SKU</p></div></div><button type="button" onClick={() => setFormOpen(true)} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0043f3] px-5 text-sm font-black text-white">Configure W08 product <ArrowRight className="h-4 w-4" /></button></div> : <p className="mt-6 rounded-2xl bg-amber-50 p-5 text-sm text-amber-800">No approved product release is available.</p>}
          </div>

          <div className="space-y-5">
            <QueueCard id="drafts" title="Continue drafts" empty="No unfinished opportunities." records={drafts} icon={Clock3} onOpen={(record) => { setEditingOpportunity(record); setFormOpen(true) }} />
            <QueueCard id="quotes" title="Quote and order progress" empty="No quote requests yet." records={quotes} icon={Check} onPriceConfirmation={openPriceConfirmation} priceConfirmationLoadingId={priceConfirmationLoadingId} onOrderSubmitted={loadPortal} />
          </div>
        </section>
      </div>

      {formOpen && primaryProduct?.price ? <PartnerAtlasConfigurator product={primaryProduct} initialOpportunity={editingOpportunity} onClose={() => { setFormOpen(false); setEditingOpportunity(null) }} onCreated={async () => { setFormOpen(false); setEditingOpportunity(null); await loadPortal() }} /> : null}
    </main>
  )
}

function QueueCard({ id, title, empty, records, icon: Icon, onOpen, onPriceConfirmation, priceConfirmationLoadingId, onOrderSubmitted }) {
  return <section id={id} className="scroll-mt-5 rounded-[1.75rem] border border-slate-200 bg-white p-5 sm:p-6"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#c1d9e5] text-[#0043f3]"><Icon className="h-5 w-5" /></span><h2 className="text-lg font-black">{title}</h2></div><Link href="/partner/opportunities" className="text-xs font-black text-[#0043f3]">View all</Link></div>{records.length ? <div className="mt-4 space-y-2">{records.slice(0, 4).map((record) => { const Tag = onOpen ? "button" : "div"; const isPreparing = priceConfirmationLoadingId === record.id; const hasCommercialRecord = ["quoted", "closed"].includes(record.status); return <Tag key={record.id} type={onOpen ? "button" : undefined} onClick={onOpen ? () => onOpen(record) : undefined} className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-left transition hover:border-blue-300"><div className="flex items-center justify-between gap-3"><p className="font-bold">{record.customer_name}</p><span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#0043f3]">{record.status === "closed" ? "order active" : record.status === "quoted" ? "price approved" : record.status.replaceAll("_", " ")}</span></div><p className="mt-1 text-xs text-slate-500">{record.reference} · {record.configuration?.width}m × {record.configuration?.length}m</p>{record.configuration?.sku ? <p className="mt-1 truncate font-mono text-[10px] font-bold text-[#0043f3]">{record.configuration.sku}</p> : null}{hasCommercialRecord ? <div className="mt-3 border-t border-slate-200 pt-3"><div className="flex items-end justify-between gap-3"><div><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">Approved AFGRI price excl. VAT</p><p className="mt-1 font-black text-[#0043f3]">{currency.format(record.final_quote_amount_ex_vat || 0)}</p><p className="mt-1 text-[10px] font-semibold text-slate-400">Valid until {formatDate(record.price_valid_until)}</p></div><span className="text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-700">{record.status === "closed" ? "In fulfilment" : "Price confirmed"}</span></div>{record.status === "quoted" ? <button type="button" disabled={isPreparing} onClick={() => onPriceConfirmation?.(record)} className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#0043f3] px-3 text-xs font-black text-white disabled:cursor-wait disabled:opacity-70">{isPreparing ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />} {isPreparing ? "Preparing document..." : "View price confirmation"}</button> : null}<PartnerOrderHandoff record={record} onSubmitted={onOrderSubmitted} /></div> : null}{record.partner_quote_message ? <p className="mt-2 text-xs leading-5 text-slate-600">{record.partner_quote_message}</p> : null}</Tag> })}</div> : <p className="mt-5 text-sm text-slate-500">{empty}</p>}</section>
}

export function PartnerOrderHandoff({ record, onSubmitted }) {
  const [reference, setReference] = useState(record.afgri_order_reference || temporaryReference(record))
  const [notes, setNotes] = useState(record.partner_order_notes || "")
  const [responseNote, setResponseNote] = useState("")
  const [documentType, setDocumentType] = useState("purchase_order")
  const [file, setFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const submitted = record.partner_order_status === "order_submitted" || record.partner_order_status === "acknowledged"

  useEffect(() => {
    setReference(record.afgri_order_reference || temporaryReference(record))
  }, [record.afgri_order_reference, record.reference])

  async function updateHandoff(action, payload = {}) {
    setSaving(true)
    setError("")
    try {
      const response = await fetch("/api/partner/opportunities", {
        method: "PATCH",
        headers: await getPartnerAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ id: record.id, action, ...payload }),
      })
      const responsePayload = await response.json()
      if (!response.ok) throw new Error(responsePayload.error || "The handoff could not be updated.")
      setResponseNote("")
      await onSubmitted?.()
    } catch (updateError) {
      setError(updateError.message)
    } finally {
      setSaving(false)
    }
  }

  async function uploadDocument() {
    if (!file) return setError("Choose the purchase order or instruction document first.")
    setUploading(true)
    setError("")
    try {
      const form = new FormData()
      form.append("file", file)
      form.append("documentType", documentType)
      const response = await fetch(`/api/partner/opportunities/${record.id}/documents`, {
        method: "POST",
        headers: await getPartnerAuthHeaders(),
        body: form,
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "The document could not be uploaded.")
      setFile(null)
      await onSubmitted?.()
    } catch (uploadError) {
      setError(uploadError.message)
    } finally {
      setUploading(false)
    }
  }

  async function downloadDocument(document) {
    try {
      const response = await fetch(`/api/partner/opportunities/${record.id}/documents?documentId=${document.id}`, { headers: await getPartnerAuthHeaders() })
      if (!response.ok) throw new Error("The document could not be downloaded.")
      const url = URL.createObjectURL(await response.blob())
      const link = window.document.createElement("a")
      link.href = url
      link.download = document.file_name
      link.click()
      URL.revokeObjectURL(url)
    } catch (downloadError) {
      setError(downloadError.message)
    }
  }

  async function submitOrder() {
    if (!reference.trim()) return setError("Add the AFGRI order or reference number.")
    setSaving(true)
    setError("")
    try {
      const response = await fetch("/api/partner/opportunities", {
        method: "PATCH",
        headers: await getPartnerAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ id: record.id, action: "submit_order", afgriOrderReference: reference, partnerOrderNotes: notes }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "The AFGRI order could not be submitted.")
      await onSubmitted?.()
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setSaving(false)
    }
  }

  if (submitted) return <PartnerFulfilmentTracker record={record} onUpdated={onSubmitted} />

  if (record.partner_order_status !== "ready_for_order") return null
  const acknowledged = record.commercial_response_status === "acknowledged"
  const documents = record.partner_order_documents || []
  return <div className="mt-3 space-y-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
    <div className="flex items-center gap-2"><PackageCheck className="h-4 w-4 text-[#0043f3]" /><p className="text-xs font-black uppercase tracking-[0.12em] text-[#0043f3]">Commercial handoff</p></div>
    {!acknowledged ? <div className="rounded-xl bg-white p-3"><p className="text-sm font-black text-slate-900">1. Confirm the approved price and scope</p><p className="mt-1 text-xs leading-5 text-slate-500">Acknowledge the supplier record, or ask Smart Steel to clarify it before speaking to the customer.</p><textarea value={responseNote} onChange={(event) => setResponseNote(event.target.value)} rows="2" placeholder="Clarification note, if needed" className="mt-3 w-full rounded-xl border border-slate-200 p-3 text-base outline-none focus:border-[#0043f3]" /><div className="mt-2 grid gap-2 sm:grid-cols-2"><button type="button" disabled={saving} onClick={() => updateHandoff("acknowledge_commercial", { note: responseNote })} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0043f3] px-3 text-xs font-black text-white"><CheckCircle2 className="h-4 w-4" />Acknowledge</button><button type="button" disabled={saving || !responseNote.trim()} onClick={() => updateHandoff("request_clarification", { note: responseNote })} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 text-xs font-black text-slate-700"><MessageSquareText className="h-4 w-4" />Ask a question</button></div>{record.commercial_response_status === "clarification_requested" ? <p className="mt-2 text-xs font-bold text-amber-700">Clarification requested: {record.commercial_response_note}</p> : null}</div> : <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-800"><CheckCircle2 className="h-4 w-4" />Price and scope acknowledged</div>}
    {acknowledged ? <div className="rounded-xl bg-white p-3"><p className="text-sm font-black text-slate-900">2. Record the customer decision</p><div className="mt-3 grid grid-cols-3 gap-2"><button type="button" onClick={() => updateHandoff("customer_decision", { customerDecision: "proceeding" })} className={`min-h-11 rounded-xl px-2 text-xs font-black ${record.customer_decision === "proceeding" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700"}`}>Proceeding</button><button type="button" onClick={() => updateHandoff("customer_decision", { customerDecision: "on_hold" })} className={`min-h-11 rounded-xl px-2 text-xs font-black ${record.customer_decision === "on_hold" ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-700"}`}>On hold</button><button type="button" onClick={() => updateHandoff("customer_decision", { customerDecision: "not_proceeding" })} className={`min-h-11 rounded-xl px-2 text-xs font-black ${record.customer_decision === "not_proceeding" ? "bg-slate-700 text-white" : "bg-slate-100 text-slate-700"}`}>Not proceeding</button></div></div> : null}
    {acknowledged && record.customer_decision === "proceeding" ? <div className="rounded-xl bg-white p-3"><p className="text-sm font-black text-slate-900">3. Submit the AFGRI instruction</p><p className="mt-1 text-xs leading-5 text-slate-500">A temporary reference is ready below. Replace it with AFGRI's formal number now or later when available.</p><div className="mt-3 grid gap-2 sm:grid-cols-[0.8fr_1.2fr]"><select value={documentType} onChange={(event) => setDocumentType(event.target.value)} className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold"><option value="purchase_order">Purchase order</option><option value="formal_instruction">Formal instruction</option><option value="supporting_document">Supporting document</option></select><input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(event) => setFile(event.target.files?.[0] || null)} className="min-h-11 rounded-xl border border-slate-200 bg-white p-2 text-xs" /></div><button type="button" disabled={uploading || !file} onClick={uploadDocument} className="mt-2 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#0043f3] text-xs font-black text-[#0043f3] disabled:opacity-50"><Upload className="h-4 w-4" />{uploading ? "Uploading..." : "Upload document"}</button>{documents.length ? <div className="mt-3 space-y-1">{documents.map((document) => <button type="button" key={document.id} onClick={() => downloadDocument(document)} className="flex w-full items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-left text-xs font-bold text-slate-700"><Paperclip className="h-3.5 w-3.5" /><span className="truncate">{document.file_name}</span></button>)}</div> : null}<label className="mt-3 block text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">AFGRI instruction reference<input value={reference} onChange={(event) => setReference(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-blue-200 bg-white px-3 font-mono text-base normal-case tracking-normal outline-none focus:border-[#0043f3]" /></label><textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows="2" placeholder="Optional handoff note" className="mt-2 w-full rounded-xl border border-blue-200 bg-white p-3 text-base outline-none focus:border-[#0043f3]" /><button type="button" disabled={saving} onClick={submitOrder} className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#001d2e] px-4 text-xs font-black text-white disabled:opacity-60"><Send className="h-3.5 w-3.5" />{saving ? "Submitting..." : "Send instruction to Smart Steel"}</button></div> : null}
    {acknowledged && ["on_hold", "not_proceeding"].includes(record.customer_decision) ? <div className="flex items-center gap-2 rounded-xl bg-white p-3 text-xs font-bold text-slate-600"><PauseCircle className="h-4 w-4" />No order action is required while this opportunity is {record.customer_decision.replaceAll("_", " ")}.</div> : null}
    {error ? <p className="text-xs font-bold text-rose-700">{error}</p> : null}
  </div>
}

function PartnerFulfilmentTracker({ record, onUpdated }) {
  const [reference, setReference] = useState(record.afgri_order_reference || temporaryReference(record))
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const status = record.fulfilment_status || "not_started"
  const currentIndex = FULFILMENT_STEPS.findIndex(([value]) => value === status)
  const waiting = record.partner_order_status === "order_submitted"
  async function saveReference() {
    setSaving(true)
    setMessage("")
    try {
      const response = await fetch("/api/partner/opportunities", { method: "PATCH", headers: await getPartnerAuthHeaders({ "Content-Type": "application/json" }), body: JSON.stringify({ id: record.id, action: "update_order_reference", afgriOrderReference: reference }) })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "The reference could not be updated.")
      setMessage("Reference updated")
      await onUpdated?.()
    } catch (error) {
      setMessage(error.message)
    } finally {
      setSaving(false)
    }
  }
  return <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4"><div className="flex items-center gap-2 text-emerald-800"><PackageCheck className="h-4 w-4" /><p className="text-xs font-black uppercase tracking-[0.12em]">{waiting ? "Instruction sent to Smart Steel" : "Order progress"}</p></div><div className="mt-3 flex gap-2"><input value={reference} onChange={(event) => setReference(event.target.value)} aria-label="AFGRI instruction reference" className="min-h-10 min-w-0 flex-1 rounded-lg border border-emerald-200 bg-white px-3 font-mono text-sm font-black text-slate-900" /><button type="button" disabled={saving || !reference.trim() || reference === record.afgri_order_reference} onClick={saveReference} className="rounded-lg border border-emerald-300 bg-white px-3 text-xs font-black text-emerald-800 disabled:opacity-40">Save</button></div>{message ? <p className="mt-1 text-[10px] font-bold text-slate-500">{message}</p> : null}{waiting ? <p className="mt-3 text-xs font-bold text-emerald-800">Smart Steel will accept the instruction and open production planning.</p> : <><div className="mt-4 grid grid-cols-5 gap-1">{FULFILMENT_STEPS.map(([value, label], index) => <div key={value} className="min-w-0"><div className={`h-1.5 rounded-full ${index <= currentIndex ? "bg-[#0043f3]" : "bg-slate-200"}`} /><p className={`mt-1 hidden text-[8px] font-bold sm:block ${index === currentIndex ? "text-[#0043f3]" : "text-slate-400"}`}>{label}</p></div>)}</div><p className="mt-3 text-sm font-black text-slate-900">{FULFILMENT_STEPS[currentIndex]?.[1] || "Production planning"}</p>{record.estimated_dispatch_date ? <p className="mt-1 text-xs text-slate-600">Estimated dispatch: {formatDate(record.estimated_dispatch_date)}</p> : null}{record.estimated_delivery_date ? <p className="mt-1 text-xs text-slate-600">Estimated delivery: {formatDate(record.estimated_delivery_date)}</p> : null}{record.fulfilment_note ? <p className="mt-2 text-xs leading-5 text-slate-600">{record.fulfilment_note}</p> : null}</>}</div>
}

function formatDate(value) {
  if (!value) return "confirmation"
  return new Intl.DateTimeFormat("en-ZA", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${value}T12:00:00`))
}
