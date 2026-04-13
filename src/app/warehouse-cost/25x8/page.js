import WarehouseCostPageClient from '../WarehouseCostPageClient';
import { buildWarehouseCostMetadata } from '../warehouseCostData';

export const metadata = buildWarehouseCostMetadata('25x8');

export default function Page() {
  return <WarehouseCostPageClient slug="25x8" />;
}
