// app/return-policy/page.js
'use client';

import React from 'react';

export default function ReturnPolicyPage() {
  return (
    <main className="max-w-4xl mx-auto py-16 px-6">
      <h1 className="text-3xl font-bold mb-6">Return Policy</h1>
      <p className="text-sm text-gray-500 mb-10">Last updated: 9 October 2025</p>

      <section className="space-y-8 text-gray-800 leading-relaxed">
        <div>
          <h2 className="text-xl font-semibold">1. Scope of This Policy</h2>
          <p>
            This Return Policy outlines the conditions under which Smart Steel accepts returns of products or cancellations of services. By purchasing from Smart Steel, you agree to the terms described below.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">2. Returns for Manufactured Products</h2>
          <p>
            As our buildings and structures are custom-designed and manufactured to client specifications, we generally do not accept returns once production has begun. Exceptions may apply in the following cases:
          </p>
          <ul className="list-disc list-inside mt-2">
            <li>Manufacturing defects or damage during transport</li>
            <li>Incorrect products supplied contrary to your order specifications</li>
          </ul>
          <p className="mt-2">
            To request a return or replacement, please contact us within 7 days of delivery with photos and a description of the issue.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">3. Cancellations of Services or Orders</h2>
          <p>
            You may cancel a project or service request before manufacturing or construction has commenced. Once production or site work has started, cancellations are generally not accepted. Any cancellation may be subject to administrative fees or partial charges to cover costs incurred.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">4. Refunds</h2>
          <p>
            Approved returns or cancellations will be refunded using the original payment method. Refunds may take up to 14 business days to process after approval.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">5. Shipping Costs</h2>
          <p>
            Shipping costs are generally non-refundable, except where the return is due to our error (e.g., defective product, incorrect item supplied). Customers are responsible for any return shipping costs unless otherwise specified.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">6. Damaged or Defective Items</h2>
          <p>
            If you receive a damaged or defective item, please notify us immediately. We will provide instructions for the return or replacement of the affected product at no additional cost.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">7. Contact Us</h2>
          <p>
            For all return, cancellation, or refund inquiries, please contact:
          </p>
          <p className="mt-2">
            <strong>Smart Steel</strong><br />
            Pretoria, South Africa<br />
            📧 <a href="mailto:info@smartsteel.co.za" className="text-blue-600 underline">info@smartsteel.co.za</a>
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">8. Changes to This Policy</h2>
          <p>
            We may update this Return Policy from time to time. Any changes will be posted on this page, with the latest revision date noted at the top.
          </p>
        </div>
      </section>
    </main>
  );
}
