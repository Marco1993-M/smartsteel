import WarehouseCostPageClient from '../WarehouseCostPageClient';
import { buildWarehouseCostMetadata } from '../warehouseCostData';

export const metadata = buildWarehouseCostMetadata('15x10');

export default function Page() {
  return <WarehouseCostPageClient slug="15x10" />;
}
