"use client"
import Image from 'next/image'
import Link from '../BuilderEntryLink'
import MobileWarehouseEntry from './MobileWarehouseEntry'
import BuilderSelect from '../warehouse-builder/BuilderSelect'
import { useState } from 'react'
import { ArrowRightIcon, CheckIcon } from '@heroicons/react/24/outline'
import { ATLAS_LENGTH_OPTIONS } from '../../lib/atlasConfiguration'
import { ATLAS_WAREHOUSE_WIDTH_OPTIONS } from '../../lib/estimates/atlasWarehouseOptions'

export default function WarehouseHomeHero() {
  const [width, setWidth] = useState(8)
  const [length, setLength] = useState(20)
  const href = `/warehouse-builder?${new URLSearchParams({productType:'Atlas Warehouse',width,length,height:width >= 10 ? 4.5 : 3})}`
  return (
    <section className="text-[#001d2e] bg-gradient-to-b from-white to-[#edf4f8] px-5 pb-7 pt-24 sm:px-8 sm:pb-12 sm:pt-28 lg:pb-16 lg:pt-30">
      <div className="mx-auto grid max-w-7xl gap-4 sm:gap-7 lg:grid-cols-[1.12fr_0.88fr] lg:items-center lg:gap-16">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0043f3]">Atlas steel warehouses</p>
          <h1 className="mt-2 text-[30px] sm:mt-3 font-bold leading-[1.06] tracking-[-0.04em] sm:text-5xl xl:text-[56px]">Your steel warehouse.<br />Sized and priced.</h1>
          <p className="mt-3 max-w-lg text-[14px] leading-[22px] sm:mt-4 text-[#526a78] sm:text-base sm:leading-7">Choose a starting size for your farm or business in South Africa. Explore your design in 3D and see a supply-only guide price.</p>
          <figure className="relative mt-4 h-32 sm:mt-6 overflow-hidden rounded-2xl bg-[#edf4f8] sm:h-52 lg:h-56">
            <Image src="/atlas_warehouse_email.webp" alt="Bolted Atlas warehouse steelwork by Smart Steel" fill priority sizes="(min-width:1024px) 600px, 100vw" className="object-cover" />
            <figcaption className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 rounded-lg bg-white/95 px-3 py-1.5 text-[11px] font-semibold">Atlas steelwork · Smart Steel</figcaption>
          </figure>
        </div>
        <div>
          <MobileWarehouseEntry selectedWidth={width} selectedLength={length} selectedHeight={width >= 10 ? 4.5 : 3} setSelectedWidth={setWidth} setSelectedLength={setLength} />
          <div className="hidden sm:block rounded-3xl border border-[#dce6ed] bg-white p-5 shadow-[0_20px_60px_-35px_rgba(0,29,46,0.3)] sm:p-8">
            <Image src="/atlas/atlas-logo-horizontal-dark.png" alt="Atlas System developed by Smart Steel" width={210} height={64} className="mb-6 h-10 w-auto object-contain" />
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Choose your starting size</h2>
            <p className="mt-2 text-sm leading-6 text-[#647b89]">Start here. Fine-tune the details in the builder.</p>
            <fieldset className="mt-6"><legend className="text-sm font-semibold">Warehouse width</legend><div className="mt-2.5 grid grid-cols-5 gap-2">{ATLAS_WAREHOUSE_WIDTH_OPTIONS.map(option=><button key={option} type="button" aria-pressed={width===option} onClick={()=>setWidth(option)} className={`min-h-12 rounded-xl border text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0043f3] ${width===option?'border-[#0043f3] bg-[#0043f3] text-white':'border-[#dce6ed] bg-[#f8fafc] hover:border-[#0043f3]'}`}>{option}m</button>)}</div></fieldset>
            <label htmlFor="home-desktop-length" className="mb-2.5 mt-5 block text-sm font-semibold">Building length</label>
            <BuilderSelect id="home-desktop-length" value={length} onChange={event=>setLength(Number(event.target.value))} className="min-h-12 w-full rounded-xl border border-[#dce6ed] bg-[#f8fafc] px-4 py-3 text-sm font-semibold">{ATLAS_LENGTH_OPTIONS.map(option=><option key={option} value={option}>{option}m</option>)}</BuilderSelect>
            <Link data-desktop-home-cta href={href} className="mt-6 flex min-h-13 items-center justify-center gap-3 rounded-xl bg-[#0043f3] px-3 py-3.5 text-sm font-bold text-white shadow-[0_8px_22px_-12px_#0043f3] transition hover:bg-[#0036c4]">See my warehouse price <ArrowRightIcon className="h-4 w-4" /></Link>
            <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-[11px] text-[#526a78]">{['No signup required','Adjust your design in 3D'].map(text=><span key={text} className="inline-flex items-center gap-1"><CheckIcon className="h-3.5 w-3.5 text-[#0043f3]" />{text}</span>)}</div>
            <p className="mt-5 border-t border-[#e5edf2] pt-4 text-center text-[11px] leading-5 text-[#647b89]">Supply-only guide price, excl. VAT.<br />Delivery and installation quoted separately.</p>
          </div>
          <div className="mt-5 hidden sm:flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-semibold text-[#0043f3]"><Link href="/products">All Atlas products ↗</Link><Link href="/products/cflc-solar-carports">Solar carports ↗</Link></div>
        </div>
      </div>
    </section>
  )
}
