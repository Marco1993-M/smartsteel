import { calculateSolarEstimate } from "./solarEstimate"
import { calculateTrussEstimate, TRUSS_PRODUCT_TYPES } from "./trussEstimate"
import { calculateWarehouseEstimate } from "./warehouseEstimate"
import { calculateAtlasWarehouseEstimate } from "./atlasWarehouseEstimate"

const SOLAR_PRODUCT_TYPES = ["Solar carport", "Solar ground mount", "Solar structure"]
const LCSS_PRODUCT_TYPES = ["Atlas Warehouse", "LCSS Warehouse", "CFLC Warehouse", "CFLC warehouse"]

export function isSolarEstimateProduct(productType) {
  return SOLAR_PRODUCT_TYPES.includes(productType)
}

export function isWarehouseEstimateProduct(productType) {
  return productType === "LSF Warehouse" || LCSS_PRODUCT_TYPES.includes(productType)
}

export function isLcssEstimateProduct(productType) {
  return LCSS_PRODUCT_TYPES.includes(productType)
}

export function isTrussEstimateProduct(productType) {
  return TRUSS_PRODUCT_TYPES.includes(productType)
}

export function calculateEstimateByProductType(productType, input) {
  if (isSolarEstimateProduct(productType)) {
    return calculateSolarEstimate(input)
  }

  if (isTrussEstimateProduct(productType)) {
    return calculateTrussEstimate(input)
  }

  if (isLcssEstimateProduct(productType)) {
    return calculateAtlasWarehouseEstimate(input)
  }

  return calculateWarehouseEstimate(input)
}
