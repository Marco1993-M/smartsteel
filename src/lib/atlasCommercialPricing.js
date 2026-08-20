import { calculateAtlasWarehouseEstimate } from "./estimates/atlasWarehouseEstimate.js"

export function calculateAtlasCommercialPrice({ width, length, wallHeight, finish }) {
  const estimate = calculateAtlasWarehouseEstimate({
    width,
    length,
    wallHeight,
    steelFinish: finish,
    gableMode: "structure_only",
  })
  const priceExclVat = estimate.pricing.estimatedTotal
  return {
    width,
    length,
    wallHeight,
    finish,
    steelMassKg: estimate.materials.totalSteelKg,
    rawMaterialCost: estimate.pricing.steelCost,
    connectionCost: estimate.pricing.connectionCost,
    commercialUplift: estimate.pricing.markupValue,
    priceExclVat,
    partnerReturn: priceExclVat * 0.05,
    pricingRelease: estimate.meta.pricingRelease,
  }
}
