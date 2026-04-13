import WarehouseCostPageClient from '../WarehouseCostPageClient';
import { buildWarehouseCostMetadata } from '../warehouseCostData';

export const metadata = buildWarehouseCostMetadata('15x8');

export default function Page() {
  return <WarehouseCostPageClient slug="15x8" />;
}
