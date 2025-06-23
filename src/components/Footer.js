'use client';
import Link from 'next/link';
import Image from 'next/image';
import { FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-[#000000] text-white py-12 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
        {/* Logo and About */}
        <div className="md:col-span-1">
          <Link href="/" className="inline-block mb-4">
            <Image src="/LogoWhite.png" alt="Smart Steel Logo" width={100} height={100} />
          </Link>
          <p className="text-sm text-gray-300">
            Smart Steel is redefining alternative building with lightweight, modular steel frames built for durability and design freedom.
          </p>
        </div>

        {/* Company Links */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Company</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><Link href="/company" className="hover:text-[#da1a33]">About Us</Link></li>
            <li><Link href="/sustainability" className="hover:text-[#da1a33]">Sustainability</Link></li>
            <li><Link href="/news-events" className="hover:text-[#da1a33]">News & Events</Link></li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Resources</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><Link href="/resources" className="hover:text-[#da1a33]">Technical Resources</Link></li>
            <li><Link href="/installation-guides" className="hover:text-[#da1a33]">Installation Guides</Link></li>
          </ul>
        </div>

        {/* Contact & Social */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
          <p className="text-sm text-gray-300 mb-2">Email: <a href="mailto:info@smartsteel.co.za" className="hover:text-[#da1a33]">info@smartsteel.co.za</a></p>
          <p className="text-sm text-gray-300 mb-6">Phone: <a href="tel:+27211234567" className="hover:text-[#da1a33]">+27 21 123 4567</a></p>

          <div className="flex space-x-4 text-xl">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#da1a33]"><FaFacebookF /></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#da1a33]"><FaInstagram /></a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#da1a33]"><FaLinkedinIn /></a>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700 mt-12 pt-6 text-sm text-center text-gray-400">
        &copy; {new Date().getFullYear()} Smart Steel. All rights reserved.
      </div>
    </footer>
  );
}
