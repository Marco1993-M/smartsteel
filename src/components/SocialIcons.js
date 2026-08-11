// components/SocialIcons.js
'use client';
import { FaFacebookF } from 'react-icons/fa';
import { SMART_STEEL_FACEBOOK_URL } from '../lib/brandEntity';

export default function SocialIcons() {
  return (
    <div className="flex space-x-6 text-2xl">
      <a
        href={SMART_STEEL_FACEBOOK_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Smart Steel on Facebook"
        className="hover:text-[#da1a33] transition"
      >
        <FaFacebookF />
      </a>
    </div>
  );
}
