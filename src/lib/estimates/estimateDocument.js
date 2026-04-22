import { formatCurrency } from "./warehouseEstimate"

export const ESTIMATE_TERMS = [
  "This estimate is based on the scope, dimensions, and site assumptions captured at the time of pricing.",
  "Final pricing is subject to design confirmation, delivery conditions, installation access, and Smart Steel approval.",
  "Lead times and installation scheduling are confirmed only once the final scope, deposit, and project readiness are in place.",
  "Any changes to dimensions, cladding, finishes, delivery distance, or structural requirements may result in a revised estimate.",
]

export const ESTIMATE_EXCLUSIONS = [
  "Civil works, foundations, and concrete slabs unless specifically included in writing.",
  "Electrical work, solar modules, inverters, and balance-of-system components unless clearly itemised.",
  "Council approvals, engineering sign-off fees, or consultant costs unless expressly noted.",
  "Unforeseen site conditions, crane access issues, abnormal transport requirements, or after-hours work.",
]

function formatDimension(value) {
  const numeric = Number(value || 0)
  if (!Number.isFinite(numeric) || numeric <= 0) return "Not specified"
  return `${numeric}m`
}

export function formatEstimateDate(value) {
  if (!value) return "Not saved"

  return new Date(value).toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function buildEstimateDisplayModel(estimate, lead) {
  const input = estimate?.input_data || {}
  const lineItems = Array.isArray(estimate?.line_items) ? estimate.line_items : []
  const subtotal = Number(estimate?.subtotal || 0)
  const total = Number(estimate?.total || 0)
  const markupMultiplier = Number(estimate?.markup_multiplier || 1)
  const markupValue = Math.max(total - subtotal, 0)
  const area = Number(input.width || 0) * Number(input.length || 0)

  return {
    estimateNumber: `${String(estimate?.product_type || "Estimate").slice(0, 3).toUpperCase()}-${String(
      estimate?.version_no || 1
    ).padStart(3, "0")}`,
    createdLabel: formatEstimateDate(estimate?.created_at),
    clientName: [lead?.name, lead?.last_name].filter(Boolean).join(" ") || "Client not linked",
    clientEmail: lead?.email || "Not supplied",
    clientPhone: lead?.phone || "Not supplied",
    productType: estimate?.product_type || lead?.product_type || "Warehouse",
    widthLabel: formatDimension(input.width),
    lengthLabel: formatDimension(input.length),
    areaLabel: area > 0 ? `${area} m²` : "Not specified",
    claddingLabel: input.cladding || "Not specified",
    deliveryLabel:
      Number.isFinite(Number(input.deliveryDistance)) && Number(input.deliveryDistance) > 0
        ? `${Number(input.deliveryDistance)} km`
        : "Collection / not specified",
    installationLabel: input.claddingInstalled ? "Included" : "Structure supply only",
    notes: estimate?.notes || "",
    lineItems,
    subtotalLabel: formatCurrency(subtotal),
    markupLabel: markupMultiplier > 1 ? `${markupMultiplier.toFixed(2)}x` : "Included",
    markupValueLabel: formatCurrency(markupValue),
    totalLabel: formatCurrency(total),
    shareToken: estimate?.share_token || "",
  }
}
