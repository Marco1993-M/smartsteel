"use client"

import { calculateSolarCarportGeometry } from "lib/atlasSolarCarportGeometry"
import { ATLAS_SOLAR_CARPORT_RAFTER_LENGTH_METRES } from "lib/atlasSolarCarportProfiles"
import { useEffect, useRef, useState } from "react"
import { getAtlasSolarCarportSiteLayout } from "lib/atlasSolarCarportLayouts"

const METRE_SCALE = 12
const snap = (value, step) => Math.round(value / step) * step

export default function SolarCarportPlan({ runs, selectedRunId, onSelectRun, onPlaceRun, resetSignal }) {
  const [zoomed, setZoomed] = useState(false)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const dragRef = useRef(null)
  const draggedRef = useRef(false)
  const svgRef = useRef(null)

  useEffect(() => {
    setZoomed(false)
    setPan({ x: 0, y: 0 })
  }, [resetSignal])

  const layout = getAtlasSolarCarportSiteLayout(runs)
  const width = Math.max(580, layout.width * METRE_SCALE + 160)
  const height = Math.max(250, layout.depth * METRE_SCALE + 120)
  const originX = (width - layout.width * METRE_SCALE) / 2
  const originY = 58
  const runCentre = (run) => ({
    x: originX + (run.x - layout.minX) * METRE_SCALE,
    y: originY + (run.z - layout.minZ) * METRE_SCALE,
  })
  const startDrag = (event) => {
    if (event.button !== 0) return
    const rotateNode = onPlaceRun && event.target.closest?.("[data-rotate-id]")
    const runNode = onPlaceRun && event.target.closest?.("[data-run-id]")
    const runId = rotateNode?.dataset.rotateId || runNode?.dataset.runId
    const run = layout.runs.find((item) => item.id === runId)
    draggedRef.current = false
    const screenInverse = svgRef.current?.getScreenCTM()?.inverse()
    const startPoint = screenInverse ? new DOMPoint(event.clientX, event.clientY).matrixTransform(screenInverse) : null
    const centre = run ? runCentre(run) : null
    dragRef.current = {
      mode: rotateNode ? "rotate" : run ? "run" : "pan",
      pointerId: event.pointerId,
      startClientX: event.clientX, startClientY: event.clientY,
      startPoint, screenInverse, run, centre,
      panX: pan.x, panY: pan.y,
      startAngle: centre && startPoint ? Math.atan2(startPoint.y - centre.y, startPoint.x - centre.x) : 0,
    }
  }

  const moveDrag = (event) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    const dx = event.clientX - drag.startClientX
    const dy = event.clientY - drag.startClientY
    if (!draggedRef.current && Math.hypot(dx, dy) < 5) return
    if (!draggedRef.current) {
      draggedRef.current = true
      event.currentTarget.setPointerCapture(event.pointerId)
      if (drag.run) onSelectRun?.(drag.run.id)
    }
    if (drag.mode === "pan") {
      const bounds = event.currentTarget.getBoundingClientRect()
      const limitX = bounds.width * (zoomed ? 0.6 : 0.3)
      const limitY = bounds.height * (zoomed ? 0.6 : 0.3)
      setPan({
        x: Math.max(-limitX, Math.min(limitX, drag.panX + dx)),
        y: Math.max(-limitY, Math.min(limitY, drag.panY + dy)),
      })
      return
    }
    const point = drag.screenInverse ? new DOMPoint(event.clientX, event.clientY).matrixTransform(drag.screenInverse) : null
    if (!point || !drag.startPoint) return
    if (drag.mode === "run") {
      onPlaceRun?.(drag.run.id, {
        x: snap(drag.run.x + (point.x - drag.startPoint.x) / METRE_SCALE, 0.25),
        z: snap(drag.run.z + (point.y - drag.startPoint.y) / METRE_SCALE, 0.25),
      })
    } else {
      const angle = Math.atan2(point.y - drag.centre.y, point.x - drag.centre.x)
      const degrees = drag.run.rotationDeg + (angle - drag.startAngle) * 180 / Math.PI
      const rotationDeg = ((snap(degrees, 5) + 180) % 360 + 360) % 360 - 180
      onPlaceRun?.(drag.run.id, { rotationDeg })
    }
  }

  const endDrag = (event) => {
    dragRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }

  const keyboardMove = (event, run) => {
    if (!onPlaceRun) return
    const step = event.shiftKey ? 1 : 0.25
    const moves = { ArrowLeft: { x: run.x - step }, ArrowRight: { x: run.x + step }, ArrowUp: { z: run.z - step }, ArrowDown: { z: run.z + step }, "[": { rotationDeg: run.rotationDeg - 5 }, "]": { rotationDeg: run.rotationDeg + 5 } }
    if (moves[event.key]) {
      event.preventDefault()
      onPlaceRun(run.id, moves[event.key])
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      onSelectRun?.(run.id)
    }
  }

  return <div className="absolute inset-0 overflow-hidden bg-[#edf3f7] px-3 pb-14 pt-14" aria-label="Dimensioned parking plan">
    <div className="mb-2 flex items-center justify-between gap-2 text-[10px] text-slate-600">
      <p>{onPlaceRun ? "Drag a run to move · use its handle to rotate · 7.5m minimum clearance" : "Read-only layout"} · drag empty space to pan</p>
      <button type="button" className="shrink-0 rounded border border-slate-300 bg-white px-2 py-1" onClick={() => { setZoomed(!zoomed); setPan({ x: 0, y: 0 }) }}>{zoomed ? "Fit plan" : "Zoom in"}</button>
    </div>
    <div className="h-[calc(100%-2rem)] cursor-grab overflow-hidden active:cursor-grabbing" style={{ touchAction: "none" }} onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag}>
      <svg ref={svgRef} role="img" aria-label={`Parking plan: ${layout.width}m wide by ${layout.depth}m deep`} viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" className="mx-auto select-none" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomed ? 1.7 : 1})`, transformOrigin: "center", userSelect: "none" }}>
        <g fontFamily="Arial, sans-serif" fontSize="11" fill="#001d2e">
          <path d={`M ${originX} 32 v -10 H ${originX + layout.width * METRE_SCALE} v 10`} fill="none" stroke="#607383" />
          <text x={width / 2} y={16} textAnchor="middle">{layout.width}m overall width</text>
          <path d={`M ${originX - 12} ${originY} h -12 V ${originY + layout.depth * METRE_SCALE} h 12`} fill="none" stroke="#607383" />
          <text transform={`translate(${originX - 32},${originY + layout.depth * METRE_SCALE / 2}) rotate(-90)`} textAnchor="middle">{layout.depth}m overall depth</text>
          {layout.runs.map((run, index) => {
            const centre = runCentre(run)
            const w = run.width * METRE_SCALE
            const h = run.length * METRE_SCALE
            const geometry = calculateSolarCarportGeometry({ width: run.width, length: run.length })
            const roofDepth = ATLAS_SOLAR_CARPORT_RAFTER_LENGTH_METRES * Math.cos(5 * Math.PI / 180)
            const columnRows = run.length === 12 ? [run.length / 2 - 0.08, run.length / 2 + 0.08] : [run.length / 2 + roofDepth / 2 - 0.1]
            const selected = selectedRunId === run.id
            return <g key={run.id || index}>
              <g transform={`translate(${centre.x},${centre.y}) rotate(${run.rotationDeg || 0})`}>
                <g data-run-id={run.id} role={onPlaceRun ? "button" : undefined} tabIndex={onPlaceRun ? 0 : undefined} aria-label={`Run ${String.fromCharCode(65 + index)}, ${run.width}m by ${run.length}m. Use arrow keys to move and brackets to rotate.`} aria-pressed={onPlaceRun ? selected : undefined} onClick={() => { if (!draggedRef.current) onSelectRun?.(run.id) }} onKeyDown={(event) => keyboardMove(event, run)} style={{ cursor: onPlaceRun ? "move" : "grab" }}>
                  <rect x={-w / 2} y={-h / 2} width={w} height={h} rx="3" fill={selected ? "#dbe8ff" : "white"} stroke={selected ? "#0043f3" : "#8195a4"} strokeWidth={selected ? 2 : 1} />
                  {Array.from({ length: run.parkingCount - 1 }, (_, bay) => <line key={bay} x1={-w / 2 + (bay + 1) * w / run.parkingCount} x2={-w / 2 + (bay + 1) * w / run.parkingCount} y1={-h / 2} y2={h / 2} stroke="#bacad6" />)}
                  {run.length === 12 && <line x1={-w / 2} x2={w / 2} y1={0} y2={0} stroke="#8195a4" strokeDasharray="4 3" />}
                  {columnRows.flatMap((row, side) => Array.from({ length: geometry.frames }, (_, frame) => <circle key={`${side}-${frame}`} cx={-w / 2 + frame * geometry.frameSpacing * METRE_SCALE} cy={-h / 2 + row * METRE_SCALE} r="2.5" fill="#001d2e" />))}
                  <rect x={-24} y={-10} width="48" height="20" rx="10" fill={selected ? "#0043f3" : "#001d2e"} />
                  <text x={0} y={4} textAnchor="middle" fill="white">Run {String.fromCharCode(65 + index)}</text>
                </g>
                {onPlaceRun && <g data-rotate-id={run.id} style={{ cursor: "alias" }}>
                  <path d={`M 0 ${-h / 2} V ${-h / 2 - 18}`} stroke="#0043f3" strokeWidth="2" />
                  <circle cx="0" cy={-h / 2 - 23} r="9" fill={selected ? "#0043f3" : "#001d2e"} stroke="white" strokeWidth="2" />
                  <path d={`M -3 ${-h / 2 - 23} a 4 4 0 1 1 4 4`} fill="none" stroke="white" strokeWidth="1.5" />
                </g>}
                <text x={w / 2 + 6} y="3" fontSize="10">{run.length}m</text>
                <text x="0" y={h / 2 + 14} textAnchor="middle">{run.width}m · {run.parkingCount * (run.length === 12 ? 2 : 1)} spaces</text>
              </g>
            </g>
          })}
        </g>
      </svg>
    </div>
  </div>
}
