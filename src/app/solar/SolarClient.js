"use client";

import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { FaFacebookF, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { getSolarRegionConfigs } from "../solar-regions/solarRegionData";

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Solar Carports & Solar-Ready Steel Structures",
  description:
    "Smart Steel designs and supplies solar carports, solar-ready parking structures, roof frames, and steel support systems for South African projects.",
  provider: {
    "@type": "Organization",
    name: "Smart Steel",
    url: "https://www.smartsteel.co.za",
    logo: "https://www.smartsteel.co.za/logo-512x512.png",
  },
  areaServed: {
    "@type": "Country",
    name: "South Africa",
  },
  serviceType:
    "Solar carports, solar-ready steel structures, parking canopies, roof frames, and steel support systems",
  url: "https://www.smartsteel.co.za/solar",
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Do you only do solar carports?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Solar carports are a major focus, but Smart Steel also supports broader solar-ready steel applications such as roof framing, covered parking structures, and commercial steel support systems.",
      },
    },
    {
      "@type": "Question",
      name: "Can Smart Steel handle the steel structure and the solar-ready layout?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Smart Steel can scope the steel structure, parking layout, and solar-ready planning so the project is coordinated properly from the start.",
      },
    },
    {
      "@type": "Question",
      name: "Are these structures suitable for South African outdoor conditions?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Smart Steel systems are designed around durability, corrosion resistance, practical installation, and long-term outdoor performance for South African conditions.",
      },
    },
    {
      "@type": "Question",
      name: "Where should I start if I need a regional solar carport page?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Start with the Smart Steel solar carport regions hub to compare Pretoria, Johannesburg, Midrand, Cape Town, Durban, and other regional pages built for local commercial intent.",
      },
    },
  ],
};

const offerCards = [
  {
    title: "Solar carports",
    description:
      "Covered parking structures designed to support solar generation, improve site usability, and create visible long-term value.",
    href: "/solar-carports",
    cta: "Explore solar carports",
  },
  {
    title: "Roof-mounted support structures",
    description:
      "Steel framing that gives solar projects a cleaner structural base for commercial roofs, retrofits, and broader building integration.",
    href: "/products/lightweight-steel-trusses",
    cta: "View roof structure systems",
  },
  {
    title: "Commercial steel support systems",
    description:
      "Practical steel solutions for business parks, schools, estates, fleet parking, and sites that need more than a basic shade canopy.",
    href: "/contact",
    cta: "Discuss your project",
  },
];

const valuePoints = [
  "Covered parking and solar intent planned together from the start",
  "Cleaner steel detailing for commercial, institutional, and parking-heavy sites",
  "Faster installation and more predictable site delivery than ad hoc fabrication",
  "Practical design support for business parks, offices, schools, estates, and fleet environments",
];

const trustProof = [
  {
    title: "Built for real parking demand",
    description:
      "Our solar-ready structures are planned for office parks, schools, estates, retail parking, and operational sites that need practical long-term use, not temporary shade.",
  },
  {
    title: "Structured for South African conditions",
    description:
      "Smart Steel systems are designed around outdoor durability, cleaner installation, corrosion resistance, and the realities of South African commercial projects.",
  },
  {
    title: "Better project coordination",
    description:
      "We help align parking layout, steel scope, and solar intent earlier so the structure works properly before downstream suppliers arrive on site.",
  },
];

const featuredProject = {
  eyebrow: "Featured Project",
  title: "Centurion Golf Club Solar Carports",
  location: "Centurion Golf Club",
  summary:
    "A solar carport installation designed for customer parking, combining covered bays with a large solar footprint and a stronger arrival experience.",
  outcomes: [
    "Solar carport for customer parking",
    "300+ panels integrated into the parking structure",
    "Improved shade, site presentation, and long-term energy positioning",
  ],
  images: [
    { src: "/solar_car_port_1.jpg", alt: "Centurion Golf Club solar carport overview" },
    { src: "/solar_car_port_2.jpg", alt: "Centurion Golf Club solar carport parking bays" },
    { src: "/solar_car_port_3.jpg", alt: "Centurion Golf Club solar carport steel structure detail" },
  ],
};

const useCases = [
  {
    title: "Office parks and business campuses",
    description:
      "Create covered parking, strengthen the site experience, and support visible energy infrastructure where daytime vehicle demand is high.",
  },
  {
    title: "Schools, churches, and institutions",
    description:
      "Add parking cover and a stronger solar story for education and community environments that need durability and low maintenance.",
  },
  {
    title: "Retail and mixed-use developments",
    description:
      "Use solar carports to improve parking quality, support cleaner energy positioning, and add more commercial value to busy sites.",
  },
  {
    title: "Fleet yards and operational parking",
    description:
      "Plan steel parking structures for practical use, repeatability, and longer-term energy-linked infrastructure across larger footprints.",
  },
];

const processSteps = [
  {
    title: "Define the site and parking intent",
    description:
      "We review the parking layout, bay count, circulation, and the role solar generation needs to play in the project.",
  },
  {
    title: "Set the steel scope and structural direction",
    description:
      "We compare structure-only, solar-ready, and more complete coordinated solutions depending on the commercial goal.",
  },
  {
    title: "Move into quote and delivery planning",
    description:
      "Once the scope is clearer, we prepare the proposal, steel detailing, and practical next-step planning for installation.",
  },
];

const comparisons = [
  {
    title: "Structure-only",
    description:
      "Best where the client already has a solar team and needs the steel parking structure designed properly.",
  },
  {
    title: "Solar-ready structure",
    description:
      "Best where the parking structure and solar intent need to be aligned from the beginning, even if other suppliers are involved later.",
  },
  {
    title: "Broader coordinated solution",
    description:
      "Best where the client wants a more complete discussion around parking layout, steel scope, and solar-linked project planning.",
  },
];

const pricingDrivers = [
  "Parking bay count, overall span, and circulation layout",
  "Whether the project is structure-only, solar-ready, or more fully coordinated",
  "Foundations, site access, wind exposure, and finishing requirements",
  "The role of solar generation, electrical routing, and future expansion planning",
];

const internalLinks = [
  { href: "/solar-carports", label: "Solar carport regions" },
  { href: "/pretoria-solar-carports", label: "Solar carports Pretoria" },
  { href: "/johannesburg-solar-carports", label: "Solar carports Johannesburg" },
  { href: "/midrand-solar-carports", label: "Solar carports Midrand" },
  { href: "/lightweight-steel-warehouses", label: "Lightweight steel warehouses" },
  { href: "/products/lightweight-steel-trusses", label: "LSF roof trusses" },
];

export default function SolarClient() {
  const featuredRegions = getSolarRegionConfigs()
    .filter((region) => ["Pretoria", "Johannesburg", "Midrand", "Cape Town"].includes(region.name))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <main className="font-sans text-gray-900">
      <Script
        id="ld-service-solar-overview"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <Script
        id="ld-faq-solar-overview"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <section className="relative overflow-hidden bg-[#f5f6f8] px-6 pb-24 pt-28">
        <div className="absolute inset-y-0 right-0 w-[42%] bg-gradient-to-l from-[#f0d6d8] via-[#f7e8e9] to-transparent" />
        <div className="absolute inset-x-0 top-0 z-0 h-32 bg-gradient-to-b from-white via-white/95 to-transparent md:h-40" />
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="relative z-10">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#da1a33]">
              Solar-Ready Steel Structures
            </p>
            <h1 className="mt-5 max-w-4xl text-4xl font-bold tracking-tight text-gray-900 md:text-6xl">
              Solar carports and steel structures built for real South African sites
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-700">
              Smart Steel helps clients create covered parking, solar-ready structures, and
              energy-linked steel systems that feel commercially credible, structurally disciplined,
              and built for long-term use.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {["Office parks", "Schools", "Retail parking", "Business campuses", "Fleet yards"].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-gray-200 bg-white/80 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm"
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/solar-carports"
                className="rounded-full bg-[#da1a33] px-6 py-3 font-semibold text-white transition hover:bg-black"
              >
                Explore solar carports
              </Link>
              <Link
                href="/contact"
                className="rounded-full border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-900 transition hover:border-[#da1a33] hover:text-[#da1a33]"
              >
                Request a solar quote
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.75rem] border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-3xl font-bold text-gray-900">Dual purpose</p>
                <p className="mt-2 text-sm text-gray-600">covered parking plus solar intent in one structure</p>
              </div>
              <div className="rounded-[1.75rem] border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-3xl font-bold text-gray-900">Regional support</p>
                <p className="mt-2 text-sm text-gray-600">for Pretoria, Johannesburg, Midrand, Cape Town, and more</p>
              </div>
              <div className="rounded-[1.75rem] border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-3xl font-bold text-gray-900">Commercial focus</p>
                <p className="mt-2 text-sm text-gray-600">sites that need structure, parking quality, and stronger energy positioning</p>
              </div>
            </div>
          </div>

          <div className="relative z-10">
            <div className="overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-[#00000014]">
              <Image
                src="/solar-hero.jpg"
                alt="Smart Steel solar carport and solar-ready steel structure"
                width={900}
                height={780}
                className="h-full w-full object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 grid gap-6 lg:grid-cols-3">
            {trustProof.map((item) => (
              <div
                key={item.title}
                className="rounded-[1.75rem] border border-gray-200 bg-gradient-to-b from-white to-[#f8f9fa] p-6 shadow-sm"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#da1a33]">
                  Smart Steel
                </p>
                <h2 className="mt-3 text-2xl font-bold text-gray-900">{item.title}</h2>
                <p className="mt-4 text-sm leading-6 text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="rounded-[2rem] border border-gray-200 bg-[#f8f9fa] p-6 shadow-sm md:p-8">
            <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#da1a33]">
                  {featuredProject.eyebrow}
                </p>
                <h2 className="mt-4 text-3xl font-bold text-gray-900 md:text-4xl">
                  {featuredProject.title}
                </h2>
                <p className="mt-3 text-base font-medium text-gray-600">
                  {featuredProject.location}
                </p>
                <p className="mt-5 text-lg leading-8 text-gray-700">
                  {featuredProject.summary}
                </p>
                <div className="mt-6 space-y-3">
                  {featuredProject.outcomes.map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2 overflow-hidden rounded-[1.5rem] bg-white shadow-sm">
                  <Image
                    src={featuredProject.images[0].src}
                    alt={featuredProject.images[0].alt}
                    width={1200}
                    height={760}
                    className="h-full w-full object-cover"
                  />
                </div>
                {featuredProject.images.slice(1).map((image) => (
                  <div key={image.src} className="overflow-hidden rounded-[1.5rem] bg-white shadow-sm">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      width={900}
                      height={700}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-16 mb-10 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#da1a33]">
              Solar Solutions
            </p>
            <h2 className="mt-4 text-3xl font-bold md:text-4xl">
              Solar structures planned around real project requirements
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-700">
              Smart Steel supports a wider solar-ready steel category, from covered parking and
              roof support structures to broader commercial steel applications. Start here to see
              the main options, then move into the solution that best suits your site, energy
              goals, and parking layout.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {offerCards.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className="rounded-[2rem] border border-gray-200 bg-gradient-to-b from-white to-[#f7f8f9] p-7 shadow-sm transition hover:-translate-y-1 hover:border-[#da1a33] hover:shadow-lg"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#da1a33]">
                  Smart Steel Solar
                </p>
                <h3 className="mt-4 text-2xl font-bold text-gray-900">{card.title}</h3>
                <p className="mt-4 text-sm leading-6 text-gray-600">{card.description}</p>
                <p className="mt-6 text-sm font-semibold text-[#da1a33]">{card.cta}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0f0f10] px-6 py-20 text-white">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#f0a1ab]">
              Why Buyers Choose Smart Steel
            </p>
            <h2 className="mt-4 text-3xl font-bold md:text-4xl">
              Better steel thinking for parking, solar integration, and site value
            </h2>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-white/80">
              The opportunity is not just to put panels over cars. It is to design a structure that
              improves the parking environment, supports solar generation properly, and still looks
              like a serious long-term commercial asset.
            </p>
          </div>

          <div className="rounded-[2rem] bg-white/5 p-8">
            <div className="space-y-4">
              {valuePoints.map((point) => (
                <div
                  key={point}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white/85"
                >
                  {point}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f6f7f9] px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#da1a33]">
              Common Solar Use Cases
            </p>
            <h2 className="mt-4 text-3xl font-bold text-gray-900 md:text-4xl">
              Where solar-ready steel structures make the most sense
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {useCases.map((item) => (
              <div key={item.title} className="rounded-[1.75rem] bg-white p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#da1a33]">
                  Use Case
                </p>
                <h3 className="mt-3 text-xl font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-20">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#da1a33]">
              Typical Process
            </p>
            <h2 className="mt-4 text-3xl font-bold md:text-4xl">
              A cleaner way to move from concept to quote
            </h2>
          </div>
          <div className="space-y-4">
            {processSteps.map((step, index) => (
              <div key={step.title} className="rounded-[1.75rem] border border-gray-200 bg-[#f8f9fa] p-6">
                <p className="text-sm font-semibold text-[#da1a33]">Step {index + 1}</p>
                <h3 className="mt-2 text-xl font-semibold text-gray-900">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f6f7f9] px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#da1a33]">
              Compare Scope
            </p>
            <h2 className="mt-4 text-3xl font-bold text-gray-900 md:text-4xl">
              Not every project needs the same solar scope
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {comparisons.map((item) => (
              <div key={item.title} className="rounded-[1.75rem] bg-white p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#da1a33]">
                Pricing & Scope
              </p>
              <h2 className="mt-4 text-3xl font-bold text-gray-900 md:text-4xl">
                What usually affects solar carport cost
              </h2>
              <p className="mt-4 text-lg leading-8 text-gray-700">
                Solar carport quotes vary because the project is not just about steel tonnage. The
                parking layout, structural span, foundations, solar intent, and site conditions all
                shape the final scope.
              </p>
            </div>
            <div className="rounded-[2rem] border border-gray-200 bg-white p-8 shadow-sm">
              <div className="space-y-4">
                {pricingDrivers.map((item) => (
                  <div key={item} className="rounded-2xl bg-[#f6f7f9] p-4 text-sm leading-6 text-gray-700">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#da1a33]">
              Regional Solar Carports
            </p>
            <h2 className="mt-4 text-3xl font-bold text-gray-900 md:text-4xl">
              Compare priority solar carport regions
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-700">
              If your project is location-specific, compare our regional solar carport pages to see
              how Smart Steel approaches different commercial environments, delivery areas, and
              parking requirements across South Africa.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {featuredRegions.map((region) => (
              <Link
                key={region.citySlug}
                href={`/${region.legacySlug}`}
                className="rounded-[1.75rem] border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#da1a33] hover:shadow-lg"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#da1a33]">
                  {region.province}
                </p>
                <h3 className="mt-3 text-2xl font-bold text-gray-900">{region.name}</h3>
                <p className="mt-3 text-sm leading-6 text-gray-600">{region.description}</p>
                <p className="mt-5 text-sm font-semibold text-[#da1a33]">View region</p>
              </Link>
            ))}
          </div>

          <div className="mt-8">
            <Link
              href="/solar-carports"
              className="inline-flex rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-900 transition hover:border-[#da1a33] hover:text-[#da1a33]"
            >
              View all solar carport regions
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#111111] px-6 py-20 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#f0a1ab]">
              Explore More
            </p>
            <h2 className="mt-4 text-3xl font-bold md:text-4xl">
              Compare related Smart Steel systems
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {internalLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 text-sm font-medium text-white/85 transition hover:border-[#da1a33] hover:bg-white/10"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#da1a33]">
            Solar FAQ
          </p>
          <h2 className="mt-4 text-3xl font-bold text-gray-900 md:text-4xl">
            Questions buyers usually ask before moving ahead
          </h2>

          <div className="mt-10 space-y-4">
            {faqSchema.mainEntity.map((item) => (
              <div key={item.name} className="rounded-[1.75rem] border border-gray-200 bg-[#f8f9fa] p-6">
                <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                <p className="mt-3 text-sm leading-6 text-gray-600">
                  {item.acceptedAnswer.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#da1a33] px-6 py-20 text-white">
        <div className="mx-auto max-w-5xl text-left">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/80">
            Next Step
          </p>
          <h2 className="mt-4 text-3xl font-bold md:text-5xl">
            Ready to scope a solar-ready steel project properly?
          </h2>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-white/85">
            Tell us whether you are planning covered parking, a solar-ready structure, or a broader
            steel-and-energy application, and we will help you move into the right quote path.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="rounded-full bg-white px-6 py-3 font-semibold text-[#da1a33] transition hover:bg-black hover:text-white"
            >
              Contact Smart Steel
            </Link>
            <Link
              href="/solar-carports"
              className="rounded-full border border-white px-6 py-3 font-semibold text-white transition hover:bg-white hover:text-[#da1a33]"
            >
              Compare solar carport regions
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-5xl text-left">
          <h2 className="text-3xl font-bold mb-4">Follow our work</h2>
          <p className="text-lg mb-8 text-gray-700">
            See how Smart Steel is approaching solar-linked structures, parking solutions, and
            broader commercial steel applications across South Africa.
          </p>
          <div className="flex space-x-6 text-2xl text-gray-700">
            <a
              href="https://www.facebook.com/profile.php?id=61565551157027"
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-[#da1a33]"
            >
              <FaFacebookF />
            </a>
            <a
              href="https://www.instagram.com/pequeno_homes/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-[#da1a33]"
            >
              <FaInstagram />
            </a>
            <a
              href="https://www.linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-[#da1a33]"
            >
              <FaLinkedinIn />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
