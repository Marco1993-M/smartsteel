import Image from "next/image"
import Link from "next/link"
import SystemModeSwitch from "./SystemModeSwitch"

export default function WarehouseSystemLandingPage({
  modeSwitch,
  eyebrow,
  title,
  intro,
  heroImage,
  heroImageAlt,
  systemName,
  summary,
  bestFor,
  strengths,
  process,
  faqs,
  ctaPrimary,
  ctaSecondary,
  entryPaths = [],
  alternateSystem,
}) {
  const hasPrimaryCta = Boolean(ctaPrimary?.href && ctaPrimary?.label)
  const hasSecondaryCta = Boolean(ctaSecondary?.href && ctaSecondary?.label)
  const hasAlternateSystem = Boolean(
    alternateSystem?.href && alternateSystem?.title && alternateSystem?.description
  )

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#fff7f5,_#ffffff_22%,_#edf3f7)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {modeSwitch ? (
          <div className="mb-6">
            <SystemModeSwitch helper={modeSwitch.helper} modes={modeSwitch.modes} />
          </div>
        ) : null}

        <section className="rounded-[2.25rem] border border-slate-200 bg-white/90 px-6 py-10 shadow-sm backdrop-blur sm:px-8 lg:px-10">
          <div className={`grid gap-8 ${heroImage ? "lg:grid-cols-[1.05fr_0.95fr] lg:items-center" : ""}`}>
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

              {hasPrimaryCta || hasSecondaryCta ? (
                <div className="mt-8 flex flex-wrap gap-3">
                  {hasPrimaryCta ? (
                    <Link
                      href={ctaPrimary.href}
                      className="rounded-full bg-[#da1a33] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#bf172d]"
                    >
                      {ctaPrimary.label}
                    </Link>
                  ) : null}
                  {hasSecondaryCta ? (
                    <Link
                      href={ctaSecondary.href}
                      className="rounded-full border border-slate-900 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white"
                    >
                      {ctaSecondary.label}
                    </Link>
                  ) : null}
                </div>
              ) : null}
            </div>

            {heroImage ? (
              <div className="relative min-h-[320px] overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-50 shadow-sm">
                <Image
                  src={heroImage}
                  alt={heroImageAlt || title}
                  fill
                  priority
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover"
                />
              </div>
            ) : null}
          </div>
        </section>

        <section className={`mt-8 grid gap-4 ${summary.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
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

        {entryPaths.length ? (
          <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
              Start Your Project
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              Choose the route that suits how you want to begin
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {entryPaths.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-sm"
                >
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
              System Overview
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
              Clear next steps from first idea to a practical quotation
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

        <section className={`mt-8 grid gap-6 ${hasAlternateSystem ? "lg:grid-cols-[0.95fr_1.05fr]" : ""}`}>
          {hasAlternateSystem ? (
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
                Need The Other Route?
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">{alternateSystem.title}</h2>
              <p className="mt-4 text-sm leading-6 text-slate-600">{alternateSystem.description}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={alternateSystem.href}
                  className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Open {alternateSystem.title}
                </Link>
                <Link
                  href="/warehouses/lsf-vs-cflc"
                  className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  Compare LSF and CFLC
                </Link>
              </div>
            </div>
          ) : null}

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
        </section>

        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white px-6 py-8 shadow-sm sm:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
                Ready To Start?
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-950">
                Take the next step with the route that suits your project best
              </h2>
            </div>
            {hasPrimaryCta || hasSecondaryCta ? (
              <div className="flex flex-wrap gap-3">
                {hasPrimaryCta ? (
                  <Link
                    href={ctaPrimary.href}
                    className="rounded-full bg-[#da1a33] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#bf172d]"
                  >
                    {ctaPrimary.label}
                  </Link>
                ) : null}
                {hasSecondaryCta ? (
                  <Link
                    href={ctaSecondary.href}
                    className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                  >
                    {ctaSecondary.label}
                  </Link>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  )
}
