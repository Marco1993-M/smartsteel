import Image from "next/image"
import Link from "next/link"
import { cflcCatalogueMetadata, cflcWarehouseSelections } from "./cflcCatalogueData"
import CflcProductSelectorClient from "./CflcProductSelectorClient"

export const metadata = cflcCatalogueMetadata

const PRODUCT_QUESTIONS = [
  ["What is included in an Atlas warehouse kit?", "The standard kit includes the main frame, bracing, purlins or hats, fasteners, and drawings or an installation guide."],
  ["Is sheeting included?", "Sheeting and flashings are not included in the standard kit price unless they are specifically added to the reviewed project scope."],
  ["Can I change the length later?", "Yes. The model gives you the standard span. You can refine the overall length, sheeting direction, and other project choices in the warehouse builder."],
  ["What happens after I configure a model?", "Your configuration becomes a clearer starting point for a Smart Steel project review, where delivery, site conditions, foundations, and final scope can be confirmed."],
]

export default function CflcDiyWarehouseKitsPage() {
  return (
    <main className="atlas-brand mt-6 min-h-screen bg-[linear-gradient(180deg,#ffffff_0%,#eef6fa_100%)] px-4 py-10 text-[#001d2e] sm:mt-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="relative isolate overflow-hidden border border-[#121a20]/15 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbfd_48%,#e8f2f7_100%)] px-6 py-10 shadow-[0_28px_60px_-48px_rgba(0,29,46,0.28)] sm:px-8 lg:px-10 lg:py-14">
          <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(rgba(18,26,32,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(18,26,32,0.07)_1px,transparent_1px)] [background-size:42px_42px]" />
          <div className="pointer-events-none absolute -right-20 -top-32 h-96 w-96 rounded-full border border-[#d9a441]/35" />
          <div className="relative grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-end">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center border border-[#d9a441] text-sm font-semibold text-[#1c5b57]">A</span>
                <div>
                  <p className="text-sm font-semibold tracking-[0.2em]">ATLAS SYSTEM</p>
                  <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#121a20]/55">Developed by Smart Steel</p>
                </div>
              </div>
              <p className="mt-10 text-xs font-semibold uppercase tracking-[0.24em] text-[#1c5b57]">Atlas W-Series Catalogue</p>
              <h1 className="mt-4 text-4xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-5xl lg:text-6xl">
                Pick the warehouse model. Build the footprint around it.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-[#121a20]/70 sm:text-lg">
                The Atlas W-Series range gives you a clear starting point for storage, workshops, agriculture, poultry, and commercial operations. Choose W08, W10, or W12, then continue with a live configuration built around your selected model.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="#choose-model" className="bg-[#d9a441] px-6 py-3.5 text-sm font-semibold text-[#121a20] transition hover:bg-[#ebbd5f]">
                  Choose a W-Series model
                </Link>
                <Link href="/warehouses/cflc" className="border border-[#121a20]/20 bg-white/65 px-6 py-3.5 text-sm font-semibold text-[#121a20] transition hover:border-[#121a20] hover:bg-white">
                  Explore the Atlas system
                </Link>
              </div>
            </div>

            <div className="relative min-h-[290px] overflow-hidden border border-[#121a20]/15 bg-[#1c5b57]">
              <Image
                src="/CFLC.webp"
                alt="Atlas W-Series cold-formed lip channel steel profiles"
                fill
                priority
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(18,26,32,0.08),rgba(18,26,32,0.72))]" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d9a441]">Material proof</p>
                <p className="mt-2 max-w-sm text-2xl font-semibold leading-tight text-[#f3f0e9]">Cold-formed lip channel profiles for repeatable warehouse assembly.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid border-b border-[#121a20]/10 bg-[#f3f0e9] sm:grid-cols-3">
          {[
            ["01", "Choose the span", "W08, W10, and W12 give you a defined width before you begin configuring."],
            ["02", "Choose a starting length", "Compare practical starting footprints and the relevant supply-only budget guide."],
            ["03", "Continue into the builder", "Refine the configuration with your selected model already loaded."],
          ].map(([number, title, description]) => (
            <div key={number} className="border-r border-[#121a20]/10 px-5 py-6 last:border-r-0 sm:px-7">
              <p className="font-mono text-xs text-[#1c5b57]">{number}</p>
              <p className="mt-4 text-lg font-semibold">{title}</p>
              <p className="mt-2 text-sm leading-6 text-[#121a20]/65">{description}</p>
            </div>
          ))}
        </section>

        <CflcProductSelectorClient products={cflcWarehouseSelections} />

        <section className="mt-10 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="border border-[#121a20]/15 bg-white p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#1c5b57]">When Atlas is the right route</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">A defined warehouse system before a custom project process.</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                "You want a standard warehouse span with a configurable building length.",
                "You want a practical system for storage, workshops, agriculture, poultry, or commercial operations.",
                "You want to compare a real supply-only budget guide before detailed review.",
                "You want a clear structural starting point without redesigning the first decision from zero.",
              ].map((item, index) => (
                <div key={item} className="border-l-2 border-[#d9a441] bg-[#f3f0e9] px-4 py-4 text-sm leading-6 text-[#121a20]/70">
                  <span className="mr-2 font-mono text-xs text-[#1c5b57]">0{index + 1}</span>{item}
                </div>
              ))}
            </div>
          </div>

          <div className="border border-[#121a20]/15 bg-[#121a20] p-6 text-[#f3f0e9] sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#d9a441]">Need a different route?</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">Compare Atlas with a more custom LSF warehouse.</h2>
            <p className="mt-4 text-sm leading-6 text-white/65">If your brief needs a more tailored layout, wider scope, or a custom warehouse solution, compare the LSF path before you decide.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/warehouses/lsf-vs-cflc" className="border border-white/20 px-5 py-3 text-sm font-semibold transition hover:bg-white hover:text-[#121a20]">Compare systems</Link>
              <Link href="/warehouses/lsf" className="border border-white/20 px-5 py-3 text-sm font-semibold transition hover:bg-white hover:text-[#121a20]">Explore LSF</Link>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-8 border-t border-[#121a20]/15 py-12 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#1c5b57]">Before you choose</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">The practical questions buyers ask first.</h2>
          </div>
          <div className="divide-y divide-[#121a20]/15 border-y border-[#121a20]/15">
            {PRODUCT_QUESTIONS.map(([question, answer]) => (
              <details key={question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-base font-semibold marker:content-none">
                  {question}<span className="text-xl text-[#1c5b57] transition group-open:rotate-45">+</span>
                </summary>
                <p className="max-w-2xl pt-3 text-sm leading-6 text-[#121a20]/65">{answer}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
