import EstimatorClient from "./EstimatorClient";

export const metadata = {
  title: "Quick Steel Warehouse Estimator South Africa | Smart Steel",
  description:
    "Run a quick steel warehouse budget check online in South Africa. Compare custom LSF and Atlas lip channel warehouse pricing with the Smart Steel estimator.",
  alternates: {
    canonical: "/tools/estimator",
  },
  openGraph: {
    title: "Quick Steel Warehouse Estimator South Africa | Smart Steel",
    description:
      "Run a quick LSF or Atlas lip channel steel warehouse budget check online and choose the right Smart Steel warehouse path.",
    url: "https://www.smartsteel.co.za/tools/estimator",
    siteName: "Smart Steel",
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Quick Steel Warehouse Estimator South Africa | Smart Steel",
    description:
      "Run a quick LSF or Atlas lip channel steel warehouse budget check online with the Smart Steel estimator.",
  },
};

export default function Page() {
  return <EstimatorClient />;
}
