'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import WarehouseCatalogue from 'components/warehouse-catalogue';

export default function WarehouseCostPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const city = 'Pretoria'; // Change this to dynamically set city name based on route or user location

  const size = '10x10';
  const width = 10;
  const length = 10;
  const area = width * length;

  const widths = [8, 10, 12];
  const lengths = [10, 12.5, 15, 17.5, 20, 22.5, 25, 27.5, 30, 32.5, 35, 37.5, 40, 50];

  const [selectedWidth, setSelectedWidth] = useState(10);
  const [selectedLength, setSelectedLength] = useState(10);

  const faqs = [
    {
      q: `How much does a ${size} warehouse cost?`,
      a: `A ${area}m² steel warehouse typically costs between R900,000 and R1.8 million depending on finishes and scope.`,
    },
    {
      q: `What is the cost per m² for a warehouse?`,
      a: `Steel warehouse costs range from R1,200 to R3,500 per m² depending on whether it is structure-only or turnkey.`,
    },
    {
      q: `How long does it take to build a ${size} warehouse?`,
      a: `Most steel warehouses can be completed within 4–8 weeks depending on complexity.`,
    },
    {
      q: `Is steel cheaper than brick construction?`,
      a: `Yes, steel is typically faster and more cost-effective due to reduced labour and build time.`,
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
               The easiest way to build a steel warehouse in South Africa.
             </h2>
           </div>
         </div>
     
         {/* Main Headline */}
         <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-black leading-tight">
            How Much Does a {size} Warehouse Cost in 2026?
         </h1>
     
         {/* Supporting Subheading */}
         <p className="text-base sm:text-lg md:text-xl mb-8 text-black max-w-2xl mx-auto">
            Get a clear cost breakdown for a {area}m² steel warehouse, including structure-only, cladding, and turnkey options.
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
      <section className="py-16 px-6 text-center">
        <h2 className="text-3xl font-semibold mb-6">
          {size} Warehouse Pricing Explained
        </h2>
        <p className="max-w-3xl mx-auto text-lg">
          A {area}m² steel warehouse is one of the most popular sizes for logistics, storage, and light industrial use.
          Lightweight steel offers faster construction and lower costs compared to traditional methods.
        </p>
      </section>

{/* PRICING / INVESTMENT SECTION */}
<section className="w-[95%] mx-auto mt-24">
  <div className="rounded-3xl  p-8 md:p-12">

    {/* Header */}
    <div className="text-center mb-12">
      <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
        {size} Warehouse Cost Guide
      </h2>
      <p className="text-gray-600 text-lg max-w-2xl mx-auto">
        Transparent pricing for {size} steel warehouses in South Africa. Based on real project data and current material costs.
      </p>
    </div>

    {(() => {
      const [width, length] = size.split('x').map(Number);
      const area = width * length;

      // Pricing per m²
      const structureLow = 1050;
      const structureHigh = 1300;

      const cladLow = 1350;
      const cladHigh = 1500;

      const turnkeyLow = 1650;
      const turnkeyHigh = 2700;

      const format = (num) => "R" + num.toLocaleString("en-ZA");

      return (
        <div className="grid md:grid-cols-3 gap-8">

          {/* Structure Only */}
          <div className="bg-white border rounded-2xl p-8 flex flex-col">
            <div className="uppercase text-sm tracking-widest text-gray-500 mb-2">
              Structure Only
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {format(area * structureLow)} – {format(area * structureHigh)}
            </div>
            <div className="text-gray-500 mb-6">
              {area} m² • Steel frame only
            </div>

            <ul className="space-y-3 text-sm flex-grow">
              <li className="flex items-start gap-2">✓ Steel columns + trusses</li>
              <li className="flex items-start gap-2">✓ Roof structure</li>
              <li className="flex items-start gap-2">✓ Ready for cladding & finishes</li>
            </ul>

            <a href="/lightweight-steel-warehouses" className="mt-8 block text-center bg-black text-white py-3 rounded-full font-semibold hover:bg-[#da1a33] transition">
              Get Exact Price
            </a>
          </div>

          {/* With Cladding (Most Popular) */}
          <div className="bg-white border-2 border-[#da1a33] rounded-2xl p-8 flex flex-col relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#da1a33] text-white text-xs font-bold px-6 py-1 rounded-full">
              MOST POPULAR
            </div>

            <div className="uppercase text-sm tracking-widest text-gray-500 mb-2">
              With Cladding
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {format(area * cladLow)} – {format(area * cladHigh)}
            </div>
            <div className="text-gray-500 mb-6">
              {area} m² • Fully enclosed shell
            </div>

            <ul className="space-y-3 text-sm flex-grow">
              <li className="flex items-start gap-2">✓ Steel structure + IBR / Chromadek</li>
              <li className="flex items-start gap-2">✓ Wall & roof sheeting installed</li>
              <li className="flex items-start gap-2">✓ Weatherproof building shell</li>
              <li className="flex items-start gap-2">✓ Ideal for most businesses</li>
            </ul>

            <a href="/lightweight-steel-warehouses" className="mt-8 block text-center bg-[#da1a33] text-white py-3 rounded-full font-semibold hover:bg-black transition">
              Get Your Exact Quote
            </a>
          </div>

          {/* Turnkey */}
          <div className="bg-white border rounded-2xl p-8 flex flex-col">
            <div className="uppercase text-sm tracking-widest text-gray-500 mb-2">
              Turnkey Build
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {format(area * turnkeyLow)} – {format(area * turnkeyHigh)}+
            </div>
            <div className="text-gray-500 mb-6">
              {area} m² • Complete project
            </div>

            <ul className="space-y-3 text-sm flex-grow">
              <li className="flex items-start gap-2">✓ Full design + engineering</li>
              <li className="flex items-start gap-2">✓ Foundations & construction</li>
              <li className="flex items-start gap-2">✓ Cladding, finishes & handover</li>
              <li className="flex items-start gap-2">✓ Ready-to-use facility</li>
            </ul>

            <a href="/lightweight-steel-warehouses" className="mt-8 block text-center bg-black text-white py-3 rounded-full font-semibold hover:bg-[#da1a33] transition">
              Start Your Project
            </a>
          </div>

        </div>
      );
    })()}

    {/* Disclaimer */}
    <div className="mt-12 text-center text-sm text-gray-500 max-w-md mx-auto">
      Prices are indicative and exclude site preparation, foundations, transport, and VAT.
      Final cost depends on your location, soil conditions, and specifications.
      <span className="text-black font-medium"> We provide accurate quotes after a quick assessment.</span>
    </div>

  </div>
</section>
    

      {/* SIZE MATRIX */}
      <section className="bg-gray-100 py-20 px-6">
        <h2 className="text-3xl font-bold mb-6">
          Compare Other Warehouse Sizes
        </h2>

        <div className="flex gap-4 mb-10">
          {widths.map((w) => (
            <button
              key={w}
              onClick={() => setSelectedWidth(w)}
              className={`px-6 py-3 rounded-full ${
                selectedWidth === w ? 'bg-black text-white' : 'bg-white border'
              }`}
            >
              {w}m
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          {lengths.map((l, i) => (
            <div key={i} className="bg-white p-4 rounded shadow">
              <p>{selectedWidth} × {l}</p>
              <p className="text-sm text-gray-500">{selectedWidth * l} m²</p>
              <Link href={`/warehouse-cost/${selectedWidth}x${l}`} className="underline text-sm">
                View Cost →
              </Link>
            </div>
          ))}
        </div>
      </section>



  <WarehouseCatalogue />

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
      <section className="bg-black text-white text-center py-20">
        <h2 className="text-3xl font-bold mb-4">
          Get Your {size} Warehouse Price
        </h2>
        <Link href="/lightweight-steel-warehouses" className="bg-white text-black px-6 py-3 rounded-full font-semibold">
          Start Estimate
        </Link>
      </section>

      

    </main>
  );
}