"use client"
import { getGroundMountLayout } from "../../lib/estimates/solarEstimate"
import { GROUND_MOUNT_PANEL_OPTIONS, GROUND_MOUNT_MAX_RUNS } from "../../lib/groundMountRuns.mjs"

export default function GroundMountRunFields({ runs = [], onChange }) {
  const total = runs.reduce((sum, run) => sum + run.panelCount, 0)
  return <section className="my-4 space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
    <div><h4 className="font-semibold text-slate-950">Ground-mount runs</h4><p className="text-xs text-slate-500">Each run is a separate structure, using the same 6-panel bays as the 3D builder.</p></div>
    {runs.map((run, i) => <div key={i} className="flex items-center gap-3">
      <label className="flex flex-1 items-center gap-3 text-sm font-medium">Run {String.fromCharCode(65 + i)}
        <select aria-label={`Panels in run ${String.fromCharCode(65 + i)}`} className="min-w-0 flex-1 rounded-lg border border-slate-300 p-2" value={run.panelCount} onChange={(event) => onChange(runs.map((item, index) => index === i ? { ...item, panelCount: Number(event.target.value) } : item))}>
          {GROUND_MOUNT_PANEL_OPTIONS.map((count) => <option key={count} value={count}>{count} panels · {count / 6} bays · {getGroundMountLayout(count).width} × {getGroundMountLayout(count).length} m</option>)}
        </select>
      </label>
      <button type="button" aria-label={`Remove run ${String.fromCharCode(65 + i)}`} className="text-sm text-red-700" onClick={() => onChange(runs.filter((_, index) => index !== i))}>Remove</button>
    </div>)}
    <div className="flex flex-wrap items-center justify-between gap-2"><button type="button" disabled={runs.length >= GROUND_MOUNT_MAX_RUNS} className="rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white disabled:opacity-40" onClick={() => onChange([...runs, { id: `run-${runs.length + 1}`, panelCount: 36 }])}>Add run</button><p className="text-sm text-slate-600">{runs.length} runs · {total} panels total</p></div>
  </section>
}
