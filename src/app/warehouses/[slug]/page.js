"use client";

import React, { useState } from "react";
import Link from "next/link";
import { warehouses } from "../../../components/warehouse-catalogue";

export default function WarehouseDetailPage({ params }) {
  const { slug } = params; // ✅ fixed

  // Find warehouse by slug
  const warehouse = warehouses.find((w) => w.slug === slug);

  // ✅ Always declare hooks at top
  const [activeImage, setActiveImage] = useState(warehouse ? warehouse.image : null);

  // Early return if warehouse not found
  if (!warehouse) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-700">Warehouse not found.</p>
      </div>
    );
  }

  const w = warehouse;

  return (
    <div className="w-full bg-white min-h-screen">
      {/* Top Section */}
      <div className="w-full max-w-[1600px] mx-auto px-8 lg:px-16 py-24 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Image Gallery */}
        <div className="lg:col-span-5">
          {/* Main Image */}
          <img
            src={activeImage}
            alt={w.name}
            className="w-full rounded-xl shadow-lg object-cover transition-opacity duration-300"
          />

          {/* Thumbnails */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
            {[w.image, ...(w.images || [])].map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(img)}
                className={`rounded-lg border-2 transition focus:outline-none ${
                  activeImage === img
                    ? "border-[#da1a33]"
                    : "border-transparent hover:border-gray-300"
                }`}
                aria-label={`View image ${i + 1}`}
              >
                <img
                  src={img}
                  alt={`${w.name} thumbnail ${i + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Info + CTAs */}
        <div className="lg:col-span-7 space-y-10">
          {/* Title */}
          <h1 className="text-4xl font-bold text-black">{w.name}</h1>

          {/* Pricing */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 space-y-4">
            <p className="text-gray-900 text-lg font-medium">Starting from</p>
            <p className="text-3xl font-bold text-black">{w.price}</p>
            <p className="text-gray-700 leading-relaxed">
              Final pricing depends on location, ground conditions, and customisation.
              Speak to our team to confirm your build details.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center
                   h-12 px-6
                   text-sm font-semibold
                   rounded-full
                   bg-[#da1a33] text-white
                   border border-black
                   transition-all duration-300
                   hover:bg-white hover:text-black"
              >
                Lock in Price
              </Link>

              <Link
                href={`https://wa.me/27600123456?text=Hi%20Smart%20Steel,%20I'm%20interested%20in%20the%20${encodeURIComponent(
                  w.name
                )}`}
                className="inline-flex items-center justify-center
                   h-12 px-6
                   text-sm font-semibold
                   rounded-full
                   border border-gray-300
                   text-gray-900
                   transition-all duration-300
                   hover:bg-gray-100"
              >
                WhatsApp Us
              </Link>
            </div>
          </div>

          {/* Phone note */}
          <p className="text-sm text-gray-700">
            Installation prices vary by Province, Location and customisation. Call us at{" "}
            <a href="tel:+27828464555" className="text-red-600 font-semibold">
              +27 82 846 4555
            </a>{" "}
            for the latest low price.
          </p>

          {/* Description + Custom CTA */}
          {w.description && (
            <section className="space-y-6">
              <h2 className="text-2xl font-semibold">Description</h2>
              <p className="text-gray-700 text-lg leading-relaxed">{w.description}</p>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 space-y-4">
                <p className="text-gray-900 text-lg font-medium">Need a custom solution?</p>
                <p className="text-gray-700 leading-relaxed">
                  We specialise in designing and manufacturing customised steel
                  building structures tailored to your site, layout, and
                  functional requirements.
                </p>

                <Link
                  href="/lightweight-steel-warehouses"
                  className="inline-flex items-center justify-center
                     h-12 px-6
                     text-sm font-semibold
                     rounded-full
                     bg-[#da1a33] text-white
                     border border-black
                     transition-all duration-300
                     hover:bg-white hover:text-black"
                >
                  Request Custom Build Info
                </Link>
              </div>
            </section>
          )}

          {/* Specifications */}
          {w.specs && (
            <section className="space-y-3">
              <h2 className="text-2xl font-semibold">Specifications</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(w.specs).map(([label, value]) => (
                  <div key={label} className="p-4 border rounded-lg bg-white shadow-sm">
                    <p className="text-gray-500 text-sm">{label}</p>
                    <p className="text-black font-semibold text-lg">{value}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Add-ons */}
          {w.addons && (
            <section className="space-y-3">
              <h2 className="text-2xl font-semibold">Available Add-ons</h2>
              <ul className="list-disc pl-4 space-y-2 text-gray-700">
                {w.addons.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="w-full max-w-[1600px] mx-auto px-8 lg:px-16 pb-24">
        <section>
          <h2 className="text-3xl font-bold mb-4">Frequently asked questions</h2>
          <h5 className="text-1xl mb-4">
            Explore our FAQs for answers to common questions.
          </h5>
          <div className="space-y-4">
            {[
              {
                question: "How long does installation take?",
                answer:
                  "Most warehouses are installed within 3–7 working days, depending on size, access, weather conditions, and optional add-ons.",
              },
              {
                question: "What is included in the price?",
                answer:
                  "Our pricing typically includes the structural steel frame, roof and wall sheeting, standard fixings and brackets, and design & engineering. Concrete slabs, doors, windows, insulation, electrical, and plumbing are optional add-ons unless specified.",
              },
              {
                question: "Do you design and build, or only supply kits?",
                answer:
                  "We offer a full design-and-build service from concept to handover. We do not only supply kits — installation is handled by our experienced teams.",
              },
              {
                question: "Can the building be customised?",
                answer:
                  "Yes. All Smart Steel buildings can be customised in terms of size, layout, height, roof pitch, insulation, cladding options, and future expansion provisions.",
              },
              {
                question: "Do you provide engineering drawings and approvals?",
                answer:
                  "Yes. All structures are designed to comply with South African building regulations and include the necessary engineering documentation required for approval.",
              },
              {
                question: "What foundation or slab is required?",
                answer:
                  "A level concrete slab is required. We can provide slab specifications, include slab construction as an optional extra, or coordinate with your contractor.",
              },
              {
                question: "Are the buildings suitable for future expansion?",
                answer:
                  "Absolutely. Our modular bay system allows buildings to be extended in length or width at a later stage with minimal disruption.",
              },
              {
                question: "What roof and wall sheeting options are available?",
                answer:
                  "We offer a range of sheeting options, including IBR, Chromadek, and insulated panel systems on request.",
              },
              {
                question: "Are your buildings weather-resistant?",
                answer:
                  "Yes. Our structures are engineered for local wind loads, and we offer optional insulation and waterproofing solutions for extreme environments.",
              },
              {
                question: "Do you build nationwide?",
                answer:
                  "Yes. We operate across South Africa, with pricing adjusted based on location and logistics.",
              },
              {
                question: "How is pricing calculated?",
                answer:
                  "Pricing is based on building size, location, customisation level, add-ons, and site conditions. The price shown is a starting price; final pricing is confirmed after consultation.",
              },
              {
                question: "What is the payment structure?",
                answer:
                  "Typically, a deposit confirms the design and production, followed by progress payments during manufacture and final payment on completion. Exact terms are confirmed per project.",
              },
              {
                question: "How long do Smart Steel buildings last?",
                answer:
                  "When properly installed and maintained, our steel buildings offer decades of structural lifespan with minimal maintenance.",
              },
              {
                question: "Can the building be relocated?",
                answer:
                  "Yes, depending on design. Some structures can be disassembled and relocated, making them ideal for temporary or evolving operations.",
              },
              {
                question: "Do you offer warranties?",
                answer:
                  "Yes. We provide warranties on structural components and workmanship, subject to project scope and materials used.",
              },
            ].map(({ question, answer }, i) => (
              <details key={i} className="border rounded-lg p-4 cursor-pointer">
                <summary className="font-semibold">{question}</summary>
                <p className="mt-2 text-gray-700">{answer}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
