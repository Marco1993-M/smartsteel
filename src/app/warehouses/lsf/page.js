import WarehouseSystemLandingPage from "../../../components/warehouses/WarehouseSystemLandingPage"

export const metadata = {
  title: "LSF Warehouses South Africa | Steel Warehouse Systems",
  description:
    "Explore LSF warehouses in South Africa for storage, workshops, poultry houses, fleet, and commercial projects. Understand the system, use the builder, or request a Smart Steel quote.",
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
      title="LSF warehouse systems for custom steel warehouse projects"
      intro="LSF is a strong option when you need a custom steel warehouse with more flexibility in size, layout, cladding, and openings. Use this page to understand the system, check the main questions, and start your quote with clearer project details."
      heroImage="/warehouse.jpg"
      heroImageAlt="LSF warehouse building"
      systemName="LSF warehouses"
      summary={[
        {
          title: "Custom warehouse option",
          description: "A strong fit when you need a warehouse designed around your size, layout, and building requirements.",
        },
        {
          title: "Builder and estimator",
          description: "Use the builder for a visual layout or the estimator for a quicker budget guide.",
        },
        {
          title: "More flexibility",
          description: "Compare enclosure, cladding, openings, and size with more room to shape the building around your needs.",
        },
        {
          title: "Clear next steps",
          description: "A practical way to move from an early idea into a clearer warehouse quote.",
        },
      ]}
      entryPaths={[
        {
          title: "Use the warehouse builder",
          href: "/warehouse-builder",
          description: "Shape the warehouse step by step if you want to start with size, height, and layout.",
        },
        {
          title: "Use the estimator",
          href: "/tools/estimator",
          description: "Get a clearer budget guide first if you want to understand pricing before you enquire.",
        },
        {
          title: "Talk to Smart Steel",
          href: "/contact",
          description: "Speak to the team directly if you already know the broad warehouse requirement.",
        },
      ]}
      bestFor={[
        "Warehouses, storage buildings, workshops, poultry houses, and light industrial buildings that need a custom steel shell.",
        "Projects where you want to compare enclosure level, cladding, and access openings before moving into a detailed quote.",
        "Clients who want to start with the builder, estimator, or direct guidance instead of a standard-size kit.",
      ]}
      strengths={[
        {
          title: "Flexible building options",
          description: "LSF works well when you want to compare layouts, enclosure levels, and building details before finalising the quote.",
        },
        {
          title: "Strong visual planning",
          description: "The warehouse builder and estimator make it easier to understand the building before you move into the final quote.",
        },
        {
          title: "Modular steel system",
          description: "This system works well when the project benefits from practical bay lengths, clear spans, and room for future growth.",
        },
        {
          title: "Useful early in the process",
          description: "If the project brief is still taking shape, this page helps you ask the right questions before the quote is prepared.",
        },
      ]}
      process={[
        {
          title: "Start in the way that suits you",
          description: "Use the builder, estimator, or contact page depending on whether you want a visual layout, a quick budget guide, or direct help.",
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
            "LSF stands for lightweight steel framing. In a warehouse context, it gives you a practical modular steel option with clear sizing, scope, and design choices.",
        },
        {
          question: "Is LSF only for small buildings?",
          answer:
            "No. It works well for a range of warehouse, workshop, poultry house, and storage projects, especially where a structured modular approach helps the design and budgeting process.",
        },
        {
          question: "Can LSF work for chicken houses or poultry buildings?",
          answer:
            "Yes. LSF can work well for poultry houses and chicken house buildings when the project needs a custom size, enclosure level, and practical long-term steel structure.",
        },
        {
          question: "Can I price an LSF warehouse online first?",
          answer:
            "Yes. You can use the warehouse builder for a live design layout or the estimator if you want a faster budget guide.",
        },
        {
          question: "Do I need final drawings before I enquire?",
          answer:
            "No. This page is useful if you want a clearer starting point before every detail is finalised.",
        },
        {
          question: "What if a standard-size kit does not suit my project?",
          answer:
            "That is exactly where LSF fits best. It gives you more flexibility when the building needs a custom size, layout, or enclosure level.",
        },
      ]}
      ctaPrimary={{ href: "/warehouse-builder", label: "Build an LSF warehouse" }}
      ctaSecondary={{ href: "/tools/estimator", label: "Estimate an LSF warehouse" }}
      alternateSystem={{
        href: "/products/cflc-diy-warehouse-kits",
        title: "CFLC kits",
        description: "If you would rather browse standard kit sizes, compare starting prices, and request a more DIY-friendly option, explore the CFLC kits.",
      }}
    />
  )
}
