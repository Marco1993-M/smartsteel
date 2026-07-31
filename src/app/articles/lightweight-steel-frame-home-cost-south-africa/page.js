import Link from "next/link";

import BuyerIntentCluster from "@/components/BuyerIntentCluster";
import ProjectProofGrid from "@/components/ProjectProofGrid";
import { basePackages } from "@/data/locationPages";

const pageUrl =
  "https://www.pequenohome.com/articles/lightweight-steel-frame-home-cost-south-africa";

const quickAnswers = [
  "Pequeno lightweight steel frame homes start from around R850,000 for compact, efficient briefs.",
  "A family-home planning range starts from around R1.45m for roughly 120-180 m2.",
  "Larger custom homes usually start from around R2.8m+ before premium specification, site, and services are fully resolved.",
  "Cost per m2 is useful for early sense-checking, but final pricing depends on site access, foundations, design complexity, services, glazing, cladding, insulation, and finish level.",
];

const priceBands = [
  {
    label: "Starter LSF home",
    budget: "From R850,000",
    size: "Approx. 60-90 m2",
    perM2: "Approx. R9,500-R14,200 per m2",
    fit: "Compact private homes, refined cottages, guest units, or simple sites with disciplined finishes.",
  },
  {
    label: "Family LSF home",
    budget: "From R1.45m",
    size: "Approx. 120-180 m2",
    perM2: "Approx. R8,100-R12,100 per m2",
    fit: "Permanent homes, estate living, and multibedroom layouts with stronger comfort and finish requirements.",
  },
  {
    label: "Large custom LSF home",
    budget: "From R2.8m+",
    size: "180 m2 and up",
    perM2: "From approx. R15,600 per m2",
    fit: "Architect-led custom homes, larger spans, view-focused sites, premium finishes, and off-grid-ready systems.",
  },
];

const faqs = [
  {
    question: "What is the starting cost of a lightweight steel frame home?",
    answer:
      "An entry-level Pequeno home can begin from around R850,000, depending on size, specification, site access, foundations, services, finishes, and location.",
  },
  {
    question: "What is the light steel frame cost per m2 in South Africa?",
    answer:
      "People often search for a light steel frame cost per m2 in South Africa, but it is only a rough planning shortcut. The real cost depends on the design, structural spans, site conditions, foundations, glazing, insulation, cladding, services, and level of finish.",
  },
  {
    question: "Why do LSF home prices vary so much?",
    answer:
      "The frame is only one part of the build. Final cost is shaped by design complexity, site conditions, transport, foundations, insulation, cladding, roofing, windows, services, and interior finishes.",
  },
  {
    question: "Is LSF always cheaper than brick construction?",
    answer:
      "Not always. The value of LSF is usually in speed, precision, cleaner site work, design flexibility, and long-term performance. On some projects it may reduce cost, but it should not be treated as a cheap shortcut.",
  },
  {
    question: "When can Pequeno give an accurate quote?",
    answer:
      "A more accurate quote becomes possible once the site, access, size, design brief, specification level, and service requirements are understood.",
  },
];

export const metadata = {
  title: "Light Steel Frame Cost per m2 South Africa | Prices & Ranges",
  description:
    "Light steel frame cost per m2 in South Africa, with Pequeno planning ranges from R850,000, R1.45m and R2.8m+, plus the cost drivers that affect an LSF quote.",
  keywords: [
    "light steel frame cost per m2 in south africa",
    "light steel frame cost per square metre south africa",
    "light steel frame price South Africa",
    "lightweight steel frame home cost South Africa",
    "LSF home prices South Africa",
    "steel frame house cost South Africa",
    "steel frame building cost per square metre",
    "modular home cost South Africa",
    "prefab home prices South Africa",
    "steel frame house kits South Africa prices",
  ],
  alternates: {
    canonical: pageUrl,
  },
  openGraph: {
    title: "Light Steel Frame Cost per m2 South Africa | Prices & Ranges",
    description:
      "A practical guide to light steel frame cost per m2 in South Africa, with budget ranges, price drivers, and planning advice for LSF homes.",
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
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://www.pequenohome.com",
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
          name: "Light steel frame cost per m2",
          item: pageUrl,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "Lightweight steel frame home design and construction",
      serviceType: "Lightweight steel frame homes",
      areaServed: {
        "@type": "Country",
        name: "South Africa",
      },
      provider: {
        "@type": "Organization",
        name: "Pequeño",
        url: "https://www.pequenohome.com",
      },
      offers: priceBands.map((band) => ({
        "@type": "Offer",
        name: band.label,
        priceCurrency: "ZAR",
        description: `${band.budget}. ${band.size}. ${band.fit}`,
      })),
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

export default function LsfCostArticlePage() {
  const jsonLd = buildJsonLd();

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
          <span className="font-medium text-gray-900">LSF home costs</span>
        </nav>

        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#c45734]">
          Cost Guide
        </p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight md:text-6xl">
          Light steel frame cost per m2 in South Africa: prices, ranges and budget guide
        </h1>
        <p className="mt-6 text-xl leading-9 text-gray-600">
          If you are searching for light steel frame cost per m2 in South
          Africa, the most important thing to understand is that square-metre
          pricing is only a rough starting point. A good LSF quote needs to
          account for the site, design, specification, foundations, services,
          finishes, and how the building will be used.
        </p>

        <section className="mt-10 rounded-[2rem] border border-[#ff5c36]/35 bg-white p-6 shadow-sm md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#c45734]">
            Quick Answer
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-gray-900 md:text-3xl">
            What should you budget for an LSF home?
          </h2>
          <ul className="mt-5 grid gap-3 text-base leading-7 text-gray-700 md:grid-cols-2">
            {quickAnswers.map((item) => (
              <li key={item} className="rounded-2xl bg-[#f7f2ec] p-4">
                {item}
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-10 rounded-[2rem] border border-black/10 bg-[#f7f2ec] p-6 md:p-8">
          <p className="text-lg leading-8 text-gray-700">
            As an early planning guide, Pequeno projects can range from
            entry-level homes around <strong>R850,000</strong> to larger custom homes
            and premium builds from <strong>R2.8m+</strong>. The right number
            comes from matching the building system to your actual brief, not
            from pricing per square metre in isolation.
          </p>
        </div>

        <section className="mt-16 space-y-6 text-lg leading-8 text-gray-700">
          <h2 className="text-3xl font-semibold text-gray-900">
            Light steel frame cost per m2 in South Africa
          </h2>
          <p>
            Many people want a simple cost per m2 for light steel frame homes in
            South Africa because it feels like an easy way to compare options.
            The problem is that cost per square metre can be misleading when it
            is used without context.
          </p>
          <p>
            A basic, efficient layout on an accessible site can land very
            differently from a more complex design with premium finishes, larger
            spans, difficult access, or off-grid services. The structural frame
            itself is only one part of the final number.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-[#f7f2ec] p-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Useful for early planning
              </h3>
              <p className="mt-3 text-base leading-7 text-gray-700">
                Cost per m2 can help you sense-check whether your project is
                likely to fall into a starter, mid-range, or premium category.
              </p>
            </div>
            <div className="rounded-2xl bg-[#f7f2ec] p-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Not enough for a real quote
              </h3>
              <p className="mt-3 text-base leading-7 text-gray-700">
                Real quotes should be based on the full project brief, not only
                the square metre count, because site and specification decisions
                can shift pricing significantly.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-3xl font-semibold">Indicative budget ranges</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {basePackages.map((pkg) => (
              <div
                key={pkg.name}
                className={`rounded-[2rem] border p-6 ${
                  pkg.featured
                    ? "border-[#ff5c36] bg-[#fff5f1]"
                    : "border-black/10 bg-white"
                }`}
              >
                <p className="text-xs uppercase tracking-[0.22em] text-gray-500">
                  {pkg.featured ? "Most requested" : "Planning range"}
                </p>
                <h3 className="mt-3 text-2xl font-semibold">{pkg.name}</h3>
                <p className="mt-2 text-3xl font-semibold">{pkg.price}</p>
                <p className="mt-1 text-sm text-gray-500">{pkg.size}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold text-gray-900">
              LSF price list for early planning
            </h2>
            <p className="mt-5 text-lg leading-8 text-gray-700">
              These ranges are not a fixed price list, but they give buyers a
              clearer starting point than a vague square-metre number. Use them
              to decide whether your brief is closer to a compact starter home,
              a full family home, or a larger custom build.
            </p>
          </div>

          <div className="mt-8 overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-sm">
            <div className="grid bg-[#101721] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/72 md:grid-cols-[1fr_0.8fr_0.8fr_1.35fr]">
              <span>Project type</span>
              <span className="hidden md:block">Budget</span>
              <span className="hidden md:block">Per m2 signal</span>
              <span className="hidden md:block">Best fit</span>
            </div>
            {priceBands.map((band) => (
              <div
                key={band.label}
                className="grid gap-3 border-t border-black/10 px-5 py-5 text-sm leading-6 text-gray-700 md:grid-cols-[1fr_0.8fr_0.8fr_1.35fr]"
              >
                <div>
                  <p className="font-semibold text-gray-900">{band.label}</p>
                  <p className="mt-1 text-gray-500">{band.size}</p>
                </div>
                <p>
                  <span className="font-medium text-gray-900 md:hidden">
                    Budget:{" "}
                  </span>
                  {band.budget}
                </p>
                <p>
                  <span className="font-medium text-gray-900 md:hidden">
                    Per m2 signal:{" "}
                  </span>
                  {band.perM2}
                </p>
                <p>{band.fit}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 space-y-6 text-lg leading-8 text-gray-700">
          <h2 className="text-3xl font-semibold text-gray-900">
            What affects the cost of an LSF home?
          </h2>
          <p>
            The biggest mistake is treating lightweight steel framing as a single
            fixed product. In reality, the frame is part of a complete building
            system. Two homes with the same floor area can land at very different
            budgets if one has simple access and standard finishes while the
            other has complex foundations, premium glazing, off-grid services, or
            a more ambitious architectural brief.
          </p>
          <ul className="grid gap-4 md:grid-cols-2">
            {[
              "Site access, slope, soil, and foundation requirements",
              "Transport distance and installation logistics",
              "Glazing, insulation, cladding, roofing, and specification level",
              "Bathrooms, kitchens, services, solar readiness, and water systems",
              "Design complexity, spans, roof forms, and custom detailing",
              "Estate guidelines, approvals, and location-specific constraints",
            ].map((item) => (
              <li key={item} className="rounded-2xl bg-[#f7f2ec] p-5">
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-16 space-y-6 text-lg leading-8 text-gray-700">
          <h2 className="text-3xl font-semibold text-gray-900">
            Cost per m2 vs full project budget
          </h2>
          <p>
            A per-m2 figure can be a quick planning shortcut, but full project
            budgeting is what actually helps you make decisions. The more useful
            question is not only “what is the cost per square metre?” but also
            “what kind of home, on what site, with what level of finish and
            service requirement?”
          </p>
          <p>
            For that reason, Pequeno prefers to use square-metre thinking only
            as an early planning tool, then move toward a brief-led budget once
            the project shape is clearer.
          </p>
        </section>

        <section className="mt-16 space-y-6 text-lg leading-8 text-gray-700">
          <h2 className="text-3xl font-semibold text-gray-900">
            Is LSF cheaper than brick?
          </h2>
          <p>
            Sometimes, but that should not be the only reason to choose it. The
            stronger case for LSF is usually speed, precision, design flexibility,
            cleaner site work, and the ability to create a high-performance
            building envelope. If the brief is simply “the cheapest possible
            structure,” LSF may not be the right conversation. If the brief is a
            better-controlled modern build, it becomes much more compelling.
          </p>
          <p>
            In many projects, the value is found in fewer unknowns, better
            coordination, and a structure that supports modern layouts, efficient
            insulation, and faster assembly on site.
          </p>
        </section>

        <section className="mt-16">
          <h2 className="text-3xl font-semibold">
            Real projects help make the numbers practical
          </h2>
          <p className="mt-5 text-lg leading-8 text-gray-700">
            Cost planning is easier when you can compare your brief with built
            examples. These projects show how LSF can work across different
            scales and uses.
          </p>
          <div className="mt-8">
            <ProjectProofGrid limit={2} compact />
          </div>
        </section>

        <section className="mt-16 space-y-4">
          <h2 className="text-3xl font-semibold">
            Common cost questions
          </h2>
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
            Want a realistic budget for your site?
          </h2>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-white/78">
            Tell us where you want to build, what you want to use the space for,
            and the level of finish you have in mind. We can help you understand
            whether lightweight steel framing is a good fit.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href="/enquire"
              className="rounded-full bg-[#ff5c36] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#e44d28]"
            >
              Enquire about pricing
            </Link>
            <Link
              href="/lightweight-steel-frame-homes-south-africa"
              className="rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-gray-900"
            >
              Read the LSF guide
            </Link>
          </div>
        </section>

        <BuyerIntentCluster
          currentHref="/articles/lightweight-steel-frame-home-cost-south-africa"
          title="Explore the rest of the buyer planning series"
          intro="If you are still comparing systems or working out whether now is the right time to build, these guides will help you understand approvals, timelines, and how LSF compares with brick."
        />
      </article>
    </main>
  );
}
