import fs from 'node:fs'
import path from 'node:path'
import { NextResponse } from 'next/server'
import { getOsRequestContext } from 'lib/osRouteAuth'
import { readSolarPricing } from 'lib/solarCarportPricingServer'
import { buildSolarCarportDocumentHtml, parseSolarDocumentRuns } from 'lib/atlasSolarCarportDocuments'
import { launchEstimatePdfBrowser, renderHtmlPdf } from 'lib/estimates/pdf'

export const runtime='nodejs'
export const dynamic='force-dynamic'
export const maxDuration=60

export async function GET(request) {
  const context=await getOsRequestContext(request)
  if(context.response)return context.response
  const params=new URL(request.url).searchParams,kind=params.get('kind')
  if(!['layout','foundation','ctc'].includes(kind))return NextResponse.json({error:'Unsupported solar document.'},{status:400})
  if(kind==='ctc' && String(context.user.email || '').toLowerCase()!=='info@smartsteel.co.za')return NextResponse.json({error:'Owner access required.'},{status:403})
  let runs
  try{runs=parseSolarDocumentRuns(params.get('runs'))}
  catch(error){return NextResponse.json({error:error.message},{status:400})}
  try{
    const release=kind==='ctc'?await readSolarPricing():null
    if(kind==='ctc' && !release)return NextResponse.json({error:'Publish solar pricing before exporting an internal costing sheet.'},{status:409})
    const logo=`data:image/png;base64,${fs.readFileSync(path.join(process.cwd(),'public/atlas/atlas-logo-horizontal-dark.png')).toString('base64')}`
    const html=buildSolarCarportDocumentHtml({runs,kind,release,logo})
    const browser=await launchEstimatePdfBrowser()
    const pdf=await renderHtmlPdf({browser,html,landscape:true})
    return new NextResponse(pdf,{headers:{'Content-Type':'application/pdf','Content-Disposition':`attachment; filename="atlas-solar-carport-${kind}-${runs.length}-runs.pdf"`,'Cache-Control':'private, no-store'}})
  }catch(error){
    console.error('Could not generate solar carport document:',error)
    return NextResponse.json({error:'Could not generate this solar carport document. Please try again.'},{status:500})
  }
}
