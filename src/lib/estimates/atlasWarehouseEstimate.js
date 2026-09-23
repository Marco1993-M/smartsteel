import { calculateAtlasW06Geometry } from "../atlasW06Geometry.js"
import { calculateAtlasW08Geometry } from "../atlasW08Geometry.js"
import { calculateAtlasW10Geometry } from "../atlasW10Geometry.js"
import { calculateAtlasW12Geometry } from "../atlasW12Geometry.js"
import { ATLAS_WAREHOUSE_PRICING_RELEASE } from "../atlasPricingRelease.js"
import { buildAtlasWarehouseSku } from "../atlasSkuRegistry.js"
import { ATLAS_M10_COMPLETE_SET } from "../atlasConnectionStandards.js"
const VAT_RATE = 0.15
// Controlled Atlas material and component rates are cost rates. Apply the
// approved commercial uplift exactly once after all priced inputs are added.
const COMMERCIAL_UPLIFT_RATE = 0.4
const MATERIAL_RATES_PER_TON = { ZAM: 28840, Galv: 30100, Mild: 21000 }
const SHEETING_RATES = { Corrugated: 160, IBR: 225, "Concealed Fix": 225 }
const CHROMADEK_RATE = 350
const CONNECTION_RATES = {
  baseBracket: 350,
  eaveBracket: 175,
  ridgeBracket: 850,
  bracingBracket: 40,
  m10CompleteSet: ATLAS_M10_COMPLETE_SET.costRate,
  m12AnchorBolt: 0,
}
const GEOMETRY_BY_WIDTH = {
  6: calculateAtlasW06Geometry,
  8: calculateAtlasW08Geometry,
  10: calculateAtlasW10Geometry,
  12: calculateAtlasW12Geometry,
}

// This version identifies the controlled pricing release used by every Atlas
// warehouse surface. Draft OS changes must not reach client pricing implicitly.
export { ATLAS_WAREHOUSE_PRICING_RELEASE } from "../atlasPricingRelease.js"
export const ATLAS_WAREHOUSE_WIDTH_OPTIONS = Object.keys(GEOMETRY_BY_WIDTH).map(Number)
export const ATLAS_WAREHOUSE_STEEL_FINISH_OPTIONS = Object.keys(MATERIAL_RATES_PER_TON)
export const ATLAS_WAREHOUSE_SHEETING_OPTIONS = [
  { value: "structure_only", label: "Structure only" },
  { value: "roof_only", label: "Roof sheeting" },
  { value: "fully_enclosed", label: "Roof and side walls sheeted" },
  { value: "fully_enclosed_with_gables", label: "Fully enclosed" },
]

function roundMoney(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100
}

function normalizeFinish(value) {
  if (String(value).toLowerCase().includes("mild")) return "Mild"
  if (String(value).toLowerCase().includes("zam")) return "ZAM"
  return "Galv"
}

function normalizeSheetingMode(value) {
  if (["open_gable", "roof_only"].includes(value)) return "roof_only"
  if (["sheeted_gable", "fully_enclosed"].includes(value)) return "fully_enclosed"
  if (value === "fully_enclosed_with_gables") return "fully_enclosed_with_gables"
  return "structure_only"
}

function sheetingModeLabel(value) {
  if (value === "roof_only") return "Roof sheeting"
  if (value === "fully_enclosed") return "Roof and side walls sheeted"
  if (value === "fully_enclosed_with_gables") return "Fully enclosed"
  return "Structure only"
}

function buildLineItem({ code, label, quantity, unit, unitRate, total, provisional = false, priceIncludesMarkup = false }) {
  return { code, label, quantity: roundMoney(quantity), unit, unitRate: roundMoney(unitRate), total: roundMoney(total), provisional, priceIncludesMarkup }
}

export function calculateAtlasWarehouseEstimate(input = {}) {
  const width = Number(input.width)
  const length = Number(input.length)
  const wallHeight = Number(input.wallHeight || (width >= 10 ? 4.5 : 3))
  const quantity = Math.max(1, Math.round(Number(input.quantity) || 1))
  const calculateGeometry = GEOMETRY_BY_WIDTH[width]
  if (!calculateGeometry) throw new Error("Atlas Warehouses support W06, W08, W10, and W12 spans.")

  const geometry = calculateGeometry({ lengthM: length, eaveHeightM: wallHeight })
  const steelFinish = normalizeFinish(input.steelFinish)
  const steelRatePerTon = MATERIAL_RATES_PER_TON[steelFinish]
  const gableMode = normalizeSheetingMode(input.gableMode || input.sheetingMode)
  const includesLongWalls = ["fully_enclosed", "fully_enclosed_with_gables"].includes(gableMode)
  const includesGableEnds = gableMode === "fully_enclosed_with_gables"
  const sheetingProfile = ["Corrugated", "IBR", "Concealed Fix"].includes(input.sheetingProfile) ? input.sheetingProfile : "IBR"
  const sheetingFinish = input.sheetingFinish === "chromadek" || input.cladding === "Chromadek" ? "chromadek" : "galvanised"

  const wallSupportMemberKeys = new Set(["sideGirts", "frontGableColumns", "rearGableColumns"])
  const activeStructuralMembers = Object.entries(geometry.members)
    .filter(([key]) => {
      if (key === "sideGirts") return includesLongWalls
      if (["frontGableColumns", "rearGableColumns"].includes(key)) return includesGableEnds
      return !wallSupportMemberKeys.has(key)
    })
    .map(([, member]) => member)
  const structuralLines = activeStructuralMembers.map((member) => {
    const rawCost = member.totalMassKg * (steelRatePerTon / 1000)
    return buildLineItem({
      code: member.code,
      label: member.label,
      quantity: member.quantity * quantity,
      unit: `${member.cutLengthM}m lengths`,
      unitRate: rawCost / member.quantity,
      total: rawCost * quantity,
    })
  })

  const gableGirtRowsPerEnd = includesGableEnds
    ? Math.max(3, Math.ceil((wallHeight + geometry.roofRiseM) / 1.5) + 1)
    : 0
  const gableGirtLengthM = gableGirtRowsPerEnd * width * 2 * quantity
  const gableGirtMassKg = gableGirtLengthM * geometry.members.sideGirts.massKgPerM
  const gableFramingLines = includesGableEnds ? [buildLineItem({
    code: `${geometry.productCode}-GGE`,
    label: "Gable-end girt allowance",
    quantity: gableGirtLengthM,
    unit: "m",
    unitRate: geometry.members.sideGirts.massKgPerM * (steelRatePerTon / 1000),
    total: gableGirtMassKg * (steelRatePerTon / 1000),
    provisional: true,
  })] : []

  // The first three scopes preserve the released open-gable configurations.
  // The fourth scope adds complete end-wall sheeting and a gable-framing allowance.
  const baseBracketCount = geometry.portalFrames * 2 * quantity
  const ridgeBracketCount = geometry.portalFrames * quantity
  const eaveBracketCount = geometry.portalFrames * 2 * quantity
  const braceMemberCount = (geometry.members.wallBracing.quantity + geometry.members.roofBracing.quantity) * quantity
  const bracingBracketCount = braceMemberCount * 2
  const purlinMemberCount = geometry.members.purlins.quantity * quantity
  const girtMemberCount = includesLongWalls ? geometry.members.sideGirts.quantity * quantity : 0
  const gableGirtMemberCount = gableGirtRowsPerEnd * 2 * quantity
  const m10CompleteSetCount =
    ridgeBracketCount * ATLAS_M10_COMPLETE_SET.setsPerRidgeBracket
    + eaveBracketCount * ATLAS_M10_COMPLETE_SET.setsPerEaveBracket
    + bracingBracketCount * ATLAS_M10_COMPLETE_SET.setsPerBracingBracket
    + purlinMemberCount * 2 * ATLAS_M10_COMPLETE_SET.setsPerPurlinEnd
    + girtMemberCount * 2 * ATLAS_M10_COMPLETE_SET.setsPerGirtEnd
    + gableGirtMemberCount * 2 * ATLAS_M10_COMPLETE_SET.setsPerGirtEnd
  const anchorBoltCount = baseBracketCount * 4
  const connectionLines = [
    buildLineItem({ code: `${geometry.productCode}-BAS`, label: "Column base brackets", quantity: baseBracketCount, unit: "each", unitRate: CONNECTION_RATES.baseBracket, total: baseBracketCount * CONNECTION_RATES.baseBracket, provisional: true }),
    buildLineItem({ code: `${geometry.productCode}-RDG`, label: "Ridge brackets", quantity: ridgeBracketCount, unit: "each", unitRate: CONNECTION_RATES.ridgeBracket, total: ridgeBracketCount * CONNECTION_RATES.ridgeBracket, provisional: true }),
    buildLineItem({ code: `${geometry.productCode}-EAV`, label: "Eave brackets", quantity: eaveBracketCount, unit: "each", unitRate: CONNECTION_RATES.eaveBracket, total: eaveBracketCount * CONNECTION_RATES.eaveBracket, provisional: true }),
    buildLineItem({ code: `${geometry.productCode}-XBR-BRK`, label: "Bracing connection brackets", quantity: bracingBracketCount, unit: "each", unitRate: CONNECTION_RATES.bracingBracket, total: bracingBracketCount * CONNECTION_RATES.bracingBracket, provisional: true }),
    buildLineItem({ code: `${geometry.productCode}-M10-SET`, label: `Complete M10 connection sets · ${ATLAS_M10_COMPLETE_SET.specification}`, quantity: m10CompleteSetCount, unit: "set", unitRate: CONNECTION_RATES.m10CompleteSet, total: m10CompleteSetCount * CONNECTION_RATES.m10CompleteSet }),
    buildLineItem({ code: `${geometry.productCode}-ANC`, label: "M12 anchor bolts (price to confirm)", quantity: anchorBoltCount, unit: "each", unitRate: CONNECTION_RATES.m12AnchorBolt, total: anchorBoltCount * CONNECTION_RATES.m12AnchorBolt, provisional: true }),
  ]

  const roofSheetingArea = gableMode === "structure_only" ? 0 : geometry.rafterCutLengthM * 2 * length * quantity
  const longWallSheetingArea = includesLongWalls ? wallHeight * length * 2 * quantity : 0
  const grossGableSheetingArea = includesGableEnds
    ? (width * wallHeight + (width * geometry.roofRiseM) / 2) * 2 * quantity
    : 0
  const gableOpeningWidth = includesGableEnds ? Math.min(6, width) : 0
  const gableOpeningHeight = includesGableEnds ? Math.min(3, wallHeight) : 0
  const gableOpeningArea = gableOpeningWidth * gableOpeningHeight * quantity
  const gableSheetingArea = grossGableSheetingArea - gableOpeningArea
  const wallSheetingArea = longWallSheetingArea + gableSheetingArea
  const totalSheetingArea = roofSheetingArea + wallSheetingArea
  const sheetingRate = sheetingFinish === "chromadek" ? CHROMADEK_RATE : SHEETING_RATES[sheetingProfile]
  const sheetingCost = totalSheetingArea * sheetingRate
  const sheetingLines = totalSheetingArea > 0 ? [buildLineItem({
    code: `${geometry.productCode}-SHT`,
    label: `${sheetingProfile} sheeting · ${sheetingFinish === "chromadek" ? "Chromadek" : "Galvanised"}`,
    quantity: totalSheetingArea,
    unit: "sqm",
    unitRate: sheetingRate,
    total: sheetingCost,
    priceIncludesMarkup: true,
  })] : []

  const lineItems = [...structuralLines, ...gableFramingLines, ...connectionLines, ...sheetingLines]
  const structuralAndConnectionCost = [...structuralLines, ...gableFramingLines, ...connectionLines]
    .reduce((total, item) => total + item.total, 0)
  const subTotalBeforeMarkup = structuralAndConnectionCost
  const markupValue = structuralAndConnectionCost * COMMERCIAL_UPLIFT_RATE
  const totalExclVat = structuralAndConnectionCost + markupValue + sheetingCost
  const vatValue = totalExclVat * VAT_RATE
  const totalInclVat = totalExclVat + vatValue
  const systemName = `Atlas ${geometry.productCode} Warehouse`
  const sku = buildAtlasWarehouseSku({ width, length, wallHeight, gableMode, steelFinish, sheetingProfile, sheetingFinish })
  const sheetingDescription = gableMode === "structure_only"
    ? "structure only"
    : `${sheetingModeLabel(gableMode).toLowerCase()} with ${sheetingProfile} ${sheetingFinish === "chromadek" ? "Chromadek" : "galvanised"} sheeting`

  return {
    input: { ...input, width, length, wallHeight, quantity, steelFinish, gableMode, sheetingProfile, sheetingFinish, pricingModel: "atlas_os_v1", baySpacing: geometry.baySpacingM },
    dimensions: { width, length, wallHeight, quantity, portals: geometry.portalFrames, bays: geometry.bays, lengthRule: "atlas_4m_bay_rule", trussLength: geometry.rafterCutLengthM, trussHeight: geometry.roofRiseM, roofPurlins: geometry.totalPurlinRows },
    materials: { totalSteelKg: roundMoney(activeStructuralMembers.reduce((total, member) => total + member.totalMassKg, 0) * quantity + gableGirtMassKg), geometry, gableGirtRowsPerEnd, gableGirtLengthM: roundMoney(gableGirtLengthM), provisionalConnections: true },
    pricing: { steelCost: roundMoney([...structuralLines, ...gableFramingLines].reduce((sum, item) => sum + item.total, 0)), connectionCost: roundMoney(connectionLines.reduce((sum, item) => sum + item.total, 0)), subTotalBeforeMarkup: roundMoney(subTotalBeforeMarkup), markupRate: COMMERCIAL_UPLIFT_RATE, markupValue: roundMoney(markupValue), commercialUpliftIncludedInRates: 0, vatRate: VAT_RATE, vatValue: roundMoney(vatValue), baseTotal: roundMoney(totalExclVat), markupMultiplier: 1 + COMMERCIAL_UPLIFT_RATE, estimatedTotal: roundMoney(totalExclVat), totalInclVat: roundMoney(totalInclVat), claddingCost: roundMoney(sheetingCost), installationCost: 0 },
    sheeting: { roofSheetingArea: roundMoney(roofSheetingArea), longWallSheetingArea: roundMoney(longWallSheetingArea), grossGableSheetingArea: roundMoney(grossGableSheetingArea), gableOpeningArea: roundMoney(gableOpeningArea), gableOpeningWidth, gableOpeningHeight, gableOpeningFace: includesGableEnds ? "one gable end" : null, gableSheetingArea: roundMoney(gableSheetingArea), wallSheetingArea: roundMoney(wallSheetingArea), totalSheetingArea: roundMoney(totalSheetingArea), openingsDeducted: includesGableEnds },
    lineItems,
    summary: { title: `${quantity > 1 ? `${quantity} x ` : ""}${width}m x ${length}m ${systemName}`, shortDescription: `${systemName}, ${width}m x ${length}m x ${wallHeight}m, ${steelFinish} steel, ${sheetingDescription}${includesGableEnds ? `, centred ${gableOpeningWidth}m x ${gableOpeningHeight}m opening on one gable end` : ""}, supply only`, estimateRequest: `${systemName}: ${width}m x ${length}m x ${wallHeight}m, ${steelFinish} steel, ${sheetingDescription}${includesGableEnds ? `, centred ${gableOpeningWidth}m x ${gableOpeningHeight}m opening on one gable end with the opposite gable enclosed` : ""}, supply only. Installation and delivery quoted separately.`, layoutNote: includesGableEnds ? `Standard fully enclosed scope includes one centred ${gableOpeningWidth}m wide x ${gableOpeningHeight}m high opening; the opposite gable remains enclosed.` : "" },
    labels: { steelFinish, cladding: sheetingModeLabel(gableMode), sheetingProfile, sheetingFinish: sheetingFinish === "chromadek" ? "Chromadek" : "Galvanised", installation: "Quoted separately", delivery: "Quoted separately", gableMode: sheetingModeLabel(gableMode) },
    meta: { productType: "Atlas Warehouse", productGroup: "warehouse", sourceModel: "Atlas OS geometry v1", pricingRelease: ATLAS_WAREHOUSE_PRICING_RELEASE, productCode: geometry.productCode, sku, provisionalItems: ["Gable-end framing specifications", "Bracket fabrication specifications", "M12 anchor-bolt price"] },
  }
}
