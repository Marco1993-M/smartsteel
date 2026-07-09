import Link from "next/link"
import { OS_SECTIONS, OS_STATUS_META } from "../../lib/osNavigation"

const PRIMARY_SECTIONS = OS_SECTIONS.filter((section) => section.key !== "dashboard")
const LIVE_SECTIONS = PRIMARY_SECTIONS.filter((section) => section.status === "live")
const NEXT_SECTIONS = PRIMARY_SECTIONS.filter((section) => section.status === "active_build")
const SCAFFOLDED_SECTIONS = PRIMARY_SECTIONS.filter((section) => section.status === "scaffolded")

export default function SmartSteelOsPage() {
  return (
    <div className="space-y-6 px-4 py-5 sm:px-6 sm:py-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Dashboard
        </p>
        <h3 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          One operating surface for sales, systems, and delivery
        </h3>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          CRM is live now. Atlas, LSF, partners, and manufacturing are structured as the next operating layers so the team can grow into one connected system.
        </p>
        <div className="mt-5">
          <Link
            href="/os/crm"
            className="inline-flex items-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Open CRM workspace
          </Link>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Live now</p>
          <div className="mt-4 space-y-3">
            {LIVE_SECTIONS.map((section) => (
              <Link
                key={section.key}
                href={section.href}
                className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-white"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-base font-semibold text-slate-900">{section.label}</p>
                  <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${OS_STATUS_META[section.status]?.badgeClassName}`}>
                    {OS_STATUS_META[section.status]?.label}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{section.description}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Next operating layers</p>
          <div className="mt-4 space-y-3">
            {NEXT_SECTIONS.map((section) => (
              <Link
                key={section.key}
                href={section.href}
                className="block rounded-2xl border border-sky-200 bg-sky-50/60 p-4 transition hover:border-sky-300 hover:bg-white"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-base font-semibold text-slate-900">{section.label}</p>
                  <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${OS_STATUS_META[section.status]?.badgeClassName}`}>
                    {OS_STATUS_META[section.status]?.label}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{section.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {section.items.slice(0, 3).map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-sky-200 bg-white px-3 py-1 text-xs font-medium text-slate-600"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Later layers</p>
          <div className="mt-4 space-y-3">
            {SCAFFOLDED_SECTIONS.map((section) => (
              <Link
                key={section.key}
                href={section.href}
                className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-white"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-base font-semibold text-slate-900">{section.label}</p>
                  <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${OS_STATUS_META[section.status]?.badgeClassName}`}>
                    {OS_STATUS_META[section.status]?.label}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{section.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
