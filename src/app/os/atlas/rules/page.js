import { ATLAS_RULE_CHECKS, ATLAS_RULE_GROUPS } from "../../../../lib/osProductData"
import AtlasModuleHero from "../../../../components/os/AtlasModuleHero"

export default function AtlasRulesPage() {
  return (
    <div className="space-y-6 px-4 py-5 sm:px-6 sm:py-6">
      <AtlasModuleHero
        eyebrow="Atlas operating rules"
        title="Make the right quote repeatable."
        description="Define scope defaults, commercial adjustments and review triggers clearly enough that product quality and margin protection do not depend on memory."
        status="Scope control"
        actionHref="/os/atlas/pricing"
        actionLabel="Open pricing control"
      />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Rule check before sending
          </p>
          <div className="mt-4 space-y-3">
            {ATLAS_RULE_CHECKS.map((check) => (
              <div key={check} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm leading-6 text-slate-700">{check}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="border border-slate-800 bg-slate-950 p-5 text-white shadow-sm sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">Control principle</p>
          <p className="mt-4 text-2xl font-bold tracking-tight">Standard products first. Visible exceptions second.</p>
          <p className="mt-3 text-sm leading-6 text-slate-300">Every Atlas estimate should reveal what is standard, what was selected, and what requires project-specific review.</p>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {ATLAS_RULE_GROUPS.map((group) => (
          <div key={group.key} className="border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-lg font-semibold text-slate-900">{group.label}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{group.summary}</p>
            <div className="mt-4 space-y-2">
              {group.items.map((item) => (
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
          Why rules belong here
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Protect scope clarity</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Rules reduce guesswork when Atlas products need to be priced, revised, or handed over.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Reduce manual drift</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              The same product should not quietly change depending on who prepared the quote.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Prepare for deeper logic</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Once the rules are explicit, future pricing and engineering modules can sit on top of them with less friction.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
