import { formatCurrency } from "./warehouseEstimate"

const VAT_RATE = 0.15
const DELIVERY_RATE = 19
const DELIVERY_MINIMUM = 1350

const SINGLE_CARPORT_PRICE_INCL_VAT = 14386.64
const DOUBLE_CARPORT_PRICE_INCL_VAT = 16848.48
const PRICE_PER_EXTRA_WIDTH_METER =
  (DOUBLE_CARPORT_PRICE_INCL_VAT - SINGLE_CARPORT_PRICE_INCL_VAT) / (5 - 3)

function calculateCarportPriceInclVat(width) {
  if (width === 3) return SINGLE_CARPORT_PRICE_INCL_VAT
  if (width === 5) return DOUBLE_CARPORT_PRICE_INCL_VAT
  return SINGLE_CARPORT_PRICE_INCL_VAT + (width - 3) * PRICE_PER_EXTRA_WIDTH_METER
}

export const CFLC_CARPORT_SIZE_OPTIONS = [
  {
    value: "single",
    label: "Single Parking (3m x 6m)",
    width: 3,
    length: 6,
    basePriceInclVat: SINGLE_CARPORT_PRICE_INCL_VAT,
    bestFor: "Single vehicle cover, compact side shelter, and smaller utility cover projects.",
  },
  {
    value: "double",
    label: "Double Parking (5m x 6m)",
    width: 5,
    length: 6,
    basePriceInclVat: DOUBLE_CARPORT_PRICE_INCL_VAT,
    bestFor: "Two vehicles, wider side-by-side parking cover, and practical utility shelter use.",
  },
  {
    value: "triple",
    label: "Three Parking Bays (7.5m x 6m)",
    width: 7.5,
    length: 6,
    basePriceInclVat: calculateCarportPriceInclVat(7.5),
    bestFor: "Three vehicles, wider parking cover, and larger day-to-day shelter projects.",
  },
  {
    value: "quad",
    label: "Four Parking Bays (10m x 6m)",
    width: 10,
    length: 6,
    basePriceInclVat: calculateCarportPriceInclVat(10),
    bestFor: "Four vehicles, larger side-by-side parking cover, and broader utility shelter use.",
  },
]

function roundMoney(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100
}

function buildLineItem({ code, label }) {
  return { code, label }
}

export function getCflcCarportOption(value) {
  return CFLC_CARPORT_SIZE_OPTIONS.find((option) => option.value === value) || CFLC_CARPORT_SIZE_OPTIONS[0]
}

export function calculateCflcCarportEstimate(input = {}) {
  const option = getCflcCarportOption(input.size)
  const quantity = Math.max(1, Math.round(Number(input.quantity) || 1))
  const deliveryDistance = Math.max(0, Number(input.deliveryDistance) || 0)

  const basePriceExVatPerUnit = option.basePriceInclVat / (1 + VAT_RATE)
  const structureTotalExVat = basePriceExVatPerUnit * quantity
  const deliveryTotalExVat =
    deliveryDistance > 0 ? Math.max(deliveryDistance * DELIVERY_RATE, DELIVERY_MINIMUM) : 0
  const totalExVat = structureTotalExVat + deliveryTotalExVat
  const vatAmount = totalExVat * VAT_RATE
  const totalInclVat = totalExVat + vatAmount

  return {
    input: {
      size: option.value,
      width: option.width,
      length: option.length,
      quantity,
      deliveryDistance,
    },
    lineItems: [
      buildLineItem({ code: "main-frame", label: "Main frame" }),
      buildLineItem({ code: "bracing", label: "Bracing" }),
      buildLineItem({ code: "purlins", label: "Purlins / hats" }),
      buildLineItem({ code: "fasteners", label: "Fasteners" }),
      buildLineItem({ code: "drawings", label: "Drawings / installation guide" }),
      ...(deliveryDistance > 0
        ? [buildLineItem({ code: "delivery", label: "Delivery" })]
        : []),
    ],
    summary: {
      title: `${quantity > 1 ? `${quantity} x ` : ""}${option.label} CFLC carport kit`,
      estimateRequest: `${quantity > 1 ? `${quantity} x ` : ""}CFLC carport kit · ${option.label}${deliveryDistance > 0 ? ` · Delivery ${deliveryDistance}km` : ""}`,
      layoutNote: option.bestFor,
    },
    pricing: {
      structureTotalExVat: roundMoney(structureTotalExVat),
      deliveryTotalExVat: roundMoney(deliveryTotalExVat),
      totalExVat: roundMoney(totalExVat),
      vatRate: VAT_RATE,
      vatAmount: roundMoney(vatAmount),
      totalInclVat: roundMoney(totalInclVat),
    },
    labels: {
      size: option.label,
      delivery:
        deliveryDistance > 0 ? `${deliveryDistance} km delivery` : "Collection or delivery to be confirmed",
      quantity: `${quantity}`,
    },
    meta: {
      productType: "CFLC Carport",
      productGroup: "carport",
      sourceModel: "CFLC carport kit pricing",
    },
    helpers: {
      totalExVatLabel: formatCurrency(roundMoney(totalExVat)),
      totalInclVatLabel: formatCurrency(roundMoney(totalInclVat)),
    },
  }
}
