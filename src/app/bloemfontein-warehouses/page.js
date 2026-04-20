import RegionWarehousePageClient from "../warehouse-regions/RegionWarehousePageClient";
import { buildRegionWarehouseMetadata } from "../warehouse-regions/regionWarehouseData";

export const metadata = buildRegionWarehouseMetadata("bloemfontein");

export default function Page() {
  return <RegionWarehousePageClient citySlug="bloemfontein" />;
}
