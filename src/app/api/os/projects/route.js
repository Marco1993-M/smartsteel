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
