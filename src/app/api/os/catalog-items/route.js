import { NextResponse } from "next/server"
import { requireOsAuth } from "lib/osRouteAuth"
import { supabaseServer } from "lib/supabase-server"
import {
  CATALOG_ITEM_KIND_OPTIONS,
  CATALOG_ITEM_STATUS_OPTIONS,
  getFallbackCatalogItems,
  isSchemaMissingError,
} from "lib/osPhase1bData"

export const runtime = "nodejs"

function normalizeCatalogItem(row) {
  return {
    id: row.id,
    platformKey: row.platform_key,
    kind: row.kind,
    category: row.category || "",
    title: row.title,
    summary: row.summary || "",
    status: row.status || "draft",
    owner: row.owner || "",
    productFamilyId: row.product_family_id || null,
    productFamilyKey: row.product_families?.key || null,
    productFamilyName: row.product_families?.name || "Unlinked",
    tags: Array.isArray(row.metadata?.tags) ? row.metadata.tags : [],
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
  const kind = String(searchParams.get("kind") || "").trim().toLowerCase()

  if (!platformKey || !kind) {
    return NextResponse.json({ error: "Platform and kind are required." }, { status: 400 })
  }

  const { data, error } = await supabaseServer
    .from("os_catalog_items")
    .select("*, product_families(id, key, name)")
    .eq("platform_key", platformKey)
    .eq("kind", kind)
    .order("category", { ascending: true })
    .order("title", { ascending: true })

  if (error) {
    if (isSchemaMissingError(error)) {
      return NextResponse.json({
        records: getFallbackCatalogItems(platformKey, kind),
        schemaReady: false,
      })
    }

    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    records: (data || []).map(normalizeCatalogItem),
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
  const kind = String(body?.kind || "").trim().toLowerCase()
  const title = String(body?.title || "").trim()

  if (!platformKey || !kind || !title) {
    return NextResponse.json({ error: "Platform, kind, and title are required." }, { status: 400 })
  }

  if (!CATALOG_ITEM_KIND_OPTIONS.includes(kind)) {
    return NextResponse.json({ error: "Unsupported item kind." }, { status: 400 })
  }

  const status = CATALOG_ITEM_STATUS_OPTIONS.includes(body?.status) ? body.status : "draft"
  const tags = Array.isArray(body?.tags)
    ? body.tags.filter(Boolean)
    : String(body?.tags || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)

  const payload = {
    platform_key: platformKey,
    kind,
    category: String(body?.category || "").trim() || null,
    title,
    summary: String(body?.summary || "").trim() || null,
    status,
    owner: String(body?.owner || "").trim() || null,
    product_family_id: body?.productFamilyId || null,
    metadata: {
      tags,
    },
  }

  const { data, error } = await supabaseServer
    .from("os_catalog_items")
    .insert([payload])
    .select("*, product_families(id, key, name)")
    .single()

  if (error) {
    if (isSchemaMissingError(error)) {
      return NextResponse.json(
        { error: "Run the Smart Steel OS Phase 1B SQL before adding live catalog records." },
        { status: 409 }
      )
    }

    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ record: normalizeCatalogItem(data) })
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

  if (body?.status && CATALOG_ITEM_STATUS_OPTIONS.includes(body.status)) {
    updatePayload.status = body.status
  }

  if (Object.keys(updatePayload).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 })
  }

  const { data, error } = await supabaseServer
    .from("os_catalog_items")
    .update(updatePayload)
    .eq("id", id)
    .select("*, product_families(id, key, name)")
    .single()

  if (error) {
    if (isSchemaMissingError(error)) {
      return NextResponse.json(
        { error: "Run the Smart Steel OS Phase 1B SQL before updating live catalog records." },
        { status: 409 }
      )
    }

    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ record: normalizeCatalogItem(data) })
}
