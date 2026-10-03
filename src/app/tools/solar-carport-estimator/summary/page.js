import { Suspense } from "react"
import SolarCarportSummaryClient from "./SolarCarportSummaryClient"

export const metadata = {
  title: "Solar Carport Configuration Summary | Smart Steel",
  robots: { index: false, follow: false },
}

export default function SolarCarportSummaryPage() {
  return <Suspense fallback={<div className="min-h-screen bg-slate-100" />}><SolarCarportSummaryClient /></Suspense>
}
