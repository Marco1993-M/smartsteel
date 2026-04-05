'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function JohannesburgPage() {
  const widths = [8, 10, 12];
  const lengths = [10, 12.5, 15, 17.5, 20, 22.5, 25, 30, 35, 40, 50];

  const sizes = [];
  widths.forEach(w => {
    lengths.forEach(l => {
      sizes.push(`${w}m x ${l}m warehouse Johannesburg`);
    });
  });

  return (
    <main className="font-sans text-gray-800">

      {/* HERO */}
      <section className="relative h-[90vh] flex items-center justify-center text-center text-white">
        <Image
          src="/images/hero.jpg"
          alt="Smart Steel lightweight warehouse"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/0"></div>

        <div className="relative z-10 max-w-4xl px-6">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Steel Buildings Johannesburg
          </h1>
          <p className="text-lg md:text-xl mb-8">
            Premium lightweight steel warehouses, factories, and commercial buildings in Johannesburg.
          </p>

          <Link href="/tools/estimator" className="bg-[#da1a33] px-8 py-4 rounded-full font-semibold text-lg">
            Get Instant Estimate
          </Link>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="py-10 px-6 bg-gray-100 text-center">
        <p className="text-lg font-semibold">Trusted across Gauteng for fast, cost-effective steel construction</p>
      </section>

      {/* INTRO */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">Steel Structures in Johannesburg</h2>
        <p className="text-lg mb-4">
          Smart Steel delivers turnkey lightweight steel construction solutions across Johannesburg and Gauteng.
        </p>
        <p className="text-lg">
          Our buildings are engineered for speed, durability, and cost efficiency — ideal for warehouses, factories, and commercial spaces.
        </p>
      </section>

      {/* FEATURES */}
      <section className="bg-gray-100 py-20 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 text-center">
          <div>
            <h3 className="font-bold text-xl mb-2">Fast Build</h3>
            <p>Up to 50% faster than traditional construction.</p>
          </div>
          <div>
            <h3 className="font-bold text-xl mb-2">Cost Efficient</h3>
            <p>Lower overall project costs with precision engineering.</p>
          </div>
          <div>
            <h3 className="font-bold text-xl mb-2">Engineered Strength</h3>
            <p>Designed to meet South African standards.</p>
          </div>
        </div>
      </section>

      {/* SIZE MATRIX */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Steel Warehouse Sizes Johannesburg</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {sizes.map((size, i) => (
              <div key={i} className="bg-white p-4 rounded shadow text-sm border">
                {size}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT IS INCLUDED */}
      <section className="bg-gray-100 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">What’s Included</h2>
          <ul className="space-y-3 text-lg">
            <li>• Structural steel frame</li>
            <li>• Roof trusses and purlins</li>
            <li>• Wall framing</li>
            <li>• Engineering and design</li>
            <li>• Installation team</li>
          </ul>
        </div>
      </section>

      {/* PRICING */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">Steel Building Cost Johannesburg</h2>
        <ul className="space-y-3 text-lg">
          <li>• Structure Only: R1,200 – R1,800 per m²</li>
          <li>• Turnkey Build: R2,500 – R4,500 per m²</li>
        </ul>
      </section>

      {/* COMPARISON */}
      <section className="bg-gray-100 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Steel vs Traditional Construction</h2>
          <div className="grid md:grid-cols-2 gap-6 text-lg">
            <div>• Faster build times</div>
            <div>• Lower labour costs</div>
            <div>• Cleaner sites</div>
            <div>• Less material waste</div>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">Our Process</h2>
        <div className="space-y-4 text-lg">
          <p><strong>1. Design</strong> – Custom layouts</p>
          <p><strong>2. Engineering</strong> – Compliance & calculations</p>
          <p><strong>3. Manufacturing</strong> – Precision fabrication</p>
          <p><strong>4. Installation</strong> – Fast on-site build</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gray-100 py-20 px-6 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">FAQs</h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold">How long does it take?</h3>
            <p>Manufacturing typically takes 2 weeks.</p>
          </div>
          <div>
            <h3 className="font-semibold">Do you handle installation?</h3>
            <p>Yes, full turnkey service available.</p>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-black text-white text-center py-20 px-6">
        <h2 className="text-3xl font-bold mb-4">Get a Steel Building Quote in Johannesburg</h2>
        <div className="flex justify-center gap-4">
          <Link href="/tools/estimator" className="bg-white text-black px-6 py-3 rounded-full font-semibold">
            Start Estimate
          </Link>
          <a href="tel:+27828464555" className="border border-white px-6 py-3 rounded-full">
            Call Us
          </a>
        </div>
      </section>

    </main>
  );
}
