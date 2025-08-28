'use client';

import Image from 'next/image';
import Link from 'next/link';
import Head from 'next/head';
import { FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

export default function TrussesPage() {
  const schemaData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "https://www.smartsteel.co.za/products/trusses",
        "url": "https://www.smartsteel.co.za/products/trusses",
        "name": "Versatile Lightweight Steel Trusses",
        "description": "Precision-engineered lightweight steel trusses for residential, commercial, and industrial buildings across South Africa. Designed for durability, design flexibility, and fast installation.",
        "publisher": {
          "@type": "Organization",
          "name": "Smart Steel",
          "logo": {
            "@type": "ImageObject",
            "url": "https://www.smartsteel.co.za/images/logo.png"
          }
        }
      },
      {
        "@type": "Product",
        "name": "Lightweight Steel Trusses",
        "image": [
          "https://www.smartsteel.co.za/images/steel-trusses-hero.jpg"
        ],
        "description": "Durable and versatile lightweight steel trusses suitable for all build types, from small residential roofs to clear spans of up to 40 meters.",
        "brand": {
          "@type": "Brand",
          "name": "Smart Steel"
        },
        "manufacturer": {
          "@type": "Organization",
          "name": "Smart Steel",
          "url": "https://www.smartsteel.co.za"
        },
        "offers": {
          "@type": "Offer",
          "url": "https://www.smartsteel.co.za/products/trusses",
          "priceCurrency": "ZAR",
          "availability": "https://schema.org/InStock"
        }
      }
    ]
  };

  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
      </Head>

      <main className="w-full">
        {/* HERO */}
        <section className="w-full bg-white py-20">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center px-6">
            <div>
              <h1 className="text-4xl font-bold mb-6">
                Versatile Lightweight Steel Trusses to Suit All Types of Builds
              </h1>
              <p className="text-lg text-gray-700">
                Due to growing demand across South Africa, trusses made from lightweight steel are now offered for a broad range of construction projects. These precision-engineered steel trusses combine strength, durability, and design flexibility — ideal for modern builds requiring clear spans and fast assembly.
              </p>
            </div>
            <Image
              src="/images/steel-trusses-hero.jpg"
              alt="Lightweight steel trusses in construction"
              width={800}
              height={500}
              className="rounded-xl shadow-lg object-cover w-full h-full border border-black"
              priority
            />
          </div>
        </section>

     {/* BUILD TYPES */}
<section className="max-w-6xl mx-auto my-20 px-6">
  <h2 className="text-3xl font-semibold mb-4 text-center">
    Our Lightweight Steel Trusses Are Perfect For
  </h2>
  <p className="text-lg text-gray-700 text-center mb-12">
    Designed to suit a variety of building projects — from residential homes to large-scale developments — our trusses offer strength, speed, and style.
  </p>

  <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-gray-800 font-medium">
    {[
      { title: 'New Homes', icon: '/icon/home.png', desc: 'Fast, durable, and cost-effective roofing for modern houses.' },
      { title: 'Duplexes', icon: '/icon/duplex.png', desc: 'Efficient structural solutions for multi-family living.' },
      { title: 'Extensions', icon: '/icon/extension.png', desc: 'Seamless integration for expanding existing properties.' },
      { title: 'Townhouses', icon: '/icon/townhouse.png', desc: 'Lightweight yet strong frameworks for compact designs.' },
      { title: 'Renovations', icon: '/icon/renovation.png', desc: 'Upgrade old structures with minimal disruption.' },
      { title: 'Low and Mid-Rise Apartments', icon: '/icon/apartment.png', desc: 'Structural integrity and long lifespan for multi-storey builds.' },
    ].map((item) => (
      <li
        key={item.title}
        className="flex flex-col items-center text-center gap-3 bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
      >
        <Image
          src={item.icon}
          alt={item.title}
          width={50}
          height={50}
          className="object-contain"
        />
        <h4 className="text-lg font-semibold">{item.title}</h4>
        <p className="text-sm text-gray-600">{item.desc}</p>
      </li>
    ))}
  </ul>
</section>

        {/* SPECS */}
        <section className="bg-gray-50 py-20">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-semibold mb-6 text-center">Truss Specifications</h2>
            <p className="text-center max-w-3xl mx-auto mb-12 text-gray-700">
              From small span trusses ideal for residential roofs to long clear span trusses up to 40 meters, our lightweight steel trusses provide unmatched strength without the bulk. Engineered for precision, they are perfect for open-plan spaces and complex roof designs.
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-800 font-medium">
              {[
                'Small span trusses for residential roofs',
                'Clear span trusses up to 40 meters',
                'Engineered for precise load distribution',
                'Corrosion-resistant steel for longevity',
                'Suitable for flat, pitched, and curved roofs',
                'Custom design options available',
              ].map((spec) => (
                <li key={spec} className="flex items-start gap-3 bg-white rounded-lg p-4 shadow-sm">
                  <svg
                    className="w-6 h-6 mt-1 text-[#c8333a] flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414L9 14.414 6.293 11.707a1 1 0 011.414-1.414L9 11.586l6.293-6.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {spec}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CUSTOM SIZES NOTE */}
        <section className="max-w-5xl mx-auto my-16 px-6 text-center">
          <p className="text-lg text-gray-700">
            At Smart Steel, we offer complete flexibility with our modular system — including custom sizes tailored to your specific needs. Whether you require minor adjustments or long clear spans up to 40 meters wide, our team is equipped to deliver efficient, engineered solutions without compromising speed or strength.
          </p>
        </section>

        {/* Follow Us Section */}
        <section className="bg-white py-20 px-6">
          <div className="max-w-5xl mx-auto text-left">
            <h2 className="text-3xl font-bold mb-4">Follow us on our socials!</h2>
            <p className="text-lg mb-8">
              Discover the latest projects featuring frames made from lightweight steel. Follow us for examples and inspiration on how lightweight steel is helping bring designs to life.
            </p>

            <div className="flex space-x-6 text-2xl">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#da1a33] transition"
              >
                <FaFacebookF />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#da1a33] transition"
              >
                <FaInstagram />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#da1a33] transition"
              >
                <FaLinkedinIn />
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}