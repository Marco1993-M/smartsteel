import { calculateLippedChannelMassKgPerM } from "./atlasLippedChannelProfiles.js"

export const ATLAS_W15_LENGTHS_M = Array.from({ length: 25 }, (_, index) => (index + 1) * 4)
export const ATLAS_W15_EAVE_HEIGHTS_M = [3, 4, 4.5, 5]

export const ATLAS_W15_PROFILES = {
  column: { webMm: 300, flangeMm: 100, lipMm: 20, thicknessMm: 2.5 },
  rafter: { webMm: 300, flangeMm: 100, lipMm: 20, thicknessMm: 2.5 },
  purlin: { webMm: 150, flangeMm: 75, lipMm: 20, thicknessMm: 2 },
  bracing: { webMm: 100, flangeMm: 50, lipMm: 20, thicknessMm: 2 },
  sideGirt: { webMm: 150, flangeMm: 75, lipMm: 20, thicknessMm: 2 },
  gableColumn: { webMm: 300, flangeMm: 75, lipMm: 20, thicknessMm: 2.5 },
  openingGableColumn: { webMm: 200, flangeMm: 75, lipMm: 20, thicknessMm: 2 },
  gableGirt: { webMm: 150, flangeMm: 75, lipMm: 20, thicknessMm: 2 },
  apexHaunch: { webMm: 300, flangeMm: 100, lipMm: 20, thicknessMm: 2.5 },
}

const PROFILE = ATLAS_W15_PROFILES

function round(value, digits = 4) { return Number(Number(value).toFixed(digits)) }

export function calculateAtlasW15Geometry({ lengthM = 20, eaveHeightM = 4.5 } = {}) {
  const length = Number(lengthM)
  const eaveHeight = Number(eaveHeightM)
  if (!ATLAS_W15_LENGTHS_M.includes(length)) throw new Error("W15 length must use 4m bays from 4m to 100m.")
  if (!ATLAS_W15_EAVE_HEIGHTS_M.includes(eaveHeight)) throw new Error("W15 eave height must use a controlled height from 3m to 5m.")

  const spanM = 15
  const baySpacingM = 4
  const roofPitchDegrees = 15
  const roofPitchRadians = (roofPitchDegrees * Math.PI) / 180
  const rafterCutLengthM = (spanM / 2) / Math.cos(roofPitchRadians)
  const roofRiseM = (spanM / 2) * Math.tan(roofPitchRadians)
  const bays = length / baySpacingM
  const portalFrames = bays + 1
  const purlinEdgeInsetM = 0.15
  const purlinRowsPerSlope = 6
  const totalPurlinRows = 12
  const purlinSpacingM = (rafterCutLengthM - purlinEdgeInsetM * 2) / (purlinRowsPerSlope - 1)
  const bracedBayPositions = Array.from({ length: bays }, (_, index) => index + 1).filter((bay) => (bay - 1) % 4 === 0)
  const wallBraceCutLengthM = Math.hypot(baySpacingM, eaveHeight)
  const roofBraceCutLengthM = Math.hypot(baySpacingM, rafterCutLengthM)
  const gableHeightAdjustmentM = eaveHeight - 4.5
  const frontGableColumnLengthM = 4.5 + 4.5 * Math.tan(roofPitchRadians) + gableHeightAdjustmentM
  const rearGableColumnLengthM = 4.5 + 5 * Math.tan(roofPitchRadians) + gableHeightAdjustmentM
  const apexMemberLengthM = 3
  const haunchMemberLengthM = 2.5
  const openingWidthM = 6
  const openingHeightM = eaveHeight
  const openingSideWidthM = (spanM - openingWidthM) / 2
  const openingJambColumnLengthM = eaveHeight + openingSideWidthM * Math.tan(roofPitchRadians)
  const openingGirtRows = Math.ceil(eaveHeight / 1.8)
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
    columns: { code: "W15-COL", label: "Column channels", quantity: portalFrames * 2 * 2, cutLengthM: eaveHeight, massKgPerM: calculateLippedChannelMassKgPerM(PROFILE.column), rule: `${portalFrames} frames × 2 columns × 2 back-to-back channels` },
    rafters: { code: "W15-RAF", label: "Rafter channels", quantity: portalFrames * 2 * 2, cutLengthM: rafterCutLengthM, massKgPerM: calculateLippedChannelMassKgPerM(PROFILE.rafter), rule: `${portalFrames} frames × 2 rafters × 2 back-to-back channels` },
    purlins: { code: "W15-PUR", label: "Roof purlins", quantity: bays * totalPurlinRows, cutLengthM: baySpacingM, massKgPerM: calculateLippedChannelMassKgPerM(PROFILE.purlin), rule: `${purlinRowsPerSlope} rows per slope at ${round(purlinSpacingM, 3)}m centres with 0.15m edge offsets × 2 slopes × ${bays} bay lengths` },
    wallBracing: { code: "W15-XBW", label: "Wall X-bracing", quantity: bracedBayPositions.length * 4, cutLengthM: wallBraceCutLengthM, massKgPerM: calculateLippedChannelMassKgPerM(PROFILE.bracing), rule: `${bracedBayPositions.length} braced bays × 2 walls × 2 diagonals` },
    roofBracing: { code: "W15-XBR", label: "Roof X-bracing", quantity: bracedBayPositions.length * 4, cutLengthM: roofBraceCutLengthM, massKgPerM: calculateLippedChannelMassKgPerM(PROFILE.bracing), rule: `${bracedBayPositions.length} braced bays × 2 roof slopes × 2 diagonals` },
    sideGirts: { code: "W15-GRT", label: "Side girts", quantity: bays * 2 * Math.ceil(eaveHeight / 1.8), cutLengthM: baySpacingM, massKgPerM: calculateLippedChannelMassKgPerM(PROFILE.sideGirt), rule: `${bays} bays × 2 walls × ${Math.ceil(eaveHeight / 1.8)} rows at no more than 1.8m` },
    frontGableColumns: { code: "W15-GCF", label: "Front gable columns", quantity: 2, cutLengthM: frontGableColumnLengthM, massKgPerM: calculateLippedChannelMassKgPerM(PROFILE.gableColumn), rule: "2 single columns at 4.5m / 6m / 4.5m spacing" },
    rearGableColumns: { code: "W15-GCR", label: "Rear gable columns", quantity: 2, cutLengthM: rearGableColumnLengthM, massKgPerM: calculateLippedChannelMassKgPerM(PROFILE.gableColumn), rule: "2 single columns at 5m / 5m / 5m spacing" },
    apexMembers: { code: "W15-APX", label: "Apex members", quantity: portalFrames * 2, cutLengthM: apexMemberLengthM, massKgPerM: calculateLippedChannelMassKgPerM(PROFILE.apexHaunch), rule: `${portalFrames} frames × 1 apex × 2 back-to-back channels` },
    haunchMembers: { code: "W15-HCH", label: "Haunch members", quantity: portalFrames * 2 * 2, cutLengthM: haunchMemberLengthM, massKgPerM: calculateLippedChannelMassKgPerM(PROFILE.apexHaunch), rule: `${portalFrames} frames × 2 haunches × 2 back-to-back channels` },
  }
  Object.values(members).forEach((member) => {
    member.cutLengthM = round(member.cutLengthM)
    member.totalLengthM = round(member.quantity * member.cutLengthM, 3)
    member.totalMassKg = round(member.totalLengthM * member.massKgPerM, 2)
  })
  return {
    productCode: "W15", spanM, lengthM: length, eaveHeightM: eaveHeight, baySpacingM, bays, portalFrames,
    roofPitchDegrees, roofRiseM: round(roofRiseM), rafterCutLengthM: round(rafterCutLengthM), purlinRowsPerSlope,
    purlinEdgeInsetM, purlinSpacingM: round(purlinSpacingM),
    totalPurlinRows, bracedBayPositions,
    gableFraming: { defaultArrangement: "open", frontSpacingM: [4.5, 6, 4.5], rearSpacingM: [5, 5, 5], frontColumnLengthM: round(frontGableColumnLengthM), rearColumnLengthM: round(rearGableColumnLengthM), opening6m: gableOpening6m },
    apexMemberLengthM, haunchMemberLengthM, members,
    confirmedStructuralMassKg: round(Object.values(members).reduce((total, member) => total + member.totalMassKg, 0), 2),
    assumptions: { structuralWastePercent: 0, fabricationAllowance: 0, packagingAllowance: 0, punchingIncludedInSteelRate: true, deliveryIncluded: false, installationIncluded: false },
    holds: ["Purlin splice bracket specification pending final engineer confirmation", "W15 connection and bracket schedule follows W12 pending engineer confirmation", "W15 wall and roof bracing layout follows W12 pending engineer confirmation", "W15 2.5m raking haunch length pending final engineer confirmation", "Six purlin rows per slope at approximately 1.493m centres pending final engineer confirmation"],
  }
}

export function applyAtlasW15GeometryToPricing(records, geometry) {
  const byCode = new Map(Object.values(geometry.members).map((member) => [member.code, member]))
  return records.map((record) => {
    if (record.componentCode === "W15-APH") {
      const apex = geometry.members.apexMembers
      const haunch = geometry.members.haunchMembers
      return { ...record, baselineQuantity: 1, baselineLengthM: apex.totalLengthM + haunch.totalLengthM, massKgPerM: apex.massKgPerM, quantityRule: `${apex.quantity} apex members × ${apex.cutLengthM}m + ${haunch.quantity} haunch members × ${haunch.cutLengthM}m`, wastePercent: 0, fabricationAllowance: 0, coatingAllowance: 0, geometryControlled: true }
    }
    const member = byCode.get(record.componentCode)
    return member ? { ...record, baselineQuantity: member.quantity, baselineLengthM: member.cutLengthM, massKgPerM: member.massKgPerM, quantityRule: member.rule, wastePercent: 0, fabricationAllowance: 0, coatingAllowance: 0, geometryControlled: true } : record
  })
}
