import SteelServiceLocationPage, {
  buildSteelServiceLocationMetadata,
} from "../../components/services/SteelServiceLocationPage"
import { locationServicePages } from "../steel-services/locationServicePages"

const content = locationServicePages.structuralFabricators

export const metadata = buildSteelServiceLocationMetadata(content)

export default function StructuralSteelFabricatorsPage() {
  return <SteelServiceLocationPage content={content} />
}
