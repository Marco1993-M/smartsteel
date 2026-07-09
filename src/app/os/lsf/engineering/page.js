import {
  LSF_ENGINEERING_REFERENCES,
  LSF_ENGINEERING_STREAMS,
} from "../../../../lib/osProductData"

export default function LsfEngineeringPage() {
  return (
    <div className="space-y-6 px-4 py-5 sm:px-6 sm:py-6">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            LSF engineering
          </p>
          <h3 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Keep LSF technical logic visible before it turns into guesswork
          </h3>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            This module is where LSF design assumptions, recurring detail groups, and engineering
            review points should live. The goal is to make the technical basis behind LSF products
            clearer so quoting, pricing, and future documents all sit on more dependable ground.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Engineering references
          </p>
          <div className="mt-4 space-y-3">
            {LSF_ENGINEERING_REFERENCES.map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm leading-6 text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {LSF_ENGINEERING_STREAMS.map((stream) => (
          <div key={stream.key} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-lg font-semibold text-slate-900">{stream.label}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{stream.summary}</p>
            <div className="mt-4 space-y-2">
              {stream.items.map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-sm leading-6 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Why this module matters
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Better quote confidence</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Estimators can work from visible system assumptions instead of relying on memory or personal judgement.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Cleaner handoff</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Pricing, review, and detailing all get easier when the technical basis is already structured in the OS.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Stronger scaling path</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              This gives the LSF line a firmer base for future documents, revisions, and deeper product logic.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
