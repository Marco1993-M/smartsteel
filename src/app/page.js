'use client';
import { useState } from 'react';
import Link from 'next/link';

const brochures = {
  'Home Owner': [
    {
      title: 'Smart Steel Solutions Guide',
      desc: 'An overview of our lightweight steel kits, ideal for residential and commercial builds.',
      image: '/Brochure A.jpg',
      link: '/brochure.pdf',
    },
    {
      title: 'Smart Steel Sustainability Report',
      desc: 'A detailed look at our eco-friendly processes and recyclable materials.',
      image: '/Brochure B.jpg',
      link: '/sustainability.pdf',
    },
  ],
  'Architect / Specifier': [
    {
      title: 'Technical Specs & Compliance',
      desc: 'Detailed engineering specs, load calculations, and local compliance data.',
      image: '/Brochure A.jpg',
      link: '/Brochure B.pdf',
    },
    {
      title: 'Smart Steel Solutions Guide',
      desc: 'An overview of our lightweight steel kits, ideal for residential and commercial builds.',
      image: '/brochure-cover1.jpg',
      link: '/brochure.pdf',
    },
  ],
  'Builder / Installer': [
    {
      title: 'Installation Guide',
      desc: 'Step-by-step instructions to install Smart Steel frame kits on-site.',
      image: '/brochure-cover3.jpg',
      link: '/install-guide.pdf',
    },
    {
      title: 'Warranty Document',
      desc: '10-year structural warranty on all steel frames.',
      image: '/brochure-cover2.jpg',
      link: '/warranty.pdf',
    },
  ],
  Fabricator: [
    {
      title: 'Fabrication Standards Guide',
      desc: 'Guidelines and tolerances for fabrication.',
      image: '/brochure-cover1.jpg',
      link: '/fabrication.pdf',
    },
    {
      title: 'Smart Steel Solutions Guide',
      desc: 'An overview of our lightweight steel kits, ideal for residential and commercial builds.',
      image: '/brochure-cover4.jpg',
      link: '/brochure.pdf',
    },
  ],
};

export default function Home() {
  const [selectedRole, setSelectedRole] = useState('Home Owner');
  const [hoveredFeature, setHoveredFeature] = useState(null);

  const features = [
    {
      title: '100% termite proof',
      description: 'Smart Steel structures resist termite damage &mdash; eliminating the need for treatments and ongoing inspections.',
      image: '/A.jpg',
    },
    {
      title: 'Straight and true',
      description: 'Steel is precision manufactured to remain straight, helping walls, floors and roofs stay level and square.',
      image: '/B.jpg',
    },
    {
      title: 'Dimensionally accurate',
      description: 'Factory-cut to exact specifications, ensuring consistency and reducing on-site errors and waste.',
      image: '/C.jpg',
    },
    {
      title: 'Renowned durability',
      description: 'TRUECORE&reg; steel is made to last, with corrosion-resistant coatings for long-term performance.',
      image: '/durability.jpg',
    },
    {
      title: 'Won&apos;t catch fire',
      description: 'Steel is non-combustible, adding fire resistance to your home&apos;s framework.',
      image: '/fireproof.jpg',
    },
  ];

  return (
    <main className="font-sans text-gray-800">
      {/* Hero Section */}
      <section className="bg-white text-black py-40 px-6 text-center">
        <h5 className="text-lg md:text-xl font-thin mb-2">Metal Roofing Solutions</h5>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Custom, Affordable Steel Solutions for Every Project
        </h1>
        <p className="text-lg md:text-xl mb-6 max-w-2xl mx-auto">
          A structure that won&apos;t twist, warp, or shrink &mdash; ever. Our steel is fire-resistant, termite and borer proof,
          100% recyclable, and engineered for strength and longevity in any climate.
        </p>
        <a
          href="#contact"
          className="bg-[#da1a33] text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-200 transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#da1a33]"
        >
          Request a Quote
        </a>
      </section>

      {/* About Section */}
      <section className="py-16 px-6 bg-white text-center">
        <h2 className="text-3xl font-semibold mb-6">Steel structures designed to last</h2>
        <p className="max-w-3xl mx-auto text-lg">
          Durable metal roofing, trusses, spec houses made from galvanised light weight steel that won&apos;t twist, warp,
          or shrink &mdash; ever. Our steel is fire-resistant, termite and borer proof, 100% recyclable, and engineered for
          strength and longevity in any climate.
          Smart Steel is one of the leading designers and suppliers of lightweight steel construction solutions across
          South Africa. Our solutions are ideal for a wide range of applications, including custom steel workshops,
          affordable steel storage units, and lightweight steel warehouses.
        </p>
      </section>

      {/* Remaining Sections */}
      {/* (The rest of your file remains unchanged, apply the same fix if you use apostrophes or curly quotes) */}

      {/* Final CTA Section */}
      <section id="contact" className="bg-[#000000] text-white py-20 px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-semibold mb-4">Ready to build with steel?</h2>
        <p className="text-lg mb-6">Get in touch today and let&apos;s bring your vision to life.</p>
        <a
          href="mailto:info@smartsteel.co.za"
          className="bg-white text-gray-900 px-6 py-3 rounded-full font-semibold hover:bg-gray-200 transition"
        >
          Contact Us
        </a>
      </section>
    </main>
  );
}
