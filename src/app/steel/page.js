// app/lightweight-steel-framing/page.js
import LightweightSteelFramingClient from "./LightweightSteelFramingClient";

export const metadata = {
  title: "Lightweight Steel Framing (LSF) Solutions | Smart Steel",
  description:
    "Durable, eco-friendly, and cost-effective lightweight steel framing (LSF) for warehouses, sheds, residential and commercial buildings. Build faster and smarter with Smart Steel.",
  keywords: [
    "lightweight steel framing",
    "LSF construction",
    "light gauge steel framing",
    "LGSF South Africa",
    "steel framing South Africa",
    "prefabricated steel structures",
    "modular steel framing",
    "eco-friendly construction",
  ],
  alternates: {
    canonical: "/lightweight-steel-framing",
  },
  openGraph: {
    title: "Lightweight Steel Framing (LSF) Solutions | Smart Steel",
    description:
      "Smart Steel provides innovative LSF construction for warehouses, sheds, and buildings. Faster builds, energy efficiency, and sustainability.",
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
    title: "Lightweight Steel Framing (LSF) Solutions | Smart Steel",
    description:
      "Durable, eco-friendly, and cost-effective lightweight steel framing for warehouses, sheds, and buildings.",
    images: ["/og-lightweight-steel-framing.jpg"],
  },
  authors: [{ name: "Smart Steel" }],
  // You can add this if you want search engines to show the publish date:
  // other: {
  //   "article:published_time": "2025-07-24",
  //   "article:modified_time": "2025-07-24",
  // },
};

export default function Page() {
  return <LightweightSteelFramingClient />;
}
