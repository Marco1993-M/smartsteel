import Link from "next/link";

import ProjectProofGrid from "@/components/ProjectProofGrid";
import { basePackages, getFeaturedLocationPages } from "@/data/locationPages";
import {
  getKeywordLandingPage,
  keywordLandingPageList,
} from "@/data/keywordLandingPages";

export function getKeywordMetadata(page) {
  const url = `https://www.pequenohome.com/${page.slug}`;

  return {
    title: page.title,
    description: page.description,
    keywords: [
      page.keyword,
      page.shortTitle.toLowerCase(),
      "lightweight steel homes south africa",
      "architect-led homes south africa",
      "premium prefab homes south africa",
      ...(page.extraKeywords || []),
    ],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: page.title,
      description: page.ogDescription || page.description,
      url,
      siteName: "Pequeño",
      locale: "en_ZA",
      type: "article",
      images: [
        {
          url: page.image,
          width: 1600,
          height: 900,
          alt: page.shortTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.ogDescription || page.description,
      images: [page.image],
    },
  };
}

export function buildKeywordJsonLd(page) {
  const pageUrl = `https://www.pequenohome.com/${page.slug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: page.shortTitle,
      url: pageUrl,
      description: page.description,
      about: [
        page.keyword,
        "Lightweight steel homes South Africa",
        "Architect-led homes South Africa",
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: page.faqs.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
  ];

  if (page.priceIntent) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "Service",
      name: page.shortTitle,
      serviceType: "Architect-led lightweight steel frame homes",
      areaServed: {
        "@type": "Country",
        name: "South Africa",
      },
      provider: {
        "@type": "Organization",
        name: "Pequeño",
        url: "https://www.pequenohome.com",
      },
      offers: basePackages.map((pkg) => ({
        "@type": "Offer",
        name: pkg.name,
        priceCurrency: "ZAR",
        priceSpecification: {
          "@type": "PriceSpecification",
          priceCurrency: "ZAR",
          minPrice:
            pkg.name === "Starter Home"
              ? 850000
              : pkg.name === "Family Home"
                ? 1450000
                : 2800000,
        },
        description: `${pkg.price}. ${pkg.size}.`,
      })),
    });
  }

  return jsonLd;
}

export default function KeywordLandingPage({ slug }) {
  const page = getKeywordLandingPage(slug);

  if (!page) return null;

  const featuredLocations = getFeaturedLocationPages(4);
  const relatedPages = (page.related || [])
    .map((item) => getKeywordLandingPage(item))
    .filter(Boolean);
  const jsonLd = buildKeywordJsonLd(page);

  return (
    <main className="pb-20 text-gray-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="mx-auto w-[95%] max-w-7xl px-0 pt-20 md:pt-24">
        <div className="max-w-4xl">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.26em] text-[#c45734]">
            {page.eyebrow}
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-[1.02] tracking-tight text-gray-900 md:text-6xl">
            {page.heroTitle}
          </h1>
          <p className="mt-6 max-w-3xl text-[1.05rem] leading-8 text-gray-700 md:text-[1.18rem]">
            {page.heroIntro}
          </p>
          <p className="mt-4 text-[0.72rem] font-medium uppercase tracking-[0.24em] text-gray-500">
            {page.heroProof}
          </p>

          <div className="mt-6 flex flex-wrap gap-2.5">
            {page.chips.map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-black/10 bg-white px-4 py-2 text-[0.68rem] uppercase tracking-[0.24em] text-gray-600 shadow-sm"
              >
                {chip}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/enquire"
              className="rounded-full bg-[#ff5c36] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#e44d28]"
            >
              Talk about your project
            </Link>
            <Link
              href="/projects"
              className="rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm transition hover:border-[#ff5c36] hover:text-[#ff5c36]"
            >
              View built projects
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-10 w-[95%] max-w-7xl">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              title: "Premium framing",
              text: "Architect-led homes and buildings rather than commodity prefab units.",
            },
            {
              title: "Useful context",
              text: "See how design, site, and budget influence the right brief before you commit to the wrong route.",
            },
            {
              title: "Clear next steps",
              text: "Move into projects, pricing, or the main LSF guide depending on where you are in the process.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-[1.75rem] border border-black/10 bg-white p-7 shadow-[0_1px_0_rgba(0,0,0,0.02)]"
            >
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#c45734]">
                {item.title}
              </p>
              <p className="mt-3 text-[0.98rem] leading-7 text-gray-700">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {page.sections.map((section, index) => (
        <section
          key={section.title}
          className={`mx-auto mt-20 w-[95%] max-w-7xl ${
            index % 2 === 1
              ? "rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm md:p-12"
              : ""
          }`}
        >
          <div className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
            <div>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#c45734]">
                {section.label}
              </p>
              <h2 className="mt-3 text-3xl font-semibold leading-[1.08] tracking-tight text-gray-900 md:text-4xl lg:text-5xl">
                {section.title}
              </h2>
            </div>
            <div className="space-y-5 text-[1.02rem] leading-8 text-gray-700">
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.bullets ? (
                <ul className="space-y-4 pt-2">
                  {section.bullets.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 text-[0.98rem] leading-7 text-gray-700"
                    >
                      <span className="mt-2 h-2 w-2 rounded-full bg-[#ff5c36]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </section>
      ))}

      {page.priceIntent ? (
        <section className="mx-auto mt-20 w-[95%] max-w-7xl rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm md:p-12">
          <div className="grid gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
            <div>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#c45734]">
                Price Snapshot
              </p>
              <h2 className="mt-3 text-3xl font-semibold leading-[1.08] tracking-tight text-gray-900 md:text-4xl lg:text-5xl">
                {page.priceSnapshotTitle ||
                  "Planning ranges before the detailed quote"}
              </h2>
              <p className="mt-5 text-[1.02rem] leading-8 text-gray-700">
                {page.priceSnapshotIntro ||
                  "Use these as early budget bands. A proper quote still depends on the site, design scope, specification, access, foundations, services, and finish level."}
              </p>
              <Link
                href="/articles/lightweight-steel-frame-home-cost-south-africa"
                className="mt-6 inline-block text-sm font-medium text-[#ff5c36] hover:underline"
              >
                Read the full LSF cost guide →
              </Link>
            </div>

            <div className="grid gap-4">
              {basePackages.map((pkg) => (
                <article
                  key={pkg.name}
                  className={`rounded-[1.5rem] border p-6 ${
                    pkg.featured
                      ? "border-[#ff5c36] bg-[#fff5f1]"
                      : "border-black/10 bg-[#faf6f1]"
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-[0.7rem] uppercase tracking-[0.24em] text-gray-500">
                        {pkg.featured ? "Most requested" : "Planning range"}
                      </p>
                      <h3 className="mt-2 text-2xl font-semibold tracking-tight text-gray-900">
                        {pkg.name}
                      </h3>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-2xl font-semibold text-gray-900">
                        {pkg.price}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">{pkg.size}</p>
                    </div>
                  </div>
                  <ul className="mt-5 grid gap-3 text-sm leading-6 text-gray-700 md:grid-cols-3">
                    {pkg.details.map((detail) => (
                      <li key={detail} className="rounded-2xl bg-white p-4">
                        {detail}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>

          {page.searchQuestions?.length ? (
            <div className="mt-10 rounded-[1.5rem] bg-[#101721] p-6 text-white md:p-8">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-white/60">
                Searches This Page Answers
              </p>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {page.searchQuestions.map((item) => (
                  <p
                    key={item}
                    className="rounded-2xl border border-white/10 bg-white/10 p-4 text-sm leading-6 text-white/82"
                  >
                    {item}
                  </p>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="mx-auto mt-20 w-[95%] max-w-7xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#c45734]">
              Built Projects
            </p>
            <h2 className="mt-3 text-3xl font-semibold leading-[1.08] tracking-tight text-gray-900 md:text-4xl lg:text-5xl">
              Built work that makes the approach real
            </h2>
          </div>
          <Link
            href="/projects"
            className="inline-block rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#ff5c36]"
          >
            View all projects
          </Link>
        </div>
        <div className="mt-10">
          <ProjectProofGrid limit={2} compact />
        </div>
      </section>

      <section className="mx-auto mt-20 w-[95%] max-w-7xl rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm md:p-12">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="max-w-2xl">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#c45734]">
              Explore Further
            </p>
            <h2 className="mt-3 text-3xl font-semibold leading-[1.08] tracking-tight text-gray-900 md:text-4xl lg:text-5xl">
              Continue into the parts of the site that help shape the brief
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                href: "/lightweight-steel-frame-homes-south-africa",
                title: "Lightweight steel frame homes",
                text: "The main national pillar page for the system, process, and project fit.",
              },
              {
                href: "/architecture",
                title: "Architecture",
                text: "See how the design thinking behind Pequeno works before the brief is fixed.",
              },
              {
                href: "/projects",
                title: "Built projects",
                text: "Review real South African proof across private homes, retreats, and lifestyle buildings.",
              },
              {
                href: "/locations",
                title: "Locations",
                text: "Explore how climate, region, and site conditions change the right brief.",
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-[1.5rem] bg-[#faf6f1] p-6 ring-1 ring-black/5 transition hover:bg-[#f3ece3]"
              >
                <p className="text-lg font-semibold tracking-tight text-gray-900">
                  {item.title}
                </p>
                <p className="mt-3 text-sm leading-6 text-gray-700">
                  {item.text}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-20 w-[95%] max-w-7xl">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {featuredLocations.map((location) => (
            <Link
              key={location.slug}
              href={`/${location.slug}`}
              className="rounded-[1.5rem] border border-black/10 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <p className="text-[0.7rem] uppercase tracking-[0.24em] text-gray-500">
                {location.province}
              </p>
              <h3 className="mt-3 text-xl font-semibold tracking-tight text-gray-900">
                Build in {location.place}
              </h3>
              <p className="mt-3 text-sm leading-6 text-gray-700">
                Homes tailored to {location.region}, with local planning and
                climate considerations built into the page.
              </p>
            </Link>
          ))}
        </div>
      </section>

      {relatedPages.length ? (
        <section className="mx-auto mt-20 w-[95%] max-w-7xl rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm md:p-12">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#c45734]">
                More To Explore
              </p>
              <h2 className="mt-3 text-3xl font-semibold leading-[1.08] tracking-tight text-gray-900 md:text-4xl lg:text-5xl">
                Other pages that may help shape the brief
              </h2>
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {relatedPages.map((item) => (
              <Link
                key={item.slug}
                href={`/${item.slug}`}
                className="rounded-[1.5rem] bg-[#faf6f1] p-6 ring-1 ring-black/5 transition hover:bg-[#f3ece3]"
              >
                <p className="text-[0.7rem] uppercase tracking-[0.24em] text-gray-500">
                  More reading
                </p>
                <h3 className="mt-3 text-lg font-semibold tracking-tight text-gray-900">
                  {item.shortTitle}
                </h3>
                <p className="mt-3 text-sm leading-6 text-gray-700">
                  {item.description}
                </p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mx-auto mt-20 w-[95%] max-w-7xl rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm md:p-12">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="max-w-2xl">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#c45734]">
              Questions
            </p>
            <h2 className="mt-3 text-3xl font-semibold leading-[1.08] tracking-tight text-gray-900 md:text-4xl lg:text-5xl">
              Common questions around {page.shortTitle.toLowerCase()}
            </h2>
          </div>
          <div className="space-y-4">
            {page.faqs.map((item) => (
              <details
                key={item.question}
                className="group rounded-[1.5rem] border border-black/10 bg-[#faf6f1] p-6"
              >
                <summary className="cursor-pointer list-none text-[1.02rem] font-medium tracking-tight text-gray-900">
                  <span className="flex items-start justify-between gap-4">
                    <span>{item.question}</span>
                    <span className="text-[#ff5c36] transition group-open:rotate-45">
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-4 text-[0.98rem] leading-7 text-gray-700">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-20 w-[95%] max-w-7xl rounded-[2rem] bg-[linear-gradient(135deg,#111827,#1f2937)] px-8 py-12 text-white md:px-12 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-white/60">
              Start Planning
            </p>
            <h2 className="mt-3 text-3xl font-semibold leading-[1.08] tracking-tight md:text-4xl lg:text-5xl">
              Looking for the right fit for the project?
            </h2>
            <p className="mt-5 max-w-3xl text-[1.02rem] leading-8 text-white/78">
              Tell us about your land, your intended use, and the level of
              outcome you want. We can help decide whether Pequeno is the right
              design and construction partner for the brief.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/enquire"
              className="rounded-full bg-[#ff5c36] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#e44d28]"
            >
              Enquire about your project
            </Link>
            <Link
              href="/architecture"
              className="rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-gray-900"
            >
              Explore architecture
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export function getKeywordStaticSlugs() {
  return keywordLandingPageList.map((page) => page.slug);
}
