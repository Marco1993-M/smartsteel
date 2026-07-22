import { NextResponse } from "next/server"
import { requireOsAuth } from "lib/osRouteAuth"
import { supabaseServer } from "lib/supabase-server"

export const runtime = "nodejs"

function normalizeProject(row) {
  return {
    ...(row.record || {}),
    id: row.id,
    projectNumber: row.project_number,
    companyKey: row.company_key,
    name: row.name,
    archived: Boolean(row.archived),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function schemaMissing(error) {
  return error?.code === "42P01" || error?.code === "PGRST205"
}

const COMPANY_PREFIXES = {
  "smart-steel": "SS",
  atlas: "ATL",
  lsf: "LSF",
  pequeno: "PEQ",
}

async function nextProjectNumber(companyKey) {
  const year = new Date().getFullYear()
  const prefix = `${COMPANY_PREFIXES[companyKey] || "SS"}-${year}-`
  const { data, error } = await supabaseServer
    .from("os_projects")
    .select("project_number")
    .like("project_number", `${prefix}%`)

  if (error) throw error
  const highest = (data || []).reduce((current, row) => {
    const sequence = Number(String(row.project_number).slice(prefix.length))
    return Number.isFinite(sequence) ? Math.max(current, sequence) : current
  }, 0)
  return `${prefix}${String(highest + 1).padStart(3, "0")}`
}

export async function GET(request) {
  const authResponse = await requireOsAuth(request)
  if (authResponse) return authResponse

  const { data, error } = await supabaseServer
    .from("os_projects")
    .select("*")
    .order("updated_at", { ascending: false })

  if (error) {
    if (schemaMissing(error)) return NextResponse.json({ records: [], schemaReady: false })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ records: (data || []).map(normalizeProject), schemaReady: true })
}

export async function PUT(request) {
  const authResponse = await requireOsAuth(request)
  if (authResponse) return authResponse

  const body = await request.json()
  const records = Array.isArray(body?.records) ? body.records : []
  if (!records.length) return NextResponse.json({ error: "At least one project record is required." }, { status: 400 })

  const payload = records.map((project) => ({
    id: String(project.id),
    project_number: String(project.projectNumber || "").trim(),
    company_key: String(project.companyKey || "smart-steel"),
    name: String(project.name || "").trim(),
    archived: Boolean(project.archived),
    record: project,
  }))

  if (payload.some((project) => !project.id || !project.project_number || !project.name)) {
    return NextResponse.json({ error: "Every project requires an id, project number, and name." }, { status: 400 })
  }

  const { data, error } = await supabaseServer
    .from("os_projects")
    .upsert(payload, { onConflict: "id" })
    .select("*")

  if (error) {
    if (schemaMissing(error)) {
      return NextResponse.json({ error: "Run the Smart Steel OS Projects SQL before enabling shared project records." }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ records: (data || []).map(normalizeProject), schemaReady: true })
}

export async function POST(request) {
  const authResponse = await requireOsAuth(request)
  if (authResponse) return authResponse

  const body = await request.json()
  const sourceLeadId = String(body?.sourceLeadId || "").trim()
  const name = String(body?.name || "").trim()
  const companyKey = String(body?.companyKey || "smart-steel").trim()

  if (!sourceLeadId || !name) {
    return NextResponse.json({ error: "A source lead and project name are required." }, { status: 400 })
  }

  const { data: existing, error: existingError } = await supabaseServer
    .from("os_projects")
    .select("*")
    .contains("record", { sourceLeadId })
    .maybeSingle()

  if (existingError) {
    if (schemaMissing(existingError)) {
      return NextResponse.json({ error: "Run the Smart Steel OS Projects SQL before creating projects from CRM." }, { status: 409 })
    }
    return NextResponse.json({ error: existingError.message }, { status: 500 })
  }

  if (existing) {
    return NextResponse.json({ record: normalizeProject(existing), created: false })
  }

  try {
    const projectNumber = await nextProjectNumber(companyKey)
    const id = `project-${crypto.randomUUID()}`
    const record = {
      id,
      projectNumber,
      companyKey,
      name,
      clientName: String(body?.clientName || "").trim(),
      address: String(body?.address || "").trim(),
      system: String(body?.system || "").trim(),
      siteContact: String(body?.siteContact || "").trim(),
      contractor: "Smart Steel",
      projectManager: String(body?.projectManager || "").trim(),
      scope: String(body?.scope || "").trim(),
      references: String(body?.references || "").trim(),
      sourceLeadId,
      crmLeadId: sourceLeadId,
      crmLeadName: clientName,
      source: "CRM lead",
      archived: false,
      visits: [],
      createdAt: new Date().toISOString(),
    }

    const { data, error } = await supabaseServer
      .from("os_projects")
      .insert([{
        id,
        project_number: projectNumber,
        company_key: companyKey,
        name,
        archived: false,
        record,
      }])
      .select("*")
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ record: normalizeProject(data), created: true })
  } catch (error) {
    return NextResponse.json({ error: error.message || "Could not generate the project number." }, { status: 500 })
  }
}

export async function DELETE(request) {
  const authResponse = await requireOsAuth(request)
  if (authResponse) return authResponse

  const projectId = new URL(request.url).searchParams.get("id")?.trim()
  if (!projectId) return NextResponse.json({ error: "Project ID is required." }, { status: 400 })

  const { error } = await supabaseServer.from("os_projects").delete().eq("id", projectId)
  if (error) {
    if (schemaMissing(error)) return NextResponse.json({ error: "Shared Projects storage is not available." }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ deleted: true })
}
