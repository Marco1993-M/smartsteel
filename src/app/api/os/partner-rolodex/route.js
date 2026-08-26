import { NextResponse } from "next/server"
import { requireOsAuth } from "lib/osRouteAuth"
import { supabaseServer } from "lib/supabase-server"
import { isSchemaMissingError } from "lib/osPhase1bData"
import {
  FALLBACK_ROLODEX_COMPANIES,
  normalizeRolodexCompany,
  ROLODEX_PERMISSION_OPTIONS,
  ROLODEX_RELATIONSHIP_TYPES,
  ROLODEX_STATUS_OPTIONS,
} from "lib/partnerRolodexData"

export const runtime = "nodejs"

const COMPANY_SELECT = "*, os_partner_rolodex_contacts(*)"

function text(value) {
  return String(value || "").trim()
}

function list(value) {
  return Array.isArray(value) ? value.map(text).filter(Boolean) : []
}

function companyPayload(body) {
  return {
    name: text(body.name),
    website: text(body.website) || null,
    relationship_type: ROLODEX_RELATIONSHIP_TYPES.includes(body.relationshipType) ? body.relationshipType : "other",
    status: ROLODEX_STATUS_OPTIONS.includes(body.status) ? body.status : "identified",
    relationship_strength: Math.min(5, Math.max(1, Number(body.relationshipStrength) || 1)),
    priority: ["normal", "high"].includes(body.priority) ? body.priority : "normal",
    owner: text(body.owner) || null,
    province: text(body.province) || null,
    service_areas: list(body.serviceAreas),
    market_segments: list(body.marketSegments),
    typical_project_scale: text(body.typicalProjectScale) || null,
    relevant_products: list(body.relevantProducts),
    source: text(body.source) || null,
    communication_permission: ROLODEX_PERMISSION_OPTIONS.includes(body.communicationPermission)
      ? body.communicationPermission
      : "unknown",
    permission_source: text(body.permissionSource) || null,
    last_interaction_at: body.lastInteractionAt || null,
    next_action: text(body.nextAction) || null,
    next_action_due_at: body.nextActionDueAt || null,
    notes: text(body.notes) || null,
  }
}

async function replaceContacts(companyId, companyName, contacts) {
  const { error: deleteError } = await supabaseServer
    .from("os_partner_rolodex_contacts")
    .delete()
    .eq("company_id", companyId)
  if (deleteError) throw deleteError

  const rows = (contacts || [])
    .filter((contact) => [contact.name, contact.role, contact.email, contact.phone].some((value) => text(value)))
    .map((contact, index) => ({
      company_id: companyId,
      name: text(contact.name) || `${companyName} contact`,
      role: text(contact.role) || null,
      email: text(contact.email).toLowerCase() || null,
      phone: text(contact.phone) || null,
      is_primary: Boolean(contact.isPrimary) || index === 0,
    }))

  if (!rows.length) return
  const { error } = await supabaseServer.from("os_partner_rolodex_contacts").insert(rows)
  if (error) throw error
}

export async function GET(request) {
  const authResponse = await requireOsAuth(request)
  if (authResponse) return authResponse

  const { data, error } = await supabaseServer
    .from("os_partner_rolodex_companies")
    .select(COMPANY_SELECT)
    .order("priority", { ascending: true })
    .order("updated_at", { ascending: false })

  if (error) {
    if (isSchemaMissingError(error)) {
      return NextResponse.json({ records: FALLBACK_ROLODEX_COMPANIES, schemaReady: false })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ records: (data || []).map(normalizeRolodexCompany), schemaReady: true })
}

export async function POST(request) {
  const authResponse = await requireOsAuth(request)
  if (authResponse) return authResponse

  const body = await request.json()
  const payload = companyPayload(body)
  if (!payload.name) return NextResponse.json({ error: "Company name is required." }, { status: 400 })

  const { data, error } = await supabaseServer
    .from("os_partner_rolodex_companies")
    .insert(payload)
    .select("*")
    .single()

  if (error) {
    if (isSchemaMissingError(error)) {
      return NextResponse.json({ error: "Run the Partner Rolodex SQL before adding shared records." }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  try {
    await replaceContacts(data.id, payload.name, body.contacts)
  } catch (contactError) {
    await supabaseServer.from("os_partner_rolodex_companies").delete().eq("id", data.id)
    return NextResponse.json({ error: contactError.message }, { status: 500 })
  }

  const { data: complete, error: loadError } = await supabaseServer
    .from("os_partner_rolodex_companies")
    .select(COMPANY_SELECT)
    .eq("id", data.id)
    .single()
  if (loadError) return NextResponse.json({ error: loadError.message }, { status: 500 })
  return NextResponse.json({ record: normalizeRolodexCompany(complete) })
}

export async function PATCH(request) {
  const authResponse = await requireOsAuth(request)
  if (authResponse) return authResponse

  const body = await request.json()
  const id = text(body.id)
  const payload = { ...companyPayload(body), updated_at: new Date().toISOString() }
  if (!id || !payload.name) return NextResponse.json({ error: "Company and company name are required." }, { status: 400 })

  const { error } = await supabaseServer
    .from("os_partner_rolodex_companies")
    .update(payload)
    .eq("id", id)
  if (error) {
    if (isSchemaMissingError(error)) {
      return NextResponse.json({ error: "Run the Partner Rolodex SQL before updating shared records." }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  try {
    await replaceContacts(id, payload.name, body.contacts)
  } catch (contactError) {
    return NextResponse.json({ error: contactError.message }, { status: 500 })
  }

  const { data, error: loadError } = await supabaseServer
    .from("os_partner_rolodex_companies")
    .select(COMPANY_SELECT)
    .eq("id", id)
    .single()
  if (loadError) return NextResponse.json({ error: loadError.message }, { status: 500 })
  return NextResponse.json({ record: normalizeRolodexCompany(data) })
}
