import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Sprout } from "lucide-react"
import { agriculturalCategories } from "./agriculturalStructureData"

export const metadata = {
  title: { absolute: "Agricultural Steel Buildings South Africa | Smart Steel" },
  description: "Explore Smart Steel agricultural structures for pig housing, poultry, dairy, livestock and farm storage projects across South Africa.",
  robots: { index: true, follow: true },
  alternates: { canonical: "https://www.smartsteel.co.za/agricultural-buildings" },
  openGraph: {
    title: "Agricultural Steel Buildings South Africa | Smart Steel",
    description: "Atlas structural building packages shaped around livestock housing, poultry, dairy and farm storage operations.",
    url: "https://www.smartsteel.co.za/agricultural-buildings",
    type: "website",
  },
}

export default function AgriculturalBuildingsPage() {
  return <main className="bg-white text-[#001d2e]">
    <section className="relative isolate min-h-[64vh] overflow-hidden border-b border-[#b8cdd7] bg-white text-[#001d2e]">
      <div className="relative mx-auto flex min-h-[64vh] max-w-[1500px] flex-col justify-between px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
        <div className="border-b border-[#b8cdd7] pb-5"><Image src="/atlas/atlas-logo-horizontal-dark.png" alt="Atlas System developed by Smart Steel" width={238} height={44} className="max-w-full" /></div>
        <div className="max-w-4xl py-12"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0043f3]">Atlas agricultural structures</p><h1 className="mt-5 text-4xl font-black leading-[1.02] sm:text-5xl lg:text-7xl">Steel building systems shaped around the farm operation</h1><p className="mt-6 max-w-2xl text-base leading-7 text-[#526c79] sm:text-lg">Atlas structural packages for livestock housing, poultry, dairy, storage and other agricultural infrastructure across South Africa.</p><Link href="/contact" className="mt-7 inline-flex min-h-12 items-center gap-2 bg-[#0043f3] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#001d2e]">Discuss an agricultural structure <ArrowRight className="h-4 w-4" /></Link></div>
        <p className="border-t border-[#b8cdd7] py-4 text-sm font-semibold text-[#264554]">Structural clarity first · Project-specific review before manufacture</p>
      </div>
    </section>
    <section className="mx-auto max-w-[1500px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24"><div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0043f3]">Category roadmap</p><h2 className="mt-4 text-3xl font-black sm:text-4xl">A common delivery system without generic farming claims</h2><p className="mt-4 text-base leading-7 text-[#526c79]">Every category follows the same Atlas page architecture, while its operational requirements, exclusions and professional responsibilities remain specific to the agricultural use.</p></div><div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{agriculturalCategories.map((item) => {
      const content = <><Sprout className="h-5 w-5 text-[#0043f3]" /><h3 className="mt-5 text-xl font-black">{item.title}</h3><p className="mt-3 text-sm leading-7 text-[#526c79]">{item.description}</p><span className="mt-7 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#0043f3]">{item.href ? "View structure page" : item.status}{item.href ? <ArrowRight className="h-4 w-4" /> : null}</span></>
      return item.href ? <Link key={item.title} href={item.href} className="border border-[#b8cdd7] p-6 transition hover:border-[#0043f3] hover:bg-[#f7fafb]">{content}</Link> : <article key={item.title} className="border border-[#b8cdd7] p-6">{content}</article>
    })}</div></section>
  </main>
}
