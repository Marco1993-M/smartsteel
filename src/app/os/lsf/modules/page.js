import CatalogItemsWorkspace from "../../../../components/os/CatalogItemsWorkspace"
import { LSF_MODULE_RULES } from "../../../../lib/osProductData"

const guidance = [
  {
    title: "Quote-ready building blocks",
    body: "Each module should be reusable enough that quoting can start from it instead of rebuilding familiar framing scope.",
  },
  {
    title: "System-linked",
    body: "Tie modules back to warehouse, wall, roof, or floor families so the structure stays readable.",
  },
  {
    title: "Review when needed",
    body: "Standard modules should stay simple until a real project condition pushes them into custom review.",
  },
]

export default function LsfModulesPage() {
  return (
    <CatalogItemsWorkspace
      platformKey="lsf"
      kind="module"
      title="Live LSF module register"
      description="Turn recurring framing groups into real operating records that future pricing, engineering, and quote workflows can reuse."
      guidance={guidance}
      rules={LSF_MODULE_RULES}
    />
  )
}
