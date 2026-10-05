"use client"

import { calculateSolarCarportGeometry } from "lib/atlasSolarCarportGeometry"
import { ATLAS_SOLAR_CARPORT_RAFTER_LENGTH_METRES } from "lib/atlasSolarCarportProfiles"
import { useState } from "react"
import { getAtlasSolarCarportSiteLayout } from "lib/atlasSolarCarportLayouts"

export default function SolarCarportPlan({ runs, selectedRunId, onSelectRun }) {
  const [detail, setDetail] = useState(false)
  const layout = getAtlasSolarCarportSiteLayout(runs)
  const scale = 12
  const width = Math.max(580, layout.width * scale + 140)
  const height = layout.depth * scale + 100
  const originX = (width - layout.width * scale) / 2
  return (
    <div className="absolute inset-x-0 bottom-14 top-14 overflow-auto bg-[#edf3f7] px-3" aria-label="Dimensioned parking plan">
      <div className="mb-2 flex items-center justify-between gap-2 text-[10px] text-slate-600"><p>{onSelectRun ? "Select a run to edit" : "Read-only layout"} · nominal dimensions · dots: indicative columns</p><button type="button" className="shrink-0 rounded border border-slate-300 bg-white px-2 py-1" onClick={() => setDetail(!detail)}>{detail ? "Fit plan" : "Zoom / scroll"}</button></div>
      <div className="h-[calc(100%-2rem)] overflow-auto">
      <svg role="img" aria-label={`Parking plan: ${layout.width}m wide by ${layout.depth}m deep, including planning aisles`} viewBox={`0 0 ${width} ${height}`} width={detail ? width : "100%"} height={detail ? height : "100%"} className="mx-auto" style={{ maxWidth: "none" }}>
        <g fontFamily="Arial, sans-serif" fontSize="11" fill="#001d2e">
          <path d={`M ${originX} 30 v -10 H ${originX + layout.width * scale} v 10`} fill="none" stroke="#607383" />
          <text x={width / 2} y={14} textAnchor="middle">{layout.width}m overall width</text>
          <path d={`M ${originX - 12} 50 h -12 V ${50 + layout.depth * scale} h 12`} fill="none" stroke="#607383" />
          <text transform={`translate(${originX - 32},${50 + layout.depth * scale / 2}) rotate(-90)`} textAnchor="middle">{layout.depth}m overall depth</text>
          {layout.runs.map((run, index) => {
            const x = originX + run.left * scale
            const y = 50 + run.top * scale
            const w = run.width * scale
            const h = run.length * scale
            const geometry = calculateSolarCarportGeometry({ width: run.width, length: run.length })
            const roofDepth = ATLAS_SOLAR_CARPORT_RAFTER_LENGTH_METRES * Math.cos(5 * Math.PI / 180)
            const columnRows = run.length === 12 ? [run.length / 2 - 0.08, run.length / 2 + 0.08] : [run.length / 2 + roofDepth / 2 - 0.1]
            const selected = selectedRunId === run.id
            const select = () => onSelectRun?.(run.id)
            return <g key={run.id || index}>
              <g role={onSelectRun ? "button" : undefined} tabIndex={onSelectRun ? 0 : undefined} aria-label={`Select run ${String.fromCharCode(65 + index)}, ${run.width}m by ${run.length}m`} aria-pressed={onSelectRun ? selected : undefined} onClick={select} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); select() } }} style={{ cursor: onSelectRun ? "pointer" : "default" }}>
                <rect x={x} y={y} width={w} height={h} rx="3" fill={selected ? "#dbe8ff" : "white"} stroke={selected ? "#0043f3" : "#8195a4"} strokeWidth={selected ? 2 : 1} />
                {Array.from({ length: run.parkingCount - 1 }, (_, bay) => <line key={bay} x1={x + (bay + 1) * w / run.parkingCount} x2={x + (bay + 1) * w / run.parkingCount} y1={y} y2={y + h} stroke="#bacad6" />)}
                {run.length === 12 && <line x1={x} x2={x + w} y1={y + h / 2} y2={y + h / 2} stroke="#8195a4" strokeDasharray="4 3" />}
                {columnRows.flatMap((row, side) => Array.from({ length: geometry.frames }, (_, frame) => <circle key={`${side}-${frame}`} cx={x + frame * geometry.frameSpacing * scale} cy={y + row * scale} r="2.5" fill="#001d2e" />))}
                <rect x={x + w / 2 - 24} y={y + h / 2 - 10} width="48" height="20" rx="10" fill={selected ? "#0043f3" : "#001d2e"} />
                <text x={x + w / 2} y={y + h / 2 + 4} textAnchor="middle" fill="white">Run {String.fromCharCode(65 + index)}</text>
              </g>
              <text x={x + w + 6} y={y + h / 2} fontSize="10">{run.length}m</text>
              <text x={x + w / 2} y={y + h + 14} textAnchor="middle">{run.width}m · {run.parkingCount * (run.length === 12 ? 2 : 1)} spaces</text>
              {index < layout.runs.length - 1 && <text x={width / 2} y={y + h + layout.aisle * scale / 2 + 7} textAnchor="middle" fill="#607383">↕ {layout.aisle}m planning aisle</text>}
            </g>
          })}
        </g>
      </svg>
      </div>
    </div>
  )
}
