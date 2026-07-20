import { NextResponse } from "next/server"
import { requireOsAuth } from "lib/osRouteAuth"
import { supabaseServer } from "lib/supabase-server"
import {
  BOM_LINE_SCOPE_OPTIONS,
  BOM_STATUS_OPTIONS,
  BOM_UNIT_OPTIONS,
  getFallbackBoms,
  isSchemaMissingError,
} from "lib/osPhase1bData"

export const runtime = "nodejs"

function normalizeLine(row) {
  return {
    id: row.id,
    lineNumber: row.line_number,
    category: row.category || "Uncategorized",
    description: row.description,
    componentId: row.catalog_item_id || null,
    componentName: row.os_catalog_items?.title || "",
    quantity: Number(row.quantity || 0),
    unit: row.unit || "each",
    wasteFactor: Number(row.waste_factor || 0),
    scope: row.scope || "standard",
    notes: row.notes || "",
    quantityRule: row.metadata?.quantityRule || "",
    sourceCode: row.metadata?.sourceCode || "",
  }
}

function normalizeBom(row) {
  return {
    id: row.id,
    platformKey: row.platform_key,
    productFamilyId: row.product_family_id || null,
    productFamilyKey: row.product_families?.key || null,
    productFamilyName: row.product_families?.name || "Unlinked",
    code: row.code,
    title: row.title,
    description: row.description || "",
    revisionCode: row.revision_code || "R0",
    status: row.status || "draft",
    owner: row.owner || "",
    lines: (row.os_bom_lines || [])
      .map(normalizeLine)
      .sort((left, right) => left.lineNumber - right.lineNumber),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

async function getBomRecords(platformKey) {
  return supabaseServer
    .from("os_boms")
    .select("*, product_families(id, key, name), os_bom_lines(*, os_catalog_items(id, title, category))")
    .eq("platform_key", platformKey)
    .order("updated_at", { ascending: false })
}

export async function GET(request) {
  const authResponse = await requireOsAuth(request)
  if (authResponse) return authResponse

  const { searchParams } = new URL(request.url)
  const platformKey = String(searchParams.get("platform") || "").trim().toLowerCase()

  if (!platformKey) {
    return NextResponse.json({ error: "Platform is required." }, { status: 400 })
  }

  const { data, error } = await getBomRecords(platformKey)

  if (error) {
    if (isSchemaMissingError(error)) {
      return NextResponse.json({ records: getFallbackBoms(platformKey), schemaReady: false })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ records: (data || []).map(normalizeBom), schemaReady: true })
}

export async function POST(request) {
  const authResponse = await requireOsAuth(request)
  if (authResponse) return authResponse

  const body = await request.json()
  const platformKey = String(body?.platformKey || "").trim().toLowerCase()
  const title = String(body?.title || "").trim()
  const code = String(body?.code || "").trim().toUpperCase()

  if (!platformKey || !title || !code) {
    return NextResponse.json({ error: "Platform, BOM name, and reference code are required." }, { status: 400 })
  }

  const status = BOM_STATUS_OPTIONS.includes(body?.status) ? body.status : "draft"
  const payload = {
    platform_key: platformKey,
    product_family_id: body?.productFamilyId || null,
    code,
    title,
    description: String(body?.description || "").trim() || null,
    revision_code: String(body?.revisionCode || "R0").trim().toUpperCase() || "R0",
    status,
    owner: String(body?.owner || "").trim() || null,
  }

  const { data, error } = await supabaseServer
    .from("os_boms")
    .insert([payload])
    .select("*, product_families(id, key, name), os_bom_lines(*, os_catalog_items(id, title, category))")
    .single()

  if (error) {
    if (isSchemaMissingError(error)) {
      return NextResponse.json({ error: "Run the Smart Steel OS Phase 1B BOM SQL before adding live BOM records." }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ record: normalizeBom(data) })
}

export async function PATCH(request) {
  const authResponse = await requireOsAuth(request)
  if (authResponse) return authResponse

  const body = await request.json()
  const action = String(body?.action || "").trim()
  const bomId = String(body?.bomId || "").trim()

  if (!bomId) {
    return NextResponse.json({ error: "BOM record is required." }, { status: 400 })
  }

  if (action === "status") {
    if (!BOM_STATUS_OPTIONS.includes(body?.status)) {
      return NextResponse.json({ error: "Unsupported BOM status." }, { status: 400 })
    }

    const { data, error } = await supabaseServer
      .from("os_boms")
      .update({ status: body.status })
      .eq("id", bomId)
      .select("*, product_families(id, key, name), os_bom_lines(*, os_catalog_items(id, title, category))")
      .single()

    if (error) {
      if (isSchemaMissingError(error)) {
        return NextResponse.json({ error: "Run the Smart Steel OS Phase 1B BOM SQL before updating live BOM records." }, { status: 409 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ record: normalizeBom(data) })
  }

  if (action === "add_line") {
    const description = String(body?.description || "").trim()
    const lineNumber = Number(body?.lineNumber)
    const quantity = Number(body?.quantity)
    const unit = String(body?.unit || "").trim()
    const scope = String(body?.scope || "").trim()
    const wasteFactor = Number(body?.wasteFactor || 0)

    if (!description || !Number.isInteger(lineNumber) || lineNumber < 1 || !Number.isFinite(quantity) || quantity < 0) {
      return NextResponse.json({ error: "Add a line number, description, and valid quantity." }, { status: 400 })
    }
    if (!BOM_UNIT_OPTIONS.includes(unit) || !BOM_LINE_SCOPE_OPTIONS.includes(scope)) {
      return NextResponse.json({ error: "Choose a valid unit and scope type." }, { status: 400 })
    }
    if (!Number.isFinite(wasteFactor) || wasteFactor < 0 || wasteFactor > 1) {
      return NextResponse.json({ error: "Waste allowance must be between 0 and 100%." }, { status: 400 })
    }

    const { error } = await supabaseServer.from("os_bom_lines").insert([
      {
        bom_id: bomId,
        catalog_item_id: body?.componentId || null,
        line_number: lineNumber,
        category: String(body?.category || "").trim() || null,
        description,
        quantity,
        unit,
        waste_factor: wasteFactor,
        scope,
        notes: String(body?.notes || "").trim() || null,
        metadata: {
          quantityRule: String(body?.quantityRule || "").trim(),
          sourceCode: String(body?.sourceCode || "").trim(),
        },
      },
    ])

    if (error) {
      if (isSchemaMissingError(error)) {
        return NextResponse.json({ error: "Run the Smart Steel OS Phase 1B BOM SQL before adding live BOM lines." }, { status: 409 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  } else if (action === "delete_line") {
    const lineId = String(body?.lineId || "").trim()
    if (!lineId) return NextResponse.json({ error: "BOM line is required." }, { status: 400 })

    const { error } = await supabaseServer.from("os_bom_lines").delete().eq("id", lineId).eq("bom_id", bomId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  } else {
    return NextResponse.json({ error: "Unsupported BOM action." }, { status: 400 })
  }

  const { data, error } = await supabaseServer
    .from("os_boms")
    .select("*, product_families(id, key, name), os_bom_lines(*, os_catalog_items(id, title, category))")
    .eq("id", bomId)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ record: normalizeBom(data) })
}
