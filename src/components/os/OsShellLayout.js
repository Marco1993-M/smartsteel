"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSupabaseAuth } from "../../lib/supabaseAuth"
import { OS_SECTIONS, OS_STATUS_META, getOsSection } from "../../lib/osNavigation"

export default function OsShellLayout({ children }) {
  const pathname = usePathname()
  const { user, loading } = useSupabaseAuth(
    `/login?redirect=${encodeURIComponent(pathname || "/os")}`
  )
  const activeSection = getOsSection(pathname)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
        <div className="rounded-3xl border border-white/10 bg-white/5 px-8 py-6 text-sm text-slate-200 shadow-sm">
          Loading Smart Steel OS...
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-slate-950 text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="border-b border-white/10 bg-[linear-gradient(180deg,_#0f172a,_#111827)] text-white lg:border-b-0 lg:border-r">
          <div className="p-5 sm:p-6">
            <Link href="/os" className="block">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-200">
                Smart Steel OS
              </p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight">Operating System</h1>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Dashboard-first operating surface for CRM, product systems, partners, and manufacturing.
              </p>
            </Link>
          </div>

          <nav className="flex gap-2 overflow-x-auto px-3 pb-4 lg:block lg:space-y-1 lg:overflow-visible lg:px-4 lg:pb-6">
            {OS_SECTIONS.map((section) => {
              const isActive =
                pathname === section.href || (section.href !== "/os" && pathname?.startsWith(`${section.href}/`))

              return (
                <Link
                  key={section.key}
                  href={section.href}
                  className={`min-w-fit rounded-2xl px-4 py-3 transition lg:block ${
                    isActive
                      ? "bg-white text-slate-950 shadow-sm"
                      : "bg-white/5 text-slate-200 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">{section.label}</p>
                    {section.status ? (
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                          isActive ? "border-slate-200 bg-slate-100 text-slate-600" : OS_STATUS_META[section.status]?.badgeClassName
                        }`}
                      >
                        {OS_STATUS_META[section.status]?.label || section.status}
                      </span>
                    ) : null}
                  </div>
                  <p className={`mt-1 hidden text-xs leading-5 lg:block ${isActive ? "text-slate-600" : "text-slate-400"}`}>
                    {section.description}
                  </p>
                </Link>
              )
            })}
          </nav>
        </aside>

        <main className="bg-slate-50">
          <div className="border-b border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {activeSection.label}
                </p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                  {activeSection.label === "Dashboard" ? "Smart Steel OS Dashboard" : `${activeSection.label} Workspace`}
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                  {activeSection.description}
                </p>
              </div>
              {activeSection.status ? (
                <span
                  className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] ${OS_STATUS_META[activeSection.status]?.badgeClassName}`}
                >
                  {OS_STATUS_META[activeSection.status]?.label}
                </span>
              ) : null}
            </div>
          </div>
          <div>{children}</div>
        </main>
      </div>
    </div>
  )
}
