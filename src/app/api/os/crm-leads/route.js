import { NextResponse } from "next/server"
import { requireOsAuth } from "lib/osRouteAuth"
import { supabaseServer } from "lib/supabase-server"

export const runtime = "nodejs"

function nextBusinessMorning() {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  date.setHours(9, 0, 0, 0)
  while ([0, 6].includes(date.getDay())) date.setDate(date.getDate() + 1)
  return date.toISOString()
}

function leadSummary(lead) {
  return {
    id: lead.id,
    name: [lead.name, lead.last_name].filter(Boolean).join(" ").trim() || "Unnamed lead",
    email: lead.email || "",
    phone: lead.phone || "",
    status: lead.status || "new",
    productType: lead.product_type || "",
    createdAt: lead.created_at,
  }
}

export async function GET(request) {
  const authResponse = await requireOsAuth(request)
  if (authResponse) return authResponse

  const { data, error } = await supabaseServer
    .from("leads")
    .select("id, name, last_name, email, phone, status, product_type, created_at")
    .order("created_at", { ascending: false })
    .limit(250)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ leads: (data || []).map(leadSummary) })
}

export async function POST(request) {
  const authResponse = await requireOsAuth(request)
  if (authResponse) return authResponse

  const body = await request.json()
  const clientName = String(body?.clientName || "").trim()
  const projectNumber = String(body?.projectNumber || "").trim()
  if (!clientName || !projectNumber) {
    return NextResponse.json({ error: "Client name and project number are required." }, { status: 400 })
  }

  const nameParts = clientName.split(/\s+/)
  const firstName = nameParts.shift() || clientName
  const lastName = nameParts.join(" ") || "Project enquiry"
  const notes = [
    `Linked Smart Steel OS project: ${projectNumber}`,
    body.projectName ? `Project: ${body.projectName}` : null,
    body.address ? `Site: ${body.address}` : null,
    body.latestVisitSummary ? `Latest site visit: ${body.latestVisitSummary}` : null,
    body.scope ? `Initial scope: ${body.scope}` : null,
  ].filter(Boolean).join("\n")

  const { data, error } = await supabaseServer
    .from("leads")
    .insert([{
      name: firstName,
      last_name: lastName,
      email: String(body.email || "").trim() || null,
      phone: String(body.phone || "").trim() || null,
      status: "new",
      lead_source: "Site visit",
      product_type: String(body.system || "General Enquiry").trim(),
      estimate_request: String(body.scope || body.latestVisitSummary || "").trim(),
      allocated_to: String(body.projectManager || "").trim(),
      notes,
      next_action: "Review the site visit record, confirm the scope, and prepare the design or estimate.",
      follow_up_at: nextBusinessMorning(),
      created_at: new Date().toISOString(),
    }])
    .select("id, name, last_name, email, phone, status, product_type, created_at")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ lead: leadSummary(data) })
}

export async function PATCH(request) {
  const authResponse = await requireOsAuth(request)
  if (authResponse) return authResponse

  const body = await request.json()
  const leadId = String(body?.leadId || "").trim()
  const projectNumber = String(body?.projectNumber || "").trim()
  if (!leadId || !projectNumber) {
    return NextResponse.json({ error: "Lead ID and project number are required." }, { status: 400 })
  }

  const { data: existing, error: readError } = await supabaseServer
    .from("leads")
    .select("notes")
    .eq("id", leadId)
    .single()

  if (readError) return NextResponse.json({ error: readError.message }, { status: 500 })
  const reference = `Linked Smart Steel OS project: ${projectNumber}`
  const notes = String(existing?.notes || "")
  const updatedNotes = notes.includes(reference)
    ? notes
    : [notes.trim(), reference, body.projectName ? `Project: ${body.projectName}` : null].filter(Boolean).join("\n")

  const { error } = await supabaseServer.from("leads").update({ notes: updatedNotes }).eq("id", leadId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ linked: true })
}
