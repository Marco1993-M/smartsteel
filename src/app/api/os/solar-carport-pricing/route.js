import { NextResponse } from 'next/server'
import { requireOsAuth } from 'lib/osRouteAuth'
import { supabaseServer } from 'lib/supabase-server'
import { readSolarPricing, SOLAR_PRICING_TITLE, validateSolarCosts } from 'lib/solarCarportPricingServer'
import { SOLAR_COST_DEFAULTS } from 'lib/estimates/atlasSolarCarportEstimate'

export const dynamic = 'force-dynamic'
export async function GET(request) {
  const auth = await requireOsAuth(request)
  if (auth) return auth
  try { return NextResponse.json({ release: await readSolarPricing(), defaults: SOLAR_COST_DEFAULTS }, { headers: { 'Cache-Control': 'no-store' } }) }
  catch (error) { return NextResponse.json({ error: error.message }, { status: 503 }) }
}
export async function PUT(request) {
  const auth = await requireOsAuth(request)
  if (auth) return auth
  try {
    const body = await request.json()
    const costs = validateSolarCosts(body.costs)
    const existing = await readSolarPricing()
    if ((existing?.revision || 0) !== body.revision) return NextResponse.json({ error: 'Pricing changed. Reload before saving.' }, { status: 409 })
    const release = { costs, revision: (existing?.revision || 0) + 1, savedAt: new Date().toISOString(), provisionalAllowances: true }
    const metadata = { solarPricing: release, previousRelease: existing }
    const query = existing
      ? supabaseServer.from('os_catalog_items').update({ metadata }).eq('id', existing.id).eq('metadata->solarPricing->>revision', String(existing.revision))
      : supabaseServer.from('os_catalog_items').insert({ platform_key: 'atlas', kind: 'module', title: SOLAR_PRICING_TITLE, category: 'Solar pricing', status: 'active', metadata })
    const { data, error } = await query.select('id').single()
    if (error || !data) return NextResponse.json({ error: 'Could not save pricing. Reload and retry.' }, { status: 409 })
    return NextResponse.json({ release })
  } catch (error) { return NextResponse.json({ error: error.message }, { status: 400 }) }
}
