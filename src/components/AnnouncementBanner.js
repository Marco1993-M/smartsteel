'use client';

import { useState, useEffect } from 'react';

export default function AnnouncementBanner() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Optional: persist dismissal for session
    const dismissed = sessionStorage.getItem('kragdag-banner-dismissed');
    if (dismissed) setShow(false);
  }, []);

  const handleClose = () => {
    setShow(false);
    sessionStorage.setItem('kragdag-banner-dismissed', 'true');
  };

  if (!show) return null;

  return (
    <div className="w-full bg-black text-white text-sm md:text-base py-2 px-4 flex items-center justify-center gap-4 fixed top-0 z-50 shadow-md">
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
      <button
        onClick={handleClose}
        aria-label="Dismiss announcement"
        className="ml-auto text-xl font-light text-white hover:text-gray-400"
      >
        ×
      </button>
    </div>
  );
}
