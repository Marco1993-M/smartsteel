import { NextResponse } from "next/server"
import { requireOsAuth } from "lib/osRouteAuth"
import { supabaseServer } from "lib/supabase-server"
import { isSchemaMissingError } from "lib/osPhase1bData"
import { buildPartnerSafeAtlasRelease } from "lib/partnerAtlasRelease"

export const runtime = "nodejs"

function normalizeProductRelease(row) {
  return {
    id: row.id,
    partnerId: row.partner_id,
    productKey: row.product_key,
    productCode: row.product_code,
    name: row.name,
    category: row.category,
    sourceProductRevision: row.source_product_revision,
    releaseVersion: row.release_version,
    status: row.status,
    payload: row.release_payload,
    validFrom: row.valid_from,
    validUntil: row.valid_until || "",
    approvedBy: row.approved_by || "",
    approvedAt: row.approved_at || "",
  }
}

export async function GET(request) {
  const authResponse = await requireOsAuth(request)
  if (authResponse) return authResponse

  const partnerKey = String(new URL(request.url).searchParams.get("partner") || "afgri").trim().toLowerCase()
  const { data: partner, error: partnerError } = await supabaseServer
    .from("partner_organizations")
    .select("id, key, name, status")
    .eq("key", partnerKey)
    .single()

  if (partnerError) {
    if (isSchemaMissingError(partnerError)) return NextResponse.json({ schemaReady: false, records: [] })
    return NextResponse.json({ error: partnerError.message }, { status: 500 })
  }

  const { data, error } = await supabaseServer
    .from("partner_product_releases")
    .select("*")
    .eq("partner_id", partner.id)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const productIds = (data || []).map((row) => row.id)
  let priceMap = new Map()
  if (productIds.length) {
    const { data: prices, error: pricesError } = await supabaseServer
      .from("partner_price_releases")
      .select("id, product_release_id, configuration_key, source_pricing_release, currency, price_type, amount_ex_vat, status, valid_from, valid_until, approved_by, approved_at")
      .in("product_release_id", productIds)
      .order("created_at", { ascending: false })
    if (pricesError) return NextResponse.json({ error: pricesError.message }, { status: 500 })
    priceMap = new Map((prices || []).map((price) => [price.product_release_id, {
      id: price.id,
      configurationKey: price.configuration_key,
      sourcePricingRelease: price.source_pricing_release,
      currency: price.currency,
      priceType: price.price_type,
      amountExVat: Number(price.amount_ex_vat),
      status: price.status,
      validFrom: price.valid_from,
      validUntil: price.valid_until || "",
      approvedBy: price.approved_by || "",
      approvedAt: price.approved_at || "",
    }]))
  }

  return NextResponse.json({
    partner,
    records: (data || []).map((row) => ({ ...normalizeProductRelease(row), priceRelease: priceMap.get(row.id) || null })),
    schemaReady: true,
  })
}

export async function POST(request) {
  const authResponse = await requireOsAuth(request)
  if (authResponse) return authResponse

  const body = await request.json()
  const partnerKey = String(body.partnerKey || "afgri").trim().toLowerCase()
  const approvedBy = String(body.approvedBy || "").trim()
  const validFrom = body.validFrom || new Date().toISOString().slice(0, 10)
  const validUntil = body.validUntil || null
  if (!approvedBy) return NextResponse.json({ error: "Record who approved this partner release." }, { status: 400 })

  let safeRelease
  try {
    safeRelease = buildPartnerSafeAtlasRelease(body.configuration || {})
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  const { data: partner, error: partnerError } = await supabaseServer
    .from("partner_organizations")
    .select("id")
    .eq("key", partnerKey)
    .single()
  if (partnerError) {
    if (isSchemaMissingError(partnerError)) return NextResponse.json({ error: "Run the partner release foundation SQL first." }, { status: 409 })
    return NextResponse.json({ error: partnerError.message }, { status: 500 })
  }

  const { data: latest } = await supabaseServer
    .from("partner_product_releases")
    .select("release_version")
    .eq("partner_id", partner.id)
    .eq("product_code", safeRelease.productCode)
    .order("release_version", { ascending: false })
    .limit(1)
    .maybeSingle()
  const releaseVersion = Number(latest?.release_version || 0) + 1
  const now = new Date().toISOString()

  const productPayload = {
    releaseVersion: safeRelease.releaseVersion,
    productKey: safeRelease.productKey,
    productCode: safeRelease.productCode,
    sku: safeRelease.sku,
    familyCode: safeRelease.familyCode,
    name: safeRelease.summary.product,
    category: "Atlas Warehouses",
    summary: safeRelease.summary,
    inclusions: safeRelease.inclusions,
    exclusions: safeRelease.exclusions,
  }
  const { data: productRelease, error: productError } = await supabaseServer
    .from("partner_product_releases")
    .insert([{
      partner_id: partner.id,
      product_key: safeRelease.productKey,
      product_code: safeRelease.productCode,
      name: safeRelease.summary.product,
      category: "Atlas Warehouses",
      source_product_revision: `atlas-configuration-v${safeRelease.releaseVersion}`,
      release_version: releaseVersion,
      status: "active",
      release_payload: productPayload,
      valid_from: validFrom,
      valid_until: validUntil,
      approved_by: approvedBy,
      approved_at: now,
    }])
    .select("*")
    .single()
  if (productError) return NextResponse.json({ error: productError.message }, { status: 500 })

  const { data: priceRelease, error: priceError } = await supabaseServer
    .from("partner_price_releases")
    .insert([{
      partner_id: partner.id,
      product_release_id: productRelease.id,
      configuration_key: safeRelease.configurationReference,
      source_pricing_release: safeRelease.sourcePricingRelease,
      currency: safeRelease.commercial.currency,
      price_type: safeRelease.commercial.priceType,
      amount_ex_vat: safeRelease.commercial.amountExVat,
      pricing_payload: {
        configuration: safeRelease.configuration,
        summary: safeRelease.summary,
        commercial: safeRelease.commercial,
      },
      status: "active",
      valid_from: validFrom,
      valid_until: validUntil,
      approved_by: approvedBy,
      approved_at: now,
    }])
    .select("id, configuration_key, source_pricing_release, amount_ex_vat, status, valid_from, valid_until")
    .single()

  if (priceError) {
    await supabaseServer.from("partner_product_releases").delete().eq("id", productRelease.id)
    return NextResponse.json({ error: priceError.message }, { status: 500 })
  }

  return NextResponse.json({ productRelease: normalizeProductRelease(productRelease), priceRelease })
}
