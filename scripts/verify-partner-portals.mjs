import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { portalForHost, portalForKey, membershipMatchesPortal } from '../src/lib/partnerPortals.mjs'

assert.equal(portalForHost('AGRIMARK.SMARTSTEEL.CO.ZA:443').key, 'agrimark')
assert.equal(portalForHost('afgri.smartsteel.co.za').key, 'afgri')
assert.equal(portalForHost('unrelated.example'), null)
assert.equal(membershipMatchesPortal(portalForKey('agrimark'), {key:'afgri',status:'active'}), false)
assert.equal(membershipMatchesPortal(portalForKey('agrimark'), {key:'agrimark',status:'paused'}), false)
assert.equal(membershipMatchesPortal(portalForKey('agrimark'), {key:'agrimark',status:'pilot'}), true)

// Execute the actual request guard with an in-memory Supabase substitute.
// A user belonging to multiple partners must still resolve exactly the requested tenant.
const source = (await fs.readFile(new URL('../src/lib/partnerRouteAuth.js', import.meta.url), 'utf8')).replace(/^import .*\n/gm, '').replace('export async function', 'async function')
let requestedKey; let dbCalls = 0; let organizationKey = 'agrimark'
const chain = { select(){return this}, eq(field,value){if(field==='partner_organizations.key')requestedKey=value;return this}, async maybeSingle(){return { data:{partner_id:organizationKey,partner_organizations:{key:organizationKey,status:'active'}} }} }
const supabaseServer = {auth:{async getUser(){return {data:{user:{id:'test-user'}}}}},from(){dbCalls++;return chain}}
const NextResponse = {json(body, options){return {body,status:options.status}}}
const getContext = new Function('portalForHost','membershipMatchesPortal','supabaseServer','NextResponse',source+'\nreturn getPartnerRequestContext')(portalForHost,membershipMatchesPortal,supabaseServer,NextResponse)
const request = (host, token=true) => ({url:`https://${host}/api/partner/session`, headers: new Headers({host,...(token?{authorization:'Bearer test'}:{})})})
assert.ok((await getContext(request('agrimark.smartsteel.co.za'))).membership)
assert.equal(requestedKey,'agrimark')
organizationKey='afgri'
assert.equal((await getContext(request('agrimark.smartsteel.co.za'))).response.status,403)
assert.ok((await getContext(request('afgri.smartsteel.co.za'))).membership)
assert.equal(requestedKey,'afgri')
const before = dbCalls
assert.equal((await getContext(request('unknown.example'))).response.status,403)
assert.equal((await getContext(request('agrimark.smartsteel.co.za',false))).response.status,401)
assert.equal(dbCalls,before)
console.log('Partner hostname, multi-membership selection and cross-partner access checks passed.')
