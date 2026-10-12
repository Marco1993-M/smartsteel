function GableElevation({ plan, opening }) {
  const roofRiseM = (plan.widthM / 2) * Math.tan(Math.PI / 12)
  const scale = Math.min(350 / plan.widthM, 125 / (plan.eaveHeightM + roofRiseM))
  const left = (480 - plan.widthM * scale) / 2
  const right = 480 - left
  const base = 160
  const eave = base - plan.eaveHeightM * scale
  const ridge = eave - roofRiseM * scale
  const openingWidth = (plan.frontOpeningWidthM || 0) * scale
  const openingHeight = (plan.frontOpeningHeightM || 0) * scale
  const openingLeft = 240 - openingWidth / 2
  const columnOffsets = opening ? plan.frontGableColumnOffsetsM : plan.rearGableColumnOffsetsM

  return <svg className="h-full w-full" viewBox="0 0 480 190" role="img" aria-label={opening ? `Front gable elevation with centred ${plan.frontOpeningWidthM}m by ${plan.frontOpeningHeightM}m opening` : "Opposite gable elevation, fully enclosed"} xmlns="http://www.w3.org/2000/svg">
    <path d={`M ${left} ${base} V ${eave} L 240 ${ridge} L ${right} ${eave} V ${base} Z`} fill="#e7eff4" stroke="#173247" strokeWidth="2" />
    <line x1={left} y1={eave} x2={right} y2={eave} stroke="#9bb1bf" strokeWidth="1" strokeDasharray="5 4" />
    {(columnOffsets || []).map((offsetM) => {
      const x = left + offsetM * scale
      const top = eave - Math.min(offsetM, plan.widthM - offsetM) * Math.tan(Math.PI / 12) * scale
      return <line key={offsetM} x1={x} y1={top} x2={x} y2={base} stroke="#607489" strokeWidth="1.5" />
    })}
    {opening ? <>
      <rect x={openingLeft} y={base - openingHeight} width={openingWidth} height={openingHeight} fill="#fff" stroke="#0043f3" strokeWidth="2" />
      <line x1={openingLeft} y1={base - openingHeight + 5} x2={openingLeft + openingWidth} y2={base - openingHeight + 5} stroke="#0043f3" strokeWidth="1" strokeDasharray="5 4" />
    </> : null}
    <line x1={left - 18} y1={base + 6} x2={right + 18} y2={base + 6} stroke="#607489" strokeWidth="1" />
    <text x="240" y="183" textAnchor="middle" fill="#607489" fontSize="12">{plan.widthM}m span · {plan.eaveHeightM}m eave · 15° pitch</text>
  </svg>
}

export default function AtlasWarehouseGableElevations({ plan }) {
  if (!plan || plan.gableMode !== "fully_enclosed_with_gables") return null

  return <div className="grid grid-cols-2 gap-3">
    <div className="min-w-0 border border-slate-200 bg-white p-2">
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#001d2e]">One gable · centred opening</p>
      <div className="h-[32mm] print:h-[29mm]"><GableElevation plan={plan} opening /></div>
    </div>
    <div className="min-w-0 border border-slate-200 bg-white p-2">
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#001d2e]">Opposite gable · enclosed</p>
      <div className="h-[32mm] print:h-[29mm]"><GableElevation plan={plan} /></div>
    </div>
  </div>
}
