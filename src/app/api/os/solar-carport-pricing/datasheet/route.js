import fs from "node:fs"
import path from "node:path"
import { NextResponse } from "next/server"
import { requireOsAuth } from "lib/osRouteAuth"
import { launchEstimatePdfBrowser, renderHtmlPdf } from "lib/estimates/pdf"
import { calculateAtlasSolarCarportEstimate } from "lib/estimates/atlasSolarCarportEstimate"
import { ATLAS_SOLAR_CARPORT_PARKING_COUNTS, getAtlasSolarCarportPanelCount, getAtlasSolarCarportSiteLayout, getAtlasSolarCarportWidth, placeAtlasSolarCarportRun } from "lib/atlasSolarCarportLayouts"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

function parseRuns(value) {
  const entries = String(value || "").split(",")
  if (!entries.length || entries.length > 8) throw new Error("Choose between one and eight supported parking runs.")
  return entries.reduce((runs, entry, index) => {
    const match = entry.match(/^(\d+(?:\.\d+)?)x(6|12)$/)
    if (!match) throw new Error("Invalid parking run dimensions.")
    const width = Number(match[1])
    const length = Number(match[2])
    const parkingCount = ATLAS_SOLAR_CARPORT_PARKING_COUNTS.find((count) => getAtlasSolarCarportWidth(count) === width)
    if (!parkingCount) throw new Error("Unsupported Atlas parking width.")
    const run = { id: `run-${index + 1}`, width, length, parkingCount, moduleCount: getAtlasSolarCarportPanelCount(width, length), x: 0, z: 0, rotationDeg: 0 }
    return [...runs, placeAtlasSolarCarportRun(runs, run)]
  }, [])
}

const n = (value, digits = 1) => digits ? Number(value || 0).toFixed(digits) : Number(value || 0).toLocaleString("en-ZA", { maximumFractionDigits: 0 })

function buildPlanSvg(runs) {
  const layout = getAtlasSolarCarportSiteLayout(runs)
  const scale = Math.min(18, 900 / Math.max(layout.width, 1), 340 / Math.max(layout.depth, 1))
  const pad = 55
  const viewWidth = layout.width * scale + pad * 2
  const viewHeight = layout.depth * scale + pad * 2
  const xOf = (x) => pad + (x - layout.minX) * scale
  const yOf = (z) => pad + (z - layout.minZ) * scale
  const shapes = layout.runs.map((run, index) => {
    const width = run.width * scale
    const depth = run.length * scale
    const left = xOf(run.x) - width / 2
    const top = yOf(run.z) - depth / 2
    const divisions = Array.from({ length: run.parkingCount - 1 }, (_, division) => `<line x1="${left + (division + 1) * width / run.parkingCount}" y1="${top}" x2="${left + (division + 1) * width / run.parkingCount}" y2="${top + depth}" stroke="#c1d9e5"/>`).join("")
    return `<g><rect x="${left}" y="${top}" width="${width}" height="${depth}" rx="4" fill="#fff" stroke="#0043f3" stroke-width="2.5"/>${divisions}<rect x="${xOf(run.x) - 35}" y="${yOf(run.z) - 11}" width="70" height="22" rx="11" fill="#001d2e"/><text x="${xOf(run.x)}" y="${yOf(run.z) + 4}" text-anchor="middle" fill="#fff" font-size="11" font-weight="700">Run ${String.fromCharCode(65 + index)}</text></g>`
  }).join("")
  return `<svg class="plan" viewBox="0 0 ${viewWidth} ${viewHeight}" xmlns="http://www.w3.org/2000/svg"><rect width="${viewWidth}" height="${viewHeight}" fill="#edf4f8"/>${shapes}</svg>`
}

function buildHtml(runs, estimate) {
  const logo = `data:image/png;base64,${fs.readFileSync(path.join(process.cwd(), "public/atlas/atlas-logo-horizontal-dark.png")).toString("base64")}`
  const generated = new Intl.DateTimeFormat("en-ZA", { day: "2-digit", month: "long", year: "numeric", timeZone: "Africa/Johannesburg" }).format(new Date())
  const longest = Math.max(...estimate.members.map((member) => member.cutLengthM))
  const planSvg = buildPlanSvg(runs)
  const totalSpaces = runs.reduce((sum, run) => sum + run.parkingCount * (run.length === 12 ? 2 : 1), 0)
  const pages = runs.map((run, index) => {
    const members = estimate.members.filter((member) => member.run === index + 1)
    const connections = estimate.connections.filter((item) => item.run === index + 1)
    return `<section class="page">
      <header><img src="${logo}" alt="Atlas System"><div>ATLAS SOLAR CARPORTS<br>Transport and member schedule · ${generated}</div></header>
      <div class="heading"><div><p class="eyebrow">PLANNING DATA · RUN ${String.fromCharCode(65 + index)}</p><h1>${index === 0 ? "Material & transport data sheet" : `Run ${String.fromCharCode(65 + index)} · member schedule`}</h1><p>${run.parkingCount * (run.length === 12 ? 2 : 1)} spaces · ${run.width}m wide × ${run.length}m deep · ${run.length === 12 ? "double-sided butterfly" : "single-sided"}</p></div><span class="badge">ZAM STEEL</span></div>
      ${index === 0 ? `<div class="metrics"><div><small>Parking runs</small><strong>${runs.length}</strong></div><div><small>Total spaces</small><strong>${totalSpaces}</strong></div><div><small>Steel mass</small><strong>${n(estimate.totals.steelKg, 0)}kg</strong></div><div><small>Longest cut member</small><strong>${n(longest, 3)}m</strong></div><div><small>Panel interfaces</small><strong>${estimate.totals.totalModules}</strong></div></div><div class="plan-shell">${planSvg}</div>` : ""}
      <h2>Steel members · run ${String.fromCharCode(65 + index)}</h2><table class="members"><thead><tr><th>Member</th><th>Profile / gauge</th><th class="num">Pieces</th><th class="num">Cut length</th><th class="num">Total length</th><th class="num">Mass</th></tr></thead><tbody>${members.map((member) => `<tr><td><strong>${member.label}</strong><small>${member.code}</small></td><td>${member.profile.section}</td><td class="num">${member.quantity}</td><td class="num">${n(member.cutLengthM, 3)}m</td><td class="num">${n(member.totalLengthM, 2)}m</td><td class="num"><strong>${n(member.totalMassKg, 1)}kg</strong></td></tr>`).join("")}</tbody></table>
      <h2 class="connections-title">Connection schedule · provisional</h2><div class="connections">${connections.map((item) => `<div><strong>${item.code}</strong> ${item.label}<span>${item.quantity} each</span></div>`).join("")}</div>
      <aside><strong>Transport planning</strong><span>Use ${n(longest, 3)}m as the controlling cut length for this layout. Steel mass excludes brackets, anchors, bolts, packing and any solar panels. Verify bundle lengths, quantities and vehicle selection against the final manufacturing and dispatch schedule.</span></aside>
      <footer><span>Atlas System · Developed by Smart Steel</span><span>Indicative logistics reference · not a fabrication drawing</span><span>Page ${index + 1} of ${runs.length}</span></footer>
    </section>`
  }).join("")
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    @page{size:A4 landscape;margin:0}*{box-sizing:border-box}body{margin:0;font:8pt Arial,Helvetica,sans-serif;color:#001d2e;background:#fff}.page{position:relative;width:297mm;height:210mm;padding:9mm 12mm 13mm;break-after:page;overflow:hidden}.page:last-child{break-after:auto}header{height:15mm;display:flex;align-items:flex-start;justify-content:space-between;border-bottom:2px solid #001d2e}header img{width:51mm;height:11mm;object-fit:contain;object-position:left}header div{text-align:right;font-size:6.5pt;font-weight:700;line-height:1.5;color:#526878}.heading{display:flex;align-items:center;justify-content:space-between;gap:8mm;margin:4mm 0}.heading h1{font-size:21pt;line-height:1.08;margin:1mm 0;color:#001d2e}.heading p{margin:0;font-size:8pt;color:#526878}.heading .eyebrow{color:#0043f3;font-size:6.5pt;font-weight:800;letter-spacing:1.4px}.badge{background:#0043f3;color:#fff;padding:2.5mm 4mm;font-size:7pt;font-weight:800;white-space:nowrap}.metrics{display:grid;grid-template-columns:repeat(5,1fr);gap:2mm;margin-bottom:3mm}.metrics div{border:1px solid #d9e2e8;background:#f5f9fb;padding:2mm 3mm}.metrics small{display:block;color:#526878;text-transform:uppercase;font-size:6pt;font-weight:800}.metrics strong{display:block;margin-top:1mm;font-size:13pt}.plan-shell{height:29mm;border:1px solid #d9e2e8;background:#edf4f8;display:flex;align-items:center;justify-content:center}.plan{width:100%;height:100%}h2{font-size:9pt;margin:3mm 0 1.5mm}table{width:100%;border-collapse:collapse;table-layout:fixed}th{background:#001d2e;color:#fff;text-align:left;font-size:6.5pt;padding:1.8mm;text-transform:uppercase}td{border-bottom:1px solid #dfe7eb;padding:1.4mm 1.8mm;font-size:7.2pt;vertical-align:middle}tr:nth-child(even){background:#f8fafb}td small{display:block;color:#667b91;font-size:6pt}.members th:nth-child(1){width:24%}.members th:nth-child(2){width:31%}.num{text-align:right;white-space:nowrap}.connections-title{margin-top:3mm}.connections{display:grid;grid-template-columns:repeat(4,1fr);gap:1mm}.connections div{background:#f2f6f9;padding:1.6mm 2mm;font-size:6.5pt;line-height:1.2}.connections strong{color:#0043f3}.connections span{display:block;margin-top:1mm;font-weight:800}aside{display:flex;gap:3mm;margin-top:3mm;border-top:2px solid #0043f3;background:#eef4f8;padding:2.5mm 3mm;font-size:7pt;line-height:1.3}aside strong{min-width:25mm;text-transform:uppercase}footer{position:absolute;left:12mm;right:12mm;bottom:5mm;display:flex;justify-content:space-between;border-top:1px solid #d9e2e8;padding-top:2mm;color:#667b91;font-size:6pt}
  </style></head><body>${pages}</body></html>`
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const preview = process.env.NODE_ENV === "development" && searchParams.get("preview") === "1"
  if (!preview) {
    const auth = await requireOsAuth(request)
    if (auth) return auth
  }
  try {
    const runs = parseRuns(searchParams.get("runs"))
    const estimate = calculateAtlasSolarCarportEstimate({ parkingRuns: runs, scope: "supply_only", deliveryDistance: 0 })
    const browser = await launchEstimatePdfBrowser()
    const pdf = await renderHtmlPdf({ browser, html: buildHtml(runs, estimate), landscape: true })
    return new NextResponse(pdf, { headers: { "Content-Type": "application/pdf", "Content-Disposition": 'attachment; filename="atlas-solar-carport-transport-data-sheet.pdf"', "Cache-Control": "private, no-store" } })
  } catch (error) {
    console.error("Could not generate solar carport data sheet:", error)
    return NextResponse.json({ error: error?.message || "Could not generate data sheet." }, { status: 500 })
  }
}
