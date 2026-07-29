import { NextResponse } from "next/server"
import { requireOsAuth } from "lib/osRouteAuth"
import { supabaseServer } from "lib/supabase-server"
import { AFGRI_BRANCHES, normalizePartnerBranch } from "lib/afgriBranches"
import { isSchemaMissingError } from "lib/osPhase1bData"

export const runtime = "nodejs"

const BRANCH_STATUSES = ["active", "pilot", "paused", "inactive"]

export async function GET(request) {
  const authResponse = await requireOsAuth(request)
  if (authResponse) return authResponse

  const partnerKey = new URL(request.url).searchParams.get("partnerKey") || "afgri"
  const { data, error } = await supabaseServer
    .from("os_partner_branches")
    .select("*")
    .eq("partner_key", partnerKey)
    .order("name", { ascending: true })

  if (error) {
    if (isSchemaMissingError(error)) {
      const fallback = AFGRI_BRANCHES.filter((branch) => branch.partnerKey === partnerKey)
      return NextResponse.json({ records: fallback, schemaReady: false })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    records: (data || []).map(normalizePartnerBranch),
    schemaReady: true,
  })
}

export async function PATCH(request) {
  const authResponse = await requireOsAuth(request)
  if (authResponse) return authResponse

  const body = await request.json()
  const id = String(body?.id || "").trim()
  const status = String(body?.status || "").trim()
  if (!id || !BRANCH_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Choose a valid branch and status." }, { status: 400 })
  }

  const latitude = body?.latitude === null || body?.latitude === "" ? null : Number(body.latitude)
  const longitude = body?.longitude === null || body?.longitude === "" ? null : Number(body.longitude)
  if (
    (latitude !== null && (!Number.isFinite(latitude) || latitude < -90 || latitude > 90)) ||
    (longitude !== null && (!Number.isFinite(longitude) || longitude < -180 || longitude > 180))
  ) {
    return NextResponse.json({ error: "Enter valid latitude and longitude values." }, { status: 400 })
  }

  const { data, error } = await supabaseServer
    .from("os_partner_branches")
    .update({
      status,
      territory: String(body?.territory || "").trim() || null,
      delivery_zone: String(body?.deliveryZone || "").trim() || null,
      contact_name: String(body?.contactName || "").trim() || null,
      contact_email: String(body?.contactEmail || "").trim() || null,
      contact_phone: String(body?.contactPhone || "").trim() || null,
      notes: String(body?.notes || "").trim() || null,
      latitude,
      longitude,
      coordinate_status: latitude === null || longitude === null ? "needs_review" : "verified",
    })
    .eq("id", id)
    .select("*")
    .single()

  if (error) {
    if (isSchemaMissingError(error)) {
      return NextResponse.json(
        { error: "Run the AFGRI partner branch SQL before saving shared branch updates." },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ record: normalizePartnerBranch(data), schemaReady: true })
}
