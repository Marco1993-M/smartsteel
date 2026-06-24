import SteelServiceLocationPage, {
  buildSteelServiceLocationMetadata,
} from "../../components/services/SteelServiceLocationPage"
import { locationServicePages } from "../steel-services/locationServicePages"

const content = locationServicePages.gautengFabrication

export const metadata = buildSteelServiceLocationMetadata(content)

export default function SteelFabricationCompaniesGautengPage() {
  return <SteelServiceLocationPage content={content} />
}
