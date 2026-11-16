"use client"

import { useState } from "react"
import {
  A_SPEC_MAX_BAYS, A_SPEC_SPLICE_SELL_PRICE, buildSolarCarportASpecDraft,
} from "../../lib/atlasSolarCarportASpec"

const money = new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" })

export default function AtlasSolarASpecDraft({ releasedCosts }) {
  const [bays, setBays] = useState(1)
  const draft = buildSolarCarportASpecDraft(bays)
  const steelRate = releasedCosts?.zamRatePerTon
  const anchorRate = releasedCosts?.anchorBoltEach

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#0043f3]">Internal design draft</p>
          <h2 className="mt-1 text-xl font-bold text-[#001d2e]">A-spec · Shared column pairs</h2>
          <p className="mt-1 text-sm text-slate-600">
            {draft.width.toFixed(2)}m × {draft.depth}m nominal layout · {draft.pitch}° pitch · {draft.columnCount} columns
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
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2 rounded-xl bg-slate-50 p-4 text-sm">
        <p><strong>{draft.steelKg.toFixed(1)} kg</strong> nominal steel{steelRate == null ? "" : ` · ${money.format(draft.steelKg * steelRate / 1000)} raw steel cost`}</p>
        <p><strong>{draft.spliceCount}</strong> purlin splice brackets · {money.format(A_SPEC_SPLICE_SELL_PRICE)} each · <strong>{money.format(draft.spliceSellTotal)} sell excl. VAT</strong></p>
        {anchorRate != null ? <p>Released B-spec anchor bolt cost · {money.format(anchorRate)} each</p> : null}
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-600">
        Confirm column bases, anchors, rafter connections, splice fasteners and footing details before releasing A-spec pricing. The member lengths are for planning. Use manual pricing for A-spec in the CRM.
      </p>
    </section>
  )
}
