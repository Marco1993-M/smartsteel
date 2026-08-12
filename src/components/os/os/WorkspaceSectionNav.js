"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { withAtlasProduct } from "../../lib/atlasProductRange"

export default function WorkspaceSectionNav({ items, variant = "default" }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isAtlas = variant === "atlas"
  const activeProductCode = isAtlas ? searchParams.get("product") : ""

  return (
    <div className={`border-b px-4 py-3 shadow-sm sm:px-6 print:hidden ${
      isAtlas
        ? "border-slate-800 bg-[linear-gradient(90deg,#020617,#172033_72%,#0f172a)]"
        : "border-slate-200 bg-white"
    }`}>
      <div className="flex gap-2 overflow-x-auto">
        {items.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== "/os" && pathname?.startsWith(`${item.href}/`))

          return (
            <Link
              key={item.key}
              href={isAtlas ? withAtlasProduct(item.href, activeProductCode) : item.href}
              className={`whitespace-nowrap px-4 py-2 text-sm font-semibold transition ${
                isActive
                  ? isAtlas
                    ? "rounded-sm bg-amber-400 text-slate-950"
                    : "rounded-full bg-slate-900 text-white"
                  : isAtlas
                    ? "rounded-sm bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                    : "rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
