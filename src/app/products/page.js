import Image from "next/image"
import Link from "next/link"

const SITE_URL = "https://www.smartsteel.co.za"
const PAGE_PATH = "/products"

export const metadata = {
  title: "Steel Building Products South Africa | Smart Steel",
  description:
    "Find the right steel structure for your project: LSF warehouses, Atlas modular warehouse systems, lip channel carports, solar carports, ground mounts, and lightweight steel trusses.",
  keywords: [
    "steel building products south africa",
    "steel warehouses",
    "Atlas warehouse system",
    "lip channel warehouse kits",
    "steel carports",
    "solar carports",
    "solar ground mounts",
    "lightweight steel trusses",
  ],
  alternates: { canonical: PAGE_PATH },
  openGraph: {
    title: "Steel Building Products | Smart Steel",
    description:
      "Choose a warehouse, carport, solar structure, or truss system and continue into the right Smart Steel product page.",
    url: `${SITE_URL}${PAGE_PATH}`,
    siteName: "Smart Steel",
    locale: "en_ZA",
    type: "website",
    images: [{ url: `${SITE_URL}/warehouse.jpg`, width: 1200, height: 630, alt: "Smart Steel warehouse structures" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Steel Building Products | Smart Steel",
    description: "Find the right steel structure for your project with Smart Steel.",
    images: [`${SITE_URL}/warehouse.jpg`],
  },
}

const warehouseOptions = [
  {
    number: "01",
    eyebrow: "Custom warehouse projects",
    title: "LSF Warehouses",
    description:
      "For larger or more tailored warehouse projects where the layout, span, scope, and project details need more flexibility.",
    href: "/warehouses/lsf",
    cta: "Explore LSF warehouses",
    image: "/warehouse-13m.jpg",
    imageAlt: "Smart Steel LSF warehouse structure",
    detail: "Custom-engineered route",
    tone: "lsf",
  },
  {
    number: "02",
    eyebrow: "Modular warehouse system",
    title: "Atlas W-Series",
    description:
      "For practical warehouse, workshop, agricultural, poultry, and storage buildings built around defined 8m, 10m, and 12m spans.",
    href: "/products/cflc-diy-warehouse-kits",
    cta: "Choose an Atlas model",
    image: "/CFLC.webp",
    imageAlt: "Atlas cold-formed lip channel steel profile",
    detail: "W08, W10, and W12 models",
    tone: "atlas",
  },
]

const structureOptions = [
  {
    eyebrow: "Parking cover",
    system: "Atlas System",
    title: "Lip Channel Carports",
    description: "Practical steel carports for single, double, and larger parking cover projects.",
    href: "/products/cflc-carport-kits",
    cta: "Explore carports",
    image: "/CFLC_carport.webp",
    imageAlt: "Smart Steel lip channel carport",
  },
  {
    eyebrow: "Solar parking",
    system: "Atlas System",
    title: "Solar Carports",
    description: "Covered parking structures designed to carry solar panels, with an online starting estimate.",
    href: "/products/cflc-solar-carports",
    cta: "Price a solar carport",
    image: "/solar_carport_hero.webp",
    imageAlt: "Smart Steel solar carport structure",
  },
  {
    eyebrow: "Solar fields and farms",
    system: "Atlas System",
    title: "Solar Ground Mounts",
    description: "ZAM steel ground mount structures for practical solar arrays, priced by panel count.",
    href: "/products/cflc-ground-mounts",
    cta: "Price a ground mount",
    image: "/solar_ground_mount.webp",
    imageAlt: "Smart Steel solar ground mount structure",
  },
]

const nextStepCards = [
  ["Need a warehouse?", "Choose LSF for a tailored project or Atlas for a defined modular starting point.", "/warehouses", "Compare warehouse systems"],
  ["Ready to price it?", "Use the right online estimator to arrive at a more useful starting budget before you enquire.", "/warehouse-builder", "Open the warehouse builder"],
  ["Need a roof structure?", "Explore lightweight steel trusses for a separate roof structure enquiry.", "/products/lightweight-steel-trusses", "Explore steel trusses"],
]

function Arrow() {
  return <span aria-hidden="true" className="text-lg leading-none">↗</span>
}

export default function ProductsHubPage() {
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Smart Steel Products",
    url: `${SITE_URL}${PAGE_PATH}`,
    description: metadata.description,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: [...warehouseOptions, ...structureOptions].map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.title,
        url: `${SITE_URL}${item.href}`,
      })),
    },
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#ffffff_0%,#ffffff_7rem,#f6f7f8_15rem,#f6f7f8_100%)] pb-14 pt-24 font-sans text-[#121a20] sm:pt-28">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />

      <section className="mx-4 overflow-hidden rounded-[2rem] border border-black/10 bg-white/92 shadow-sm sm:mx-6 lg:mx-8">
        <div className="relative mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d21f35]">Smart Steel Product Hub</p>
            <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-[0.97] tracking-[-0.055em] text-[#121a20] sm:text-6xl">
              Start with what you need to build.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[#121a20]/68 sm:text-lg">
              Find the right steel structure, price a practical starting point where available, and continue into a focused product page built around your project.
            </p>
          </div>

          <nav aria-label="Product categories" className="mt-10 grid overflow-hidden rounded-[1.5rem] border border-black/10 bg-slate-50 sm:grid-cols-3">
            <a href="#warehouses" className="group border-b border-[#121a20]/15 px-5 py-5 transition hover:bg-white sm:border-b-0 sm:border-r">
              <p className="font-mono text-xs text-[#d21f35]">01</p>
              <p className="mt-2 font-semibold">Warehouses</p>
              <p className="mt-1 text-sm text-[#121a20]/60">LSF and Atlas W-Series</p>
            </a>
            <a href="#structures" className="group border-b border-[#121a20]/15 px-5 py-5 transition hover:bg-white sm:border-b-0 sm:border-r">
              <p className="font-mono text-xs text-[#d21f35]">02</p>
              <p className="mt-2 font-semibold">Cover and solar</p>
              <p className="mt-1 text-sm text-[#121a20]/60">Carports and solar structures</p>
            </a>
            <Link href="/products/lightweight-steel-trusses" className="group px-5 py-5 transition hover:bg-white">
              <p className="font-mono text-xs text-[#d21f35]">03</p>
              <p className="mt-2 font-semibold">Roof structures</p>
              <p className="mt-1 text-sm text-[#121a20]/60">Lightweight steel trusses</p>
            </Link>
          </nav>
        </div>
      </section>

      <section id="warehouses" className="mx-auto max-w-7xl scroll-mt-24 px-5 pt-14 sm:px-8 sm:pt-20 lg:px-10">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d21f35]">Warehouse systems</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">Choose the warehouse route that fits the project.</h2>
          </div>
          <Link href="/warehouses" className="inline-flex items-center gap-2 text-sm font-semibold text-[#d21f35] hover:text-[#121a20]">Compare warehouse systems <Arrow /></Link>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {warehouseOptions.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className={`group relative min-h-[430px] overflow-hidden rounded-[2rem] border p-6 shadow-sm transition hover:-translate-y-1 sm:p-8 ${item.tone === "lsf" ? "border-[#121a20] bg-[#121a20] text-white" : "border-[#001d2e] bg-[linear-gradient(135deg,#001d2e_0%,#06308d_55%,#0043f3_100%)] text-white"}`}
            >
              <Image src={item.image} alt={item.imageAlt} fill sizes="(min-width: 1024px) 50vw, 100vw" className={`object-cover transition duration-500 group-hover:scale-[1.03] ${item.tone === "atlas" ? "object-center opacity-40" : "opacity-30"}`} />
              <div className={`absolute inset-0 ${item.tone === "atlas" ? "bg-[linear-gradient(135deg,rgba(0,29,46,0.94),rgba(0,67,243,0.42))]" : "bg-[linear-gradient(135deg,rgba(18,26,32,0.88),rgba(18,26,32,0.42))]"}`} />
              {item.tone === "atlas" ? <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(132deg,transparent_65%,rgba(193,217,229,0.16)_65%,rgba(193,217,229,0.16)_66%,transparent_66%)]" /> : null}
              <div className="relative z-10 flex h-full flex-col">
                <div className="flex items-start justify-between gap-5">
                  <p className={`font-mono text-xs ${item.tone === "lsf" ? "text-[#f14c5d]" : "text-[#c1d9e5]"}`}>{item.number}</p>
                  <span className="border border-white/25 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/80">{item.detail}</span>
                </div>
                <div className="mt-auto max-w-xl">
                  <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${item.tone === "lsf" ? "text-[#f14c5d]" : "text-[#c1d9e5]"}`}>{item.eyebrow}</p>
                  <h3 className="mt-4 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">{item.title}</h3>
                  <p className="mt-5 max-w-lg text-base leading-7 text-white/76">{item.description}</p>
                  <p className={`mt-8 inline-flex items-center gap-2 border-b pb-2 text-sm font-semibold ${item.tone === "lsf" ? "border-[#f14c5d] text-[#ffadb6]" : "border-[#c1d9e5] text-white"}`}>{item.cta} <Arrow /></p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section id="structures" className="mx-auto max-w-7xl scroll-mt-24 px-5 pt-16 sm:px-8 sm:pt-24 lg:px-10">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d21f35]">Cover and solar structures</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">Choose the structure around the way your site works.</h2>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {structureOptions.map((item) => (
            <Link key={item.title} href={item.href} className="group overflow-hidden rounded-[1.7rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-[#0043f3] hover:shadow-[0_20px_45px_-32px_rgba(0,67,243,0.65)]">
              <div className="relative h-56 overflow-hidden bg-slate-100">
                <Image src={item.image} alt={item.imageAlt} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition duration-500 group-hover:scale-[1.04]" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,26,32,0.02),rgba(18,26,32,0.46))]" />
                <p className="absolute bottom-4 left-5 text-xs font-semibold uppercase tracking-[0.18em] text-white">{item.eyebrow}</p>
              </div>
              <div className="p-5 sm:p-6">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#c1d9e5] bg-[#eef6fa] py-1 pl-1.5 pr-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#0043f3]">
                  <span className="grid h-5 w-5 place-items-center overflow-hidden rounded-[0.3rem] bg-white"><Image src="/atlas/atlas-mark.png" alt="" width={14} height={15} className="h-3.5 w-3.5 object-contain" /></span>
                  {item.system}
                </span>
                <h3 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-[#121a20]">{item.title}</h3>
                <p className="mt-3 min-h-[72px] text-sm leading-6 text-[#121a20]/65">{item.description}</p>
                <p className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#d21f35]">{item.cta} <Arrow /></p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pt-16 sm:px-8 sm:pt-24 lg:px-10">
        <div className="grid gap-px overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-200 shadow-sm lg:grid-cols-3">
          {nextStepCards.map(([title, description, href, cta]) => (
            <Link key={title} href={href} className="group bg-[#f6f7f8] p-6 transition hover:bg-white sm:p-8">
              <p className="text-lg font-semibold tracking-[-0.025em] text-[#121a20]">{title}</p>
              <p className="mt-3 min-h-[72px] text-sm leading-6 text-[#121a20]/65">{description}</p>
              <p className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#d21f35]">{cta} <Arrow /></p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
