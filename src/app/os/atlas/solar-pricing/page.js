"use client"

import { useEffect, useState } from 'react'
import { getOsAuthHeaders } from 'lib/osClientAuth'
import { SOLAR_COST_LABELS, calculateAtlasSolarCarportEstimate } from 'lib/estimates/atlasSolarCarportEstimate'

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
  return <main className="mx-auto max-w-6xl p-6 text-slate-900">
    <p className="text-sm font-bold uppercase tracking-widest text-blue-700">Atlas / Solar carports</p>
    <h1 className="mt-3 text-3xl font-bold">Member costing and website pricing</h1>
    <p className="my-4 text-slate-600">ZAM member costs from the shared model schedule. Hardware and fabrication remain provisional. Save publishes these rates to new website and CRM calculations; existing saved estimates retain their prices.</p>
    {message && <p role="status" className="my-4 border border-blue-200 bg-blue-50 p-3">{message}</p>}
    {costs && <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Object.entries(SOLAR_COST_LABELS).map(([key, label]) => <label key={key} className="text-sm font-semibold">{label}<input type="number" min="0" step="0.01" value={costs[key]} onChange={e => setCosts({ ...costs, [key]: e.target.value === '' ? '' : Number(e.target.value) })} className="mt-2 w-full border border-slate-300 p-3" /></label>)}</div>
      <button disabled={saving} onClick={save} className="my-6 bg-blue-700 px-5 py-3 font-bold text-white disabled:opacity-50">{saving ? 'Saving…' : 'Save website pricing'}</button>
      <div className="flex flex-wrap gap-4 border-t py-5"><label>Width <select value={width} onChange={e => setWidth(Number(e.target.value))}>{[2.75,5.5,11,16.5,22].map(w => <option key={w} value={w}>{w}m</option>)}</select></label><label>Rows <select value={length} onChange={e => setLength(Number(e.target.value))}><option value={6}>Single</option><option value={12}>Double</option></select></label></div>
      <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr>{['Member','Profile','Qty','Nominal cut (m)','Steel (kg)'].map(t => <th className="p-3" key={t}>{t}</th>)}</tr></thead><tbody>{estimate.members.map(m => <tr key={m.code} className="border-t"><td className="p-3">{m.label}</td><td>{m.profile.section}</td><td>{m.quantity}</td><td>{m.cutLengthM.toFixed(3)}</td><td>{m.totalMassKg.toFixed(2)}</td></tr>)}</tbody></table></div>
      <p className="my-5 text-xl font-bold">Cost R {estimate.pricing.baseTotal.toFixed(2)} + {costs.upliftPercent}% = R {estimate.pricing.estimatedTotal.toFixed(2)} excl. VAT</p>
      <p className="text-sm text-slate-600">Preview excludes panel support interfaces and delivery. These are added by the estimator when specified. Nominal lengths require connection detailing before manufacture.</p>
    </>}
  </main>
}
