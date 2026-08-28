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
    title: "Roof and walls sheeted",
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

      <section className="relative isolate overflow-hidden bg-[#FFFFFF] px-4 pb-12 pt-32 sm:px-6 sm:pt-36 lg:px-8 lg:pb-16 lg:pt-40">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 top-20 [background-image:linear-gradient(rgba(0,29,46,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(0,29,46,0.08)_1px,transparent_1px)] [background-size:42px_42px] sm:top-24" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(180deg,rgba(255,255,255,0),#001D2E)]" />

        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center justify-between gap-5 border-b border-[#001D2E]/18 pb-6">
            <Image
              src="/atlas/atlas-logo-horizontal-dark.png"
              alt="Atlas by Smart Steel"
              width={320}
              height={50}
              priority
              className="h-12 w-auto max-w-full object-contain object-left sm:h-14"
            />
            <p className="border-l-2 border-[#0043F3] py-1 pl-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#001D2E]/60">
              {content.lastUpdated}
            </p>
          </div>

          <div className="grid gap-8 pt-10 lg:grid-cols-[0.86fr_1.14fr] lg:items-stretch lg:pt-14">
            <div className="flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0043F3]">
                  Atlas W-Series / Smart Steel South Africa
                </p>
                <h1 className="mt-5 max-w-3xl text-5xl font-semibold leading-[0.96] text-[#001D2E] sm:text-6xl lg:text-7xl">
                  Atlas warehouse builders in {content.name}
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-7 text-[#001D2E]/72 sm:text-lg">
                  {content.heroDescription}
                </p>
              </div>

              <div className="mt-8 grid gap-px border border-[#001D2E]/12 bg-[#001D2E]/12 sm:grid-cols-3">
                {content.proofStats.map((stat, index) => (
                  <div key={stat.label} className="relative bg-white/78 p-4 pt-7">
                    <span className="absolute left-4 top-3 font-mono text-[9px] tracking-[0.16em] text-[#0043F3]">
                      0{index + 1}
                    </span>
                    <p className="text-2xl font-semibold text-[#001D2E]">{stat.value}</p>
                    <p className="mt-2 text-xs leading-5 text-[#001D2E]/62">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[0.96fr_1.04fr]">
              <div className="relative min-h-[420px] overflow-hidden border border-[#001D2E]/12 bg-[#001D2E]">
                <Image
                  src="/CFLC.webp"
                  alt={`Atlas lip channel warehouse steel detail for ${content.name}`}
                  fill
                  priority
                  sizes="(min-width: 1024px) 34vw, 100vw"
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,29,46,0.03),rgba(0,29,46,0.82))]" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-[#FFFFFF]">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C1D9E5]">
                    Atlas W-Series system
                  </p>
                  <p className="mt-2 text-2xl font-semibold leading-tight">
                    A practical lip channel warehouse system for projects that need a clearer starting size.
                  </p>
                </div>
              </div>

              <aside className="border border-[#001D2E]/12 bg-white p-5 shadow-[0_24px_60px_-40px_rgba(0,29,46,0.65)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0043F3]">
                      Fast configuration
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-[#001D2E]">
                      Start with {getModelCode(selectedWidth)}
                    </h2>
                  </div>
                  <CalculatorIcon className="h-7 w-7 text-[#0043F3]" aria-hidden="true" />
                </div>

                <div className="mt-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#001D2E]/48">
                    Span
                  </p>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {REGION_WAREHOUSE_WIDTHS.map((width) => (
                      <button
                        key={width}
                        type="button"
                        aria-pressed={selectedWidth === width}
                        onClick={() => setSelectedWidth(width)}
                        className={`border px-3 py-3 text-sm font-semibold transition ${
                          selectedWidth === width
                            ? "border-[#0043F3] bg-[#0043F3] text-white"
                            : "border-[#001D2E]/12 bg-[#FFFFFF] text-[#001D2E] hover:border-[#0043F3]"
                        }`}
                      >
                        {getModelCode(width)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#001D2E]/48">
                    Length
                  </p>
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {HERO_LENGTHS.map((length) => (
                      <button
                        key={length}
                        type="button"
                        aria-pressed={selectedLength === length}
                        onClick={() => setSelectedLength(length)}
                        className={`border px-3 py-3 text-sm font-semibold transition ${
                          selectedLength === length
                            ? "border-[#0043F3] bg-[#0043F3] text-white"
                            : "border-[#001D2E]/12 bg-[#FFFFFF] text-[#001D2E] hover:border-[#0043F3]"
                        }`}
                      >
                        {length}m
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6 border-y border-[#001D2E]/12 py-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#001D2E]/48">
                    Selected footprint
                  </p>
                  <p className="mt-1 text-3xl font-semibold text-[#001D2E]">
                    {selectedWidth}m x {selectedLength}m
                  </p>
                  <p className="mt-1 text-sm text-[#001D2E]/62">
                    {formatNumber(selectedArea)} m² Atlas warehouse starting point
                  </p>
                  <p className="mt-4 text-sm leading-6 text-[#001D2E]/66">
                    {selectedModel.bestFor}
                  </p>
                </div>

                <div className="mt-5 border-l-2 border-[#0043F3] bg-[#C1D9E5]/45 p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0043F3]">
                    Live structure-only guide
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-[#001D2E]">{structurePrice.value}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#001D2E]/48">
                    Excluding VAT · {selectedWidth}m x {selectedLength}m x {selectedWallHeight}m
                  </p>
                  <p className="mt-2 text-xs leading-5 text-[#001D2E]/60">
                    Supply-only guide. Delivery, installation, foundations, openings, and site requirements are reviewed separately.
                  </p>
                </div>

                <Link
                  href={selectedBuilderHref}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 bg-[#0043F3] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#001D2E]"
                >
                  Configure this Atlas warehouse
                  <ArrowUpRightIcon className="h-4 w-4" aria-hidden="true" />
                </Link>
              </aside>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#001D2E] px-4 py-4 text-[#FFFFFF] sm:px-6 lg:px-8">
        <nav
          aria-label="Atlas warehouse sections"
          className="mx-auto flex max-w-7xl gap-6 overflow-x-auto whitespace-nowrap text-xs font-semibold uppercase tracking-[0.12em] text-white/58"
        >
          <a href="#local-fit" className="transition hover:text-[#C1D9E5]">Local fit</a>
          <a href="#w-series" className="transition hover:text-[#C1D9E5]">W-Series</a>
          <a href="#pricing" className="transition hover:text-[#C1D9E5]">Guide pricing</a>
          <a href="#spec" className="transition hover:text-[#C1D9E5]">Spec</a>
          <a href="#process" className="transition hover:text-[#C1D9E5]">Process</a>
          <a href="#faqs" className="transition hover:text-[#C1D9E5]">FAQs</a>
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
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-45 [background-image:linear-gradient(rgba(0,29,46,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,29,46,0.1)_1px,transparent_1px)] [background-size:48px_48px]" />
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

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {ATLAS_W_SERIES.map((model) => (
              <Link
                key={model.code}
                href={buildSizeBuilderHref(model.width, selectedLength)}
                className={`group relative overflow-hidden border p-6 transition hover:-translate-y-1 ${
                  model.featured
                    ? "border-[#0043F3] bg-[#0043F3] text-white shadow-[0_24px_60px_-44px_rgba(0,29,46,0.8)]"
                    : "border-[#001D2E]/12 bg-[#C1D9E5] text-[#001D2E] hover:border-[#0043F3]"
                }`}
              >
                <span className={`absolute right-0 top-0 h-px w-24 ${model.featured ? "bg-[#C1D9E5]" : "bg-[#0043F3]"}`} />
                <p className={`font-mono text-sm ${model.featured ? "text-[#C1D9E5]" : "text-[#0043F3]"}`}>
                  ATLAS {model.code}
                </p>
                <p className="mt-8 text-4xl font-semibold">{model.spanLabel}</p>
                <h3 className="mt-4 text-xl font-semibold">{model.title}</h3>
                <p className={`mt-3 text-sm leading-6 ${model.featured ? "text-white/70" : "text-[#001D2E]/64"}`}>
                  {model.bestFor}
                </p>
                <span className={`mt-8 inline-flex items-center gap-2 text-sm font-semibold ${model.featured ? "text-[#C1D9E5]" : "text-[#0043F3]"}`}>
                  Configure {model.code}
                  <ArrowUpRightIcon className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                </span>
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

            <div className="grid gap-4 md:grid-cols-3">
              {selectedPrices.map((band, index) => (
                <Link key={band.title} href={band.href} className={`group relative flex min-h-[310px] flex-col overflow-hidden border p-5 transition hover:-translate-y-1 ${index === 0 ? "border-[#0043F3] bg-[#0043F3]/20" : "border-white/14 bg-white/[0.06] hover:border-[#0043F3]"}`}>
                  <span className={`absolute inset-x-0 top-0 h-1 ${index === 0 ? "bg-[#0043F3]" : "bg-[#C1D9E5]/35"}`} />
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C1D9E5]">
                    {band.title}
                  </p>
                  <p className="mt-5 text-3xl font-semibold text-white">{band.value}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-white/46">Excluding VAT</p>
                  <p className="mt-4 text-sm leading-6 text-white/62">{band.description}</p>
                  <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-[#C1D9E5]">
                    Build this option
                    <ArrowUpRightIcon className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-12 grid gap-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="grid grid-cols-3 gap-3">
              {enclosureImages.map((image) => (
                <div key={image.label} className="border border-white/12 bg-white/90 p-3">
                  <div className="relative aspect-square">
                    <Image
                      src={image.src}
                      alt={`Atlas ${image.label.toLowerCase()} warehouse configuration`}
                      fill
                      sizes="(min-width: 1024px) 10vw, 30vw"
                      className="object-contain"
                    />
                  </div>
                  <p className="mt-2 text-center text-xs font-semibold uppercase tracking-[0.12em] text-[#001D2E]/58">
                    {image.label}
                  </p>
                </div>
              ))}
            </div>
            <div className="border border-white/14 p-6">
              <h3 className="text-2xl font-semibold">Know what is included before you request a quote.</h3>
              <p className="mt-4 text-sm leading-6 text-white/64">
                Atlas gives you a defined starting point, while slab, doors, sheeting selection, delivery, installation, and site access are still checked before a final number is confirmed.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="spec" className="bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0043F3]">
              System specification
            </p>
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

          <div className="border border-[#001D2E]/12 bg-[#FFFFFF] p-5">
            <div className="relative aspect-[4/5] overflow-hidden bg-[#001D2E]">
              <Image
                src="/Atlas_warehouses_w08_spec_sheet.png"
                alt="Atlas W08 warehouse product specification sheet"
                fill
                sizes="(min-width: 1024px) 34vw, 100vw"
                className="object-cover object-center"
              />
            </div>
          </div>
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
            <div className="pointer-events-none absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(0,29,46,0.09)_1px,transparent_1px),linear-gradient(90deg,rgba(0,29,46,0.09)_1px,transparent_1px)] [background-size:32px_32px]" />
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
