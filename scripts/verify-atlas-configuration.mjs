import assert from "node:assert/strict"
import {
  createAtlasConfigurationReference,
  getAtlasConfigurationSummary,
  normalizeAtlasConfiguration,
  validateAtlasConfiguration,
} from "../src/lib/atlasConfiguration.js"
import { calculateAtlasWarehouseEstimate } from "../src/lib/estimates/atlasWarehouseEstimate.js"
import { buildPartnerSafeAtlasRelease } from "../src/lib/partnerAtlasRelease.js"
import { getAtlasWarehouseEstimatePlan, getAtlasWarehousePlan } from "../src/lib/atlasWarehousePlan.js"

const fixtures = [
  { width: 6, length: 8, wallHeight: 3, steelFinish: "ZAM", gableMode: "structure_only" },
  { width: 8, length: 20, wallHeight: 3, steelFinish: "Mild", gableMode: "structure_only" },
  { width: 8, length: 20, wallHeight: 3, steelFinish: "ZAM", gableMode: "structure_only" },
  { width: 8, length: 20, wallHeight: 3, steelFinish: "Galv", gableMode: "structure_only" },
  { width: 8, length: 20, wallHeight: 3, steelFinish: "ZAM", gableMode: "roof_only", sheetingProfile: "IBR", sheetingFinish: "galvanised" },
  { width: 8, length: 20, wallHeight: 3, steelFinish: "ZAM", gableMode: "fully_enclosed", sheetingProfile: "IBR", sheetingFinish: "chromadek", sheetingColor: "charcoal-grey" },
  { width: 8, length: 20, wallHeight: 3, steelFinish: "ZAM", gableMode: "fully_enclosed_with_gables", sheetingProfile: "IBR", sheetingFinish: "galvanised" },
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

const corrugatedEstimate = calculateAtlasWarehouseEstimate({
  width: 8,
  length: 20,
  wallHeight: 3,
  steelFinish: "ZAM",
  gableMode: "fully_enclosed",
  sheetingProfile: "Corrugated",
  sheetingFinish: "galvanised",
})
const corrugatedSheetingLine = corrugatedEstimate.lineItems.find((item) => item.code === "W08-SHT")
assert.equal(corrugatedSheetingLine.unitRate, 160)
assert.equal(corrugatedSheetingLine.priceIncludesMarkup, true)
assert.equal(corrugatedSheetingLine.total, corrugatedEstimate.pricing.claddingCost)
assert.equal(
  corrugatedEstimate.pricing.estimatedTotal,
  Math.round((
    corrugatedEstimate.pricing.subTotalBeforeMarkup
    + corrugatedEstimate.pricing.markupValue
    + corrugatedEstimate.pricing.claddingCost
  ) * 100) / 100
)

const fullyEnclosedEstimate = calculateAtlasWarehouseEstimate({
  width: 8,
  length: 20,
  wallHeight: 3,
  steelFinish: "ZAM",
  gableMode: "fully_enclosed_with_gables",
  sheetingProfile: "IBR",
  sheetingFinish: "galvanised",
})
const crmSellTotal = Math.round(fullyEnclosedEstimate.lineItems.reduce(
  (total, item) => total + item.total * (item.priceIncludesMarkup ? 1 : fullyEnclosedEstimate.pricing.markupMultiplier),
  0
) * 100) / 100
assert.equal(fullyEnclosedEstimate.input.gableMode, "fully_enclosed_with_gables")
assert.equal(fullyEnclosedEstimate.sheeting.gableOpeningWidth, 6)
assert.equal(fullyEnclosedEstimate.sheeting.gableOpeningHeight, 3)
assert.equal(fullyEnclosedEstimate.sheeting.gableOpeningArea, 18)
assert.equal(fullyEnclosedEstimate.sheeting.openingsDeducted, true)
const enclosedPlan = getAtlasWarehousePlan(fullyEnclosedEstimate.input)
assert.equal(enclosedPlan.gableMode, "fully_enclosed_with_gables")
assert.equal(enclosedPlan.frontOpeningWidthM, 6)
assert.equal(enclosedPlan.frontOpeningHeightM, 3)
assert.deepEqual(enclosedPlan.frontGableColumnOffsetsM, [])
assert.equal(enclosedPlan.gableColumnCount, 0)
assert.equal(enclosedPlan.footingCount, enclosedPlan.columnCount)
assert.equal(getAtlasWarehousePlan({ ...fullyEnclosedEstimate.input, gableMode: "fully_enclosed" }).frontOpeningWidthM, null)

const w10EnclosedPlan = getAtlasWarehousePlan({ width: 10, length: 24, wallHeight: 4.5, gableMode: "fully_enclosed_with_gables" })
assert.deepEqual(w10EnclosedPlan.frontGableColumnOffsetsM, [2, 8])
assert.deepEqual(w10EnclosedPlan.rearGableColumnOffsetsM, [3, 7])

const w15EnclosedPlan = getAtlasWarehousePlan({ width: 15, length: 48, wallHeight: 4, gableMode: "fully_enclosed_with_gables" })
assert.deepEqual(w15EnclosedPlan.frontGableColumnOffsetsM, [4.5, 10.5])
assert.deepEqual(w15EnclosedPlan.rearGableColumnOffsetsM, [5, 10])
assert.equal(w15EnclosedPlan.columnCount, 26)
assert.equal(w15EnclosedPlan.gableColumnCount, 4)
assert.equal(w15EnclosedPlan.footingCount, 30)
assert.equal(getAtlasWarehouseEstimatePlan({ product_type: "Atlas Warehouse", input_data: { width: 15, length: 48, wallHeight: 4, gableMode: "fully_enclosed_with_gables" }, line_items: [{ label: "6x12x4 Structure Extension" }] }).separatelyQuotedExtension, true)
assert.equal(fullyEnclosedEstimate.meta.sku.includes("-FC-"), true)
assert.equal(crmSellTotal, fullyEnclosedEstimate.pricing.estimatedTotal)

const legacyConfiguration = normalizeAtlasConfiguration({
  productType: "CFLC Warehouse",
  width: "8",
  length: "20",
  wallHeight: "3",
})
assert.equal(legacyConfiguration.productType, "Atlas Warehouse")
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
