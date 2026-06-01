import WarehouseSystemLandingPage from "../../../components/warehouses/WarehouseSystemLandingPage"

export const metadata = {
  title: "LSF Warehouses South Africa | Steel Warehouse Systems",
  description:
    "Explore LSF warehouses in South Africa for storage, workshop, fleet, and commercial projects. Compare the system, use the builder, or request a Smart Steel quote.",
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
      modeSwitch={{
        helper: "Choose between DIY-friendly CFLC kits and custom LSF warehouse systems.",
        modes: [
          { label: "CFLC Kits", href: "/products/cflc-diy-warehouse-kits", active: false },
          {
            label: "LSF Systems",
            href: "/warehouses/lsf",
            active: true,
            actions: [
              { label: "Build your warehouse", href: "/warehouse-builder" },
              { label: "Use estimator", href: "/tools/estimator", variant: "secondary" },
            ],
          },
        ],
      }}
      eyebrow="LSF Warehouses"
      title="LSF warehouse systems for broader custom warehouse projects"
      intro="Use the LSF route when you want to shape a more custom warehouse project. Compare the system, start with the builder or estimator, and move into a clearer project conversation with Smart Steel."
      systemName="LSF warehouses"
      summary={[
        {
          title: "Custom project route",
          description: "A stronger fit when you want to shape a broader warehouse project instead of selecting a standard DIY kit.",
        },
        {
          title: "Builder and estimator",
          description: "Use the builder for a visual route or the estimator for a quicker budget starting point.",
        },
        {
          title: "Broader warehouse flexibility",
          description: "Compare scope, cladding, enclosure, openings, and size with more room to shape the project.",
        },
        {
          title: "Project-led support",
          description: "A good fit when you want to move from concept into a more consultative quote process.",
        },
      ]}
      entryPaths={[
        {
          title: "Use the warehouse builder",
          href: "/warehouse-builder",
          description: "Take a more visual route and shape the warehouse step by step before you enquire.",
        },
        {
          title: "Use the estimator",
          href: "/tools/estimator",
          description: "Get a clearer starting budget first if you want a quicker planning route.",
        },
        {
          title: "Talk to Smart Steel",
          href: "/contact",
          description: "Start directly with the team if you already know the broad project direction.",
        },
      ]}
      bestFor={[
        "General warehousing, storage, workshop, and light industrial buildings that benefit from a modular steel shell and a more custom planning route.",
        "Projects where the buyer wants to compare enclosure level, cladding, and access openings before moving into a detailed quote.",
        "Clients who want to start with builder, estimator, or direct project guidance instead of a standard product selection flow.",
      ]}
      strengths={[
        {
          title: "Flexible buyer path",
          description: "The LSF route works well for buyers who want to compare systems, budget ranges, and scope options before committing to a quotation.",
        },
        {
          title: "Strong visual planning",
          description: "The warehouse builder and estimator both support the LSF option well, which makes early design conversations easier.",
        },
        {
          title: "Modular warehouse thinking",
          description: "This system works especially well when the project benefits from clear standard widths, practical bay lengths, and a sensible expansion mindset.",
        },
        {
          title: "Good fit for early-stage enquiries",
          description: "If the project brief is still taking shape, this page gives Smart Steel a strong way to guide the client toward the right solution.",
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
          title: "Move into the quotation",
          description: "Smart Steel reviews the project context, checks the scope, and follows up with the most practical next step.",
        },
      ]}
      faqs={[
        {
          question: "What does LSF mean in a warehouse project?",
          answer:
            "LSF stands for lightweight steel framing. In a warehouse context, it gives buyers a practical modular steel option with clear sizing, scope, and design choices.",
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
            "No. This page is useful for clients who want a stronger starting point before they have every detail finalised.",
        },
      ]}
      ctaPrimary={{ href: "/warehouse-builder", label: "Build an LSF warehouse" }}
      ctaSecondary={{ href: "/tools/estimator", label: "Estimate an LSF warehouse" }}
      alternateSystem={{
        href: "/products/cflc-diy-warehouse-kits",
        title: "CFLC kits",
        description: "If you would rather browse standard kit sizes, compare starting prices, and request a more DIY-friendly option, switch to the CFLC kit route.",
      }}
    />
  )
}
