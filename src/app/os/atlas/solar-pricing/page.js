"use client"

import { useEffect, useMemo, useState } from 'react'
import { getOsAuthHeaders } from 'lib/osClientAuth'
import { SOLAR_COST_DEFAULTS, SOLAR_COST_LABELS, calculateAtlasSolarCarportEstimate } from 'lib/estimates/atlasSolarCarportEstimate'
import { ATLAS_SOLAR_CARPORT_PARKING_COUNTS, getAtlasSolarCarportPanelCount, getAtlasSolarCarportSiteLayout, getAtlasSolarCarportWidth, placeAtlasSolarCarportRun } from 'lib/atlasSolarCarportLayouts'
import AtlasModuleHero from 'components/os/AtlasModuleHero'

const GROUPS = [
  { title: 'Steel and production', keys: ['zamRatePerTon', 'wastePercent', 'fabricationPerKg'] },
  { title: 'Brackets and connections', keys: ['anchorBracketEach', 'armBracketEach', 'purlinBracketEach', 'anchorBoltEach', 'connectionBoltSetEach'] },
  { title: 'Project allowances', keys: ['moduleSupportEach', 'installationPerSquareMetre', 'deliveryPerKm', 'deliveryMinimum', 'upliftPercent'] },
]
const money = value => `R ${Number(value || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const makeRun = (id, parkingCount = 2, length = 6) => ({ id, parkingCount, width: getAtlasSolarCarportWidth(parkingCount), length, moduleCount: getAtlasSolarCarportPanelCount(getAtlasSolarCarportWidth(parkingCount), length), x: 0, z: 0, rotationDeg: 0 })
const inputClass = 'mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'

export default function SolarPricingPage() {
  const [release, setRelease] = useState(null)
  const [costs, setCosts] = useState(null)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [runs, setRuns] = useState([makeRun('run-1')])
  useEffect(() => {
    async function load() {
      try {
        const response = await fetch('/api/os/solar-carport-pricing', { headers: await getOsAuthHeaders(), cache: 'no-store' })
        const data = await response.json()
        if (!response.ok) throw Error(data.error)
        setRelease(data.release)
        setCosts({ ...SOLAR_COST_DEFAULTS, ...(data.release?.costs || data.defaults) })
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
      setCosts({ ...SOLAR_COST_DEFAULTS, ...data.release.costs })
      setMessage(`Revision ${data.release.revision} saved. Website pricing now uses these costs.`)
    } catch (e) { setMessage(e.message) }
    finally { setSaving(false) }
  }
  const input = useMemo(() => ({ parkingRuns: runs.map(({ width, length, parkingCount, moduleCount }) => ({ width, length, parkingCount, moduleCount })), scope: 'supply_only', deliveryDistance: 0 }), [runs])
  const releasedEstimate = useMemo(() => release ? calculateAtlasSolarCarportEstimate(input, release) : null, [input, release])
  const draftEstimate = useMemo(() => costs ? calculateAtlasSolarCarportEstimate(input, { costs, revision: release?.revision || 0 }) : null, [input, costs, release?.revision])
  const layout = useMemo(() => getAtlasSolarCarportSiteLayout(runs), [runs])
  const totalSpaces = runs.reduce((sum, run) => sum + run.parkingCount * (run.length === 12 ? 2 : 1), 0)
  const changed = Boolean(costs) && (!release || Object.keys(SOLAR_COST_DEFAULTS).some(key => Number(costs[key]) !== Number(release.costs?.[key] ?? SOLAR_COST_DEFAULTS[key])))
  const invalidCosts = Boolean(costs) && Object.keys(SOLAR_COST_DEFAULTS).some(key => costs[key] === '' || !Number.isFinite(Number(costs[key])) || Number(costs[key]) < 0)
  const longestMember = Math.max(0, ...(draftEstimate?.members || []).map(member => member.cutLengthM))
  function updateRun(id, field, value) {
    setRuns(current => current.map(run => {
      if (run.id !== id) return run
      const next = { ...run, [field]: Number(value) }
      if (field === 'parkingCount') next.width = getAtlasSolarCarportWidth(next.parkingCount)
      next.moduleCount = getAtlasSolarCarportPanelCount(next.width, next.length)
      return next
    }))
  }
  function addRun() {
    setRuns(current => [...current, placeAtlasSolarCarportRun(current, makeRun(`run-${Date.now()}`))])
  }
  return <main className="space-y-6 px-3 py-4 text-slate-900 sm:px-6 sm:py-6">
    <AtlasModuleHero eyebrow="Solar carport pricing control" title="Configure and price the Atlas solar carport." description="Review the same parking-run geometry and released structure-only guide used by the 3D builder, then inspect its material schedule and controlled rates." status={release ? `Published revision ${release.revision}` : 'Initial pricing setup'} actionHref="/tools/solar-carport-estimator" actionLabel="Open website builder" />
    <nav aria-label="Solar pricing sections" className="sticky top-3 z-20 flex flex-wrap gap-1 border border-slate-200 bg-white/95 p-2 shadow-sm backdrop-blur">{[['configuration','1. Configure'],['client-price','2. Client guide'],['schedule','3. Schedule'],['pricing-inputs','4. Pricing inputs']].map(([id,label]) => <a key={id} href={`#${id}`} className="rounded-full px-3 py-2 text-xs font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-700">{label}</a>)}</nav>
    {message && <p role="status" className="border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">{message}</p>}
    {costs && <>
      <section id="configuration" className="scroll-mt-24 border border-blue-200 bg-[#f5f9ff] p-5">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-blue-100 pb-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">Step 1 · Live configuration</p><h2 className="mt-1 text-xl font-bold">Build the parking layout to review.</h2><p className="mt-1 text-sm text-slate-600">The public builder’s parking widths, row types and multi-run pricing apply here.</p></div><button type="button" onClick={addRun} className="bg-[#0043f3] px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700">+ Add run</button></div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">{runs.map((run,index) => <div key={run.id} className="border border-blue-100 bg-white p-4"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase text-blue-700">Run {String.fromCharCode(65+index)}</p><p className="mt-1 text-sm font-semibold">{run.parkingCount*(run.length===12?2:1)} spaces · {run.moduleCount} panels</p></div>{runs.length>1 && <button type="button" onClick={() => setRuns(current => current.filter(item => item.id!==run.id))} className="rounded px-2 py-1 text-xs font-bold text-rose-700 hover:bg-rose-50">Remove</button>}</div><div className="mt-4 grid grid-cols-2 gap-3"><label className="text-xs font-bold text-slate-600">Spaces per side<select value={run.parkingCount} onChange={event => updateRun(run.id,'parkingCount',event.target.value)} className={inputClass}>{ATLAS_SOLAR_CARPORT_PARKING_COUNTS.map(count => <option key={count} value={count}>{count} · {getAtlasSolarCarportWidth(count)}m</option>)}</select></label><label className="text-xs font-bold text-slate-600">Row type<select value={run.length} onChange={event => updateRun(run.id,'length',event.target.value)} className={inputClass}><option value={6}>Single-sided · 6m</option><option value={12}>Double-sided · 12m</option></select></label></div></div>)}</div>
        <div className="mt-4 grid gap-px border border-blue-100 bg-blue-100 sm:grid-cols-2 lg:grid-cols-5">{[['Parking runs',runs.length],['Parking spaces',totalSpaces],['Panel interfaces',draftEstimate.totals.totalModules],['Planning envelope',`${layout.width}m × ${layout.depth}m`],['Structural steel',`${draftEstimate.totals.steelKg.toFixed(1)}kg`]].map(([label,value]) => <div key={label} className="bg-white p-3"><p className="text-[10px] font-bold uppercase text-slate-500">{label}</p><p className="mt-1 text-lg font-bold">{value}</p></div>)}</div>
        {runs.length>1 && <p className="mt-3 text-xs text-slate-600">The planning envelope assumes at least 7.5m between runs. Confirm actual positions and vehicle access against the site plan.</p>}
      </section>
      <section id="client-price" className="scroll-mt-24 border border-[#0043f3] bg-[#001d2e] text-white shadow-lg"><div className="grid gap-px bg-white/15 lg:grid-cols-[1.4fr_repeat(3,0.6fr)]"><div className="bg-gradient-to-br from-[#001d2e] to-[#0043f3] p-6"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-100">Step 2 · Published client guide</p><p className="mt-3 text-4xl font-bold">{releasedEstimate?money(releasedEstimate.pricing.estimatedTotal):'Not published'}</p><p className="mt-2 text-xs text-white/75">Structure-only · excl. VAT · {runs.length} run{runs.length===1?'':'s'} · {totalSpaces} spaces</p></div>{[['Steel mass',`${draftEstimate.totals.steelKg.toFixed(1)}kg`],['Base cost',releasedEstimate?money(releasedEstimate.pricing.baseTotal):'—'],['Commercial uplift',release?`${release.costs.upliftPercent}%`:'—']].map(([label,value]) => <div key={label} className="bg-[#001d2e] p-6"><p className="text-[10px] font-bold uppercase text-white/50">{label}</p><p className="mt-2 text-lg font-bold">{value}</p></div>)}</div>{changed && <p className="border-t border-white/20 p-4 text-sm">Unpublished draft for this layout: <strong>{money(draftEstimate.pricing.estimatedTotal)} excl. VAT</strong>. The website and CRM continue using the published price until you save a revision.</p>}</section>
      <section id="schedule" className="scroll-mt-24 border border-slate-200 bg-white shadow-sm"><div className="border-b p-5"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">Step 3 · Configuration check</p><h2 className="mt-1 text-xl font-bold">Material and connection schedule</h2><p className="mt-1 text-sm text-slate-600">Calculated for every selected run. Longest member: {longestMember.toFixed(3)}m.</p></div><details className="group"><summary className="cursor-pointer p-5 text-sm font-bold">Steel members · {draftEstimate.members.length} lines</summary><div className="overflow-x-auto border-t"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr>{['Run','Member','Profile','Qty','Cut length','Mass'].map(label=><th key={label} className="p-3">{label}</th>)}</tr></thead><tbody>{draftEstimate.members.map((item,index)=><tr key={`${item.run}-${item.code}-${index}`} className="border-t"><td className="p-3">{String.fromCharCode(64+item.run)}</td><td className="p-3 font-semibold">{item.label}</td><td className="p-3">{item.profile.section}</td><td className="p-3">{item.quantity}</td><td className="p-3">{item.cutLengthM.toFixed(3)}m</td><td className="p-3">{item.totalMassKg.toFixed(1)}kg</td></tr>)}</tbody></table></div></details><details className="group border-t"><summary className="cursor-pointer p-5 text-sm font-bold">Brackets, anchors and fixings · {draftEstimate.connections.length} lines</summary><div className="grid gap-2 border-t p-4 md:grid-cols-2">{draftEstimate.connections.map((item,index)=><div key={`${item.run}-${item.code}-${index}`} className="border p-3"><p className="text-xs font-bold text-blue-700">Run {String.fromCharCode(64+item.run)} · {item.code}</p><p className="mt-1 font-semibold">{item.label} · {item.quantity}</p><p className="mt-1 text-xs text-slate-500">{item.basis}</p></div>)}</div></details><details className="group border-t"><summary className="cursor-pointer p-5 text-sm font-bold">Priced line items · draft rates</summary><div className="overflow-x-auto border-t"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr>{['Code','Item','Qty','Rate','Total'].map(label=><th key={label} className="p-3">{label}</th>)}</tr></thead><tbody>{draftEstimate.lineItems.map((item,index)=><tr key={`${item.code}-${index}`} className="border-t"><td className="p-3 font-mono text-xs text-blue-700">{item.code}</td><td className="p-3">{item.label}</td><td className="p-3">{item.quantity} {item.unit}</td><td className="p-3">{money(item.unitRate)}</td><td className="p-3 font-bold">{money(item.total)}</td></tr>)}</tbody></table></div></details></section>
      <section id="pricing-inputs" className="scroll-mt-24 border border-slate-200 bg-white p-5 shadow-sm"><div className="border-b pb-5"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">Step 4 · Controlled pricing inputs</p><h2 className="mt-1 text-xl font-bold">Review rates before publishing.</h2><p className="mt-1 text-sm text-slate-600">Changes stay in this draft until a new revision is published. Connection and fabrication allowances remain provisional.</p></div><div className="mt-5 grid gap-4 xl:grid-cols-3">{GROUPS.map(group=><div key={group.title} className="border bg-slate-50 p-4"><h3 className="font-bold">{group.title}</h3><div className="mt-4 space-y-4">{group.keys.map(key=><label key={key} className="block text-xs font-bold text-slate-600">{SOLAR_COST_LABELS[key]}<input type="number" min="0" step="0.01" value={costs[key]} onChange={event=>{setCosts(current=>({...current,[key]:event.target.value===''?'':Number(event.target.value)}));setMessage('')}} className={inputClass}/></label>)}</div></div>)}</div><div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-5"><p className="text-xs text-slate-500">{changed?'Unpublished changes':'Rates match the published revision'} · Website and CRM share the released pricing engine.</p><button type="button" disabled={saving||!changed||invalidCosts} onClick={save} className="bg-[#0043f3] px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">{saving?'Publishing…':'Publish pricing revision'}</button></div></section>
      <p className="text-xs leading-5 text-slate-500">Connection quantities and rates remain provisional until bracket drawings, bolt specifications and foundation anchors are approved. Nominal member lengths require manufacturing review.</p>
    </>}
  </main>
}
