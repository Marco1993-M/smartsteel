import { getAtlasProduct, withAtlasProduct } from "../../../../lib/atlasProductRange"
import DocumentsWorkspace from "../../../../components/os/DocumentsWorkspace"
import AtlasModuleHero from "../../../../components/os/AtlasModuleHero"
import { ATLAS_DOCUMENT_RULES } from "../../../../lib/osProductData"
import AtlasDocumentHub from "../../../../components/os/AtlasDocumentHub"

export default async function AtlasDocumentsPage({ searchParams }) {
  const params = await searchParams
  const product = getAtlasProduct(params?.product || "W08")
  if (["W06", "W08", "W10", "W12", "W15"].includes(product?.code)) {
    return <AtlasDocumentHub key={product.code} productCode={product.code} />
  }
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
