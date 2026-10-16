"use client"

import { useEffect, useState } from "react"
import { Download, FileText, LockKeyhole, Ruler, Truck } from "lucide-react"
import { getOsAuthHeaders } from "../../lib/osClientAuth"
import { supabase } from "../../lib/supabase"
import DocumentsWorkspace from "./DocumentsWorkspace"
import { ATLAS_DOCUMENT_RULES } from "../../lib/osProductData"
import { getAtlasWarehousePlan } from "../../lib/atlasWarehousePlan"
import { ATLAS_WAREHOUSE_SHEETING_OPTIONS } from "../../lib/estimates/atlasWarehouseOptions"

const LENGTHS = Array.from({ length: 25 }, (_, index) => (index + 1) * 4)
const HEIGHTS = [3, 4, 4.5, 5]
const SHEETING = ATLAS_WAREHOUSE_SHEETING_OPTIONS.map((option) => [option.value, option.label])

export default function AtlasDocumentHub({ productCode }) {
  const [length, setLength] = useState(20)
  const [height, setHeight] = useState(["W10", "W12", "W15"].includes(productCode) ? 4.5 : 3)
  const [material, setMaterial] = useState("ZAM")
  const [sheeting, setSheeting] = useState("structure_only")
  const [profile, setProfile] = useState("IBR")
  const [finish, setFinish] = useState("galvanised")
  const [owner, setOwner] = useState(false)
  const [busy, setBusy] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true
    supabase.auth.getUser().then(({ data }) => { if (active) setOwner(String(data?.user?.email || "").toLowerCase() === "info@smartsteel.co.za") })
    return () => { active = false }
  }, [])

  const common = new URLSearchParams({ product: productCode, length: String(length), height: String(height) })
  const dataSheetParams = new URLSearchParams({ ...Object.fromEntries(common), material, sheeting, profile, finish })
  const layoutPlan = getAtlasWarehousePlan({ width: Number(productCode.slice(1)), length, wallHeight: height, gableMode: sheeting })
  const documents = [
    { id: "transport", title: "Transport & profile data sheet", icon: Truck, audience: "Shareable", detail: "Member profiles, steel mass, sheeting mass when selected, bundle planning and longest member.", endpoint: `/api/os/atlas-pricing/datasheet?${dataSheetParams}` },
    { id: "foundation", title: "Preliminary foundation guide", icon: Ruler, audience: "Shareable planning reference", detail: "Indicative 1,250mm pad concept, main and applicable gable-column footings, setting-out and assumptions. Not for construction.", endpoint: `/api/os/atlas-foundation-guide?${new URLSearchParams({ ...Object.fromEntries(common), sheeting })}` },
    ...(owner ? [{ id: "ctc", title: "Internal costing basis", icon: LockKeyhole, audience: "Internal · owner only", detail: "Structure-only modelled steel and connection costs. The actual W08 supplier quote appears only for the matching 8 × 16 × 3m ZAM configuration.", endpoint: `/api/os/atlas-ctc-sheet?${new URLSearchParams({ ...Object.fromEntries(common), material })}` }] : []),
  ]

  async function download(item) {
    setBusy(item.id)
    setError("")
    try {
      const response = await fetch(item.endpoint, { headers: await getOsAuthHeaders(), cache: "no-store" })
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload.error || `Could not generate ${item.title.toLowerCase()}.`)
      }
      const blob = await response.blob()
      const disposition = response.headers.get("content-disposition") || ""
      const filename = disposition.match(/filename="([^"]+)"/)?.[1] || `atlas-${productCode.toLowerCase()}-${item.id}.pdf`
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = url
      anchor.download = filename
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(url)
    } catch (downloadError) {
      setError(downloadError.message)
    } finally {
      setBusy("")
    }
  }

  return <div className="space-y-6 px-3 py-4 sm:px-6 sm:py-6">
    <section className="overflow-hidden rounded-[1.75rem] bg-[#001d2e] p-6 text-white sm:p-8"><p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-300">Atlas document library · {productCode}</p><h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Documents for this structure</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Select the configuration once, then download the matching logistics and foundation references. Commercial costing is kept separate from shareable documents.</p></section>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-end gap-3"><div className="mr-auto"><h2 className="text-lg font-bold text-slate-950">Selected specification</h2><p className="mt-1 text-sm text-slate-500">{Number(productCode.slice(1))}m span · 4m modular bays</p></div><Select label="Length" value={length} onChange={setLength} options={LENGTHS.map((value) => [value, `${value}m`])} /><Select label="Eave height" value={height} onChange={setHeight} options={HEIGHTS.map((value) => [value, `${value}m`])} /><Select label="Steel" value={material} onChange={setMaterial} options={[["ZAM", "ZAM"], ["Galv", "Galvanised"], ["Mild", "Mild steel"]]} /><Select label="Sheeting" value={sheeting} onChange={setSheeting} options={SHEETING} /><Select label="Profile" value={profile} onChange={setProfile} options={[["IBR", "IBR"], ["Corrugated", "Corrugated"], ["Concealed Fix", "Concealed fix"]]} /><Select label="Finish" value={finish} onChange={setFinish} options={[["galvanised", "Galvanised"], ["chromadek", "Chromadek"]]} /></div><p className="mt-4 text-xs text-slate-500">The foundation guide follows the selected enclosure: {layoutPlan?.columnCount || 0} main-column footings{layoutPlan?.gableColumnCount ? ` + ${layoutPlan.gableColumnCount} gable-column footings` : ""} ({layoutPlan?.footingCount || 0} total). Steel finish does not change the indicative footing layout. The internal CTC sheet covers the structure only; selected sheeting is not included in its cost total.</p></section>
    {error ? <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</p> : null}
    <section className="grid gap-4 lg:grid-cols-3">{documents.map((item) => <article key={item.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className="grid h-11 w-11 place-items-center rounded-xl bg-sky-50 text-blue-700"><item.icon className="h-5 w-5" /></span><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${item.id === "ctc" ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-800"}`}>{item.audience}</span></div><h3 className="mt-5 text-lg font-bold text-slate-950">{item.title}</h3><p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{item.detail}</p><button type="button" disabled={Boolean(busy)} onClick={() => download(item)} className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#0043f3] px-4 py-3 text-sm font-bold text-white disabled:opacity-50"><Download className="h-4 w-4" />{busy === item.id ? "Generating…" : "Download PDF"}</button></article>)}</section>
    <details className="rounded-2xl border border-slate-200 bg-white"><summary className="flex cursor-pointer items-center gap-3 p-5 text-sm font-bold text-slate-900"><FileText className="h-5 w-5 text-blue-700" />Additional documents and review history</summary><div className="border-t border-slate-200"><p className="px-5 pt-5 text-sm text-slate-500">Add a HTTPS file link to make a registered document available here. Records can apply to {productCode} or all Atlas warehouses; entries without a file link remain metadata only.</p><DocumentsWorkspace platformKey="atlas" productCode={productCode} rules={ATLAS_DOCUMENT_RULES} /></div></details>
  </div>
}

function Select({ label, value, onChange, options }) {
  return <label className="min-w-28 text-xs font-bold text-slate-600">{label}<select value={value} onChange={(event) => onChange(typeof value === "number" ? Number(event.target.value) : event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900">{options.map(([option, text]) => <option key={option} value={option}>{text}</option>)}</select></label>
}
