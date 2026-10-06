"use client"

import { useMemo, useState } from "react"
import { Download, FileWarning, Ruler, ShieldCheck } from "lucide-react"
import { ATLAS_LENGTH_OPTIONS } from "../../lib/atlasConfiguration"
import { getAtlasFoundationGuide } from "../../lib/atlasFoundationGuide"
import { getAtlasWarehousePlan } from "../../lib/atlasWarehousePlan"
import { getOsAuthHeaders } from "../../lib/osClientAuth"
import AtlasWarehousePlan from "../atlas/AtlasWarehousePlan"

const LENGTHS = ATLAS_LENGTH_OPTIONS
const HEIGHTS = [3, 4, 4.5, 5]

export default function AtlasFoundationGuideCard({ initialProductCode = "W08" }) {
  const [lengthM, setLengthM] = useState(24)
  const [eaveHeightM, setEaveHeightM] = useState(["W10", "W12", "W15"].includes(initialProductCode) ? 4.5 : 3)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState("")
  const guide = useMemo(() => getAtlasFoundationGuide({ productCode: initialProductCode, lengthM, eaveHeightM }), [initialProductCode, lengthM, eaveHeightM])
  const layoutPlan = useMemo(() => getAtlasWarehousePlan({ width: guide.spanM, length: guide.lengthM, wallHeight: guide.eaveHeightM }), [guide.spanM, guide.lengthM, guide.eaveHeightM])
  const downloadHref = `/api/os/atlas-foundation-guide?product=${guide.productCode}&length=${guide.lengthM}&height=${guide.eaveHeightM}`

  async function downloadGuide() {
    setDownloading(true)
    setError("")
    try {
      const headers = await getOsAuthHeaders()
      const response = await fetch(downloadHref, { headers })
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload.error || "Could not generate the foundation guide.")
      }
      const blob = await response.blob()
      const disposition = response.headers.get("content-disposition") || ""
      const filename = disposition.match(/filename="([^"]+)"/)?.[1] || `atlas-${guide.productCode.toLowerCase()}-foundation-guide.pdf`
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
      setDownloading(false)
    }
  }

  return (
    <section className="overflow-hidden border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-0 xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]">
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center bg-blue-50 text-blue-700"><Ruler className="h-5 w-5" /></span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Client reference document</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-[#001d2e]">Preliminary foundation and setting-out guide</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Generate an Atlas-branded planning reference for the selected warehouse. The guide records the baseline footing concept, assumptions, setting-out pattern and responsibilities without presenting it as a final site design.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <label className="border border-slate-200 bg-slate-50 p-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Product
              <div className="mt-2 text-base font-black normal-case tracking-normal text-slate-950">{guide.productCode} · {guide.spanM}m span</div>
            </label>
            <label className="border border-slate-200 bg-slate-50 p-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Length
              <select value={lengthM} onChange={(event) => setLengthM(Number(event.target.value))} className="mt-2 w-full bg-transparent text-base font-black normal-case tracking-normal text-slate-950 outline-none">
                {LENGTHS.map((value) => <option key={value} value={value}>{value}m · {value / 4} bays</option>)}
              </select>
            </label>
            <label className="border border-slate-200 bg-slate-50 p-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Eave height
              <select value={eaveHeightM} onChange={(event) => setEaveHeightM(Number(event.target.value))} className="mt-2 w-full bg-transparent text-base font-black normal-case tracking-normal text-slate-950 outline-none">
                {HEIGHTS.map((value) => <option key={value} value={value}>{value}m</option>)}
              </select>
            </label>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Metric label="Column footings" value={guide.footingCount} helper={`${guide.portalFrames} frames × 2 columns`} />
            <Metric label="Baseline pad" value="1,250 × 1,250" helper="350mm thick" />
            <Metric label="Indicative concrete" value={`${guide.totalConcreteM3.toFixed(2)}m³`} helper="Before waste or blinding" />
          </div>
          {layoutPlan ? <details className="mt-5 border border-slate-200 bg-[#edf3f7] p-4">
            <summary className="cursor-pointer text-sm font-black text-[#001d2e]">View indicative column and footing layout</summary>
            <AtlasWarehousePlan plan={layoutPlan} className="mt-4 max-h-[300px] w-full" />
            <p className="mt-3 text-xs leading-5 text-slate-600">Planning footprints only. Confirm final footing locations and design with the appointed engineer.</p>
          </details> : null}
        </div>

        <div className="border-t border-slate-200 bg-[#001d2e] p-5 text-white sm:p-6 xl:border-l xl:border-t-0">
          <div className="flex items-center gap-2 text-amber-300"><FileWarning className="h-5 w-5" /><p className="text-xs font-black uppercase tracking-[0.16em]">Preliminary guidance</p></div>
          <p className="mt-4 text-xl font-black">Issued for planning and budgeting only.</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">The 100kPa bearing assumption, reinforcement arrangement and founding levels remain subject to site-specific verification and engineer approval before construction.</p>
          <div className="mt-5 border border-white/15 bg-white/5 p-4">
            <div className="flex gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-sky-300" /><p className="text-xs leading-5 text-slate-200">The document deliberately omits anchor geometry. An Atlas anchor-setting template can be added as a later controlled release.</p></div>
          </div>
          {error ? <p className="mt-4 bg-red-950/50 p-3 text-xs leading-5 text-red-100">{error}</p> : null}
          <button type="button" onClick={downloadGuide} disabled={downloading} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 bg-[#0043f3] px-5 text-sm font-black text-white hover:bg-blue-600 disabled:cursor-wait disabled:opacity-60">
            <Download className="h-4 w-4" /> {downloading ? "Preparing PDF..." : "Download branded PDF"}
          </button>
        </div>
      </div>
    </section>
  )
}

function Metric({ label, value, helper }) {
  return <div className="border border-slate-200 p-4"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{label}</p><p className="mt-2 text-xl font-black text-slate-950">{value}</p><p className="mt-1 text-xs text-slate-500">{helper}</p></div>
}
