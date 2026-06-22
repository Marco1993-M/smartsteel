import Image from "next/image"
import Link from "next/link"

const PAGE_PATH = "/news/how-to-choose-a-steel-warehouse-supplier-in-south-africa"
const SITE_URL = "https://www.smartsteel.co.za"
const SHARE_IMAGE = "/warehouse.jpg"

export const metadata = {
  title: "How to Choose a Steel Warehouse Supplier in South Africa | Smart Steel",
  description:
    "Learn how to choose a steel warehouse supplier in South Africa. Compare pricing clarity, structural systems, lead times, local experience, and support before you commit.",
  alternates: {
    canonical: PAGE_PATH,
  },
  openGraph: {
    title: "How to Choose a Steel Warehouse Supplier in South Africa | Smart Steel",
    description:
      "A practical buyer's guide to choosing a steel warehouse supplier in South Africa, including pricing, systems, lead times, and support.",
    url: `${SITE_URL}${PAGE_PATH}`,
    siteName: "Smart Steel",
    locale: "en_ZA",
    type: "article",
    images: [
      {
        url: SHARE_IMAGE,
        alt: "Steel warehouse supplier guide in South Africa",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "How to Choose a Steel Warehouse Supplier in South Africa | Smart Steel",
    description:
      "A practical buyer's guide to choosing a steel warehouse supplier in South Africa, including pricing, systems, lead times, and support.",
    images: [SHARE_IMAGE],
  },
}

const evaluationPoints = [
  {
    title: "Make sure the supplier explains the type of structure clearly",
    body:
      "Not every steel warehouse supplier offers the same type of building. Some focus on standard-size lip channel kits, while others focus on larger engineered systems. A good supplier should help you understand which option fits your project instead of pushing one answer for everything.",
  },
  {
    title: "Look for pricing that is clear about what is included",
    body:
      "A warehouse price means very little if you do not know what sits behind it. Check whether delivery, installation, cladding, drawings, foundations, and engineering are included or still separate. Clear pricing helps you compare properly and avoids expensive surprises later.",
  },
  {
    title: "Ask about lead times before you get too far in",
    body:
      "A supplier can look competitive on price and still slow your project down if lead times are vague. Ask how long pricing takes, how long production takes, and what can change those timelines. Strong suppliers should be able to talk about this confidently.",
  },
  {
    title: "Check whether they have real South African project experience",
    body:
      "Local delivery, site conditions, installation realities, and client expectations all matter. A supplier that understands South African projects will usually give clearer answers about practical issues such as transport, weather exposure, site prep, and what support you can expect after the quote.",
  },
]

const supplierQuestions = [
  "What type of steel warehouse system do you recommend for my project, and why?",
  "What exactly is included in the quoted price?",
  "What is excluded from the price?",
  "How long will pricing, production, and delivery take?",
  "Do you offer standard kit options, custom systems, or both?",
  "What support do you provide after the quote and after delivery?",
]

const redFlags = [
  "Pricing is vague or avoids telling you what is excluded.",
  "The supplier cannot explain the difference between standard kits and engineered systems.",
  "Lead times are unclear or keep changing without a reason.",
  "There are no real project examples or practical buyer guidance.",
  "You are pushed to commit before you properly understand the system or scope.",
]

export default function SteelWarehouseSupplierGuidePage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How do I choose a steel warehouse supplier in South Africa?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Start by comparing the type of structure offered, pricing clarity, lead times, local experience, and what support the supplier gives before and after the quote.",
        },
      },
      {
        "@type": "Question",
        name: "What should a warehouse quote include?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "A useful warehouse quote should clearly explain what is included and excluded, such as structure, cladding, delivery, installation, drawings, foundations, and engineering.",
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
                alt="Steel warehouse supplier guide"
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
                How to Choose a Steel Warehouse Supplier in South Africa
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
                If you are comparing warehouse suppliers, the goal is not just to find a low price.
                It is to find a supplier that explains the right structure clearly, prices it
                properly, and helps you move forward with confidence.
              </p>
            </div>
          </section>

          <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-lg leading-8 text-slate-700">
              A good steel warehouse supplier should help you make better decisions before you
              spend money, not just send a number and hope you figure the rest out yourself. That
              matters even more in South Africa, where delivery, local project conditions, and the
              right type of system can change the outcome of the build quite quickly.
            </p>

            <div className="mt-8 space-y-8">
              {evaluationPoints.map((point) => (
                <section key={point.title}>
                  <h2 className="text-2xl font-semibold text-slate-950">{point.title}</h2>
                  <p className="mt-3 text-base leading-7 text-slate-600">{point.body}</p>
                </section>
              ))}
            </div>
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
                Questions to ask
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">
                Questions worth asking before you choose a supplier
              </h2>
              <div className="mt-6 space-y-3">
                {supplierQuestions.map((question) => (
                  <div
                    key={question}
                    className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-700"
                  >
                    {question}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
                Watch for this
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">
                A few warning signs to take seriously
              </h2>
              <div className="mt-6 space-y-3">
                {redFlags.map((flag) => (
                  <div
                    key={flag}
                    className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-4 text-sm leading-6 text-slate-700"
                  >
                    {flag}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
              A practical example
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              What better supplier support can look like
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              For example, some buyers want a standard lip channel kit they can compare quickly,
              while others need a larger engineered warehouse system. A supplier should make that
              difference easy to understand. Smart Steel approaches this by giving buyers clearer
              pages for kit systems versus custom systems, plus planning tools that help clients
              price and compare before they enquire.
            </p>
            <p className="mt-4 text-base leading-7 text-slate-600">
              That kind of clarity does not just help with pricing. It helps you understand whether
              you are looking at the right type of structure in the first place.
            </p>
          </section>

          <section className="mt-8 rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-sm sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-red-200">
              Next step
            </p>
            <h2 className="mt-3 text-2xl font-semibold">
              Compare your options before you commit
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-200">
              If you are still deciding between a standard kit and a larger engineered warehouse,
              start with pages that explain the system clearly and tools that help you price the
              right starting point.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/warehouses"
                className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                Compare warehouse systems
              </Link>
              <Link
                href="/warehouse-cost"
                className="rounded-full border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-slate-950"
              >
                Explore warehouse pricing
              </Link>
              <Link
                href="/tools/estimator"
                className="rounded-full border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-slate-950"
              >
                Use the estimator
              </Link>
            </div>
          </section>
        </div>
      </article>
    </>
  )
}
