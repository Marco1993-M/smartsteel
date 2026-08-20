import { NextResponse } from "next/server"
import { supabaseServer } from "./supabase-server"

export async function getPartnerRequestContext(request) {
  const authHeader = request.headers.get("authorization") || ""
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : ""

  if (!token) {
    return { response: NextResponse.json({ error: "Unauthorized." }, { status: 401 }) }
  }

  const {
    data: { user },
    error: userError,
  } = await supabaseServer.auth.getUser(token)

  if (userError || !user) {
    return { response: NextResponse.json({ error: "Unauthorized." }, { status: 401 }) }
  }

  const { data: membership, error: membershipError } = await supabaseServer
    .from("partner_memberships")
    .select("id, partner_id, role, status, primary_branch_id, partner_organizations(id, key, name, status)")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle()

  if (membershipError) {
    return { response: NextResponse.json({ error: membershipError.message }, { status: 500 }) }
  }

  if (!membership || membership.partner_organizations?.status === "inactive") {
    return { response: NextResponse.json({ error: "No active partner access was found for this account." }, { status: 403 }) }
  }

  return { user, membership }
}
