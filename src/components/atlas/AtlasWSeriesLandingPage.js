import Image from "next/image"
import Link from "next/link"
import {
  ATLAS_W_SERIES,
  ATLAS_W_SERIES_APPLICATIONS,
  ATLAS_W_SERIES_FAQS,
  ATLAS_W_SERIES_PRINCIPLES,
} from "../../lib/atlasProductData"

const SYSTEM_STEPS = [
  ["01", "Choose your width", "Start with W08, W10, or W12 according to the working space your operation needs."],
  ["02", "Configure the building", "Set the length, eave height, finish, and sheeting direction around your project."],
  ["03", "Move into review", "Use the live budget guide as a practical starting point, then request a project-specific review."],
]

export default function AtlasWSeriesLandingPage() {
  return (
    <main className="mt-6 min-h-screen overflow-hidden bg-[#f3f0e9] text-[#121a20] sm:mt-8">
      <section className="relative isolate overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#faf9f5_45%,#ebe8dd_100%)] px-4 pb-16 pt-20 sm:px-6 sm:pt-24 lg:px-8 lg:pb-24 lg:pt-28">
        <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(rgba(18,26,32,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(18,26,32,0.08)_1px,transparent_1px)] [background-size:42px_42px]" />
        <div className="pointer-events-none absolute -right-32 top-[-14rem] h-[42rem] w-[42rem] rounded-full border border-[#d9a441]/30" />
        <div className="pointer-events-none absolute -right-12 top-[-5rem] h-[30rem] w-[30rem] rounded-full border border-[#d9a441]/20" />

        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#121a20]/15 pb-5">
            <div className="flex items-center gap-3 text-[#121a20]">
              <span className="grid h-9 w-9 place-items-center border border-[#d9a441] text-sm font-semibold text-[#d9a441]">A</span>
              <div>
                <p className="text-sm font-semibold tracking-[0.2em]">ATLAS SYSTEM</p>
                <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#121a20]/55">Developed by Smart Steel</p>
              </div>
            </div>
            <div className="rounded-full border border-[#121a20]/15 bg-white/70 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#121a20]/65">
              W-Series · Modular Warehouses
            </div>
          </div>

          <div className="grid gap-12 pt-12 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:pt-16">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#1c5b57]">Atlas W-Series</p>
              <h1 className="mt-5 text-5xl font-semibold leading-[0.94] tracking-[-0.055em] text-[#121a20] sm:text-6xl lg:text-7xl">
                Modular warehouses, built to scale.
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-7 text-[#121a20]/70 sm:text-lg">
                Atlas W-Series is Smart Steel&apos;s modular warehouse system for storage, workshops, agriculture, and commercial operations. Start with a standard span, configure the length, and move into a practical building plan.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/warehouse-builder?productType=LCSS%20Warehouse"
                  className="rounded-full bg-[#d9a441] px-6 py-3.5 text-sm font-semibold text-[#121a20] transition hover:bg-[#ebbd5f]"
                >
                  Build my Atlas warehouse
                </Link>
                <Link
                  href="#w-series"
                  className="rounded-full border border-[#121a20]/25 bg-white/50 px-6 py-3.5 text-sm font-semibold text-[#121a20] transition hover:border-[#121a20] hover:bg-white"
                >
                  Explore W-Series sizes
                </Link>
              </div>
              <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-[#121a20]/60">
                <span>Cold-formed lip channel steel</span>
                <span>Bolted assembly</span>
                <span>Configurable length</span>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 border border-[#d9a441]/35" />
              <div className="relative aspect-[1.12/1] overflow-hidden bg-[#1c5b57]">
                <Image
                  src="/CFLC.webp"
                  alt="Atlas W-Series cold-formed lip channel steel profiles"
                  fill
                  priority
                  sizes="(min-width: 1024px) 48vw, 100vw"
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(18,26,32,0.04),rgba(18,26,32,0.72))]" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-7">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d9a441]">Atlas material system</p>
                    <p className="mt-2 max-w-xs text-xl font-semibold leading-tight text-[#f3f0e9]">Cold-formed lip channel profiles, developed for repeatable assembly.</p>
                  </div>
                  <span className="hidden border border-white/30 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/75 sm:block">W-Series</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#121a20]/10 bg-white/80 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
        <nav aria-label="Atlas W-Series page sections" className="mx-auto flex max-w-7xl gap-5 overflow-x-auto whitespace-nowrap text-xs font-semibold text-[#121a20]/65 sm:justify-between sm:gap-4">
          <a href="#models" className="transition hover:text-[#1c5b57]">Models</a>
          <a href="#how-it-works" className="transition hover:text-[#1c5b57]">How it works</a>
          <a href="#platform" className="transition hover:text-[#1c5b57]">System principles</a>
          <a href="#applications" className="transition hover:text-[#1c5b57]">Applications</a>
          <a href="#specifications" className="transition hover:text-[#1c5b57]">Specifications</a>
          <a href="#documents" className="transition hover:text-[#1c5b57]">Documentation</a>
          <a href="#questions" className="transition hover:text-[#1c5b57]">FAQs</a>
        </nav>
      </section>

      <section className="border-b border-[#121a20]/10 bg-[#f3f0e9] px-4 py-7 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 sm:grid-cols-3">
          {[
            ["One platform", "A common engineering approach across Atlas products."],
            ["Defined warehouse series", "W08, W10, and W12 widths give you a clear starting point."],
            ["Built around the project", "Configure length, finish, and sheeting before requesting a review."],
          ].map(([title, description], index) => (
            <div key={title} className="flex gap-4 border-[#121a20]/10 sm:border-l sm:pl-5 first:border-l-0 first:pl-0">
              <span className="pt-0.5 font-mono text-xs text-[#1c5b57]">0{index + 1}</span>
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="mt-1 text-sm leading-6 text-[#121a20]/65">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="models" className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#1c5b57]">Choose your base span</p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">Start with a warehouse width that fits the operation.</h2>
            </div>
            <p className="max-w-2xl text-base leading-7 text-[#121a20]/65">Each Atlas W-Series warehouse is designed around a standard width. You can then configure the building length in practical bays, choose your sheeting direction, and create a clearer starting point for your project.</p>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {ATLAS_W_SERIES.map((product) => (
              <Link
                key={product.code}
                href={product.href}
                className={`group relative overflow-hidden border p-6 transition sm:p-7 ${
                  product.featured
                    ? "border-[#1c5b57] bg-[#1c5b57] text-[#f3f0e9] shadow-[0_22px_45px_-30px_rgba(18,26,32,0.65)]"
                    : "border-[#121a20]/15 bg-white hover:-translate-y-1 hover:border-[#1c5b57]"
                }`}
              >
                {product.featured ? <span className="absolute right-5 top-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#d9a441]">Popular span</span> : null}
                <p className={`font-mono text-sm ${product.featured ? "text-[#d9a441]" : "text-[#1c5b57]"}`}>ATLAS {product.code}</p>
                <p className="mt-8 text-3xl font-semibold tracking-[-0.04em]">{product.spanLabel}</p>
                <p className={`mt-4 text-lg font-semibold ${product.featured ? "text-[#f3f0e9]" : "text-[#121a20]"}`}>{product.title}</p>
                <p className={`mt-3 text-sm leading-6 ${product.featured ? "text-white/70" : "text-[#121a20]/65"}`}>{product.bestFor}</p>
                <span className={`mt-8 inline-flex text-sm font-semibold ${product.featured ? "text-[#d9a441]" : "text-[#1c5b57]"}`}>Configure {product.code} <span className="ml-2">&rarr;</span></span>
              </Link>
            ))}
          </div>

          <div id="specifications" className="mt-12 overflow-x-auto border border-[#121a20]/15 bg-white">
            <div className="min-w-[760px]">
              <div className="grid grid-cols-[0.72fr_0.8fr_1.3fr_1.15fr_0.75fr] border-b border-[#121a20]/15 bg-[#121a20] px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/65">
                <p>Model</p>
                <p>Standard span</p>
                <p>Best suited to</p>
                <p>Configuration</p>
                <p className="text-right">Next step</p>
              </div>
              {ATLAS_W_SERIES.map((product) => (
                <div key={`spec-${product.code}`} className="grid grid-cols-[0.72fr_0.8fr_1.3fr_1.15fr_0.75fr] items-center border-b border-[#121a20]/10 px-5 py-5 last:border-b-0">
                  <p className="font-mono text-sm font-semibold text-[#1c5b57]">ATLAS {product.code}</p>
                  <p className="text-sm font-semibold">{product.spanLabel}</p>
                  <p className="pr-5 text-sm leading-6 text-[#121a20]/65">{product.bestFor}</p>
                  <p className="pr-5 text-sm leading-6 text-[#121a20]/65">{product.configuration}</p>
                  <Link href={product.href} className="justify-self-end text-sm font-semibold text-[#1c5b57]">Configure</Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-[#121a20] px-4 py-16 text-[#f3f0e9] sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d9a441]">How W-Series works</p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">A clearer route from span to building plan.</h2>
            </div>
            <p className="max-w-2xl text-base leading-7 text-white/65">Atlas is designed to give you a defined system before you enter a detailed quote process. Start with the warehouse width, build the footprint around your operation, then move into review with better project context.</p>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {SYSTEM_STEPS.map(([number, title, description]) => (
              <div key={number} className="border-t border-white/15 pt-5">
                <p className="font-mono text-xs text-[#d9a441]">{number}</p>
                <p className="mt-7 text-xl font-semibold">{title}</p>
                <p className="mt-3 max-w-sm text-sm leading-6 text-white/65">{description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 overflow-hidden border border-white/15 p-5 sm:p-7">
            <div className="flex items-center justify-between gap-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/50">
              <span>Atlas W-Series configuration logic</span>
              <span>Configured length</span>
            </div>
            <div className="mt-6 grid grid-cols-7 gap-1.5 sm:grid-cols-12">
              {Array.from({ length: 12 }, (_, index) => (
                <span key={index} className={`h-12 border ${index === 0 || index === 11 ? "border-[#d9a441] bg-[#d9a441]/15" : "border-white/20 bg-white/5"}`} />
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-white/55">
              <span>Standard span</span>
              <span>Repeatable bays</span>
              <span>Project footprint</span>
            </div>
          </div>
        </div>
      </section>

      <section id="platform" className="bg-[#dce5df] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#1c5b57]">The Atlas platform</p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">A warehouse is one application of a common infrastructure system.</h2>
            <p className="mt-6 text-base leading-7 text-[#121a20]/70 sm:text-lg">Atlas products are developed around repeatable components, practical logistics, and scalable configurations. That same system thinking can extend across warehouses, solar structures, agricultural covers, and future infrastructure products.</p>
          </div>
          <div className="mt-10 grid gap-px overflow-hidden border border-[#121a20]/15 bg-[#121a20]/15 sm:grid-cols-2 lg:grid-cols-4">
            {ATLAS_W_SERIES_PRINCIPLES.map(([title, description], index) => (
              <div key={title} className="bg-[#f3f0e9] p-6">
                <p className="font-mono text-xs text-[#1c5b57]">0{index + 1}</p>
                <p className="mt-8 text-xl font-semibold">{title}</p>
                <p className="mt-3 text-sm leading-6 text-[#121a20]/65">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="applications" className="bg-[#f3f0e9] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#1c5b57]">Built for practical work</p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">One warehouse system. Multiple operating environments.</h2>
            </div>
            <p className="max-w-2xl text-base leading-7 text-[#121a20]/65">Atlas W-Series starts with a consistent structural system, then adapts around how the space needs to work. Select the span, configure the footprint, and refine the sheeting and openings around the project.</p>
          </div>
          <div className="mt-10 grid border-l border-t border-[#121a20]/15 sm:grid-cols-2 lg:grid-cols-3">
            {ATLAS_W_SERIES_APPLICATIONS.map(([number, title, description]) => (
              <div key={title} className="group min-h-48 border-b border-r border-[#121a20]/15 bg-white p-6 transition hover:bg-[#121a20] hover:text-[#f3f0e9]">
                <p className="font-mono text-xs text-[#1c5b57]">{number}</p>
                <p className="mt-10 text-xl font-semibold">{title}</p>
                <p className="mt-3 max-w-xs text-sm leading-6 text-[#121a20]/65 transition group-hover:text-white/65">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
          <div className="border-l-2 border-[#d9a441] pl-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#1c5b57]">Built by Smart Steel</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">Practical system thinking, from structure to site.</h2>
          </div>
          <div className="space-y-4 text-base leading-7 text-[#121a20]/70">
            <p>Atlas is developed by Smart Steel, combining engineering, manufacturing, and practical construction experience into a repeatable modular infrastructure platform.</p>
            <p>For a warehouse project, that means you can start with a clear system, a real footprint, and a supply-only budget guide before your project moves into detailed review.</p>
            <div className="pt-3">
              <Link href="/warehouse-builder?productType=LCSS%20Warehouse" className="inline-flex rounded-full bg-[#121a20] px-6 py-3.5 text-sm font-semibold text-[#f3f0e9] transition hover:bg-[#1c5b57]">
                Configure my Atlas warehouse
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="documents" className="border-y border-[#121a20]/10 bg-[#e8e5da] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#1c5b57]">Project information</p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">Clear information at every stage.</h2>
            </div>
            <p className="max-w-2xl text-base leading-7 text-[#121a20]/65">The W-Series is being developed as a defined product range, not an improvised one-off structure. As Atlas documentation is released, this section will become the home for product data, configuration guidance, and project-specific information.</p>
          </div>
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {[
              ["Model reference", "W08, W10, and W12 give each standard span a short, stable product code."],
              ["Configuration guidance", "Your builder design records the footprint, sheeting choice, and opening direction for review."],
              ["Project review pack", "Detailed project information is prepared once the final scope, site conditions, and delivery requirements are known."],
            ].map(([title, description], index) => (
              <div key={title} className="border border-[#121a20]/15 bg-[#f3f0e9] p-6">
                <p className="font-mono text-xs text-[#1c5b57]">0{index + 1}</p>
                <p className="mt-8 text-xl font-semibold">{title}</p>
                <p className="mt-3 text-sm leading-6 text-[#121a20]/65">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#121a20] px-4 py-14 text-[#f3f0e9] sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d9a441]">Important to know</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">A useful budget guide is the start, not the final site decision.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="border-t border-white/15 pt-4">
              <p className="text-sm font-semibold">Online builder</p>
              <p className="mt-2 text-sm leading-6 text-white/65">Use it to shape your preferred warehouse and see a supply-only budget guide based on the current configuration.</p>
            </div>
            <div className="border-t border-white/15 pt-4">
              <p className="text-sm font-semibold">Project review</p>
              <p className="mt-2 text-sm leading-6 text-white/65">Delivery, installation, foundations, site access, and final requirements are reviewed properly once your project is submitted.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#121a20]/10 bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#1c5b57]">Continue with Atlas</p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">Choose the next step that matches where you are.</h2>
            </div>
            <p className="max-w-2xl text-base leading-7 text-[#121a20]/65">Whether you need to compare standard products, test a footprint, or understand the cost direction, Atlas gives you a practical route forward before your project enters detailed review.</p>
          </div>
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {[
              ["Compare standard kits", "Browse the Atlas W-Series range, included items, and starting prices.", "/products/cflc-diy-warehouse-kits", "View Atlas warehouse kits"],
              ["Understand cost direction", "See the main factors that shape an Atlas warehouse budget before you configure it.", "/cflc-warehouse-cost", "Explore Atlas cost guidance"],
              ["Compare with LSF", "See whether a custom LSF warehouse or a modular Atlas route suits your brief.", "/warehouses/lsf-vs-cflc", "Compare warehouse systems"],
            ].map(([title, description, href, label], index) => (
              <Link key={title} href={href} className="group border border-[#121a20]/15 p-6 transition hover:-translate-y-1 hover:border-[#1c5b57] hover:shadow-[0_20px_40px_-32px_rgba(18,26,32,0.5)]">
                <p className="font-mono text-xs text-[#1c5b57]">0{index + 1}</p>
                <p className="mt-8 text-xl font-semibold">{title}</p>
                <p className="mt-3 text-sm leading-6 text-[#121a20]/65">{description}</p>
                <span className="mt-7 inline-flex text-sm font-semibold text-[#1c5b57]">{label} <span className="ml-2">&rarr;</span></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="questions" className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#1c5b57]">Questions, answered</p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.04em]">Understand the system before you build.</h2>
          </div>
          <div className="divide-y divide-[#121a20]/15 border-y border-[#121a20]/15">
            {ATLAS_W_SERIES_FAQS.map((faq) => (
              <details key={faq.question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-base font-semibold marker:content-none">
                  {faq.question}
                  <span className="text-xl font-medium text-[#1c5b57] transition group-open:rotate-45">+</span>
                </summary>
                <p className="max-w-2xl pt-3 text-sm leading-6 text-[#121a20]/65">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
