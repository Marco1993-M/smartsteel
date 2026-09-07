import { createClient } from '@supabase/supabase-js'
import { SOLAR_COST_DEFAULTS } from '../src/lib/estimates/atlasSolarCarportEstimate.js'

const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
const title = 'Atlas Solar Carport Pricing Release'
const { data, error } = await client.from('os_catalog_items').select('id,metadata').eq('platform_key', 'atlas').eq('kind', 'module').eq('title', title).maybeSingle()
if (error) throw error
if (data) {
  const current = data.metadata?.solarPricing || {}
  const costs = { ...SOLAR_COST_DEFAULTS, ...(current.costs || {}) }
  const hasAllRates = Object.keys(SOLAR_COST_DEFAULTS).every(key => current.costs?.[key] !== undefined)
  if (hasAllRates) console.log('Existing OS solar pricing preserved.')
  else {
    const release = { ...current, costs, revision: Number(current.revision || 0) + 1, savedAt: new Date().toISOString(), provisionalAllowances: true }
    const { error: updateError } = await client.from('os_catalog_items').update({ metadata: { ...(data.metadata || {}), previousRelease: current, solarPricing: release } }).eq('id', data.id)
    if (updateError) throw updateError
    console.log(`OS solar pricing revision ${release.revision} migrated with explicit bracket, bolt and anchor rates.`)
  }
}
else {
  const { error: insertError } = await client.from('os_catalog_items').insert({
    platform_key: 'atlas', kind: 'module', title, category: 'Solar pricing', status: 'active',
    metadata: { solarPricing: { costs: SOLAR_COST_DEFAULTS, revision: 1, savedAt: new Date().toISOString(), provisionalAllowances: true } },
  })
  if (insertError) throw insertError
  console.log('OS solar pricing revision 1 initialised with approved provisional allowances and 40% uplift.')
}
