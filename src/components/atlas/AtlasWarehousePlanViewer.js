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
    <div className="absolute right-3 top-14 z-10 flex rounded-full border border-white/70 bg-white/88 p-1 shadow-sm backdrop-blur sm:right-4 sm:top-4">
      <button type="button" onClick={() => setShowFootings((value) => !value)} aria-pressed={showFootings} className={`rounded-full px-2.5 py-1.5 text-[10px] font-semibold transition sm:px-3 sm:text-[11px] ${showFootings ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-white"}`}>{showFootings ? "Footings on" : "Footings off"}</button>
      <button type="button" onClick={reset} className="rounded-full px-2.5 py-1.5 text-[10px] font-semibold text-slate-600 transition hover:bg-white sm:px-3 sm:text-[11px]">Reset</button>
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
  </div>
}
