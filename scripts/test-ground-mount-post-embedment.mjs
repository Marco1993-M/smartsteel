import assert from 'node:assert/strict'
import {
  calculateSolarEstimate,
  getGroundMountLayout,
  GROUND_MOUNT_POST_EMBEDMENT_METERS,
  GROUND_MOUNT_POST_PROFILE,
} from '../src/lib/estimates/solarEstimate.js'
import { calculateLippedChannelMassKgPerM } from '../src/lib/atlasLippedChannelProfiles.js'

const postMassPerMetre = calculateLippedChannelMassKgPerM(GROUND_MOUNT_POST_PROFILE)
const price = (moduleCount) => {
  const layout = getGroundMountLayout(moduleCount)
  return calculateSolarEstimate({
    productType: 'Solar ground mount',
    moduleCount, width: layout.width, length: layout.length, wallHeight: 0,
    quantity: 1, scope: 'supply_only', includeStructureLabour: false,
    includeSolarBrackets: false, includeTransport: false,
  })
}

for (const [panels, posts] of [[6, 4], [30, 12], [36, 14], [60, 22], [66, 26]]) {
  const estimate = price(panels)
  const steel = estimate.lineItems.find((item) => item.code === 'ground-mount-post-embedment-steel')
  const expectedKg = Math.round(posts * GROUND_MOUNT_POST_EMBEDMENT_METERS * postMassPerMetre * 10000) / 10000
  assert.equal(estimate.totals.postCount, posts)
  assert.equal(estimate.totals.postEmbedmentMeters, 0.6)
  assert.equal(estimate.totals.postEmbedmentSteelKg, expectedKg)
  assert.equal(steel.quantity, expectedKg)
  assert.equal(steel.unit, 'kg')
  assert.equal(steel.total, Math.round(expectedKg * 28.84 * 100) / 100)
  assert.ok(Math.abs(estimate.pricing.estimatedTotal - estimate.pricing.baseTotal * estimate.pricing.markupMultiplier) < 0.02)
  assert.match(estimate.summary.estimateRequest, /600mm below-ground steel allowance/)
}

const fiveSeparateKits = 5 * price(6).pricing.estimatedTotal
const oneContinuousRun = price(30).pricing.estimatedTotal
assert.ok(fiveSeparateKits > oneContinuousRun)
assert.equal(5 * price(6).totals.postCount, 20)
assert.equal(price(30).totals.postCount, 12)
console.log('Ground-mount post embedment is priced for separate kits, continuous runs, and multi-row layouts.')
