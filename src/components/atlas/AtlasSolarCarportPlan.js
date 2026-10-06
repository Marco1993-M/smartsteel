import { getAtlasSolarCarportSiteLayout } from "../../lib/atlasSolarCarportLayouts"

export default function AtlasSolarCarportPlan({ runs, className = "" }) {
  const layout = getAtlasSolarCarportSiteLayout(runs)
  if (!layout.runs.length) return null

  const scale = Math.min(18, 900 / Math.max(layout.width, 1), 340 / Math.max(layout.depth, 1))
  const pad = 56
  const viewWidth = layout.width * scale + pad * 2
  const viewHeight = layout.depth * scale + pad * 2
  const xOf = (x) => pad + (x - layout.minX) * scale
  const yOf = (z) => pad + (z - layout.minZ) * scale

  return <svg className={className} viewBox={`0 0 ${viewWidth} ${viewHeight}`} role="img" aria-label={`Indicative top view of ${runs.length} solar carport run${runs.length === 1 ? "" : "s"}, ${layout.width} by ${layout.depth} metres`} xmlns="http://www.w3.org/2000/svg">
    <rect width={viewWidth} height={viewHeight} fill="#edf4f8" />
    {layout.runs.map((run, index) => {
      const width = run.width * scale
      const depth = run.length * scale
      const left = xOf(run.x) - width / 2
      const top = yOf(run.z) - depth / 2
      const frames = Math.ceil(run.parkingCount / 2) + 1
      return <g key={run.id || index} transform={`rotate(${run.rotationDeg || 0} ${xOf(run.x)} ${yOf(run.z)})`}>
        <rect x={left} y={top} width={width} height={depth} rx="4" fill="#fff" stroke="#0043f3" strokeWidth="2.5" />
        {Array.from({ length: run.parkingCount - 1 }, (_, line) => <line key={line} x1={left + (line + 1) * width / run.parkingCount} x2={left + (line + 1) * width / run.parkingCount} y1={top} y2={top + depth} stroke="#c1d9e5" strokeWidth="1" />)}
        {run.length === 12 ? <line x1={left} x2={left + width} y1={top + depth / 2} y2={top + depth / 2} stroke="#0043f3" strokeWidth="1.5" strokeDasharray="5 4" /> : null}
        {Array.from({ length: frames }, (_, frame) => <g key={frame}><circle cx={left + frame * width / (frames - 1)} cy={top + depth} r="3.5" fill="#001d2e" />{run.length === 12 ? <circle cx={left + frame * width / (frames - 1)} cy={top} r="3.5" fill="#001d2e" /> : null}</g>)}
        <rect x={xOf(run.x) - 38} y={yOf(run.z) - 12} width="76" height="24" rx="12" fill="#001d2e" />
        <text x={xOf(run.x)} y={yOf(run.z) + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff">Run {String.fromCharCode(65 + index)}</text>
        <text x={xOf(run.x)} y={top - 10} textAnchor="middle" fontSize="11" fontWeight="700" fill="#001d2e">{run.width}m · {run.parkingCount * (run.length === 12 ? 2 : 1)} spaces</text>
      </g>
    })}
    <text x={viewWidth / 2} y={viewHeight - 16} textAnchor="middle" fontSize="11" fontWeight="700" fill="#526878">Nominal planning envelope {layout.width}m × {layout.depth}m</text>
  </svg>
}
