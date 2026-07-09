import ProductFamiliesWorkspace from "../../../../components/os/ProductFamiliesWorkspace"
import { LSF_PRODUCT_RULES } from "../../../../lib/osProductData"

export default function LsfProductsPage() {
  return <ProductFamiliesWorkspace platformKey="lsf" rules={LSF_PRODUCT_RULES} />
}
