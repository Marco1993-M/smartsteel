import LightweightSteelFramingClient from "../steel/LightweightSteelFramingClient";

export const metadata = {
  title: "Lightweight Steel Framing South Africa | LSF Suppliers | Smart Steel",
  description:
    "Lightweight steel framing suppliers in South Africa for warehouses, roof trusses, residential and commercial buildings. Compare LSF uses, price drivers, and project fit.",
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
    title: "Lightweight Steel Framing South Africa | Smart Steel",
    description:
      "Smart Steel supplies lightweight steel framing for warehouses, roof trusses, sheds, and commercial building projects across South Africa.",
    url: "https://www.smartsteel.co.za/lightweight-steel-framing",
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
    title: "Lightweight Steel Framing South Africa | Smart Steel",
    description:
      "Compare LSF applications, price drivers, and project fit for lightweight steel framing in South Africa.",
    images: ["/og-lightweight-steel-framing.jpg"],
  },
  authors: [{ name: "Smart Steel" }],
};

export default function Page() {
  return <LightweightSteelFramingClient />;
}
