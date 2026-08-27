"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import {
  BarChart3,
  Boxes,
  Factory,
  FolderKanban,
  Handshake,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  PanelsTopLeft,
  Settings,
  UsersRound,
} from "lucide-react"
import { useSupabaseAuth } from "../../lib/supabaseAuth"
import { OS_SECTIONS, OS_STATUS_META, getOsSection } from "../../lib/osNavigation"

const SECTION_ICONS = {
  dashboard: LayoutDashboard,
  crm: UsersRound,
  projects: FolderKanban,
  atlas: Boxes,
  lsf: PanelsTopLeft,
  partners: Handshake,
  manufacturing: Factory,
  analytics: BarChart3,
  settings: Settings,
}

export default function OsShellLayout({ children }) {
  const pathname = usePathname()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { user, loading } = useSupabaseAuth(
    `/login?redirect=${encodeURIComponent(pathname || "/os")}`
  )
  const activeSection = getOsSection(pathname)

  useEffect(() => {
    setSidebarCollapsed(window.localStorage.getItem("smartsteel-os-sidebar") === "collapsed")
  }, [])

  function toggleSidebar() {
    setSidebarCollapsed((current) => {
      const next = !current
      window.localStorage.setItem("smartsteel-os-sidebar", next ? "collapsed" : "expanded")
      return next
    })
  }

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
    <div className="os-shell min-h-screen w-full min-w-0 max-w-[100vw] overflow-x-hidden bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fafc_24%,_#eef3f7_100%)] text-slate-900">
      <div className={`os-shell-grid grid min-h-screen w-full min-w-0 max-w-full transition-[grid-template-columns] duration-300 ${
        sidebarCollapsed
          ? "lg:grid-cols-[84px_minmax(0,1fr)]"
          : "lg:grid-cols-[260px_minmax(0,1fr)]"
      }`}>
        <aside className="os-shell-sidebar w-full min-w-0 max-w-full overflow-hidden border-b border-white/10 bg-[linear-gradient(180deg,_#0f172a,_#111827)] text-white lg:sticky lg:top-0 lg:h-screen lg:w-auto lg:self-start lg:overflow-y-auto lg:border-b-0 lg:border-r print:hidden">
          <div className={`flex items-center justify-between gap-4 px-4 py-3 ${sidebarCollapsed ? "lg:flex-col lg:px-3 lg:py-5" : "lg:block lg:p-6"}`}>
            <Link href="/os" className={sidebarCollapsed ? "block lg:text-center" : "block"} onClick={() => setMobileNavOpen(false)}>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-200">
                <span className={sidebarCollapsed ? "lg:hidden" : ""}>Smart Steel OS</span>
                <span className={sidebarCollapsed ? "hidden lg:inline" : "hidden"}>SS</span>
              </p>
              <h1 className={`mt-1.5 hidden text-xl font-bold tracking-tight lg:text-2xl ${sidebarCollapsed ? "" : "lg:block"}`}>Operating System</h1>
              <p className="mt-1 text-sm font-semibold text-white lg:hidden">{activeSection.label}</p>
              <p className={`mt-1.5 hidden text-sm leading-6 text-slate-300 ${sidebarCollapsed ? "" : "lg:block"}`}>
                Dashboard-first operating surface for CRM, product systems, partners, and manufacturing.
              </p>
            </Link>
            <button
              type="button"
              onClick={toggleSidebar}
              className={`hidden border border-white/15 bg-white/10 text-slate-200 transition hover:bg-white/15 hover:text-white lg:inline-flex ${
                sidebarCollapsed
                  ? "h-10 w-10 items-center justify-center rounded-xl"
                  : "mt-5 items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold"
              }`}
              aria-label={sidebarCollapsed ? "Expand OS navigation" : "Collapse OS navigation"}
              title={sidebarCollapsed ? "Expand navigation" : "Collapse navigation"}
            >
              {sidebarCollapsed ? <PanelLeftOpen size={17} /> : <><PanelLeftClose size={16} /> Collapse menu</>}
            </button>
            <button
              type="button"
              onClick={() => setMobileNavOpen((current) => !current)}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/15 lg:hidden"
              aria-expanded={mobileNavOpen}
              aria-controls="os-mobile-navigation"
            >
              {mobileNavOpen ? "Close" : "OS menu"}
            </button>
          </div>

          <nav id="os-mobile-navigation" className={`${mobileNavOpen ? "grid" : "hidden"} min-w-0 max-w-full grid-cols-2 gap-2 px-3 pb-3 lg:block lg:space-y-1 lg:overflow-visible lg:px-4 lg:pb-6`}>
            {OS_SECTIONS.map((section) => {
              const isActive =
                pathname === section.href || (section.href !== "/os" && pathname?.startsWith(`${section.href}/`))
              const SectionIcon = SECTION_ICONS[section.key] || LayoutDashboard

              return (
                <Link
                  key={section.key}
                  href={section.href}
                  onClick={() => setMobileNavOpen(false)}
                  title={sidebarCollapsed ? section.label : undefined}
                  className={`min-w-0 rounded-xl px-3 py-2.5 transition lg:block lg:rounded-2xl lg:py-3 ${
                    sidebarCollapsed ? "lg:px-3" : "lg:px-4"
                  } ${
                    isActive
                      ? "bg-white text-slate-950 shadow-sm"
                      : "bg-white/5 text-slate-200 hover:bg-white/10"
                  }`}
                >
                  <div className={`flex items-center gap-3 ${sidebarCollapsed ? "lg:justify-center" : "justify-between"}`}>
                    <div className="flex min-w-0 items-center gap-3">
                      {section.key === "atlas" ? (
                        <span
                          className={`grid h-7 w-7 shrink-0 place-items-center overflow-hidden rounded-[0.45rem] border ${
                            isActive
                              ? "border-[#c1d9e5] bg-[#c1d9e5]"
                              : "border-white/20 bg-white"
                          }`}
                          aria-hidden="true"
                        >
                          <Image
                            src="/atlas/atlas-mark-dark.png"
                            alt=""
                            width={24}
                            height={25}
                            className="h-5 w-5 object-contain"
                          />
                        </span>
                      ) : (
                        <SectionIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      )}
                      <p className={`text-sm font-semibold whitespace-nowrap ${sidebarCollapsed ? "lg:hidden" : ""}`}>{section.label}</p>
                    </div>
                  </div>
                  <p className={`mt-1 hidden text-xs leading-5 ${sidebarCollapsed ? "" : "lg:block"} ${isActive ? "text-slate-600" : "text-slate-400"}`}>
                    {section.description}
                  </p>
                </Link>
              )
            })}
          </nav>
        </aside>

        <main className="os-shell-main w-full min-w-0 max-w-full overflow-x-hidden bg-slate-50 print:overflow-visible print:bg-white">
          <div className="os-shell-header border-b border-slate-200 bg-white px-4 py-2.5 shadow-sm sm:px-6 sm:py-4 print:hidden">
            <div className="flex min-w-0 flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {activeSection.label}
                </p>
                <h2 className="mt-0.5 text-lg font-bold tracking-tight text-slate-900 sm:mt-1 sm:text-2xl">
                  {activeSection.label === "Dashboard" ? "Smart Steel OS Dashboard" : `${activeSection.label} Workspace`}
                </h2>
                <p className="mt-1.5 hidden max-w-3xl text-sm leading-6 text-slate-600 sm:block">
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
