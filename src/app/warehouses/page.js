import Link from "next/link"

export const metadata = {
  title: "Warehouses | Smart Steel",
  description:
    "Explore Smart Steel warehouse systems, compare LSF and CFLC warehouses, use the warehouse builder, and estimate your next warehouse project in South Africa.",
  alternates: {
    canonical: "/warehouses",
  },
  openGraph: {
    title: "Warehouses | Smart Steel",
    description:
      "Compare Smart Steel warehouse systems, use the builder, and start the right warehouse enquiry for your project.",
    url: "https://www.smartsteel.co.za/warehouses",
    siteName: "Smart Steel",
    locale: "en_ZA",
    type: "website",
  },
}

const warehouseSystems = [
  {
    title: "LSF Warehouses",
    description:
      "A practical modular starting point for storage, workshop, fleet, and day-to-day operational space.",
    href: "/warehouses/lsf",
    cta: "Explore LSF warehouses",
  },
  {
    title: "CFLC Warehouses",
    description:
      "A clear cold formed lip channel steel option for buyers who want a more focused structural direction from the start.",
    href: "/warehouses/cflc",
    cta: "Explore CFLC warehouses",
  },
  {
    title: "LSF vs CFLC",
    description:
      "Compare the two warehouse systems side by side if you want a clearer sense of which option fits your project best.",
    href: "/warehouses/lsf-vs-cflc",
    cta: "Compare the systems",
  },
]

const warehouseTools = [
  {
    title: "Warehouse Builder",
    description:
      "Shape a live warehouse design, see the structure take form, and send a stronger enquiry.",
    href: "/warehouse-builder",
    cta: "Open the builder",
  },
  {
    title: "Warehouse Estimator",
    description:
      "Run a faster budget check if you want an indicative cost before moving into a full conversation.",
    href: "/tools/estimator",
    cta: "Use the estimator",
  },
  {
    title: "Warehouse Cost Guides",
    description:
      "Browse size-based and regional cost guidance to understand what shapes warehouse pricing.",
    href: "/warehouse-cost",
    cta: "View cost guides",
  },
]

const whyBuyersStartHere = [
  "Compare warehouse systems without guessing which path to follow.",
  "Move from a broad project idea into a clearer builder, estimator, or direct enquiry path.",
  "Keep sizing, scope, budgeting, and next steps in one place instead of jumping between disconnected pages.",
]

export default function WarehousesHubPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#fff7f5,_#ffffff_24%,_#edf3f7)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-[2.25rem] border border-slate-200 bg-white/90 px-6 py-10 shadow-sm backdrop-blur sm:px-8 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#da1a33]">
                Warehouses
              </p>
              <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Warehouses built around the way your project needs to work
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
                This is the main Smart Steel warehouse hub for custom warehouse projects. Start
                here if you want to compare LSF and CFLC warehouses, move into the builder, check a
                budget range, or start the right enquiry for your project. This side of the site is
                especially strong for broader custom planning, with LSF taking the lead when the
                project needs a more modular approach.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/warehouse-builder"
                  className="rounded-full bg-[#da1a33] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#bf172d]"
                >
                  Build your warehouse
                </Link>
                <Link
                  href="/tools/estimator"
                  className="rounded-full border border-slate-900 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white"
                >
                  Use the estimator
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 px-5 py-5">
                <p className="text-2xl font-semibold text-slate-950">2</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  warehouse systems presented clearly for easier comparison
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 px-5 py-5">
                <p className="text-2xl font-semibold text-slate-950">Builder + estimator</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  stronger ways to move from a rough idea into a practical enquiry
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 px-5 py-5">
                <p className="text-2xl font-semibold text-slate-950">South Africa</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  cost guides and regional pages that support the warehouse journey
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
              Start With The Right System
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              Choose the warehouse option that matches your project
            </h2>
            <div className="mt-5 grid gap-4">
              {warehouseSystems.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
                >
                  <p className="text-lg font-semibold text-slate-950">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                  <p className="mt-4 text-sm font-semibold text-[#da1a33]">{item.cta}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
              Why Start Here
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              A clearer way to move from idea to enquiry
            </h2>
            <div className="mt-5 space-y-3">
              {whyBuyersStartHere.map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-sm leading-6 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-sm font-semibold text-slate-900">Looking for a DIY-friendly kit instead?</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                If you want an easier product-led starting point with CFLC warehouse kits, move
                across to the products section instead of staying in the broader custom project
                flow.
              </p>
              <Link
                href="/products"
                className="mt-4 inline-flex text-sm font-semibold text-[#da1a33] transition hover:text-[#bf172d]"
              >
                Explore products & DIY systems
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-slate-950 px-6 py-8 text-white shadow-sm sm:px-8">
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
              Tools & Planning
            </p>
            <h2 className="mt-3 text-3xl font-semibold">
              Use the right tool for the stage your project is in
            </h2>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {warehouseTools.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 transition hover:border-white/20 hover:bg-white/10"
              >
                <p className="text-lg font-semibold text-white">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{item.description}</p>
                <p className="mt-4 text-sm font-semibold text-white">{item.cta}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_320px]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
              Warehouse Support Pages
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              Keep building confidence before you enquire
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Link
                href="/warehouse-cost"
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-slate-300 hover:bg-white"
              >
                <p className="text-sm font-semibold text-slate-900">Warehouse cost pages</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Compare standard warehouse sizes and pricing guidance across the range.
                </p>
              </Link>
              <Link
                href="/warehouse-regions"
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-slate-300 hover:bg-white"
              >
                <p className="text-sm font-semibold text-slate-900">Warehouse region pages</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Explore regional warehouse pages built around local delivery and commercial intent.
                </p>
              </Link>
            </div>
          </div>

          <aside className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
              Next Step
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              Ready to shape your project?
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              If you already know the broad size and use case, the builder is the strongest place
              to start. If you only want a quick budget range first, the estimator is the faster
              path.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/warehouse-builder"
                className="rounded-full bg-[#da1a33] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#bf172d]"
              >
                Go to the warehouse builder
              </Link>
              <Link
                href="/tools/estimator"
                className="rounded-full border border-slate-300 px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Go to the estimator
              </Link>
            </div>
          </aside>
        </section>
      </div>
    </main>
  )
}
