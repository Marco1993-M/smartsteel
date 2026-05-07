import Link from "next/link"

export default function CflcRegionPage({
  city,
  province,
  heroLabel,
  intro,
  marketFocus,
  localZones,
  industries,
  relatedCityLinks,
}) {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#fff8f6,_#ffffff_24%,_#edf3f7)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-[2.25rem] border border-slate-200 bg-white/90 px-6 py-10 shadow-sm backdrop-blur sm:px-8 lg:px-10">
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#da1a33]">
              CFLC Warehouses {city}
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              CFLC warehouses in {city}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
              {intro}
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/warehouse-builder"
              className="rounded-full bg-[#da1a33] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#bf172d]"
            >
              Build a CFLC warehouse
            </Link>
            <Link
              href="/tools/estimator"
              className="rounded-full border border-slate-900 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white"
            >
              Estimate a CFLC warehouse
            </Link>
            <Link
              href="/warehouses/cflc"
              className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Explore CFLC warehouses
            </Link>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
              Local Market Focus
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              Why CFLC warehousing fits projects in {city}
            </h2>
            <p className="mt-5 text-sm leading-7 text-slate-600">{marketFocus}</p>
            <div className="mt-5 space-y-3">
              {[
                `Province: ${province}`,
                `Typical demand areas: ${localZones.join(", ")}`,
                `Common project sectors: ${industries.join(", ")}`,
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-sm leading-6 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
              What Buyers Usually Need
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              Common CFLC warehouse priorities in {city}
            </h2>
            <div className="mt-5 space-y-3">
              {[
                `A practical warehouse system route for ${city} projects that need a cleaner structural starting point.`,
                "A quicker way to compare the warehouse direction before moving into a refined quote.",
                "A client-facing path that makes more sense when CFLC is already part of the project conversation.",
                "A stronger follow-on route into the Smart Steel estimator or builder for regional enquiries.",
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
            How To Start
          </p>
          <h2 className="mt-3 text-3xl font-semibold">
            Move from a regional search into a proper warehouse enquiry
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Choose the system",
                description: `Start with the CFLC lane if that warehouse route already suits your ${city} project best.`,
              },
              {
                title: "Set the essentials",
                description: "Use the builder or estimator to define span, length, wall height, finish, and overall direction.",
              },
              {
                title: "Refine the quote path",
                description: `Smart Steel reviews the ${city} project context, delivery realities, and the next practical step.`,
              },
            ].map((item) => (
              <div key={item.title} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                <p className="text-lg font-semibold text-white">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_320px]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
              Common Questions
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              FAQs about CFLC warehouses in {city}
            </h2>
            <div className="mt-5 space-y-3">
              {[
                {
                  question: `Can Smart Steel support CFLC warehouse enquiries in ${city}?`,
                  answer: `Yes. This page is designed to help buyers in ${city} start the CFLC warehouse conversation more clearly before moving into a refined quote path.`,
                },
                {
                  question: `Is this a fixed price for ${city}?`,
                  answer: `No. It is a region-focused product page that helps you start the right warehouse enquiry. Final pricing still depends on project detail, delivery, access, and scope.`,
                },
                {
                  question: `Should I use the builder or estimator for a ${city} project?`,
                  answer: `Use the builder if you want a more visual workflow. Use the estimator if you want a faster budget starting point first.`,
                },
              ].map((faq) => (
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
              <Link
                href="/warehouses/cflc"
                className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-slate-300 hover:bg-white"
              >
                <p className="text-sm font-semibold text-slate-900">CFLC warehouses</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Explore the main CFLC product lane before you continue into pricing or design.
                </p>
              </Link>
              <Link
                href="/cflc-warehouse-cost"
                className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-slate-300 hover:bg-white"
              >
                <p className="text-sm font-semibold text-slate-900">CFLC warehouse cost</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  See the CFLC cost guide for a cleaner budget-focused entry point.
                </p>
              </Link>
              {relatedCityLinks.map((item) => (
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
