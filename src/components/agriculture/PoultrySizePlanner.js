'use client'

import { useId, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Bird, Egg, House, Check, Ruler } from 'lucide-react'
import { estimateBroilerSpace } from '../../lib/poultrySizing.mjs'
import { ATLAS_WAREHOUSE_WIDTH_OPTIONS } from '../../lib/estimates/atlasWarehouseOptions.js'

export default function PoultrySizePlanner() {
  const id = useId()
  const [system, setSystem] = useState('')
  const [birds, setBirds] = useState('5000')
  const [width, setWidth] = useState(10)
  const sliderValue = Math.min(15000, Math.max(100, Number(birds) || 100))
  const sliderProgress = (sliderValue - 100) / 14900 * 100
  const flock = estimateBroilerSpace(birds, width)
  const estimate = system === 'broiler' ? flock : null
  const layerReference = system === 'layer' ? flock : null
  function carryBrief() {
    const projectNeed = system === 'layer' ? 'Layer poultry house' : 'Broiler poultry house'
    if (!system) return
    window.dispatchEvent(new CustomEvent('poultry-planner-brief', {
      detail: { projectNeed, birds: flock ? birds : '', housing: 'Housing system to be confirmed', production: system === 'layer' ? 'Eggs' : 'Meat' },
    }))
  }
  const footprint = (estimate || layerReference)?.footprint
  const field = 'mt-2 block w-full rounded-xl border border-[#dce6ed] bg-white p-3 text-base focus:outline-none focus:ring-2 focus:ring-[#0043f3]'
  const choiceStyle = selected => `relative flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-colors focus-within:ring-2 focus-within:ring-[#0043f3] ${selected ? 'border-[#0043f3] bg-[#edf3ff] text-[#003047]' : 'border-[#dce6ed] bg-white hover:border-[#90aabe]'}`
  return <div className="mt-7 overflow-hidden rounded-3xl border border-[#dce6ed] bg-[#f3f7fa] text-[#002333]">
    <div className="border-b border-[#dce6ed] px-5 py-5 sm:px-7">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0043f3]">Your flock. Your starting point.</p>
      <h3 className="mt-2 text-2xl font-bold sm:text-3xl">Make room for your poultry plans</h3>
      <p className="mt-2 text-sm leading-6 text-[#526a78]">Choose how you farm, set your flock size and explore the space you may need.</p>
    </div>
    <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-2">
    <div>
      
      <fieldset className="mt-5">
        <legend className="text-sm font-semibold">01 · What are you producing?</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {[['broiler', 'Meat', 'Broiler production', Bird], ['layer', 'Eggs', 'Layer production', Egg]].map(([value, label, description, Icon]) =>
            <label key={value} className={choiceStyle(system === value)}>
              <input type="radio" name={id} value={value} checked={system === value} onChange={() => setSystem(value)} className="sr-only" />
              <Icon aria-hidden="true" className="h-7 w-7 shrink-0 text-[#0043f3]" />
              <span className="flex-1"><span className="block font-bold">{label}</span><span className="text-xs text-[#526a78]">{description}</span></span>
              {system === value && <Check aria-hidden="true" className="h-4 w-4 text-[#0043f3]" />}
            </label>
          )}
        </div>
      </fieldset>
      {system && <>
        <label className="mt-4 block text-sm font-semibold">02 · Birds housed at one time<input className={field} type="number" min="1" max="10000000" step="1" value={birds} onChange={event => setBirds(event.target.value)} /></label>
        <div className="mt-3">
          <div aria-hidden="true" className="relative mx-3 h-7">
            <span className="absolute -translate-x-1/2 text-xl" style={{ left: `${sliderProgress}%` }}>🐔</span>
          </div>
          <input aria-label="Explore flock sizes" className="w-full accent-[#0043f3]" type="range" min="100" max="15000" step="100" value={sliderValue} onChange={event => setBirds(event.target.value)} />
        </div>
        <div className="mt-1 flex justify-between text-xs text-[#526a78]"><span>100 birds</span><span>15,000 birds</span></div>
        <div className="mt-3 flex flex-wrap gap-2">{[500, 1000, 5000, 10000].map(count => <button key={count} type="button" aria-pressed={Number(birds) === count} onClick={() => setBirds(String(count))} className={`rounded-full border px-3 py-2 text-xs font-semibold ${Number(birds) === count ? 'border-[#0043f3] bg-[#0043f3] text-white' : 'border-[#dce6ed] bg-white text-[#526a78]'}`}>{count.toLocaleString('en-ZA')}</button>)}</div>
        <p className="mt-2 text-xs text-[#526a78]">Slide to explore, or type your exact flock size above.</p>
        {system && <label className="mt-4 block text-sm font-semibold">Explore an Atlas span<select className={field} value={width} onChange={event => setWidth(Number(event.target.value))}>{ATLAS_WAREHOUSE_WIDTH_OPTIONS.map(span => <option key={span} value={span}>{span} m</option>)}</select></label>}
      </>}
    </div>
    <div className="flex flex-col rounded-2xl border border-[#dce6ed] bg-white p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-2 border-b border-[#e8eef3] pb-4 text-xs font-bold uppercase tracking-widest text-[#526a78]"><Ruler aria-hidden="true" className="h-4 w-4" /> Your space guide <span className="ml-auto rounded-full bg-[#f3f7fa] px-2 py-1 text-[10px] tracking-normal">Indicative</span></div>
      <div aria-live="polite" className="flex-1">
        {estimate ? <>
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm">Estimated usable bird floor area</p>
            <p className="mt-1 text-2xl font-bold">{estimate.usable.toLocaleString('en-ZA')} m²</p>
            <p className="mt-1 text-xs">At 10 birds/m² · planning assumption</p>
          </div>
          {footprint ? <div className="mt-4 rounded-xl border border-[#dce6ed] p-4">
            <p className="text-sm text-[#526a78]">Suggested poultry building</p>
            <p className="mt-1 text-2xl font-bold">{footprint.width} m × {footprint.length} m</p>
            <p className="mt-1 text-sm text-[#526a78]">{footprint.area.toLocaleString('en-ZA')} m² gross building area</p>
            <p className="mt-2 text-xs text-[#526a78]">Based on the Atlas steel structure system.</p>
          </div> : <p className="mt-3 text-sm">No standard length fits this estimate at the selected span. Try another span or discuss a custom layout.</p>}
          <p className="mt-3 text-xs leading-5 text-[#526a78]">Uses 10 birds/m² for budgeting. The shell adds a 10% planning allowance before rounding up to a standard bay length. Confirm usable area, finishing weight, equipment and ventilation with your poultry team.</p>
          <a className="mt-2 inline-block text-xs font-semibold text-[#0043f3] underline" href="https://www.kzndard.gov.za/images/Documents/RESOURCE_CENTRE/fact-sheets-brochures-and-leaflets/BROCHURES/Broilers_English_.pdf">KZN broiler planning guide</a>
        </> : layerReference ? <>
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 rounded-xl border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm">Indoor usable floor area</p>
              <p className="mt-1 text-2xl font-bold">{layerReference.usable.toLocaleString('en-ZA')} m²</p>
              <p className="mt-1 text-xs">At 10 adult hens/m² · floor-housed reference</p>
            </div>

          </div>
          {footprint ? <div className="mt-4 rounded-xl border border-[#dce6ed] p-4">
            <p className="text-sm text-[#526a78]">Suggested poultry building</p>
            <p className="mt-1 text-2xl font-bold">{footprint.width} m × {footprint.length} m</p>
            <p className="mt-1 text-sm text-[#526a78]">{footprint.area.toLocaleString('en-ZA')} m² gross building area</p>
            <p className="mt-2 text-xs text-[#526a78]">Based on the Atlas steel structure system.</p>
          </div> : <p className="mt-3 text-sm">No standard length fits this estimate at the selected span. Try another span or discuss a custom layout.</p>}
          <p className="mt-3 text-xs leading-5 text-[#526a78]">A starting point for floor-housed layers at 10 adult hens/m². We add a provisional 10% space allowance and round up to a standard bay length. Confirm equipment, nests, service areas and ventilation before finalising the building size; cage and aviary layouts need separate assessment.</p>
          <a className="mt-2 inline-block text-xs font-semibold text-[#0043f3] underline" href="https://www.sapoultry.co.za/wp-content/uploads/2022/06/2022-SAPA-COP.pdf">SAPA 2022 Code of Practice, appendices 7 and 8</a>
        </> : <div className="flex min-h-52 flex-col items-center justify-center rounded-xl bg-[#f5f8fa] px-5 py-8 text-center"><House aria-hidden="true" className="mb-4 h-12 w-12 text-[#b3c6d2]" /><p className="text-sm leading-7 text-[#526a78]">
          {!system ? 'Choose meat or eggs to explore your indoor space.' : 'Enter a whole number of birds to continue.'}
        </p></div>}
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        {footprint && <Link className="rounded-xl bg-[#0043f3] px-4 py-3 text-sm font-semibold text-white" href={`/warehouse-builder?productType=Atlas+Warehouse&width=${footprint.width}&length=${footprint.length}&sheeting=roof_only`}>Explore this building in 3D <ArrowRight aria-hidden="true" className="ml-2 inline h-4 w-4" /></Link>}
        <a className="rounded-xl border border-[#dce6ed] px-4 py-3 text-sm font-semibold text-[#0043f3]" href="#agricultural-quote" onClick={carryBrief}>Discuss my poultry project</a>
      </div>
    </div>
    </div>
  </div>
}
