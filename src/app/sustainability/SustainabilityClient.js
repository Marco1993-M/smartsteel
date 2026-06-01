'use client';

import Navbar from '../../components/Navbar';
import Image from 'next/image';
import Link from 'next/link';
import { FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

export default function SustainabilityClient() {
  return (
    <>
      <Navbar />

      <main className="font-sans text-gray-800">
        <section className="bg-white py-20 px-6">
          <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12 items-center">
            <div className="md:col-span-2">
              <h1 className="text-3xl font-bold mb-4 text-left">Product Sustainability Information</h1>
              <h2 className="text-xl font-medium text-gray-700 text-left">
                Lightweight steel is responsibly produced, designed for longevity and can contribute to a circular economy.
              </h2>
            </div>

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

        <section className="bg-gray-50 py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-left">Our Commitment</h2>
            <p className="text-lg text-left text-gray-700">
              We&apos;re committed to creating steel products that positively impact our communities and the built environment.
            </p>
          </div>

          <div className="max-w-6xl mx-auto mt-12 grid md:grid-cols-2 gap-10">
            {[
              {
                title: 'Enduring by Design',
                text: 'Framing made from lightweight steel is strong, durable, and versatile, making it a good choice for homes and buildings designed for long life.',
                icon: '/icons/design.png',
              },
              {
                title: 'Suitable for Reuse',
                text: 'Frames made from lightweight steel can support circular design strategies, including designing for disassembly and reuse. They can be screw-assembled and are highly suitable for modular design.',
                icon: '/icons/reuse.png',
              },
              {
                title: 'Long Lasting',
                text: 'Our lightweight steel incorporates industry-leading coating technologies that enhance corrosion resistance, providing longer-lasting protection for your steel frame.',
                icon: '/icons/durability.png',
              },
              {
                title: 'Resource Efficiency',
                text: 'Steel frames are fabricated to exact specs using software, minimizing onsite waste. Any steel waste generated is recyclable and returns to the production loop.',
                icon: '/icons/efficiency.png',
              },
              {
                title: '100% Recyclable Steel',
                text: 'Our lightweight steel contains recycled content and is 100% recyclable without loss of quality. Magnetic separation makes recovery easy and efficient.',
                icon: '/icons/recycle.png',
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
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white py-20 px-6">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Stay Connected</h2>
            <p className="text-lg text-gray-700 mb-8">
              Follow Smart Steel to see how lightweight steel is being used in practical projects and building systems across South Africa.
            </p>
            <div className="flex justify-center gap-6 text-[#da1a33] text-2xl">
              <Link href="https://facebook.com" aria-label="Facebook"><FaFacebookF /></Link>
              <Link href="https://instagram.com" aria-label="Instagram"><FaInstagram /></Link>
              <Link href="https://linkedin.com" aria-label="LinkedIn"><FaLinkedinIn /></Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
