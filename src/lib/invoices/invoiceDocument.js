import { formatCurrency } from "../estimates/warehouseEstimate"

export const INVOICE_TERMS = [
  "Payment is due according to the terms shown on this invoice unless otherwise agreed in writing.",
  "Please use the invoice number as your payment reference when making payment.",
  "Any queries on scope, quantities, or billing should be raised with Smart Steel as soon as possible.",
  "Banking details and remittance support are available directly from the Smart Steel accounts team.",
]

export const SMART_STEEL_BILLING_DETAILS = {
  tradingName: "SmartSteel.co.za",
  legalEntity: "Pequeno Home (Pty) Ltd",
  divisionNote: "SmartSteel.co.za is a division of Pequeno Home (Pty) Ltd",
  registrationNumber: "2023/159449/07",
  vatNumber: "4400319457",
  bankName: "First National Bank (FNB)",
  branchCode: "250 655",
  accountNumber: "63077871094",
  accountType: "Business Current Account",
  beneficiaryReference: "Invoice number as displayed on top",
  proofOfPaymentEmails: ["info@smartsteel.co.za"],
}

function formatDimension(value) {
  const numeric = Number(value || 0)
  if (!Number.isFinite(numeric) || numeric <= 0) return "Not specified"
  return `${numeric}m`
}

function formatInvoiceDate(value) {
  if (!value) return "Not specified"

  return new Date(value).toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function buildInvoiceDisplayModel(invoice, lead) {
  const input = invoice?.input_data || {}
  const lineItems = Array.isArray(invoice?.line_items) ? invoice.line_items : []
  const subtotal = Number(invoice?.subtotal || 0)
  const vatRate = Number(invoice?.vat_rate || 0.15)
  const vatAmount = subtotal * vatRate
  const totalInclVat = subtotal + vatAmount
  const quantity = Math.max(1, Number(input.quantity || 1))
  const area = Number(input.width || 0) * Number(input.length || 0)
  const totalArea = area * quantity
  const invoiceFor =
    invoice?.invoice_for ||
    input.invoiceFor ||
    invoice?.product_type_display ||
    invoice?.product_type ||
    lead?.product_type ||
    "Smart Steel project"

  const summaryFields = [
    { label: "Invoice for", value: invoiceFor },
    {
      label: "Reference",
      value: invoice?.reference_no || "Not specified",
    },
    {
      label: "Payment terms",
      value: invoice?.payment_terms || "Not specified",
    },
    {
      label: "Product type",
      value: invoice?.product_type_display || invoice?.product_type || lead?.product_type || "Not specified",
    },
    {
      label: "Width",
      value: input.width ? formatDimension(input.width) : "Not specified",
    },
    {
      label: "Length",
      value: input.length ? formatDimension(input.length) : "Not specified",
    },
    {
      label: "Quantity",
      value: `${quantity}`,
    },
    {
      label: "Area",
      value:
        area > 0
          ? quantity > 1
            ? `${area} m² each (${totalArea} m² total)`
            : `${area} m²`
          : "Not specified",
    },
  ]

  return {
    invoiceNumber: invoice?.invoice_number || `INV-${String(invoice?.sequence_no || 1).padStart(3, "0")}`,
    title: invoice?.title || `${invoiceFor} Invoice`,
    clientName: [lead?.name, lead?.last_name].filter(Boolean).join(" ") || "Client not linked",
    clientEmail: lead?.email || "Not supplied",
    clientPhone: lead?.phone || "Not supplied",
    issueDateLabel: formatInvoiceDate(invoice?.issue_date || invoice?.created_at),
    dueDateLabel: formatInvoiceDate(invoice?.due_date),
    invoiceFor,
    productTypeLabel: invoice?.product_type_display || invoice?.product_type || lead?.product_type || "Not specified",
    summaryFields,
    lineItems,
    subtotalLabel: formatCurrency(subtotal),
    vatLabel: formatCurrency(vatAmount),
    totalInclVatLabel: formatCurrency(totalInclVat),
    paymentTermsLabel: invoice?.payment_terms || "Payment due as agreed",
    notes: invoice?.notes || "",
    preparedByLabel: "Smart Steel Accounts Team",
    billingDetails: SMART_STEEL_BILLING_DETAILS,
    shareToken: invoice?.share_token || "",
  }
}
