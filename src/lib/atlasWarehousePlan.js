import { ATLAS_FOUNDATION_BASELINE } from "./atlasFoundationGuide.js"
import { ATLAS_WAREHOUSE_WIDTH_OPTIONS } from "./estimates/atlasWarehouseOptions.js"
import { isAtlasWarehouseProductType } from "./atlasProductIdentity.js"
import { calculateAtlasW10Geometry } from "./atlasW10Geometry.js"
import { calculateAtlasW12Geometry } from "./atlasW12Geometry.js"
import { calculateAtlasW15Geometry } from "./atlasW15Geometry.js"

const HEIGHTS = new Set([3, 4, 4.5, 5])
const GABLE_MODES = new Set(["structure_only", "roof_only", "fully_enclosed", "fully_enclosed_with_gables"])
const GABLE_GEOMETRY = { 10: calculateAtlasW10Geometry, 12: calculateAtlasW12Geometry, 15: calculateAtlasW15Geometry }

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
  const hasEnclosedGables = input.gableMode === "fully_enclosed_with_gables"
  const gableFraming = hasEnclosedGables && GABLE_GEOMETRY[widthM]
    ? GABLE_GEOMETRY[widthM]({ lengthM, eaveHeightM }).gableFraming
    : null
  const frontGableColumnOffsetsM = gableFraming
    ? [gableFraming.frontSpacingM[0], gableFraming.frontSpacingM[0] + gableFraming.frontSpacingM[1]]
    : []
  const rearGableColumnOffsetsM = gableFraming
    ? [gableFraming.rearSpacingM[0], gableFraming.rearSpacingM[0] + gableFraming.rearSpacingM[1]]
    : []
  const columnCount = (bays + 1) * 2
  const gableColumnCount = frontGableColumnOffsetsM.length + rearGableColumnOffsetsM.length
  return {
    familyCode,
    widthM,
    lengthM,
    eaveHeightM,
    baySpacingM: 4,
    bays,
    portalFrames: bays + 1,
    columnCount,
    gableColumnCount,
    footingCount: columnCount + gableColumnCount,
    frontGableColumnOffsetsM,
    rearGableColumnOffsetsM,
    footingSizeMm: ATLAS_FOUNDATION_BASELINE.footingWidthMm,
    gableMode: input.gableMode || "structure_only",
    // The standard fully enclosed option has one centred opening on one gable only.
    frontOpeningWidthM: input.gableMode === "fully_enclosed_with_gables" ? 6 : null,
    frontOpeningHeightM: input.gableMode === "fully_enclosed_with_gables" ? 3 : null,
  }
}

export function getAtlasWarehouseEstimatePlan(estimate) {
  if (!isAtlasWarehouseProductType(estimate?.product_type)) return null
  const input = estimate?.input_data
  // Atlas estimates historically saved useCustomSize=true even for catalog sizes.
  // Eligibility is determined by the actual configuration below, not that legacy flag.
  if (!input || Number(input.quantity || 1) !== 1) return null
  if (input.productType && !isAtlasWarehouseProductType(input.productType)) return null
  const plan = getAtlasWarehousePlan(input)
  if (!plan) return null
  const separatelyQuotedExtension = Array.isArray(estimate.line_items)
    && estimate.line_items.some((item) => /\bstructure extension\b/i.test(item?.label || ""))
  return { ...plan, separatelyQuotedExtension }
}
