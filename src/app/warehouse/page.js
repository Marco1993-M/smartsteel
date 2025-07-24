'use client';

import Image from 'next/image';
import Link from 'next/link';
import emailjs from '@emailjs/browser';
import Script from 'next/script';

// SEO Metadata for this page
export const metadata = {
  title: "Customizable Sheds & Warehousing Solutions | Smart Steel",
  description:
    "Build your perfect steel shed or warehouse with Smart Steel. Choose structure sizes, colors, and extra features tailored to your needs. Fast quotes and expert support.",
  keywords: [
    "steel sheds",
    "warehouse kits",
    "custom sheds",
    "modular steel buildings",
    "warehouse solutions South Africa",
    "steel structure quote",
    "prefab warehouse",
  ],
  openGraph: {
    title: "Customizable Sheds & Warehousing Solutions | Smart Steel",
    description:
      "Build your perfect steel shed or warehouse with Smart Steel. Choose structure sizes, colors, and extra features tailored to your needs.",
    url: "https://smartsteel.co.za/warehouse",
    siteName: "Smart Steel",
    images: [
      {
        url: "/og-warehouse.jpg",
        width: 1200,
        height: 630,
        alt: "Customizable Steel Warehouse - Smart Steel",
      },
    ],
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Customizable Sheds & Warehousing Solutions | Smart Steel",
    description:
      "Build your perfect steel shed or warehouse with Smart Steel. Choose structure sizes, colors, and extra features tailored to your needs.",
    images: ["/og-warehouse.jpg"],
  },
};

// JSON-LD structured data for products/offers
const warehouseProductSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Customizable Steel Warehouse",
  description:
    "Modular steel sheds and warehouses available in 8m and 12m widths, customizable length and color options, with optional features.",
  brand: {
    "@type": "Brand",
    name: "Smart Steel",
  },
  offers: [
    {
      "@type": "Offer",
      name: "8m Wide Structure",
      priceCurrency: "ZAR",
      availability: "https://schema.org/InStock",
      url: "https://smartsteel.co.za/warehouse#8m-wide",
      priceSpecification: {
        "@type": "PriceSpecification",
        price: "Contact for quote",
      },
    },
    {
      "@type": "Offer",
      name: "12m Wide Structure",
      priceCurrency: "ZAR",
      availability: "https://schema.org/InStock",
      url: "https://smartsteel.co.za/warehouse#12m-wide",
      priceSpecification: {
        "@type": "PriceSpecification",
        price: "Contact for quote",
      },
    },
  ],
};

export default function WarehousePage() {
  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;

    const selectedOptions = [];
    form.querySelectorAll('input[type="checkbox"]:checked').forEach((checkbox) => {
      selectedOptions.push(checkbox.value);
    });

    const structure = form.querySelector('input[name="structure"]:checked')?.value;
    const length = form.length.value;
    const colour = form.colour.value;
    const name = form.name.value;
    const email = form.email.value;
    const notes = form.notes.value;

    const templateParams = {
      from_name: name,
      from_email: email,
      structure,
      length,
      colour,
      options: selectedOptions.join(', '),
      notes,
    };

    emailjs.send('service_h817nk1', 'template_vilvxrl', templateParams, 'JIPAN9YaQCPrkSgep')
      .then(() => {
        alert('Quote sent successfully!');
        form.reset();
      })
      .catch((error) => {
        console.error('EmailJS Error:', error);
        alert('Failed to send quote. Please try again.');
      });
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <Script
        id="ld-product"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(warehouseProductSchema) }}
      />

      <main className="font-sans text-gray-800 px-6 py-20 bg-white">
        {/* Hero Section */}
        <section className="max-w-5xl mx-auto text-center mb-20">
          <h1 className="text-4xl font-bold mb-4">Customizable Sheds and Warehousing Solutions</h1>
          <p className="text-lg max-w-3xl mx-auto">
            Discover our range of versatile and durable shed and warehousing options, tailored to suit various applications. 
            From open shelters to fully enclosed storage solutions, we provide customizable designs that meet your unique needs, 
            with a variety of sizes, colors, and optional features.
          </p>
        </section>

        {/* Styles Section */}
        <section className="max-w-5xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Sheds & Warehousing Styles</h2>
          <p className="text-lg max-w-2xl mx-auto">
            We offer adaptable shed and warehousing designs to cater to a wide range of uses.
          </p>
        </section>

        {/* Quote Builder */}
        <section className="max-w-5xl mx-auto my-20 px-4 py-10 border rounded-lg bg-gray-50">
          <h2 className="text-3xl font-bold mb-6 text-center">Build Your Custom Quote</h2>
          <p className="text-center max-w-2xl mx-auto mb-8">
            Select your preferred options below, and we will compile a custom quote. Once submitted, our team will get back to you shortly.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto">

            {/* Structure Selection */}
            <section className="grid md:grid-cols-2 gap-10 px-4 mb-8">
              {[{
                value: '8m Wide Structure',
                src: '/warehouse-8m.jpg',
                title: '8m Wide Structure',
                description: 'Ideal for agricultural, workshop, or small-scale storage use. Fully customizable with optional cladding, doors, and colors.'
              }, {
                value: '12m Wide Structure',
                src: '/warehouse-13m.jpg',
                title: '12m Wide Structure',
                description: 'Designed for larger operations requiring significant covered space. Suitable for warehousing, workshops, and commercial use.'
              }].map((item, idx) => (
                <label key={idx} className="border rounded-lg p-4 flex flex-col items-center text-center cursor-pointer relative hover:shadow-md transition">
                  <input
                    type="radio"
                    name="structure"
                    value={item.value}
                    className="absolute top-4 left-4 w-5 h-5 accent-[#da1a33]"
                    required
                  />
                  <Image 
                    src={item.src}
                    alt={item.title}
                    width={600}
                    height={400}
                    className="rounded mb-4"
                  />
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-700">{item.description}</p>
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
              <select name="length" required className="w-full border px-4 py-2 rounded">
                <option value="">Select Length</option>
                <option value="5m">5m</option>
                <option value="7.5m">7.5m</option>
                <option value="10m">10m</option>
                <option value="12.5m">12.5m</option>
                <option value="15m">15m</option>
                <option value="17.5m">17.5m</option>
                <option value="20m">20m</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">If you require more than 20m, please let us know in the Notes section below.</p>
            </div>

            {/* Colour Options */}
            <div>
              <h3 className="font-semibold mb-4">Colour Options</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {["Fish Eagle White", "Sandstone Beige", "Dark Dolphin", "Charcoal Grey", "Buffalo Brown", "Traffic Green", "Galvanised", "ZincAlume"].map((colour, idx) => (
                  <label key={idx} className="cursor-pointer flex flex-col items-center">
                    <input
                      type="radio"
                      name="colour"
                      value={colour}
                      required
                      className="mb-2"
                    />
                    <img src={`/colours/${colour.toLowerCase().replace(/ /g, '-')}.jpg`} alt={colour} className="w-16 h-16 object-cover rounded mb-1 border" />
                    <span className="text-sm">{colour}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Optional Extra Features */}
            <div className="space-y-4 mt-6">
              <h3 className="font-semibold mb-2">Optional Extra Features</h3>
              {["Enclosed Building", "Gutters & Rain Water Down Pipes", "Installation", "Air Vents", "Polycarbonate Sheets"].map((feature, idx) => (
                <label key={idx} className="block">
                  <input type="checkbox" value={feature} className="mr-2" /> {feature}
                </label>
              ))}
            </div>

            {/* Notes */}
            <div className="mt-6">
              <textarea
                name="notes"
                placeholder="Additional notes or requirements..."
                className="w-full border px-4 py-2 rounded min-h-[100px]"
              ></textarea>
            </div>

            {/* Submit */}
            <div className="mt-6">
              <button
                type="submit"
                className="bg-[#da1a33] text-white px-6 py-3 rounded hover:bg-[#bf172d] transition w-full"
              >
                Submit Quote Request
              </button>
            </div>
          </form>
        </section>

        {/* Explore More */}
        <section className="max-w-7xl mx-auto py-20">
          <h2 className="text-3xl font-bold mb-6 text-left">Explore more content</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Link href="/projects" className="border rounded-md p-6 hover:bg-gray-50 transition block">
              <h3 className="font-semibold text-lg text-[#da1a33]">Recent projects →</h3>
              <p className="text-sm mt-1 text-gray-700">Explore completed structures and case studies across South Africa.</p>
            </Link>
            <Link href="/resources" className="border rounded-md p-6 hover:bg-gray-50 transition block">
              <h3 className="font-semibold text-lg text-[#da1a33]">Technical resources and brochures →</h3>
              <p className="text-sm mt-1 text-gray-700">Browse our range of guides, datasheets, and design tools for your build.</p>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
