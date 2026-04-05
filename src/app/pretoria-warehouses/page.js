'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function PretoriaPage() {
  const widths = [8, 10, 12];
  const lengths = [10, 12.5, 15, 17.5, 20, 22.5, 25, 30, 35, 40, 50];

  const sizes = [];
  widths.forEach(w => {
    lengths.forEach(l => {
      sizes.push(`${w}m x ${l}m warehouse Pretoria`);
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
           quality={85}
           sizes="100vw"
           className="object-cover object-center"
         />
        <div className="absolute inset-0 bg-black/0"></div>

        <div className="relative z-10 max-w-4xl px-6">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Steel Buildings Pretoria
          </h1>
          <p className="text-lg md:text-xl mb-8">
            Premium lightweight steel warehouses, factories, and commercial buildings in Pretoria. Faster to build, more cost-effective, and engineered for long-term performance.
          </p>

          <Link href="/tools/estimator" className="bg-[#da1a33] px-8 py-4 rounded-full font-semibold text-lg">
            Get Instant Estimate
          </Link>
        </div>
      </section>

      {/* INTRO */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">Steel Structures in Pretoria</h2>
        <p className="text-lg mb-4">
          Smart Steel delivers turnkey lightweight steel construction solutions across Pretoria and Gauteng. Our buildings are designed for speed, efficiency, and durability, making them ideal for commercial and industrial applications.
        </p>
        <p className="text-lg mb-4">
          From warehouses and factories to workshops and retail spaces, we provide a full-service solution including design, engineering, fabrication, and installation.
        </p>
        <p className="text-lg">
          Our systems are engineered using cold-formed steel, offering a modern alternative to traditional brick and hot-rolled steel construction.
        </p>
      </section>

      {/* SIZE MATRIX */}
      <section className="bg-gray-100 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Steel Warehouse Sizes Pretoria</h2>
          <p className="mb-10 text-lg">
            We manufacture and construct steel buildings in a wide range of sizes. Below are common warehouse configurations available in Pretoria.
          </p>

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
        <h2 className="text-3xl font-bold mb-6">Steel Building Cost Pretoria</h2>
        <p className="mb-4 text-lg">
          The cost of steel buildings in Pretoria depends on size, design complexity, and finishes.
        </p>

        <ul className="space-y-3 mb-6 text-lg">
          <li>• Structure Only: R1,200 – R1,800 per m²</li>
          <li>• Turnkey Build: R2,500 – R4,500 per m²</li>
        </ul>

        <p className="text-lg">
          Larger buildings benefit from economies of scale, reducing the cost per square meter.
        </p>
      </section>

      {/* USE CASES */}
      <section className="bg-gray-100 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Applications</h2>
          <div className="grid md:grid-cols-2 gap-6 text-lg">
            <div>• Steel warehouses Pretoria</div>
            <div>• Factory buildings Pretoria</div>
            <div>• Workshops Pretoria</div>
            <div>• Storage facilities Pretoria</div>
            <div>• Retail buildings Pretoria</div>
            <div>• Agricultural buildings Pretoria</div>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">Why Build with Lightweight Steel?</h2>
        <ul className="space-y-4 text-lg">
          <li>⚡ Up to 50% faster construction</li>
          <li>💰 Lower total project cost</li>
          <li>🏗️ Precision engineered components</li>
          <li>🔥 Fire-resistant structures</li>
          <li>🐜 Termite and pest proof</li>
          <li>🌱 Sustainable and recyclable materials</li>
        </ul>
      </section>

      {/* PROCESS */}
      <section className="bg-gray-100 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Our Process</h2>
          <div className="space-y-4 text-lg">
            <p><strong>1. Design:</strong> We design your structure based on your requirements.</p>
            <p><strong>2. Engineering:</strong> Structural calculations and compliance.</p>
            <p><strong>3. Fabrication:</strong> Precision manufacturing.</p>
            <p><strong>4. Installation:</strong> Fast on-site assembly.</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">FAQs</h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold">How long does it take to build?</h3>
            <p>Most projects are completed 30–50% faster than traditional construction.</p>
          </div>
          <div>
            <h3 className="font-semibold">Can I expand later?</h3>
            <p>Yes, our modular system allows for easy future expansion.</p>
          </div>
          <div>
            <h3 className="font-semibold">Do you handle the full build?</h3>
            <p>Yes, we offer full turnkey construction services.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-black text-white text-center py-20 px-6">
        <h2 className="text-3xl font-bold mb-4">Get a Steel Building Quote in Pretoria</h2>
        <p className="mb-6 text-lg">Use our estimator or speak to our team today.</p>

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