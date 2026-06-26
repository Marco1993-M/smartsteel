import SteelServiceLocationPage, {
  buildSteelServiceLocationMetadata,
} from "../../components/services/SteelServiceLocationPage"
import { locationServicePages } from "../steel-services/locationServicePages"

const content = locationServicePages.steelDesignCompany

export const metadata = buildSteelServiceLocationMetadata(content)

export default function SteelDesignCompanyPage() {
  return <SteelServiceLocationPage content={content} />
}
