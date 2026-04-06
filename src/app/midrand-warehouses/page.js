'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import WarehouseCatalogue from 'components/warehouse-catalogue';

export default function MidrandPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const city = 'Midrand';

  const widths = [8, 10, 12];
const lengths = [10, 12.5, 15, 17.5, 20, 22.5, 25, 27.5, 30, 32.5, 35, 37.5, 40, 50];

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
<section className="relative w-full h-[90vh] md:h-[100vh] flex items-start justify-center text-center text-white px-6 overflow-hidden">
  {/* Optimized hero image */}
  <Image
    src="/images/hero.webp"
    alt="Smart Steel lightweight warehouse"
    fill
    priority
    quality={85}
    sizes="100vw"
    className="object-cover object-center"
  />

  {/* Overlay */}
  <div className="absolute inset-0 bg-black/0"></div>

  {/* Content Wrapper */}
  <div className="relative z-10 flex flex-col items-center w-full max-w-4xl mx-auto mt-24 md:mt-32">
    
    {/* SEO badge / subtitle */}
    <div className="w-full max-w-[90vw] sm:max-w-md md:max-w-xl lg:max-w-3xl mb-6 border border-black bg-transparent rounded-full">
      <div className="px-4 sm:px-6 py-1 sm:py-1.5 rounded-full flex items-center justify-center">
        <h2 className="text-xs sm:text-sm md:text-base font-semibold text-center leading-snug text-black">
          The easiest way to build a steel warehouse in Midrand.
        </h2>
      </div>
    </div>

    {/* Main Headline */}
    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-black leading-tight">
       #1 Steel Warehouse Supplier in Midrand
    </h1>

    {/* Supporting Subheading */}
    <p className="text-base sm:text-lg md:text-xl mb-8 text-black max-w-2xl mx-auto">
      Build Smarter, Faster Warehouses with Lightweight Steel
    </p>

<div className="flex items-center gap-4">
  
  {/* Estimator CTA */}
  <a
    href="/tools/estimator"
    className="inline-flex items-center justify-center gap-2 bg-[#da1a33] text-white px-6 py-3 rounded-full font-semibold hover:bg-white border border-black hover:text-black transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#da1a33]"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className="w-6 h-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V13.5Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V18Zm2.498-6.75h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V13.5Zm0 2.25h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V18Zm2.504-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V18Zm2.498-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5ZM8.25 6h7.5v2.25h-7.5V6ZM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 0 0 2.25 2.25h10.5a2.25 2.25 0 0 0 2.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0 0 12 2.25Z"
      />
    </svg>
    Get Instant Estimate
  </a>

{/* WhatsApp Button */}
<a
  href="https://wa.me/27828464555?text=Hi%20Smart%20Steel%2C%20I%E2%80%99d%20like%20a%20quote%20for%20a%20project"
  target="_blank"
  rel="noopener noreferrer"
  className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500 text-white border border-transparent transition-all duration-300 hover:bg-white hover:text-green-500 hover:border-green-500"
  title="Chat with us on WhatsApp"
>
  {/* WhatsApp Icon SVG */}
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="size-6 fill-current">
    <path d="M16 .396c-8.837 0-16 7.163-16 16 0 2.823.737 5.574 2.141 7.998L0 32l7.792-2.098A15.9 15.9 0 0 0 16 32c8.837 0 16-7.163 16-16s-7.163-15.604-16-15.604zm0 29.205a13.15 13.15 0 0 1-6.69-1.822l-.48-.283-4.633 1.248 1.24-4.518-.312-.495A13.123 13.123 0 0 1 2.875 16c0-7.244 5.881-13.125 13.125-13.125S29.125 8.756 29.125 16 23.244 29.6 16 29.6zm7.194-9.727c-.393-.197-2.326-1.151-2.686-1.283-.36-.132-.623-.197-.886.197s-1.017 1.283-1.248 1.546c-.229.262-.459.295-.852.098-.393-.197-1.66-.611-3.162-1.947-1.168-1.041-1.954-2.326-2.184-2.72-.229-.393-.025-.606.172-.803.177-.176.393-.459.59-.688.197-.229.262-.393.393-.656.131-.262.066-.492-.033-.689-.098-.197-.886-2.142-1.214-2.935-.32-.769-.646-.663-.886-.674l-.754-.014c-.229 0-.6.086-.916.418s-1.2 1.171-1.2 2.854c0 1.683 1.229 3.309 1.4 3.536.172.229 2.416 3.686 5.854 5.165.818.353 1.455.564 1.953.722.821.262 1.568.225 2.16.137.659-.098 2.326-.951 2.654-1.87.328-.918.328-1.705.229-1.87-.098-.164-.36-.262-.754-.459z"/>
  </svg>
</a>


</div>


    {/* Subtext under CTA */}
    <div className="mt-4 bg-white/90 px-3 py-1 rounded-full border border-black inline-block">
      <p className="text-sm text-black">
       Get real-time INSTANT pricing. No email required.
      </p>
    </div>

    {/* Stats Bar */}
    <div className="grid grid-cols-3 gap-6 text-white mt-32">
      <div className="text-center">
        <p className="text-xl sm:text-2xl font-bold">📈 23321+</p>
        <p className="text-xs sm:text-sm">Lightweight Steel Meters Supplied</p>
      </div>
      <div className="text-center">
        <p className="text-xl sm:text-2xl font-bold">💰 30%</p>
        <p className="text-xs sm:text-sm">Avg. Cost Savings</p>
      </div>
      <div className="text-center">
        <p className="text-xl sm:text-2xl font-bold">⏱️ 50%</p>
        <p className="text-xs sm:text-sm">Faster Build Time</p>
      </div>
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
        R2,500 – R3,500 / m²
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
        <p className="mt-2 font-medium">≈ R200k – R400k</p>
      </div>

      <div className="bg-white p-4 rounded">
        <p className="font-semibold">12m × 30m Warehouse</p>
        <p className="text-gray-600">360 m²</p>
        <p className="mt-2 font-medium">≈ R320k – R1.2m</p>
      </div>

      <div className="bg-white p-4 rounded">
        <p className="font-semibold">12m × 50m Warehouse</p>
        <p className="text-gray-600">600 m²</p>
        <p className="mt-2 font-medium">≈ R715k – R1.7m</p>
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
          <Link href="/pretoria-warehouses" className="underline">
            Steel Buildings Pretoria
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
