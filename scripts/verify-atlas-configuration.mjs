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
import { getAtlasFoundationGuide } from "../src/lib/atlasFoundationGuide.js"
import { renderAtlasWarehousePlanSvg } from "../src/lib/atlasWarehousePlanDrawing.js"

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
  assert.equal(estimate.meta.pricingRelease, "atlas-warehouse-2026-10-15")
  assert.ok(estimate.pricing.estimatedTotal > 0)
}

const supplierW08 = calculateAtlasWarehouseEstimate({ width: 8, length: 16, wallHeight: 3, steelFinish: "ZAM", gableMode: "roof_only" })
// The supplier quote is a cost reference, never the released per-kg pricing rate.
assert.equal(supplierW08.pricing.steelCost, 38655.41)
assert.equal(Math.round(supplierW08.lineItems.filter((item) => /^W08-(HCH|APX|BRC|GSP|BAS)/.test(item.code)).reduce((sum, item) => sum + item.total, 0) * 100) / 100, 15677.99)
assert.equal(supplierW08.lineItems.find((item) => item.code === "W08-BAS")?.quantity, 20)
assert.equal(supplierW08.lineItems.find((item) => item.code === "W08-M10-SET")?.quantity > 0, true)
assert.equal(supplierW08.lineItems.find((item) => item.code === "W08-ANC")?.quantity, 40)
for (const width of [6, 10, 12]) {
  const estimate = calculateAtlasWarehouseEstimate({ width, length: 16, wallHeight: 3, steelFinish: "ZAM", gableMode: "roof_only" })
  assert.ok(estimate.lineItems.some((item) => item.code === `W${String(width).padStart(2, "0")}-HCH1`))
  assert.ok(estimate.lineItems.some((item) => item.code === `W${String(width).padStart(2, "0")}-BAS`))
  assert.ok(estimate.lineItems.some((item) => item.code === `W${String(width).padStart(2, "0")}-M10-SET`))
  assert.ok(estimate.lineItems.some((item) => item.code === `W${String(width).padStart(2, "0")}-ANC`))
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
assert.equal(corrugatedEstimate.materials.geometry.purlinRowsPerSlope, 4)
assert.equal(corrugatedEstimate.dimensions.roofPurlins, 8)
assert.equal(corrugatedEstimate.lineItems.find((item) => item.code === "W08-PUR")?.quantity, 40)
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
// Foundation exports must keep the same column positions and counts as estimates.
for (const width of [6, 8, 10, 12, 15]) {
  for (const length of [4, 40, 100]) {
    for (const wallHeight of [3, 5]) {
      for (const gableMode of ["structure_only", "roof_only", "fully_enclosed", "fully_enclosed_with_gables"]) {
        const expectedPlan = getAtlasWarehousePlan({ width, length, wallHeight, gableMode })
        const guide = getAtlasFoundationGuide({ productCode: `W${String(width).padStart(2, "0")}`, lengthM: length, eaveHeightM: wallHeight, gableMode })
        assert.deepEqual(guide.layoutPlan, expectedPlan)
        assert.equal(guide.footingCount, expectedPlan.footingCount)
        assert.equal(guide.totalConcreteM3, guide.concretePerFootingM3 * expectedPlan.footingCount)
        const svg = renderAtlasWarehousePlanSvg(guide.layoutPlan)
        assert.equal((svg.match(/data-column-kind="main"/g) || []).length, expectedPlan.columnCount)
        assert.equal((svg.match(/data-column-kind="gable"/g) || []).length, expectedPlan.gableColumnCount)
      }
    }
  }
}
const w15Foundation = getAtlasFoundationGuide({ productCode: "W15", lengthM: 40, eaveHeightM: 5, gableMode: "fully_enclosed_with_gables" })
assert.equal(w15Foundation.mainColumnCount, 22)
assert.equal(w15Foundation.gableColumnCount, 4)
assert.equal(w15Foundation.footingCount, 26)
assert.equal(getAtlasFoundationGuide({ productCode: "W15", lengthM: 40, eaveHeightM: 5 }).footingCount, 22)
assert.throws(() => getAtlasFoundationGuide({ gableMode: "custom_unknown_scope" }))
assert.equal(renderAtlasWarehousePlanSvg(w15Foundation.layoutPlan, { showFootings: false }).includes("#b87c36"), false)
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
