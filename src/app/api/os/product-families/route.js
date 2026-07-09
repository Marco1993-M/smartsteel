import { NextResponse } from "next/server"
import { requireOsAuth } from "lib/osRouteAuth"
import { supabaseServer } from "lib/supabase-server"
import {
  createRecordKey,
  getFallbackProductFamilies,
  isSchemaMissingError,
  PRODUCT_FAMILY_STATUS_OPTIONS,
} from "lib/osPhase1bData"

export const runtime = "nodejs"

function normalizeFamily(row) {
  return {
    id: row.id,
    platformKey: row.platform_key,
    key: row.key,
    name: row.name,
    summary: row.summary || "",
    status: row.status || "draft",
    owner: row.owner || "",
    quoteReady: Boolean(row.quote_ready),
    sortOrder: row.sort_order || 0,
    sampleProducts: Array.isArray(row.metadata?.sampleProducts) ? row.metadata.sampleProducts : [],
    metadata: row.metadata || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function GET(request) {
  const authResponse = await requireOsAuth(request)
  if (authResponse) {
    return authResponse
  }

  const { searchParams } = new URL(request.url)
  const platformKey = String(searchParams.get("platform") || "").trim().toLowerCase()

  if (!platformKey) {
    return NextResponse.json({ error: "Platform is required." }, { status: 400 })
  }

  const { data, error } = await supabaseServer
    .from("product_families")
    .select("*")
    .eq("platform_key", platformKey)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true })

  if (error) {
    if (isSchemaMissingError(error)) {
      return NextResponse.json({
        records: getFallbackProductFamilies(platformKey),
        schemaReady: false,
      })
    }

    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    records: (data || []).map(normalizeFamily),
    schemaReady: true,
  })
}

export async function POST(request) {
  const authResponse = await requireOsAuth(request)
  if (authResponse) {
    return authResponse
  }

  const body = await request.json()
  const platformKey = String(body?.platformKey || "").trim().toLowerCase()
  const name = String(body?.name || "").trim()

  if (!platformKey || !name) {
    return NextResponse.json({ error: "Platform and family name are required." }, { status: 400 })
  }

  const status = PRODUCT_FAMILY_STATUS_OPTIONS.includes(body?.status) ? body.status : "draft"
  const sampleProducts = Array.isArray(body?.sampleProducts)
    ? body.sampleProducts.filter(Boolean)
    : String(body?.sampleProducts || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)

  const payload = {
    platform_key: platformKey,
    key: createRecordKey(body?.key || name),
    name,
    summary: String(body?.summary || "").trim(),
    owner: String(body?.owner || "").trim(),
    status,
    quote_ready: Boolean(body?.quoteReady),
    metadata: {
      sampleProducts,
    },
  }

  const { data, error } = await supabaseServer.from("product_families").insert([payload]).select().single()

  if (error) {
    if (isSchemaMissingError(error)) {
      return NextResponse.json(
        { error: "Run the Smart Steel OS Phase 1B SQL before adding live product-family records." },
        { status: 409 }
      )
    }

    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ record: normalizeFamily(data) })
}

export async function PATCH(request) {
  const authResponse = await requireOsAuth(request)
  if (authResponse) {
    return authResponse
  }

  const body = await request.json()
  const id = String(body?.id || "").trim()

  if (!id) {
    return NextResponse.json({ error: "Record id is required." }, { status: 400 })
  }

  const updatePayload = {}

  if (typeof body?.quoteReady === "boolean") {
    updatePayload.quote_ready = body.quoteReady
  }

  if (body?.status && PRODUCT_FAMILY_STATUS_OPTIONS.includes(body.status)) {
    updatePayload.status = body.status
  }

  if (Object.keys(updatePayload).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 })
  }

  const { data, error } = await supabaseServer
    .from("product_families")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    if (isSchemaMissingError(error)) {
      return NextResponse.json(
        { error: "Run the Smart Steel OS Phase 1B SQL before updating live product-family records." },
        { status: 409 }
      )
    }

    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ record: normalizeFamily(data) })
}
