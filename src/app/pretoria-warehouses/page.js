'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function PretoriaPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const city = 'Pretoria';

  const widths = [8, 10, 12];
  const lengths = [10, 12.5, 15, 17.5, 20, 22.5, 25, 30, 35, 40, 50];

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
          alt="Smart Steel lightweight warehouse"
          fill
          priority
          className="object-cover"
        />
        <div className="relative z-10 max-w-4xl px-6">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Steel Buildings {city}
          </h1>
          <p className="text-lg md:text-xl mb-8">
            Premium lightweight steel warehouses, factories, and commercial buildings in {city}.
          </p>

          <Link href="/tools/estimator" className="bg-[#da1a33] px-8 py-4 rounded-full font-semibold text-lg">
            Get Instant Estimate
          </Link>
        </div>
      </section>

      {/* INTRO */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">Steel Structures in {city}</h2>
        <p className="text-lg mb-4">
          Smart Steel delivers turnkey lightweight steel construction solutions across {city}.
        </p>
      </section>

      {/* SIZE MATRIX */}
      <section className="bg-gray-100 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Steel Warehouse Sizes {city}</h2>

          <div className="grid md:grid-cols-3 gap-4">
            {sizes.map((size, i) => (
              <div key={i} className="bg-white p-4 rounded shadow text-sm">
                {size}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">Steel Building Cost {city}</h2>

        <ul className="space-y-3 text-lg">
          <li>• Structure Only: R1,200 – R1,800 per m²</li>
          <li>• Turnkey Build: R2,500 – R4,500 per m²</li>
        </ul>
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
