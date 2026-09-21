import { getAtlasProduct, withAtlasProduct } from "../../../../lib/atlasProductRange"
import DocumentsWorkspace from "../../../../components/os/DocumentsWorkspace"
import AtlasModuleHero from "../../../../components/os/AtlasModuleHero"
import { ATLAS_DOCUMENT_RULES } from "../../../../lib/osProductData"

export default async function AtlasDocumentsPage({ searchParams }) {
  const params = await searchParams
  const product = getAtlasProduct(params?.product || "W08")
  return (
    <div>
      <div className="px-3 pt-4 sm:px-6 sm:pt-6">
        <AtlasModuleHero
          eyebrow="Atlas document control"
          title={`${product?.name || "Atlas"} · Document library`}
          description="Shared Atlas document library. Records are currently linked by product family, not warehouse size. Check the product code and revision before using a document for the selected product."
          status="Revision control"
          actionHref={withAtlasProduct("/os/atlas/products", product?.code)}
          actionLabel="Open product source"
        />
      </div>
      <DocumentsWorkspace platformKey="atlas" rules={ATLAS_DOCUMENT_RULES} />
    </div>
  )
}
