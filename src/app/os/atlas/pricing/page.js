import AtlasPricingWorkspace from '../../../../components/os/AtlasPricingWorkspace'
import { redirect } from 'next/navigation'
export default async function AtlasPricingPage({searchParams}) {
 const {product='W08'}=await searchParams
 if(product==='SOLAR-CARPORT') redirect('/os/atlas/solar-pricing?product=SOLAR-CARPORT')
 if(!['W06','W08','W10','W12'].includes(product)) redirect('/os/atlas')
 return <AtlasPricingWorkspace key={product} />
}
