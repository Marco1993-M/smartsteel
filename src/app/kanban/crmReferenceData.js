import { normalizeAtlasProductType } from "../../lib/atlasProductIdentity.js"

export const TEAM_MEMBERS = ["Stefan", "Niel", "Victor", "Marco"]

export const LEAD_SOURCE_OPTIONS = [
  "Website form",
  "Warehouse Builder",
  "Estimator",
  "WhatsApp",
  "Phone call",
  "Referral",
  "Google Ads",
  "Organic search",
  "Repeat client",
]

export const PRODUCT_TYPE_OPTIONS = [
  "LSF Warehouse",
  "Atlas Warehouse",
  "Solar carport",
  "Solar ground mount",
  "Solar structure",
  "LSF trusses",
  "CFLC trusses",
  "Bracketry",
  "Other",
]

export const PRODUCT_TYPE_META = {
  "LSF Warehouse": {
    line: "LSF",
    family: "Warehouses",
    lane: "Structural system",
    description: "Light steel frame warehouse projects.",
  },
  "Atlas Warehouse": {
    line: "Atlas",
    family: "Warehouses",
    lane: "Structural system",
    description: "Cold-formed lipped channel warehouse projects.",
  },
  "Solar carport": {
    line: "Atlas",
    family: "Solar structures",
    lane: "Energy support",
    description: "Vehicle cover structures built for solar layouts.",
  },
  "Solar ground mount": {
    line: "Atlas",
    family: "Solar structures",
    lane: "Energy support",
    description: "Ground-mounted solar support structures.",
  },
  "Solar structure": {
    line: "Atlas",
    family: "Solar structures",
    lane: "Energy support",
    description: "Custom solar support steel.",
  },
  "LSF trusses": {
    line: "LSF",
    family: "Trusses",
    lane: "Roof structures",
    description: "Light steel frame truss projects.",
  },
  "CFLC trusses": {
    line: "Atlas",
    family: "Trusses",
    lane: "Roof structures",
    description: "Lip channel truss projects.",
  },
  Bracketry: {
    line: "Atlas",
    family: "Bracketry",
    lane: "Fabrication",
    description: "Brackets, fittings, and supporting fabricated parts.",
  },
  Other: {
    line: "General",
    family: "Custom projects",
    lane: "General",
    description: "Custom steel work not yet grouped into a standard lane.",
  },
}

export function getProductTypeMeta(productType) {
  return PRODUCT_TYPE_META[String(normalizeAtlasProductType(productType) || "").trim()] || PRODUCT_TYPE_META.Other
}

export function getOpportunityDisplayTitle(lead) {
  const productType = String(lead?.product_type || "").trim()
  const name = [lead?.name, lead?.last_name].filter(Boolean).join(" ").trim()

  if (name && productType) return `${name} · ${productType}`
  if (name) return name
  if (productType) return productType
  return "Untitled opportunity"
}

export function getOpportunitySummary(lead) {
  const meta = getProductTypeMeta(lead?.product_type)
  const hasQuoteValue = String(lead?.quote_value || "").trim().length > 0

  return {
    title: getOpportunityDisplayTitle(lead),
    productType: String(lead?.product_type || "").trim() || "Not selected",
    line: meta.line,
    family: meta.family,
    lane: meta.lane,
    description: meta.description,
    owner: String(lead?.allocated_to || "").trim() || "Unassigned",
    nextAction: String(lead?.next_action || "").trim() || "No next step captured yet.",
    quoteState: hasQuoteValue ? "Value captured" : "Value not captured",
  }
}

function getLeadFreshnessDate(lead) {
  return lead?.follow_up_at || lead?.updated_at || lead?.created_at || null
}

function getDaysSince(dateValue) {
  if (!dateValue) return 0
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return 0
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
}

function isBeforeToday(dateValue) {
  if (!dateValue) return false
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date.getTime() < today.getTime()
}

export const OPPORTUNITY_QUICK_VIEWS = [
  {
    key: "atlas_warehouses",
    label: "Atlas Warehouses",
    matcher: (summary) => summary.line === "Atlas" && summary.family === "Warehouses",
  },
  {
    key: "atlas_solar",
    label: "Atlas Solar",
    matcher: (summary) => summary.line === "Atlas" && summary.family === "Solar structures",
  },
  {
    key: "lsf_warehouses",
    label: "LSF Warehouses",
    matcher: (summary) => summary.line === "LSF" && summary.family === "Warehouses",
  },
  {
    key: "trusses",
    label: "Trusses",
    matcher: (summary) => summary.family === "Trusses",
  },
  {
    key: "bracketry",
    label: "Bracketry",
    matcher: (summary) => summary.family === "Bracketry",
  },
  {
    key: "stalled",
    label: "Stalled review",
    matcher: (_summary, lead) => {
      const staleDays = getDaysSince(getLeadFreshnessDate(lead))
      return (
        isBeforeToday(lead?.follow_up_at) ||
        !String(lead?.next_action || "").trim() ||
        staleDays > 5 ||
        (!String(lead?.allocated_to || "").trim() && String(lead?.status || "").trim().toLowerCase() !== "won")
      )
    },
  },
]

export function matchesOpportunityQuickView(lead, quickViewKey) {
  if (!quickViewKey || quickViewKey === "all") return true
  const quickView = OPPORTUNITY_QUICK_VIEWS.find((item) => item.key === quickViewKey)
  if (!quickView) return true
  return quickView.matcher(getOpportunitySummary(lead), lead)
}
