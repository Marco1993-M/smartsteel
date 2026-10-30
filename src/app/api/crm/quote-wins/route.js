import { NextResponse } from 'next/server'
import { getOsRequestContext } from 'lib/osRouteAuth'
import { supabaseServer } from 'lib/supabase-server'
import { ESTIMATE_TERMS, ESTIMATE_DELIVERY_TERMS, ESTIMATE_EXCLUSIONS } from 'lib/estimates/estimateDocument'
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const json=(body,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store'}})
export const dynamic='force-dynamic'
export async function GET(request){
 const auth=await getOsRequestContext(request);if(auth.response)return auth.response
 const id=new URL(request.url).searchParams.get('leadId')
 if(!uuid.test(id||''))return json({error:'Choose a saved lead.'},400)
 const [lead,estimates,orders]=await Promise.all([
  supabaseServer.from('leads').select('id,name,last_name,status,quote_value').eq('id',id).maybeSingle(),
  supabaseServer.from('estimates').select('*').eq('lead_id',id).order('version_no',{ascending:false}),
  supabaseServer.from('sales_orders').select('id,estimate_id,quote_family_id,status,order_number,updated_at,quote_snapshot').eq('lead_id',id),
 ])
 if(lead.error||estimates.error||orders.error)return json({error:'Quote wins need database setup. Apply crm_quote_wins_manufacturing.sql after the existing sales-order and manufacturing migrations.'},503)
 if(!lead.data)return json({error:'Lead not found.'},404)
 return json({lead:lead.data,estimates:estimates.data||[],orders:orders.data||[]})
}
export async function POST(request){
 const auth=await getOsRequestContext(request);if(auth.response)return auth.response
 let body;try{const text=await request.text();if(text.length>20000)return json({error:'Selection is too large.'},413);body=JSON.parse(text)}catch{return json({error:'Invalid request.'},400)}
 const changes=body?.changes
 if(!uuid.test(body?.leadId||'')||!Array.isArray(changes)||!changes.length||changes.length>30||changes.some(c=>!uuid.test(c?.id||'')||!Number.isFinite(Date.parse(c?.expectedUpdatedAt))||!['add','replace'].includes(c.action)||(c.action==='replace'&&(!uuid.test(c.orderId||'')||!uuid.test(c.previousEstimateId||'')||!Number.isFinite(Date.parse(c.expectedOrderUpdatedAt)))))||String(body.note||'').length>2000)return json({error:'Choose saved quote versions and reload if their details have changed.'},400)
 const {data,error}=await supabaseServer.rpc('update_crm_won_quotes',{p_lead_id:body.leadId,p_changes:changes,p_actor:auth.user.email,p_note:String(body.note||'').trim(),p_terms:{terms:ESTIMATE_TERMS,delivery:ESTIMATE_DELIVERY_TERMS,exclusions:ESTIMATE_EXCLUSIONS}})
 if(error)return json({error:error.code==='P0001'?error.message:['PGRST202','42883','42703'].includes(error.code)?'Apply supabase/crm_won_quote_versions.sql before updating won versions.':'Could not update won quotes. Reload and try again.'},error.code==='P0001'?409:503)
 // Manual CRM recording is an internal handoff; no customer email is sent here.
 return json(data)
}
