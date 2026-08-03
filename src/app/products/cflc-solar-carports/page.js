import Image from "next/image"
import Link from "next/link"

const SITE_URL = "https://www.smartsteel.co.za"
const PAGE_PATH = "/products/cflc-solar-carports"
const SHARE_IMAGE = `${SITE_URL}/atlas-solar-carports-share.png`

export const metadata = {
  title: "Atlas Solar Carports South Africa | Smart Steel",
  description:
    "Price an Atlas solar carport online with Smart Steel. Create covered parking and solar-ready infrastructure for commercial sites, estates, schools, farms, and operational vehicle areas.",
  keywords: [
    "Atlas solar carports",
    "solar carports south africa",
    "solar carport price south africa",
    "solar panel carport",
    "commercial solar carport",
    "solar parking structures",
    "carport with solar panels",
  ],
  alternates: { canonical: PAGE_PATH },
  openGraph: {
    title: "Atlas Solar Carports | Smart Steel",
    description:
      "Plan covered parking and solar-ready infrastructure with an Atlas solar carport. Start with an online estimate before you enquire.",
    url: `${SITE_URL}${PAGE_PATH}`,
    siteName: "Smart Steel",
    locale: "en_ZA",
    type: "website",
    images: [{ url: SHARE_IMAGE, width: 1200, height: 630, alt: "Atlas solar carport by Smart Steel" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Atlas Solar Carports | Smart Steel",
    description: "Price an Atlas solar carport online before you enquire.",
    images: [SHARE_IMAGE],
  },
}

const proofPoints = [
  ["Modular parking bays", "Build the layout around practical parking requirements, then extend the structure around the way the site needs to work."],
  ["Bolted system", "Atlas uses repeatable components and bolted assembly principles for a clearer structural route from planning into site review."],
  ["Solar-ready by design", "Plan the steel structure around panel support from the start, then use the online estimator for a clearer first budget."],
]

const applications = [
  {
    title: "Commercial parking",
    description: "Turn office, retail, business park, and visitor parking into useful covered space with solar potential.",
    image: "/solar_carport_hero.webp",
    alt: "Atlas solar carport over commercial parking",
  },
  {
    title: "Schools and campuses",
    description: "A visible infrastructure upgrade for staff, visitors, and day-to-day operational parking areas.",
    image: "/solar_carport_1.webp",
    alt: "Atlas solar carport structural detail",
  },
  {
    title: "Fleets and operational sites",
    description: "A repeatable route for vehicle cover where layout, circulation, and longer-term energy planning need to work together.",
    image: "/solar_carport_2.webp",
    alt: "Atlas solar carport over vehicle parking",
  },
]

const processSteps = [
  ["01", "Choose the parking layout", "Start with the number of parking spaces and whether the bays need a single or double row."],
  ["02", "See a starting budget", "The estimator gives you a practical structure-only guide before delivery, foundations, and site conditions are reviewed."],
  ["03", "Send a stronger enquiry", "Continue with your layout already defined, so the Smart Steel team can review the real project requirements with you."],
]

const faqs = [
  {
    question: "What is an Atlas solar carport?",
    answer:
      "An Atlas solar carport is a modular steel parking structure designed to provide covered vehicle bays while supporting a solar-ready roof layout. It is part of the Atlas modular infrastructure platform developed by Smart Steel.",
  },
  {
    question: "What makes the Atlas system different?",
    answer:
      "Atlas is built around repeatable components, practical parking layouts, and bolted assembly principles. This creates a clearer structural starting point before Smart Steel reviews the specific site, foundations, delivery, installation, and final project scope.",
  },
  {
    question: "Can I get an estimate before I enquire?",
    answer:
      "Yes. Use the online Atlas solar carport estimator to choose a starting parking layout and receive a practical budget guide before you send an enquiry.",
  },
  {
    question: "Are the solar panels included?",
    answer:
      "The estimator focuses on the steel structure and solar-ready support layout. Solar panels, electrical design, foundations, delivery, and installation can be reviewed around your project requirements.",
  },
  {
    question: "Who are Atlas solar carports for?",
    answer:
      "They are suited to commercial sites, schools, estates, farms, fleet areas, and other parking layouts where covered bays and solar potential should work together.",
  },
]

const relatedPages = [
  ["Atlas carports", "Explore non-solar parking cover for projects that do not need panel support.", "/products/cflc-carport-kits", "View Atlas carports"],
  ["Atlas ground mounts", "Price a standalone solar structure when the array does not need to sit over parking.", "/products/cflc-ground-mounts", "View ground mounts"],
  ["Atlas warehouse system", "Explore the wider Atlas platform for modular warehouse and infrastructure structures.", "/warehouses/cflc", "Explore Atlas W-Series"],
]

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
}

function Arrow() {
  return <span aria-hidden="true" className="text-lg leading-none">↗</span>
}

export default function AtlasSolarCarportsPage() {
  return (
    <main className="atlas-brand min-h-screen bg-[linear-gradient(180deg,#ffffff_0%,#ffffff_7rem,#eef6fa_17rem,#eef6fa_100%)] pb-16 pt-24 text-[#001d2e] sm:pt-28">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <section className="atlas-public-hero mx-4 overflow-hidden border shadow-sm sm:mx-6 lg:mx-8">
        <div className="relative mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-10">
          <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:linear-gradient(rgba(18,26,32,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(18,26,32,0.06)_1px,transparent_1px)] [background-size:42px_42px]" />
          <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full border border-[#d9a441]/45" />
          <div className="relative grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div className="max-w-3xl">
              <Image src="/atlas/atlas-logo-horizontal-light.png" alt="Atlas by Smart Steel" width={320} height={50} className="h-10 w-auto max-w-full object-contain object-left" priority />
              <p className="mt-10 text-xs font-semibold uppercase tracking-[0.24em] text-[#1c5b57]">Atlas Solar Carports</p>
              <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-5xl lg:text-6xl">
                Atlas solar carports for parking that works harder.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-[#121a20]/70 sm:text-lg">
                Atlas solar carports give commercial sites a practical way to add everyday parking cover while creating a solar-ready structure around repeatable components and bolted assembly principles.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/tools/solar-carport-estimator" className="inline-flex items-center justify-center bg-[#d9a441] px-6 py-3.5 text-sm font-semibold text-[#121a20] transition hover:bg-[#ebbd5f]">
                  Price my solar carport <span className="ml-2 text-lg leading-none">→</span>
                </Link>
                <a href="#how-it-works" className="inline-flex items-center justify-center border border-[#121a20]/20 bg-white/75 px-6 py-3.5 text-sm font-semibold text-[#121a20] transition hover:border-[#121a20] hover:bg-white">
                  How Atlas works
                </a>
              </div>
              <div className="mt-6 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#121a20]/65">
                <span className="border border-[#121a20]/15 bg-white/75 px-3 py-2">No contact details to see a starting estimate</span>
                <span className="border border-[#121a20]/15 bg-white/75 px-3 py-2">Structure-only guide</span>
                <span className="border border-[#121a20]/15 bg-white/75 px-3 py-2">Site review for delivery and installation</span>
              </div>
            </div>

            <div className="relative min-h-[340px] overflow-hidden border border-[#121a20]/15 bg-[#1c5b57] sm:min-h-[400px]">
              <Image src="/solar_carport_hero.webp" alt="Atlas solar carport structure by Smart Steel" fill priority sizes="(min-width: 1024px) 44vw, 100vw" className="object-cover" />
              <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(18,26,32,0.05),rgba(18,26,32,0.77))]" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d9a441]">Atlas solar structure</p>
                <p className="mt-3 max-w-md text-2xl font-semibold leading-tight text-[#f3f0e9]">Parking cover and solar potential, designed as one practical structure.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pt-8 sm:px-8 lg:px-10">
        <div className="grid overflow-hidden border border-[#121a20]/15 bg-white sm:grid-cols-3">
          {proofPoints.map(([title, description], index) => (
            <div key={title} className="border-b border-[#121a20]/10 px-5 py-6 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 sm:px-7">
              <p className="font-mono text-xs text-[#1c5b57]">0{index + 1}</p>
              <h2 className="mt-4 text-lg font-semibold tracking-[-0.025em]">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#121a20]/65">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-7xl scroll-mt-24 px-5 pt-16 sm:px-8 sm:pt-24 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#1c5b57]">A clearer route to enquiry</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.045em] sm:text-4xl">Start with the parking layout, not a generic form.</h2>
          </div>
          <p className="max-w-2xl text-base leading-7 text-[#121a20]/65">The Atlas estimator is designed to make the first commercial conversation more useful. Pick the parking requirement, see the structural direction, then send an enquiry with stronger project context already in place.</p>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {processSteps.map(([number, title, description]) => (
            <div key={number} className="border border-[#121a20]/15 bg-white p-6 shadow-[0_22px_44px_-42px_rgba(18,26,32,0.75)] sm:p-7">
              <p className="font-mono text-xs text-[#d9a441]">{number}</p>
              <h3 className="mt-8 text-2xl font-semibold tracking-[-0.04em]">{title}</h3>
              <p className="mt-4 text-sm leading-6 text-[#121a20]/65">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pt-16 sm:px-8 sm:pt-24 lg:px-10">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#1c5b57]">Where Atlas fits</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">Built around how the parking area needs to work.</h2>
          </div>
          <Link href="/tools/solar-carport-estimator" className="inline-flex items-center gap-2 text-sm font-semibold text-[#1c5b57] hover:text-[#121a20]">Start my estimate <Arrow /></Link>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {applications.map((item) => (
            <article key={item.title} className="overflow-hidden border border-[#121a20]/15 bg-white shadow-[0_22px_44px_-42px_rgba(18,26,32,0.75)]">
              <div className="relative h-60 overflow-hidden bg-[#1c5b57]">
                <Image src={item.image} alt={item.alt} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,26,32,0.03),rgba(18,26,32,0.55))]" />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-semibold tracking-[-0.04em]">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#121a20]/65">{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pt-16 sm:px-8 sm:pt-24 lg:px-10">
        <div className="grid gap-6 border border-[#121a20]/15 bg-[#121a20] p-6 text-[#f3f0e9] sm:p-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d9a441]">Designed as an Atlas system</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.045em] sm:text-4xl">A better starting point than a standard carport with panels added later.</h2>
          </div>
          <div>
            <p className="max-w-2xl text-base leading-7 text-white/68">Atlas brings the parking layout, modular structural system, bolted assembly method, and solar-ready purpose into one clearer conversation. You start with a practical estimate, then Smart Steel reviews the site, foundations, delivery, installation, and final requirements with you.</p>
            <Link href="/tools/solar-carport-estimator" className="mt-7 inline-flex items-center justify-center bg-[#d9a441] px-6 py-3.5 text-sm font-semibold text-[#121a20] transition hover:bg-[#ebbd5f]">Price my Atlas solar carport <span className="ml-2 text-lg leading-none">→</span></Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pt-16 sm:px-8 sm:pt-24 lg:px-10">
        <div className="grid gap-8 border-t border-[#121a20]/15 py-12 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#1c5b57]">Questions before you price</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em]">The practical details buyers ask first.</h2>
          </div>
          <div className="divide-y divide-[#121a20]/15 border-y border-[#121a20]/15">
            {faqs.map((item) => (
              <details key={item.question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-base font-semibold marker:content-none">
                  {item.question}<span className="text-xl text-[#1c5b57] transition group-open:rotate-45">+</span>
                </summary>
                <p className="max-w-2xl pt-3 text-sm leading-6 text-[#121a20]/65">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid gap-px overflow-hidden border border-[#121a20]/15 bg-[#121a20]/15 md:grid-cols-3">
          {relatedPages.map(([title, description, href, cta]) => (
            <Link key={title} href={href} className="group bg-white p-6 transition hover:bg-[#f3f0e9] sm:p-7">
              <p className="text-lg font-semibold tracking-[-0.025em]">{title}</p>
              <p className="mt-3 min-h-[72px] text-sm leading-6 text-[#121a20]/65">{description}</p>
              <p className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#1c5b57]">{cta} <Arrow /></p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
