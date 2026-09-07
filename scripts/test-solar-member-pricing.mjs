import assert from 'node:assert/strict'
import { calculateSolarCarportGeometry } from '../src/lib/atlasSolarCarportGeometry.js'
import { calculateAtlasSolarCarportEstimate, SOLAR_COST_DEFAULTS } from '../src/lib/estimates/atlasSolarCarportEstimate.js'

const release = { costs: SOLAR_COST_DEFAULTS, revision: 1 }
for (const width of [2.75, 5.5, 11, 16.5, 22]) {
  const single = calculateSolarCarportGeometry({ width, length: 6 })
  const double = calculateSolarCarportGeometry({ width, length: 12 })
  assert.equal(double.totalSteelKg, single.totalSteelKg * 2)
  assert.equal(single.members.find(m => m.code === 'SC-PER').quantity, single.bays * 2)
  assert.equal(single.members.find(m => m.code === 'SC-PUR').quantity, single.bays * 4)
  assert.equal(single.members.find(m => m.code === 'SC-RAF').cutLengthM, 6)
  assert.equal(single.members.find(m => m.code === 'SC-PUR').cutLengthM, single.frameSpacing - 0.05)
  const roofY = z => single.frontHeight - Math.tan(single.pitch) * (z + single.depth / 2)
  for (const z of [single.frontArmZ, single.rearArmZ]) assert.ok(Math.abs(Math.atan2(roofY(z) - 0.07 - 0.08, Math.abs(z - single.baseZ)) - Math.PI / 3) < 1e-10)
}
const input = { width: 5.5, length: 6, quantity: 1, moduleCount: 10, scope: 'supply_only' }
const priced = calculateAtlasSolarCarportEstimate(input, release)
assert.equal(priced.pricing.estimatedTotal, Math.round(priced.pricing.baseTotal * 1.4 * 100) / 100)
const higher = calculateAtlasSolarCarportEstimate(input, { ...release, costs: { ...release.costs, zamRatePerTon: 35000 } })
assert.ok(higher.pricing.estimatedTotal > priced.pricing.estimatedTotal)
assert.equal(calculateAtlasSolarCarportEstimate(input).pricing.estimatedTotal, null)
assert.throws(() => calculateAtlasSolarCarportEstimate({ ...input, width: 5 }, release))
console.log('Solar geometry, mirrored quantities, 60-degree arms, cost updates, and single 40% uplift verified.')
console.log(JSON.stringify({ steelKg: priced.totals.steelKg, cost: priced.pricing.baseTotal, priceExclVat: priced.pricing.estimatedTotal }))
