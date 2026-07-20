"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import {
  ArrowUpRight,
  Boxes,
  Check,
  ClipboardCheck,
  FileText,
  Layers3,
  Ruler,
  Settings2,
  ShieldCheck,
  Wrench,
} from "lucide-react"
import { getOsAuthHeaders } from "../../lib/osClientAuth"

const PRODUCT = {
  code: "W08",
  name: "Atlas W08 Warehouse System",
  summary: "The 8m-span pilot for Smart Steel's modular, bolted Atlas warehouse range.",
  specifications: [
    ["Span", "8m", "Fixed W08 product width"],
    ["Length", "2.5m bays", "Configure length without creating another product"],
    ["Eave height", "3m", "Standard commercial starting height"],
    ["Roof form", "Dual pitch", "15-degree standard starting geometry"],
    ["Assembly", "Bolted", "Repeatable connections for practical site assembly"],
    ["Gable ends", "Open", "Open in every standard sheeting configuration"],
  ],
  scopes: [
    { name: "Structure only", detail: "Primary frame, secondary steel, bracing, connections, and required structural fixings." },
    { name: "Roof sheeted", detail: "Standard structure with roof sheeting and applicable roof closures." },
    { name: "Roof and walls sheeted", detail: "Roof and long side walls sheeted. Both gable ends remain open." },
  ],
  reviewTriggers: [
    "Eave height above the 3m standard",
    "Openings, lean-tos, canopies, or suspended loads",
    "Non-standard loading, exposure, or site conditions",
    "Installation, foundations, delivery, and access constraints",
  ],
}

const workspaceLinks = [
  { label: "Components", href: "/os/atlas/components", icon: Boxes },
  { label: "BOM", href: "/os/atlas/bom", icon: Layers3 },
  { label: "Pricing", href: "/os/atlas/pricing", icon: Ruler },
  { label: "Engineering", href: "/os/atlas/engineering", icon: ShieldCheck },
  { label: "Documents", href: "/os/atlas/documents", icon: FileText },
]

function StatusPill({ ready, readyLabel = "Ready", pendingLabel = "Needs work" }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${ready ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"}`}>
      {ready ? readyLabel : pendingLabel}
    </span>
  )
}

export default function AtlasWarehouseProductWorkspace() {
  const [data, setData] = useState({ components: [], boms: [], documents: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true
    async function loadProductRecords() {
      setLoading(true)
      setError("")
      try {
        const headers = await getOsAuthHeaders()
        const responses = await Promise.all([
          fetch("/api/os/catalog-items?platform=atlas&kind=component", { cache: "no-store", headers }),
          fetch("/api/os/boms?platform=atlas", { cache: "no-store", headers }),
          fetch("/api/os/documents?platform=atlas", { cache: "no-store", headers }),
        ])
        const payloads = await Promise.all(responses.map((response) => response.json()))
        const failedIndex = responses.findIndex((response) => !response.ok)
        if (failedIndex >= 0) throw new Error(payloads[failedIndex].error || "Could not load the Atlas product record.")
        if (!active) return
        setData({
          components: (payloads[0].records || []).filter((record) => record.productFamilyKey === "warehouses"),
          boms: (payloads[1].records || []).filter((record) => record.code === "ATL-WH-8M-SHELL"),
          documents: (payloads[2].records || []).filter((record) => record.productFamilyKey === "warehouses"),
        })
      } catch (loadError) {
        if (active) setError(loadError.message)
      } finally {
        if (active) setLoading(false)
      }
    }
    loadProductRecords()
    return () => { active = false }
  }, [])

  const bom = data.boms[0]
  const readiness = useMemo(() => [
    { label: "Product definition", ready: true, detail: "W08 scope and modular rules captured" },
    { label: "Reusable components", ready: data.components.length >= 2, detail: `${data.components.length} warehouse records linked` },
    { label: "Baseline BOM", ready: bom?.status === "approved", detail: bom ? `${bom.code} · ${bom.revisionCode}` : "No W08 BOM found" },
    { label: "Pricing basis", ready: true, detail: "Live Atlas warehouse calculator active" },
    { label: "Product documents", ready: data.documents.some((record) => ["reviewed", "issued"].includes(record.status)), detail: `${data.documents.length} warehouse documents linked` },
  ], [bom, data.components.length, data.documents])
  const readinessCount = readiness.filter((item) => item.ready).length
  const readinessPercentage = Math.round((readinessCount / readiness.length) * 100)

  return (
    <div className="space-y-5 px-3 py-4 sm:space-y-6 sm:px-6 sm:py-6">
      <section className="relative overflow-hidden rounded-[1.75rem] border border-slate-800 bg-[radial-gradient(circle_at_90%_0%,_rgba(14,165,233,0.22),_transparent_30%),linear-gradient(145deg,_#020617,_#172033)] text-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
        <div className="grid gap-7 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-amber-400 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-950">Pilot product</span>
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-sky-200">Atlas W-Series</span>
            </div>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">{PRODUCT.code} · Product source of truth</p>
            <h1 className="mt-2 max-w-3xl text-3xl font-bold tracking-[-0.04em] text-white sm:text-5xl">{PRODUCT.name}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">{PRODUCT.summary}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link href="/warehouse-builder?productType=LCSS%20Warehouse&width=8&length=20" className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-amber-300">Open live builder <ArrowUpRight className="h-4 w-4" /></Link>
              <Link href="/os/atlas/bom" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">Review W08 BOM</Link>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <div className="flex items-end justify-between gap-4">
              <div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Quote readiness</p><p className="mt-2 text-4xl font-bold text-white">{loading ? "--" : `${readinessPercentage}%`}</p></div>
              <ClipboardCheck className="h-9 w-9 text-amber-300" aria-hidden="true" />
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-amber-400 transition-[width] duration-500" style={{ width: `${readinessPercentage}%` }} /></div>
            <p className="mt-3 text-xs leading-5 text-slate-400">{readinessCount} of {readiness.length} product controls are ready.</p>
          </div>
        </div>
      </section>

      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      <section className="grid overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.06)] xl:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)]">
        <article className="p-5 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Controlled configuration</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">One width. Modular length. Clear scope.</h2>
          <div className="mt-5 grid gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-3">
            {PRODUCT.specifications.map(([label, value, detail]) => (
              <div key={label} className="bg-white p-4"><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p><p className="mt-2 text-lg font-bold text-slate-950">{value}</p><p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p></div>
            ))}
          </div>
        </article>
        <aside className="border-t border-slate-200 bg-slate-50 p-5 sm:p-7 xl:border-l xl:border-t-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Length logic</p>
          <h3 className="mt-1 text-xl font-bold text-slate-950">Built in 2.5m bays</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">Length is a configuration, not a separate warehouse product. The W08 identity stays stable as bays are added.</p>
          <div className="mt-5 flex flex-wrap gap-2">{[10, 12.5, 15, 17.5, 20, 25, 30].map((length) => <span key={length} className={`rounded-xl border px-3 py-2 text-xs font-bold ${length === 20 ? "border-sky-300 bg-sky-50 text-sky-800" : "border-slate-200 bg-white text-slate-700"}`}>{length}m</span>)}</div>
          <p className="mt-3 text-xs text-slate-500">20m is the working reference configuration, not a product limit.</p>
        </aside>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {PRODUCT.scopes.map((scope, index) => (
          <article key={scope.name} className={`rounded-[1.4rem] border p-5 shadow-sm ${index === 0 ? "border-slate-800 bg-slate-950 text-white" : "border-slate-200 bg-white"}`}>
            <span className={`grid h-9 w-9 place-items-center rounded-xl text-sm font-bold ${index === 0 ? "bg-amber-400 text-slate-950" : "bg-sky-100 text-sky-700"}`}>{index + 1}</span>
            <h3 className={`mt-5 text-lg font-bold ${index === 0 ? "text-white" : "text-slate-950"}`}>{scope.name}</h3>
            <p className={`mt-2 text-sm leading-6 ${index === 0 ? "text-slate-300" : "text-slate-600"}`}>{scope.detail}</p>
          </article>
        ))}
      </section>

      <section className="grid overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.06)] xl:grid-cols-[minmax(0,1fr)_360px]">
        <article className="p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Product controls</p><h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">W08 readiness trail</h2></div><StatusPill ready={readinessCount === readiness.length} readyLabel="Quote-ready" pendingLabel="In progress" /></div>
          <div className="mt-5 divide-y divide-slate-200">
            {readiness.map((item) => <div key={item.label} className="flex items-center justify-between gap-4 py-3.5"><div className="flex min-w-0 items-center gap-3"><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl ${item.ready ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"}`}>{item.ready ? <Check className="h-4 w-4" /> : <Settings2 className="h-4 w-4" />}</span><div className="min-w-0"><p className="text-sm font-semibold text-slate-900">{item.label}</p><p className="truncate text-xs text-slate-500">{loading ? "Checking live records..." : item.detail}</p></div></div><StatusPill ready={item.ready} /></div>)}
          </div>
        </article>
        <aside className="border-t border-slate-200 bg-amber-50 p-5 sm:p-7 xl:border-l xl:border-t-0">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-400 text-slate-950"><Wrench className="h-5 w-5" /></span>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-amber-900">Engineering review triggers</p>
          <div className="mt-4 space-y-3">{PRODUCT.reviewTriggers.map((item) => <p key={item} className="flex gap-2 text-sm leading-5 text-slate-700"><span className="font-bold text-amber-700">+</span>{item}</p>)}</div>
        </aside>
      </section>

      <section>
        <div className="px-1"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Connected workspaces</p><h2 className="mt-1 text-xl font-bold text-slate-950">Build the product once, use it everywhere</h2></div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {workspaceLinks.map(({ label, href, icon: Icon }) => <Link key={href} href={href} className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md"><span className="flex items-center gap-3 text-sm font-semibold text-slate-800"><span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-600 group-hover:bg-sky-100 group-hover:text-sky-700"><Icon className="h-4 w-4" /></span>{label}</span><ArrowUpRight className="h-4 w-4 text-slate-400" /></Link>)}
        </div>
      </section>
    </div>
  )
}
