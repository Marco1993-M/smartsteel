import Link from "next/link";
import Image from "next/image";

import { basePackages, getRelatedLocationPages } from "@/data/locationPages";
import { getProjectByKey } from "@/data/projects";

function buildJsonLd(location) {
  const pageUrl = `https://www.pequenohome.com/${location.slug}`;

  return [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: `Lightweight Steel Frame Homes in ${location.place}`,
      url: pageUrl,
      description: location.metaDescription,
      about: [
        "Lightweight steel frame homes",
        `Residential construction in ${location.place}`,
        `Home builders in ${location.place}`,
        `Build in ${location.place}`,
        "Architect-designed modular housing",
      ],
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
          name: `Build in ${location.place}`,
          item: pageUrl,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      serviceType: "Lightweight steel frame home design and construction",
      name: `Pequeño homes in ${location.place}`,
      areaServed: {
        "@type": "City",
        name: location.place,
      },
      provider: {
        "@type": "Organization",
        name: "Pequeño",
        url: "https://www.pequenohome.com",
        logo: "https://www.pequenohome.com/logo.png",
      },
      description: location.metaDescription,
      offers: basePackages.map((pkg) => ({
        "@type": "Offer",
        name: pkg.name,
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
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: location.faq.map((item) => ({
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

export default function LocationLandingPage({ location }) {
  const jsonLd = buildJsonLd(location);
  const relatedLocations = getRelatedLocationPages(location.slug);
  const featuredProject = location.featuredProjectKey
    ? getProjectByKey(location.featuredProjectKey)
    : null;

  return (
    <main className="pb-20 text-gray-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="relative w-full h-screen flex flex-col justify-between items-center px-4 text-center text-black">
        <div className="absolute left-6 right-6 top-24 bottom-6 overflow-hidden rounded-3xl shadow-xl">
          <Image
            src={location.heroImage}
            alt={`Pequeño lightweight steel frame home in ${location.place}`}
            fill
            priority
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 m-6 rounded-3xl bg-gradient-to-t from-black/70 via-black/0 to-transparent pointer-events-none" />

        <div className="relative z-10 flex h-full w-full flex-col justify-between px-6 py-10 md:px-10 lg:px-14">
          <div className="flex flex-wrap justify-center gap-3 pt-20 text-xs uppercase tracking-[0.22em] text-white/80">
              <span className="rounded-full border border-white/25 bg-white/10 px-4 py-2 backdrop-blur-sm">
                {location.place}, {location.province}
              </span>
              <span className="rounded-full border border-white/25 bg-white/10 px-4 py-2 backdrop-blur-sm">
                Architect-led homes
              </span>
              <span className="rounded-full border border-white/25 bg-white/10 px-4 py-2 backdrop-blur-sm">
                Built for local conditions
              </span>
            </div>

          <div className="mx-auto my-auto max-w-4xl space-y-6">
              <p className="text-sm font-medium uppercase tracking-[0.26em] text-white/75">
                {location.heroEyebrow}
              </p>
              <h1 className="max-w-4xl text-4xl font-semibold leading-tight text-white md:text-6xl lg:text-7xl">
                Lightweight Steel Frame Homes in{" "}
                <span className="font-serif italic text-[#ff8b6e]">
                  {location.place}
                </span>
              </h1>
            <p className="max-w-3xl text-base leading-7 text-white/88 md:text-xl md:leading-8">
                {location.intro}
              </p>

              <div className="flex flex-wrap justify-center gap-4 pt-2">
                <Link
                  href="/enquire"
                  className="rounded-full border border-white/35 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white hover:text-gray-900"
                >
                  Talk about your site
                </Link>
              </div>
          </div>

        </div>
      </section>

      <section className="mx-auto mt-8 w-[95%] max-w-7xl">
        <div className="grid gap-4 pb-8 md:grid-cols-3">
          <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.22em] text-gray-500">
              Best Fit
            </p>
            <p className="mt-3 text-lg font-medium text-gray-900">
              {location.projectTypes[0]}
            </p>
          </div>
          <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.22em] text-gray-500">
              Local Focus
            </p>
            <p className="mt-3 text-lg font-medium text-gray-900">
              Designed around {location.region}
            </p>
          </div>
          <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.22em] text-gray-500">
              Next Step
            </p>
            <p className="mt-3 text-lg font-medium text-gray-900">
              Site-first quoting and concept planning
            </p>
          </div>
        </div>

        <div className="grid gap-5 rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm md:grid-cols-3 md:p-8">
          {[
            `Homes designed around ${location.place}'s local conditions`,
            "Architect-led planning for private briefs and demanding sites",
            "Precision-built systems shaped for comfort, durability, and refined delivery",
          ].map((item) => (
            <div key={item} className="rounded-2xl bg-[#f7f2ec] p-5">
              <p className="text-sm leading-6 text-gray-700">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-10 w-[95%] max-w-7xl rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm md:p-10">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#c45734]">
              Local Search Fit
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-5xl">
              For clients comparing home builders in {location.place}
            </h2>
          </div>

          <div className="space-y-5 text-base leading-7 text-gray-700 md:text-lg md:leading-8">
            <p>
              If you are comparing new home builders, residential construction
              options, prefab homes, modular homes, or steel frame homes in{" "}
              {location.place}, the useful question is not only who can build
              quickly. It is who can shape the right brief for the site,
              approval route, climate, budget, and level of finish you expect.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {location.localCommercialTerms.map((term) => (
                <span
                  key={term}
                  className="rounded-2xl bg-[#f7f2ec] px-4 py-3 text-sm font-medium text-gray-700"
                >
                  {term}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-24 grid w-[95%] max-w-7xl gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#c45734]">
            Local Build Considerations
          </p>
          <h2 className="text-3xl font-semibold leading-tight md:text-5xl">
            {location.localNeedTitle}
          </h2>
          <p className="max-w-3xl text-lg leading-8 text-gray-600">
            The right project in {location.place} depends on more than style
            alone. Climate, site conditions, approvals, privacy, and the way
            the building will be used all shape whether the final outcome feels
            calm, durable, and worth the investment.
          </p>
        </div>

        <div className="rounded-[2rem] border border-black/10 bg-[#101721] p-8 text-white">
          <p className="text-sm uppercase tracking-[0.22em] text-white/60">
            Helpful Next Steps
          </p>
          <div className="mt-6 space-y-4 text-sm leading-6 text-white/80">
            <p>
              Explore how our building system, project process, and early
              planning approach support more considered homes in {location.place}.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/our-system"
                className="rounded-full border border-white/20 px-4 py-2 transition hover:bg-white hover:text-gray-900"
              >
                Our building system
              </Link>
              <Link
                href="/onboarding"
                className="rounded-full border border-white/20 px-4 py-2 transition hover:bg-white hover:text-gray-900"
              >
                Start a project
              </Link>
              <Link
                href="/resources"
                className="rounded-full border border-white/20 px-4 py-2 transition hover:bg-white hover:text-gray-900"
              >
                Resources
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-10 grid w-[95%] max-w-7xl gap-6 md:grid-cols-3">
        {location.localNeeds.map((item) => (
          <article
            key={item.title}
            className="rounded-[2rem] border border-black/10 bg-white p-7 shadow-sm"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#c45734]">
              {location.place}
            </p>
            <h3 className="mt-4 text-2xl font-semibold">{item.title}</h3>
            <p className="mt-4 text-base leading-7 text-gray-600">
              {item.description}
            </p>
          </article>
        ))}
      </section>

      {location.featuredSnippet ? (
        <section className="mx-auto mt-10 w-[95%] max-w-7xl">
          <div className="rounded-[2rem] border border-black/10 bg-[#f7f2ec] p-8 shadow-sm md:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#c45734]">
              Local Project Snapshot
            </p>
            <p className="mt-4 max-w-4xl text-lg leading-8 text-gray-700">
              {location.featuredSnippet}
            </p>
          </div>
        </section>
      ) : null}

      {featuredProject ? (
        <section className="mx-auto mt-10 w-[95%] max-w-7xl rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm md:p-12">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#c45734]">
                Featured Project
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-5xl">
                {featuredProject.name}
              </h2>
              <p className="mt-4 text-sm uppercase tracking-[0.22em] text-gray-500">
                {featuredProject.location}
              </p>
              <div className="mt-5 flex flex-wrap gap-3 text-sm text-gray-700">
                <span className="rounded-full bg-[#f7f2ec] px-4 py-2">
                  {featuredProject.projectType}
                </span>
                <span className="rounded-full bg-[#f7f2ec] px-4 py-2">
                  {featuredProject.size}
                </span>
              </div>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                {featuredProject.summary}
              </p>
              <ul className="mt-8 space-y-4">
                {featuredProject.highlights.map((item) => (
                  <li key={item} className="flex gap-3 text-base leading-7 text-gray-700">
                    <span className="mt-2 h-2.5 w-2.5 rounded-full bg-[#ff5c36]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-8 rounded-2xl bg-[#fff5f1] p-5 text-sm leading-7 text-gray-700">
                <strong className="text-gray-900">Trust note:</strong> {featuredProject.trustLine}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {featuredProject.gallery.slice(0, 4).map((image, index) => (
                <div
                  key={image}
                  className={`relative overflow-hidden rounded-[1.5rem] ${
                    index === 0 ? "sm:col-span-2 aspect-[16/10]" : "aspect-[4/3]"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${featuredProject.name} project image ${index + 1}`}
                    fill
                    sizes={index === 0 ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 640px) 25vw, 50vw"}
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="mx-auto mt-24 w-[95%] max-w-7xl rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm md:p-12">
        <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#c45734]">
              What We Design Here
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-5xl">
              Homes we commonly plan for {location.place}
            </h2>
            <p className="mt-5 text-lg leading-8 text-gray-600">
              These are the kinds of briefs we most often shape for clients in
              and around {location.place}, with an emphasis on homes and
              buildings that justify a more considered design and construction
              process.
            </p>
          </div>

          <div className="grid gap-4">
            {location.projectTypes.map((item, index) => (
              <div
                key={item}
                className="rounded-2xl bg-[#f7f2ec] p-6 transition hover:-translate-y-0.5 hover:shadow-sm"
              >
                <p className="text-xs uppercase tracking-[0.22em] text-gray-500">
                  Common Brief {index + 1}
                </p>
                <p className="mt-3 text-xl font-medium text-gray-900">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-24 w-[95%] max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#c45734]">
              Planning And Pricing
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-5xl">
              Indicative budget ranges for {location.place}
            </h2>
            <p className="mt-5 text-lg leading-8 text-gray-600">
              We use indicative budget ranges to help clients plan realistically.
              Final pricing depends on design scope, specification, site
              conditions, access, foundations, and service requirements.
            </p>
            <ul className="mt-8 space-y-4">
              {location.localPlanning.map((item) => (
                <li key={item} className="flex gap-3 text-base leading-7 text-gray-700">
                  <span className="mt-2 h-2.5 w-2.5 rounded-full bg-[#ff5c36]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {basePackages.map((pkg) => (
              <article
                key={pkg.name}
                className={`rounded-[2rem] border p-6 shadow-sm ${
                  pkg.featured
                    ? "border-[#ff5c36] bg-[#fff5f1]"
                    : "border-black/10 bg-white"
                }`}
              >
                <p className="text-xs uppercase tracking-[0.22em] text-gray-500">
                  {pkg.featured ? "Most requested" : "Package"}
                </p>
                <h3 className="mt-3 text-2xl font-semibold">{pkg.name}</h3>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {pkg.price}
                </p>
                <p className="mt-1 text-sm text-gray-500">{pkg.size}</p>
                <ul className="mt-6 space-y-3 text-sm leading-6 text-gray-700">
                  {pkg.details.map((detail) => (
                    <li key={detail} className="flex gap-3">
                      <span className="mt-2 h-2 w-2 rounded-full bg-[#ff5c36]" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-24 grid w-[95%] max-w-7xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2rem] bg-[#101721] p-8 text-white md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/60">
            Nearby Areas
          </p>
          <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-5xl">
            Where we work around {location.place}
          </h2>
            <p className="mt-5 text-lg leading-8 text-white/78">
              We work selectively across nearby plots, estates, and surrounding
            neighbourhoods where the site, brief, and level of ambition align
            with our process.
            </p>
        </div>

        <div className="rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm md:p-10">
          <ul className="space-y-5">
            {location.nearbyAreas.map((item) => (
              <li key={item} className="border-b border-black/8 pb-5 last:border-b-0 last:pb-0">
                <p className="text-lg font-medium text-gray-900">{item}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto mt-24 w-[95%] max-w-7xl rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm md:p-12">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#c45734]">
              More Areas We Serve
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-5xl">
              Explore other South African locations
            </h2>
            <p className="mt-5 text-lg leading-8 text-gray-600">
              If your site is not in {location.place}, explore some of the other
              town and regional pages we have built around local climate, site
              conditions, and project type.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {relatedLocations.map((item) => (
              <Link
                key={item.slug}
                href={`/${item.slug}`}
                className="rounded-2xl bg-[#f7f2ec] p-6 transition hover:-translate-y-0.5 hover:bg-[#efe6dc]"
              >
                <p className="text-xs uppercase tracking-[0.22em] text-gray-500">
                  {item.province}
                </p>
                <h3 className="mt-3 text-2xl font-semibold text-gray-900">
                  Build in {item.place}
                </h3>
                <p className="mt-3 text-sm leading-6 text-gray-700">
                  Homes tailored to {item.region}, with local planning and
                  climate considerations built into the page.
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-24 w-[95%] max-w-7xl rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm md:p-12">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#c45734]">
              Questions
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-5xl">
              Questions people ask before building in {location.place}
            </h2>
            <p className="mt-5 text-lg leading-8 text-gray-600">
              These are some of the questions clients often ask before starting
              a project in {location.place}. They also help clarify fit, scope,
              and next steps early in the process.
            </p>
          </div>

          <div className="space-y-4">
            {location.faq.map((item) => (
              <details
                key={item.question}
                className="group rounded-2xl border border-black/10 bg-[#f7f2ec] p-6"
              >
                <summary className="cursor-pointer list-none text-lg font-medium text-gray-900">
                  <span className="flex items-start justify-between gap-4">
                    <span>{item.question}</span>
                    <span className="text-[#ff5c36] transition group-open:rotate-45">
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-4 text-base leading-7 text-gray-700">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-24 w-[95%] max-w-7xl rounded-[2rem] bg-[linear-gradient(135deg,#111827,#1f2937)] px-8 py-12 text-white md:px-12 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/60">
              Start Planning
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-5xl">
              Planning a build in {location.place}?
            </h2>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-white/78">
              If you're planning a home in {location.place}, we can help you
              assess the site, shape the brief, and decide whether a lightweight
              steel frame approach is the right fit for your project.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/enquire"
              className="rounded-full bg-[#ff5c36] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#e44d28]"
            >
              Enquire about your site
            </Link>
            <Link
              href="/onboarding"
              className="rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-gray-900"
            >
              Start your project brief
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
