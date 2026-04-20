import RegionWarehousePageClient from "../warehouse-regions/RegionWarehousePageClient";
import { buildRegionWarehouseMetadata } from "../warehouse-regions/regionWarehouseData";

export const metadata = buildRegionWarehouseMetadata("east-london");

export default function Page() {
  return <RegionWarehousePageClient citySlug="east-london" />;
}
