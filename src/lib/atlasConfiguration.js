import {
  ATLAS_WAREHOUSE_SHEETING_OPTIONS,
  ATLAS_WAREHOUSE_STEEL_FINISH_OPTIONS,
  ATLAS_WAREHOUSE_WIDTH_OPTIONS,
} from "./estimates/atlasWarehouseOptions.js"

export const ATLAS_CONFIGURATION_VERSION = 1
export const ATLAS_PRODUCT_KEY = "atlas-warehouse"
export const ATLAS_LENGTH_OPTIONS = Array.from({ length: 15 }, (_, index) => (index + 1) * 4)
export const ATLAS_HEIGHT_OPTIONS = [3, 4, 4.5, 5]
export const ATLAS_SHEETING_PROFILE_OPTIONS = ["Corrugated", "IBR", "Concealed Fix"]
export const ATLAS_SHEETING_FINISH_OPTIONS = ["galvanised", "chromadek"]

export const DEFAULT_ATLAS_CONFIGURATION = Object.freeze({
  version: ATLAS_CONFIGURATION_VERSION,
  productKey: ATLAS_PRODUCT_KEY,
  productType: "LCSS Warehouse",
  width: 8,
  length: 20,
  wallHeight: 3,
  roofType: "dual_pitch",
  roofPitch: 15,
  steelFinish: "ZAM",
  gableMode: "structure_only",
  cladding: "None",
  sheetingProfile: "IBR",
  sheetingFinish: "galvanised",
  sheetingColor: "galvanised",
  scope: "supply_only",
  installationInterest: false,
  enclosureType: "roof_only",
  rollerDoorCount: 0,
  garageDoorOpeningType: "single",
  rollerDoorFace: "front",
  pedestrianDoorCount: 0,
  pedestrianDoorFace: "rear",
  deliveryRequired: false,
  deliveryDistance: 0,
})

function allowed(values, value, fallback) {
  return values.includes(value) ? value : fallback
}

function numberIn(values, value, fallback) {
  const numericValue = Number(value)
  return values.includes(numericValue) ? numericValue : fallback
}

export function normalizeAtlasConfiguration(input = {}) {
  const width = numberIn(ATLAS_WAREHOUSE_WIDTH_OPTIONS, input.width, DEFAULT_ATLAS_CONFIGURATION.width)
  const defaultHeight = width >= 10 ? 4.5 : 3
  const gableMode = allowed(
    ATLAS_WAREHOUSE_SHEETING_OPTIONS.map((option) => option.value),
    input.gableMode || input.sheetingMode,
    DEFAULT_ATLAS_CONFIGURATION.gableMode
  )
  const sheetingFinish = allowed(
    ATLAS_SHEETING_FINISH_OPTIONS,
    input.sheetingFinish,
    input.cladding === "Chromadek" ? "chromadek" : DEFAULT_ATLAS_CONFIGURATION.sheetingFinish
  )

  return {
    ...DEFAULT_ATLAS_CONFIGURATION,
    ...input,
    version: ATLAS_CONFIGURATION_VERSION,
    productKey: ATLAS_PRODUCT_KEY,
    productType: "LCSS Warehouse",
    width,
    length: numberIn(ATLAS_LENGTH_OPTIONS, input.length, DEFAULT_ATLAS_CONFIGURATION.length),
    wallHeight: numberIn(ATLAS_HEIGHT_OPTIONS, input.wallHeight, defaultHeight),
    roofType: "dual_pitch",
    roofPitch: 15,
    steelFinish: allowed(
      ATLAS_WAREHOUSE_STEEL_FINISH_OPTIONS,
      input.steelFinish,
      DEFAULT_ATLAS_CONFIGURATION.steelFinish
    ),
    gableMode,
    cladding: gableMode === "structure_only" ? "None" : sheetingFinish === "chromadek" ? "Chromadek" : "IBR",
    sheetingProfile: allowed(
      ATLAS_SHEETING_PROFILE_OPTIONS,
      input.sheetingProfile,
      DEFAULT_ATLAS_CONFIGURATION.sheetingProfile
    ),
    sheetingFinish,
    sheetingColor: sheetingFinish === "galvanised" ? "galvanised" : input.sheetingColor || "charcoal-grey",
    scope: "supply_only",
    installationInterest: Boolean(input.installationInterest),
    deliveryRequired: Boolean(input.deliveryRequired),
    deliveryDistance: Math.max(0, Number(input.deliveryDistance) || 0),
    rollerDoorCount: Math.min(6, Math.max(0, Math.round(Number(input.rollerDoorCount) || 0))),
    pedestrianDoorCount: Math.min(6, Math.max(0, Math.round(Number(input.pedestrianDoorCount) || 0))),
  }
}

export function validateAtlasConfiguration(input = {}) {
  const configuration = normalizeAtlasConfiguration(input)
  const errors = []
  if (!ATLAS_WAREHOUSE_WIDTH_OPTIONS.includes(Number(input.width))) errors.push("Select a released Atlas warehouse width.")
  if (!ATLAS_LENGTH_OPTIONS.includes(Number(input.length))) errors.push("Atlas warehouse lengths must follow 4m bay increments.")
  if (!ATLAS_HEIGHT_OPTIONS.includes(Number(input.wallHeight))) errors.push("Select a released Atlas eave height.")
  return { valid: errors.length === 0, errors, configuration }
}

export function createAtlasConfigurationReference(input = {}) {
  const configuration = normalizeAtlasConfiguration(input)
  const stablePayload = [
    configuration.version,
    configuration.productKey,
    configuration.width,
    configuration.length,
    configuration.wallHeight,
    configuration.steelFinish,
    configuration.gableMode,
    configuration.sheetingProfile,
    configuration.sheetingFinish,
    configuration.sheetingColor,
    configuration.rollerDoorCount,
    configuration.pedestrianDoorCount,
  ].join("|")
  let hash = 2166136261
  for (let index = 0; index < stablePayload.length; index += 1) {
    hash ^= stablePayload.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return `AT-${(hash >>> 0).toString(36).toUpperCase().padStart(7, "0").slice(0, 7)}`
}

export function getAtlasConfigurationSummary(input = {}) {
  const configuration = normalizeAtlasConfiguration(input)
  const sheetingLabel = ATLAS_WAREHOUSE_SHEETING_OPTIONS.find(
    (option) => option.value === configuration.gableMode
  )?.label
  return {
    product: `Atlas W${String(configuration.width).padStart(2, "0")} Warehouse`,
    size: `${configuration.width}m x ${configuration.length}m x ${configuration.wallHeight}m`,
    structure: sheetingLabel,
    finish: configuration.steelFinish,
    sheeting: configuration.gableMode === "structure_only"
      ? "Not selected"
      : `${configuration.sheetingProfile} · ${configuration.sheetingFinish === "chromadek" ? "Chromadek" : "Galvanised"}`,
    reference: createAtlasConfigurationReference(configuration),
  }
}

