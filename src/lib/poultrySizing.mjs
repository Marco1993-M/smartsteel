import { ATLAS_LENGTH_OPTIONS } from './atlasConfiguration.js'
import { ATLAS_WAREHOUSE_WIDTH_OPTIONS } from './estimates/atlasWarehouseOptions.js'

export function estimateBroilerSpace(value, width = 10) {
  const birds = Number(value)
  if (!Number.isSafeInteger(birds) || birds < 1 || birds > 10000000) return null
  const usable = Math.ceil(birds / 10)
  // Allow additional gross area for space outside the bird area.
  const grossTarget = usable * 1.1
  const length = ATLAS_WAREHOUSE_WIDTH_OPTIONS.includes(width)
    ? ATLAS_LENGTH_OPTIONS.find(option => width * option >= grossTarget)
    : undefined
  return { usable, footprint: length ? { width, length, area: width * length } : null }
}

export function poultrySizingFromBrief(brief, notes) {
  const text = [brief, notes].filter(Boolean).join('\n')
  if (!/poultry|broiler|chicken/i.test(text) || /\b(layer|pullet|brooding|free.range)\b/i.test(brief || '')) return null
  const match = text.match(/\b(\d{1,3}(?:[ ,]\d{3})+|\d+)\s+birds(?:\s+per house)?\b/i)
  return match ? estimateBroilerSpace(match[1].replace(/[ ,]/g, '')) : null
}
