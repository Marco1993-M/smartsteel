import { supabaseServer } from "lib/supabase-server"

const TEAM_EMAILS = {
  Marco: process.env.REMINDER_MARCO_EMAIL || "info@smartsteel.co.za",
  Stefan: process.env.REMINDER_STEFAN_EMAIL || "stefan@smartsteel.co.za",
  Niel: process.env.REMINDER_NIEL_EMAIL || "niel@smartsteel.co.za",
}

const TEAM_MEMBERS = Object.keys(TEAM_EMAILS)

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

function formatReminderDate(value) {
  if (!value) return "Not scheduled"
  return new Date(`${value}T12:00:00`).toLocaleDateString("en-ZA", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function getRecipients(task) {
  if (task.notify_whole_team) return Object.values(TEAM_EMAILS)
  return task.assignee && TEAM_EMAILS[task.assignee] ? [TEAM_EMAILS[task.assignee]] : []
}

function buildReminderHtml({ task, actor, overdue, appUrl }) {
  const accent = overdue ? "#dc2626" : "#0043f3"
  const eyebrow = overdue ? "OVERDUE REMINDER" : "NEW REMINDER"
  const heading = overdue ? "A reminder needs attention." : "A reminder was added."

  return `
    <div style="margin:0;background:#eef4f8;padding:32px 16px;font-family:Arial,sans-serif;color:#001d2e;">
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #dbe5ee;">
        <tr><td style="height:8px;background:${accent};font-size:0;line-height:0;">&nbsp;</td></tr>
        <tr>
          <td style="padding:34px 36px 18px;">
            <p style="margin:0 0 14px;color:${accent};font-size:12px;font-weight:800;letter-spacing:2px;">SMART STEEL OS · ${eyebrow}</p>
            <h1 style="margin:0;font-size:28px;line-height:1.2;">${heading}</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 36px 30px;">
            <div style="border-left:4px solid ${accent};background:#f7fafc;padding:20px 22px;">
              <p style="margin:0 0 14px;font-size:20px;font-weight:800;line-height:1.4;">${escapeHtml(task.title)}</p>
              <p style="margin:5px 0;color:#52647b;font-size:14px;"><strong style="color:#001d2e;">Due:</strong> ${escapeHtml(formatReminderDate(task.due_date))}</p>
              <p style="margin:5px 0;color:#52647b;font-size:14px;"><strong style="color:#001d2e;">Assigned to:</strong> ${escapeHtml(task.assignee || "Unassigned")}</p>
              ${actor ? `<p style="margin:5px 0;color:#52647b;font-size:14px;"><strong style="color:#001d2e;">Added by:</strong> ${escapeHtml(actor)}</p>` : ""}
            </div>
            <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:24px;"><tr><td style="background:#001d2e;">
              <a href="${escapeHtml(appUrl)}" style="display:inline-block;padding:14px 22px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:800;">Open Smart Steel OS</a>
            </td></tr></table>
          </td>
        </tr>
      </table>
    </div>
  `
}

export function isReminderAssignee(value) {
  return TEAM_MEMBERS.includes(String(value || ""))
}

export async function sendReminderNotification({ task, actor = "Smart Steel team", overdue = false, requestUrl }) {
  if (!process.env.RESEND_API_KEY) return { success: false, reason: "Email service is not configured." }

  const recipients = getRecipients(task)
  if (!recipients.length) return { success: false, reason: "No reminder recipient is configured." }

  const appUrl = new URL("/os#weekly-note-board", requestUrl || "https://www.smartsteel.co.za").toString()
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `os-reminder-${task.id}-${overdue ? "overdue" : "created"}`,
    },
    body: JSON.stringify({
      from: process.env.CRM_NOTIFICATION_FROM || "Smart Steel OS <crm@smartsteel.co.za>",
      to: recipients,
      reply_to: "info@smartsteel.co.za",
      subject: overdue ? `Overdue reminder: ${task.title}` : `New reminder: ${task.title}`,
      html: buildReminderHtml({ task, actor, overdue, appUrl }),
    }),
  })

  if (!response.ok) return { success: false, reason: await response.text() }
  const payload = await response.json().catch(() => null)
  return { success: true, reference: payload?.id || null, recipients }
}

export async function processOverdueReminderNotifications({ requestUrl, limit = 25 } = {}) {
  if (!process.env.RESEND_API_KEY) return { processed: 0, skipped: "Email service is not configured." }

  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Johannesburg" })
  const { data, error } = await supabaseServer
    .from("tasks")
    .select("id, title, due_date, assignee, notify_whole_team, overdue_notification_sent_at")
    .eq("completed", false)
    .lt("due_date", today)
    .is("overdue_notification_sent_at", null)
    .order("due_date", { ascending: true })
    .limit(limit)

  if (error) return { processed: 0, error: error.message }

  const results = []
  for (const task of data || []) {
    const delivery = await sendReminderNotification({ task, overdue: true, requestUrl })
    if (delivery.success) {
      await supabaseServer.from("tasks").update({ overdue_notification_sent_at: new Date().toISOString() }).eq("id", task.id)
    }
    results.push({ id: task.id, ...delivery })
  }

  return { processed: results.length, results }
}
