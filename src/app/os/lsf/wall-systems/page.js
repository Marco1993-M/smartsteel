import { LSF_WALL_SYSTEM_GROUPS } from "../../../../lib/osProductData"

export default function LsfWallSystemsPage() {
  return (
    <div className="space-y-6 px-4 py-5 sm:px-6 sm:py-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">LSF wall systems</p>
        <h3 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Wall system groups for the LSF line
        </h3>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          This is the start of the LSF wall systems workspace. The goal is to group recurring wall
          logic in a way that can later support pricing, engineering control, and repeatable quoting.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {LSF_WALL_SYSTEM_GROUPS.map((group) => (
          <div key={group.key} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-lg font-semibold text-slate-900">{group.label}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {group.items.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
