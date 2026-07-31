import Link from "next/link";

import BuyerIntentCluster from "@/components/BuyerIntentCluster";
import { getFeaturedLocationPages } from "@/data/locationPages";

const pageUrl =
  "https://www.pequenohome.com/articles/lightweight-steel-frame-home-approvals-south-africa";

const faqs = [
  {
    question: "Are lightweight steel frame homes allowed in South Africa?",
    answer:
      "Yes. Lightweight steel frame homes can be approved in South Africa when the design, engineering, documentation, and submission process meet the requirements of the relevant authority and any estate or site-specific rules.",
  },
  {
    question: "Do LSF homes still need municipal approval?",
    answer:
      "Yes. In most cases, a lightweight steel frame home still needs the same normal approvals process as another permanent building, including plans, engineering input where required, and compliance with local regulations.",
  },
  {
    question: "Can an estate reject an LSF home?",
    answer:
      "An estate may not object to the structural system itself, but it can reject a design that does not meet its rules for roof form, materials, colour palette, scale, or overall architectural language.",
  },
  {
    question: "When do approvals become easier?",
    answer:
      "Approvals usually become smoother when the architectural brief, structural strategy, and site constraints are understood early, instead of being forced into the process late.",
  },
];

export const metadata = {
  title: "Are Lightweight Steel Frame Homes Approved in South Africa? | Pequeno",
  description:
    "Learn how lightweight steel frame home approvals work in South Africa, including municipal plans, estate rules, engineering input, and site-specific requirements.",
  keywords: [
    "are lightweight steel frame homes approved in south africa",
    "lsf home approvals south africa",
    "light steel frame house approval south africa",
    "municipal approval for lsf homes",
    "estate approval lightweight steel homes",
  ],
  alternates: {
    canonical: pageUrl,
  },
  openGraph: {
    title: "Are Lightweight Steel Frame Homes Approved in South Africa? | Pequeno",
    description:
      "A practical guide to municipal approvals, estate design rules, engineering, and planning for LSF homes in South Africa.",
    url: pageUrl,
    siteName: "Pequeño",
    locale: "en_ZA",
    type: "article",
  },
};

function buildJsonLd() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: metadata.title,
      description: metadata.description,
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": pageUrl,
      },
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
          url: "https://www.pequenohome.com/logo.png",
        },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
  ];
}

export default function LsfApprovalsArticlePage() {
  const jsonLd = buildJsonLd();
  const featuredLocations = getFeaturedLocationPages(4);

  return (
    <main className="pb-20 text-gray-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="mx-auto max-w-5xl px-6 py-24">
        <nav className="mb-10 text-sm text-gray-600" aria-label="Breadcrumb">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/articles" className="hover:underline">
            Articles
          </Link>
          <span className="mx-2">/</span>
          <span className="font-medium text-gray-900">LSF approvals</span>
        </nav>

        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#c45734]">
          Approvals
        </p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight md:text-6xl">
          Are lightweight steel frame homes approved in South Africa?
        </h1>
        <p className="mt-6 text-xl leading-9 text-gray-600">
          Yes, they can be. The real question is not whether LSF is a
          recognised building approach, but whether the project is properly
          designed, documented, engineered, and aligned with the rules that
          apply to the site.
        </p>

        <div className="mt-10 rounded-[2rem] border border-black/10 bg-[#f7f2ec] p-6 md:p-8">
          <p className="text-lg leading-8 text-gray-700">
            In practice, approvals usually depend on a combination of{" "}
            <strong>municipal requirements</strong>,{" "}
            <strong>estate design rules</strong>,{" "}
            <strong>structural engineering</strong>, and whether the proposed
            building matches the intended use and site conditions.
          </p>
        </div>

        <section className="mt-16 space-y-6 text-lg leading-8 text-gray-700">
          <h2 className="text-3xl font-semibold text-gray-900">
            Lightweight steel frame homes are not outside the normal process
          </h2>
          <p>
            A permanent lightweight steel frame home does not usually bypass the
            standard approvals path. If you are building a real home, staff
            accommodation block, guest unit, or commercial structure, you still
            need the design and submission work that any serious project
            requires.
          </p>
          <p>
            What changes is the structural system and the level of detailing
            needed to show how the building will be assembled and perform. That
            is why it helps to have the architecture and structural logic
            aligned early, rather than trying to retrofit the process later.
          </p>
        </section>

        <section className="mt-16">
          <h2 className="text-3xl font-semibold text-gray-900">
            What approvals usually matter?
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {[
              {
                title: "Municipal plans",
                text: "The local authority usually needs a complete plans submission that reflects the intended use, size, layout, and compliance requirements of the building.",
              },
              {
                title: "Structural engineering",
                text: "LSF projects need proper engineering input so the frame, loads, spans, and connections are documented appropriately for the application.",
              },
              {
                title: "Estate design review",
                text: "Many South African projects sit in estates where design codes can influence roof pitch, materials, colour palette, external form, and visible services.",
              },
              {
                title: "Site-specific constraints",
                text: "Slope, access, servitudes, bushveld setbacks, floodlines, and infrastructure limitations can all shape what will or will not be approved.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl bg-[#f7f2ec] p-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="mt-3 text-base leading-7 text-gray-700">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 space-y-6 text-lg leading-8 text-gray-700">
          <h2 className="text-3xl font-semibold text-gray-900">
            Estates and lifestyle sites often shape the real approval challenge
          </h2>
          <p>
            In many of Pequeno&apos;s target markets, the bigger issue is not
            whether lightweight steel framing is acceptable in principle. It is
            whether the proposed building feels right for the estate, reserve,
            or surrounding context.
          </p>
          <p>
            A well-designed LSF home can sit comfortably in a bushveld estate, a
            highland retreat setting, or a suburban edge condition. But the
            design needs to respond to the place. That usually means thinking
            carefully about roof form, shaded outdoor space, materials,
            fenestration, and how the building meets the ground.
          </p>
        </section>

        <section className="mt-16">
          <h2 className="text-3xl font-semibold text-gray-900">
            Where local conditions make a difference
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {featuredLocations.map((location) => (
              <Link
                key={location.slug}
                href={`/${location.slug}`}
                className="rounded-2xl border border-black/10 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-sm"
              >
                <p className="text-xs uppercase tracking-[0.22em] text-gray-500">
                  {location.province}
                </p>
                <h3 className="mt-3 text-2xl font-semibold text-gray-900">
                  Build in {location.place}
                </h3>
                <p className="mt-3 text-base leading-7 text-gray-700">
                  {location.regulatoryFocus}
                </p>
                <p className="mt-5 text-sm font-medium text-[#ff5c36]">
                  Explore this location →
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-16 space-y-6 text-lg leading-8 text-gray-700">
          <h2 className="text-3xl font-semibold text-gray-900">
            What helps the process go more smoothly?
          </h2>
          <ul className="grid gap-4 md:grid-cols-2">
            {[
              "Start with a clear brief and realistic intended use for the building.",
              "Understand whether estate rules apply before the design is pushed too far.",
              "Coordinate architectural and structural thinking early.",
              "Plan around site access, services, and infrastructure constraints from the start.",
              "Use the approvals stage to sharpen the project, not only to get a stamp.",
              "Allow time for municipal and review cycles instead of assuming an instant process.",
            ].map((item) => (
              <li key={item} className="rounded-2xl bg-[#f7f2ec] p-5">
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-16 space-y-4">
          <h2 className="text-3xl font-semibold">Common approval questions</h2>
          {faqs.map((item) => (
            <details
              key={item.question}
              className="rounded-2xl border border-black/10 bg-white p-6"
            >
              <summary className="cursor-pointer text-lg font-medium text-gray-900">
                {item.question}
              </summary>
              <p className="mt-4 text-base leading-7 text-gray-700">
                {item.answer}
              </p>
            </details>
          ))}
        </section>

        <section className="mt-16 rounded-[2rem] bg-[linear-gradient(135deg,#111827,#1f2937)] p-8 text-white md:p-10">
          <h2 className="text-3xl font-semibold">
            Want to sense-check your site and approval path?
          </h2>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-white/78">
            Tell us where you want to build, whether an estate or review body is
            involved, and what kind of building you have in mind. We can help
            you understand whether the brief is a good fit for Pequeno&apos;s
            approach.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href="/enquire"
              className="rounded-full bg-[#ff5c36] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#e44d28]"
            >
              Enquire about your site
            </Link>
            <Link
              href="/architecture"
              className="rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-gray-900"
            >
              Explore our architecture approach
            </Link>
          </div>
        </section>

        <BuyerIntentCluster
          currentHref="/articles/lightweight-steel-frame-home-approvals-south-africa"
          title="Explore the rest of the buyer planning series"
          intro="Approvals are only one part of the decision. These guides also help you compare systems, understand costs, and plan around realistic delivery timelines."
        />
      </article>
    </main>
  );
}
