"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ChevronRight, PackageSearch } from "lucide-react"
import { getAtlasProduct, withAtlasProduct } from "../../lib/atlasProductRange"

export default function AtlasProductContextBar() {
  const searchParams = useSearchParams()
  const product = getAtlasProduct(searchParams.get("product"))

  if (!product) return null

  return (
    <div className="border-b border-[#c1d9e5] bg-[color-mix(in_srgb,#c1d9e5_28%,white)] px-4 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] sm:px-6 print:hidden">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid h-7 w-7 shrink-0 place-items-center bg-[#0043f3] text-white">
            <PackageSearch className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#0043f3]">Active Atlas product</p>
            <p className="truncate text-sm font-bold text-slate-950">
              {product.code} <span className="font-medium text-slate-500">· {product.name}</span>
            </p>
          </div>
        </div>
        <Link
          href={withAtlasProduct("/os/atlas/products", product.code)}
          className="inline-flex items-center gap-1 text-xs font-bold text-[#0043f3] transition hover:text-[#001d2e]"
        >
          Change product <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  )
}
