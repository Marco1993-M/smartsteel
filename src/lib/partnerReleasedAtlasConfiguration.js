import { supabaseServer } from "./supabase-server"
import { buildPartnerSafeAtlasRelease } from "./partnerAtlasRelease"

function widthFromProductCode(productCode) {
  const match = String(productCode || "").match(/W(06|08|10|12)/i)
  return match ? Number(match[1]) : null
}

export async function resolvePartnerReleasedAtlasConfiguration({ partnerId, productReleaseId, configuration }) {
  const today = new Date().toISOString().slice(0, 10)
  const { data: product, error: productError } = await supabaseServer
    .from("partner_product_releases")
    .select("id, product_code, name, status, valid_from, valid_until")
    .eq("id", productReleaseId)
    .eq("partner_id", partnerId)
    .eq("status", "active")
    .lte("valid_from", today)
    .or(`valid_until.is.null,valid_until.gte.${today}`)
    .single()

  if (productError || !product) throw new Error("That Atlas product is not currently released to this partner.")

  const releasedWidth = widthFromProductCode(product.product_code)
  if (!releasedWidth || Number(configuration?.width) !== releasedWidth) {
    throw new Error("Choose a configuration within the released Atlas product width.")
  }

  const safeRelease = buildPartnerSafeAtlasRelease(configuration)
  const { data: priceRelease, error: priceError } = await supabaseServer
    .from("partner_price_releases")
    .select("id, source_pricing_release, status, valid_from, valid_until")
    .eq("partner_id", partnerId)
    .eq("product_release_id", product.id)
    .eq("status", "active")
    .lte("valid_from", today)
    .or(`valid_until.is.null,valid_until.gte.${today}`)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (priceError || !priceRelease) throw new Error("No approved price release is available for this Atlas product.")
  if (priceRelease.source_pricing_release !== safeRelease.sourcePricingRelease) {
    throw new Error("This configuration is waiting for a refreshed partner price release.")
  }

  return { product, priceRelease, safeRelease }
}
