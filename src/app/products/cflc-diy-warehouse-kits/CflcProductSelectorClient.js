"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ATLAS_W_SERIES } from "../../../lib/atlasProductData"

export default function CflcProductSelectorClient({ products }) {
  const availableModels = useMemo(
    () => ATLAS_W_SERIES.filter((model) => products.some((product) => product.modelCode === model.code)),
    [products]
  )
  const [selectedModelCode, setSelectedModelCode] = useState(availableModels[0]?.code)
  const modelProducts = useMemo(
    () => products.filter((product) => product.modelCode === selectedModelCode),
    [products, selectedModelCode]
  )
  const [selectedId, setSelectedId] = useState(modelProducts[0]?.id)

  const selectedModel = availableModels.find((model) => model.code === selectedModelCode)
  const selectedProduct = modelProducts.find((product) => product.id === selectedId) || modelProducts[0]

  function selectModel(modelCode) {
    const firstProduct = products.find((product) => product.modelCode === modelCode)
    setSelectedModelCode(modelCode)
    setSelectedId(firstProduct?.id)
  }

  if (!selectedProduct || !selectedModel) return null

  return (
    <section id="choose-model" className="mt-10 border border-[#121a20]/15 bg-[#f3f0e9] p-5 shadow-[0_28px_60px_-48px_rgba(18,26,32,0.7)] sm:p-8">
      <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#1c5b57]">Step 1: Choose your Atlas model</p>
          <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.04em] text-[#121a20] sm:text-4xl">
            Start with the width that fits your operation.
          </h2>
        </div>
        <p className="max-w-2xl text-sm leading-6 text-[#121a20]/65 sm:text-base">
          Every W-Series model uses a defined standard span. Once you choose the right width, select a starting length and continue into the builder with the key decisions already loaded.
        </p>
      </div>

      <div className="mt-8 grid gap-3 lg:grid-cols-3">
        {availableModels.map((model) => {
          const isSelected = selectedModelCode === model.code

          return (
            <button
              key={model.code}
              type="button"
              onClick={() => selectModel(model.code)}
              className={`relative min-h-52 border p-5 text-left transition sm:p-6 ${
                isSelected
                  ? "border-[#1c5b57] bg-[#1c5b57] text-[#f3f0e9] shadow-[0_20px_40px_-30px_rgba(18,26,32,0.7)]"
                  : "border-[#121a20]/15 bg-white text-[#121a20] hover:-translate-y-0.5 hover:border-[#1c5b57]"
              }`}
            >
              {model.featured ? (
                <span className="absolute right-4 top-4 rounded-full border border-[#d9a441]/50 bg-[#d9a441]/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#d9a441]">
                  Popular span
                </span>
              ) : null}
              <p className={`font-mono text-sm font-semibold ${isSelected ? "text-[#d9a441]" : "text-[#1c5b57]"}`}>ATLAS {model.code}</p>
              <p className="mt-8 text-4xl font-semibold tracking-[-0.05em]">{model.spanLabel}</p>
              <p className={`mt-3 text-base font-semibold ${isSelected ? "text-[#f3f0e9]" : "text-[#121a20]"}`}>{model.title}</p>
              <p className={`mt-3 max-w-xs text-sm leading-6 ${isSelected ? "text-white/70" : "text-[#121a20]/65"}`}>{model.bestFor}</p>
            </button>
          )
        })}
      </div>

      <div className="mt-5 grid gap-5 border-t border-[#121a20]/15 pt-5 lg:grid-cols-[0.88fr_1.12fr]">
        <div className="border border-[#121a20]/15 bg-white p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1c5b57]">Step 2: Choose a starting length</p>
          <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#121a20]">Atlas {selectedModel.code} length options</h3>
          <p className="mt-3 text-sm leading-6 text-[#121a20]/65">You can continue refining the full footprint in the warehouse builder after this step.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {modelProducts.map((product) => {
              const isSelected = product.id === selectedProduct.id

              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => setSelectedId(product.id)}
                  className={`border p-4 text-left transition ${
                    isSelected
                      ? "border-[#d9a441] bg-[#121a20] text-[#f3f0e9]"
                      : "border-[#121a20]/15 bg-[#f3f0e9] text-[#121a20] hover:border-[#1c5b57]"
                  }`}
                >
                  <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${isSelected ? "text-[#d9a441]" : "text-[#1c5b57]"}`}>{product.size}</p>
                  <p className="mt-3 text-xl font-semibold">{product.length}m long</p>
                  <p className={`mt-2 text-sm ${isSelected ? "text-white/70" : "text-[#121a20]/60"}`}>{product.priceFrom} incl. VAT</p>
                </button>
              )
            })}
          </div>
          <div className="mt-6 border-l-2 border-[#d9a441] pl-4 text-sm leading-6 text-[#121a20]/65">
            Final delivery, installation, foundations, site access, and project-specific requirements are confirmed during project review.
          </div>
        </div>

        <aside className="overflow-hidden border border-[#121a20]/15 bg-[#121a20] text-[#f3f0e9]">
          <div className="grid gap-5 p-5 sm:grid-cols-[0.75fr_1.25fr] sm:p-6">
            <div className="relative min-h-44 overflow-hidden border border-white/15 bg-[#1c5b57]">
              <Image
                src="/CFLC.webp"
                alt={`Atlas ${selectedModel.code} cold-formed lip channel profile`}
                fill
                sizes="(min-width: 640px) 30vw, 100vw"
                className="object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(18,26,32,0.06),rgba(18,26,32,0.48))]" />
            </div>
            <div>
              <p className="font-mono text-xs font-semibold text-[#d9a441]">ATLAS {selectedModel.code} / {selectedProduct.size}</p>
              <h3 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">{selectedProduct.title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/65">{selectedProduct.bestFor}</p>
              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-[#d9a441]">Starting budget incl. VAT</p>
              <p className="mt-2 text-4xl font-semibold tracking-[-0.04em]">{selectedProduct.priceFrom}</p>
              <p className="mt-2 text-xs leading-5 text-white/55">Supply-only guide for the selected starting configuration.</p>
            </div>
          </div>

          <div className="grid border-t border-white/15 sm:grid-cols-2">
            <div className="border-b border-white/15 p-5 sm:border-b-0 sm:border-r sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">Included in the kit</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedProduct.included.map((item) => (
                  <span key={item} className="border border-white/15 px-2.5 py-1 text-xs text-white/75">{item}</span>
                ))}
              </div>
            </div>
            <div className="p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">Product information</p>
              <p className="mt-3 text-sm leading-6 text-white/70">{selectedProduct.packInfo}</p>
              <p className="mt-3 text-xs leading-5 text-white/50">{selectedProduct.leadTime}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-white/15 p-5 sm:flex-row sm:p-6">
            <Link
              href={selectedProduct.ctaHref}
              className="inline-flex flex-1 items-center justify-center bg-[#d9a441] px-5 py-3.5 text-sm font-semibold text-[#121a20] transition hover:bg-[#ebbd5f]"
            >
              Configure Atlas {selectedModel.code}
            </Link>
            <Link
              href="/warehouses/cflc"
              className="inline-flex items-center justify-center border border-white/20 px-5 py-3.5 text-sm font-semibold text-[#f3f0e9] transition hover:bg-white/10"
            >
              View W-Series system
            </Link>
          </div>
        </aside>
      </div>
    </section>
  )
}
