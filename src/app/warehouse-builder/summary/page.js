import { Suspense } from "react"
import WarehouseBuilderSummaryClient from "./WarehouseBuilderSummaryClient"

export const metadata = {
  title: "Warehouse Builder Design Summary | Smart Steel",
  robots: { index: false, follow: false },
}

export default function WarehouseBuilderSummaryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-100" />}>
      <WarehouseBuilderSummaryClient />
    </Suspense>
  )
}
