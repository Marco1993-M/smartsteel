import { LSF_PRICING_PILLARS } from "../../../../lib/osProductData"

export default function LsfPricingPage() {
  return (
    <div className="space-y-6 px-4 py-5 sm:px-6 sm:py-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">LSF pricing</p>
        <h3 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Pricing control should live here for the LSF line
        </h3>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          This page marks the LSF pricing workspace. It should become the place where system rates,
          scope logic, options, and engineering-led adjustments are controlled more consistently.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {LSF_PRICING_PILLARS.map((pillar) => (
          <div key={pillar.key} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-lg font-semibold text-slate-900">{pillar.label}</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">{pillar.description}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
