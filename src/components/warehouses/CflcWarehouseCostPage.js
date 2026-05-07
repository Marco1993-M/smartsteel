import Link from "next/link"

const COST_BANDS = [
  {
    title: "Structure direction only",
    price: "From concept stage",
    summary:
      "Useful when you want to understand the likely structural direction and compare the system before finalising the full project brief.",
  },
  {
    title: "Indicative shell budget",
    price: "Use estimator or builder",
    summary:
      "Best when you want a faster budget starting point before Smart Steel refines the final commercial route.",
  },
  {
    title: "Project-specific quote path",
    price: "Refined after review",
    summary:
      "Best when delivery, access, foundations, openings, and project detail need to be confirmed properly.",
  },
]

const FACTORS = [
  "Warehouse span, length, and wall height",
  "Steel finish choice",
  "Gable direction and overall shell strategy",
  "Delivery location and site access",
  "Openings, project notes, and final scope direction",
]

const FAQS = [
  {
    question: "How do I get a CFLC warehouse price online?",
    answer:
      "The fastest route is to use the Smart Steel estimator or warehouse builder, choose the CFLC warehouse system, and send the enquiry through with your project details.",
  },
  {
    question: "Does this page show a final fixed price?",
    answer:
      "No. It is a client-facing guide to help you understand how CFLC warehouse pricing is shaped and where to start the enquiry process.",
  },
  {
    question: "What affects the final CFLC warehouse quote most?",
    answer:
      "Span, length, wall height, steel finish, gable direction, delivery location, site access, and how complete the final project scope needs to be.",
  },
  {
    question: "Should I use the builder or the estimator first?",
    answer:
      "Use the builder if you want a more visual design flow. Use the estimator if you want a quicker budget starting point.",
  },
]

export default function CflcWarehouseCostPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#fff8f6,_#ffffff_24%,_#edf3f7)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-[2.25rem] border border-slate-200 bg-white/90 px-6 py-10 shadow-sm backdrop-blur sm:px-8 lg:px-10">
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#da1a33]">
              CFLC Warehouse Cost
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              CFLC warehouse cost in South Africa
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
              Use this page to understand how Smart Steel approaches CFLC warehouse pricing. It is the
              right starting point if you want to compare the cold formed lip channel warehouse path,
              understand what affects budget, and move into the estimator or builder with better context.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/tools/estimator"
              className="rounded-full bg-[#da1a33] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#bf172d]"
            >
              Estimate a CFLC warehouse
            </Link>
            <Link
              href="/warehouse-builder"
              className="rounded-full border border-slate-900 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white"
            >
              Build a CFLC warehouse
            </Link>
            <Link
              href="/warehouses/cflc"
              className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Explore CFLC warehouses
            </Link>
          </div>
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-3">
          {COST_BANDS.map((band) => (
            <div key={band.title} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">{band.title}</p>
              <p className="mt-3 text-2xl font-semibold text-[#da1a33]">{band.price}</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">{band.summary}</p>
            </div>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
              What Changes The Budget
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              The main things that shape a CFLC warehouse cost
            </h2>
            <div className="mt-5 space-y-3">
              {FACTORS.map((factor) => (
                <div key={factor} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-sm leading-6 text-slate-700">{factor}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
              Best Use Of This Page
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              When this guide is most useful
            </h2>
            <div className="mt-5 space-y-3">
              {[
                "You already know the project may suit a CFLC warehouse route.",
                "You want to understand the main budget drivers before you contact Smart Steel.",
                "You want a simpler client-facing starting point before using the builder or estimator.",
                "You need a cleaner SEO-style entry page for CFLC warehouse cost searches in South Africa.",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-sm leading-6 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-slate-950 px-6 py-8 text-white shadow-sm sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
            Best Next Step
          </p>
          <h2 className="mt-3 text-3xl font-semibold">
            Move from cost curiosity into a proper project conversation
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
            Smart Steel now gives you three strong ways to continue: compare the CFLC product lane, use the
            estimator for a quick budget path, or use the builder if you want to shape the warehouse visually first.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/warehouses/cflc"
              className="rounded-full bg-[#da1a33] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#bf172d]"
            >
              Explore CFLC warehouses
            </Link>
            <Link
              href="/tools/estimator"
              className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-slate-950"
            >
              Use the estimator
            </Link>
            <Link
              href="/warehouse-builder"
              className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-slate-950"
            >
              Use the builder
            </Link>
          </div>
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_320px]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
              Common Questions
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              FAQs about CFLC warehouse cost
            </h2>
            <div className="mt-5 space-y-3">
              {FAQS.map((faq) => (
                <details key={faq.question} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <summary className="cursor-pointer text-sm font-semibold text-slate-900">
                    {faq.question}
                  </summary>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>

          <aside className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
              Related Pages
            </p>
            <div className="mt-5 space-y-3">
              {[
                {
                  href: "/warehouses/cflc",
                  title: "CFLC warehouses",
                  description: "Explore the main product page for the cold formed warehouse system lane.",
                },
                {
                  href: "/warehouses/lsf-vs-cflc",
                  title: "LSF vs CFLC",
                  description: "Compare the two warehouse systems side by side before choosing your route.",
                },
                {
                  href: "/pretoria-cflc-warehouses",
                  title: "Pretoria CFLC warehouses",
                  description: "See the first regional CFLC warehouse page for Pretoria enquiries.",
                },
                {
                  href: "/johannesburg-cflc-warehouses",
                  title: "Johannesburg CFLC warehouses",
                  description: "See the first regional CFLC warehouse page for Johannesburg enquiries.",
                },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-slate-300 hover:bg-white"
                >
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                </Link>
              ))}
            </div>
          </aside>
        </section>
      </div>
    </main>
  )
}
