import { calculateLippedChannelMassKgPerM } from "./atlasLippedChannelProfiles.js"
import { getAtlasStandardQuotedBracketCosts } from "./atlasW08SupplierCosts.js"

export const ATLAS_W08_LENGTHS_M = Array.from({ length: 25 }, (_, index) => (index + 1) * 4)
export const ATLAS_W08_EAVE_HEIGHTS_M = [3, 4, 4.5, 5]
export const ATLAS_W08_EXACT_MEMBER_CODES = new Set(["W08-COL", "W08-RAF", "W08-PUR"])

export const ATLAS_W08_PROFILES = {
  column: { webMm: 200, flangeMm: 50, lipMm: 20, thicknessMm: 2 },
  rafter: { webMm: 200, flangeMm: 50, lipMm: 20, thicknessMm: 2 },
  purlin: { webMm: 150, flangeMm: 75, lipMm: 20, thicknessMm: 2 },
  bracing: { webMm: 75, flangeMm: 50, lipMm: 20, thicknessMm: 2 },
  sideGirt: { webMm: 150, flangeMm: 50, lipMm: 20, thicknessMm: 2 },
}

const PROFILE = ATLAS_W08_PROFILES

function round(value, digits = 4) {
  return Number(Number(value).toFixed(digits))
}

export function calculateAtlasW08Geometry({ lengthM = 20, eaveHeightM = 3 } = {}) {
  const length = Number(lengthM)
  const eaveHeight = Number(eaveHeightM)
  if (!ATLAS_W08_LENGTHS_M.includes(length)) throw new Error("W08 length must use confirmed 4m bays from 4m to 100m.")
  if (!ATLAS_W08_EAVE_HEIGHTS_M.includes(eaveHeight)) throw new Error("W08 eave height must use a controlled height from 3m to 5m.")

  const spanM = 8
  const baySpacingM = 4
  const roofPitchDegrees = 15
  const halfSpanM = spanM / 2
  const roofPitchRadians = (roofPitchDegrees * Math.PI) / 180
  const rafterCutLengthM = halfSpanM / Math.cos(roofPitchRadians)
  const roofRiseM = halfSpanM * Math.tan(roofPitchRadians)
  const bays = length / baySpacingM
  const portalFrames = bays + 1
  const purlinRowsPerSlope = 4
  const totalPurlinRows = purlinRowsPerSlope * 2
  const bracedBayPositions = Array.from({ length: bays }, (_, index) => index + 1).filter((bay) => (bay - 1) % 4 === 0)
  const supplierColumnCutLengthM = eaveHeight - 0.225
  const supplierRafterCutLengthM = 4.186
  const supplierPurlinAverageCutLengthM = bays === 1 ? 4.095
    : (4.1 + 4.09 + Math.max(0, bays - 2) * 3.99) / bays
  const supplierWallBraceCutLengthM = 4.428 * Math.hypot(baySpacingM, eaveHeight) / Math.hypot(baySpacingM, 3)

  const members = {
    columns: {
      code: "W08-COL",
      label: "Column channels",
      quantity: portalFrames * 2 * 2,
      cutLengthM: supplierColumnCutLengthM,
      massKgPerM: calculateLippedChannelMassKgPerM(PROFILE.column),
      rule: `${portalFrames} frames × 2 columns × 2 back-to-back channels`,
    },
    rafters: {
      code: "W08-RAF",
      label: "Rafter channels",
      quantity: portalFrames * 2,
      cutLengthM: supplierRafterCutLengthM,
      massKgPerM: calculateLippedChannelMassKgPerM(PROFILE.rafter),
      rule: `${portalFrames} frames × 2 single rafters`,
    },
    purlins: {
      code: "W08-PUR",
      label: "Roof purlins",
      quantity: bays * totalPurlinRows,
      cutLengthM: supplierPurlinAverageCutLengthM,
      massKgPerM: calculateLippedChannelMassKgPerM(PROFILE.purlin),
      rule: `${totalPurlinRows} rows × ${bays} bay lengths`,
    },
    wallBracing: { code: "W08-XBW", label: "Wall X-bracing", quantity: bracedBayPositions.length * 4, cutLengthM: supplierWallBraceCutLengthM, massKgPerM: calculateLippedChannelMassKgPerM(PROFILE.bracing), rule: `${bracedBayPositions.length} braced bays × 2 walls × 2 diagonals` },
    roofBracing: { code: "W08-XBR", label: "Roof X-bracing", quantity: bracedBayPositions.length * 4, cutLengthM: 5.208, massKgPerM: calculateLippedChannelMassKgPerM(PROFILE.bracing), rule: `${bracedBayPositions.length} braced bays × 2 roof slopes × 2 diagonals` },
    sideGirts: { code: "W08-GRT", label: "Side girts", quantity: bays * 2 * 3, cutLengthM: baySpacingM, massKgPerM: calculateLippedChannelMassKgPerM(PROFILE.sideGirt), rule: `${bays} bays × 2 walls × 3 rows` },
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
      "Supplier-quoted W08 member cuts verified for 8 x 16 x 3 m only; taller columns and other bay counts are provisional",
      "Final bolt, washer, nut and anchor schedule",
      "Gable-girt member schedule",
    ],
  }
}

export function applyAtlasW08GeometryToPricing(records, geometry) {
  const byCode = new Map(Object.values(geometry.members).map((member) => [member.code, member]))
  const brackets = new Map(getAtlasStandardQuotedBracketCosts(geometry).map((item) => [`W08-${item.code}`, item]))
  return records.map((record) => {
    const bracket = brackets.get(record.componentCode)
    if (bracket) return { ...record, baselineQuantity: bracket.quantity, quantityRule: bracket.provisionalQuantity ? "Provisional scaling from Tubecon Laser Q42690" : "Tubecon Laser Q42690 · 8 x 16 x 3 m", geometryControlled: true }
    const member = byCode.get(record.componentCode)
    if (!member) return record
    const quotedCutLength = record.componentCode === "W08-COL" ? geometry.eaveHeightM - 0.225
      : record.componentCode === "W08-RAF" ? 4.186
        : record.componentCode === "W08-PUR" ? geometry.bays === 1 ? 4.095 : (4.1 + 4.09 + Math.max(0, geometry.bays - 2) * 3.99) / geometry.bays
          : record.componentCode === "W08-XBW" ? geometry.members.wallBracing.cutLengthM
            : record.componentCode === "W08-XBR" ? 5.208 : member.cutLengthM
    return {
      ...record,
      baselineQuantity: member.quantity,
      baselineLengthM: quotedCutLength,
      massKgPerM: member.massKgPerM,
      quantityRule: member.rule,
      wastePercent: 0,
      fabricationAllowance: 0,
      coatingAllowance: 0,
      geometryControlled: true,
    }
  })
}
