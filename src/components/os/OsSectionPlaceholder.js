import Link from "next/link"

export default function OsSectionPlaceholder({
  title,
  description,
  items = [],
  nextStep,
  ctaLabel,
  ctaHref,
}) {
  return (
    <div className="space-y-6 px-4 py-5 sm:px-6 sm:py-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Section foundation
        </p>
        <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{title}</h3>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
        {ctaHref && ctaLabel ? (
          <Link
            href={ctaHref}
            className="mt-5 inline-flex items-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            {ctaLabel}
          </Link>
        ) : null}
      </section>

      {items.length > 0 ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Planned modules
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">{item}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {nextStep ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Next build step
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-700">{nextStep}</p>
        </section>
      ) : null}
    </div>
  )
}
