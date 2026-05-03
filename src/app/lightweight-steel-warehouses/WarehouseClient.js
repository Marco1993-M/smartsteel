// app/warehouse/WarehouseClient.js
"use client";

import Image from "next/image";
import Link from "next/link";
import emailjs from "@emailjs/browser";
import Script from "next/script";

const SERVICE_ID = "service_h817nk1";
const TEMPLATE_ID = "template_vilvxrl";
const PUBLIC_KEY = "JIPAN9YaQCPrkSgep";

// JSON-LD structured data for products/offers
const warehouseProductSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Customizable Steel Warehouses",
  description:
    "Modular lightweight steel warehouses available in 8m and 12m widths, customizable length and color options, with optional features.",
  image: [
    "https://smartsteel.co.za/warehouse-8m.jpg",
    "https://smartsteel.co.za/warehouse-13m.jpg"
  ],
  brand: {
    "@type": "Brand",
    name: "Smart Steel",
  },
  offers: [
    {
      "@type": "Offer",
      name: "8m Wide Structure",
      priceCurrency: "ZAR",
      price: "0.00", // placeholder
      itemCondition: "https://schema.org/NewCondition",
      availability: "https://schema.org/InStock",
      url: "https://smartsteel.co.za/lightweight-steel-warehouses",
      image: "https://smartsteel.co.za/warehouse-8m.jpg"
    },
    {
      "@type": "Offer",
      name: "12m Wide Structure",
      priceCurrency: "ZAR",
      price: "0.00", // placeholder
      itemCondition: "https://schema.org/NewCondition",
      availability: "https://schema.org/InStock",
      url: "https://smartsteel.co.za/ightweight-steel-warehouses",
      image: "https://smartsteel.co.za/warehouse-13m.jpg"
    }
  ],
};


export default function WarehouseClient() {
  const handleSubmit = async (e) => {
  e.preventDefault()
  const form = e.target

  const selectedOptions = []
  form.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => selectedOptions.push(cb.value))
  const structure = form.querySelector('input[name="structure"]:checked')?.value
  const length = form.length.value
  const colour = form.colour.value
  const name = form.name.value
  const email = form.email.value
  const notes = form.notes.value

  const templateParams = { from_name: name, from_email: email, structure, length, colour, options: selectedOptions.join(", "), notes }
  const estimateRequest = `${structure} - ${length} - ${colour}${selectedOptions.length ? ` - ${selectedOptions.join(", ")}` : ""}`

  try {
    // Send email
    await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY)

    const leadResponse = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        phone: "",
        estimate_request: estimateRequest,
        allocated_to: "",
        notes,
        status: "new",
        lead_source: "Warehouse Page",
        product_type: "Warehouse",
        next_action: "Review warehouse enquiry and contact the client with the right quoting path.",
      }),
    })

    if (!leadResponse.ok) {
      const errorPayload = await leadResponse.json().catch(() => null)
      throw new Error(errorPayload?.error || "Failed to add the warehouse enquiry to CRM.")
    }



    alert("Quote sent and lead added successfully!")
    form.reset()
  } catch (error) {
    console.error(error)
    alert("Failed to send quote or add lead. Please try again.")
  }
}


  return (
    <>
      {/* JSON-LD Structured Data */}
      <Script
        id="ld-product"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(warehouseProductSchema),
        }}
      />

      <main className="font-sans text-gray-800 px-6 py-20 bg-white">
        {/* Hero Section */}
        <section className="max-w-5xl mx-auto text-center mb-20">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#da1a33] mb-4">
            Warehouse systems
          </p>
          <h1 className="text-4xl font-bold mb-4">
            Lightweight Steel Warehousing Solutions
          </h1>
          <p className="text-lg max-w-3xl mx-auto leading-8">
            Explore Smart Steel warehouse systems built for storage, workshop use, fleet cover, and commercial operations.
            Compare standard structure options, request a tailored quote, or move into the warehouse builder if you want a more visual starting point.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/warehouse-builder" className="rounded-full bg-[#da1a33] px-6 py-3 font-semibold text-white transition hover:bg-[#bf172d]">
              Build Your Warehouse
            </Link>
            <Link href="/tools/estimator" className="rounded-full border border-black px-6 py-3 font-semibold text-black transition hover:bg-black hover:text-white">
              Use Estimator
            </Link>
          </div>
        </section>

        <section className="max-w-5xl mx-auto mb-14">
          <div className="rounded-[2rem] border border-gray-200 bg-gray-50 p-8">
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  title: "Built for real warehouse use",
                  description: "Smart Steel warehouse systems are shaped around practical storage, workshop, fleet, and commercial requirements.",
                },
                {
                  title: "Clear modular starting point",
                  description: "Choose a standard width, set a practical length, and define the shell scope before moving into detailed quoting.",
                },
                {
                  title: "Simple next-step path",
                  description: "Use this page for a direct enquiry, the estimator for a quick budget check, or the builder for a live visual workflow.",
                },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl bg-white p-5 shadow-sm">
                  <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Styles Section */}
        <section className="max-w-5xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Warehouse structures built around practical use</h2>
          <p className="text-lg max-w-2xl mx-auto leading-8">
            Start with a standard structure width, choose a practical length, and tell us the key requirements that affect your project scope.
          </p>
        </section>

        {/* Quote Builder */}
        <section className="max-w-5xl mx-auto my-20 px-4 py-10 border rounded-lg bg-gray-50">
          <h2 className="text-3xl font-bold mb-6 text-center">
            Request a warehouse quote
          </h2>
          <p className="text-center max-w-2xl mx-auto mb-8">
            Select the structure that best fits your project, choose the main requirements, and send the enquiry through. We’ll review it and come back with the right next step.
          </p>
          <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 text-center shadow-sm">
            <p className="text-sm font-semibold text-gray-900">What happens after you submit?</p>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Smart Steel reviews the structure, length, finish choices, and project notes, then follows up with the most practical pricing or quoting path.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto">
          {/* Structure Selection */}
          <section className="grid md:grid-cols-3 gap-5 px-4 mb-8">
            {[
              {
                value: "8m Wide Structure",
                src: "/warehouse-13m.jpg",
                title: "8m Wide Structure",
                description:
                  "Ideal for smaller workshops, storage, agricultural cover, and practical entry-level warehouse use.",
                anchor: "8m-wide",
              },
              {
                value: "12m Wide Structure",
                src: "/warehouse-13m.jpg",
                title: "12m Wide Structure",
                description:
                  "Designed for larger warehouse, workshop, and commercial operations that need more internal clear span.",
                anchor: "12m-wide",
              },
                {
                value: "Custom Structure",
                src: "/warehouse-13m.jpg",
                title: "Custom Structure",
                description:
                  "Tailored solutions for projects that need a more specific span, length, height, or operational layout.",
                anchor: "12m-wide",
              },
            ].map((item, idx) => (
              <label
                key={idx}
                id={item.anchor}
                className="relative flex flex-col items-center rounded-[1.75rem] border border-gray-200 bg-white p-5 text-center cursor-pointer shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <input
                  type="radio"
                  name="structure"
                  value={item.value}
                  className="absolute top-4 left-4 h-5 w-5 accent-[#da1a33]"
                  required
                />
                <Image
                  src={item.src}
                  alt={item.title}
                  width={600}
                  height={400}
                  className="rounded-2xl mb-4"
                />
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{item.title}</h3>
                <p className="text-gray-700">{item.description}</p>
                <p className="mt-3 text-sm font-medium text-[#da1a33]">
                  {item.title === "8m Wide Structure"
                    ? "Best for smaller warehouse and workshop projects."
                    : item.title === "12m Wide Structure"
                      ? "Best for larger warehouse and operational space."
                      : "Best for tailored warehouse requirements."}
                </p>
              </label>
            ))}
          </section>

            {/* Contact Details */}
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                required
                className="w-full border px-4 py-2 rounded"
              />
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                required
                className="w-full border px-4 py-2 rounded"
              />
            </div>

            {/* Length Options */}
            <div>
              <h3 className="font-semibold mb-2">Length Options</h3>
              <select
                name="length"
                required
                className="w-full border px-4 py-2 rounded"
              >
                <option value="">Select Length</option>
                <option value="5m">5m</option>
                <option value="7.5m">7.5m</option>
                <option value="10m">10m</option>
                <option value="12.5m">12.5m</option>
                <option value="15m">15m</option>
                <option value="17.5m">17.5m</option>
                <option value="20m">20m</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                If you require more than 20m, please let us know in the Notes
                section below.
              </p>
            </div>

            {/* Colour Options */}
            <div>
              <h3 className="font-semibold mb-4">Colour Options</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  "Fish Eagle White",
                  "Sandstone Beige",
                  "Dark Dolphin",
                  "Charcoal Grey",
                  "Buffalo Brown",
                  "Traffic Green",
                  "Galvanised",
                  "ZincAlume",
                ].map((colour, idx) => (
                  <label
                    key={idx}
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <input
                      type="radio"
                      name="colour"
                      value={colour}
                      required
                      className="mb-2"
                    />
                    <img
                      src={`/colours/${colour
                        .toLowerCase()
                        .replace(/ /g, "-")}.jpg`}
                      alt={colour}
                      className="w-16 h-16 object-cover rounded mb-1 border"
                    />
                    <span className="text-sm">{colour}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Optional Extra Features */}
            <div className="space-y-4 mt-6">
              <h3 className="font-semibold mb-2">Project scope options</h3>
              <p className="text-sm text-gray-600">
                Select only the items that meaningfully change the structure or shell scope.
              </p>
              {[
                "Enclosed Building",
                "Installation",
                "Polycarbonate Sheets",
              ].map((feature, idx) => (
                <label key={idx} className="block">
                  <input type="checkbox" value={feature} className="mr-2" />{" "}
                  {feature}
                </label>
              ))}
            </div>

            {/* Notes */}
            <div className="mt-6">
              <textarea
                name="notes"
                placeholder="Add any site details, preferred height, access requirements, openings, or special project notes..."
                className="w-full border px-4 py-2 rounded min-h-[100px]"
              ></textarea>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <p className="text-sm font-semibold text-gray-900">Need a different starting point?</p>
              <div className="mt-3 flex flex-col gap-2 text-sm">
                <Link href="/warehouse-builder" className="font-semibold text-[#da1a33] hover:underline">
                  Want a live visual design flow? Try the warehouse builder.
                </Link>
                <Link href="/tools/estimator" className="font-semibold text-[#da1a33] hover:underline">
                  Want a faster budget check first? Use the estimator.
                </Link>
              </div>
            </div>

            {/* Submit */}
            <div className="mt-6">
              <button
                type="submit"
                className="bg-[#da1a33] text-white px-6 py-3 rounded hover:bg-[#bf172d] transition w-full"
              >
                Send Warehouse Enquiry
              </button>
            </div>
          </form>
        </section>

        {/* Explore More */}
        <section className="max-w-7xl mx-auto py-20">
          <h2 className="text-3xl font-bold mb-6 text-left">Explore more warehouse content</h2>
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
            <Link
              href="/warehouse-builder"
              className="border rounded-md p-6 hover:bg-gray-50 transition block"
            >
              <h3 className="font-semibold text-lg text-[#da1a33]">
                Warehouse builder →
              </h3>
              <p className="text-sm mt-1 text-gray-700">
                Configure a warehouse online, preview it live, and send a structured enquiry.
              </p>
            </Link>
            <Link
              href="/tools/estimator"
              className="border rounded-md p-6 hover:bg-gray-50 transition block"
            >
              <h3 className="font-semibold text-lg text-[#da1a33]">
                Warehouse estimator →
              </h3>
              <p className="text-sm mt-1 text-gray-700">
                Check a quicker warehouse budget range before moving into a detailed design.
              </p>
            </Link>
            <Link
              href="/warehouse-cost"
              className="border rounded-md p-6 hover:bg-gray-50 transition block"
            >
              <h3 className="font-semibold text-lg text-[#da1a33]">
                Warehouse cost guides →
              </h3>
              <p className="text-sm mt-1 text-gray-700">
                Compare popular warehouse sizes and pricing paths across the Smart Steel cluster.
              </p>
            </Link>
            <Link
              href="/warehouse-regions"
              className="border rounded-md p-6 hover:bg-gray-50 transition block"
            >
              <h3 className="font-semibold text-lg text-[#da1a33]">
                Warehouse regions →
              </h3>
              <p className="text-sm mt-1 text-gray-700">
                See warehouse pages built around regional delivery, local fit, and project context.
              </p>
            </Link>
            <Link
              href="/recent"
              className="border rounded-md p-6 hover:bg-gray-50 transition block"
            >
              <h3 className="font-semibold text-lg text-[#da1a33]">
                Recent projects →
              </h3>
              <p className="text-sm mt-1 text-gray-700">
                Explore completed structures and case studies across South
                Africa.
              </p>
            </Link>
            <Link
              href="/resources"
              className="border rounded-md p-6 hover:bg-gray-50 transition block"
            >
              <h3 className="font-semibold text-lg text-[#da1a33]">
                Technical resources and brochures →
              </h3>
              <p className="text-sm mt-1 text-gray-700">
                Browse our range of guides, datasheets, and design tools for
                your build.
              </p>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
