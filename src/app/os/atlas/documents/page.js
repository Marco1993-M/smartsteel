import DocumentsWorkspace from "../../../../components/os/DocumentsWorkspace"
import { ATLAS_DOCUMENT_RULES } from "../../../../lib/osProductData"

export default function AtlasDocumentsPage() {
  return <DocumentsWorkspace platformKey="atlas" rules={ATLAS_DOCUMENT_RULES} />
}
