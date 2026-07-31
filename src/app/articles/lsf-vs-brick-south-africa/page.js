import Link from "next/link";

import BuyerIntentCluster from "@/components/BuyerIntentCluster";
import { getFeaturedLocationPages } from "@/data/locationPages";

const pageUrl =
  "https://www.pequenohome.com/articles/lsf-vs-brick-south-africa";

const faqs = [
  {
    question: "Is LSF better than brick in South Africa?",
    answer:
      "Neither system is automatically better in every case. The right choice depends on the site, design goals, programme, performance priorities, and the kind of building you want to create.",
  },
  {
    question: "Is LSF always cheaper than brick?",
    answer:
      "No. Some projects may see cost advantages, but the stronger case for LSF is often speed, precision, cleaner coordination, and how the full building system performs when designed well.",
  },
  {
    question: "Which system works better for remote or estate sites?",
    answer:
      "That depends on the site and logistics, but a lighter, more coordinated system can be helpful where access, disruption, programme, or site conditions make conventional construction more cumbersome.",
  },
  {
    question: "Does brick automatically feel more solid?",
    answer:
      "Some clients associate mass with solidity, but comfort and performance come from the full wall, roof, insulation, shading, and detailing strategy, not only from the primary structural material.",
  },
];

export const metadata = {
  title: "LSF vs Brick in South Africa | Pequeno",
  description:
    "Compare LSF vs brick in South Africa across cost, speed, comfort, design flexibility, site conditions, and which projects suit each approach best.",
  keywords: [
    "lsf vs brick south africa",
    "lightweight steel frame vs brick house",
    "steel frame house vs brick south africa",
    "lsf homes compared to brick",
    "is lsf better than brick south africa",
  ],
  alternates: {
    canonical: pageUrl,
  },
  openGraph: {
    title: "LSF vs Brick in South Africa | Pequeno",
    description:
      "A practical comparison of LSF and brick building in South Africa, including speed, comfort, cost, and site suitability.",
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

export default function LsfVsBrickArticlePage() {
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
          <span className="font-medium text-gray-900">LSF vs brick</span>
        </nav>

        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#c45734]">
          Comparison
        </p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight md:text-6xl">
          LSF vs brick in South Africa
        </h1>
        <p className="mt-6 text-xl leading-9 text-gray-600">
          Most people comparing LSF vs brick are not really asking for a
          material argument. They are trying to work out which system gives them
          the right balance of budget control, delivery speed, comfort, design,
          and practical fit for their site.
        </p>

        <div className="mt-10 rounded-[2rem] border border-black/10 bg-[#f7f2ec] p-6 md:p-8">
          <p className="text-lg leading-8 text-gray-700">
            The better question is not just{" "}
            <strong>which system is cheaper</strong>. It is{" "}
            <strong>which system suits your project better</strong> once
            you consider climate, site logistics, design goals, programme, and
            how the full building envelope will perform.
          </p>
        </div>

        <section className="mt-16 space-y-6 text-lg leading-8 text-gray-700">
          <h2 className="text-3xl font-semibold text-gray-900">
            LSF and brick are different building logics
          </h2>
          <p>
            Brick construction is familiar to many South African clients and
            contractors. Lightweight steel framing, by contrast, relies on a
            more precise structural skeleton paired with insulation, cladding,
            sheathing, services, and finishes as part of a full system.
          </p>
          <p>
            That means the comparison should not stop at the primary structure.
            It should include how the project is designed, how it is coordinated,
            and how the building will actually perform once completed.
          </p>
        </section>

        <section className="mt-16">
          <h2 className="text-3xl font-semibold text-gray-900">
            Where the differences usually show up
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {[
              {
                title: "Speed and coordination",
                text: "LSF often appeals where clients want a cleaner, more coordinated structural process. Brick may still be preferred where the team is already deeply geared toward conventional delivery.",
              },
              {
                title: "Design language",
                text: "Both systems can support good architecture, but LSF is especially comfortable with crisp contemporary forms, lighter assemblies, and well-resolved envelope detailing.",
              },
              {
                title: "Comfort and performance",
                text: "Thermal comfort comes from the full wall and roof build-up, insulation, ventilation, glazing, and shading strategy, not only from whether the structure is steel or masonry.",
              },
              {
                title: "Site conditions",
                text: "Access, disruption tolerance, topography, logistics, and estate rules can make one approach more practical than another depending on the site.",
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

        <section className="mt-16">
          <h2 className="text-3xl font-semibold text-gray-900">
            A simple side-by-side view
          </h2>
          <div className="mt-8 overflow-hidden rounded-[2rem] border border-black/10">
            <div className="grid bg-black text-sm font-semibold uppercase tracking-[0.2em] text-white md:grid-cols-3">
              <div className="p-4">Decision area</div>
              <div className="p-4">LSF</div>
              <div className="p-4">Brick</div>
            </div>
            {[
              [
                "Programme",
                "Can be strong where precision and coordination matter",
                "Can suit teams already geared to conventional sequencing",
              ],
              [
                "Remote or estate sites",
                "Often attractive where cleaner logistics and lower disruption help",
                "May still work well, but can be heavier and more cumbersome depending on the site",
              ],
              [
                "Contemporary detailing",
                "Well suited to crisp modern architectural outcomes",
                "Also possible, but the detailing logic is different",
              ],
              [
                "Thermal comfort",
                "Depends on the full envelope, insulation, and shading strategy",
                "Also depends on the full envelope, not only wall mass",
              ],
              [
                "Cost certainty",
                "Can benefit from early system definition and coordination",
                "Can be familiar, but still vulnerable to scope, site, and sequencing shifts",
              ],
            ].map((row) => (
              <div
                key={row[0]}
                className="grid border-t border-black/10 bg-white md:grid-cols-3"
              >
                {row.map((cell) => (
                  <div
                    key={cell}
                    className="p-4 text-base leading-7 text-gray-700"
                  >
                    {cell}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 space-y-6 text-lg leading-8 text-gray-700">
          <h2 className="text-3xl font-semibold text-gray-900">
            Which kinds of projects tend to favour LSF?
          </h2>
          <p>
            LSF often becomes more compelling when clients want a design-led
            result, a cleaner site process, stronger envelope control, or a
            better fit for bushveld, estate, remote, or lifestyle settings where
            coordination matters.
          </p>
          <p>
            That does not make brick obsolete. It simply means the choice should
            be made around the actual brief, not habit alone.
          </p>
        </section>

        <section className="mt-16">
          <h2 className="text-3xl font-semibold text-gray-900">
            Compare that question against real locations
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
                  {location.climaticFocus}
                </p>
                <p className="mt-5 text-sm font-medium text-[#ff5c36]">
                  Explore this location →
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-16 space-y-4">
          <h2 className="text-3xl font-semibold">Common comparison questions</h2>
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
            Want help comparing systems for your site?
          </h2>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-white/78">
            Tell us where you want to build and what kind of outcome you want.
            We can help you work out whether a Pequeno LSF approach is a strong
            fit for the brief.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href="/enquire"
              className="rounded-full bg-[#ff5c36] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#e44d28]"
            >
              Enquire about your project
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
          currentHref="/articles/lsf-vs-brick-south-africa"
          title="Explore the rest of the buyer planning series"
          intro="If you are comparing systems, these related guides will also help you understand pricing, approvals, and likely project timelines."
        />
      </article>
    </main>
  );
}
