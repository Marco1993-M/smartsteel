import { reviewInvitationHtml } from "./quoteReview.mjs"

const FOLLOW_UP_STEPS = [
  {
    number: 1,
    businessDays: 2,
    subject: (estimate) => `How is your ${getSubjectProjectName(estimate)} proposal looking?`,
    heading: "How is your proposal looking?",
    message: (clientName) => `Hi ${clientName},\n\nJust checking in to see if you've had a chance to look through the estimate we sent for your project.\n\nWe'd love to hear how the pricing and proposed scope align with what you have in mind.\n\nIf there are any questions, or adjustments we can make to better suit your requirements or budget, we'd be happy to explore the options with you.\n\nLooking forward to hearing your thoughts!\n\nKind regards,\nThe Smart Steel Team`,
  },
  {
    number: 2,
    businessDays: 5,
    subject: (estimate) => `A few things worth considering for your ${getSubjectProjectName(estimate)}`,
    heading: "A few things worth considering",
    message: (clientName) => `Hi ${clientName},\n\nWe know there's quite a bit to consider when planning a steel structure, and finding the right solution involves more than just comparing prices.\n\nAt Smart Steel, we focus on providing practical, cost-effective structures backed by sound engineering and a system designed for efficient manufacturing and installation.\n\nWhen comparing quotations, it's worth looking at the complete scope, including the structural specifications, foundations, delivery, installation and any exclusions.\n\nIf you're weighing up a few options, we'd be happy to help you work through the details and make sure you're comparing like for like.\n\nYou can also take a look at some of our completed projects below to get a better idea of our work.\n\nKind regards,\nThe Smart Steel Team`,
    showProof: true,
  },
  {
    number: 3,
    businessDays: 7,
    subject: (estimate) => `Where are things standing with your ${getSubjectProjectName(estimate)}?`,
    heading: "Where are things standing?",
    message: (clientName) => `Hi ${clientName},\n\nJust one last check-in from our side regarding your project estimate.\n\nWe understand that projects don't always move forward immediately, and timelines and priorities can change along the way.\n\nWhether you're ready to take the next step, still considering your options, or planning for a later date, we'd be happy to hear where things stand.\n\nIf there's anything we can assist with in the meantime, feel free to reach out.\n\nWe'd love the opportunity to work with you when the time is right!\n\nKind regards,\nThe Smart Steel Team`,
  },
]

function getSubjectProjectName(estimate) {
  return String(estimate?.title || "Smart Steel")
    .replace(/^your\s+/i, "")
    .replace(/\s+(?:proposal|estimate|quotation)(?:\s+v\d+)?$/i, "")
    .trim() || "Smart Steel"
}

export const ESTIMATE_RESPONSE_OPTIONS = [
  {
    key: "call_me",
    label: "Ready to proceed",
    shortLabel: "Ready to proceed",
    helper: "Smart Steel will contact you to confirm the next step.",
    marker: "01",
  },
  {
    key: "request_changes",
    label: "I need a change",
    shortLabel: "I need changes",
    helper: "We will contact you to understand what should be revised.",
    marker: "02",
  },
  {
    key: "considering",
    label: "Planning for later",
    shortLabel: "Planning for later",
    helper: "We will keep the project context and reconnect at a more suitable time.",
    marker: "03",
  },
  {
    key: "not_proceeding",
    label: "No longer needed",
    shortLabel: "No longer needed",
    helper: "We will stop the follow-ups. You are welcome to return in future.",
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

  const clientName = String(lead?.name || "")
    .replace(/\s+(?:website enquiry|solar carport enquiry|warehouse builder)\s*$/i, "")
    .trim()
    .split(/\s+/)[0] || "there"
  return {
    subject: step.subject(estimate || {}),
    heading: step.heading,
    body: step.message(clientName),
    showProof: Boolean(step.showProof),
  }
}

export function buildFollowUpHtml({ copy, estimate, shareUrl, responseBaseUrl, isAtlas, bookingUrl }) {
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

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>
    @media only screen and (max-width:520px) {
      .follow-up-padding { padding-left:20px !important; padding-right:20px !important; }
    }
  </style></head><body style="margin:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:24px 12px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#fff;border:1px solid #dbe4ee;">
      <tr><td style="padding:24px 28px;background:${dark};border-top:5px solid ${accent};color:#fff;">
        <img src="${logo}" alt="${brand}" width="210" style="display:block;max-width:210px;height:auto;border:0;margin:0 0 24px;">
        <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#cbd5e1;">${brand}</p>
        <h1 style="margin:0;font-size:25px;line-height:1.2;">${copy.heading}</h1>
      </td></tr>
      <tr><td class="follow-up-padding" style="padding:28px;">
        <div style="font-size:15px;line-height:1.75;color:#334155;">${escapedBody}</div>
        <div style="margin:24px 0;padding:16px 18px;background:#f8fafc;border-left:4px solid ${accent};">
          <p style="margin:0 0 5px;font-size:11px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:#64748b;">Estimate</p>
          <p style="margin:0;font-size:15px;font-weight:700;color:#0f172a;">${escapedTitle}</p>
        </div>
        <a href="${shareUrl}" style="display:inline-block;padding:13px 18px;background:${accent};color:#fff;text-decoration:none;font-size:14px;font-weight:700;">View estimate</a>
        ${copy.showProof ? `<div style="margin-top:22px;padding:18px;background:#f8fafc;border:1px solid #dbe4ee;">
          <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:${accent};">Completed work</p>
          <p style="margin:0 0 12px;color:#475569;font-size:13px;line-height:1.6;">See recent Smart Steel structures and installations completed on real South African sites.</p>
          <a href="https://www.smartsteel.co.za/recent" style="color:${accent};font-size:13px;font-weight:700;">View recent projects →</a>
        </div>` : ""}
        ${responseBaseUrl ? `<div style="margin-top:28px;padding-top:24px;border-top:1px solid #e2e8f0;">
          <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:${accent};">One quick question</p>
          <h2 style="margin:0 0 15px;font-size:19px;line-height:1.3;color:#0f172a;">Where are you with your project?</h2>
          <p style="margin:0 0 16px;font-size:13px;line-height:1.6;color:#64748b;">Choose the option that best fits, or simply reply to this email.</p>
          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;">
            ${ESTIMATE_RESPONSE_OPTIONS.map(option => {
              const primary = option.key === "call_me"
              const label = primary ? "Review &amp; accept quote" : option.label
              const helper = primary ? "Review the scope and next steps before confirming acceptance online." : option.helper
              const href = primary ? `${shareUrl}#accept-quote` : `${responseBaseUrl}?choice=${option.key}`
              return `<tr><td style="padding:0 0 10px;">
                <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;"><tr>
                  <td bgcolor="${primary ? dark : "#f8fafc"}" style="border:1px solid ${primary ? dark : "#dbe4ee"};text-align:left;">
                    <a href="${href}" style="display:block;padding:14px 16px 5px;color:${primary ? "#ffffff" : dark};font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;line-height:1.4;text-decoration:none;">${label} &rarr;</a>
                    <p style="margin:0;padding:0 16px 14px;color:${primary ? "#c1d9e5" : "#64748b"};font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:400;line-height:1.5;">${helper}</p>
                  </td>
                </tr></table>
              </td></tr>`
            }).join("")}
          </table>
        </div>` : ""}
        ${reviewInvitationHtml(bookingUrl)}
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
  if (getAtlasWarehouseIdentityTerms()
    .some((term) => identity.includes(term))) return "atlas"
  if (["lsf", "light steel frame", "lightweight steel"]
    .some((term) => identity.includes(term))) return "lsf"
  return "smart-steel"
}
import { getAtlasWarehouseIdentityTerms } from "./atlasProductIdentity.js"
