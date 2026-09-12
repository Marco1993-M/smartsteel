import { NextResponse } from "next/server"
import { requireOsAuth } from "lib/osRouteAuth"
import { supabaseServer } from "lib/supabase-server"

export const runtime = "nodejs"

export async function GET(request) {
  const authResponse = await requireOsAuth(request)
  if (authResponse) return authResponse

  const { count, error } = await supabaseServer
    .from("partner_opportunities")
    .select("id", { count: "exact", head: true })
    .eq("status", "submitted")

  if (error) {
    return NextResponse.json({ error: "Partner notifications could not be loaded." }, { status: 500 })
  }

  return NextResponse.json({ newOpportunityCount: count || 0 })
}
