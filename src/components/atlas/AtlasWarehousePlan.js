export default function AtlasWarehousePlan({ plan, showFootings = true, className = "" }) {
  if (!plan) return null

  const scale = Math.min(48, 900 / plan.lengthM, 440 / plan.widthM)
  const length = plan.lengthM * scale
  const width = plan.widthM * scale
  const viewWidth = Math.max(700, length + 150)
  const viewHeight = Math.max(520, width + 220)
  const left = (viewWidth - length) / 2
  const top = (viewHeight - width) / 2
  const right = left + length
  const bottom = top + width
  const footingSide = (plan.footingSizeMm / 1000) * scale
  const frames = Array.from({ length: plan.portalFrames }, (_, index) => ({ x: left + index * plan.baySpacingM * scale, label: String(index + 1) }))
  const openingHeight = (plan.frontOpeningWidthM || 0) * scale
  const openingTop = top + (width - openingHeight) / 2
  const openingBottom = openingTop + openingHeight
  const ink = "#173247"
  const secondary = "#607489"
  const grid = "#aabac7"

  return <svg className={className} viewBox={`0 0 ${viewWidth} ${viewHeight}`} role="img" aria-label={`Indicative plan of Atlas ${plan.familyCode}, ${plan.widthM} by ${plan.lengthM} metres, ${plan.bays} four-metre bays and ${plan.columnCount} main columns`} xmlns="http://www.w3.org/2000/svg">
    <rect width={viewWidth} height={viewHeight} fill="#fff" />

    {frames.map(({ x, label }) => <g key={`grid-${label}`}>
      <line x1={x} y1={top - 44} x2={x} y2={bottom + 44} stroke={grid} strokeWidth="0.8" strokeDasharray="5 4" />
      {[top - 43, bottom + 43].map((y) => <g key={y}><circle cx={x} cy={y} r="12" fill="#fff" stroke={secondary} strokeWidth="1" /><text x={x} y={y + 4} textAnchor="middle" fill={ink} fontSize="11" fontWeight="600">{label}</text></g>)}
    </g>)}
    {[{ y: top, label: "A" }, { y: bottom, label: "B" }].map(({ y, label }) => <g key={`row-${label}`}>
      <line x1={left - 45} y1={y} x2={right + 45} y2={y} stroke={grid} strokeWidth="0.8" strokeDasharray="5 4" />
      {[left - 44, right + 44].map((x) => <g key={x}><circle cx={x} cy={y} r="12" fill="#fff" stroke={secondary} strokeWidth="1" /><text x={x} y={y + 4} textAnchor="middle" fill={ink} fontSize="11" fontWeight="600">{label}</text></g>)}
    </g>)}

    <line x1={left} y1={top} x2={right} y2={top} stroke={ink} strokeWidth="1.8" />
    <line x1={right} y1={top} x2={right} y2={bottom} stroke={ink} strokeWidth="1.8" />
    <line x1={right} y1={bottom} x2={left} y2={bottom} stroke={ink} strokeWidth="1.8" />
    {plan.frontOpeningWidthM ? <>
      <line x1={left} y1={top} x2={left} y2={openingTop} stroke={ink} strokeWidth="1.8" />
      <line x1={left} y1={openingBottom} x2={left} y2={bottom} stroke={ink} strokeWidth="1.8" />
      <line x1={left} y1={openingTop} x2={left} y2={openingBottom} stroke="#0043f3" strokeWidth="1.2" strokeDasharray="5 4" />
      <text x={left + 9} y={(openingTop + openingBottom) / 2 - 5} fill="#0043f3" fontSize="11" fontWeight="600">{plan.frontOpeningWidthM}m clear opening</text>
    </> : <line x1={left} y1={top} x2={left} y2={bottom} stroke={ink} strokeWidth="1.8" />}
    <line x1={left} y1={top + width / 2} x2={right} y2={top + width / 2} stroke={grid} strokeWidth="0.8" strokeDasharray="8 5" />

    {frames.flatMap(({ x, label }) => [top, bottom].map((y, row) => <g key={`column-${label}-${row}`}>
      {showFootings ? <rect x={x - footingSide / 2} y={y - footingSide / 2} width={footingSide} height={footingSide} fill="#fff" fillOpacity="0.75" stroke="#b87c36" strokeWidth="1" /> : null}
      <circle cx={x} cy={y} r="2.8" fill={ink} />
    </g>))}

    {frames.slice(0, -1).map(({ x, label }) => <g key={`bay-dimension-${label}`}>
      <line x1={x} y1={top - 73} x2={x + plan.baySpacingM * scale} y2={top - 73} stroke={secondary} strokeWidth="0.8" />
      <line x1={x} y1={top - 78} x2={x} y2={top - 68} stroke={secondary} strokeWidth="0.8" />
      <text x={x + (plan.baySpacingM * scale) / 2} y={top - 79} textAnchor="middle" fill={secondary} fontSize="10">4 000</text>
    </g>)}
    <line x1={left} y1={top - 96} x2={right} y2={top - 96} stroke={ink} strokeWidth="1" />
    <line x1={left} y1={top - 101} x2={left} y2={top - 91} stroke={ink} strokeWidth="1" />
    <line x1={right} y1={top - 101} x2={right} y2={top - 91} stroke={ink} strokeWidth="1" />
    <text x={(left + right) / 2} y={top - 103} textAnchor="middle" fill={ink} fontSize="12" fontWeight="600">{(plan.lengthM * 1000).toLocaleString("en-ZA")}</text>
    <line x1={left - 75} y1={top} x2={left - 75} y2={bottom} stroke={ink} strokeWidth="1" />
    <line x1={left - 80} y1={top} x2={left - 70} y2={top} stroke={ink} strokeWidth="1" />
    <line x1={left - 80} y1={bottom} x2={left - 70} y2={bottom} stroke={ink} strokeWidth="1" />
    <text x={left - 83} y={(top + bottom) / 2} textAnchor="middle" fill={ink} fontSize="12" fontWeight="600" transform={`rotate(-90 ${left - 83} ${(top + bottom) / 2})`}>{(plan.widthM * 1000).toLocaleString("en-ZA")}</text>

    <line x1="28" y1={viewHeight - 48} x2={viewWidth - 28} y2={viewHeight - 48} stroke="#d9e2e9" strokeWidth="1" />
    <text x="28" y={viewHeight - 28} fill={ink} fontSize="10" fontWeight="700">ATLAS {plan.familyCode} · INDICATIVE COLUMN SETTING-OUT</text>
    <text x={viewWidth - 28} y={viewHeight - 28} textAnchor="end" fill={secondary} fontSize="9">DIMENSIONS IN mm · NOT TO SCALE</text>
  </svg>
}
