const FOLLOW_UP_STEPS = [
  {
    number: 1,
    businessDays: 3,
    subject: (estimate) => `Following up on ${estimate.title || "your Smart Steel estimate"}`,
    heading: "Did you receive your estimate?",
    message: (clientName) => `Good day ${clientName},\n\nI wanted to make sure the estimate reached you and that the proposed scope is clear. If you would like us to explain anything or adjust the configuration, simply reply to this email and we will help.`,
  },
  {
    number: 2,
    businessDays: 3,
    subject: (estimate) => `Can we refine ${estimate.title || "your Smart Steel estimate"}?`,
    heading: "Would an adjustment help?",
    message: (clientName) => `Good day ${clientName},\n\nI am checking in on the estimate we sent. If the scope, budget or timing needs to change, we can review practical alternatives with you rather than leaving you with a proposal that does not quite fit.`,
  },
  {
    number: 3,
    businessDays: 5,
    subject: (estimate) => `Should we keep ${estimate.title || "your project"} open?`,
    heading: "Should we keep your project open?",
    message: (clientName) => `Good day ${clientName},\n\nThis is our final scheduled follow-up on the estimate. If the project is still being considered, reply when convenient and we will keep helping. If the timing is not right, that is completely fine and we can reconnect when you are ready.`,
  },
]

export function getFollowUpStep(stepNumber) {
  return FOLLOW_UP_STEPS.find((step) => step.number === Number(stepNumber)) || null
}

export function addBusinessDaysAtSendTime(value, businessDays) {
  const date = new Date(value)
  let remaining = Number(businessDays || 0)

  while (remaining > 0) {
    date.setUTCDate(date.getUTCDate() + 1)
    const day = date.getUTCDay()
    if (day !== 0 && day !== 6) remaining -= 1
  }

  // 08:00 in South Africa (UTC+2), giving the daily worker a stable send time.
  date.setUTCHours(6, 0, 0, 0)
  return date.toISOString()
}

export function getNextFollowUpAt(from, nextStepNumber) {
  const step = getFollowUpStep(nextStepNumber)
  return step ? addBusinessDaysAtSendTime(from, step.businessDays) : null
}

export function getFollowUpPlan() {
  return FOLLOW_UP_STEPS.map(({ number, businessDays, heading }) => ({ number, businessDays, heading }))
}

export function buildFollowUpCopy({ stepNumber, lead, estimate }) {
  const step = getFollowUpStep(stepNumber)
  if (!step) return null

  const clientName = [lead?.name, lead?.last_name].filter(Boolean).join(" ").trim() || "there"
  return {
    subject: step.subject(estimate || {}),
    heading: step.heading,
    body: step.message(clientName),
  }
}

export function buildFollowUpHtml({ copy, estimate, shareUrl, isAtlas }) {
  const accent = isAtlas ? "#0043f3" : "#da1a33"
  const dark = isAtlas ? "#001d2e" : "#020617"
  const brand = isAtlas ? "Atlas developed by Smart Steel" : "Smart Steel"
  const escapedBody = String(copy.body || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\r?\n/g, "<br>")
  const escapedTitle = String(estimate?.title || `Estimate V${estimate?.version_no || 1}`)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")

  return `<!doctype html><html lang="en"><body style="margin:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:24px 12px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#fff;border:1px solid #dbe4ee;">
      <tr><td style="padding:24px 28px;background:${dark};border-top:5px solid ${accent};color:#fff;">
        <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#cbd5e1;">${brand}</p>
        <h1 style="margin:0;font-size:25px;line-height:1.2;">${copy.heading}</h1>
      </td></tr>
      <tr><td style="padding:28px;">
        <div style="font-size:15px;line-height:1.75;color:#334155;">${escapedBody}</div>
        <div style="margin:24px 0;padding:16px 18px;background:#f8fafc;border-left:4px solid ${accent};">
          <p style="margin:0 0 5px;font-size:11px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:#64748b;">Estimate</p>
          <p style="margin:0;font-size:15px;font-weight:700;color:#0f172a;">${escapedTitle}</p>
        </div>
        <a href="${shareUrl}" style="display:inline-block;padding:13px 18px;background:${accent};color:#fff;text-decoration:none;font-size:14px;font-weight:700;">View estimate</a>
        <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#64748b;">Reply directly to this email and the Smart Steel team will assist you.</p>
      </td></tr>
      <tr><td style="padding:18px 28px;background:${dark};color:#cbd5e1;font-size:12px;">info@smartsteel.co.za · +27 82 846 4555 · smartsteel.co.za</td></tr>
    </table>
  </td></tr></table></body></html>`
}

export function isAtlasEstimate(lead, estimate) {
  const identity = `${lead?.product_type || ""} ${estimate?.product_type_display || ""} ${estimate?.title || ""}`.toLowerCase()
  return ["atlas", "cflc", "lip channel", "lipped channel", "solar carport", "solar ground mount"]
    .some((term) => identity.includes(term))
}
