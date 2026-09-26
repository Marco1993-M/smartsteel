import assert from 'node:assert/strict'
import { buildCommercialEfficiency } from '../src/lib/commercialEfficiency.mjs'

const leads = [
  { status: 'won', lead_source: 'Google Ads', quote_value: 10000 },
  { status: 'won', lead_source: 'Organic', quote_value: 20000 },
  { status: 'WON', lead_source: 'Referral', quote_value: 30000 },
  { status: 'won', lead_source: null, quote_value: 40000 },
  { status: 'new', lead_source: 'Organic', quote_value: 90000 },
  { status: 'lost', lead_source: 'Google Ads', quote_value: 90000 },
]
const blended = buildCommercialEfficiency(leads, 10000)
assert.equal(blended.wonCustomers, 4)
assert.equal(blended.wonValue, 100000)
assert.equal(blended.contributionLtv, 7500)
assert.equal(blended.cac, 2500)
assert.equal(blended.ltvCacRatio, 3)
assert.equal(blended.ready, true)
const organic = buildCommercialEfficiency([leads[1]], 1000)
assert.equal(organic.ready, true)
assert.equal(organic.ltvCacRatio, 6)
for (const spend of [0, null, undefined, NaN, -10]) {
  const missing = buildCommercialEfficiency(leads, spend)
  assert.equal(missing.ready, false)
  assert.equal(missing.cac, null)
  assert.equal(missing.ltvCacRatio, null)
  assert.equal(missing.contributionLtv, 7500)
}
const empty = buildCommercialEfficiency([], 1000)
assert.equal(empty.ready, false)
assert.equal(empty.cac, null)
const noValue = buildCommercialEfficiency([{ status: 'won', quote_value: 'invalid' }], 1000)
assert.equal(noValue.ready, false)
assert.match(noValue.blocker, /positive quote value/)
console.log('Commercial efficiency checks passed.')
