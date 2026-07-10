"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { getOsAuthHeaders } from "../../lib/osClientAuth"
import { OS_SECTIONS, OS_STATUS_META } from "../../lib/osNavigation"
import {
  ATLAS_WORKSPACE_PRIORITIES,
  LSF_WORKSPACE_PRIORITIES,
} from "../../lib/osProductData"

function formatCompactDate(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
  })
}

function isOverdue(value) {
  if (!value) return false
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return false
  return date.getTime() < Date.now()
}

function buildAgendaItems({
  atlasDocs = [],
  lsfDocs = [],
  atlasFamilies = [],
  lsfFamilies = [],
  atlasCatalog = [],
  lsfCatalog = [],
}) {
  const dueDocs = [...atlasDocs, ...lsfDocs]
    .filter((record) => record.reviewDueAt && record.status !== "issued")
    .sort((a, b) => new Date(a.reviewDueAt).getTime() - new Date(b.reviewDueAt).getTime())
    .slice(0, 4)
    .map((record) => ({
      label: record.title,
      date: formatCompactDate(record.reviewDueAt),
      tone: isOverdue(record.reviewDueAt) ? "amber" : "sky",
      href: record.platformKey === "atlas" ? "/os/atlas/documents" : "/os/lsf/documents",
      helper: `${record.platformKey === "atlas" ? "Atlas" : "LSF"} document review`,
    }))

  const needsReviewFamilies = [...atlasFamilies, ...lsfFamilies]
    .filter((record) => record.status === "needs_review")
    .slice(0, 2)
    .map((record) => ({
      label: record.name,
      date: "Review",
      tone: "rose",
      href: record.platformKey === "atlas" ? "/os/atlas/products" : "/os/lsf/products",
      helper: `${record.platformKey === "atlas" ? "Atlas" : "LSF"} product family`,
    }))

  const draftCatalog = [...atlasCatalog, ...lsfCatalog]
    .filter((record) => record.status === "draft")
    .slice(0, 2)
    .map((record) => ({
      label: record.title,
      date: "Draft",
      tone: "slate",
      href: record.platformKey === "atlas" ? "/os/atlas/components" : "/os/lsf/modules",
      helper: `${record.platformKey === "atlas" ? "Atlas" : "LSF"} catalog item`,
    }))

  return [...dueDocs, ...needsReviewFamilies, ...draftCatalog].slice(0, 6)
}

function toneClass(tone) {
  if (tone === "amber") return "border-amber-200 bg-amber-50 text-amber-800"
  if (tone === "rose") return "border-rose-200 bg-rose-50 text-rose-700"
  if (tone === "sky") return "border-sky-200 bg-sky-50 text-sky-700"
  return "border-slate-200 bg-slate-100 text-slate-700"
}

export default function OsDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [schemaReady, setSchemaReady] = useState(true)
  const [atlasFamilies, setAtlasFamilies] = useState([])
  const [lsfFamilies, setLsfFamilies] = useState([])
  const [atlasDocs, setAtlasDocs] = useState([])
  const [lsfDocs, setLsfDocs] = useState([])
  const [atlasComponents, setAtlasComponents] = useState([])
  const [lsfModules, setLsfModules] = useState([])

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true)
      setError("")

      try {
        const headers = await getOsAuthHeaders()
        const [
          atlasFamiliesResponse,
          lsfFamiliesResponse,
          atlasDocsResponse,
          lsfDocsResponse,
          atlasComponentsResponse,
          lsfModulesResponse,
        ] = await Promise.all([
          fetch("/api/os/product-families?platform=atlas", { cache: "no-store", headers }),
          fetch("/api/os/product-families?platform=lsf", { cache: "no-store", headers }),
          fetch("/api/os/documents?platform=atlas", { cache: "no-store", headers }),
          fetch("/api/os/documents?platform=lsf", { cache: "no-store", headers }),
          fetch("/api/os/catalog-items?platform=atlas&kind=component", { cache: "no-store", headers }),
          fetch("/api/os/catalog-items?platform=lsf&kind=module", { cache: "no-store", headers }),
        ])

        const [
          atlasFamiliesPayload,
          lsfFamiliesPayload,
          atlasDocsPayload,
          lsfDocsPayload,
          atlasComponentsPayload,
          lsfModulesPayload,
        ] = await Promise.all([
          atlasFamiliesResponse.json(),
          lsfFamiliesResponse.json(),
          atlasDocsResponse.json(),
          lsfDocsResponse.json(),
          atlasComponentsResponse.json(),
          lsfModulesResponse.json(),
        ])

        if (!atlasFamiliesResponse.ok) throw new Error(atlasFamiliesPayload.error || "Could not load Atlas families.")
        if (!lsfFamiliesResponse.ok) throw new Error(lsfFamiliesPayload.error || "Could not load LSF families.")
        if (!atlasDocsResponse.ok) throw new Error(atlasDocsPayload.error || "Could not load Atlas documents.")
        if (!lsfDocsResponse.ok) throw new Error(lsfDocsPayload.error || "Could not load LSF documents.")
        if (!atlasComponentsResponse.ok) throw new Error(atlasComponentsPayload.error || "Could not load Atlas components.")
        if (!lsfModulesResponse.ok) throw new Error(lsfModulesPayload.error || "Could not load LSF modules.")

        setAtlasFamilies(atlasFamiliesPayload.records || [])
        setLsfFamilies(lsfFamiliesPayload.records || [])
        setAtlasDocs(atlasDocsPayload.records || [])
        setLsfDocs(lsfDocsPayload.records || [])
        setAtlasComponents(atlasComponentsPayload.records || [])
        setLsfModules(lsfModulesPayload.records || [])
        setSchemaReady(
          atlasFamiliesPayload.schemaReady !== false &&
            lsfFamiliesPayload.schemaReady !== false &&
            atlasDocsPayload.schemaReady !== false &&
            lsfDocsPayload.schemaReady !== false &&
            atlasComponentsPayload.schemaReady !== false &&
            lsfModulesPayload.schemaReady !== false
        )
      } catch (loadError) {
        setError(loadError.message)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  const stats = useMemo(() => {
    const allFamilies = [...atlasFamilies, ...lsfFamilies]
    const allDocs = [...atlasDocs, ...lsfDocs]
    const allCatalog = [...atlasComponents, ...lsfModules]

    return {
      families: allFamilies.length,
      quoteReadyFamilies: allFamilies.filter((record) => record.quoteReady).length,
      needsReviewFamilies: allFamilies.filter((record) => record.status === "needs_review").length,
      docsNeedingReview: allDocs.filter((record) => record.status === "needs_review").length,
      overdueDocs: allDocs.filter((record) => isOverdue(record.reviewDueAt) && record.status !== "issued").length,
      issuedDocs: allDocs.filter((record) => record.status === "issued").length,
      catalogItems: allCatalog.length,
      draftCatalogItems: allCatalog.filter((record) => record.status === "draft").length,
    }
  }, [atlasFamilies, atlasDocs, atlasComponents, lsfFamilies, lsfDocs, lsfModules])

  const agendaItems = useMemo(
    () =>
      buildAgendaItems({
        atlasDocs,
        lsfDocs,
        atlasFamilies,
        lsfFamilies,
        atlasCatalog: atlasComponents,
        lsfCatalog: lsfModules,
      }),
    [atlasComponents, atlasDocs, atlasFamilies, lsfDocs, lsfFamilies, lsfModules]
  )

  const liveSections = OS_SECTIONS.filter((section) => section.status === "live" && section.key !== "dashboard")
  const nextSections = OS_SECTIONS.filter((section) => section.status === "active_build")

  return (
    <div className="space-y-4 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-6">
      <section className="relative overflow-hidden rounded-[1.8rem] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.14),_transparent_30%),linear-gradient(135deg,_#ffffff,_#f8fafc_52%,_#e2e8f0)] p-4 shadow-sm sm:rounded-[2rem] sm:p-6 lg:p-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_380px]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
              Smart Steel OS
            </p>
            <h3 className="mt-2 max-w-4xl text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">
              The operating dashboard for sales, systems, documents, and delivery readiness
            </h3>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
              Start here for the work that needs attention now, then move into CRM, Atlas, or the LSF line with the right context already in view.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:mt-6 sm:flex-row sm:flex-wrap sm:gap-3">
              <Link
                href="/os/crm"
                className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Open CRM
              </Link>
              <Link
                href="/os/atlas"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Open Atlas
              </Link>
              <Link
                href="/os/lsf"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Open LSF line
              </Link>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/70 bg-white/75 p-4 shadow-sm backdrop-blur sm:rounded-[1.8rem] sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              This week
            </p>
            <div className="mt-3 grid gap-3 sm:mt-4 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Product-system focus
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  Tighten Atlas and LSF product logic so quotes, documents, and pricing all point to the same source structure.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Document watch
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {stats.docsNeedingReview} document{stats.docsNeedingReview === 1 ? "" : "s"} need review and {stats.overdueDocs} item{stats.overdueDocs === 1 ? "" : "s"} are overdue.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 sm:col-span-2 xl:col-span-1">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Live surface
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  CRM is already live. Atlas and the LSF line now have enough structure to behave like real workspaces instead of placeholders.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {!schemaReady ? (
        <section className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900 shadow-sm">
          The OS dashboard is running in fallback mode for some workspace data. Once Phase 1B tables are fully live, these widgets will reflect your live records directly.
        </section>
      ) : null}

      {error ? (
        <section className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700 shadow-sm">
          {error}
        </section>
      ) : null}

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Product families",
            value: stats.families,
            helper: `${stats.quoteReadyFamilies} quote-ready`,
            tone: "border-slate-200 bg-white",
          },
          {
            label: "Documents needing review",
            value: stats.docsNeedingReview,
            helper: `${stats.overdueDocs} overdue`,
            tone: "border-amber-200 bg-amber-50",
          },
          {
            label: "Catalog items",
            value: stats.catalogItems,
            helper: `${stats.draftCatalogItems} drafts still open`,
            tone: "border-sky-200 bg-sky-50",
          },
          {
            label: "Issued documents",
            value: stats.issuedDocs,
            helper: "current client-facing outputs",
            tone: "border-emerald-200 bg-emerald-50",
          },
        ].map((card) => (
          <div key={card.label} className={`rounded-3xl border p-4 shadow-sm sm:p-5 ${card.tone}`}>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{card.label}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:mt-3 sm:text-4xl">{loading ? "..." : card.value}</p>
            <p className="mt-1.5 text-sm leading-6 text-slate-600 sm:mt-2">{card.helper}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Needs attention now
              </p>
              <h3 className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                Short path from signal to action
              </h3>
            </div>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
              Dashboard-first
            </span>
          </div>

          <div className="mt-4 grid gap-3 md:mt-5 md:grid-cols-2">
            <Link
              href="/os/crm"
              className="rounded-[1.6rem] border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-white"
            >
              <p className="text-sm font-semibold text-slate-900">CRM momentum</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Work quotes, follow-ups, and active commercial movement from the live CRM workspace.
              </p>
            </Link>
            <Link
              href="/os/atlas/documents"
              className="rounded-[1.6rem] border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-white"
            >
              <p className="text-sm font-semibold text-slate-900">Atlas document control</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {loading ? "Loading..." : `${atlasDocs.filter((record) => record.status === "needs_review").length} review item(s) currently open in Atlas.`}
              </p>
            </Link>
            <Link
              href="/os/lsf/products"
              className="rounded-[1.6rem] border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-white"
            >
              <p className="text-sm font-semibold text-slate-900">LSF product structure</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Keep the LSF line aligned around stable product families, modules, and document references.
              </p>
            </Link>
            <Link
              href="/os/atlas/components"
              className="rounded-[1.6rem] border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-white"
            >
              <p className="text-sm font-semibold text-slate-900">Component and module records</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {loading ? "Loading..." : `${stats.catalogItems} structured records are already visible across Atlas and LSF workspaces.`}
              </p>
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Calendar widget
              </p>
              <h3 className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                Deadlines and commitments
              </h3>
            </div>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
              Next 7 days
            </span>
          </div>

          <div className="mt-4 space-y-3 sm:mt-5">
            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                Loading agenda...
              </div>
            ) : agendaItems.length > 0 ? (
              agendaItems.map((item) => (
                <Link
                  key={`${item.label}-${item.helper}`}
                  href={item.href}
                  className={`flex items-center justify-between gap-4 rounded-2xl border px-4 py-3 transition hover:brightness-[0.99] ${toneClass(item.tone)}`}
                >
                  <div>
                    <p className="text-sm font-semibold">{item.label}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] opacity-80">{item.helper}</p>
                  </div>
                  <span className="rounded-full border border-current/20 bg-white/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]">
                    {item.date}
                  </span>
                </Link>
              ))
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                No immediate review or document deadlines are currently surfaced here.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_320px]">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Atlas pulse
              </p>
              <h3 className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                Atlas line
              </h3>
            </div>
            <span className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] ${OS_STATUS_META.active_build.badgeClassName}`}>
              {OS_STATUS_META.active_build.label}
            </span>
          </div>
          <div className="mt-4 grid gap-3 sm:mt-5 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Families</p>
              <p className="mt-2 text-3xl font-bold text-slate-950">{loading ? "..." : atlasFamilies.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Documents</p>
              <p className="mt-2 text-3xl font-bold text-slate-950">{loading ? "..." : atlasDocs.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Components</p>
              <p className="mt-2 text-3xl font-bold text-slate-950">{loading ? "..." : atlasComponents.length}</p>
            </div>
          </div>
          <div className="mt-4 space-y-3 sm:mt-5">
            {ATLAS_WORKSPACE_PRIORITIES.map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                LSF pulse
              </p>
              <h3 className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                LSF line
              </h3>
            </div>
            <span className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] ${OS_STATUS_META.active_build.badgeClassName}`}>
              {OS_STATUS_META.active_build.label}
            </span>
          </div>
          <div className="mt-4 grid gap-3 sm:mt-5 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Families</p>
              <p className="mt-2 text-3xl font-bold text-slate-950">{loading ? "..." : lsfFamilies.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Documents</p>
              <p className="mt-2 text-3xl font-bold text-slate-950">{loading ? "..." : lsfDocs.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Modules</p>
              <p className="mt-2 text-3xl font-bold text-slate-950">{loading ? "..." : lsfModules.length}</p>
            </div>
          </div>
          <div className="mt-4 space-y-3 sm:mt-5">
            {LSF_WORKSPACE_PRIORITIES.map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            OS map
          </p>
          <div className="mt-3 space-y-3 sm:mt-4">
            {OS_SECTIONS.filter((section) => section.key !== "dashboard").map((section) => (
              <Link
                key={section.key}
                href={section.href}
                className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-white"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">{section.label}</p>
                  {section.status ? (
                    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${OS_STATUS_META[section.status]?.badgeClassName}`}>
                      {OS_STATUS_META[section.status]?.label}
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{section.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Build direction
            </p>
            <h3 className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              What should expand next
            </h3>
          </div>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
            Keep the dashboard shallow
          </span>
        </div>
        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          {[
            {
              title: "CRM stays the live execution lane",
              body: "Use the dashboard to point people into the right commercial queue, not to recreate the CRM inside the homepage.",
            },
            {
              title: "Atlas and LSF should deepen through records",
              body: "The biggest next gain comes from richer product-family, module, component, and document records rather than more hero text.",
            },
            {
              title: "Manufacturing should arrive through alerts",
              body: "When manufacturing comes in, start with blockers, purchasing gaps, and delivery readiness instead of a huge operations wall.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-base font-semibold text-slate-900">{item.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
