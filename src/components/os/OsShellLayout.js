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
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fafc_32%,_#e2e8f0_100%)] px-4 text-slate-900">
        <div className="rounded-3xl border border-slate-200 bg-white/90 px-8 py-6 text-sm text-slate-600 shadow-sm">
          Loading Smart Steel OS...
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen max-w-full overflow-x-hidden bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fafc_24%,_#eef3f7_100%)] pt-16 text-slate-900 sm:pt-20">
      <div className="grid min-h-[calc(100vh-4rem)] min-w-0 sm:min-h-[calc(100vh-5rem)] lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="min-w-0 max-w-full overflow-hidden border-b border-white/10 bg-[linear-gradient(180deg,_#0f172a,_#111827)] text-white lg:border-b-0 lg:border-r">
          <div className="px-4 py-4 sm:p-6">
            <Link href="/os" className="block">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-200">
                Smart Steel OS
              </p>
              <h1 className="mt-1.5 text-xl font-bold tracking-tight sm:text-2xl">Operating System</h1>
              <p className="mt-1.5 hidden text-sm leading-6 text-slate-300 sm:block">
                Dashboard-first operating surface for CRM, product systems, partners, and manufacturing.
              </p>
            </Link>
          </div>

          <nav className="flex min-w-0 max-w-full gap-2 overflow-x-auto px-3 pb-3 lg:block lg:space-y-1 lg:overflow-visible lg:px-4 lg:pb-6">
            {OS_SECTIONS.map((section) => {
              const isActive =
                pathname === section.href || (section.href !== "/os" && pathname?.startsWith(`${section.href}/`))

              return (
                <Link
                  key={section.key}
                  href={section.href}
                  className={`min-w-fit rounded-2xl px-3.5 py-2.5 transition lg:block lg:px-4 lg:py-3 ${
                    isActive
                      ? "bg-white text-slate-950 shadow-sm"
                      : "bg-white/5 text-slate-200 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold whitespace-nowrap">{section.label}</p>
                    {section.status ? (
                      <span
                        className={`hidden rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] sm:inline-flex ${
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

        <main className="min-w-0 max-w-full overflow-x-hidden bg-slate-50">
          <div className="border-b border-slate-200 bg-white px-4 py-3 shadow-sm sm:px-6 sm:py-4">
            <div className="flex min-w-0 flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {activeSection.label}
                </p>
                <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                  {activeSection.label === "Dashboard" ? "Smart Steel OS Dashboard" : `${activeSection.label} Workspace`}
                </h2>
                <p className="mt-1.5 max-w-3xl text-sm leading-6 text-slate-600">
                  {activeSection.description}
                </p>
              </div>
              {activeSection.status ? (
                <span
                  className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${OS_STATUS_META[activeSection.status]?.badgeClassName}`}
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
