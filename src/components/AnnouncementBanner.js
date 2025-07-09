'use client';

import { useState } from 'react';

export default function AnnouncementBanner() {
  const [show, setShow] = useState(true);

  if (!show) return null;

  return (
    <div className="fixed top-0 z-50 w-full bg-black text-white text-sm md:text-base py-3 px-4 shadow-md">
      <div className="max-w-screen-xl mx-auto relative flex items-center justify-center">
        {/* Text & link container */}
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-center">
          <span>
            📍 Join us at <strong>Kragdag 2025</strong> – showcasing innovative steel solutions for off-grid living.
          </span>
          <a
            href="https://www.kragdag.co.za"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-300"
          >
            Learn more
          </a>
        </div>

        {/* Close button */}
        <button
          onClick={() => setShow(false)}
          aria-label="Dismiss announcement"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-xl font-light text-white hover:text-gray-400"
        >
          ×
        </button>
      </div>
    </div>
  );
}
