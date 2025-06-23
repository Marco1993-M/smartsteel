'use client';

import Navbar from '../../components/Navbar';
import Image from 'next/image';
import Link from 'next/link';
import { FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

export default function Sustainability() {
  return (
    <>
      <Navbar />

      <main className="font-sans text-gray-800">
        {/* Product Sustainability Info */}
        <section className="bg-white py-20 px-6">
          <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12 items-center">
            {/* Text */}
            <div className="md:col-span-2">
              <h1 className="text-3xl font-bold mb-4 text-left">Product Sustainability Information</h1>
              <h2 className="text-xl font-medium text-gray-700 text-left">
                Lightweight steel is responsibly produced, designed for longevity and can contribute to a circular economy.
              </h2>
            </div>

            {/* Image */}
            <div className="md:col-span-1">
              <Image
                src="/sustainability-hero.jpg"
                alt="Sustainable steel"
                width={500}
                height={400}
                className="w-full h-auto object-cover rounded-lg shadow"
              />
            </div>
          </div>
        </section>

        {/* Our Commitment */}
        <section className="bg-gray-50 py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-left">Our Commitment</h2>
            <p className="text-lg text-left text-gray-700">
              We are committed to creating steel products that positively impact our communities and the built environment.
            </p>
          </div>

          {/* Sustainability Icons Grid */}
          <div className="max-w-6xl mx-auto mt-12 grid md:grid-cols-2 gap-10">
            {[
              {
                title: 'Enduring by Design',
                text: 'Framing made from lightweight steel is strong, durable, and versatile, making it a good choice for homes and buildings designed for long life.',
                icon: '/icons/design.svg',
              },
              {
                title: 'Suitable for Reuse',
                text: 'Frames made from lightweight steel can support circular design strategies, including designing for disassembly and reuse. They can be screw-assembled and are highly suitable for modular design.',
                icon: '/icons/reuse.svg',
              },
              {
                title: 'Long Lasting',
                text: 'Our lightweight steel incorporates industry-leading coating technologies that enhance corrosion resistance, providing longer-lasting protection for your steel frame.',
                icon: '/icons/durability.svg',
              },
              {
                title: 'Resource Efficiency',
                text: 'Steel frames are fabricated to exact specs using software, minimizing onsite waste. Any steel waste generated is recyclable and returns to the production loop.',
                icon: '/icons/efficiency.svg',
              },
              {
                title: '100% Recyclable Steel',
                text: 'Our lightweight steel contains recycled content and is 100% recyclable without loss of quality. Magnetic separation makes recovery easy and efficient.',
                icon: '/icons/recycle.svg',
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

        {/* Follow Us Section */}
                <section className="bg-gray-100 py-20 px-6">
                  <div className="max-w-5xl mx-auto text-left">
                    <h2 className="text-3xl font-bold mb-4">Follow us on our socials!</h2>
                    <p className="text-lg mb-8">
                      Discover the latest projects featuring frames made from lightweight steel. Follow us for examples and inspiration on how lightweight steel is helping bring designs to life.
                    </p>
        
                    {/* Social Icons */}
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
