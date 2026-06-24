import Image from "next/image"
import Link from "next/link"

const PAGE_PATH = "/steel-fabrication-installation"
const SITE_URL = "https://www.smartsteel.co.za"
const SHARE_IMAGE = "/warehouse.jpg"

export const metadata = {
  title: "Steel Fabrication and Installation South Africa | Smart Steel",
  description:
    "Smart Steel supports steel fabrication and installation projects in South Africa, including warehouse structures, farm buildings, steel support systems, and practical site delivery.",
  keywords: [
    "steel fabrication and installation",
    "steel fabrication and erection",
    "steel fabrication companies in gauteng",
    "structural steel fabricators",
    "steel erectors",
    "steel erection services",
    "steel construction contractor",
  ],
  alternates: {
    canonical: PAGE_PATH,
  },
  openGraph: {
    title: "Steel Fabrication and Installation South Africa | Smart Steel",
    description:
      "Explore Smart Steel fabrication and installation support for warehouses, farm buildings, structural steel, and practical site delivery across South Africa.",
    url: `${SITE_URL}${PAGE_PATH}`,
    siteName: "Smart Steel",
    locale: "en_ZA",
    type: "website",
    images: [
      {
        url: SHARE_IMAGE,
        width: 1200,
        height: 630,
        alt: "Steel fabrication and installation by Smart Steel",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Steel Fabrication and Installation South Africa | Smart Steel",
    description:
      "Explore Smart Steel fabrication and installation support for warehouses, farm buildings, structural steel, and practical site delivery across South Africa.",
    images: [SHARE_IMAGE],
  },
}

const quickAnswers = [
  {
    question: "What does Smart Steel help with?",
    answer:
      "We support steel building projects that need design coordination, fabrication planning, structural steel supply, and installation support.",
  },
  {
    question: "What type of projects fit this page?",
    answer:
      "Warehouses, farm buildings, roof structures, solar support steel, utility buildings, and selected custom steel building work all fit this route.",
  },
  {
    question: "Do you only fabricate, or do you also install?",
    answer:
      "Depending on the project, Smart Steel can support fabrication-only enquiries as well as broader fabrication and installation scope.",
  },
  {
    question: "Where do you work?",
    answer:
      "We support projects in Gauteng and broader South Africa, with Pretoria remaining an important base for planning and coordination.",
  },
]

const serviceCards = [
  {
    title: "Steel fabrication",
    description:
      "A stronger route for clients who need structural steel prepared around real project dimensions, member schedules, and practical building use.",
  },
  {
    title: "Steel erection and installation",
    description:
      "Useful where the site programme, sequencing, and installation quality matter just as much as the fabricated steel itself.",
  },
  {
    title: "Design coordination",
    description:
      "A better fit for projects that need drawings, structural logic, and fabrication decisions aligned before the build reaches site.",
  },
]

const projectTypes = [
  "Steel warehouse buildings",
  "Steel farm buildings and agricultural structures",
  "Workshop and utility buildings",
  "Roof structures and truss-related steel scope",
  "Solar support structures and parking steel",
  "Selected custom structural steel building work",
]

const processSteps = [
  {
    title: "1. Define the project properly",
    body:
      "The best projects start with clear scope: what the building must do, how the site works, what size is needed, and where standard steel logic ends and project-specific coordination begins.",
  },
  {
    title: "2. Align design, fabrication, and budget",
    body:
      "Good steel projects are not only about making members. They depend on getting the structural route, practical detailing, and commercial scope aligned early so the fabricated steel matches the real project.",
  },
  {
    title: "3. Fabricate and prepare for site delivery",
    body:
      "Once the structural path is clear, fabrication can move with fewer surprises. That helps buyers avoid costly disconnects between drawings, steel supply, and what actually arrives on site.",
  },
  {
    title: "4. Install with the project outcome in mind",
    body:
      "Installation quality matters because the final result depends on more than steel weight. Access, sequence, site conditions, and fit-up all affect how smoothly the project comes together.",
  },
]

const faqs = [
  {
    question: "Do you offer steel fabrication and installation in Gauteng?",
    answer:
      "Yes. Smart Steel supports steel building enquiries in Gauteng and beyond, including fabrication planning and project installation scope where it fits the brief.",
  },
  {
    question: "Are you only focused on lightweight steel products?",
    answer:
      "Lightweight steel remains a major part of the Smart Steel offer, but this page is for broader building projects that need design, fabrication, erection, and delivery thinking together.",
  },
  {
    question: "Can you help with farm buildings and utility structures?",
    answer:
      "Yes. Farm buildings, storage structures, workshops, and similar agricultural or operational projects are a strong fit for this route.",
  },
  {
    question: "How do I start the conversation?",
    answer:
      "Start with the closest page to your project, then send the size, intended use, location, and any drawings or notes you already have so the scope can be reviewed properly.",
  },
]

const supportLinks = [
  {
    title: "Steel farm buildings",
    description: "Use the farm buildings page if your project is agricultural, storage-led, or tied to working farm use.",
    href: "/steel-farm-buildings",
  },
  {
    title: "Steel construction companies in Pretoria",
    description: "Use the Pretoria page if your enquiry is mainly around appointing a local steel construction company.",
    href: "/steel-construction-companies-pretoria",
  },
  {
    title: "Steel fabrication companies in Gauteng",
    description: "Use the Gauteng page if your enquiry is primarily fabrication-led across the wider province.",
    href: "/steel-fabrication-companies-gauteng",
  },
  {
    title: "Contact Smart Steel",
    description: "Send your drawings, sizes, or project notes if you want the fabrication route reviewed directly.",
    href: "/contact",
  },
]

export default function SteelFabricationInstallationPage() {
  const faqSchema = {
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
  }

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Steel Fabrication and Installation",
    provider: {
      "@type": "Organization",
      name: "Smart Steel",
      url: SITE_URL,
    },
    areaServed: {
      "@type": "Country",
      name: "South Africa",
    },
    serviceType: "Steel fabrication, structural steel supply, and installation support",
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
                  Steel Fabrication & Installation
                </p>
                <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                  Steel fabrication and installation for South African building projects
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
                  Smart Steel helps clients move from building intent to a real steel project with
                  clearer design coordination, fabrication planning, structural steel supply, and
                  practical installation support.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/contact"
                    className="rounded-full bg-[#da1a33] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#bf172d]"
                  >
                    Discuss your project
                  </Link>
                  <Link
                    href="/warehouses"
                    className="rounded-full border border-slate-900 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white"
                  >
                    Explore steel building routes
                  </Link>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 px-5 py-5">
                  <p className="text-2xl font-semibold text-slate-950">Pretoria and Gauteng</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Stronger support for project planning, fabrication coordination, and practical delivery.
                  </p>
                </div>
                <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 px-5 py-5">
                  <p className="text-2xl font-semibold text-slate-950">Design to site</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Better alignment between what is designed, what gets fabricated, and what gets installed.
                  </p>
                </div>
                <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 px-5 py-5">
                  <p className="text-2xl font-semibold text-slate-950">Real project fit</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    A better route for clients who need more than a kit and want a steel building outcome that works.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
                Quick Answers
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">
                A clearer starting point for fabrication and installation enquiries
              </h2>
            </div>
            <div className="mt-6 grid gap-4 lg:grid-cols-4">
              {quickAnswers.map((item) => (
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
                Where Smart Steel adds value in the steel building process
              </h2>
            </div>
            <div className="mt-6 grid gap-5 lg:grid-cols-3">
              {serviceCards.map((item) => (
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
                The steel building enquiries this route is meant for
              </h2>
              <div className="mt-5 space-y-3">
                {projectTypes.map((item) => (
                  <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <p className="text-sm leading-6 text-slate-700">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
                Why This Matters
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">
                More than a product catalogue route
              </h2>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                Some clients are not looking for a kit. They are looking for a company that can
                help them shape the steel solution properly, coordinate the work, and deliver a
                project that fits the site, use case, and build sequence. That is what this page is
                for.
              </p>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                It is especially useful when the enquiry sits between design, fabrication, and
                installation rather than fitting neatly into one off-the-shelf product page.
              </p>
            </div>
          </section>

          <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
                Process
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">
                How a stronger fabrication and installation process usually works
              </h2>
            </div>
            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              {processSteps.map((item) => (
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
                Common questions before clients appoint a steel contractor
              </h2>
              <div className="mt-6 space-y-4">
                {faqs.map((item) => (
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
                Send the building size, use, and location
              </h2>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                If you already have drawings, rough sizes, site notes, or a project location,
                include them in the enquiry. That makes it much easier to decide whether the right
                route is fabrication-only, fabrication and installation, or a more specific product
                or warehouse path.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <Link
                  href="/contact"
                  className="rounded-full bg-slate-950 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Contact Smart Steel
                </Link>
                <Link
                  href="/tools/estimator"
                  className="rounded-full border border-slate-300 px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  Start with an estimate
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
              {supportLinks.map((item) => (
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
