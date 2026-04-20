import RegionWarehousePageClient from "../warehouse-regions/RegionWarehousePageClient";
import { buildRegionWarehouseMetadata } from "../warehouse-regions/regionWarehouseData";

export const metadata = buildRegionWarehouseMetadata("durban");

export default function Page() {
  return <RegionWarehousePageClient citySlug="durban" />;
}
