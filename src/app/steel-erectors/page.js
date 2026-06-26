import SteelServiceLocationPage, {
  buildSteelServiceLocationMetadata,
} from "../../components/services/SteelServiceLocationPage"
import { locationServicePages } from "../steel-services/locationServicePages"

const content = locationServicePages.steelErectors

export const metadata = buildSteelServiceLocationMetadata(content)

export default function SteelErectorsPage() {
  return <SteelServiceLocationPage content={content} />
}
