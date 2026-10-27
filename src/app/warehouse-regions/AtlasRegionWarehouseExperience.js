"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRightIcon, CheckCircleIcon, MapPinIcon, PhoneIcon } from "@heroicons/react/24/outline";
import { REGION_WAREHOUSE_LENGTHS, REGION_WAREHOUSE_WIDTHS } from "./regionWarehouseData";
import { calculateAtlasWarehouseEstimate } from "../../lib/estimates/atlasWarehouseEstimate.js";
import { AtlasMasthead, AtlasPrimaryAction } from "../../components/atlas/AtlasPagePrimitives.js";

function formatNumber(value) {
  return new Intl.NumberFormat("en-ZA").format(value);
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(value);
}

const pricingScopes = [
  {
    key: "structure_only",
    title: "Structure only",
    description: "Atlas steel structure, purlins, bracing, brackets, and connection hardware.",
  },
  {
    key: "roof_only",
    title: "Roof sheeted",
    description: "Structure plus galvanised IBR roof sheeting. Delivery and installation are separate.",
  },
  {
    key: "fully_enclosed",
    title: "Roof and side walls sheeted",
    description: "Structure plus galvanised IBR roof and long-wall sheeting. Both gable ends remain open.",
  },
  {
    key: "fully_enclosed_with_gables",
    title: "Fully enclosed with gables",
    description: "Roof, side walls and gable ends, with one standard centred gable opening. Doors are reviewed separately.",
  },
];

function getModelCode(width) {
  return `W${String(width).padStart(2, "0")}`;
}

export default function AtlasRegionWarehouseExperience({
  content,
  selectedWidth,
  setSelectedWidth,
  selectedLength,
  setSelectedLength,
  buildSizeBuilderHref,
  faqSchema,
  breadcrumbSchema,
  regionLinks,
}) {
  const selectedArea = selectedWidth * selectedLength;
  const selectedBuilderHref = `${buildSizeBuilderHref(selectedWidth, selectedLength)}&sheeting=structure_only`;
  const selectedWallHeight = selectedWidth >= 10 ? 4.5 : 3;
  const selectedPrices = pricingScopes.map((scope) => {
    const estimate = calculateAtlasWarehouseEstimate({
      width: selectedWidth,
      length: selectedLength,
      wallHeight: selectedWallHeight,
      gableMode: scope.key,
      steelFinish: "Galv",
      sheetingProfile: "IBR",
      sheetingFinish: "galvanised",
    });

    return {
      ...scope,
      value: formatCurrency(estimate.pricing.estimatedTotal),
      inclusiveValue: formatCurrency(estimate.pricing.totalInclVat),
      href: `${buildSizeBuilderHref(selectedWidth, selectedLength)}&sheeting=${scope.key}&sheetingProfile=IBR&sheetingFinish=galvanised`,
      layoutNote: estimate.summary.layoutNote,
    };
  });
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `Atlas warehouse supply in ${content.name}`,
    serviceType: "Modular steel warehouse supply and project review",
    url: `https://www.smartsteel.co.za/${content.legacySlug}`,
    areaServed: {
      "@type": "City",
      name: content.name,
      containedInPlace: {
        "@type": "AdministrativeArea",
        name: content.province,
      },
    },
    provider: {
      "@type": "Organization",
      name: "Smart Steel",
      url: "https://www.smartsteel.co.za",
    },
    description: content.heroDescription,
  };

  return (
    <main className="bg-white pt-24 text-[#001D2E] sm:pt-28 [&_section[id]]:scroll-mt-24 [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-4 [&_a:focus-visible]:outline-[#0043F3] [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-4 [&_button:focus-visible]:outline-[#0043F3] [&_summary:focus-visible]:outline-2 [&_summary:focus-visible]:outline-offset-4 [&_summary:focus-visible]:outline-[#0043F3]">
      {[faqSchema, breadcrumbSchema, serviceSchema].map((schema, index) => <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}

      <section className="mx-auto max-w-7xl px-5 pb-12 sm:px-8 lg:pb-16">
        <AtlasMasthead descriptor={`${content.name} · ${content.province}`} meta="Atlas warehouse supply" />
        <div className="grid items-center gap-8 pt-9 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12 lg:pt-12">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0043F3]">Warehouse supply · {content.province}</p>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">Steel warehouses in {content.name}</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#526C79]">{content.heroDescription}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <AtlasPrimaryAction href="#pricing">Compare sizes and prices</AtlasPrimaryAction>
              <Link href={`${selectedBuilderHref}#review-summary`} className="inline-flex min-h-12 items-center justify-center gap-2 border border-[#B8CDD7] px-5 py-3 text-sm font-bold transition hover:bg-[#EDF5F8]">Request a quote <ArrowUpRightIcon className="h-4 w-4" aria-hidden="true" /></Link>
            </div>
            <p className="mt-5 text-sm leading-6 text-[#526C79]">For storage, workshops, agricultural buildings and commercial space.</p>
          </div>
          <div className="overflow-hidden rounded-xl border border-[#B8CDD7] bg-[#EDF5F8]">
            <div className="relative aspect-[16/9]"><Image src="/CFLC.webp" alt="Cold-formed lip channel steel members used in the Atlas warehouse system" fill priority sizes="(min-width: 1024px) 42vw, 100vw" className="object-cover" /></div>
            <p className="px-5 py-4 text-sm leading-6 text-[#264554]">Atlas modular steel buildings, configured around your required size and sheeting scope.</p>
          </div>
        </div>
        <div className="mt-9 grid grid-cols-3 divide-x divide-[#B8CDD7] border-y border-[#B8CDD7] py-4 text-center">
          {[[`${REGION_WAREHOUSE_WIDTHS[0]}–${REGION_WAREHOUSE_WIDTHS.at(-1)}m`, "standard spans"], [`${REGION_WAREHOUSE_LENGTHS[0]}–${REGION_WAREHOUSE_LENGTHS.at(-1)}m`, "building lengths"], ["4m", "modular bays"]].map(([value, label]) => <div key={label} className="px-2"><p className="text-xl font-bold sm:text-2xl">{value}</p><p className="mt-1 text-xs text-[#526C79]">{label}</p></div>)}
        </div>
        <nav aria-label="Warehouse page sections" className="flex flex-wrap gap-x-6 gap-y-3 pt-5 text-sm font-semibold text-[#0043F3]">
          <a href="#pricing">Products & prices</a><a href="#local-fit">Your area</a><a href="#scope">What’s included</a><a href="#faqs">FAQs</a>
        </nav>
      </section>

      <section id="pricing" className="border-y border-[#B8CDD7] bg-[#EDF5F8] px-5 py-12 sm:px-8 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0043F3]">Atlas warehouse options</p><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Choose a size. Compare your building options.</h2><p className="mt-4 text-base leading-7 text-[#526C79]">These are live supply-only guides for the same footprint. Choose the amount of sheeting you need, then continue in 3D to refine your building and request a quotation.</p></div>
          <aside aria-label="Warehouse size controls" className="mt-7 grid gap-6 rounded-xl border border-[#B8CDD7] bg-white p-5 md:grid-cols-[1.2fr_0.8fr] lg:grid-cols-[1.2fr_0.8fr_1fr] sm:p-6">
            <div><p className="text-sm font-bold">Building width</p><div className="mt-3 grid grid-cols-5 gap-1.5">{REGION_WAREHOUSE_WIDTHS.map((width) => <button key={width} type="button" aria-pressed={selectedWidth === width} onClick={() => setSelectedWidth(width)} className={`min-h-12 rounded-lg border px-1 text-sm font-bold transition ${selectedWidth === width ? "border-[#0043F3] bg-[#0043F3] text-white" : "border-[#B8CDD7] bg-white hover:bg-[#EDF5F8]"}`}>{width}m</button>)}</div></div>
            <div><label htmlFor="region-building-length" className="text-sm font-bold">Building length</label><select id="region-building-length" aria-label="Building length" value={selectedLength} onChange={(event) => setSelectedLength(Number(event.target.value))} className="mt-3 min-h-12 w-full rounded-lg border border-[#B8CDD7] bg-white px-3 text-sm font-semibold">{REGION_WAREHOUSE_LENGTHS.map((length) => <option key={length} value={length}>{length}m · {length / 4} bays</option>)}</select></div>
            <div className="border-t border-[#B8CDD7] pt-4 md:col-span-2 lg:col-span-1 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0" aria-live="polite" aria-atomic="true"><p className="text-sm font-bold">{selectedWidth} × {selectedLength} × {selectedWallHeight}m</p><p className="mt-2 text-sm leading-6 text-[#526C79]">{formatNumber(selectedArea)} m² · {selectedWallHeight}m eave height<br />Galvanised steel · {getModelCode(selectedWidth)}</p></div>
          </aside>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {selectedPrices.map((band, index) => <article key={band.key} className="flex min-w-0 flex-col rounded-xl border border-[#B8CDD7] bg-white p-5 sm:p-6">
              <span className="text-xs font-semibold text-[#0043F3]">0{index + 1}</span><h3 className="mt-3 text-lg font-bold">{band.title}</h3><p className="mt-3 text-sm leading-6 text-[#526C79]">{band.description}</p>
              {band.layoutNote ? <p className="mt-3 text-xs leading-5 text-[#526C79]">{band.layoutNote}</p> : null}
              <div className="mt-auto pt-6"><p className="text-2xl font-bold tracking-tight">{band.value}</p><p className="mt-1 text-xs text-[#526C79]">excl. VAT · {band.inclusiveValue} incl. VAT</p><Link href={band.href} className="mt-5 flex min-h-12 items-center justify-between gap-2 rounded-lg bg-[#0043F3] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#001D2E]">View in 3D <ArrowUpRightIcon className="h-4 w-4 shrink-0" aria-hidden="true" /></Link></div>
            </article>)}
          </div>
          <p className="mt-5 max-w-4xl text-sm leading-6 text-[#526C79]">Supply-only guidance, subject to review. Delivery, installation, foundations, floor slabs, doors and site-specific work are quoted separately. Sheeted options use galvanised IBR. Other heights, steel finishes and sheeting choices can be explored in the builder.</p>
        </div>
      </section>

      <section id="local-fit" className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:py-16">
        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0043F3]">Your area</p><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Planning a warehouse in {content.name}?</h2><p className="mt-5 text-base leading-7 text-[#526C79]">{content.intro}</p>{content.localContext ? <p className="mt-4 text-sm leading-7 text-[#526C79]" data-local-context>{content.localContext}</p> : null}
          {content.localConsiderations?.length ? <ul className="mt-4 space-y-2 text-sm leading-7 text-[#526C79]">{content.localConsiderations.map((item) => <li key={item}>{item}</li>)}</ul> : null}
          <p className="mt-5 flex items-center gap-2 text-sm font-bold"><MapPinIcon className="h-5 w-5 text-[#0043F3]" aria-hidden="true" />{content.name} and surrounding areas</p><ul className="mt-3 flex flex-wrap gap-2" aria-label="Local planning areas">{content.localZones.map((zone) => <li key={zone} className="rounded-full border border-[#B8CDD7] px-3 py-1.5 text-xs font-semibold">{zone}</li>)}</ul>
          <p className="mt-4 text-sm leading-6 text-[#526C79]">Share your exact delivery address so we can confirm transport costs, access and installation requirements for your site.</p>
          {content.evidenceSources?.length ? <details className="group mt-5 border-t border-[#B8CDD7] pt-3"><summary className="cursor-pointer text-xs font-semibold text-[#526C79]">Local planning references</summary><ul className="mt-3 space-y-2">{content.evidenceSources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer" className="text-xs leading-5 text-[#0043F3] underline underline-offset-4">{source.label}</a></li>)}</ul></details> : null}
        </div>
        <div className="rounded-xl border border-[#B8CDD7] p-6 sm:p-8"><h3 className="text-xl font-bold">A few details help us quote accurately</h3><ul className="mt-5 space-y-4">{[
          ["Location and access", "The town or site address, vehicle access and any unloading restrictions."],
          ["How you’ll use the space", `Your storage, workshop or operational needs, including ${content.industries.join(", ")}.`],
          ["Height and openings", "Required eave height, vehicle clearances, door sizes and opening positions."],
          ["Site and installation", "Ground conditions, foundation plans and whether you need installation included."],
        ].map(([title, text]) => <li key={title} className="flex gap-3"><CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#0043F3]" aria-hidden="true" /><div><h4 className="text-sm font-bold">{title}</h4><p className="mt-1 text-sm leading-6 text-[#526C79]">{text}</p></div></li>)}</ul></div>
      </section>

      <section id="scope" className="border-y border-[#B8CDD7] bg-[#F7FAFB] px-5 py-12 sm:px-8 lg:py-16"><div className="mx-auto max-w-7xl"><h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Know what you’re comparing</h2><div className="mt-7 grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-[#B8CDD7] bg-white p-6"><h3 className="text-lg font-bold">The building package</h3><p className="mt-3 text-sm leading-7 text-[#526C79]">The Atlas steel structure includes the members, purlins, bracing and scheduled connections. Roof and wall sheeting depend on your selected option. Fully enclosed options include gable ends and a standard opening; doors are reviewed separately.</p></div>
        <div className="rounded-xl border border-[#B8CDD7] bg-white p-6"><h3 className="text-lg font-bold">Quoted for your site</h3><p className="mt-3 text-sm leading-7 text-[#526C79]">Delivery, installation, foundations, floor slabs, doors and project-specific requirements are confirmed separately. Final engineering and the agreed quotation govern the supplied scope. Municipal and statutory approvals remain the client’s responsibility unless expressly included.</p></div>
      </div><p className="mt-5 text-sm leading-6 text-[#526C79]">Need more product detail? <Link href="/warehouses/cflc" className="font-bold text-[#0043F3] underline underline-offset-4">Explore the Atlas warehouse system</Link>.</p></div></section>

      <section id="process" className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:py-16"><h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">From a first idea to a clear quotation</h2><ol className="mt-7 grid gap-6 md:grid-cols-3">{[
        ["Configure your building", "Choose the width, length and sheeting scope. Explore your layout in the 3D builder."],
        ["Discuss the requirements", "Send your configuration and site details. We’ll work through access, openings, delivery and installation with you."],
        ["Receive a reviewed quotation", "We confirm the proposed scope and pricing so you can decide how to move forward."],
      ].map(([title, text], index) => <li key={title} className="border-t-2 border-[#B8CDD7] pt-5"><span className="text-sm font-bold text-[#0043F3]">0{index + 1}</span><h3 className="mt-3 text-lg font-bold">{title}</h3><p className="mt-2 text-sm leading-7 text-[#526C79]">{text}</p></li>)}</ol></section>

      <section id="faqs" className="border-y border-[#B8CDD7] bg-[#EDF5F8] px-5 py-12 sm:px-8 lg:py-16"><div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.75fr_1.25fr]"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0043F3]">Before you enquire</p><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Warehouse questions for {content.name}</h2></div><div className="divide-y divide-[#B8CDD7] border-y border-[#B8CDD7]">{content.faqItems.map((faq) => <details key={faq.question} className="group"><summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-4 text-sm font-bold [&::-webkit-details-marker]:hidden"><span>{faq.question}</span><span aria-hidden="true" className="shrink-0 text-xl text-[#0043F3] transition-transform group-open:rotate-45">+</span></summary><p className="pb-5 text-sm leading-7 text-[#526C79]">{faq.answer}</p></details>)}</div></div></section>

      <section className="bg-[#001D2E] px-5 py-12 text-white sm:px-8 lg:py-16"><div className="mx-auto max-w-7xl"><div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between"><div><h2 className="text-3xl font-semibold tracking-tight">Let’s plan your {content.name} warehouse.</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-[#C1D9E5]">Start with a size and budget, then let’s work through the requirements for your site.</p></div><div className="flex shrink-0 flex-wrap gap-3"><Link href={selectedBuilderHref} className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-bold text-[#001D2E]">Configure in 3D <ArrowUpRightIcon className="h-4 w-4" aria-hidden="true" /></Link><a href="tel:+27828464555" className="inline-flex min-h-12 items-center gap-2 rounded-lg border border-white/40 px-5 py-3 text-sm font-bold"><PhoneIcon className="h-4 w-4" aria-hidden="true" />Call Smart Steel</a></div></div>
        <div className="mt-9 border-t border-white/20 pt-6"><p className="text-sm font-bold">More planning guides</p><div className="mt-3 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#C1D9E5]"><Link href="/warehouse-cost">Warehouse costs</Link><Link href="/warehouses/cflc">Atlas products</Link><Link href="/warehouse-regions">All service regions</Link></div><p className="mt-5 text-xs text-[#C1D9E5]">Other areas</p><div className="mt-2 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#C1D9E5]">{regionLinks.slice(0, 3).map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}</div></div>
      </div></section>
    </main>
  );
}
