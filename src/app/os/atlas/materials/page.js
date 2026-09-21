import { redirect } from 'next/navigation'
import AtlasProductMaterials from '../../../../components/os/AtlasProductMaterials'
export default async function MaterialsPage({searchParams}) {
 const {product='W08'}=await searchParams
 if(product==='SOLAR-CARPORT') redirect('/os/atlas/solar-pricing?product=SOLAR-CARPORT#schedule')
 if(!['W06','W08','W10','W12'].includes(product)) redirect('/os/atlas')
 return <AtlasProductMaterials key={product} productCode={product} />
}
