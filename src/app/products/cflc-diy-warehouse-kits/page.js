import Link from "next/link"
import {
  cflcCatalogueIntroPoints,
  cflcFeaturedSelections,
  cflcCatalogueMetadata,
} from "./cflcCatalogueData"
import CflcProductSelectorClient from "./CflcProductSelectorClient"
import SystemModeSwitch from "../../../components/warehouses/SystemModeSwitch"

export const metadata = cflcCatalogueMetadata

export default function CflcDiyWarehouseKitsPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc,_#ffffff_24%,_#fff7f5)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SystemModeSwitch
          helper="Choose between DIY-friendly CFLC and lipped channel kits and custom LSF warehouse systems."
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

        <section className="rounded-[2.25rem] border border-slate-200 bg-white/90 px-6 py-10 shadow-sm backdrop-blur sm:px-8 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#da1a33]">
                CFLC DIY Warehouse Kits
              </p>
              <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                CFLC DIY steel kits built for easier lipped channel product selection
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
                Compare practical CFLC and lipped channel kit sizes for carports, cover kits, and
                warehouses. Choose a size, see the product details clearly, and request the kit
                that fits your project.
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
                <p className="text-2xl font-semibold text-slate-950">3m, 6m, 10m, 12m</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  sizes that cover single carports through to practical warehouse and storage kits
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 px-5 py-5">
                <p className="text-2xl font-semibold text-slate-950">Warehouse and carport sizes</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  standard warehouse kit sizes, plus a straightforward 3m x 6m single-carport option
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
              A straightforward route for buyers who want a practical supply-only kit.
            </p>
          </div>
          <div className="rounded-[1.75rem] border border-slate-200 bg-white px-5 py-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">Standard kit sizes</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Compare common carport, cover, and warehouse kit sizes in one place.
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
              A practical lipped channel steel kit range for easier browsing, clearer pricing, and faster decisions
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
              want a more visual starting point, the warehouse section is the better place to
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

        <CflcProductSelectorClient products={cflcFeaturedSelections} />

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
              Need Something More Custom?
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              Switch to the LSF route if you need a broader warehouse project path
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              If the standard CFLC sizes do not fit, or you want to compare cladding, openings,
              and scope in a more custom workflow, the LSF warehouse route is the better place to
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
              A clearer product page for a more practical steel kit
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
                A simpler request flow for direct buyers and trade enquiries
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
