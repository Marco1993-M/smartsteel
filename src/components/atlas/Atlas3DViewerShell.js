"use client"

import { RotateCw } from "lucide-react"

export default function Atlas3DViewerShell({
  title,
  subtitle,
  views,
  activeView,
  onViewChange,
  onReset,
  badge,
  description,
  children,
}) {
  return (
    <div
      className="relative h-[290px] overflow-hidden rounded-[1.6rem] border border-slate-200 bg-[radial-gradient(circle_at_top,_#ffffff_0%,_#edf3f8_58%,_#d8e2eb_100%)] shadow-inner sm:h-[360px]"
      role="group"
      aria-label="Interactive Atlas 3D viewer"
    >
      <p className="sr-only">{description}</p>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,255,255,0))]" />

      <div className="absolute left-3 top-3 z-20 flex max-w-[calc(100%-4.5rem)] overflow-x-auto rounded-full border border-white/80 bg-white/88 p-1 shadow-sm backdrop-blur sm:left-4 sm:top-4">
        {views.map((view) => (
          <button
            key={view.value}
            type="button"
            onClick={() => onViewChange(view.value)}
            className={`shrink-0 rounded-full px-2.5 py-1.5 text-[10px] font-semibold transition sm:px-3 sm:text-[11px] ${
              activeView === view.value
                ? "bg-[#001d2e] text-white"
                : "text-slate-600 hover:bg-white hover:text-[#001d2e]"
            }`}
          >
            {view.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onReset}
        className="absolute right-3 top-3 z-20 grid h-9 w-9 place-items-center rounded-full border border-white/80 bg-white/88 text-slate-600 shadow-sm backdrop-blur transition hover:bg-white hover:text-[#001d2e] sm:right-4 sm:top-4"
        aria-label="Reset 3D view"
        title="Reset view"
      >
        <RotateCw className="h-3.5 w-3.5" />
      </button>

      <div className="absolute inset-0">{children}</div>

      <div className="pointer-events-none absolute inset-x-3 bottom-3 z-10 flex items-end justify-between gap-3 sm:inset-x-4 sm:bottom-4">
        <div className="rounded-full border border-white/75 bg-white/82 px-3 py-2 shadow-sm backdrop-blur">
          <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-[#0043f3]">{title}</p>
          <p className="mt-0.5 hidden text-[11px] font-semibold text-[#001d2e] sm:block">{subtitle}</p>
        </div>
        <span className="shrink-0 rounded-full border border-white/75 bg-white/82 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.14em] text-[#001d2e] shadow-sm backdrop-blur">
          {badge}
        </span>
      </div>
    </div>
  )
}
