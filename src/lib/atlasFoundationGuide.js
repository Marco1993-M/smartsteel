import { ATLAS_FOUNDATION_BASELINE } from "./atlasFoundationBaseline.js"
import { getAtlasWarehousePlan } from "./atlasWarehousePlan.js"
import { ATLAS_WAREHOUSE_SHEETING_OPTIONS } from "./estimates/atlasWarehouseOptions.js"

export { ATLAS_FOUNDATION_BASELINE } from "./atlasFoundationBaseline.js"

const WAREHOUSE_CODES = new Set(["W06", "W08", "W10", "W12", "W15"])

export function normalizeAtlasWarehouseCode(value = "W08") {
  const code = String(value).toUpperCase()
  return WAREHOUSE_CODES.has(code) ? code : "W08"
}

export function getAtlasFoundationGuide(input = {}) {
  const productCode = normalizeAtlasWarehouseCode(input.productCode)
  const spanM = Number(productCode.slice(1))
  const requestedLength = Number(input.lengthM)
  const lengthM = Number.isFinite(requestedLength) && requestedLength >= 4
    ? Math.min(100, Math.round(requestedLength / 4) * 4)
    : 24
  const requestedHeight = Number(input.eaveHeightM)
  const eaveHeightM = Number.isFinite(requestedHeight) && requestedHeight > 0
    ? requestedHeight
    : spanM >= 10 ? 4.5 : 3
  const gableMode = input.gableMode || "structure_only"
  const sheetingOption = ATLAS_WAREHOUSE_SHEETING_OPTIONS.find((option) => option.value === gableMode)
  const layoutPlan = getAtlasWarehousePlan({ width: spanM, length: lengthM, wallHeight: eaveHeightM, gableMode })
  if (!sheetingOption || !layoutPlan) throw new Error("Choose a supported Atlas configuration and sheeting scope for the foundation guide.")
  const { bays, portalFrames, footingCount } = layoutPlan
  const baseline = ATLAS_FOUNDATION_BASELINE
  const pedestalHeightMm = baseline.padTopBelowNglMm + baseline.pedestalProjectionMm
  const footingAreaM2 = (baseline.footingWidthMm / 1000) * (baseline.footingLengthMm / 1000)
  const footingVolumeM3 = footingAreaM2 * (baseline.footingDepthMm / 1000)
  const pedestalVolumeM3 = (baseline.pedestalWidthMm / 1000)
    * (baseline.pedestalLengthMm / 1000)
    * (pedestalHeightMm / 1000)
  const concretePerFootingM3 = footingVolumeM3 + pedestalVolumeM3
  const totalConcreteM3 = concretePerFootingM3 * footingCount
  const nominalAllowableBearingKn = footingAreaM2 * baseline.allowableBearingKpa
  const foundationSelfWeightKn = concretePerFootingM3 * baseline.concreteUnitWeightKnM3
  const footingUndersideBelowNglMm = baseline.padTopBelowNglMm + baseline.footingDepthMm

  return {
    productCode,
    spanM,
    lengthM,
    eaveHeightM,
    bays,
    portalFrames,
    footingCount,
    mainColumnCount: layoutPlan.columnCount,
    gableColumnCount: layoutPlan.gableColumnCount,
    gableMode,
    sheetingLabel: sheetingOption.label,
    layoutPlan,
    ...baseline,
    pedestalHeightMm,
    footingUndersideBelowNglMm,
    footingAreaM2,
    concretePerFootingM3,
    totalConcreteM3,
    nominalAllowableBearingKn,
    foundationSelfWeightKn,
    revision: "P02",
    status: "Preliminary guidance - not for construction",
  }
}
