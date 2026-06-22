import Image from "next/image"
import Link from "next/link"

const PAGE_PATH = "/news/self-build-steel-warehouse-kits-south-africa"
const SITE_URL = "https://www.smartsteel.co.za"
const SHARE_IMAGE = "/warehouse.jpg"

export const metadata = {
  title: "Self-Build Steel Warehouse Kits in South Africa | Smart Steel",
  description:
    "Learn what it takes to plan a self-build steel warehouse kit in South Africa, from site prep and foundations to assembly, pricing, and common mistakes to avoid.",
  keywords: [
    "self-build warehouse",
    "steel warehouse kits south africa",
    "DIY steel warehouse kits",
    "build your own steel shed",
    "warehouse kits",
    "steel shed kits south africa",
  ],
  alternates: {
    canonical: PAGE_PATH,
  },
  openGraph: {
    title: "Self-Build Steel Warehouse Kits in South Africa | Smart Steel",
    description:
      "A practical guide to self-build steel warehouse kits in South Africa, including planning, foundations, assembly, and pricing logic.",
    url: `${SITE_URL}${PAGE_PATH}`,
    siteName: "Smart Steel",
    locale: "en_ZA",
    type: "article",
    images: [
      {
        url: SHARE_IMAGE,
        alt: "Self-build steel warehouse kit guide",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Self-Build Steel Warehouse Kits in South Africa | Smart Steel",
    description:
      "A practical guide to self-build steel warehouse kits in South Africa, including planning, foundations, assembly, and pricing logic.",
    images: [SHARE_IMAGE],
  },
}

const readinessChecks = [
  "You want a standard-size structure instead of a heavily customised warehouse.",
  "You already have a site, or you are close to confirming one.",
  "You are comfortable coordinating foundations, labour, and assembly locally.",
  "You want a clearer budget before moving into a bigger engineered system.",
]

const planningSteps = [
  {
    title: "Choose the right kit for the job",
    body:
      "A self-build warehouse kit works best when the building requirement is straightforward. Storage, workshops, poultry buildings, utility cover, and smaller operational buildings are often a good fit. If the project needs a wider span, unusual openings, or a more specialised layout, it is usually better to move into a custom warehouse discussion early.",
  },
  {
    title: "Confirm the site and foundation plan before you order",
    body:
      "Many self-build delays come from site issues rather than the kit itself. Ground conditions, slab levels, anchor positions, access for delivery, and drainage all need to be thought through before the structure arrives. A good self-build process starts with solid site preparation, not only with the steel order.",
  },
  {
    title: "Understand what the kit includes and what it does not",
    body:
      "A warehouse kit price can sound attractive until the buyer realises that sheeting, flashings, delivery, foundations, and installation may still sit outside the standard scope. The right question is not only what the kit costs, but what the full build will require around it.",
  },
  {
    title: "Plan the assembly sequence properly",
    body:
      "Self-build does not mean improvising on site. The most successful projects have a clear assembly plan, the right labour available on the right days, and a realistic understanding of how the frame, bracing, cladding support, and roof sequence come together.",
  },
]

const commonMistakes = [
  "Comparing kit prices without checking what is excluded.",
  "Ordering a standard-size kit for a project that actually needs a more custom solution.",
  "Leaving foundations, delivery access, or slab levels unresolved until late.",
  "Assuming the local team can assemble the structure without a proper plan or guidance.",
  "Treating the kit as the whole project budget instead of one part of the build cost.",
]

const bestFor = [
  "Storage warehouses",
  "Workshops",
  "Poultry and chicken house buildings",
  "Covered work areas",
  "Utility and agricultural structures",
]

export default function SelfBuildSteelWarehouseKitsPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Are self-build steel warehouse kits a good option in South Africa?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, when the building size is practical, the site is prepared properly, and the buyer understands what is included in the kit and what still needs to be handled separately.",
        },
      },
      {
        "@type": "Question",
        name: "What should I check before ordering a steel warehouse kit?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Check the building size, what is included and excluded, the site and foundation plan, delivery access, and who will handle the assembly.",
        },
      },
      {
        "@type": "Question",
        name: "What projects suit a self-build warehouse kit best?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Self-build kits are usually best for storage, workshops, poultry buildings, covered work areas, and other straightforward utility structures in standard sizes.",
        },
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <article className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc,_#ffffff_24%,_#fff7f5)] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <section className="overflow-hidden rounded-[2.25rem] border border-slate-200 bg-white shadow-sm">
            <div className="relative h-72 sm:h-96">
              <Image
                src={SHARE_IMAGE}
                alt="Self-build steel warehouse kit guide"
                fill
                priority
                sizes="100vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.18),rgba(15,23,42,0.58))]" />
            </div>
            <div className="px-6 py-8 sm:px-8">
              <p className="text-sm text-slate-500">22 June 2026 | Buyer&apos;s guide</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Self-build steel warehouse kits in South Africa
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
                A self-build warehouse kit can be a very practical route when you want a standard
                size, a clearer starting budget, and more control over the build. The key is
                knowing where a kit works well, what still needs to be planned around it, and what
                mistakes to avoid before you commit.
              </p>

              <div className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#da1a33]">
                    Best suited to
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {bestFor.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Ready for self-build?
                  </p>
                  <div className="mt-3 space-y-3">
                    {readinessChecks.map((item) => (
                      <div key={item} className="flex items-start gap-3 text-sm text-slate-700">
                        <span className="mt-1 h-2 w-2 rounded-full bg-[#da1a33]" />
                        <p>{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-lg leading-8 text-slate-700">
              The best self-build projects are usually the ones that stay simple. A standard-size
              steel warehouse kit helps you compare options faster, but it still needs good site
              prep, a sensible foundation plan, and a realistic build sequence. If those basics are
              handled well, a kit can be a strong route to a quicker, clearer warehouse decision.
            </p>

            <div className="mt-8 space-y-8">
              {planningSteps.map((step) => (
                <section key={step.title}>
                  <h2 className="text-2xl font-semibold text-slate-950">{step.title}</h2>
                  <p className="mt-3 text-base leading-7 text-slate-600">{step.body}</p>
                </section>
              ))}
            </div>
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
                Common mistakes
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">
                Where self-build warehouse projects often go wrong
              </h2>
              <div className="mt-6 space-y-3">
                {commonMistakes.map((item) => (
                  <div
                    key={item}
                    className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-700"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
                Next step
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">
                Compare the practical kit options first
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                If your project sounds like a good fit for a self-build route, start by comparing
                the standard-size warehouse kits. If the project turns out to need a wider span or
                more custom scope, you can move into the broader warehouse pages from there.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <Link
                  href="/products/cflc-diy-warehouse-kits"
                  className="rounded-full bg-[#da1a33] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#bf172d]"
                >
                  Browse steel warehouse kits
                </Link>
                <Link
                  href="/warehouses"
                  className="rounded-full border border-slate-300 px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  Compare all warehouse options
                </Link>
              </div>
            </div>
          </section>
        </div>
      </article>
    </>
  )
}
