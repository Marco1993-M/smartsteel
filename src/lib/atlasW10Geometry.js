import { calculateLippedChannelMassKgPerM } from "./atlasLippedChannelProfiles.js"

export const ATLAS_W10_LENGTHS_M = [4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60]
export const ATLAS_W10_EAVE_HEIGHTS_M = [3, 4, 4.5, 5]

const PROFILE = {
  column: { webMm: 250, flangeMm: 75, lipMm: 20, thicknessMm: 2.5 },
  rafter: { webMm: 200, flangeMm: 75, lipMm: 20, thicknessMm: 2.5 },
  purlin: { webMm: 175, flangeMm: 65, lipMm: 20, thicknessMm: 2 },
  bracing: { webMm: 100, flangeMm: 50, lipMm: 20, thicknessMm: 2 },
  sideGirt: { webMm: 150, flangeMm: 50, lipMm: 20, thicknessMm: 2 },
  gableColumn: { webMm: 250, flangeMm: 75, lipMm: 20, thicknessMm: 2.5 },
  openingGableColumn: { webMm: 200, flangeMm: 75, lipMm: 20, thicknessMm: 2 },
  gableGirt: { webMm: 150, flangeMm: 50, lipMm: 20, thicknessMm: 2 },
  apexHaunch: { webMm: 175, flangeMm: 50, lipMm: 20, thicknessMm: 2 },
}

function round(value, digits = 4) { return Number(Number(value).toFixed(digits)) }

export function calculateAtlasW10Geometry({ lengthM = 20, eaveHeightM = 4.5 } = {}) {
  const length = Number(lengthM)
  const eaveHeight = Number(eaveHeightM)
  if (!ATLAS_W10_LENGTHS_M.includes(length)) throw new Error("W10 length must use 4m bays from 4m to 60m.")
  if (!ATLAS_W10_EAVE_HEIGHTS_M.includes(eaveHeight)) throw new Error("W10 eave height must use a controlled height from 3m to 5m.")

  const spanM = 10
  const baySpacingM = 4
  const roofPitchDegrees = 15
  const roofPitchRadians = (roofPitchDegrees * Math.PI) / 180
  const rafterCutLengthM = (spanM / 2) / Math.cos(roofPitchRadians)
  const roofRiseM = (spanM / 2) * Math.tan(roofPitchRadians)
  const bays = length / baySpacingM
  const portalFrames = bays + 1
  const purlinRowsPerSlope = 3
  const totalPurlinRows = 6
  const bracedBayPositions = Array.from({ length: bays }, (_, index) => index + 1).filter((bay) => (bay - 1) % 4 === 0)
  const wallBraceCutLengthM = Math.hypot(baySpacingM, eaveHeight)
  const roofBraceCutLengthM = Math.hypot(baySpacingM, rafterCutLengthM)
  const gableHeightAdjustmentM = eaveHeight - 4.5
  const frontGableColumnLengthM = 5.03 + gableHeightAdjustmentM
  const rearGableColumnLengthM = 5.3 + gableHeightAdjustmentM
  const apexMemberLengthM = 2
  const haunchMemberLengthM = 1.3
  const openingWidthM = 6
  const openingHeightM = eaveHeight
  const openingSideWidthM = (spanM - openingWidthM) / 2
  const openingJambColumnLengthM = eaveHeight + openingSideWidthM * Math.tan(roofPitchRadians)
  const openingGirtRows = 3
  const openingGirtSegments = openingGirtRows * 2
  const gableOpening6m = {
    selected: false,
    defaultGableArrangement: "open",
    openingWidthM,
    openingHeightM,
    headerLengthM: openingWidthM,
    headerHeightM: eaveHeight,
    jambColumns: {
      quantity: 2,
      cutLengthM: round(openingJambColumnLengthM),
      projectionAboveHeaderM: round(openingJambColumnLengthM - eaveHeight),
      profile: PROFILE.openingGableColumn,
    },
    gableGirts: {
      rows: openingGirtRows,
      segmentsPerRow: 2,
      quantity: openingGirtSegments,
      cutLengthM: round(openingSideWidthM),
      totalLengthM: round(openingGirtSegments * openingSideWidthM, 3),
      profile: PROFILE.gableGirt,
    },
    upperGableMembers: [],
    rule: "Optional centred 6m opening to the eave line; no girts or studs in the triangular gable above the header.",
  }
  const members = {
    columns: { code: "W10-COL", label: "Column channels", quantity: portalFrames * 2 * 2, cutLengthM: eaveHeight, massKgPerM: calculateLippedChannelMassKgPerM(PROFILE.column), rule: `${portalFrames} frames × 2 columns × 2 back-to-back channels` },
    rafters: { code: "W10-RAF", label: "Rafter channels", quantity: portalFrames * 2, cutLengthM: rafterCutLengthM, massKgPerM: calculateLippedChannelMassKgPerM(PROFILE.rafter), rule: `${portalFrames} frames × 2 single rafters` },
    purlins: { code: "W10-PUR", label: "Roof purlins", quantity: bays * totalPurlinRows, cutLengthM: baySpacingM, massKgPerM: calculateLippedChannelMassKgPerM(PROFILE.purlin), rule: `${totalPurlinRows} rows × ${bays} bay lengths` },
    wallBracing: { code: "W10-XBW", label: "Wall X-bracing", quantity: bracedBayPositions.length * 4, cutLengthM: wallBraceCutLengthM, massKgPerM: calculateLippedChannelMassKgPerM(PROFILE.bracing), rule: `${bracedBayPositions.length} braced bays × 2 walls × 2 diagonals` },
    roofBracing: { code: "W10-XBR", label: "Roof X-bracing", quantity: bracedBayPositions.length * 4, cutLengthM: roofBraceCutLengthM, massKgPerM: calculateLippedChannelMassKgPerM(PROFILE.bracing), rule: `${bracedBayPositions.length} braced bays × 2 roof slopes × 2 diagonals` },
    sideGirts: { code: "W10-GRT", label: "Side girts", quantity: bays * 2 * 3, cutLengthM: baySpacingM, massKgPerM: calculateLippedChannelMassKgPerM(PROFILE.sideGirt), rule: `${bays} bays × 2 walls × 3 rows` },
    frontGableColumns: { code: "W10-GCF", label: "Front gable columns", quantity: 2, cutLengthM: frontGableColumnLengthM, massKgPerM: calculateLippedChannelMassKgPerM(PROFILE.gableColumn), rule: "2 single columns at 2m / 6m / 2m spacing" },
    rearGableColumns: { code: "W10-GCR", label: "Rear gable columns", quantity: 2, cutLengthM: rearGableColumnLengthM, massKgPerM: calculateLippedChannelMassKgPerM(PROFILE.gableColumn), rule: "2 single columns at 3m / 4m / 3m spacing" },
    apexMembers: { code: "W10-APX", label: "Apex members", quantity: portalFrames, cutLengthM: apexMemberLengthM, massKgPerM: calculateLippedChannelMassKgPerM(PROFILE.apexHaunch), rule: `${portalFrames} frames × 1 apex member` },
    haunchMembers: { code: "W10-HCH", label: "Haunch members", quantity: portalFrames * 2, cutLengthM: haunchMemberLengthM, massKgPerM: calculateLippedChannelMassKgPerM(PROFILE.apexHaunch), rule: `${portalFrames} frames × 2 haunch members` },
  }
  Object.values(members).forEach((member) => {
    member.cutLengthM = round(member.cutLengthM)
    member.totalLengthM = round(member.quantity * member.cutLengthM, 3)
    member.totalMassKg = round(member.totalLengthM * member.massKgPerM, 2)
  })
  return {
    productCode: "W10", spanM, lengthM: length, eaveHeightM: eaveHeight, baySpacingM, bays, portalFrames,
    roofPitchDegrees, roofRiseM: round(roofRiseM), rafterCutLengthM: round(rafterCutLengthM), purlinRowsPerSlope,
    totalPurlinRows, bracedBayPositions,
    gableFraming: { defaultArrangement: "open", frontSpacingM: [2, 6, 2], rearSpacingM: [3, 4, 3], frontColumnLengthM: round(frontGableColumnLengthM), rearColumnLengthM: round(rearGableColumnLengthM), opening6m: gableOpening6m },
    apexMemberLengthM, haunchMemberLengthM, members,
    confirmedStructuralMassKg: round(Object.values(members).reduce((total, member) => total + member.totalMassKg, 0), 2),
    assumptions: { structuralWastePercent: 0, fabricationAllowance: 0, packagingAllowance: 0, punchingIncludedInSteelRate: true, deliveryIncluded: false, installationIncluded: false },
    holds: ["Final bolted connection quantities and specifications", "Gable-girt member schedule"],
  }
}

export function applyAtlasW10GeometryToPricing(records, geometry) {
  const byCode = new Map(Object.values(geometry.members).map((member) => [member.code, member]))
  return records.map((record) => {
    if (record.componentCode === "W10-APH") {
      const apex = geometry.members.apexMembers
      const haunch = geometry.members.haunchMembers
      return { ...record, baselineQuantity: 1, baselineLengthM: apex.totalLengthM + haunch.totalLengthM, massKgPerM: apex.massKgPerM, quantityRule: `${apex.quantity} apex members × ${apex.cutLengthM}m + ${haunch.quantity} haunch members × ${haunch.cutLengthM}m`, wastePercent: 0, fabricationAllowance: 0, coatingAllowance: 0, geometryControlled: true }
    }
    const member = byCode.get(record.componentCode)
    return member ? { ...record, baselineQuantity: member.quantity, baselineLengthM: member.cutLengthM, massKgPerM: member.massKgPerM, quantityRule: member.rule, wastePercent: 0, fabricationAllowance: 0, coatingAllowance: 0, geometryControlled: true } : record
  })
}
