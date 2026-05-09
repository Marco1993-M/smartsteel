import { notFound, permanentRedirect } from "next/navigation";
import SolarRegionPageClient from "../../solar-regions/SolarRegionPageClient";
import {
  buildSolarRegionMetadata,
  getSolarRegionCitySlugs,
  getSolarRegionConfig,
} from "../../solar-regions/solarRegionData";

export const dynamicParams = false;

export function generateStaticParams() {
  return getSolarRegionCitySlugs().map((city) => ({ city }));
}

export async function generateMetadata({ params }) {
  const { city } = await params;
  const config = getSolarRegionConfig(city);
  if (!config) return {};
  return buildSolarRegionMetadata(city);
}

export default async function Page({ params }) {
  const { city } = await params;
  const config = getSolarRegionConfig(city);

  if (!config) {
    notFound();
  }

  permanentRedirect(`/${config.legacySlug}`);

  return <SolarRegionPageClient citySlug={city} />;
}
