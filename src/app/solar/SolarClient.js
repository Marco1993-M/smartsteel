'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import Script from 'next/script';

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Solar-Ready Steel Structures & Mounting Solutions",
  description:
    "Lightweight, corrosion-resistant steel structures engineered for solar: carports, ground mounts, and roof frames.",
  provider: {
    "@type": "Organization",
    name: "Smart Steel",
    url: "https://smartsteel.co.za",
    logo: "https://smartsteel.co.za/logo-512x512.png"
  },
  areaServed: {
    "@type": "Country",
    name: "South Africa"
  },
  serviceType: "Solar mounting structures, steel solar carports, roof & ground mount frames",
  url: "https://smartsteel.co.za/solar",
  offers: {
    "@type": "Offer",
    price: "0.00",            // custom quotes
    priceCurrency: "ZAR",
    availability: "https://schema.org/InStock",
    url: "https://smartsteel.co.za/solar"
  },
  image: [
    "https://smartsteel.co.za/solar-hero.jpg",
    "https://smartsteel.co.za/og-solar.jpg"
  ]
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Do you design and supply complete solar mounting structures?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. We engineer, design, and supply lightweight steel mounting structures for solar carports, roof frames, and ground mounts."
      }
    },
    {
      "@type": "Question",
      name: "Can your carports be EV‑charger ready?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Absolutely. Our solar carports can be specified with EV‑ready conduit routing and structural allowances."
      }
    },
    {
      "@type": "Question",
      name: "What are typical lead times?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Lead times depend on project size and complexity, but most standard frames can be fabricated within a few weeks after approval."
      }
    },
    {
      "@type": "Question",
      name: "Do you handle installation?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We can supply installation or work with your preferred installer. We’ll provide full drawings and support."
      }
    }
  ]
};

export default function SolarClient() {
  return (
    <main className="font-sans text-gray-800">
      {/* JSON-LD */}
      <Script
        id="ld-service-solar"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <Script
        id="ld-faq-solar"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Hero Section */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12 items-center">
          <div className="md:col-span-2">
          <h1 className="text-3xl font-bold mb-4 text-left">Solar-Ready Steel Solutions</h1>
            <h2 className="text-xl font-medium text-gray-700 text-left">
              Engineered for strength, precision, and seamless solar integration — Smart Steel is the foundation for energy efficient structures.
            </h2>
          </div>
          <div className="md:col-span-1">
            <Image
              src="/solar-hero.jpg"
              alt="Solar-ready steel structure"
              width={500}
              height={400}
              className="w-full h-auto object-cover rounded-lg shadow"
            />
          </div>
        </div>
      </section>

      {/* Market Tabs Section */}
      <section className="bg-gray-50 py-20 px-6 text-center">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Tailored for Every Sector</h2>
          <p className="text-lg text-gray-700 mb-8">
            Our solar ready steel structures serve diverse industries with strength and simplicity — see what is possible in your space.
          </p>
        </div>

        <div className="max-w-6xl mx-auto mt-10 grid md:grid-cols-4 gap-8 text-left">
          {[
            { title: 'Residential', icon: '/icon/home.png', desc: 'Pergolas, solar roofs, energy-positive homes' },
            { title: 'Commercial', icon: '/icon/office.png', desc: 'EV-ready carports, solar canopies, mall parking' },
            { title: 'Agricultural', icon: '/icon/farm.png', desc: 'Irrigation systems, barn roofs, remote generation' },
            { title: 'Industrial', icon: '/icon/factory.png', desc: 'Large-scale solar ground mounts, factory roofs' },
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-6 rounded-lg shadow text-center">
              <Image src={item.icon} alt={item.title} width={40} height={40} className="mx-auto mb-4" />
              <h4 className="text-lg font-semibold mb-2">{item.title}</h4>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Applications */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-left">Smart Applications</h2>
          <p className="text-lg text-left text-gray-700 mb-8">
            Our lightweight steel solutions provide the ideal framework for solar installations, precision fabricated for modern requirements.
          </p>
        </div>

        <div className="max-w-6xl mx-auto mt-12 grid md:grid-cols-3 gap-10">
          {[
            {
              title: 'Solar Carports',
              text: 'Shelter vehicles while generating clean energy. EV charger-ready options available.',
              icon: '/icon/carport.png',
            },
            {
              title: 'Ground Mount Systems',
              text: 'Modular solar mounts for farms and industry. Built for speed and strength.',
              icon: '/icon/groundmount.png',
            },
            {
              title: 'Solar Roof Frames',
              text: 'Install-ready steel frames ideal for integrated solar roofing in homes or businesses.',
              icon: '/icon/roof.png',
            },
          ].map((item, index) => (
            <div key={index} className="flex items-start gap-4 bg-gray-50 p-6 rounded-lg shadow-md">
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

      {/* Benefits */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-left">Why Choose Smart Steel?</h2>
          <ul className="list-disc list-inside text-lg text-gray-700 space-y-4">
            <li>Corrosion-resistant steel, ideal for long-term outdoor exposure</li>
            <li>Quick assembly, accurate fit, minimal on-site waste</li>
            <li>Supports solar loads with precision and safety</li>
            <li>Fireproof, termite resistant, South Africa-ready</li>
            <li>Fully recyclable — built for sustainability goals</li>
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-left">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">
                Do you design and supply complete solar mounting structures?
              </h3>
              <p className="text-gray-700">
                Yes. We engineer, design, and supply lightweight steel structures for solar carports, roof frames, and ground mounts.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">
                Can your carports be EV‑charger ready?
              </h3>
              <p className="text-gray-700">
                Absolutely. We can integrate EV‑ready conduit and allowances in the design.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">
                What are typical lead times?
              </h3>
              <p className="text-gray-700">
                Lead times vary by scale, but most standard frames can be fabricated within a few weeks after sign‑off.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">
                Do you handle installation?
              </h3>
              <p className="text-gray-700">
                Yes, we can install or support your installer with full drawings and guidance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Follow Us */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-5xl mx-auto text-left">
          <h2 className="text-3xl font-bold mb-4">Follow Our Work</h2>
          <p className="text-lg mb-8">
            See how steel + solar is shaping South Africa and the energy future. Follow us for builds, tips and updates.
          </p>
          <div className="flex space-x-6 text-2xl">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#da1a33] transition">
              <FaFacebookF />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#da1a33] transition">
              <FaInstagram />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#da1a33] transition">
              <FaLinkedinIn />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
