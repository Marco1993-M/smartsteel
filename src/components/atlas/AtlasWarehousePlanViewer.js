"use client"

import { useRef, useState } from "react"
import AtlasWarehousePlan from "./AtlasWarehousePlan"

export default function AtlasWarehousePlanViewer({ plan }) {
  const [showFootings, setShowFootings] = useState(true)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const drag = useRef(null)

  function reset() { setZoom(1); setOffset({ x: 0, y: 0 }) }
  function move(event) {
    if (!drag.current) return
    setOffset({ x: drag.current.offset.x + event.clientX - drag.current.x, y: drag.current.offset.y + event.clientY - drag.current.y })
  }

  if (!plan) return null
  return <div className="relative h-full w-full overflow-hidden bg-[#edf3f7]">
    <div className="absolute right-3 top-16 z-10 flex gap-2 text-[11px] font-bold sm:right-4">
      <button type="button" onClick={() => setShowFootings((value) => !value)} aria-pressed={showFootings} className="rounded-lg border border-slate-200 bg-white/95 px-3 py-2 text-[#001d2e] shadow-sm">{showFootings ? "Hide footings" : "Show footings"}</button>
      <button type="button" onClick={reset} className="rounded-lg border border-slate-200 bg-white/95 px-3 py-2 text-[#001d2e] shadow-sm">Reset</button>
    </div>
    <div className="h-full w-full cursor-grab touch-none overflow-hidden active:cursor-grabbing"
      onPointerDown={(event) => { drag.current = { x: event.clientX, y: event.clientY, offset }; event.currentTarget.setPointerCapture(event.pointerId) }}
      onPointerMove={move}
      onPointerUp={() => { drag.current = null }}
      onPointerCancel={() => { drag.current = null }}
      onWheel={(event) => { event.preventDefault(); setZoom((value) => Math.max(1, Math.min(3, value * (event.deltaY < 0 ? 1.12 : 0.89)))) }}
      aria-label="Atlas top plan. Drag to pan and scroll to zoom."
    >
      <div className="flex h-full w-full items-center justify-center p-8 transition-transform duration-75" style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})` }}>
        <AtlasWarehousePlan plan={plan} showFootings={showFootings} className="max-h-full w-full max-w-[1100px]" />
      </div>
    </div>
    <p className="pointer-events-none absolute bottom-3 left-3 right-3 z-10 rounded-lg bg-white/90 px-3 py-2 text-[10px] leading-4 text-slate-600 shadow-sm sm:left-4 sm:right-auto">Column centres and 1,250 × 1,250mm footing footprints · preliminary planning only</p>
  </div>
}
