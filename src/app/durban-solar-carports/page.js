import SolarRegionPageClient from "../solar-regions/SolarRegionPageClient";
import { buildSolarRegionMetadata } from "../solar-regions/solarRegionData";

export const dynamic = "force-dynamic";

export const metadata = buildSolarRegionMetadata("durban");

export default function Page() {
  return <SolarRegionPageClient citySlug="durban" />;
}
