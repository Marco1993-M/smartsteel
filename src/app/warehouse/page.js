// app/warehouse/page.js
import WarehouseClient from "./WarehouseClient";

export const metadata = {
  title: "Customizable Sheds & Warehousing Solutions | Smart Steel",
  description:
    "Build your perfect steel shed or warehouse with Smart Steel. Choose structure sizes, colors, and extra features tailored to your needs. Fast quotes and expert support.",
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
    title: "Customizable Sheds & Warehousing Solutions | Smart Steel",
    description:
      "Build your perfect steel shed or warehouse with Smart Steel. Choose structure sizes, colors, and extra features tailored to your needs.",
    url: "https://smartsteel.co.za/warehouse",
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
    canonical: "/warehouse",
  },
};

export default function WarehousePage() {
  return <WarehouseClient />;
}
