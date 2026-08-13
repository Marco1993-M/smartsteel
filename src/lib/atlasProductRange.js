export const ATLAS_PRODUCT_RANGE = [
  {
    code: "W06",
    name: "W06 Warehouse",
    family: "Warehouses",
    status: "Controlled development",
    summary: "6m-span modular warehouse system using the controlled 4m bay method.",
    available: true,
  },
  {
    code: "W08",
    name: "W08 Warehouse",
    family: "Warehouses",
    status: "Controlled pilot",
    summary: "8m-span modular warehouse system with approved 4m bay spacing.",
    available: true,
  },
  {
    code: "W10",
    name: "W10 Warehouse",
    family: "Warehouses",
    status: "Controlled development",
    summary: "10m-span modular warehouse system with a 4.5m default eave height.",
    available: true,
  },
  {
    code: "W12",
    name: "W12 Warehouse",
    family: "Warehouses",
    status: "Controlled development",
    summary: "12m-span modular warehouse system with a 4.5m default eave height.",
    available: true,
  },
  {
    code: "CARPORT",
    name: "Atlas Carport",
    family: "Carports",
    status: "Commercially active",
    summary: "Single, double and multi-bay parking cover structures.",
    available: false,
  },
  {
    code: "SOLAR-CARPORT",
    name: "Atlas Solar Carport",
    family: "Solar structures",
    status: "Commercially active",
    summary: "Parking structures designed to support practical solar layouts.",
    available: false,
  },
  {
    code: "GROUND-MOUNT",
    name: "Atlas Ground Mount",
    family: "Solar structures",
    status: "Commercially active",
    summary: "Modular open-site solar support structures configured by panel count.",
    available: false,
  },
  {
    code: "TRUSS",
    name: "Atlas Truss System",
    family: "Trusses",
    status: "Product record required",
    summary: "Mono-pitch and dual-pitch lipped-channel roof truss systems.",
    available: false,
  },
  {
    code: "BRACKETRY",
    name: "Atlas Bracketry",
    family: "Components",
    status: "Component-led",
    summary: "Standard and project-specific brackets, connections and fittings.",
    available: false,
  },
]

export function getAtlasProduct(code) {
  return ATLAS_PRODUCT_RANGE.find((product) => product.code === code) || null
}

export function withAtlasProduct(href, productCode) {
  if (!productCode) return href
  const separator = href.includes("?") ? "&" : "?"
  return `${href}${separator}product=${encodeURIComponent(productCode)}`
}
