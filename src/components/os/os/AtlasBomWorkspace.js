"use client"

import { useEffect, useMemo, useState } from "react"
import { getOsAuthHeaders } from "../../lib/osClientAuth"
import {
  BOM_LINE_SCOPE_OPTIONS,
  BOM_STATUS_OPTIONS,
  BOM_UNIT_OPTIONS,
  formatStatusLabel,
} from "../../lib/osPhase1bData"

function statusTone(status) {
  if (status === "approved") return "border-emerald-200 bg-emerald-50 text-emerald-700"
  if (status === "needs_review") return "border-amber-200 bg-amber-50 text-amber-700"
  if (status === "superseded") return "border-slate-300 bg-slate-100 text-slate-500"
  return "border-slate-200 bg-slate-100 text-slate-600"
}

function scopeTone(scope) {
  if (scope === "standard") return "border-sky-200 bg-sky-50 text-sky-700"
  if (scope === "optional") return "border-violet-200 bg-violet-50 text-violet-700"
  return "border-amber-200 bg-amber-50 text-amber-700"
}

function emptyBomForm() {
  return {
    productFamilyId: "",
    code: "",
    title: "",
    description: "",
    revisionCode: "R0",
    owner: "",
    status: "draft",
  }
}

function emptyLineForm() {
  return {
    lineNumber: "",
    category: "",
    description: "",
    componentId: "",
    quantity: "1",
    unit: "each",
    wasteFactor: "0",
    scope: "standard",
    notes: "",
  }
}

function formatQuantity(value) {
  return Number(value || 0).toLocaleString("en-ZA", { maximumFractionDigits: 3 })
}

export default function AtlasBomWorkspace() {
  const [records, setRecords] = useState([])
  const [families, setFamilies] = useState([])
  const [components, setComponents] = useState([])
  const [selectedId, setSelectedId] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [schemaReady, setSchemaReady] = useState(true)
  const [error, setError] = useState("")
  const [bomForm, setBomForm] = useState(emptyBomForm)
  const [lineForm, setLineForm] = useState(emptyLineForm)

  async function loadWorkspace() {
    setLoading(true)
    setError("")

    try {
      const headers = await getOsAuthHeaders()
      const [bomsResponse, familiesResponse, componentsResponse] = await Promise.all([
        fetch("/api/os/boms?platform=atlas", { cache: "no-store", headers }),
        fetch("/api/os/product-families?platform=atlas", { cache: "no-store", headers }),
        fetch("/api/os/catalog-items?platform=atlas&kind=component", { cache: "no-store", headers }),
      ])
      const [bomsPayload, familiesPayload, componentsPayload] = await Promise.all([
        bomsResponse.json(),
        familiesResponse.json(),
        componentsResponse.json(),
      ])

      if (!bomsResponse.ok) throw new Error(bomsPayload.error || "Could not load Atlas BOM records.")
      if (!familiesResponse.ok) throw new Error(familiesPayload.error || "Could not load Atlas product families.")
      if (!componentsResponse.ok) throw new Error(componentsPayload.error || "Could not load Atlas components.")

      const nextRecords = bomsPayload.records || []
      setRecords(nextRecords)
      setFamilies(familiesPayload.records || [])
      setComponents(componentsPayload.records || [])
      setSchemaReady(
        bomsPayload.schemaReady !== false &&
          familiesPayload.schemaReady !== false &&
          componentsPayload.schemaReady !== false
      )
      setSelectedId((current) => current || nextRecords[0]?.id || "")
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWorkspace()
  }, [])

  const selectedBom = records.find((record) => record.id === selectedId) || records[0] || null
  const approvedCount = records.filter((record) => record.status === "approved").length
  const reviewCount = records.filter((record) => record.status === "needs_review").length
  const lineCount = records.reduce((total, record) => total + (record.lines || []).length, 0)
  const selectedBomOverview = useMemo(() => {
    const lines = selectedBom?.lines || []
    const categories = []
    const groups = new Map()

    lines.forEach((line) => {
      const category = line.category || "Uncategorized"
      if (!groups.has(category)) {
        groups.set(category, [])
        categories.push(category)
      }
      groups.get(category).push(line)
    })

    return {
      groups: categories.map((category, index) => ({
        category,
        level: index + 1,
        lines: groups.get(category),
      })),
      registeredCount: lines.filter((line) => line.componentCode || line.componentId).length,
      reviewCount: lines.filter(
        (line) => line.scope === "project_specific" || !line.componentCode
      ).length,
      categoryCount: categories.length,
    }
  }, [selectedBom])

  function replaceRecord(nextRecord) {
    setRecords((current) => current.map((record) => (record.id === nextRecord.id ? nextRecord : record)))
  }

  async function createBom(event) {
    event.preventDefault()
    setSaving(true)
    setError("")

    try {
      const response = await fetch("/api/os/boms", {
        method: "POST",
        headers: await getOsAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ platformKey: "atlas", ...bomForm }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Could not create the BOM.")

      setRecords((current) => [payload.record, ...current])
      setSelectedId(payload.record.id)
      setBomForm(emptyBomForm())
      setSchemaReady(true)
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setSaving(false)
    }
  }

  async function changeStatus(status) {
    if (!selectedBom) return
    setSaving(true)
    setError("")
    try {
      const response = await fetch("/api/os/boms", {
        method: "PATCH",
        headers: await getOsAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ action: "status", bomId: selectedBom.id, status }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Could not update BOM status.")
      replaceRecord(payload.record)
    } catch (updateError) {
      setError(updateError.message)
    } finally {
      setSaving(false)
    }
  }

  async function addLine(event) {
    event.preventDefault()
    if (!selectedBom) return
    setSaving(true)
    setError("")

    try {
      const response = await fetch("/api/os/boms", {
        method: "PATCH",
        headers: await getOsAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          action: "add_line",
          bomId: selectedBom.id,
          ...lineForm,
          quantity: Number(lineForm.quantity),
          lineNumber: Number(lineForm.lineNumber),
          wasteFactor: Number(lineForm.wasteFactor) / 100,
        }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Could not add the BOM line.")

      replaceRecord(payload.record)
      setLineForm(emptyLineForm())
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setSaving(false)
    }
  }

  async function deleteLine(lineId) {
    if (!selectedBom) return
    setSaving(true)
    setError("")

    try {
      const response = await fetch("/api/os/boms", {
        method: "PATCH",
        headers: await getOsAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ action: "delete_line", bomId: selectedBom.id, lineId }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Could not remove the BOM line.")
      replaceRecord(payload.record)
    } catch (deleteError) {
      setError(deleteError.message)
    } finally {
      setSaving(false)
    }
  }

  function selectComponent(componentId) {
    const component = components.find((item) => item.id === componentId)
    setLineForm((current) => ({
      ...current,
      componentId,
      category: component?.category || current.category,
      description: component?.title || current.description,
    }))
  }

  return (
    <div className="space-y-6 px-4 py-5 sm:px-6 sm:py-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Atlas bill of materials</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Live material structures for Atlas products</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Build a reusable product baseline before pricing, documents, or manufacturing handoffs are created. Each BOM keeps standard scope, optional items, and project-specific review items separate.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Metric label="BOMs" value={records.length} tone="slate" />
            <Metric label="Approved" value={approvedCount} tone="emerald" />
            <Metric label="Material lines" value={lineCount} tone="sky" />
          </div>
        </div>

        {!schemaReady ? (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Fallback mode is showing the working BOM structure. Run the Phase 1B Wave 3 SQL to create and update live BOM records.
          </div>
        ) : null}
        {error ? <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(280px,0.72fr)_minmax(0,1.28fr)]">
        <aside className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">BOM register</p>
              <p className="mt-1 text-sm text-slate-600">Choose a reusable template to inspect its material logic.</p>
            </div>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">{reviewCount} review</span>
          </div>

          <div className="mt-4 space-y-2">
            {loading ? <p className="px-3 py-4 text-sm text-slate-500">Loading BOM records...</p> : null}
            {!loading && records.length === 0 ? <p className="px-3 py-4 text-sm text-slate-500">No BOM records yet.</p> : null}
            {records.map((record) => {
              const selected = selectedBom?.id === record.id
              return (
                <button
                  key={record.id}
                  type="button"
                  onClick={() => setSelectedId(record.id)}
                  className={`w-full border p-4 text-left transition ${selected ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white hover:border-slate-400"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${selected ? "text-slate-300" : "text-slate-500"}`}>{record.code}</p>
                      <p className="mt-1 text-sm font-semibold">{record.title}</p>
                    </div>
                    <span className={`border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${selected ? "border-white/20 bg-white/10 text-white" : statusTone(record.status)}`}>
                      {formatStatusLabel(record.status)}
                    </span>
                  </div>
                  <p className={`mt-3 text-xs ${selected ? "text-slate-300" : "text-slate-500"}`}>{record.productFamilyName} · {record.lines?.length || 0} lines · {record.revisionCode}</p>
                </button>
              )
            })}
          </div>
        </aside>

        <div className="space-y-4">
          {selectedBom ? (
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{selectedBom.code}</p>
                    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${statusTone(selectedBom.status)}`}>{formatStatusLabel(selectedBom.status)}</span>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">{selectedBom.revisionCode}</span>
                  </div>
                  <h3 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">{selectedBom.title}</h3>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{selectedBom.description || "No BOM description captured yet."}</p>
                </div>
                <div className="border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  <p className="font-semibold text-slate-900">{selectedBom.owner || "Unassigned"}</p>
                  <p className="mt-1">Owner · {selectedBom.productFamilyName}</p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {selectedBom.status !== "approved" ? <ActionButton label="Approve BOM" onClick={() => changeStatus("approved")} disabled={saving || !schemaReady} /> : null}
                {selectedBom.status !== "needs_review" ? <ActionButton label="Needs review" onClick={() => changeStatus("needs_review")} secondary disabled={saving || !schemaReady} /> : null}
                {selectedBom.status !== "draft" ? <ActionButton label="Move to draft" onClick={() => changeStatus("draft")} quiet disabled={saving || !schemaReady} /> : null}
              </div>

              <div className="mt-6 border-y border-slate-200 py-4">
                <div className="grid grid-cols-3 divide-x divide-slate-200">
                  <BomStat label="Assemblies" value={selectedBomOverview.categoryCount} />
                  <BomStat label="Registered IDs" value={selectedBomOverview.registeredCount} />
                  <BomStat label="Review items" value={selectedBomOverview.reviewCount} alert={selectedBomOverview.reviewCount > 0} />
                </div>
              </div>

              <div className="mt-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Working BOM</p>
                  <h4 className="mt-1 text-lg font-bold text-slate-900">Components and quantities</h4>
                </div>
                <p className="hidden text-xs text-slate-500 sm:block">Select a row on mobile for the full specification.</p>
              </div>

              <div className="mt-4 hidden overflow-hidden border border-slate-300 md:block">
                <table className="w-full table-fixed text-left text-sm">
                  <thead className="bg-slate-950 text-[10px] uppercase tracking-[0.14em] text-white">
                    <tr>
                      <th className="w-[7%] px-3 py-3 font-semibold">Level</th>
                      <th className="w-[14%] px-3 py-3 font-semibold">Part #</th>
                      <th className="w-[26%] px-3 py-3 font-semibold">Component</th>
                      <th className="w-[25%] px-3 py-3 font-semibold">Specification</th>
                      <th className="w-[9%] px-3 py-3 text-right font-semibold">Qty</th>
                      <th className="w-[8%] px-3 py-3 font-semibold">Unit</th>
                      <th className="w-[11%] px-3 py-3 font-semibold">Scope</th>
                    </tr>
                  </thead>
                  {selectedBomOverview.groups.map((group) => (
                    <tbody key={group.category} className="border-t border-slate-300">
                      <tr className="bg-slate-100">
                        <td className="px-3 py-2 font-mono text-xs font-bold text-slate-600">{group.level}</td>
                        <td colSpan={6} className="px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-700">
                          {group.category}
                        </td>
                      </tr>
                      {group.lines.map((line) => (
                        <tr key={line.id} className="border-t border-slate-200 align-top transition hover:bg-sky-50/50">
                          <td className="px-3 py-3 font-mono text-[11px] text-slate-400">{group.level}.{String(line.lineNumber).padStart(2, "0")}</td>
                          <td className="break-words px-3 py-3 font-mono text-xs font-semibold text-slate-700">
                            {line.componentCode || line.sourceCode || "Not assigned"}
                          </td>
                          <td className="px-3 py-3">
                            <p className="font-semibold leading-5 text-slate-900">{line.description}</p>
                            {line.componentName && line.componentName !== line.description ? (
                              <p className="mt-1 text-xs text-slate-500">{line.componentName}</p>
                            ) : null}
                            <button
                              type="button"
                              onClick={() => deleteLine(line.id)}
                              disabled={saving || !schemaReady}
                              className="mt-2 text-[11px] font-semibold text-rose-600 transition hover:text-rose-800 disabled:opacity-40"
                            >
                              Remove line
                            </button>
                          </td>
                          <td className="px-3 py-3 text-xs leading-5 text-slate-600">
                            {line.quantityRule || line.notes || "Specification not yet recorded"}
                            {line.wasteFactor > 0 ? (
                              <span className="mt-1 block font-semibold text-amber-700">
                                Includes {Math.round(line.wasteFactor * 100)}% allowance
                              </span>
                            ) : null}
                          </td>
                          <td className="px-3 py-3 text-right font-bold tabular-nums text-slate-900">{formatQuantity(line.quantity)}</td>
                          <td className="px-3 py-3 text-slate-600">{line.unit}</td>
                          <td className="px-3 py-3">
                            <span className={`inline-flex border px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] ${scopeTone(line.scope)}`}>
                              {formatStatusLabel(line.scope)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  ))}
                  <tfoot className="border-t-2 border-slate-900 bg-slate-50">
                    <tr>
                      <td colSpan={4} className="px-3 py-3 text-right text-xs font-bold uppercase tracking-[0.12em] text-slate-600">Total component lines</td>
                      <td className="px-3 py-3 text-right font-bold tabular-nums text-slate-950">{selectedBom.lines?.length || 0}</td>
                      <td colSpan={2} className="px-3 py-3" />
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="mt-4 space-y-3 md:hidden">
                {selectedBomOverview.groups.map((group) => (
                  <section key={group.category} className="overflow-hidden border border-slate-200 bg-white">
                    <div className="flex items-center gap-3 bg-slate-950 px-3 py-2.5 text-white">
                      <span className="font-mono text-xs text-slate-400">{group.level}</span>
                      <p className="text-xs font-bold uppercase tracking-[0.12em]">{group.category}</p>
                    </div>
                    <div className="divide-y divide-slate-200">
                      {group.lines.map((line) => (
                        <details key={line.id} className="group">
                          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-900">{line.description}</p>
                              <p className="mt-1 font-mono text-[11px] text-slate-500">{line.componentCode || line.sourceCode || "ID not assigned"}</p>
                            </div>
                            <div className="shrink-0 text-right">
                              <p className="font-bold tabular-nums text-slate-950">{formatQuantity(line.quantity)}</p>
                              <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">{line.unit}</p>
                            </div>
                          </summary>
                          <div className="border-t border-slate-100 bg-slate-50 px-3 py-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Specification</p>
                            <p className="mt-1 text-sm leading-6 text-slate-700">{line.quantityRule || line.notes || "Specification not yet recorded."}</p>
                            <div className="mt-3 flex items-center justify-between gap-3">
                              <span className={`inline-flex border px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] ${scopeTone(line.scope)}`}>{formatStatusLabel(line.scope)}</span>
                              <button type="button" onClick={() => deleteLine(line.id)} disabled={saving || !schemaReady} className="text-xs font-semibold text-rose-600 disabled:opacity-40">Remove line</button>
                            </div>
                          </div>
                        </details>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </section>
          ) : null}

          <section className="grid gap-4 lg:grid-cols-2">
            <form onSubmit={createBom} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">New template</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-900">Create a reusable Atlas BOM</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">Start with the product family and stable reference code. Add material lines once the header exists.</p>
              <div className="mt-5 space-y-3">
                <Field label="BOM name"><input required value={bomForm.title} onChange={(event) => setBomForm((current) => ({ ...current, title: event.target.value }))} className="os-input" placeholder="Atlas product template" /></Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Reference code"><input required value={bomForm.code} onChange={(event) => setBomForm((current) => ({ ...current, code: event.target.value }))} className="os-input uppercase" placeholder="ATL-WH-..." /></Field>
                  <Field label="Revision"><input value={bomForm.revisionCode} onChange={(event) => setBomForm((current) => ({ ...current, revisionCode: event.target.value }))} className="os-input uppercase" placeholder="R0" /></Field>
                </div>
                <Field label="Product family"><select value={bomForm.productFamilyId} onChange={(event) => setBomForm((current) => ({ ...current, productFamilyId: event.target.value }))} className="os-input"><option value="">Choose a family</option>{families.map((family) => <option key={family.id} value={family.id}>{family.name}</option>)}</select></Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Owner"><input value={bomForm.owner} onChange={(event) => setBomForm((current) => ({ ...current, owner: event.target.value }))} className="os-input" placeholder="Owner" /></Field>
                  <Field label="Status"><select value={bomForm.status} onChange={(event) => setBomForm((current) => ({ ...current, status: event.target.value }))} className="os-input">{BOM_STATUS_OPTIONS.map((status) => <option key={status} value={status}>{formatStatusLabel(status)}</option>)}</select></Field>
                </div>
                <Field label="What does this template cover?"><textarea value={bomForm.description} onChange={(event) => setBomForm((current) => ({ ...current, description: event.target.value }))} className="os-input min-h-[92px]" placeholder="Explain the baseline scope and review boundaries." /></Field>
                <button type="submit" disabled={saving || !schemaReady} className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Saving..." : "Create BOM template"}</button>
              </div>
            </form>

            <form onSubmit={addLine} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Material line</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-900">Add to the selected BOM</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">Use a registered component where possible. Keep exceptions separate so reusable product logic stays clean.</p>
              <div className="mt-5 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Line number"><input required min="1" type="number" value={lineForm.lineNumber} onChange={(event) => setLineForm((current) => ({ ...current, lineNumber: event.target.value }))} className="os-input" placeholder="10" /></Field>
                  <Field label="Scope"><select value={lineForm.scope} onChange={(event) => setLineForm((current) => ({ ...current, scope: event.target.value }))} className="os-input">{BOM_LINE_SCOPE_OPTIONS.map((scope) => <option key={scope} value={scope}>{formatStatusLabel(scope)}</option>)}</select></Field>
                </div>
                <Field label="Use registered component"><select value={lineForm.componentId} onChange={(event) => selectComponent(event.target.value)} className="os-input"><option value="">Custom material or scope item</option>{components.map((component) => <option key={component.id} value={component.id}>{component.title}</option>)}</select></Field>
                <Field label="Material or scope item"><input required value={lineForm.description} onChange={(event) => setLineForm((current) => ({ ...current, description: event.target.value }))} className="os-input" placeholder="Describe the material or review item" /></Field>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Field label="Quantity"><input required min="0" step="0.001" type="number" value={lineForm.quantity} onChange={(event) => setLineForm((current) => ({ ...current, quantity: event.target.value }))} className="os-input" /></Field>
                  <Field label="Unit"><select value={lineForm.unit} onChange={(event) => setLineForm((current) => ({ ...current, unit: event.target.value }))} className="os-input">{BOM_UNIT_OPTIONS.map((unit) => <option key={unit} value={unit}>{unit}</option>)}</select></Field>
                  <Field label="Waste %"><input required min="0" max="100" step="0.1" type="number" value={lineForm.wasteFactor} onChange={(event) => setLineForm((current) => ({ ...current, wasteFactor: event.target.value }))} className="os-input" /></Field>
                </div>
                <Field label="Category"><input value={lineForm.category} onChange={(event) => setLineForm((current) => ({ ...current, category: event.target.value }))} className="os-input" placeholder="Primary framing" /></Field>
                <Field label="Notes"><textarea value={lineForm.notes} onChange={(event) => setLineForm((current) => ({ ...current, notes: event.target.value }))} className="os-input min-h-[72px]" placeholder="State what needs verification or what this line excludes." /></Field>
                <button type="submit" disabled={saving || !schemaReady || !selectedBom} className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Saving..." : "Add material line"}</button>
              </div>
            </form>
          </section>
        </div>
      </section>
    </div>
  )
}

function Metric({ label, value, tone }) {
  const tones = {
    slate: "border-slate-200 bg-slate-50 text-slate-500",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    sky: "border-sky-200 bg-sky-50 text-sky-700",
  }
  return <div className={`rounded-2xl border px-4 py-3 ${tones[tone]}`}><p className="text-xs font-semibold uppercase tracking-[0.14em]">{label}</p><p className="mt-1 text-2xl font-bold text-slate-900">{value}</p></div>
}

function BomStat({ label, value, alert = false }) {
  return (
    <div className="px-3 text-center sm:px-5 sm:text-left">
      <p className={`text-2xl font-bold tabular-nums ${alert ? "text-amber-700" : "text-slate-950"}`}>{value}</p>
      <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 sm:text-xs">{label}</p>
    </div>
  )
}

function Field({ label, children }) {
  return <label className="block text-sm font-medium text-slate-700"><span className="mb-1 block">{label}</span>{children}</label>
}

function ActionButton({ label, onClick, secondary, quiet, disabled }) {
  const classes = secondary
    ? "border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
    : quiet
      ? "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
      : "bg-slate-900 text-white hover:bg-slate-700"
  return <button type="button" onClick={onClick} disabled={disabled} className={`rounded-full px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${classes}`}>{label}</button>
}
