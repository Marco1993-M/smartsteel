"use client"

import Image from "next/image"
import dynamic from "next/dynamic"
import { useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { ATLAS_SOLAR_CARPORT_PARKING_WIDTH_METRES } from "lib/atlasSolarCarportProfiles"
import { getAtlasSolarCarportPanelCount, getAtlasSolarCarportSiteLayout } from "lib/atlasSolarCarportLayouts"

const SolarCarportPreview = dynamic(() => import("../../../../components/solar-carport/SolarCarportPreview"), { ssr: false })
const PANEL_WATTAGE = 550
const VALID_LENGTHS = new Set([6, 12])
const VALID_WIDTHS = new Set(Array.from({ length: 20 }, (_, index) => (index + 1) * ATLAS_SOLAR_CARPORT_PARKING_WIDTH_METRES))

function readRuns(value) {
  const runs = String(value || "").split(",").map((entry, index) => {
    const [width, length] = entry.split("x").map(Number)
    if (!VALID_WIDTHS.has(width) || !VALID_LENGTHS.has(length)) return null
    return {
      id: `run-${index + 1}`,
      width,
      length,
      parkingCount: width / ATLAS_SOLAR_CARPORT_PARKING_WIDTH_METRES,
      moduleCount: getAtlasSolarCarportPanelCount(width, length),
    }
  }).filter(Boolean)
  return runs.length ? runs : [{ id: "run-1", width: 5.5, length: 6, parkingCount: 2, moduleCount: getAtlasSolarCarportPanelCount(5.5, 6) }]
}

export default function SolarCarportSummaryClient() {
  const searchParams = useSearchParams()
  const parkingRuns = useMemo(() => readRuns(searchParams.get("runs")), [searchParams])
  const totalParkingSpaces = parkingRuns.reduce((sum, run) => sum + run.parkingCount * (run.length === 12 ? 2 : 1), 0)
  const totalPanels = parkingRuns.reduce((sum, run) => sum + run.moduleCount, 0)
  const powerKwp = totalPanels * PANEL_WATTAGE / 1000
  const siteLayout = getAtlasSolarCarportSiteLayout(parkingRuns)
  const footprintWidth = siteLayout.width
  const footprintDepth = siteLayout.depth

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-[#001d2e] print:bg-white print:p-0">
      <div className="no-print mx-auto mb-4 flex max-w-[980px] items-center justify-between gap-4">
        <p className="text-sm font-semibold text-slate-500">Read-only submitted configuration</p>
        <button type="button" onClick={() => window.print()} className="rounded-xl bg-[#001d2e] px-5 py-3 text-sm font-bold text-white">Print / Save PDF</button>
      </div>
      <article className="summary-sheet mx-auto max-w-[980px] overflow-hidden bg-white shadow-xl print:shadow-none">
        <header className="grid gap-6 bg-[linear-gradient(120deg,#001d2e,#0043f3)] px-8 py-7 text-white sm:grid-cols-[1fr_auto]">
          <div><Image src="/atlas/atlas-logo-horizontal-light.png" alt="Atlas by Smart Steel" width={250} height={46} className="h-9 w-auto object-contain object-left" priority /><p className="mt-5 text-[10px] font-bold uppercase tracking-[0.22em] text-white/65">Solar carport configuration summary</p><h1 className="mt-2 text-3xl font-bold">Submitted parking layout</h1></div>
          <div className="self-end text-left sm:text-right"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">Status</p><p className="mt-1 text-lg font-bold">Read only</p></div>
        </header>
        <div className="grid gap-6 p-8 sm:grid-cols-[1.25fr_0.75fr]">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"><SolarCarportPreview parkingCount={parkingRuns[0].parkingCount} rowLength={parkingRuns[0].length} parkingRuns={parkingRuns} selectedRunId={parkingRuns[0].id}  /></div>
          <section className="rounded-2xl bg-[#001d2e] p-6 text-white"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#c1d9e5]">Configuration</p><p className="mt-3 text-4xl font-bold">{totalParkingSpaces} spaces</p><p className="mt-2 text-sm text-white/65">{parkingRuns.length} parking run{parkingRuns.length === 1 ? "" : "s"}</p><dl className="mt-6 divide-y divide-white/10">{[["Planning footprint", `${footprintWidth}m × ${footprintDepth}m`], ["Solar modules", totalPanels], ["Estimated capacity", `${powerKwp.toFixed(1)} kWp`], ["Structure", "Atlas ZAM steel system"]].map(([label, value]) => <div key={label} className="flex justify-between gap-4 py-3 text-sm"><dt className="text-white/55">{label}</dt><dd className="text-right font-bold">{value}</dd></div>)}</dl></section>
        </div>
        <section className="px-8 pb-8"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Parking runs</p><div className="mt-3 grid gap-3 sm:grid-cols-2">{parkingRuns.map((run, index) => <div key={run.id} className="border border-slate-200 p-4"><div className="flex items-center justify-between gap-4"><p className="font-bold">Run {String.fromCharCode(65 + index)}</p><p className="text-sm font-bold text-[#0043f3]">{run.parkingCount * (run.length === 12 ? 2 : 1)} spaces</p></div><p className="mt-2 text-sm text-slate-600">{run.width}m wide × {run.length}m deep · {run.moduleCount} panels · {run.length === 12 ? "double-sided butterfly" : "single-sided"}</p></div>)}</div><p className="mt-6 border-t border-slate-200 pt-5 text-xs leading-5 text-slate-500">This page reproduces the configuration submitted with the CRM lead. It contains no editing controls. Final layout, foundations, access, delivery, installation and solar equipment remain subject to project review.</p></section>
      </article>
      <style jsx global>{`@media print { body > header, body > footer, .no-print { display:none !important; } @page { size:A4 portrait; margin:0; } .summary-sheet { width:210mm; min-height:297mm; max-width:none; } }`}</style>
    </main>
  )
}
