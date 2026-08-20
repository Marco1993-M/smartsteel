"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import Navbar from "./Navbar"
import Footer from "./Footer"

const CHROMELESS_PATHS = ["/kanban/estimates/", "/kanban/invoices/", "/quotes/", "/invoices/", "/os", "/partner"]

export default function AppShell({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const hideChrome = CHROMELESS_PATHS.some((prefix) => pathname?.startsWith(prefix))
  const showBuilderBanner = pathname === "/"
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
      {showBuilderBanner ? (
        <div className="absolute left-0 top-16 z-40 w-full">
          <div className="flex w-full flex-col items-center justify-between gap-2 border-y border-white/25 bg-[#2d63b8]/92 px-4 py-2.5 text-center text-white shadow-lg backdrop-blur sm:flex-row sm:gap-3 sm:px-6 sm:py-3 lg:px-8 sm:text-left">
            <p className="text-sm font-medium leading-5 sm:text-base sm:leading-6">
              Build and price your custom warehouse at factory-direct rates with the Smart Steel online builder.
            </p>
            <Link
              href="/warehouse-builder"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#ffcb13] px-4 py-2 text-sm font-semibold text-black transition hover:bg-[#e9b800] sm:px-5 sm:py-2.5"
            >
              <Image
                src="/3d.png"
                alt=""
                width={18}
                height={18}
                className="h-[18px] w-[18px]"
              />
              Build my warehouse
            </Link>
          </div>
        </div>
      ) : null}
      <div className="pt-10">{children}</div>
      <Footer />
    </>
  )
}
