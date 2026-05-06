import { calculateSolarEstimate } from "./solarEstimate"
import { calculateWarehouseEstimate } from "./warehouseEstimate"
import { calculateLcssWarehouseEstimate } from "./warehouseEstimateLcss"

const SOLAR_PRODUCT_TYPES = ["Solar carport", "Solar ground mount", "Solar structure"]

export function isSolarEstimateProduct(productType) {
  return SOLAR_PRODUCT_TYPES.includes(productType)
}

export function isWarehouseEstimateProduct(productType) {
  return productType === "LSF Warehouse" || productType === "LCSS Warehouse"
}

export function calculateEstimateByProductType(productType, input) {
  if (isSolarEstimateProduct(productType)) {
    return calculateSolarEstimate(input)
  }

  if (productType === "LCSS Warehouse") {
    return calculateLcssWarehouseEstimate(input)
  }

  return calculateWarehouseEstimate(input)
}
