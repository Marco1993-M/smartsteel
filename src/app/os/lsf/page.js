import Link from "next/link"
import {
  LSF_FAMILIES,
  LSF_MODULES,
  LSF_NAV_ITEMS,
  LSF_WORKSPACE_PRIORITIES,
} from "../../../lib/osProductData"

export default function LsfOsPage() {
  return (
    <div className="space-y-6 px-4 py-5 sm:px-6 sm:py-6">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            LSF line
          </p>
          <h3 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            LSF product workspace
          </h3>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            The working home for the light steel frame line: products, wall and roof systems, modules, pricing, engineering, and documents.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/os/lsf/products"
              className="inline-flex items-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Open LSF products
            </Link>
            <Link
              href="/os/lsf/wall-systems"
              className="inline-flex items-center rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Open wall systems
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Immediate priority
          </p>
          <div className="mt-4 space-y-3">
            {LSF_WORKSPACE_PRIORITIES.map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm leading-6 text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Product families
            </p>
            <h3 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              Structured around the LSF line, not only quote labels
            </h3>
          </div>
          <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">
            5 working families
          </span>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {LSF_FAMILIES.map((family) => (
            <div key={family.key} className={`rounded-3xl border p-5 ${family.tone}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{family.label}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{family.summary}</p>
                </div>
                <span className="rounded-full border border-white/80 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                  {family.focus}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {family.products.map((product) => (
                  <span
                    key={product}
                    className="rounded-full border border-white/80 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                  >
                    {product}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Module build order
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {LSF_MODULES.map((module) => (
              <div key={module.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-base font-semibold text-slate-900">{module.label}</p>
                  <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                    {module.status}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{module.description}</p>
                {LSF_NAV_ITEMS.find((item) => item.label === module.label) ? (
                  <Link
                    href={LSF_NAV_ITEMS.find((item) => item.label === module.label).href}
                    className="mt-3 inline-flex items-center text-sm font-semibold text-slate-900"
                  >
                    Open module
                  </Link>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
