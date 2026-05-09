// app/warehouse/page.js
import WarehouseClient from "./WarehouseClient";

export const metadata = {
  title: "Steel Warehouses South Africa | LSF & CFLC Warehouse Systems",
  description:
    "Explore steel warehouses in South Africa from Smart Steel. Compare LSF and CFLC warehouse systems, use the builder, check indicative pricing, or request a quote.",
  keywords: [
    "warehouse systems South Africa",
    "LSF warehouses",
    "CFLC warehouses",
    "steel warehouse builder",
    "warehouse estimator",
    "modular steel warehouses",
    "warehouse quote South Africa",
  ],
  openGraph: {
    title: "Steel Warehouses South Africa | LSF & CFLC Warehouse Systems",
    description:
      "Compare Smart Steel LSF and CFLC steel warehouse systems, then move into the builder, estimator, or quote path.",
    url: "https://smartsteel.co.za/lightweight-steel-warehouses",
    siteName: "Smart Steel",
    images: [
      {
        url: "/og-warehouse.jpg",
        width: 1200,
        height: 630,
        alt: "Customizable Steel Warehouse - Smart Steel",
      },
    ],
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Steel Warehouses South Africa | Smart Steel",
    description:
      "Compare Smart Steel LSF and CFLC steel warehouse systems and start the right warehouse enquiry.",
    images: ["/og-warehouse.jpg"],
  },
  alternates: {
    canonical: "/lightweight-steel-warehouses",
  },
};

export default function WarehousePage() {
  return <WarehouseClient />;
}
