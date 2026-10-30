import assert from 'node:assert/strict'
import {ATLAS_SHOWCASE_OFFER,showcaseOfferOpen,showcaseSaving,createShowcaseApplication,validateShowcaseInterest,showcaseApplicationNotes} from '../src/lib/atlasShowcaseOffer.mjs'
const now=new Date('2026-10-30T10:00:00Z')
const interest={campaignId:ATLAS_SHOWCASE_OFFER.id,termsVersion:ATLAS_SHOWCASE_OFFER.termsVersion,projectUse:' Farm equipment storage ',photographyPreference:'discuss',status:'approved',potentialSaving:999999}
const offer=createShowcaseApplication(interest,300000,{location:'Outside Gauteng'},now)
assert.equal(offer.status,'pending');assert.equal(offer.potentialSaving,30000);assert.equal(offer.supplyTotal,300000);assert.equal(offer.revision,1);assert.equal(offer.projectUse,'Farm equipment storage');assert.equal(offer.configuration.location,'Outside Gauteng')
assert.equal(showcaseSaving(106452.17),10645.22);assert.equal(showcaseSaving(-1),null);assert.equal(showcaseSaving(NaN),null)
assert(showcaseOfferOpen('2027-01-31T21:59:59.999Z'));assert(!showcaseOfferOpen('2027-01-31T22:00:00Z'));assert(!showcaseOfferOpen('invalid'))
assert.throws(()=>validateShowcaseInterest({...interest,projectUse:''},now),/building/)
assert.throws(()=>validateShowcaseInterest({...interest,photographyPreference:'automatic-consent'},now),/photography/)
assert.throws(()=>validateShowcaseInterest({...interest,campaignId:'unknown'},now),/Refresh/)
assert.throws(()=>validateShowcaseInterest(interest,new Date('2027-02-01')),/ended/)
assert.equal(createShowcaseApplication({...interest,photographyPreference:'no'},300000,{},now).status,'pending')
assert(showcaseApplicationNotes(offer).join('\n').includes('No discount applied'))
console.log('PASS: SAST expiry, server-owned pending state and saving, input validation, no geographic rejection or automatic photography permission, no automatic discount/reservation.')
