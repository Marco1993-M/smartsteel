'use client';
import Image from 'next/image';
import Link from 'next/link';
import { FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

export default function Solar() {
  return (
      <main className="font-sans text-gray-800">
        
        {/* Solar Solutions Intro */}
        <section className="bg-white py-20 px-6">
          <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12 items-center">
            {/* Text */}
            <div className="md:col-span-2">
              <h1 className="text-3xl font-bold mb-4 text-left">Solar-Ready Steel Solutions</h1>
              <h2 className="text-xl font-medium text-gray-700 text-left">
                Engineered for strength, precision, and seamless solar integration — Smart Steel is the foundation for energy-efficient structures.
              </h2>
            </div>

            {/* Image */}
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

        {/* Applications */}
        <section className="bg-gray-50 py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-left">Built for Solar Applications</h2>
            <p className="text-lg text-left text-gray-700 mb-8">
              Our lightweight steel solutions provide the ideal framework for reliable solar infrastructure — designed to handle the loads, exposure, and durability demands of modern solar systems.
            </p>
          </div>

          <div className="max-w-6xl mx-auto mt-12 grid md:grid-cols-3 gap-10">
            {[
              {
                title: 'Solar Carports',
                text: 'Shelter vehicles while generating renewable energy. Our steel carports are engineered for strength, quick installation, and long-lasting performance.',
                icon: '/icon/carport.png',
              },
              {
                title: 'Ground Mount Systems',
                text: 'Precision-fabricated steel ground mounts designed for solar farms and rural installations. Lightweight, durable, and built to exact specifications.',
                icon: '/icon/groundmount.png',
              },
              {
                title: 'Solar Roof Structures',
                text: 'Lightweight steel trusses and frames provide the perfect foundation for integrated solar roofs, offering strength, dimensional accuracy, and fire resistance.',
                icon: '/icon/roof.png',
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

        {/* Benefits */}
        <section className="bg-white py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-left">Why Choose Smart Steel for Solar?</h2>
            <ul className="list-disc list-inside text-lg text-gray-700 space-y-4">
              <li>Lightweight, corrosion-resistant steel ideal for long-term outdoor exposure</li>
              <li>Engineered for quick assembly and modular installation</li>
              <li>Dimensional accuracy ensures proper solar panel alignment</li>
              <li>Fire-resistant and termite-proof — built for South African conditions</li>
              <li>Fully recyclable steel frames support sustainable construction</li>
            </ul>
          </div>
        </section>

        {/* Follow Us Section */}
        <section className="bg-gray-100 py-20 px-6">
          <div className="max-w-5xl mx-auto text-left">
            <h2 className="text-3xl font-bold mb-4">Follow us on our socials!</h2>
            <p className="text-lg mb-8">
              See how our steel frames are powering solar projects across South Africa. Follow us for real-world examples and inspiration.
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
  );
}
