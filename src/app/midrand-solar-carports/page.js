import SolarRegionPageClient from "../solar-regions/SolarRegionPageClient";
import { buildSolarRegionMetadata } from "../solar-regions/solarRegionData";

export const dynamic = "force-dynamic";

export const metadata = buildSolarRegionMetadata("midrand");

export default function Page() {
  return <SolarRegionPageClient citySlug="midrand" />;
}
