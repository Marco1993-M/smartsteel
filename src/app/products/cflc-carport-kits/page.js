import Image from "next/image"
import Link from "next/link"
import { cflcCarportSelections } from "../cflc-diy-warehouse-kits/cflcCatalogueData"

const SITE_URL = "https://www.smartsteel.co.za"
const PAGE_PATH = "/products/cflc-carport-kits"

export const metadata = {
  title: "CFLC Carport Kits | Smart Steel",
  description:
    "Browse Smart Steel CFLC and lip channel carport kits for single and double carports, with clear sizes, practical starting prices, and an easy enquiry process.",
  alternates: {
    canonical: PAGE_PATH,
  },
  openGraph: {
    title: "CFLC Carport Kits | Smart Steel",
    description:
      "Compare Smart Steel CFLC and lip channel carport kits with practical sizes, clear starting prices, and a simple enquiry process.",
    url: `${SITE_URL}${PAGE_PATH}`,
    siteName: "Smart Steel",
    locale: "en_ZA",
    type: "website",
  },
}

const quickAnswers = [
  {
    question: "What sizes are available?",
    answer:
      "The current standard range starts with a 3m x 6m single carport kit and a 5m x 6m double carport kit.",
  },
  {
    question: "Is sheeting included?",
    answer:
      "No. The standard carport kit price covers the steel structure only unless cladding or other extras are added separately.",
  },
  {
    question: "Is it suitable for DIY projects?",
    answer:
      "Yes. These CFLC and lip channel carport kits are designed as practical supply-only kits with clear sizes and straightforward parts.",
  },
  {
    question: "What happens after I enquire?",
    answer:
      "Smart Steel confirms the size, finish, and project details with you, then finalises the quote and lead time.",
  },
]

const included = [
  "Main frame",
  "Bracing",
  "Purlins / hats",
  "Fasteners",
  "Drawings / installation guide",
]

const excluded = [
  "Sheeting",
  "Flashings",
  "Concrete / foundations",
  "Delivery",
  "Installation",
  "Gutters and downpipes",
]

const galleryImages = [
  { src: "/CFLC_carport.webp", alt: "Smart Steel CFLC carport overview" },
  { src: "/CFLC_carport.webp", alt: "Smart Steel CFLC carport structure view" },
  { src: "/CFLC_carport.webp", alt: "Smart Steel CFLC carport detail view" },
]

const supportLinks = [
  {
    title: "Browse all products",
    description: "Go back to the products hub if you want to compare carports, kits, and other product categories.",
    href: "/products",
  },
  {
    title: "Explore CFLC warehouse kits",
    description: "See the wider CFLC kit range if you need more than a carport or shade cover.",
    href: "/products/cflc-diy-warehouse-kits",
  },
  {
    title: "Compare warehouse systems",
    description: "Use the warehouse pages if your project is moving beyond a standard carport size.",
    href: "/warehouses",
  },
  {
    title: "Use the estimator",
    description: "Check a starting budget before you send an enquiry.",
    href: "/tools/estimator",
  },
]

export default function CflcCarportKitsPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc,_#ffffff_24%,_#fff7f5)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="relative mt-6 overflow-hidden rounded-[2.25rem] border border-slate-200 bg-white/90 px-6 py-10 shadow-sm backdrop-blur sm:px-8 lg:px-10">
          <Image
            src="/CFLC_carport.webp"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-[0.98]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(255,255,255,0.74))]" />
          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#da1a33]">
                CFLC Carport Kits
              </p>
              <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                CFLC and lip channel carport kits made easier to compare
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
                Compare practical steel carport kits for single and double parking cover, side
                shelter, and smaller utility cover projects. See the standard sizes, get a clear
                starting price, and request the kit that fits your project.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="#carport-sizes"
                  className="rounded-full bg-[#da1a33] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#bf172d]"
                >
                  Browse carport sizes
                </Link>
                <Link
                  href="/contact"
                  className="rounded-full border border-slate-900 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white"
                >
                  Request a carport kit
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 px-5 py-5">
                <p className="text-2xl font-semibold text-slate-950">Single and double carports</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Standard sizes for one vehicle, two vehicles, and compact shelter projects.
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 px-5 py-5">
                <p className="text-2xl font-semibold text-slate-950">Clear starting prices</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  A practical price guide before final delivery, finish, and project details are confirmed.
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 px-5 py-5">
                <p className="text-2xl font-semibold text-slate-950">DIY supply only</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  A simpler way to buy a practical steel cover kit without a bigger custom process.
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
              A few useful answers before you choose a carport size
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

        <section id="carport-sizes" className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
              Standard Carport Sizes
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              Compare the current CFLC carport kits
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-600 sm:text-base">
              These standard carport kits give you a clear starting point for parking cover,
              smaller utility shelter, and practical everyday steel cover projects.
            </p>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {cflcCarportSelections.map((item, index) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-[1.85rem] border border-slate-200 bg-slate-50 shadow-sm"
              >
                <div className="relative h-72">
                  <Image
                    src={galleryImages[index % galleryImages.length].src}
                    alt={galleryImages[index % galleryImages.length].alt}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.08),rgba(15,23,42,0.35))]" />
                  <div className="absolute left-5 top-5">
                    <span className="inline-flex rounded-full bg-white/92 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {item.family}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-950">{item.title}</h3>
                      <p className="mt-1 text-sm font-medium uppercase tracking-[0.16em] text-slate-500">
                        {item.size}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        From
                      </p>
                      <p className="text-2xl font-semibold text-slate-950">{item.priceFrom}</p>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-600">{item.bestFor}</p>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Weight
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-700">{item.weight}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Pack Info
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-700">{item.packInfo}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Included
                      </p>
                      <ul className="mt-2 space-y-1 text-sm leading-6 text-slate-700">
                        {included.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Not Included
                      </p>
                      <ul className="mt-2 space-y-1 text-sm leading-6 text-slate-700">
                        {excluded.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href="/contact"
                      className="rounded-full bg-[#da1a33] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#bf172d]"
                    >
                      Request this carport kit
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

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
              Recent Carport Photos
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              A clearer visual cue for where you are in the product range
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              These recent photos help show the type of practical steel carport you are looking
              at, so it is easier to see that this page is focused on parking cover and smaller
              steel shelter projects.
            </p>
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
              Need Something Bigger?
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              Move into the wider CFLC kit range or the warehouse pages
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              If you need a larger cover area, a storage building, or a more custom warehouse
              project, Smart Steel also has larger CFLC kit options and separate warehouse pages
              to help you compare the next step more clearly.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/products/cflc-diy-warehouse-kits"
                className="rounded-full bg-slate-950 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Explore CFLC warehouse kits
              </Link>
              <Link
                href="/warehouses"
                className="rounded-full border border-slate-300 px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Compare warehouse systems
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
              Helpful Links
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              Keep moving through the right product and warehouse pages
            </h2>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {supportLinks.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
              >
                <p className="text-base font-semibold text-slate-950">{item.title}</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
