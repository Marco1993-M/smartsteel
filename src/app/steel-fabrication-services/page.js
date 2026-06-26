import SteelServiceLocationPage, {
  buildSteelServiceLocationMetadata,
} from "../../components/services/SteelServiceLocationPage"
import { locationServicePages } from "../steel-services/locationServicePages"

const content = locationServicePages.fabricationServices

export const metadata = buildSteelServiceLocationMetadata(content)

export default function SteelFabricationServicesPage() {
  return <SteelServiceLocationPage content={content} />
}
