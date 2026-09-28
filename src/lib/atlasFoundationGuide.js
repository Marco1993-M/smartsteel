const WAREHOUSE_CODES = new Set(["W06", "W08", "W10", "W12"])

export const ATLAS_FOUNDATION_BASELINE = Object.freeze({
  footingWidthMm: 1250,
  footingLengthMm: 1250,
  footingDepthMm: 350,
  padTopBelowNglMm: 300,
  pedestalWidthMm: 350,
  pedestalLengthMm: 350,
  pedestalProjectionMm: 150,
  concreteStrengthMpa: 25,
  allowableBearingKpa: 100,
  concreteUnitWeightKnM3: 24,
  footingCoverMm: 75,
  pedestalCoverMm: 40,
})

export function normalizeAtlasWarehouseCode(value = "W08") {
  const code = String(value).toUpperCase()
  return WAREHOUSE_CODES.has(code) ? code : "W08"
}

export function getAtlasFoundationGuide(input = {}) {
  const productCode = normalizeAtlasWarehouseCode(input.productCode)
  const spanM = Number(productCode.slice(1))
  const requestedLength = Number(input.lengthM)
  const lengthM = Number.isFinite(requestedLength) && requestedLength >= 4
    ? Math.min(60, Math.round(requestedLength / 4) * 4)
    : 24
  const requestedHeight = Number(input.eaveHeightM)
  const eaveHeightM = Number.isFinite(requestedHeight) && requestedHeight > 0
    ? requestedHeight
    : spanM >= 10 ? 4.5 : 3
  const bays = lengthM / 4
  const portalFrames = bays + 1
  const footingCount = portalFrames * 2
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
    ...baseline,
    pedestalHeightMm,
    footingUndersideBelowNglMm,
    footingAreaM2,
    concretePerFootingM3,
    totalConcreteM3,
    nominalAllowableBearingKn,
    foundationSelfWeightKn,
    revision: "P01",
    status: "Preliminary guidance - not for construction",
  }
}

