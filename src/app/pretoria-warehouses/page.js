'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import WarehouseCatalogue from 'components/warehouse-catalogue';

export default function PretoriaPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const city = 'Pretoria';

  const widths = [8, 10, 12];
const lengths = [10, 12.5, 15, 17.5, 20, 22.5, 25, 30, 35, 40, 50];

const [selectedWidth, setSelectedWidth] = useState(8);

  const sizes = [];
  widths.forEach(w => {
    lengths.forEach(l => {
      sizes.push(`${w}m x ${l}m warehouse ${city}`);
    });
  });

  const faqs = [
    {
      q: `How long does it take to build a steel warehouse in ${city}?`,
      a: `Manufacturing typically takes around 2 weeks, with installation completed quickly on-site in ${city} depending on the building size.`,
    },
    {
      q: `What does a steel building cost per square meter in ${city}?`,
      a: `Steel building costs in ${city} typically range from R1,200 to R1,800 per m² for structure-only, and R2,500 to R4,500 per m² for turnkey construction.`,
    },
    {
      q: `Do you offer full turnkey steel construction in ${city}?`,
      a: `Yes, we provide full turnkey steel building solutions in ${city}, including design, engineering, manufacturing, and installation.`,
    },
    {
      q: `Can I expand my steel building later?`,
      a: `Yes, our modular steel system allows for easy expansion, which is ideal for growing businesses in ${city}.`,
    },
    {
      q: `Are lightweight steel buildings suitable for ${city} conditions?`,
      a: `Yes, our galvanized steel buildings are designed for durability in ${city}, offering resistance to fire, pests, and environmental factors.`,
    },
    {
      q: `Do you deliver and install outside ${city}?`,
      a: `Yes, while we service ${city}, we also deliver and install steel buildings across South Africa.`,
    },
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };

  return (
    <main className="font-sans text-gray-800">

      {/* SEO Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

     {/* HERO */}
<section className="relative h-[90vh] flex items-center justify-center text-center text-white">
  
  <Image
    src="/images/hero.jpg"
    alt={`Steel warehouse construction in ${city}`}
    fill
    priority
    className="object-cover"
  />

  {/* Dark overlay for readability */}
  <div className="absolute inset-0 bg-black/0"></div>

  <div className="relative z-10 max-w-4xl px-6">

    {/* MICRO TRUST LINE */}
    <p className="text-sm uppercase tracking-wider text-gray-300 mb-4">
      Engineered Steel Buildings • Fast Turnaround • Nationwide
    </p>

    {/* HEADLINE */}
    <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
      Steel Buildings {city}
    </h1>

    {/* SUBHEAD (UPGRADED) */}
    <p className="text-lg md:text-xl mb-8 text-gray-200">
      Premium lightweight steel warehouses, factories, and commercial buildings in {city} —
      built faster and more cost-effective than traditional construction.
    </p>

    {/* CTA GROUP (instead of single button) */}
    <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
      <Link
        href="/tools/estimator"
        className="bg-[#da1a33] px-8 py-4 rounded-full font-semibold text-lg"
      >
        Get Instant Estimate →
      </Link>

      <a
        href="tel:+27828464555"
        className="border border-white px-8 py-4 rounded-full font-semibold text-lg"
      >
        Call Now
      </a>
    </div>

    {/* TRUST POINTS */}
    <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-300">
      <span>✔ 2–4 Week Lead Times</span>
      <span>✔ Nationwide Install</span>
      <span>✔ Engineered for SA</span>
    </div>

  </div>
</section>

      {/* INTRO */}
       <section className="py-16 px-6 bg-white text-center">
          <h2 className="text-3xl font-semibold mb-6">Steel structures designed to last</h2>
          <p className="max-w-3xl mx-auto text-lg">
            Durable metal roofing, trusses, spec houses made from galvanised light weight steel that won’t twist, warp,
            or shrink — ever. Our steel is fire-resistant, termite and borer proof, 100% recyclable, and engineered for
            strength and longevity in any climate.
            Smart Steel is one of the leading designers and suppliers of lightweight steel construction solutions across
            South Africa. Our solutions are ideal for a wide range of applications, including custom steel workshops,
            affordable steel storage units, and lightweight steel warehouses.
          </p>
        </section>

    {/* Add the trusses section */}
    <WarehouseCatalogue />


{/* SIZE MATRIX */}
<section className="bg-gray-100 py-20 px-6">
  <div className="max-w-6xl mx-auto">
    <h2 className="text-3xl font-bold mb-6">
      Steel Warehouse Sizes {city}
    </h2>

    {/* WIDTH SELECTOR */}
    <div className="flex gap-4 mb-10">
      {widths.map((w) => (
        <button
          key={w}
          onClick={() => setSelectedWidth(w)}
          className={`px-6 py-3 rounded-full font-semibold ${
            selectedWidth === w
              ? 'bg-black text-white'
              : 'bg-white border'
          }`}
        >
          {w}m Width
        </button>
      ))}
    </div>

    {/* LENGTH GRID */}
    <div className="grid md:grid-cols-4 gap-4">
      {lengths.map((l, i) => (
        <div
          key={i}
          className="bg-white p-4 rounded shadow hover:shadow-lg transition"
        >
          <p className="font-semibold text-lg">
            {selectedWidth}m × {l}m
          </p>
          <p className="text-sm text-gray-500">
            {selectedWidth * l} m² Warehouse
          </p>

          <Link
            href="/tools/estimator"
            className="inline-block mt-3 text-sm underline"
          >
            Get Price →
          </Link>
        </div>
      ))}
    </div>
  </div>
</section>

{/* PRICING */}
<section className="py-20 px-6 max-w-6xl mx-auto">
  <h2 className="text-3xl font-bold mb-6">
    Steel Building Cost {city}
  </h2>

  <p className="text-lg mb-10 max-w-3xl">
    The cost of steel buildings in {city} depends on size, design complexity,
    and finishes. Lightweight steel structures offer a faster, more predictable
    alternative to traditional construction.
  </p>

  {/* PRICE CARDS */}
  <div className="grid md:grid-cols-2 gap-6 mb-12">

    {/* STRUCTURE ONLY */}
    <div className="bg-white p-6 rounded-xl shadow">
      <h3 className="text-xl font-semibold mb-2">
        Structure Only
      </h3>
      <p className="text-2xl font-bold mb-4">
        R1,200 – R1,800 / m²
      </p>
      <ul className="text-sm text-gray-600 space-y-2">
        <li>✔ Steel frame</li>
        <li>✔ Roof structure</li>
        <li>✔ Wall framing</li>
        <li>✔ Purlins & bracing</li>
      </ul>
    </div>

    {/* TURNKEY */}
    <div className="bg-black text-white p-6 rounded-xl shadow">
      <h3 className="text-xl font-semibold mb-2">
        Turnkey Build
      </h3>
      <p className="text-2xl font-bold mb-4">
        R2,500 – R4,500 / m²
      </p>
      <ul className="text-sm space-y-2">
        <li>✔ Full design & engineering</li>
        <li>✔ Manufacturing</li>
        <li>✔ Installation</li>
        <li>✔ Complete structure handover</li>
      </ul>
    </div>

  </div>

  {/* REAL EXAMPLES */}
  <div className="bg-gray-100 p-6 rounded-xl mb-10">
    <h3 className="text-xl font-semibold mb-4">
      Example Steel Building Prices in {city}
    </h3>

    <div className="grid md:grid-cols-3 gap-4 text-sm">
      <div className="bg-white p-4 rounded">
        <p className="font-semibold">10m × 20m Warehouse</p>
        <p className="text-gray-600">200 m²</p>
        <p className="mt-2 font-medium">≈ R500k – R900k</p>
      </div>

      <div className="bg-white p-4 rounded">
        <p className="font-semibold">12m × 30m Warehouse</p>
        <p className="text-gray-600">360 m²</p>
        <p className="mt-2 font-medium">≈ R900k – R1.6m</p>
      </div>

      <div className="bg-white p-4 rounded">
        <p className="font-semibold">12m × 50m Warehouse</p>
        <p className="text-gray-600">600 m²</p>
        <p className="mt-2 font-medium">≈ R1.5m – R2.7m</p>
      </div>
    </div>
  </div>

  {/* VALUE DRIVERS */}
  <div className="mb-10">
    <h3 className="text-xl font-semibold mb-4">
      What Affects Steel Building Cost?
    </h3>

    <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
      <div>• Building size (larger = lower cost per m²)</div>
      <div>• Site conditions & location</div>
      <div>• Cladding & finishes</div>
      <div>• Design complexity</div>
      <div>• Foundations & civil works</div>
      <div>• Delivery distance</div>
    </div>
  </div>

  {/* CTA */}
  <div className="text-center">
    <Link
      href="/tools/estimator"
      className="bg-[#da1a33] text-white px-8 py-4 rounded-full font-semibold inline-block"
    >
      Get Instant Steel Building Price →
    </Link>
  </div>
</section>

      {/* FAQ */}
      <section className="bg-gray-100 py-20 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-10">FAQs</h2>

        <div className="space-y-4">
          {faqs.map(({ q, a }, index) => (
            <div key={index} className="border-b pb-4">
              <button
                onClick={() =>
                  setOpenFaqIndex(openFaqIndex === index ? null : index)
                }
                className="w-full text-left text-lg font-medium flex justify-between items-center"
              >
                {q}
                <span className="text-xl">
                  {openFaqIndex === index ? '−' : '+'}
                </span>
              </button>

              {openFaqIndex === index && (
                <p className="mt-3 text-gray-600 text-sm leading-relaxed">
                  {a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* INTERNAL LINKS */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">
          Steel Buildings Near {city}
        </h2>

        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <Link href="/johannesburg-warehouses" className="underline">
            Steel Buildings Johannesburg
          </Link>
          <Link href="/centurion-warehouses" className="underline">
            Steel Buildings Centurion
          </Link>
          <Link href="/midrand-warehouses" className="underline">
            Steel Buildings Midrand
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-black text-white text-center py-20 px-6">
        <h2 className="text-3xl font-bold mb-4">
          Get a Steel Building Quote in {city}
        </h2>

        <div className="flex justify-center gap-4">
          <Link href="/tools/estimator" className="bg-white text-black px-6 py-3 rounded-full font-semibold">
            Start Estimate
          </Link>
        </div>
      </section>

    </main>
  );
}
