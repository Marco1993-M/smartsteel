import DocumentsWorkspace from "../../../../components/os/DocumentsWorkspace"
import { LSF_DOCUMENT_RULES } from "../../../../lib/osProductData"

export default function LsfDocumentsPage() {
  return <DocumentsWorkspace platformKey="lsf" rules={LSF_DOCUMENT_RULES} />
}
