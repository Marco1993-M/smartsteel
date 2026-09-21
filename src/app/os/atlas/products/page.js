import AtlasProductHome from '../../../../components/os/AtlasProductHome'
import AtlasWarehouseProductWorkspace from '../../../../components/os/AtlasWarehouseProductWorkspace'
export default async function AtlasProductsPage({searchParams}) {
  const params=await searchParams
  return params?.product==='W08'&&params?.view==='technical'?<AtlasWarehouseProductWorkspace />:<AtlasProductHome />
}
