import Image from "next/image"
import Link from "next/link"
import { cflcCarportSelections } from "../cflc-diy-warehouse-kits/cflcCatalogueData"

const SITE_URL = "https://www.smartsteel.co.za"
const PAGE_PATH = "/products/cflc-carport-kits"
const SHARE_IMAGE = `${SITE_URL}/CFLC_carport.webp`

export const metadata = {
  title: "Atlas Carports South Africa | Lip Channel Carport Kits",
  description:
    "Compare Atlas modular lip channel carports for single, double, and multi-bay parking cover in South Africa. See standard sizes and get an online estimate.",
  keywords: [
    "Atlas carports",
    "lip channel carports",
    "carport kits South Africa",
    "steel carport kits",
    "single carport kit",
    "double carport kit",
    "carport prices South Africa",
  ],
  alternates: { canonical: PAGE_PATH },
  openGraph: {
    title: "Atlas Carports | Smart Steel",
    description:
      "Plan a practical Atlas carport around standard parking sizes, modular components, and a clear online starting estimate.",
    url: `${SITE_URL}${PAGE_PATH}`,
    siteName: "Smart Steel",
    locale: "en_ZA",
    type: "website",
    images: [{ url: SHARE_IMAGE, width: 1200, height: 630, alt: "Atlas steel carport by Smart Steel" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Atlas Carports | Smart Steel",
    description: "Compare Atlas lip channel carport kits and get an online starting estimate.",
    images: [SHARE_IMAGE],
  },
}

const proofPoints = [
  ["Modular parking cover", "Start with a practical parking bay, then expand the layout as the site or vehicle requirement grows."],
  ["Bolted Atlas system", "Repeatable lip channel components and bolted connections create a clearer route from supply to assembly."],
  ["Price before you enquire", "Choose the closest standard size and see a useful structure-only budget guide before sharing your details."],
]

const processSteps = [
  ["01", "Choose the parking size", "Select the number of vehicles or the closest footprint for your site."],
  ["02", "See a starting estimate", "Review a practical structure-only budget and adjust the quantity or delivery requirement."],
  ["03", "Send the project details", "Submit the selected layout so the Smart Steel team can confirm scope, lead time, and final pricing."],
]

const included = ["Main frame", "Bracing", "Purlins / top hats", "Connection fasteners", "Drawings / installation guide"]
const excluded = ["Roof sheeting", "Concrete and foundations", "Delivery", "Installation", "Gutters and downpipes"]

const faqs = [
  {
    question: "What is an Atlas carport?",
    answer:
      "An Atlas carport is a modular steel parking structure developed by Smart Steel. It uses repeatable lip channel components and bolted assembly principles to create practical single, double, and larger parking layouts.",
  },
  {
    question: "Can I see a carport price before I enquire?",
    answer:
      "Yes. The online estimator gives you a structure-only starting budget for the selected carport size before you send an enquiry.",
  },
  {
    question: "Does the standard carport price include roof sheeting?",
    answer:
      "No. The standard starting price covers the steel structure. Roof sheeting and other project items can be reviewed separately for the finish and site requirements you choose.",
  },
  {
    question: "Can Atlas carports be extended?",
    answer:
      "Atlas is based on a modular approach. Larger and multi-bay layouts can be reviewed around the parking requirement, available space, and final project scope.",
  },
  {
    question: "Is installation included?",
    answer:
      "Installation, foundations, and delivery are reviewed separately because access, location, ground conditions, and the final scope can affect these costs.",
  },
]

const relatedPages = [
  ["Atlas solar carports", "Combine covered parking with a solar-ready support structure.", "/products/cflc-solar-carports", "Explore solar carports"],
  ["Atlas W-Series", "Explore modular Atlas warehouse systems for larger enclosed or roof-only structures.", "/warehouses/cflc", "View Atlas warehouses"],
  ["Smart Steel product hub", "Compare the wider warehouse, carport, and solar structure range.", "/products", "Browse all products"],
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

const collectionSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Atlas Carports",
  description: metadata.description,
  url: `${SITE_URL}${PAGE_PATH}`,
  provider: { "@type": "Organization", name: "Smart Steel", url: SITE_URL },
}

function Arrow() {
  return <span aria-hidden="true" className="text-lg leading-none">↗</span>
}

export default function AtlasCarportsPage() {
  return (
    <main className="atlas-brand min-h-screen bg-[linear-gradient(180deg,#ffffff_0%,#ffffff_7rem,#eef6fa_17rem,#eef6fa_100%)] pb-16 pt-24 text-[#001d2e] sm:pt-28">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />

      <section className="atlas-public-hero mx-4 overflow-hidden border shadow-sm sm:mx-6 lg:mx-8">
        <div className="relative mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-10">
          <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:linear-gradient(rgba(18,26,32,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(18,26,32,0.06)_1px,transparent_1px)] [background-size:42px_42px]" />
          <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full border border-[#d9a441]/45" />
          <div className="relative grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div className="max-w-3xl">
              <Image src="/atlas/atlas-logo-horizontal-light.png" alt="Atlas by Smart Steel" width={240} height={84} className="h-11 w-auto object-contain object-left" priority />
              <p className="mt-10 text-xs font-semibold uppercase tracking-[0.24em] text-[#1c5b57]">Atlas Carports</p>
              <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-5xl lg:text-6xl">
                Practical parking cover, built the Atlas way.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-[#121a20]/70 sm:text-lg">
                Atlas carports use modular lip channel steel components and bolted connections to create clear, practical parking cover for homes, businesses, farms, and operational sites.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/tools/cflc-carport-estimator" className="inline-flex items-center justify-center bg-[#d9a441] px-6 py-3.5 text-sm font-semibold text-[#121a20] transition hover:bg-[#ebbd5f]">
                  Price my carport <span className="ml-2 text-lg leading-none">→</span>
                </Link>
                <a href="#carport-sizes" className="inline-flex items-center justify-center border border-[#121a20]/20 bg-white/75 px-6 py-3.5 text-sm font-semibold transition hover:border-[#121a20] hover:bg-white">
                  Compare standard sizes
                </a>
              </div>
              <div className="mt-6 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#121a20]/65">
                <span className="border border-[#121a20]/15 bg-white/75 px-3 py-2">Online starting estimate</span>
                <span className="border border-[#121a20]/15 bg-white/75 px-3 py-2">Structure-only guide</span>
                <span className="border border-[#121a20]/15 bg-white/75 px-3 py-2">Single to multi-bay layouts</span>
              </div>
            </div>

            <div className="relative min-h-[340px] overflow-hidden border border-[#121a20]/15 bg-[#1c5b57] sm:min-h-[400px]">
              <Image src="/CFLC_carport.webp" alt="Atlas lip channel steel carport by Smart Steel" fill priority sizes="(min-width: 1024px) 44vw, 100vw" className="object-cover" />
              <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(18,26,32,0.04),rgba(18,26,32,0.76))]" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d9a441]">Atlas modular structure</p>
                <p className="mt-3 max-w-md text-2xl font-semibold leading-tight text-[#f3f0e9]">A repeatable steel system for everyday parking and useful covered space.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pt-8 sm:px-8 lg:px-10">
        <div className="grid overflow-hidden border border-[#121a20]/15 bg-white sm:grid-cols-3">
          {proofPoints.map(([title, description], index) => (
            <div key={title} className="border-b border-[#121a20]/10 px-5 py-6 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 sm:px-7">
              <p className="font-mono text-xs text-[#1c5b57]">0{index + 1}</p>
              <h2 className="mt-4 text-lg font-semibold tracking-[-0.025em]">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#121a20]/65">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="carport-sizes" className="mx-auto max-w-7xl scroll-mt-24 px-5 pt-16 sm:px-8 sm:pt-24 lg:px-10">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#1c5b57]">Standard starting sizes</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.045em] sm:text-4xl">Choose the closest parking requirement.</h2>
            <p className="mt-4 text-base leading-7 text-[#121a20]/65">Use a standard layout as the starting point. Larger or repeated bays can be reviewed around the way your site needs to work.</p>
          </div>
          <Link href="/tools/cflc-carport-estimator" className="inline-flex items-center gap-2 text-sm font-semibold text-[#1c5b57] hover:text-[#121a20]">Open the estimator <Arrow /></Link>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {cflcCarportSelections.map((item) => {
            const size = item.id === "3x6-carport" ? "single" : "double"
            return (
              <article key={item.id} className="grid overflow-hidden border border-[#121a20]/15 bg-white shadow-[0_22px_44px_-42px_rgba(18,26,32,0.75)] sm:grid-cols-[0.78fr_1.22fr]">
                <div className="relative min-h-64 bg-[#1c5b57] sm:min-h-full">
                  <Image src="/CFLC_carport.webp" alt={`${item.title} Atlas carport`} fill sizes="(min-width: 1024px) 22vw, 100vw" className="object-cover" />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,26,32,0.04),rgba(18,26,32,0.5))]" />
                  <span className="absolute left-4 top-4 border border-white/30 bg-[#121a20]/75 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">Atlas carport</span>
                </div>
                <div className="flex flex-col p-6">
                  <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#1c5b57]">{item.size}</p>
                  <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">{item.title.replace("CFLC", "Atlas")}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#121a20]/65">{item.bestFor}</p>
                  <div className="mt-6 border-y border-[#121a20]/10 py-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#121a20]/45">Structure from</p>
                    <p className="mt-1 text-3xl font-semibold tracking-[-0.04em]">{item.priceFrom}</p>
                  </div>
                  <Link href={`/tools/cflc-carport-estimator?size=${size}`} className="mt-6 inline-flex items-center justify-between bg-[#d9a441] px-5 py-3.5 text-sm font-semibold transition hover:bg-[#ebbd5f]">
                    Estimate this layout <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pt-16 sm:px-8 sm:pt-24 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#1c5b57]">From size to scope</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.045em] sm:text-4xl">A quicker route to a useful carport enquiry.</h2>
          </div>
          <p className="max-w-2xl text-base leading-7 text-[#121a20]/65">The Atlas estimator replaces the generic enquiry form with a simple first decision: how much parking cover do you need? Your selected layout then carries into the enquiry.</p>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {processSteps.map(([number, title, description]) => (
            <div key={number} className="border border-[#121a20]/15 bg-white p-6 sm:p-7">
              <p className="font-mono text-xs text-[#d9a441]">{number}</p>
              <h3 className="mt-8 text-2xl font-semibold tracking-[-0.04em]">{title}</h3>
              <p className="mt-4 text-sm leading-6 text-[#121a20]/65">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pt-16 sm:px-8 sm:pt-24 lg:px-10">
        <div className="grid border border-[#121a20]/15 bg-white lg:grid-cols-2">
          <div className="border-b border-[#121a20]/10 p-6 sm:p-8 lg:border-b-0 lg:border-r">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#1c5b57]">Included in the structure</p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {included.map((item) => <li key={item} className="border-l-2 border-[#d9a441] pl-3 text-sm leading-6">{item}</li>)}
            </ul>
          </div>
          <div className="p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#1c5b57]">Reviewed around your project</p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {excluded.map((item) => <li key={item} className="border-l-2 border-[#121a20]/20 pl-3 text-sm leading-6 text-[#121a20]/70">{item}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pt-16 sm:px-8 sm:pt-24 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#1c5b57]">Common questions</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">What to know before you choose a carport.</h2>
          </div>
          <div className="border-t border-[#121a20]/15">
            {faqs.map((item) => (
              <details key={item.question} className="group border-b border-[#121a20]/15 py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                  {item.question}<span className="text-xl text-[#d9a441] transition group-open:rotate-45">+</span>
                </summary>
                <p className="max-w-2xl pt-4 text-sm leading-6 text-[#121a20]/65">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pt-16 sm:px-8 sm:pt-24 lg:px-10">
        <div className="grid gap-4 md:grid-cols-3">
          {relatedPages.map(([title, description, href, label]) => (
            <Link key={title} href={href} className="group border border-[#121a20]/15 bg-white p-6 transition hover:border-[#d9a441]">
              <h2 className="text-xl font-semibold tracking-[-0.03em]">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-[#121a20]/65">{description}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#1c5b57] group-hover:text-[#121a20]">{label} <Arrow /></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-6 pt-16 sm:px-8 sm:pt-24 lg:px-10">
        <div className="border-l-2 border-[#d9a441] pl-5 sm:pl-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#1c5b57]">The Atlas approach</p>
          <p className="mt-4 max-w-4xl text-xl font-medium leading-8 tracking-[-0.025em] sm:text-2xl sm:leading-9">Atlas turns familiar lip channel steel into a more deliberate modular system: repeatable components, bolted connections, practical starting sizes, and a clearer route from online planning to a buildable project.</p>
        </div>
      </section>
    </main>
  )
}
