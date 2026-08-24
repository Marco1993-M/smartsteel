import { ATLAS_WAREHOUSE_PRICING_RELEASE } from "./atlasPricingRelease.js"

export const ATLAS_SKU_REGISTRY_VERSION = 1
export const ATLAS_W08_STANDARD_LENGTHS = [4, 8, 12, 16, 20]
export const ATLAS_SKU_SCOPE_OPTIONS = [
  { value: "structure_only", code: "SO", label: "Structure only" },
  { value: "roof_only", code: "RO", label: "Roof sheeted" },
  { value: "fully_enclosed", code: "FE", label: "Fully enclosed" },
]
export const ATLAS_SKU_STEEL_OPTIONS = ["Mild", "ZAM", "Galv"]
export const ATLAS_SKU_SHEETING_PROFILES = ["Corrugated", "IBR", "Concealed Fix"]
export const ATLAS_SKU_SHEETING_FINISHES = ["galvanised", "chromadek"]

const STEEL_CODES = { Mild: "MILD", ZAM: "ZAM", Galv: "GALV" }
const PROFILE_CODES = { Corrugated: "COR", IBR: "IBR", "Concealed Fix": "CF" }
const SHEETING_FINISH_CODES = { galvanised: "GV", chromadek: "CH" }

function normalizeScope(value) {
  if (["roof_only", "open_gable"].includes(value)) return "roof_only"
  if (["fully_enclosed", "sheeted_gable"].includes(value)) return "fully_enclosed"
  return "structure_only"
}

function normalizeSteel(value) {
  const text = String(value || "").toLowerCase()
  if (text.includes("mild")) return "Mild"
  if (text.includes("zam")) return "ZAM"
  return "Galv"
}

function heightCode(value) {
  return `H${String(Math.round(Number(value) * 10)).padStart(2, "0")}`
}

export function buildAtlasWarehouseSku(input = {}) {
  const width = Number(input.width)
  const length = Number(input.length)
  const wallHeight = Number(input.wallHeight || (width >= 10 ? 4.5 : 3))
  const familyCode = `W${String(width).padStart(2, "0")}`
  const scope = normalizeScope(input.gableMode || input.sheetingMode)
  const scopeMeta = ATLAS_SKU_SCOPE_OPTIONS.find((item) => item.value === scope)
  const steelFinish = normalizeSteel(input.steelFinish)
  const parts = ["ATL", familyCode, String(length), heightCode(wallHeight), scopeMeta.code, STEEL_CODES[steelFinish]]

  if (scope !== "structure_only") {
    const sheetingProfile = ATLAS_SKU_SHEETING_PROFILES.includes(input.sheetingProfile) ? input.sheetingProfile : "IBR"
    const sheetingFinish = input.sheetingFinish === "chromadek" ? "chromadek" : "galvanised"
    parts.push(PROFILE_CODES[sheetingProfile], SHEETING_FINISH_CODES[sheetingFinish])
  }

  return parts.join("-")
}

export function createAtlasSkuRecord(input = {}) {
  const scope = normalizeScope(input.gableMode || input.scope)
  const steelFinish = normalizeSteel(input.steelFinish)
  const sheetingProfile = scope === "structure_only" ? null : (input.sheetingProfile || "IBR")
  const sheetingFinish = scope === "structure_only" ? null : (input.sheetingFinish === "chromadek" ? "chromadek" : "galvanised")
  const configuration = {
    width: Number(input.width),
    length: Number(input.length),
    wallHeight: Number(input.wallHeight),
    gableMode: scope,
    steelFinish,
    sheetingProfile,
    sheetingFinish,
  }
  const scopeLabel = ATLAS_SKU_SCOPE_OPTIONS.find((item) => item.value === scope)?.label
  const finishLabel = sheetingProfile ? ` · ${sheetingProfile} ${sheetingFinish}` : ""

  return {
    sku: buildAtlasWarehouseSku(configuration),
    familyCode: `W${String(configuration.width).padStart(2, "0")}`,
    productName: `Atlas ${configuration.width}m x ${configuration.length}m x ${configuration.wallHeight}m Warehouse`,
    description: `${scopeLabel} · ${steelFinish}${finishLabel}`,
    status: "active",
    pricingRelease: ATLAS_WAREHOUSE_PRICING_RELEASE,
    registryVersion: ATLAS_SKU_REGISTRY_VERSION,
    configuration,
  }
}

export function getAtlasW08SkuRegistry() {
  const records = []
  for (const length of ATLAS_W08_STANDARD_LENGTHS) {
    for (const steelFinish of ATLAS_SKU_STEEL_OPTIONS) {
      records.push(createAtlasSkuRecord({ width: 8, length, wallHeight: 3, scope: "structure_only", steelFinish }))
      for (const scope of ["roof_only", "fully_enclosed"]) {
        for (const sheetingProfile of ATLAS_SKU_SHEETING_PROFILES) {
          for (const sheetingFinish of ATLAS_SKU_SHEETING_FINISHES) {
            records.push(createAtlasSkuRecord({ width: 8, length, wallHeight: 3, scope, steelFinish, sheetingProfile, sheetingFinish }))
          }
        }
      }
    }
  }
  return records
}
