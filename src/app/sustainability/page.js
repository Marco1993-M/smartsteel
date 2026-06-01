import SustainabilityClient from "./SustainabilityClient";

export const metadata = {
  title: "Sustainability | Smart Steel",
  description:
    "Sustainability information about lightweight steel building systems from Smart Steel.",
  alternates: {
    canonical: "/sustainability",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function Page() {
  return <SustainabilityClient />;
}
