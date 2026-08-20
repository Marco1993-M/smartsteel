import { NextResponse } from "next/server"
import { getPartnerRequestContext } from "lib/partnerRouteAuth"
import { resolvePartnerReleasedAtlasConfiguration } from "lib/partnerReleasedAtlasConfiguration"

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
    return NextResponse.json({
      preview: {
        configuration: resolved.safeRelease.configuration,
        reference: resolved.safeRelease.configurationReference,
        summary: resolved.safeRelease.summary,
        commercial: resolved.safeRelease.commercial,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 409 })
  }
}
