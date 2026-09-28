import fs from "node:fs"
import path from "node:path"
import { NextResponse } from "next/server"
import { requireOsAuth } from "lib/osRouteAuth"
import { getAtlasFoundationGuide } from "lib/atlasFoundationGuide"
import { launchEstimatePdfBrowser, renderHtmlPdf } from "lib/estimates/pdf"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

function formatNumber(value, digits = 2) {
  return Number(value).toLocaleString("en-ZA", { minimumFractionDigits: digits, maximumFractionDigits: digits })
}

function logoDataUri() {
  try {
    const logo = fs.readFileSync(path.join(process.cwd(), "public/atlas/atlas-logo-horizontal-dark.png"))
    return `data:image/png;base64,${logo.toString("base64")}`
  } catch {
    return ""
  }
}

function buildSectionSvg(guide) {
  const padX = 80
  const padY = 310
  const padW = 560
  const padH = 110
  const pedW = 120
  const pedX = padX + (padW - pedW) / 2
  const nglY = 220
  return `<svg viewBox="0 0 720 500" role="img" aria-label="Preliminary footing section">
    <defs><pattern id="soil" width="12" height="12" patternUnits="userSpaceOnUse"><path d="M0 12L12 0" stroke="#dce6ed" stroke-width="3"/></pattern><pattern id="concrete" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="3" cy="4" r="1.5" fill="#9aabb7"/><circle cx="11" cy="10" r="1.2" fill="#9aabb7"/></pattern></defs>
    <rect x="25" y="${nglY}" width="670" height="250" fill="url(#soil)"/><line x1="25" y1="${nglY}" x2="695" y2="${nglY}" stroke="#001d2e" stroke-width="4"/><text x="32" y="205" class="svg-label">NGL / finished external ground</text>
    <rect x="${padX}" y="${padY}" width="${padW}" height="${padH}" rx="2" fill="#e9eef2" stroke="#001d2e" stroke-width="4"/><rect x="${padX}" y="${padY}" width="${padW}" height="${padH}" fill="url(#concrete)" opacity=".75"/>
    <rect x="${pedX}" y="155" width="${pedW}" height="${padY - 155}" fill="#e9eef2" stroke="#001d2e" stroke-width="4"/><rect x="${pedX}" y="155" width="${pedW}" height="${padY - 155}" fill="url(#concrete)" opacity=".75"/>
    <rect x="${pedX + 24}" y="127" width="${pedW - 48}" height="28" fill="#0043f3"/><rect x="${pedX + 52}" y="75" width="${pedW - 104}" height="52" fill="#001d2e"/>
    <g stroke="#b10f1b" stroke-width="5" fill="none"><path d="M${pedX + 30} 285V184M${pedX + pedW - 30} 285V184"/><path d="M${pedX + 30} 285Q${pedX + 30} 345 ${pedX - 50} 345M${pedX + pedW - 30} 285Q${pedX + pedW - 30} 345 ${pedX + pedW + 50} 345"/><path d="M110 385H610"/></g>
    <g stroke="#0043f3" stroke-width="2" fill="none"><path d="M${padX} 452H${padX + padW}"/><path d="M${padX} 440V464M${padX + padW} 440V464"/><path d="M665 ${padY}V${padY + padH}"/><path d="M653 ${padY}H677M653 ${padY + padH}H677"/><path d="M53 ${nglY}V${padY + padH}"/><path d="M41 ${nglY}H65M41 ${padY + padH}H65"/></g>
    <text x="360" y="482" text-anchor="middle" class="svg-dim">1,250mm footing</text><text x="684" y="370" transform="rotate(-90 684 370)" text-anchor="middle" class="svg-dim">350mm</text><text x="72" y="320" transform="rotate(-90 72 320)" text-anchor="middle" class="svg-dim">650mm to underside</text>
    <text x="360" y="52" text-anchor="middle" class="svg-note">Atlas column and base connection shown diagrammatically</text><text x="475" y="145" class="svg-note">150mm min. projection</text><text x="482" y="275" class="svg-note">350 x 350 pedestal</text><text x="92" y="379" class="svg-note">Y12 @ 200 c/c bottom, both ways</text>
  </svg>`
}

function buildPlanSvg(guide) {
  const points = Array.from({ length: guide.portalFrames }, (_, index) => {
    const x = 75 + index * (570 / Math.max(1, guide.portalFrames - 1))
    return `<circle cx="${x}" cy="95" r="8"/><circle cx="${x}" cy="285" r="8"/><line x1="${x}" y1="95" x2="${x}" y2="285"/>`
  }).join("")
  return `<svg viewBox="0 0 720 390" role="img" aria-label="Warehouse footing setting-out plan"><rect x="75" y="95" width="570" height="190" fill="#f6f9fb" stroke="#001d2e" stroke-width="3"/><g stroke="#0043f3" stroke-width="2" fill="#0043f3">${points}</g><line x1="75" y1="330" x2="645" y2="330" stroke="#001d2e" stroke-width="2"/><path d="M75 320V340M645 320V340" stroke="#001d2e" stroke-width="2"/><text x="360" y="360" text-anchor="middle" class="svg-dim">${guide.lengthM}m overall · ${guide.bays} bays @ 4,000mm</text><line x1="35" y1="95" x2="35" y2="285" stroke="#001d2e" stroke-width="2"/><path d="M25 95H45M25 285H45" stroke="#001d2e" stroke-width="2"/><text x="18" y="190" transform="rotate(-90 18 190)" text-anchor="middle" class="svg-dim">${guide.spanM}m span</text><text x="360" y="55" text-anchor="middle" class="svg-label">${guide.footingCount} column footings · column centrelines govern setting-out</text></svg>`
}

function buildHtml(guide) {
  const logo = logoDataUri()
  const row = (label, value) => `<tr><th>${label}</th><td>${value}</td></tr>`
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    @page{size:A4;margin:0}*{box-sizing:border-box}body{margin:0;font-family:Arial,Helvetica,sans-serif;color:#001d2e;background:white}.page{width:210mm;min-height:297mm;padding:15mm 16mm 13mm;position:relative;break-after:page;page-break-after:always}.page+.page{break-before:page;page-break-before:always}.page:last-child{break-after:auto;page-break-after:auto}.header{display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid #001d2e;padding-bottom:7mm}.logo{width:61mm;height:14mm;object-fit:contain;object-position:left center}.doc-meta{text-align:right;font-size:8pt;line-height:1.5;color:#587080}.eyebrow{margin-top:9mm;color:#0043f3;font-size:8pt;font-weight:800;letter-spacing:1.8px;text-transform:uppercase}h1{font-size:25pt;line-height:1.06;margin:3mm 0 3mm;letter-spacing:-.7px}h2{font-size:15pt;margin:0 0 4mm}p{font-size:9pt;line-height:1.55;margin:0}.warning{margin-top:6mm;border-left:5px solid #b10f1b;background:#fff4f3;padding:4mm 5mm;color:#6f0a12}.warning strong{display:block;font-size:9pt;text-transform:uppercase;letter-spacing:.7px;margin-bottom:1.5mm}.grid{display:grid;grid-template-columns:1fr 1fr;gap:5mm;margin-top:6mm}.card{border:1px solid #dbe4ea;padding:5mm}.card.dark{background:#001d2e;color:#fff;border-color:#001d2e}.metric{font-size:20pt;font-weight:800;margin-top:1mm}.small{font-size:7.5pt;color:#607684}.dark .small{color:#b8c8d3}table{width:100%;border-collapse:collapse;font-size:8.5pt;margin-top:3mm}th,td{padding:2.7mm 3mm;border-bottom:1px solid #dbe4ea;text-align:left;vertical-align:top}th{width:38%;background:#f2f6f9;font-weight:800}.section{margin-top:7mm}.diagram{border:1px solid #dbe4ea;padding:3mm;margin-top:3mm}.diagram svg{width:100%;height:auto;display:block}.section-diagram{width:150mm;margin:3mm auto 0}.plan-diagram svg{height:91mm}.svg-label{font:700 18px Arial;fill:#001d2e}.svg-dim{font:700 16px Arial;fill:#0043f3}.svg-note{font:14px Arial;fill:#385161}.notes{display:grid;grid-template-columns:1fr 1fr;gap:3mm 6mm;margin:3mm 0 0;padding:0;list-style:none}.notes li{font-size:8pt;line-height:1.45;padding-left:5mm;position:relative}.notes li:before{content:'•';position:absolute;left:1mm;color:#0043f3;font-weight:bold}.footer{position:absolute;bottom:8mm;left:16mm;right:16mm;display:flex;justify-content:space-between;border-top:1px solid #dbe4ea;padding-top:3mm;font-size:7pt;color:#6b7f8b}.calc{background:#f2f6f9;border:1px solid #dbe4ea;padding:4mm;margin-top:4mm;font-size:8pt;line-height:1.55}.stamp{display:inline-block;background:#b10f1b;color:white;font-weight:800;padding:2mm 3mm;font-size:7.5pt;letter-spacing:.7px;text-transform:uppercase}
  </style></head><body>
  <section class="page"><header class="header">${logo ? `<img class="logo" src="${logo}">` : `<strong>ATLAS SYSTEM<br><small>DEVELOPED BY SMART STEEL</small></strong>`}<div class="doc-meta">Document: AT-FND-${guide.productCode}-${guide.revision}<br>Revision: ${guide.revision}<br>Configuration: ${guide.productCode} / ${guide.lengthM}m / ${guide.eaveHeightM}m</div></header>
  <div class="eyebrow">Atlas warehouse systems · engineering reference</div><h1>Preliminary foundation<br>and setting-out guide</h1><span class="stamp">Not for construction</span>
  <div class="warning"><strong>Preliminary guidance</strong><p>This document supports early planning and budgeting only. It is based on assumed favourable site conditions and the standard Atlas configuration stated above. A suitably qualified professional must verify ground conditions, loads, levels and the final foundation design before construction.</p></div>
  <div class="grid"><div class="card"><div class="small">Selected system</div><div class="metric">${guide.productCode}</div><p>${guide.spanM}m span × ${guide.lengthM}m length × ${guide.eaveHeightM}m eave</p></div><div class="card dark"><div class="small">Setting-out basis</div><div class="metric">${guide.footingCount} footings</div><p>${guide.portalFrames} portal frames at 4m modular bay spacing</p></div></div>
  <div class="section"><h2>1. Proposed foundation / concrete works</h2><table>${row("Number of footings", String(guide.footingCount))}${row("Proposed footing", "1,250 × 1,250 × 350mm deep")}${row("Proposed pedestal", `350 × 350 × ${guide.pedestalHeightMm}mm high, including 150mm projection above external ground`)}${row("Concrete", "25 MPa")}${row("Footing reinforcement", "Y12 @ 200mm centres, bottom, both ways")}${row("Pedestal reinforcement", "4-Y16 vertical bars with Y10 links @ 200mm centres")}${row("Concrete cover", "75mm footing; 40mm formed pedestal")}${row("Founding level", `${guide.footingUndersideBelowNglMm}mm nominal below NGL`)}${row("Allowable soil bearing", "100 kPa assumed - verify for site")}${row("Base connection", "Cast-in Atlas connection / anchors; geometry issued separately")}</table></div>
  <footer class="footer"><span>Smart Steel · Atlas System</span><span>${guide.status}</span><span>Page 1 of 3</span></footer></section>
  <section class="page"><header class="header">${logo ? `<img class="logo" src="${logo}">` : `<strong>ATLAS SYSTEM</strong>`}<div class="doc-meta">AT-FND-${guide.productCode}-${guide.revision}<br>${guide.productCode} · ${guide.lengthM}m · ${guide.eaveHeightM}m eave</div></header>
  <div class="section"><h2>2. Preliminary footing section</h2><div class="diagram section-diagram">${buildSectionSvg(guide)}</div></div>
  <div class="section"><h2>3. Design assumptions and limits</h2><ul class="notes"><li>Footings bear on competent natural material. Uncontrolled fill is not an acceptable founding stratum.</li><li>Allowable soil-bearing pressure is provisionally assumed as 100kPa and requires site confirmation.</li><li>The pad top is shown 300mm below external ground, with the pedestal projecting at least 150mm above ground to keep steel and anchors clear of standing water.</li><li>Finished floor level, slab interfaces and falls remain project-specific and must be coordinated before casting.</li><li>Provide positive drainage away from every pedestal. Do not allow paving, soil or ponding water to cover the base connection.</li><li>Concrete must achieve the specified 25MPa strength before structural erection begins.</li><li>4-Y16 pedestal bars are shown with 90-degree anchorage into the footing. Development length and bend geometry require engineer confirmation.</li><li>Wind uplift and overturning may govern. This preliminary bearing check does not verify structural capacity.</li></ul></div>
  <div class="section"><h2>4. Bearing assumption - preliminary arithmetic</h2><div class="calc">Footing area = 1.25m × 1.25m = <strong>${formatNumber(guide.footingAreaM2, 4)}m²</strong><br>Nominal allowable bearing at 100kPa = ${formatNumber(guide.footingAreaM2, 4)}m² × 100kN/m² = <strong>${formatNumber(guide.nominalAllowableBearingKn)}kN per footing</strong><br>Approximate concrete self-weight = ${formatNumber(guide.concretePerFootingM3, 3)}m³ × 24kN/m³ = <strong>${formatNumber(guide.foundationSelfWeightKn)}kN per footing</strong><br><br>This arithmetic records the chosen planning assumption. It is not a geotechnical assessment and does not include column compression, wind uplift, eccentricity or overturning.</div></div>
  <footer class="footer"><span>Smart Steel · Atlas System</span><span>${guide.status}</span><span>Page 2 of 3</span></footer></section>
  <section class="page"><header class="header">${logo ? `<img class="logo" src="${logo}">` : `<strong>ATLAS SYSTEM</strong>`}<div class="doc-meta">AT-FND-${guide.productCode}-${guide.revision}<br>${guide.productCode} · ${guide.lengthM}m · ${guide.eaveHeightM}m eave</div></header>
  <div class="section"><h2>5. Column and footing setting-out</h2><p>All dimensions are to structural column centrelines. Confirm diagonals, levels and the selected Atlas configuration before casting concrete.</p><div class="diagram plan-diagram">${buildPlanSvg(guide)}</div></div>
  <div class="section"><h2>6. Supply responsibilities</h2><table>${row("Smart Steel", "Atlas structural kit and cast-in anchors where expressly included in the quotation")}${row("Client / civil contractor", "Excavation, founding preparation, concrete, reinforcement, formwork, placement, curing, backfilling, levels and drainage unless expressly quoted otherwise")}${row("Professional verification", "Site conditions and final foundation design to be approved before construction")}</table></div>
  <div class="warning"><strong>Hold point</strong><p>Do not construct from this guide. Obtain confirmation of the soil assumption, reinforcement, founding levels and project-specific actions before releasing foundation work.</p></div>
  <footer class="footer"><span>Smart Steel · Atlas System</span><span>${guide.status}</span><span>Page 3 of 3</span></footer></section>
  </body></html>`
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const localPreview = process.env.NODE_ENV === "development" && searchParams.get("preview") === "1"
  if (!localPreview) {
    const authResponse = await requireOsAuth(request)
    if (authResponse) return authResponse
  }
  const guide = getAtlasFoundationGuide({
    productCode: searchParams.get("product"),
    lengthM: searchParams.get("length"),
    eaveHeightM: searchParams.get("height"),
  })

  try {
    const browser = await launchEstimatePdfBrowser()
    const pdf = await renderHtmlPdf({ browser, html: buildHtml(guide) })
    const filename = `atlas-${guide.productCode.toLowerCase()}-${guide.spanM}x${guide.lengthM}x${guide.eaveHeightM}-preliminary-foundation-guide.pdf`
    return new NextResponse(pdf, { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${filename}"`, "Cache-Control": "private, no-store" } })
  } catch (error) {
    console.error("Could not generate Atlas foundation guide:", error)
    return NextResponse.json({ error: "Could not generate the foundation guide." }, { status: 500 })
  }
}
