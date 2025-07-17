'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function ProductAdvantages() {
  return (
    <main className="px-6 py-20">
      {/* HERO */}
      <section className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-4xl font-bold mb-6 text-left">Realise Your Design Ambitions with Lightweight Steel</h1>
          <p className="text-lg text-gray-700">
            Lightweight steel framing offers exceptional strength, flexibility, and precision. Its high strength-to-weight ratio is perfect for open-plan living, wide spans, and contemporary architectural styles—making your vision structurally sound and beautifully modern.
          </p>
        </div>
        <Image
          src="/images/lightweight-steel-hero.jpg"
          alt="Lightweight steel frame structure"
          width={500}
          height={300}
          className="rounded-lg shadow-lg object-cover w-full"
        />
      </section>

      {/* WHY SPECIFY */}
      <section className="text-center my-24">
        <h2 className="text-3xl font-semibold mb-6">Why Choose Lightweight Steel for Your Next Project?</h2>
        <p className="max-w-3xl mx-auto text-gray-600 text-lg">
          When quality, performance, and peace of mind matter, starting with steel framing is the smart choice. Lightweight steel ensures dimensional accuracy, durability, and compliance from day one.
        </p>
      </section>

 {/* BENEFITS GRID - Styled like Sustainability Section */}
<section className="py-20 px-6 bg-gray-50">
  <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10">
    {[
      {
        title: 'Design Flexibility',
        text: 'Supports complex architectural designs and open spaces.',
        icon: '/icon/design-flexibility.png',
      },
      {
        title: 'Wide-Ranging Applications',
        text: 'Ideal for residential, commercial, and modular builds.',
        icon: '/icon/applications.png',
      },
      {
        title: 'High Strength, Low Weight',
        text: 'Delivers structural reliability with reduced load.',
        icon: '/icon/strength.png',
      },
      {
        title: 'Always Straight & True',
        text: 'Resists warping, twisting, and shrinkage over time.',
        icon: '/icon/straight.png',
      },
      {
        title: 'Fire & Pest Resistant',
        text: 'Inorganic material that won’t rot, burn, or attract termites.',
        icon: '/icon/fire.png',
      },
      {
        title: 'Tested for Performance',
        text: 'Manufactured under strict quality standards and tests.',
        icon: '/icon/tested.png',
      },
      {
        title: 'Sustainable Framing',
        text: 'Recyclable and made with circular design in mind.',
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



    {/* FRAMING APPLICATIONS */}
<section className="my-24 max-w-7xl mx-auto px-6">
  <h2 className="text-3xl font-semibold mb-12 text-center">Framing for Projects of All Kinds</h2>

  <div className="grid md:grid-cols-2 gap-12">
    {/* Residential */}
    <div>
      <h3 className="text-xl font-semibold mb-4">Residential Builds</h3>
      <p className="text-gray-700 mb-6">
        Lightweight steel framing is becoming a standard offering across modern home construction. Builders are embracing steel to meet increasing demand for durability and sustainability.
      </p>
      <ul className="space-y-4">
        {[
          { text: 'New homes', icon: '/icon/plus.png' },
          { text: 'Extensions and renovations', icon: '/icon/plus.png' },
          { text: 'Duplexes and townhouses', icon: '/icon/plus.png' },
          { text: 'Low and mid-rise apartments', icon: '/icon/plus.png' },
        ].map((item, index) => (
          <li key={index} className="flex items-start gap-3">
            <Image src={item.icon} alt="" width={20} height={20} className="mt-1" />
            <span className="text-gray-700">{item.text}</span>
          </li>
        ))}
      </ul>
    </div>

    {/* Commercial & Modular */}
    <div>
      <h3 className="text-xl font-semibold mb-4">Commercial & Modular Builds</h3>
      <p className="text-gray-700 mb-6">
        Lightweight steel framing’s adaptability makes it a smart choice for a wide range of projects across industries.
      </p>
      <ul className="space-y-4">
        {[
          { text: 'Retail and office buildings', icon: '/icon/plus.png' },
          { text: 'Architectural facades', icon: '/icon/plus.png' },
          { text: 'Educational institutions', icon: '/icon/plus.png' },
          { text: 'Healthcare and aged care facilities', icon: '/icon/plus.png' },
          { text: 'Modular and prefab construction', icon: '/icon/plus.png' },
        ].map((item, index) => (
          <li key={index} className="flex items-start gap-3">
            <Image src={item.icon} alt="" width={20} height={20} className="mt-1" />
            <span className="text-gray-700">{item.text}</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
</section>


      {/* CASE STUDIES */}
      <section className="bg-gray-100 py-20">
        <div className="max-w-7xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-semibold mb-4">Explore Our Case Studies</h2>
          <p className="text-lg text-gray-600">Discover why more architects, engineers, and builders are switching to lightweight steel.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto px-6">
          {[
            {
              title: 'Off-Grid Eco Home',
              desc: 'See how steel framing enabled fast, precise assembly in remote terrain.',
              image: '/images/case-eco.jpg',
              link: '/case-studies/eco-home',
            },
            {
              title: 'School Expansion Project',
              desc: 'Explore how modular lightweight steel reduced downtime during term.',
              image: '/images/case-school.jpg',
              link: '/case-studies/school-expansion',
            },
            {
              title: 'Retail Space Renovation',
              desc: 'Discover the benefits of speed and fire resistance for commercial builds.',
              image: '/images/case-retail.jpg',
              link: '/case-studies/retail-renovation',
            },
          ].map((caseStudy, index) => (
            <div key={index} className="bg-white shadow rounded-lg overflow-hidden">
              <Image
                src={caseStudy.image}
                alt={caseStudy.title}
                width={400}
                height={260}
                className="w-full h-56 object-cover"
              />
              <div className="p-4 text-left">
                <h4 className="font-semibold text-lg">{caseStudy.title}</h4>
                <p className="text-sm text-gray-600 mb-4">{caseStudy.desc}</p>
                <Link href={caseStudy.link} className="text-blue-600 font-medium hover:underline">
                  Read article →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
