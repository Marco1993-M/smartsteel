import AtlasWSeriesLandingPage from "../../../components/atlas/AtlasWSeriesLandingPage"
import { ATLAS_W_SERIES_FAQS } from "../../../lib/atlasProductData"

export const metadata = {
  title: "Atlas W-Series Modular Warehouses | Smart Steel",
  description:
    "Explore Atlas W-Series modular warehouses in South Africa for storage, workshops, poultry buildings, and commercial projects. Atlas is Smart Steel's modular infrastructure platform, built around scalable lip channel steel systems.",
  keywords: [
    "Atlas W-Series warehouses",
    "Atlas modular warehouses",
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
    title: "Atlas W-Series Modular Warehouses | Smart Steel",
    description:
      "Explore Atlas W-Series modular warehouses, developed by Smart Steel for practical storage, workshop, poultry, and commercial operations.",
    url: "https://www.smartsteel.co.za/warehouses/cflc",
    siteName: "Smart Steel",
    locale: "en_ZA",
    type: "website",
  },
}

export default function CflcWarehousesPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: ATLAS_W_SERIES_FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <AtlasWSeriesLandingPage />
    </>
  )
}
