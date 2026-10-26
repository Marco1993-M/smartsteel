import { agriculturalSocialMetadata } from "../../lib/agriculturalSocialCards.mjs"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Beef, Bird, Boxes, Check, CircleDot, Milk, PiggyBank, Ruler, Warehouse, Wheat } from "lucide-react"
import AgriculturalQuoteForm from "../../components/agriculture/AgriculturalQuoteForm"
import { agriculturalCategories } from "./agriculturalStructureData"

const SITE_URL = "https://www.smartsteel.co.za"
const hubSocial = agriculturalSocialMetadata("agricultural-buildings", "Agricultural Steel Buildings South Africa | Atlas Smart Steel", "Atlas structural building packages shaped around livestock housing, poultry, dairy and farm storage operations.")

export const metadata = {
  title: { absolute: "Agricultural Steel Buildings South Africa | Atlas Smart Steel" },
  description: "Explore Atlas agricultural steel buildings for pig housing, poultry, dairy, livestock and farm storage. Find a starting configuration or request a project review.",
  keywords: ["agricultural steel buildings South Africa", "steel farm buildings", "livestock housing", "poultry house structure", "piggery buildings", "farm storage buildings"],
  robots: { index: true, follow: true },
  alternates: { canonical: `${SITE_URL}/agricultural-buildings` },
  openGraph: { title: "Agricultural Steel Buildings South Africa | Atlas Smart Steel", description: "Atlas structural building packages shaped around livestock housing, poultry, dairy and farm storage operations.", url: `${SITE_URL}/agricultural-buildings`, type: "website", images: hubSocial.images },
  twitter: hubSocial.twitter,
}

const categoryStyle = [
  { Icon: PiggyBank, background: "bg-[#e8efff]", icon: "text-[#0043f3]" },
  { Icon: Bird, background: "bg-[#fff4cc]", icon: "text-[#8a6400]" },
  { Icon: Milk, background: "bg-[#dff4ef]", icon: "text-[#08745f]" },
  { Icon: Beef, background: "bg-[#ffe9df]", icon: "text-[#a33b16]" },
  { Icon: CircleDot, background: "bg-[#f1edf8]", icon: "text-[#65449a]" },
  { Icon: Wheat, background: "bg-[#e8f4f7]", icon: "text-[#17667a]" },
]

const hubProjectOptions = ["Pig housing or piggery", "Poultry house", "Dairy or milking shed", "Cattle or feedlot shed", "Sheep or small-stock shed", "Farm storage or another structure"]
const hubBriefOptions = ["I am starting with an idea", "I know the required capacity or use", "I have a farm or production brief", "I have a preliminary layout", "I have professional drawings"]
const faqs = [
  { question: "Does Smart Steel design the farming operation?", answer: "Smart Steel defines and supplies the agreed Atlas structural building shell. Animal-production layouts, civils, drainage, equipment and specialist systems must be confirmed with the relevant agricultural and professional advisers." },
  { question: "Do I need drawings before making an enquiry?", answer: "No. A farm location, intended use, approximate capacity and preferred timing are enough to begin. More developed information helps the team reach a useful structural proposal sooner." },
  { question: "Can I see a budget before requesting a review?", answer: "Yes. Where a suitable Atlas starting configuration is available, the 3D warehouse builder can preload the width, length and height and produce a live supply-only budget guide." },
  { question: "Can Atlas buildings be supplied across South Africa?", answer: "Smart Steel reviews agricultural building enquiries nationally. Delivery and installation feasibility are confirmed from the site location, access, final scope and project programme." },
]

export default function AgriculturalBuildingsPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "CollectionPage", name: "Atlas agricultural steel buildings", description: metadata.description, url: `${SITE_URL}/agricultural-buildings`, inLanguage: "en-ZA" },
      { "@type": "Service", name: "Agricultural structural steel buildings", provider: { "@type": "Organization", name: "Smart Steel", url: SITE_URL }, areaServed: { "@type": "Country", name: "South Africa" }, serviceType: "Atlas agricultural structural building shells" },
      { "@type": "ItemList", itemListElement: agriculturalCategories.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.title, ...(item.href ? { url: `${SITE_URL}${item.href}` } : {}) })) },
      { "@type": "FAQPage", mainEntity: faqs.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) },
    ],
  }

  return <main className="bg-white pt-20 text-[#001d2e]">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

    <section className="border-b border-[#b8cdd7] bg-white">
      <div className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
        <div className="flex items-center justify-between gap-5 border-b border-[#b8cdd7] pb-5"><Image src="/atlas/atlas-logo-horizontal-dark.png" alt="Atlas System developed by Smart Steel" width={238} height={44} className="max-w-full" /><span className="hidden border border-[#b8cdd7] bg-[#edf5f8] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#264554] sm:block">Agricultural systems</span></div>
        <div className="grid gap-10 py-10 lg:grid-cols-[0.86fr_1.14fr] lg:items-center lg:py-14 xl:gap-16">
          <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0043f3]">Atlas for South African agriculture</p><h1 className="mt-5 max-w-3xl text-4xl font-black leading-[1.02] sm:text-5xl">Steel buildings shaped around the farm operation</h1><p className="mt-6 max-w-2xl text-base leading-8 text-[#526c79]">Start with the livestock, production or storage requirement. Smart Steel translates that brief into a practical Atlas structural shell, a clear scope and a route to budget.</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><a href="#agricultural-brief" className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#0043f3] px-6 text-sm font-black text-white transition hover:bg-[#001d2e]">Find the right starting point <ArrowRight className="h-4 w-4" /></a><Link href="/agricultural-buildings/20-sow-piggery" className="inline-flex min-h-12 items-center justify-center border border-[#001d2e] px-6 text-sm font-black transition hover:bg-[#edf5f8]">Explore the live piggery guide</Link></div></div>
          <div aria-label="Agricultural building categories" className="grid gap-2 sm:grid-cols-2">{agriculturalCategories.map((item, index) => {
            const { Icon, background, icon } = categoryStyle[index]
            const content = <><span className={`grid h-11 w-11 shrink-0 place-items-center ${background} ${icon}`}><Icon className="h-5 w-5" /></span><span className="min-w-0 flex-1"><span className="block text-sm font-black">{item.title}</span><span className="mt-1 block text-xs leading-5 text-[#526c79]">{item.description}</span></span><span className={`self-start text-[9px] font-bold uppercase tracking-[0.13em] ${item.href ? "text-[#0043f3]" : "text-[#8295a0]"}`}>{item.href ? "Live" : "Brief"}</span></>
            return item.href ? <Link key={item.title} href={item.href} className="flex min-h-[126px] gap-4 border border-[#b8cdd7] p-4 transition hover:border-[#0043f3] hover:bg-[#f7fafb]">{content}</Link> : <a key={item.title} href="#agricultural-brief" className="flex min-h-[126px] gap-4 border border-[#b8cdd7] p-4 transition hover:border-[#0043f3] hover:bg-[#f7fafb]">{content}</a>
          })}</div>
        </div>
        <div className="grid border-t border-[#b8cdd7] text-sm font-semibold text-[#264554] sm:grid-cols-3"><p className="py-4 sm:pr-5">Released Atlas structural families</p><p className="border-t border-[#b8cdd7] py-4 sm:border-l sm:border-t-0 sm:px-5">Project-specific agricultural review</p><p className="border-t border-[#b8cdd7] py-4 sm:border-l sm:border-t-0 sm:pl-5">Supply and delivery across South Africa</p></div>
      </div>
    </section>

    <section className="border-b border-[#b8cdd7] bg-[#edf5f8]"><div className="mx-auto max-w-[1500px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24"><div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr]"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0043f3]">One system, different operations</p><h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">Atlas defines the shell. The farm brief defines how it must work.</h2><p className="mt-5 text-base leading-8 text-[#526c79]">Agricultural buildings share structural logic, but they do not share identical operational requirements. The right starting point depends on capacity, animal flow, equipment, ventilation, hygiene and the site.</p></div><div className="grid border-y border-[#9fb7c3] sm:grid-cols-3">{[{ Icon: Warehouse, number: "01", title: "Choose the envelope", text: "Select a released Atlas span and extend the length in repeatable structural bays." }, { Icon: Ruler, number: "02", title: "Coordinate the operation", text: "Place passages, internal zones, openings and specialist systems around the production brief." }, { Icon: Boxes, number: "03", title: "Define the package", text: "Separate the structural shell from civils, equipment and other project responsibilities." }].map((item, index) => <article key={item.number} className={`relative py-8 sm:px-7 ${index ? "border-t border-[#9fb7c3] sm:border-l sm:border-t-0" : "sm:pl-0"}`}><div className="flex items-center justify-between"><item.Icon className="h-5 w-5 text-[#0043f3]" /><span className="font-mono text-xs font-bold text-[#0043f3]">{item.number}</span></div><h3 className="mt-7 text-lg font-black">{item.title}</h3><p className="mt-3 text-sm leading-7 text-[#526c79]">{item.text}</p></article>)}</div></div></div></section>

    <section className="bg-[#001d2e] text-white"><div className="mx-auto grid max-w-[1500px] gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-12 lg:py-20"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ffcf1a]">Live application guide</p><h2 className="mt-4 text-3xl font-black sm:text-4xl">Planning a 20-sow piggery?</h2><p className="mt-5 max-w-xl text-base leading-8 text-[#c1d9e5]">See how published South African housing guidance maps to three released Atlas starting configurations for breeding, farrowing and growing functions.</p><div className="mt-7 flex flex-col gap-3 sm:flex-row"><Link href="/agricultural-buildings/20-sow-piggery" className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#ffcf1a] px-6 text-sm font-black text-[#001d2e] transition hover:bg-white">Read the piggery guide <ArrowRight className="h-4 w-4" /></Link><Link href="/warehouse-builder?productType=Atlas%20Warehouse&width=10&length=32&height=3&sheeting=roof_only" className="inline-flex min-h-12 items-center justify-center border border-white/60 px-6 text-sm font-black transition hover:bg-white hover:text-[#001d2e]">Preview W10 × 32m in 3D</Link></div></div><div className="border-y border-[#315364]">{[["Breeding", "W10 × 32m", "ARC sow-and-boar outline"], ["Farrowing", "W06 × 16m", "Five-to-six-pen starting envelope"], ["Grower", "W10 × 40m", "Published 9m × 40m outline"]].map(([label, size, basis], index) => <div key={label} className="grid grid-cols-[36px_1fr_auto] items-center gap-4 border-b border-[#315364] py-5 last:border-b-0"><span className="font-mono text-xs font-bold text-[#ffcf1a]">0{index + 1}</span><div><p className="font-black">{label}</p><p className="mt-1 text-xs text-[#9fbbc8]">{basis}</p></div><span className="font-mono text-sm font-bold text-[#73a8ff]">{size}</span></div>)}</div></div></section>

    <section id="agricultural-brief" className="scroll-mt-24 border-b border-[#b8cdd7] bg-white"><div className="mx-auto grid max-w-[1500px] gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.68fr_1.32fr] lg:px-12 lg:py-24"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0043f3]">Route your project</p><h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">Tell us what the farm needs to do</h2><p className="mt-5 text-base leading-8 text-[#526c79]">You do not need a completed design. Select the application and share what you know. Smart Steel can recommend an Atlas starting size, direct you to a relevant 3D configuration, or review a custom structural brief.</p><div className="mt-8 border-y border-[#b8cdd7] py-6"><p className="font-black">The useful starting information</p><ul className="mt-4 space-y-3">{["Farm or project location", "Intended use and approximate capacity", "Information already available", "Preferred timing and structural scope"].map((item) => <li key={item} className="flex gap-3 text-sm text-[#526c79]"><Check className="h-4 w-4 shrink-0 text-[#0043f3]" />{item}</li>)}</ul></div></div><AgriculturalQuoteForm content={{ planLabel: "Agricultural buildings hub" }} projectOptions={hubProjectOptions} defaultProjectNeed={hubProjectOptions[0]} briefOptions={hubBriefOptions} leadSource="Agricultural Buildings Hub" /></div></section>

    <section className="border-b border-[#b8cdd7] bg-[#f7fafb]"><div className="mx-auto max-w-[1100px] px-5 py-16 sm:px-8 lg:py-24"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0043f3]">Before the structural review</p><h2 className="mt-4 text-3xl font-black sm:text-4xl">Agricultural building questions</h2><div className="mt-8 divide-y divide-[#b8cdd7] border-y border-[#b8cdd7]">{faqs.map((item) => <details key={item.question} className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold"><span>{item.question}</span><span className="text-xl text-[#0043f3] transition group-open:rotate-45">+</span></summary><p className="max-w-3xl pt-4 text-sm leading-7 text-[#526c79]">{item.answer}</p></details>)}</div></div></section>

    <section className="bg-[#0043f3] text-white"><div className="mx-auto flex max-w-[1500px] flex-col gap-7 px-5 py-12 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-12"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#cfe0ff]">Atlas agricultural buildings</p><h2 className="mt-3 max-w-3xl text-3xl font-black">Start with the operation. Define the structural next step.</h2></div><a href="#agricultural-brief" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 bg-white px-6 text-sm font-black text-[#001d2e] transition hover:bg-[#ffcf1a]">Start an agricultural brief <ArrowRight className="h-4 w-4" /></a></div></section>
  </main>
}
