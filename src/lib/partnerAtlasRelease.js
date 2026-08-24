import {
  createAtlasConfigurationReference,
  getAtlasConfigurationSummary,
  normalizeAtlasConfiguration,
  validateAtlasConfiguration,
} from "./atlasConfiguration.js"
import {
  ATLAS_WAREHOUSE_PRICING_RELEASE,
  calculateAtlasWarehouseEstimate,
} from "./estimates/atlasWarehouseEstimate.js"
import { calculateAfgriPartnerPrice } from "./partnerCommercialTerms.js"

export const PARTNER_ATLAS_RELEASE_VERSION = 3

export function buildPartnerSafeAtlasRelease(input = {}) {
  const validation = validateAtlasConfiguration(input)
  if (!validation.valid) throw new Error(validation.errors.join(" "))

  const configuration = normalizeAtlasConfiguration(validation.configuration)
  const estimate = calculateAtlasWarehouseEstimate(configuration)
  const partnerTerms = calculateAfgriPartnerPrice(estimate.pricing.estimatedTotal)
  const summary = getAtlasConfigurationSummary(configuration)
  const sheetingDescription = configuration.gableMode === "structure_only"
    ? "structure only"
    : `${configuration.gableMode === "roof_only" ? "roof sheeted" : "roof and walls sheeted"} in ${configuration.sheetingFinish === "chromadek" ? "colour-coated" : "galvanised"} ${configuration.sheetingProfile}`
  const lineItemDescription = `Atlas ${estimate.meta.productCode} warehouse, ${configuration.width}m x ${configuration.length}m x ${configuration.wallHeight}m, ${configuration.steelFinish} steel, ${sheetingDescription}, supply only`

  return {
    releaseVersion: PARTNER_ATLAS_RELEASE_VERSION,
    sourcePricingRelease: ATLAS_WAREHOUSE_PRICING_RELEASE,
    productKey: configuration.productKey,
    productCode: estimate.meta.sku,
    familyCode: estimate.meta.productCode,
    sku: estimate.meta.sku,
    productName: `Atlas ${estimate.meta.productCode} Warehouse`,
    lineItem: {
      sku: estimate.meta.sku,
      quantity: 1,
      unit: "each",
      description: lineItemDescription,
    },
    configurationReference: createAtlasConfigurationReference(configuration),
    configuration: {
      version: configuration.version,
      productKey: configuration.productKey,
      sku: estimate.meta.sku,
      familyCode: estimate.meta.productCode,
      width: configuration.width,
      length: configuration.length,
      wallHeight: configuration.wallHeight,
      roofType: configuration.roofType,
      roofPitch: configuration.roofPitch,
      steelFinish: configuration.steelFinish,
      gableMode: configuration.gableMode,
      sheetingProfile: configuration.gableMode === "structure_only" ? null : configuration.sheetingProfile,
      sheetingFinish: configuration.gableMode === "structure_only" ? null : configuration.sheetingFinish,
      sheetingColor: configuration.gableMode === "structure_only" ? null : configuration.sheetingColor,
      scope: "supply_only",
    },
    summary,
    commercial: {
      currency: "ZAR",
      amountExVat: partnerTerms.partnerPriceExVat,
      recommendedCustomerPriceExVat: partnerTerms.recommendedCustomerPriceExVat,
      partnerAdjustmentRate: partnerTerms.partnerAdjustmentRate,
      partnerAdjustmentAmount: partnerTerms.partnerAdjustmentAmount,
      priceType: "indicative_afgri_partner_guide",
      vatExcluded: true,
    },
    inclusions: ["Atlas structural system", "Released connection allowances", "Supply-only configuration"],
    exclusions: ["VAT", "Delivery", "Installation", "Foundations and concrete works", "Project-specific engineering outside the released configuration"],
  }
}
