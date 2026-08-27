import Link from "next/link"
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
      <h1 className="mt-5 max-w-4xl text-4xl font-bold leading-tight md:text-6xl">Atlas warehouse costs by size</h1>
      <p className="mt-6 max-w-3xl text-lg leading-8 text-white/75">Start with the footprint you are researching. Every guide maps that target to a practical 4m Atlas module and uses the current released pricing model.</p>
      <Link href="/warehouse-builder" className="mt-8 inline-flex bg-white px-6 py-3 font-bold text-[#0043f3]">Build and price an Atlas warehouse →</Link>
    </section>
    <section className="mx-auto max-w-7xl px-5 py-16 md:px-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pages.map((page) => { const recommended = page.atlasOptions[page.recommendedIndex]; return <Link key={page.slug} href={page.path} className="border border-[#cad8e2] bg-white p-6 transition hover:-translate-y-1 hover:border-[#0043f3] hover:shadow-lg"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0043f3]">Target footprint</p><h2 className="mt-3 text-2xl font-bold">{page.displaySize}</h2><p className="mt-2 text-sm text-[#62748c]">Closest Atlas module: {recommended.width}m x {recommended.length}m · {recommended.productCode}</p><p className="mt-6 text-sm font-bold text-[#001d2e]">View current Atlas pricing →</p></Link> })}
      </div>
    </section>
  </main>
}
