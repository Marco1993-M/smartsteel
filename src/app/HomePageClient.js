'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { WAREHOUSE_WIDTH_OPTIONS } from '../lib/estimates/warehouseEstimate';

const heroActions = [
  {
    step: 'Also available',
    title: 'Lip Channel Kits',
    description: 'Explore practical kit options for carports, ground mounts, and standard structures.',
    href: '/products',
    cta: 'Explore kit options',
  },
  {
    step: 'Also available',
    title: 'Solar Carports',
    description: 'Covered parking and solar-ready steel support systems for commercial and private sites.',
    href: '/products/cflc-solar-carports',
    cta: 'View solar carports',
  },
];

const heroLengthOptions = [10, 15, 20, 25, 30];

const widthDescriptors = {
  8: 'Tighter footprint',
  10: 'Balanced layout',
  12: 'Wider access',
};

const lengthDescriptors = {
  10: 'Compact',
  15: 'Practical',
  20: 'Popular',
  25: 'Expanded',
  30: 'Large format',
};

const heroTrustBullets = [
  'Compare LSF and CFLC warehouse options clearly',
  'Use the builder and estimator before requesting a formal quote',
  'Support for standard kits, custom structures, fabrication, and installation',
  'Practical planning for South African sites, delivery, and project conditions',
];

const heroGallery = [
  { src: '/warehouse-13m.jpg', alt: 'Large steel warehouse frontage with wide access opening', span: 'lg:col-span-4' },
  { src: '/warehouse.jpg', alt: 'Smart Steel warehouse project for commercial use', span: 'lg:col-span-5' },
  { src: '/solar_carport_hero.webp', alt: 'Solar carport structure used for covered parking and solar support', span: 'lg:col-span-3' },
  { src: '/images/5x8mF.jpg', alt: 'Compact steel warehouse project in a practical footprint', span: 'lg:col-span-3' },
  { src: '/atkv.jpg', alt: 'Completed ATKV steel structure project', span: 'lg:col-span-3' },
  { src: '/solar_carport_1.webp', alt: 'Solar carport installation showing steel support framing', span: 'lg:col-span-3' },
  { src: '/solar_car_port_1.jpg', alt: 'Steel carport and solar-ready support structure', span: 'lg:col-span-3' },
];

const planningActions = [
  {
    title: 'Estimate your budget',
    description: 'Start with a practical estimate before you request a formal quote.',
    href: '/tools/estimator',
    cta: 'Get an Estimate',
  },
  {
    title: 'Compare warehouse systems',
    description: 'Review the main warehouse options and decide which structure type fits your project.',
    href: '/warehouses',
    cta: 'Compare Systems',
  },
  {
    title: 'Review common sizes and costs',
    description: 'Use common warehouse sizes as a planning baseline for budget and scope.',
    href: '/warehouse-cost',
    cta: 'View Size Guides',
  },
];

const primaryPaths = [
  {
    eyebrow: 'Standard Kit Option',
    title: 'Lip Channel Kits',
    backgroundImage: '/CFLC_carport.webp',
    description:
      'For standard cold-formed lip channel kit structures, including DIY carports, solar carports, ground mounts, and practical warehouse kits.',
    bullets: [
      'Cold-formed lip channel steel kit options',
      'Practical standard structures and kit enquiries',
      'Useful for carports, solar support, ground mounts, and warehouse kits',
    ],
    primaryHref: '/products',
    primaryCta: 'Explore Lip Channel Kits',
    secondaryHref: '/products/cflc-carport-kits',
    secondaryCta: 'View Kit Examples',
    subLinks: [
      { title: 'DIY carports', href: '/products/cflc-carport-kits' },
      { title: 'Solar carports', href: '/products/cflc-solar-carports' },
      { title: 'Solar ground mounts', href: '/products/cflc-ground-mounts' },
      { title: 'Warehouse kits', href: '/products/cflc-diy-warehouse-kits' },
    ],
  },
  {
    eyebrow: 'Custom Project Option',
    title: 'Custom Engineered Warehouse Systems',
    backgroundImage: '/warehouse.jpg',
    description:
      'For larger or more tailored lightweight steel warehouse projects that need design support, estimating, and project-specific guidance.',
    bullets: [
      'Better suited to larger or more custom warehouse requirements',
      'Supports site-specific planning, spans, and layout decisions',
      'Use the estimator and warehouse builder before you enquire',
    ],
    primaryHref: '/warehouses',
    primaryCta: 'Compare Warehouse Systems',
    secondaryHref: '/warehouse-builder',
    secondaryCta: 'Build Your Warehouse',
    subLinks: [
      { title: 'LSF systems', href: '/warehouses/lsf' },
      { title: 'CFLC warehouses', href: '/warehouses/cflc' },
      { title: 'LSF vs CFLC', href: '/warehouses/lsf-vs-cflc' },
    ],
  },
];

const supportCategories = [
  {
    title: 'Solar carports',
    description: 'Steel support systems for covered parking and solar-ready layouts.',
    href: '/solar',
    cta: 'Explore Solar',
  },
  {
    title: 'Steel fabrication & installation',
    description: 'A strong option for fabrication, erection, and steel building delivery enquiries.',
    href: '/steel-fabrication-installation',
    cta: 'Explore Fabrication',
  },
  {
    title: 'Structural steel fabricators',
    description: 'For clients looking for structural steel fabrication tied to real building requirements.',
    href: '/structural-steel-fabricators',
    cta: 'Explore Structural Steel',
  },
  {
    title: 'LSF trusses',
    description: 'Precision-engineered roof truss systems for residential and commercial roofing.',
    href: '/products/lightweight-steel-trusses',
    cta: 'Explore Trusses',
  },
];

const trustPoints = [
  {
    title: 'Designed for South African sites',
    description: 'Warehouse structures need to work with real site access, spans, weather, and build conditions.',
  },
  {
    title: 'Clear planning before enquiry',
    description: 'Estimate tools, size guides, and comparison pages help buyers arrive with a stronger brief.',
  },
  {
    title: 'Standard and custom steel options',
    description: 'Smart Steel separates standard lip channel kits from custom engineered warehouse systems.',
  },
];

const deliveryPillars = [
  {
    title: 'Design',
    description: 'Start with the right structural approach and clearer project thinking before steel is committed.',
  },
  {
    title: 'Fabrication',
    description: 'Move into fabrication with a stronger link between the steel scope and the actual building outcome.',
  },
  {
    title: 'Erection',
    description: 'Support projects that need practical installation planning, sequence, and site-fit delivery.',
  },
  {
    title: 'Delivery',
    description: 'Help clients move from steel intent to a completed building project instead of stopping at product selection.',
  },
];

const homepageQuestions = [
  {
    question: 'Do you supply lightweight steel warehouses across South Africa?',
    answer:
      'Yes. Smart Steel supplies lightweight steel warehouse systems and planning support for projects across South Africa.',
  },
  {
    question: 'Can I estimate a warehouse before enquiring?',
    answer:
      'Yes. You can use the estimator and warehouse cost guides to form a budget range before requesting a formal quote.',
  },
  {
    question: 'What is the difference between lip channel kits and custom engineered systems?',
    answer:
      'Lip channel kits use cold-formed steel for standard kit structures, while larger custom projects may call for engineered lightweight steel or hot-rolled solutions depending on the site and span requirements.',
  },
  {
    question: 'Do you offer standard kits and custom designs?',
    answer:
      'Yes. Smart Steel supports standard lip channel kit enquiries as well as more tailored warehouse projects that need design and estimating support.',
  },
];

const featuredProjects = [
  {
    image: '/projects/atkv.jpg',
    title: '5x8m Structure for ATKV, Bergville',
    description: 'A compact steel structure delivered with clean detailing and fast installation.',
  },
  {
    image: '/images/solar-carport-1.webp',
    title: 'Solar Carport Structure',
    description:
      'A steel solar carport structure showing how Smart Steel systems can support covered parking, solar-ready layouts, and practical site upgrades.',
  },
];

const structuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Smart Steel',
    url: 'https://www.smartsteel.co.za/',
    logo: 'https://www.smartsteel.co.za/logo-512x512.png',
    areaServed: {
      '@type': 'Country',
      name: 'South Africa',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Smart Steel',
    url: 'https://www.smartsteel.co.za/',
  },
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
  const [heroStep, setHeroStep] = useState(1);
  const [selectedWidth, setSelectedWidth] = useState(WAREHOUSE_WIDTH_OPTIONS[1] ?? 10);
  const [selectedLength, setSelectedLength] = useState(heroLengthOptions[2] ?? 20);

  return (
    <main className="font-sans text-gray-900">
      {structuredData.map((schema) => (
        <script
          key={schema['@type']}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <section className="relative overflow-hidden px-4 pb-12 pt-24 sm:px-6 md:pb-18 md:pt-28">
        <Image
          src="/warehouse-13m.jpg"
          alt="Smart Steel lightweight steel warehouse systems in South Africa"
          fill
          priority
          quality={85}
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(244,248,253,0.96)_12%,rgba(238,243,251,0.92)_32%,rgba(238,243,251,0.92)_100%)]" />
        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
            <div className="space-y-4">
              <div className="rounded-[2rem] border border-black/10 bg-white/92 p-4 shadow-sm backdrop-blur-sm sm:p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#da1a33]">
                  Step 1 of 3
                </p>
                <h2 className="mt-3 text-2xl font-bold leading-tight text-black sm:text-4xl">
                  Build and Price Your Warehouse
                </h2>

                <div className="mt-5">
                  <div className="rounded-[1.6rem] border border-[#2d63b8] bg-[#eef4ff] px-4 py-4 shadow-sm sm:px-5 sm:py-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2d63b8]">
                        Step {heroStep} of 3
                      </p>
                      <h3 className="mt-2 text-xl font-bold text-black sm:text-2xl">
                        {heroStep === 1 && 'Build my warehouse'}
                        {heroStep === 2 && 'Choose your width'}
                        {heroStep === 3 && 'Choose your length'}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-gray-700 sm:leading-7">
                        {heroStep === 1 && 'Start with a practical warehouse size and refine the rest inside the builder.'}
                        {heroStep === 2 && 'Pick a starting width for your warehouse. You can still adjust it inside the builder.'}
                        {heroStep === 3 && 'Choose a starting length, then open the builder with your layout already loaded.'}
                      </p>
                    </div>
                    <span className="inline-flex w-fit shrink-0 whitespace-nowrap rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-black">
                      Popular pick
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
                    <span className="rounded-full border border-black/10 bg-white/80 px-3 py-1 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2d63b8]">
                      Online pricing guide
                    </span>
                    <span className="rounded-full border border-black/10 bg-white/80 px-3 py-1 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2d63b8]">
                      3m eave height
                    </span>
                    <span className="rounded-full border border-black/10 bg-white/80 px-3 py-1 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2d63b8]">
                      South Africa ready
                    </span>
                  </div>

                  {heroStep === 1 && (
                    <div className="mt-5">
                      <button
                        type="button"
                        onClick={() => setHeroStep(2)}
                        className="inline-flex items-center rounded-full bg-[#ffcb13] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#e9b800]"
                      >
                        Build my warehouse
                      </button>
                    </div>
                  )}

                  {heroStep === 2 && (
                    <div className="mt-5 rounded-[1.3rem] border border-white/90 bg-white/80 p-4">
                      <div className="grid grid-cols-3 gap-2">
                        {WAREHOUSE_WIDTH_OPTIONS.map((width) => {
                          const active = selectedWidth === width;

                          return (
                            <button
                              key={width}
                              type="button"
                              onClick={() => setSelectedWidth(width)}
                              className={`min-h-[128px] rounded-2xl border px-3 py-3 text-left transition sm:min-h-0 ${
                                active
                                  ? 'border-[#2d63b8] bg-[#2d63b8] text-white'
                                  : 'border-black/10 bg-white text-black hover:border-[#2d63b8] hover:bg-[#f4f8ff]'
                              }`}
                            >
                              <div className="flex h-full flex-col justify-between gap-3 sm:flex-row sm:items-end sm:gap-2">
                                <div>
                                  <p className="text-sm font-semibold">{width}m</p>
                                  <p className={`mt-1 text-[11px] ${active ? 'text-white/80' : 'text-gray-500'}`}>
                                    {widthDescriptors[width]}
                                  </p>
                                </div>
                                <div className="hidden h-7 items-end gap-1 sm:flex">
                                  <span className={`w-2 rounded-t-full ${active ? 'bg-white/70' : 'bg-[#c9d8f2]'}`} style={{ height: '45%' }} />
                                  <span className={`w-2 rounded-t-full ${active ? 'bg-white/80' : 'bg-[#9fbae8]'}`} style={{ height: '65%' }} />
                                  <span className={`w-2 rounded-t-full ${active ? 'bg-white' : 'bg-[#2d63b8]'}`} style={{ height: '90%' }} />
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => setHeroStep(1)}
                          className="inline-flex items-center rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-gray-50"
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={() => setHeroStep(3)}
                          className="inline-flex items-center rounded-full bg-[#ffcb13] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#e9b800]"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}

                  {heroStep === 3 && (
                    <div className="mt-5 rounded-[1.3rem] border border-white/90 bg-white/80 p-4">
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                        {heroLengthOptions.map((length) => {
                          const active = selectedLength === length;

                          return (
                            <button
                              key={length}
                              type="button"
                              onClick={() => setSelectedLength(length)}
                              className={`rounded-2xl border px-3 py-3 text-left transition ${
                                active
                                  ? 'border-[#2d63b8] bg-[#2d63b8] text-white'
                                  : 'border-black/10 bg-white text-black hover:border-[#2d63b8] hover:bg-[#f4f8ff]'
                              }`}
                            >
                              <p className="text-sm font-semibold">{length}m</p>
                              <p className={`mt-1 text-[11px] ${active ? 'text-white/80' : 'text-gray-500'}`}>
                                {lengthDescriptors[length]}
                              </p>
                              <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/10">
                                <div
                                  className={`h-full rounded-full ${active ? 'bg-white/85' : 'bg-[#2d63b8]'}`}
                                  style={{ width: `${Math.min((length / 30) * 100, 100)}%` }}
                                />
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm text-gray-700">
                          Starting point:{' '}
                          <span className="font-semibold text-black">
                            {selectedWidth}m x {selectedLength}m
                          </span>
                        </p>
                        <div className="flex flex-wrap items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setHeroStep(2)}
                            className="inline-flex items-center rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-gray-50"
                          >
                            Back
                          </button>
                          <Link
                            href={{
                              pathname: '/warehouse-builder',
                              query: {
                                productType: 'LSF Warehouse',
                                width: selectedWidth,
                                length: selectedLength,
                              },
                            }}
                            className="inline-flex items-center rounded-full bg-[#ffcb13] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#e9b800]"
                          >
                            Open builder
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {heroActions.map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="rounded-[1.3rem] border border-black/10 bg-white/88 px-4 py-4 shadow-sm transition hover:border-black/20 hover:bg-white"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#2d63b8]">
                        {item.step}
                      </p>
                      <span className="rounded-full border border-black/10 bg-gray-50 px-2.5 py-1 text-[11px] font-semibold text-black">
                        Also available
                      </span>
                    </div>
                    <h3 className="mt-3 text-lg font-bold text-black">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-gray-700">{item.description}</p>
                    <div className="mt-3 text-sm font-semibold text-[#da1a33]">
                      {item.cta}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <div className="inline-flex rounded-full border border-black/10 bg-white/90 px-4 py-2 text-sm font-semibold text-black shadow-sm">
                Lightweight steel warehouse supplier and planning support
              </div>
              <h1 className="mt-6 max-w-4xl text-4xl font-bold leading-tight text-black md:text-6xl">
                Lightweight steel warehouses for South African projects
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-black/80 md:text-xl">
                Compare warehouse systems, use the online builder, estimate your budget, and then move into the right next step for your project.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="rounded-full border border-black/10 bg-white/85 px-4 py-2 text-sm font-semibold text-black shadow-sm">
                  Used by farms, industrial sites, and growing businesses
                </span>
                <span className="rounded-full border border-black/10 bg-white/85 px-4 py-2 text-sm font-semibold text-black shadow-sm">
                  Planning support across South Africa
                </span>
              </div>
              <ul className="mt-8 space-y-3">
                {heroTrustBullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-3 text-base leading-7 text-gray-800">
                    <span className="mt-1 text-[#2d63b8]">✓</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#eef3fb] px-6 pb-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-12">
            {heroGallery.map((item) => (
              <div
                key={item.src}
                className={`relative overflow-hidden rounded-[1.7rem] border border-white/70 bg-white/70 shadow-sm ${item.span} min-h-[190px]`}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover object-center"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-6 pb-6 pt-10 md:pt-14">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-[2rem] border border-gray-200 bg-gray-50 p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#da1a33]">
              Warehouse Planning
            </p>
            <h2 className="mt-4 text-3xl font-bold md:text-4xl">Plan your lightweight steel warehouse before you enquire</h2>
            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {planningActions.map((item) => (
                <div key={item.title} className="rounded-3xl border border-gray-200 bg-white p-6">
                  <h3 className="text-xl font-bold text-black">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-gray-700">{item.description}</p>
                  <Link href={item.href} className="mt-5 inline-block text-sm font-semibold text-[#da1a33]">
                    {item.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-6 pb-8 pt-4 md:pb-12">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-[2rem] border border-gray-200 bg-white p-8 shadow-sm">
            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#da1a33]">
                  More Than Products
                </p>
                <h2 className="mt-4 text-3xl font-bold text-black md:text-4xl">
                  Smart Steel can help design, fabricate, erect, and deliver steel building projects
                </h2>
                <p className="mt-5 text-lg leading-8 text-gray-700">
                  Some clients need more than a product page. They need a company that can help
                  shape the building properly, align the steel scope, and support the project
                  from planning through fabrication and site delivery.
                </p>
                <p className="mt-4 text-base leading-8 text-gray-700">
                  That includes warehouse buildings, farm structures, workshops, utility buildings,
                  solar support steel, and broader fabrication and installation enquiries across
                  South Africa.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    href="/steel-fabrication-installation"
                    className="rounded-full bg-[#da1a33] px-6 py-3 font-semibold text-white transition hover:bg-black"
                  >
                    Explore Fabrication & Installation
                  </Link>
                  <Link
                    href="/steel-farm-buildings"
                    className="rounded-full border border-black bg-white px-6 py-3 font-semibold text-black transition hover:bg-black hover:text-white"
                  >
                    Explore Steel Farm Buildings
                  </Link>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {deliveryPillars.map((item) => (
                  <div key={item.title} className="rounded-3xl border border-gray-200 bg-gray-50 p-6">
                    <p className="text-xl font-bold text-black">{item.title}</p>
                    <p className="mt-3 text-sm leading-7 text-gray-700">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#da1a33]">Choose your path</p>
            <h2 className="mt-4 text-3xl font-bold md:text-5xl">Choose the right steel warehouse option</h2>
            <p className="mt-5 text-lg leading-8 text-gray-700">
              Start with lip channel kits when you want practical standard structures. Use the
              custom engineered option when your warehouse needs more project-specific planning.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {primaryPaths.map((path) => (
              <div key={path.title} className="relative overflow-hidden rounded-[2rem] border border-gray-200 bg-gray-50 p-8">
                <Image
                  src={path.backgroundImage}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover object-center opacity-98"
                />
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.88),rgba(255,255,255,0.72))]" />
                <div className="relative z-10">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#da1a33]">{path.eyebrow}</p>
                  <h3 className="mt-4 text-3xl font-bold text-black">{path.title}</h3>
                  <p className="mt-4 text-base leading-8 text-gray-700">{path.description}</p>
                  <ul className="mt-6 space-y-3 text-sm leading-7 text-gray-700">
                    {path.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {path.subLinks.map((link) => (
                      <Link
                        key={link.title}
                        href={link.href}
                        className="rounded-full border border-black/15 bg-white/80 px-4 py-2 text-xs font-semibold text-black transition hover:border-black hover:bg-black hover:text-white"
                      >
                        {link.title}
                      </Link>
                    ))}
                  </div>
                  <div className="mt-8 flex flex-wrap gap-4">
                    <Link
                      href={path.primaryHref}
                      className="rounded-full bg-[#da1a33] px-6 py-3 font-semibold text-white transition hover:bg-black"
                    >
                      {path.primaryCta}
                    </Link>
                    <Link
                      href={path.secondaryHref}
                      className="rounded-full border border-black bg-white/90 px-6 py-3 font-semibold text-black transition hover:bg-black hover:text-white"
                    >
                      {path.secondaryCta}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0f1720] px-6 py-20 text-white">
        <div className="mx-auto max-w-6xl">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#f16b7d]">Why buyers trust Smart Steel</p>
            <h2 className="mt-4 max-w-4xl text-3xl font-bold md:text-5xl">Practical planning for lightweight steel warehouse projects</h2>
            <p className="mt-6 text-lg leading-8 text-white/80">
              Smart Steel helps buyers separate standard kit options from custom warehouse
              requirements, so the next step is easier to choose before the formal enquiry.
            </p>
            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              {trustPoints.map((point) => (
                <div key={point.title} className="rounded-2xl border border-white/10 bg-white/10 p-6 text-white/85">
                  <h3 className="text-xl font-bold text-white">{point.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/75">{point.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#da1a33]">Proof matters</p>
            <h2 className="mt-4 text-3xl font-bold md:text-5xl">Recent steel structure projects</h2>
            <p className="mt-5 text-lg leading-8 text-gray-700">
              Buyers trust steel when they can see the work. These examples show practical
              steel structures across kit, warehouse, and solar-ready support requirements.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {featuredProjects.map((project) => (
              <div key={project.title} className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
                <div className="relative h-80 w-full">
                  <Image src={project.image} alt={project.title} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-black">{project.title}</h3>
                  <p className="mt-3 text-gray-700">{project.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <Link href="/recent" className="inline-block rounded-full bg-black px-6 py-3 font-semibold text-white transition hover:bg-[#da1a33]">
              Explore Recent Projects
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white px-6 pb-20 pt-0">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-[2rem] border border-gray-200 bg-gray-50 p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#da1a33]">
              Quick Answers
            </p>
            <h2 className="mt-4 text-3xl font-bold md:text-4xl">Useful answers before you plan your warehouse</h2>
            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              {homepageQuestions.map((item) => (
                <div key={item.question} className="rounded-3xl border border-gray-200 bg-white p-6">
                  <h3 className="text-lg font-bold text-black">{item.question}</h3>
                  <p className="mt-3 text-sm leading-7 text-gray-700">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-6 pb-20 pt-0">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#da1a33]">Also supplied by Smart Steel</p>
            <h2 className="mt-4 text-3xl font-bold md:text-4xl">Adjacent steel systems for related projects</h2>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {supportCategories.map((category) => (
              <div key={category.title} className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-2xl font-bold text-black">{category.title}</h3>
                <p className="mt-3 text-sm leading-7 text-gray-700">{category.description}</p>
                <Link href={category.href} className="mt-5 inline-block text-sm font-semibold text-[#da1a33]">
                  {category.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black px-6 py-20 text-center text-white">
        <h2 className="text-3xl font-bold md:text-5xl">Start with a clearer warehouse plan</h2>
        <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-white/75">
          Use the estimator for an early budget, or compare lip channel and custom
          warehouse options before you send an enquiry.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/tools/estimator" className="rounded-full bg-white px-6 py-3 font-semibold text-black transition hover:bg-[#da1a33] hover:text-white">
            Get a Warehouse Estimate
          </Link>
          <Link href="/products" className="rounded-full border border-white px-6 py-3 font-semibold text-white transition hover:bg-white hover:text-black">
            Explore Lip Channel Kits
          </Link>
          <Link href="/contact" className="rounded-full border border-white px-6 py-3 font-semibold text-white transition hover:bg-white hover:text-black">
            Talk to Smart Steel
          </Link>
        </div>
      </section>
    </main>
  );
}
