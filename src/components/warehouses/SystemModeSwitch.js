import Link from "next/link"

export default function SystemModeSwitch({ helper, modes }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white px-4 py-4 shadow-sm">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1">
            {modes.map((mode) =>
              mode.active ? (
                <span
                  key={mode.label}
                  className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                >
                  {mode.label}
                </span>
              ) : (
                <Link
                  key={mode.label}
                  href={mode.href}
                  className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-slate-950"
                >
                  {mode.label}
                </Link>
              )
            )}
          </div>
          {helper ? <p className="text-sm leading-6 text-slate-600">{helper}</p> : null}
        </div>

        {modes.find((mode) => mode.active)?.actions?.length ? (
          <div className="flex flex-wrap gap-3">
            {modes
              .find((mode) => mode.active)
              .actions.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className={
                    action.variant === "secondary"
                      ? "rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                      : "rounded-full bg-[#da1a33] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#bf172d]"
                  }
                >
                  {action.label}
                </Link>
              ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
