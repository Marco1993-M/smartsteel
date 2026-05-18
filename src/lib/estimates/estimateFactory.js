import { calculateSolarEstimate } from "./solarEstimate"
import { calculateWarehouseEstimate } from "./warehouseEstimate"
import { calculateLcssWarehouseEstimate } from "./warehouseEstimateLcss"

const SOLAR_PRODUCT_TYPES = ["Solar carport", "Solar ground mount", "Solar structure"]
const LCSS_PRODUCT_TYPES = ["LCSS Warehouse", "CFLC Warehouse", "CFLC warehouse"]

export function isSolarEstimateProduct(productType) {
  return SOLAR_PRODUCT_TYPES.includes(productType)
}

export function isWarehouseEstimateProduct(productType) {
  return productType === "LSF Warehouse" || LCSS_PRODUCT_TYPES.includes(productType)
}

export function isLcssEstimateProduct(productType) {
  return LCSS_PRODUCT_TYPES.includes(productType)
}

export function calculateEstimateByProductType(productType, input) {
  if (isSolarEstimateProduct(productType)) {
    return calculateSolarEstimate(input)
  }

  if (isLcssEstimateProduct(productType)) {
    return calculateLcssWarehouseEstimate(input)
  }

  return calculateWarehouseEstimate(input)
}
