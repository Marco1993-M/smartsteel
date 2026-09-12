import { NextResponse } from "next/server"
import { supabaseServer } from "./supabase-server"

const OS_EMAIL_DOMAINS = (process.env.OS_ALLOWED_EMAIL_DOMAINS || "smartsteel.co.za")
  .split(",")
  .map((domain) => domain.trim().toLowerCase())
  .filter(Boolean)

function hasAllowedOsEmail(user) {
  const email = String(user?.email || "").trim().toLowerCase()
  return OS_EMAIL_DOMAINS.some((domain) => email.endsWith(`@${domain}`))
}

export async function getOsRequestContext(request) {
  const authHeader = request.headers.get("authorization") || ""

  if (!authHeader.startsWith("Bearer ")) {
    return { response: NextResponse.json({ error: "Unauthorized." }, { status: 401 }) }
  }

  const token = authHeader.slice("Bearer ".length).trim()

  if (!token) {
    return { response: NextResponse.json({ error: "Unauthorized." }, { status: 401 }) }
  }

  const {
    data: { user },
    error,
  } = await supabaseServer.auth.getUser(token)

  if (error || !user) {
    return { response: NextResponse.json({ error: "Unauthorized." }, { status: 401 }) }
  }

  // Partner identities remain partner-only even if their email happens to use an
  // internal-looking domain (for example a controlled demonstration account).
  const { data: partnerMembership, error: membershipError } = await supabaseServer
    .from("partner_memberships")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle()

  if (membershipError) {
    return { response: NextResponse.json({ error: "OS access could not be verified." }, { status: 500 }) }
  }

  if (partnerMembership || !hasAllowedOsEmail(user)) {
    return { response: NextResponse.json({ error: "Smart Steel OS access is required." }, { status: 403 }) }
  }

  return { user }
}

export async function requireOsAuth(request) {
  const context = await getOsRequestContext(request)
  return context.response || null
}
