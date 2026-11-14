import Image from "next/image"
import Link from "../../../components/BuilderEntryLink"

const SITE_URL = "https://www.smartsteel.co.za"
const PAGE_PATH = "/products/cflc-solar-carports"
const SHARE_IMAGE = `${SITE_URL}/atlas-solar-carports-share.png`

export const metadata = {
  title: "Solar Carports South Africa | 3D Layout & Prices | Smart Steel",
  description:
    "Explore Atlas solar carport structures in South Africa. Configure parking layouts in 3D, check panel capacity and see a supply-only steel structure guide price.",
  keywords: [
    "Atlas solar carports",
    "solar carports south africa",
    "solar carport price south africa",
    "solar panel carport",
    "commercial solar carport",
    "solar parking structures",
    "carport with solar panels",
  ],
  alternates: { canonical: PAGE_PATH },
  openGraph: {
    title: "Atlas Solar Carports | Smart Steel",
    description:
      "Plan covered parking and solar-ready infrastructure with an Atlas solar carport. Start with an online estimate before you enquire.",
    url: `${SITE_URL}${PAGE_PATH}`,
    siteName: "Smart Steel",
    locale: "en_ZA",
    type: "website",
    images: [{ url: SHARE_IMAGE, width: 1200, height: 630, alt: "Atlas solar carport by Smart Steel" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Atlas Solar Carports | Smart Steel",
    description: "Price an Atlas solar carport online before you enquire.",
    images: [SHARE_IMAGE],
  },
}

const applications = [
  {
    title: "Commercial parking",
    description: "Turn office, retail, business park, and visitor parking into useful covered space with solar potential.",
    image: "/solar_carport_hero.webp",
    alt: "Atlas solar carport over commercial parking",
  },
  {
    title: "Schools and campuses",
    description: "A visible infrastructure upgrade for staff, visitors, and day-to-day operational parking areas.",
    image: "/solar_carport_1.webp",
    alt: "Atlas solar carport structural detail",
  },
  {
    title: "Fleets and operational sites",
    description: "A repeatable route for vehicle cover where layout, circulation, and longer-term energy planning need to work together.",
    image: "/solar_carport_2.webp",
    alt: "Atlas solar carport over vehicle parking",
  },
]

const faqs = [
  {
    question: "What is an Atlas solar carport?",
    answer:
      "An Atlas solar carport is a modular steel parking structure designed to provide covered vehicle bays while supporting a solar-ready roof layout. It is part of the Atlas modular infrastructure platform developed by Smart Steel.",
  },
  {
    question: "What makes the Atlas system different?",
    answer:
      "Atlas is built around repeatable components, practical parking layouts, and bolted assembly principles. This creates a clearer structural starting point before Smart Steel reviews the specific site, foundations, delivery, installation, and final project scope.",
  },
  {
    question: "How much does a solar carport cost in South Africa?",
    answer:
      "The steel structure price depends on how many parking bays you need and how you arrange them. Use the Atlas 3D builder to see a supply-only guide price excluding VAT for your layout before requesting a reviewed quote.",
  },
  {
    question: "Are the solar panels included?",
    answer:
      "The online guide covers the steel structure and solar support layout, excluding VAT. Solar panels and electrical work are not included in that structure-only price. Foundations, delivery and installation are reviewed separately for your site.",
  },
  {
    question: "Who are Atlas solar carports for?",
    answer:
      "They are suited to commercial sites, schools, estates, farms, fleet areas, and other parking layouts where covered bays and solar potential should work together.",
  },
]

const relatedPages = [
  ["Atlas ground mounts", "Price a standalone solar structure when the array does not need to sit over parking.", "/products/cflc-ground-mounts", "View ground mounts"],
  ["Atlas warehouse system", "Explore the wider Atlas platform for modular warehouse and infrastructure structures.", "/warehouses/cflc", "Explore Atlas W-Series"],
]

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
}

const BUILDER_PATH = "/tools/solar-carport-estimator"
const primaryButton = "inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-[#0043f3] px-5 py-3 font-semibold text-white transition hover:bg-[#0035c7] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0043f3]"
const section = "mx-auto max-w-7xl px-5 sm:px-8 lg:px-10"

function BuilderButton({ children, className = "" }) {
  return <Link href={BUILDER_PATH} className={`${primaryButton} ${className}`}>{children}<span aria-hidden="true">→</span></Link>
}

export default function AtlasSolarCarportsPage() {
  return (
    <main className="atlas-brand bg-white pb-24 pt-16 text-[#001d2e] sm:pb-16 sm:pt-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <section className={`${section} grid items-center gap-8 pb-12 pt-5 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12 lg:pb-14 lg:pt-10`}>
        <div>
          <Image src="/atlas/atlas-logo-horizontal-dark.png" alt="Atlas by Smart Steel" width={190} height={45} className="h-8 w-auto object-contain" />
          <h1 className="mt-5 text-4xl font-bold leading-[1.07] tracking-tight sm:text-5xl lg:text-6xl">Solar carports for South Africa</h1>
          <p className="mt-4 max-w-lg text-base leading-7 text-slate-600 sm:text-lg">Plan covered parking with a modular steel structure designed to support solar panels. Lay out your bays, check indicative panel capacity and see a structure-only guide price in 3D.</p>
          <BuilderButton className="mt-6 w-full sm:w-auto">Build my solar carport in 3D</BuilderButton>
          <p className="mt-3 text-sm text-slate-600">No contact details required to start.</p>
        </div>

        <Link href={BUILDER_PATH} className="group block overflow-hidden rounded-3xl border border-[#d6e4ec] bg-[#eef4f8] shadow-sm transition hover:border-[#0043f3] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0043f3]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#d6e4ec] bg-white px-5 py-4">
            <span className="font-semibold">Atlas Solar Carport Builder</span>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#0043f3]">3D preview</span>
          </div>
          <div className="relative aspect-[16/9]">
            <Image src="/solar_carport_model.webp" alt="3D model of an Atlas steel solar carport" fill priority sizes="(min-width: 1024px) 54vw, 100vw" className="object-contain p-3" />
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-[#d6e4ec] bg-white px-5 py-4">
            <span className="text-sm font-semibold text-[#0043f3]">Open the 3D builder</span>
            <span aria-hidden="true" className="text-xl text-[#0043f3] transition motion-safe:group-hover:translate-x-1">→</span>
          </div>
        </Link>
      </section>

      <section className="border-y border-[#d6e4ec] bg-[#f2f7fa] py-10 sm:py-14">
        <div className={section}>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">From parking layout to guide price</h2>
          <ol className="mt-6 grid gap-5 md:grid-cols-3">
            {[
              ["Lay out your parking", "Choose the number of bays and configure single- or double-sided runs to suit your site."],
              ["Explore in 3D", "Rotate the model, check the top view and see the indicative solar panel capacity."],
              ["Price the steel structure", "See the guide price excluding VAT, then send your layout to Smart Steel for a reviewed quote."],
            ].map(([title, description], index) => (
              <li key={title} className="rounded-2xl border border-[#d6e4ec] bg-white p-5">
                <span className="inline-grid size-8 place-items-center rounded-full bg-blue-50 text-sm font-bold text-[#0043f3]">{index + 1}</span>
                <h3 className="mt-3 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={`${section} py-12 sm:py-16`}>
        <div className="grid overflow-hidden rounded-3xl border border-[#d6e4ec] bg-[#f2f7fa] md:grid-cols-2">
          <div className="relative min-h-64">
            <Image src="/projects/Solar Carports_Centurion Golf Club/7.webp" alt="Completed solar carport parking at Centurion Golf Club in Gauteng" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </div>
          <div className="self-center p-6 sm:p-10">
            <p className="text-sm font-semibold text-[#0043f3]">Completed Smart Steel project · Gauteng</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">Solar carports at Centurion Golf Club</h2>
            <p className="mt-3 leading-7 text-slate-600">See how covered parking and a solar array come together on a completed site. Use the 3D builder to explore what could fit your own parking area.</p>
            <BuilderButton className="mt-5">Plan my parking layout</BuilderButton>
          </div>
        </div>
      </section>

      <section className={`${section} pb-12 sm:pb-16`}>
        <h2 className="text-3xl font-bold tracking-tight">Where solar carports fit</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {applications.map(item => (
            <article key={item.title} className="overflow-hidden rounded-2xl border border-[#d6e4ec]">
              <div className="relative aspect-[2/1] bg-[#eef4f8]">
                <Image src={item.image} alt={item.alt} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
              </div>
              <div className="p-5"><h3 className="text-lg font-semibold">{item.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className={`${section} pb-12 sm:pb-16`}>
        <div className="grid gap-5 border-t border-[#d6e4ec] pt-8 lg:grid-cols-[0.65fr_1.35fr]">
          <h2 className="text-3xl font-bold tracking-tight">Solar carport FAQs</h2>
          <div className="divide-y divide-[#d6e4ec]">
            {faqs.map(item => (
              <details key={item.question} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold marker:content-none">
                  {item.question}<span aria-hidden="true" className="text-xl text-[#0043f3] transition group-open:rotate-45">+</span>
                </summary>
                <p className="pt-2 leading-7 text-slate-600">{item.answer}</p>
              </details>
            ))}
            <BuilderButton className="mt-4">Build and price my solar carport</BuilderButton>
          </div>
        </div>
      </section>

      <nav aria-label="Related Atlas products" className={`${section} flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-[#0043f3]`}>
        {relatedPages.map(([title, , href]) => <Link key={href} href={href} className="hover:underline">{title} <span aria-hidden="true">↗</span></Link>)}
        <Link href="/recent" className="hover:underline">More completed projects <span aria-hidden="true">↗</span></Link>
      </nav>

    </main>
  )
}
