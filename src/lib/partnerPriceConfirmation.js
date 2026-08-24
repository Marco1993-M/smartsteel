import fs from "node:fs"
import path from "node:path"
import { calculateAtlasWarehouseEstimate } from "./estimates/atlasWarehouseEstimate.js"
import { launchEstimatePdfBrowser, renderHtmlPdf } from "./estimates/pdf.js"

const money = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
  minimumFractionDigits: 2,
})

const date = new Intl.DateTimeFormat("en-ZA", {
  day: "numeric",
  month: "long",
  year: "numeric",
})

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

function imageData(file) {
  try {
    return `data:image/png;base64,${fs.readFileSync(path.join(process.cwd(), "public", file)).toString("base64")}`
  } catch {
    return ""
  }
}

function addDays(value, days) {
  const result = new Date(value)
  result.setDate(result.getDate() + days)
  return result
}

function scopeLabel(mode) {
  if (mode === "roof_only" || mode === "open_gable") return "Roof sheeting"
  if (mode === "fully_enclosed" || mode === "sheeted_gable") return "Roof and walls sheeted"
  return "Structure only"
}

function supplyRows(estimate) {
  const structural = estimate.lineItems.filter((item) => !/-(BAS|RDG|EAV|XBR-BRK|M10-SET|ANC|SHT)$/.test(item.code))
  const connections = estimate.lineItems.filter((item) => /-(BAS|RDG|EAV|XBR-BRK|M10-SET|ANC)$/.test(item.code))
  const sheeting = estimate.lineItems.filter((item) => /-SHT$/.test(item.code))

  return [
    ...structural.map((item) => ({ ...item, group: "Structural frame" })),
    ...connections.map((item) => ({ ...item, group: "Connection pack" })),
    ...sheeting.map((item) => ({ ...item, group: "Sheeting" })),
  ]
}

export async function createPartnerPriceConfirmationPdf(opportunity) {
  if (opportunity.status !== "quoted" || Number(opportunity.final_quote_amount_ex_vat) <= 0) {
    throw new Error("This price must be approved before a confirmation document can be issued.")
  }

  const estimate = calculateAtlasWarehouseEstimate(opportunity.configuration || {})
  const config = estimate.input
  const issueDate = new Date(opportunity.quoted_at || opportunity.updated_at || Date.now())
  const validUntil = addDays(issueDate, 14)
  const approvedExVat = Number(opportunity.final_quote_amount_ex_vat)
  const vat = approvedExVat * 0.15
  const recommendedPrice = approvedExVat / 0.95
  const adjustment = recommendedPrice - approvedExVat
  const documentNumber = `APC-${opportunity.reference}-R1`
  const rows = supplyRows(estimate)
  const atlasLogo = imageData("atlas/atlas-logo-horizontal-dark.png")
  const afgriLogo = imageData("afgri-logo-colour-cropped.png")

  const html = `<!doctype html>
  <html><head><meta charset="utf-8"><style>
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; }
    body { margin: 0; color: #001d2e; font-family: Arial, Helvetica, sans-serif; background: white; }
    .page { position: relative; min-height: 297mm; padding: 18mm 17mm 16mm; page-break-after: always; overflow: hidden; }
    .page:last-child { page-break-after: auto; }
    .brandline { position:absolute; z-index:3; inset:0 0 auto; height:7mm; background:linear-gradient(90deg,#001d2e 0 35%,#0043f3 100%); }
    .slash { position:absolute; z-index:0; right:-18mm; top:-20mm; width:58mm; height:118mm; background:#c1d9e5; transform:rotate(35deg); opacity:.45; }
    .page > *:not(.brandline):not(.slash):not(.footer) { position:relative; z-index:1; }
    .logos { display:flex; align-items:center; justify-content:space-between; gap:18mm; height:18mm; }
    .logos img:first-child { width:58mm; max-height:15mm; object-fit:contain; object-position:left center; }
    .logos img:last-child { width:30mm; max-height:13mm; object-fit:contain; object-position:right center; mix-blend-mode:multiply; }
    .eyebrow { margin-top:17mm; color:#0043f3; font-size:9px; font-weight:800; letter-spacing:3px; text-transform:uppercase; }
    h1 { margin:5mm 0 3mm; max-width:145mm; font-size:31px; line-height:1.05; letter-spacing:-1.2px; }
    .lede { max-width:145mm; color:#52657d; font-size:12px; line-height:1.55; }
    .price-card { margin-top:11mm; display:grid; grid-template-columns:1.45fr .8fr; background:linear-gradient(110deg,#001d2e 0%,#063783 48%,#0043f3 100%); color:white; }
    .price-main { padding:9mm; background:transparent; }
    .price-main .label,.price-side .label { color:#c1d9e5; font-size:8px; font-weight:800; letter-spacing:1.7px; text-transform:uppercase; }
    .price-main .amount { margin-top:4mm; font-size:32px; font-weight:900; letter-spacing:-1px; }
    .price-main .sub { margin-top:2mm; color:#b9c8da; font-size:9px; text-transform:uppercase; letter-spacing:1.3px; }
    .price-side { padding:9mm 7mm; border-left:1px solid rgba(255,255,255,.2); background:transparent; }
    .price-side .amount { margin-top:4mm; font-size:21px; font-weight:900; }
    .price-side .sub { margin-top:2mm; color:#c1d9e5; font-size:9px; }
    .facts { display:grid; grid-template-columns:repeat(3,1fr); margin-top:8mm; border:1px solid #d8e2ec; }
    .fact { min-height:21mm; padding:5mm; border-right:1px solid #d8e2ec; }
    .fact:nth-child(3n) { border-right:0; }
    .fact:nth-child(n+4) { border-top:1px solid #d8e2ec; }
    .fact .label { color:#7b8da4; font-size:7px; font-weight:800; letter-spacing:1.4px; text-transform:uppercase; }
    .fact .value { margin-top:2mm; font-size:11px; font-weight:800; line-height:1.3; }
    .commercial { margin-top:8mm; display:grid; grid-template-columns:1fr 1fr; gap:5mm; }
    .commercial-box { padding:5mm; background:#eef4f8; }
    .commercial-box .label { color:#667a92; font-size:7px; font-weight:800; letter-spacing:1.3px; text-transform:uppercase; }
    .commercial-box .value { margin-top:2.5mm; font-size:15px; font-weight:900; }
    .commercial-box.accent { background:#c1d9e5; color:#0043f3; }
    .footer { position:absolute; z-index:2; left:17mm; right:17mm; bottom:10mm; display:flex; justify-content:space-between; border-top:1px solid #d8e2ec; padding-top:3mm; color:#72839a; font-size:7px; }
    .section-head { margin-top:16mm; display:flex; justify-content:space-between; align-items:end; border-bottom:2px solid #001d2e; padding-bottom:4mm; }
    .section-head h2 { margin:0; font-size:24px; letter-spacing:-.7px; }
    .section-head span { color:#0043f3; font-size:8px; font-weight:800; letter-spacing:1.4px; text-transform:uppercase; }
    table { width:100%; margin-top:7mm; border-collapse:collapse; table-layout:fixed; }
    th { padding:3mm; background:#001d2e; color:white; font-size:7px; letter-spacing:1.1px; text-align:left; text-transform:uppercase; }
    td { padding:3mm; border-bottom:1px solid #d8e2ec; font-size:8.5px; vertical-align:top; }
    td:nth-child(1) { width:26%; color:#52657d; font-weight:700; }
    td:nth-child(2) { width:42%; font-weight:800; }
    td:nth-child(3) { width:13%; text-align:right; font-weight:800; }
    td:nth-child(4) { width:19%; color:#52657d; }
    .conditions { display:grid; grid-template-columns:1fr 1fr; gap:5mm; margin-top:8mm; }
    .condition { padding:5mm; border:1px solid #d8e2ec; }
    .condition h3 { margin:0 0 3mm; color:#0043f3; font-size:9px; letter-spacing:1.4px; text-transform:uppercase; }
    .condition ul { margin:0; padding-left:4mm; }
    .condition li { margin-bottom:2mm; color:#52657d; font-size:8.5px; line-height:1.45; }
    .notice { margin-top:7mm; padding:5mm; background:#fff8dd; border-left:3px solid #f3c316; color:#4e4a35; font-size:8.5px; line-height:1.5; }
    .notes { display:grid; grid-template-columns:1fr 1fr; gap:5mm; margin-top:8mm; }
    .note { min-height:31mm; padding:5mm; background:#eef4f8; }
    .note .label { color:#0043f3; font-size:7px; font-weight:800; letter-spacing:1.3px; text-transform:uppercase; }
    .note p { margin:3mm 0 0; color:#52657d; font-size:9px; line-height:1.55; white-space:pre-wrap; }
  </style></head><body>
    <section class="page"><div class="brandline"></div><div class="slash"></div>
      <div class="logos">${atlasLogo ? `<img src="${atlasLogo}">` : "<strong>ATLAS BY SMART STEEL</strong>"}${afgriLogo ? `<img src="${afgriLogo}">` : "<strong>AFGRI</strong>"}</div>
      <p class="eyebrow">Partner price confirmation</p>
      <h1>${escapeHtml(estimate.summary.title)}</h1>
      <p class="lede">A reviewed Atlas supply configuration prepared for ${escapeHtml(opportunity.customer_name)} through AFGRI. This document confirms the approved partner price and the exact configuration used for that approval.</p>
      <div class="price-card"><div class="price-main"><div class="label">Approved AFGRI price</div><div class="amount">${money.format(approvedExVat)}</div><div class="sub">Excluding VAT</div></div><div class="price-side"><div class="label">Total including VAT</div><div class="amount">${money.format(approvedExVat + vat)}</div><div class="sub">VAT ${money.format(vat)}</div></div></div>
      <div class="facts">
        <div class="fact"><div class="label">Reference</div><div class="value">${escapeHtml(opportunity.reference)}</div></div>
        <div class="fact"><div class="label">Issued</div><div class="value">${date.format(issueDate)}</div></div>
        <div class="fact"><div class="label">Valid until</div><div class="value">${date.format(validUntil)}</div></div>
        <div class="fact"><div class="label">Customer</div><div class="value">${escapeHtml(opportunity.customer_name)}</div></div>
        <div class="fact"><div class="label">Site</div><div class="value">${escapeHtml(opportunity.site_location || "To be confirmed")}</div></div>
        <div class="fact"><div class="label">Document</div><div class="value">${escapeHtml(documentNumber)}</div></div>
      </div>
      <div class="commercial"><div class="commercial-box"><div class="label">Recommended customer price excl. VAT</div><div class="value">${money.format(recommendedPrice)}</div></div><div class="commercial-box accent"><div class="label">AFGRI partner adjustment · 5%</div><div class="value">-${money.format(adjustment)}</div></div></div>
      <div class="footer"><span>ATLAS SYSTEM · DEVELOPED BY SMART STEEL</span><span>${escapeHtml(documentNumber)} · PAGE 1 OF 3</span></div>
    </section>
    <section class="page"><div class="brandline"></div>
      <div class="section-head"><h2>Confirmed configuration</h2><span>${escapeHtml(estimate.meta.pricingRelease)}</span></div>
      <div class="facts">
        <div class="fact"><div class="label">Atlas SKU</div><div class="value">${escapeHtml(estimate.meta.sku)}</div></div>
        <div class="fact"><div class="label">Size</div><div class="value">${config.width}m × ${config.length}m × ${config.wallHeight}m</div></div>
        <div class="fact"><div class="label">Steel finish</div><div class="value">${escapeHtml(config.steelFinish)}</div></div>
        <div class="fact"><div class="label">Supply scope</div><div class="value">${escapeHtml(scopeLabel(config.gableMode))}</div></div>
        <div class="fact"><div class="label">Sheeting</div><div class="value">${estimate.sheeting.totalSheetingArea ? `${escapeHtml(config.sheetingProfile)} · ${escapeHtml(estimate.labels.sheetingFinish)}` : "Not included"}</div></div>
        <div class="fact"><div class="label">Commercial basis</div><div class="value">Supply only</div></div>
      </div>
      <table><thead><tr><th>Group</th><th>Component / supply item</th><th>Qty</th><th>Unit</th></tr></thead><tbody>${rows.map((item) => `<tr><td>${escapeHtml(item.group)}</td><td>${escapeHtml(item.label)}</td><td>${escapeHtml(item.quantity)}</td><td>${escapeHtml(item.unit)}</td></tr>`).join("")}</tbody></table>
      <div class="footer"><span>ATLAS SYSTEM · CONFIRMED SUPPLY CONFIGURATION</span><span>${escapeHtml(documentNumber)} · PAGE 2 OF 3</span></div>
    </section>
    <section class="page"><div class="brandline"></div><div class="slash"></div>
      <div class="logos">${atlasLogo ? `<img src="${atlasLogo}">` : "<strong>ATLAS BY SMART STEEL</strong>"}${afgriLogo ? `<img src="${afgriLogo}">` : "<strong>AFGRI</strong>"}</div>
      <div class="section-head"><h2>Commercial record</h2><span>Partner handoff</span></div>
      <div class="conditions">
        <div class="condition"><h3>Included</h3><ul><li>Atlas structural members for the configuration shown.</li><li>Connection hardware allowances included in the approved price.</li><li>Selected sheeting only where recorded above.</li><li>Smart Steel review of the released commercial configuration.</li></ul></div>
        <div class="condition"><h3>Excluded unless confirmed</h3><ul><li>Delivery, offloading and installation.</li><li>Foundations, concrete works and site preparation.</li><li>Electrical, solar panels and specialist services.</li><li>Project-specific changes outside the confirmed configuration.</li></ul></div>
      </div>
      <div class="notes">
        <div class="note"><div class="label">Project notes</div><p>${escapeHtml(opportunity.notes || "No additional project notes were recorded.")}</p></div>
        <div class="note"><div class="label">Smart Steel message</div><p>${escapeHtml(opportunity.partner_quote_message || "The reviewed Atlas configuration and approved AFGRI price are ready for the next customer discussion.")}</p></div>
      </div>
      <div class="notice"><strong>Commercial record:</strong> This partner price confirmation is not a customer quotation, tax invoice, engineering certificate, purchase order, or instruction to manufacture. Price and scope apply only to the configuration recorded above. Any change to size, finish, sheeting, site requirements, or supply scope requires a new review. Manufacture proceeds only after the required formal order, technical confirmation, and agreed payment conditions.</div>
      <div class="footer"><span>SMART STEEL · info@smartsteel.co.za · smartsteel.co.za</span><span>${escapeHtml(documentNumber)} · PAGE 3 OF 3</span></div>
    </section>
  </body></html>`

  const browser = await launchEstimatePdfBrowser()
  const shouldCloseBrowser = !process.env.VERCEL && !process.env.AWS_REGION && !process.env.AWS_EXECUTION_ENV
  try {
    return await renderHtmlPdf({ browser, html })
  } finally {
    if (shouldCloseBrowser) await browser.close().catch(() => {})
  }
}
