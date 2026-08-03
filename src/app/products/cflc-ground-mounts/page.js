import Image from "next/image"
import Link from "next/link"
import GroundMountEstimatorClient from "./GroundMountEstimatorClient"
import {
  calculateSolarEstimate,
  formatCurrency,
  getGroundMountLayout,
} from "../../../lib/estimates/solarEstimate"

const SITE_URL = "https://www.smartsteel.co.za"
const PAGE_PATH = "/products/cflc-ground-mounts"
const SHARE_IMAGE = `${SITE_URL}/solar_ground_mount.webp`

const examplePanelCounts = [6, 12, 36, 60]

const groundMountExamples = examplePanelCounts.map((panelCount) => {
  const layout = getGroundMountLayout(panelCount)
  const estimate = calculateSolarEstimate({
    productType: "Solar ground mount",
    moduleCount: panelCount,
    quantity: 1,
    width: layout.width,
    length: layout.length,
    wallHeight: 0,
    scope: "supply_only",
    includeStructureLabour: false,
    includeSolarBrackets: false,
    includeTransport: false,
    transportTrips: 0,
    deliveryDistance: 0,
  })

  return {
    panelCount,
    bayCount: layout.bayCount,
    pricedPanelCount: layout.pricedPanelCount,
    width: layout.width,
    length: layout.length,
    pricePerPanel: estimate.pricing.estimatedTotal / layout.pricedPanelCount,
    priceFrom: formatCurrency(estimate.pricing.estimatedTotal),
  }
})

const heroBenchmarkExample =
  groundMountExamples.find((item) => item.panelCount === 36) || groundMountExamples[0]

export const metadata = {
  title: "Atlas Solar Ground Mounts South Africa | Smart Steel",
  description:
    "Price Atlas solar ground mount structures in South Africa. Start with panel count, compare modular ZAM steel layouts, and get a budget before you enquire.",
  keywords: [
    "Atlas solar ground mounts",
    "solar ground mount",
    "solar ground mount south africa",
    "solar ground mount structure",
    "ground mounted solar panels",
    "solar mounting structure",
    "solar panel ground mount",
  ],
  alternates: {
    canonical: PAGE_PATH,
  },
  openGraph: {
    title: "Atlas Solar Ground Mounts | Smart Steel",
    description:
      "Start with your panel count, compare practical solar ground mount layouts, and get a clearer budget before you enquire.",
    url: `${SITE_URL}${PAGE_PATH}`,
    siteName: "Smart Steel",
    locale: "en_ZA",
    type: "website",
    images: [
      {
        url: SHARE_IMAGE,
        width: 1200,
        height: 630,
        alt: "Atlas solar ground mount structure by Smart Steel",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Atlas Solar Ground Mounts | Smart Steel",
    description:
      "Compare practical solar ground mount layouts and estimate your project budget before you enquire.",
    images: [SHARE_IMAGE],
  },
}

const quickAnswers = [
  {
    question: "How do I start sizing a ground mount?",
    answer:
      <>
        Start with the number of panels you want to support. We turn that into a practical ground
        mounting system for solar panels so you can compare price and footprint more clearly. If
        you are still comparing broader{" "}
        <Link href="/solar" className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4">
          solar structure options
        </Link>
        , you can review the wider solar range first.
      </>,
  },
  {
    question: "How is the structure priced?",
    answer:
      "The solar ground mount system now uses a modular 6-panel expansion layout for smaller sizes, with a standard 36-panel option for larger starting structures.",
  },
  {
    question: "What steel finish is used?",
    answer:
      "Our current ground mounted solar structure pricing uses ZAM steel as standard for a durable, practical finish.",
  },
  {
    question: "Can I include delivery or installation?",
    answer:
      "Yes. You can start with a structure-only budget, then refine delivery and installation with Smart Steel once the site details are confirmed.",
  },
]

const benefitCards = [
  {
    title: "A faster pricing starting point",
    description:
      "Instead of waiting for a manual quote, you can begin with panel count, layout, and a clearer budget straight away.",
  },
  {
    title: "Practical layouts for real projects",
    description:
      "The system is built around repeatable bay sizes that help keep solar panel support structure planning, transport, and installation more straightforward.",
  },
  {
    title: "A strong fit beyond rooftop solar",
    description:
      <>
        Useful for farms,{" "}
        <Link
          href="/steel-fabrication-installation"
          className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4"
        >
          commercial solar ground mount projects
        </Link>
        , off-grid sites, and larger solar layouts where roof space is limited or not suitable.
      </>,
  },
]

const installSteps = [
  "Confirm your panel count and the best layout for the available site area.",
  "Receive the structure in a practical flat-packed format for delivery to site.",
  "Assemble the steel support structure and position the bays on prepared foundations.",
  "Install the Atlas brackets and panel support components for the final solar layout.",
]

const galleryImages = [
  { src: "/solar_ground_mount.webp", alt: "Smart Steel solar ground mount overview" },
  { src: "/solar_ground_mount_1.webp", alt: "Smart Steel solar ground mount side view" },
  { src: "/solar_ground_mount_2.webp", alt: "Smart Steel solar ground mount detail view" },
]

const supportLinks = [
  {
    title: "Explore solar carports",
    description: "Compare solar carports if your project needs covered parking as well as solar support.",
    href: "/products/cflc-solar-carports",
  },
  {
    title: "Explore Atlas carports",
    description: "See the carport page if you need a parking structure without the solar element.",
    href: "/products/cflc-carport-kits",
  },
  {
    title: "Talk to Smart Steel",
    description: "If you already know your panel count or site location, send it through and we can help with the next step.",
    href: "/contact",
  },
]

const faqs = [
  {
    question: "What is a solar ground mount structure?",
    answer:
      "It is a steel solar panel mounting structure that carries solar panels on the ground instead of on a roof or a parking canopy.",
  },
  {
    question: "Why use a ground mount instead of roof mounting?",
    answer:
      "A ground mount can be a better fit when roof space is limited, roof orientation is poor, or the project needs a larger standalone solar layout.",
  },
  {
    question: "How many panels fit on one bay?",
    answer:
      "Smaller layouts use a 6-panel modular expansion system, while larger starting layouts can move onto the standard 36-panel structure.",
  },
  {
    question: "Do I need the exact final panel count before I enquire?",
    answer:
      "No. A close starting panel count is enough to begin. We can refine the final layout once the site and project details are confirmed.",
  },
  {
    question: "Can this work as a DIY solar ground mount or kit-based project?",
    answer:
      <>
        Yes, for the right project. If you are planning a DIY solar ground mount or want a
        practical ground mount kit approach, Smart Steel can use the estimate as a starting point
        and then guide the next step. You can also explore the broader{" "}
        <Link
          href="/products"
          className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4"
        >
          product range here
        </Link>
        .
      </>,
  },
]

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
}

const productSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Atlas Solar Ground Mount Structures",
  description:
    "Steel solar ground mount structures in South Africa with practical panel-count-led sizing and budgeting.",
  brand: {
    "@type": "Brand",
    name: "Atlas by Smart Steel",
  },
  image: [SHARE_IMAGE],
  url: `${SITE_URL}${PAGE_PATH}`,
  category: "Solar ground mount structures",
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "ZAR",
    lowPrice: groundMountExamples[0]?.priceFrom?.replace(/[^0-9]/g, "") || "0",
    offerCount: `${groundMountExamples.length}`,
    availability: "https://schema.org/InStock",
    url: `${SITE_URL}${PAGE_PATH}#ground-mount-estimator`,
  },
}

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: SITE_URL,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Products",
      item: `${SITE_URL}/products`,
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "Solar Ground Mount Structures",
      item: `${SITE_URL}${PAGE_PATH}`,
    },
  ],
}

export default function AtlasGroundMountsPage() {
  return (
    <main className="atlas-brand min-h-screen bg-[linear-gradient(180deg,#ffffff_0%,#ffffff_7rem,#eef6fa_17rem,#eef6fa_100%)] pb-16 pt-24 text-[#001d2e] sm:pt-28">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <section className="atlas-public-hero mx-4 overflow-hidden border shadow-sm sm:mx-6 lg:mx-8">
        <div className="relative mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-10">
          <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:linear-gradient(rgba(18,26,32,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(18,26,32,0.06)_1px,transparent_1px)] [background-size:42px_42px]" />
          <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full border border-[#d9a441]/45" />
          <div className="relative grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div className="atlas-hero-island"><GroundMountEstimatorClient variant="hero" /></div>
            <div>
              <Image src="/atlas/atlas-logo-horizontal-light.png" alt="Atlas by Smart Steel" width={320} height={50} className="h-10 w-auto max-w-full object-contain object-left" priority />
              <p className="mt-10 text-xs font-semibold uppercase tracking-[0.24em] text-[#1c5b57]">Atlas Solar Ground Mounts</p>
              <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-5xl lg:text-6xl">Price your solar ground mount before you enquire.</h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-[#121a20]/70 sm:text-lg">Start with panel count and get an immediate structure budget for a modular Atlas ground mount manufactured from ZAM corrosion-resistant steel.</p>
              <div className="mt-7 grid overflow-hidden border border-[#121a20]/15 bg-white sm:grid-cols-2">
                <div className="border-b border-[#121a20]/10 p-4 sm:border-b-0 sm:border-r"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#1c5b57]">Competitive structure pricing</p><p className="mt-2 text-xl font-semibold">Less than R 1,250 per panel</p></div>
                <div className="p-4"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#1c5b57]">Material advantage</p><p className="mt-2 text-xl font-semibold">ZAM corrosion-resistant steel</p></div>
              </div>
              <div className="mt-6 grid gap-3 text-sm leading-6 text-[#121a20]/70">
                {["Panel count in, practical layout out.", "Clear pricing before a formal quote.", "Suited to farms, commercial arrays, and off-grid sites.", "Installation reviewed around the real site conditions."].map((item) => <p key={item} className="border-l-2 border-[#d9a441] pl-3">{item}</p>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pt-8 sm:px-8 lg:px-10">
        <div className="grid overflow-hidden border border-[#121a20]/15 bg-white lg:grid-cols-4">
          {quickAnswers.map((item, index) => <div key={item.question} className="border-b border-[#121a20]/10 p-5 last:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0"><p className="font-mono text-xs text-[#1c5b57]">0{index + 1}</p><h2 className="mt-4 font-semibold">{item.question}</h2><p className="mt-3 text-sm leading-6 text-[#121a20]/65">{item.answer}</p></div>)}
        </div>
      </section>

      <section id="ground-mount-options" className="mx-auto max-w-7xl scroll-mt-24 px-5 pt-16 sm:px-8 sm:pt-24 lg:px-10">
        <div className="max-w-3xl"><p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#1c5b57]">Common starting points</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">Compare Atlas ground mount sizes.</h2><p className="mt-4 text-base leading-7 text-[#121a20]/65">These structure-only guides use ZAM steel and include the Atlas connection brackets. Prices exclude VAT, delivery, foundations, and installation.</p></div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {groundMountExamples.map((item) => (
            <article key={item.panelCount} className="overflow-hidden border border-[#121a20]/15 bg-white">
              <div className="relative h-44 bg-[#1c5b57]"><Image src={galleryImages[0].src} alt={`${item.panelCount}-panel Atlas ground mount`} fill sizes="(min-width:1024px) 25vw, 50vw" className="object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-[#121a20]/55 to-transparent" /><span className="absolute bottom-4 left-4 text-xs font-semibold uppercase tracking-[0.18em] text-white">{item.panelCount} panels</span></div>
              <div className="p-5"><p className="font-mono text-xs text-[#1c5b57]">{item.bayCount} BAY{item.bayCount === 1 ? "" : "S"}</p><h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">{item.priceFrom}</h3><p className="mt-1 text-xs text-[#121a20]/50">Excl. VAT · structure only</p><div className="mt-5 border-t border-[#121a20]/10 pt-4 text-sm"><p>{item.width}m x {item.length}m indicative layout</p><p className="mt-2 text-[#121a20]/60">Priced for {item.pricedPanelCount} panels</p></div><a href="#ground-mount-estimator" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#1c5b57]">Price this layout <span aria-hidden="true">↗</span></a></div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pt-16 sm:px-8 sm:pt-24 lg:px-10">
        <div className="grid gap-5 md:grid-cols-3">{benefitCards.map((item, index) => <div key={item.title} className="border border-[#121a20]/15 bg-white p-6 sm:p-7"><p className="font-mono text-xs text-[#d9a441]">0{index + 1}</p><h2 className="mt-8 text-2xl font-semibold tracking-[-0.04em]">{item.title}</h2><p className="mt-4 text-sm leading-6 text-[#121a20]/65">{item.description}</p></div>)}</div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pt-16 sm:px-8 sm:pt-24 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div><p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#1c5b57]">From estimate to site</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">A practical route into the project.</h2><p className="mt-4 text-base leading-7 text-[#121a20]/65">Installation is confirmed after enquiry so location, access, foundations, and site conditions can be priced responsibly.</p></div>
          <div className="border-t border-[#121a20]/15">{installSteps.map((step, index) => <div key={step} className="grid grid-cols-[3rem_1fr] border-b border-[#121a20]/15 py-5"><span className="font-mono text-xs text-[#d9a441]">0{index + 1}</span><p className="text-sm leading-6">{step}</p></div>)}</div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pt-16 sm:px-8 sm:pt-24 lg:px-10">
        <div className="grid gap-4 md:grid-cols-3">{galleryImages.map((image) => <div key={image.src} className="relative h-64 overflow-hidden border border-[#121a20]/15 bg-[#1c5b57]"><Image src={image.src} alt={image.alt.replace("Smart Steel", "Atlas")} fill sizes="(min-width:768px) 33vw, 100vw" className="object-cover" /></div>)}</div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pt-16 sm:px-8 sm:pt-24 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]"><div><p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#1c5b57]">Common questions</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">Plan the structure with more certainty.</h2></div><div className="border-t border-[#121a20]/15">{faqs.map((item) => <details key={item.question} className="group border-b border-[#121a20]/15 py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">{item.question}<span className="text-xl text-[#d9a441] transition group-open:rotate-45">+</span></summary><p className="max-w-2xl pt-4 text-sm leading-6 text-[#121a20]/65">{item.answer}</p></details>)}</div></div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pt-16 sm:px-8 sm:pt-24 lg:px-10"><div className="grid gap-4 md:grid-cols-3">{supportLinks.map((item) => <Link key={item.title} href={item.href} className="group border border-[#121a20]/15 bg-white p-6 transition hover:border-[#d9a441]"><h2 className="text-xl font-semibold">{item.title}</h2><p className="mt-3 text-sm leading-6 text-[#121a20]/65">{item.description}</p><span className="mt-6 inline-flex text-sm font-semibold text-[#1c5b57]">Explore <span className="ml-2">↗</span></span></Link>)}</div></section>

      <section className="mx-auto max-w-7xl px-5 pb-6 pt-16 sm:px-8 sm:pt-24 lg:px-10"><div className="border-l-2 border-[#d9a441] pl-5 sm:pl-8"><p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#1c5b57]">The Atlas approach</p><p className="mt-4 max-w-4xl text-xl font-medium leading-8 tracking-[-0.025em] sm:text-2xl sm:leading-9">Atlas ground mounts turn panel count into a repeatable structural system: modular ZAM steel components, bolted connections, purpose-designed brackets, and a clearer route from early pricing to a site-ready solar support structure.</p></div></section>
    </main>
  )
}
