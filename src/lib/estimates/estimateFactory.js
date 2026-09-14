import { calculateSolarEstimate } from "./solarEstimate"
import { calculateTrussEstimate, TRUSS_PRODUCT_TYPES } from "./trussEstimate"
import { calculateWarehouseEstimate } from "./warehouseEstimate"
import { calculateAtlasWarehouseEstimate } from "./atlasWarehouseEstimate"
import { isAtlasWarehouseProductType } from "../atlasProductIdentity"
import { calculateCustomProjectEstimate, CUSTOM_ENGINEERED_PROJECT_TYPE } from "./customProjectEstimate"

const SOLAR_PRODUCT_TYPES = ["Solar carport", "Solar ground mount", "Solar structure"]

export function isSolarEstimateProduct(productType) {
  return SOLAR_PRODUCT_TYPES.includes(productType)
}

export function isWarehouseEstimateProduct(productType) {
  return productType === "LSF Warehouse" || isAtlasWarehouseProductType(productType)
}

export function isAtlasWarehouseEstimateProduct(productType) {
  return isAtlasWarehouseProductType(productType)
}

export function isTrussEstimateProduct(productType) {
  return TRUSS_PRODUCT_TYPES.includes(productType)
}

export function calculateEstimateByProductType(productType, input) {
  if (productType === CUSTOM_ENGINEERED_PROJECT_TYPE) {
    return calculateCustomProjectEstimate(input)
  }

  if (isSolarEstimateProduct(productType)) {
    return calculateSolarEstimate(input)
  }

  if (isTrussEstimateProduct(productType)) {
    return calculateTrussEstimate(input)
  }

  if (isAtlasWarehouseEstimateProduct(productType)) {
    return calculateAtlasWarehouseEstimate(input)
  }

  return calculateWarehouseEstimate(input)
}
