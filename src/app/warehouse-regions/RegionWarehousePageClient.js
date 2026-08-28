"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import WarehouseCatalogue from "../../components/warehouse-catalogue.js";
import {
  REGION_WAREHOUSE_LENGTHS,
  REGION_WAREHOUSE_WIDTHS,
  buildRegionWarehouseContent,
  getRegionWarehouseConfigs,
} from "./regionWarehouseData";
import AtlasRegionWarehouseExperience from "./AtlasRegionWarehouseExperience";

export default function RegionWarehousePageClient({ citySlug }) {
  const content = buildRegionWarehouseContent(citySlug);
  const [selectedWidth, setSelectedWidth] = useState(REGION_WAREHOUSE_WIDTHS[0]);
  const [selectedLength, setSelectedLength] = useState(20);

  const regionLinks = useMemo(
    () =>
      getRegionWarehouseConfigs()
        .filter((region) => region.citySlug !== citySlug)
        .map((region) => ({
          href: `/${region.legacySlug}`,
          label: `Steel Warehouses ${region.name}`,
        })),
    [citySlug]
  );

  const buildSizeBuilderHref = (width, length) => {
    if (!content.prefillBuilderDimensions) return content.pricePath;

    const separator = content.pricePath.includes("?") ? "&" : "?";
    return `${content.pricePath}${separator}width=${width}&length=${length}`;
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: content.faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.smartsteel.co.za/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: content.breadcrumbSectionName,
        item: "https://www.smartsteel.co.za/warehouses",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `Steel Warehouses ${content.name}`,
        item: `https://www.smartsteel.co.za/${content.legacySlug}`,
      },
    ],
  };

  if (content.warehouseSystem === "atlas") {
    return (
      <AtlasRegionWarehouseExperience
        content={content}
        selectedWidth={selectedWidth}
        setSelectedWidth={setSelectedWidth}
        selectedLength={selectedLength}
        setSelectedLength={setSelectedLength}
        buildSizeBuilderHref={buildSizeBuilderHref}
        faqSchema={faqSchema}
        breadcrumbSchema={breadcrumbSchema}
        regionLinks={regionLinks}
      />
    );
  }

  return (
    <main className="font-sans text-gray-800">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <section className="relative flex min-h-[92vh] items-start justify-center overflow-hidden bg-black px-6 text-center text-white">
        <Image
          src={content.heroImage}
          alt={`${content.pageHeading}`}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/20 to-black/55" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white via-white/90 to-transparent md:h-40" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0b0b0b] to-transparent" />

        <div className="relative z-10 mx-auto mt-24 flex w-full max-w-5xl flex-col items-center md:mt-32">
          <div className="mb-6 w-full max-w-[90vw] rounded-full border border-white/60 bg-white/10 backdrop-blur sm:max-w-md md:max-w-3xl">
            <div className="px-4 py-2">
              <p className="text-xs font-semibold leading-snug text-white sm:text-sm md:text-base">
                {content.heroLabel}
              </p>
            </div>
          </div>

          <h1 className="max-w-5xl text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl">
            {content.pageHeading}
          </h1>
          <p className="mt-4 max-w-3xl text-base text-white/90 sm:text-lg md:text-xl">
            {content.heroDescription}
          </p>

          <div className="mt-8 flex items-center gap-4">
            <Link
              href={content.pricePath}
              className="inline-flex items-center justify-center rounded-full border border-black bg-[#da1a33] px-6 py-3 font-semibold text-white transition hover:bg-white hover:text-black"
            >
              {content.primaryCtaLabel}
            </Link>
            <a
              href="https://wa.me/27828464555?text=Hi%20Smart%20Steel%2C%20I%E2%80%99d%20like%20a%20warehouse%20quote"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-transparent bg-green-500 text-white transition hover:border-green-500 hover:bg-white hover:text-green-500"
              title="Chat with us on WhatsApp"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="size-6 fill-current">
                <path d="M16 .396c-8.837 0-16 7.163-16 16 0 2.823.737 5.574 2.141 7.998L0 32l7.792-2.098A15.9 15.9 0 0 0 16 32c8.837 0 16-7.163 16-16s-7.163-15.604-16-15.604zm0 29.205a13.15 13.15 0 0 1-6.69-1.822l-.48-.283-4.633 1.248 1.24-4.518-.312-.495A13.123 13.123 0 0 1 2.875 16c0-7.244 5.881-13.125 13.125-13.125S29.125 8.756 29.125 16 23.244 29.6 16 29.6zm7.194-9.727c-.393-.197-2.326-1.151-2.686-1.283-.36-.132-.623-.197-.886.197s-1.017 1.283-1.248 1.546c-.229.262-.459.295-.852.098-.393-.197-1.66-.611-3.162-1.947-1.168-1.041-1.954-2.326-2.184-2.72-.229-.393-.025-.606.172-.803.177-.176.393-.459.59-.688.197-.229.262-.393.393-.656.131-.262.066-.492-.033-.689-.098-.197-.886-2.142-1.214-2.935-.32-.769-.646-.663-.886-.674l-.754-.014c-.229 0-.6.086-.916.418s-1.2 1.171-1.2 2.854c0 1.683 1.229 3.309 1.4 3.536.172.229 2.416 3.686 5.854 5.165.818.353 1.455.564 1.953.722.821.262 1.568.225 2.16.137.659-.098 2.326-.951 2.654-1.87.328-.918.328-1.705.229-1.87-.098-.164-.36-.262-.754-.459z" />
              </svg>
            </a>
          </div>

          <div className="mt-4 rounded-full border border-white/50 bg-white/10 px-4 py-1 backdrop-blur">
            <p className="text-sm text-white">{content.lastUpdated}</p>
          </div>

          <div className="mt-16 grid w-full gap-4 md:grid-cols-3">
            {content.proofStats.map((stat) => (
              <div key={stat.label} className="rounded-3xl border border-white/20 bg-white/10 p-5 text-left backdrop-blur">
                <p className="text-2xl font-bold sm:text-3xl">{stat.value}</p>
                <p className="mt-2 text-sm text-white/85">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0b0b0b] px-6 py-16 text-white">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#f0a1ab]">
              Local Warehouse Delivery
            </p>
            <h2 className="mt-4 text-3xl font-semibold md:text-4xl">
              Warehouse planning that fits the reality of {content.name}
            </h2>
            <p className="mt-5 max-w-3xl text-lg text-white/80">
              {content.description} {content.intro}
            </p>
            <p className="mt-4 max-w-3xl text-base text-white/70">
              {content.marketFocus}
            </p>
          </div>

          <div className="rounded-[2rem] bg-[#151515] p-8 shadow-2xl shadow-black/30">
            <h3 className="text-xl font-semibold">Areas we commonly support</h3>
            <div className="mt-5 flex flex-wrap gap-3">
              {content.localZones.map((zone) => (
                <span key={zone} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/85">
                  {zone}
                </span>
              ))}
            </div>
            <div className="mt-8 space-y-3">
              {content.trustPoints.map((point) => (
                <div key={point} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
                  {point}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#da1a33]">
              Builder And Supplier Fit
            </p>
            <h2 className="mt-4 text-3xl font-bold text-gray-900 md:text-4xl">
              Warehouse construction support for {content.name} projects
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-700">
              Use this page to compare steel warehouse sizes, supplier scope, construction direction,
              and budget ranges before you request a final quotation.
            </p>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {content.searchIntentPoints.map((point) => (
              <div key={point} className="rounded-[1.5rem] border border-gray-200 bg-gray-50 p-6">
                <p className="text-sm leading-7 text-gray-700">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#da1a33]">
              Why Buyers Choose Steel
            </p>
            <h2 className="mt-4 text-3xl font-bold text-gray-900 md:text-4xl">
              Better warehouse delivery, cleaner installation, and easier expansion
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {content.benefits.map((benefit) => (
              <div key={benefit} className="rounded-[1.75rem] border border-gray-200 bg-gradient-to-b from-white to-gray-50 p-6 shadow-sm">
                <div className="mb-4 h-10 w-10 rounded-2xl bg-[#ffe8eb]" />
                <p className="text-base font-medium text-gray-900">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-100 px-6 py-20">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-4">
          {content.useCases.map((useCase) => (
            <div key={useCase.title} className="rounded-[1.75rem] bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#da1a33]">Use Case</p>
              <h3 className="mt-3 text-xl font-semibold text-gray-900">{useCase.title}</h3>
              <p className="mt-3 text-sm leading-6 text-gray-600">{useCase.description}</p>
            </div>
          ))}
          <div className="rounded-[1.75rem] bg-[#111111] p-6 text-white shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f0a1ab]">Buyer Questions</p>
            <div className="mt-4 space-y-3">
              {content.buyerQuestions.map((question) => (
                <p key={question} className="text-sm leading-6 text-white/80">
                  {question}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-16 text-gray-900">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#da1a33]">
                Popular Warehouse Catalogue
              </p>
              <h2 className="mt-3 text-3xl font-bold text-gray-900 md:text-4xl">
                Compare warehouse options before you commit
              </h2>
              <p className="mt-3 text-lg text-gray-600">
                Use the catalogue below to compare standard warehouse options and then move into a pricing estimate for your {content.name} project.
              </p>
            </div>
            <Link
              href="/warehouse-cost"
              className="rounded-full border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
            >
              View warehouse cost pages
            </Link>
          </div>
        </div>
        <div className="rounded-[2rem] bg-[#f6f7f9] p-4 md:p-6">
          <WarehouseCatalogue />
        </div>
      </section>

      <section className="bg-[#f6f7f9] px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#da1a33]">
              Size Planning
            </p>
            <h2 className="mt-4 text-3xl font-bold text-gray-900">Compare warehouse sizes for {content.name}</h2>
            <p className="mt-3 text-lg text-gray-600">{content.sizeBlurb}</p>
          </div>

          <div className="mb-10 flex flex-wrap gap-4">
            {REGION_WAREHOUSE_WIDTHS.map((width) => (
              <button
                key={width}
                onClick={() => setSelectedWidth(width)}
                className={`rounded-full px-6 py-3 font-semibold transition ${
                  selectedWidth === width
                    ? "border border-[#da1a33] bg-[#da1a33] text-white shadow-sm shadow-[#da1a33]/25"
                    : "border border-gray-300 bg-white text-gray-800 hover:bg-gray-100"
                }`}
              >
                {width}m Width
              </button>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            {REGION_WAREHOUSE_LENGTHS.map((length) => (
              <div key={length} className="rounded-[1.5rem] border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-lg font-semibold text-gray-900">
                  {selectedWidth}m x {length}m
                </p>
                <p className="mt-1 text-sm text-gray-500">{selectedWidth * length} m² warehouse</p>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <Link href={buildSizeBuilderHref(selectedWidth, length)} className="font-semibold text-[#da1a33]">
                    {content.sizeCtaLabel}
                  </Link>
                  <Link href="/warehouse-cost" className="text-gray-500 underline">
                    Cost guide
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#da1a33]">
              Pricing Context
            </p>
            <h2 className="mt-4 text-3xl font-bold text-gray-900 md:text-4xl">
              Steel warehouse price guidance in {content.name}
            </h2>
            <p className="mt-4 text-lg text-gray-700">
              Warehouse prices in {content.name} depend on span, length, cladding specification,
              foundations, doors, insulation, delivery distance, and whether the project is supply-only,
              an enclosed shell, or a fuller turnkey build.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {content.pricingBands.map((band) => (
                <div key={band.title} className="rounded-[1.5rem] bg-gray-100 p-5">
                  <p className="text-sm font-semibold text-gray-900">{band.title}</p>
                  <p className="mt-2 text-xl font-bold text-gray-950">{band.value}</p>
                  <p className="mt-3 text-sm leading-6 text-gray-600">{band.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] bg-[#111111] p-8 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#f0a1ab]">
              Delivery Area Fit
            </p>
            <h3 className="mt-4 text-2xl font-semibold">Built for real operating requirements in {content.name}</h3>
            <div className="mt-6 flex flex-wrap gap-3">
              {content.industries.map((industry) => (
                <span key={industry} className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/85">
                  {industry}
                </span>
              ))}
            </div>
            <div className="mt-8 space-y-4">
              {content.processSteps.map((step, index) => (
                <div key={step.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f0a1ab]">
                    Step {index + 1}
                  </p>
                  <h4 className="mt-2 text-lg font-semibold">{step.title}</h4>
                  <p className="mt-2 text-sm leading-6 text-white/75">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-100 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#da1a33]">
              Internal Guides
            </p>
            <h2 className="mt-4 text-3xl font-bold text-gray-900">Plan the project in more detail</h2>
            <p className="mt-3 text-lg text-gray-600">
              Use these related pages to compare warehouse costs, standard systems, and regional options before requesting a final quote.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {content.internalLinks.map((link) => (
              <Link key={link.href} href={link.href} className="rounded-[1.5rem] bg-white p-5 text-sm font-semibold text-gray-800 shadow-sm transition hover:shadow-md">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-20 text-gray-900">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-10 text-center text-3xl font-bold text-gray-900">Frequently asked questions</h2>
          {content.faqItems.map((faq) => (
            <details key={faq.question} className="mb-4 rounded-[1.5rem] border border-gray-200 bg-white p-5 shadow-sm">
              <summary className="cursor-pointer text-lg font-semibold text-gray-900">{faq.question}</summary>
              <p className="mt-3 text-gray-700">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="bg-[#f6f7f9] px-6 py-20 text-gray-900">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#da1a33]">
              Nearby Regions
            </p>
            <h2 className="mt-4 text-3xl font-bold text-gray-900">Compare nearby warehouse regions</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {regionLinks.map((link) => (
              <Link key={link.href} href={link.href} className="rounded-[1.5rem] border border-gray-200 bg-white p-5 text-sm font-semibold text-gray-800 shadow-sm transition hover:shadow-md">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black px-6 py-20 text-center text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#f0a1ab]">
          Ready To Price Your Project
        </p>
        <h2 className="mb-4 mt-4 text-3xl font-bold md:text-4xl">Get a warehouse quote in {content.name}</h2>
        <p className="mx-auto mb-8 max-w-2xl text-white/75">
          Compare sizes, estimate pricing, and start planning a warehouse system that fits your region, site, and operating requirements.
        </p>
        <div className="flex justify-center gap-4">
          <Link href={content.pricePath} className="rounded-full bg-white px-6 py-3 font-semibold text-black">
            {content.finalCtaLabel}
          </Link>
          <a href="tel:+27828464555" className="rounded-full border border-white px-6 py-3">
            Call Us
          </a>
        </div>
      </section>
    </main>
  );
}
