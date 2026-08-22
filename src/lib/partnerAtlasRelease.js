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

export const PARTNER_ATLAS_RELEASE_VERSION = 2

export function buildPartnerSafeAtlasRelease(input = {}) {
  const validation = validateAtlasConfiguration(input)
  if (!validation.valid) throw new Error(validation.errors.join(" "))

  const configuration = normalizeAtlasConfiguration(validation.configuration)
  const estimate = calculateAtlasWarehouseEstimate(configuration)
  const partnerTerms = calculateAfgriPartnerPrice(estimate.pricing.estimatedTotal)
  const summary = getAtlasConfigurationSummary(configuration)

  return {
    releaseVersion: PARTNER_ATLAS_RELEASE_VERSION,
    sourcePricingRelease: ATLAS_WAREHOUSE_PRICING_RELEASE,
    productKey: configuration.productKey,
    productCode: estimate.meta.productCode,
    configurationReference: createAtlasConfigurationReference(configuration),
    configuration: {
      version: configuration.version,
      productKey: configuration.productKey,
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
