import SolarRegionPageClient from "../solar-regions/SolarRegionPageClient";
import { buildSolarRegionMetadata } from "../solar-regions/solarRegionData";

export const dynamic = "force-dynamic";

export const metadata = buildSolarRegionMetadata("johannesburg");

export default function Page() {
  return <SolarRegionPageClient citySlug="johannesburg" />;
}
