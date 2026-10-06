export default function AtlasWarehousePlan({ plan, showFootings = true, className = "" }) {
  if (!plan) return null

  const pxPerMetre = Math.min(18, 900 / plan.lengthM)
  const buildingLength = plan.lengthM * pxPerMetre
  const buildingWidth = plan.widthM * pxPerMetre
  const marginX = 70
  const marginY = 75
  const left = marginX
  const top = marginY
  const right = left + buildingLength
  const bottom = top + buildingWidth
  const viewWidth = buildingLength + marginX * 2
  const viewHeight = buildingWidth + marginY * 2
  const footingSide = (plan.footingSizeMm / 1000) * pxPerMetre
  const columns = Array.from({ length: plan.portalFrames }, (_, index) => left + index * plan.baySpacingM * pxPerMetre)
  const openingHalf = plan.frontOpeningWidthM ? (plan.frontOpeningWidthM * pxPerMetre) / 2 : 0
  const openingTop = top + buildingWidth / 2 - openingHalf
  const openingBottom = top + buildingWidth / 2 + openingHalf

  return (
    <svg className={className} viewBox={`0 0 ${viewWidth} ${viewHeight}`} role="img" aria-label={`Indicative plan of Atlas ${plan.familyCode}, ${plan.widthM} by ${plan.lengthM} metres, ${plan.bays} four-metre bays and ${plan.columnCount} main columns`} xmlns="http://www.w3.org/2000/svg">
      <rect width={viewWidth} height={viewHeight} fill="#edf3f7" />
      <rect x={left} y={top} width={buildingLength} height={buildingWidth} fill="#fff" stroke="#45617c" strokeWidth="2" />
      {columns.slice(1, -1).map((x, index) => <line key={`grid-${index}`} x1={x} y1={top} x2={x} y2={bottom} stroke="#bfd0dd" strokeWidth="1" strokeDasharray="4 4" />)}
      <line x1={left} y1={top + buildingWidth / 2} x2={right} y2={top + buildingWidth / 2} stroke="#c5d2df" strokeWidth="1" strokeDasharray="6 5" />
      {plan.frontOpeningWidthM ? <>
        <line x1={left} y1={top} x2={left} y2={openingTop} stroke="#0043f3" strokeWidth="4" />
        <line x1={left} y1={openingBottom} x2={left} y2={bottom} stroke="#0043f3" strokeWidth="4" />
        <line x1={left} y1={openingTop} x2={left} y2={openingBottom} stroke="#0043f3" strokeWidth="2" strokeDasharray="5 4" />
        <text x={left + 9} y={top + buildingWidth / 2 - 4} fill="#0043f3" fontSize="12" fontWeight="700">6m opening</text>
      </> : null}
      {columns.flatMap((x, index) => [top, bottom].map((y, side) => <g key={`${index}-${side}`}>
        {showFootings ? <rect x={x - footingSide / 2} y={y - footingSide / 2} width={footingSide} height={footingSide} fill="#fff4de" stroke="#d58a25" strokeWidth="1.5" /> : null}
        <circle cx={x} cy={y} r="3" fill="#001d2e" />
      </g>))}
      <line x1={left} y1={top - 35} x2={right} y2={top - 35} stroke="#47627c" strokeWidth="1" />
      <line x1={left} y1={top - 40} x2={left} y2={top - 30} stroke="#47627c" strokeWidth="1" />
      <line x1={right} y1={top - 40} x2={right} y2={top - 30} stroke="#47627c" strokeWidth="1" />
      <text x={(left + right) / 2} y={top - 43} textAnchor="middle" fill="#001d2e" fontSize="14" fontWeight="700">{plan.lengthM}m overall length · {plan.bays} × 4m bays</text>
      <line x1={left - 32} y1={top} x2={left - 32} y2={bottom} stroke="#47627c" strokeWidth="1" />
      <line x1={left - 37} y1={top} x2={left - 27} y2={top} stroke="#47627c" strokeWidth="1" />
      <line x1={left - 37} y1={bottom} x2={left - 27} y2={bottom} stroke="#47627c" strokeWidth="1" />
      <text x={left - 42} y={(top + bottom) / 2} textAnchor="middle" fill="#001d2e" fontSize="14" fontWeight="700" transform={`rotate(-90 ${left - 42} ${(top + bottom) / 2})`}>{plan.widthM}m span</text>
    </svg>
  )
}
