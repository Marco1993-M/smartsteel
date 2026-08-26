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

export const ESTIMATE_RESPONSE_OPTIONS = [
  {
    key: "call_me",
    label: "I'm interested - please call me",
    shortLabel: "Please call me",
    helper: "The Smart Steel team will contact you to discuss the next step.",
    marker: "01",
  },
  {
    key: "request_changes",
    label: "I'd like to change the estimate",
    shortLabel: "I need changes",
    helper: "We will contact you to understand what should be revised.",
    marker: "02",
  },
  {
    key: "considering",
    label: "I'm still considering it",
    shortLabel: "Still considering",
    helper: "No pressure. We will keep the estimate open and check in later.",
    marker: "03",
  },
  {
    key: "not_proceeding",
    label: "I'm not proceeding right now",
    shortLabel: "Not proceeding",
    helper: "We will pause the follow-ups. You can return whenever the timing is right.",
    marker: "04",
  },
]

export function getEstimateResponseOption(key) {
  return ESTIMATE_RESPONSE_OPTIONS.find((option) => option.key === key) || null
}

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

export function buildFollowUpHtml({ copy, estimate, shareUrl, responseBaseUrl, isAtlas }) {
  const identity = estimate?.brandIdentity || (isAtlas ? "atlas" : "smart-steel")
  const isLsf = identity === "lsf"
  const accent = identity === "atlas" ? "#0043f3" : "#da1a33"
  const dark = identity === "atlas" ? "#001d2e" : "#020617"
  const brand = identity === "atlas"
    ? "Atlas developed by Smart Steel"
    : isLsf
      ? "Smart Steel LSF"
      : "Smart Steel"
  const logo = identity === "atlas"
    ? "https://www.smartsteel.co.za/atlas/atlas-logo-horizontal-light.png"
    : "https://www.smartsteel.co.za/LogoWhite.png"
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

  return `<!doctype html><html lang="en"><head><style>
    @media only screen and (max-width:520px) {
      .response-cell { display:block !important; width:100% !important; padding-right:0 !important; padding-left:0 !important; }
      .response-card { min-height:0 !important; }
    }
  </style></head><body style="margin:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:24px 12px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#fff;border:1px solid #dbe4ee;">
      <tr><td style="padding:24px 28px;background:${dark};border-top:5px solid ${accent};color:#fff;">
        <img src="${logo}" alt="${brand}" width="210" style="display:block;max-width:210px;height:auto;border:0;margin:0 0 24px;">
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
        ${responseBaseUrl ? `<div style="margin-top:28px;padding-top:24px;border-top:1px solid #e2e8f0;">
          <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:${accent};">One quick question</p>
          <h2 style="margin:0 0 15px;font-size:19px;line-height:1.3;color:#0f172a;">Where are you with your project?</h2>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            ${[0, 2].map((startIndex) => `<tr>
              ${ESTIMATE_RESPONSE_OPTIONS.slice(startIndex, startIndex + 2).map((option, optionIndex) => `<td class="response-cell" width="50%" valign="top" style="padding:${startIndex === 0 ? "0" : "6px"} ${optionIndex === 0 ? "6px" : "0"} 6px ${optionIndex === 0 ? "0" : "6px"};">
                <a class="response-card" href="${responseBaseUrl}?choice=${option.key}" style="display:block;min-height:126px;padding:16px;border:1px solid #cbd5e1;background:#fff;color:#0f172a;text-decoration:none;">
                  <span style="display:inline-block;margin:0 0 13px;padding:8px 9px;background:${option.key === "call_me" ? accent : "#c1d9e5"};color:${option.key === "call_me" ? "#ffffff" : dark};font-size:11px;font-weight:800;letter-spacing:1px;">${option.marker}</span>
                  <span style="display:block;font-size:13px;font-weight:800;line-height:1.4;">${option.label}</span>
                  <span style="display:block;margin-top:7px;color:#64748b;font-size:11px;font-weight:400;line-height:1.55;">${option.helper}</span>
                </a>
              </td>`).join("")}
            </tr>`).join("")}
          </table>
        </div>` : ""}
        <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#64748b;">Reply directly to this email and the Smart Steel team will assist you.</p>
      </td></tr>
      <tr><td style="padding:18px 28px;background:${dark};color:#cbd5e1;font-size:12px;">info@smartsteel.co.za · +27 82 846 4555 · smartsteel.co.za</td></tr>
    </table>
  </td></tr></table></body></html>`
}

export function isAtlasEstimate(lead, estimate) {
  return getEstimateBrandIdentity(lead, estimate) === "atlas"
}

export function getEstimateBrandIdentity(lead, estimate) {
  const identity = `${lead?.product_type || ""} ${estimate?.product_type || ""} ${estimate?.product_type_display || ""} ${estimate?.title || ""}`.toLowerCase()
  if (["atlas", "lcss", "cflc", "lip channel", "lipped channel", "solar carport", "solar ground mount"]
    .some((term) => identity.includes(term))) return "atlas"
  if (["lsf", "light steel frame", "lightweight steel"]
    .some((term) => identity.includes(term))) return "lsf"
  return "smart-steel"
}
