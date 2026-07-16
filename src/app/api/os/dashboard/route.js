import { NextResponse } from "next/server"
import { requireOsAuth } from "lib/osRouteAuth"
import { supabaseServer } from "lib/supabase-server"

export const runtime = "nodejs"

function startOfCurrentWeek() {
  const date = new Date()
  const day = date.getDay() || 7
  date.setDate(date.getDate() - day + 1)
  date.setHours(0, 0, 0, 0)
  return date.toISOString()
}

function isBeforeToday(value) {
  if (!value) return false
  const date = new Date(value)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Number.isFinite(date.getTime()) && date < today
}

function leadName(lead) {
  return [lead.name, lead.last_name].filter(Boolean).join(" ").trim() || "Unnamed lead"
}

function buildPriorities(leads, tasks, documents) {
  const overdueFollowUps = leads
    .filter((lead) => !["won", "lost"].includes(String(lead.status || "").toLowerCase()) && isBeforeToday(lead.follow_up_at))
    .map((lead) => ({
      id: `lead-${lead.id}`,
      title: `Follow up with ${leadName(lead)}`,
      helper: lead.next_action || "The follow-up date has passed.",
      tone: "urgent",
      href: `/os/crm?leadId=${encodeURIComponent(lead.id)}`,
    }))

  const dueTasks = tasks.map((task) => ({
    id: `task-${task.id}`,
    title: task.title,
    helper: task.due_date ? `Scheduled for ${new Date(`${task.due_date}T00:00:00`).toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}.` : "Scheduled task",
    tone: isBeforeToday(task.due_date) ? "urgent" : "today",
    href: "/os#weekly-note-board",
  }))

  const reviews = documents
    .filter((document) => document.status === "needs_review")
    .map((document) => ({
      id: `document-${document.id}`,
      title: `Review ${document.title}`,
      helper: `${document.platform_key === "atlas" ? "Atlas" : "LSF"} document needs review.`,
      tone: "today",
      href: document.platform_key === "atlas" ? "/os/atlas/documents" : "/os/lsf/documents",
    }))

  const newLeads = leads
    .filter((lead) => String(lead.status || "").toLowerCase() === "new")
    .map((lead) => ({
      id: `new-lead-${lead.id}`,
      title: `Review new lead: ${leadName(lead)}`,
      helper: lead.next_action || "Confirm requirements and the next step.",
      tone: "neutral",
      href: `/os/crm?leadId=${encodeURIComponent(lead.id)}`,
    }))

  return [...overdueFollowUps, ...dueTasks, ...reviews, ...newLeads].slice(0, 3)
}

export async function GET(request) {
  const authResponse = await requireOsAuth(request)
  if (authResponse) return authResponse

  const [leadsResult, tasksResult, documentsResult] = await Promise.all([
    supabaseServer.from("leads").select("id, name, last_name, status, next_action, follow_up_at, created_at").order("created_at", { ascending: false }).limit(100),
    supabaseServer.from("tasks").select("id, title, due_date").eq("completed", false).order("due_date", { ascending: true }).limit(20),
    supabaseServer.from("os_documents").select("id, title, platform_key, status").eq("status", "needs_review").limit(10),
  ])

  const warnings = []
  if (leadsResult.error) warnings.push("CRM priorities are temporarily unavailable.")
  if (tasksResult.error) warnings.push("Reminders are temporarily unavailable.")
  if (documentsResult.error) warnings.push("Document reviews are temporarily unavailable.")

  const leads = leadsResult.error ? [] : leadsResult.data || []
  const tasks = tasksResult.error ? [] : tasksResult.data || []
  const documents = documentsResult.error ? [] : documentsResult.data || []
  const weekStart = startOfCurrentWeek()

  return NextResponse.json({
    priorities: buildPriorities(leads, tasks, documents),
    pulse: {
      newLeadsThisWeek: leads.filter((lead) => lead.created_at && lead.created_at >= weekStart).length,
      activeQuotes: leads.filter((lead) => String(lead.status || "").toLowerCase() === "quoted").length,
    },
    warnings,
  })
}
