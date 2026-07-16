import { NextResponse } from "next/server"
import { requireOsAuth } from "lib/osRouteAuth"
import { supabaseServer } from "lib/supabase-server"

function isDateOnly(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))
}

function normalizeTask(row) {
  return {
    id: row.id,
    title: row.title,
    date: row.due_date,
  }
}

export async function GET(request) {
  const authResponse = await requireOsAuth(request)
  if (authResponse) return authResponse

  const { searchParams } = new URL(request.url)
  const start = searchParams.get("start")
  const end = searchParams.get("end")

  if (!isDateOnly(start) || !isDateOnly(end)) {
    return NextResponse.json({ error: "A valid week range is required." }, { status: 400 })
  }

  const { data, error } = await supabaseServer
    .from("tasks")
    .select("id, title, due_date")
    .eq("completed", false)
    .gte("due_date", start)
    .lte("due_date", end)
    .order("due_date", { ascending: true })
    .order("created_at", { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ records: (data || []).map(normalizeTask) })
}

export async function POST(request) {
  const authResponse = await requireOsAuth(request)
  if (authResponse) return authResponse

  const body = await request.json()
  const title = String(body?.title || "").trim()
  const dueDate = String(body?.dueDate || "").trim()

  if (!title || !isDateOnly(dueDate)) {
    return NextResponse.json({ error: "Add a short note and choose a valid date." }, { status: 400 })
  }

  const { data, error } = await supabaseServer
    .from("tasks")
    .insert([
      {
        title,
        due_date: dueDate,
        priority: "Medium",
        completed: false,
      },
    ])
    .select("id, title, due_date")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ record: normalizeTask(data) })
}

export async function DELETE(request) {
  const authResponse = await requireOsAuth(request)
  if (authResponse) return authResponse

  const { searchParams } = new URL(request.url)
  const id = String(searchParams.get("id") || "").trim()
  if (!id) return NextResponse.json({ error: "A schedule item is required." }, { status: 400 })

  const { error } = await supabaseServer.from("tasks").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function PATCH(request) {
  const authResponse = await requireOsAuth(request)
  if (authResponse) return authResponse

  const body = await request.json()
  const id = String(body?.id || "").trim()
  if (!id) return NextResponse.json({ error: "A schedule item is required." }, { status: 400 })

  const updatePayload = {}
  if (typeof body?.title === "string" && body.title.trim()) updatePayload.title = body.title.trim()
  if (typeof body?.completed === "boolean") updatePayload.completed = body.completed
  if (!Object.keys(updatePayload).length) return NextResponse.json({ error: "Nothing to update." }, { status: 400 })

  const { data, error } = await supabaseServer
    .from("tasks")
    .update(updatePayload)
    .eq("id", id)
    .select("id, title, due_date, completed")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ record: normalizeTask(data), completed: Boolean(data.completed) })
}
