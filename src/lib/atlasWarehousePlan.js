import { ATLAS_FOUNDATION_BASELINE } from "./atlasFoundationGuide"
import { ATLAS_WAREHOUSE_WIDTH_OPTIONS } from "./estimates/atlasWarehouseOptions"
import { isAtlasWarehouseProductType } from "./atlasProductIdentity"

const HEIGHTS = new Set([3, 4, 4.5, 5])
const GABLE_MODES = new Set(["structure_only", "roof_only", "fully_enclosed", "fully_enclosed_with_gables"])

// Keep this strict: an uncertain configuration must not become a drawing in a client quote.
export function getAtlasWarehousePlan(input = {}) {
  const widthM = Number(input.width)
  const lengthM = Number(input.length)
  const eaveHeightM = Number(input.wallHeight)
  if (!ATLAS_WAREHOUSE_WIDTH_OPTIONS.includes(widthM) || !Number.isInteger(lengthM / 4) || lengthM < 4 || lengthM > 100 || !HEIGHTS.has(eaveHeightM)) return null
  if (input.roofPitch != null && Number(input.roofPitch) !== 15) return null
  if (input.roofType && input.roofType !== "dual_pitch") return null
  if (input.roofStyle && input.roofStyle !== "dual_pitch") return null
  if (input.gableMode && !GABLE_MODES.has(input.gableMode)) return null

  const familyCode = `W${String(widthM).padStart(2, "0")}`
  if (input.familyCode && String(input.familyCode).toUpperCase() !== familyCode) return null
  if (input.effectiveLength != null && Number(input.effectiveLength) !== lengthM) return null

  const bays = lengthM / 4
  return {
    familyCode,
    widthM,
    lengthM,
    eaveHeightM,
    baySpacingM: 4,
    bays,
    portalFrames: bays + 1,
    columnCount: (bays + 1) * 2,
    footingSizeMm: ATLAS_FOUNDATION_BASELINE.footingWidthMm,
    // The standard fully enclosed option has one centred opening on one gable only.
    frontOpeningWidthM: input.gableMode === "fully_enclosed_with_gables" ? 6 : null,
    frontOpeningHeightM: input.gableMode === "fully_enclosed_with_gables" ? 3 : null,
  }
}

export function getAtlasWarehouseEstimatePlan(estimate) {
  if (!isAtlasWarehouseProductType(estimate?.product_type)) return null
  const input = estimate?.input_data
  if (!input || input.useCustomSize || Number(input.quantity || 1) !== 1) return null
  if (input.productType && !isAtlasWarehouseProductType(input.productType)) return null
  return getAtlasWarehousePlan(input)
}
