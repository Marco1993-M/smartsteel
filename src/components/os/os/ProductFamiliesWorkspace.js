"use client"

import { useEffect, useState } from "react"
import { getOsAuthHeaders } from "../../lib/osClientAuth"
import {
  formatStatusLabel,
  PLATFORM_META,
  PRODUCT_FAMILY_STATUS_OPTIONS,
} from "../../lib/osPhase1bData"

function toneForStatus(status) {
  if (status === "active") return "border-emerald-200 bg-emerald-50 text-emerald-700"
  if (status === "needs_review") return "border-amber-200 bg-amber-50 text-amber-700"
  return "border-slate-200 bg-slate-100 text-slate-600"
}

export default function ProductFamiliesWorkspace({ platformKey, rules = [] }) {
  const platform = PLATFORM_META[platformKey]
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [schemaReady, setSchemaReady] = useState(true)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    name: "",
    summary: "",
    owner: "",
    status: "draft",
    quoteReady: false,
    sampleProducts: "",
  })

  async function loadRecords() {
    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/os/product-families?platform=${platformKey}`, {
        cache: "no-store",
        headers: await getOsAuthHeaders(),
      })
      const payload = await response.json()

      if (!response.ok) throw new Error(payload.error || "Could not load product families.")

      setRecords(payload.records || [])
      setSchemaReady(payload.schemaReady !== false)
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRecords()
  }, [platformKey])

  async function handleCreate(event) {
    event.preventDefault()
    setSaving(true)
    setError("")

    try {
      const response = await fetch("/api/os/product-families", {
        method: "POST",
        headers: await getOsAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          platformKey,
          ...form,
        }),
      })
      const payload = await response.json()

      if (!response.ok) throw new Error(payload.error || "Could not add product family.")

      setRecords((current) => [...current, payload.record].sort((a, b) => a.name.localeCompare(b.name)))
      setSchemaReady(true)
      setForm({
        name: "",
        summary: "",
        owner: "",
        status: "draft",
        quoteReady: false,
        sampleProducts: "",
      })
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setSaving(false)
    }
  }

  async function handlePatch(id, updates) {
    try {
      const response = await fetch("/api/os/product-families", {
        method: "PATCH",
        headers: await getOsAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ id, ...updates }),
      })
      const payload = await response.json()

      if (!response.ok) throw new Error(payload.error || "Could not update product family.")

      setRecords((current) => current.map((record) => (record.id === id ? payload.record : record)))
    } catch (patchError) {
      setError(patchError.message)
    }
  }

  const activeCount = records.filter((record) => record.status === "active").length
  const quoteReadyCount = records.filter((record) => record.quoteReady).length
  const reviewCount = records.filter((record) => record.status === "needs_review").length

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {platform.label} products
            </p>
            <h3 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Real product-family records for the OS
            </h3>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Manage naming, quoting readiness, and ownership from live records instead of static reference copy.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Families</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{records.length}</p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Quote-ready</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{quoteReadyCount}</p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">Need review</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{reviewCount}</p>
            </div>
          </div>
        </div>

        {!schemaReady ? (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Live fallback mode. Run the `Phase 1B` SQL to unlock writeable product-family records.
          </div>
        ) : null}

        {error ? (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <div className="space-y-4">
          {loading ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">
              Loading product-family records...
            </div>
          ) : (
            records.map((record) => (
              <div key={record.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold text-slate-900">{record.name}</p>
                      <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${toneForStatus(record.status)}`}>
                        {formatStatusLabel(record.status)}
                      </span>
                      {record.quoteReady ? (
                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
                          Quote-ready
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{record.summary || "No summary captured yet."}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    <p className="font-semibold text-slate-900">{record.owner || "Unassigned"}</p>
                    <p className="mt-1">Owner</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {(record.sampleProducts || []).map((product) => (
                    <span
                      key={product}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
                    >
                      {product}
                    </span>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {!record.quoteReady ? (
                    <button
                      type="button"
                      onClick={() => handlePatch(record.id, { quoteReady: true })}
                      className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Mark quote-ready
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handlePatch(record.id, { quoteReady: false })}
                      className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Remove quote-ready
                    </button>
                  )}
                  {record.status !== "active" ? (
                    <button
                      type="button"
                      onClick={() => handlePatch(record.id, { status: "active" })}
                      className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                    >
                      Mark active
                    </button>
                  ) : null}
                  {record.status !== "needs_review" ? (
                    <button
                      type="button"
                      onClick={() => handlePatch(record.id, { status: "needs_review" })}
                      className="rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-100"
                    >
                      Needs review
                    </button>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Register family</p>
          <h4 className="mt-2 text-xl font-semibold text-slate-900">Add a new working family</h4>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Add the family once here so CRM, quoting, and document structure stop drifting.
          </p>

          <form onSubmit={handleCreate} className="mt-5 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Family name</label>
              <input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-slate-500"
                placeholder={`${platform.shortLabel} family name`}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Summary</label>
              <textarea
                value={form.summary}
                onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))}
                className="min-h-[110px] w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
                placeholder="What this family covers and how the team should understand it."
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Owner</label>
                <input
                  value={form.owner}
                  onChange={(event) => setForm((current) => ({ ...current, owner: event.target.value }))}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-slate-500"
                  placeholder="Marco"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
                <select
                  value={form.status}
                  onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-slate-500"
                >
                  {PRODUCT_FAMILY_STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {formatStatusLabel(option)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Sample products</label>
              <input
                value={form.sampleProducts}
                onChange={(event) => setForm((current) => ({ ...current, sampleProducts: event.target.value }))}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-slate-500"
                placeholder="Comma-separated examples"
              />
            </div>
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.quoteReady}
                onChange={(event) => setForm((current) => ({ ...current, quoteReady: event.target.checked }))}
              />
              Mark this family as quote-ready now
            </label>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Family rules</p>
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
              {saving ? "Saving..." : "Add product family"}
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}
