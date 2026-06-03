"use client"

import { usePathname } from "next/navigation"
import Navbar from "./Navbar"
import Footer from "./Footer"

const CHROMELESS_PATHS = ["/kanban/estimates/", "/kanban/invoices/", "/quotes/", "/invoices/"]

export default function AppShell({ children }) {
  const pathname = usePathname()
  const hideChrome = CHROMELESS_PATHS.some((prefix) => pathname?.startsWith(prefix))

  if (hideChrome) {
    return <>{children}</>
  }

  return (
    <>
      <Navbar />
      <div className="pt-10">{children}</div>
      <Footer />
    </>
  )
}
