import WarehouseSystemLandingPage from "../../../components/warehouses/WarehouseSystemLandingPage"

export const metadata = {
  title: "CFLC Lip Channel Warehouses South Africa | Steel Warehouse Systems",
  description:
    "Explore CFLC lip channel warehouses in South Africa for storage, workshops, poultry buildings, and commercial projects. Understand cold formed lip channel steel, compare your options, and request a Smart Steel quote.",
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
    title: "CFLC Lip Channel Warehouses South Africa | Smart Steel",
    description:
      "See how Smart Steel CFLC lip channel warehouses fit storage, workshop, and commercial building projects.",
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
      title="CFLC and lip channel warehouses for practical storage, workshop, and cover projects"
      intro="Smart Steel CFLC warehouses are a practical option for storage, workshop, and cover projects that suit cold formed lip channel steel. Use this page to understand the system, see where it works well, and decide whether you need a custom quote or a standard-size kit."
      heroImage="/CFLC.webp"
      heroImageAlt="CFLC warehouse placeholder"
      systemName="CFLC warehouses"
      summary={[
        {
          title: "Cold formed lip channel steel",
          description: "Understand the CFLC lip channel system before you decide on sizes, pricing, or the next step for your project.",
        },
        {
          title: "Useful before quoting",
          description: "This page helps you understand the main structural choices before Smart Steel prepares the final quote.",
        },
        {
          title: "Clear next step",
          description: "Use it to decide whether your project suits a standard-size kit or needs a more custom warehouse quote.",
        },
      ]}
      bestFor={[
        "Warehouse, yard cover, workspace, storage, and poultry building projects where a cold formed lip channel structure suits the brief.",
        "Clients who want a simpler structural option before Smart Steel prepares a more detailed quotation.",
        "Projects where you want to compare CFLC against LSF before choosing the right warehouse system.",
      ]}
      strengths={[
        {
          title: "Straightforward steel option",
          description: "CFLC gives you a focused cold formed steel option when a lip channel structure suits the project.",
        },
        {
          title: "Easy to compare",
          description: "If you are weighing up different warehouse systems, this page makes the CFLC option easier to understand.",
        },
        {
          title: "Helpful before you enquire",
          description: "This page helps you confirm the main structural details early before moving into the final quotation.",
        },
        {
          title: "Flexible next steps",
          description: "You can compare systems, try the builder, use the estimator, or move into the CFLC kit range before you enquire.",
        },
      ]}
      process={[
        {
          title: "Start with the right tool",
          description: "Begin with the builder, estimator, or the CFLC kit page depending on how much detail you already know.",
        },
        {
          title: "Define the main structural details",
          description: "Set the span, length, wall height, steel finish, and gable direction that best reflect your warehouse requirement.",
        },
        {
          title: "Move into the quotation",
          description: "Smart Steel reviews the enquiry, confirms the most suitable option, and follows up with the next practical step.",
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
            "Because some projects suit a CFLC warehouse better than an LSF warehouse, and it helps to explain the lip channel steel option clearly before you enquire.",
        },
        {
          question: "Can I compare CFLC against LSF before I enquire?",
          answer:
            "Yes. Use the comparison page if you want to understand the difference first, or use the builder and estimator to compare both options in more detail.",
        },
        {
          question: "What if I want a standard-size CFLC kit instead?",
          answer:
            "If you already know you want a standard-size CFLC kit, the CFLC DIY kits page is the best place to compare sizes, see what is included, and request the kit.",
        },
        {
          question: "Can CFLC work for poultry or chicken house projects?",
          answer:
            "Yes. CFLC can suit poultry and chicken house projects when a practical lip channel steel structure fits the required size, enclosure, and budget.",
        },
        {
          question: "Does this page replace a final engineered quote?",
          answer:
            "No. It helps you understand the system before Smart Steel prepares the final engineered quote.",
        },
      ]}
      ctaPrimary={{ href: "/warehouse-builder", label: "Build a CFLC warehouse" }}
      ctaSecondary={{ href: "/tools/estimator", label: "Estimate a CFLC warehouse" }}
      alternateSystem={{
        href: "/products/cflc-diy-warehouse-kits",
        title: "CFLC kits",
        description: "If you want to compare standard-size kits, see starting prices, and request a supply-only option, explore the CFLC kits page.",
      }}
    />
  )
}
