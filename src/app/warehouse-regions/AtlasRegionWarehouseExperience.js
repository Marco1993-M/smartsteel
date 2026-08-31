"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRightIcon,
  BuildingOffice2Icon,
  CalculatorIcon,
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  MapPinIcon,
  PhoneIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import {
  ATLAS_W_SERIES,
  ATLAS_W_SERIES_APPLICATIONS,
  ATLAS_W_SERIES_PRINCIPLES,
} from "../../lib/atlasProductData";
import {
  REGION_WAREHOUSE_LENGTHS,
  REGION_WAREHOUSE_WIDTHS,
} from "./regionWarehouseData";
import { calculateAtlasWarehouseEstimate } from "../../lib/estimates/atlasWarehouseEstimate.js";
import {
  AtlasMasthead,
  AtlasMaterialStudy,
  AtlasPrimaryAction,
  AtlasSecondaryAction,
  AtlasSectionLabel,
} from "../../components/atlas/AtlasPagePrimitives.js";

const HERO_LENGTHS = [12, 20, 32, 40];

const enclosureImages = [
  {
    src: "/warehouse-builder/enclosure-structure-only.png",
    label: "Structure",
  },
  {
    src: "/warehouse-builder/enclosure-roof-only.png",
    label: "Roof",
  },
  {
    src: "/warehouse-builder/enclosure-fully-enclosed.png",
    label: "Shell",
  },
];

const scopeRows = [
  ["Steel system", "Atlas W-Series cold-formed lip channel warehouse system"],
  ["Standard widths", "8m, 10m, and 12m spans with lengths configured in 4m bays"],
  ["Steel finishes", "Mild Steel, ZAM, or galvanised steel"],
  ["Guide pricing", "Live supply-only prices based on the selected Atlas footprint"],
  ["Typical scope", "Structure-only, roof-sheeted, or enclosed shell starting points"],
  ["Final review", "Site, slab, access, doors, delivery, and installation checked before quote"],
];

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
    description: "Structure plus galvanised IBR roof and wall sheeting. Openings are reviewed separately.",
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
  const selectedModel =
    ATLAS_W_SERIES.find((model) => model.width === selectedWidth) ||
    ATLAS_W_SERIES[0];
  const selectedBuilderHref = buildSizeBuilderHref(selectedWidth, selectedLength);
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
      href: `${selectedBuilderHref}&sheeting=${scope.key}&steelFinish=Galv&sheetingProfile=IBR&sheetingFinish=galvanised`,
    };
  });
  const structurePrice = selectedPrices[0];
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
    <main className="min-h-screen bg-[#FFFFFF] text-[#001D2E]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />

      <section className="bg-white px-4 pb-10 pt-24 sm:px-6 sm:pt-28 lg:px-8 lg:pb-14 lg:pt-28">
        <div className="mx-auto max-w-7xl border border-[#001D2E]/15 bg-white shadow-[0_40px_100px_-72px_rgba(0,29,46,0.72)]">
          <AtlasMasthead descriptor="Product dossier" meta={content.lastUpdated} />

          <div className="grid lg:grid-cols-[1.18fr_0.82fr]">
            <div className="relative overflow-hidden border-b border-[#001D2E]/12 p-6 sm:p-10 lg:border-b-0 lg:border-r lg:p-12">
              <div className="absolute -right-14 -top-12 select-none font-mono text-[10rem] font-semibold leading-none text-[#C1D9E5]/42 sm:text-[14rem]">
                {getModelCode(selectedWidth)}
              </div>
              <div className="relative max-w-3xl">
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#0043F3]">
                  JHB / W-Series / {getModelCode(selectedWidth)}
                </p>
                <h1 className="mt-8 text-5xl font-semibold leading-[0.94] text-[#001D2E] sm:text-6xl lg:text-[5rem]">
                  Atlas warehouse systems for Johannesburg.
                </h1>
                <p className="mt-7 max-w-2xl text-base leading-7 text-[#001D2E]/68 sm:text-lg">
                  {content.heroDescription}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <AtlasPrimaryAction href={selectedBuilderHref}>
                    Build and price this warehouse
                  </AtlasPrimaryAction>
                  <AtlasSecondaryAction href="#pricing">Compare guide prices</AtlasSecondaryAction>
                </div>
              </div>

              <div className="relative mt-10 grid border-y border-[#001D2E]/14 sm:grid-cols-3">
                {content.proofStats.map((stat, index) => (
                  <div key={stat.label} className="border-b border-[#001D2E]/12 py-5 sm:border-b-0 sm:border-r sm:px-5 sm:first:pl-0 sm:last:border-r-0">
                    <p className="font-mono text-[9px] tracking-[0.16em] text-[#0043F3]">SPEC 0{index + 1}</p>
                    <p className="mt-3 text-2xl font-semibold text-[#001D2E]">{stat.value}</p>
                    <p className="mt-2 max-w-[15rem] text-xs leading-5 text-[#001D2E]/58">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <aside className="bg-[#F3F7F9] p-5 sm:p-8 lg:p-10">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <AtlasSectionLabel>Configure / 01</AtlasSectionLabel>
                  <h2 className="mt-2 text-3xl font-semibold text-[#001D2E]">Set the footprint.</h2>
                </div>
                <CalculatorIcon className="h-7 w-7 text-[#0043F3]" aria-hidden="true" />
              </div>

              <div className="mt-8 border-t border-[#001D2E]/14">
                <div className="grid grid-cols-[72px_1fr] items-center border-b border-[#001D2E]/14 py-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#001D2E]/45">Span</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {REGION_WAREHOUSE_WIDTHS.map((width) => (
                      <button key={width} type="button" aria-pressed={selectedWidth === width} onClick={() => setSelectedWidth(width)} className={`px-2 py-3 text-sm font-semibold transition ${selectedWidth === width ? "bg-[#0043F3] text-white" : "bg-white text-[#001D2E] hover:bg-[#C1D9E5]"}`}>
                        {getModelCode(width)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-[72px_1fr] items-center border-b border-[#001D2E]/14 py-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#001D2E]/45">Length</p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {HERO_LENGTHS.map((length) => (
                      <button key={length} type="button" aria-pressed={selectedLength === length} onClick={() => setSelectedLength(length)} className={`px-2 py-3 text-sm font-semibold transition ${selectedLength === length ? "bg-[#0043F3] text-white" : "bg-white text-[#001D2E] hover:bg-[#C1D9E5]"}`}>
                        {length}m
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-[1fr_auto] items-end gap-5 py-7">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#001D2E]/45">Selected assembly</p>
                  <p className="mt-2 text-3xl font-semibold text-[#001D2E]">{selectedWidth} × {selectedLength} × {selectedWallHeight}m</p>
                  <p className="mt-2 text-xs leading-5 text-[#001D2E]/58">{formatNumber(selectedArea)} m² · {selectedModel.bestFor}</p>
                </div>
                <p className="font-mono text-xs font-semibold text-[#0043F3]">{getModelCode(selectedWidth)}</p>
              </div>

              <div className="bg-[#001D2E] p-5 text-white">
                <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#C1D9E5]">Structure-only guide / excl. VAT</p>
                <p className="mt-2 text-3xl font-semibold">{structurePrice.value}</p>
                <p className="mt-2 text-xs leading-5 text-white/52">Supply only. Site-specific items are reviewed before final quotation.</p>
              </div>

              <Link href={selectedBuilderHref} className="group mt-2 flex w-full items-center justify-between bg-[#0043F3] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#001D2E]">
                Open this assembly in 3D
                <ArrowUpRightIcon className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
              </Link>
            </aside>
          </div>

          <div className="relative h-52 overflow-hidden border-t border-[#001D2E]/12 sm:h-64">
            <Image src="/CFLC.webp" alt={`Atlas lip channel warehouse steel detail for ${content.name}`} fill priority sizes="100vw" className="object-cover object-center" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,29,46,0.82),rgba(0,29,46,0.08)_70%)]" />
            <p className="absolute bottom-6 left-6 max-w-md text-xl font-semibold leading-tight text-white sm:bottom-8 sm:left-10 sm:text-2xl">
              Cold-formed lip channel members. Modular lengths. One controlled Atlas system.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#001D2E] px-4 py-4 text-[#FFFFFF] sm:px-6 lg:px-8">
        <nav
          aria-label="Atlas warehouse sections"
          className="mx-auto flex max-w-7xl gap-6 overflow-x-auto whitespace-nowrap text-xs font-semibold uppercase tracking-[0.12em] text-white/58"
        >
          <a href="#local-fit" className="transition hover:text-[#C1D9E5]"><span className="font-mono text-[#C1D9E5]">01</span> Local fit</a>
          <a href="#w-series" className="transition hover:text-[#C1D9E5]"><span className="font-mono text-[#C1D9E5]">02</span> W-Series</a>
          <a href="#pricing" className="transition hover:text-[#C1D9E5]"><span className="font-mono text-[#C1D9E5]">03</span> Guide pricing</a>
          <a href="#spec" className="transition hover:text-[#C1D9E5]"><span className="font-mono text-[#C1D9E5]">04</span> Spec</a>
          <a href="#process" className="transition hover:text-[#C1D9E5]"><span className="font-mono text-[#C1D9E5]">05</span> Process</a>
          <a href="#faqs" className="transition hover:text-[#C1D9E5]"><span className="font-mono text-[#C1D9E5]">06</span> FAQs</a>
        </nav>
      </section>

      <section id="local-fit" className="bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.86fr_1.14fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0043F3]">
              Local warehouse planning
            </p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
              {content.localSeoHeadline || `Atlas warehouse supply for ${content.name} projects`}
            </h2>
            <p className="mt-6 text-base leading-7 text-[#001D2E]/68">
              {content.localSeoCopy || `${content.description} ${content.intro}`}
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {content.localZones.map((zone) => (
                <span key={zone} className="border border-[#001D2E]/12 bg-[#FFFFFF] px-3 py-2 text-xs font-semibold text-[#001D2E]/70">
                  {zone}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {(content.corridorNotes || content.searchIntentPoints).map((note, index) => (
              <div key={note} className="relative border border-[#001D2E]/12 bg-[#C1D9E5]/40 p-5 pt-8">
                <span className="absolute right-4 top-3 font-mono text-[9px] tracking-[0.14em] text-[#001D2E]/36">
                  LOC-0{index + 1}
                </span>
                <MapPinIcon className="h-5 w-5 text-[#0043F3]" aria-hidden="true" />
                <p className="mt-5 text-sm leading-6 text-[#001D2E]/66">{note}</p>
              </div>
            ))}
            {(content.decisionFactors || content.trustPoints).map((factor) => (
              <div key={factor} className="border border-[#001D2E]/12 bg-white p-5 shadow-[0_18px_36px_-32px_rgba(0,29,46,0.55)]">
                <CheckCircleIcon className="h-5 w-5 text-[#0043F3]" aria-hidden="true" />
                <p className="mt-5 text-sm leading-6 text-[#001D2E]/66">{factor}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="w-series" className="relative isolate overflow-hidden bg-[#C1D9E5] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="pointer-events-none absolute right-[-8rem] top-[-16rem] -z-10 h-[42rem] w-[12rem] rotate-45 bg-white/35" />
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0043F3]">
                Atlas W-Series
              </p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
                Choose from a defined warehouse system before you request a quote.
              </h2>
            </div>
            <p className="max-w-3xl text-base leading-7 text-[#001D2E]/66">
              Atlas gives {content.name} buyers a cleaner starting point: choose a standard span, set the length, compare enclosure scope, then continue into the builder with clearer project details for Smart Steel.
            </p>
          </div>

          <div className="mt-10 border-y border-[#001D2E]/18">
            {ATLAS_W_SERIES.map((model) => (
              <Link
                key={model.code}
                href={buildSizeBuilderHref(model.width, selectedLength)}
                className={`group grid gap-4 border-b border-[#001D2E]/18 px-1 py-6 transition last:border-b-0 sm:grid-cols-[110px_120px_1fr_auto] sm:items-center ${model.featured ? "text-[#0043F3]" : "text-[#001D2E] hover:text-[#0043F3]"}`}
              >
                <p className="font-mono text-sm font-semibold">ATLAS {model.code}</p>
                <p className="text-3xl font-semibold text-[#001D2E]">{model.spanLabel}</p>
                <div>
                  <h3 className="text-lg font-semibold text-[#001D2E]">{model.title}</h3>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-[#001D2E]/60">{model.bestFor}</p>
                </div>
                <ArrowUpRightIcon className="h-5 w-5 transition group-hover:translate-x-1 group-hover:-translate-y-1" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="bg-[#001D2E] px-4 py-16 text-[#FFFFFF] sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#C1D9E5]">
                Live Atlas guide pricing
              </p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
                Compare guide pricing before you request a quote.
              </h2>
              <p className="mt-6 text-base leading-7 text-white/66">
                Compare all three supply scopes for the footprint selected above. Prices update together so the difference between the structure, roof, and enclosed shell stays clear.
              </p>
              <div className="mt-6 inline-flex border border-white/16 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white/76">
                {getModelCode(selectedWidth)} · {selectedWidth}m x {selectedLength}m x {selectedWallHeight}m · Galvanised steel
              </div>
            </div>

            <div className="border-y border-white/18">
              {selectedPrices.map((band, index) => (
                <Link key={band.title} href={band.href} className={`group grid gap-4 border-b border-white/18 py-5 last:border-b-0 sm:grid-cols-[1fr_170px_28px] sm:items-center ${index === 0 ? "text-white" : "text-white/72 hover:text-white"}`}>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.13em] text-[#C1D9E5]">{band.title}</p>
                    <p className="mt-2 text-xs leading-5 text-white/50">{band.description}</p>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-2xl font-semibold text-white">{band.value}</p>
                    <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/38">Excl. VAT</p>
                  </div>
                  <ArrowUpRightIcon className="h-5 w-5 text-[#C1D9E5] transition group-hover:translate-x-1 group-hover:-translate-y-1" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-14 border-y border-white/18">
            <div className="grid lg:grid-cols-[1.1fr_repeat(3,0.72fr)]">
              <div className="flex flex-col justify-center border-b border-white/18 py-7 lg:border-b-0 lg:border-r lg:pr-8">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#C1D9E5]">
                  Scope progression / 01–03
                </p>
                <h3 className="mt-4 max-w-md text-2xl font-semibold leading-tight">
                  See exactly how the Atlas scope builds up.
                </h3>
                <p className="mt-4 max-w-lg text-sm leading-6 text-white/58">
                  Structure, roof, and enclosed shell are priced as separate supply stages. Slab, openings, delivery, installation, and site access are confirmed during review.
                </p>
              </div>
              {enclosureImages.map((image, index) => (
                <div
                  key={image.label}
                  className="group grid grid-cols-[54px_1fr] items-center border-b border-white/18 py-5 last:border-b-0 lg:block lg:border-b-0 lg:border-r lg:px-5 lg:last:border-r-0"
                >
                  <p className="font-mono text-xs text-[#C1D9E5]">0{index + 1}</p>
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#F3F7F9] lg:mt-4">
                    <Image
                      src={image.src}
                      alt={`Atlas ${image.label.toLowerCase()} warehouse configuration`}
                      fill
                      sizes="(min-width: 1024px) 16vw, 70vw"
                      className="object-contain p-2 transition duration-500 group-hover:scale-[1.04]"
                    />
                  </div>
                  <p className="col-span-2 mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/68">
                    {image.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="spec" className="bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div>
            <AtlasSectionLabel className="text-xs tracking-[0.24em]">System specification</AtlasSectionLabel>
            <h2 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
              Clear Atlas specifications for your project.
            </h2>
            <div className="mt-8 divide-y divide-[#001D2E]/12 border-y border-[#001D2E]/12">
              {scopeRows.map(([label, value]) => (
                <div key={label} className="grid gap-2 py-4 sm:grid-cols-[180px_1fr]">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#001D2E]/46">
                    {label}
                  </p>
                  <p className="text-sm leading-6 text-[#001D2E]/70">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <AtlasMaterialStudy
            src="/Atlas_warehouses_w08_spec_sheet.png"
            alt="Punched Atlas W08 cold-formed lip channel members"
            label="Material study / W08"
            eyebrow="Cold-formed member"
            caption="Rolled, punched, and prepared for the Atlas connection system."
            reference="ATLAS / SPEC 04"
            imageClassName="scale-[1.28] object-cover object-[center_12%]"
          />
        </div>
      </section>

      <section className="bg-[#FFFFFF] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0043F3]">
                Builder footprints
              </p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
                Jump straight into the Atlas builder.
              </h2>
            </div>
            <p className="text-base leading-7 text-[#001D2E]/66">
              Choose a valid 4m-bay footprint below. Your selected width and length will carry into the 3D builder.
            </p>
          </div>

          <div className="relative mt-10 grid gap-4 overflow-hidden border border-[#001D2E]/12 bg-[#C1D9E5] p-5 lg:grid-cols-[1fr_0.72fr] lg:p-7">
            <div className="pointer-events-none absolute left-7 right-7 top-4 h-px bg-[#001D2E]/20 before:absolute before:-left-px before:-top-1 before:h-2 before:w-px before:bg-[#001D2E]/35 after:absolute after:-right-px after:-top-1 after:h-2 after:w-px after:bg-[#001D2E]/35" />
            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#001D2E]/48">Choose a width</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {REGION_WAREHOUSE_WIDTHS.map((width) => (
                  <button
                    key={width}
                    type="button"
                    aria-pressed={selectedWidth === width}
                    onClick={() => setSelectedWidth(width)}
                    className={`border px-4 py-3 text-sm font-semibold transition ${
                      selectedWidth === width
                        ? "border-[#0043F3] bg-[#0043F3] text-white"
                        : "border-[#001D2E]/14 bg-white/70 text-[#001D2E] hover:border-[#0043F3]"
                    }`}
                  >
                    {getModelCode(width)} · {width}m
                  </button>
                ))}
              </div>

              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-[#001D2E]/48">Choose a length</p>
              <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-7">
                {REGION_WAREHOUSE_LENGTHS.map((length) => (
                  <button
                    key={length}
                    type="button"
                    aria-pressed={selectedLength === length}
                    onClick={() => setSelectedLength(length)}
                    className={`border px-2 py-2.5 text-sm font-semibold transition ${
                      selectedLength === length
                        ? "border-[#001D2E] bg-[#001D2E] text-white"
                        : "border-[#001D2E]/12 bg-white/60 text-[#001D2E] hover:border-[#0043F3]"
                    }`}
                  >
                    {length}m
                  </button>
                ))}
              </div>
            </div>

            <div className="relative flex flex-col justify-between border-t-2 border-[#0043F3] bg-white p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0043F3]">Selected warehouse</p>
                <p className="mt-3 text-3xl font-semibold text-[#001D2E]">{selectedWidth}m x {selectedLength}m</p>
                <p className="mt-2 text-sm text-[#001D2E]/62">
                  {formatNumber(selectedWidth * selectedLength)} m² footprint · {selectedWallHeight}m standard eave height
                </p>
              </div>
              <Link
                href={selectedBuilderHref}
                className="mt-8 inline-flex items-center justify-between gap-3 bg-[#0043F3] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#001D2E]"
              >
                Open this footprint in 3D
                <ArrowUpRightIcon className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="process" className="bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0043F3]">
                From first size to reviewed quote
              </p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
                A clearer path for {content.name} buyers.
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {content.processSteps.map((step, index) => {
                const Icon = [ClipboardDocumentCheckIcon, CalculatorIcon, TruckIcon, BuildingOffice2Icon][index] || CheckCircleIcon;
                return (
                  <div key={step.title} className="border border-[#001D2E]/12 bg-[#C1D9E5] p-5">
                    <Icon className="h-6 w-6 text-[#0043F3]" aria-hidden="true" />
                    <p className="mt-5 font-mono text-xs text-[#0043F3]">0{index + 1}</p>
                    <h3 className="mt-3 text-xl font-semibold text-[#001D2E]">{step.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-[#001D2E]/64">{step.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-12 grid gap-px border border-[#001D2E]/12 bg-[#001D2E]/12 sm:grid-cols-2 lg:grid-cols-4">
            {ATLAS_W_SERIES_PRINCIPLES.map(([title, description], index) => (
              <div key={title} className="bg-white p-6">
                <p className="font-mono text-xs text-[#0043F3]">0{index + 1}</p>
                <h3 className="mt-6 text-lg font-semibold text-[#001D2E]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#001D2E]/62">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#001D2E] px-4 py-16 text-[#FFFFFF] sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#C1D9E5]">
                Common applications
              </p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
                Built around practical warehouse demand.
              </h2>
            </div>
            <p className="text-base leading-7 text-white/64">
              {content.marketFocus}
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ATLAS_W_SERIES_APPLICATIONS.map(([number, title, description]) => (
              <div key={title} className="border-t border-white/16 pt-5">
                <p className="font-mono text-xs text-[#C1D9E5]">{number}</p>
                <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/62">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faqs" className="bg-[#FFFFFF] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.72fr_1.28fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0043F3]">
              Buyer questions
            </p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
              The questions people ask before they commit.
            </h2>
            <div className="mt-8 space-y-3">
              {content.buyerQuestions.map((question) => (
                <p key={question} className="border-l border-[#C1D9E5] pl-4 text-sm leading-6 text-[#001D2E]/66">
                  {question}
                </p>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {content.faqItems.map((faq) => (
              <details key={faq.question} className="border border-[#001D2E]/12 bg-white/76 p-5">
                <summary className="cursor-pointer text-base font-semibold text-[#001D2E]">
                  {faq.question}
                </summary>
                <p className="mt-4 text-sm leading-7 text-[#001D2E]/66">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-[linear-gradient(110deg,#001D2E_0%,#07367E_56%,#0043F3_100%)] px-4 py-16 text-white sm:px-6 lg:px-8 lg:py-20">
        <div className="pointer-events-none absolute -right-24 -top-40 -z-10 h-[520px] w-[180px] rotate-45 bg-white/[0.08]" />
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_1fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#C1D9E5]">
              Next step
            </p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Build the first Atlas version of your {content.name} warehouse.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/68">
              Start from a W-Series span, carry the footprint into the builder, and give Smart Steel clearer project details for review.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Link
              href={selectedBuilderHref}
              className="inline-flex items-center gap-2 bg-white px-6 py-3.5 text-sm font-semibold text-[#0043F3] transition hover:bg-[#C1D9E5]"
            >
              Configure in 3D builder
              <ArrowUpRightIcon className="h-4 w-4" aria-hidden="true" />
            </Link>
            <a
              href="tel:+27828464555"
              className="inline-flex items-center gap-2 border border-white/30 bg-white/[0.08] px-6 py-3.5 text-sm font-semibold text-white transition hover:border-white hover:bg-white/15"
            >
              <PhoneIcon className="h-4 w-4" aria-hidden="true" />
              Call Smart Steel
            </a>
          </div>
        </div>

        <div className="mx-auto mt-12 grid max-w-7xl gap-6 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <h3 className="text-lg font-semibold text-white">More warehouse planning guides</h3>
            <p className="mt-2 text-sm leading-6 text-white/62">
              Use these guides to compare warehouse sizing, costs, systems, and nearby regional options.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {content.internalLinks.slice(0, 6).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="border border-white/16 bg-white/[0.08] p-4 text-sm font-semibold text-white transition hover:border-[#C1D9E5] hover:bg-white/14"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-8 grid max-w-7xl gap-3 sm:grid-cols-3">
          {regionLinks.slice(0, 3).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="border border-white/16 bg-white/[0.06] p-4 text-sm font-semibold text-white transition hover:border-[#C1D9E5] hover:bg-white/14"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
