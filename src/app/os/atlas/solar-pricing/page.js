"use client"

import { useEffect, useState } from 'react'
import { getOsAuthHeaders } from 'lib/osClientAuth'
import { SOLAR_COST_LABELS, calculateAtlasSolarCarportEstimate } from 'lib/estimates/atlasSolarCarportEstimate'
import AtlasModuleHero from 'components/os/AtlasModuleHero'

const GROUPS = [
  { title: 'Steel and production', keys: ['zamRatePerTon', 'wastePercent', 'fabricationPerKg'] },
  { title: 'Brackets and connections', keys: ['anchorBracketEach', 'armBracketEach', 'purlinBracketEach', 'anchorBoltEach', 'connectionBoltSetEach'] },
  { title: 'Project allowances', keys: ['moduleSupportEach', 'installationPerSquareMetre', 'deliveryPerKm', 'deliveryMinimum', 'upliftPercent'] },
]
const money = value => `R ${Number(value || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function SolarPricingPage() {
  const [release, setRelease] = useState(null)
  const [costs, setCosts] = useState(null)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [width, setWidth] = useState(5.5)
  const [length, setLength] = useState(6)
  useEffect(() => {
    async function load() {
      try {
        const response = await fetch('/api/os/solar-carport-pricing', { headers: await getOsAuthHeaders(), cache: 'no-store' })
        const data = await response.json()
        if (!response.ok) throw Error(data.error)
        setRelease(data.release)
        setCosts(data.release?.costs || data.defaults)
      } catch (e) { setMessage(e.message) }
    }
    load()
  }, [])
  async function save() {
    setSaving(true)
    try {
      const response = await fetch('/api/os/solar-carport-pricing', { method: 'PUT', headers: { ...await getOsAuthHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ costs, revision: release?.revision || 0 }) })
      const data = await response.json()
      if (!response.ok) throw Error(data.error)
      setRelease(data.release)
      setMessage(`Revision ${data.release.revision} saved. Website pricing now uses these costs.`)
    } catch (e) { setMessage(e.message) }
    finally { setSaving(false) }
  }
  const estimate = costs && calculateAtlasSolarCarportEstimate({ width, length, quantity: 1, moduleCount: 0, scope: 'supply_only' }, { costs })
  const connectionCosts = estimate?.lineItems.filter(item => item.code.startsWith('SC-BRK') || ['SC-ANC', 'SC-BLT'].includes(item.code)) || []
  return <main className="space-y-6 px-3 py-4 text-slate-900 sm:px-6 sm:py-6">
    <AtlasModuleHero eyebrow="SOLAR-CARPORT pricing control" title="Control the complete solar carport cost." description="Member geometry, ZAM rates, connection components and commercial uplift feed one released price across the website and CRM." status={release ? `Pricing revision ${release.revision}` : 'Initial pricing setup'} actionHref="/tools/solar-carport-estimator" actionLabel="Open website estimator" />
    {message && <p role="status" className="border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">{message}</p>}
    {costs && <>
      <section className="grid gap-4 xl:grid-cols-3">{GROUPS.map(group => <div key={group.title} className="border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{group.title}</p><div className="mt-4 space-y-4">{group.keys.map(key => <label key={key} className="block text-sm font-semibold text-slate-700">{SOLAR_COST_LABELS[key]}<input type="number" min="0" step="0.01" value={costs[key]} onChange={e => setCosts({ ...costs, [key]: e.target.value === '' ? '' : Number(e.target.value) })} className="mt-1.5 w-full border border-slate-300 bg-slate-50 px-3 py-2.5 font-mono text-slate-950 outline-none focus:border-blue-500" /></label>)}</div></div>)}</section>
      <div className="sticky bottom-3 z-20 flex flex-wrap items-center justify-between gap-3 border border-slate-300 bg-white/95 p-4 shadow-xl backdrop-blur"><div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Website selling price</p><p className="text-xl font-black text-slate-950">{money(estimate.pricing.estimatedTotal)} <span className="text-sm font-semibold text-slate-500">excl. VAT</span></p></div><button disabled={saving} onClick={save} className="bg-blue-700 px-5 py-3 font-bold text-white disabled:opacity-50">{saving ? 'Saving…' : 'Publish pricing revision'}</button></div>
      <section className="border border-slate-200 bg-white shadow-sm"><div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 p-5"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">Configuration check</p><h2 className="mt-1 text-2xl font-bold">Material and connection schedule</h2></div><div className="flex gap-3"><label className="text-xs font-bold">Parking width<select className="mt-1 block border border-slate-300 p-2" value={width} onChange={e => setWidth(Number(e.target.value))}>{[2.75,5.5,11,16.5,22].map(w => <option key={w} value={w}>{w}m</option>)}</select></label><label className="text-xs font-bold">Layout<select className="mt-1 block border border-slate-300 p-2" value={length} onChange={e => setLength(Number(e.target.value))}><option value={6}>Single row</option><option value={12}>Double row</option></select></label></div></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500"><tr>{['Code','Member','Profile','Qty','Cut length','Steel mass'].map(t => <th className="p-3" key={t}>{t}</th>)}</tr></thead><tbody>{estimate.members.map(m => <tr key={m.code} className="border-t"><td className="p-3 font-mono text-blue-700">{m.code}</td><td>{m.label}</td><td>{m.profile.section}</td><td>{m.quantity}</td><td>{m.cutLengthM.toFixed(3)}m</td><td>{m.totalMassKg.toFixed(2)}kg</td></tr>)}</tbody></table></div>
        <div className="border-t border-slate-200 p-5"><h3 className="font-bold">Brackets, anchors and fixings</h3><div className="mt-3 grid gap-3 md:grid-cols-2">{estimate.connections.map(item => { const cost = connectionCosts.find(line => line.code === item.code); return <div key={item.code} className="border border-slate-200 p-4"><div className="flex justify-between gap-3"><div><p className="font-mono text-xs font-bold text-blue-700">{item.code}</p><p className="mt-1 font-bold">{item.label}</p></div><p className="font-black">{money(cost?.total)}</p></div><p className="mt-2 text-xs text-slate-500">{item.quantity} each · {item.basis}</p></div> })}</div></div>
        <div className="grid gap-px border-t bg-slate-200 sm:grid-cols-3"><div className="bg-white p-5"><p className="text-xs uppercase text-slate-500">Steel mass</p><p className="mt-1 text-xl font-bold">{estimate.totals.steelKg.toFixed(2)}kg</p></div><div className="bg-white p-5"><p className="text-xs uppercase text-slate-500">Cost before uplift</p><p className="mt-1 text-xl font-bold">{money(estimate.pricing.baseTotal)}</p></div><div className="bg-white p-5"><p className="text-xs uppercase text-slate-500">Commercial uplift</p><p className="mt-1 text-xl font-bold">{costs.upliftPercent}%</p></div></div>
      </section>
      <p className="text-xs leading-5 text-slate-500">Connection quantities and rates are provisional until bracket drawings, bolt specifications and foundation anchors are approved. Nominal member lengths require manufacturing review.</p>
    </>}
  </main>
}
