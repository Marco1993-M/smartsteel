// Internal cost basis, never derived by reversing a customer selling total.
const round = n => Math.round((Number(n) + Number.EPSILON) * 100) / 100
export const warehouseAllowanceConfiguration = input => ({
  width: Number(input.width), length: Number(input.length), wallHeight: Number(input.wallHeight),
  quantity: Number(input.quantity || 1), steelFinish: input.steelFinish,
  gableMode: input.gableMode || input.sheetingMode, sheetingProfile: input.sheetingProfile,
  sheetingFinish: input.sheetingFinish,
})
export function createWarehouseAllowanceSnapshot(estimate, capturedAt = new Date().toISOString()) {
  if (estimate?.meta?.productType !== 'Atlas Warehouse' || !estimate.sheeting?.costing) return null
  const steelCodes = new Set(Object.values(estimate.materials.geometry.members).map(m => m.code))
  const amounts = { structure: 0, brackets: 0, fasteners: 0, sheeting: round(estimate.sheeting.costing.budgetedCost) }
  const missing = []
  for (const line of estimate.lineItems) {
    if (line.code.endsWith('-SHT')) continue
    const category = steelCodes.has(line.code) || line.code.endsWith('-GGE') ? 'structure' : /-(M10-SET|ANC)$/.test(line.code) ? 'fasteners' : 'brackets'
    amounts[category] += line.total
    if (line.quantity > 0 && !(line.total > 0)) missing.push({ category, code: line.code, quantity: line.quantity, label: line.label })
  }
  Object.keys(amounts).forEach(key => { amounts[key] = round(amounts[key]) })
  const knownCosts = { ...amounts }
  missing.forEach(line => { amounts[line.category] = null })
  return { schemaVersion: 1, capturedAt, pricingRelease: estimate.meta.pricingRelease, configuration: warehouseAllowanceConfiguration(estimate.input), amounts, knownCosts, missing }
}
