import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

export default function AtlasModuleHero({
  eyebrow,
  title,
  description,
  status,
  actionHref,
  actionLabel,
}) {
  return (
    <section className="relative overflow-hidden rounded-[1.65rem] border border-[#001d2e] bg-[radial-gradient(circle_at_88%_0%,rgba(193,217,229,0.2),transparent_34%),linear-gradient(140deg,#001d2e,#0043f3)] text-white shadow-[0_22px_55px_rgba(0,29,46,0.2)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,transparent_58%,rgba(193,217,229,0.16)_58%,rgba(193,217,229,0.16)_59%,transparent_59%)]" />
      <div className="relative grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-sm bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#0043f3]">Atlas system</span>
            {status ? (
              <span className="rounded-sm border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#c1d9e5]">
                {status}
              </span>
            ) : null}
          </div>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.22em] text-[#c1d9e5]">{eyebrow}</p>
          <h1 className="mt-2 max-w-4xl text-3xl font-bold tracking-[-0.04em] sm:text-5xl">{title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">{description}</p>
        </div>
        {actionHref && actionLabel ? (
          <Link
            href={actionHref}
            className="inline-flex w-fit items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/10"
          >
            {actionLabel} <ArrowUpRight className="h-4 w-4" />
          </Link>
        ) : null}
      </div>
    </section>
  )
}
