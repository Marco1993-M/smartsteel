"use client"

import { Check, Copy, PackageSearch } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { getOsAuthHeaders } from "../../lib/osClientAuth"

const SCOPE_LABELS = { structure_only: "Structure only", roof_only: "Roof sheeted", fully_enclosed: "Fully enclosed" }

export default function AtlasSkuRegistry({ familyCode = "W08" }) {
  const [records, setRecords] = useState([])
  const [schemaReady, setSchemaReady] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filters, setFilters] = useState({ length: "20", scope: "all", steel: "all" })
  const [copied, setCopied] = useState("")

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const response = await fetch(`/api/os/atlas-skus?family=${familyCode}`, { cache: "no-store", headers: await getOsAuthHeaders() })
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.error || "Could not load the Atlas SKU registry.")
        if (active) {
          setRecords(payload.records || [])
          setSchemaReady(payload.schemaReady !== false)
        }
      } catch (loadError) {
        if (active) setError(loadError.message)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [familyCode])

  const filtered = useMemo(() => records.filter((record) => {
    const config = record.configuration || {}
    return String(config.length) === filters.length
      && (filters.scope === "all" || config.gableMode === filters.scope)
      && (filters.steel === "all" || config.steelFinish === filters.steel)
  }), [filters, records])

  async function copySku(sku) {
    await navigator.clipboard.writeText(sku)
    setCopied(sku)
    window.setTimeout(() => setCopied(""), 1500)
  }

  return (
    <section className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.06)]">
      <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-7">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0043f3]">Canonical product identities</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">{familyCode} SKU registry</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">One code identifies one physical configuration. Pricing remains linked to the controlled release and can change without changing the SKU.</p>
        </div>
        <div className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${schemaReady ? "bg-emerald-500" : "bg-amber-400"}`} /><span className="text-xs font-bold text-slate-600">{schemaReady ? "Live registry" : "Deterministic preview"}</span></div>
      </div>
      <div className="grid gap-3 border-b border-slate-200 bg-slate-50 p-4 sm:grid-cols-3 sm:p-5">
        <Filter label="Length" value={filters.length} onChange={(value) => setFilters((current) => ({ ...current, length: value }))} options={[["4", "4m"], ["8", "8m"], ["12", "12m"], ["16", "16m"], ["20", "20m"]]} />
        <Filter label="Supply scope" value={filters.scope} onChange={(value) => setFilters((current) => ({ ...current, scope: value }))} options={[["all", "All scopes"], ["structure_only", "Structure only"], ["roof_only", "Roof sheeted"], ["fully_enclosed", "Fully enclosed"]]} />
        <Filter label="Steel finish" value={filters.steel} onChange={(value) => setFilters((current) => ({ ...current, steel: value }))} options={[["all", "All finishes"], ["Mild", "Mild steel"], ["ZAM", "ZAM"], ["Galv", "Galvanised"]]} />
      </div>
      {error ? <p className="m-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p> : null}
      <div className="overflow-x-auto">
        <table className="min-w-[860px] w-full text-left">
          <thead><tr className="border-b border-slate-200 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400"><th className="px-5 py-3">SKU</th><th className="px-5 py-3">Product</th><th className="px-5 py-3">Scope</th><th className="px-5 py-3">Finish</th><th className="px-5 py-3">Sheeting</th><th className="px-5 py-3 text-right">Action</th></tr></thead>
          <tbody className="divide-y divide-slate-100">{loading ? <tr><td colSpan="6" className="px-5 py-10 text-center text-sm text-slate-500">Loading controlled SKUs...</td></tr> : filtered.map((record) => { const config = record.configuration || {}; return <tr key={record.sku} className="text-sm"><td className="px-5 py-4 font-mono text-xs font-black text-[#0043f3]">{record.sku}</td><td className="px-5 py-4 font-bold text-slate-900">{record.productName}</td><td className="px-5 py-4 text-slate-600">{SCOPE_LABELS[config.gableMode]}</td><td className="px-5 py-4 text-slate-600">{config.steelFinish}</td><td className="px-5 py-4 text-slate-600">{config.sheetingProfile ? `${config.sheetingProfile} · ${config.sheetingFinish}` : "—"}</td><td className="px-5 py-4 text-right"><button type="button" onClick={() => copySku(record.sku)} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-700 hover:border-blue-300">{copied === record.sku ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}{copied === record.sku ? "Copied" : "Copy"}</button></td></tr> })}</tbody>
        </table>
      </div>
      {!loading && !filtered.length ? <div className="grid place-items-center gap-2 p-10 text-center"><PackageSearch className="h-7 w-7 text-slate-300" /><p className="text-sm text-slate-500">No SKU matches this selection.</p></div> : null}
      <div className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500">Showing {filtered.length} of {records.length} controlled {familyCode} configurations.</div>
    </section>
  )
}

function Filter({ label, value, onChange, options }) {
  return <label className="text-xs font-bold text-slate-600">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:border-[#0043f3]">{options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}</select></label>
}
