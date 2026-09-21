import { redirect } from 'next/navigation'
import AtlasWarehouseComponentsWorkspace from '../../../../components/os/AtlasWarehouseComponentsWorkspace'
export default async function Page({searchParams}) {
 const {product='W08'}=await searchParams
 if(product!=='W08') redirect(`/os/atlas/materials?product=${encodeURIComponent(product)}`)
 return <AtlasWarehouseComponentsWorkspace />
}
