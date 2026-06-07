import Link from "next/link"

export const metadata = {
  title: "Steel Warehouses South Africa | LSF & CFLC Warehouse Systems",
  description:
    "Explore steel warehouses in South Africa from Smart Steel. Compare LSF and CFLC warehouse systems, understand pricing, and choose between a custom warehouse or practical lipped channel kit options.",
  alternates: {
    canonical: "/warehouses",
  },
  openGraph: {
    title: "Steel Warehouses South Africa | Smart Steel",
    description:
      "Compare LSF and CFLC steel warehouse systems, understand what affects pricing, and start the right warehouse option for your project.",
    url: "https://www.smartsteel.co.za/warehouses",
    siteName: "Smart Steel",
    locale: "en_ZA",
    type: "website",
  },
}

const quickAnswers = [
  {
    question: "What is a steel warehouse?",
    answer:
      "A steel warehouse is a structural building system used for storage, workshops, operational space, agricultural use, and commercial utility buildings.",
  },
  {
    question: "Do you offer custom and standard options?",
    answer:
      "Yes. Smart Steel offers custom LSF warehouse systems as well as CFLC and lipped channel kits in standard sizes.",
  },
  {
    question: "What is the difference between LSF and CFLC?",
    answer:
      "LSF is better suited to custom warehouse projects, while CFLC gives you a practical cold formed lipped channel option for standard sizes and simpler supply enquiries.",
  },
  {
    question: "How do I get a price?",
    answer:
      "You can start with the warehouse builder, use the estimator for a budget check, or browse the pricing and product pages before sending an enquiry.",
  },
]

const systems = [
  {
    title: "LSF warehouse systems",
    description:
      "Best for custom warehouse projects, larger requirements, and layouts that need more flexibility.",
    bullets: [
      "Custom sizes and layouts",
      "Useful for broader warehouse requirements",
      "A good fit when scope, cladding, and openings need more flexibility",
    ],
    href: "/warehouses/lsf",
    cta: "Explore LSF systems",
  },
  {
    title: "CFLC and lipped channel warehouse options",
    description:
      "Best for practical, repeatable steel building sizes for smaller warehouses, covers, and utility structures.",
    bullets: [
      "Cold formed lipped channel steel construction",
      "Standard sizes that are easier to compare",
      "A simpler option when you want supply-only kit pricing first",
    ],
    href: "/products/cflc-diy-warehouse-kits",
    cta: "Browse CFLC kits",
  },
]

const pricingFactors = [
  "span and overall building width",
  "building length and number of bays",
  "wall height and ridge height",
  "LSF or CFLC / lipped channel structural system",
  "cladding, openings, and finish choices",
  "delivery, installation, and site-specific requirements",
]

const includedItems = [
  "main structural steel",
  "system-specific engineering scope where relevant",
  "selected kit or warehouse components based on the option you choose",
]

const excludedItems = [
  "delivery unless confirmed",
  "installation unless confirmed",
  "concrete and foundations",
  "doors, windows, and site-specific extras unless included in scope",
]

const useCases = [
  "storage warehouses",
  "workshops",
  "agricultural buildings",
  "commercial utility buildings",
  "light industrial use",
  "cover and yard structures",
]

const finalQuestions = [
  {
    question: "Do you offer steel warehouses across South Africa?",
    answer:
      "Yes. Smart Steel supports warehouse enquiries across South Africa, with online tools and region pages that make it easier to get started.",
  },
  {
    question: "Can I choose between a custom system and a standard kit?",
    answer:
      "Yes. You can choose a custom LSF warehouse system or start with a CFLC and lipped channel kit in a standard size.",
  },
  {
    question: "Is CFLC suitable for DIY-friendly projects?",
    answer:
      "Yes. The CFLC and lipped channel range works well for DIY-friendly projects when standard sizes and supply-only options make sense.",
  },
  {
    question: "Can Smart Steel help with pricing before final quoting?",
    answer:
      "Yes. The estimator, pricing pages, and product pages give you a clearer budget guide before the final quote is prepared.",
  },
  {
    question: "What if I am not sure which system fits my project?",
    answer:
      "Start on this page, compare the two systems, and then use the builder, estimator, or speak to Smart Steel for guidance.",
  },
]

export default function WarehousesHubPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#fff7f5,_#ffffff_24%,_#edf3f7)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-[2.25rem] border border-slate-200 bg-white/90 px-6 py-10 shadow-sm backdrop-blur sm:px-8 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#da1a33]">
                Warehouses
              </p>
              <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Steel warehouses in South Africa
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
                Smart Steel offers custom LSF warehouse systems as well as CFLC and lipped
                channel options in practical standard sizes. Use this page to compare the systems,
                understand what affects pricing, and decide which warehouse option suits your
                project best.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/warehouse-builder"
                  className="rounded-full bg-[#da1a33] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#bf172d]"
                >
                  Build your warehouse
                </Link>
                <Link
                  href="/products/cflc-diy-warehouse-kits"
                  className="rounded-full border border-slate-900 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white"
                >
                  Browse CFLC kits
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 px-5 py-5">
                <p className="text-2xl font-semibold text-slate-950">Custom or standard sizes</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Compare a custom LSF warehouse with a CFLC and lipped channel kit in a standard
                  size.
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 px-5 py-5">
                <p className="text-2xl font-semibold text-slate-950">Builder, estimator, pricing</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Use the right tool for the stage your warehouse project is currently in.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
            Quick Answers
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-950">
            The main warehouse questions clients usually ask first
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {quickAnswers.map((item) => (
              <div key={item.question} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-950">{item.question}</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
            LSF vs CFLC
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-950">
            Which warehouse system fits your project?
          </h2>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {systems.map((item) => (
              <div key={item.title} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6">
                <p className="text-xl font-semibold text-slate-950">{item.title}</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
                <div className="mt-4 space-y-2">
                  {item.bullets.map((bullet) => (
                    <div key={bullet} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700">
                      {bullet}
                    </div>
                  ))}
                </div>
                <Link
                  href={item.href}
                  className="mt-5 inline-flex text-sm font-semibold text-[#da1a33] transition hover:text-[#bf172d]"
                >
                  {item.cta}
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
              How To Choose
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              How do I choose between LSF and CFLC?
            </h2>
            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-700">
                Choose <span className="font-semibold text-slate-900">LSF</span> if you need a
                custom warehouse, more flexibility in the layout, or a building that needs a more
                tailored scope.
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-700">
                Choose <span className="font-semibold text-slate-900">CFLC / lipped channel</span>{" "}
                if you want standard sizes, simpler pricing, and a practical steel kit that is
                easier to compare.
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-700">
                If you are not sure yet, start with the estimator or talk to Smart Steel before
                choosing the final system.
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
              Start Here
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              How do I get started?
            </h2>
            <div className="mt-5 grid gap-3">
              <Link
                href="/warehouse-builder"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-slate-300 hover:bg-white"
              >
                <p className="text-sm font-semibold text-slate-900">Build Your Warehouse</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Best if you already know the broad size, use, and layout you need.
                </p>
              </Link>
              <Link
                href="/tools/estimator"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-slate-300 hover:bg-white"
              >
                <p className="text-sm font-semibold text-slate-900">Use the Estimator</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Best if you want a quick budget check before moving into a full quote.
                </p>
              </Link>
              <Link
                href="/products/cflc-diy-warehouse-kits"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-slate-300 hover:bg-white"
              >
                <p className="text-sm font-semibold text-slate-900">Browse CFLC Kits</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Best if you want a simpler lipped channel kit in a standard size.
                </p>
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-slate-950 px-6 py-8 text-white shadow-sm sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
              Pricing
            </p>
            <h2 className="mt-3 text-3xl font-semibold">
              What affects the cost of a steel warehouse?
            </h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {pricingFactors.map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm leading-6 text-slate-200">
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/warehouse-cost"
                className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                See warehouse pricing
              </Link>
              <Link
                href="/tools/estimator"
                className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Use the estimator
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
              Included vs Excluded
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              What is usually included in a warehouse quote?
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-900">Usually included</p>
                <div className="mt-3 space-y-2">
                  {includedItems.map((item) => (
                    <div key={item} className="text-sm leading-6 text-slate-600">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-900">Not always included</p>
                <div className="mt-3 space-y-2">
                  {excludedItems.map((item) => (
                    <div key={item} className="text-sm leading-6 text-slate-600">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
            Use Cases
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-950">
            What can these warehouse systems be used for?
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {useCases.map((item) => (
              <div key={item} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 px-5 py-5">
                <p className="text-sm font-semibold capitalize text-slate-900">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
            Common Questions
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-950">
            The final questions clients usually ask before they enquire
          </h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {finalQuestions.map((item) => (
              <div key={item.question} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-900">{item.question}</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
            Final Step
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-950">
            Start your warehouse project with the right system
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
            Use the builder if you want to shape a custom warehouse, browse the CFLC and lipped
            channel kit range if you want to compare standard sizes, or talk to Smart Steel if you
            want help choosing.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/warehouse-builder"
              className="rounded-full bg-[#da1a33] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#bf172d]"
            >
              Build your warehouse
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-slate-900 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white"
            >
              Talk to Smart Steel
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
