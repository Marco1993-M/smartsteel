import { NextResponse } from "next/server"
import { getPartnerRequestContext } from "lib/partnerRouteAuth"
import { resolvePartnerReleasedAtlasConfiguration } from "lib/partnerReleasedAtlasConfiguration"

import { buildPartnerSafeAtlasRelease } from "lib/partnerAtlasRelease"
import { ATLAS_WAREHOUSE_STEEL_FINISH_OPTIONS } from "lib/estimates/atlasWarehouseOptions"

export const runtime = "nodejs"

export async function POST(request) {
  const context = await getPartnerRequestContext(request)
  if (context.response) return context.response

  try {
    const body = await request.json()
    const resolved = await resolvePartnerReleasedAtlasConfiguration({
      partnerId: context.membership.partner_id,
      productReleaseId: String(body.productReleaseId || "").trim(),
      configuration: body.configuration || {},
    })
    const steelPrices = Object.fromEntries(ATLAS_WAREHOUSE_STEEL_FINISH_OPTIONS.map(steelFinish => {
      const option = steelFinish === resolved.safeRelease.configuration.steelFinish
        ? resolved.safeRelease
        : buildPartnerSafeAtlasRelease({ ...resolved.safeRelease.configuration, steelFinish })
      return [steelFinish, option.commercial.amountExVat]
    }))
    return NextResponse.json({
      preview: {
        configuration: resolved.safeRelease.configuration,
        sku: resolved.safeRelease.sku,
        familyCode: resolved.safeRelease.familyCode,
        productName: resolved.safeRelease.productName,
        lineItem: resolved.safeRelease.lineItem,
        reference: resolved.safeRelease.configurationReference,
        summary: resolved.safeRelease.summary,
        commercial: resolved.safeRelease.commercial,
        steelPrices,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 409 })
  }
}
