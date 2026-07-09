import {
  ATLAS_BOM_PRIORITIES,
  ATLAS_BOM_RULES,
  ATLAS_BOM_WORKFLOWS,
} from "../../../../lib/osProductData"

export default function AtlasBomPage() {
  return (
    <div className="space-y-6 px-4 py-5 sm:px-6 sm:py-6">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Atlas BOM</p>
          <h3 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Build Atlas bill-of-material structure around real product families
          </h3>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            This workspace is where Atlas products should start translating into structured material logic.
            The goal is to move from manual estimate memory toward a cleaner operating layer that pricing,
            quoting, documents, and later manufacturing can all rely on.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Build first
          </p>
          <div className="mt-4 space-y-3">
            {ATLAS_BOM_PRIORITIES.map((item) => (
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
              Working workflows
            </p>
            <h3 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              Family-by-family BOM paths
            </h3>
          </div>
          <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">
            Atlas production logic
          </span>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {ATLAS_BOM_WORKFLOWS.map((workflow) => (
            <div key={workflow.key} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-lg font-semibold text-slate-900">{workflow.label}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{workflow.goal}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {workflow.stages.map((stage, index) => (
                  <span
                    key={stage}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                  >
                    {index + 1}. {stage}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            BOM structure rules
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {ATLAS_BOM_RULES.map((rule) => (
              <div key={rule} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm leading-6 text-slate-700">{rule}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Why this module matters
          </p>
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Cleaner handoff to pricing</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Pricing logic can only stay reliable if product scope is already structured before rates are applied.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Fewer quote rebuilds</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Reusable BOM paths reduce how often the team has to rebuild familiar Atlas scopes manually.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Better future manufacturing fit</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Once BOM logic is stable, Smart Steel OS can push the same structure further into purchasing, packaging, and delivery.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
