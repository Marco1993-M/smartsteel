import { ATLAS_RULE_CHECKS, ATLAS_RULE_GROUPS } from "../../../../lib/osProductData"

export default function AtlasRulesPage() {
  return (
    <div className="space-y-6 px-4 py-5 sm:px-6 sm:py-6">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Atlas rules</p>
          <h3 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Put Atlas commercial rules in one place before they drift into quote habits
          </h3>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            This module is the operating layer for how Atlas products should be quoted consistently.
            It is where scope defaults, commercial adjustments, and review triggers can be defined
            clearly enough that the team does not have to rely on memory to protect margins or scope.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
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
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {ATLAS_RULE_GROUPS.map((group) => (
          <div key={group.key} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
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
