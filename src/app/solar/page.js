import SolarClient from "./SolarClient";

export const metadata = {
  title: "Solar Steel Solutions South Africa | Smart Steel",
  description:
    "Explore Smart Steel solar infrastructure systems for carports, ground mounts, roof support, and custom commercial steel projects in South Africa.",
  openGraph: {
    title: "Solar Steel Solutions South Africa | Smart Steel",
    description:
      "Find the right steel system for solar parking, ground-mounted arrays, roof support, and custom commercial applications.",
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
    title: "Solar Steel Solutions South Africa | Smart Steel",
    description:
      "Solar infrastructure systems for parking, roofs, ground arrays, and commercial sites.",
    images: ["/solar-hero.jpg"],
  },
  alternates: {
    canonical: "https://www.smartsteel.co.za/solar",
  },
};

export default function SolarPage() {
  return <SolarClient />;
}
