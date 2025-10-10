'use client';

import { useEffect, useState } from 'react';

export default function SalePopup() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if popup was already shown this session
    const hasSeenPopup = sessionStorage.getItem('salePopupShown');

    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setShow(true);
        sessionStorage.setItem('salePopupShown', 'true');
      }, 1500); // show after 1.5s

      return () => clearTimeout(timer);
    }
  }, []);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full flex flex-col md:flex-row overflow-hidden animate-fadeIn">
        {/* Left side: Text + CTA */}
        <div className="p-8 flex flex-col justify-center md:w-1/2 text-center md:text-left space-y-5">
          <button
            onClick={() => setShow(false)}
            className="absolute top-4 right-4 text-white-500 hover:text-black text-3xl font-bold"
            aria-label="Close sale popup"
          >
            &times;
          </button>

          <h2 className="text-3xl font-bold mb-2 text-red-600">
            Our Smart Steel Promise!
          </h2>

          <p className="text-gray-700 text-lg leading-relaxed">
            Build smarter and save more with Smart Steel.  
            Every warehouse order includes:
          </p>

          <ul className="text-gray-800 text-lg space-y-2">
            <li>✅ <strong>Free Shipping</strong></li>
            <li>✅ <strong>Free Engineering Design</strong></li>
            <li>✅ <strong>Free Engineering Sign-Off</strong></li>
            <li>✅ <strong>Free Foundation Design</strong></li>
          </ul>

          <a
            href="mailto:info@smartsteel.co.za?subject=Smart%20Steel%20Special%20Offer&body=Hi%20Smart%20Steel%20team%2C%0D%0AI%E2%80%99m%20interested%20in%20your%20special%20offer.%20Please%20send%20me%20more%20information."
            className="inline-block bg-red-600 text-white px-8 py-3 rounded-full text-base hover:bg-red-700 transition"
          >
            Contact Us
          </a>
        </div>

        {/* Right side: Image */}
        <div className="md:w-1/2">
          <img
            src="/sale-banner.png"
            alt="Smart Steel Offer Banner"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Animation Style */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
