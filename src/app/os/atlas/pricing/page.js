import AtlasPricingWorkspace from "../../../../components/os/AtlasPricingWorkspace"
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function AtlasPricingPage({ searchParams }) {
  const params = await searchParams
  if (params?.product === 'SOLAR-CARPORT') redirect('/os/atlas/solar-pricing')
  return <><Link className="m-6 inline-block border border-blue-200 px-5 py-3 font-semibold text-blue-700" href="/os/atlas/solar-pricing">Solar carport member costing and website pricing →</Link><AtlasPricingWorkspace /></>
}
