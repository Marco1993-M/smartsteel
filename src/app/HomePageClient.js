'use client';

import Image from 'next/image';
import Link from '../components/BuilderEntryLink';
import HomepageSections from '../components/atlas/HomepageSections';
import { useState } from 'react';
import { smartSteelOrganizationSchema, smartSteelWebsiteSchema } from '../lib/brandEntity';
import { ATLAS_LENGTH_OPTIONS } from '../lib/atlasConfiguration';
import { ATLAS_WAREHOUSE_WIDTH_OPTIONS } from '../lib/estimates/atlasWarehouseOptions';

const heroActions = [
  {
    href: '/products',
    cta: 'View all Atlas products',
  },
  {
    href: '/products/cflc-solar-carports',
    cta: 'Explore solar carports',
  },
];

const widthDescriptors = {
  6: 'W06',
  8: 'W08',
  10: 'W10',
  12: 'W12',
  15: 'W15',
};

const heroTrustBullets = [
  '6m–15m standard warehouse spans',
  '4m modular building bays',
  'Instant supply-only pricing guide',
];

const heroGallery = [
  { src: '/warehouse-13m.jpg', alt: 'Completed Smart Steel warehouse', caption: 'Warehouse structures' },
  { src: '/solar_carport_hero.webp', alt: 'Solar carport steel structure', caption: 'Solar parking' },
  { src: '/atkv.jpg', alt: 'Completed ATKV steel structure project', caption: 'Built on site' },
];

const homepageQuestions = [
  { question: 'How much does a steel warehouse cost in South Africa?', answer: 'The price depends on the span, length, eave height, steel finish and sheeting scope. Use our warehouse cost guides to compare common sizes, or configure an Atlas warehouse in 3D for a supply-only guide price excluding VAT. Foundations, delivery and installation are reviewed separately.' },
  { question: 'Can I build and price a warehouse online?', answer: 'Yes. The Atlas 3D warehouse builder lets you choose dimensions, steel finish and sheeting, explore the structure and request a reviewed quote from your configuration. Atlas uses standard 4m building bays; cost guides explain the closest module when your target length differs.' },
  { question: 'Can I configure a solar carport in 3D?', answer: 'Yes. Choose your parking bays and row layouts in the Atlas solar carport builder, view the steel structure, check panel capacity and see a structure-only guide price excluding VAT. Solar panels and electrical work are not included in that guide.' },
  { question: 'Do you supply standard structures and custom projects?', answer: 'Smart Steel supplies Atlas modular steel structures and supports custom warehouse enquiries across South Africa. Discuss requirements outside the standard range with our team, including the delivery and installation scope for your site.' },
];

const structuredData = [
  smartSteelOrganizationSchema,
  smartSteelWebsiteSchema,
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.smartsteel.co.za/',
      },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: homepageQuestions.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  },
];

export default function HomePageClient() {
  const [selectedWidth, setSelectedWidth] = useState(8);
  const [selectedLength, setSelectedLength] = useState(20);
  const selectedHeight = selectedWidth >= 10 ? 4.5 : 3;

  return (
    <main className="font-sans text-gray-900">
      {structuredData.map((schema) => (
        <script
          key={schema['@type']}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <div
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #ffffff 5%, #eef5fc 28%, #dce9f5 68%, #cbddec 100%)',
        }}
      >
      <section className="relative overflow-hidden px-4 pb-10 pt-20 sm:px-6 md:pb-18 md:pt-28">
        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-8">
            <div className="order-2 space-y-3 lg:order-1 lg:space-y-4">
              <div className="rounded-[1.5rem] border border-black/10 bg-white/92 p-4 shadow-sm backdrop-blur-sm sm:rounded-[2rem] sm:p-8">
                <div className="flex items-center justify-between gap-3 border-b border-black/8 pb-3 sm:pb-4">
                  <Image
                    src="/atlas/atlas-logo-horizontal-dark.png"
                    alt="Atlas System developed by Smart Steel"
                    width={210}
                    height={64}
                    className="h-8 w-auto object-contain object-left sm:h-11"
                  />
                  <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#2d63b8] sm:text-xs sm:tracking-[0.16em]">
                    Online warehouse builder
                  </p>
                </div>
                <h2 className="mt-4 text-xl font-bold leading-tight text-black sm:mt-5 sm:text-4xl">
                  Build and Price Your Warehouse
                </h2>

                <div className="mt-4 sm:mt-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2d63b8]">Warehouse span</p>
                    <div className="mt-2.5 grid grid-cols-5 gap-2 sm:mt-3">
                      {ATLAS_WAREHOUSE_WIDTH_OPTIONS.map((width) => {
                        const active = selectedWidth === width;

                        return (
                          <button
                            key={width}
                            type="button"
                            onClick={() => setSelectedWidth(width)}
                            aria-pressed={active}
                            className={`relative min-h-[68px] overflow-hidden rounded-xl border px-1.5 pb-2 pt-3 text-center transition sm:min-h-0 sm:px-2 sm:pb-3 sm:pt-5 ${
                              active
                                ? 'border-[#0043f3] bg-[#0043f3] text-white shadow-sm'
                                : 'border-black/10 bg-white text-black hover:border-[#0043f3] hover:bg-[#f7f9ff]'
                            }`}
                          >
                            {width === 8 && (
                              <span className={`absolute right-0 top-0 hidden rounded-bl-lg px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.06em] sm:inline sm:px-2 sm:text-[9px] ${
                                active ? 'bg-white text-[#0043f3]' : 'bg-[#0043f3] text-white'
                              }`}>
                                Most popular
                              </span>
                            )}
                            <span className="block text-base font-bold">{width}m</span>
                            <span className={`mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.12em] ${active ? 'text-white/75' : 'text-gray-500'}`}>
                              {widthDescriptors[width]}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-[1fr_auto] items-end gap-4 sm:grid-cols-[1fr_0.72fr]">
                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2d63b8]">Building length</span>
                      <select
                        value={selectedLength}
                        onChange={(event) => setSelectedLength(Number(event.target.value))}
                        className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm font-semibold text-black outline-none transition focus:border-[#0043f3] focus:ring-2 focus:ring-[#0043f3]/15 sm:px-4 sm:py-3 sm:text-base"
                      >
                        {ATLAS_LENGTH_OPTIONS.map((length) => (
                          <option key={length} value={length}>{length}m · {length / 4} {length === 4 ? 'bay' : 'bays'}</option>
                        ))}
                      </select>
                    </label>

                    <div className="flex items-end pb-2.5 sm:pb-3 sm:justify-end">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2d63b8]">Standard eave height</p>
                        <p className="mt-2 text-sm font-bold text-black sm:text-base">{selectedHeight}m</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-3 border-t border-black/10 pt-4 sm:mt-5 sm:flex-row sm:items-center sm:justify-between sm:pt-5">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">Starting configuration</p>
                      <p className="mt-1 text-base font-bold text-black">{selectedWidth}m × {selectedLength}m × {selectedHeight}m</p>
                    </div>
                    <Link
                      href={{
                        pathname: '/warehouse-builder',
                        query: {
                          productType: 'Atlas Warehouse',
                          width: selectedWidth,
                          length: selectedLength,
                          height: selectedHeight,
                        },
                      }}
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#ffcb13] px-5 py-3 text-sm font-bold text-black transition hover:bg-[#e9b800]"
                    >
                      <Image src="/3d.png" alt="" width={22} height={22} className="h-5 w-5 object-contain" />
                      See my warehouse price
                    </Link>
                  </div>
                </div>
              </div>

              <div className="hidden flex-wrap items-center gap-x-6 gap-y-2 px-2 sm:flex">
                <span className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500">Also available</span>
                {heroActions.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#0043f3] transition hover:text-[#001d2e]"
                  >
                    {item.cta}
                    <span aria-hidden="true">↗</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0043f3] sm:text-xs">Atlas warehouse systems</p>
              <h1 className="mt-2 max-w-4xl text-3xl font-bold leading-[1.08] text-black sm:text-4xl md:text-6xl">
                Build and price your steel warehouse online
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-6 text-black/75 sm:mt-5 sm:text-lg sm:leading-8 md:text-xl">
                Choose an Atlas warehouse size, see a supply-only price, and refine your structure in 3D before requesting a reviewed quote.
              </p>
              <ul className="mt-5 hidden gap-3 sm:grid sm:grid-cols-3 lg:mt-7 lg:grid-cols-1">
                {heroTrustBullets.map((bullet) => (
                  <li key={bullet} className="flex items-center gap-3 text-base font-semibold leading-6 text-gray-800">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#c1d9e5] text-xs text-[#001d2e]">✓</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-8 sm:px-6" aria-label="Smart Steel project gallery">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
          {heroGallery.map((item, index) => <figure key={item.src} className={`relative m-0 overflow-hidden bg-[#001d2e] ${index === 0 ? 'col-span-2 h-44 sm:col-span-1 sm:h-52' : 'h-32 sm:h-52'}`}>
            <Image src={item.src} alt={item.alt} fill sizes="(min-width: 640px) 33vw, 50vw" className="object-cover" />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#001d2e]/90 to-transparent px-4 pb-3 pt-10 font-mono text-[10px] uppercase tracking-wider text-white">{item.caption}</figcaption>
          </figure>)}
        </div>
      </section>
      </div>

      <HomepageSections questions={homepageQuestions} />
    </main>
  );
}
