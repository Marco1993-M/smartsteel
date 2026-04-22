import TrussLandingPageClient from './TrussLandingPageClient';
import { buildTrussMetadata } from './trussClusterData';

export const metadata = buildTrussMetadata();

export default function Page() {
  return <TrussLandingPageClient />;
}
