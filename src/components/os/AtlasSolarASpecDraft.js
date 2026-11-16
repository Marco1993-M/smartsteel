"use client"

import { useState } from "react"
import {
  A_SPEC_FOOTING_SELL_PRICE, A_SPEC_MAX_BAYS, A_SPEC_SPLICE_SELL_PRICE, buildSolarCarportASpecDraft,
} from "../../lib/atlasSolarCarportASpec"

const money = new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" })

export default function AtlasSolarASpecDraft({ releasedCosts }) {
  const [bays, setBays] = useState(1)
  const [includeInstallation, setIncludeInstallation] = useState(false)
  const [footingRate, setFootingRate] = useState(String(A_SPEC_FOOTING_SELL_PRICE))
  const draft = buildSolarCarportASpecDraft(bays)
  const steelRate = releasedCosts?.zamRatePerTon
  const boltRate = releasedCosts?.connectionBoltSetEach
  const installationRate = releasedCosts?.installationSellPerSquareMetre
  const area = draft.width * draft.depth
  const erection = installationRate == null ? null : area * installationRate
  const footingTotal = footingRate === "" || !Number.isFinite(Number(footingRate)) || Number(footingRate) < 0
    ? null
    : draft.footings.count * Number(footingRate)

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#0043f3]">Internal design draft</p>
          <h2 className="mt-1 text-xl font-bold text-[#001d2e]">A-spec · Shared column pairs</h2>
          <p className="mt-1 text-sm text-slate-600">
            {draft.width.toFixed(2)}m × {draft.depth}m nominal layout · {draft.pitch}° pitch · {draft.columnCount} columns with {Math.round(draft.embedmentM * 1000)}mm embedment
          </p>
        </div>
        <label className="text-sm font-semibold">
          Two-space bays
          <select className="ml-2 rounded-lg border border-slate-300 bg-white px-3 py-2" value={bays} onChange={event => setBays(Number(event.target.value))}>
            {Array.from({ length: A_SPEC_MAX_BAYS }, (_, index) => index + 1).map(value => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[430px] text-left text-sm">
          <thead className="border-b border-slate-200 text-slate-600">
            <tr>{["Member", "ZAM profile", "Pieces", "Nominal length"].map(label => <th key={label} scope="col" className="px-2 py-2">{label}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {draft.members.map(member => (
              <tr key={member.label}>
                <th scope="row" className="px-2 py-2 font-medium">{member.label}</th>
                <td className="px-2 py-2">{member.profile}</td>
                <td className="px-2 py-2">{member.quantity}</td>
                <td className="px-2 py-2">{member.nominalLength.toFixed(3)}m</td>
              </tr>
            ))}
            <tr>
              <th scope="row" className="px-2 py-2 font-medium">Diagonal knee braces</th>
              <td className="px-2 py-2">{draft.kneeBraces.profile}</td>
              <td className="px-2 py-2">{draft.kneeBraces.quantity}</td>
              <td className="px-2 py-2">{draft.kneeBraces.budgetLengthsM.map(length => Math.round(length * 1000)).join("–")}mm budget range</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2 rounded-xl bg-slate-50 p-4 text-sm">
        <p><strong>{draft.steelKg.toFixed(1)} kg</strong> nominal steel before braces{steelRate == null ? "" : ` · ${money.format(draft.steelKg * steelRate / 1000)} raw steel cost`}</p>
        <p><strong>{draft.spliceCount}</strong> purlin splice brackets · {money.format(A_SPEC_SPLICE_SELL_PRICE)} each · <strong>{money.format(draft.spliceSellTotal)} sell excl. VAT</strong></p>
        <p><strong>{draft.kneeBraces.budgetMassKg.map(mass => mass.toFixed(1)).join("–")} kg</strong> knee brace steel{steelRate == null ? "" : ` · ${draft.kneeBraces.budgetMassKg.map(mass => money.format(mass * steelRate / 1000)).join("–")} raw steel cost`}</p>
        <p><strong>{draft.kneeBraces.boltSetCount}</strong> knee brace bolt sets{boltRate == null ? "" : ` · ${money.format(draft.kneeBraces.boltSetCount * boltRate)} cost before uplift`}</p>
        <p><strong>{draft.rafterConnectionBoltSets}</strong> rafter-to-column bolt sets{boltRate == null ? "" : ` · ${money.format(draft.rafterConnectionBoltSets * boltRate)} cost before uplift`}</p>
        <p><strong>{draft.purlinBoltSetCount}</strong> purlin bolt sets · budgeted at {draft.purlinBoltSetsPerJoint} per joint{boltRate == null ? "" : ` · ${money.format(draft.purlinBoltSetCount * boltRate)} cost before uplift`}</p>
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 p-4 text-sm">
        <label className="flex items-center gap-2 font-semibold">
          <input type="checkbox" checked={includeInstallation} onChange={event => setIncludeInstallation(event.target.checked)} />
          Include installation and planted footings
        </label>
        {includeInstallation ? (
          <div className="mt-3 space-y-2 text-slate-700">
            <p>Structure erection · {area.toFixed(2)} m² · {erection == null ? "Installation rate unavailable" : money.format(erection)}</p>
            <p>{draft.footings.count} planted footings · 350 × 350 × 600 mm each · {draft.footings.grossConcreteM3.toFixed(3)} m³ gross concrete</p>
            <label className="flex flex-wrap items-center gap-2">
              Sell price per footing excl. VAT
              <input type="number" min="0" step="0.01" value={footingRate} onChange={event => setFootingRate(event.target.value)}
                className="w-32 rounded-lg border border-slate-300 px-2 py-1" />
            </label>
            <p>Planted column footings · <strong>{footingTotal == null ? "Enter a valid rate" : money.format(footingTotal)}</strong></p>
            {erection != null && footingTotal != null ? <p className="font-bold text-[#001d2e]">Installation and footings add {money.format(erection + footingTotal)} excl. VAT</p> : null}
          </div>
        ) : null}
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-600">
        Knee braces sit at {draft.kneeBraces.angleDeg}°, one per column, with {draft.kneeBraces.boltsPerEnd} bolts at each end. Confirm the fixing positions and end overlaps before treating the budget lengths as cut lengths. The planted-column schedule excludes anchoring hardware. Purlins bolt directly to rafters. The budget uses one bolt set per purlin end. Confirm the splice fixings for adjoining bays. The member lengths are for planning. Use manual pricing for A-spec in the CRM.
      </p>
    </section>
  )
}
