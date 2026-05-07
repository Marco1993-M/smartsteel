// app/warehouse/page.js
import WarehouseClient from "./WarehouseClient";

export const metadata = {
  title: "Warehouse Systems South Africa | LSF & CFLC Warehouses | Smart Steel",
  description:
    "Explore Smart Steel warehouse systems in South Africa, including LSF and CFLC warehouses. Compare systems, use the builder, or request a practical quote path.",
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
    title: "Warehouse Systems South Africa | LSF & CFLC Warehouses | Smart Steel",
    description:
      "Explore Smart Steel warehouse systems including LSF and CFLC warehouses, then move into the builder or estimator.",
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
    title: "Warehouse Systems South Africa | Smart Steel",
    description:
      "Explore Smart Steel LSF and CFLC warehouse systems, compare the routes, and start the right warehouse enquiry.",
    images: ["/og-warehouse.jpg"],
  },
  alternates: {
    canonical: "/lightweight-steel-warehouses",
  },
};

export default function WarehousePage() {
  return <WarehouseClient />;
}
