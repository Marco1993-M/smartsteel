import WarehouseSystemLandingPage from "../../../components/warehouses/WarehouseSystemLandingPage"

export const metadata = {
  title: "CFLC Warehouses South Africa | Steel Warehouse Systems",
  description:
    "Explore CFLC warehouses in South Africa for storage, workshop, and commercial projects. Compare the system, use the builder, or request a Smart Steel quote.",
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
      title="CFLC warehouses for practical storage, workshop, and cover projects"
      intro="Smart Steel CFLC warehouses give you a clear starting point if a cold formed lip channel steel structure suits your project better. Use this page to understand where the system fits, what sizes and uses it suits, and how to start the quote conversation with the right project details."
      heroImage="/CFLC.webp"
      heroImageAlt="CFLC warehouse placeholder"
      systemName="CFLC warehouses"
      summary={[
        {
          title: "Clear warehouse option",
          description: "This page is useful if you already know you want a cold formed lip channel warehouse or want to compare it properly against LSF.",
        },
        {
          title: "Practical first-step budgeting",
          description: "It keeps the early conversation focused on the main structural choices that shape the project.",
        },
        {
          title: "Stronger project fit",
          description: "It gives you a more specific warehouse starting point when the project needs a clear structural direction from the beginning.",
        },
      ]}
      bestFor={[
        "Warehouse, yard cover, workspace, and storage projects where a cold formed lip channel structure suits the brief.",
        "Clients who want a simpler structural starting point before Smart Steel prepares a more detailed quotation.",
        "Projects where comparing LSF and CFLC clearly up front helps avoid confusion later.",
      ]}
      strengths={[
        {
          title: "Clear structural direction",
          description: "CFLC gives buyers a more focused cold formed steel option when the project needs a clear structural starting point.",
        },
        {
          title: "Useful when comparing systems",
          description: "If your project team is weighing up different warehouse systems, this page gives you a clearer understanding of the CFLC option.",
        },
        {
          title: "Good first-step planning",
          description: "This page is useful when the main requirement is to define the warehouse direction early and then let Smart Steel shape the final quotation properly.",
        },
        {
          title: "Easy next steps",
          description: "You can compare systems, try the builder, or use the estimator without losing track of which warehouse option you are exploring.",
        },
      ]}
      process={[
        {
          title: "Start with the right tool",
          description: "Begin with the builder, estimator, or this page depending on how much design guidance you want at the start.",
        },
        {
          title: "Define the main structural details",
          description: "Set the span, length, wall height, steel finish, and gable direction that best reflect your warehouse requirement.",
        },
        {
          title: "Move into the quotation",
          description: "Smart Steel reviews the enquiry, confirms the best direction, and follows up with the next practical step.",
        },
      ]}
      faqs={[
        {
          question: "What does CFLC mean in a warehouse project?",
          answer:
            "CFLC refers to a cold formed lip channel steel warehouse system. It is a practical steel option for warehouse, storage, and workspace projects.",
        },
        {
          question: "Why does Smart Steel have a separate CFLC warehouse page now?",
          answer:
            "Because some projects suit a CFLC warehouse better than an LSF warehouse, and it helps to compare the options clearly from the start.",
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
      alternateSystem={{
        href: "/warehouses/lsf",
        title: "LSF warehouses",
        description: "See the more modular LSF warehouse page if your project needs broader scope and shell comparisons.",
      }}
    />
  )
}
