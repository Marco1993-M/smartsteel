'use client';

import { useEffect, useState } from 'react';

export default function SalePopup() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
  }, []);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-53 flex items-center justify-center p-4"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row">
        {/* Left side: Text + CTA */}
        <div className="relative p-6 md:p-8 flex flex-col justify-center md:w-1/2 text-center md:text-left space-y-4">
          <button
            onClick={() => setShow(false)}
            className="absolute top-4 right-4 text-gray-500 hover:text-black text-3xl font-bold"
            aria-label="Close sale popup"
          >
            &times;
          </button>
          <h2 className="text-2xl md:text-3xl font-bold text-red-600">
            🚨 Massive Warehouse Sale at Smart Steel! 🚨
          </h2>
          <p className="text-gray-700 text-base md:text-lg leading-relaxed whitespace-pre-line">
            Get your hands on high-quality steel warehouses at unbeatable prices! Available sizes:
            <br />
            ✅ 15x10m
            <br />
            ✅ 12x20m
            <br />
            Perfect for storage, workshops, or your next big project.
          </p>
          <a
            href="mailto:info@smartsteel.co.za?subject=Inquiry%20about%20Massive%20Warehouse%20Sale&body=Hi%20Smart%20Steel%20team%2C%0D%0AI%E2%80%99m%20interested%20in%20the%20warehouse%20sale.%20Please%20send%20me%20more%20info."
            className="inline-block bg-red-600 text-white px-6 py-2 rounded-full text-sm md:text-base hover:bg-red-700 transition"
          >
            Contact Us
          </a>
        </div>

        {/* Right side: Image */}
        <div className="md:w-1/2 w-full h-48 md:h-auto">
          <img
            src="/sale-banner.png"
            alt="Sale Banner"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
