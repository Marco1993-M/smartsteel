import CflcWarehouseCostPage from "../../components/warehouses/CflcWarehouseCostPage"

export const metadata = {
  title: "CFLC Warehouse Cost South Africa | Smart Steel",
  description:
    "Understand Smart Steel CFLC warehouse cost in South Africa. Explore the key budget drivers, then move into the estimator or builder for a stronger starting point.",
  keywords: [
    "CFLC warehouse cost South Africa",
    "cold formed lip channel warehouse cost",
    "CFLC warehouse pricing",
    "steel warehouse cost South Africa",
  ],
  alternates: {
    canonical: "/cflc-warehouse-cost",
  },
  openGraph: {
    title: "CFLC Warehouse Cost South Africa | Smart Steel",
    description:
      "See how Smart Steel approaches CFLC warehouse cost in South Africa and move into the estimator or builder.",
    url: "https://www.smartsteel.co.za/cflc-warehouse-cost",
    siteName: "Smart Steel",
    locale: "en_ZA",
    type: "website",
  },
}

export default function CflcWarehouseCostRoute() {
  return <CflcWarehouseCostPage />
}
