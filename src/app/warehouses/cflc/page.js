import WarehouseSystemLandingPage from "../../../components/warehouses/WarehouseSystemLandingPage"

export const metadata = {
  title: "CFLC Warehouses South Africa | Smart Steel",
  description:
    "Explore Smart Steel CFLC warehouses for storage, workshop, and commercial projects in South Africa. Compare the system, use the builder, or request a quote.",
  keywords: [
    "CFLC warehouses South Africa",
    "cold formed lip channel warehouse",
    "CFLC warehouse system",
    "lip channel warehouse",
    "steel warehouse pricing South Africa",
  ],
  alternates: {
    canonical: "/warehouses/cflc",
  },
  openGraph: {
    title: "CFLC Warehouses South Africa | Smart Steel",
    description:
      "See how Smart Steel CFLC warehouses fit storage, workshop, and commercial building projects.",
    url: "https://www.smartsteel.co.za/warehouses/cflc",
    siteName: "Smart Steel",
    locale: "en_ZA",
    type: "website",
  },
}

export default function CflcWarehousesPage() {
  return (
    <WarehouseSystemLandingPage
      eyebrow="CFLC Warehouses"
      title="CFLC warehouses for buyers who want a clearer cold formed steel system path"
      intro="Smart Steel CFLC warehouse systems give clients a clearer way into cold formed lip channel steel structures when that system suits the project better. It is a simpler warehouse option that helps clients start with a realistic structural direction before the quotation is refined."
      systemName="CFLC warehouses"
      summary={[
        {
          title: "Clear system identity",
          description: "This page helps clients who already know they want a cold formed lip channel warehouse or want to compare it properly against LSF.",
        },
        {
          title: "Practical first-step budgeting",
          description: "The CFLC path keeps the early conversation focused on the main structural choices that shape the project.",
        },
        {
          title: "Clearer product choice",
          description: "CFLC is presented as its own Smart Steel warehouse option, rather than being hidden inside a generic warehouse page.",
        },
      ]}
      bestFor={[
        "Warehouse, yard cover, workspace, and storage projects where a cold formed lip channel option is already part of the project conversation.",
        "Clients who want a simpler structural starting point before Smart Steel refines the final quotation.",
        "Projects where comparing LSF and CFLC clearly up front helps avoid confusion later.",
      ]}
      strengths={[
        {
          title: "Focused warehouse option",
          description: "The CFLC page gives buyers a more focused cold formed steel option instead of forcing every warehouse enquiry into one generic model.",
        },
        {
          title: "Strong comparison value",
          description: "If your project team is weighing up different warehouse systems, this page gives you a cleaner understanding of the CFLC option.",
        },
        {
          title: "Faster structural direction",
          description: "This page is useful when the main requirement is to define the warehouse direction early and then let Smart Steel shape the final quotation properly.",
        },
        {
          title: "Supports modern steel buying journeys",
          description: "Clients can now compare systems, try the builder, or use the estimator without losing the thread of which warehouse system they are exploring.",
        },
      ]}
      process={[
        {
          title: "Choose CFLC as your warehouse option",
          description: "Start with the builder, estimator, or direct page depending on how much design guidance you want at the beginning.",
        },
        {
          title: "Define the main structural details",
          description: "Set the span, length, wall height, steel finish, and gable direction that best reflect your warehouse requirement.",
        },
        {
          title: "Refine the quotation with Smart Steel",
          description: "Smart Steel reviews the enquiry, confirms the best direction, and follows up with the next practical step.",
        },
      ]}
      faqs={[
        {
          question: "What does CFLC mean in a warehouse project?",
          answer:
            "CFLC refers to a cold formed lip channel steel warehouse system. This page helps buyers explore that specific option more clearly.",
        },
        {
          question: "Why does Smart Steel have a separate CFLC warehouse page now?",
          answer:
            "Because CFLC is now being presented as its own warehouse option rather than a hidden variation inside a generic warehouse page. That makes buying and comparison clearer.",
        },
        {
          question: "Can I compare CFLC against LSF before I enquire?",
          answer:
            "Yes. Use the comparison page if you want to understand the difference first, or use the builder and estimator to explore both paths more actively.",
        },
        {
          question: "Does this page replace a final engineered quote?",
          answer:
            "No. It gives you a stronger client-facing starting point so Smart Steel can take the enquiry into the right quote conversation.",
        },
      ]}
      ctaPrimary={{ href: "/warehouse-builder", label: "Build a CFLC warehouse" }}
      ctaSecondary={{ href: "/tools/estimator", label: "Estimate a CFLC warehouse" }}
      ctaTertiary={{ href: "/cflc-warehouse-cost", label: "See CFLC warehouse cost" }}
      alternateSystem={{
        href: "/warehouses/lsf",
        title: "LSF warehouses",
        description: "See the more modular LSF warehouse page if your project needs broader scope and shell comparisons.",
      }}
    />
  )
}
