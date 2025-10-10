'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function SalePopup() {
  const [show, setShow] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Don't show popup on the CRM page
    if (pathname === '/kanban') return;

    const hasSeenPopup = sessionStorage.getItem('salePopupShown');

    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setShow(true);
        sessionStorage.setItem('salePopupShown', 'true');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.35)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl md:max-w-4xl overflow-hidden animate-fadeIn flex flex-col md:flex-row">
        {/* Close button */}
        <button
          onClick={() => setShow(false)}
          className="absolute top-3 right-4 text-gray-500 hover:text-black text-3xl font-bold z-10"
          aria-label="Close sale popup"
        >
          &times;
        </button>

        {/* Text content */}
        <div className="p-6 sm:p-8 flex flex-col justify-center text-center md:text-left space-y-4 md:space-y-5 md:w-1/2">
          <h2 className="text-2xl sm:text-3xl font-bold text-red-600">
            🚀 Smart Steel Special Offer!
          </h2>

          <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
            Build smarter and save more with Smart Steel.  
            For a limited time, every warehouse order includes:
          </p>

          <ul className="text-gray-800 text-base sm:text-lg space-y-2 text-left mx-auto md:mx-0">
            <li>✅ <strong>Free Shipping</strong></li>
            <li>✅ <strong>Free Engineering Report</strong></li>
            <li>✅ <strong>Free Engineering Sign-Off</strong></li>
            <li>✅ <strong>Free Foundation Design</strong></li>
          </ul>

          <a
            href="mailto:info@smartsteel.co.za?subject=Smart%20Steel%20Special%20Offer&body=Hi%20Smart%20Steel%20team%2C%0D%0AI%E2%80%99m%20interested%20in%20your%20special%20offer.%20Please%20send%20me%20more%20information."
            className="inline-block bg-red-600 text-white px-6 py-3 rounded-full text-sm sm:text-base hover:bg-red-700 transition w-full sm:w-auto"
          >
            Contact Us
          </a>
        </div>

        {/* Image */}
        <div className="md:w-1/2 h-48 sm:h-64 md:h-auto">
          <img
            src="/sale-banner.png"
            alt="Smart Steel Offer Banner"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Animation */}
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
