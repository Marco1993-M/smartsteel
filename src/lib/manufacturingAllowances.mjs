import { calculateAtlasWarehouseEstimate } from './estimates/atlasWarehouseEstimate.js'
import { isAtlasWarehouseProductType } from './atlasProductIdentity.js'
import { createWarehouseAllowanceSnapshot, warehouseAllowanceConfiguration } from './manufacturingAllowanceSnapshot.mjs'
import { emptyOperations } from './manufacturingOperations.mjs'

const keys = ['structure', 'brackets', 'fasteners', 'sheeting']
const validAmount = n => typeof n === 'number' && Number.isFinite(n) && n >= 0
const sameConfig = (a,b) => JSON.stringify(warehouseAllowanceConfiguration(a)) === JSON.stringify(warehouseAllowanceConfiguration(b))
function usableSnapshot(snapshot, config) {
  return snapshot?.schemaVersion === 1 && sameConfig(snapshot.configuration || {}, config) &&
    typeof snapshot.capturedAt === 'string' && Number.isFinite(Date.parse(snapshot.capturedAt)) &&
    keys.every(k => snapshot.amounts?.[k] === null || validAmount(snapshot.amounts?.[k])) &&
    keys.every(k => validAmount(snapshot.knownCosts?.[k])) && Array.isArray(snapshot.missing)
}
export function suggestManufacturingAllowances(order, now = new Date().toISOString()) {
  if (order.operations?.data?.baseline?.locked) return null
  const quote = order.quote_snapshot || {}, input = quote.input_data || {}
  if (!isAtlasWarehouseProductType(quote.product_type || input.productType) || input.useCustomSize) return { available: false, message: 'This order needs a reviewed manual cost allowance; its scope is not a standard Atlas warehouse.' }
  // Do not let calculator defaults invent a missing accepted specification.
  if (![input.width, input.length, input.wallHeight].every(v => v != null && Number(v) > 0) ||
      !['ZAM','Galv','Mild'].includes(input.steelFinish) ||
      !['structure_only','roof_only','fully_enclosed','fully_enclosed_with_gables','open_gable','sheeted_gable'].includes(input.gableMode || input.sheetingMode) ||
      ((input.gableMode || input.sheetingMode) !== 'structure_only' && (!['IBR','Corrugated','Concealed Fix'].includes(input.sheetingProfile) || !['galvanised','chromadek'].includes(input.sheetingFinish))) ||
      (input.quantity != null && (!Number.isInteger(Number(input.quantity)) || Number(input.quantity) < 1))) return { available: false, message: 'The accepted quote is missing a complete standard warehouse specification. Enter and review allowances manually.' }
  try {
    const current = calculateAtlasWarehouseEstimate(input)
    const saved = input.manufacturingCostSnapshot
    const useSaved = usableSnapshot(saved, current.input)
    const snapshot = useSaved ? saved : createWarehouseAllowanceSnapshot(current, now)
    const original = input.originalLineItems || []
    const actual = quote.line_items || []
    const adjusted = !original.length || actual.length !== original.length || actual.some(line => {
      const base = original.find(row => row.code === line.code)
      const expectedTotal = base ? Math.round(Number(base.total) * (base.priceIncludesMarkup ? 1 : Number(quote.markup_multiplier || current.pricing.markupMultiplier)) * 100) / 100 : null
      return line.manual || line.userEdited || !base || Number(line.quantity) !== Number(base.quantity) || Math.abs(Number(line.total) - expectedTotal) > .02 || line.label !== base.label
    })
    const warnings = []
    if (adjusted) warnings.push('The quote has manual adjustments or no original line-item schedule. Check these standard-scope allowances against the accepted work, especially extra or omitted materials.')
    for (const missing of snapshot.missing) warnings.push(`${missing.quantity} × ${missing.label}: no cost rate recorded. The known ${missing.category} subtotal is R${snapshot.knownCosts[missing.category].toFixed(2)} excl. VAT; enter the complete category allowance before locking.`)
    const c = snapshot.configuration
    const specification = `${c.quantity > 1 ? `${c.quantity} × ` : ''}${c.width}m × ${c.length}m × ${c.wallHeight}m · ${c.steelFinish} · ${current.labels.cladding}${c.gableMode === 'structure_only' ? '' : ` · ${c.sheetingProfile} ${c.sheetingFinish}`}`
    return { available: true, snapshot, warnings, specification, basis: useSaved ? 'Accepted quote cost snapshot' : 'Current released Atlas rates for the accepted specification', source: `${useSaved ? 'Accepted quote cost snapshot' : 'Current Atlas cost calculation'} · ${snapshot.pricingRelease} · ${snapshot.capturedAt.slice(0,10)} · ${specification}` }
  } catch {
    return { available: false, message: 'This configuration is outside the standard Atlas cost calculation. Enter reviewed allowances manually.' }
  }
}
export function prefillManufacturingAllowances(order) {
  const data = structuredClone(order.operations?.data || emptyOperations(order))
  const suggestion = order.allowanceSuggestion
  const b = data.baseline
  // Only a genuinely blank budget gets populated. Saved/editable drafts are snapshots too.
  if (!suggestion?.available || ['complete','cancelled'].includes(order.status) || b.locked || b.source || keys.some(k => b[k] != null) || data.allowanceBasis) return data
  data.baseline = { ...b, ...suggestion.snapshot.amounts, other: b.other ?? null, source: suggestion.source }
  data.allowanceBasis = { ...suggestion, appliedAt: new Date().toISOString() }
  return data
}
