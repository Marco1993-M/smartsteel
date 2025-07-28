// app/privacy-policy/page.js
'use client';

import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-4xl mx-auto py-16 px-6">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-10">Last updated: 28 July 2025</p>

      <section className="space-y-8 text-gray-800 leading-relaxed">
        <div>
          <h2 className="text-xl font-semibold">1. Information We Collect</h2>
          <p>
            We may collect and process the following types of personal information:
          </p>
          <ul className="list-disc list-inside mt-2">
            <li>Contact details (e.g. name, email address, phone number)</li>
            <li>Project details you provide when requesting a quote</li>
            <li>Website usage information collected via cookies and analytics tools (e.g. pages viewed, IP address, device type)</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold">2. How We Use Your Information</h2>
          <p>
            We collect and use your personal information to:
          </p>
          <ul className="list-disc list-inside mt-2">
            <li>Respond to inquiries or quote requests</li>
            <li>Communicate with you about your project</li>
            <li>Improve our website and services</li>
            <li>Comply with legal obligations</li>
          </ul>
          <p className="mt-2">
            We will not sell, rent, or trade your personal data to third parties.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">3. Cookies and Tracking Technologies</h2>
          <p>
            Our website uses cookies and similar technologies to improve user experience and analyze traffic. You can control or disable cookies in your browser settings.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">4. Data Storage and Security</h2>
          <p>
            We take reasonable steps to protect your personal information from loss, misuse, and unauthorized access. Data is stored on secure platforms with restricted access.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">5. Sharing of Information</h2>
          <p>
            We may share your information with trusted service providers who assist us with:
          </p>
          <ul className="list-disc list-inside mt-2">
            <li>Email communication</li>
            <li>Website hosting and analytics</li>
            <li>Project estimation tools</li>
          </ul>
          <p className="mt-2">
            These parties are required to process your data only for the purpose we specify and to comply with applicable data protection laws.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">6. Your Rights</h2>
          <p>
            In accordance with the Protection of Personal Information Act (POPIA), you have the right to:
          </p>
          <ul className="list-disc list-inside mt-2">
            <li>Access the personal information we hold about you</li>
            <li>Request correction or deletion of your data</li>
            <li>Object to the processing of your personal data</li>
            <li>Lodge a complaint with the Information Regulator of South Africa</li>
          </ul>
          <p className="mt-2">
            To exercise any of these rights, contact us at:
            <br />
            📧 <a href="mailto:info@smartsteel.co.za" className="text-blue-600 underline">info@smartsteel.co.za</a>
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">7. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Any changes will be posted on this page, with the latest revision date noted at the top.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">8. Contact Us</h2>
          <p>
            If you have any questions or concerns about this Privacy Policy or how your personal data is handled, please contact:
          </p>
          <p className="mt-2">
            <strong>Smart Steel</strong><br />
            Pretoria, South Africa<br />
            📧 <a href="mailto:info@smartsteel.co.za" className="text-blue-600 underline">info@smartsteel.co.za</a>
          </p>
        </div>
      </section>
    </main>
  );
}
