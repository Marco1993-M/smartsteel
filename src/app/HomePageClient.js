'use client';

import Image from 'next/image';
import Link from 'next/link';

const proofStats = [
  { value: 'Estimate tools', label: 'Warehouse estimate tools to help you price and plan before you enquire' },
  { value: 'Steel routes', label: 'Lip channel and custom engineered options for different project needs' },
  { value: 'SA sites', label: 'Designed for South African sites, spans, access, and practical build conditions' },
];

const planningActions = [
  {
    title: 'Estimate your budget',
    description: 'Start with a practical estimate route before you request a formal quote.',
    href: '/tools/estimator',
    cta: 'Get an Estimate',
  },
  {
    title: 'Compare warehouse systems',
    description: 'Review the main warehouse routes and decide which structure type fits your project.',
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
    eyebrow: 'Standard Kit Route',
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
    eyebrow: 'Custom Project Route',
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
    title: 'Standard and custom steel routes',
    description: 'Smart Steel separates standard lip channel kits from custom engineered warehouse systems.',
  },
];

const homepageQuestions = [
  {
    question: 'Do you supply lightweight steel warehouses across South Africa?',
    answer:
      'Yes. Smart Steel supplies lightweight steel warehouse systems and planning routes for projects across South Africa.',
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
  return (
    <main className="font-sans text-gray-900">
      {structuredData.map((schema) => (
        <script
          key={schema['@type']}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <section className="relative overflow-hidden px-6 pb-20 pt-28 md:pb-24 md:pt-32">
        <Image
          src="/images/hero.webp"
          alt="Smart Steel lightweight steel warehouse systems in South Africa"
          fill
          priority
          quality={85}
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-white/72" />
        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="max-w-4xl">
            <div className="inline-flex rounded-full border border-black bg-white/85 px-4 py-2 text-sm font-semibold text-black">
              Lightweight steel warehouse supplier and planning support
            </div>
            <h1 className="mt-6 max-w-4xl text-4xl font-bold leading-tight text-black md:text-6xl">
              Lightweight steel warehouses for South African projects
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-black/80 md:text-xl">
              Smart Steel supplies lightweight steel warehouse systems across South Africa,
              helping clients compare standard lip channel kits, custom engineered options,
              and practical estimate routes before they enquire.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/tools/estimator"
                className="rounded-full bg-[#da1a33] px-6 py-3 font-semibold text-white transition hover:bg-black"
              >
                Get a Warehouse Estimate
              </Link>
              <Link
                href="/products"
                className="rounded-full border border-black bg-white px-6 py-3 font-semibold text-black transition hover:bg-black hover:text-white"
              >
                Explore Lip Channel Kits
              </Link>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-black/75">
              <span>Warehouse estimate tools</span>
              <span className="hidden text-black/30 md:inline">•</span>
              <span>Lip channel and custom engineered options</span>
              <span className="hidden text-black/30 md:inline">•</span>
              <span>Designed for South African sites</span>
            </div>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {proofStats.map((stat) => (
              <div key={stat.label} className="rounded-3xl border border-black/10 bg-white/85 p-6 shadow-sm backdrop-blur-sm">
                <p className="text-2xl font-bold text-black md:text-3xl">{stat.value}</p>
                <p className="mt-2 text-sm leading-7 text-gray-700">{stat.label}</p>
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

      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#da1a33]">Choose your path</p>
            <h2 className="mt-4 text-3xl font-bold md:text-5xl">Choose the right steel warehouse path</h2>
            <p className="mt-5 text-lg leading-8 text-gray-700">
              Start with lip channel kits when you want practical standard structures. Use the
              custom engineered route when your warehouse needs more project-specific planning.
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
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#f16b7d]">Why buyers trust the route</p>
            <h2 className="mt-4 max-w-4xl text-3xl font-bold md:text-5xl">Practical planning for lightweight steel warehouse projects</h2>
            <p className="mt-6 text-lg leading-8 text-white/80">
              Smart Steel helps buyers separate standard kit routes from custom warehouse
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
          Use the estimate route for an early budget, or compare lip channel and custom
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
