import HomePageClient from "@/components/HomePageClient";

const homeTitle =
  "Architect-Designed Lightweight Steel Homes in South Africa | Pequeño";
const homeDescription =
  "Pequeño designs and builds architect-led lightweight steel homes in South Africa, including premium homes, off-grid retreats, private houses, and selected lifestyle buildings shaped for local conditions.";

const faqItems = [
  {
    question: "What does Pequeño build?",
    answer:
      "Pequeño designs and builds architect-led lightweight steel homes, retreats, off-grid homes, and selected lifestyle or commercial structures in South Africa.",
  },
  {
    question: "Why use lightweight steel framing for a home?",
    answer:
      "Lightweight steel framing offers speed, precision, strength, and a clean structural system that suits modern homes, remote sites, and carefully detailed architectural work.",
  },
  {
    question: "Do you work in different regions of South Africa?",
    answer:
      "Yes. Pequeño is building out region-specific guidance and project pages for towns and provinces across South Africa, with climate and site considerations that differ by location.",
  },
  {
    question: "Can Pequeño help with off-grid homes?",
    answer:
      "Yes. Off-grid readiness is part of the design thinking on suitable projects, including planning for orientation, envelope performance, water systems, and solar integration.",
  },
];

export const metadata = {
  title: homeTitle,
  description: homeDescription,
  keywords: [
    "architect designed homes south africa",
    "steel frame homes south africa",
    "lightweight steel homes south africa",
    "premium homes south africa",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: homeTitle,
    description: homeDescription,
    url: "https://www.pequenohome.com",
  },
  twitter: {
    title: homeTitle,
    description: homeDescription,
  },
};

export default function Page() {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Pequeño",
    alternateName: ["Pequeno", "Pequeno Home", "Pequeño Home"],
    url: "https://www.pequenohome.com",
    logo: "https://www.pequenohome.com/logo.png",
    email: "info@pequenohome.com",
    telephone: "+27 82 846 4555",
    sameAs: [
      "https://www.instagram.com/pequeno_homes/",
      "https://www.facebook.com/profile.php?id=100091390116080",
    ],
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Pequeño",
    url: "https://www.pequenohome.com",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://www.pequenohome.com/locations",
      "query-input": "required name=search_term_string",
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd),
        }}
      />
      <HomePageClient faqItems={faqItems} />
    </>
  );
}
