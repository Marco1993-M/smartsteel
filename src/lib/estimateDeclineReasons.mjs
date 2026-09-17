export const ESTIMATE_DECLINE_REASONS = [
  { key: "price", label: "Price was above my budget" },
  { key: "another_supplier", label: "Chose another supplier" },
  { key: "postponed", label: "Project postponed" },
  { key: "cancelled", label: "Project cancelled" },
  { key: "scope", label: "Quote didn't match what I needed" },
  { key: "other", label: "Other" },
]

export function parseDeclineFeedback(choice, reason, comment) {
  // Ignore stale feedback when the client changes to a different response.
  if (choice !== "not_proceeding") return { reason: null, comment: null }
  const selected = reason || null
  if (selected !== null && !ESTIMATE_DECLINE_REASONS.some((item) => item.key === selected)) {
    throw new Error("Choose a valid reason or leave it blank.")
  }
  if (comment != null && typeof comment !== "string") throw new Error("Enter a valid comment.")
  const text = (comment || "").trim()
  if (text.length > 1000) throw new Error("Please keep your comment under 1,000 characters.")
  return { reason: selected, comment: text || null }
}

export function buildDeclineSummary(responses) {
  // One latest answer per estimate sequence prevents repeat submissions inflating counts.
  const latest = new Map()
  for (const response of responses) {
    const previous = latest.get(response.sequence_id)
    if (!previous || response.created_at >= previous.created_at) latest.set(response.sequence_id, response)
  }
  const declined = [...latest.values()].filter((item) => item.response_key === "not_proceeding")
  const reasons = [...ESTIMATE_DECLINE_REASONS, { key: "not_provided", label: "Reason not provided" }].map((reason) => {
    const value = declined.filter((item) => (item.decline_reason || "not_provided") === reason.key).length
    return { ...reason, value, percentage: declined.length ? Math.round(value / declined.length * 100) : 0 }
  })
  return { total: declined.length, withReason: declined.filter((item) => item.decline_reason).length, reasons }
}
