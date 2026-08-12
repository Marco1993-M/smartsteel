"use client"

import { useEffect, useState } from "react"
import { getOsAuthHeaders } from "../../lib/osClientAuth"
import {
  CATALOG_ITEM_STATUS_OPTIONS,
  formatStatusLabel,
  PLATFORM_META,
} from "../../lib/osPhase1bData"

function toneForStatus(status) {
  if (status === "active") return "border-emerald-200 bg-emerald-50 text-emerald-700"
  if (status === "needs_review") return "border-amber-200 bg-amber-50 text-amber-700"
  return "border-slate-200 bg-slate-100 text-slate-600"
}

export default function CatalogItemsWorkspace({
  platformKey,
  kind,
  title,
  description,
  guidance = [],
  rules = [],
}) {
  const platform = PLATFORM_META[platformKey]
  const [records, setRecords] = useState([])
  const [families, setFamilies] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [schemaReady, setSchemaReady] = useState(true)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    category: "",
    title: "",
    summary: "",
    owner: "",
    productFamilyId: "",
    status: "draft",
    tags: "",
  })

  async function loadWorkspace() {
    setLoading(true)
    setError("")

    try {
      const headers = await getOsAuthHeaders()
      const [itemsResponse, familiesResponse] = await Promise.all([
        fetch(`/api/os/catalog-items?platform=${platformKey}&kind=${kind}`, { cache: "no-store", headers }),
        fetch(`/api/os/product-families?platform=${platformKey}`, { cache: "no-store", headers }),
      ])

      const itemsPayload = await itemsResponse.json()
      const familiesPayload = await familiesResponse.json()

      if (!itemsResponse.ok) throw new Error(itemsPayload.error || "Could not load records.")
      if (!familiesResponse.ok) throw new Error(familiesPayload.error || "Could not load product families.")

      setRecords(itemsPayload.records || [])
      setFamilies(familiesPayload.records || [])
      setSchemaReady(itemsPayload.schemaReady !== false && familiesPayload.schemaReady !== false)
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWorkspace()
  }, [platformKey, kind])

  async function handleCreate(event) {
    event.preventDefault()
    setSaving(true)
    setError("")

    try {
      const response = await fetch("/api/os/catalog-items", {
        method: "POST",
        headers: await getOsAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          platformKey,
          kind,
          ...form,
        }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Could not add record.")

      setRecords((current) => [...current, payload.record].sort((a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title)))
      setSchemaReady(true)
      setForm({
        category: "",
        title: "",
        summary: "",
        owner: "",
        productFamilyId: "",
        status: "draft",
        tags: "",
      })
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setSaving(false)
    }
  }

  async function handlePatch(id, status) {
    try {
      const response = await fetch("/api/os/catalog-items", {
        method: "PATCH",
        headers: await getOsAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ id, status }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Could not update record.")
      setRecords((current) => current.map((record) => (record.id === id ? payload.record : record)))
    } catch (patchError) {
      setError(patchError.message)
    }
  }

  const activeCount = records.filter((record) => record.status === "active").length
  const reviewCount = records.filter((record) => record.status === "needs_review").length
  const categories = [...new Set(records.map((record) => record.category).filter(Boolean))]

  return (
    <div className="space-y-6 px-4 py-5 sm:px-6 sm:py-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {platform.label} {formatStatusLabel(kind)}
              {kind.endsWith("s") ? "" : "s"}
            </p>
            <h3 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{title}</h3>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Records</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{records.length}</p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Active</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{activeCount}</p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">Need review</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{reviewCount}</p>
            </div>
          </div>
        </div>

        {!schemaReady ? (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Live fallback mode. Run the next `Phase 1B` SQL to unlock writeable records here.
          </div>
        ) : null}

        {error ? (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
        <div className="space-y-4">
          {guidance.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-3">
              {guidance.map((item) => (
                <div key={item.title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
                </div>
              ))}
            </div>
          ) : null}

          {loading ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">
              Loading records...
            </div>
          ) : (
            records.map((record) => (
              <div key={record.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold text-slate-900">{record.title}</p>
                      <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${toneForStatus(record.status)}`}>
                        {formatStatusLabel(record.status)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      {record.category || "Uncategorized"} · {record.productFamilyName}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{record.summary || "No summary captured yet."}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    <p className="font-semibold text-slate-900">{record.owner || "Unassigned"}</p>
                    <p className="mt-1">Owner</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {(record.tags || []).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {record.status !== "active" ? (
                    <button
                      type="button"
                      onClick={() => handlePatch(record.id, "active")}
                      className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                    >
                      Mark active
                    </button>
                  ) : null}
                  {record.status !== "needs_review" ? (
                    <button
                      type="button"
                      onClick={() => handlePatch(record.id, "needs_review")}
                      className="rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-100"
                    >
                      Needs review
                    </button>
                  ) : null}
                  {record.status !== "draft" ? (
                    <button
                      type="button"
                      onClick={() => handlePatch(record.id, "draft")}
                      className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Move to draft
                    </button>
                  ) : null}
                </div>
              </div>
            ))
          )}

          {!loading && categories.length > 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Categories in use</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {categories.map((category) => (
                  <span
                    key={category}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Add record</p>
          <h4 className="mt-2 text-xl font-semibold text-slate-900">Register a new {kind}</h4>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Add it once here so the next pricing, BOM, and document layers can point to a real reusable record.
          </p>

          <form onSubmit={handleCreate} className="mt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Category</label>
                <input
                  value={form.category}
                  onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-slate-500"
                  placeholder="Primary framing"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Owner</label>
                <input
                  value={form.owner}
                  onChange={(event) => setForm((current) => ({ ...current, owner: event.target.value }))}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-slate-500"
                  placeholder="Owner"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Title</label>
              <input
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-slate-500"
                placeholder="Record title"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Summary</label>
              <textarea
                value={form.summary}
                onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))}
                className="min-h-[110px] w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
                placeholder="What this record covers and why the team should reuse it."
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Product family</label>
                <select
                  value={form.productFamilyId}
                  onChange={(event) => setForm((current) => ({ ...current, productFamilyId: event.target.value }))}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-slate-500"
                >
                  <option value="">Unlinked</option>
                  {families.map((family) => (
                    <option key={family.id} value={family.id}>
                      {family.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
                <select
                  value={form.status}
                  onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-slate-500"
                >
                  {CATALOG_ITEM_STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {formatStatusLabel(option)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Tags</label>
              <input
                value={form.tags}
                onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-slate-500"
                placeholder="Comma-separated tags"
              />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Working rules</p>
              <div className="mt-3 space-y-2">
                {rules.map((rule) => (
                  <p key={rule} className="text-sm leading-6 text-slate-600">
                    {rule}
                  </p>
                ))}
              </div>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : `Add ${kind}`}
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}
