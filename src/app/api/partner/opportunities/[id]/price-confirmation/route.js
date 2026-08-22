import { NextResponse } from "next/server"
import { getPartnerRequestContext } from "lib/partnerRouteAuth"
import { createPartnerPriceConfirmationPdf } from "lib/partnerPriceConfirmation"
import { supabaseServer } from "lib/supabase-server"

export const runtime = "nodejs"
export const maxDuration = 60

export async function GET(request, { params }) {
  const context = await getPartnerRequestContext(request)
  if (context.response) return context.response
  const { id } = await params

  let query = supabaseServer.from("partner_opportunities").select("*").eq("id", id).eq("partner_id", context.membership.partner_id)
  if (context.membership.role === "salesperson") query = query.eq("membership_id", context.membership.id)
  const { data, error } = await query.maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: "Price confirmation not found." }, { status: 404 })

  try {
    const pdf = await createPartnerPriceConfirmationPdf(data)
    return new NextResponse(pdf, { headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="AFGRI-Atlas-${data.reference}-price-confirmation.pdf"`, "Cache-Control": "private, no-store" } })
  } catch (documentError) {
    return NextResponse.json({ error: documentError.message }, { status: 409 })
  }
}
