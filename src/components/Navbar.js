'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showForHomeBanner, setShowForHomeBanner] = useState(false);
  const [showAboutBanner, setShowAboutBanner] = useState(false);
  const [showProfessionalsBanner, setShowProfessionalsBanner] = useState(false);

  function handleForHomeHover(state) {
    setShowForHomeBanner(state);
    if (state) {
      setShowAboutBanner(false);
      setShowProfessionalsBanner(false);
    }
  }

  function handleAboutHover(state) {
    setShowAboutBanner(state);
    if (state) {
      setShowForHomeBanner(false);
      setShowProfessionalsBanner(false);
    }
  }

  function handleProfessionalsHover(state) {
    setShowProfessionalsBanner(state);
    if (state) {
      setShowAboutBanner(false);
      setShowForHomeBanner(false);
    }
  }

  return (
    <nav className="bg-white text-black relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="Smart Steel Logo"
            width={100}
            height={100}
            priority
          />
        </Link>

        <div className="text-xl font-bold">
          <Link href="/"></Link>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex space-x-6 text-sm font-medium">
          <div
            onMouseEnter={() => handleProfessionalsHover(true)}
            onMouseLeave={() => handleProfessionalsHover(false)}
            className="relative group px-3 py-2 cursor-pointer select-none"
          >
            <span className="relative z-10">For Professionals</span>
            <span className="absolute left-0 -bottom-0.5 w-0 h-0.5 bg-[#da1a33] transition-all duration-300 group-hover:w-full"></span>
          </div>

          <div
            onMouseEnter={() => handleAboutHover(true)}
            onMouseLeave={() => handleAboutHover(false)}
            className="relative group px-3 py-2 cursor-pointer select-none"
          >
            <span className="relative z-10">About</span>
            <span className="absolute left-0 -bottom-0.5 w-0 h-0.5 bg-[#da1a33] transition-all duration-300 group-hover:w-full"></span>
          </div>

          <div
            onMouseEnter={() => handleForHomeHover(true)}
            onMouseLeave={() => handleForHomeHover(false)}
            className="relative group px-3 py-2 cursor-pointer select-none"
          >
            <span className="relative z-10">For Your Home</span>
            <span className="absolute left-0 -bottom-0.5 w-0 h-0.5 bg-[#da1a33] transition-all duration-300 group-hover:w-full"></span>
          </div>

          <Link href="/contact" className="relative group px-3 py-2">
            <span>Contact</span>
            <span className="absolute left-0 -bottom-0.5 w-0 h-0.5 bg-[#da1a33] transition-all duration-300 group-hover:w-full"></span>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden focus:outline-none"
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2 bg-[#515151] text-white">
          <Link href="/" className="block hover:text-[#da1a33]">Home</Link>

          <p className="mt-4 font-semibold">For Professionals</p>
          <Link href="/product-advantages" className="block ml-4 hover:text-[#da1a33]">Product Advantages</Link>
          <Link href="/resources" className="block ml-4 hover:text-[#da1a33]">Technical Resources</Link>
          <Link href="/resources" className="block ml-4 hover:text-[#da1a33]">Installation Guides</Link>

          <p className="mt-4 font-semibold">About</p>
          <Link href="/company" className="block ml-4 hover:text-[#da1a33]">Company</Link>
          <Link href="/sustainability" className="block ml-4 hover:text-[#da1a33]">Sustainability</Link>
          <Link href="/news-events" className="block ml-4 hover:text-[#da1a33]">News & Events</Link>

          <p className="mt-4 font-semibold">For Your Home</p>
          <Link href="/product-advantages" className="block ml-4 hover:text-[#da1a33]">Product Advantages</Link>
          <Link href="/warranty" className="block ml-4 hover:text-[#da1a33]">Warranty</Link>
          <a href="/brochure.pdf" download className="block ml-4 hover:text-[#da1a33]">Download Brochure</a>

          <Link href="/contact" className="block mt-4 hover:text-[#da1a33]">Contact</Link>
        </div>
      )}

      {/* --- HOVER BANNERS for Desktop --- */}

      {showProfessionalsBanner && (
        <div
          onMouseEnter={() => handleProfessionalsHover(true)}
          onMouseLeave={() => handleProfessionalsHover(false)}
          className="absolute top-full left-0 w-full bg-white text-black shadow-lg border-t border-gray-300"
          style={{ minHeight: '200px', zIndex: 1000 }}
        >
          <div className="max-w-7xl mx-auto px-8 py-8 grid grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-[#da1a33] mb-4">Architect / Specifiers</h3>
              <ul className="space-y-2">
                <li><Link href="/product-advantages" className="hover:underline">Product Advantages</Link></li>
                <li><Link href="/resources" className="hover:underline">Technical Resources</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-[#da1a33] mb-4">Builder / Installers</h3>
              <ul className="space-y-2">
                <li><Link href="/product-advantages" className="hover:underline">Product Advantages</Link></li>
                <li><Link href="/resources" className="hover:underline">Technical Resources</Link></li>
                <li><Link href="/resources" className="hover:underline">Installation Guides</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-[#da1a33] mb-4">Fabricators</h3>
              <ul className="space-y-2">
                <li><Link href="/product-advantages" className="hover:underline">Product Advantages</Link></li>
                <li><Link href="/resources" className="hover:underline">Technical Resources</Link></li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {showAboutBanner && (
        <div
          onMouseEnter={() => handleAboutHover(true)}
          onMouseLeave={() => handleAboutHover(false)}
          className="absolute top-full left-0 w-full bg-white text-black shadow-lg border-t border-gray-300"
          style={{ minHeight: '200px', zIndex: 1000 }}
        >
          <div className="max-w-7xl mx-auto px-8 py-8 grid grid-cols-3 gap-8">
            <div><Link href="/company" className="text-xl font-semibold text-[#da1a33] hover:underline mb-2 block">Company</Link><p>Learn about our history, mission, and team.</p></div>
            <div><Link href="/sustainability" className="text-xl font-semibold text-[#da1a33] hover:underline mb-2 block">Sustainability</Link><p>How we build eco-friendly and efficient steel structures.</p></div>
            <div><Link href="/news-events" className="text-xl font-semibold text-[#da1a33] hover:underline mb-2 block">News & Events</Link><p>Stay updated with the latest company updates and events.</p></div>
          </div>
        </div>
      )}

      {showForHomeBanner && (
        <div
          onMouseEnter={() => handleForHomeHover(true)}
          onMouseLeave={() => handleForHomeHover(false)}
          className="absolute top-full left-0 w-full bg-white text-black shadow-lg border-t border-gray-300"
          style={{ minHeight: '200px', zIndex: 1000 }}
        >
          <div className="max-w-7xl mx-auto px-8 py-8 grid grid-cols-3 gap-8">
            <div>
              <Link href="/product-advantages" className="text-xl font-semibold text-[#da1a33] hover:underline mb-2 block">Product Advantages</Link>
              <ul className="list-disc list-inside space-y-2">
                <li>Lightweight & Durable</li>
                <li>Fast Assembly Kits</li>
                <li>Eco-Friendly Materials</li>
                <li>Custom Designs Available</li>
              </ul>
            </div>
            <div>
              <Link href="/warranty" className="text-xl font-semibold text-[#da1a33] hover:underline mb-2 block">Warranty</Link>
              <p>10-year structural warranty on all steel frames. Peace of mind guaranteed.</p>
            </div>
            <div>
              <a href="/brochure.pdf" download className="text-xl font-semibold text-[#da1a33] hover:underline mb-2 block">Smart Steel Brochure</a>
              <p>Download our full product brochure.</p>
              <a href="/brochure.pdf" download className="inline-block mt-4 px-6 py-3 bg-[#da1a33] text-white rounded hover:bg-[#bf172d] transition">Download PDF</a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
