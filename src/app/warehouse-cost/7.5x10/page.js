import WarehouseCostPageClient from '../WarehouseCostPageClient';
import { buildWarehouseCostMetadata } from '../warehouseCostData';

export const metadata = buildWarehouseCostMetadata('7.5x10');

export default function Page() {
  return <WarehouseCostPageClient slug="7.5x10" />;
}
