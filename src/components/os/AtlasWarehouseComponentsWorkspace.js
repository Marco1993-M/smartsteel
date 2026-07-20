"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, ArrowUpRight, Check, Layers3, PackagePlus, Settings2, ShieldAlert } from "lucide-react"
import { getOsAuthHeaders } from "../../lib/osClientAuth"

const W08_COMPONENTS = [
  {
    code: "W08-COL",
    category: "Primary framing",
    title: "W08 column set",
    section: "100 x 50 x 20 x 2 CFLC",
    summary: "Standard 3m-eave column set for each W08 portal position.",
    rule: "One column set per portal",
    scope: "Standard",
    tags: ["W08", "Columns", "Primary steel", "3m eave"],
  },
  {
    code: "W08-RAF",
    category: "Primary framing",
    title: "W08 dual-pitch rafter set",
    section: "175 x 75 x 20 x 2.5 CFLC",
    summary: "Matched dual-pitch rafter set for the standard 8m span.",
    rule: "One rafter set per portal",
    scope: "Standard",
    tags: ["W08", "Rafters", "Primary steel", "Dual pitch"],
  },
  {
    code: "W08-XBR",
    category: "Bracing",
    title: "W08 X-bracing set",
    section: "100 x 50 x 20 x 2 CFLC",
    summary: "Longitudinal X-bracing set used at controlled intervals along the modular building length.",
    rule: "Calculated from total bay count",
    scope: "Standard",
    tags: ["W08", "X-bracing", "Stability", "Bay rule"],
  },
  {
    code: "W08-SEC",
    category: "Secondary steel",
    title: "W08 purlin and wall-hat pack",
    section: "Atlas secondary profile",
    summary: "Roof purlins and applicable long-wall hats calculated from length and sheeting scope.",
    rule: "Linear metres from bay length and scope",
    scope: "Standard",
    tags: ["W08", "Purlins", "Wall hats", "Secondary steel"],
  },
  {
    code: "W08-CON",
    category: "Connections and fittings",
    title: "W08 bolted connection set",
    section: "Controlled Atlas connection set",
    summary: "Bolted frame connections and required structural fixings for the standard W08 assembly.",
    rule: "Matched to portal and brace count",
    scope: "Standard, specification review",
    tags: ["W08", "Bolted", "Connections", "Fixings"],
  },
  {
    code: "W08-RCL",
    category: "Cladding",
    title: "W08 roof sheeting pack",
    section: "IBR or approved project selection",
    summary: "Roof sheeting allowance calculated from dual-pitch roof geometry and building length.",
    rule: "Square metres from roof coverage",
    scope: "Optional",
    tags: ["W08", "Roof sheeting", "Cladding", "Optional"],
  },
  {
    code: "W08-WCL",
    category: "Cladding",
    title: "W08 long-wall sheeting pack",
    section: "IBR or approved project selection",
    summary: "Sheeting for both long side walls. Standard W08 gable ends remain open.",
    rule: "Square metres from length and eave height",
    scope: "Optional",
    tags: ["W08", "Wall sheeting", "Open gables", "Optional"],
  },
]

const CONNECTION_ITEM_TEMPLATES = [
  { itemCode: "W08-CON-BR01", itemType: "bracket", description: "Portal connection bracket set", unit: "set", quantityRule: "Quantity per portal from approved connection schedule", notes: "Define bracket geometry, material thickness, hole pattern, and finish." },
  { itemCode: "W08-CON-BR02", itemType: "bracket", description: "Bracing connection bracket set", unit: "set", quantityRule: "Quantity from calculated X-bracing set count", notes: "Define each bracket position and whether the set differs by end condition." },
  { itemCode: "W08-CON-BT01", itemType: "bolt", description: "Structural connection bolt", unit: "each", quantityRule: "Quantity from approved bracket and connection schedule", notes: "Confirm diameter, length, grade, thread, and corrosion-protection finish." },
  { itemCode: "W08-CON-NT01", itemType: "nut", description: "Structural connection nut", unit: "each", quantityRule: "Matched to approved structural bolt quantity", notes: "Confirm nut type, thread, grade, and finish." },
  { itemCode: "W08-CON-WS01", itemType: "washer", description: "Structural connection washer", unit: "each", quantityRule: "Matched to approved bolt and bracket schedule", notes: "Confirm washer type, diameter, thickness, material, and finish." },
]

function toneForScope(scope) {
  return scope === "Optional" ? "bg-sky-100 text-sky-700" : scope.includes("review") ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-700"
}

export default function AtlasWarehouseComponentsWorkspace() {
  const [records, setRecords] = useState([])
  const [familyId, setFamilyId] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [connectionItems, setConnectionItems] = useState([])
  const [connectionSchemaReady, setConnectionSchemaReady] = useState(true)
  const [savingItemId, setSavingItemId] = useState("")

  async function loadRecords() {
    setLoading(true)
    setError("")
    try {
      const headers = await getOsAuthHeaders()
      const [itemsResponse, familiesResponse] = await Promise.all([
        fetch("/api/os/catalog-items?platform=atlas&kind=component", { cache: "no-store", headers }),
        fetch("/api/os/product-families?platform=atlas", { cache: "no-store", headers }),
      ])
      const [itemsPayload, familiesPayload] = await Promise.all([itemsResponse.json(), familiesResponse.json()])
      if (!itemsResponse.ok) throw new Error(itemsPayload.error || "Could not load Atlas components.")
      if (!familiesResponse.ok) throw new Error(familiesPayload.error || "Could not load Atlas product families.")
      setRecords(itemsPayload.records || [])
      setFamilyId((familiesPayload.records || []).find((family) => family.key === "warehouses")?.id || "")
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadRecords() }, [])

  const recordMap = useMemo(() => new Map(records.map((record) => [record.title, record])), [records])
  const registeredCount = W08_COMPONENTS.filter((component) => recordMap.has(component.title)).length
  const missingComponents = W08_COMPONENTS.filter((component) => !recordMap.has(component.title))
  const connectionComponent = recordMap.get("W08 bolted connection set")

  useEffect(() => {
    if (!connectionComponent?.id) {
      setConnectionItems([])
      return
    }
    let active = true
    async function loadConnectionItems() {
      try {
        const response = await fetch(`/api/os/component-items?componentId=${connectionComponent.id}`, { cache: "no-store", headers: await getOsAuthHeaders() })
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.error || "Could not load the connection pack schedule.")
        if (active) {
          setConnectionItems(payload.records || [])
          setConnectionSchemaReady(payload.schemaReady !== false)
        }
      } catch (loadError) {
        if (active) setError(loadError.message)
      }
    }
    loadConnectionItems()
    return () => { active = false }
  }, [connectionComponent?.id])

  async function registerMissingComponents() {
    if (!familyId || missingComponents.length === 0) return
    setSaving(true)
    setError("")
    setMessage("")
    try {
      const created = []
      for (const component of missingComponents) {
        const response = await fetch("/api/os/catalog-items", {
          method: "POST",
          headers: await getOsAuthHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify({
            platformKey: "atlas",
            kind: "component",
            productFamilyId: familyId,
            category: component.category,
            componentCode: component.code,
            title: component.title,
            summary: component.summary,
            owner: "Marco",
            status: component.scope.includes("review") ? "needs_review" : "active",
            tags: [component.code, ...component.tags],
          }),
        })
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.error || `Could not register ${component.title}.`)
        created.push(payload.record)
      }
      setRecords((current) => [...current, ...created])
      setMessage(`${created.length} W08 component${created.length === 1 ? "" : "s"} registered successfully.`)
    } catch (saveError) {
      setError(saveError.message)
      await loadRecords()
    } finally {
      setSaving(false)
    }
  }

  async function createConnectionSchedule() {
    if (!connectionComponent?.id || !connectionSchemaReady) return
    setSaving(true)
    setError("")
    try {
      const created = []
      for (const template of CONNECTION_ITEM_TEMPLATES) {
        const response = await fetch("/api/os/component-items", {
          method: "POST",
          headers: await getOsAuthHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify({ componentId: connectionComponent.id, ...template }),
        })
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.error || `Could not create ${template.description}.`)
        created.push(payload.record)
      }
      setConnectionItems(created)
      setMessage("W08 connection-pack schedule created for technical completion.")
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setSaving(false)
    }
  }

  function updateConnectionItemLocal(id, field, value) {
    setConnectionItems((current) => current.map((item) => item.id === id ? { ...item, [field]: value } : item))
  }

  async function saveConnectionItem(item) {
    setSavingItemId(item.id)
    setError("")
    try {
      const response = await fetch("/api/os/component-items", {
        method: "PATCH",
        headers: await getOsAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(item),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Could not update the connection item.")
      setConnectionItems((current) => current.map((record) => record.id === item.id ? payload.record : record))
      setMessage(`${item.itemCode} updated.`)
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setSavingItemId("")
    }
  }

  return (
    <div className="space-y-5 px-3 py-4 sm:space-y-6 sm:px-6 sm:py-6">
      <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_20px_55px_rgba(15,23,42,0.08)]">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_310px]">
          <div className="p-5 sm:p-7">
            <Link href="/os/atlas/products" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-slate-900"><ArrowLeft className="h-3.5 w-3.5" /> Atlas W08 product</Link>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">W08 component definition</p>
            <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">Turn the warehouse into reusable parts.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">This controlled set separates primary framing, stability, secondary steel, connections, and optional sheeting so the BOM and pricing layers remain traceable.</p>
          </div>
          <div className="flex flex-col justify-between border-t border-slate-200 bg-slate-950 p-5 text-white sm:p-7 lg:border-l lg:border-t-0">
            <div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Live record coverage</p><p className="mt-2 text-4xl font-bold">{loading ? "--" : `${registeredCount}/${W08_COMPONENTS.length}`}</p><div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-amber-400 transition-[width]" style={{ width: `${(registeredCount / W08_COMPONENTS.length) * 100}%` }} /></div></div>
            <button type="button" onClick={registerMissingComponents} disabled={saving || loading || !familyId || missingComponents.length === 0} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-slate-500"><PackagePlus className="h-4 w-4" />{saving ? "Registering..." : missingComponents.length ? `Register ${missingComponents.length} missing` : "Component set complete"}</button>
          </div>
        </div>
      </section>

      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
      {message ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}

      <section className="grid gap-4 xl:grid-cols-2">
        {W08_COMPONENTS.map((component, index) => {
          const record = recordMap.get(component.title)
          return (
            <article key={component.code} className={`rounded-[1.4rem] border bg-white p-5 shadow-sm ${record ? "border-slate-200" : "border-dashed border-amber-300"}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3"><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xs font-bold ${record ? "bg-slate-950 text-white" : "bg-amber-100 text-amber-800"}`}>{String(index + 1).padStart(2, "0")}</span><div className="min-w-0"><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">{record?.componentCode || component.code} · {component.category}</p><h2 className="mt-1 text-lg font-bold text-slate-950">{component.title}</h2></div></div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${record ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"}`}>{record ? "Registered" : "Not registered"}</span>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">{component.summary}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Section / basis</p><p className="mt-1 text-sm font-semibold text-slate-800">{component.section}</p></div><div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Quantity rule</p><p className="mt-1 text-sm font-semibold text-slate-800">{component.rule}</p></div></div>
              <div className="mt-4 flex items-center justify-between gap-3"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${toneForScope(component.scope)}`}>{component.scope}</span><p className="text-xs text-slate-500">{record?.owner || "Owner assigned on registration"}</p></div>
            </article>
          )
        })}
      </section>

      <section className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-7">
          <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">W08-CON assembly</p><h2 className="mt-1 text-2xl font-bold text-slate-950">Bolted connection-pack schedule</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Define every bracket and fixing explicitly. Quantities, sizes, grades, and finishes remain visible review fields until engineering approves them.</p></div>
          {connectionItems.length === 0 ? <button type="button" onClick={createConnectionSchedule} disabled={!connectionComponent || !connectionSchemaReady || saving} className="shrink-0 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500">{!connectionSchemaReady ? "Run component ID SQL" : !connectionComponent ? "Register W08-CON first" : saving ? "Creating..." : "Create connection schedule"}</button> : <span className="shrink-0 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-800">{connectionItems.filter((item) => item.status !== "approved").length} items need review</span>}
        </div>
        {connectionItems.length > 0 ? <div className="divide-y divide-slate-200">{connectionItems.map((item) => <article key={item.id} className="p-5 sm:p-7"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-700">{item.itemCode} · {item.itemType}</p><h3 className="mt-1 text-lg font-bold text-slate-950">{item.description}</h3><p className="mt-1 text-xs text-slate-500">{item.quantityRule}</p></div><select value={item.status} onChange={(event) => updateConnectionItemLocal(item.id, "status", event.target.value)} className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-semibold text-slate-700"><option value="draft">Draft</option><option value="needs_review">Needs review</option><option value="approved">Approved</option></select></div><div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5"><label className="text-xs font-semibold text-slate-600">Quantity<input type="number" min="0" value={item.quantity} onChange={(event) => updateConnectionItemLocal(item.id, "quantity", event.target.value)} placeholder="TBC" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-900" /></label><label className="text-xs font-semibold text-slate-600">Unit<select value={item.unit} onChange={(event) => updateConnectionItemLocal(item.id, "unit", event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-900"><option value="each">Each</option><option value="set">Set</option><option value="pack">Pack</option></select></label><label className="text-xs font-semibold text-slate-600">Size / type<input value={item.sizeSpec} onChange={(event) => updateConnectionItemLocal(item.id, "sizeSpec", event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-900" /></label><label className="text-xs font-semibold text-slate-600">Grade<input value={item.gradeSpec} onChange={(event) => updateConnectionItemLocal(item.id, "gradeSpec", event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-900" /></label><label className="text-xs font-semibold text-slate-600">Finish<input value={item.finishSpec} onChange={(event) => updateConnectionItemLocal(item.id, "finishSpec", event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-900" /></label></div><div className="mt-4 flex justify-end"><button type="button" onClick={() => saveConnectionItem(item)} disabled={savingItemId === item.id} className="rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white disabled:opacity-50">{savingItemId === item.id ? "Saving..." : `Save ${item.itemCode}`}</button></div></article>)}</div> : <div className="p-5 text-sm text-slate-500 sm:p-7">Create the schedule once the coded W08-CON component is available.</div>}
      </section>

      <section className="grid overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm lg:grid-cols-[minmax(0,1fr)_330px]">
        <div className="p-5 sm:p-7"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-sky-100 text-sky-700"><Layers3 className="h-5 w-5" /></span><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Next handoff</p><h2 className="text-xl font-bold text-slate-950">Build the W08 BOM from controlled records</h2></div></div><p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">Once component coverage is complete, the next pass should replace broad BOM lines with these reusable records and retain optional sheeting as a clearly selectable scope.</p><Link href="/os/atlas/bom" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-sky-700 transition hover:text-sky-900">Open Atlas BOM <ArrowUpRight className="h-4 w-4" /></Link></div>
        <aside className="border-t border-slate-200 bg-amber-50 p-5 sm:p-7 lg:border-l lg:border-t-0"><span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-400 text-slate-950"><ShieldAlert className="h-5 w-5" /></span><p className="mt-4 text-sm font-bold text-slate-950">Specification hold point</p><p className="mt-2 text-sm leading-6 text-slate-700">The bolted connection set remains marked for review until the standard connection schedule is formally approved. It should not be hidden inside a generic frame allowance.</p></aside>
      </section>
    </div>
  )
}
