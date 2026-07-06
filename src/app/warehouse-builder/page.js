import { Suspense } from "react"
import WarehouseBuilderClient from "./WarehouseBuilderClient"

export const metadata = {
  title: "Warehouse Builder South Africa | Plan A Steel Warehouse",
  description:
    "Plan a steel warehouse online with the Smart Steel warehouse builder. See a supply-only budget guide and send a structured South African project request.",
  alternates: {
    canonical: "/warehouse-builder",
  },
  openGraph: {
    title: "Warehouse Builder South Africa | Plan A Steel Warehouse",
    description:
      "Plan a Smart Steel warehouse online, see a supply-only budget guide, and send a structured project request.",
    url: "https://www.smartsteel.co.za/warehouse-builder",
    siteName: "Smart Steel",
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Warehouse Builder South Africa | Smart Steel",
    description:
      "Plan a steel warehouse online and send a stronger project request with the Smart Steel builder.",
  },
}

export default function WarehouseBuilderPage() {
  return (
    <Suspense fallback={null}>
      <WarehouseBuilderClient />
    </Suspense>
  )
}
