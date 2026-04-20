import SolarRegionPageClient from "../solar-regions/SolarRegionPageClient";
import { buildSolarRegionMetadata } from "../solar-regions/solarRegionData";

export const metadata = buildSolarRegionMetadata("centurion");

export default function Page() {
  return <SolarRegionPageClient citySlug="centurion" />;
}
