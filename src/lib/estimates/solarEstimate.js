import { formatCurrency } from "./warehouseEstimate"

const DEFAULT_MARKUP = 1.32
const DEFAULT_DELIVERY_MINIMUM = 1350

export const SOLAR_PRODUCT_TYPE_OPTIONS = [
  { value: "Solar carport", label: "Solar carport" },
  { value: "Solar ground mount", label: "Solar ground mount" },
  { value: "Solar structure", label: "Solar structure" },
]

export const SOLAR_SCOPE_OPTIONS = [
  { value: "supply_only", label: "Supply only" },
  { value: "supply_install", label: "Supply + installation" },
]

export const SOLAR_ESTIMATE_MATERIALS = {
  "Solar carport": {
    primarySteelRate: 1480,
    secondarySteelRate: 255,
    hardwareRate: 120,
    installationRate: 360,
    moduleSupportRate: 145,
  },
  "Solar ground mount": {
    primarySteelRate: 1320,
    secondarySteelRate: 225,
    hardwareRate: 105,
    installationRate: 330,
    moduleSupportRate: 135,
  },
  "Solar structure": {
    primarySteelRate: 1400,
    secondarySteelRate: 235,
    hardwareRate: 115,
    installationRate: 345,
    moduleSupportRate: 140,
  },
  deliveryRate: 19,
}

function roundMoney(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100
}

function buildLineItem({ code, label, quantity, unit, unitRate, total }) {
  return {
    code,
    label,
    quantity,
    unit,
    unitRate: roundMoney(unitRate),
    total: roundMoney(total),
  }
}

function formatDimension(value) {
  return `${Number(value)}m`
}

export function validateSolarEstimateInput(input) {
  const productType = input?.productType || "Solar carport"
  const width = Number(input?.width)
  const length = Number(input?.length)
  const wallHeight = Number(input?.wallHeight || 3)
  const quantity = Math.max(1, Math.round(Number(input?.quantity) || 1))
  const moduleCount = Math.max(0, Math.round(Number(input?.moduleCount) || 0))
  const deliveryDistance = Math.max(Number(input?.deliveryDistance) || 0, 0)
  const scope = input?.scope || (input?.claddingInstalled ? "supply_install" : "supply_only")

  if (!SOLAR_PRODUCT_TYPE_OPTIONS.some((option) => option.value === productType)) {
    throw new Error("Please choose a valid solar structure type.")
  }

  if (!Number.isFinite(width) || width <= 0) {
    throw new Error("Please enter a valid structure width.")
  }

  if (!Number.isFinite(length) || length <= 0) {
    throw new Error("Please enter a valid structure length.")
  }

  if (!Number.isFinite(wallHeight) || wallHeight <= 0) {
    throw new Error("Please enter a valid clearance height.")
  }

  if (!SOLAR_SCOPE_OPTIONS.some((option) => option.value === scope)) {
    throw new Error("Please choose a valid project scope.")
  }

  return {
    productType,
    width,
    length,
    wallHeight,
    quantity,
    moduleCount,
    deliveryDistance,
    scope,
    claddingInstalled: scope === "supply_install",
  }
}

export function calculateSolarEstimate(input) {
  const normalized = validateSolarEstimateInput(input)
  const {
    productType,
    width,
    length,
    wallHeight,
    quantity,
    moduleCount,
    deliveryDistance,
    scope,
    claddingInstalled,
  } = normalized

  const rates = SOLAR_ESTIMATE_MATERIALS[productType]
  const area = width * length
  const totalArea = area * quantity
  const totalModules = moduleCount * quantity
  const deliveryCost = deliveryDistance > 0
    ? Math.max(deliveryDistance * SOLAR_ESTIMATE_MATERIALS.deliveryRate, DEFAULT_DELIVERY_MINIMUM)
    : 0

  const primarySteelCost = totalArea * rates.primarySteelRate
  const secondarySteelCost = totalArea * rates.secondarySteelRate
  const hardwareCost = totalArea * rates.hardwareRate
  const moduleSupportCost = totalModules * rates.moduleSupportRate
  const installationCost = claddingInstalled ? totalArea * rates.installationRate : 0

  const baseTotal =
    primarySteelCost +
    secondarySteelCost +
    hardwareCost +
    moduleSupportCost +
    installationCost +
    deliveryCost

  const lineItems = [
    buildLineItem({
      code: "primary-steel",
      label: `${productType} primary steelwork`,
      quantity: totalArea,
      unit: "m²",
      unitRate: rates.primarySteelRate,
      total: primarySteelCost,
    }),
    buildLineItem({
      code: "secondary-steel",
      label: "Secondary steel, purlins and support members",
      quantity: totalArea,
      unit: "m²",
      unitRate: rates.secondarySteelRate,
      total: secondarySteelCost,
    }),
    buildLineItem({
      code: "hardware",
      label: "Base plates, bracing and connection hardware",
      quantity: totalArea,
      unit: "m²",
      unitRate: rates.hardwareRate,
      total: hardwareCost,
    }),
  ]

  if (totalModules > 0) {
    lineItems.push(
      buildLineItem({
        code: "module-support",
        label: "Module support interfaces and fixing allowance",
        quantity: totalModules,
        unit: "modules",
        unitRate: rates.moduleSupportRate,
        total: moduleSupportCost,
      })
    )
  }

  if (claddingInstalled) {
    lineItems.push(
      buildLineItem({
        code: "installation",
        label: "Installation and site assembly",
        quantity: totalArea,
        unit: "m²",
        unitRate: rates.installationRate,
        total: installationCost,
      })
    )
  }

  if (deliveryCost > 0) {
    lineItems.push(
      buildLineItem({
        code: "delivery",
        label: deliveryDistance * SOLAR_ESTIMATE_MATERIALS.deliveryRate < DEFAULT_DELIVERY_MINIMUM
          ? "Delivery (minimum charge)"
          : "Delivery",
        quantity: deliveryDistance || 1,
        unit: deliveryDistance > 0 ? "km" : "lot",
        unitRate:
          deliveryDistance * SOLAR_ESTIMATE_MATERIALS.deliveryRate < DEFAULT_DELIVERY_MINIMUM
            ? DEFAULT_DELIVERY_MINIMUM
            : SOLAR_ESTIMATE_MATERIALS.deliveryRate,
        total: deliveryCost,
      })
    )
  }

  const estimatedTotal = roundMoney(baseTotal * DEFAULT_MARKUP)
  const scopeLabel =
    SOLAR_SCOPE_OPTIONS.find((option) => option.value === scope)?.label || "Supply only"
  const title = `${formatDimension(width)} x ${formatDimension(length)} ${productType}`
  const estimateRequestParts = [
    `${productType}`,
    `${formatDimension(width)} wide`,
    `${formatDimension(length)} long`,
    `${formatDimension(wallHeight)} clearance height`,
    `Quantity ${quantity}`,
    scopeLabel,
  ]

  if (moduleCount > 0) {
    estimateRequestParts.push(`${moduleCount} modules per structure`)
  }

  if (deliveryDistance > 0) {
    estimateRequestParts.push(`Delivery ${deliveryDistance}km`)
  }

  return {
    input: normalized,
    lineItems,
    summary: {
      title,
      estimateRequest: estimateRequestParts.join(" · "),
      layoutNote: "",
    },
    pricing: {
      baseTotal: roundMoney(baseTotal),
      markupMultiplier: DEFAULT_MARKUP,
      estimatedTotal,
      competitorLow: roundMoney(estimatedTotal * 0.92),
      competitorHigh: roundMoney(estimatedTotal * 1.08),
    },
    totals: {
      area: roundMoney(area),
      totalArea: roundMoney(totalArea),
      totalModules,
    },
    labels: {
      area: `${roundMoney(totalArea)} m²`,
      scope: scopeLabel,
      delivery: deliveryDistance > 0 ? `${deliveryDistance} km` : "Collection / not specified",
      modules: totalModules > 0 ? `${totalModules}` : "Not specified",
    },
    meta: {
      productType,
      productGroup: "solar",
    },
  }
}

export { formatCurrency }
