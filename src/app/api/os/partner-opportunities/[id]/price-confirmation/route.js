import { portalForKey } from "lib/partnerPortals.mjs"
import { NextResponse } from "next/server"
import { requireOsAuth } from "lib/osRouteAuth"
import { createPartnerPriceConfirmationPdf } from "lib/partnerPriceConfirmation"
import { supabaseServer } from "lib/supabase-server"

export const runtime = "nodejs"
export const maxDuration = 60

export async function GET(request, { params }) {
  const authResponse = await requireOsAuth(request)
  if (authResponse) return authResponse
  const { id } = await params
  const { data, error } = await supabaseServer.from("partner_opportunities").select("*").eq("id", id).maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: "Price confirmation not found." }, { status: 404 })

  try {
    const { data: organization, error: organizationError } = await supabaseServer.from("partner_organizations").select("key").eq("id", data.partner_id).single()
    if (organizationError) throw new Error("Partner branding could not be loaded.")
    const portal = portalForKey(organization.key)
    const pdf = await createPartnerPriceConfirmationPdf(data, portal)
    return new NextResponse(pdf, { headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="${portal.name}-Atlas-${data.reference}-price-confirmation.pdf"`, "Cache-Control": "private, no-store" } })
  } catch (documentError) {
    return NextResponse.json({ error: documentError.message }, { status: 409 })
  }
}
