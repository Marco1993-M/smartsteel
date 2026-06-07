"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"

export default function CflcProductSelectorClient({ products }) {
  const [selectedId, setSelectedId] = useState(products[0]?.id)

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedId) || products[0],
    [products, selectedId]
  )

  const groupedProducts = useMemo(() => {
    const groups = new Map()
    products.forEach((product) => {
      const current = groups.get(product.family) || []
      current.push(product)
      groups.set(product.family, current)
    })
    return Array.from(groups.entries())
  }, [products])

  return (
    <section id="choose-size" className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
          Choose Your Size
        </p>
        <h2 className="mt-3 text-3xl font-semibold text-slate-950">
          Pick a kit size and see the product details instantly
        </h2>
        <p className="mt-4 text-sm leading-6 text-slate-600 sm:text-base">
          Start with the size that fits your project best. The product summary, starting price,
          pack details, and included items update straight away.
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          {groupedProducts.map(([family, familyProducts]) => (
            <div key={family}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-900">{family}</p>
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                  {familyProducts.length} options
                </span>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {familyProducts.map((product) => {
                  const isSelected = selectedProduct?.id === product.id
                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => setSelectedId(product.id)}
                      className={`rounded-[1.35rem] border p-4 text-left transition ${
                        isSelected
                          ? "border-[#da1a33] bg-[#fff4f5] text-slate-950 shadow-md ring-1 ring-[#da1a33]/10"
                          : "border-slate-200 bg-white text-slate-900 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p
                            className={`text-xs font-semibold uppercase tracking-[0.18em] ${
                              isSelected ? "text-[#da1a33]" : "text-slate-500"
                            }`}
                          >
                            {product.size}
                          </p>
                          <p className="mt-2 text-base font-semibold leading-6">{product.title}</p>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${
                            isSelected
                              ? "border border-[#da1a33]/15 bg-white text-[#da1a33]"
                              : "border border-slate-200 bg-slate-50 text-slate-500"
                          }`}
                        >
                          {isSelected ? "Selected" : "View"}
                        </span>
                      </div>
                      <p
                        className={`mt-4 text-3xl font-semibold tracking-tight ${
                          isSelected ? "text-slate-950" : "text-slate-950"
                        }`}
                      >
                        {product.priceFrom}
                      </p>
                      <p
                        className={`mt-1 text-xs ${
                          isSelected ? "text-slate-600" : "text-slate-500"
                        }`}
                      >
                        DIY supply pricing
                      </p>
                      <p
                        className={`mt-3 text-xs leading-5 ${
                          isSelected ? "text-slate-700" : "text-slate-600"
                        }`}
                      >
                        {product.bestFor}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-5 py-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Clear pricing
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                DIY supply only
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Standard sizes
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Start with a standard kit size, then confirm delivery and any final project details
              when you request the product.
            </p>
          </div>
        </div>

        {selectedProduct ? (
          <div className="lg:sticky lg:top-6">
            <div className="overflow-hidden rounded-[1.85rem] border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(218,26,51,0.12),_transparent_36%),linear-gradient(180deg,_#ffffff,_#f8fafc)] p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {selectedProduct.family}
                  </span>
                  <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {selectedProduct.productType}
                  </span>
                  <span className="inline-flex rounded-full border border-[#da1a33]/20 bg-[#fff2f3] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#da1a33]">
                    Popular size
                  </span>
                </div>

                <h3 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
                  {selectedProduct.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {selectedProduct.bestFor}
                </p>

                <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white">
                  <div className="relative aspect-[4/3]">
                    <Image
                      src="/CFLC.webp"
                      alt={`${selectedProduct.title} CFLC kit`}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 40vw, 100vw"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-px bg-slate-200">
                    <div className="bg-white px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Size
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-950">{selectedProduct.size}</p>
                    </div>
                    <div className="bg-white px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Weight
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-950">{selectedProduct.weight}</p>
                    </div>
                    <div className="bg-white px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Lead time
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-950">{selectedProduct.leadTime}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-950 px-5 py-5 text-white">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                    From
                  </p>
                  <p className="mt-2 text-4xl font-semibold tracking-tight">
                    {selectedProduct.priceFrom}
                  </p>
                  <p className="mt-2 text-sm text-slate-300">Indicative DIY supply pricing</p>
                  <p className="mt-4 text-xs leading-5 text-slate-400">
                    Final delivery and any project-specific extras can be confirmed when you request
                    the kit.
                  </p>
                </div>

                <div className="mt-5 rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Pack format
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{selectedProduct.packInfo}</p>
                </div>

                <div className="mt-5 space-y-4">
                  <div className="rounded-[1.35rem] border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Included
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedProduct.included.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-[1.35rem] border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Not included
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedProduct.excluded.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3">
                  <Link
                    href={selectedProduct.ctaHref}
                    className="rounded-full bg-[#da1a33] px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#bf172d]"
                  >
                    {selectedProduct.ctaLabel}
                  </Link>
                  <Link
                    href="/tools/estimator"
                    className="rounded-full border border-slate-300 px-6 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-white"
                  >
                    Check a budget
                  </Link>
                  <p className="text-center text-xs leading-5 text-slate-500">
                    Need a custom layout instead? The estimator and warehouse pages can help with
                    larger or more tailored projects.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}
