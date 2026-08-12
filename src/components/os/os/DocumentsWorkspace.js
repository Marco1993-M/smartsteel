"use client"

import { useEffect, useState } from "react"
import { getOsAuthHeaders } from "../../lib/osClientAuth"
import {
  DOCUMENT_STATUS_OPTIONS,
  DOCUMENT_TYPE_OPTIONS,
  formatStatusLabel,
  PLATFORM_META,
} from "../../lib/osPhase1bData"

function toneForStatus(status) {
  if (status === "issued") return "border-emerald-200 bg-emerald-50 text-emerald-700"
  if (status === "needs_review") return "border-amber-200 bg-amber-50 text-amber-700"
  if (status === "reviewed") return "border-sky-200 bg-sky-50 text-sky-700"
  return "border-slate-200 bg-slate-100 text-slate-600"
}

function formatDate(value) {
  if (!value) return "Not set"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Not set"
  return date.toLocaleDateString()
}

function isPastDue(value) {
  if (!value) return false
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return false
  return date.getTime() < Date.now()
}

export default function DocumentsWorkspace({ platformKey, rules = [] }) {
  const platform = PLATFORM_META[platformKey]
  const [records, setRecords] = useState([])
  const [families, setFamilies] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [schemaReady, setSchemaReady] = useState(true)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    title: "",
    documentType: "scope_reference",
    productFamilyId: "",
    revisionCode: "",
    owner: "",
    status: "draft",
    clientVisible: false,
    reviewDueAt: "",
    notes: "",
  })

  async function loadWorkspace() {
    setLoading(true)
    setError("")

    try {
      const headers = await getOsAuthHeaders()
      const [docsResponse, familiesResponse] = await Promise.all([
        fetch(`/api/os/documents?platform=${platformKey}`, { cache: "no-store", headers }),
        fetch(`/api/os/product-families?platform=${platformKey}`, { cache: "no-store", headers }),
      ])

      const docsPayload = await docsResponse.json()
      const familiesPayload = await familiesResponse.json()

      if (!docsResponse.ok) throw new Error(docsPayload.error || "Could not load documents.")
      if (!familiesResponse.ok) throw new Error(familiesPayload.error || "Could not load product families.")

      setRecords(docsPayload.records || [])
      setFamilies(familiesPayload.records || [])
      setSchemaReady(docsPayload.schemaReady !== false && familiesPayload.schemaReady !== false)
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWorkspace()
  }, [platformKey])

  async function handleCreate(event) {
    event.preventDefault()
    setSaving(true)
    setError("")

    try {
      const response = await fetch("/api/os/documents", {
        method: "POST",
        headers: await getOsAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          platformKey,
          ...form,
          productFamilyId: form.productFamilyId || null,
          reviewDueAt: form.reviewDueAt || null,
        }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Could not add document.")

      setRecords((current) => [payload.record, ...current])
      setSchemaReady(true)
      setForm({
        title: "",
        documentType: "scope_reference",
        productFamilyId: "",
        revisionCode: "",
        owner: "",
        status: "draft",
        clientVisible: false,
        reviewDueAt: "",
        notes: "",
      })
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setSaving(false)
    }
  }

  async function handlePatch(id, action) {
    try {
      const response = await fetch("/api/os/documents", {
        method: "PATCH",
        headers: await getOsAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ id, action }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Could not update document.")

      setRecords((current) => current.map((record) => (record.id === id ? payload.record : record)))
    } catch (patchError) {
      setError(patchError.message)
    }
  }

  const reviewCount = records.filter((record) => record.status === "needs_review").length
  const issuedCount = records.filter((record) => record.status === "issued").length
  const overdueCount = records.filter((record) => isPastDue(record.reviewDueAt) && record.status !== "issued").length

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {platform.label} documents
            </p>
            <h3 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Live document register and issue workflow
            </h3>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Track what exists, what needs review, and what has already been issued to the client from one shared register.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Documents</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{records.length}</p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">Need review</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{reviewCount}</p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Issued</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{issuedCount}</p>
            </div>
          </div>
        </div>

        {!schemaReady ? (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Live fallback mode. Run the `Phase 1B` SQL to unlock writeable document records and status updates.
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
          {loading ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">
              Loading document register...
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
                      {record.clientVisible ? (
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700">
                          Client-facing
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      {formatStatusLabel(record.documentType)} · {record.productFamilyName || "Unlinked"}
                    </p>
                    {record.notes ? (
                      <p className="mt-2 text-sm leading-6 text-slate-600">{record.notes}</p>
                    ) : null}
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    <p className="font-semibold text-slate-900">{record.owner || "Unassigned"}</p>
                    <p className="mt-1">Owner</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Revision</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{record.revisionCode || "Not set"}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Review due</p>
                    <p className={`mt-1 text-sm font-semibold ${isPastDue(record.reviewDueAt) && record.status !== "issued" ? "text-amber-700" : "text-slate-900"}`}>
                      {formatDate(record.reviewDueAt)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Last sent</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{formatDate(record.lastSentAt)}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Attention</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {isPastDue(record.reviewDueAt) && record.status !== "issued" ? "Review overdue" : "In control"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {record.status !== "reviewed" ? (
                    <button
                      type="button"
                      onClick={() => handlePatch(record.id, "mark_reviewed")}
                      className="rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-800 transition hover:bg-sky-100"
                    >
                      Mark reviewed
                    </button>
                  ) : null}
                  {record.status !== "issued" ? (
                    <button
                      type="button"
                      onClick={() => handlePatch(record.id, "mark_sent")}
                      className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                    >
                      Mark sent
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
                </div>
              </div>
            ))
          )}

          {!loading && overdueCount > 0 ? (
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800 shadow-sm">
              {overdueCount} document{overdueCount === 1 ? "" : "s"} need review attention right now.
            </div>
          ) : null}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Register document</p>
          <h4 className="mt-2 text-xl font-semibold text-slate-900">Add a working document</h4>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Capture the file once so the team can see its owner, revision, review state, and client issue status.
          </p>

          <form onSubmit={handleCreate} className="mt-5 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Title</label>
              <input
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-slate-500"
                placeholder="Document title"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Document type</label>
                <select
                  value={form.documentType}
                  onChange={(event) => setForm((current) => ({ ...current, documentType: event.target.value }))}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-slate-500"
                >
                  {DOCUMENT_TYPE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {formatStatusLabel(option)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Family</label>
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
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Revision</label>
                <input
                  value={form.revisionCode}
                  onChange={(event) => setForm((current) => ({ ...current, revisionCode: event.target.value }))}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-slate-500"
                  placeholder="R1"
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
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
                <select
                  value={form.status}
                  onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-slate-500"
                >
                  {DOCUMENT_STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {formatStatusLabel(option)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Review due</label>
                <input
                  type="date"
                  value={form.reviewDueAt}
                  onChange={(event) => setForm((current) => ({ ...current, reviewDueAt: event.target.value }))}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-slate-500"
                />
              </div>
            </div>
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.clientVisible}
                onChange={(event) => setForm((current) => ({ ...current, clientVisible: event.target.checked }))}
              />
              This document is client-facing
            </label>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Notes</label>
              <textarea
                value={form.notes}
                onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                className="min-h-[110px] w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
                placeholder="Why this document matters, what changed, or what the team should know."
              />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Document rules</p>
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
              {saving ? "Saving..." : "Register document"}
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}
