import ProductFamiliesWorkspace from "../../../../components/os/ProductFamiliesWorkspace"
import { ATLAS_PRODUCT_RULES } from "../../../../lib/osProductData"

export default function AtlasProductsPage() {
  return <ProductFamiliesWorkspace platformKey="atlas" rules={ATLAS_PRODUCT_RULES} />
}
