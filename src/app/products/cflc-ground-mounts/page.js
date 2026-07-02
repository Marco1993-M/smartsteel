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

const examplePanelCounts = [6, 12, 30, 60]

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
    includeSolarBrackets: true,
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
  groundMountExamples.find((item) => item.panelCount === 30) || groundMountExamples[0]

export const metadata = {
  title: "Solar Ground Mount Structures South Africa | Smart Steel",
  description:
    "Price solar ground mount structures in South Africa with Smart Steel. Start with your panel count, compare practical layouts, and get a clearer project budget before you enquire.",
  keywords: [
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
    title: "Solar Ground Mount Structures South Africa | Smart Steel",
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
        alt: "Smart Steel solar ground mount structure",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Solar Ground Mount Structures South Africa | Smart Steel",
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
      "The solar ground mount system is priced in 6-panel bays. If your panel count falls between sizes, the estimate rounds up to the next practical bay.",
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
  "Install the rails, brackets, and panel support components for the final solar layout.",
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
    title: "Explore CFLC carports",
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
      "The current pricing model works in 6-panel bays, then scales the structure up in practical groups from there.",
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
  name: "Solar Ground Mount Structures",
  description:
    "Steel solar ground mount structures in South Africa with practical panel-count-led sizing and budgeting.",
  brand: {
    "@type": "Brand",
    name: "Smart Steel",
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

export default function CflcGroundMountsPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#ffffff_0%,_#ffffff_12%,_#f8fafc_30%,_#fff7f5_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="mx-auto max-w-7xl">
        <section className="relative mt-6 overflow-hidden rounded-[2.25rem] border border-slate-200 bg-white/90 px-6 py-10 shadow-sm backdrop-blur sm:px-8 lg:px-10">
          <Image
            src="/solar_ground_mount.webp"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-[0.98]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(255,255,255,0.76))]" />
          <div className="relative z-10 grid gap-8 lg:grid-cols-[0.94fr_1.06fr] lg:items-center">
            <GroundMountEstimatorClient variant="hero" />

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#da1a33]">
                Solar Ground Mounts
              </p>
              <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Get an instant price for your solar ground mount structure
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
                Start with your panel count and get a fast structure budget for a ZAM
                corrosion-resistant solar ground mount. Built for buyers who want practical
                pricing quickly for a solar ground mount system before they commit to the next step.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <div className="rounded-full border border-slate-200 bg-white/85 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Indicative pricing
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-950">
                    Less than R 1,250 per panel
                  </p>
                </div>
                <div className="rounded-full border border-slate-200 bg-white/85 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Material advantage
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-950">
                    ZAM corrosion-resistant steel
                  </p>
                </div>
              </div>
              <div className="mt-6 grid gap-3">
                {[
                  "Panel count in, practical layout out.",
                  "Clear per-panel pricing before you request a formal quote.",
                  "Built for farms, commercial arrays, and off-grid sites.",
                  "Installation reviewed properly after enquiry.",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 text-sm font-semibold text-[#da1a33]">✓</span>
                    <p className="text-sm leading-6 text-slate-700">{item}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="rounded-full border border-slate-900 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white"
                >
                  Talk to Smart Steel
                </Link>
                <Link
                  href="#ground-mount-options"
                  className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  View examples
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
              Quick Answers
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              The main questions most buyers want answered first
            </h2>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-4">
            {quickAnswers.map((item) => (
              <div key={item.question} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <h3 className="text-base font-semibold text-slate-950">{item.question}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="ground-mount-options" className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
              Common Starting Points
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              Example ground mount starting sizes
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-600 sm:text-base">
              These guide prices use ZAM steel with connection brackets included, while excluding VAT,
              delivery, and installation so you can compare a ground mounted solar structure starting
              point more easily.
            </p>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-4">
            {groundMountExamples.map((item) => (
              <div key={item.panelCount} className="rounded-[1.85rem] border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <div className="relative mb-5 h-44 overflow-hidden rounded-[1.5rem] border border-slate-200">
                  <Image
                    src={galleryImages[0].src}
                    alt={galleryImages[0].alt}
                    fill
                    sizes="(min-width: 1024px) 25vw, 100vw"
                    className="object-cover object-center"
                  />
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#da1a33]">
                  {item.panelCount} panels
                </p>
                <h3 className="mt-3 text-xl font-semibold text-slate-950">
                  {item.bayCount} bay{item.bayCount === 1 ? "" : "s"}
                </h3>
                <div className="mt-5 space-y-3">
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Indicative size
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      {item.width}m x {item.length}m
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Priced panel count
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{item.pricedPanelCount} panels</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Starting from
                    </p>
                    <p className="mt-2 text-xl font-semibold text-slate-950">{item.priceFrom}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          {benefitCards.map((item) => (
            <div key={item.title} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-lg font-semibold text-slate-950">{item.title}</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
            </div>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
              Installation Journey
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              A simpler path from pricing to installation
            </h2>
            <div className="mt-6 space-y-3">
              {installSteps.map((step, index) => (
                <div key={step} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#da1a33]">
                    Step {index + 1}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
              Ground Mount Photos
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              See the structure more clearly
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {galleryImages.map((image) => (
                <div key={image.src} className="relative h-40 overflow-hidden rounded-[1.5rem] border border-slate-200">
                  <Image src={image.src} alt={image.alt} fill sizes="33vw" className="object-cover object-center" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
            More Help
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-950">
            Explore related pages
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {supportLinks.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 transition hover:border-slate-300 hover:bg-white"
              >
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
