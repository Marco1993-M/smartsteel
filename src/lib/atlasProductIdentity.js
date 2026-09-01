export const ATLAS_WAREHOUSE_PRODUCT_TYPE = "Atlas Warehouse"

// Historical values are accepted only at this boundary so existing records remain usable.
const LEGACY_ATLAS_WAREHOUSE_PRODUCT_TYPES = [
  "LCSS Warehouse",
  "LCSS warehouse",
  "CFLC Warehouse",
  "CFLC warehouse",
]

const ATLAS_WAREHOUSE_IDENTITIES = new Set(
  [ATLAS_WAREHOUSE_PRODUCT_TYPE, ...LEGACY_ATLAS_WAREHOUSE_PRODUCT_TYPES].map((value) =>
    value.toLowerCase()
  )
)

export function isAtlasWarehouseProductType(value) {
  return ATLAS_WAREHOUSE_IDENTITIES.has(String(value || "").trim().toLowerCase())
}

export function normalizeAtlasProductType(value) {
  return isAtlasWarehouseProductType(value) ? ATLAS_WAREHOUSE_PRODUCT_TYPE : value
}

export function getAtlasWarehouseIdentityTerms() {
  return [
    "atlas",
    "lip channel",
    "lipped channel",
    "solar carport",
    "solar ground mount",
    ...LEGACY_ATLAS_WAREHOUSE_PRODUCT_TYPES.map((value) => value.split(" ")[0].toLowerCase()),
  ]
}
