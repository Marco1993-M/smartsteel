import { calculateLippedChannelMassKgPerM } from "./atlasLippedChannelProfiles"

export const ATLAS_W08_LENGTHS_M = [4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48]
export const ATLAS_W08_EAVE_HEIGHTS_M = [3, 4, 5]
export const ATLAS_W08_EXACT_MEMBER_CODES = new Set(["W08-COL", "W08-RAF", "W08-PUR"])

const PROFILE = {
  column: { webMm: 200, flangeMm: 75, lipMm: 20, thicknessMm: 2 },
  rafter: { webMm: 200, flangeMm: 75, lipMm: 20, thicknessMm: 2.5 },
  purlin: { webMm: 175, flangeMm: 65, lipMm: 20, thicknessMm: 2 },
}

function round(value, digits = 4) {
  return Number(Number(value).toFixed(digits))
}

export function calculateAtlasW08Geometry({ lengthM = 20, eaveHeightM = 3 } = {}) {
  const length = Number(lengthM)
  const eaveHeight = Number(eaveHeightM)
  if (!ATLAS_W08_LENGTHS_M.includes(length)) throw new Error("W08 length must use confirmed 4m bays from 4m to 48m.")
  if (!ATLAS_W08_EAVE_HEIGHTS_M.includes(eaveHeight)) throw new Error("W08 eave height must be 3m, 4m, or 5m.")

  const spanM = 8
  const baySpacingM = 4
  const roofPitchDegrees = 15
  const halfSpanM = spanM / 2
  const roofPitchRadians = (roofPitchDegrees * Math.PI) / 180
  const rafterCutLengthM = halfSpanM / Math.cos(roofPitchRadians)
  const roofRiseM = halfSpanM * Math.tan(roofPitchRadians)
  const bays = length / baySpacingM
  const portalFrames = bays + 1
  const purlinRowsPerSlope = Math.ceil(rafterCutLengthM / 1.5)
  const totalPurlinRows = purlinRowsPerSlope * 2
  const bracedBayPositions = Array.from({ length: bays }, (_, index) => index + 1).filter((bay) => (bay - 1) % 4 === 0)

  const members = {
    columns: {
      code: "W08-COL",
      label: "Column channels",
      quantity: portalFrames * 2 * 2,
      cutLengthM: eaveHeight,
      massKgPerM: calculateLippedChannelMassKgPerM(PROFILE.column),
      rule: `${portalFrames} frames × 2 columns × 2 back-to-back channels`,
    },
    rafters: {
      code: "W08-RAF",
      label: "Rafter channels",
      quantity: portalFrames * 2,
      cutLengthM: rafterCutLengthM,
      massKgPerM: calculateLippedChannelMassKgPerM(PROFILE.rafter),
      rule: `${portalFrames} frames × 2 single rafters`,
    },
    purlins: {
      code: "W08-PUR",
      label: "Roof purlins",
      quantity: bays * totalPurlinRows,
      cutLengthM: baySpacingM,
      massKgPerM: calculateLippedChannelMassKgPerM(PROFILE.purlin),
      rule: `${totalPurlinRows} rows × ${bays} bay lengths`,
    },
  }

  Object.values(members).forEach((member) => {
    member.cutLengthM = round(member.cutLengthM)
    member.totalLengthM = round(member.quantity * member.cutLengthM, 3)
    member.totalMassKg = round(member.totalLengthM * member.massKgPerM, 2)
  })

  const confirmedStructuralMassKg = round(Object.values(members).reduce((total, member) => total + member.totalMassKg, 0), 2)
  return {
    productCode: "W08",
    spanM,
    lengthM: length,
    eaveHeightM: eaveHeight,
    baySpacingM,
    bays,
    portalFrames,
    roofPitchDegrees,
    roofRiseM: round(roofRiseM),
    rafterCutLengthM: round(rafterCutLengthM),
    purlinRowsPerSlope,
    totalPurlinRows,
    bracedBayPositions,
    members,
    confirmedStructuralMassKg,
    assumptions: {
      structuralWastePercent: 0,
      fabricationAllowance: 0,
      packagingAllowance: 0,
      punchingIncludedInSteelRate: true,
      deliveryIncluded: false,
      installationIncluded: false,
    },
    holds: [
      "Final X-bracing member count and cut-length rule",
      "Final bolted connection quantities and specifications",
      "Wall and gable support members when wall sheeting is selected",
    ],
  }
}

export function applyAtlasW08GeometryToPricing(records, geometry) {
  const byCode = new Map(Object.values(geometry.members).map((member) => [member.code, member]))
  return records.map((record) => {
    const member = byCode.get(record.componentCode)
    if (!member) return record
    return {
      ...record,
      baselineQuantity: member.quantity,
      baselineLengthM: member.cutLengthM,
      massKgPerM: member.massKgPerM,
      quantityRule: member.rule,
      wastePercent: 0,
      fabricationAllowance: 0,
      coatingAllowance: 0,
      geometryControlled: true,
    }
  })
}
