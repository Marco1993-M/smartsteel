import SolarRegionPageClient from "../solar-regions/SolarRegionPageClient";
import { buildSolarRegionMetadata } from "../solar-regions/solarRegionData";

export const metadata = buildSolarRegionMetadata("polokwane");

export default function Page() {
  return <SolarRegionPageClient citySlug="polokwane" />;
}
