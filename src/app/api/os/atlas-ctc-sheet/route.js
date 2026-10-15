import { NextResponse } from "next/server"
import { getOsRequestContext } from "lib/osRouteAuth"
import { calculateAtlasWarehouseEstimate } from "lib/estimates/atlasWarehouseEstimate"
import { W08_SUPPLIER_REFERENCE } from "lib/atlasW08SupplierCosts"
import { launchEstimatePdfBrowser, renderHtmlPdf } from "lib/estimates/pdf"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

const PRODUCTS = new Set(["W06", "W08", "W10", "W12", "W15"])
const money = (value) => `R ${Number(value || 0).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char])

function buildHtml(estimate, exactSupplierReference) {
  const { input, pricing, lineItems } = estimate
  const steel = lineItems.filter((item) => /-(COL|RAF|PUR|XBW|XBR|GRT|APH|GBC|APX|HCH)$/.test(item.code))
  const brackets = lineItems.filter((item) => /-(HCH\d|APX\d|BRC\d|GSP|BAS|RDG|EAV|SPL|XBR-BRK)$/.test(item.code))
  const otherConnections = lineItems.filter((item) => /-(M10-SET|ANC)$/.test(item.code))
  const row = (item) => `<tr><td>${escapeHtml(item.label)}</td><td>${Number(item.quantity).toLocaleString("en-ZA")}</td><td>${money(item.unitRate)}</td><td>${money(item.total)}</td></tr>`
  const total = (items) => items.reduce((sum, item) => sum + item.total, 0)
  const quote = exactSupplierReference ? `<div class="callout"><strong>Actual supplier quote · W08 8 × 16 × 3m roof-only steel and brackets</strong><span>Formed steel ${money(W08_SUPPLIER_REFERENCE.steelCost)} · PC34–PC45 brackets ${money(W08_SUPPLIER_REFERENCE.bracketCost)} · combined ${money(W08_SUPPLIER_REFERENCE.steelCost + W08_SUPPLIER_REFERENCE.bracketCost)} excl. VAT.</span><small>Tubecon Africa ${W08_SUPPLIER_REFERENCE.steelQuote}; Tubecon Laser ${W08_SUPPLIER_REFERENCE.bracketQuote}. Excludes fixings, anchors, cladding, delivery and installation.</small></div>` : ""
  return `<!doctype html><html><head><meta charset="utf-8"><style>@page{size:A4;margin:10mm}*{box-sizing:border-box}body{font-family:Arial,Helvetica,sans-serif;color:#001d2e;font-size:9pt;margin:0}header{display:flex;justify-content:space-between;align-items:end;border-bottom:3px solid #0043f3;padding-bottom:3mm}h1{font-size:23pt;margin:1mm 0}h2{font-size:12pt;margin:4mm 0 1mm}.eyebrow{font-size:8pt;font-weight:800;letter-spacing:2px;color:#0043f3}.badge{background:#001d2e;color:white;padding:2mm 3mm;font-size:8pt;font-weight:bold}.meta{display:flex;gap:4mm;margin:3mm 0}.meta div{flex:1;padding:3mm;background:#edf3f7}.meta strong{display:block;font-size:14pt;margin-top:2mm}.note{font-size:8pt;line-height:1.5;color:#536676}.callout{border-left:4px solid #0043f3;background:#eef3ff;padding:3mm;margin:3mm 0}.callout strong,.callout span,.callout small{display:block;margin-bottom:2mm}.callout small{font-size:8pt}table{width:100%;border-collapse:collapse;font-size:8pt}th,td{padding:1.2mm;border-bottom:1px solid #dce5eb;text-align:left}th{background:#edf3f7}td:nth-child(n+2),th:nth-child(n+2){text-align:right}tfoot td{font-weight:800;background:#f5f8fa}.section{break-inside:avoid}footer{margin-top:4mm;border-top:1px solid #ccd8e0;padding-top:3mm;font-size:7pt;color:#536676}</style></head><body><header><div><div class="eyebrow">ATLAS SYSTEM · SMART STEEL</div><h1>Internal costing basis</h1><div>Warehouse ${escapeHtml(estimate.meta.productCode)} · ${input.width} × ${input.length} × ${input.wallHeight}m · ${escapeHtml(input.steelFinish)}</div></div><span class="badge">INTERNAL ONLY</span></header><div class="meta"><div>Modelled steel cost<strong>${money(pricing.steelCost)}</strong></div><div>Modelled connections<strong>${money(pricing.connectionCost)}</strong></div><div>Structure basis excl. VAT<strong>${money(pricing.steelCost + pricing.connectionCost)}</strong></div></div><p class="note">Planning cost basis from the current Atlas estimate logic. This is not a supplier purchase order or a client price. The steel rate remains the released per-kg allowance; supplier CTC is shown separately only where a matching quote exists. Zero-cost anchors and provisional quantities require confirmation before discount decisions.</p>${quote}<div class="section"><h2>Structural members · ${money(total(steel))}</h2><table><thead><tr><th>Item</th><th>Qty</th><th>Unit basis</th><th>Total basis</th></tr></thead><tbody>${steel.map(row).join("")}</tbody></table></div><div class="section"><h2>Brackets · ${money(total(brackets))}</h2><table><thead><tr><th>Item</th><th>Qty</th><th>Unit basis</th><th>Total basis</th></tr></thead><tbody>${brackets.map(row).join("")}</tbody></table></div><div class="section"><h2>Fixings and anchors · ${money(total(otherConnections))}</h2><table><thead><tr><th>Item</th><th>Qty</th><th>Unit basis</th><th>Total basis</th></tr></thead><tbody>${otherConnections.map(row).join("")}</tbody></table></div><footer>Confidential Smart Steel commercial reference · generated for the selected Atlas configuration · excludes sheeting, delivery, installation and VAT</footer></body></html>`
}

export async function GET(request) {
  const context = await getOsRequestContext(request)
  if (context.response) return context.response
  if (String(context.user.email || "").toLowerCase() !== "info@smartsteel.co.za") return NextResponse.json({ error: "Owner access required." }, { status: 403 })
  const params = new URL(request.url).searchParams
  const product = String(params.get("product") || "").toUpperCase()
  if (!PRODUCTS.has(product)) return NextResponse.json({ error: "Unsupported Atlas product." }, { status: 400 })
  const width = Number(product.slice(1))
  try {
    const estimate = calculateAtlasWarehouseEstimate({ width, length: Number(params.get("length")), wallHeight: Number(params.get("height")), steelFinish: params.get("material") || "ZAM", gableMode: "structure_only" })
    const exactSupplierReference = product === "W08" && estimate.input.length === 16 && estimate.input.wallHeight === 3 && estimate.input.steelFinish === "ZAM"
    const browser = await launchEstimatePdfBrowser()
    const pdf = await renderHtmlPdf({ browser, html: buildHtml(estimate, exactSupplierReference) })
    return new NextResponse(pdf, { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="atlas-${product.toLowerCase()}-${estimate.input.width}x${estimate.input.length}x${estimate.input.wallHeight}-internal-ctc.pdf"`, "Cache-Control": "private, no-store" } })
  } catch (error) {
    console.error("Could not generate Atlas internal CTC sheet:", error)
    return NextResponse.json({ error: "Could not generate the internal CTC sheet." }, { status: 500 })
  }
}
