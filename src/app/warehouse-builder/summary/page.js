import { Suspense } from "react"
import WarehouseBuilderSummaryClient from "./WarehouseBuilderSummaryClient"

export const metadata = {
  title: "Atlas Warehouse Configuration | View-only",
  description: "View a shared, read-only Atlas warehouse configuration and its selected layout.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Atlas Warehouse Configuration | View-only",
    description: "View a shared, read-only Atlas warehouse configuration and its selected layout.",
    url: "https://www.smartsteel.co.za/warehouse-builder/summary",
    siteName: "Atlas by Smart Steel",
    type: "website",
    images: [{
      url: "https://www.smartsteel.co.za/atlas-warehouse-configuration-share.png",
      width: 1200,
      height: 630,
      alt: "Atlas warehouse view-only project configuration",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Atlas Warehouse Configuration | View-only",
    description: "View a shared, read-only Atlas warehouse configuration and its selected layout.",
    images: ["https://www.smartsteel.co.za/atlas-warehouse-configuration-share.png"],
  },
}

export default function WarehouseBuilderSummaryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-100" />}>
      <WarehouseBuilderSummaryClient />
    </Suspense>
  )
}
