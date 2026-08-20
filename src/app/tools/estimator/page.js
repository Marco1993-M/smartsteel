import EstimatorClient from "./EstimatorClient";

export const metadata = {
  title: "Atlas Steel Warehouse Estimator South Africa | Smart Steel",
  description:
    "Calculate an indicative Atlas lip channel steel warehouse price online in South Africa. Choose a standard width, modular length, steel finish and sheeting option.",
  alternates: {
    canonical: "/tools/estimator",
  },
  openGraph: {
    title: "Atlas Steel Warehouse Estimator South Africa | Smart Steel",
    description:
      "Price a standard Atlas lip channel warehouse online using Smart Steel's current shared warehouse pricing logic.",
    url: "https://www.smartsteel.co.za/tools/estimator",
    siteName: "Smart Steel",
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Atlas Steel Warehouse Estimator South Africa | Smart Steel",
    description:
      "Get a quick Atlas lip channel steel warehouse budget guide online with Smart Steel.",
  },
};

export default function Page() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is the Atlas warehouse estimator a final quotation?",
        acceptedAnswer: { "@type": "Answer", text: "No. It is an indicative supply-only budget excluding VAT. Smart Steel reviews the configuration before issuing a formal proposal." },
      },
      {
        "@type": "Question",
        name: "Why are warehouse delivery and installation priced separately?",
        acceptedAnswer: { "@type": "Answer", text: "Distance, access, ground conditions and installation requirements differ by project, so they are reviewed separately for a fairer figure." },
      },
      {
        "@type": "Question",
        name: "How long can an Atlas warehouse be?",
        acceptedAnswer: { "@type": "Answer", text: "Atlas warehouses use 4 metre modular bays, with online estimator options extending to 60 metres." },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <EstimatorClient />
    </>
  );
}
