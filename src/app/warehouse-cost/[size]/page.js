import { notFound } from 'next/navigation';
import WarehouseCostPageClient from '../WarehouseCostPageClient';
import { buildWarehouseCostMetadata, getWarehouseCostPageConfig, getWarehouseCostSlugs } from '../warehouseCostData';

export function generateStaticParams() {
  return getWarehouseCostSlugs().map((size) => ({ size }));
}

export async function generateMetadata({ params }) {
  const { size } = await params;
  const config = getWarehouseCostPageConfig(size);

  if (!config) {
    return {};
  }

  return buildWarehouseCostMetadata(size);
}

export default async function Page({ params }) {
  const { size } = await params;
  const config = getWarehouseCostPageConfig(size);

  if (!config) {
    notFound();
  }

  return <WarehouseCostPageClient slug={size} />;
}
