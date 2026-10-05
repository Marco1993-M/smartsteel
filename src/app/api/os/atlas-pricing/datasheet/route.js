import fs from "node:fs"
import path from "node:path"
import { NextResponse } from "next/server"
import { requireOsAuth } from "lib/osRouteAuth"
import { launchEstimatePdfBrowser, renderHtmlPdf } from "lib/estimates/pdf"
import { calculateAtlasWarehouseEstimate } from "lib/estimates/atlasWarehouseEstimate"
import { ATLAS_W06_PROFILES } from "lib/atlasW06Geometry"
import { ATLAS_W08_PROFILES } from "lib/atlasW08Geometry"
import { ATLAS_W10_PROFILES } from "lib/atlasW10Geometry"
import { ATLAS_W12_PROFILES } from "lib/atlasW12Geometry"
import { ATLAS_W15_PROFILES } from "lib/atlasW15Geometry"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

const SUPPORTED_PRODUCTS = new Set(["W06", "W08", "W10", "W12", "W15"])
const MATERIAL_LABELS = { ZAM: "ZAM", Galv: "Galvanised", Mild: "Mild steel" }
const PROFILES_BY_PRODUCT = {
  W06: ATLAS_W06_PROFILES, W08: ATLAS_W08_PROFILES, W10: ATLAS_W10_PROFILES,
  W12: ATLAS_W12_PROFILES, W15: ATLAS_W15_PROFILES,
}
const MEMBER_PROFILE_KEYS = {
  columns: "column", rafters: "rafter", purlins: "purlin",
  wallBracing: "bracing", roofBracing: "bracing", sideGirts: "sideGirt",
  frontGableColumns: "gableColumn", rearGableColumns: "gableColumn",
  apexMembers: "apexHaunch", haunchMembers: "apexHaunch",
}

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

function profileLabel(profile) {
  if (!profile) throw new Error("Missing Atlas member profile for data sheet.")
  return `CFLC ${profile.webMm} × ${profile.flangeMm} × ${profile.lipMm} × ${profile.thicknessMm}mm`
}

function activeMemberSchedule(estimate) {
  const profiles = PROFILES_BY_PRODUCT[estimate.meta.productCode]
  const mode = estimate.input.gableMode
  const includesLongWalls = ["fully_enclosed", "fully_enclosed_with_gables"].includes(mode)
  const includesGables = mode === "fully_enclosed_with_gables"
  const excluded = new Set([
    ...(!includesLongWalls ? ["sideGirts"] : []),
    ...(!includesGables ? ["frontGableColumns", "rearGableColumns"] : []),
  ])
  const rows = Object.entries(estimate.materials.geometry.members)
    .filter(([key]) => !excluded.has(key))
    .map(([key, member]) => ({
      ...member,
      profile: profileLabel(profiles[MEMBER_PROFILE_KEYS[key]]),
      assembly: member.rule?.includes("back-to-back") ? "Back-to-back assembly" : "",
    }))

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
      // The estimate prices this provisional allowance using the side-girt section.
      profile: profileLabel(profiles.sideGirt),
    })
  }
  return rows.sort((a, b) => Number(b.cutLengthM) - Number(a.cutLengthM))
}

function buildHtml(estimate) {
  const logo = assetDataUri("public/atlas/atlas-logo-horizontal-dark.png")
  const geometry = estimate.materials.geometry
  const members = activeMemberSchedule(estimate)
  const longest = members[0]
  const sheetingMassKg = estimate.sheeting.estimatedMassKg || 0
  const combinedTransportMassKg = estimate.materials.totalSteelKg + sheetingMassKg
  const generated = new Intl.DateTimeFormat("en-ZA", { day: "2-digit", month: "long", year: "numeric" }).format(new Date())
  const memberRows = members.map((member) => `<tr>
    <td><strong>${member.code}</strong><span>${member.label}</span></td>
    <td class="profile">${member.profile}${member.assembly ? `<span>${member.assembly}</span>` : ""}</td>
    <td class="num">${number(member.quantity, 0)}</td>
    <td class="num strong">${number(member.cutLengthM, 3)}m</td>
    <td class="num">${number(member.totalLengthM, 2)}m</td>
    <td class="num">${number(member.massKgPerM, 3)}</td>
    <td class="num strong">${number(member.totalMassKg, 1)}kg</td>
  </tr>`).join("")
  const sheetingScope = estimate.labels.gableMode
  const hasSheeting = estimate.sheeting.totalSheetingArea > 0
  const sheetingSpec = hasSheeting
    ? `${estimate.input.sheetingProfile} · ${estimate.input.sheetingFinish === "chromadek" ? "Chromadek" : "Galvanised"} · ${estimate.sheeting.bmtMm}mm BMT`
    : "No sheeting selected"
  const sheetingDetail = hasSheeting
    ? `${sheetingSpec}. ${number(sheetingMassKg, 0)}kg uses ${number(estimate.sheeting.totalSheetingArea, 0)}m² at ${number(estimate.sheeting.baseMassKgPerSqm, 3)}kg/m². Confirm actual profiled sheet and lap mass with the supplier.`
    : "No roof or wall sheeting is included in this configuration."
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    @page { size:A4 landscape; margin:0 }
    * { box-sizing:border-box }
    body { margin:0; font-family:Arial,Helvetica,sans-serif; font-size:8pt; line-height:1.2; color:#10273a; background:#fff }
    .page { width:297mm; min-height:210mm; padding:10mm 12mm 15mm; position:relative }
    .top { display:flex; align-items:center; justify-content:space-between; border-bottom:2px solid #001d2e; padding-bottom:3mm }
    .logo { width:54mm; height:12mm; object-fit:contain; object-position:left }
    .meta { text-align:right; font-size:7pt; line-height:1.3; color:#607383 }
    .title-row { display:flex; align-items:center; justify-content:space-between; gap:8mm; margin-top:4mm }
    .eyebrow { color:#0043f3; font-size:7pt; font-weight:800; letter-spacing:1.4px; text-transform:uppercase }
    .title h1 { margin:1.5mm 0; font-size:21pt; line-height:1.1; letter-spacing:-.5px; color:#001d2e }
    .title p { margin:0; color:#5c6f7c; font-size:8pt }
    .badge { background:#0043f3; color:#fff; padding:3mm; font-size:7pt; font-weight:800; white-space:nowrap; text-transform:uppercase }
    .metrics { display:grid; grid-template-columns:repeat(6,minmax(0,1fr)); gap:2mm; margin-top:4mm }
    .metric { border:1px solid #d9e2e8; background:#f8fafb; padding:2.5mm }
    .metric.dark { background:#001d2e; color:#fff; border-color:#001d2e }
    .metric .label { font-size:6pt; font-weight:800; letter-spacing:.6px; text-transform:uppercase; color:#607383 }
    .metric.dark .label,.metric.dark .note { color:#bad0dd }
    .metric .value { margin-top:1mm; font-size:15pt; font-weight:800; line-height:1.15 }
    .metric .note { margin-top:1mm; font-size:6.5pt; color:#607383 }
    .content { margin-top:4mm }
    h2 { font-size:10pt; margin:0 0 2mm; color:#001d2e }
    table { width:100%; table-layout:fixed; border-collapse:collapse; font-size:8pt }
    thead { background:#001d2e; color:#fff }
    th { padding:2mm; text-align:left; font-size:6.5pt; letter-spacing:.3px; text-transform:uppercase }
    td { padding:1.5mm 2mm; border-bottom:1px solid #dfe6eb; vertical-align:middle }
    tr { break-inside:avoid }
    tbody tr:nth-child(even) { background:#f7f9fa }
    td span { display:block; margin-top:.4mm; color:#607383; font-size:6.5pt }
    .dense td { padding:.65mm 2mm; font-size:7.5pt; line-height:1.1 }
    .dense td span { font-size:6pt; line-height:1.1; margin-top:.2mm }
    .profile { font-size:7.5pt; white-space:nowrap }
    .num { text-align:right; white-space:nowrap }
    .strong { font-weight:800; color:#001d2e }
    .aside { display:grid; grid-template-columns:1.2fr 1fr 1fr; gap:4mm; margin-top:4mm; padding:3mm; background:#eef4f7; border-top:2px solid #0043f3; break-inside:avoid }
    .aside h3,.aside .callout strong { display:block; font-size:7pt; margin:0 0 1.5mm; color:#001d2e; text-transform:uppercase; letter-spacing:.4px }
    .aside p,.aside li { font-size:7pt; line-height:1.3; color:#405867 }
    .aside p { margin:0 }
    .aside ul { margin:0; padding-left:3.5mm }
    .aside .callout { border-left:1px solid #c9d7e0; padding-left:4mm }
    .footer { position:absolute; left:12mm; right:12mm; bottom:6mm; border-top:1px solid #d9e2e8; padding-top:2mm; display:flex; justify-content:space-between; font-size:6pt; color:#607383 }
  </style></head><body><section class="page${members.length >= 8 ? " dense" : ""}">
    <header class="top">${logo ? `<img class="logo" src="${logo}" alt="Atlas System">` : "<strong>ATLAS SYSTEM</strong>"}<div class="meta">Document: AT-LOG-${estimate.meta.productCode}<br>Generated: ${generated}<br>Planning revision</div></header>
    <div class="title-row"><div class="title"><div class="eyebrow">Atlas warehouse systems · logistics reference</div><h1>Material and transport data sheet</h1><p>${estimate.meta.productCode} · ${estimate.input.width}m span × ${estimate.input.length}m length × ${estimate.input.wallHeight}m eave · ${MATERIAL_LABELS[estimate.input.steelFinish] || estimate.input.steelFinish} · ${sheetingScope}</p></div><div class="badge">Planning data</div></div>
    <div class="metrics">
      <div class="metric dark"><div class="label">Scheduled steel mass</div><div class="value">${number(estimate.materials.totalSteelKg / 1000, 2)}t</div><div class="note">Members shown below</div></div>
      <div class="metric"><div class="label">Sheeting mass</div><div class="value">${number(sheetingMassKg / 1000, 2)}t</div><div class="note">${hasSheeting ? `${estimate.sheeting.bmtMm}mm BMT` : "No sheeting"} · ${number(estimate.sheeting.totalSheetingArea, 0)}m²</div></div>
      <div class="metric dark"><div class="label">Combined mass</div><div class="value">${number(combinedTransportMassKg / 1000, 2)}t</div><div class="note">Steel + sheeting</div></div>
      <div class="metric"><div class="label">Longest member</div><div class="value">${number(longest?.cutLengthM, 3)}m</div><div class="note">${longest?.label || "Not available"}</div></div>
      <div class="metric"><div class="label">Portal frames</div><div class="value">${geometry.portalFrames}</div><div class="note">${geometry.bays} bays at ${geometry.baySpacingM}m</div></div>
      <div class="metric"><div class="label">Sheeting scope</div><div class="value" style="font-size:11pt">${sheetingScope}</div><div class="note">${sheetingSpec}</div></div>
    </div>
    <div class="content"><div><h2>Steel member schedule</h2><table><colgroup><col style="width:21%"><col style="width:26%"><col style="width:7%"><col style="width:12%"><col style="width:12%"><col style="width:9%"><col style="width:13%"></colgroup><thead><tr><th>Member</th><th>Profile / gauge</th><th class="num">Pieces</th><th class="num">Cut length</th><th class="num">Total length</th><th class="num">kg/m</th><th class="num">Scheduled mass</th></tr></thead><tbody>${memberRows}</tbody></table></div>
    <aside class="aside"><div><h3>Transport planning</h3><ul><li>Use ${number(longest?.cutLengthM, 3)}m as the current controlling member length.</li><li>Allow for ${number(combinedTransportMassKg / 1000, 2)}t of steel${hasSheeting ? ` and ${estimate.sheeting.bmtMm}mm BMT sheeting` : ""} before packing.</li><li>Bundle members by code, cut length and erection sequence.</li><li>Protect coated sections from direct chain and strap contact.</li></ul></div><div class="callout"><strong>Sheeting specification</strong><p>${sheetingDetail}</p></div><div class="callout"><strong>Excluded from mass</strong><p>Flashings, brackets, bolts, anchors, pallets, dunnage and protective packaging unless separately scheduled.</p></div></aside></div>
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
