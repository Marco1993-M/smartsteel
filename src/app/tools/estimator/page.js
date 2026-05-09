import EstimatorClient from "./EstimatorClient";

export const metadata = {
  title: "Warehouse Estimator South Africa | Smart Steel",
  description:
    "Choose your Smart Steel warehouse system and calculate an indicative LSF or CFLC warehouse cost online. Fast pricing guidance for South African projects.",
  alternates: {
    canonical: "/tools/estimator",
  },
  openGraph: {
    title: "Warehouse Estimator South Africa | Smart Steel",
    description:
      "Calculate an indicative LSF or CFLC warehouse cost online and choose the right Smart Steel warehouse path.",
    url: "https://www.smartsteel.co.za/tools/estimator",
    siteName: "Smart Steel",
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Warehouse Estimator South Africa | Smart Steel",
    description:
      "Calculate an indicative LSF or CFLC warehouse cost online with the Smart Steel estimator.",
  },
};

export default function Page() {
  return <EstimatorClient />;
}
