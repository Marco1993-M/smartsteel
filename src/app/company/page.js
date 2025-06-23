'use client';
import Navbar from '../../components/Navbar';
import Image from 'next/image';
import { FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

export default function CompanyPage() {
  return (
    <>
      <Navbar />
      <main className="font-sans text-gray-800">
        {/* About Section */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-2/3">
              <h1 className="text-4xl font-bold mb-6 text-left">About Us</h1>
              <p className="text-lg mb-4 text-left">
                Smart Steel was established as a dedicated division of Pequeñohome.com by our visionary founders, Stefan Steyn, Niel Wannenburg, and Marco Gerritsen. With a shared passion for innovation and quality, we set out to create a smarter, more efficient approach to steel construction.
              </p>
              <p className="text-lg mb-4 text-left">
                Our mission is simple: to provide our clients with superior steel structures that outperform traditional options in efficiency, durability, and cost-effectiveness. By reimagining the alternative building sector, we aim to make high-quality steel solutions accessible, reliable, and affordable for everyone.
              </p>
              <p className="text-lg mb-4 text-left">
                At Smart Steel, we believe in transforming challenges into opportunities. Whether you’re looking for sheds, warehousing, or custom-built solutions, our lightweight, modular designs are engineered to simplify construction, minimize costs, and deliver lasting results.
              </p>
              <p className="text-lg text-left">
                Our commitment to excellence drives us to continually refine our products and processes, ensuring that every client experiences unparalleled value and service. With Smart Steel, building better isn’t just a goal—it’s our promise.
              </p>
            </div>
            <div className="md:w-1/3">
              <Image
                src="/team.jpg"
                alt="About Smart Steel"
                width={500}
                height={500}
                className="rounded-lg object-cover w-full h-auto"
              />
            </div>
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
