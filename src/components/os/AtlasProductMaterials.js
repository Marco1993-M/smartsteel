"use client"

import { useEffect, useMemo, useState } from "react"
import { FileText, Layers3, Link2, Printer, ShieldAlert } from "lucide-react"
import { getOsAuthHeaders } from "../../lib/osClientAuth"
import { createAtlasWarehouseControl } from "../../lib/atlasWarehouseControl"

const SCOPE_OPTIONS = [["structure_only", "Structure only"], ["roof_only", "Roof sheeted"], ["fully_enclosed", "Roof and side walls sheeted"], ["fully_enclosed_with_gables", "Fully enclosed"]]
const tone = (ready) => ready ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"

function ProductSpecification({ control, scopeLabel }) {
  const { estimate, geometry, productCode } = control
  return <section className="rounded-xl border border-slate-300 bg-white p-6 shadow-sm print:border-0 print:p-0 print:shadow-none">
    <div className="flex flex-wrap items-start justify-between gap-5 border-b border-slate-300 pb-5"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">Atlas controlled product specification</p><h2 className="mt-2 text-3xl font-bold">Atlas {productCode} Warehouse</h2><p className="mt-2 text-sm text-slate-600">{geometry.spanM}m × {geometry.lengthM}m × {geometry.eaveHeightM}m · {scopeLabel}</p></div><div className="text-right"><p className="font-mono text-lg font-bold">{productCode} · WORKING SPEC</p><p className="mt-1 text-xs text-amber-700">Technical approval required before manufacturing</p></div></div>
    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[["Portal frames", geometry.portalFrames], ["4m bays", geometry.bays], ["Roof pitch", `${geometry.roofPitchDegrees}°`], ["Structural steel", `${estimate.materials.totalSteelKg.toLocaleString()} kg`]].map(([label, value]) => <div key={label} className="rounded-lg bg-slate-50 p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p><p className="mt-2 text-lg font-bold">{value}</p></div>)}</div>
    <div className="mt-6 overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-slate-100"><tr>{["Code", "Controlled assembly", "Selected specification", "Quantity basis"].map((heading) => <th key={heading} className="p-3">{heading}</th>)}</tr></thead><tbody>{control.components.map((component) => <tr key={component.code} className="border-t border-slate-200"><td className="p-3 font-mono font-bold">{component.code}</td><td className="p-3 font-semibold">{component.name}{component.optional ? " · optional" : ""}</td><td className="p-3">{component.specification}</td><td className="p-3 text-slate-600">{component.rule}</td></tr>)}</tbody></table></div>
    <p className="mt-5 rounded-lg bg-amber-50 p-4 text-xs leading-5 text-amber-950">Connection quantities, bracket geometry, anchors, foundations, openings, site loading and installation requirements remain controlled hold points until technically approved for the project.</p>
  </section>
}

function ComponentReview({ item, onSaved }) {
  const record = item.record
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [approver, setApprover] = useState("")
  const [form, setForm] = useState({
    profileSpec: record?.specification?.profileSpec || "",
    thicknessSpec: record?.specification?.thicknessSpec || "",
    gradeSpec: record?.specification?.gradeSpec || "",
    coatingSpec: record?.specification?.coatingSpec || "",
    quantityRule: record?.specification?.quantityRule || "",
  })
  const specificationReady = Object.values(form).every((value) => {
    const normalized = String(value || "").trim().toLowerCase()
    return normalized && !["confirm", "verify", "pending", "tbc"].some((word) => normalized.includes(word))
  })
  async function persist(approve = false) {
    if (!record?.id) return
    setSaving(true)
    try {
      const response = await fetch("/api/os/catalog-items", {
        method: "PATCH",
        headers: await getOsAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ id: record.id, specification: form, technicalApproval: approve, technicalApprovedBy: approver, changeNote: `${item.code} controlled specification review` }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Could not save the component record.")
      onSaved(payload.record)
      setOpen(false)
    } catch (error) { window.alert(error.message) }
    finally { setSaving(false) }
  }
  return <div className="border-b border-slate-100 py-3 last:border-b-0">
    <div className="flex items-center justify-between gap-3"><div><p className="font-mono text-xs font-bold text-blue-700">{item.code}</p><p className="mt-1 text-sm font-semibold">{item.name}</p></div><div className="flex items-center gap-2"><span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${tone(Boolean(record?.technicalApprovedAt))}`}>{record ? record.technicalApprovedAt ? "Approved" : record.status : "Missing"}</span>{record ? <button type="button" onClick={() => setOpen((value) => !value)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold">{open ? "Close" : "Review"}</button> : null}</div></div>
    {open ? <div className="mt-4 rounded-lg bg-slate-50 p-4"><div className="grid gap-3 sm:grid-cols-2">{[["Profile", "profileSpec"], ["Thickness", "thicknessSpec"], ["Grade", "gradeSpec"], ["Coating", "coatingSpec"], ["Quantity rule", "quantityRule"]].map(([label, field]) => <label key={field} className="text-xs font-bold text-slate-600">{label}<textarea rows="2" value={form[field]} onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-sm font-normal text-slate-900" /></label>)}</div><label className="mt-3 block text-xs font-bold text-slate-600">Technical approver<input value={approver} onChange={(event) => setApprover(event.target.value)} placeholder="Required only for approval" className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-sm font-normal" /></label><div className="mt-3 flex gap-2"><button type="button" disabled={saving} onClick={() => persist(false)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold">Save draft</button><button type="button" disabled={saving || !approver.trim() || !specificationReady} onClick={() => persist(true)} className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white disabled:opacity-40">Approve specification</button></div>{!specificationReady ? <p className="mt-2 text-xs text-amber-800">Replace all confirm, verify, pending and TBC values before approval.</p> : null}</div> : null}
  </div>
}

function ConnectionReview({ item, onSaved }) {
  const [form, setForm] = useState(item)
  const [saving, setSaving] = useState(false)
  async function save() {
    setSaving(true)
    try {
      const response = await fetch("/api/os/component-items", { method: "PATCH", headers: await getOsAuthHeaders({ "Content-Type": "application/json" }), body: JSON.stringify(form) })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Could not save the connection item.")
      setForm(payload.record); onSaved(payload.record)
    } catch (error) { window.alert(error.message) }
    finally { setSaving(false) }
  }
  return <div className="border-b border-slate-100 py-4 last:border-b-0"><div className="flex items-center justify-between"><p className="font-mono text-xs font-bold">{item.itemCode}</p><span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${tone(form.status === "approved")}`}>{form.status.replaceAll("_", " ")}</span></div><p className="mt-1 text-sm font-semibold">{item.description}</p><div className="mt-3 grid gap-2 sm:grid-cols-2">{[["Quantity", "quantity", "number"], ["Size / type", "sizeSpec", "text"], ["Grade", "gradeSpec", "text"], ["Finish", "finishSpec", "text"]].map(([label, field, type]) => <label key={field} className="text-xs font-bold text-slate-600">{label}<input type={type} min={type === "number" ? 0 : undefined} value={form[field]} onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm font-normal" /></label>)}<label className="text-xs font-bold text-slate-600">Status<select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm font-normal"><option value="needs_review">Needs review</option><option value="approved">Approved</option></select></label></div><button type="button" disabled={saving} onClick={save} className="mt-3 rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">{saving ? "Saving…" : "Save connection item"}</button></div>
}

export default function AtlasProductMaterials({ productCode }) {
  const initial = createAtlasWarehouseControl(productCode)
  const [length, setLength] = useState(20)
  const [height, setHeight] = useState(initial.product.defaultHeight)
  const [scope, setScope] = useState("structure_only")
  const [records, setRecords] = useState({ components: [], boms: [], documents: [], connectionItems: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const control = useMemo(() => createAtlasWarehouseControl(productCode, { length, wallHeight: height, gableMode: scope }), [height, length, productCode, scope])
  const componentMap = useMemo(() => new Map(records.components.map((item) => [item.componentCode, item])), [records.components])
  const productComponents = control.components.map((definition) => ({ ...definition, record: componentMap.get(definition.code) }))
  const bom = records.boms.find((item) => item.code === control.bomCode)
  const document = records.documents.find((item) => item.title === control.documentTitle || item.title?.includes(productCode))
  const completeConnections = records.connectionItems.length > 0 && records.connectionItems.every((item) => item.status === "approved" && Number(item.quantity) > 0 && item.sizeSpec && item.gradeSpec && item.finishSpec)
  const readiness = [
    ["Product definition", true, `${productCode} geometry and standard options available`],
    ["Component register", productComponents.every((item) => item.record), `${productComponents.filter((item) => item.record).length}/${productComponents.length} controlled groups registered`],
    ["Component specifications", productComponents.every((item) => item.record?.technicalApprovedAt), "Every component requires a technical approval record"],
    ["Controlled BOM", bom?.status === "approved", bom ? `${bom.code} · ${bom.revisionCode} · ${bom.status}` : "No controlled BOM registered"],
    ["Connection schedule", completeConnections, records.connectionItems.length ? `${records.connectionItems.filter((item) => item.status === "approved").length}/${records.connectionItems.length} items approved` : "No connection items registered"],
    ["Controlled document", ["reviewed", "issued"].includes(document?.status), document ? `${document.revisionCode || "No revision"} · ${document.status}` : "No product document registered"],
  ]
  const readyCount = readiness.filter(([, ready]) => ready).length
  function updateComponent(updated) {
    setRecords((current) => ({ ...current, components: current.components.map((item) => item.id === updated.id ? updated : item) }))
  }
  function updateConnectionItem(updated) {
    setRecords((current) => ({ ...current, connectionItems: current.connectionItems.map((item) => item.id === updated.id ? updated : item) }))
  }

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true); setError("")
      try {
        const headers = await getOsAuthHeaders()
        const responses = await Promise.all([
          fetch("/api/os/catalog-items?platform=atlas&kind=component", { cache: "no-store", headers }),
          fetch("/api/os/boms?platform=atlas", { cache: "no-store", headers }),
          fetch("/api/os/documents?platform=atlas", { cache: "no-store", headers }),
        ])
        const payloads = await Promise.all(responses.map((response) => response.json()))
        const failure = responses.findIndex((response) => !response.ok)
        if (failure >= 0) throw new Error(payloads[failure].error || "Could not load controlled product records.")
        const components = payloads[0].records || []
        const connection = components.find((item) => item.componentCode === `${productCode}-CON`)
        let connectionItems = []
        if (connection?.id) {
          const response = await fetch(`/api/os/component-items?componentId=${connection.id}`, { cache: "no-store", headers })
          const payload = await response.json()
          if (response.ok) connectionItems = payload.records || []
        }
        if (active) setRecords({ components, boms: payloads[1].records || [], documents: payloads[2].records || [], connectionItems })
      } catch (loadError) { if (active) setError(loadError.message) }
      finally { if (active) setLoading(false) }
    }
    load()
    return () => { active = false }
  }, [productCode])

  const scopeLabel = SCOPE_OPTIONS.find(([value]) => value === scope)?.[1]
  return <div className="space-y-6 p-4 sm:p-6">
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-white print:hidden"><div className="grid gap-6 p-6 lg:grid-cols-[1fr_310px]"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-300">{productCode} product control</p><h2 className="mt-2 text-3xl font-bold">Materials, connections and controlled records</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">The live geometry drives the schedule. Database records preserve specifications, approvals and revision history around it.</p></div><div className="rounded-xl border border-white/10 bg-white/5 p-5"><div className="flex items-end justify-between"><div><p className="text-xs text-slate-400">Product readiness</p><p className="mt-2 text-4xl font-bold">{loading ? "—" : `${Math.round(readyCount / readiness.length * 100)}%`}</p></div><ShieldAlert className="h-8 w-8 text-amber-300" /></div><div className="mt-4 h-2 bg-white/10"><div className="h-full bg-amber-400" style={{ width: `${readyCount / readiness.length * 100}%` }} /></div></div></div></section>
    {error ? <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p> : null}
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 print:hidden">{readiness.map(([label, ready, detail]) => <div key={label} className="rounded-xl border border-slate-200 bg-white p-4"><div className="flex items-center justify-between"><p className="font-bold">{label}</p><span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${tone(ready)}`}>{ready ? "Ready" : "Hold"}</span></div><p className="mt-2 text-xs leading-5 text-slate-500">{loading ? "Checking live records…" : detail}</p></div>)}</section>
    <section className="rounded-xl border border-slate-200 bg-white p-5 print:hidden"><div className="flex flex-wrap items-end justify-between gap-5"><div><h2 className="text-xl font-bold">Selected configuration</h2><p className="mt-1 text-xs text-slate-500">Changes recalculate the schedule and specification below.</p></div><div className="flex flex-wrap gap-3">{[["Length", length, setLength, control.product.lengths], ["Eave height", height, setHeight, control.product.heights]].map(([label, value, setter, options]) => <label key={label} className="text-xs font-bold">{label}<select value={value} onChange={(event) => setter(Number(event.target.value))} className="mt-1 block rounded-lg border border-slate-300 p-2.5 text-sm">{options.map((option) => <option key={option} value={option}>{option}m</option>)}</select></label>)}<label className="text-xs font-bold">Scope<select value={scope} onChange={(event) => setScope(event.target.value)} className="mt-1 block rounded-lg border border-slate-300 p-2.5 text-sm">{SCOPE_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><button type="button" onClick={() => window.print()} className="self-end rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-bold text-white"><Printer className="mr-2 inline h-4 w-4" />Print specification</button></div></div></section>
    <ProductSpecification control={control} scopeLabel={scopeLabel} />
    <section className="grid gap-5 lg:grid-cols-2 print:hidden"><div className="rounded-xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-3"><Layers3 className="h-5 w-5 text-blue-700" /><h2 className="text-lg font-bold">Controlled component register</h2></div><div className="mt-4">{productComponents.map((item) => <ComponentReview key={`${item.code}-${item.record?.updatedAt || "missing"}`} item={item} onSaved={updateComponent} />)}</div></div>
      <div className="rounded-xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-3"><Link2 className="h-5 w-5 text-blue-700" /><h2 className="text-lg font-bold">Connection schedule</h2></div>{records.connectionItems.length ? <div className="mt-4">{records.connectionItems.map((item) => <ConnectionReview key={`${item.id}-${item.status}-${item.quantity}`} item={item} onSaved={updateConnectionItem} />)}</div> : <p className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">Run the warehouse control SQL to register this product’s connection items.</p>}</div></section>
    <section className="grid gap-4 sm:grid-cols-2 print:hidden"><div className="rounded-xl border border-slate-200 bg-white p-5"><Layers3 className="h-5 w-5 text-blue-700" /><p className="mt-3 text-xs font-bold uppercase text-slate-500">BOM revision</p><p className="mt-2 text-lg font-bold">{bom ? `${bom.code} · ${bom.revisionCode}` : "Not registered"}</p><p className="mt-1 text-sm text-slate-500">{bom?.status || "Run the warehouse control SQL"}</p></div><div className="rounded-xl border border-slate-200 bg-white p-5"><FileText className="h-5 w-5 text-blue-700" /><p className="mt-3 text-xs font-bold uppercase text-slate-500">Product document</p><p className="mt-2 text-lg font-bold">{document?.title || control.documentTitle}</p><p className="mt-1 text-sm text-slate-500">{document ? `${document.revisionCode || "No revision"} · ${document.status}` : "Run the warehouse control SQL"}</p></div></section>
  </div>
}
