'use client';

import Image from 'next/image';
import Link from 'next/link';

const proofStats = [
  { value: 'CFLC kits', label: 'Standard steel kits for practical DIY and trade enquiries' },
  { value: 'LSF systems', label: 'Custom warehouse solutions supported by our builder and estimator tools' },
  { value: 'Built in SA', label: 'Steel solutions designed for real South African project conditions' },
];

const primaryPaths = [
  {
    eyebrow: 'Products / DIY Systems',
    title: 'CFLC DIY kits',
    description:
      'Browse practical steel kits with clear sizes, starting prices, and a simple enquiry process for carports, cover kits, and warehouse structures.',
    bullets: [
      'Clear sizes and starting prices',
      'DIY supply with standard kit options',
      'Ideal for practical kit and trade enquiries',
    ],
    primaryHref: '/products/cflc-diy-warehouse-kits',
    primaryCta: 'Browse CFLC Kits',
    secondaryHref: '/products',
    secondaryCta: 'View Products Hub',
  },
  {
    eyebrow: 'Projects & Systems',
    title: 'LSF warehouse systems',
    description:
      'Start here when you need a custom warehouse solution, live configuration, or a clearer estimating path for a larger project.',
    bullets: [
      'Best for larger or more custom warehouse requirements',
      'Use the builder and estimator online',
      'Ideal for project-driven enquiries',
    ],
    primaryHref: '/warehouses/lsf',
    primaryCta: 'Explore LSF Systems',
    secondaryHref: '/warehouse-builder',
    secondaryCta: 'Build Your Warehouse',
  },
];

const supportCategories = [
  {
    title: 'Solar carports',
    description: 'Steel support systems for covered parking and energy generation.',
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
  'A clear online path between DIY products and custom systems',
  'Engineering-led steel solutions backed by practical delivery support',
  'Designed for South African commercial, residential, and agricultural conditions',
];

const homepageQuestions = [
  {
    question: 'Do you offer custom warehouses or standard kits?',
    answer:
      'Yes. Smart Steel offers custom LSF warehouse systems as well as CFLC and lipped channel kits in standard sizes.',
  },
  {
    question: 'What is the difference between LSF and CFLC?',
    answer:
      'LSF is better suited to custom warehouse projects, while CFLC works well when you want a practical steel kit in a standard size.',
  },
  {
    question: 'How do I get a price?',
    answer:
      'You can use the estimator for a quick budget guide, browse the CFLC kits for starting prices, or use the warehouse builder before you enquire.',
  },
];

const homepageSupportLinks = [
  { title: 'Warehouse page', href: '/warehouses' },
  { title: 'LSF systems', href: '/warehouses/lsf' },
  { title: 'CFLC warehouses', href: '/warehouses/cflc' },
  { title: 'CFLC kits', href: '/products/cflc-diy-warehouse-kits' },
  { title: 'Warehouse pricing', href: '/warehouse-cost' },
  { title: 'Estimator', href: '/tools/estimator' },
];

const featuredProjects = [
  {
    image: '/projects/atkv.jpg',
    title: '5x8m Structure for ATKV, Bergville',
    description: 'A compact steel structure delivered with clean detailing and fast installation.',
  },
  {
    image: '/projects/residential1.jpg',
    title: 'Roof Retrofit, Pretoria',
    description: 'A lightweight steel roof solution replacing an aging structure with a straighter, cleaner result.',
  },
];

export default function HomePageClient() {
  return (
    <main className="font-sans text-gray-900">
      <section className="relative overflow-hidden px-6 pb-20 pt-28 md:pb-24 md:pt-32">
        <Image
          src="/images/hero.webp"
          alt="Smart Steel warehouse and structural steel solutions"
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
              Smart Steel building kits and systems for South African projects
            </div>
            <h1 className="mt-6 max-w-4xl text-4xl font-bold leading-tight text-black md:text-6xl">
              Steel warehouses, CFLC kits, and LSF systems for South African projects
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-black/80 md:text-xl">
              Smart Steel makes it easier to compare steel warehouses, browse CFLC DIY kits, and
              explore custom LSF systems with clearer pricing, tools, and enquiry options.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/products/cflc-diy-warehouse-kits"
                className="rounded-full bg-[#da1a33] px-6 py-3 font-semibold text-white transition hover:bg-black"
              >
                Browse CFLC Kits
              </Link>
              <Link
                href="/warehouses/lsf"
                className="rounded-full border border-black bg-white px-6 py-3 font-semibold text-black transition hover:bg-black hover:text-white"
              >
                Explore LSF Systems
              </Link>
              <Link
                href="/tools/estimator"
                className="rounded-full border border-black bg-white px-6 py-3 font-semibold text-black transition hover:bg-black hover:text-white"
              >
                Get Instant Estimate
              </Link>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-black/75">
              <span>Standard kits and custom warehouse options</span>
              <span className="hidden text-black/30 md:inline">•</span>
              <span>Online tools to help you price and plan</span>
              <span className="hidden text-black/30 md:inline">•</span>
              <span>Designed for South African conditions</span>
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
              Quick Answers
            </p>
            <h2 className="mt-4 text-3xl font-bold md:text-4xl">A few useful answers before you start</h2>
            <div className="mt-8 grid gap-4 lg:grid-cols-3">
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

      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#da1a33]">Choose your path</p>
            <h2 className="mt-4 text-3xl font-bold md:text-5xl">Two clear ways to work with Smart Steel</h2>
            <p className="mt-5 text-lg leading-8 text-gray-700">
              Start with CFLC kits if you want a practical DIY product. Start with LSF systems if you need a broader
              custom warehouse solution.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {primaryPaths.map((path) => (
              <div key={path.title} className="rounded-[2rem] border border-gray-200 bg-gray-50 p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#da1a33]">{path.eyebrow}</p>
                <h3 className="mt-4 text-3xl font-bold text-black">{path.title}</h3>
                <p className="mt-4 text-base leading-8 text-gray-700">{path.description}</p>
                <ul className="mt-6 space-y-3 text-sm leading-7 text-gray-700">
                  {path.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    href={path.primaryHref}
                    className="rounded-full bg-[#da1a33] px-6 py-3 font-semibold text-white transition hover:bg-black"
                  >
                    {path.primaryCta}
                  </Link>
                  <Link
                    href={path.secondaryHref}
                    className="rounded-full border border-black bg-white px-6 py-3 font-semibold text-black transition hover:bg-black hover:text-white"
                  >
                    {path.secondaryCta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-6 pb-20 pt-0">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-[2rem] border border-gray-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#da1a33]">Explore More</p>
            <h2 className="mt-4 text-3xl font-bold md:text-4xl">Start with the page that matches your project</h2>
            <div className="mt-8 flex flex-wrap gap-3">
              {homepageSupportLinks.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="rounded-full border border-black bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-black hover:text-white"
                >
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#0f1720] px-6 py-20 text-white">
        <div className="mx-auto max-w-6xl grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#f16b7d]">Why buyers trust the route</p>
            <h2 className="mt-4 text-3xl font-bold md:text-5xl">Brilliant simplicity, backed by practical steel experience</h2>
            <p className="mt-6 text-lg leading-8 text-white/80">
              Smart Steel works best when the next step is obvious. We separate DIY-friendly product buying from custom
              project planning, so clients can find what they need faster and move forward with confidence.
            </p>
            <div className="mt-8 grid gap-4">
              {trustPoints.map((point) => (
                <div key={point} className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4 text-sm font-medium text-white/85">
                  {point}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-5">
            {supportCategories.map((category) => (
              <div key={category.title} className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur-sm">
                <h3 className="text-2xl font-bold text-white">{category.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/75">{category.description}</p>
                <Link href={category.href} className="mt-5 inline-block text-sm font-semibold text-[#f6b8c0]">
                  {category.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#da1a33]">Proof matters</p>
            <h2 className="mt-4 text-3xl font-bold md:text-5xl">Real projects still do the heavy lifting</h2>
            <p className="mt-5 text-lg leading-8 text-gray-700">
              Buyers trust steel when they can see the work. Smart Steel combines design, fabrication, and practical
              delivery support to produce clean, durable results across South Africa.
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

      <section className="bg-black px-6 py-20 text-center text-white">
        <h2 className="text-3xl font-bold md:text-5xl">Start in the right lane</h2>
        <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-white/75">
          Browse CFLC kits if you want a practical product, or explore LSF systems if you are planning a broader
          warehouse project.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/products/cflc-diy-warehouse-kits" className="rounded-full bg-white px-6 py-3 font-semibold text-black transition hover:bg-[#da1a33] hover:text-white">
            Browse CFLC Kits
          </Link>
          <Link href="/warehouses/lsf" className="rounded-full border border-white px-6 py-3 font-semibold text-white transition hover:bg-white hover:text-black">
            Explore LSF Systems
          </Link>
          <Link href="/contact" className="rounded-full border border-white px-6 py-3 font-semibold text-white transition hover:bg-white hover:text-black">
            Talk to Smart Steel
          </Link>
        </div>
      </section>
    </main>
  );
}
