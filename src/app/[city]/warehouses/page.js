import { notFound, permanentRedirect } from "next/navigation";
import RegionWarehousePageClient from "../../warehouse-regions/RegionWarehousePageClient";
import {
  buildRegionWarehouseMetadata,
  getRegionWarehouseCitySlugs,
  getRegionWarehouseConfig,
} from "../../warehouse-regions/regionWarehouseData";

export const dynamicParams = false;

export function generateStaticParams() {
  return getRegionWarehouseCitySlugs().map((city) => ({ city }));
}

export async function generateMetadata({ params }) {
  const { city } = await params;
  const config = getRegionWarehouseConfig(city);
  if (!config) return {};
  return buildRegionWarehouseMetadata(city);
}

export default async function Page({ params }) {
  const { city } = await params;
  const config = getRegionWarehouseConfig(city);

  if (!config) {
    notFound();
  }

  permanentRedirect(`/${config.legacySlug}`);

  return <RegionWarehousePageClient citySlug={city} />;
}
