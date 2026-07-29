import {
  ATLAS_ENGINEERING_REFERENCES,
  ATLAS_ENGINEERING_STREAMS,
} from "../../../../lib/osProductData"
import AtlasModuleHero from "../../../../components/os/AtlasModuleHero"

export default function AtlasEngineeringPage() {
  return (
    <div className="space-y-6 px-4 py-5 sm:px-6 sm:py-6">
      <AtlasModuleHero
        eyebrow="Atlas engineering control"
        title="Keep the design basis visible."
        description="Bring assumptions, standard details, limits and review triggers into one controlled technical layer that supports dependable pricing, quoting and fabrication handoff."
        status="Technical control"
        actionHref="/os/atlas/components"
        actionLabel="Review component records"
      />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Engineering references
          </p>
          <div className="mt-4 space-y-3">
            {ATLAS_ENGINEERING_REFERENCES.map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm leading-6 text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="border border-slate-800 bg-slate-950 p-5 text-white shadow-sm sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">Engineering envelope</p>
          <p className="mt-4 text-2xl font-bold tracking-tight">Known limits belong with the product.</p>
          <p className="mt-3 text-sm leading-6 text-slate-300">Open technical fields remain visible hold points until a controlled calculation, drawing or specification closes them.</p>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {ATLAS_ENGINEERING_STREAMS.map((stream) => (
          <div key={stream.key} className="border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
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
            <p className="text-sm font-semibold text-slate-900">Stronger quote confidence</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Estimators can work from visible assumptions instead of relying on background knowledge.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Cleaner technical handoff</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              The jump from commercial scope to technical review gets lighter when product rules and design logic are already aligned.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Better scaling path</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              This gives Atlas a stronger base for later documents, revisions, and manufacturing workflows inside the OS.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
