"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import Script from "next/script";

function Breadcrumbs() {
  return (
    <nav
      aria-label="Breadcrumb"
      className="text-sm text-gray-600 mb-8 max-w-5xl mx-auto px-6"
    >
      <ol className="list-reset flex">
        <li>
          <Link href="/" className="hover:underline">
            Home
          </Link>
        </li>
        <li>
          <span className="mx-2">/</span>
        </li>
        <li>
          <Link href="/articles" className="hover:underline">
            Articles
          </Link>
        </li>
        <li>
          <span className="mx-2">/</span>
        </li>
        <li aria-current="page" className="text-gray-900 font-semibold">
          Exploring Modular Architecture
        </li>
      </ol>
    </nav>
  );
}

function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-300 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between w-full text-left font-semibold text-lg focus:outline-none"
        aria-expanded={isOpen}
      >
        <span>{question}</span>
        <svg
          className={`w-6 h-6 transform transition-transform duration-300 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {isOpen && <p className="mt-3 text-gray-700">{answer}</p>}
    </div>
  );
}

export default function ModularArticleClient() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Exploring Modular Architecture: Reshaping the South African Landscape",
    description:
      "Modular architecture is reshaping South Africa with cleaner delivery, stronger design control, and more efficient building methods. Learn about its benefits and Pequeño’s approach.",
    image: "https://www.pequenohome.com/images/modular-hero.jpg",
    author: {
      "@type": "Organization",
      name: "Pequeño",
      url: "https://www.pequenohome.com",
    },
    publisher: {
      "@type": "Organization",
      name: "Pequeño",
      logo: {
        "@type": "ImageObject",
        url: "https://www.pequenohome.com/images/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": "https://www.pequenohome.com/articles/exploring-modular-architecture",
    },
    datePublished: "2025-08-01",
    dateModified: "2025-08-01",
  };

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.pequenohome.com/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Articles",
        item: "https://www.pequenohome.com/articles",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Exploring Modular Architecture",
        item: "https://www.pequenohome.com/articles/exploring-modular-architecture",
      },
    ],
  };

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Are modular homes durable?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Pequeño homes use high-quality, lightweight steel engineered to endure South Africa's diverse climates.",
        },
      },
      {
        "@type": "Question",
        name: "Can I customise the design?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Absolutely. Each home is tailored to your lifestyle, land conditions, and architectural brief.",
        },
      },
      {
        "@type": "Question",
        name: "Are modular homes more affordable than traditional homes?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "They can support cost and programme efficiencies, but the real value depends on the site, specification, and the level of finish or design ambition.",
        },
      },
      {
        "@type": "Question",
        name: "Do they meet South African building codes?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. All Pequeño homes comply fully with local building regulations.",
        },
      },
    ],
  };

  return (
    <>
      <Head>
        <title>Exploring Modular Architecture | Pequeño</title>
        <meta
          name="description"
          content="Explore how modular steel architecture is reshaping South Africa’s building landscape through cleaner delivery, stronger design control, and a more considered approach to modern homes."
        />
      </Head>

      {/* Use next/script to inject JSON-LD for better Google detection */}
      <Script
        id="article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />

      <Breadcrumbs />

      <article className="px-6 py-16 font-sans text-gray-900 leading-relaxed">
  <div className="text-center max-w-3xl mx-auto">
    <h1 className="text-4xl font-bold mb-4">
      Exploring Modular Architecture: Reshaping the South African Landscape
    </h1>

    <p className="text-lg mb-2 text-gray-600">By Pequeño</p>
    <p className="text-sm mb-2 text-gray-500">Photography by Pequeño</p>
    <p className="text-sm text-gray-500 mb-8">01 August 2025</p>
  </div>

  {/* Full-width Hero Image */}
  <div className="w-full mb-10">
    <Image
      src="/images/modular-hero.jpg"
      alt="Modular steel home in South Africa"
      width={1920}
      height={960}
      className="w-full h-auto object-cover rounded-none"
      priority
    />
  </div>

  {/* Keep article content centered within max width */}
  <div className="max-w-5xl mx-auto">
    <p className="text-lg mb-8 leading-relaxed">
          Modular architecture is becoming a more serious part of the South
          African building conversation. At its best, it offers cleaner
          delivery, stronger design control, and a more efficient route to
          contemporary buildings without giving up architectural quality.
        </p>

        <blockquote className="border-l-4 border-black pl-6 italic mb-12 text-xl text-gray-700 max-w-3xl">
          “Modular design is not about limitation — it&apos;s about liberation. It
          allows us to rethink how we live, build, and adapt to the world around
          us.” — Pequeño Team
        </blockquote>

        <hr className="my-12" />

        <section className="mb-16">
          <h2 className="text-3xl font-semibold mb-6">What Is Modular Architecture?</h2>
          <p className="mb-6 max-w-3xl">
            Modular architecture involves constructing buildings from prefabricated
            sections manufactured off-site, then assembled onsite. This method
            speeds up construction, reduces waste, and allows high precision and
            flexibility when it is handled with the right design discipline.
          </p>
          <h3 className="text-2xl font-semibold mb-4">Key Benefits:</h3>
          <ul className="list-disc list-inside max-w-3xl space-y-2">
            <li>
              <strong>Speed:</strong> Up to 50% faster than conventional builds.
            </li>
            <li>
              <strong>Sustainability:</strong> Less waste, fewer site disturbances,
              and lower emissions.
            </li>
            <li>
              <strong>Cost discipline:</strong> Better control over programme, labour, and coordination when the brief is resolved early.
            </li>
            <li>
              <strong>Scalability:</strong> Easily expanded or adapted as needs
              evolve.
            </li>
          </ul>
        </section>

        <hr className="my-12" />

        <section className="mb-16">
          <h2 className="text-3xl font-semibold mb-6">Why It Matters in South Africa</h2>
          <p className="mb-6 max-w-3xl">
            South Africa faces a wide range of building pressures, from climate
            resilience and remote-site logistics to the need for cleaner, more
            predictable delivery. Modular architecture can respond well by providing:
          </p>
          <ul className="list-disc list-inside max-w-3xl space-y-2 mb-6">
            <li>
              <strong>Cleaner delivery</strong> on sites where programme and disruption matter.
            </li>
            <li>
              <strong>Lower-waste construction</strong> for clients who care about better resource use and site discipline.
            </li>
            <li>
              <strong>Design-led outcomes</strong> that still respond to local climate, site conditions, and lifestyle.
            </li>
          </ul>
        </section>

        <hr className="my-12" />

        <section className="mb-16">
          <h2 className="text-3xl font-semibold mb-6">
            Pequeño&apos;s Approach to Modular Living
          </h2>
          <p className="mb-6 max-w-3xl">
            At Pequeño, modular thinking is not about chasing the smallest or
            cheapest outcome. It is about using precision, off-site control,
            and strong architectural thinking to deliver better buildings. Our
            lightweight steel approach is especially useful for:
          </p>
          <ul className="list-disc list-inside max-w-3xl space-y-2 mb-6">
            <li>Precision manufacturing for exacting quality.</li>
            <li>Minimal site impact to preserve natural surroundings.</li>
            <li>Off-grid ready options for sustainable living.</li>
            <li>Modern architecture with a stronger link between design and delivery.</li>
          </ul>
          <blockquote className="border-l-4 border-black pl-6 italic text-gray-700 text-lg max-w-3xl">
            “We don&apos;t just build homes. We build systems that evolve with your
            life.” — Pequeño Team
          </blockquote>
        </section>

        <hr className="my-12" />

        <section className="mb-16">
          <h2 className="text-3xl font-semibold mb-6">Real-World Examples</h2>
          <ul className="list-disc list-inside max-w-3xl space-y-4 mb-6">
            <li>
              <strong>Coastal Retreats:</strong> Off-site built modular homes delivered
              to remote coastal sites with minimal environmental disruption.
            </li>
            <li>
              <strong>Urban Infill Projects:</strong> Carefully planned city and suburban projects where cleaner sequencing and tighter site control matter.
            </li>
            <li>
              <strong>Accommodation And Support Buildings:</strong> Guest accommodation, staff buildings, and related uses where repeatable quality is valuable.
            </li>
          </ul>
        </section>

        <hr className="my-12" />

        <section className="mb-24 max-w-3xl mx-auto">
          <h2 className="text-3xl font-semibold mb-8 text-center">Frequently Asked Questions</h2>

          <FAQItem
            question="Are modular homes durable?"
            answer="Yes. Pequeño homes use high-quality, lightweight steel engineered to endure South Africa&apos;s diverse climates."
          />
          <FAQItem
            question="Can I customise the design?"
            answer="Absolutely. Each home is tailored to your lifestyle, land conditions, and budget."
          />
          <FAQItem
            question="Are modular homes more affordable than traditional homes?"
            answer="Modular homes often result in cost savings due to streamlined processes and reduced labour time."
          />
          <FAQItem
            question="Do they meet South African building codes?"
            answer="Yes. All Pequeño homes comply fully with local building regulations."
          />
        </section>

        <section className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl font-bold mb-6">Explore A More Considered Modular Approach</h2>
          <p className="mb-8 max-w-xl mx-auto">
            Whether you&apos;re planning a private home, retreat, or a more
            ambitious accommodation brief, modular architecture opens up a more
            considered way to build with speed, clarity, and design control.
          </p>
          <Link
            href="https://www.pequenohome.com"
            className="inline-block bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
          >
            Explore Our Approach
          </Link>
        </section>
      </div>
      </article>
    </>
  );
}
