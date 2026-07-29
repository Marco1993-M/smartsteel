import DocumentsWorkspace from "../../../../components/os/DocumentsWorkspace"
import AtlasModuleHero from "../../../../components/os/AtlasModuleHero"
import { ATLAS_DOCUMENT_RULES } from "../../../../lib/osProductData"

export default function AtlasDocumentsPage() {
  return (
    <div>
      <div className="px-3 pt-4 sm:px-6 sm:pt-6">
        <AtlasModuleHero
          eyebrow="Atlas document control"
          title="Issue the right product information."
          description="Keep product sheets, references and revisions linked to the Atlas system so client-facing information remains controlled as the product develops."
          status="Revision control"
          actionHref="/os/atlas/products"
          actionLabel="Open product source"
        />
      </div>
      <DocumentsWorkspace platformKey="atlas" rules={ATLAS_DOCUMENT_RULES} />
    </div>
  )
}
