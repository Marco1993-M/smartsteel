"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function WorkspaceSectionNav({ items }) {
  const pathname = usePathname()

  return (
    <div className="border-b border-slate-200 bg-white px-4 py-3 shadow-sm sm:px-6">
      <div className="flex gap-2 overflow-x-auto">
        {items.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== "/os" && pathname?.startsWith(`${item.href}/`))

          return (
            <Link
              key={item.key}
              href={item.href}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                isActive
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
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
