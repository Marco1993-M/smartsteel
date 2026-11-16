"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { getAtlasProduct, withAtlasProduct } from "../../lib/atlasProductRange"

const compactLink = "shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"

export default function AtlasWorkspaceNavigation() {
  const pathname = usePathname()
  const params = useSearchParams()
  const [headerTarget, setHeaderTarget] = useState(null)

  useEffect(() => {
    setHeaderTarget(document.getElementById("os-atlas-header-tools"))
  }, [])

  const requested = params.get("product")
  const isProductIndex = pathname === "/os/atlas" || pathname === "/os/atlas/products"
  const product = getAtlasProduct(requested || (pathname.endsWith("/solar-pricing") ? "SOLAR-CARPORT" : isProductIndex ? "" : "W08"))
  if (!product) return null

  const warehouse = /^W\d{2}$/.test(product.code)
  const sections = [
    ["Overview", "products"],
    ["Configuration & pricing", warehouse ? "pricing" : "solar-pricing"],
    ["Materials & connections", warehouse ? "materials" : "solar-pricing#schedule"],
    ["Engineering", "engineering"],
    ["Documents", "documents"],
  ]
  const controls = (
    <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Link href="/os/atlas" className="font-semibold text-blue-700 hover:underline">All products</Link>
        <span className="text-slate-400" aria-hidden="true">/</span>
        <span className="font-semibold text-slate-900">{product.name}</span>
      </div>
      {warehouse ? (
        <nav aria-label="Warehouse span" className="flex flex-wrap gap-0.5 rounded-xl bg-slate-100 p-1">
          {["W06", "W08", "W10", "W12", "W15"].map(code => (
            <Link key={code} aria-current={code === product.code ? "true" : undefined}
              href={withAtlasProduct(pathname.includes("solar-pricing") ? "/os/atlas/products" : pathname, code)}
              className={`${compactLink} ${code === product.code ? "bg-slate-950 text-white" : "text-slate-700 hover:bg-white"}`}>
              {Number(code.slice(1))}m
            </Link>
          ))}
        </nav>
      ) : null}
      <nav aria-label="Product workspace sections" className="flex min-w-0 flex-wrap gap-1 xl:ml-auto">
        {sections.filter((_, index) => product.available || index === 0).map(([label, route]) => {
          const [page, anchor] = route.split("#")
          const href = withAtlasProduct(`/os/atlas/${page}`, product.code) + (anchor ? `#${anchor}` : "")
          const active = !anchor && (pathname === `/os/atlas/${page}` ||
            (page === "materials" && ["/os/atlas/bom", "/os/atlas/components"].includes(pathname)))
          return <Link key={label} href={href} aria-current={active ? "page" : undefined}
            className={`${compactLink} ${active ? "bg-slate-950 text-white" : "text-slate-700 hover:bg-slate-100"}`}>{label}</Link>
        })}
      </nav>
    </div>
  )

  return headerTarget ? createPortal(controls, headerTarget) : <div className="px-4 py-2 sm:px-6 print:hidden">{controls}</div>
}
