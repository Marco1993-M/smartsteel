import 'server-only'
import { supabaseServer } from './supabase-server'
import { SOLAR_COST_DEFAULTS } from './estimates/atlasSolarCarportEstimate.js'

export const SOLAR_PRICING_TITLE = 'Atlas Solar Carport Pricing Release'
export async function readSolarPricing() {
  const { data, error } = await supabaseServer.from('os_catalog_items').select('id,metadata,updated_at')
    .eq('platform_key', 'atlas').eq('kind', 'module').eq('title', SOLAR_PRICING_TITLE).maybeSingle()
  if (error) throw new Error('Could not load OS solar pricing.')
  if (!data?.metadata?.solarPricing) return null
  return {
    ...data.metadata.solarPricing,
    costs: { ...SOLAR_COST_DEFAULTS, ...data.metadata.solarPricing.costs },
    id: data.id,
  }
}
export function validateSolarCosts(costs) {
  const result = {}
  for (const key of Object.keys(SOLAR_COST_DEFAULTS)) {
    const value = costs?.[key]
    if (value === '' || value == null || !Number.isFinite(Number(value)) || Number(value) < 0) throw new Error(`Invalid ${key}`)
    result[key] = Number(value)
  }
  if (result.zamRatePerTon <= 0) throw new Error('ZAM rate must be greater than zero.')
  return result
}
