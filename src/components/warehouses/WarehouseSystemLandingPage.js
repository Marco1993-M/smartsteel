import Link from "next/link"

export default function WarehouseSystemLandingPage({
  eyebrow,
  title,
  intro,
  systemName,
  summary,
  bestFor,
  strengths,
  process,
  faqs,
  ctaPrimary,
  ctaSecondary,
  ctaTertiary,
  alternateSystem,
}) {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#fff7f5,_#ffffff_22%,_#edf3f7)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-[2.25rem] border border-slate-200 bg-white/90 px-6 py-10 shadow-sm backdrop-blur sm:px-8 lg:px-10">
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#da1a33]">
              {eyebrow}
            </p>
            <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              {title}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
              {intro}
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={ctaPrimary.href}
              className="rounded-full bg-[#da1a33] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#bf172d]"
            >
              {ctaPrimary.label}
            </Link>
            <Link
              href={ctaSecondary.href}
              className="rounded-full border border-slate-900 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white"
            >
              {ctaSecondary.label}
            </Link>
            <Link
              href={ctaTertiary.href}
              className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              {ctaTertiary.label}
            </Link>
          </div>
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-3">
          {summary.map((item) => (
            <div
              key={item.title}
              className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm"
            >
              <p className="text-sm font-semibold text-slate-900">{item.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
            </div>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
              Best For
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              Where {systemName} fits best
            </h2>
            <div className="mt-5 space-y-3">
              {bestFor.map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-sm leading-6 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
              Why Buyers Choose It
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              Practical reasons this system works
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {strengths.map((item) => (
                <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-slate-950 px-6 py-8 text-white shadow-sm sm:px-8">
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
              How Smart Steel Helps
            </p>
            <h2 className="mt-3 text-3xl font-semibold">
              Clear next steps from first idea to proper quote
            </h2>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {process.map((item, index) => (
              <div key={item.title} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                  Step {index + 1}
                </p>
                <p className="mt-2 text-lg font-semibold text-white">{item.title}</p>
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
              FAQs about {systemName}
            </h2>
            <div className="mt-5 space-y-3">
              {faqs.map((faq) => (
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
              Related Warehouse Pages
            </p>
            <div className="mt-5 space-y-3">
              <Link
                href={alternateSystem.href}
                className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-slate-300 hover:bg-white"
              >
                <p className="text-sm font-semibold text-slate-900">{alternateSystem.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{alternateSystem.description}</p>
              </Link>
              <Link
                href="/warehouses/lsf-vs-cflc"
                className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-slate-300 hover:bg-white"
              >
                <p className="text-sm font-semibold text-slate-900">LSF vs CFLC comparison</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Compare the two warehouse systems side by side before you decide which path to follow.
                </p>
              </Link>
              <Link
                href="/warehouse-builder"
                className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-slate-300 hover:bg-white"
              >
                <p className="text-sm font-semibold text-slate-900">Warehouse builder</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Shape a live warehouse design and send a structured enquiry with the system that suits you best.
                </p>
              </Link>
              <Link
                href="/tools/estimator"
                className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-slate-300 hover:bg-white"
              >
                <p className="text-sm font-semibold text-slate-900">Warehouse estimator</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Run a fast budget check if you want a simpler pricing starting point first.
                </p>
              </Link>
            </div>
          </aside>
        </section>
      </div>
    </main>
  )
}
