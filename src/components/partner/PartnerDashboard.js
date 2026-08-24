"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Check, Clock3, Download, FileText, LoaderCircle, LogOut, Plus } from "lucide-react"
import { partnerSupabase } from "../../lib/partnerSupabase"
import { getPartnerAuthHeaders } from "../../lib/partnerClientAuth"
import PartnerAtlasConfigurator from "./PartnerAtlasConfigurator"

const currency = new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 })

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
      const url = URL.createObjectURL(await response.blob())
      const link = document.createElement("a")
      link.href = url
      link.target = "_blank"
      link.rel = "noopener noreferrer"
      link.click()
      window.setTimeout(() => URL.revokeObjectURL(url), 60000)
    } catch (downloadError) {
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
  const quotes = opportunities.filter((item) => ["submitted", "in_review", "quoted"].includes(item.status))
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
          <a href="#quotes" className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5"><span><span className="block text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Handoffs</span><span className="mt-1 block text-lg font-black">View {quotes.length || "quote"}</span></span><FileText className="h-5 w-5" /></a>
        </section>

        <section className="mt-7 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 sm:p-7">
            <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0043f3]">Ready to sell</p><h2 className="mt-2 text-2xl font-black">Approved Atlas product</h2></div><span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">Live</span></div>
            {primaryProduct ? <div className="mt-6 rounded-2xl bg-[#eef4f8] p-5"><p className="text-xs font-black uppercase tracking-[0.16em] text-[#0043f3]">Atlas W08 configurable range</p><h3 className="mt-1 text-2xl font-black">Choose the customer’s structure</h3><p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">Select the size, steel and sheeting. The portal assigns the exact Atlas SKU and prepares the proposed AFGRI line item automatically.</p><div className="mt-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4"><div><p className="text-slate-500">Lengths</p><p className="mt-1 font-black">4m to 20m</p></div><div><p className="text-slate-500">Steel</p><p className="mt-1 font-black">Mild · ZAM · Galv</p></div><div><p className="text-slate-500">Cover</p><p className="mt-1 font-black">Optional</p></div><div><p className="text-slate-500">Pricing</p><p className="mt-1 font-black text-[#0043f3]">Live by SKU</p></div></div><button type="button" onClick={() => setFormOpen(true)} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0043f3] px-5 text-sm font-black text-white">Configure W08 product <ArrowRight className="h-4 w-4" /></button></div> : <p className="mt-6 rounded-2xl bg-amber-50 p-5 text-sm text-amber-800">No approved product release is available.</p>}
          </div>

          <div className="space-y-5">
            <QueueCard id="drafts" title="Continue drafts" empty="No unfinished opportunities." records={drafts} icon={Clock3} onOpen={(record) => { setEditingOpportunity(record); setFormOpen(true) }} />
            <QueueCard id="quotes" title="Quote progress" empty="No quote requests yet." records={quotes} icon={Check} onPriceConfirmation={openPriceConfirmation} priceConfirmationLoadingId={priceConfirmationLoadingId} />
          </div>
        </section>
      </div>

      {formOpen && primaryProduct?.price ? <PartnerAtlasConfigurator product={primaryProduct} initialOpportunity={editingOpportunity} onClose={() => { setFormOpen(false); setEditingOpportunity(null) }} onCreated={async () => { setFormOpen(false); setEditingOpportunity(null); await loadPortal() }} /> : null}
    </main>
  )
}

function QueueCard({ id, title, empty, records, icon: Icon, onOpen, onPriceConfirmation, priceConfirmationLoadingId }) {
  return <section id={id} className="scroll-mt-5 rounded-[1.75rem] border border-slate-200 bg-white p-5 sm:p-6"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#c1d9e5] text-[#0043f3]"><Icon className="h-5 w-5" /></span><h2 className="text-lg font-black">{title}</h2></div>{records.length ? <div className="mt-4 space-y-2">{records.slice(0, 4).map((record) => { const Tag = onOpen ? "button" : "div"; const isPreparing = priceConfirmationLoadingId === record.id; return <Tag key={record.id} type={onOpen ? "button" : undefined} onClick={onOpen ? () => onOpen(record) : undefined} className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-left transition hover:border-blue-300"><div className="flex items-center justify-between gap-3"><p className="font-bold">{record.customer_name}</p><span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#0043f3]">{record.status === "quoted" ? "price approved" : record.status.replaceAll("_", " ")}</span></div><p className="mt-1 text-xs text-slate-500">{record.reference} · {record.configuration?.width}m × {record.configuration?.length}m</p>{record.configuration?.sku ? <p className="mt-1 truncate font-mono text-[10px] font-bold text-[#0043f3]">{record.configuration.sku}</p> : null}{record.status === "quoted" ? <div className="mt-3 border-t border-slate-200 pt-3"><div className="flex items-end justify-between gap-3"><div><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">Approved AFGRI price excl. VAT</p><p className="mt-1 font-black text-[#0043f3]">{currency.format(record.final_quote_amount_ex_vat || 0)}</p><p className="mt-1 text-[10px] font-semibold text-slate-400">Agreed 5% partner adjustment applied</p></div><span className="text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-700">Price confirmed</span></div><button type="button" disabled={isPreparing} onClick={() => onPriceConfirmation?.(record)} className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#0043f3] px-3 text-xs font-black text-white disabled:cursor-wait disabled:opacity-70">{isPreparing ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />} {isPreparing ? "Preparing document..." : "View price confirmation"}</button>{record.quote_url ? <a href={record.quote_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-slate-200 px-3 text-xs font-black text-[#0043f3]">Open formal proposal</a> : null}</div> : null}{record.partner_quote_message ? <p className="mt-2 text-xs leading-5 text-slate-600">{record.partner_quote_message}</p> : null}</Tag> })}</div> : <p className="mt-5 text-sm text-slate-500">{empty}</p>}</section>
}
