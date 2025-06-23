'use client';
import { useState } from 'react';
import { FaPhoneAlt, FaCloudSun, FaChevronDown } from 'react-icons/fa';
import Link from 'next/link';


export default function ContactPage() {
  const [activeFAQ, setActiveFAQ] = useState(null);

  const faqs = [
    {
      question: "What makes Smart Steel structures different from traditional building methods?",
      answer: "Smart Steel uses lightweight, modular steel frames that are quicker to assemble, more cost-efficient, and environmentally friendly compared to conventional materials.",
    },
    {
      question: "Can I customize a structure to suit my specific requirements?",
      answer: "Yes! We specialize in custom designs for homes, warehouses, and off-grid solutions tailored to your needs.",
    },
    {
      question: "Do Smart Steel products come with a warranty?",
      answer: "All our frames come with a 10-year structural warranty for peace of mind.",
    },
    {
      question: "Do I need special tools or skills to assemble the steel kits?",
      answer: "No special tools are required. Our kits are designed for ease of use and include clear installation guides.",
    },
    {
      question: "Where are your products manufactured and delivered from?",
      answer: "We manufacture in Plettenberg Bay, South Africa, and deliver nationwide through our distribution partners.",
    },
  ];

  return (
            
    <main className="font-sans text-gray-800 px-6 py-20 bg-white">
      {/* Contact Header + Form */}
      <section className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-start">
        <div>
          <h1 className="text-4xl font-bold mb-4 text-left">Need to get in touch?</h1>
          <p className="text-lg text-left max-w-md">
            We're here to help! Simply fill out the form, and one of our team will get back to you soon.
          </p>
        </div>

        <form className="bg-gray-50 border rounded-lg p-6 space-y-4 w-full">
          <input
            type="text"
            placeholder="Name"
            className="w-full border px-4 py-2 rounded"
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full border px-4 py-2 rounded"
          />
          <textarea
            rows={4}
            placeholder="Your message"
            className="w-full border px-4 py-2 rounded"
          />
          <button
            type="submit"
            className="bg-[#da1a33] text-white px-6 py-2 rounded hover:bg-[#bf172d] transition"
          >
            Send Message
          </button>
        </form>
      </section>

      {/* Support Details */}
      <section className="max-w-7xl mx-auto mt-20">
        <h2 className="text-3xl font-bold mb-6 text-left">Enquiries and support</h2>
        <p className="mb-8 text-left max-w-md">You can reach our support team by phone.</p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="border p-4 rounded-md flex items-start gap-4">
            <FaPhoneAlt className="text-2xl text-[#da1a33] mt-1" />
            <div>
              <p className="font-semibold">Phone</p>
              <p className="text-sm text-gray-700">+27 87 012 3456</p>
            </div>
          </div>

          <div className="border p-4 rounded-md flex items-start gap-4">
            <FaCloudSun className="text-2xl text-[#da1a33] mt-1" />
            <div>
              <p className="font-semibold">Opening Times</p>
              <p className="text-sm text-gray-700">Mon–Fri: 08:00–17:00<br />Sat–Sun: Closed</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mt-20 py-16 px-6 bg-gray-50">
  <div className="max-w-3xl mx-auto text-center">
    <h2 className="text-3xl font-bold mb-6">Frequently asked questions</h2>
    <p className="mb-8 max-w-xl mx-auto">
      Explore our FAQs for answers to common questions.
    </p>

    <div className="space-y-4 text-left">
      {faqs.map((faq, index) => (
        <div
          key={index}
          className="border rounded-md p-4 cursor-pointer"
          onClick={() => setActiveFAQ(activeFAQ === index ? null : index)}
        >
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">{faq.question}</h3>
            <FaChevronDown
              className={`transition-transform ${
                activeFAQ === index ? 'rotate-180' : ''
              }`}
            />
          </div>
          {activeFAQ === index && (
            <p className="mt-2 text-sm text-gray-700">{faq.answer}</p>
          )}
        </div>
      ))}
    </div>
  </div>
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
  );
}
