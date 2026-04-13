import WarehouseCostPageClient from '../WarehouseCostPageClient';
import { buildWarehouseCostMetadata } from '../warehouseCostData';

export const metadata = buildWarehouseCostMetadata('20x10');

export default function Page() {
  return <WarehouseCostPageClient slug="20x10" />;
}
