import { NextResponse } from "next/server"
import { requireOsAuth } from "lib/osRouteAuth"
import { supabaseServer } from "lib/supabase-server"
import { isSchemaMissingError } from "lib/osPhase1bData"

export const runtime = "nodejs"

const ITEM_TYPES = ["bracket", "bolt", "nut", "washer", "fixing", "other"]
const ITEM_STATUSES = ["draft", "needs_review", "approved"]
const ITEM_UNITS = ["each", "set", "pack"]

function normalizeItem(row) {
  return {
    id: row.id,
    componentId: row.component_id,
    fastenerId: row.fastener_id || "",
    itemCode: row.item_code,
    itemType: row.item_type,
    description: row.description,
    quantity: row.quantity === null ? "" : Number(row.quantity),
    unit: row.unit,
    quantityRule: row.quantity_rule || "",
    sizeSpec: row.size_spec || "",
    gradeSpec: row.grade_spec || "",
    finishSpec: row.finish_spec || "",
    status: row.status,
    notes: row.notes || "",
  }
}

export async function GET(request) {
  const authResponse = await requireOsAuth(request)
  if (authResponse) return authResponse
  const componentId = new URL(request.url).searchParams.get("componentId")
  if (!componentId) return NextResponse.json({ error: "Component is required." }, { status: 400 })

  const { data, error } = await supabaseServer
    .from("os_component_items")
    .select("*")
    .eq("component_id", componentId)
    .order("item_code", { ascending: true })

  if (error) {
    if (isSchemaMissingError(error)) return NextResponse.json({ records: [], schemaReady: false })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ records: (data || []).map(normalizeItem), schemaReady: true })
}

export async function POST(request) {
  const authResponse = await requireOsAuth(request)
  if (authResponse) return authResponse
  const body = await request.json()
  const componentId = String(body?.componentId || "").trim()
  const itemCode = String(body?.itemCode || "").trim().toUpperCase()
  const itemType = String(body?.itemType || "").trim()
  const description = String(body?.description || "").trim()
  const unit = String(body?.unit || "each").trim()
  if (!componentId || !itemCode || !description || !ITEM_TYPES.includes(itemType) || !ITEM_UNITS.includes(unit)) {
    return NextResponse.json({ error: "Component, item code, type, and description are required." }, { status: 400 })
  }

  const { data, error } = await supabaseServer
    .from("os_component_items")
    .insert([{
      component_id: componentId,
      item_code: itemCode,
      item_type: itemType,
      fastener_id: String(body?.fastenerId || "").trim() || null,
      description,
      quantity: null,
      unit,
      quantity_rule: String(body?.quantityRule || "").trim() || null,
      size_spec: "To be confirmed",
      grade_spec: "To be confirmed",
      finish_spec: "To be confirmed",
      status: "needs_review",
      notes: String(body?.notes || "").trim() || null,
    }])
    .select("*")
    .single()

  if (error) {
    if (isSchemaMissingError(error)) return NextResponse.json({ error: "Run the Atlas component ID SQL first." }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ record: normalizeItem(data) })
}

export async function PATCH(request) {
  const authResponse = await requireOsAuth(request)
  if (authResponse) return authResponse
  const body = await request.json()
  const id = String(body?.id || "").trim()
  if (!id) return NextResponse.json({ error: "Connection item is required." }, { status: 400 })

  const itemType = String(body?.itemType || "").trim()
  const status = String(body?.status || "").trim()
  const unit = String(body?.unit || "").trim()
  if (!ITEM_TYPES.includes(itemType) || !ITEM_STATUSES.includes(status) || !ITEM_UNITS.includes(unit)) {
    return NextResponse.json({ error: "Choose valid connection item values." }, { status: 400 })
  }
  const quantity = body?.quantity === "" || body?.quantity === null ? null : Number(body.quantity)
  if (quantity !== null && (!Number.isFinite(quantity) || quantity < 0)) {
    return NextResponse.json({ error: "Quantity must be blank or a positive number." }, { status: 400 })
  }

  const { data, error } = await supabaseServer
    .from("os_component_items")
    .update({
      item_type: itemType,
      fastener_id: String(body?.fastenerId || "").trim() || null,
      description: String(body?.description || "").trim(),
      quantity,
      unit,
      quantity_rule: String(body?.quantityRule || "").trim() || null,
      size_spec: String(body?.sizeSpec || "").trim() || null,
      grade_spec: String(body?.gradeSpec || "").trim() || null,
      finish_spec: String(body?.finishSpec || "").trim() || null,
      status,
      notes: String(body?.notes || "").trim() || null,
    })
    .eq("id", id)
    .select("*")
    .single()

  if (error) {
    if (isSchemaMissingError(error)) return NextResponse.json({ error: "Run the Atlas component ID SQL first." }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ record: normalizeItem(data) })
}
