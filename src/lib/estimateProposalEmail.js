import { getEstimateBrandIdentity } from "./crmEstimateFollowUps"
import { SMART_STEEL_SITE_URL, smartSteelContact } from "./brandEntity"
import { reviewInvitationHtml } from "./quoteReview.mjs"

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function formatCurrency(value) {
  const amount = Number(value || 0)
  return `R ${amount.toLocaleString("en-ZA", { maximumFractionDigits: 2 })}`
}

export function buildProposalHtml({ lead, estimate, body, shareUrl, bookingUrl }) {
  const brandIdentity = getEstimateBrandIdentity(lead, estimate)
  const isAtlas = brandIdentity === "atlas"
  const isLsf = brandIdentity === "lsf"
  const input = estimate.input_data || {}
  const dimensions = input.width && input.length
    ? `${input.width}m × ${input.length}m${input.wallHeight ? ` × ${input.wallHeight}m` : ""}` : ""
  const scope = {
    structure_only: "Steel structure only", roof_only: "Roof sheeting",
    roof_and_sides: "Roof and side sheeting", fully_enclosed: "Roof and side walls sheeted",
    open_gable: "Roof sheeting", sheeted_gable: "Roof and side walls sheeted",
    fully_enclosed_with_gables: "Fully enclosed, including gables",
  }[input.gableMode || input.sheetingMode] || ""
  const identity = `${estimate.product_type || lead.product_type || ""} ${estimate.title || ""}`
  const showWarehousePhoto = isAtlas && !/solar|carport|ground.mount/i.test(identity)
  const message = String(body || "").split(/\r?\n\s*\r?\n/).map(paragraph => `<p style="margin:0 0 18px">${escapeHtml(paragraph).replace(/\r?\n/g, "<br>")}</p>`).join("")
  const accent = isAtlas ? "#0043f3" : "#da1a33"
  const dark = isAtlas ? "#001d2e" : "#020617"
  const logo = isAtlas ? `${SMART_STEEL_SITE_URL}/atlas/atlas-logo-horizontal-light.png` : `${SMART_STEEL_SITE_URL}/Logo.png`
  const brandName = isAtlas ? "Atlas by Smart Steel" : isLsf ? "Smart Steel LSF" : "Smart Steel"
  const serviceNotes = [
    input.installationDeferred ? "Installation is excluded and will be priced separately closer to the project date." : "",
    input.deliveryDeferred ? "Delivery is excluded and will be priced separately once the destination and transport requirements are confirmed." : "",
  ].filter(Boolean)

  return `<!doctype html>
<html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1"><meta charset="utf-8">
<style>@media only screen and (max-width:600px){.email-pad{padding-left:24px!important;padding-right:24px!important}.outer-pad{padding:0!important}.footer-column{display:block!important;width:100%!important}.footer-contact{padding:22px 0 0!important;text-align:left!important}}</style></head>
<body style="margin:0;padding:0;background:#eef3f6;font-family:Arial,Helvetica,sans-serif;color:${dark};">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#eef3f6"><tr><td align="center" class="outer-pad" style="padding:28px 12px">
<!--[if mso]><table role="presentation" width="720" align="center"><tr><td><![endif]-->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:720px;background:#ffffff">
<tr><td class="email-pad" style="padding:24px 40px;background:${dark};border-bottom:3px solid ${accent}"><img src="${logo}" alt="${brandName}" width="180" style="display:block;width:180px;max-width:100%;height:auto;border:0"></td></tr>
<tr><td class="email-pad" style="padding:32px 40px 10px"><div style="font-size:16px;line-height:1.75;color:#334155">${message}</div></td></tr>
<tr><td class="email-pad" style="padding:0 40px 32px">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f3f7fa;border:1px solid #dce6ed;border-top:3px solid ${accent};border-radius:0 0 8px 8px"><tr><td style="padding:24px">
<p style="margin:0 0 10px;font-size:12px;color:#526778;letter-spacing:1px;text-transform:uppercase">Your project · Estimate V${escapeHtml(estimate.version_no || 1)}</p>
<h1 style="margin:0 0 10px;font-size:22px;line-height:1.35;font-weight:600">${escapeHtml(estimate.title || "Your project proposal")}</h1>
${dimensions || scope ? `<p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#526778">${escapeHtml([dimensions, scope].filter(Boolean).join(" · "))}</p>` : ""}
<p style="margin:0;padding-top:16px;border-top:1px solid #dce6ed;font-size:28px;line-height:1.4;font-weight:700">${escapeHtml(formatCurrency(estimate.total))} <span style="font-size:13px;font-weight:400;color:#526778">excl. VAT</span></p>
<p style="margin:6px 0 0;font-size:13px;color:#526778">${escapeHtml(formatCurrency(Number(estimate.total || 0) * 1.15))} including 15% VAT</p>
${serviceNotes.map(note => `<p style="margin:14px 0 0;font-size:13px;line-height:1.6;color:#334155">${escapeHtml(note)}</p>`).join("")}
</td></tr></table>
<p style="margin:20px 0 16px;font-size:14px;line-height:1.6;color:#526778">Your estimate is attached as a PDF. You can also view it online below.</p>
<table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr><td bgcolor="${accent}" style="border-radius:6px"><a href="${escapeHtml(shareUrl)}" style="display:inline-block;padding:15px 24px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none">View your proposal</a></td></tr></table>
<p style="margin:20px 0 0;font-size:14px;line-height:1.7;color:#526778"><strong style="color:${dark};font-weight:600">What happens next?</strong><br>If the proposal looks right, you can accept it online. We’ll then confirm the next steps with you before proceeding. If you’d like to adjust anything, simply reply to this email.</p>
</td></tr>
${showWarehousePhoto ? `<tr><td><img src="${SMART_STEEL_SITE_URL}/atlas_warehouse_email.jpg" alt="Detail of an Atlas steel warehouse frame and ridge connections" width="720" style="display:block;width:100%;max-width:720px;height:auto;border:0"></td></tr><tr><td class="email-pad" style="padding:16px 40px 24px"><p style="margin:0;font-size:13px;line-height:1.6;color:#526778"><strong style="color:${dark};font-size:14px">A closer look at Atlas</strong><br>Steel frame and ridge connection detail. Your supplied structure follows the specifications in your proposal.</p></td></tr>` : ""}
<tr><td class="email-pad" style="padding:0 40px 28px">
${reviewInvitationHtml(bookingUrl)}
<p style="margin:12px 0 0;font-size:12px;line-height:1.7;color:#64748b">Please refer to your estimate for the detailed scope, exclusions, validity and commercial terms.</p>
</td></tr>
<tr><td class="email-pad" style="padding:30px 40px;background:${dark};border-top:3px solid ${accent}">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr>
<td class="footer-column" width="48%" valign="top">
<p style="margin:0 0 9px;font-size:18px;font-weight:700;letter-spacing:1px;color:#ffffff">${isAtlas ? "ATLAS SYSTEM" : brandName}</p>
<p style="margin:0;font-size:12px;line-height:1.7;color:#b9cdd9">${isAtlas ? "Developed by Smart Steel" : "Smart Steel Solutions"}</p>
<p style="margin:16px 0 0;font-size:13px"><a href="${SMART_STEEL_SITE_URL}" style="color:#ffffff;text-decoration:none">smartsteel.co.za</a></p>
</td>
<td class="footer-column footer-contact" width="52%" valign="top" align="right" style="padding-left:16px">
<p style="margin:0 0 10px;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#b9cdd9">Get in touch</p>
<p style="margin:0;font-size:14px;line-height:1.9"><a href="mailto:${smartSteelContact.email}" style="color:#ffffff;text-decoration:none">${smartSteelContact.email}</a><br><a href="tel:${smartSteelContact.telephone}" style="color:#ffffff;text-decoration:none">${smartSteelContact.displayTelephone}</a></p>
</td></tr></table>
</td></tr>
<tr><td class="email-pad" style="padding:22px 40px 26px;background:#e9f0f5">
<p style="margin:0 0 14px;font-size:12px;font-weight:700;line-height:1.6;color:${dark}">SMART STEEL SOLUTIONS (Pty) Ltd</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="font-size:12px;line-height:1.8;color:#526778">
<tr><td style="padding:0 16px 4px 0">Company registration</td><td align="right" style="padding-bottom:4px;color:${dark};white-space:nowrap">2025/739075/07</td></tr>
<tr><td style="padding-right:16px">VAT number</td><td align="right" style="color:${dark};white-space:nowrap">4390325704</td></tr>
</table>
</td></tr></table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr></table></body></html>`
}
