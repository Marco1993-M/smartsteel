import SolarRegionPageClient from "../solar-regions/SolarRegionPageClient"
import { buildSolarRegionMetadata } from "../solar-regions/solarRegionData"

export const dynamic = "force-dynamic"
export const metadata = buildSolarRegionMetadata("pretoria")

export default function Page() {
  return <SolarRegionPageClient citySlug="pretoria" />
}
