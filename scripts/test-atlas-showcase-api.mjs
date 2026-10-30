// Run actual route handlers with injected DB/auth/mail boundaries. No network or .env.
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import {createShowcaseApplication,showcaseApplicationNotes,ATLAS_SHOWCASE_OFFER,SHOWCASE_REVIEW_LABELS} from '../src/lib/atlasShowcaseOffer.mjs'
import {normalizeAtlasConfiguration} from '../src/lib/atlasConfiguration.js'
import {calculateAtlasWarehouseEstimate} from '../src/lib/estimates/atlasWarehouseEstimate.js'
import {isAtlasWarehouseProductType,normalizeAtlasProductType} from '../src/lib/atlasProductIdentity.js'
const NativeDate=Date,originalFetch=globalThis.fetch,oldKey=process.env.RESEND_API_KEY
const fixed=Date.parse('2026-10-30T10:00:00Z')
globalThis.Date=class extends NativeDate{constructor(...args){super(...(args.length?args:[fixed]))}static now(){return fixed}}
let ready=true,authAllowed=true,forceSubmissionFailure=false,mails=[]
const leads=[],submissions=[]
class Query{
 constructor(table){this.table=table;this.filters=[];this.op='select'}
 select(fields){this.fields=fields;return this}insert(rows){this.op='insert';this.rows=rows;return this}update(patch){this.op='update';this.patch=patch;return this}eq(k,v){this.filters.push([k,v]);return this}limit(n){this.limitValue=n;return this}maybeSingle(){this.single=true;return this}then(resolve,reject){return Promise.resolve(this.execute()).then(resolve,reject)}
 execute(){
  if(this.table==='leads'&&this.fields==='atlas_showcase_offer'&&!ready)return {data:null,error:{code:'42703',message:'missing fixture column'}}
  const rows=this.table==='leads'?leads:submissions
  if(this.table==='warehouse_builder_submissions'&&forceSubmissionFailure)return {data:null,error:{code:'fixture',message:'fixture structured save failure'}}
  if(this.op==='insert'){const saved=this.rows.map((row,i)=>({...structuredClone(row),id:this.table==='leads'?`00000000-0000-4000-8000-${String(rows.length+i+1).padStart(12,'0')}`:'submission-'+rows.length}));rows.push(...saved);return {data:this.single?saved[0]:saved,error:null}}
  let matches=rows.filter(r=>this.filters.every(([key,value])=>key==='atlas_showcase_offer->>revision'?String(r.atlas_showcase_offer?.revision)===value:r[key]===value))
  if(this.op==='update'){for(const row of matches)Object.assign(row,structuredClone(this.patch))}
  if(this.limitValue===0)matches=[]
  return {data:this.single?structuredClone(matches[0]||null):structuredClone(matches),error:null}
 }
}
const mocks={NextResponse:{json:(body,options={})=>Response.json(body,options)},supabaseServer:{from:table=>new Query(table)},createShowcaseApplication,showcaseApplicationNotes,normalizeAtlasConfiguration,calculateAtlasWarehouseEstimate,isAtlasWarehouseProductType,normalizeAtlasProductType,readSolarPricing:()=>null,calculateAtlasSolarCarportEstimate:()=>null,validateSolarEstimateInput:()=>null,ATLAS_SHOWCASE_OFFER,SHOWCASE_REVIEW_LABELS,getOsRequestContext:async()=>authAllowed?{user:{email:'info@smartsteel.co.za'}}:{response:Response.json({error:'Not authorised'},{status:401})}}
globalThis.__showcaseTest=mocks
async function route(path){let source=await fs.readFile(path,'utf8');source=source.replace(/^import[\s\S]*?from\s+["'][^"']+["']\s*;?\s*\n/gm,'');return import('data:text/javascript;base64,'+Buffer.from(`const {${Object.keys(mocks).join(',')}}=globalThis.__showcaseTest;\n`+source).toString('base64'))}
process.env.RESEND_API_KEY='fixture-not-a-real-key'
globalThis.fetch=async(url,opts)=>{assert.equal(url,'https://api.resend.com/emails');mails.push(JSON.parse(opts.body));return Response.json({id:'fixture-email'})}
try{
 const publicRoute=await route('src/app/api/leads/route.js'),reviewRoute=await route('src/app/api/crm/showcase-offer/route.js')
 const configuration=normalizeAtlasConfiguration({width:8,length:20,wallHeight:3,steelFinish:'ZAM',gableMode:'roof_only',sheetingProfile:'IBR',sheetingFinish:'galvanised',location:'Far outside Gauteng'})
 const total=calculateAtlasWarehouseEstimate(configuration).pricing.estimatedTotal
 const payload={name:'Fixture',lastName:'Applicant',email:'fixture@example.invalid',phone:'0000000000',lead_source:'Warehouse Builder',productType:'Atlas Warehouse',projectStage:'Early planning',location:'Far outside Gauteng',configuration,estimatedTotal:total,priceLabel:'fixture standard total',estimateRequest:'Fixture scope',designReference:'fixture',showcaseOffer:{campaignId:ATLAS_SHOWCASE_OFFER.id,termsVersion:ATLAS_SHOWCASE_OFFER.termsVersion,projectUse:'Grain storage',photographyPreference:'discuss',status:'approved',potentialSaving:1}}
 const submit=body=>publicRoute.POST(new Request('http://fixture/api/leads',{method:'POST',body:JSON.stringify(body)}))
 let response=await submit(payload);assert.equal(response.status,200);const received=await response.json();assert.equal(leads.length,1);assert.equal(submissions.length,1)
 const offer=received.lead.atlas_showcase_offer;assert.equal(offer.status,'pending');assert.equal(offer.potentialSaving,Math.round(total*.1*100)/100);assert.equal(received.lead.quote_value,total);assert(received.lead.notes.includes('Atlas Showcase Offer'));assert.equal(submissions[0].configuration.showcaseOffer.status,'pending');assert(mails[0].html.includes('No discount has been applied'))
 assert.equal((await submit({...payload,estimatedTotal:1})).status,409);assert.equal(leads.length,1)
 assert.equal((await submit({...payload,showcaseOffer:{...payload.showcaseOffer,photographyPreference:'forged'}})).status,400);assert.equal(leads.length,1)
 ready=false;assert.equal((await submit(payload)).status,503);assert.equal(leads.length,1)
 const normal={...payload};delete normal.showcaseOffer;assert.equal((await submit(normal)).status,200);assert.equal(leads.length,2);assert(!leads[1].atlas_showcase_offer)
 ready=true;forceSubmissionFailure=true;response=await submit(payload);assert.equal(response.status,200);const degraded=await response.json();assert(degraded.submissionWarning);assert.equal(degraded.lead.atlas_showcase_offer.status,'pending');forceSubmissionFailure=false
 const review=body=>reviewRoute.PATCH(new Request('http://fixture/api/crm/showcase-offer',{method:'PATCH',body:JSON.stringify(body)}))
 const body={leadId:received.lead.id,revision:1,status:'approved',note:'Site reviewed and suitable for quotation'}
 authAllowed=false;assert.equal((await review(body)).status,401);authAllowed=true
 response=await review(body);assert.equal(response.status,200);const reviewed=(await response.json()).lead.atlas_showcase_offer;assert.equal(reviewed.status,'approved');assert.equal(reviewed.revision,2);assert.equal(reviewed.reviewHistory.length,1);assert.equal(reviewed.potentialSaving,offer.potentialSaving);assert.equal(leads[0].quote_value,total)
 assert.equal((await review(body)).status,409);assert.equal((await review({...body,revision:2,note:'x'})).status,400)
 assert.equal(leads[0].status,'new');assert.equal(mails.length,3)
 console.log('PASS: actual lead API stores one normal lead plus verified offer metadata/configuration; no automatic discount/approval/location rejection; tamper/stale-price validation; missing migration fails before insert; ordinary leads unaffected; structured-save failure retains offer; authenticated revision-safe internal review with audit history. All DB/mail boundaries mocked.')
}finally{globalThis.fetch=originalFetch;globalThis.Date=NativeDate;if(oldKey===undefined)delete process.env.RESEND_API_KEY;else process.env.RESEND_API_KEY=oldKey;delete globalThis.__showcaseTest}
