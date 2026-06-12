import Image from "next/image"
import Link from "next/link"

export const metadata = {
  title: "Steel Building Products | Smart Steel",
  description:
    "Browse Smart Steel steel building products, including LSF warehouses, CFLC warehouse kits, CFLC carport kits, solar carports, trusses, and bracketry.",
  alternates: {
    canonical: "/products",
  },
  openGraph: {
    title: "Steel Building Products | Smart Steel",
    description:
      "Explore Smart Steel steel building products with clear pages for warehouses, warehouse kits, carport kits, solar carports, trusses, and bracketry.",
    url: "https://www.smartsteel.co.za/products",
    siteName: "Smart Steel",
    locale: "en_ZA",
    type: "website",
  },
}

const mainProducts = [
  {
    eyebrow: "Custom warehouse option",
    title: "LSF Warehouses",
    description:
      "Start here if you need a larger custom warehouse, a broader scope, or more flexibility around layout and project details.",
    href: "/warehouses/lsf",
    cta: "Explore LSF warehouses",
    backgroundImage: "/warehouse.jpg",
  },
  {
    eyebrow: "Standard-size warehouse kits",
    title: "CFLC Warehouse Kits",
    description:
      "Browse practical lip channel warehouse kits with clear sizes, useful starting prices, and a simpler enquiry process.",
    href: "/products/cflc-diy-warehouse-kits",
    cta: "Explore CFLC warehouse kits",
    backgroundImage: "/warehouse.jpg",
  },
  {
    eyebrow: "Parking and cover kits",
    title: "CFLC Carport Kits",
    description:
      "Compare single and double lip channel carport kits for parking cover, side shelter, and smaller everyday steel cover projects.",
    href: "/products/cflc-carport-kits",
    cta: "Explore CFLC carport kits",
    backgroundImage: "/CFLC_carport.webp",
  },
  {
    eyebrow: "Solar parking structures",
    title: "CFLC Solar Carports",
    description:
      "Explore steel solar carport pages for covered parking, solar-ready layouts, and commercial parking projects across South Africa.",
    href: "/products/cflc-solar-carports",
    cta: "Explore CFLC solar carports",
    backgroundImage: "/images/solar-carport.webp",
  },
  {
    eyebrow: "Ground-mounted solar structures",
    title: "CFLC Ground Mounts",
    description:
      "Explore practical CFLC ground mount structures for solar projects that need scalable steel support away from buildings and parking areas.",
    href: "/products/cflc-ground-mounts",
    cta: "Explore CFLC ground mounts",
    backgroundImage: "/solar_ground_mount.webp",
  },
]

const moreProducts = [
  {
    title: "Lightweight Steel Trusses",
    description:
      "A dedicated product page for roof truss enquiries when you want a simpler starting point.",
    href: "/products/lightweight-steel-trusses",
    cta: "Explore trusses",
  },
  {
    title: "Bracketry",
    description:
      "A growing product lane for repeatable steel bracketry and related trade enquiries.",
    href: "/contact",
    cta: "Ask about bracketry",
  },
]

const quickAnswers = [
  {
    question: "Do I start here or on the warehouse pages?",
    answer:
      "Use this page if you want to compare the main product options quickly. Use the warehouse pages if you already know you need a more custom warehouse discussion.",
  },
  {
    question: "What is the difference between LSF and CFLC?",
    answer:
      "LSF suits broader custom warehouse projects. CFLC works well when you want a practical lip channel kit in a standard size.",
  },
  {
    question: "What if I am not sure which family fits my project?",
    answer:
      "Start with the closest product option, then move into the warehouse pages, estimator, or contact page if you need help narrowing it down.",
  },
]

export default function ProductsHubPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc,_#ffffff_24%,_#fff7f5)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-[2.25rem] border border-slate-200 bg-white/90 px-6 py-10 shadow-sm backdrop-blur sm:px-8 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#da1a33]">
                Products
              </p>
              <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Choose the product page that matches your project
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
                Start with LSF warehouses for custom warehouse projects, CFLC warehouse kits for
                standard-size storage buildings, CFLC carport kits for parking cover, and solar
                carports for energy-linked parking structures.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="#families"
                  className="rounded-full bg-[#da1a33] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#bf172d]"
                >
                  Browse products
                </Link>
                <Link
                  href="/warehouses"
                  className="rounded-full border border-slate-900 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white"
                >
                  Compare warehouse pages
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 px-5 py-5">
                <p className="text-2xl font-semibold text-slate-950">Clear product pages</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Explore dedicated pages for warehouses, carports, solar carports, and other steel products.
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 px-5 py-5">
                <p className="text-2xl font-semibold text-slate-950">Practical options</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Compare practical steel options for storage, parking cover, workshops, and related projects.
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 px-5 py-5">
                <p className="text-2xl font-semibold text-slate-950">Easier to compare</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  See the main Smart Steel product options more clearly before you request a quote or ask a question.
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
              A better starting point for the Smart Steel product pages
            </h2>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {quickAnswers.map((item) => (
              <div key={item.question} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <h3 className="text-base font-semibold text-slate-950">{item.question}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="families" className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
              Main Products
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              Start with the page that best matches what you need
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-600 sm:text-base">
              These are the main Smart Steel product pages for warehouses, carports, and related
              steel structures. Each one now points to a dedicated page instead of mixing unlike
              products together on one screen.
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {mainProducts.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="relative overflow-hidden rounded-[1.85rem] border border-slate-200 bg-slate-50 p-6 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
              >
                <Image
                  src={item.backgroundImage}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover object-center opacity-[0.98]"
                />
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(248,250,252,0.9),rgba(255,255,255,0.76))]" />
                <div className="relative z-10">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#da1a33]">
                    {item.eyebrow}
                  </p>
                  <h3 className="mt-4 text-2xl font-semibold text-slate-950">{item.title}</h3>
                  <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600">{item.description}</p>
                  <div className="mt-6 flex items-center justify-between">
                    <p className="text-sm font-semibold text-[#da1a33]">{item.cta}</p>
                    <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                      Open
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
              More Products
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              Other products
            </h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {moreProducts.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
                >
                  <h3 className="text-lg font-semibold text-slate-950">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
                  <p className="mt-5 text-sm font-semibold text-[#da1a33]">{item.cta}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
              Need Help Choosing?
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              Move into the right next step
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              If you are still unsure which option fits your project, the warehouse pages and the
              estimator are the best next step. They make it easier to compare sizes, pricing, and
              project scope before you enquire.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/warehouses"
                className="rounded-full bg-slate-950 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Compare warehouse pages
              </Link>
              <Link
                href="/tools/estimator"
                className="rounded-full border border-slate-300 px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Use the estimator
              </Link>
              <Link
                href="/contact"
                className="rounded-full border border-slate-300 px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Talk to Smart Steel
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
