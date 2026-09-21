import { portalForHost, membershipMatchesPortal } from "./partnerPortals.mjs"
import { NextResponse } from "next/server"
import { supabaseServer } from "./supabase-server"

export async function getPartnerRequestContext(request) {
  const host = String(request.headers.get("host") || new URL(request.url).host).split(":")[0].toLowerCase()
  const portal = portalForHost(host)
  if (!portal) return { response: NextResponse.json({ error: "Live partner access is unavailable on this host." }, { status: 403 }) }
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
    .select("id, partner_id, role, status, primary_branch_id, partner_organizations!inner(id, key, name, status)")
    .eq("user_id", user.id)
    .eq("partner_organizations.key", portal.key)
    .eq("status", "active")
    .maybeSingle()

  if (membershipError) {
    return { response: NextResponse.json({ error: membershipError.message }, { status: 500 }) }
  }

  if (!membership || !membershipMatchesPortal(portal, membership.partner_organizations)) {
    return { response: NextResponse.json({ error: "No active partner access was found for this account." }, { status: 403 }) }
  }

  return { user, membership }
}
