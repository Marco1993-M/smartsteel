import { calculateAtlasWarehouseEstimate } from "./estimates/atlasWarehouseEstimate.js"

function bomCodeForConfiguration(configuration = {}) {
  const width = Number(configuration.width)
  if (![6, 8, 10, 12].includes(width)) return ""
  return `ATL-WH-${width}M-SHELL`
}

export async function getLatestApprovedAtlasBom(supabase, configuration = {}) {
  const code = bomCodeForConfiguration(configuration)
  if (!code) return null

  const { data, error } = await supabase
    .from("os_boms")
    .select("id, code, title, revision_code, updated_at, os_bom_lines(id, line_number, category, description, quantity, unit, waste_factor, scope, notes, metadata, os_catalog_items(component_code, title, category, metadata))")
    .eq("platform_key", "atlas")
    .eq("code", code)
    .eq("status", "approved")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data || null
}

export function createManufacturingBomSnapshot(bom, configuration = {}) {
  if (!bom) throw new Error("No approved Atlas BOM is available for this configuration.")
  const estimate = calculateAtlasWarehouseEstimate(configuration)
  const geometryMembers = new Map(Object.values(estimate.materials.geometry.members || {}).map((member) => [member.code, member]))
  const controlledLines = [...(bom.os_bom_lines || [])]
    .sort((left, right) => left.line_number - right.line_number)
    .map((line) => ({
      lineNumber: line.line_number,
      sourceCode: line.metadata?.sourceCode || line.os_catalog_items?.component_code || "",
      category: line.category || line.os_catalog_items?.category || "Uncategorized",
      description: line.description,
      scope: line.scope,
      quantityRule: line.metadata?.quantityRule || "",
      notes: line.notes || "",
    }))

  const materialSchedule = estimate.lineItems.map((line, index) => {
    const member = geometryMembers.get(line.code)
    const controlled = controlledLines.find((item) => item.sourceCode === line.code)
    return {
      lineNumber: index + 1,
      code: line.code,
      category: controlled?.category || (member ? "Structural steel" : line.code.endsWith("-SHT") ? "Sheeting" : "Connections and fittings"),
      description: line.label,
      quantity: line.quantity,
      unit: line.unit,
      cutLengthM: member?.cutLengthM || null,
      totalLengthM: member?.totalLengthM || null,
      massKgPerM: member?.massKgPerM || null,
      totalMassKg: member?.totalMassKg || null,
      quantityRule: member?.rule || controlled?.quantityRule || "Configured order quantity",
      provisional: Boolean(line.provisional),
    }
  })

  return {
    schemaVersion: 1,
    capturedAt: new Date().toISOString(),
    source: {
      id: bom.id,
      code: bom.code,
      title: bom.title,
      revision: bom.revision_code,
      updatedAt: bom.updated_at,
    },
    configuration: estimate.input,
    sku: estimate.meta.sku,
    pricingRelease: estimate.meta.pricingRelease,
    totalSteelKg: estimate.materials.totalSteelKg,
    sheetingAreaSqm: estimate.sheeting.totalSheetingArea,
    controlledLines,
    materialSchedule,
    provisionalItems: estimate.meta.provisionalItems || [],
  }
}

export function getBomSnapshotState(snapshot, latestBom) {
  if (!latestBom) return { status: "missing", latestRevision: "", latestBomId: "" }
  if (!snapshot?.source?.id) return { status: "not_adopted", latestRevision: latestBom.revision_code, latestBomId: latestBom.id }
  const current = snapshot.source.id === latestBom.id && snapshot.source.updatedAt === latestBom.updated_at
  return { status: current ? "current" : "update_available", latestRevision: latestBom.revision_code, latestBomId: latestBom.id }
}
