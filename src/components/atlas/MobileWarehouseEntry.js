import Link from '../BuilderEntryLink'
import BuilderSelect from '../warehouse-builder/BuilderSelect'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import { ATLAS_LENGTH_OPTIONS } from '../../lib/atlasConfiguration'
import { ATLAS_WAREHOUSE_WIDTH_OPTIONS } from '../../lib/estimates/atlasWarehouseOptions'

export default function MobileWarehouseEntry({ selectedWidth, selectedLength, selectedHeight, setSelectedWidth, setSelectedLength }) {
  const builderUrl = `/warehouse-builder?${new URLSearchParams({ productType: 'Atlas Warehouse', width: selectedWidth, length: selectedLength, height: selectedHeight })}`
  return <div className="sm:hidden">
        <div className="rounded-2xl border border-[#dce6ed] bg-[#f5f8fb] p-4 sm:p-6">
          <h2 className="text-base font-bold tracking-tight">Choose your starting size</h2>
          <fieldset className="mt-3">
            <legend className="text-xs font-medium text-[#526a78]">Width</legend>
            <div className="mt-2 grid grid-cols-5 gap-1.5">
              {ATLAS_WAREHOUSE_WIDTH_OPTIONS.map(option => <button type="button" key={option} aria-pressed={selectedWidth === option} onClick={() => setSelectedWidth(option)} className={`min-h-11 rounded-xl border text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0043f3] ${selectedWidth === option ? 'border-[#0043f3] bg-[#0043f3] text-white shadow-sm' : 'border-[#d7e1e9] bg-white text-[#001d2e] hover:border-[#0043f3]'}`}>{option}m</button>)}
            </div>
          </fieldset>
          <div className="mt-3 flex items-center gap-4">
            <label htmlFor="home-warehouse-length" className="text-xs font-medium text-[#526a78]">Length</label>
            <BuilderSelect id="home-warehouse-length" value={selectedLength} onChange={event => setSelectedLength(Number(event.target.value))} className="min-h-11 flex-1 rounded-xl border border-[#d7e1e9] bg-white px-3 py-2 text-sm font-semibold">
              {ATLAS_LENGTH_OPTIONS.map(option => <option key={option} value={option}>{option}m</option>)}
            </BuilderSelect>
          </div>
          <Link data-mobile-home-cta href={builderUrl} className="mt-4 flex min-h-12 items-center justify-center gap-3 rounded-xl bg-[#0043f3] px-3 py-3 text-sm font-bold text-white shadow-[0_6px_18px_-8px_#0043f3] transition hover:bg-[#0036c4]">See my warehouse price <ArrowRightIcon className="h-4 w-4" /></Link>
          <p className="mt-2.5 text-center text-[11px] leading-4 text-[#526a78]">No signup required. Adjust your design in 3D.</p>
        </div>
    <p className="mt-3 text-center text-[11px] leading-5 text-[#647b89]">Supply-only guide price, excl. VAT.<br />Delivery and installation quoted separately.</p>
  </div>
}
