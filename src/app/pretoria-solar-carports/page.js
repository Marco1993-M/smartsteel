'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import WarehouseCatalogue from 'components/warehouse-catalogue';

export default function SolarCarportPage({ city = 'Pretoria' }) {
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // Carport sizes (width × length)
  const widths = [3, 5, 7.5, 10]; // typical carport widths in meters
  const lengths = [6, 12]; // typical lengths
  const [selectedWidth, setSelectedWidth] = useState(3);

  // FAQs
  const faqs = [
    { q: `How long does it take to install a solar carport in ${city}?`, a: `Installation typically takes 1–3 days depending on size and complexity. Manufacturing of the steel frame and panels may take 2–3 weeks.` },
    { q: `Can the solar carport feed electricity back to the grid in ${city}?`, a: `Yes, all our solar carports are compatible with South African grid-tied systems, subject to local municipality approval.` },
    { q: `What is the lifespan of the solar panels and frame?`, a: `Panels typically last 25–30 years, while galvanized steel frames are durable and require minimal maintenance for decades.` },
    { q: `Do you offer turnkey installation in ${city}?`, a: `Yes, we provide full design, manufacturing, panel installation, and electrical setup to deliver a complete solar carport solution.` },
    { q: `Can I expand the carport later?`, a: `Yes, our modular system allows for easy expansion with additional bays or panels.` },
    { q: `Do you install outside ${city}?`, a: `Yes, while we service ${city}, we also deliver and install solar carports across South Africa.` },
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a }
    })),
  };

  return (
    <main className="font-sans text-gray-800">

      {/* SEO Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* HERO */}
      <section className="relative w-full h-[85vh] md:h-[100vh] flex items-start justify-center text-center text-white px-6 overflow-hidden">
        <Image src="/images/solar-carport.webp" alt={`Solar carports in ${city}`} fill priority quality={85} sizes="100vw" className="object-cover object-center" />
        <div className="absolute inset-0 bg-black/0"></div>
        <div className="relative z-10 flex flex-col items-center w-full max-w-4xl mx-auto mt-24 md:mt-32">
          <div className="w-full max-w-[90vw] sm:max-w-md md:max-w-xl lg:max-w-3xl mb-6 border border-black bg-transparent rounded-full">
            <div className="px-4 sm:px-6 py-1 sm:py-1.5 rounded-full flex items-center justify-center">
              <h2 className="text-xs sm:text-sm md:text-base font-semibold text-center leading-snug text-black">
                Smart Solar Carports Designed & Installed in {city}
              </h2>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-black leading-tight">
            {city}'s #1 Solar Carport Supplier
          </h1>
          <p className="text-base sm:text-lg md:text-xl mb-8 text-black max-w-2xl mx-auto">
            Protect vehicles, save energy, and generate power with our premium solar carports.
          </p>
         <div className="flex items-center gap-4 flex-wrap justify-center">
  
  <a
    href="https://wa.me/27828464555?text=Hi%20Smart%20Steel%2C%20I%E2%80%99d%20like%20a%20quote%20for%20a%20solar%20carport%20in%20${city}"
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center justify-center gap-2 bg-[#da1a33] text-white px-6 py-3 rounded-full font-semibold hover:bg-white border border-black hover:text-black transition transform hover:scale-105"
  >
    Get a Fast Quote
  </a>

  <Link
    href="#pricing"
    className="inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold border border-black text-black hover:bg-black hover:text-white transition"
  >
    View Prices
  </Link>

</div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="py-16 px-6 bg-white text-center">
        <h2 className="text-3xl font-semibold mb-6">Why Choose a Solar Carport?</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-gray-100 p-6 rounded-xl shadow">
            <h3 className="font-semibold mb-2">Dual Purpose</h3>
            <p>Protect vehicles from sun and rain while generating electricity for your home or business.</p>
          </div>
          <div className="bg-gray-100 p-6 rounded-xl shadow">
            <h3 className="font-semibold mb-2">High Efficiency</h3>
            <p>Premium PV panels integrated into durable galvanized steel frames for maximum performance.</p>
          </div>
          <div className="bg-gray-100 p-6 rounded-xl shadow">
            <h3 className="font-semibold mb-2">Modular & Expandable</h3>
            <p>Easy to expand with additional bays or panels, fully customizable for any site.</p>
          </div>
        </div>
      </section>

      {/* TECHNICAL SPECS */}
      <section className="py-16 px-6 bg-gray-50 text-center">
        <h2 className="text-3xl font-bold mb-6">Technical Specs</h2>
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6 text-left text-gray-700">
          <ul className="space-y-2">
            <li>✔ Galvanized Steel Frame – Durable & Corrosion Resistant</li>
            <li>✔ High Efficiency PV Panels (Monocrystalline / Polycrystalline)</li>
            <li>✔ Modular Layouts: 1–6 bays, Customizable Widths & Lengths</li>
          </ul>
          <ul className="space-y-2">
            <li>✔ Optional EV Charger & LED Lighting</li>
            <li>✔ Grid-Tied or Off-Grid System Options</li>
            <li>✔ SANS & ISO Compliance – Engineered for South African Conditions</li>
          </ul>
        </div>
      </section>

      {/* GALLERY */}
      <section className="py-16 px-6 bg-white text-center">
        <h2 className="text-3xl font-bold mb-6">Gallery</h2>
        <div className="grid md:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {['/images/solar-carport-1.webp','/images/solar-carport-2.webp','/images/solar-carport-3.webp'].map((img, i) => (
            <div key={i} className="overflow-hidden rounded shadow hover:scale-105 transition transform">
              <Image src={img} alt={`Solar Carport ${i+1}`} width={500} height={300} className="object-cover w-full h-60" />
            </div>
          ))}
        </div>
      </section>

      {/* SAVINGS / ROI */}
      <section className="py-16 px-6 bg-gray-50 text-center">
        <h2 className="text-3xl font-bold mb-6">Energy Savings & ROI</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-xl font-bold">Average Energy Output</p>
            <p className="mt-2 text-gray-600">≈ 1,200 kWh/year per 3m × 6m carport</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-xl font-bold">Electricity Savings</p>
            <p className="mt-2 text-gray-600">≈ 30% reduction in energy bills annually</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-xl font-bold">CO₂ Reduction</p>
            <p className="mt-2 text-gray-600">≈ 1,200 kg CO₂/year saved</p>
          </div>
        </div>
      </section>


      {/* WHY CHOOSE SMART STEEL */}
      <section className="py-16 px-6 bg-gray-50 text-center">
        <h2 className="text-3xl font-bold mb-6">Why Choose Smart Steel?</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow">✔ Turnkey Installation & Design</div>
          <div className="bg-white p-6 rounded-xl shadow">✔ Fast & Reliable Delivery Nationwide</div>
          <div className="bg-white p-6 rounded-xl shadow">✔ Quality Materials & Warranties</div>
        </div>
      </section>

      {/* CERTIFICATIONS */}
      <section className="py-16 px-6 bg-white text-center">
        <h2 className="text-3xl font-bold mb-6">Certifications & Partnerships</h2>
        <div className="flex justify-center gap-6 flex-wrap">
          <Image src="/images/sans-logo.webp" alt="SANS Certified" width={120} height={60} />
          <Image src="/images/iso-logo.webp" alt="ISO Certified" width={120} height={60} />
          <Image src="/images/panel-brand-logo.webp" alt="Solar Panel Partner" width={120} height={60} />
        </div>
      </section>

      {/* SIZE MATRIX */}
      <section className="bg-gray-100 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">
            Solar Carport Sizes {city}
          </h2>

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

          <div className="grid md:grid-cols-4 gap-4">
            {lengths.map((l, i) => (
              <div key={i} className="bg-white p-4 rounded shadow hover:shadow-lg transition">
                <p className="font-semibold text-lg">
                  {selectedWidth}m × {l}m
                </p>
                <p className="text-sm text-gray-500">
                  {selectedWidth * l} m² Covered
                </p>
                <Link href="/tools/estimator" className="inline-block mt-3 text-sm underline">
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
          Solar Carport Cost {city}
        </h2>

        <p className="text-lg mb-10 max-w-3xl">
          Costs depend on size, panel quantity, and design complexity. Our turnkey solutions include steel frame, PV panels, electrical setup, and installation.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-xl font-semibold mb-2">Frame Only</h3>
            <p className="text-2xl font-bold mb-4">R120k – R180k</p>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>✔ Galvanized Steel Frame</li>
              <li>✔ Roof Structure</li>
              <li>✔ Bracing & Supports</li>
            </ul>
          </div>

          <div className="bg-black text-white p-6 rounded-xl shadow">
            <h3 className="text-xl font-semibold mb-2">Turnkey Solar Carport</h3>
            <p className="text-2xl font-bold mb-4">R250k – R450k</p>
            <ul className="text-sm space-y-2">
              <li>✔ Full Steel Frame & Roof</li>
              <li>✔ Solar Panels & Wiring</li>
              <li>✔ Electrical Installation</li>
              <li>✔ Complete Handover</li>
            </ul>
          </div>
        </div>

        {/* Example Carports */}
        <div className="bg-gray-100 p-6 rounded-xl mb-10">
          <h3 className="text-xl font-semibold mb-4">Example Solar Carport Prices in {city}</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white p-4 rounded">
              <p className="font-semibold">3m × 6m Carport</p>
              <p className="text-gray-600">18 m² Covered</p>
              <p className="mt-2 font-medium">≈ R120k – R180k</p>
            </div>

            <div className="bg-white p-4 rounded">
              <p className="font-semibold">4m × 12m Carport</p>
              <p className="text-gray-600">48 m² Covered</p>
              <p className="mt-2 font-medium">≈ R180k – R300k</p>
            </div>

            <div className="bg-white p-4 rounded">
              <p className="font-semibold">6m × 18m Carport</p>
              <p className="text-gray-600">108 m² Covered</p>
              <p className="mt-2 font-medium">≈ R350k – R450k</p>
            </div>
          </div>
        </div>

        {/* VALUE DRIVERS */}
        <div className="mb-10">
          <h3 className="text-xl font-semibold mb-4">What Affects Solar Carport Cost?</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>• Size of carport (larger = lower cost per m²)</div>
            <div>• Number of solar panels</div>
            <div>• Frame complexity & design</div>
            <div>• Electrical integration & inverter type</div>
            <div>• Foundations & site conditions</div>
            <div>• Delivery & installation distance</div>
          </div>
        </div>

        <div className="text-center">
          <Link href="/tools/estimator" className="bg-[#da1a33] text-white px-8 py-4 rounded-full font-semibold inline-block">
            Get Instant Solar Carport Price →
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gray-100 py-20 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-10">FAQs</h2>
        <div className="space-y-4">
                    {faqs.map(({ q, a }, index) => (
            <div key={index} className="border-b border-gray-300 pb-4">
              <button
                onClick={() =>
                  setOpenFaqIndex(openFaqIndex === index ? null : index)
                }
                className="w-full text-left flex justify-between items-center text-lg font-medium text-gray-800 focus:outline-none"
              >
                {q}
                <span className="ml-2 text-gray-500">
                  {openFaqIndex === index ? '−' : '+'}
                </span>
              </button>
              {openFaqIndex === index && (
                <p className="mt-2 text-gray-700 text-sm">{a}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA BOTTOM */}
      <section className="py-16 px-6 text-center bg-white">
        <h2 className="text-3xl font-bold mb-6">Ready to Get Your Solar Carport in {city}?</h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto">
          Request your instant estimate or chat with our team on WhatsApp. Start saving energy and protecting your vehicles today.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <a
            href="https://wa.me/27828464555?text=Hi%20Smart%20Steel%2C%20I%E2%80%99d%20like%20a%20quote%20for%20a%20solar%20carport%20project"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-green-500 border border-green-500 transition"
          >
            Chat on WhatsApp
          </a>
        </div>
      </section>
    </main>
  );
}