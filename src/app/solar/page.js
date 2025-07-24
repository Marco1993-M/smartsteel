// app/solar/page.js
import SolarClient from "./SolarClient";

export const metadata = {
  title: "Solar Panel Mounting Structures & Steel Solar Carports | Smart Steel",
  description:
    "Engineered lightweight steel structures for solar: carports, ground mounts, and roof frames. Fast, precise, corrosion‑resistant, and South Africa ready.",
  keywords: [
    "solar panel mounting structures",
    "solar carports",
    "solar ground mount",
    "steel solar frames",
    "solar roof frames",
    "solar ready steel",
    "steel carports South Africa",
    "solar structures South Africa",
  ],
  alternates: {
    canonical: "/solar",
  },
  openGraph: {
    title: "Solar Panel Mounting Structures & Steel Solar Carports | Smart Steel",
    description:
      "Lightweight, corrosion-resistant steel solutions for solar: carports, ground mounts & roof frames.",
    url: "https://smartsteel.co.za/solar",
    siteName: "Smart Steel",
    images: [
      {
        url: "/og-solar.jpg",
        width: 1200,
        height: 630,
        alt: "Solar-ready steel structures by Smart Steel",
      },
    ],
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Solar Panel Mounting Structures & Steel Solar Carports | Smart Steel",
    description:
      "Engineered lightweight steel structures for solar: carports, ground mounts & roof frames.",
    images: ["/og-solar.jpg"],
  },
};

export default function Page() {
  return <SolarClient />;
}
