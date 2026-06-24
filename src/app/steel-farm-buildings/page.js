import SteelServiceLocationPage, {
  buildSteelServiceLocationMetadata,
} from "../../components/services/SteelServiceLocationPage"
import { locationServicePages } from "../steel-services/locationServicePages"

const content = locationServicePages.farmBuildings

export const metadata = buildSteelServiceLocationMetadata(content)

export default function SteelFarmBuildingsPage() {
  return <SteelServiceLocationPage content={content} />
}
