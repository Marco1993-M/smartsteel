import NewsPageClient from "./NewsPageClient";

export const metadata = {
  title: "Smart Steel Buyer Guides & Articles",
  description:
    "Read Smart Steel buyer guides, steel building articles, project updates, and company news for warehouses, carports, solar structures, and trusses.",
  keywords: [
    "steel building articles",
    "warehouse buyer guide",
    "self-build warehouse guide",
    "solar carport guide",
    "Smart Steel articles",
  ],
  alternates: {
    canonical: "/news",
  },
  openGraph: {
    title: "Smart Steel Buyer Guides & Articles",
    description:
      "Read Smart Steel buyer guides, project updates, and steel building articles.",
    url: "https://www.smartsteel.co.za/news",
    siteName: "Smart Steel",
    locale: "en_ZA",
    type: "website",
  },
};

export default function Page() {
  return <NewsPageClient />;
}
