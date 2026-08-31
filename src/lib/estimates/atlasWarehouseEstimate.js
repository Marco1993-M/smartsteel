import { calculateAtlasW06Geometry } from "../atlasW06Geometry.js"
import { calculateAtlasW08Geometry } from "../atlasW08Geometry.js"
import { calculateAtlasW10Geometry } from "../atlasW10Geometry.js"
import { calculateAtlasW12Geometry } from "../atlasW12Geometry.js"
import { ATLAS_WAREHOUSE_PRICING_RELEASE } from "../atlasPricingRelease.js"
import { buildAtlasWarehouseSku } from "../atlasSkuRegistry.js"
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
  m10CompleteSet: 12,
  m12AnchorBolt: 0,
}
const M10_COMPLETE_SET = {
  specification: "M10 x 30mm · Class 8.8 · zinc plated · matching nut and washer",
  setsPerEaveBracket: 8,
  setsPerRidgeBracket: 8,
  setsPerBracingBracket: 2,
  setsPerPurlinEnd: 1,
  setsPerGirtEnd: 1,
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
  return "structure_only"
}

function sheetingModeLabel(value) {
  if (value === "roof_only") return "Roof sheeting"
  if (value === "fully_enclosed") return "Roof and side walls sheeted"
  return "Structure only"
}

function buildLineItem({ code, label, quantity, unit, unitRate, total, provisional = false }) {
  return { code, label, quantity: roundMoney(quantity), unit, unitRate: roundMoney(unitRate), total: roundMoney(total), provisional }
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
  const sheetingProfile = ["Corrugated", "IBR", "Concealed Fix"].includes(input.sheetingProfile) ? input.sheetingProfile : "IBR"
  const sheetingFinish = input.sheetingFinish === "chromadek" || input.cladding === "Chromadek" ? "chromadek" : "galvanised"

  const wallSupportMemberKeys = new Set(["sideGirts", "frontGableColumns", "rearGableColumns"])
  const activeStructuralMembers = Object.entries(geometry.members)
    .filter(([key]) => {
      if (key === "sideGirts") return gableMode === "fully_enclosed"
      if (["frontGableColumns", "rearGableColumns"].includes(key)) return false
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

  // The standard builder scope leaves both gable ends open. Gable framing and
  // gable sheeting are reviewed separately when a client requests closed ends.
  const baseBracketCount = geometry.portalFrames * 2 * quantity
  const ridgeBracketCount = geometry.portalFrames * quantity
  const eaveBracketCount = geometry.portalFrames * 2 * quantity
  const braceMemberCount = (geometry.members.wallBracing.quantity + geometry.members.roofBracing.quantity) * quantity
  const bracingBracketCount = braceMemberCount * 2
  const purlinMemberCount = geometry.members.purlins.quantity * quantity
  const girtMemberCount = gableMode === "fully_enclosed" ? geometry.members.sideGirts.quantity * quantity : 0
  const m10CompleteSetCount =
    ridgeBracketCount * M10_COMPLETE_SET.setsPerRidgeBracket
    + eaveBracketCount * M10_COMPLETE_SET.setsPerEaveBracket
    + bracingBracketCount * M10_COMPLETE_SET.setsPerBracingBracket
    + purlinMemberCount * 2 * M10_COMPLETE_SET.setsPerPurlinEnd
    + girtMemberCount * 2 * M10_COMPLETE_SET.setsPerGirtEnd
  const anchorBoltCount = baseBracketCount * 4
  const connectionLines = [
    buildLineItem({ code: `${geometry.productCode}-BAS`, label: "Column base brackets", quantity: baseBracketCount, unit: "each", unitRate: CONNECTION_RATES.baseBracket, total: baseBracketCount * CONNECTION_RATES.baseBracket, provisional: true }),
    buildLineItem({ code: `${geometry.productCode}-RDG`, label: "Ridge brackets", quantity: ridgeBracketCount, unit: "each", unitRate: CONNECTION_RATES.ridgeBracket, total: ridgeBracketCount * CONNECTION_RATES.ridgeBracket, provisional: true }),
    buildLineItem({ code: `${geometry.productCode}-EAV`, label: "Eave brackets", quantity: eaveBracketCount, unit: "each", unitRate: CONNECTION_RATES.eaveBracket, total: eaveBracketCount * CONNECTION_RATES.eaveBracket, provisional: true }),
    buildLineItem({ code: `${geometry.productCode}-XBR-BRK`, label: "Bracing connection brackets", quantity: bracingBracketCount, unit: "each", unitRate: CONNECTION_RATES.bracingBracket, total: bracingBracketCount * CONNECTION_RATES.bracingBracket, provisional: true }),
    buildLineItem({ code: `${geometry.productCode}-M10-SET`, label: `Complete M10 connection sets · ${M10_COMPLETE_SET.specification}`, quantity: m10CompleteSetCount, unit: "set", unitRate: CONNECTION_RATES.m10CompleteSet, total: m10CompleteSetCount * CONNECTION_RATES.m10CompleteSet }),
    buildLineItem({ code: `${geometry.productCode}-ANC`, label: "M12 anchor bolts (price to confirm)", quantity: anchorBoltCount, unit: "each", unitRate: CONNECTION_RATES.m12AnchorBolt, total: anchorBoltCount * CONNECTION_RATES.m12AnchorBolt, provisional: true }),
  ]

  const roofSheetingArea = gableMode === "structure_only" ? 0 : geometry.rafterCutLengthM * 2 * length * quantity
  const longWallSheetingArea = gableMode === "fully_enclosed" ? wallHeight * length * 2 * quantity : 0
  const gableSheetingArea = 0
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
  })] : []

  const lineItems = [...structuralLines, ...connectionLines, ...sheetingLines]
  const subTotalBeforeMarkup = lineItems.reduce((total, item) => total + item.total, 0)
  const markupValue = subTotalBeforeMarkup * COMMERCIAL_UPLIFT_RATE
  const totalExclVat = subTotalBeforeMarkup + markupValue
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
    materials: { totalSteelKg: roundMoney(activeStructuralMembers.reduce((total, member) => total + member.totalMassKg, 0) * quantity), geometry, provisionalConnections: true },
    pricing: { steelCost: roundMoney(structuralLines.reduce((sum, item) => sum + item.total, 0)), connectionCost: roundMoney(connectionLines.reduce((sum, item) => sum + item.total, 0)), subTotalBeforeMarkup: roundMoney(subTotalBeforeMarkup), markupRate: COMMERCIAL_UPLIFT_RATE, markupValue: roundMoney(markupValue), commercialUpliftIncludedInRates: 0, vatRate: VAT_RATE, vatValue: roundMoney(vatValue), baseTotal: roundMoney(totalExclVat), markupMultiplier: 1 + COMMERCIAL_UPLIFT_RATE, estimatedTotal: roundMoney(totalExclVat), totalInclVat: roundMoney(totalInclVat), claddingCost: roundMoney(sheetingCost), installationCost: 0 },
    sheeting: { roofSheetingArea: roundMoney(roofSheetingArea), longWallSheetingArea: roundMoney(longWallSheetingArea), gableSheetingArea: roundMoney(gableSheetingArea), wallSheetingArea: roundMoney(wallSheetingArea), totalSheetingArea: roundMoney(totalSheetingArea), openingsDeducted: false },
    lineItems,
    summary: { title: `${quantity > 1 ? `${quantity} x ` : ""}${width}m x ${length}m ${systemName}`, shortDescription: `${systemName}, ${width}m x ${length}m x ${wallHeight}m, ${steelFinish} steel, ${sheetingDescription}, supply only`, estimateRequest: `${systemName}: ${width}m x ${length}m x ${wallHeight}m, ${steelFinish} steel, ${sheetingDescription}, supply only. Installation and delivery quoted separately.`, layoutNote: "" },
    labels: { steelFinish, cladding: sheetingModeLabel(gableMode), sheetingProfile, sheetingFinish: sheetingFinish === "chromadek" ? "Chromadek" : "Galvanised", installation: "Quoted separately", delivery: "Quoted separately", gableMode: sheetingModeLabel(gableMode) },
    meta: { productType: "Atlas Warehouse", internalProductType: "LCSS Warehouse", productGroup: "warehouse", sourceModel: "Atlas OS geometry v1", pricingRelease: ATLAS_WAREHOUSE_PRICING_RELEASE, productCode: geometry.productCode, sku, provisionalItems: ["Gable girts", "Bracket fabrication specifications", "M12 anchor-bolt price"] },
  }
}
