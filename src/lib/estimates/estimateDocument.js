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

function formatArea(value) {
  const numeric = Number(value || 0)
  if (!Number.isFinite(numeric) || numeric <= 0) return "Not specified"
  return `${new Intl.NumberFormat("en-ZA", { maximumFractionDigits: 2 }).format(numeric)} m²`
}

function getSavedEstimateTitle(estimate) {
  return String(estimate?.title || "").replace(/\s+V\d+$/i, "").trim()
}

function isSolarProduct(productType) {
  return ["Solar carport", "Solar ground mount", "Solar structure"].includes(productType)
}

function isTrussProduct(productType) {
  return ["LSF trusses", "CFLC trusses"].includes(productType)
}

function getRoofStyleLabel(value) {
  return value === "mono_pitch" ? "Mono pitch" : "Dual pitch"
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
  const discountPercent = Math.min(100, Math.max(0, Number(input.discountPercent || 0)))
  const discountAmount = Math.max(0, subtotal - total)
  const vatRate = 0.15
  const vatAmount = total * vatRate
  const totalInclVat = total + vatAmount
  const area = Number(input.width || 0) * Number(input.length || 0)
  const quantity = Math.max(1, Number(input.quantity || 1))
  const moduleCount = Math.max(0, Number(input.moduleCount || 0))
  const totalModuleCount = moduleCount * quantity
  const totalArea = area * quantity
  const hasDimensions = Number(input.width || 0) > 0 && Number(input.length || 0) > 0
  const productType = estimate?.product_type || lead?.product_type || "LSF Warehouse"
  const productTypeLabel =
    input.productTypeLabel ||
    estimate?.product_type_display ||
    productType
  const solarProduct = isSolarProduct(productType)
  const groundMountProduct = productType === "Solar ground mount"
  const trussProduct = isTrussProduct(productType)
  const roofStyleLabel = getRoofStyleLabel(input.roofStyle)
  const layoutNote =
    Number(input.length || 0) > 0 &&
    Number(input.effectiveLength || 0) > 0 &&
    Number(input.effectiveLength) !== Number(input.length)
      ? `Requested depth ${Number(input.length)}m is priced against a practical ${Number(input.effectiveLength)}m bay layout.`
      : ""
  const generatedQuotationTitle = trussProduct
    ? `${quantity > 1 ? `${quantity} x ` : ""}${formatDimension(input.width)} ${roofStyleLabel} ${productTypeLabel} Quotation`
    : groundMountProduct
      ? `${quantity > 1 ? `${quantity} x ` : ""}${totalModuleCount || moduleCount} Panel ${productTypeLabel} Quotation`
    : hasDimensions
      ? `${quantity > 1 ? `${quantity} x ` : ""}${formatDimension(input.width)} x ${formatDimension(input.length)} ${productTypeLabel} Quotation`
      : `${productTypeLabel} Quotation`
  const quotationTitle = getSavedEstimateTitle(estimate) || generatedQuotationTitle
  const summaryFields = trussProduct
    ? [
        { label: "Span", value: formatDimension(input.width) },
        { label: "Building length", value: formatDimension(input.length) },
        { label: "Roof style", value: roofStyleLabel },
        { label: "Roof pitch", value: input.roofPitch ? `${Number(input.roofPitch)}°` : "Not specified" },
        { label: "Truss spacing", value: input.trussSpacing ? formatDimension(input.trussSpacing) : "Not specified" },
        { label: "Quantity", value: `${quantity}` },
        {
          label: "Delivery",
          value:
            Number.isFinite(Number(input.deliveryDistance)) && Number(input.deliveryDistance) > 0
              ? `${Number(input.deliveryDistance)} km`
              : "Collection / not specified",
        },
        {
          label: "Installation",
          value: input.claddingInstalled ? "Included" : "Supply only",
        },
      ]
    : solarProduct
    ? [
        { label: groundMountProduct ? "Layout width" : "Width", value: formatDimension(input.width) },
        { label: groundMountProduct ? "Layout length" : "Length", value: formatDimension(input.length) },
        { label: groundMountProduct ? "Structure basis" : "Clearance", value: groundMountProduct ? "Structure-only starting budget" : formatDimension(input.wallHeight) },
        { label: "Quantity", value: `${quantity}` },
        {
          label: groundMountProduct ? "Layout area" : "Area",
          value:
            area > 0
              ? quantity > 1
                ? `${formatArea(area)} each (${formatArea(totalArea)} total)`
                : formatArea(area)
              : "Not specified",
        },
        {
          label: groundMountProduct ? "Panel count" : "Modules",
          value: totalModuleCount > 0 ? `${totalModuleCount}` : "Not specified",
        },
        {
          label: "Delivery",
          value:
            Number.isFinite(Number(input.deliveryDistance)) && Number(input.deliveryDistance) > 0
              ? `${Number(input.deliveryDistance)} km`
              : "Collection / not specified",
        },
        {
          label: "Installation",
          value: groundMountProduct
            ? input.claddingInstalled
              ? "Included"
              : "Reviewed after enquiry"
            : input.claddingInstalled
              ? "Included"
              : "Structure supply only",
        },
      ]
    : [
        { label: "Width", value: formatDimension(input.width) },
        { label: "Length", value: formatDimension(input.length) },
        { label: "Height", value: formatDimension(input.wallHeight) },
        { label: "Quantity", value: `${quantity}` },
        {
          label: "Area",
          value:
            area > 0
              ? quantity > 1
                ? `${formatArea(area)} each (${formatArea(totalArea)} total)`
                : formatArea(area)
              : "Not specified",
        },
        { label: "Cladding", value: input.cladding || "Not specified" },
        {
          label: "Delivery",
          value:
            Number.isFinite(Number(input.deliveryDistance)) && Number(input.deliveryDistance) > 0
              ? `${Number(input.deliveryDistance)} km`
              : "Collection / not specified",
        },
        {
          label: "Installation",
          value: input.claddingInstalled ? "Included" : "Structure supply only",
        },
      ]

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
    productTypeLabel,
    quotationTitle,
    widthLabel: formatDimension(input.width),
    lengthLabel: formatDimension(input.length),
    heightLabel: formatDimension(input.wallHeight),
    quantityLabel: `${quantity}`,
    areaLabel:
      area > 0
        ? quantity > 1
          ? `${formatArea(area)} each (${formatArea(totalArea)} total)`
          : formatArea(area)
        : "Not specified",
    claddingLabel: input.cladding || "Not specified",
    deliveryLabel:
      Number.isFinite(Number(input.deliveryDistance)) && Number(input.deliveryDistance) > 0
        ? `${Number(input.deliveryDistance)} km`
        : "Collection / not specified",
    installationLabel: input.claddingInstalled ? "Included" : "Structure supply only",
    summaryFields,
    notes: [layoutNote, estimate?.notes].filter(Boolean).join("\n\n"),
    lineItems,
    hasDiscount: discountPercent > 0 && discountAmount > 0,
    discountPercentLabel: `${new Intl.NumberFormat("en-ZA", { maximumFractionDigits: 2 }).format(discountPercent)}%`,
    grossSubtotalLabel: formatCurrency(subtotal),
    discountLabel: formatCurrency(discountAmount),
    subtotalLabel: formatCurrency(total),
    vatLabel: formatCurrency(vatAmount),
    totalInclVatLabel: formatCurrency(totalInclVat),
    preparedByLabel: "Smart Steel Sales Team",
    shareToken: estimate?.share_token || "",
  }
}
