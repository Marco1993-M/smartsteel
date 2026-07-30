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
    componentCode: row.component_code || "",
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
    specification: row.metadata?.specification && typeof row.metadata.specification === "object"
      ? row.metadata.specification
      : {},
    technicalRevision: Number(row.technical_revision || 1),
    technicalApprovedBy: row.technical_approved_by || "",
    technicalApprovedAt: row.technical_approved_at || "",
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
    component_code: String(body?.componentCode || "").trim().toUpperCase() || null,
    summary: String(body?.summary || "").trim() || null,
    status,
    owner: String(body?.owner || "").trim() || null,
    product_family_id: body?.productFamilyId || null,
    metadata: {
      tags,
      specification: body?.specification && typeof body.specification === "object"
        ? body.specification
        : {},
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

    if (/component_code|schema cache/i.test(error.message || "")) {
      return NextResponse.json({ error: "Run the Atlas component ID SQL before registering coded components." }, { status: 409 })
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

  if (body?.componentCode !== undefined) {
    updatePayload.component_code = String(body.componentCode || "").trim().toUpperCase() || null
  }

  if (body?.technicalApproval === true) {
    const approver = String(body?.technicalApprovedBy || "").trim()
    if (!approver) {
      return NextResponse.json({ error: "Record who approved this component specification." }, { status: 400 })
    }
    const { data: approvalComponent, error: approvalComponentError } = await supabaseServer
      .from("os_catalog_items")
      .select("component_code")
      .eq("id", id)
      .single()
    if (approvalComponentError) {
      return NextResponse.json({ error: approvalComponentError.message }, { status: 500 })
    }
    if (approvalComponent.component_code === "W08-CON") {
      const { data: connectionItems, error: connectionError } = await supabaseServer
        .from("os_component_items")
        .select("status, quantity, size_spec, grade_spec, finish_spec")
        .eq("component_id", id)
      if (connectionError) return NextResponse.json({ error: connectionError.message }, { status: 500 })
      const connectionReady = (connectionItems || []).length > 0 && (connectionItems || []).every((item) =>
        item.status === "approved" &&
        Number(item.quantity) > 0 &&
        item.size_spec &&
        item.size_spec !== "To be confirmed" &&
        item.grade_spec &&
        item.grade_spec !== "To be confirmed" &&
        item.finish_spec &&
        item.finish_spec !== "To be confirmed"
      )
      if (!connectionReady) {
        return NextResponse.json({ error: "Complete and approve every connection-pack item before approving W08-CON." }, { status: 400 })
      }
    }
    updatePayload.technical_approved_by = approver
    updatePayload.technical_approved_at = new Date().toISOString()
  }

  if (body?.specification !== undefined) {
    const { data: existing, error: metadataError } = await supabaseServer
      .from("os_catalog_items")
      .select("*")
      .eq("id", id)
      .single()

    if (metadataError) {
      return NextResponse.json({ error: metadataError.message }, { status: 500 })
    }

    const specification = body.specification && typeof body.specification === "object"
      ? Object.fromEntries(
          Object.entries(body.specification).map(([key, value]) => [key, String(value || "").trim()])
        )
      : {}

    updatePayload.metadata = {
      ...(existing?.metadata || {}),
      specification,
    }

    const supportsTechnicalRevisions = Object.prototype.hasOwnProperty.call(existing || {}, "technical_revision")
    if (supportsTechnicalRevisions) {
      const currentRevision = Number(existing.technical_revision || 1)
      const changedBy = String(body?.changedBy || body?.technicalApprovedBy || "Smart Steel team").trim()
      const { error: revisionError } = await supabaseServer
        .from("os_component_revisions")
        .insert([{
          component_id: id,
          component_code: existing.component_code,
          technical_revision: currentRevision,
          specification_snapshot: existing.metadata?.specification || {},
          changed_by: changedBy,
          change_note: String(body?.changeNote || "Component specification updated").trim(),
        }])

      if (revisionError && !isSchemaMissingError(revisionError)) {
        return NextResponse.json({ error: revisionError.message }, { status: 500 })
      }

      updatePayload.technical_revision = currentRevision + 1
      updatePayload.technical_approved_by = null
      updatePayload.technical_approved_at = null
    }
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

  if (body?.specification !== undefined) {
    const { error: pricingError } = await supabaseServer
      .from("os_atlas_pricing_items")
      .update({
        status: "needs_review",
        approved_by: null,
        approved_at: null,
      })
      .eq("component_id", id)

    if (pricingError && !isSchemaMissingError(pricingError)) {
      return NextResponse.json({ error: pricingError.message }, { status: 500 })
    }
  }

  return NextResponse.json({
    record: normalizeCatalogItem(data),
    pricingInvalidated: body?.specification !== undefined,
  })
}
