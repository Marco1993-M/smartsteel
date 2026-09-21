import { redirect } from 'next/navigation'
import AtlasWarehouseBomWorkspace from '../../../../components/os/AtlasWarehouseBomWorkspace'
export default async function Page({searchParams}) {
 const {product='W08'}=await searchParams
 if(product!=='W08') redirect(`/os/atlas/materials?product=${encodeURIComponent(product)}`)
 return <AtlasWarehouseBomWorkspace />
}
