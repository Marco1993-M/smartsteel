import Link from "next/link"

const COMPARISON_ROWS = [
  {
    label: "Best fit",
    lsf: "Projects needing a modular, highly configurable warehouse shell with more public-facing sizing and scope choices.",
    cflc: "Projects where a cold formed lip channel system and a practical span-based pricing path fit the brief better.",
  },
  {
    label: "Buyer experience",
    lsf: "Great for comparing size, enclosure, cladding, openings, and installed vs supply-only scope.",
    cflc: "Great for understanding the core structure, wall height, finish choice, and overall direction of the project.",
  },
  {
    label: "Commercial style",
    lsf: "Broader modular budget path with live builder and estimator options.",
    cflc: "A simpler structural budget path focused on the main warehouse system choices.",
  },
  {
    label: "Typical strength",
    lsf: "Fast concept-to-budget flow for mainstream warehouse enquiries.",
    cflc: "A clear option for clients who already know they want a cold formed lip channel warehouse.",
  },
  {
    label: "Best next step",
    lsf: "Use the builder for a more visual design path or the estimator for a quick budget check.",
    cflc: "Use the estimator or builder, then let Smart Steel confirm the final layout and quote detail.",
  },
]

export default function WarehouseSystemsComparePage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#fff8f6,_#ffffff_24%,_#edf3f7)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-[2.25rem] border border-slate-200 bg-white/90 px-6 py-10 shadow-sm backdrop-blur sm:px-8 lg:px-10">
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#da1a33]">
              Warehouse Comparison
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              LSF vs CFLC Warehouses
            </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
              Smart Steel offers both LSF and CFLC warehouse systems. This page helps you understand
              the difference between them, where each one tends to fit best, and which option may suit
              your project more naturally.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/warehouses/lsf"
              className="rounded-full bg-[#da1a33] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#bf172d]"
            >
              Explore LSF Warehouses
            </Link>
            <Link
              href="/warehouses/cflc"
              className="rounded-full border border-slate-900 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white"
            >
              Explore CFLC Warehouses
            </Link>
            <Link
              href="/warehouse-builder"
              className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Use the Warehouse Builder
            </Link>
          </div>
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-3">
          {[
            {
              title: "Two clear warehouse options",
              description: "You can now compare two distinct warehouse systems instead of trying to force every project into one generic starting point.",
            },
            {
              title: "Better project clarity",
              description: "The more clearly the system is defined at the start, the easier it becomes to compare pricing, design direction, and the next practical step.",
            },
            {
              title: "Stronger early decisions",
              description: "You can compare the systems with a clearer understanding of the type of warehouse direction each one supports.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">{item.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
            </div>
          ))}
        </section>

        <section className="mt-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="grid border-b border-slate-200 bg-slate-50 md:grid-cols-[220px_1fr_1fr]">
            <div className="px-5 py-4 text-sm font-semibold text-slate-500">Comparison point</div>
            <div className="px-5 py-4 text-sm font-semibold text-slate-900">LSF Warehouse</div>
            <div className="px-5 py-4 text-sm font-semibold text-slate-900">CFLC Warehouse</div>
          </div>
          {COMPARISON_ROWS.map((row) => (
            <div
              key={row.label}
              className="grid border-b border-slate-200 last:border-b-0 md:grid-cols-[220px_1fr_1fr]"
            >
              <div className="bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-900">{row.label}</div>
              <div className="px-5 py-4 text-sm leading-6 text-slate-600">{row.lsf}</div>
              <div className="px-5 py-4 text-sm leading-6 text-slate-600">{row.cflc}</div>
            </div>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
              LSF Warehouse Path
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              Best when you want a more configurable modular shell
            </h2>
            <div className="mt-5 space-y-3">
              {[
                "Good fit for clients comparing cladding, enclosure, access openings, and supply vs installation scope.",
                "Strong option when you want a live visual builder flow and broader standard warehouse budget guidance.",
                "Useful for mainstream warehouse, workshop, storage, and day-to-day business building needs.",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-sm leading-6 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
              CFLC Warehouse Path
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              Best when you want a clearer cold formed warehouse route
            </h2>
            <div className="mt-5 space-y-3">
              {[
                "Good fit for projects where the cold formed lip channel approach is already part of the decision.",
                "Strong option when you want a simpler structural starting point with a practical budget path.",
                "Useful for clients who want to compare warehouse systems before moving into a more detailed quote discussion.",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-sm leading-6 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-slate-950 px-6 py-8 text-white shadow-sm sm:px-8">
          <h2 className="text-3xl font-semibold">Not sure which option suits your project?</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
            Start with the builder or estimator and choose the system that feels closest to your project.
            If you already know you want a specific warehouse system, use the dedicated product page and send
            the enquiry through with as much project context as you can.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/warehouse-builder"
              className="rounded-full bg-[#da1a33] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#bf172d]"
            >
              Start with the builder
            </Link>
            <Link
              href="/tools/estimator"
              className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-slate-950"
            >
              Use the estimator
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
