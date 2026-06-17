import Image from "next/image"
import Link from "next/link"

const SITE_URL = "https://www.smartsteel.co.za"
const PAGE_PATH = "/products/cflc-solar-carports"

export const metadata = {
  title: "CFLC Solar Carports | Smart Steel",
  description:
    "Explore Smart Steel CFLC solar carports for covered parking, solar-ready layouts, and practical steel parking structures built for South African sites.",
  alternates: {
    canonical: PAGE_PATH,
  },
  openGraph: {
    title: "CFLC Solar Carports | Smart Steel",
    description:
      "Compare Smart Steel CFLC solar carports for covered parking, solar-ready layouts, and practical steel parking structures.",
    url: `${SITE_URL}${PAGE_PATH}`,
    siteName: "Smart Steel",
    locale: "en_ZA",
    type: "website",
  },
}

const quickAnswers = [
  {
    question: "What is a solar carport?",
    answer:
      "A solar carport is a steel parking structure designed to create covered parking while also supporting solar panels.",
  },
  {
    question: "Who are these structures best for?",
    answer:
      "They work well for offices, schools, business parks, retail sites, estates, and other projects where parking cover and energy value both matter.",
  },
  {
    question: "Do you only supply the steel structure?",
    answer:
      "Smart Steel can help with structure-only enquiries as well as broader solar-ready planning, depending on the project.",
  },
  {
    question: "How do I start?",
    answer:
      "Start with the solar carport page, compare the project examples, and then send your enquiry with the parking layout or site details if you have them.",
  },
]

const productCards = [
  {
    title: "Commercial parking solar carports",
    description:
      "A good fit for offices, retail parking, and business campuses that need covered bays with a stronger long-term energy story.",
  },
  {
    title: "School and campus solar carports",
    description:
      "Useful where covered parking, durability, and visible solar infrastructure need to work together on one site.",
  },
  {
    title: "Fleet and operational parking solar carports",
    description:
      "A practical option for larger vehicle areas where parking cover, repeatability, and solar-ready planning all matter.",
  },
]

const galleryImages = [
  { src: "/solar_carport_hero.webp", alt: "Smart Steel solar carport overview" },
  { src: "/solar_carport_1.webp", alt: "Smart Steel solar carport side view" },
  { src: "/solar_carport_2.webp", alt: "Smart Steel solar carport detail view" },
]

const supportLinks = [
  {
    title: "Explore solar carport regions",
    description: "Compare the regional solar carport pages if your project is location-specific.",
    href: "/solar-carports",
  },
  {
    title: "Explore CFLC carport kits",
    description: "See the non-solar carport page if you need parking cover without the solar element.",
    href: "/products/cflc-carport-kits",
  },
  {
    title: "Talk to Smart Steel",
    description: "Send your layout or parking requirement if you want help with the next step.",
    href: "/tools/solar-carport-estimator",
  },
]

export default function CflcSolarCarportsPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc,_#ffffff_24%,_#fff7f5)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="relative mt-6 overflow-hidden rounded-[2.25rem] border border-slate-200 bg-white/90 px-6 py-10 shadow-sm backdrop-blur sm:px-8 lg:px-10">
          <Image
            src="/solar_carport_hero.webp"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-[0.98]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.88),rgba(255,255,255,0.72))]" />
          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#da1a33]">
                CFLC Solar Carports
              </p>
              <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Solar carports for covered parking and solar-ready project planning
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
                Explore practical steel solar carports for offices, schools, business parks, and
                parking areas that need covered bays with long-term solar value.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="#solar-carports"
                  className="rounded-full bg-[#da1a33] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#bf172d]"
                >
                  View solar carports
                </Link>
                <Link
                  href="/tools/solar-carport-estimator"
                  className="rounded-full border border-slate-900 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white"
                >
                  Estimate your solar carport
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 px-5 py-5">
                <p className="text-2xl font-semibold text-slate-950">Covered parking</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Create better parking cover for everyday use, not just a temporary shade solution.
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 px-5 py-5">
                <p className="text-2xl font-semibold text-slate-950">Solar-ready layouts</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Plan the structure and the solar intent together from the start.
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 px-5 py-5">
                <p className="text-2xl font-semibold text-slate-950">Commercial sites</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  A strong fit for offices, schools, estates, business parks, and operational parking.
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
              A few useful answers before you enquire
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

        <section id="solar-carports" className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
              Solar Carport Options
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              The main solar carport project types we support
            </h2>
          </div>
          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            {productCards.map((item, index) => (
              <div key={item.title} className="overflow-hidden rounded-[1.85rem] border border-slate-200 bg-slate-50 shadow-sm">
                <div className="relative h-60">
                  <Image
                    src={galleryImages[index % galleryImages.length].src}
                    alt={galleryImages[index % galleryImages.length].alt}
                    fill
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    className="object-cover object-center"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-semibold text-slate-950">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
              Recent Solar Carport Photos
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              Real project images help show the product clearly
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {galleryImages.map((image) => (
                <div key={image.src} className="relative h-40 overflow-hidden rounded-[1.5rem] border border-slate-200">
                  <Image src={image.src} alt={image.alt} fill sizes="33vw" className="object-cover object-center" />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
              Next Step
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              Move into the right solar carport page or send your enquiry
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              If your project is tied to a specific city, the regional solar carport pages will
              help you compare that next step more clearly. If you are ready to enquire, send the
              parking layout or site information you already have.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/solar-carports"
                className="rounded-full bg-slate-950 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Explore solar carport regions
              </Link>
              <Link
                href="/tools/solar-carport-estimator"
                className="rounded-full border border-slate-300 px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Estimate your solar carport
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
            More Help
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-950">
            Explore related pages
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
  )
}
