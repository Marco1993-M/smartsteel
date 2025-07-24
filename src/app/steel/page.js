import LightweightSteelFramingClient from "./LightweightSteelFramingClient";

export const metadata = {
  title: "Lightweight Steel Framing Solutions | Smart Steel",
  description:
    "Explore durable, eco-friendly, and cost-effective lightweight steel framing solutions. Perfect for warehouses, sheds, and modern buildings. Build faster and smarter with Smart Steel.",
  keywords: [
    "lightweight steel framing",
    "LSF construction",
    "light gauge steel",
    "steel framing South Africa",
    "prefabricated steel structures",
    "modular steel framing",
    "eco-friendly construction",
  ],
  openGraph: {
    title: "Lightweight Steel Framing Solutions | Smart Steel",
    description:
      "Smart Steel provides innovative LSF construction for warehouses, sheds, and buildings. Faster builds, energy efficiency, and sustainability guaranteed.",
    url: "https://smartsteel.co.za/lightweight-steel-framing",
    siteName: "Smart Steel",
    images: [
      {
        url: "/og-lightweight-steel-framing.jpg",
        width: 1200,
        height: 630,
        alt: "Lightweight Steel Framing - Smart Steel",
      },
    ],
    locale: "en_ZA",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lightweight Steel Framing Solutions | Smart Steel",
    description:
      "Smart Steel provides innovative LSF construction for warehouses, sheds, and buildings. Faster builds, energy efficiency, and sustainability guaranteed.",
    images: ["/og-lightweight-steel-framing.jpg"],
  },
  alternates: {
    canonical: "/lightweight-steel-framing",
  },
};

export default function LightweightSteelFramingPage() {
  return <LightweightSteelFramingClient />;
}
