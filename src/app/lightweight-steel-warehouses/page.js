// app/warehouse/page.js
import WarehouseClient from "./WarehouseClient";

export const metadata = {
  title: "Lightweight Steel Warehousing Solutions | Smart Steel",
  description:
    "Build your lightweight steel warehouse with Smart Steel. Fast quotes and expert support.",
  keywords: [
    "steel sheds",
    "warehouse kits",
    "custom sheds",
    "modular steel buildings",
    "warehouse solutions South Africa",
    "steel structure quote",
    "prefab warehouse",
  ],
  openGraph: {
    title: "Lightweight Steel Warehousing Solutions | Smart Steel",
    description:
      "Build your perfect lightweight steel warehouse with Smart Steel. Choose structure sizes, colors, and extra features tailored to your needs.",
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
    title: "Customizable Sheds & Warehousing Solutions | Smart Steel",
    description:
      "Build your perfect steel shed or warehouse with Smart Steel. Choose structure sizes, colors, and extra features tailored to your needs.",
    images: ["/og-warehouse.jpg"],
  },
  alternates: {
    canonical: "/lightweight-steel-warehouses",
  },
};

export default function WarehousePage() {
  return <WarehouseClient />;
}
