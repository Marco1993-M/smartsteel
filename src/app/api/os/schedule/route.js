import { NextResponse } from "next/server"
import { requireOsAuth } from "lib/osRouteAuth"
import { supabaseServer } from "lib/supabase-server"
import { isReminderAssignee, sendReminderNotification } from "lib/reminderNotifications"

function isDateOnly(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))
}

function normalizeTask(row) {
  return {
    id: row.id,
    title: row.title,
    date: row.due_date,
    assignee: row.assignee || "",
    notifyWholeTeam: Boolean(row.notify_whole_team),
  }
}

async function getRequestUser(request) {
  const token = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim()
  if (!token) return null
  const { data } = await supabaseServer.auth.getUser(token)
  return data?.user || null
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
    .select("id, title, due_date, assignee, notify_whole_team")
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
  const assignee = String(body?.assignee || "").trim()
  const notifyWholeTeam = Boolean(body?.notifyWholeTeam)

  if (!title || !isDateOnly(dueDate) || !isReminderAssignee(assignee)) {
    return NextResponse.json({ error: "Add a short note, valid date, and team member." }, { status: 400 })
  }

  const { data, error } = await supabaseServer
    .from("tasks")
    .insert([
      {
        title,
        due_date: dueDate,
        priority: "Medium",
        completed: false,
        assignee,
        notify_whole_team: notifyWholeTeam,
      },
    ])
    .select("id, title, due_date, assignee, notify_whole_team")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const user = await getRequestUser(request)
  const actor = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || "Smart Steel team"
  const notification = await sendReminderNotification({ task: data, actor, requestUrl: request.url })
  if (notification.success) {
    await supabaseServer.from("tasks").update({ reminder_notification_sent_at: new Date().toISOString() }).eq("id", data.id)
  }

  return NextResponse.json({
    record: normalizeTask(data),
    notification: notification.success
      ? { sent: true, recipients: notification.recipients }
      : { sent: false, warning: notification.reason },
  })
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
    .select("id, title, due_date, completed, assignee, notify_whole_team")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ record: normalizeTask(data), completed: Boolean(data.completed) })
}
