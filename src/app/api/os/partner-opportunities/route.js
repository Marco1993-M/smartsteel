import { NextResponse } from "next/server"
import { requireOsAuth } from "lib/osRouteAuth"
import { supabaseServer } from "lib/supabase-server"
import { isSchemaMissingError } from "lib/osPhase1bData"
import { calculateAtlasWarehouseEstimate } from "lib/estimates/atlasWarehouseEstimate"
import { calculateAfgriPartnerPrice } from "lib/partnerCommercialTerms"

export const runtime = "nodejs"

const REVIEW_STATUSES = ["submitted", "in_review", "quoted", "closed"]

function normalizeOpportunity(row) {
  let proposedQuote = null
  try {
    const estimate = calculateAtlasWarehouseEstimate(row.configuration || {})
    const commercialFactor = estimate.pricing.markupMultiplier || 1
    const partnerTerms = calculateAfgriPartnerPrice(estimate.pricing.estimatedTotal)
    const partnerFactor = 1 - partnerTerms.partnerAdjustmentRate
    proposedQuote = {
      amountExVat: partnerTerms.partnerPriceExVat,
      vatAmount: partnerTerms.vatAmount,
      amountInclVat: partnerTerms.partnerPriceInclVat,
      recommendedCustomerPriceExVat: partnerTerms.recommendedCustomerPriceExVat,
      partnerAdjustmentRate: partnerTerms.partnerAdjustmentRate,
      partnerAdjustmentAmount: partnerTerms.partnerAdjustmentAmount,
      structureAmountExVat: Number((estimate.pricing.steelCost * commercialFactor * partnerFactor).toFixed(2)),
      connectionsAmountExVat: Number((estimate.pricing.connectionCost * commercialFactor * partnerFactor).toFixed(2)),
      sheetingAmountExVat: Number((estimate.pricing.claddingCost * commercialFactor * partnerFactor).toFixed(2)),
      totalSteelKg: estimate.materials.totalSteelKg,
      sheetingAreaSqm: estimate.sheeting.totalSheetingArea,
      pricingRelease: estimate.meta.pricingRelease,
      sku: estimate.meta.sku,
      provisionalItems: estimate.meta.provisionalItems || [],
      inclusions: ["Atlas structural system", "Released connection allowances", "Selected sheeting scope", "Supply-only configuration"],
      exclusions: ["VAT", "Delivery", "Installation", "Foundations and concrete works", "Project-specific engineering outside the released configuration"],
    }
  } catch {
    proposedQuote = null
  }

  return {
    id: row.id,
    reference: row.reference,
    status: row.status,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerEmail: row.customer_email,
    siteLocation: row.site_location,
    configuration: row.configuration || {},
    indicativeAmountExVat: Number(row.indicative_amount_ex_vat || 0),
    partnerNotes: row.notes || "",
    internalReviewNotes: row.internal_review_notes || "",
    finalQuoteAmountExVat: row.final_quote_amount_ex_vat === null ? null : Number(row.final_quote_amount_ex_vat),
    quoteUrl: row.quote_url || "",
    partnerQuoteMessage: row.partner_quote_message || "",
    proposedQuote,
    submittedAt: row.submitted_at || "",
    quotedAt: row.quoted_at || "",
    partnerOrderStatus: row.partner_order_status || "not_ready",
    priceValidUntil: row.price_valid_until || "",
    readyForOrderAt: row.ready_for_order_at || "",
    afgriOrderReference: row.afgri_order_reference || "",
    partnerOrderNotes: row.partner_order_notes || "",
    orderSubmittedAt: row.order_submitted_at || "",
    updatedAt: row.updated_at,
    product: row.partner_product_releases
      ? {
          code: row.partner_product_releases.product_code,
          name: row.partner_product_releases.name,
          releaseVersion: row.partner_product_releases.release_version,
        }
      : null,
    partner: row.partner_organizations
      ? { key: row.partner_organizations.key, name: row.partner_organizations.name }
      : null,
  }
}

export async function GET(request) {
  const authResponse = await requireOsAuth(request)
  if (authResponse) return authResponse

  const partnerKey = String(new URL(request.url).searchParams.get("partner") || "afgri").trim().toLowerCase()
  const { data, error } = await supabaseServer
    .from("partner_opportunities")
    .select("*, partner_product_releases(product_code, name, release_version), partner_organizations!inner(key, name)")
    .eq("partner_organizations.key", partnerKey)
    .in("status", REVIEW_STATUSES)
    .order("submitted_at", { ascending: false, nullsFirst: false })
    .order("updated_at", { ascending: false })

  if (error) {
    if (isSchemaMissingError(error)) return NextResponse.json({ schemaReady: false, records: [] })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ schemaReady: true, records: (data || []).map(normalizeOpportunity) })
}

export async function PATCH(request) {
  const authResponse = await requireOsAuth(request)
  if (authResponse) return authResponse

  const body = await request.json()
  const id = String(body.id || "").trim()
  const status = String(body.status || "").trim()
  if (!id || !REVIEW_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Choose a valid opportunity and review status." }, { status: 400 })
  }

  const finalQuoteAmountExVat = body.finalQuoteAmountExVat === "" || body.finalQuoteAmountExVat === null
    ? null
    : Number(body.finalQuoteAmountExVat)
  const quoteUrl = String(body.quoteUrl || "").trim()
  if (status === "quoted" && (!Number.isFinite(finalQuoteAmountExVat) || finalQuoteAmountExVat <= 0)) {
    return NextResponse.json({ error: "Add the approved amount before returning this price to AFGRI." }, { status: 400 })
  }
  let currentOrderStatus = "not_ready"
  if (status === "closed") {
    const { data: current, error: currentError } = await supabaseServer
      .from("partner_opportunities")
      .select("partner_order_status")
      .eq("id", id)
      .single()
    if (currentError) return NextResponse.json({ error: currentError.message }, { status: 500 })
    currentOrderStatus = current?.partner_order_status || "not_ready"
    if (currentOrderStatus !== "order_submitted" && currentOrderStatus !== "acknowledged") {
      return NextResponse.json({ error: "Wait for AFGRI to submit its order reference before closing this opportunity." }, { status: 409 })
    }
  }

  const updates = {
    status,
    internal_review_notes: String(body.internalReviewNotes || "").trim(),
    final_quote_amount_ex_vat: finalQuoteAmountExVat,
    quote_url: quoteUrl,
    partner_quote_message: String(body.partnerQuoteMessage || "").trim(),
    updated_at: new Date().toISOString(),
  }
  if (status === "quoted") updates.quoted_at = new Date().toISOString()
  if (status === "quoted") {
    const validUntil = new Date()
    validUntil.setDate(validUntil.getDate() + 14)
    updates.partner_order_status = "ready_for_order"
    updates.ready_for_order_at = new Date().toISOString()
    updates.price_valid_until = validUntil.toISOString().slice(0, 10)
  }
  if (status === "closed" && currentOrderStatus === "order_submitted") updates.partner_order_status = "acknowledged"

  const { data, error } = await supabaseServer
    .from("partner_opportunities")
    .update(updates)
    .eq("id", id)
    .select("*, partner_product_releases(product_code, name, release_version), partner_organizations(key, name)")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ record: normalizeOpportunity(data) })
}
