import Image from "next/image"
import Link from "next/link"

const SITE_URL = "https://www.smartsteel.co.za"
const SHARE_IMAGE = "/warehouse.jpg"

export function buildSteelServiceLocationMetadata(content) {
  return {
    title: content.metaTitle,
    description: content.metaDescription,
    keywords: content.keywords,
    alternates: {
      canonical: content.path,
    },
    openGraph: {
      title: content.metaTitle,
      description: content.metaDescription,
      url: `${SITE_URL}${content.path}`,
      siteName: "Smart Steel",
      locale: "en_ZA",
      type: "website",
      images: [
        {
          url: SHARE_IMAGE,
          width: 1200,
          height: 630,
          alt: content.heroTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: content.metaTitle,
      description: content.metaDescription,
      images: [SHARE_IMAGE],
    },
  }
}

export default function SteelServiceLocationPage({ content }) {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: content.faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  }

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: content.schemaName,
    provider: {
      "@type": "Organization",
      name: "Smart Steel",
      url: SITE_URL,
    },
    areaServed: {
      "@type": "Place",
      name: content.areaServed,
    },
    serviceType: content.schemaServiceType,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />

      <main className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc,_#ffffff_24%,_#fff7f5)] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <section className="relative mt-6 overflow-hidden rounded-[2.25rem] border border-slate-200 bg-white/90 px-6 py-10 shadow-sm backdrop-blur sm:px-8 lg:px-10">
            <Image
              src={SHARE_IMAGE}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-center opacity-[0.98]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(255,255,255,0.74))]" />
            <div className="relative z-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#da1a33]">
                  {content.eyebrow}
                </p>
                <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                  {content.heroTitle}
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
                  {content.heroIntro}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/contact"
                    className="rounded-full bg-[#da1a33] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#bf172d]"
                  >
                    Discuss your project
                  </Link>
                  <Link
                    href="/steel-fabrication-installation"
                    className="rounded-full border border-slate-900 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white"
                  >
                    Explore fabrication services
                  </Link>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                {content.heroPoints.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-[1.75rem] border border-slate-200 bg-slate-50 px-5 py-5"
                  >
                    <p className="text-2xl font-semibold text-slate-950">{item.title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
                Quick Answers
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">
                {content.quickAnswersHeading}
              </h2>
            </div>
            <div className="mt-6 grid gap-4 lg:grid-cols-4">
              {content.quickAnswers.map((item) => (
                <div key={item.question} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                  <h3 className="text-base font-semibold text-slate-950">{item.question}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
                Service Scope
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">
                {content.scopeHeading}
              </h2>
            </div>
            <div className="mt-6 grid gap-5 lg:grid-cols-3">
              {content.scopeCards.map((item) => (
                <div key={item.title} className="rounded-[1.85rem] border border-slate-200 bg-slate-50 p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-slate-950">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
                Typical Projects
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">
                {content.projectsHeading}
              </h2>
              <div className="mt-5 space-y-3">
                {content.projectTypes.map((item) => (
                  <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <p className="text-sm leading-6 text-slate-700">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
                Local Fit
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">
                {content.localFitHeading}
              </h2>
              {content.localFitParagraphs.map((paragraph) => (
                <p key={paragraph} className="mt-4 text-sm leading-6 text-slate-600">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>

          <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
                Process
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">
                {content.processHeading}
              </h2>
            </div>
            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              {content.processSteps.map((item) => (
                <div key={item.title} className="rounded-[1.85rem] border border-slate-200 bg-slate-50 p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-slate-950">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
                FAQs
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">
                {content.faqHeading}
              </h2>
              <div className="mt-6 space-y-4">
                {content.faqs.map((item) => (
                  <div key={item.question} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                    <h3 className="text-base font-semibold text-slate-950">{item.question}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{item.answer}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
                Next Step
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">
                {content.nextStepHeading}
              </h2>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                {content.nextStepBody}
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <Link
                  href="/contact"
                  className="rounded-full bg-slate-950 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Contact Smart Steel
                </Link>
                <Link
                  href={content.secondaryCtaHref}
                  className="rounded-full border border-slate-300 px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  {content.secondaryCtaLabel}
                </Link>
              </div>
            </div>
          </section>

          <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
              Related Pages
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              Move into the closest route for your project
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {content.supportLinks.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 transition hover:border-slate-300 hover:bg-white"
                >
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  )
}
