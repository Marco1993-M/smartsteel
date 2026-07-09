import { NextResponse } from "next/server"
import { requireOsAuth } from "lib/osRouteAuth"
import { supabaseServer } from "lib/supabase-server"
import {
  DOCUMENT_STATUS_OPTIONS,
  DOCUMENT_TYPE_OPTIONS,
  getFallbackDocuments,
  isSchemaMissingError,
} from "lib/osPhase1bData"

export const runtime = "nodejs"

function normalizeDocument(row) {
  return {
    id: row.id,
    platformKey: row.platform_key,
    title: row.title,
    documentType: row.document_type,
    status: row.status,
    revisionCode: row.revision_code || "",
    owner: row.owner || "",
    clientVisible: Boolean(row.client_visible),
    reviewDueAt: row.review_due_at,
    lastSentAt: row.last_sent_at,
    notes: row.notes || "",
    productFamilyId: row.product_family_id || null,
    productFamilyKey: row.product_families?.key || null,
    productFamilyName: row.product_families?.name || "Unlinked",
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
    .from("os_documents")
    .select("*, product_families(id, key, name)")
    .eq("platform_key", platformKey)
    .order("updated_at", { ascending: false })

  if (error) {
    if (isSchemaMissingError(error)) {
      return NextResponse.json({
        records: getFallbackDocuments(platformKey),
        schemaReady: false,
      })
    }

    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    records: (data || []).map(normalizeDocument),
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
  const title = String(body?.title || "").trim()

  if (!platformKey || !title) {
    return NextResponse.json({ error: "Platform and title are required." }, { status: 400 })
  }

  const documentType = DOCUMENT_TYPE_OPTIONS.includes(body?.documentType)
    ? body.documentType
    : "scope_reference"
  const status = DOCUMENT_STATUS_OPTIONS.includes(body?.status) ? body.status : "draft"

  const payload = {
    platform_key: platformKey,
    product_family_id: body?.productFamilyId || null,
    title,
    document_type: documentType,
    status,
    revision_code: String(body?.revisionCode || "").trim() || null,
    owner: String(body?.owner || "").trim() || null,
    client_visible: Boolean(body?.clientVisible),
    review_due_at: body?.reviewDueAt || null,
    notes: String(body?.notes || "").trim() || null,
  }

  const { data, error } = await supabaseServer
    .from("os_documents")
    .insert([payload])
    .select("*, product_families(id, key, name)")
    .single()

  if (error) {
    if (isSchemaMissingError(error)) {
      return NextResponse.json(
        { error: "Run the Smart Steel OS Phase 1B SQL before adding live document records." },
        { status: 409 }
      )
    }

    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ record: normalizeDocument(data) })
}

export async function PATCH(request) {
  const authResponse = await requireOsAuth(request)
  if (authResponse) {
    return authResponse
  }

  const body = await request.json()
  const id = String(body?.id || "").trim()

  if (!id) {
    return NextResponse.json({ error: "Document id is required." }, { status: 400 })
  }

  const action = String(body?.action || "").trim()
  const updatePayload = {}

  if (action === "mark_reviewed") {
    updatePayload.status = "reviewed"
  } else if (action === "mark_sent") {
    updatePayload.status = "issued"
    updatePayload.last_sent_at = new Date().toISOString()
  } else if (action === "needs_review") {
    updatePayload.status = "needs_review"
  }

  if (body?.status && DOCUMENT_STATUS_OPTIONS.includes(body.status)) {
    updatePayload.status = body.status
  }

  if (Object.prototype.hasOwnProperty.call(body || {}, "reviewDueAt")) {
    updatePayload.review_due_at = body.reviewDueAt || null
  }

  if (Object.keys(updatePayload).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 })
  }

  const { data, error } = await supabaseServer
    .from("os_documents")
    .update(updatePayload)
    .eq("id", id)
    .select("*, product_families(id, key, name)")
    .single()

  if (error) {
    if (isSchemaMissingError(error)) {
      return NextResponse.json(
        { error: "Run the Smart Steel OS Phase 1B SQL before updating live document records." },
        { status: 409 }
      )
    }

    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ record: normalizeDocument(data) })
}
