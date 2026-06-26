import SteelServiceLocationPage, {
  buildSteelServiceLocationMetadata,
} from "../../components/services/SteelServiceLocationPage"
import { locationServicePages } from "../steel-services/locationServicePages"

const content = locationServicePages.engineeredBuildings

export const metadata = buildSteelServiceLocationMetadata(content)

export default function EngineeredSteelBuildingsPage() {
  return <SteelServiceLocationPage content={content} />
}
