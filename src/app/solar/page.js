import SolarClient from "./SolarClient";

export const metadata = {
  title: "Solar Carports & Solar-Ready Steel Structures | Smart Steel",
  description:
    "Explore Smart Steel solar carports, solar-ready parking structures, roof frames, and steel support systems for South African projects.",
  openGraph: {
    title: "Solar Carports & Solar-Ready Steel Structures | Smart Steel",
    description:
      "Compare Smart Steel solar-ready structures for carports, commercial parking, roof framing, and broader solar support applications in South Africa.",
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
    title: "Solar Carports & Solar-Ready Steel Structures | Smart Steel",
    description:
      "Solar-ready steel structures for South African parking, commercial, and energy-linked projects.",
    images: ["/solar-hero.jpg"],
  },
  alternates: {
    canonical: "https://www.smartsteel.co.za/solar",
  },
};

export default function SolarPage() {
  return <SolarClient />;
}
