"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ArrowLeft,
  ArrowUpRight,
  Boxes,
  Check,
  ClipboardCheck,
  FileText,
  Layers3,
  Printer,
  Ruler,
  Settings2,
  ShieldCheck,
  Wrench,
} from "lucide-react"
import { getOsAuthHeaders } from "../../lib/osClientAuth"
import { ATLAS_PRODUCT_RANGE, getAtlasProduct, withAtlasProduct } from "../../lib/atlasProductRange"
import {
  ATLAS_W08_EAVE_HEIGHTS_M,
  ATLAS_W08_LENGTHS_M,
  calculateAtlasW08Geometry,
} from "../../lib/atlasW08Geometry"
import AtlasSkuRegistry from "./AtlasSkuRegistry"

const W08_SPEC_SCOPES = [
  { value: "structure_only", name: "Structure only", detail: "Primary frame, purlins, wall and roof bracing, brackets, and connection hardware. No girts or sheeting." },
  { value: "roof_only", name: "Roof sheeted", detail: "Structure-only scope plus selected roof sheeting and roof fixings. No wall girts or wall sheeting." },
  { value: "fully_enclosed", name: "Roof and side walls sheeted", detail: "Roof-sheeted scope plus side girts and long-wall sheeting. Gable ends remain open." },
]
const W08_ROOF_SHEETING_STANDARD = [
  ["Standard profile", "IBR", "Mid-range Atlas roof and wall sheeting option"],
  ["Effective cover width", "686mm", "Standard installed cover per IBR sheet"],
  ["Sheet thickness", "0.47mm TCT", "Final coated sheet thickness; base metal thickness not separately specified"],
  ["Minimum roof pitch", "15 degrees", "Matches the standard W08 roof geometry"],
  ["Sheet orientation", "Normal roof orientation", "Profile runs from eave to ridge"],
  ["Maximum purlin spacing", "1,500mm c/c", "Confirmed W08 roof support standard"],
  ["Side lap", "To be confirmed", "Record profile overlap and manufacturer requirement"],
  ["End lap", "Not permitted", "Sheets should run in continuous lengths from eave to ridge"],
  ["Side-lap stitching", "Not required", "Current standard"],
  ["Primary fixing", "Class 3 Tek screw", "Select the applicable size and head type from the controlled fixing range"],
  ["Fixing position", "Crest", "Applies to the standard roof-sheet fixing arrangement"],
  ["Fixing spacing", "To be confirmed", "Record screws per sheet and per purlin line"],
  ["Washer and seal", "Galvanised bonded EPDM washer, 6 x 19mm", "Final screw and washer designation to be verified"],
  ["Sealant", "None", "No standard sealant allowance"],
  ["Standard ridge flashing", "231 x 38mm · 462mm girth", "15-degree roof slope; standard exposed-fix cladding detail"],
  ["Concealed-fix ridge", "232 x 38mm · 540mm girth", "15-degree roof slope; Afri-Lok700 premium detail"],
  ["Eave closure", "None", "No standard closure"],
  ["Barge flashing", "None", "No standard barge flashing"],
  ["Foam closures", "None", "No standard foam closure"],
  ["Ridge ventilation", "None", "No ventilated or sealed ridge option in the standard scope"],
  ["Gutter / drip edge", "None", "Not included in the standard roof-sheeting scope"],
]
const W08_CLADDING_TIERS = [
  {
    tier: "Economy",
    profile: "Corrugated",
    cover: "762mm effective cover",
    fixing: "Exposed-fix",
    note: "Lowest-cost cladding option. Corrugated fixing rules must remain profile-specific.",
  },
  {
    tier: "Standard",
    profile: "IBR",
    cover: "686mm effective cover",
    fixing: "Exposed-fix",
    note: "Default Atlas W08 roof and wall sheeting specification.",
  },
  {
    tier: "Premium",
    profile: "Afri-Lok700",
    cover: "700mm effective cover",
    fixing: "Concealed-fix",
    note: "Premium G550 upgrade with a 232 x 38mm concealed-fix ridge flashing and 540mm girth.",
  },
]
const W08_CLADDING_FINISHES = [
  "Fish Eagle White",
  "White Lion",
  "Sandstone Beige",
  "Gemsbok Sand",
  "Aloe Green",
  "Traffic Green",
  "Uhmlanga Wave",
  "Kingfisher Blue",
  "Azure Blue",
  "Dove Grey",
  "Charcoal Grey",
  "Dark Dolphin",
  "Kalahari Red",
  "Buffalo Brown",
]
const W08_CLASS_3_TEK_SCREWS = [
  "#10 x 22mm Wafer",
  "#10 x 45mm Wafer T17",
  "#14 x 22mm Stitching",
  "#12 x 25mm Hex Flange & Seal",
  "#12 x 38mm Hex Flange & Seal",
  "#12 x 65mm Hex Flange & Seal",
  "#12 x 65mm Hex Flange & Seal T17",
  "#12 x 85mm Hex Flange & Seal T17",
]

const PRODUCT = {
  code: "W08",
  name: "Atlas W08 Warehouse System",
  summary: "The 8m-span pilot for Smart Steel's modular, bolted Atlas warehouse range.",
  specifications: [
    ["Span", "8m", "Fixed W08 product width"],
    ["Length", "4m to 48m modular", "Approved 4m bays within a 50m standard engineering envelope"],
    ["Eave height", "3m to 5m", "3m default with the standard system supporting heights up to 5m"],
    ["Roof form", "Dual pitch", "15-degree standard starting geometry"],
    ["Assembly", "Bolted", "Repeatable connections for practical site assembly"],
    ["Gable ends", "Closed by default", "Open-gable arrangements remain project selections"],
  ],
  scopes: [
    { name: "Structure only", detail: "Primary frame, secondary steel, bracing, connections, and required structural fixings." },
    { name: "Roof sheeted", detail: "Standard structure with roof sheeting and applicable roof closures." },
    { name: "Fully enclosed", detail: "Default sheeted scope with roof, long walls, and both gable ends enclosed." },
    { name: "Open-gable project option", detail: "One or both gable ends may be left open where required by the selected project configuration." },
  ],
  reviewTriggers: [
    "Openings, lean-tos, canopies, or suspended loads",
    "Non-standard loading, exposure, or site conditions",
    "Installation, foundations, delivery, and access constraints",
  ],
}

const workspaceLinks = [
  { label: "Components", href: "/os/atlas/components", icon: Boxes },
  { label: "BOM", href: "/os/atlas/bom", icon: Layers3 },
  { label: "Pricing", href: "/os/atlas/pricing", icon: Ruler },
  { label: "Engineering", href: "/os/atlas/engineering", icon: ShieldCheck },
  { label: "Documents", href: "/os/atlas/documents", icon: FileText },
]

function StatusPill({ ready, readyLabel = "Ready", pendingLabel = "Needs work" }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${ready ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"}`}>
      {ready ? readyLabel : pendingLabel}
    </span>
  )
}

function SpecFooter({ page, revision }) {
  return (
    <footer className="mt-auto flex items-end justify-between border-t border-slate-300 pt-4 text-[9px] uppercase tracking-[0.14em] text-slate-500">
      <div>
        <p className="font-bold text-slate-800">Atlas · A Smart Steel product</p>
        <p className="mt-1 normal-case tracking-normal">info@smartsteel.co.za · smartsteel.co.za</p>
      </div>
      <div className="text-right">
        <p className="font-mono font-bold text-slate-700">W08 · {revision}</p>
        <p className="mt-1">Page {page}</p>
      </div>
    </footer>
  )
}

function formatScheduleQuantity(value, maximumFractionDigits = 1) {
  if (value === null) return "TBC"
  if (typeof value === "string") return value
  return Number(value).toLocaleString("en-ZA", { maximumFractionDigits })
}

function W08SpecificationSheet({
  bom,
  components,
  selectedLength,
  selectedHeight,
  selectedScope,
  selectedSteelFinish,
}) {
  const revision = bom?.revisionCode || "DRAFT"
  const componentMap = new Map((components || []).map((component) => [component.componentCode, component]))
  const componentSpecification = (code, fallback) => {
    const specification = componentMap.get(code)?.specification || {}
    const savedValues = [
      specification.profileSpec,
      specification.thicknessSpec,
      specification.gradeSpec,
      specification.coatingSpec,
    ].filter(Boolean)
    return savedValues.length ? [...new Set(savedValues)].join(" · ") : fallback
  }
  const geometry = calculateAtlasW08Geometry({
    lengthM: selectedLength,
    eaveHeightM: selectedHeight,
  })
  const { bays: bayCount, portalFrames: portalCount, members } = geometry
  const selectedScopeDetails = W08_SPEC_SCOPES.find((scope) => scope.value === selectedScope)
  const includesWallGirts = selectedScope === "fully_enclosed"
  const includesSheeting = selectedScope !== "structure_only"
  const includedMembers = [
    members.columns,
    members.rafters,
    members.purlins,
    members.wallBracing,
    members.roofBracing,
    ...(includesWallGirts ? [members.sideGirts] : []),
  ]
  const profileSpecification = (member, fallback) => {
    const componentCode = member.code === "W08-PUR" ? "W08-SEC" : member.code
    const saved = componentSpecification(componentCode, fallback)
    return `${saved.replace(/\s*[·,]\s*(ZAM|Galvanised|Galv|Mild steel).*$/i, "")} · ${selectedSteelFinish}`
  }
  const componentSchedule = includedMembers.map((member) => ({
    code: member.code,
    component: member.label,
    specification: profileSpecification(member, {
      "W08-COL": "200 x 75 x 20 x 2.0mm BMT lipped channel · paired back-to-back",
      "W08-RAF": "200 x 75 x 20 x 2.5mm BMT lipped channel",
      "W08-PUR": "175 x 65 x 20 x 2.0mm BMT lipped channel",
      "W08-XBW": "100 x 50 x 20 x 2.0mm BMT lipped channel",
      "W08-XBR": "100 x 50 x 20 x 2.0mm BMT lipped channel",
      "W08-GRT": "150 x 50 x 20 x 2.0mm BMT lipped channel",
    }[member.code]),
    function: member.rule,
    quantity: member.quantity,
    cutLength: member.cutLengthM,
    totalLength: member.totalLengthM,
    unit: "lengths",
    status: "Geometry controlled",
  }))
  const baseBracketCount = portalCount * 2
  const ridgeBracketCount = portalCount
  const eaveBracketCount = portalCount * 2
  const bracingMemberCount = members.wallBracing.quantity + members.roofBracing.quantity
  const bracingBracketCount = bracingMemberCount * 2
  const m10SetCount =
    ridgeBracketCount * 8 +
    eaveBracketCount * 8 +
    bracingBracketCount * 2 +
    members.purlins.quantity * 2 +
    (includesWallGirts ? members.sideGirts.quantity * 2 : 0)
  const connectionSchedule = [
    {
      code: "W08-BAS", component: "Column base brackets", quantity: baseBracketCount, unit: "each",
      specification: "Atlas W08 column base bracket · provisional geometry", basis: `2 column positions × ${portalCount} portals`, status: "Geometry pending",
    },
    {
      code: "W08-EAV", component: "Eave brackets", quantity: eaveBracketCount, unit: "each",
      specification: "Atlas W08 bolted eave connection", basis: `2 per portal × ${portalCount} portals`, status: "Geometry pending",
    },
    {
      code: "W08-RDG", component: "Ridge brackets", quantity: ridgeBracketCount, unit: "each",
      specification: "Atlas W08 bolted ridge connection", basis: `1 per portal × ${portalCount} portals`, status: "Geometry pending",
    },
    {
      code: "W08-XBR-BRK", component: "Bracing brackets", quantity: bracingBracketCount, unit: "each",
      specification: "Atlas bracing connection bracket · provisional geometry", basis: `${bracingMemberCount} brace members × 2 ends`, status: "Geometry pending",
    },
    {
      code: "W08-M10-SET", component: "M10 connection sets", quantity: m10SetCount, unit: "sets",
      specification: "M10 x 30mm · Class 8.8 · zinc plated · matching nut and washer", basis: "Bracket, bracing and secondary-member connection schedule", status: "Controlled allowance",
    },
    {
      code: "W08-ANC", component: "M12 anchor bolts", quantity: baseBracketCount * 4, unit: "each",
      specification: "M12 anchor bolt · final type and price to confirm", basis: `${baseBracketCount} base brackets × 4 anchors`, status: "Foundation review",
    },
  ]
  const selectedSize = `8m x ${selectedLength}m x ${selectedHeight}m`
  const scheduledStructuralMassKg = includedMembers.reduce((total, member) => total + member.totalMassKg, 0)
  const totalPages = includesSheeting ? 5 : 4
  const issuedDate = new Date().toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <article className="product-spec-sheet mx-auto w-full max-w-[210mm] bg-white text-slate-950 shadow-xl print:shadow-none">
      <section className="product-spec-page product-spec-cover relative overflow-hidden bg-slate-950">
        <img
          src="/Atlas_warehouses_w08_spec_sheet.png"
          alt="Atlas W08 Product Specification Sheet"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute left-[14mm] top-[14mm] w-[72mm] border-l-4 border-sky-500 bg-white/95 px-5 py-4 shadow-xl">
          <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-sky-700">Configuration specification</p>
          <p className="mt-2 text-[22px] font-bold tracking-[-0.04em] text-slate-950">{selectedSize}</p>
          <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-200 pt-3">
            <span className="text-[9px] font-bold text-slate-700">{selectedScopeDetails?.name}</span>
            <span className="text-[8px] font-bold uppercase tracking-[0.12em] text-slate-500">{selectedSteelFinish}</span>
          </div>
        </div>
      </section>

      <section className="product-spec-page relative flex flex-col overflow-hidden px-[14mm] py-[12mm]">
        <div className="absolute right-0 top-0 h-[7px] w-[44mm] bg-sky-600" />
        <header className="flex items-start justify-between gap-8 border-b border-slate-300 pb-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-sky-700">01 · Product definition</p>
            <h1 className="mt-3 text-[32px] font-bold leading-none tracking-[-0.05em]">Atlas W08 Warehouse System</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">The 8m-span modular, bolted warehouse system in the Atlas W-Series.</p>
          </div>
          <div className="min-w-[35mm] border-l border-slate-300 pl-5 text-right">
            <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-slate-400">Document revision</p>
            <p className="mt-2 font-mono text-lg font-bold">{revision}</p>
            <p className="mt-4 text-[8px] font-bold uppercase tracking-[0.14em] text-slate-400">Prepared</p>
            <p className="mt-2 text-xs font-semibold">{issuedDate}</p>
          </div>
        </header>

        <section className="mt-7">
          <div className="grid grid-cols-3 border-y border-slate-300 bg-slate-950 text-white">
            {[["Product code", "W08"], ["Selected size", selectedSize], ["Supplied scope", selectedScopeDetails?.name || "Structure only"]].map(([label, value], index) => (
              <div key={label} className={`px-4 py-4 ${index < 2 ? "border-r border-white/15" : ""}`}>
                <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-slate-400">{label}</p>
                <p className="mt-2 text-base font-bold">{value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-7">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">System configuration</p>
          <div className="mt-3 grid grid-cols-2 border-t-2 border-slate-900">
            {[
              ["Span", "8m", "Fixed W08 product width"],
              ["Length", `${selectedLength}m`, `${bayCount} x 4m modular bays`],
              ["Eave height", `${selectedHeight}m`, "Selected W08 column height"],
              ["Roof form", "Dual pitch", "15-degree standard geometry"],
              ["Steel finish", selectedSteelFinish, "Applied to the structural lipped-channel members"],
              ["Gable ends", "Open", "No gable framing, girts or sheeting in this configuration"],
            ].map(([label, value, detail], index) => (
              <div key={label} className={`border-b border-slate-200 py-3 ${index % 2 === 0 ? "pr-6" : "border-l pl-6"}`}>
                <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-slate-400">{label}</p>
                <p className="mt-1.5 text-sm font-bold text-slate-900">{value}</p>
                <p className="mt-1 text-[10px] leading-4 text-slate-500">{detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-7">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">Configuration boundary</p>
          <div className="mt-3 grid grid-cols-[1.2fr_1fr] border border-slate-300">
            <div className="bg-sky-50 p-4">
              <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-sky-700">Included in this issue</p>
              <p className="mt-2 text-sm font-bold">{selectedScopeDetails?.name}</p>
              <p className="mt-1.5 text-[9px] leading-4 text-slate-600">{selectedScopeDetails?.detail}</p>
            </div>
            <div className="border-l border-slate-300 p-4">
              <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-slate-400">Not included</p>
              <p className="mt-2 text-[9px] leading-4 text-slate-600">Foundations, slab, delivery and installation are excluded. Final issued engineering and approved bracket fabrication details remain required before production.</p>
            </div>
          </div>
        </section>

        <section className="mt-7 border-l-4 border-amber-400 bg-amber-50 px-5 py-4">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-amber-900">Project application</p>
          <p className="mt-2 text-[10px] leading-4 text-slate-700">This specification describes the standard W08 product arrangement. Final connections, foundations, anchors, cladding selections, openings, delivery scope, and installation requirements are confirmed against the selected project configuration and site conditions.</p>
        </section>

        <SpecFooter page={`2 of ${totalPages}`} revision={revision} />
      </section>

      <section className="product-spec-page relative flex flex-col overflow-hidden px-[14mm] py-[12mm]">
        <div className="absolute right-0 top-0 h-[7px] w-[44mm] bg-sky-600" />
        <header className="flex items-end justify-between gap-8 border-b border-slate-300 pb-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-sky-700">02 · Assembly reference</p>
            <h2 className="mt-2 text-[28px] font-bold tracking-[-0.04em]">What goes into this structure</h2>
            <p className="mt-2 text-xs text-slate-500">Calculated for the selected {selectedSize} · {selectedScopeDetails?.name} configuration.</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{portalCount}</p>
            <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-slate-400">Portal frames</p>
          </div>
        </header>

        <section className="mt-5">
          <div className="grid grid-cols-[19mm_28mm_1fr_13mm_20mm_20mm] border-b-2 border-slate-900 pb-2 text-[7px] font-bold uppercase tracking-[0.12em] text-slate-500">
            <span>Component ID</span><span>Member</span><span>Profile and rule</span><span className="text-right">Qty</span><span className="text-right">Cut length</span><span className="text-right">Total</span>
          </div>
          {componentSchedule.map((item) => (
            <div key={item.code} className="grid break-inside-avoid grid-cols-[19mm_28mm_1fr_13mm_20mm_20mm] border-b border-slate-200 py-2.5">
              <span className="font-mono text-[8px] font-bold text-sky-700">{item.code}</span>
              <div className="pr-3">
                <p className="text-[10px] font-bold text-slate-900">{item.component}</p>
              </div>
              <div className="pr-4">
                <p className="text-[9px] font-semibold leading-4 text-slate-800">{item.specification}</p>
                <p className="text-[8px] leading-3.5 text-slate-500">{item.function}</p>
              </div>
              <span className="text-right text-[11px] font-bold tabular-nums">{formatScheduleQuantity(item.quantity)}</span>
              <span className="text-right text-[9px] font-semibold text-slate-700">{formatScheduleQuantity(item.cutLength, 3)}m</span>
              <span className="text-right text-[9px] font-semibold text-slate-700">{formatScheduleQuantity(item.totalLength, 2)}m</span>
            </div>
          ))}
        </section>

        <section className="mt-6 grid grid-cols-3 border-y border-slate-300 bg-slate-50">
          {[
            ["Portal frames", portalCount],
            ["Primary channels", members.columns.quantity + members.rafters.quantity],
            ["Scheduled mass", `${formatScheduleQuantity(scheduledStructuralMassKg, 1)}kg`],
          ].map(([label, value], index) => (
            <div key={label} className={`px-4 py-3 ${index < 2 ? "border-r border-slate-300" : ""}`}>
              <p className="text-[7px] font-bold uppercase tracking-[0.12em] text-slate-400">{label}</p>
              <p className="mt-1 text-lg font-bold">{value}</p>
            </div>
          ))}
        </section>

        <div className="mt-5 border-l-4 border-amber-400 bg-amber-50 px-4 py-3 text-[9px] leading-4 text-amber-950">
          Quantities follow the approved W08 4m modular rule. Roof purlins use a maximum 1,500mm c/c spacing and bracing follows bay positions 1, 5, 9 and onward. Final fixing quantities, anchors, and foundation interfaces remain to be confirmed before procurement or construction.
        </div>

        <SpecFooter page={`3 of ${totalPages}`} revision={revision} />
      </section>

      <section className="product-spec-page relative flex flex-col overflow-hidden px-[14mm] py-[12mm]">
        <div className="absolute right-0 top-0 h-[7px] w-[44mm] bg-sky-600" />
        <header className="flex items-end justify-between gap-8 border-b border-slate-300 pb-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-sky-700">03 · Connection schedule</p>
            <h2 className="mt-2 text-[28px] font-bold tracking-[-0.04em]">Brackets, bolts and anchors</h2>
            <p className="mt-2 text-xs text-slate-500">Procurement quantities for the selected {selectedSize} pilot configuration.</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{connectionSchedule.reduce((sum, item) => sum + item.quantity, 0)}</p>
            <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-slate-400">Scheduled items</p>
          </div>
        </header>

        <section className="mt-6">
          <div className="grid grid-cols-[22mm_34mm_1fr_16mm] border-b-2 border-slate-900 pb-2 text-[7px] font-bold uppercase tracking-[0.12em] text-slate-500">
            <span>Item ID</span><span>Item</span><span>Specification and quantity basis</span><span className="text-right">Qty</span>
          </div>
          {connectionSchedule.map((item) => (
            <div key={item.code} className="grid break-inside-avoid grid-cols-[22mm_34mm_1fr_16mm] border-b border-slate-200 py-3">
              <span className="font-mono text-[8px] font-bold text-sky-700">{item.code}</span>
              <p className="pr-3 text-[10px] font-bold text-slate-900">{item.component}</p>
              <div className="pr-4">
                <p className="text-[9px] font-semibold leading-4 text-slate-800">{item.specification}</p>
                <p className="mt-0.5 text-[8px] leading-3.5 text-slate-500">{item.basis}</p>
                <p className="mt-1 text-[7px] font-bold uppercase tracking-[0.1em] text-amber-700">{item.status}</p>
              </div>
              <span className="text-right text-[11px] font-bold tabular-nums">{formatScheduleQuantity(item.quantity)}</span>
            </div>
          ))}
        </section>

        <section className="mt-7 grid grid-cols-2 gap-4">
          <div className="border-l-4 border-amber-400 bg-amber-50 px-4 py-4">
            <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-amber-900">Production holds</p>
            <p className="mt-2 text-[9px] leading-4 text-slate-700">Do not fabricate brackets or procure anchors from this schedule until the controlled bracket drawings, foundation design and issued engineering package are approved.</p>
          </div>
          <div className="border-l-4 border-sky-600 bg-sky-50 px-4 py-4">
            <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-sky-900">Pilot verification</p>
            <p className="mt-2 text-[9px] leading-4 text-slate-700">Record actual cut lengths, fit-up observations, fixing usage and any deviations during the 8m x 8m pilot build so the controlled W08 record can be revised.</p>
          </div>
        </section>

        <SpecFooter page={`4 of ${totalPages}`} revision={revision} />
      </section>

      {includesSheeting ? <section className="product-spec-page relative flex flex-col overflow-hidden px-[14mm] py-[12mm]">
        <div className="absolute right-0 top-0 h-[7px] w-[44mm] bg-sky-600" />
        <header className="flex items-end justify-between gap-8 border-b border-slate-300 pb-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-sky-700">03 · Roof and wall cladding</p>
            <h2 className="mt-2 text-[28px] font-bold tracking-[-0.04em]">Current cladding standard</h2>
            <p className="mt-2 text-xs text-slate-500">W08 roof and wall profile choices, finishes, flashings, and fixing options.</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">0.47mm</p>
            <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-slate-400">Sheet thickness</p>
          </div>
        </header>

        <section className="mt-5 grid grid-cols-2 border-t-2 border-slate-900">
          {W08_ROOF_SHEETING_STANDARD.map(([label, value, note], index) => (
            <div key={label} className={`border-b border-slate-200 py-2.5 ${index % 2 === 0 ? "pr-6" : "border-l pl-6"}`}>
              <p className="text-[7px] font-bold uppercase tracking-[0.12em] text-slate-400">{label}</p>
              <p className={`mt-1 text-[10px] font-bold ${value === "To be confirmed" ? "text-amber-700" : "text-slate-900"}`}>{value}</p>
              <p className="mt-0.5 text-[8px] leading-3.5 text-slate-500">{note}</p>
            </div>
          ))}
        </section>

        <section className="mt-5">
          <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-slate-400">Atlas cladding range</p>
          <div className="mt-2 grid grid-cols-3 border border-slate-300">
            {W08_CLADDING_TIERS.map((option, index) => (
              <div key={option.tier} className={`p-3 ${index < W08_CLADDING_TIERS.length - 1 ? "border-r border-slate-300" : ""} ${option.tier === "Standard" ? "bg-sky-50" : "bg-white"}`}>
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-[8px] font-bold uppercase tracking-[0.12em] ${option.tier === "Standard" ? "text-sky-700" : "text-slate-400"}`}>{option.tier}</p>
                  {option.tier === "Standard" ? <span className="bg-sky-700 px-1.5 py-0.5 text-[6px] font-bold uppercase tracking-[0.1em] text-white">Default</span> : null}
                </div>
                <p className="mt-1.5 text-[11px] font-bold text-slate-900">{option.profile}</p>
                <p className="mt-1 text-[8px] font-semibold text-slate-600">{option.cover} · {option.fixing}</p>
                <p className="mt-1 text-[7px] leading-3 text-slate-500">{option.note}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-4 border-y border-slate-300 py-3">
          <div className="flex items-center justify-between gap-4">
            <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-slate-400">Material and finish availability</p>
            <p className="text-[8px] font-bold text-slate-800">Corrugated · IBR · Concealed Fix</p>
          </div>
          <p className="mt-1.5 text-[8px] leading-4 text-slate-600">
            <span className="font-bold text-slate-900">Galvanised</span> or <span className="font-bold text-slate-900">Chromadek</span>: {W08_CLADDING_FINISHES.join(" · ")}
          </p>
        </section>

        <section className="mt-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-slate-400">Class 3 Tek screw range</p>
              <p className="mt-1 text-[8px] text-slate-500">Class 3 corrosion protection · 1,000-hour salt-spray tested</p>
            </div>
            <p className="text-[8px] font-bold text-slate-700">Selected to suit the application</p>
          </div>
          <div className="mt-2 grid grid-cols-2 border border-slate-300">
            {W08_CLASS_3_TEK_SCREWS.map((screw, index) => (
              <div key={screw} className={`flex items-center gap-2 px-3 py-1.5 ${index % 2 === 0 ? "border-r border-slate-300" : ""} ${index < W08_CLASS_3_TEK_SCREWS.length - 2 ? "border-b border-slate-200" : ""}`}>
                <span className="h-1.5 w-1.5 shrink-0 bg-sky-600" />
                <span className="text-[8px] font-semibold text-slate-700">{screw} · Class 3</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-4 border-l-4 border-sky-600 bg-sky-50 px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-sky-800">Wall sheeting parity rule</p>
            <p className="text-[8px] font-bold text-sky-900">Matches the selected roof specification</p>
          </div>
          <p className="mt-1.5 text-[9px] leading-4 text-slate-700">Wall sheeting uses the same selected profile tier, sheet thickness, metallic coating, paint finish, and colour as the roof unless a different project-specific selection is recorded. IBR remains the default at 686mm effective cover.</p>
        </section>

        <section className="mt-4 grid grid-cols-[1fr_58mm] gap-6">
          <div className="border-l-4 border-amber-400 bg-amber-50 px-4 py-3">
            <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-amber-900">Project specification confirmation</p>
            <p className="mt-1.5 text-[9px] leading-4 text-slate-700">The final manufacturer, coating designation, roof and wall side laps, fixing spacing, Tek screw selection and quantities, flashing material, and colour are confirmed for the selected project before supply.</p>
          </div>
          <div className="bg-slate-950 px-4 py-3 text-white">
            <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-slate-400">Standard exclusions</p>
            <p className="mt-1.5 text-[9px] leading-4 text-slate-200">End laps, sealant, eave closures, barge flashings, foam closures, ridge ventilation, gutters, and drip edges.</p>
          </div>
        </section>

        <SpecFooter page="5 of 5" revision={revision} />
      </section> : null}
    </article>
  )
}

export default function AtlasWarehouseProductWorkspace() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const requestedProductCode = searchParams.get("product")
  const initialProductCode = getAtlasProduct(requestedProductCode)?.code || "W08"
  const [data, setData] = useState({ components: [], boms: [], documents: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [specPreviewOpen, setSpecPreviewOpen] = useState(false)
  const [specLength, setSpecLength] = useState(8)
  const [specHeight, setSpecHeight] = useState(3)
  const [specScope, setSpecScope] = useState("structure_only")
  const [specSteelFinish, setSpecSteelFinish] = useState("ZAM")
  const [selectedProductCode, setSelectedProductCode] = useState(initialProductCode)

  useEffect(() => {
    if (!specPreviewOpen) return undefined
    const previousTitle = document.title
    const scopeLabel = W08_SPEC_SCOPES.find((scope) => scope.value === specScope)?.name || "Structure only"
    document.title = `Atlas-W08-8x${specLength}x${specHeight}-${scopeLabel.replaceAll(" ", "-")}`
    return () => { document.title = previousTitle }
  }, [specHeight, specLength, specPreviewOpen, specScope])

  useEffect(() => {
    if (getAtlasProduct(requestedProductCode)) setSelectedProductCode(requestedProductCode)
  }, [requestedProductCode])

  useEffect(() => {
    let active = true
    async function loadProductRecords() {
      setLoading(true)
      setError("")
      try {
        const headers = await getOsAuthHeaders()
        const responses = await Promise.all([
          fetch("/api/os/catalog-items?platform=atlas&kind=component", { cache: "no-store", headers }),
          fetch("/api/os/boms?platform=atlas", { cache: "no-store", headers }),
          fetch("/api/os/documents?platform=atlas", { cache: "no-store", headers }),
        ])
        const payloads = await Promise.all(responses.map((response) => response.json()))
        const failedIndex = responses.findIndex((response) => !response.ok)
        if (failedIndex >= 0) throw new Error(payloads[failedIndex].error || "Could not load the Atlas product record.")
        if (!active) return
        setData({
          components: (payloads[0].records || []).filter((record) => record.productFamilyKey === "warehouses"),
          boms: (payloads[1].records || []).filter((record) => record.code === "ATL-WH-8M-SHELL"),
          documents: (payloads[2].records || []).filter((record) => record.productFamilyKey === "warehouses"),
        })
      } catch (loadError) {
        if (active) setError(loadError.message)
      } finally {
        if (active) setLoading(false)
      }
    }
    loadProductRecords()
    return () => { active = false }
  }, [])

  const bom = data.boms[0]
  const readiness = useMemo(() => [
    { label: "Product definition", ready: true, detail: "W08 scope and modular rules captured" },
    { label: "Reusable components", ready: data.components.length >= 2, detail: `${data.components.length} warehouse records linked` },
    { label: "Baseline BOM", ready: bom?.status === "approved", detail: bom ? `${bom.code} · ${bom.revisionCode}` : "No W08 BOM found" },
    { label: "Pricing basis", ready: true, detail: "Live Atlas warehouse calculator active" },
    { label: "Product documents", ready: data.documents.some((record) => ["reviewed", "issued"].includes(record.status)), detail: `${data.documents.length} warehouse documents linked` },
  ], [bom, data.components.length, data.documents])
  const readinessCount = readiness.filter((item) => item.ready).length
  const readinessPercentage = Math.round((readinessCount / readiness.length) * 100)
  const selectedProduct = ATLAS_PRODUCT_RANGE.find((product) => product.code === selectedProductCode) || ATLAS_PRODUCT_RANGE[0]
  const selectProduct = (productCode) => {
    setSelectedProductCode(productCode)
    router.replace(withAtlasProduct("/os/atlas/products", productCode), { scroll: false })
  }

  if (specPreviewOpen) {
    return (
      <div className="product-spec-preview min-h-screen bg-slate-200/70 p-3 sm:p-6 lg:p-8 print:min-h-0 print:bg-white print:p-0">
        <div className="mx-auto mb-4 flex w-full max-w-[210mm] flex-wrap items-center justify-between gap-3 print:hidden">
          <button type="button" onClick={() => setSpecPreviewOpen(false)} className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700">
            <ArrowLeft className="h-4 w-4" /> Back to product
          </button>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <label className="flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700">
              Length
              <select value={specLength} onChange={(event) => setSpecLength(Number(event.target.value))} className="bg-transparent font-bold text-slate-950 outline-none">
                {ATLAS_W08_LENGTHS_M.map((length) => <option key={length} value={length}>{length}m</option>)}
              </select>
            </label>
            <label className="flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700">
              Eave
              <select value={specHeight} onChange={(event) => setSpecHeight(Number(event.target.value))} className="bg-transparent font-bold text-slate-950 outline-none">
                {ATLAS_W08_EAVE_HEIGHTS_M.map((height) => <option key={height} value={height}>{height}m</option>)}
              </select>
            </label>
            <label className="flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700">
              Scope
              <select value={specScope} onChange={(event) => setSpecScope(event.target.value)} className="max-w-[145px] bg-transparent font-bold text-slate-950 outline-none">
                {W08_SPEC_SCOPES.map((scope) => <option key={scope.value} value={scope.value}>{scope.name}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700">
              Steel
              <select value={specSteelFinish} onChange={(event) => setSpecSteelFinish(event.target.value)} className="bg-transparent font-bold text-slate-950 outline-none">
                {["ZAM", "Galvanised", "Mild steel"].map((finish) => <option key={finish} value={finish}>{finish}</option>)}
              </select>
            </label>
            <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white">
              <Printer className="h-4 w-4" /> Print / Save PDF
            </button>
          </div>
        </div>
        <W08SpecificationSheet
          bom={bom}
          components={data.components}
          selectedLength={specLength}
          selectedHeight={specHeight}
          selectedScope={specScope}
          selectedSteelFinish={specSteelFinish}
        />
      </div>
    )
  }

  return (
    <div className="space-y-5 px-3 py-4 sm:space-y-6 sm:px-6 sm:py-6">
      <section className="overflow-hidden border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-700">Atlas product range</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Select a product source of truth</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Move between Atlas products without mixing their specifications, material logic or controlled documents.</p>
          </div>
          <span className="w-fit bg-slate-950 px-3 py-1.5 text-xs font-bold text-white">{ATLAS_PRODUCT_RANGE.length} products</span>
        </div>
        <div className="flex gap-3 overflow-x-auto p-4 sm:p-5">
          {ATLAS_PRODUCT_RANGE.map((product) => {
            const selected = selectedProductCode === product.code
            return (
              <button
                key={product.code}
                type="button"
                onClick={() => selectProduct(product.code)}
                className={`min-w-[230px] border p-4 text-left transition sm:min-w-[250px] ${
                  selected
                    ? "border-slate-950 bg-slate-950 text-white shadow-lg"
                    : "border-slate-200 bg-slate-50 text-slate-900 hover:border-sky-300 hover:bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className={`font-mono text-[10px] font-bold uppercase tracking-[0.15em] ${selected ? "text-sky-300" : "text-sky-700"}`}>{product.code}</span>
                  <span className={`h-2.5 w-2.5 ${product.available ? "bg-emerald-400" : "bg-amber-400"}`} />
                </div>
                <p className="mt-4 text-base font-bold">{product.name}</p>
                <p className={`mt-1 text-xs ${selected ? "text-slate-400" : "text-slate-500"}`}>{product.family}</p>
                <p className={`mt-3 text-[10px] font-bold uppercase tracking-[0.12em] ${selected ? "text-amber-300" : "text-slate-500"}`}>{product.status}</p>
              </button>
            )
          })}
        </div>
      </section>

      {selectedProductCode !== "W08" ? (
        <section className="relative overflow-hidden rounded-[1.75rem] border border-[#001d2e] bg-[radial-gradient(circle_at_88%_0%,rgba(193,217,229,0.2),transparent_34%),linear-gradient(140deg,#001d2e,#0043f3)] text-white shadow-[0_22px_55px_rgba(0,29,46,0.2)]">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,transparent_58%,rgba(193,217,229,0.16)_58%,rgba(193,217,229,0.16)_59%,transparent_59%)]" />
          <div className="relative grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-sm bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#0043f3]">Atlas system</span>
                <span className="rounded-sm border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-sky-200">{selectedProduct.family}</span>
              </div>
              <p className="mt-6 font-mono text-xs font-bold uppercase tracking-[0.2em] text-sky-300">{selectedProduct.code}</p>
              <h2 className="mt-2 text-3xl font-bold tracking-[-0.04em] sm:text-5xl">{selectedProduct.name}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">{selectedProduct.summary}</p>
            </div>
            <div className="border border-white/10 bg-white/5 p-5 backdrop-blur">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Product record status</p>
              <p className="mt-2 text-xl font-bold text-white">{selectedProduct.status}</p>
              <p className="mt-3 text-xs leading-5 text-slate-400">The commercial product exists, but its controlled product definition has not yet been built to W08 depth.</p>
            </div>
          </div>
        </section>
      ) : null}

      {selectedProductCode !== "W08" ? (
        <section className="grid gap-px overflow-hidden border border-slate-200 bg-slate-200 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["01", "Product definition", "Confirm standard configurations, scope and naming."],
            ["02", "Components", "Register reusable members, connections and fittings."],
            ["03", "BOM and pricing", "Link quantities and commercial logic to the product."],
            ["04", "Documents", "Prepare the controlled internal and client-facing records."],
          ].map(([number, title, detail]) => (
            <div key={number} className="bg-white p-5">
              <span className="font-mono text-xs font-bold text-sky-700">{number}</span>
              <h3 className="mt-4 font-bold text-slate-950">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
            </div>
          ))}
        </section>
      ) : null}

      <div className={selectedProductCode === "W08" ? "contents" : "hidden"}>
      <section className="relative overflow-hidden rounded-[1.75rem] border border-[#001d2e] bg-[radial-gradient(circle_at_90%_0%,_rgba(193,217,229,0.2),_transparent_32%),linear-gradient(145deg,_#001d2e,_#0043f3)] text-white shadow-[0_24px_60px_rgba(0,29,46,0.2)]">
        <div className="grid gap-7 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#0043f3]">Pilot product</span>
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-sky-200">Atlas W-Series</span>
            </div>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">{PRODUCT.code} · Product source of truth</p>
            <h1 className="mt-2 max-w-3xl text-3xl font-bold tracking-[-0.04em] text-white sm:text-5xl">{PRODUCT.name}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">{PRODUCT.summary}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link href="/warehouse-builder?productType=Atlas%20Warehouse&width=8&length=20" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#0043f3] transition hover:bg-[#c1d9e5]">Open live builder <ArrowUpRight className="h-4 w-4" /></Link>
              <Link href={withAtlasProduct("/os/atlas/bom", selectedProductCode)} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">Review W08 BOM</Link>
              <button type="button" onClick={() => setSpecPreviewOpen(true)} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">
                <FileText className="h-4 w-4" /> Preview spec sheet
              </button>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <div className="flex items-end justify-between gap-4">
              <div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Quote readiness</p><p className="mt-2 text-4xl font-bold text-white">{loading ? "--" : `${readinessPercentage}%`}</p></div>
              <ClipboardCheck className="h-9 w-9 text-amber-300" aria-hidden="true" />
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-amber-400 transition-[width] duration-500" style={{ width: `${readinessPercentage}%` }} /></div>
            <p className="mt-3 text-xs leading-5 text-slate-400">{readinessCount} of {readiness.length} product controls are ready.</p>
          </div>
        </div>
      </section>

      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      <AtlasSkuRegistry familyCode="W08" />

      <section className="grid overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.06)] xl:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)]">
        <article className="p-5 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Controlled configuration</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">One width. Modular length. Clear scope.</h2>
          <div className="mt-5 grid gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-3">
            {PRODUCT.specifications.map(([label, value, detail]) => (
              <div key={label} className="bg-white p-4"><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p><p className="mt-2 text-lg font-bold text-slate-950">{value}</p><p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p></div>
            ))}
          </div>
        </article>
        <aside className="border-t border-slate-200 bg-slate-50 p-5 sm:p-7 xl:border-l xl:border-t-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Length logic</p>
          <h3 className="mt-1 text-xl font-bold text-slate-950">Start with one 4m bay</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">The smallest standard arrangement is a 4m-long x 8m-wide structure. Add further 4m bays without creating another warehouse product.</p>
          <div className="mt-5 flex flex-wrap gap-2">{ATLAS_W08_LENGTHS_M.map((length) => <span key={length} className={`rounded-xl border px-3 py-2 text-xs font-bold ${length === 20 ? "border-sky-300 bg-sky-50 text-sky-800" : "border-slate-200 bg-white text-slate-700"}`}>{length}m</span>)}</div>
          <p className="mt-3 text-xs text-slate-500">Standard 4m modules extend to 48m. The confirmed engineering envelope permits lengths up to 50m without additional engineering implications.</p>
        </aside>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {PRODUCT.scopes.map((scope, index) => (
          <article key={scope.name} className={`rounded-[1.4rem] border p-5 shadow-sm ${index === 0 ? "border-slate-800 bg-slate-950 text-white" : "border-slate-200 bg-white"}`}>
            <span className={`grid h-9 w-9 place-items-center rounded-xl text-sm font-bold ${index === 0 ? "bg-amber-400 text-slate-950" : "bg-sky-100 text-sky-700"}`}>{index + 1}</span>
            <h3 className={`mt-5 text-lg font-bold ${index === 0 ? "text-white" : "text-slate-950"}`}>{scope.name}</h3>
            <p className={`mt-2 text-sm leading-6 ${index === 0 ? "text-slate-300" : "text-slate-600"}`}>{scope.detail}</p>
          </article>
        ))}
      </section>

      <section className="grid overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.06)] xl:grid-cols-[minmax(0,1fr)_360px]">
        <article className="p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Product controls</p><h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">W08 readiness trail</h2></div><StatusPill ready={readinessCount === readiness.length} readyLabel="Quote-ready" pendingLabel="In progress" /></div>
          <div className="mt-5 divide-y divide-slate-200">
            {readiness.map((item) => <div key={item.label} className="flex items-center justify-between gap-4 py-3.5"><div className="flex min-w-0 items-center gap-3"><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl ${item.ready ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"}`}>{item.ready ? <Check className="h-4 w-4" /> : <Settings2 className="h-4 w-4" />}</span><div className="min-w-0"><p className="text-sm font-semibold text-slate-900">{item.label}</p><p className="truncate text-xs text-slate-500">{loading ? "Checking live records..." : item.detail}</p></div></div><StatusPill ready={item.ready} /></div>)}
          </div>
        </article>
        <aside className="border-t border-slate-200 bg-amber-50 p-5 sm:p-7 xl:border-l xl:border-t-0">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-400 text-slate-950"><Wrench className="h-5 w-5" /></span>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-amber-900">Engineering review triggers</p>
          <div className="mt-4 space-y-3">{PRODUCT.reviewTriggers.map((item) => <p key={item} className="flex gap-2 text-sm leading-5 text-slate-700"><span className="font-bold text-amber-700">+</span>{item}</p>)}</div>
        </aside>
      </section>

      <section>
        <div className="px-1"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Connected workspaces</p><h2 className="mt-1 text-xl font-bold text-slate-950">Build the product once, use it everywhere</h2></div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {workspaceLinks.map(({ label, href, icon: Icon }) => <Link key={href} href={withAtlasProduct(href, selectedProductCode)} className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md"><span className="flex items-center gap-3 text-sm font-semibold text-slate-800"><span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-600 group-hover:bg-sky-100 group-hover:text-sky-700"><Icon className="h-4 w-4" /></span>{label}</span><ArrowUpRight className="h-4 w-4 text-slate-400" /></Link>)}
        </div>
      </section>
      </div>
    </div>
  )
}
