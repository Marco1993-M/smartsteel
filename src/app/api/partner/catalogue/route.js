import { NextResponse } from "next/server"
import { getPartnerRequestContext } from "lib/partnerRouteAuth"
import { supabaseServer } from "lib/supabase-server"

export const runtime = "nodejs"

export async function GET(request) {
  const context = await getPartnerRequestContext(request)
  if (context.response) return context.response

  const today = new Date().toISOString().slice(0, 10)
  const partnerId = context.membership.partner_id
  const { data: products, error: productError } = await supabaseServer
    .from("partner_product_releases")
    .select("id, product_code, name, category, release_payload, valid_from, valid_until")
    .eq("partner_id", partnerId)
    .eq("status", "active")
    .lte("valid_from", today)
    .or(`valid_until.is.null,valid_until.gte.${today}`)
    .order("name")

  if (productError) return NextResponse.json({ error: productError.message }, { status: 500 })

  const productIds = (products || []).map((product) => product.id)
  const { data: prices, error: priceError } = productIds.length
    ? await supabaseServer
        .from("partner_price_releases")
        .select("id, product_release_id, configuration_key, currency, amount_ex_vat, valid_until")
        .in("product_release_id", productIds)
        .eq("status", "active")
        .lte("valid_from", today)
        .or(`valid_until.is.null,valid_until.gte.${today}`)
    : { data: [], error: null }

  if (priceError) return NextResponse.json({ error: priceError.message }, { status: 500 })
  const pricesByProduct = new Map((prices || []).map((price) => [price.product_release_id, price]))

  return NextResponse.json({
    products: (products || []).map((product) => ({
      id: product.id,
      productCode: product.product_code,
      sku: product.release_payload?.sku || product.product_code,
      familyCode: product.release_payload?.familyCode || product.release_payload?.configuration?.familyCode || "",
      name: product.name,
      category: product.category,
      summary: product.release_payload?.summary || {},
      inclusions: product.release_payload?.inclusions || [],
      exclusions: product.release_payload?.exclusions || [],
      validUntil: product.valid_until || "",
      price: pricesByProduct.get(product.id) || null,
    })),
  })
}
