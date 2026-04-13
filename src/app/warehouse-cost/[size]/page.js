import { notFound } from 'next/navigation';
import WarehouseCostPageClient from '../WarehouseCostPageClient';
import { buildWarehouseCostMetadata, getWarehouseCostPageConfig, getWarehouseCostSlugs } from '../warehouseCostData';

export function generateStaticParams() {
  return getWarehouseCostSlugs().map((size) => ({ size }));
}

export function generateMetadata({ params }) {
  const config = getWarehouseCostPageConfig(params.size);

  if (!config) {
    return {};
  }

  return buildWarehouseCostMetadata(params.size);
}

export default function Page({ params }) {
  const config = getWarehouseCostPageConfig(params.size);

  if (!config) {
    notFound();
  }

  return <WarehouseCostPageClient slug={params.size} />;
}
