'use client';

import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';

const blogSchema = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Lightweight Steel Framing Solutions",
  description:
    "Smart Steel offers durable, eco-friendly, and cost-effective lightweight steel framing (LSF) solutions for warehouses, sheds, and modern buildings.",
  image: "https://smartsteel.co.za/og-lightweight-steel-framing.jpg",
  author: {
    "@type": "Organization",
    name: "Smart Steel",
  },
  publisher: {
    "@type": "Organization",
    name: "Smart Steel",
    logo: {
      "@type": "ImageObject",
      url: "https://smartsteel.co.za/logo-512x512.png",
    },
  },
  datePublished: "2025-07-24",
  dateModified: "2025-07-24",
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": "https://smartsteel.co.za/lightweight-steel-framing",
  },
};

export default function LightweightSteelFramingClient() {
  return (
    <main className="font-sans text-gray-800">
      {/* JSON-LD for BlogPosting */}
      <Script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />

      {/* Hero Section */}
      <section className="bg-white text-black py-32 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Lightweight Steel Framing Solutions
        </h1>
        <p className="text-lg md:text-xl max-w-3xl mx-auto">
          Discover our durable, cost-effective, and sustainable lightweight steel framing (LSF) solutions for warehouses, sheds, and buildings. Build faster with earthquake-resistant, energy-efficient steel structures.
        </p>
      </section>

      {/* Why Choose Lightweight Steel Structures */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-left">
            Why Choose Lightweight Steel Structures?
          </h2>
          <p className="text-lg text-left text-gray-700">
            Lightweight Steel Framing (LSF), also known as Light Gauge Steel Framing (LGSF), is revolutionizing sustainable construction.
            It’s ideal for warehouses, sheds, and both residential and commercial buildings, offering unmatched speed, cost-efficiency, and durability.
          </p>
        </div>

        {/* Feature Icons Grid */}
        <div className="max-w-6xl mx-auto mt-12 grid md:grid-cols-2 gap-10">
          {[
            {
              title: 'High Strength-to-Weight Ratio',
              text: 'Robust yet lightweight structures reduce load on foundations and improve structural performance.',
              icon: '/icon/strength.png',
            },
            {
              title: 'Earthquake Resistance',
              text: 'LSF performs excellently in seismic zones thanks to its flexible and low-weight properties.',
              icon: '/icon/earthquake.png',
            },
            {
              title: 'Fire Resistance',
              text: 'Non-combustible steel framing enhances safety and meets high fire rating standards.',
              icon: '/icon/fire.png',
            },
            {
              title: 'Fast Construction',
              text: 'Prefabricated steel components enable builds 50–60% faster than traditional methods.',
              icon: '/icon/speed.png',
            },
            {
              title: 'Sustainability',
              text: 'Steel is 100% recyclable and supports eco-conscious building practices with reduced site waste.',
              icon: '/icon/sustainability.png',
            },
          ].map((item, index) => (
            <div key={index} className="flex items-start gap-4 bg-white p-6 rounded-lg shadow-md">
              <Image
                src={item.icon}
                alt={item.title}
                width={40}
                height={40}
                className="flex-shrink-0"
              />
              <div>
                <h4 className="text-xl font-semibold mb-2">{item.title}</h4>
                <p className="text-gray-600 text-sm">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Applications */}
      <section className="py-20 px-6 bg-white text-center">
        <h2 className="text-3xl font-semibold mb-6">Applications of Lightweight Steel Framing</h2>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 text-left">
          <div>
            <h3 className="text-xl font-bold">Lightweight Steel Warehouses</h3>
            <p>Ideal for industrial storage with large clear spans and modular design.</p>
          </div>
          <div>
            <h3 className="text-xl font-bold">Lightweight Steel Sheds</h3>
            <p>Quick-to-assemble, durable, and low-maintenance storage solutions.</p>
          </div>
          <div>
            <h3 className="text-xl font-bold">Residential Buildings</h3>
            <p>Energy-efficient homes and apartments made with LGSF systems.</p>
          </div>
          <div>
            <h3 className="text-xl font-bold">Commercial Buildings</h3>
            <p>Offices, modular buildings, and retail spaces built with structural integrity.</p>
          </div>
        </div>
      </section>

      {/* Our Services */}
      <section className="py-20 px-6 bg-white text-center">
        <h2 className="text-3xl font-semibold mb-6">Our Lightweight Steel Framing Services</h2>
        <p className="max-w-3xl mx-auto mb-8">
          We specialize in steel frame construction using advanced prefabrication and BIM technology. From design to installation, we deliver custom steel framing solutions with structural integrity and precision.
        </p>
        <Link
          href="/recent"
          className="inline-block bg-[#da1a33] text-white px-6 py-3 rounded-full hover:bg-[#bf172d] transition"
        >
          View Recent Projects
        </Link>
      </section>

      {/* Benefits of LSF */}
      <section className="py-20 px-6 bg-gray-100 text-center">
        <h2 className="text-3xl font-semibold mb-12">Benefits of LSF for Your Project</h2>
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-left">
          {[
            {
              title: 'Reduced Foundation Costs',
              text: 'LSF systems are lighter than traditional materials, lowering foundation and transport costs.',
              image: '/images/benefit-foundation.jpg',
            },
            {
              title: 'Precision Manufacturing',
              text: 'Components are factory-made to spec, reducing onsite waste and speeding up assembly.',
              image: '/images/benefit-precision.jpg',
            },
            {
              title: 'Low Maintenance',
              text: 'Galvanized steel resists rot, pests, and corrosion — lowering maintenance over time.',
              image: '/images/benefit-maintenance.jpg',
            },
            {
              title: 'Thermal & Sound Insulation',
              text: 'Engineered to support high-performing insulation systems for comfort and efficiency.',
              image: '/images/benefit-insulation.jpg',
            },
          ].map((item, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-4 text-center">
              <Image
                src={item.image}
                alt={item.title}
                width={300}
                height={200}
                className="w-full h-40 object-cover rounded mb-4"
              />
              <h4 className="text-lg font-semibold mb-2">{item.title}</h4>
              <p className="text-sm text-gray-600">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Work With Us */}
      <section className="py-20 px-6 bg-gray-50 text-center">
        <h2 className="text-3xl font-semibold mb-6">Why Work With Us?</h2>
        <p className="max-w-3xl mx-auto mb-8">
          With a commitment to high-quality builds, reliable supply chains, and sustainable construction practices, our team is trusted across South Africa. Certified, experienced, and client-focused.
        </p>
        <Link
          href="/about"
          className="inline-block bg-gray-800 text-white px-6 py-3 rounded-full hover:bg-gray-700 transition"
        >
          Learn More About Us
        </Link>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-6 bg-white text-center" id="contact">
        <h2 className="text-3xl font-semibold mb-4">
          Contact Us for Your Lightweight Steel Project
        </h2>
        <p className="mb-6">
          Ready to build your warehouse, shed, or building with steel? Request a quote today.
        </p>
        <a
          href="mailto:info@smartsteel.co.za"
          className="bg-[#da1a33] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#bf172d] transition"
        >
          Request a Quote
        </a>
      </section>
    </main>
  );
}
