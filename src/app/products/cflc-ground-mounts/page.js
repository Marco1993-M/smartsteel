import Image from "next/image"
import Link from "next/link"
import { calculateSolarEstimate } from "../../../lib/estimates/solarEstimate"
import { formatCurrency } from "../../../lib/estimates/warehouseEstimate"

const SITE_URL = "https://www.smartsteel.co.za"
const PAGE_PATH = "/products/cflc-ground-mounts"

const groundMountExamples = [
  {
    title: "30 panel ground mount",
    panels: 30,
    width: 12,
    length: 6,
  },
  {
    title: "60 panel ground mount",
    panels: 60,
    width: 24,
    length: 6,
  },
  {
    title: "120 panel ground mount",
    panels: 120,
    width: 24,
    length: 12,
  },
].map((item) => {
  const estimate = calculateSolarEstimate({
    productType: "Solar ground mount",
    moduleCount: item.panels,
    quantity: 1,
    width: item.width,
    length: item.length,
    wallHeight: 3,
    steelFinish: "Mild",
    scope: "supply_only",
    includeStructureLabour: false,
    includeSolarBrackets: true,
    includeTransport: false,
    transportTrips: 0,
    deliveryDistance: 0,
  })

  return {
    ...item,
    priceFrom: formatCurrency(estimate.pricing.estimatedTotal),
    structureUnits: estimate.totals.structureUnits,
  }
})

export const metadata = {
  title: "Solar Ground Mount Structures South Africa | Smart Steel",
  description:
    "Explore solar ground mount structures in South Africa with Smart Steel. Compare practical steel support options, panel-count starting points, and the main price drivers.",
  keywords: [
    "solar ground mount",
    "solar ground mount south africa",
    "ground mount solar system",
    "solar mount system",
    "solar ground mount structure",
    "ground mounted solar panels",
  ],
  alternates: {
    canonical: PAGE_PATH,
  },
  openGraph: {
    title: "Solar Ground Mount Structures South Africa | Smart Steel",
    description:
      "Compare solar ground mount structures, scalable panel layouts, and practical enquiry options with Smart Steel.",
    url: `${SITE_URL}${PAGE_PATH}`,
    siteName: "Smart Steel",
    locale: "en_ZA",
    type: "website",
  },
}

const quickAnswers = [
  {
    question: "What is a solar ground mount?",
    answer:
      "It is a steel structure that supports solar panels on the ground instead of on a roof or carport.",
  },
  {
    question: "How is the system sized?",
    answer:
      "The current pricing model works from a 30-panel structure unit and scales up in larger panel totals from there.",
  },
  {
    question: "Can I choose the steel finish?",
    answer:
      "Yes. The current model allows for galvanised, mild, or ZAM steel, depending on the project requirement.",
  },
  {
    question: "What affects the price?",
    answer:
      "Panel count, steel finish, rail and brackets, installation, and transport all affect the final price.",
  },
]

const galleryImages = [
  { src: "/solar_ground_mount.webp", alt: "Smart Steel CFLC ground mount overview" },
  { src: "/solar_ground_mount_1.webp", alt: "Smart Steel CFLC ground mount side view" },
  { src: "/solar_ground_mount_2.webp", alt: "Smart Steel CFLC ground mount detail view" },
]

const supportLinks = [
  {
    title: "Explore solar carports",
    description: "See the solar carport page if your project needs covered parking instead of a ground-mounted structure.",
    href: "/products/cflc-solar-carports",
  },
  {
    title: "Use the estimator",
    description: "Check a starting budget if you want another pricing reference before you enquire.",
    href: "/tools/estimator",
  },
  {
    title: "Talk to Smart Steel",
    description: "Send your panel count and project details if you want help with the next step.",
    href: "/contact",
  },
]

export default function CflcGroundMountsPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc,_#ffffff_24%,_#fff7f5)] px-4 py-10 sm:px-6 lg:px-8">
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
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(255,255,255,0.78))]" />
          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#da1a33]">
                Solar Ground Mounts
              </p>
              <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Solar ground mount structures for practical solar field layouts
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
                Explore scalable steel ground mount structures for solar projects across South
                Africa. Use this page to compare likely panel counts, starting sizes, and the main
                factors that change price.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="#ground-mount-options"
                  className="rounded-full bg-[#da1a33] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#bf172d]"
                >
                  View solar ground mounts
                </Link>
                <Link
                  href="/contact"
                  className="rounded-full border border-slate-900 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white"
                >
                  Request a ground mount quote
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 px-5 py-5">
                <p className="text-2xl font-semibold text-slate-950">30-panel structure unit</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  The current model starts with a practical 30-panel structure and scales up from there.
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 px-5 py-5">
                <p className="text-2xl font-semibold text-slate-950">Galv, Mild or ZAM steel</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Choose the steel finish that best matches the project and budget requirement.
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 px-5 py-5">
                <p className="text-2xl font-semibold text-slate-950">Scalable solar support</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  A practical steel option for projects that need ground-mounted solar support instead of roof or parking structures.
                </p>
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
              A few useful answers before you enquire
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
              Example ground mount sizes
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-600 sm:text-base">
              These examples use the current CFLC ground mount pricing model as a guide. Final pricing
              still depends on steel finish, transport, rail and brackets, and installation scope.
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
              The guide prices below use mild steel with rails and brackets included, but exclude VAT,
              transport, and installation so the starting point stays more comparable across projects.
            </p>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            {groundMountExamples.map((item) => (
              <div key={item.title} className="rounded-[1.85rem] border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <div className="relative mb-5 h-48 overflow-hidden rounded-[1.5rem] border border-slate-200">
                  <Image
                    src={galleryImages[0].src}
                    alt={galleryImages[0].alt}
                    fill
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    className="object-cover object-center"
                  />
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#da1a33]">
                  {item.panels} panels
                </p>
                <h3 className="mt-3 text-xl font-semibold text-slate-950">{item.title}</h3>
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
                      Structure units
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      {item.structureUnits} x 30-panel structure units
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Starting from
                    </p>
                    <p className="mt-2 text-xl font-semibold text-slate-950">{item.priceFrom}</p>
                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      Includes rails and brackets. Excludes VAT, transport, and installation.
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
              Ground Mount Photos
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              Real images help show the structure more clearly
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {galleryImages.map((image) => (
                <div key={image.src} className="relative h-40 overflow-hidden rounded-[1.5rem] border border-slate-200">
                  <Image src={image.src} alt={image.alt} fill sizes="33vw" className="object-cover object-center" />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
              What Usually Changes The Price
            </p>
            <div className="mt-5 space-y-3">
              {[
                "Total panel count and the number of 30-panel structure units required.",
                "Whether you need galvanised or mild steel.",
                "Whether rail, brackets, and installation need to be included.",
                "Transport distance and number of trips to site.",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-sm leading-6 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
              Next Step
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              Send your panel count and project details
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              If you already know the panel count, steel finish, or delivery location, include that
              in the enquiry. It will make the next quote step much quicker.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/contact"
                className="rounded-full bg-slate-950 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Request a ground mount quote
              </Link>
              <Link
                href="/tools/estimator"
                className="rounded-full border border-slate-300 px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Use the estimator
              </Link>
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
