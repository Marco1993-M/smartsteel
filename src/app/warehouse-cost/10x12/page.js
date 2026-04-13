import WarehouseCostPageClient from '../WarehouseCostPageClient';
import { buildWarehouseCostMetadata } from '../warehouseCostData';

export const metadata = buildWarehouseCostMetadata('10x12');

export default function Page() {
  return <WarehouseCostPageClient slug="10x12" />;
}
