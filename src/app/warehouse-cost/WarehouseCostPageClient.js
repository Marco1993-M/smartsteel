"use client"

import Link from "next/link"
import { useState } from "react"
import { getWarehouseCostPageConfig, getWarehouseCostSlugs } from "./warehouseCostData"

const widths = [8, 10, 12]
const lengths = Array.from({ length: 19 }, (_, index) => 5 + index * 2.5)
const availablePages = new Map(getWarehouseCostSlugs().map((slug) => getWarehouseCostPageConfig(slug)).filter(Boolean).map((config) => [`${config.length}x${config.width}`, config]))

function buildSchemas(config) {
  return [
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.smartsteel.co.za" },
      { "@type": "ListItem", position: 2, name: "Warehouse cost guides", item: "https://www.smartsteel.co.za/warehouse-cost" },
      { "@type": "ListItem", position: 3, name: `${config.displaySize} Atlas warehouse cost`, item: config.fullUrl },
    ] },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: config.faqs.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
  ]
}

export default function WarehouseCostPageClient({ slug }) {
  const config = getWarehouseCostPageConfig(slug)
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(config?.recommendedIndex ?? 0)
  const [selectedFinish, setSelectedFinish] = useState("ZAM")
  const [selectedWidth, setSelectedWidth] = useState(config?.width ?? 8)
  const [openFaqIndex, setOpenFaqIndex] = useState(0)
  if (!config) return null
  const selectedOption = config.atlasOptions[selectedOptionIndex] ?? config.atlasOptions[0]
  const nearbyLengths = lengths
    .filter((length) => Math.abs(length - config.length) <= 10)
    .slice(0, 9)

  return <main className="overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#ffffff_7rem,#f4f8fb_15rem,#f4f8fb_100%)] pt-24 text-[#001d2e] sm:pt-28">
    {buildSchemas(config).map((schema, index) => <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}

    <section className="relative mx-auto w-[calc(100%-2rem)] max-w-[1500px] overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#001d2e] via-[#07377d] to-[#0043f3] px-6 py-10 text-white shadow-[0_20px_60px_rgba(0,29,46,0.16)] md:px-12 md:py-14">
      <div className="absolute -right-16 top-0 h-full w-2/5 skew-x-[-38deg] bg-white/10" />
      <div className="relative z-10 grid items-end gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-[#c1d9e5]"><span className="grid h-9 w-9 place-items-center rounded-lg bg-white text-xl font-black text-[#001d2e]">Λ</span>Atlas System · Developed by Smart Steel</div>
          <p className="mt-8 text-xs font-bold uppercase tracking-[0.24em] text-[#c1d9e5]">Warehouse cost guide · South Africa</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-[1.05] md:text-6xl">{config.displaySize} Atlas warehouse cost</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/80">{config.exactModule ? `Compare current supply-only pricing for this standard ${selectedOption.productCode} Atlas configuration.` : "Planning this footprint? Atlas uses 4m modular bays, so we compare the closest practical standard configurations without hiding the difference."}</p>
        </div>
        <div className="border-l border-white/20 lg:pl-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c1d9e5]">Current starting guide</p>
          <p className="mt-3 text-4xl font-bold">{selectedOption.prices.ZAM.structure_only.label}</p>
          <p className="mt-2 text-sm text-white/70">{selectedOption.width}m x {selectedOption.length}m x {selectedOption.wallHeight}m · ZAM · structure only · excl. VAT</p>
          <a href="#atlas-pricing" className="mt-6 inline-flex bg-white px-6 py-3 font-bold text-[#0043f3] transition hover:bg-[#c1d9e5]">Compare Atlas options ↓</a>
        </div>
      </div>
    </section>

    <section id="atlas-pricing" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-14 md:px-8 md:py-16">
      <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
        <aside className="border border-[#c9d9e5] bg-white p-6 shadow-[0_14px_45px_rgba(0,29,46,0.07)] md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0043f3]">Step 1 · Practical size</p><h2 className="mt-4 text-3xl font-bold">Choose the closest Atlas module</h2><p className="mt-4 leading-7 text-[#4c607a]">Your search stays intact. The price uses a buildable 4m-bay Atlas configuration.</p>
          <div className="mt-7 grid gap-3">{config.atlasOptions.map((option, index) => <button key={option.length} onClick={() => setSelectedOptionIndex(index)} className={`border p-5 text-left transition ${selectedOptionIndex === index ? "border-[#0043f3] bg-[#eaf2ff]" : "border-[#d9e3eb] hover:border-[#0043f3]"}`}><span className="flex items-center justify-between gap-3"><strong>{option.width}m x {option.length}m</strong>{index === config.recommendedIndex && <span className="bg-[#0043f3] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">Closest fit</span>}</span><span className="mt-2 block text-sm text-[#62748c]">{option.areaLabel} · {option.productCode} · {option.wallHeight}m eave</span></button>)}</div>
          <div className="mt-8 border-t border-[#d9e3eb] pt-7"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0043f3]">Step 2 · Steel finish</p><div className="mt-4 flex flex-wrap gap-2">{config.finishes.map((finish) => <button key={finish} onClick={() => setSelectedFinish(finish)} className={`px-4 py-2 text-sm font-bold ${selectedFinish === finish ? "bg-[#001d2e] text-white" : "bg-[#edf3f7] text-[#31445e]"}`}>{finish}</button>)}</div><p className="mt-4 text-sm leading-6 text-[#62748c]">ZAM is our corrosion-resistant standard. Galvanised and mild steel are available for appropriate project conditions.</p></div>
        </aside>

        <div>
          <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0043f3]">Live Atlas pricing</p><h2 className="mt-3 text-3xl font-bold md:text-4xl">Select how much of the building you need</h2></div><p className="text-sm font-semibold text-[#62748c]">Supply only · excl. VAT</p></div>
          <div className="mt-7 grid gap-4 md:grid-cols-3">{config.scopes.map((scope, index) => { const price = selectedOption.prices[selectedFinish][scope.key]; return <article key={scope.key} className={`grid min-h-[390px] grid-rows-[32px_64px_88px_72px_24px_auto] border bg-white p-6 shadow-[0_12px_36px_rgba(0,29,46,0.05)] ${index === 0 ? "border-[#0043f3]" : "border-[#d9e3eb]"}`}><span className={`${index === 0 ? "visible" : "invisible"} self-start justify-self-start bg-[#0043f3] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white`}>Starting point</span><h3 className="flex items-start pt-4 text-xl font-bold leading-7">{scope.label}</h3><p className="pt-3 text-sm leading-6 text-[#62748c]">{scope.description}</p><p className="flex items-end text-3xl font-bold">{price.label}</p><p className="text-xs font-bold uppercase tracking-wider text-[#93a5bb]">Excluding VAT</p><Link href={price.url} className="group mt-4 flex min-h-12 items-center justify-between gap-4 self-end border border-[#001d2e] bg-[#001d2e] px-4 py-3 text-sm font-bold text-white transition hover:border-[#0043f3] hover:bg-[#0043f3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0043f3]"><span>Build this option</span><span aria-hidden="true" className="text-lg transition-transform group-hover:translate-x-1">→</span></Link></article> })}</div>
          <div className="mt-5 border border-[#bfd3e0] bg-[#e6f0f5] p-5 text-sm leading-6 text-[#31445e]">These are current Atlas supply-only budget guides. Delivery and installation are reviewed separately after we understand your location, access and site conditions.</div>
        </div>
      </div>
    </section>

    <section className="bg-white py-16"><div className="mx-auto grid max-w-7xl gap-10 px-5 md:px-8 lg:grid-cols-2"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0043f3]">What you are comparing</p><h2 className="mt-4 text-3xl font-bold">A modular warehouse, priced from its actual configuration</h2><p className="mt-5 text-lg leading-8 text-[#4c607a]">Atlas is a bolted lip channel warehouse system built in 4m bays. The guide changes with the selected span, production length, eave height, steel finish and sheeting scope rather than relying on a generic rate per square metre.</p></div><div className="grid gap-px bg-[#d9e3eb] sm:grid-cols-2">{[["System", `Atlas ${selectedOption.productCode}`], ["Module", "4m bays"], ["Standard eave", `${selectedOption.wallHeight}m`], ["Roof pitch", "15° dual pitch"], ["Delivery", "Quoted separately"], ["Installation", "Reviewed after enquiry"]].map(([label, value]) => <div key={label} className="bg-[#f4f8fb] p-5"><p className="text-xs font-bold uppercase tracking-wider text-[#879bb2]">{label}</p><p className="mt-2 font-bold">{value}</p></div>)}</div></div></section>

    <section className="mx-auto max-w-7xl px-5 py-16 md:px-8"><div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0043f3]">Buyer guidance</p><h2 className="mt-4 text-3xl font-bold">What changes the final project cost?</h2><p className="mt-4 leading-7 text-[#62748c]">The structure guide stays transparent. These project-specific items are reviewed before the final quote.</p></div><div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{[["Site and delivery", "Distance, unloading access and site conditions are assessed before transport is priced."], ["Installation scope", "Erection requirements depend on access, ground conditions, height and the final building scope."], ["Openings and finishes", "Doors, openings, flashing details, sheeting profile and colour are confirmed during project review."], ["Foundations and slab", "Concrete, foundations and ground preparation are not assumed in this supply-only structure guide."]].map(([title, body]) => <div key={title} className="border-t-2 border-[#0043f3] bg-white p-6"><h3 className="text-lg font-bold">{title}</h3><p className="mt-3 leading-7 text-[#62748c]">{body}</p></div>)}</div></section>

    <section className="bg-[#e6f0f5] py-14"><div className="mx-auto max-w-7xl px-5 md:px-8"><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0043f3]">Nearby guides</p><h2 className="mt-3 text-3xl font-bold">Compare another target size</h2></div><Link href="/warehouse-cost" className="text-sm font-bold text-[#0043f3]">View every size →</Link></div><div className="mt-7 flex flex-wrap gap-2">{widths.map((width) => <button key={width} onClick={() => setSelectedWidth(width)} className={`px-5 py-3 text-sm font-bold ${selectedWidth === width ? "bg-[#001d2e] text-white" : "bg-white text-[#31445e]"}`}>{width}m wide</button>)}</div><div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3">{nearbyLengths.map((length) => { const page = availablePages.get(`${length}x${selectedWidth}`); return <Link key={length} href={page.path} className="border border-[#cad8e2] bg-white p-4 transition hover:border-[#0043f3]"><strong>{length}m x {selectedWidth}m</strong><span className="mt-2 block text-sm text-[#62748c]">View Atlas cost guide →</span></Link> })}</div></div></section>

    <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:px-8 lg:grid-cols-[0.7fr_1.3fr]"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0043f3]">Questions answered</p><h2 className="mt-4 text-3xl font-bold">Atlas warehouse cost FAQs</h2></div><div className="space-y-3">{config.faqs.map(({ q, a }, index) => <div key={q} className="border border-[#d9e3eb] bg-white"><button onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)} className="flex w-full items-center justify-between gap-4 p-5 text-left font-bold"><span>{q}</span><span className="text-2xl text-[#0043f3]">{openFaqIndex === index ? "−" : "+"}</span></button>{openFaqIndex === index && <p className="px-5 pb-6 leading-7 text-[#62748c]">{a}</p>}</div>)}</div></section>

    <section className="bg-gradient-to-r from-[#001d2e] to-[#0043f3] px-5 py-16 text-center text-white"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c1d9e5]">Move from research to a real configuration</p><h2 className="mx-auto mt-4 max-w-3xl text-3xl font-bold md:text-5xl">Build and price your Atlas warehouse</h2><p className="mx-auto mt-5 max-w-2xl leading-7 text-white/75">Start with the closest module, then adjust the structure, steel finish and sheeting before requesting a reviewed quote.</p><Link href={selectedOption.prices[selectedFinish].structure_only.url} className="mt-8 inline-flex bg-white px-7 py-4 font-bold text-[#0043f3]">Open the 3D builder →</Link></section>
  </main>
}
