import { NextResponse } from "next/server"
import { requireOsAuth } from "lib/osRouteAuth"
import { supabaseServer } from "lib/supabase-server"
import { isSchemaMissingError } from "lib/osPhase1bData"

export const runtime = "nodejs"

const STATUSES = ["draft", "needs_review", "confirmed", "superseded"]
const UNITS = ["ton", "kg", "m", "each", "set"]

function normalizeRow(row) {
  return {
    id: row.id,
    productCode: row.product_code,
    componentCode: row.component_code,
    componentName: row.component_name,
    category: row.category,
    profileSpec: row.profile_spec || "",
    lengthRule: row.length_rule || "",
    quantityRule: row.quantity_rule || "",
    pricingUnit: row.pricing_unit,
    galvanisedRate: row.galvanised_rate === null ? "" : Number(row.galvanised_rate),
    mildSteelRate: row.mild_steel_rate === null ? "" : Number(row.mild_steel_rate),
    massKgPerM: row.mass_kg_per_m === null ? "" : Number(row.mass_kg_per_m),
    wastePercent: Number(row.waste_percent || 0),
    fabricationAllowance: Number(row.fabrication_allowance || 0),
    status: row.status,
    effectiveDate: row.effective_date || "",
    notes: row.notes || "",
    updatedAt: row.updated_at,
  }
}

function nullableNumber(value) {
  if (value === "" || value === null || value === undefined) return null
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? number : NaN
}

export async function GET(request) {
  const authResponse = await requireOsAuth(request)
  if (authResponse) return authResponse

  const productCode = String(new URL(request.url).searchParams.get("product") || "").trim().toUpperCase()
  if (!productCode) return NextResponse.json({ error: "Product code is required." }, { status: 400 })

  const { data, error } = await supabaseServer
    .from("os_atlas_pricing_items")
    .select("*")
    .eq("product_code", productCode)
    .order("category")
    .order("component_code")

  if (error) {
    if (isSchemaMissingError(error)) return NextResponse.json({ records: [], schemaReady: false })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ records: (data || []).map(normalizeRow), schemaReady: true })
}

export async function PATCH(request) {
  const authResponse = await requireOsAuth(request)
  if (authResponse) return authResponse

  const body = await request.json()
  const id = String(body?.id || "").trim()
  if (!id || !STATUSES.includes(body?.status) || !UNITS.includes(body?.pricingUnit)) {
    return NextResponse.json({ error: "A valid pricing record, status and unit are required." }, { status: 400 })
  }

  const numericFields = {
    galvanised_rate: nullableNumber(body.galvanisedRate),
    mild_steel_rate: nullableNumber(body.mildSteelRate),
    mass_kg_per_m: nullableNumber(body.massKgPerM),
    waste_percent: nullableNumber(body.wastePercent),
    fabrication_allowance: nullableNumber(body.fabricationAllowance),
  }
  if (Object.values(numericFields).some(Number.isNaN)) {
    return NextResponse.json({ error: "Rates and allowances must be blank or positive numbers." }, { status: 400 })
  }

  const { data, error } = await supabaseServer
    .from("os_atlas_pricing_items")
    .update({
      component_name: String(body.componentName || "").trim(),
      category: String(body.category || "").trim(),
      profile_spec: String(body.profileSpec || "").trim() || null,
      length_rule: String(body.lengthRule || "").trim() || null,
      quantity_rule: String(body.quantityRule || "").trim() || null,
      pricing_unit: body.pricingUnit,
      ...numericFields,
      status: body.status,
      effective_date: body.effectiveDate || null,
      notes: String(body.notes || "").trim() || null,
    })
    .eq("id", id)
    .select("*")
    .single()

  if (error) {
    if (isSchemaMissingError(error)) return NextResponse.json({ error: "Run the Atlas pricing SQL before saving rates." }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ record: normalizeRow(data) })
}
