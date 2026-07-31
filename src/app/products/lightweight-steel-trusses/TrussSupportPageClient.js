'use client';

import Link from 'next/link';
import { getTrussPage, getTrussSupportPages } from './trussClusterData';

export default function TrussSupportPageClient({ slug }) {
  const page = getTrussPage(slug);
  const relatedPages = getTrussSupportPages().filter((item) => item.slug !== slug).slice(0, 4);

  if (!page) {
    return null;
  }

  return (
    <main className="bg-white">
      <section className="bg-gray-50 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <Link href="/products/lightweight-steel-trusses" className="text-sm font-semibold text-[#da1a33]">
            Lightweight steel trusses
          </Link>
          <h1 className="mt-4 text-4xl font-bold leading-tight text-black md:text-6xl">{page.heading}</h1>
          <p className="mt-6 text-lg leading-8 text-gray-700">{page.intro}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/contact" className="rounded-full bg-[#da1a33] px-6 py-3 font-semibold text-white transition hover:bg-black">
              Request a Quote
            </Link>
            <Link href="/products/lightweight-steel-trusses" className="rounded-full border border-black px-6 py-3 font-semibold text-black transition hover:bg-black hover:text-white">
              Back to Truss Hub
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-16">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-black">Key takeaways</h2>
          <ul className="mt-6 space-y-3 text-sm leading-7 text-gray-700">
            {page.keyPoints.map((point) => (
              <li key={point}>
                <span className="font-semibold text-[#da1a33]">• </span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {page.priceBands && (
        <section className="bg-white px-6 py-10">
          <div className="mx-auto max-w-5xl">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#da1a33]">Budget guide</p>
              <h2 className="mt-4 text-3xl font-bold text-black">Lightweight steel truss price ranges</h2>
              <p className="mt-4 text-lg leading-8 text-gray-700">
                These ranges are planning guides for early comparison. A final quote still needs drawings, roof geometry,
                loading assumptions, delivery location, and the agreed project scope.
              </p>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {page.priceBands.map((band) => (
                <div key={band.title} className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#da1a33]">{band.title}</p>
                  <p className="mt-4 text-2xl font-bold text-black">{band.value}</p>
                  <p className="mt-4 text-sm leading-7 text-gray-700">{band.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {page.quoteExamples && (
        <section className="bg-gray-50 px-6 py-16">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold text-black">Example truss budget scenarios</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {page.quoteExamples.map((example) => (
                <div key={example.title} className="rounded-2xl bg-white p-6 shadow-sm">
                  <h3 className="text-xl font-bold text-black">{example.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-gray-600">{example.scope}</p>
                  <p className="mt-5 text-sm font-semibold leading-7 text-[#da1a33]">{example.range}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-white px-6 py-4">
        <div className="mx-auto max-w-5xl space-y-12">
          {page.sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-3xl font-bold text-black">{section.title}</h2>
              <div className="mt-5 space-y-5 text-lg leading-8 text-gray-700">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-black">Frequently asked questions</h2>
          <div className="mt-8 space-y-4">
            {page.faqs.map((faq) => (
              <div key={faq.q} className="rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-black">{faq.q}</h3>
                <p className="mt-3 text-sm leading-7 text-gray-700">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-black">Related LSF truss pages</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {relatedPages.map((item) => (
              <Link key={item.slug} href={item.path} className="rounded-3xl border border-gray-200 bg-gray-50 p-8 transition hover:border-[#da1a33] hover:shadow-lg">
                <h3 className="text-2xl font-bold text-black">{item.heading}</h3>
                <p className="mt-4 text-sm leading-7 text-gray-700">{item.intro}</p>
                <p className="mt-6 text-sm font-semibold text-[#da1a33]">Read this page</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
