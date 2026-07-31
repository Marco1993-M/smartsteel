import Link from "next/link";

import BuyerIntentCluster from "@/components/BuyerIntentCluster";
import ProjectProofGrid from "@/components/ProjectProofGrid";

const pageUrl =
  "https://www.pequenohome.com/articles/lightweight-steel-frame-home-timeline-south-africa";

const faqs = [
  {
    question: "Are lightweight steel frame homes faster to build?",
    answer:
      "They often can be faster, but timeline still depends on design readiness, approvals, site work, manufacturing coordination, transport, and finishing scope. The frame alone does not guarantee speed.",
  },
  {
    question: "What slows down an LSF home project?",
    answer:
      "Approvals, incomplete design information, difficult access, foundation surprises, service coordination, and late specification changes can all slow the programme.",
  },
  {
    question: "Does off-grid planning affect the timeline?",
    answer:
      "Yes. Solar systems, water storage, backup power, wastewater strategy, and low-infrastructure site planning can all add design and coordination tasks that should be allowed for early.",
  },
  {
    question: "When does a project move fastest?",
    answer:
      "Projects tend to move best when the brief is clear, the site is understood, the approvals path is realistic, and the architectural, structural, and delivery decisions are aligned early.",
  },
];

export const metadata = {
  title:
    "How Long Does a Lightweight Steel Frame Home Take to Build? | Pequeno",
  description:
    "Learn what shapes a lightweight steel frame home timeline in South Africa, from design and approvals to manufacturing, installation, and final finishes.",
  keywords: [
    "how long does a lightweight steel frame home take to build",
    "lsf home build timeline south africa",
    "light steel frame house construction time",
    "how fast are lsf homes south africa",
    "prefab home timeline south africa",
  ],
  alternates: {
    canonical: pageUrl,
  },
  openGraph: {
    title:
      "How Long Does a Lightweight Steel Frame Home Take to Build? | Pequeno",
    description:
      "A practical guide to the real timeline of an LSF home in South Africa, including approvals, fabrication, site work, and finishing.",
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

export default function LsfTimelineArticlePage() {
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
          <span className="font-medium text-gray-900">LSF timeline</span>
        </nav>

        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#c45734]">
          Timeline
        </p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight md:text-6xl">
          How long does a lightweight steel frame home take to build?
        </h1>
        <p className="mt-6 text-xl leading-9 text-gray-600">
          Lightweight steel framing can support a faster, cleaner build process,
          but the real timeline depends on much more than the frame. Design
          decisions, approvals, site work, services, logistics, and finishes
          all shape how quickly a project actually moves.
        </p>

        <div className="mt-10 rounded-[2rem] border border-black/10 bg-[#f7f2ec] p-6 md:p-8">
          <p className="text-lg leading-8 text-gray-700">
            The strongest time advantage usually comes when the project is{" "}
            <strong>well resolved before site work begins</strong>, the frame
            package is coordinated properly, and the building is not held back
            by avoidable approval or specification changes.
          </p>
        </div>

        <section className="mt-16 space-y-6 text-lg leading-8 text-gray-700">
          <h2 className="text-3xl font-semibold text-gray-900">
            There is no single timeline for every LSF project
          </h2>
          <p>
            A more straightforward home on an accessible site will move very
            differently from a custom bushveld home, a staff accommodation
            programme, or a commercial structure with a more demanding
            specification.
          </p>
          <p>
            That is why it is better to think in phases rather than asking for a
            single universal build duration. In most projects, the real question
            is where time is won or lost across the whole process.
          </p>
        </section>

        <section className="mt-16">
          <h2 className="text-3xl font-semibold text-gray-900">
            The phases that usually shape the timeline
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {[
              {
                title: "Brief and concept stage",
                text: "The early design stage sets the pace for the whole project. A clear brief usually saves time later by reducing redesign and misalignment.",
              },
              {
                title: "Approvals and review",
                text: "Municipal submissions, estate reviews, and engineering coordination can take meaningful time and should not be treated as an afterthought.",
              },
              {
                title: "Site preparation and foundations",
                text: "Ground conditions, access, retaining requirements, and service connections can influence the project more than clients expect.",
              },
              {
                title: "Frame manufacturing and installation",
                text: "This is where LSF can help with precision and coordination, but it still depends on the design being complete and the programme being ready for it.",
              },
              {
                title: "Envelope and services",
                text: "Cladding, roofing, insulation, glazing, electrical, plumbing, and any solar or water systems all need proper sequencing.",
              },
              {
                title: "Finishes and handover",
                text: "Interior finishes, joinery, fittings, snags, and sign-off requirements often shape the tail end of the timeline more than the structural system itself.",
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
            Where LSF can genuinely save time
          </h2>
          <p>
            Lightweight steel framing can shorten parts of the construction
            process through precision manufacturing, cleaner coordination, and a
            more predictable structure. That tends to matter most when the brief
            has already been resolved and the project is not still changing
            direction on site.
          </p>
          <p>
            In other words, LSF can support speed, but it works best as part of
            a disciplined process rather than as a shortcut around planning.
          </p>
        </section>

        <section className="mt-16 space-y-6 text-lg leading-8 text-gray-700">
          <h2 className="text-3xl font-semibold text-gray-900">
            What usually causes delays?
          </h2>
          <ul className="grid gap-4 md:grid-cols-2">
            {[
              "Approvals assumptions that turn out to be unrealistic",
              "Site surprises involving slope, access, soil, or services",
              "Late design changes after the build logic has already been set",
              "Premium finishes or specialist items with longer lead times",
              "Off-grid systems added too late instead of planned early",
              "Teams working in sequence without enough early coordination",
            ].map((item) => (
              <li key={item} className="rounded-2xl bg-[#f7f2ec] p-5">
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-16">
          <h2 className="text-3xl font-semibold">
            Built work gives better timeline context
          </h2>
          <p className="mt-5 text-lg leading-8 text-gray-700">
            Real projects help clients understand how different briefs and
            scales influence delivery. These examples show the range of uses
            that LSF can support.
          </p>
          <div className="mt-8">
            <ProjectProofGrid limit={2} compact />
          </div>
        </section>

        <section className="mt-16 space-y-4">
          <h2 className="text-3xl font-semibold">Common timeline questions</h2>
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
            Want to plan around a realistic programme?
          </h2>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-white/78">
            Share your site, intended use, and whether you are still at concept
            stage or ready to move. We can help you understand where the real
            timeline pressure points are likely to sit.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href="/enquire"
              className="rounded-full bg-[#ff5c36] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#e44d28]"
            >
              Enquire about your timeline
            </Link>
            <Link
              href="/projects"
              className="rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-gray-900"
            >
              View built projects
            </Link>
          </div>
        </section>

        <BuyerIntentCluster
          currentHref="/articles/lightweight-steel-frame-home-timeline-south-africa"
          title="Explore the rest of the buyer planning series"
          intro="If you are shaping a budget or deciding between systems, these guides will help you put the timeline conversation in context."
        />
      </article>
    </main>
  );
}
