'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import WarehouseCatalogue from 'components/warehouse-catalogue';

const brochures = {
  'Home Owner': [
    {
      title: 'Smart Steel Solutions Guide',
      desc: 'An overview of our lightweight steel kits, ideal for residential and commercial builds.',
      image: '/Brochure A.jpg',
      link: '/brochures/resilient.pdf',
    },
    {
      title: 'Smart Steel Sustainability Report',
      desc: 'A detailed look at our eco-friendly processes and recyclable materials.',
      image: '/Brochure B.jpg',
      link: '/sustainability',
    },
  ],
  'Architect / Specifier': [
    {
      title: 'Technical Specs & Compliance',
      desc: 'Detailed engineering specs, load calculations, and local compliance data.',
      image: '/Brochure A.jpg',
      link: '/resources',
    },
    {
      title: 'Smart Steel Solutions Guide',
      desc: 'An overview of our lightweight steel kits, ideal for residential and commercial builds.',
      image: '/brochure-cover1.jpg',
      link: '/brochures/resilient.pdf',
    },
  ],
  'Builder / Installer': [
    {
      title: 'Installation Guide',
      desc: 'Step-by-step instructions to install Smart Steel frame kits on-site.',
      image: '/brochure-cover3.jpg',
      link: '/resources',
    },
    {
      title: 'Warranty Document',
      desc: '10-year structural warranty on all steel frames.',
      image: '/brochure-cover2.jpg',
      link: '/resources',
    },
  ],
  Fabricator: [
    {
      title: 'Fabrication Standards Guide',
      desc: 'Guidelines and tolerances for fabrication.',
      image: '/brochure-cover1.jpg',
      link: '/resources',
    },
    {
      title: 'Smart Steel Solutions Guide',
      desc: 'An overview of our lightweight steel kits, ideal for residential and commercial builds.',
      image: '/brochure-cover4.jpg',
      link: '/brochures/resilient.pdf',
    },
  ],
};

const offerCards = [
  {
    title: 'Lightweight Steel Warehouses',
    desc: 'Fast, modular warehouse systems designed for South African business, agricultural, and industrial use.',
    href: '/lightweight-steel-warehouses',
    cta: 'Explore Warehouses',
  },
  {
    title: 'Solar Carports',
    desc: 'Solar-ready steel structures that create covered parking while supporting long-term energy generation.',
    href: '/solar',
    cta: 'Explore Solar Carports',
  },
  {
    title: 'LSF Roof Trusses',
    desc: 'Precision-engineered lightweight steel roof trusses for homes, schools, churches, and commercial roofs.',
    href: '/products/lightweight-steel-trusses',
    cta: 'Explore Trusses',
  },
];

const proofStats = [
  { value: '10 321+', label: 'Lightweight steel metres supplied' },
  { value: 'Projects across SA', label: 'Warehouses, roof retrofits, and steel structures delivered in real South African conditions' },
  { value: 'Faster programmes', label: 'Chosen by buyers who want cleaner builds, less delay, and lower long-term maintenance' },
];

const trustPoints = [
  'Built for South African commercial, residential, and agricultural conditions',
  'Used for warehouses, roof retrofits, carports, and custom steel structures',
  'Backed by engineering-led design, fabrication, and practical delivery support',
];

const switchReasons = [
  {
    title: 'Build faster',
    description: 'Lightweight steel systems help reduce programme delays and keep projects moving with cleaner, more predictable installation.',
  },
  {
    title: 'Get a straighter structure',
    description: 'Precision-manufactured members stay true, which improves roof lines, fitment quality, and overall finish.',
  },
  {
    title: 'Reduce long-term maintenance',
    description: 'Steel will not warp, twist, rot, or attract termites, making it a smarter long-term structural choice in many applications.',
  },
  {
    title: 'Scale with confidence',
    description: 'Warehouse and structural systems can be planned for future extensions, phased growth, and operational flexibility.',
  },
];

const trustCases = [
  {
    title: 'Warehouses',
    description: 'Fast, modular steel buildings for storage, distribution, workshops, and agricultural use.',
  },
  {
    title: 'Roof retrofits',
    description: 'A lighter, straighter alternative when replacing aging timber or upgrading existing roof structures.',
  },
  {
    title: 'Solar-ready structures',
    description: 'Steel systems designed to support parking cover, energy generation, and long-term outdoor durability.',
  },
];

const features = [
  {
    title: '100% termite proof',
    description: 'Smart Steel structures resist termite damage, eliminating treatments and ongoing inspections.',
    image: '/A.jpg',
  },
  {
    title: 'Straight and true',
    description: 'Precision-manufactured steel stays straight, helping roofs and walls remain level and square.',
    image: '/B.jpg',
  },
  {
    title: 'Dimensionally accurate',
    description: 'Factory-cut members reduce site errors, wasted material, and fitment issues.',
    image: '/C.jpg',
  },
  {
    title: 'Renowned durability',
    description: 'TRUECORE steel is corrosion resistant and made for long-term structural performance.',
    image: '/durability.jpg',
  },
  {
    title: 'Won’t catch fire',
    description: 'Steel is non-combustible and helps improve overall structural resilience.',
    image: '/fireproof.jpg',
  },
];

const faqs = [
  {
    q: 'What does Smart Steel do best?',
    a: 'We specialise in lightweight steel warehouses, solar-ready steel carports, and precision-engineered LSF roof trusses for South African projects.',
  },
  {
    q: 'Can you help with both design and supply?',
    a: 'Yes. Smart Steel can support concept design, engineering, fabrication, and project delivery depending on the scope and service you need.',
  },
  {
    q: 'Do you work across South Africa?',
    a: 'Yes. We support projects across South Africa, with especially strong demand in Gauteng and surrounding commercial and industrial areas.',
  },
];

const projects = [
  {
    image: '/projects/atkv.jpg',
    title: '5x8m Structure for ATKV, Bergville',
    description: 'A compact lightweight steel structure delivered with speed and clean installation.',
  },
  {
    image: '/projects/residential1.jpg',
    title: 'Lightweight Roof Retrofit, Pretoria',
    description: 'Steel trusses replaced an aging flat roof with a faster, lighter structural solution.',
  },
];

export default function HomePageClient() {
  const [selectedRole, setSelectedRole] = useState('Home Owner');
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

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
        <div className="absolute inset-0 bg-white/70" />
        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="max-w-4xl">
            <div className="inline-flex rounded-full border border-black bg-white/80 px-4 py-2 text-sm font-semibold text-black">
              South African steel structures for warehousing, solar carports, and LSF trusses
            </div>
            <h1 className="mt-6 max-w-4xl text-4xl font-bold leading-tight text-black md:text-6xl">
              Smarter steel structures for warehouses, solar carports, and roof trusses
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-black/80 md:text-xl">
              Smart Steel helps South African clients build faster with lightweight steel warehouses, solar-ready carports,
              and precision-engineered LSF roof trusses that balance speed, durability, and long-term value.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/tools/estimator"
                className="rounded-full bg-[#da1a33] px-6 py-3 font-semibold text-white transition hover:bg-black"
              >
                Get Instant Estimate
              </Link>
              <Link
                href="/contact"
                className="rounded-full border border-black bg-white px-6 py-3 font-semibold text-black transition hover:bg-black hover:text-white"
              >
                Talk to Smart Steel
              </Link>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-black/75">
              <span>Real-time online pricing available</span>
              <span className="hidden text-black/30 md:inline">•</span>
              <span>No email required to start</span>
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

      <section className="bg-white px-6 py-10">
        <div className="mx-auto max-w-6xl rounded-[2rem] border border-gray-200 bg-gray-50 p-8 md:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#da1a33]">Trusted by practical buyers</p>
              <h2 className="mt-4 text-3xl font-bold md:text-4xl">Smart Steel is built around real-world performance, not brochure claims</h2>
            </div>
            <div className="grid gap-4">
              {trustPoints.map((point) => (
                <div key={point} className="rounded-2xl bg-white px-5 py-4 text-sm font-medium text-gray-800 shadow-sm">
                  {point}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#da1a33]">What we build</p>
            <h2 className="mt-4 text-3xl font-bold md:text-5xl">Steel solutions built around speed, strength, and long-term value</h2>
            <p className="mt-5 text-lg leading-8 text-gray-700">
              Smart Steel focuses on the steel structure categories where performance matters most: warehouse buildings,
              solar-ready carports, and precision-engineered LSF trusses for modern roofing.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {offerCards.map((card) => (
              <div key={card.title} className="rounded-3xl border border-gray-200 bg-gray-50 p-8">
                <h3 className="text-2xl font-bold text-black">{card.title}</h3>
                <p className="mt-4 text-base leading-7 text-gray-700">{card.desc}</p>
                <Link href={card.href} className="mt-8 inline-block text-sm font-semibold text-[#da1a33]">
                  {card.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#da1a33]">Why steel</p>
            <h2 className="mt-4 text-3xl font-bold md:text-5xl">Why buyers switch to lightweight steel</h2>
            <p className="mt-5 text-lg leading-8 text-gray-700">
              Most buyers are not looking for steel because it sounds technical. They switch because they want a structure that
              goes up faster, stays straighter, and performs better over time.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {switchReasons.map((reason) => (
              <div key={reason.title} className="rounded-3xl border border-gray-200 bg-gray-50 p-7">
                <h3 className="text-2xl font-bold text-black">{reason.title}</h3>
                <p className="mt-4 text-sm leading-7 text-gray-700">{reason.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0f1720] px-6 py-20 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#f16b7d]">Warehouse systems</p>
            <h2 className="mt-4 text-3xl font-bold md:text-5xl">Lightweight steel warehouses built for speed and long-term value</h2>
            <p className="mt-6 text-lg leading-8 text-white/80">
              If warehousing is your priority, this is where Smart Steel is strongest. Our lightweight steel warehouse systems
              are designed for quick installation, clean spans, modular expansion, and lower lifecycle maintenance.
            </p>
            <ul className="mt-8 space-y-3 text-sm leading-7 text-white/85">
              <li><span className="font-semibold text-white">Faster delivery:</span> faster to erect than many traditional alternatives.</li>
              <li><span className="font-semibold text-white">Smarter structure:</span> light yet strong systems built for industrial and commercial use.</li>
              <li><span className="font-semibold text-white">Clear buyer path:</span> browse standard options or use the estimator for a quick budget range.</li>
            </ul>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/lightweight-steel-warehouses" className="rounded-full bg-white px-6 py-3 font-semibold text-black transition hover:bg-[#da1a33] hover:text-white">
                Explore Warehouses
              </Link>
              <Link href="/warehouse-cost" className="rounded-full border border-white px-6 py-3 font-semibold text-white transition hover:bg-white hover:text-black">
                View Warehouse Cost Guides
              </Link>
            </div>
          </div>
          <div className="mt-12 rounded-[2rem] bg-white/10 p-6 backdrop-blur-sm">
            <WarehouseCatalogue
              title="Popular warehouse options"
              subtitle="Compare some of the enclosed, agricultural, and larger footprint structures buyers are already considering."
            />
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-6xl grid gap-8 md:grid-cols-2">
          {projects.map((project) => (
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
        <div className="mx-auto mt-12 max-w-3xl text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Proof matters</h2>
          <p className="mt-4 text-lg leading-8 text-gray-700">
            Buyers trust steel when they can see the work. Smart Steel combines design, fabrication, and practical project delivery
            to produce clean, durable outcomes across South Africa.
          </p>
          <div className="mt-8 grid gap-4 text-left md:grid-cols-3">
            {trustCases.map((item) => (
              <div key={item.title} className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                <h3 className="text-lg font-bold text-black">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-gray-700">{item.description}</p>
              </div>
            ))}
          </div>
          <Link href="/recent" className="mt-8 inline-block rounded-full bg-black px-6 py-3 font-semibold text-white transition hover:bg-[#da1a33]">
            Explore Recent Projects
          </Link>
        </div>
      </section>

      <section className="bg-gray-50 px-6 py-20">
        <div className="mx-auto max-w-6xl grid gap-12 lg:grid-cols-2">
          <div className="rounded-[2rem] bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#da1a33]">Solar-ready structures</p>
            <h2 className="mt-4 text-3xl font-bold md:text-4xl">Solar carports that turn steel structures into energy assets</h2>
            <p className="mt-5 text-lg leading-8 text-gray-700">
              Solar carports are a strong category for Smart Steel because they combine structural expertise with energy value.
              We design steel systems that create covered parking while supporting long-term solar generation.
            </p>
            <ul className="mt-6 space-y-3 text-sm leading-7 text-gray-700">
              <li>Ideal for malls, offices, schools, estates, and commercial parking areas.</li>
              <li>Built for durability, drainage, access, and future maintenance practicality.</li>
              <li>Well suited to businesses wanting visible sustainability infrastructure.</li>
            </ul>
            <Link href="/solar" className="mt-8 inline-block rounded-full bg-[#da1a33] px-6 py-3 font-semibold text-white transition hover:bg-black">
              Explore Solar Carports
            </Link>
          </div>

          <div className="rounded-[2rem] bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#da1a33]">Roof truss systems</p>
            <h2 className="mt-4 text-3xl font-bold md:text-4xl">LSF trusses engineered for straighter, stronger roof structures</h2>
            <p className="mt-5 text-lg leading-8 text-gray-700">
              Lightweight steel trusses give homeowners, builders, and specifiers a durable alternative to traditional roof
              framing, with better dimensional accuracy, termite resistance, and fast installation.
            </p>
            <ul className="mt-6 space-y-3 text-sm leading-7 text-gray-700">
              <li>Positioned for homes, schools, churches, renovations, and commercial roofs.</li>
              <li>Ideal for builders and specifiers looking for straighter, cleaner roof structures.</li>
              <li>Designed for projects where consistency, speed, and low maintenance matter.</li>
            </ul>
            <Link
              href="/products/lightweight-steel-trusses"
              className="mt-8 inline-block rounded-full bg-black px-6 py-3 font-semibold text-white transition hover:bg-[#da1a33]"
            >
              Explore LSF Trusses
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-6xl grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:items-center">
          <div>
            <h2 className="text-3xl font-bold md:text-4xl">Built-in quality that makes lightweight steel worth it</h2>
            <p className="mt-5 text-lg leading-8 text-gray-700">
              Smart Steel is not only selling speed. We are selling structural confidence: straighter members, lower maintenance,
              better durability, and consistent fabrication quality that suits long-term building performance.
            </p>
            <div className="mt-8 space-y-6">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  onMouseEnter={() => setHoveredFeature(index)}
                  onMouseLeave={() => setHoveredFeature(null)}
                  className="cursor-pointer rounded-2xl border border-gray-200 p-5 transition hover:border-[#da1a33]"
                >
                  <h3 className="text-xl font-semibold text-black">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-gray-700">
                    {hoveredFeature === index ? feature.description : 'Hover to learn why this matters on a real project.'}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative min-h-[440px] overflow-hidden rounded-[2rem] shadow-lg">
            <Image
              src={features[hoveredFeature ?? 0].image}
              alt={features[hoveredFeature ?? 0].title}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="bg-gray-100 px-6 py-20">
        <div className="mx-auto max-w-6xl grid gap-12 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <h2 className="text-3xl font-bold md:text-4xl">Resources for homeowners, builders, and specifiers</h2>
            <p className="mt-5 text-lg leading-8 text-gray-700">
              Use our brochures and technical resources to understand the products better, compare structural options, and move
              faster from interest to specification.
            </p>
            <div className="mt-8">
              <label htmlFor="audience" className="block text-sm font-medium text-gray-700">
                I am a:
              </label>
              <select
                id="audience"
                name="audience"
                value={selectedRole}
                onChange={(event) => setSelectedRole(event.target.value)}
                className="mt-3 block w-72 rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-700 shadow-sm focus:border-[#da1a33] focus:outline-none focus:ring-[#da1a33]"
              >
                {Object.keys(brochures).map((role) => (
                  <option key={role}>{role}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-6">
            {brochures[selectedRole].map((item) => (
              <div key={item.title} className="flex overflow-hidden rounded-3xl bg-white shadow-sm">
                <div className="relative w-1/3">
                  <Image src={item.image} alt={item.title} fill sizes="33vw" className="object-cover" />
                </div>
                <div className="flex w-2/3 flex-col justify-between p-6">
                  <div>
                    <h3 className="text-lg font-semibold text-black">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-gray-600">{item.desc}</p>
                  </div>
                  <a
                    href={item.link}
                    download
                    className="mt-6 inline-block rounded-full bg-[#da1a33] px-5 py-2 text-sm font-semibold text-white transition hover:bg-black"
                  >
                    Download
                  </a>
                </div>
              </div>
            ))}
            <div>
              <Link href="/resources" className="inline-block rounded-full bg-black px-6 py-3 font-semibold text-white transition hover:bg-[#da1a33]">
                View All Resources
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Questions buyers ask before they choose steel</h2>
            <p className="mt-4 text-lg text-gray-700">
              Clear answers for clients comparing warehouses, solar structures, and lightweight steel trusses.
            </p>
          </div>
          <div className="mt-12 space-y-4">
            {faqs.map((faq, index) => (
              <div key={faq.q} className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="flex w-full items-center justify-between gap-4 text-left text-lg font-semibold text-black"
                >
                  <span>{faq.q}</span>
                  <span className="text-2xl text-[#da1a33]">{openFaqIndex === index ? '−' : '+'}</span>
                </button>
                {openFaqIndex === index && <p className="mt-4 text-sm leading-7 text-gray-700">{faq.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black px-6 py-20 text-center text-white">
        <h2 className="text-3xl font-bold md:text-5xl">Ready to build with Smart Steel?</h2>
        <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-white/75">
          Whether you are pricing a warehouse, planning solar carports, or comparing LSF trusses, we can help you move from
          concept to a buildable steel solution.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/tools/estimator" className="rounded-full bg-white px-6 py-3 font-semibold text-black transition hover:bg-[#da1a33] hover:text-white">
            Start With an Estimate
          </Link>
          <Link href="/contact" className="rounded-full border border-white px-6 py-3 font-semibold text-white transition hover:bg-white hover:text-black">
            Contact Smart Steel
          </Link>
        </div>
      </section>
    </main>
  );
}
