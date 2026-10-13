import { Suspense } from "react"
import SolarCarportSummaryClient from "./SolarCarportSummaryClient"

export const metadata = {
  title: "Atlas Solar Carport Configuration | View-only",
  description: "View a shared, read-only Atlas solar carport configuration and parking layout.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Atlas Solar Carport Configuration | View-only",
    description: "View a shared, read-only Atlas solar carport configuration and parking layout.",
    url: "https://www.smartsteel.co.za/tools/solar-carport-estimator/summary",
    siteName: "Atlas by Smart Steel",
    type: "website",
    images: [{
      url: "https://www.smartsteel.co.za/atlas-solar-configuration-share.png",
      width: 1200,
      height: 630,
      alt: "Atlas solar carport view-only project configuration",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Atlas Solar Carport Configuration | View-only",
    description: "View a shared, read-only Atlas solar carport configuration and parking layout.",
    images: ["https://www.smartsteel.co.za/atlas-solar-configuration-share.png"],
  },
}

export default function SolarCarportSummaryPage() {
  return <Suspense fallback={<div className="min-h-screen bg-slate-100" />}><SolarCarportSummaryClient /></Suspense>
}
