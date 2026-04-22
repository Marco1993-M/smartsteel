'use client';

import Image from 'next/image';
import Link from 'next/link';
import { getTrussSupportPages } from './trussClusterData';

export default function TrussLandingPageClient() {
  const supportPages = getTrussSupportPages();

  return (
    <main className="bg-white">
      <section className="bg-white px-6 py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#da1a33]">LSF roof trusses</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight text-black md:text-6xl">
              Lightweight steel roof trusses for straighter, longer-lasting roof structures
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-700">
              Smart Steel supplies precision-engineered lightweight steel roof trusses for homes, schools, churches, warehouses,
              and commercial roofs across South Africa. Our focus is simple: cleaner geometry, better structural consistency,
              termite resistance, and a roof system buyers can trust over the long term.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/contact" className="rounded-full bg-[#da1a33] px-6 py-3 font-semibold text-white transition hover:bg-black">
                Request a Truss Quote
              </Link>
              <Link href="/resources" className="rounded-full border border-black px-6 py-3 font-semibold text-black transition hover:bg-black hover:text-white">
                View Technical Resources
              </Link>
            </div>
          </div>
          <div className="relative min-h-[360px] overflow-hidden rounded-[2rem] shadow-lg">
            <Image
              src="/images/steel-trusses-hero.jpg"
              alt="Lightweight steel trusses in construction"
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="bg-gray-50 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold text-black md:text-5xl">Why buyers choose lightweight steel trusses</h2>
            <p className="mt-5 text-lg leading-8 text-gray-700">
              Buyers do not choose steel roof trusses because they want jargon. They choose them because they want straighter
              members, less risk of warp and twist, termite resistance, and a roof structure that performs cleanly over time.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                title: 'Straighter roof lines',
                body: 'Precision manufacturing helps support cleaner roof geometry and better finish quality.',
              },
              {
                title: 'Lower maintenance risk',
                body: 'Steel will not rot, twist, or attract termites the way timber can over time.',
              },
              {
                title: 'Better repeatability',
                body: 'A more controlled fabrication outcome helps builders and specifiers deliver consistent roofs.',
              },
            ].map((item) => (
              <div key={item.title} className="rounded-3xl border border-gray-200 bg-white p-8">
                <h3 className="text-2xl font-bold text-black">{item.title}</h3>
                <p className="mt-4 text-sm leading-7 text-gray-700">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#da1a33]">Content hub</p>
            <h2 className="mt-4 text-3xl font-bold text-black md:text-5xl">Explore the LSF truss knowledge base</h2>
            <p className="mt-5 text-lg leading-8 text-gray-700">
              This section is designed to answer the questions that matter most when buyers compare truss systems, pricing, and
              project fit.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {supportPages.map((page) => (
              <Link key={page.slug} href={page.path} className="rounded-3xl border border-gray-200 bg-gray-50 p-8 transition hover:-translate-y-1 hover:border-[#da1a33] hover:shadow-lg">
                <h3 className="text-2xl font-bold text-black">{page.heading}</h3>
                <p className="mt-4 text-sm leading-7 text-gray-700">{page.intro}</p>
                <p className="mt-6 text-sm font-semibold text-[#da1a33]">Read more</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black px-6 py-20 text-center text-white">
        <h2 className="text-3xl font-bold md:text-5xl">Need trusses for a real project?</h2>
        <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-white/75">
          Whether you are pricing a house roof, commercial roof, school, church, or roof retrofit, Smart Steel can help you
          move from concept to a buildable truss solution.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/contact" className="rounded-full bg-white px-6 py-3 font-semibold text-black transition hover:bg-[#da1a33] hover:text-white">
            Contact Smart Steel
          </Link>
          <Link href="/recent" className="rounded-full border border-white px-6 py-3 font-semibold text-white transition hover:bg-white hover:text-black">
            View Recent Projects
          </Link>
        </div>
      </section>
    </main>
  );
}
