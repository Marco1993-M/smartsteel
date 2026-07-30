import { NextResponse } from "next/server"
import { requireOsAuth } from "lib/osRouteAuth"
import { supabaseServer } from "lib/supabase-server"
import {
  ATLAS_LIPPED_CHANNEL_PROFILES,
  normalizeAtlasProfile,
} from "lib/atlasLippedChannelProfiles"
import { isSchemaMissingError } from "lib/osPhase1bData"

export const runtime = "nodejs"

export async function GET(request) {
  const authResponse = await requireOsAuth(request)
  if (authResponse) return authResponse

  const { data, error } = await supabaseServer
    .from("os_atlas_lipped_channel_profiles")
    .select("*")
    .order("web_mm")
    .order("flange_mm")
    .order("thickness_mm")

  if (error) {
    if (isSchemaMissingError(error)) {
      return NextResponse.json({
        records: ATLAS_LIPPED_CHANNEL_PROFILES,
        schemaReady: false,
      })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    records: (data || []).map(normalizeAtlasProfile),
    schemaReady: true,
  })
}

export async function PATCH(request) {
  const authResponse = await requireOsAuth(request)
  if (authResponse) return authResponse

  const body = await request.json()
  const id = String(body?.id || "").trim()
  if (!id) return NextResponse.json({ error: "Profile is required." }, { status: 400 })

  const verifiedMass =
    body?.verifiedMassKgPerM === "" || body?.verifiedMassKgPerM === null
      ? null
      : Number(body.verifiedMassKgPerM)
  if (verifiedMass !== null && (!Number.isFinite(verifiedMass) || verifiedMass <= 0)) {
    return NextResponse.json({ error: "Verified mass must be blank or greater than zero." }, { status: 400 })
  }

  const { data, error } = await supabaseServer
    .from("os_atlas_lipped_channel_profiles")
    .update({ verified_mass_kg_per_m: verifiedMass })
    .eq("id", id)
    .select("*")
    .single()

  if (error) {
    if (isSchemaMissingError(error)) {
      return NextResponse.json(
        { error: "Run the Atlas lipped-channel profile SQL before saving verified masses." },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ record: normalizeAtlasProfile(data), schemaReady: true })
}
