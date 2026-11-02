"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import Navbar from "./Navbar"
import Footer from "./Footer"

const CHROMELESS_PATHS = ["/partner-demo/", "/kanban/estimates/", "/kanban/invoices/", "/quotes/", "/invoices/", "/estimate-response/", "/quote-review/", "/os", "/partner", "/warehouse-builder/summary", "/tools/solar-carport-estimator/summary"]

export default function AppShell({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const hideChrome = CHROMELESS_PATHS.some((prefix) => pathname?.startsWith(prefix))
  const isWarehouseBuilder = pathname === "/warehouse-builder"

  if (hideChrome) {
    return <>{children}</>
  }

  if (isWarehouseBuilder) {
    return (
      <>
        <div className="hidden md:block">
          <Navbar />
        </div>
        <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 px-3 py-2 backdrop-blur md:hidden">
          <div className="flex h-11 items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                if (window.history.length > 1) {
                  router.back()
                  return
                }
                router.push("/products")
              }}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-800 shadow-sm"
              aria-label="Go back"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            <Link href="/" className="flex min-w-0 flex-1 items-center gap-2.5" aria-label="Smart Steel home">
              <Image src="/Logo.png" alt="" width={38} height={38} className="h-9 w-auto object-contain" priority />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-950">Warehouse Builder</p>
                <p className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Smart Steel</p>
              </div>
            </Link>

            <Link
              href="/products"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700"
              aria-label="Exit builder and view products"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
              </svg>
            </Link>
          </div>
        </header>
        <div className="md:pt-10">{children}</div>
        <div className="hidden md:block">
          <Footer />
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className={pathname === "/" ? "" : "pt-10"}>{children}</div>
      <Footer atlas={pathname === "/"} />
    </>
  )
}
