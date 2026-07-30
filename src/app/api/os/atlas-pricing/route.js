import { NextResponse } from "next/server"
import { requireOsAuth } from "lib/osRouteAuth"
import { supabaseServer } from "lib/supabase-server"
import { isSchemaMissingError } from "lib/osPhase1bData"
import { getAtlasPricingCompleteness } from "lib/atlasCosting"

export const runtime = "nodejs"

const STATUSES = ["draft", "needs_review", "confirmed", "superseded"]
const UNITS = ["ton", "kg", "m", "each", "set"]

const COMPONENT_CODE_ALIASES = {
  "W08-PUR": "W08-SEC",
  "W08-RDG": "W08-CON",
  "W08-EAV": "W08-CON",
  "W08-BLT": "W08-CON",
  "W08-NUT": "W08-CON",
  "W08-WSH": "W08-CON",
}

function technicalSpecification(component) {
  const specification = component?.metadata?.specification || {}
  const mass = specification.verifiedMassKgPerM || specification.calculatedMassKgPerM || ""
  return {
    profileId: specification.profileId || "",
    profileSpec: specification.profileSpec || "",
    thicknessSpec: specification.thicknessSpec || "",
    gradeSpec: specification.gradeSpec || "",
    coatingSpec: specification.coatingSpec || "",
    quantityRule: specification.quantityRule || "",
    massKgPerM: mass === "" ? "" : Number(mass),
    massSource: specification.verifiedMassKgPerM ? "verified" : mass ? "calculated" : "",
    drawingRevision: specification.drawingRevision || "",
  }
}

function normalizeRow(row, component = null) {
  const inherited = component ? technicalSpecification(component) : null
  const componentRevision = Number(component?.technical_revision || 1)
  const inheritsQuantityRule = component?.component_code !== "W08-CON" || row.component_code === "W08-CON"
  return {
    id: row.id,
    productCode: row.product_code,
    componentCode: row.component_code,
    componentName: row.component_name,
    category: row.category,
    componentId: row.component_id || component?.id || "",
    linkedComponentCode: component?.component_code || "",
    componentRevision,
    inheritedComponentRevision: Number(row.inherited_component_revision || 0),
    technicalStale: Boolean(component && Number(row.inherited_component_revision || 0) !== componentRevision),
    technicalApproved: Boolean(component?.technical_approved_at),
    technicalApprovedBy: component?.technical_approved_by || "",
    technicalApprovedAt: component?.technical_approved_at || "",
    technicalSpecification: inherited,
    profileId: inherited?.profileId || row.profile_id || "",
    fastenerId: row.fastener_id || "",
    profileSpec: inherited?.profileSpec || row.profile_spec || "",
    lengthRule: row.length_rule || "",
    quantityRule: (inheritsQuantityRule ? inherited?.quantityRule : "") || row.quantity_rule || "",
    pricingUnit: row.pricing_unit,
    galvanisedRate: row.galvanised_rate === null ? "" : Number(row.galvanised_rate),
    mildSteelRate: row.mild_steel_rate === null ? "" : Number(row.mild_steel_rate),
    massKgPerM: inherited?.massKgPerM ?? (row.mass_kg_per_m === null ? "" : Number(row.mass_kg_per_m)),
    massSource: inherited?.massSource || row.mass_source || "",
    wastePercent: Number(row.waste_percent || 0),
    fabricationAllowance: Number(row.fabrication_allowance || 0),
    baselineQuantity: row.baseline_quantity == null ? "" : Number(row.baseline_quantity),
    baselineLengthM: row.baseline_length_m == null ? "" : Number(row.baseline_length_m),
    coatingAllowance: Number(row.coating_allowance || 0),
    marginPercent: Number(row.margin_percent || 0),
    supplierName: row.supplier_name || "",
    supplierQuoteReference: row.supplier_quote_reference || "",
    approvedBy: row.approved_by || "",
    approvedAt: row.approved_at || "",
    revisionNumber: Number(row.revision_number || 1),
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

  const componentCodes = [...new Set((data || []).map((row) => COMPONENT_CODE_ALIASES[row.component_code] || row.component_code))]
  let componentMap = new Map()
  if (componentCodes.length) {
    const { data: componentRows, error: componentError } = await supabaseServer
      .from("os_catalog_items")
      .select("*")
      .eq("platform_key", "atlas")
      .eq("kind", "component")
      .in("component_code", componentCodes)
    if (!componentError) componentMap = new Map((componentRows || []).map((row) => [row.component_code, row]))
  }

  const ids = (data || []).map((row) => row.id)
  let revisions = []
  if (ids.length) {
    const { data: revisionRows, error: revisionError } = await supabaseServer
      .from("os_atlas_pricing_revisions")
      .select("id, pricing_item_id, revision_number, changed_by, change_note, created_at")
      .in("pricing_item_id", ids)
      .order("created_at", { ascending: false })
      .limit(100)
    if (!revisionError) {
      revisions = (revisionRows || []).map((row) => ({
        id: row.id,
        pricingItemId: row.pricing_item_id,
        revisionNumber: row.revision_number,
        changedBy: row.changed_by || "",
        changeNote: row.change_note || "",
        createdAt: row.created_at,
      }))
    }
  }

  return NextResponse.json({
    records: (data || []).map((row) => normalizeRow(
      row,
      componentMap.get(COMPONENT_CODE_ALIASES[row.component_code] || row.component_code) || null
    )),
    revisions,
    schemaReady: true,
  })
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
    baseline_quantity: nullableNumber(body.baselineQuantity),
    baseline_length_m: nullableNumber(body.baselineLengthM),
    coating_allowance: nullableNumber(body.coatingAllowance),
    margin_percent: nullableNumber(body.marginPercent),
  }
  if (Object.values(numericFields).some(Number.isNaN)) {
    return NextResponse.json({ error: "Rates and allowances must be blank or positive numbers." }, { status: 400 })
  }

  const { data: existing, error: existingError } = await supabaseServer
    .from("os_atlas_pricing_items")
    .select("*")
    .eq("id", id)
    .single()

  if (existingError) {
    if (isSchemaMissingError(existingError)) return NextResponse.json({ error: "Run the Atlas costing controls SQL before saving rates." }, { status: 409 })
    return NextResponse.json({ error: existingError.message }, { status: 500 })
  }

  const approving = body.status === "confirmed"
  const approvedBy = String(body.approvedBy || "").trim()
  if (approving && !approvedBy) {
    return NextResponse.json({ error: "Record who approved this pricing line before confirming it." }, { status: 400 })
  }
  const completeness = getAtlasPricingCompleteness(body)
  if (approving && !completeness.ready) {
    return NextResponse.json({
      error: `Complete ${completeness.missing.join(", ")} before confirming this pricing line.`,
    }, { status: 400 })
  }

  let linkedComponent = null
  if (existing.component_id) {
    const { data: component, error: componentError } = await supabaseServer
      .from("os_catalog_items")
      .select("*")
      .eq("id", existing.component_id)
      .single()
    if (componentError) return NextResponse.json({ error: componentError.message }, { status: 500 })
    linkedComponent = component
    if (approving && !component.technical_approved_at) {
      return NextResponse.json({ error: "Approve the linked component specification before confirming its pricing." }, { status: 400 })
    }
  }
  const inherited = linkedComponent ? technicalSpecification(linkedComponent) : null
  const inheritsQuantityRule = linkedComponent?.component_code !== "W08-CON" || existing.component_code === "W08-CON"

  const nextRevision = Number(existing.revision_number || 1) + 1
  const { error: revisionError } = await supabaseServer
    .from("os_atlas_pricing_revisions")
    .insert([{
      pricing_item_id: id,
      product_code: existing.product_code,
      component_code: existing.component_code,
      revision_number: Number(existing.revision_number || 1),
      snapshot: existing,
      changed_by: String(body.changedBy || approvedBy || "Smart Steel team").trim(),
      change_note: String(body.changeNote || "").trim() || "Pricing record updated",
    }])

  if (revisionError && !isSchemaMissingError(revisionError)) {
    return NextResponse.json({ error: revisionError.message }, { status: 500 })
  }

  const { data, error } = await supabaseServer
    .from("os_atlas_pricing_items")
    .update({
      component_name: String(body.componentName || "").trim(),
      category: String(body.category || "").trim(),
      component_id: existing.component_id || null,
      inherited_component_revision: linkedComponent ? Number(linkedComponent.technical_revision || 1) : existing.inherited_component_revision,
      profile_id: String(inherited?.profileId || body.profileId || "").trim() || null,
      fastener_id: String(body.fastenerId || "").trim() || null,
      profile_spec: String(inherited?.profileSpec || body.profileSpec || "").trim() || null,
      length_rule: String(body.lengthRule || "").trim() || null,
      quantity_rule: String((inheritsQuantityRule ? inherited?.quantityRule : "") || body.quantityRule || "").trim() || null,
      pricing_unit: body.pricingUnit,
      ...numericFields,
      mass_kg_per_m: inherited?.massKgPerM === "" ? null : inherited?.massKgPerM ?? numericFields.mass_kg_per_m,
      mass_source: ["calculated", "verified", "custom"].includes(inherited?.massSource || body.massSource)
        ? inherited?.massSource || body.massSource
        : null,
      supplier_name: String(body.supplierName || "").trim() || null,
      supplier_quote_reference: String(body.supplierQuoteReference || "").trim() || null,
      status: body.status,
      approved_by: approving ? approvedBy : null,
      approved_at: approving ? new Date().toISOString() : null,
      revision_number: nextRevision,
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

  if (data.component_code === "W08-BLT" && data.fastener_id) {
    const diameter = String(data.profile_spec || "").match(/M(12|16)/i)?.[1]
    if (diameter) {
      await Promise.all([
        supabaseServer
          .from("os_atlas_pricing_items")
          .update({ profile_spec: `M${diameter} Hex Nut · Property Class 8`, revision_number: nextRevision })
          .eq("product_code", data.product_code)
          .eq("component_code", "W08-NUT"),
        supabaseServer
          .from("os_atlas_pricing_items")
          .update({ profile_spec: `M${diameter} Flat Washer`, revision_number: nextRevision })
          .eq("product_code", data.product_code)
          .eq("component_code", "W08-WSH"),
      ])
    }
  }

  return NextResponse.json({ record: normalizeRow(data, linkedComponent), revisionRecorded: !revisionError })
}
