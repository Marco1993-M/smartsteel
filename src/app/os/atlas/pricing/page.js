import { ATLAS_PRICING_PILLARS } from "../../../../lib/osProductData"
import AtlasModuleHero from "../../../../components/os/AtlasModuleHero"

export default function AtlasPricingPage() {
  return (
    <div className="space-y-6 px-4 py-5 sm:px-6 sm:py-6">
      <AtlasModuleHero
        eyebrow="Atlas pricing control"
        title="One commercial basis for every Atlas product."
        description="Control family rates, inclusions, options and exceptions in one visible layer so updates remain traceable and estimates do not drift between tools."
        status="Commercial control"
        actionHref="/os/atlas/bom"
        actionLabel="Review material logic"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {ATLAS_PRICING_PILLARS.map((pillar) => (
          <div key={pillar.key} className="border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-lg font-semibold text-slate-900">{pillar.label}</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">{pillar.description}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
