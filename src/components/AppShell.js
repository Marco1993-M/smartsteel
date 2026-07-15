"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Navbar from "./Navbar"
import Footer from "./Footer"

const CHROMELESS_PATHS = ["/kanban/estimates/", "/kanban/invoices/", "/quotes/", "/invoices/", "/os"]

export default function AppShell({ children }) {
  const pathname = usePathname()
  const hideChrome = CHROMELESS_PATHS.some((prefix) => pathname?.startsWith(prefix))
  const showBuilderBanner = pathname === "/"

  if (hideChrome) {
    return <>{children}</>
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
