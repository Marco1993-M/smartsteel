import EstimatorClient from "./EstimatorClient";

export const metadata = {
  title: "Steel Warehouse Estimator South Africa | Smart Steel",
  description:
    "Calculate an indicative steel warehouse cost online in South Africa. Compare LSF and CFLC warehouse pricing with the Smart Steel estimator.",
  alternates: {
    canonical: "/tools/estimator",
  },
  openGraph: {
    title: "Steel Warehouse Estimator South Africa | Smart Steel",
    description:
      "Calculate an indicative LSF or CFLC steel warehouse cost online and choose the right Smart Steel warehouse path.",
    url: "https://www.smartsteel.co.za/tools/estimator",
    siteName: "Smart Steel",
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Steel Warehouse Estimator South Africa | Smart Steel",
    description:
      "Calculate an indicative LSF or CFLC steel warehouse cost online with the Smart Steel estimator.",
  },
};

export default function Page() {
  return <EstimatorClient />;
}
