import { calculateAtlasW06Geometry } from "../atlasW06Geometry"
import { calculateAtlasW08Geometry } from "../atlasW08Geometry"
import { calculateAtlasW10Geometry } from "../atlasW10Geometry"
import { calculateAtlasW12Geometry } from "../atlasW12Geometry"
import { WAREHOUSE_MATERIALS } from "./warehouseEstimate"

const VAT_RATE = 0.15
const MARGIN_RATE = 0.4
const MATERIAL_RATES_PER_TON = { ZAM: 28840, Galv: 30100, Mild: 21000 }
const SHEETING_RATES = { Corrugated: 160, IBR: 225, "Concealed Fix": 225 }
const CHROMADEK_RATE = 350
const CONNECTION_RATES = { bracket: 150, bolt: 10, nut: 10, washer: 1.5 }
const GEOMETRY_BY_WIDTH = {
  6: calculateAtlasW06Geometry,
  8: calculateAtlasW08Geometry,
  10: calculateAtlasW10Geometry,
  12: calculateAtlasW12Geometry,
}

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
  if (value === "fully_enclosed") return "Roof and walls sheeted"
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
  const claddingInstalled = Boolean(input.claddingInstalled)

  const structuralLines = Object.values(geometry.members).map((member) => {
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

  const bracketCount = geometry.portalFrames * 3 * quantity
  const boltCount = bracketCount * 4
  const washerCount = bracketCount * 8
  const connectionLines = [
    buildLineItem({ code: `${geometry.productCode}-BRK`, label: "Ridge and eave brackets (provisional)", quantity: bracketCount, unit: "each", unitRate: CONNECTION_RATES.bracket, total: bracketCount * CONNECTION_RATES.bracket, provisional: true }),
    buildLineItem({ code: `${geometry.productCode}-BLT`, label: "Structural bolts (provisional)", quantity: boltCount, unit: "each", unitRate: CONNECTION_RATES.bolt, total: boltCount * CONNECTION_RATES.bolt, provisional: true }),
    buildLineItem({ code: `${geometry.productCode}-NUT`, label: "Structural nuts (provisional)", quantity: boltCount, unit: "each", unitRate: CONNECTION_RATES.nut, total: boltCount * CONNECTION_RATES.nut, provisional: true }),
    buildLineItem({ code: `${geometry.productCode}-WSH`, label: "Structural washers (provisional)", quantity: washerCount, unit: "each", unitRate: CONNECTION_RATES.washer, total: washerCount * CONNECTION_RATES.washer, provisional: true }),
  ]

  const roofSheetingArea = gableMode === "structure_only" ? 0 : geometry.rafterCutLengthM * 2 * length * quantity
  const wallSheetingArea = gableMode === "fully_enclosed" ? wallHeight * length * 2 * quantity : 0
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

  const floorArea = width * length * quantity
  const structureInstallationCost = claddingInstalled ? floorArea * WAREHOUSE_MATERIALS.structureInstallRate : 0
  const claddingInstallationCost = claddingInstalled ? totalSheetingArea * WAREHOUSE_MATERIALS.claddingInstallRate : 0
  const installationLines = claddingInstalled ? [
    buildLineItem({ code: `${geometry.productCode}-INS`, label: "Structure installation budget", quantity: floorArea, unit: "sqm", unitRate: WAREHOUSE_MATERIALS.structureInstallRate, total: structureInstallationCost, provisional: true }),
    ...(totalSheetingArea > 0 ? [buildLineItem({ code: `${geometry.productCode}-SHT-INS`, label: "Sheeting installation budget", quantity: totalSheetingArea, unit: "sqm", unitRate: WAREHOUSE_MATERIALS.claddingInstallRate, total: claddingInstallationCost, provisional: true })] : []),
  ] : []

  const lineItems = [...structuralLines, ...connectionLines, ...sheetingLines, ...installationLines]
  const subTotalBeforeMarkup = lineItems.reduce((total, item) => total + item.total, 0)
  const markupValue = subTotalBeforeMarkup * MARGIN_RATE
  const totalExclVat = subTotalBeforeMarkup + markupValue
  const vatValue = totalExclVat * VAT_RATE
  const totalInclVat = totalExclVat + vatValue
  const systemName = `Atlas ${geometry.productCode} Warehouse`

  return {
    input: { ...input, width, length, wallHeight, quantity, steelFinish, gableMode, sheetingProfile, sheetingFinish, pricingModel: "atlas_os_v1", baySpacing: geometry.baySpacingM },
    dimensions: { width, length, wallHeight, quantity, portals: geometry.portalFrames, bays: geometry.bays, lengthRule: "atlas_4m_bay_rule", trussLength: geometry.rafterCutLengthM, trussHeight: geometry.roofRiseM, roofPurlins: geometry.totalPurlinRows },
    materials: { totalSteelKg: roundMoney(geometry.confirmedStructuralMassKg * quantity), geometry, provisionalConnections: true },
    pricing: { steelCost: roundMoney(structuralLines.reduce((sum, item) => sum + item.total, 0)), connectionCost: roundMoney(connectionLines.reduce((sum, item) => sum + item.total, 0)), subTotalBeforeMarkup: roundMoney(subTotalBeforeMarkup), markupRate: MARGIN_RATE, markupValue: roundMoney(markupValue), vatRate: VAT_RATE, vatValue: roundMoney(vatValue), baseTotal: roundMoney(totalExclVat), markupMultiplier: 1 + MARGIN_RATE, estimatedTotal: roundMoney(totalExclVat), totalInclVat: roundMoney(totalInclVat), claddingCost: roundMoney(sheetingCost), installationCost: roundMoney(structureInstallationCost + claddingInstallationCost) },
    sheeting: { roofSheetingArea: roundMoney(roofSheetingArea), wallSheetingArea: roundMoney(wallSheetingArea), totalSheetingArea: roundMoney(totalSheetingArea) },
    lineItems,
    summary: { title: `${quantity > 1 ? `${quantity} x ` : ""}${width}m x ${length}m ${systemName}`, shortDescription: `${systemName}, ${width}m x ${length}m x ${wallHeight}m, ${steelFinish} steel, ${sheetingModeLabel(gableMode).toLowerCase()}, ${claddingInstalled ? "installation budget included" : "supply only"}`, estimateRequest: `${systemName}: ${width}m x ${length}m x ${wallHeight}m, ${steelFinish}, ${sheetingModeLabel(gableMode)}, supply${claddingInstalled ? " and installation budget" : " only"}`, layoutNote: "" },
    labels: { steelFinish, cladding: sheetingModeLabel(gableMode), sheetingProfile, sheetingFinish: sheetingFinish === "chromadek" ? "Chromadek" : "Galvanised", installation: claddingInstalled ? "Installation budget included" : "Structure supply only", gableMode: sheetingModeLabel(gableMode) },
    meta: { productType: "Atlas Warehouse", internalProductType: "LCSS Warehouse", productGroup: "warehouse", sourceModel: "Atlas OS geometry v1", productCode: geometry.productCode, provisionalItems: ["Brackets", "Bolts", "Nuts", "Washers", ...(claddingInstalled ? ["Installation"] : [])] },
  }
}
