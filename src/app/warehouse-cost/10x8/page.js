import WarehouseCostPageClient from '../WarehouseCostPageClient';
import { buildWarehouseCostMetadata } from '../warehouseCostData';

export const metadata = buildWarehouseCostMetadata('10x8');

export default function Page() {
  return <WarehouseCostPageClient slug="10x8" />;
}
