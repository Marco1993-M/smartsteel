'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import WarehouseCatalogue from 'components/warehouse-catalogue';
import { getWarehouseCostPageConfig, getWarehouseCostSlugs } from './warehouseCostData';

const widths = [8, 10, 12];
const lengths = Array.from({ length: 19 }, (_, index) => 5 + index * 2.5);
const availablePages = new Map(
  getWarehouseCostSlugs()
    .map((slug) => getWarehouseCostPageConfig(slug))
    .filter(Boolean)
    .map((config) => [`${config.length}x${config.width}`, config])
);

const nearbyLinks = [
  { href: '/pretoria-warehouses', label: 'Steel Warehouses Pretoria' },
  { href: '/johannesburg-warehouses', label: 'Steel Warehouses Johannesburg' },
  { href: '/centurion-warehouses', label: 'Steel Warehouses Centurion' },
  { href: '/midrand-warehouses', label: 'Steel Warehouses Midrand' },
];

function buildSchemas(config) {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.smartsteel.co.za',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Warehouse Cost',
        item: 'https://www.smartsteel.co.za/warehouse-cost',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: `${config.displaySize} Warehouse Cost`,
        item: config.fullUrl,
      },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: config.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };

  return [breadcrumbSchema, faqSchema];
}

function PriceCard({ title, price, summary, points, href, cta, featured = false }) {
  return (
    <div
      className={`relative flex flex-col rounded-3xl border p-8 ${
        featured ? 'border-[#da1a33] bg-white shadow-xl' : 'border-gray-200 bg-white'
      }`}
    >
      {featured && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-[#da1a33] px-5 py-1 text-xs font-bold tracking-[0.2em] text-white">
          MOST POPULAR
        </div>
      )}
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">{title}</p>
      <p className="mt-4 text-3xl font-bold text-gray-900">{price}</p>
      <p className="mt-2 text-sm text-gray-600">{summary}</p>
      <ul className="mt-6 space-y-3 text-sm text-gray-700">
        {points.map((point) => (
          <li key={point} className="flex gap-2">
            <span className="font-semibold text-[#da1a33]">✓</span>
            <span>{point}</span>
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className={`mt-8 rounded-full px-6 py-3 text-center text-sm font-semibold transition ${
          featured ? 'bg-[#da1a33] text-white hover:bg-black' : 'bg-black text-white hover:bg-[#da1a33]'
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}

export default function WarehouseCostPageClient({ slug }) {
  const config = getWarehouseCostPageConfig(slug);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [selectedWidth, setSelectedWidth] = useState(config.width);
  const schemas = buildSchemas(config);

  if (!config) {
    return null;
  }

  return (
    <main className="font-sans text-gray-800">
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <section className="relative flex min-h-[85vh] items-start justify-center overflow-hidden px-6 pt-28 text-center text-white md:min-h-[92vh]">
        <Image
          src="/images/hero.webp"
          alt={`${config.displaySize} steel warehouse cost guide`}
          fill
          priority
          quality={85}
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-white/55" />
        <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center">
          <div className="mb-6 rounded-full border border-black bg-white/80 px-5 py-2 text-sm font-semibold text-black">
            Warehouse cost guide for South Africa
          </div>
          <h1 className="max-w-4xl text-4xl font-bold leading-tight text-black md:text-6xl">
            {config.displaySize} Warehouse Cost in South Africa
          </h1>
          <p className="mt-5 max-w-3xl text-lg text-black md:text-xl">
            See estimated pricing for a {config.areaLabel.toLowerCase()} lightweight steel warehouse, from structure-only through to
            cladding and turnkey delivery. Also searched as {config.altSize} warehouse cost.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/tools/estimator"
              className="rounded-full bg-[#da1a33] px-6 py-3 font-semibold text-white transition hover:bg-black"
            >
              Get Instant Estimate
            </Link>
            <Link
              href="/warehouse-builder"
              className="rounded-full border border-black bg-white px-6 py-3 font-semibold text-black transition hover:bg-black hover:text-white"
            >
              Build Your Warehouse
            </Link>
            <a
              href="https://wa.me/27828464555?text=Hi%20Smart%20Steel%2C%20I%E2%80%99d%20like%20pricing%20for%20a%20warehouse%20project"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-black bg-white px-6 py-3 font-semibold text-black transition hover:bg-black hover:text-white"
            >
              WhatsApp Our Team
            </a>
          </div>
          <p className="mt-4 rounded-full border border-black bg-white/90 px-4 py-1 text-sm text-black">
            Indicative online pricing. No email required.
          </p>
          <div className="mt-12 flex max-w-4xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-black/80">
            <p>
              <span className="font-semibold text-black">Size:</span> {config.displaySize} ({config.areaLabel})
            </p>
            <span className="hidden text-black/40 md:inline">•</span>
            <p>
              <span className="font-semibold text-black">Typical use:</span> {config.bestFor[0]}
            </p>
            <span className="hidden text-black/40 md:inline">•</span>
            <p>
              <span className="font-semibold text-black">Updated:</span> {config.updatedLabel}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">{config.displaySize} warehouse pricing explained</h2>
            <p className="mt-5 text-lg leading-8 text-gray-700">
              If you are budgeting for a {config.displaySize} steel warehouse, the main decision is whether you only need the
              structural frame, a fully enclosed shell, or a complete turnkey build. For this footprint, buyers usually compare
              price, lead time, access requirements, and how easily the building can be expanded later.
            </p>
            <p className="mt-5 text-lg leading-8 text-gray-700">
              This page is designed to answer that search properly. It gives a realistic price range, explains what changes the
              final quote, and outlines where this size works best in South African commercial, agricultural, and light industrial
              projects.
            </p>
          </div>
          <div className="rounded-3xl bg-gray-50 p-8">
            <h2 className="text-2xl font-bold text-gray-900">Quick buyer summary</h2>
            <ul className="mt-5 space-y-4 text-sm leading-7 text-gray-700">
              <li>
                <span className="font-semibold text-black">Best for:</span> {config.bestFor.join(', ')}.
              </li>
              <li>
                <span className="font-semibold text-black">Height guide:</span> {config.heightGuide}
              </li>
              <li>
                <span className="font-semibold text-black">Lead time:</span> {config.leadTime}
              </li>
              <li>
                <span className="font-semibold text-black">Popular add-ons:</span> {config.addOns.join(', ')}.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto w-[95%] max-w-7xl rounded-[2rem] bg-[#f7f7f7] px-6 py-16 md:px-10">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h2 className="text-4xl font-bold text-gray-900 md:text-5xl">{config.displaySize} warehouse cost guide</h2>
          <p className="mt-4 text-lg text-gray-600">
            Transparent pricing for South African buyers comparing structure-only, clad, and turnkey warehouse options.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          <PriceCard
            title="Structure Only"
            price={config.prices.structure.label}
            summary={`${config.areaLabel} • Steel frame only`}
            points={[
              'Steel columns, rafters, and trusses',
              'Roof structure ready for cladding',
              'Best when you are managing finishes separately',
            ]}
            href="/lightweight-steel-warehouses"
            cta="Get Structure Pricing"
          />
          <PriceCard
            title="With Cladding"
            price={config.prices.cladding.label}
            summary={`${config.areaLabel} • Fully enclosed shell`}
            points={[
              'Steel frame plus roof and wall sheeting',
              'Weatherproof enclosure for fast occupation',
              'Most common option for growing businesses',
            ]}
            href="/lightweight-steel-warehouses"
            cta="Get Shell Pricing"
            featured
          />
          <PriceCard
            title="Turnkey Build"
            price={config.prices.turnkey.label}
            summary={`${config.areaLabel} • Complete project`}
            points={[
              'Design, engineering, and construction coordination',
              'Civil works, finishes, and handover scope',
              'Best when you want one team managing delivery',
            ]}
            href="/lightweight-steel-warehouses"
            cta="Start Turnkey Quote"
          />
        </div>
        <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 text-sm leading-7 text-gray-600">
          Prices are indicative and exclude VAT, site clearing, geotechnical surprises, transport distance, and any civil works
          not included in the agreed scope. Final pricing depends on your location, height, access openings, cladding choice,
          foundations, and finishes.
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-3xl border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900">What affects the final quote</h2>
            <ul className="mt-6 space-y-4 text-sm leading-7 text-gray-700">
              <li><span className="font-semibold text-black">Foundations and slab:</span> poor soil, deeper footings, or slab design can change the budget quickly.</li>
              <li><span className="font-semibold text-black">Height and door openings:</span> taller eaves and larger roller doors increase steel tonnage and cladding requirements.</li>
              <li><span className="font-semibold text-black">Location and transport:</span> delivery distance, cranage, and access conditions influence installation costs.</li>
              <li><span className="font-semibold text-black">Fit-out scope:</span> insulation, partitions, electrical work, and office areas push the build toward turnkey pricing.</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900">Cost per square metre</h2>
            <ul className="mt-6 space-y-4 text-sm leading-7 text-gray-700">
              <li><span className="font-semibold text-black">Structure only:</span> {config.pricePerSquareMetre.structure}</li>
              <li><span className="font-semibold text-black">With cladding:</span> {config.pricePerSquareMetre.cladding}</li>
              <li><span className="font-semibold text-black">Turnkey build:</span> {config.pricePerSquareMetre.turnkey}</li>
            </ul>
            <p className="mt-6 text-sm leading-7 text-gray-700">
              These ranges help you benchmark value across different warehouse footprints, but the best comparison is still a quote
              built around your site, access needs, and specification level.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-gray-100 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-gray-900">Compare other warehouse sizes</h2>
          <p className="mt-3 max-w-3xl text-gray-700">
            Browse nearby warehouse footprints to compare estimated cost, floor area, and value before requesting a detailed quote.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            {widths.map((width) => (
              <button
                key={width}
                onClick={() => setSelectedWidth(width)}
                className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                  selectedWidth === width ? 'bg-black text-white' : 'bg-white text-black'
                }`}
              >
                {width}m wide
              </button>
            ))}
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {lengths.map((length) => {
              const pageKey = `${length}x${selectedWidth}`;
              const matchingPage = availablePages.get(pageKey);

              if (matchingPage) {
                return (
                  <Link
                    key={pageKey}
                    href={matchingPage.path}
                    className="rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <p className="text-lg font-semibold text-gray-900">
                      {length}m x {selectedWidth}m
                    </p>
                    <p className="mt-1 text-sm text-gray-500">{length * selectedWidth} m² footprint</p>
                    <p className="mt-5 text-sm font-semibold text-[#da1a33]">View warehouse cost</p>
                  </Link>
                );
              }

              return (
                <div key={pageKey} className="rounded-2xl border border-dashed border-gray-300 bg-white/70 p-5">
                  <p className="text-lg font-semibold text-gray-900">
                    {length}m x {selectedWidth}m
                  </p>
                  <p className="mt-1 text-sm text-gray-500">{length * selectedWidth} m² footprint</p>
                  <p className="mt-4 text-sm text-gray-600">This size is available on request.</p>
                  <Link href="/tools/estimator" className="mt-5 inline-block text-sm font-semibold text-[#da1a33]">
                    Request estimate
                  </Link>
                  <Link href="/warehouse-builder" className="mt-2 inline-block text-sm font-semibold text-black">
                    Try warehouse builder
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <WarehouseCatalogue
        title="Popular Smart Steel warehouse options"
        subtitle="Use the pricing guide above for budgeting, then compare some of our standard enclosed and agricultural steel building options."
      />

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">FAQs</h2>
            <p className="mt-4 text-gray-700">
              Straight answers for buyers comparing the cost of a {config.displaySize} warehouse in South Africa.
            </p>
          </div>
          <div className="space-y-4">
            {config.faqs.map(({ q, a }, index) => (
              <div key={q} className="rounded-2xl border border-gray-200 bg-white p-6">
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="flex w-full items-center justify-between gap-4 text-left text-lg font-semibold text-gray-900"
                >
                  <span>{q}</span>
                  <span className="text-2xl text-[#da1a33]">{openFaqIndex === index ? '−' : '+'}</span>
                </button>
                {openFaqIndex === index && <p className="mt-4 text-sm leading-7 text-gray-700">{a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <h2 className="text-3xl font-bold text-gray-900">Steel warehouse builders near {config.nearbyCity}</h2>
        <p className="mt-4 max-w-3xl text-gray-700">
          If your project is in Gauteng, compare our regional warehouse pages for Pretoria, Johannesburg, Centurion, and Midrand to
          see local context and service coverage.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {nearbyLinks.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-2xl border border-gray-200 px-5 py-4 text-sm font-semibold text-gray-900 transition hover:border-[#da1a33] hover:text-[#da1a33]">
              {link.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-black px-6 py-20 text-center text-white">
        <h2 className="text-3xl font-bold md:text-4xl">Get pricing for your {config.displaySize} warehouse</h2>
        <p className="mx-auto mt-4 max-w-2xl text-gray-300">
          Use the estimator for a fast budget range, then speak to our team if you need doors, insulation, foundations, or a full
          turnkey build.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/tools/estimator" className="rounded-full bg-white px-6 py-3 font-semibold text-black transition hover:bg-[#da1a33] hover:text-white">
            Start Estimate
          </Link>
          <Link href="/warehouse-builder" className="rounded-full border border-white px-6 py-3 font-semibold text-white transition hover:bg-white hover:text-black">
            Build Your Warehouse
          </Link>
          <Link href="/lightweight-steel-warehouses" className="rounded-full border border-white px-6 py-3 font-semibold text-white transition hover:bg-white hover:text-black">
            View Warehouse Options
          </Link>
        </div>
      </section>
    </main>
  );
}
