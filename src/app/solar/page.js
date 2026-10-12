import SolarClient from "./SolarClient";

export const metadata = {
  title: "Solar Carports & Ground Mounts South Africa",
  description:
    "Explore Atlas solar carports and solar ground mount structures in South Africa. Compare applications, plan your layout and request a project estimate.",
  keywords: [
    "solar carports South Africa",
    "solar ground mounts South Africa",
    "solar panel carport structures",
    "ground mount solar structures",
    "Atlas solar structures",
  ],
  openGraph: {
    title: "Solar Carports & Ground Mounts South Africa",
    description:
      "Atlas steel structures for solar carports and ground-mounted solar arrays across South Africa.",
    url: "https://www.smartsteel.co.za/solar",
    siteName: "Smart Steel",
    images: [
      {
        url: "/solar-hero.jpg",
        width: 1200,
        height: 630,
        alt: "Smart Steel solar carports and solar-ready steel structures",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Solar Carports & Ground Mounts South Africa",
    description:
      "Atlas steel structures for solar carports and ground-mounted solar arrays across South Africa.",
    images: ["/solar-hero.jpg"],
  },
  alternates: {
    canonical: "https://www.smartsteel.co.za/solar",
  },
};

export default function SolarPage() {
  return <SolarClient />;
}
