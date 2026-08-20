import assert from "node:assert/strict"
import {
  createAtlasConfigurationReference,
  getAtlasConfigurationSummary,
  normalizeAtlasConfiguration,
  validateAtlasConfiguration,
} from "../src/lib/atlasConfiguration.js"
import { calculateAtlasWarehouseEstimate } from "../src/lib/estimates/atlasWarehouseEstimate.js"
import { buildPartnerSafeAtlasRelease } from "../src/lib/partnerAtlasRelease.js"

const fixtures = [
  { width: 6, length: 8, wallHeight: 3, steelFinish: "ZAM", gableMode: "structure_only" },
  { width: 8, length: 20, wallHeight: 3, steelFinish: "Mild", gableMode: "structure_only" },
  { width: 8, length: 20, wallHeight: 3, steelFinish: "ZAM", gableMode: "structure_only" },
  { width: 8, length: 20, wallHeight: 3, steelFinish: "Galv", gableMode: "structure_only" },
  { width: 8, length: 20, wallHeight: 3, steelFinish: "ZAM", gableMode: "roof_only", sheetingProfile: "IBR", sheetingFinish: "galvanised" },
  { width: 8, length: 20, wallHeight: 3, steelFinish: "ZAM", gableMode: "fully_enclosed", sheetingProfile: "IBR", sheetingFinish: "chromadek", sheetingColor: "charcoal-grey" },
  { width: 10, length: 20, wallHeight: 4.5, steelFinish: "ZAM", gableMode: "structure_only" },
  { width: 12, length: 20, wallHeight: 4.5, steelFinish: "ZAM", gableMode: "structure_only" },
]

for (const fixture of fixtures) {
  const validation = validateAtlasConfiguration(fixture)
  assert.equal(validation.valid, true, validation.errors.join(" "))
  const configuration = normalizeAtlasConfiguration(fixture)
  const repeatedReference = createAtlasConfigurationReference({ ...configuration })
  const summary = getAtlasConfigurationSummary(configuration)
  const estimate = calculateAtlasWarehouseEstimate(configuration)

  assert.equal(summary.reference, repeatedReference)
  assert.equal(estimate.dimensions.width, configuration.width)
  assert.equal(estimate.dimensions.length, configuration.length)
  assert.equal(estimate.dimensions.wallHeight, configuration.wallHeight)
  assert.equal(estimate.dimensions.lengthRule, "atlas_4m_bay_rule")
  assert.equal(estimate.meta.pricingRelease, "atlas-warehouse-2026-08-20")
  assert.ok(estimate.pricing.estimatedTotal > 0)
}

const legacyConfiguration = normalizeAtlasConfiguration({
  productType: "CFLC Warehouse",
  width: "8",
  length: "20",
  wallHeight: "3",
})
assert.equal(legacyConfiguration.productType, "LCSS Warehouse")
assert.equal(legacyConfiguration.width, 8)
assert.equal(legacyConfiguration.length, 20)

const partnerRelease = buildPartnerSafeAtlasRelease(fixtures[2])
const publishedPayload = JSON.stringify(partnerRelease)
for (const forbiddenKey of ["lineItems", "markupValue", "markupRate", "steelCost", "connectionCost", "totalSteelKg", "massKgPerM"]) {
  assert.equal(publishedPayload.includes(forbiddenKey), false, `Partner release exposed ${forbiddenKey}.`)
}
assert.equal(partnerRelease.commercial.amountExVat > 0, true)
assert.equal(partnerRelease.commercial.vatExcluded, true)

console.log(`Atlas configuration regression passed for ${fixtures.length} released configurations.`)
