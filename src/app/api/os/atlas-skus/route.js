import { NextResponse } from "next/server"
import { getAtlasW08SkuRegistry } from "lib/atlasSkuRegistry"
import { isSchemaMissingError } from "lib/osPhase1bData"
import { requireOsAuth } from "lib/osRouteAuth"
import { supabaseServer } from "lib/supabase-server"

export const runtime = "nodejs"

function normalize(row) {
  return {
    id: row.id || row.sku,
    sku: row.sku,
    familyCode: row.family_code || row.familyCode,
    productName: row.product_name || row.productName,
    description: row.description,
    status: row.status,
    pricingRelease: row.pricing_release || row.pricingRelease,
    registryVersion: Number(row.registry_version || row.registryVersion || 1),
    configuration: row.configuration || {},
  }
}

export async function GET(request) {
  const authResponse = await requireOsAuth(request)
  if (authResponse) return authResponse
  const family = String(new URL(request.url).searchParams.get("family") || "W08").toUpperCase()
  const fallback = getAtlasW08SkuRegistry().filter((record) => record.familyCode === family).map(normalize)
  const { data, error } = await supabaseServer
    .from("os_atlas_sku_registry")
    .select("*")
    .eq("family_code", family)
    .order("sku")

  if (error) {
    if (isSchemaMissingError(error)) return NextResponse.json({ schemaReady: false, records: fallback })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ schemaReady: true, records: (data || []).map(normalize) })
}
