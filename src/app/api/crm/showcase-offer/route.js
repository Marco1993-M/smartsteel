import {NextResponse} from 'next/server'
import {getOsRequestContext} from 'lib/osRouteAuth'
import {supabaseServer} from 'lib/supabase-server'
import {ATLAS_SHOWCASE_OFFER,SHOWCASE_REVIEW_LABELS} from 'lib/atlasShowcaseOffer.mjs'
const json=(body,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store'}})
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export async function PATCH(request){
 const auth=await getOsRequestContext(request);if(auth.response)return auth.response
 let body;try{const raw=await request.text();if(raw.length>10000)return json({error:'Review is too long.'},413);body=JSON.parse(raw)}catch{return json({error:'Invalid review.'},400)}
 if(!uuid.test(body?.leadId||'')||!Object.hasOwn(SHOWCASE_REVIEW_LABELS,body.status)||!Number.isInteger(body.revision)||typeof body.note!=='string'||body.note.trim().length<5||body.note.length>2000)return json({error:'Choose a review status and add a note of 5–2,000 characters.'},400)
 const result=await supabaseServer.from('leads').select('id,atlas_showcase_offer').eq('id',body.leadId).maybeSingle()
 if(result.error)return json({error:'Offer review needs database setup. Apply supabase/atlas_showcase_offer.sql.'},503)
 const old=result.data?.atlas_showcase_offer
 if(!old||old.campaignId!==ATLAS_SHOWCASE_OFFER.id)return json({error:'This lead has no Showcase Offer application.'},404)
 if(old.revision!==body.revision)return json({error:'This review changed. Reload before saving.'},409)
 const update={...old,status:body.status,revision:old.revision+1,reviewedAt:new Date().toISOString(),reviewedBy:auth.user.email,reviewNote:body.note.trim(),reviewHistory:[...(old.reviewHistory||[]),{status:old.status,note:old.reviewNote||'',reviewedAt:old.reviewedAt||old.submittedAt,reviewedBy:old.reviewedBy||null}]}
 const saved=await supabaseServer.from('leads').update({atlas_showcase_offer:update}).eq('id',body.leadId).eq('atlas_showcase_offer->>revision',String(body.revision)).select('id,atlas_showcase_offer').maybeSingle()
 if(saved.error)return json({error:'Could not save the review. Please retry.'},500)
 if(!saved.data)return json({error:'This review changed. Reload before saving.'},409)
 return json({lead:saved.data})
}
