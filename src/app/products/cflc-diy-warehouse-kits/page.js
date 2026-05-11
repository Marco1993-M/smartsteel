import Image from "next/image"
import Link from "next/link"
import {
  cflcCatalogueIntroPoints,
  cflcCatalogueMetadata,
  cflcLaunchRanges,
  cflcStarterKits,
} from "./cflcCatalogueData"

export const metadata = cflcCatalogueMetadata

export default function CflcDiyWarehouseKitsPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc,_#ffffff_24%,_#fff7f5)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-[2.25rem] border border-slate-200 bg-white/90 px-6 py-10 shadow-sm backdrop-blur sm:px-8 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#da1a33]">
                CFLC DIY Warehouse Kits
              </p>
              <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Practical CFLC warehouse kits built for easy product selection
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
                These CFLC warehouse kits are arranged around repeatable sizes that are easy to
                understand, easy to request, and well suited to buyers who want a simpler starting
                point than a full custom warehouse process.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="rounded-full bg-[#da1a33] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#bf172d]"
                >
                  Request a CFLC kit
                </Link>
                <Link
                  href="/products"
                  className="rounded-full border border-slate-900 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white"
                >
                  Back to products
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

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
              Why CFLC
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              A practical fit for smaller warehouses, cover kits, and easier product buying
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
              If you need a larger custom warehouse, want to compare LSF and CFLC, or want a more
              visual starting point, the warehouse section is the better place to continue.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/warehouses"
                className="rounded-full bg-slate-950 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Explore warehouse systems
              </Link>
              <Link
                href="/warehouses/cflc"
                className="rounded-full border border-slate-300 px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                View CFLC warehouse system
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
              Main Ranges
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              Start with the kit sizes that are easiest to compare
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-600 sm:text-base">
              These ranges make it easier to compare common CFLC kit sizes, from smaller cover
              products to larger warehouse options.
            </p>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-3">
            {cflcLaunchRanges.map((range) => (
              <div
                key={range.width}
                className="overflow-hidden rounded-[1.9rem] border border-slate-200 bg-slate-50 shadow-sm"
              >
                <div className="relative h-64">
                  <Image
                    src={range.image}
                    alt={range.label}
                    fill
                    sizes="(min-width: 1280px) 33vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Featured range
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      From
                    </span>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-slate-950">{range.label}</h3>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{range.fromPrice}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{range.audience}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {range.kits.map((kit) => (
                      <span
                        key={`${kit.width}-${kit.length}`}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                      >
                        {kit.width}m x {kit.length}m
                      </span>
                    ))}
                  </div>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      href="/contact"
                      className="rounded-full bg-[#da1a33] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#bf172d]"
                    >
                      Request this range
                    </Link>
                    <Link
                      href="/tools/estimator"
                      className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                    >
                      Check a budget
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
              Shop By Size
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">
              Practical CFLC kit sizes with clear starting prices
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-600 sm:text-base">
              These kits give buyers a clearer way to compare common sizes, see a starting price,
              and move straight into an enquiry.
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {cflcLaunchRanges.flatMap((range) =>
              range.kits.slice(0, 3).map((kit) => (
                <div
                  key={`${kit.width}-${kit.length}`}
                  className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        {kit.width}m span kit
                      </p>
                      <h3 className="mt-2 text-xl font-semibold text-slate-950">{kit.title}</h3>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Supply first
                    </span>
                  </div>
                  <p className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
                    {kit.priceFrom}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">Indicative supply pricing</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700">
                      {kit.width}m x {kit.length}m
                    </span>
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700">
                      Galv steel
                    </span>
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700">
                      3m wall height
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    A practical starting point for storage, workshop, covered utility, and smaller
                    warehouse use where a repeatable CFLC kit makes sense.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      href="/contact"
                      className="rounded-full bg-[#da1a33] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#bf172d]"
                    >
                      Request this kit
                    </Link>
                    <Link
                      href="/tools/estimator"
                      className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                    >
                      Check a budget
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
              Carport Products
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              Small covers and carport kits can start here too
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              If you need a smaller cover product, these CFLC options give you a simpler way to
              start with a carport or compact utility shelter before moving into a larger structure.
            </p>
            <div className="mt-5 space-y-3">
              {cflcStarterKits.map((kit) => (
                <div
                  key={kit.title}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {kit.title} · {kit.size}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{kit.description}</p>
                    </div>
                    {kit.priceFrom ? (
                      <div className="rounded-2xl bg-white px-3 py-2 sm:min-w-[140px]">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                          From
                        </p>
                        <p className="mt-1 text-lg font-semibold text-slate-950">{kit.priceFrom}</p>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
              What Happens Next
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              Request a kit, then tighten the exact scope
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Once you send the enquiry, Smart Steel can confirm the right length, finish,
              delivery, and whether the project stays DIY supply or moves into installation
              support.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/contact"
                className="rounded-full bg-[#da1a33] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#bf172d]"
              >
                Request a CFLC product
              </Link>
              <Link
                href="/warehouse-builder"
                className="rounded-full border border-slate-300 px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Prefer the builder instead?
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
