import { NextResponse } from 'next/server'
import { readSolarPricing } from 'lib/solarCarportPricingServer'
import { calculateAtlasSolarCarportEstimate } from 'lib/estimates/atlasSolarCarportEstimate'
import { validateSolarEstimateInput } from 'lib/estimates/solarEstimate'
import { requireOsAuth } from 'lib/osRouteAuth'

export async function POST(request) {
  try {
    const body = await request.json()
    const input = validateSolarEstimateInput({ ...body.input, productType: 'Solar carport' })
    const release = await readSolarPricing()
    if (!release) return NextResponse.json({ error: 'Solar pricing is awaiting OS confirmation.' }, { status: 503 })
    const estimate = calculateAtlasSolarCarportEstimate({ ...input, parkingRuns: body.input?.parkingRuns }, release)
    if (body.internal) {
      const auth = await requireOsAuth(request)
      if (auth) return auth
    } else {
      estimate.lineItems = estimate.lineItems.map(({ code, label }) => ({ code, label }))
      delete estimate.pricing.baseTotal
      delete estimate.pricing.markupMultiplier
    }
    return NextResponse.json({ estimate }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) { return NextResponse.json({ error: error.message }, { status: 400 }) }
}
