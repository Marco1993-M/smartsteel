import Image from "next/image"
import Link from "next/link"
import {
  cflcCatalogueIntroPoints,
  cflcWarehouseSelections,
  cflcCatalogueMetadata,
} from "./cflcCatalogueData"
import CflcProductSelectorClient from "./CflcProductSelectorClient"
import SystemModeSwitch from "../../../components/warehouses/SystemModeSwitch"

export const metadata = cflcCatalogueMetadata

const productQuestions = [
  {
    question: "What is included in a CFLC kit?",
    answer:
      "The standard kit includes the main frame, bracing, purlins or hats, fasteners, and drawings or an installation guide.",
  },
  {
    question: "Is sheeting included?",
    answer:
      "No. Sheeting and flashings are not included in the standard kit price unless they are specifically added.",
  },
  {
    question: "Is CFLC suitable for DIY projects?",
    answer:
      "Yes. CFLC and lip channel kits work well for DIY-friendly projects when you want a supply-only steel kit in a standard size.",
  },
  {
    question: "What sizes are available?",
    answer:
      "The current range includes 6m, 10m, and 12m span warehouse kit options in practical repeatable lengths.",
  },
  {
    question: "What happens after I request a kit?",
    answer:
      "Smart Steel reviews the size, finish, and project details with you, confirms the scope, and then prepares the final quote.",
  },
]

const supportLinks = [
  {
    title: "Browse CFLC carport kits",
    description: "See the dedicated carport page if you want single and double carport sizes first.",
    href: "/products/cflc-carport-kits",
  },
  {
    title: "Compare all warehouse systems",
    description: "Go back to the main warehouse page if you want to compare LSF and CFLC more clearly.",
    href: "/warehouses",
  },
  {
    title: "Explore LSF systems",
    description: "See the custom warehouse option if a standard-size kit does not fit the project.",
    href: "/warehouses/lsf",
  },
  {
    title: "Understand warehouse pricing",
    description: "Use the cost guide if you want more context on what changes warehouse pricing.",
    href: "/warehouse-cost",
  },
  {
    title: "Use the estimator",
    description: "Run a quick budget check if you want another pricing reference before enquiring.",
    href: "/tools/estimator",
  },
]

export default function CflcDiyWarehouseKitsPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc,_#ffffff_24%,_#fff7f5)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SystemModeSwitch
          helper="Compare CFLC and lip channel kits with custom LSF warehouse systems."
          modes={[
            {
              label: "CFLC Kits",
              href: "/products/cflc-diy-warehouse-kits",
              active: true,
              actions: [
                { label: "Browse products", href: "#choose-size" },
                { label: "Request a CFLC kit", href: "/contact", variant: "secondary" },
              ],
            },
            { label: "LSF Systems", href: "/warehouses/lsf", active: false },
          ]}
        />

        <section className="relative overflow-hidden rounded-[2.25rem] border border-slate-200 bg-white/90 px-6 py-10 shadow-sm backdrop-blur sm:px-8 lg:px-10">
          <Image
            src="/CFLC_carport.webp"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-[0.98]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(255,255,255,0.76))]" />
          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#da1a33]">
                CFLC Warehouse Kits
              </p>
              <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                CFLC warehouse kits built for easier lip channel warehouse comparison
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
                Compare practical CFLC and lip channel warehouse kit sizes. Choose a size, see the
                product details clearly, and request the warehouse kit that fits your project.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="#choose-size"
                  className="rounded-full bg-[#da1a33] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#bf172d]"
                >
                  Browse standard sizes
                </Link>
                <Link
                  href="/contact"
                  className="rounded-full border border-slate-900 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white"
                >
                  Request a CFLC kit
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 px-5 py-5">
                <p className="text-2xl font-semibold text-slate-950">6m, 10m, 12m</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  practical warehouse kit spans for storage, workshops, and covered work areas
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 px-5 py-5">
                <p className="text-2xl font-semibold text-slate-950">Standard warehouse sizes</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  straightforward warehouse kit sizes that are easier to compare before you enquire
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 px-5 py-5">
                <p className="text-2xl font-semibold text-slate-950">Clear starting prices</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  a simpler way to compare common kit sizes before you send an enquiry
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-4">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white px-5 py-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">DIY supply only</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              A straightforward option if you want a practical supply-only kit.
            </p>
          </div>
          <div className="rounded-[1.75rem] border border-slate-200 bg-white px-5 py-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">Standard kit sizes</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Compare common warehouse kit sizes in one place.
            </p>
          </div>
          <div className="rounded-[1.75rem] border border-slate-200 bg-white px-5 py-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">Starting prices shown</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              See a useful price anchor early so you can compare options faster.
            </p>
          </div>
          <div className="rounded-[1.75rem] border border-slate-200 bg-white px-5 py-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">5-8 working days</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Made to order if the selected product is not already available in store.
            </p>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
              Why CFLC
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              A practical lip channel steel kit range for easier browsing, clearer pricing, and faster decisions
            </h2>
            <div className="mt-5 space-y-3">
              {cflcCatalogueIntroPoints.map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-sm leading-6 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
              Need Something Bigger?
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              Explore the broader warehouse options too
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              If you need a larger custom warehouse, want to compare LSF and CFLC more fully, or
              want a more visual starting point, the warehouse section is the best place to
              continue.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/warehouses/lsf"
                className="rounded-full bg-slate-950 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Explore LSF systems
              </Link>
              <Link
                href="/warehouses"
                className="rounded-full border border-slate-300 px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Explore all warehouse pages
              </Link>
            </div>
          </div>
        </section>

        <CflcProductSelectorClient products={cflcWarehouseSelections} />

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
              Need Something More Custom?
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              Explore LSF if you need a more custom warehouse
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              If the standard CFLC sizes do not fit, or you want to compare cladding, openings,
              and scope in a more custom quote, the LSF warehouse page is the better place to
              continue.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/warehouses/lsf"
                className="rounded-full bg-slate-950 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Explore LSF systems
              </Link>
              <Link
                href="/warehouse-builder"
                className="rounded-full border border-slate-300 px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Use the warehouse builder
              </Link>
            </div>
          </div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
              Buying Made Easier
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              A clearer page for choosing the right steel kit
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              This page is built to help you compare sizes, understand what is included, and choose
              a practical CFLC kit without having to start with a complicated custom process.
            </p>
            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-700">
                Clear sizes and starting prices near the top
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-700">
                Product details that update as you choose a size
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-700">
                A simpler enquiry process for direct buyers and trade enquiries
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
            Common Questions
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-950">
            The main questions clients ask before they request a kit
          </h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {productQuestions.map((item) => (
              <div key={item.question} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-900">{item.question}</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
            More Help
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-950">
            Explore the pages that help you compare your options
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
