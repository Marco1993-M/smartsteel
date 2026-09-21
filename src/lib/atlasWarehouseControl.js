import { calculateAtlasWarehouseEstimate } from "./estimates/atlasWarehouseEstimate.js"
import { ATLAS_W06_LENGTHS_M, ATLAS_W06_EAVE_HEIGHTS_M } from "./atlasW06Geometry.js"
import { ATLAS_W08_LENGTHS_M, ATLAS_W08_EAVE_HEIGHTS_M } from "./atlasW08Geometry.js"
import { ATLAS_W10_LENGTHS_M, ATLAS_W10_EAVE_HEIGHTS_M } from "./atlasW10Geometry.js"
import { ATLAS_W12_LENGTHS_M, ATLAS_W12_EAVE_HEIGHTS_M } from "./atlasW12Geometry.js"

export const ATLAS_WAREHOUSE_CONTROL = {
  W06: { width: 6, lengths: ATLAS_W06_LENGTHS_M, heights: ATLAS_W06_EAVE_HEIGHTS_M, defaultHeight: 4.5 },
  W08: { width: 8, lengths: ATLAS_W08_LENGTHS_M, heights: ATLAS_W08_EAVE_HEIGHTS_M, defaultHeight: 3 },
  W10: { width: 10, lengths: ATLAS_W10_LENGTHS_M, heights: ATLAS_W10_EAVE_HEIGHTS_M, defaultHeight: 4.5 },
  W12: { width: 12, lengths: ATLAS_W12_LENGTHS_M, heights: ATLAS_W12_EAVE_HEIGHTS_M, defaultHeight: 4.5 },
}

export const CONTROLLED_COMPONENT_SUFFIXES = ["COL", "RAF", "XBR", "SEC", "CON", "RCL", "WCL"]

export function createAtlasWarehouseControl(productCode, options = {}) {
  const product = ATLAS_WAREHOUSE_CONTROL[productCode]
  if (!product) throw new Error("Unsupported Atlas warehouse product.")
  const length = Number(options.length || 20)
  const wallHeight = Number(options.wallHeight || product.defaultHeight)
  const gableMode = options.gableMode || "structure_only"
  const estimate = calculateAtlasWarehouseEstimate({
    width: product.width,
    length,
    wallHeight,
    steelFinish: "ZAM",
    gableMode,
    sheetingProfile: "IBR",
    sheetingFinish: "galvanised",
  })
  const geometry = estimate.materials.geometry
  const components = [
    { suffix: "COL", name: "Column set", category: "Primary framing", specification: `${geometry.members.columns.quantity} channels at ${geometry.members.columns.cutLengthM}m`, rule: geometry.members.columns.rule },
    { suffix: "RAF", name: "Dual-pitch rafter set", category: "Primary framing", specification: `${geometry.members.rafters.quantity} channels at ${geometry.members.rafters.cutLengthM}m`, rule: geometry.members.rafters.rule },
    { suffix: "XBR", name: "Bracing set", category: "Stability", specification: `${geometry.members.wallBracing.quantity + geometry.members.roofBracing.quantity} brace members`, rule: `${geometry.members.wallBracing.rule}; ${geometry.members.roofBracing.rule}` },
    { suffix: "SEC", name: "Secondary steel pack", category: "Secondary steel", specification: `${geometry.members.purlins.quantity} roof purlins${geometry.members.sideGirts ? `; ${geometry.members.sideGirts.quantity} side girts when enclosed` : ""}`, rule: geometry.members.purlins.rule },
    { suffix: "CON", name: "Bolted connection set", category: "Connections and fittings", specification: "Brackets, bolts, nuts and washers", rule: "Matched to portal, bracing and secondary-member count", hold: true },
    { suffix: "RCL", name: "Roof sheeting pack", category: "Cladding", specification: `${estimate.sheeting.roofSheetingArea}m² for the selected configuration`, rule: "Calculated from dual-pitch roof geometry", optional: true },
    { suffix: "WCL", name: "Wall sheeting pack", category: "Cladding", specification: `${estimate.sheeting.wallSheetingArea}m² for the selected configuration`, rule: "Calculated from wall and selected gable scope", optional: true },
  ].map((component) => ({ ...component, code: `${productCode}-${component.suffix}` }))

  return {
    productCode,
    product,
    estimate,
    geometry,
    components,
    bomCode: productCode === "W08" ? "ATL-WH-8M-SHELL" : `ATL-WH-${String(product.width).padStart(2, "0")}M-SHELL`,
    documentTitle: `${productCode} controlled product specification`,
  }
}
