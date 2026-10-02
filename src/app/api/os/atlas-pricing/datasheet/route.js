import fs from "node:fs"
import path from "node:path"
import { NextResponse } from "next/server"
import { requireOsAuth } from "lib/osRouteAuth"
import { launchEstimatePdfBrowser, renderHtmlPdf } from "lib/estimates/pdf"
import { calculateAtlasWarehouseEstimate } from "lib/estimates/atlasWarehouseEstimate"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

const SUPPORTED_PRODUCTS = new Set(["W06", "W08", "W10", "W12", "W15"])
const MATERIAL_LABELS = { ZAM: "ZAM", Galv: "Galvanised", Mild: "Mild steel" }

function assetDataUri(relativePath) {
  try {
    const asset = fs.readFileSync(path.join(process.cwd(), relativePath))
    return `data:image/png;base64,${asset.toString("base64")}`
  } catch {
    return ""
  }
}

function number(value, digits = 2) {
  return Number(value || 0).toLocaleString("en-ZA", { minimumFractionDigits: digits, maximumFractionDigits: digits })
}

function activeMemberSchedule(estimate) {
  const mode = estimate.input.gableMode
  const includesLongWalls = ["fully_enclosed", "fully_enclosed_with_gables"].includes(mode)
  const includesGables = mode === "fully_enclosed_with_gables"
  const excluded = new Set([
    ...(!includesLongWalls ? ["sideGirts"] : []),
    ...(!includesGables ? ["frontGableColumns", "rearGableColumns"] : []),
  ])
  const rows = Object.entries(estimate.materials.geometry.members)
    .filter(([key]) => !excluded.has(key))
    .map(([, member]) => ({ ...member }))

  if (includesGables && estimate.materials.gableGirtLengthM > 0) {
    const quantity = estimate.materials.gableGirtRowsPerEnd * 2
    rows.push({
      code: `${estimate.meta.productCode}-GGE`,
      label: "Gable-end girt allowance",
      quantity,
      cutLengthM: estimate.input.width,
      totalLengthM: estimate.materials.gableGirtLengthM,
      massKgPerM: estimate.materials.geometry.members.sideGirts.massKgPerM,
      totalMassKg: estimate.materials.gableGirtLengthM * estimate.materials.geometry.members.sideGirts.massKgPerM,
    })
  }
  return rows.sort((a, b) => Number(b.cutLengthM) - Number(a.cutLengthM))
}

function buildHtml(estimate) {
  const logo = assetDataUri("public/atlas/atlas-logo-horizontal-dark.png")
  const geometry = estimate.materials.geometry
  const members = activeMemberSchedule(estimate)
  const longest = members[0]
  const generated = new Intl.DateTimeFormat("en-ZA", { day: "2-digit", month: "long", year: "numeric" }).format(new Date())
  const memberRows = members.map((member) => `<tr>
    <td><strong>${member.code}</strong><span>${member.label}</span></td>
    <td class="num">${number(member.quantity, 0)}</td>
    <td class="num strong">${number(member.cutLengthM, 3)}m</td>
    <td class="num">${number(member.totalLengthM, 2)}m</td>
    <td class="num">${number(member.massKgPerM, 3)}</td>
    <td class="num strong">${number(member.totalMassKg, 1)}kg</td>
  </tr>`).join("")
  const sheetingScope = estimate.labels.gableMode
  const denseClass = members.length > 9 ? " dense" : ""
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    @page{size:A4 landscape;margin:0}*{box-sizing:border-box}body{margin:0;font-family:Arial,Helvetica,sans-serif;color:#10273a;background:#edf2f5}.page{width:297mm;min-height:210mm;background:#fff;padding:13mm 15mm 12mm;position:relative;overflow:hidden}.top{display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid #001d2e;padding-bottom:6mm}.logo{width:58mm;height:13mm;object-fit:contain;object-position:left}.meta{text-align:right;font-size:7.5pt;line-height:1.55;color:#607383}.eyebrow{margin-top:7mm;color:#0043f3;font-size:7.5pt;font-weight:800;letter-spacing:1.7px;text-transform:uppercase}.title-row{display:flex;align-items:end;justify-content:space-between;gap:10mm}.title h1{margin:2mm 0 1mm;font-size:23pt;line-height:1.05;letter-spacing:-.6px;color:#001d2e}.title p{margin:0;color:#5c6f7c;font-size:8.5pt}.badge{background:#0043f3;color:#fff;padding:3mm 4mm;font-size:8pt;font-weight:800;letter-spacing:.8px;text-transform:uppercase}.metrics{display:grid;grid-template-columns:repeat(5,1fr);gap:2.5mm;margin-top:6mm}.metric{border:1px solid #d9e2e8;background:#f8fafb;padding:3.5mm}.metric.dark{background:#001d2e;color:#fff;border-color:#001d2e}.metric .label{font-size:6.5pt;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#718391}.metric.dark .label{color:#bad0dd}.metric .value{margin-top:1.5mm;font-size:15pt;font-weight:800;letter-spacing:-.3px}.metric .note{margin-top:1mm;font-size:6.8pt;color:#718391}.metric.dark .note{color:#bad0dd}.content{display:grid;grid-template-columns:minmax(0,1fr) 64mm;gap:5mm;margin-top:5mm}h2{font-size:10pt;margin:0 0 2.5mm;color:#001d2e}table{width:100%;border-collapse:collapse;font-size:7.3pt}thead{background:#001d2e;color:#fff}th{padding:2.3mm 2.5mm;text-align:left;font-size:6.3pt;letter-spacing:.7px;text-transform:uppercase}td{padding:2.1mm 2.5mm;border-bottom:1px solid #dfe6eb;vertical-align:middle}tbody tr:nth-child(even){background:#f7f9fa}td span{display:block;margin-top:.5mm;color:#718391;font-size:6.4pt}.num{text-align:right}.strong{font-weight:800;color:#001d2e}.aside{background:#eef4f7;border-top:4px solid #0043f3;padding:4mm}.aside h3{font-size:9pt;margin:0 0 2mm;color:#001d2e}.aside p,.aside li{font-size:7pt;line-height:1.45;color:#405867}.aside ul{margin:2mm 0 0;padding-left:4mm}.aside .callout{margin-top:4mm;background:#fff;border:1px solid #d3dfe6;padding:3mm}.aside .callout strong{display:block;font-size:6.5pt;letter-spacing:.8px;text-transform:uppercase;color:#0043f3;margin-bottom:1mm}.footer{position:absolute;left:15mm;right:15mm;bottom:7mm;border-top:1px solid #d9e2e8;padding-top:2.5mm;display:flex;justify-content:space-between;font-size:6.5pt;color:#718391}.dense .top{padding-bottom:4mm}.dense .eyebrow{margin-top:5mm}.dense .metrics{margin-top:4mm}.dense .metric{padding:3mm}.dense .content{margin-top:4mm}.dense td{padding:1.45mm 2.5mm}
  </style></head><body><section class="page${denseClass}">
    <header class="top">${logo ? `<img class="logo" src="${logo}" alt="Atlas System">` : "<strong>ATLAS SYSTEM</strong>"}<div class="meta">Document: AT-LOG-${estimate.meta.productCode}<br>Generated: ${generated}<br>Planning revision</div></header>
    <div class="title-row"><div class="title"><div class="eyebrow">Atlas warehouse systems · logistics reference</div><h1>Material and transport data sheet</h1><p>${estimate.meta.productCode} · ${estimate.input.width}m span × ${estimate.input.length}m length × ${estimate.input.wallHeight}m eave · ${MATERIAL_LABELS[estimate.input.steelFinish] || estimate.input.steelFinish} · ${sheetingScope}</p></div><div class="badge">Planning data</div></div>
    <div class="metrics">
      <div class="metric dark"><div class="label">Scheduled steel mass</div><div class="value">${number(estimate.materials.totalSteelKg / 1000, 2)}t</div><div class="note">Members shown below</div></div>
      <div class="metric"><div class="label">Longest member</div><div class="value">${number(longest?.cutLengthM, 3)}m</div><div class="note">${longest?.label || "Not available"}</div></div>
      <div class="metric"><div class="label">Portal frames</div><div class="value">${geometry.portalFrames}</div><div class="note">${geometry.bays} bays at ${geometry.baySpacingM}m</div></div>
      <div class="metric"><div class="label">Roof pitch</div><div class="value">${geometry.roofPitchDegrees}°</div><div class="note">Dual-pitch roof</div></div>
      <div class="metric"><div class="label">Sheeting scope</div><div class="value" style="font-size:11pt">${sheetingScope}</div><div class="note">Sheeting mass excluded</div></div>
    </div>
    <div class="content"><div><h2>Steel member schedule</h2><table><thead><tr><th>Member</th><th class="num">Pieces</th><th class="num">Cut length</th><th class="num">Total length</th><th class="num">kg/m</th><th class="num">Scheduled mass</th></tr></thead><tbody>${memberRows}</tbody></table></div>
    <aside class="aside"><h3>Transport planning</h3><ul><li>Use ${number(longest?.cutLengthM, 3)}m as the current controlling member length.</li><li>Allow for ${number(estimate.materials.totalSteelKg / 1000, 2)}t of scheduled structural steel before packing.</li><li>Bundle members by code, cut length and erection sequence.</li><li>Protect coated sections from direct chain and strap contact.</li></ul><div class="callout"><strong>Final dispatch check</strong><p>Confirm actual bundle count, bundle dimensions, lifting points, vehicle payload and route access after fabrication and packing.</p></div><div class="callout"><strong>Excluded from mass</strong><p>Sheeting, flashings, brackets, bolts, anchors, pallets, dunnage and protective packaging unless separately scheduled.</p></div></aside></div>
    <footer class="footer"><span>Atlas System · Developed by Smart Steel</span><span>Planning and logistics reference - verify against final dispatch schedule</span><span>Page 1 of 1</span></footer>
  </section></body></html>`
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const localPreview = process.env.NODE_ENV === "development" && searchParams.get("preview") === "1"
  if (!localPreview) {
    const authResponse = await requireOsAuth(request)
    if (authResponse) return authResponse
  }

  const productCode = String(searchParams.get("product") || "W08").toUpperCase()
  if (!SUPPORTED_PRODUCTS.has(productCode)) return NextResponse.json({ error: "Unsupported Atlas warehouse product." }, { status: 400 })
  const width = Number(productCode.slice(1))
  try {
    const estimate = calculateAtlasWarehouseEstimate({
      width,
      length: Number(searchParams.get("length") || 20),
      wallHeight: Number(searchParams.get("height") || (width >= 10 ? 4.5 : 3)),
      steelFinish: searchParams.get("material") || "ZAM",
      gableMode: searchParams.get("sheeting") || "structure_only",
      sheetingProfile: searchParams.get("profile") || "IBR",
      sheetingFinish: searchParams.get("finish") || "galvanised",
    })
    const browser = await launchEstimatePdfBrowser()
    const pdf = await renderHtmlPdf({ browser, html: buildHtml(estimate), landscape: true })
    const filename = `atlas-${productCode.toLowerCase()}-${estimate.input.width}x${estimate.input.length}x${estimate.input.wallHeight}-transport-data-sheet.pdf`
    return new NextResponse(pdf, { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${filename}"`, "Cache-Control": "private, no-store" } })
  } catch (error) {
    console.error("Could not generate Atlas transport data sheet:", error)
    return NextResponse.json({ error: error?.message || "Could not generate the Atlas data sheet." }, { status: 500 })
  }
}
