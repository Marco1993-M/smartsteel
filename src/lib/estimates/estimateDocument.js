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

function addDays(value, days) {
  const date = new Date(value || Date.now())
  date.setDate(date.getDate() + days)
  return date
}

export function buildEstimateDisplayModel(estimate, lead) {
  const input = estimate?.input_data || {}
  const lineItems = Array.isArray(estimate?.line_items) ? estimate.line_items : []
  const subtotal = Number(estimate?.subtotal || 0)
  const total = Number(estimate?.total || 0)
  const vatRate = 0.15
  const vatAmount = total * vatRate
  const totalInclVat = total + vatAmount
  const area = Number(input.width || 0) * Number(input.length || 0)
  const hasDimensions = Number(input.width || 0) > 0 && Number(input.length || 0) > 0
  const productType = estimate?.product_type || lead?.product_type || "Warehouse"
  const quotationTitle = hasDimensions
    ? `${formatDimension(input.width)} x ${formatDimension(input.length)} ${productType} Quotation`
    : `${productType} Quotation`

  return {
    estimateNumber: `${String(estimate?.product_type || "Estimate").slice(0, 3).toUpperCase()}-${String(
      estimate?.version_no || 1
    ).padStart(3, "0")}`,
    createdLabel: formatEstimateDate(estimate?.created_at),
    validUntilLabel: formatEstimateDate(addDays(estimate?.created_at, 14)),
    clientName: [lead?.name, lead?.last_name].filter(Boolean).join(" ") || "Client not linked",
    clientEmail: lead?.email || "Not supplied",
    clientPhone: lead?.phone || "Not supplied",
    productType,
    quotationTitle,
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
    subtotalLabel: formatCurrency(total),
    vatLabel: formatCurrency(vatAmount),
    totalInclVatLabel: formatCurrency(totalInclVat),
    preparedByLabel: "Smart Steel Sales Team",
    shareToken: estimate?.share_token || "",
  }
}
