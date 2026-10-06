import Link from "../../components/BuilderEntryLink"
import { getWarehouseCostPageConfig, getWarehouseCostSlugs } from "./warehouseCostData"

export const metadata = {
  title: "Atlas Warehouse Cost South Africa | Size & Price Guides",
  description: "Compare current Atlas warehouse prices by target footprint, standard 4m module, steel finish and sheeting scope. Supply-only guides excluding VAT.",
  alternates: { canonical: "/warehouse-cost" },
  openGraph: { title: "Atlas Warehouse Cost South Africa", description: "Current modular Atlas warehouse cost guides by size.", url: "https://www.smartsteel.co.za/warehouse-cost", images: ["/og-warehouse.jpg"] },
}

export default function WarehouseCostHubPage() {
  const pages = getWarehouseCostSlugs().map((slug) => getWarehouseCostPageConfig(slug)).filter(Boolean).sort((a, b) => a.searchedArea - b.searchedArea)
  return <main className="min-h-screen bg-[linear-gradient(180deg,#ffffff_0%,#ffffff_7rem,#f4f8fb_15rem,#f4f8fb_100%)] pt-24 text-[#001d2e] sm:pt-28">
    <section className="mx-auto w-[calc(100%-2rem)] max-w-[1500px] overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#001d2e] via-[#07377d] to-[#0043f3] px-6 py-14 text-white shadow-[0_20px_60px_rgba(0,29,46,0.16)] md:px-12 md:py-20">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#c1d9e5]">Atlas System · Developed by Smart Steel</p>
      <h1 className="mt-5 max-w-4xl text-4xl font-bold leading-tight md:text-6xl">Steel warehouse costs in South Africa</h1>
      <p className="mt-6 max-w-3xl text-lg leading-8 text-white/75">Compare Atlas steel warehouse prices by size, steel finish and sheeting scope. Start with your target footprint, see the closest standard 4m-bay configuration and continue your structure in the 3D builder. Supply-only guide prices exclude VAT.</p>
      <Link href="/warehouse-builder" className="mt-8 inline-flex bg-white px-6 py-3 font-bold text-[#0043f3]">Build and price an Atlas warehouse →</Link>
    </section>
    <section className="mx-auto max-w-7xl px-5 pt-14 md:px-8">
      <h2 className="text-3xl font-bold">How much does it cost to build a steel warehouse?</h2>
      <p className="mt-5 max-w-3xl leading-8 text-[#4c607a]">A steel supply price is one part of the building budget. Span, length, eave height, finish and sheeting change the structure price. Foundations, slab, site preparation, transport and erection depend on your location and project requirements. Compare equivalent scopes when reviewing quotations.</p>
      <div className="mt-8 grid gap-6 border-y border-[#cad8e2] py-8 md:grid-cols-3">
        {[
          ['Structure only', 'Compare the steel frame, purlins, bracing and connection hardware before adding sheeting.'],
          ['Roof and wall sheeting', 'Compare roof-only and roof-and-side-wall scopes. Check whether gable ends, openings and doors are included.'],
          ['Site and installation', 'Request a separate review of foundations, delivery, unloading access and erection. These are not assumed in the supply guide.'],
        ].map(([title, description]) => <div key={title}><h3 className="text-xl font-bold">{title}</h3><p className="mt-3 leading-7 text-[#4c607a]">{description}</p></div>)}
      </div>
      <h2 className="mt-12 text-3xl font-bold">Compare warehouse prices by target size</h2>
      <p className="mt-4 max-w-3xl leading-7 text-[#4c607a]">Atlas uses 4m length increments. A guide for a footprint such as 10m × 10m or 45m × 8m shows nearby standard lengths and their actual priced dimensions.</p>
    </section>
    <section className="mx-auto max-w-7xl px-5 py-10 md:px-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pages.map((page) => { const recommended = page.atlasOptions[page.recommendedIndex]; return <Link key={page.slug} href={page.path} className="border border-[#cad8e2] bg-white p-6 transition hover:-translate-y-1 hover:border-[#0043f3] hover:shadow-lg"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0043f3]">Target footprint</p><h2 className="mt-3 text-2xl font-bold">{page.displaySize}</h2><p className="mt-2 text-sm text-[#62748c]">Closest Atlas module: {recommended.width}m x {recommended.length}m · {recommended.productCode}</p><p className="mt-6 text-sm font-bold text-[#001d2e]">View current Atlas pricing →</p></Link> })}
      </div>
    </section>
    <section className="bg-[#001d2e] px-5 py-14 text-white">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-3xl font-bold">Explore your warehouse in 3D</h2>
        <p className="mt-4 max-w-2xl leading-7 text-white/80">Choose dimensions, steel finish and sheeting, see a supply-only guide price and send your configuration to Smart Steel for a reviewed quote.</p>
        <Link href="/warehouse-builder" className="mt-7 inline-flex min-h-12 items-center bg-[#0043f3] px-6 py-3 font-bold">Build and price my warehouse →</Link>
      </div>
    </section>
  </main>
}
