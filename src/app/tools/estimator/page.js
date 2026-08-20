import EstimatorClient from "./EstimatorClient";

export const metadata = {
  title: "Atlas Steel Warehouse Estimator South Africa | Smart Steel",
  description:
    "Calculate an indicative Atlas lip channel steel warehouse price online in South Africa. Choose a standard width, modular length, steel finish and sheeting option.",
  alternates: {
    canonical: "/tools/estimator",
  },
  openGraph: {
    title: "Atlas Steel Warehouse Estimator South Africa | Smart Steel",
    description:
      "Price a standard Atlas lip channel warehouse online using Smart Steel's current shared warehouse pricing logic.",
    url: "https://www.smartsteel.co.za/tools/estimator",
    siteName: "Smart Steel",
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Atlas Steel Warehouse Estimator South Africa | Smart Steel",
    description:
      "Get a quick Atlas lip channel steel warehouse budget guide online with Smart Steel.",
  },
};

export default function Page() {
  return <EstimatorClient />;
}
