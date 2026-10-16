export const REVIEW_HOST = { name: "Marco", email: "info@smartsteel.co.za", timeZone: "Africa/Johannesburg" }
export const REVIEW_DURATION_MINUTES = 15
export const REVIEW_NOTICE_HOURS = 2
export const REVIEW_HORIZON_DAYS = 21
export const REVIEW_OUTCOMES = ["ready_to_proceed", "revision_required", "awaiting_decision", "awaiting_site", "planning_later", "lost"]
export const REVIEW_OUTCOME_LABELS = { ready_to_proceed: "Ready to proceed", revision_required: "Revision required", awaiting_decision: "Awaiting customer decision", awaiting_site: "Awaiting site / other prerequisite", planning_later: "Planning for later", lost: "Lost — reason recorded" }

export function reviewDateKey(value) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: REVIEW_HOST.timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value))
}

export function reviewSlots(now = new Date(), unavailable = []) {
  const blocked = new Set(unavailable.map((value) => new Date(value).toISOString()))
  const firstDay = new Date(`${reviewDateKey(now)}T00:00:00+02:00`)
  const dates = []
  for (let day = 0; day < REVIEW_HORIZON_DAYS; day++) {
    const date = new Date(firstDay.getTime() + day * 86400000)
    const key = reviewDateKey(date)
    const weekday = new Date(`${key}T12:00:00Z`).getUTCDay()
    if (weekday === 0 || weekday === 6) continue
    const slots = []
    for (let hour = 8; hour < 17; hour++) {
      const start = new Date(`${key}T${String(hour).padStart(2, "0")}:00:00+02:00`)
      if (start.getTime() < new Date(now).getTime() + REVIEW_NOTICE_HOURS * 3600000 || blocked.has(start.toISOString())) continue
      slots.push(start.toISOString())
    }
    if (slots.length) dates.push({ date: key, slots })
  }
  return dates
}

export function validReviewSlot(value, now = new Date()) {
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return false
  return reviewSlots(now).some((day) => day.slots.includes(date.toISOString()))
}

export function formatReviewTime(value, timeZone = REVIEW_HOST.timeZone) {
  return new Intl.DateTimeFormat("en-ZA", { timeZone, dateStyle: "full", timeStyle: "short" }).format(new Date(value))
}

export function quoteReviewUrl(token, siteUrl = "https://www.smartsteel.co.za") {
  return token ? new URL(`/quote-review/${encodeURIComponent(token)}`, siteUrl).toString() : ""
}

export function escapeReviewHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character])
}

export function reviewInvitationHtml(url) {
  if (!url) return ""
  return `<div style="margin:26px 0;padding:20px;border:1px solid #dbe4ee;border-radius:8px;background:#f8fafc;"><h2 style="margin:0 0 10px;font-size:18px;color:#001d2e;">Let’s talk through your proposal</h2><p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#475569;">Book a 15-minute phone call with Marco to walk through the proposed scope and answer your questions.</p><a href="${escapeReviewHtml(url)}" style="display:inline-block;padding:12px 16px;border:1px solid #001d2e;border-radius:5px;color:#001d2e;font-size:14px;font-weight:700;text-decoration:none;">Choose a call time</a><p style="margin:12px 0 0;font-size:12px;color:#64748b;">Or simply reply to this email. Booking a call is optional.</p></div>`
}

export function reviewMailApplies(job, review, now = new Date()) {
  if (!review || review.revision !== job.revision) return false
  const cancellation = job.kind.endsWith("cancellation")
  if (cancellation ? review.status !== "cancelled" : review.status !== "booked") return false
  return !job.kind.endsWith("reminder") || new Date(review.starts_at) > new Date(now)
}
