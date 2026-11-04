import { agriculturalSocialMetadata } from "../../lib/agriculturalSocialCards.mjs"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Beef, Bird, Boxes, Check, Fence, Milk, PiggyBank, Ruler, Warehouse, Wheat } from "lucide-react"
import AgriculturalQuoteForm from "../../components/agriculture/AgriculturalQuoteForm"
import { agriculturalCategories } from "./agriculturalStructureData"

const SITE_URL = "https://www.smartsteel.co.za"
const pageTitle = "Agricultural Steel Buildings & Farm Sheds | Smart Steel SA"
const pageDescription = "Explore agricultural steel buildings for poultry, livestock, dairy and farm storage. Configure an Atlas farm shed or request a proposal for your South African site."
const builderUrl = "/warehouse-builder?productType=Atlas%20Warehouse"
const hubSocial = agriculturalSocialMetadata("agricultural-buildings", pageTitle, pageDescription)

export const metadata = {
  title: { absolute: pageTitle },
  description: pageDescription,
  keywords: ["agricultural steel buildings South Africa", "steel farm buildings", "livestock housing", "poultry house structure", "piggery buildings", "farm storage buildings"],
  robots: { index: true, follow: true },
  alternates: { canonical: `${SITE_URL}/agricultural-buildings` },
  openGraph: { title: pageTitle, description: pageDescription, url: `${SITE_URL}/agricultural-buildings`, type: "website", images: hubSocial.images },
  twitter: hubSocial.twitter,
}

const categoryStyle = [
  { Icon: PiggyBank },
  { Icon: Bird },
  { Icon: Milk },
  { Icon: Beef },
  { Icon: Fence },
  { Icon: Wheat },
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
      { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: SITE_URL }, { "@type": "ListItem", position: 2, name: "Agricultural buildings", item: `${SITE_URL}/agricultural-buildings` }] },
      { "@type": "Service", name: "Agricultural structural steel buildings", provider: { "@type": "Organization", name: "Smart Steel", url: SITE_URL }, areaServed: { "@type": "Country", name: "South Africa" }, serviceType: "Atlas agricultural structural building shells" },
      { "@type": "ItemList", itemListElement: agriculturalCategories.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.title, ...(item.href ? { url: `${SITE_URL}${item.href}` } : {}) })) },
      { "@type": "FAQPage", mainEntity: faqs.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) },
    ],
  }

  return <main className="bg-white pt-20 text-[#001d2e] [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-4 [&_a:focus-visible]:outline-[#0043f3]">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

    <section className="bg-white">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 py-10 sm:px-8 lg:grid-cols-2 lg:gap-14 lg:py-16">
        <div>
          <Image src="/atlas/atlas-logo-horizontal-dark.png" alt="Atlas System developed by Smart Steel" width={238} height={44} className="mb-8 h-auto w-52" />
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0043f3]">Space for your next season</p>
          <h1 className="mt-4 text-4xl font-bold leading-[1.08] tracking-[-0.035em] sm:text-5xl">Agricultural steel buildings &amp; farm sheds in South Africa.</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-[#526a78]">From poultry and livestock housing to grain and machinery storage, plan a steel building around what your farm needs to achieve.</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a href="#applications" className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-[#0043f3] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0036c4]">Explore farm buildings <ArrowRight className="h-4 w-4" /></a>
            <Link href={builderUrl} className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl border border-[#dce6ed] px-5 py-3 text-sm font-semibold transition hover:bg-[#f3f7fa]">Build &amp; price in 3D <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <p className="mt-4 text-xs leading-6 text-[#526a78]">Atlas steel frames and agreed roof and wall sheeting. Farming equipment and specialist systems need their own scope.</p>
        </div>
        <div className="overflow-hidden rounded-3xl border border-[#dce6ed] bg-[#f3f7fa]">
          <div className="relative aspect-[4/3]"><Image src="/atlas_warehouse.webp" alt="Bolted Atlas steel roof frame" fill priority sizes="(min-width:1024px) 600px, 100vw" className="object-cover" /></div>
          <div className="flex items-center gap-3 px-5 py-4"><Warehouse aria-hidden="true" className="h-5 w-5 shrink-0 text-[#0043f3]" /><p className="text-sm font-semibold">Smart Steel is the team. Atlas is our building system.</p></div>
        </div>
      </div>
    </section>

    <section id="applications" className="scroll-mt-24 bg-[#f3f7fa]">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-8 lg:py-12">
        <div className="py-3 lg:py-6">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0043f3]">Find your application</p><h2 className="mt-3 text-3xl font-bold leading-[1.12] tracking-[-0.035em] sm:text-4xl">What are you building for?</h2></div><p className="max-w-md text-sm leading-7 text-[#526a78]">Explore planning guidance, structural options and the practical details that shape each type of farm building.</p></div>
          <div aria-label="Agricultural building categories" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{agriculturalCategories.map((item, index) => {
            const { Icon } = categoryStyle[index]
            const content = <><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#edf3ff] text-[#0043f3]"><Icon className="h-5 w-5" /></span><span className="min-w-0 flex-1"><span className="block text-base font-bold">{item.title}</span><span className="mt-2 block text-sm leading-6 text-[#526a78]">{item.description}</span></span><ArrowRight className="mt-3 h-4 w-4 shrink-0 text-[#0043f3]" /></>
            return item.href ? <Link key={item.title} href={item.href} className="flex min-h-[126px] gap-4 rounded-2xl border border-[#dce6ed] bg-white p-5 transition hover:border-[#0043f3] hover:bg-[#f7fafb]">{content}</Link> : <a key={item.title} href="#agricultural-brief" className="flex min-h-[126px] gap-4 rounded-2xl border border-[#dce6ed] bg-white p-5 transition hover:border-[#0043f3] hover:bg-[#f7fafb]">{content}</a>
          })}</div>
        </div>
        <div className="grid border-t border-[#dce6ed] text-sm font-semibold text-[#264554] sm:grid-cols-3"><p className="py-4 sm:pr-5">Practical Atlas building options</p><p className="border-t border-[#dce6ed] py-4 sm:border-l sm:border-t-0 sm:px-5">Support from idea to structural quote</p><p className="border-t border-[#dce6ed] py-4 sm:border-l sm:border-t-0 sm:pl-5">Supply and delivery across South Africa</p></div>
      </div>
    </section>

    <section className="border-b border-[#dce6ed] bg-[#f3f7fa]"><div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-8 lg:py-20"><div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr]"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0043f3]">Built around what you want to achieve</p><h2 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">Your farming goals shape the building we plan together.</h2><p className="mt-5 text-base leading-8 text-[#526a78]">Tell us what you want the new space to make possible. We help you work through the size, layout and steel building package, coordinating the building requirements with your agricultural and equipment team.</p></div><div className="grid gap-4 sm:grid-cols-3">{[{ Icon: Warehouse, number: "01", title: "Explore your building options", text: "Compare Atlas spans and bay lengths around the space your farm needs." }, { Icon: Ruler, number: "02", title: "Plan for everyday farm work", text: "Work from your layout to agree access, openings and equipment interfaces." }, { Icon: Boxes, number: "03", title: "Move forward with a clear quote", text: "Know what the steel package includes and how it fits into the wider project." }].map((item) => <article key={item.number} className="rounded-2xl border border-[#dce6ed] bg-white p-5"><div className="flex items-center justify-between"><item.Icon className="h-5 w-5 text-[#0043f3]" /><span className="font-mono text-xs font-bold text-[#0043f3]">{item.number}</span></div><h3 className="mt-7 text-lg font-bold">{item.title}</h3><p className="mt-3 text-sm leading-7 text-[#526a78]">{item.text}</p></article>)}</div></div></div></section>

    <section className="bg-[#001d2e] text-white"><div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8 lg:py-20"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#94b9ff]">A starting point for your plans</p><h2 className="mt-4 text-3xl font-bold leading-[1.12] tracking-[-0.035em] sm:text-4xl">Planning a 20-sow piggery?</h2><p className="mt-5 max-w-xl text-base leading-8 text-[#c1d9e5]">See how published South African housing guidance maps to three released Atlas starting configurations for breeding, farrowing and growing functions.</p><div className="mt-7 flex flex-col gap-3 sm:flex-row"><Link href="/agricultural-buildings/20-sow-piggery" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#0043f3] px-6 text-sm font-semibold text-white transition hover:bg-[#0036c4]">Read the piggery guide <ArrowRight className="h-4 w-4" /></Link><Link href="/warehouse-builder?productType=Atlas%20Warehouse&width=10&length=32&height=3&sheeting=roof_only" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/30 px-6 text-sm font-bold transition hover:bg-white hover:text-[#001d2e]">Preview W10 × 32m in 3D</Link></div></div><div className="border-y border-[#315364]">{[["Breeding", "W10 × 32m", "ARC sow-and-boar outline"], ["Farrowing", "W06 × 16m", "Five-to-six-pen starting envelope"], ["Grower", "W10 × 40m", "Published 9m × 40m outline"]].map(([label, size, basis], index) => <div key={label} className="grid grid-cols-[36px_1fr_auto] items-center gap-4 border-b border-[#315364] py-5 last:border-b-0"><span className="font-mono text-xs font-bold text-[#94b9ff]">0{index + 1}</span><div><p className="font-bold">{label}</p><p className="mt-1 text-xs text-[#9fbbc8]">{basis}</p></div><span className="font-mono text-sm font-bold text-[#73a8ff]">{size}</span></div>)}</div></div></section>

    <section id="building-options" className="scroll-mt-24 border-b border-[#dce6ed] bg-white">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-8 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-16"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0043f3]">Choose the space. Define the scope.</p><h2 className="mt-4 text-3xl font-bold leading-[1.12] tracking-[-0.035em] sm:text-4xl">Agricultural steel building options</h2></div><p className="text-base leading-8 text-[#526a78]">Atlas combines configurable structural spans, modular lengths and roofing and cladding options. Start with the working space your farm needs, then confirm the height, openings, site loads and specialist requirements with our team.</p></div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[{ value: "8 / 10 / 12 / 15m", title: "Explore structural widths", text: "Common Atlas span options. Suitability depends on the height, loading and application; each project needs review." }, { value: "4m", title: "Modular length bays", text: "Plan the building length in structural bays around your pens, storage aisles, equipment and access routes." }, { value: "Open or enclosed", title: "Choose your cover", text: "Compare roof-only cover and wall-cladding options. Ventilation, doors and insulation need their own agreed scope." }, { value: "Supply + options", title: "Plan the delivery", text: "Begin with the steel supply package. Delivery and optional installation are confirmed for your site and programme." }].map((item) => <div key={item.title} className="rounded-2xl border border-[#dce6ed] bg-[#f7f9fb] p-5"><p className="text-xl font-bold text-[#0043f3]">{item.value}</p><h3 className="mt-5 font-bold">{item.title}</h3><p className="mt-3 text-sm leading-7 text-[#526a78]">{item.text}</p></div>)}
        </div>
        <p className="mt-5 max-w-5xl text-sm leading-7 text-[#526a78]">Your quotation defines the inclusions. Foundation design, site works, floors, livestock equipment, ventilation systems, services and regulatory approvals are not automatically included in the structural package.</p>
        <div className="mt-10 grid gap-8 border-t border-[#dce6ed] pt-8 md:grid-cols-2 md:gap-16">
          <div><Ruler className="h-6 w-6 text-[#0043f3]" /><h3 className="mt-4 text-xl font-bold">Already know your dimensions?</h3><p className="mt-3 max-w-lg text-sm leading-7 text-[#526a78]">Explore the structure in 3D and compare a live supply-only budget. Final pricing and suitability follow your confirmed configuration and site review.</p><Link href={builderUrl} className="mt-5 inline-flex min-h-12 items-center gap-3 rounded-xl bg-[#0043f3] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#001d2e]">Build &amp; Price Your Farm Shed <ArrowRight className="h-4 w-4" /></Link></div>
          <div><Warehouse className="h-6 w-6 text-[#0043f3]" /><h3 className="mt-4 text-xl font-bold">Still working out what you need?</h3><p className="mt-3 max-w-lg text-sm leading-7 text-[#526a78]">Tell us the intended use, capacity and farm location. We can help define a practical structural package before you have finished drawings.</p><a href="#agricultural-brief" className="mt-5 inline-flex min-h-12 items-center gap-3 rounded-xl border border-[#dce6ed] px-6 py-3 text-sm font-bold transition hover:bg-[#f3f7fa]">Request a Building Proposal <ArrowRight className="h-4 w-4" /></a></div>
        </div>
      </div>
    </section>

    <section id="agricultural-brief" className="scroll-mt-24 border-b border-[#dce6ed] bg-[#f7fafb]"><div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.68fr_1.32fr] lg:px-8 lg:py-20"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0043f3]">Let’s plan your next step</p><h2 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">Request your agricultural building proposal.</h2><p className="mt-5 text-base leading-8 text-[#526a78]">Share what you want to build and what you know so far. We will help you explore suitable building options, understand the structural scope and identify the next steps. You can start the conversation before you have finished drawings.</p><div className="mt-8 border-y border-[#dce6ed] py-6"><p className="font-bold">A few details help us get started</p><ul className="mt-4 space-y-3">{["Farm or project location", "Intended use and approximate capacity", "Information already available", "Preferred timing and structural scope"].map((item) => <li key={item} className="flex gap-3 text-sm text-[#526a78]"><Check className="h-4 w-4 shrink-0 text-[#0043f3]" />{item}</li>)}</ul></div></div><AgriculturalQuoteForm content={{ planLabel: "Agricultural buildings hub" }} projectOptions={hubProjectOptions} defaultProjectNeed={hubProjectOptions[0]} briefOptions={hubBriefOptions} leadSource="Agricultural Buildings Hub" /></div></section>

    <section className="border-b border-[#dce6ed] bg-[#f7fafb]"><div className="mx-auto max-w-[1100px] px-5 py-16 sm:px-8 lg:py-20"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0043f3]">As you plan your project</p><h2 className="mt-4 text-3xl font-bold leading-[1.12] tracking-[-0.035em] sm:text-4xl">Agricultural building questions</h2><div className="mt-8 space-y-3">{faqs.map((item) => <details key={item.question} className="group rounded-2xl border border-[#dce6ed] bg-white p-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold [&::-webkit-details-marker]:hidden"><span>{item.question}</span><span className="text-xl text-[#0043f3] transition group-open:rotate-45">+</span></summary><p className="max-w-3xl pt-4 text-sm leading-7 text-[#526a78]">{item.answer}</p></details>)}</div></div></section>

    <section className="px-5 py-12 sm:px-8 lg:py-20"><div className="mx-auto flex max-w-7xl flex-col gap-7 rounded-3xl bg-[#001d2e] p-7 text-white sm:p-10 lg:flex-row lg:items-center lg:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#cfe0ff]">Atlas agricultural buildings</p><h2 className="mt-3 max-w-3xl text-3xl font-bold">Tell us your farming plans. Let’s work on the building.</h2></div><a href="#agricultural-brief" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0043f3] px-6 text-sm font-semibold text-white transition hover:bg-[#0036c4]">Discuss your building plans <ArrowRight className="h-4 w-4" /></a></div></section>
  </main>
}
