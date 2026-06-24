import SteelServiceLocationPage, {
  buildSteelServiceLocationMetadata,
} from "../../components/services/SteelServiceLocationPage"
import { locationServicePages } from "../steel-services/locationServicePages"

const content = locationServicePages.pretoriaConstruction

export const metadata = buildSteelServiceLocationMetadata(content)

export default function SteelConstructionCompaniesPretoriaPage() {
  return <SteelServiceLocationPage content={content} />
}
