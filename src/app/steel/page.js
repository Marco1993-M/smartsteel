'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function LightweightSteelFramingPage() {
  return (
    <main className="font-sans text-gray-800">
      {/* Hero Section */}
      <section className="bg-white text-black py-32 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Lightweight Steel Framing Solutions</h1>
        <p className="text-lg md:text-xl max-w-3xl mx-auto">
          Discover our durable, cost-effective, and sustainable lightweight steel framing (LSF) solutions for warehouses, sheds, and buildings. Build faster with earthquake-resistant, energy-efficient steel structures.
        </p>
      </section>

      {/* Intro */}
      <section className="py-20 px-6 bg-gray-50 text-center">
        <h2 className="text-3xl font-semibold mb-6">Why Choose Lightweight Steel Structures?</h2>
        <div className="max-w-6xl mx-auto text-left space-y-6">
          <p>
            Lightweight Steel Framing (LSF), also known as Light Gauge Steel Framing (LGSF), is revolutionizing sustainable construction. It’s ideal for warehouses, sheds, and both residential and commercial buildings, offering unmatched speed, cost-efficiency, and durability.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>High Strength-to-Weight Ratio:</strong> Robust yet lightweight structures reduce load on foundations.</li>
            <li><strong>Earthquake Resistance:</strong> LSF performs excellently in seismic zones due to its flexible and lightweight properties.</li>
            <li><strong>Fire Resistance:</strong> Non-combustible steel ensures enhanced safety standards.</li>
            <li><strong>Fast Construction:</strong> Prefabricated components enable builds 50–60% faster than traditional methods.</li>
            <li><strong>Sustainability:</strong> Made from recyclable materials, steel framing supports eco-conscious construction.</li>
          </ul>
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

      {/* Benefits */}
      <section className="py-20 px-6 bg-gray-100 text-center">
        <h2 className="text-3xl font-semibold mb-6">Benefits of LSF for Your Project</h2>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 text-left">
          <div>
            <ul className="list-disc pl-5 space-y-2">
              <li>Reduced foundation costs due to lighter loads</li>
              <li>Precision manufacturing with minimal onsite waste</li>
              <li>Low maintenance over the building lifecycle</li>
              <li>Excellent thermal and sound insulation properties</li>
            </ul>
          </div>
          <div>
            <Image src="/lsf-benefits.jpg" alt="Lightweight Steel Framing Benefits" width={600} height={400} className="rounded-lg" />
          </div>
        </div>
      </section>

      {/* Our Services */}
      <section className="py-20 px-6 bg-white text-center">
        <h2 className="text-3xl font-semibold mb-6">Our Lightweight Steel Framing Services</h2>
        <p className="max-w-3xl mx-auto mb-8">
          We specialize in steel frame construction using advanced prefabrication and BIM technology. From design to installation, we deliver custom steel framing solutions with structural integrity and precision.
        </p>
        <Link href="/recent" className="inline-block bg-[#da1a33] text-white px-6 py-3 rounded-full hover:bg-[#bf172d] transition">
          View Recent Projects
        </Link>
      </section>

      {/* Why Work With Us */}
      <section className="py-20 px-6 bg-gray-50 text-center">
        <h2 className="text-3xl font-semibold mb-6">Why Work With Us?</h2>
        <p className="max-w-3xl mx-auto mb-8">
          With a commitment to high-quality builds, reliable supply chains, and sustainable construction practices, our team is trusted across South Africa. Certified, experienced, and client-focused.
        </p>
        <Link href="/about" className="inline-block bg-gray-800 text-white px-6 py-3 rounded-full hover:bg-gray-700 transition">
          Learn More About Us
        </Link>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-6 bg-white text-center" id="contact">
        <h2 className="text-3xl font-semibold mb-4">Contact Us for Your Lightweight Steel Project</h2>
        <p className="mb-6">Ready to build your warehouse, shed, or building with steel? Request a quote today.</p>
        <a href="mailto:info@smartsteel.co.za" className="bg-[#da1a33] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#bf172d] transition">
          Request a Quote
        </a>
      </section>
    </main>
  );
}
