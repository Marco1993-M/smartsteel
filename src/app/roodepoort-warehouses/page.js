import RegionWarehousePageClient from "../warehouse-regions/RegionWarehousePageClient";
import { buildRegionWarehouseMetadata } from "../warehouse-regions/regionWarehouseData";

export const metadata = buildRegionWarehouseMetadata("roodepoort");

export default function Page() {
  return <RegionWarehousePageClient citySlug="roodepoort" />;
}
