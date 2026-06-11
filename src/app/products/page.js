import Image from "next/image"
import Link from "next/link"
import { cflcLaunchRanges } from "./cflc-diy-warehouse-kits/cflcCatalogueData"

export const metadata = {
  title: "Products & DIY Systems | Smart Steel",
  description:
    "Explore Smart Steel products and DIY systems, including CFLC warehouse kits, trusses, bracketry, and easy product enquiries.",
  alternates: {
    canonical: "/products",
  },
  openGraph: {
    title: "Products & DIY Systems | Smart Steel",
    description:
      "Browse Smart Steel products and DIY systems, led by CFLC warehouse kits and supported by simple enquiry options.",
    url: "https://www.smartsteel.co.za/products",
    siteName: "Smart Steel",
    locale: "en_ZA",
    type: "website",
  },
}

const catalogueCards = [
  {
    title: "CFLC DIY Warehouse Kits",
    backgroundImage: "/CFLC_carport.webp",
    description:
      "Our lead DIY warehouse range for smaller spans, practical steel use, and better value on simpler projects.",
    href: "/products/cflc-diy-warehouse-kits",
    cta: "Explore CFLC warehouse kits",
    status: "Lead product",
  },
  {
    title: "DIY Carport Kits",
    backgroundImage: "/CFLC_carport.webp",
    description:
      "A future-ready category for practical shade and cover kits that buyers can request more easily.",
    href: "/contact",
    cta: "Request a DIY carport kit",
    status: "Request now",
  },
  {
    title: "Bracketry",
    backgroundImage: "/warehouse.jpg",
    description:
      "A growing range of repeatable steel bracketry and related items for direct and trade enquiries.",
    href: "/contact",
    cta: "Ask about bracketry",
    status: "Request now",
  },
  {
    title: "Lightweight Steel Trusses",
    backgroundImage: "/images/steel-trusses-hero.jpg",
    description:
      "Browse the current truss product range if you want a simpler product enquiry starting point.",
    href: "/products/lightweight-steel-trusses",
    cta: "Explore steel trusses",
    status: "Available now",
  },
]

const tradeReasons = [
  "A clearer way to present repeatable products and DIY systems.",
  "A better bridge between direct website demand and future in-store or stockist conversations.",
  "An easier way for buyers to ask about a specific product instead of sending a vague general enquiry.",
]

const diyWarehouseKits = [
  {
    title: "CFLC 7.5m x 8m enclosed kit",
    use: "A strong smaller-span option for storage, workshop, and farm utility space where value matters.",
    image: "/CFLC.webp",
    href: "/products/cflc-diy-warehouse-kits",
    availability: "DIY supply or supply and install",
    fromPrice: cflcLaunchRanges[0]?.fromPrice,
    sizes: "6m span range",
  },
  {
    title: "CFLC 15m x 8m Smart Steel 120",
    use: "A practical mid-range CFLC kit for equipment, workshop, and operational storage use.",
    image: "/CFLC.webp",
    href: "/products/cflc-diy-warehouse-kits",
    availability: "DIY supply or supply and install",
    fromPrice: cflcLaunchRanges[1]?.fromPrice,
    sizes: "10m span range",
  },
  {
    title: "CFLC 20m x 12m Smart Steel 240",
    use: "A larger-footprint CFLC kit for warehousing, agricultural use, and commercial storage.",
    image: "/CFLC.webp",
    href: "/products/cflc-diy-warehouse-kits",
    availability: "DIY supply or supply and install",
    fromPrice: cflcLaunchRanges[2]?.fromPrice,
    sizes: "12m span range",
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
                Products & DIY Systems
              </p>
              <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Repeatable products and DIY systems made easier to browse
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
                This is the Smart Steel product hub for repeatable kits and simpler product
                enquiries. CFLC warehouse kits lead this side of the site because they are
                especially practical for smaller spans and buyers who want a straightforward place
                to start.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="rounded-full bg-[#da1a33] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#bf172d]"
                >
                  Request a product
                </Link>
                <Link
                  href="/products/cflc-diy-warehouse-kits"
                  className="rounded-full border border-slate-900 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white"
                >
                  View CFLC kit range
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 px-5 py-5">
                <p className="text-2xl font-semibold text-slate-950">CFLC-led</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  built around practical warehouse kits that are easier to request
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 px-5 py-5">
                <p className="text-2xl font-semibold text-slate-950">Trade-friendly</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  suitable for direct product requests and future stockist conversations
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 px-5 py-5">
                <p className="text-2xl font-semibold text-slate-950">Lower-ticket friendly</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  well suited to smaller spans, starter carports, and buyers who want a more accessible first step
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
              Product Categories
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              Start with the main product categories
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-600 sm:text-base">
              CFLC warehouse kits lead this section, with trusses, bracketry, and future kit
              categories supporting the wider range over time.
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {catalogueCards.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="relative overflow-hidden rounded-[1.85rem] border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
              >
                <Image
                  src={item.backgroundImage}
                  alt=""
                  fill
                  sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover object-center opacity-[0.98]"
                />
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(248,250,252,0.93),rgba(255,255,255,0.84))]" />
                <div className="relative z-10">
                  <span className="inline-flex rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {item.status}
                  </span>
                  <p className="mt-4 text-lg font-semibold text-slate-950">{item.title}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
                  <div className="mt-5 flex items-center justify-between">
                    <p className="text-sm font-semibold text-[#da1a33]">{item.cta}</p>
                    <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                      Browse
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
              DIY Warehouse Kits
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              CFLC warehouse kits at a glance
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-600 sm:text-base">
              These CFLC kits give buyers a clearer way to browse standard sizes that can be
              supplied as DIY kits or supported with installation, while the same product lane can
              now start with a simple 3m x 6m single-carport format too.
            </p>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            {diyWarehouseKits.map((item) => (
              <div
                key={item.title}
                className="overflow-hidden rounded-[1.85rem] border border-slate-200 bg-slate-50 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
              >
                <div className="relative h-64">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {item.availability}
                    </span>
                    <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {item.sizes}
                    </span>
                  </div>
                  <p className="mt-4 text-xl font-semibold text-slate-950">{item.title}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.use}</p>
                  <div className="mt-5 rounded-2xl bg-white px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Indicative supply pricing
                    </p>
                    <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                      {item.fromPrice}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">Starting point for the current CFLC range</p>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      href={item.href}
                      className="rounded-full bg-[#da1a33] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#bf172d]"
                    >
                      View products
                    </Link>
                    <Link
                      href="/contact"
                      className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                    >
                      Request product
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
              Why This Matters
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              A simpler buying path for repeatable products
            </h2>
            <div className="mt-5 space-y-3">
              {tradeReasons.map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-sm leading-6 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
              Not Looking For DIY?
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              Need a broader custom warehouse instead?
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              If your project needs a broader custom warehouse discussion, larger system comparison,
              or a more involved design path, the projects and systems side of the site is the
              better fit.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/warehouses"
                className="rounded-full bg-slate-950 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Explore projects & systems
              </Link>
              <Link
                href="/warehouse-builder"
                className="rounded-full border border-slate-300 px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Open the warehouse builder
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
