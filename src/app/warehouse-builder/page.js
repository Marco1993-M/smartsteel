import { Suspense } from "react"
import WarehouseBuilderClient from "./WarehouseBuilderClient"

export const metadata = {
  title: "3D Steel Warehouse Builder & Price Estimator | Smart Steel",
  description:
    "Build and price an Atlas steel warehouse in 3D. Choose dimensions, steel finish and sheeting, see a supply-only guide excluding VAT and request a reviewed quote.",
  alternates: {
    canonical: "/warehouse-builder",
  },
  openGraph: {
    title: "3D Steel Warehouse Builder & Price Estimator | Smart Steel",
    description:
      "Configure your Atlas warehouse, explore it in 3D and see a supply-only guide price for your South African project.",
    url: "https://www.smartsteel.co.za/warehouse-builder",
    siteName: "Smart Steel",
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Build and Price Your Atlas Warehouse in 3D",
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
