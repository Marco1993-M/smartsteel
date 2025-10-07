// components/SocialIcons.js
'use client';
import { FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

export default function SocialIcons() {
  return (
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
  );
}
