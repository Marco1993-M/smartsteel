import WarehouseCostPageClient from '../WarehouseCostPageClient';
import { buildWarehouseCostMetadata } from '../warehouseCostData';

export const metadata = buildWarehouseCostMetadata('20x8');

export default function Page() {
  return <WarehouseCostPageClient slug="20x8" />;
}
