import { NextResponse } from "next/server"
import { requireOsAuth } from "lib/osRouteAuth"
import { supabaseServer } from "lib/supabase-server"
import { ATLAS_BOLT_OPTIONS, normalizeAtlasFastener } from "lib/atlasFasteners"
import { isSchemaMissingError } from "lib/osPhase1bData"

export const runtime = "nodejs"

export async function GET(request) {
  const authResponse = await requireOsAuth(request)
  if (authResponse) return authResponse

  const { data, error } = await supabaseServer
    .from("os_atlas_fasteners")
    .select("*")
    .eq("fastener_type", "bolt")
    .order("diameter_mm")
    .order("length_mm")

  if (error) {
    if (isSchemaMissingError(error)) {
      return NextResponse.json({
        records: ATLAS_BOLT_OPTIONS,
        schemaReady: false,
      })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    records: (data || []).map(normalizeAtlasFastener),
    schemaReady: true,
  })
}
