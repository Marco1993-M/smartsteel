import { NextResponse } from "next/server"
import { getPartnerRequestContext } from "lib/partnerRouteAuth"
import { supabaseServer } from "lib/supabase-server"
import { resolvePartnerReleasedAtlasConfiguration } from "lib/partnerReleasedAtlasConfiguration"

export const runtime = "nodejs"

function makeReference() {
  return `AF-${new Date().toISOString().slice(2, 10).replaceAll("-", "")}-${crypto.randomUUID().slice(0, 5).toUpperCase()}`
}

export async function GET(request) {
  const context = await getPartnerRequestContext(request)
  if (context.response) return context.response

  let query = supabaseServer
    .from("partner_opportunities")
    .select("id, reference, status, customer_name, customer_phone, customer_email, site_location, configuration, indicative_amount_ex_vat, notes, product_release_id, final_quote_amount_ex_vat, quote_url, partner_quote_message, quoted_at, updated_at")
    .eq("partner_id", context.membership.partner_id)
    .order("updated_at", { ascending: false })

  if (context.membership.role === "salesperson") query = query.eq("membership_id", context.membership.id)
  const { data, error } = await query.limit(50)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ opportunities: data || [] })
}

export async function POST(request) {
  const context = await getPartnerRequestContext(request)
  if (context.response) return context.response

  const body = await request.json()
  const customerName = String(body.customerName || "").trim()
  const productReleaseId = String(body.productReleaseId || "").trim()
  if (!customerName || !productReleaseId) {
    return NextResponse.json({ error: "Add the customer name and choose a released product." }, { status: 400 })
  }

  let resolved
  try {
    resolved = await resolvePartnerReleasedAtlasConfiguration({
      partnerId: context.membership.partner_id,
      productReleaseId,
      configuration: body.configuration || {},
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 409 })
  }

  const status = body.submit ? "submitted" : "draft"
  const { data, error } = await supabaseServer
    .from("partner_opportunities")
    .insert([{
      partner_id: context.membership.partner_id,
      membership_id: context.membership.id,
      product_release_id: productReleaseId,
      price_release_id: resolved.priceRelease.id,
      reference: makeReference(),
      status,
      customer_name: customerName,
      customer_phone: String(body.customerPhone || "").trim(),
      customer_email: String(body.customerEmail || "").trim(),
      site_location: String(body.siteLocation || "").trim(),
      configuration: resolved.safeRelease.configuration,
      indicative_amount_ex_vat: resolved.safeRelease.commercial.amountExVat,
      notes: String(body.notes || "").trim(),
      submitted_at: body.submit ? new Date().toISOString() : null,
    }])
    .select("id, reference, status")
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ opportunity: data })
}

export async function PATCH(request) {
  const context = await getPartnerRequestContext(request)
  if (context.response) return context.response

  const body = await request.json()
  const id = String(body.id || "").trim()
  const customerName = String(body.customerName || "").trim()
  if (!id || !customerName) return NextResponse.json({ error: "Add the customer name before saving." }, { status: 400 })

  const { data: existing, error: existingError } = await supabaseServer
    .from("partner_opportunities")
    .select("id, product_release_id, status")
    .eq("id", id)
    .eq("partner_id", context.membership.partner_id)
    .eq("membership_id", context.membership.id)
    .single()
  if (existingError || !existing) return NextResponse.json({ error: "That draft could not be found." }, { status: 404 })
  if (existing.status !== "draft") return NextResponse.json({ error: "Submitted opportunities can no longer be edited." }, { status: 409 })

  let resolved
  try {
    resolved = await resolvePartnerReleasedAtlasConfiguration({
      partnerId: context.membership.partner_id,
      productReleaseId: existing.product_release_id,
      configuration: body.configuration || {},
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 409 })
  }

  const status = body.submit ? "submitted" : "draft"
  const { data, error } = await supabaseServer
    .from("partner_opportunities")
    .update({
      price_release_id: resolved.priceRelease.id,
      status,
      customer_name: customerName,
      customer_phone: String(body.customerPhone || "").trim(),
      customer_email: String(body.customerEmail || "").trim(),
      site_location: String(body.siteLocation || "").trim(),
      configuration: resolved.safeRelease.configuration,
      indicative_amount_ex_vat: resolved.safeRelease.commercial.amountExVat,
      notes: String(body.notes || "").trim(),
      submitted_at: body.submit ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", existing.id)
    .select("id, reference, status")
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ opportunity: data })
}
