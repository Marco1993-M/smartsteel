import WarehouseSystemLandingPage from "../../../components/warehouses/WarehouseSystemLandingPage"

export const metadata = {
  title: "LSF Warehouses South Africa | Smart Steel",
  description:
    "Explore Smart Steel LSF warehouses for storage, workshop, fleet, and commercial projects in South Africa. Compare the system, use the builder, or request a quote.",
  keywords: [
    "LSF warehouses South Africa",
    "lightweight steel warehouse",
    "LSF warehouse system",
    "steel warehouse builder",
    "warehouse pricing South Africa",
  ],
  alternates: {
    canonical: "/warehouses/lsf",
  },
  openGraph: {
    title: "LSF Warehouses South Africa | Smart Steel",
    description:
      "See how Smart Steel LSF warehouses fit practical storage, workshop, and commercial projects.",
    url: "https://www.smartsteel.co.za/warehouses/lsf",
    siteName: "Smart Steel",
    locale: "en_ZA",
    type: "website",
  },
}

export default function LsfWarehousesPage() {
  return (
    <WarehouseSystemLandingPage
      eyebrow="LSF Warehouses"
      title="LSF warehouses built for practical warehouse, workshop, and storage projects"
      intro="Smart Steel LSF warehouse systems give buyers a clear modular starting point for warehousing, workshop use, fleet cover, and day-to-day operational space. If you want a cleaner way to compare size, enclosure, access openings, and scope, this is the strongest place to start."
      systemName="LSF warehouses"
      summary={[
        {
          title: "Clear modular path",
          description: "Choose a standard span, define the length, and shape the shell around the way your project actually needs to work.",
        },
        {
          title: "Good for structured budgeting",
          description: "The LSF lane is built to help you compare scope, cladding, enclosure, openings, and overall project direction without overcomplicating the first step.",
        },
        {
          title: "Easy route into the builder",
          description: "If you want a more visual design process, the LSF warehouse builder gives you a live preview and a cleaner enquiry handoff.",
        },
      ]}
      bestFor={[
        "General warehousing, storage, workshop, and light industrial buildings that benefit from a modular steel shell.",
        "Projects where the buyer wants to compare enclosure level, cladding, and access openings before moving into a detailed quote.",
        "Clients who want a structured commercial starting point, not just a vague 'contact us' form.",
      ]}
      strengths={[
        {
          title: "Flexible buyer path",
          description: "The LSF route is well suited to clients who want to compare systems, pricing paths, and scope options before committing to a quote direction.",
        },
        {
          title: "Strong visual planning",
          description: "The warehouse builder and estimator both support the LSF lane well, which makes early design conversations easier.",
        },
        {
          title: "Modular warehouse thinking",
          description: "This system works especially well when the project benefits from clear standard widths, practical bay lengths, and a sensible expansion mindset.",
        },
        {
          title: "Good fit for early-stage enquiries",
          description: "If the project brief is still taking shape, the LSF lane gives Smart Steel a strong way to guide the client toward the right solution.",
        },
      ]}
      process={[
        {
          title: "Choose the right warehouse direction",
          description: "Start with the builder, estimator, or direct enquiry path depending on how visual or how quick you want the first step to be.",
        },
        {
          title: "Shape the main project requirements",
          description: "Define the span, length, enclosure, cladding, and opening requirements that affect how the warehouse will actually be used.",
        },
        {
          title: "Move into the proper quote path",
          description: "Smart Steel reviews the project context, sense-checks the scope, and follows up with the most practical quotation route.",
        },
      ]}
      faqs={[
        {
          question: "What does LSF mean in a warehouse project?",
          answer:
            "LSF stands for lightweight steel framing. In a warehouse context, it gives buyers a practical modular steel route with clear sizing, scope, and design choices.",
        },
        {
          question: "Is the LSF warehouse path only for small buildings?",
          answer:
            "No. It works well for a range of warehouse, workshop, and storage projects, especially where a structured modular approach helps the design and budgeting process.",
        },
        {
          question: "Can I price an LSF warehouse online first?",
          answer:
            "Yes. You can use the warehouse builder for a live design flow or the estimator if you want a faster budget starting point.",
        },
        {
          question: "Do I need final drawings before I enquire?",
          answer:
            "No. This page is built for clients who want a stronger starting point before they have every detail finalised.",
        },
      ]}
      ctaPrimary={{ href: "/warehouse-builder", label: "Build an LSF warehouse" }}
      ctaSecondary={{ href: "/tools/estimator", label: "Estimate an LSF warehouse" }}
      ctaTertiary={{ href: "/warehouses/lsf-vs-cflc", label: "Compare LSF vs CFLC" }}
      alternateSystem={{
        href: "/warehouses/cflc",
        title: "CFLC warehouses",
        description: "See the cold formed lip channel warehouse path if your project suits that system better.",
      }}
    />
  )
}
