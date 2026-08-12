"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import {
  ArrowUpRight,
  Boxes,
  Calculator,
  Check,
  ChevronRight,
  ClipboardList,
  FileText,
  Gauge,
  PackageSearch,
  Ruler,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react"
import { getOsAuthHeaders } from "../../lib/osClientAuth"

const EXPECTED_W08_COMPONENTS = 7

const MODULES = [
  { label: "Products", href: "/os/atlas/products", description: "W08 scope, specifications and product sheet.", icon: PackageSearch, tone: "bg-sky-50 text-sky-700" },
  { label: "Components", href: "/os/atlas/components", description: "Controlled members, connections and component IDs.", icon: Boxes, tone: "bg-amber-50 text-amber-700" },
  { label: "BOM", href: "/os/atlas/bom", description: "Material structure, quantities and reusable rules.", icon: ClipboardList, tone: "bg-emerald-50 text-emerald-700" },
  { label: "Pricing", href: "/os/atlas/pricing", description: "Commercial rates, inclusions and exceptions.", icon: Calculator, tone: "bg-rose-50 text-rose-700" },
  { label: "Engineering", href: "/os/atlas/engineering", description: "Design assumptions, limits and references.", icon: Ruler, tone: "bg-violet-50 text-violet-700" },
  { label: "Documents", href: "/os/atlas/documents", description: "Controlled product sheets and revisions.", icon: FileText, tone: "bg-slate-100 text-slate-700" },
]

const FAMILY_LINKS = {
  warehouses: "/os/atlas/products",
  carports: "/os/atlas/products",
  solar: "/os/atlas/products",
  trusses: "/os/atlas/products",
  bracketry: "/os/atlas/components",
}

function isSpecificationComplete(record) {
  const specification = record.specification || {}
  const required = ["profileSpec", "thicknessSpec", "gradeSpec", "coatingSpec", "quantityRule"]
  return required.every((key) => {
    const value = String(specification[key] || "").trim().toLowerCase()
    return value && !value.includes("confirm") && !value.includes("pending")
  })
}

function formatStatus(status) {
  return String(status || "draft")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export default function AtlasDashboardWorkspace() {
  const [data, setData] = useState({ families: [], components: [], boms: [], documents: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true

    async function loadDashboard() {
      setLoading(true)
      setError("")
      try {
        const headers = await getOsAuthHeaders()
        const responses = await Promise.all([
          fetch("/api/os/product-families?platform=atlas", { cache: "no-store", headers }),
          fetch("/api/os/catalog-items?platform=atlas&kind=component", { cache: "no-store", headers }),
          fetch("/api/os/boms?platform=atlas", { cache: "no-store", headers }),
          fetch("/api/os/documents?platform=atlas", { cache: "no-store", headers }),
        ])
        const payloads = await Promise.all(responses.map((response) => response.json()))
        const failedIndex = responses.findIndex((response) => !response.ok)
        if (failedIndex >= 0) throw new Error(payloads[failedIndex].error || "Could not load the Atlas workspace.")
        if (!active) return

        setData({
          families: payloads[0].records || [],
          components: payloads[1].records || [],
          boms: payloads[2].records || [],
          documents: payloads[3].records || [],
        })
      } catch (loadError) {
        if (active) setError(loadError.message)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadDashboard()
    return () => { active = false }
  }, [])

  const summary = useMemo(() => {
    const warehouseFamily = data.families.find((family) => family.key === "warehouses")
    const warehouseComponents = data.components.filter(
      (component) => component.productFamilyKey === "warehouses" || component.componentCode?.startsWith("W08-")
    )
    const completeComponents = warehouseComponents.filter(isSpecificationComplete)
    const w08Bom = data.boms.find((bom) => bom.code === "ATL-WH-8M-SHELL") || data.boms[0]
    const warehouseDocuments = data.documents.filter((document) => document.productFamilyKey === "warehouses")
    const controlledDocument = warehouseDocuments.find((document) => ["reviewed", "issued"].includes(document.status))

    const controls = [
      { label: "Product definition", ready: Boolean(warehouseFamily), href: "/os/atlas/products" },
      { label: "Component coverage", ready: warehouseComponents.length >= EXPECTED_W08_COMPONENTS, href: "/os/atlas/components" },
      { label: "Component specifications", ready: completeComponents.length >= EXPECTED_W08_COMPONENTS, href: "/os/atlas/components" },
      { label: "Controlled BOM", ready: w08Bom?.status === "approved", href: "/os/atlas/bom" },
      { label: "Issued product document", ready: Boolean(controlledDocument), href: "/os/atlas/documents" },
    ]

    const attention = []
    if (warehouseComponents.length < EXPECTED_W08_COMPONENTS) {
      attention.push({
        title: "Complete the W08 component register",
        detail: `${warehouseComponents.length} of ${EXPECTED_W08_COMPONENTS} standard component groups are registered.`,
        href: "/os/atlas/components",
      })
    }
    if (completeComponents.length < warehouseComponents.length) {
      attention.push({
        title: "Close component specification gaps",
        detail: `${warehouseComponents.length - completeComponents.length} registered component records still need controlled specifications.`,
        href: "/os/atlas/components",
      })
    }
    if (w08Bom?.status !== "approved") {
      attention.push({
        title: "Approve the W08 baseline BOM",
        detail: w08Bom ? `${w08Bom.code} is currently ${formatStatus(w08Bom.status).toLowerCase()}.` : "No controlled W08 BOM is available yet.",
        href: "/os/atlas/bom",
      })
    }
    if (!controlledDocument) {
      attention.push({
        title: "Issue the first controlled product sheet",
        detail: `${warehouseDocuments.length} warehouse document${warehouseDocuments.length === 1 ? "" : "s"} linked; none issued yet.`,
        href: "/os/atlas/documents",
      })
    }

    return {
      warehouseFamily,
      warehouseComponents,
      completeComponents,
      w08Bom,
      warehouseDocuments,
      controls,
      attention,
      readyCount: controls.filter((control) => control.ready).length,
      readiness: Math.round((controls.filter((control) => control.ready).length / controls.length) * 100),
    }
  }, [data])

  const recentRecords = useMemo(() => {
    return [
      ...data.components.map((record) => ({ ...record, recordType: "Component", displayName: record.title })),
      ...data.boms.map((record) => ({ ...record, recordType: "BOM", displayName: record.title })),
      ...data.documents.map((record) => ({ ...record, recordType: "Document", displayName: record.title })),
    ]
      .filter((record) => record.updatedAt || record.createdAt)
      .sort((left, right) => new Date(right.updatedAt || right.createdAt) - new Date(left.updatedAt || left.createdAt))
      .slice(0, 5)
  }, [data])

  return (
    <div className="space-y-5 px-3 py-4 sm:space-y-6 sm:px-6 sm:py-6">
      <section className="relative overflow-hidden rounded-[1.75rem] border border-[#001d2e] bg-[radial-gradient(circle_at_85%_0%,rgba(193,217,229,0.22),transparent_32%),linear-gradient(140deg,#001d2e,#0043f3)] text-white shadow-[0_24px_60px_rgba(0,29,46,0.22)]">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-[linear-gradient(135deg,transparent_45%,rgba(193,217,229,0.16)_45%,rgba(193,217,229,0.16)_47%,transparent_47%)]" />
        <div className="relative grid gap-7 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-sm bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#0043f3]">Atlas system</span>
              <span className="rounded-sm border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#c1d9e5]">Product control</span>
            </div>
            <h1 className="mt-5 max-w-3xl text-3xl font-bold tracking-[-0.04em] sm:text-5xl">
              Build the Atlas system from one source of truth.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Product definitions, component records, material logic and controlled documents connected around commercially usable systems.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link href="/os/atlas/products" className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-black text-[#0043f3] transition hover:bg-[#c1d9e5]">
                Open W08 product <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link href="/warehouse-builder?productType=LCSS%20Warehouse&width=8&length=20" className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/10">
                Test live builder
              </Link>
            </div>
          </div>

          <div className="border border-white/10 bg-white/5 p-5 backdrop-blur">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">W08 system readiness</p>
                <p className="mt-2 text-5xl font-bold tracking-tight">{loading ? "--" : `${summary.readiness}%`}</p>
              </div>
              <Gauge className="h-9 w-9 text-[#c1d9e5]" />
            </div>
            <div className="mt-5 h-2 overflow-hidden bg-white/10">
              <div className="h-full bg-[#c1d9e5] transition-[width] duration-700" style={{ width: `${summary.readiness}%` }} />
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-400">{summary.readyCount} of {summary.controls.length} product controls complete.</p>
          </div>
        </div>
      </section>

      {error ? <div className="border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
        <div className="border border-slate-200 bg-white shadow-sm">
          <div className="flex items-end justify-between gap-4 border-b border-slate-200 p-5 sm:p-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-700">System controls</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Atlas W08 at a glance</h2>
            </div>
            <ShieldCheck className="h-7 w-7 text-slate-300" />
          </div>
          <div className="grid gap-px bg-slate-200 sm:grid-cols-2">
            {summary.controls.map((control) => (
              <Link key={control.label} href={control.href} className="group flex items-center justify-between gap-3 bg-white p-4 transition hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <span className={`grid h-8 w-8 place-items-center ${control.ready ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"}`}>
                    {control.ready ? <Check className="h-4 w-4" /> : <TriangleAlert className="h-4 w-4" />}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{control.label}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{control.ready ? "Controlled" : "Needs attention"}</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-700" />
              </Link>
            ))}
          </div>
        </div>

        <aside className="border border-amber-200 bg-amber-50/70 p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-800">Finish next</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">Move W08 towards release</h2>
          <div className="mt-4 space-y-3">
            {loading ? (
              <p className="text-sm text-slate-500">Checking controlled records...</p>
            ) : summary.attention.length === 0 ? (
              <div className="bg-white/80 p-4">
                <p className="font-bold text-emerald-800">All current W08 controls are complete.</p>
              </div>
            ) : (
              summary.attention.slice(0, 4).map((item, index) => (
                <Link key={item.title} href={item.href} className="group block border border-amber-200 bg-white p-4 transition hover:border-amber-300">
                  <div className="flex gap-3">
                    <span className="text-xs font-black text-amber-700">0{index + 1}</span>
                    <div>
                      <p className="text-sm font-bold text-slate-950">{item.title}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-600">{item.detail}</p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </aside>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Working modules</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Move from product to production logic</h2>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {MODULES.map((module) => {
            const Icon = module.icon
            return (
              <Link key={module.label} href={module.href} className="group border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
                <div className="flex items-start justify-between gap-4">
                  <span className={`grid h-11 w-11 place-items-center ${module.tone}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:text-slate-900" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-slate-950">{module.label}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">{module.description}</p>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Product families</p>
          <div className="mt-4 grid gap-px overflow-hidden border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-3">
            {data.families.map((family) => (
              <Link key={family.id || family.key} href={FAMILY_LINKS[family.key] || "/os/atlas/products"} className="group bg-white p-4 transition hover:bg-slate-50">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-bold text-slate-950">{family.name}</p>
                  <span className={`h-2.5 w-2.5 rounded-full ${family.quoteReady ? "bg-emerald-500" : "bg-amber-400"}`} />
                </div>
                <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{family.summary || "Atlas product family record."}</p>
                <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  {family.quoteReady ? "Quote ready" : formatStatus(family.status)}
                </p>
              </Link>
            ))}
          </div>
        </div>

        <aside className="border border-slate-200 bg-slate-950 p-5 text-white shadow-sm sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-300">Latest movement</p>
          <div className="mt-4 divide-y divide-white/10">
            {recentRecords.length === 0 ? (
              <p className="py-4 text-sm text-slate-400">No controlled record activity yet.</p>
            ) : (
              recentRecords.map((record) => (
                <div key={`${record.recordType}-${record.id}`} className="py-3 first:pt-0">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-bold text-white">{record.displayName}</p>
                    <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">{record.recordType}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{formatStatus(record.status)}</p>
                </div>
              ))
            )}
          </div>
        </aside>
      </section>
    </div>
  )
}
