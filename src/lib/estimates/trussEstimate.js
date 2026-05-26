import { formatCurrency } from "./warehouseEstimate"

const DEFAULT_MARKUP = 1.32
const DEFAULT_DELIVERY_MINIMUM = 1350
const DEFAULT_PITCH = 15
const DEFAULT_SPACING = 1.2

export const TRUSS_PRODUCT_TYPES = ["LSF trusses", "CFLC trusses"]
export const TRUSS_ROOF_STYLE_OPTIONS = [
  { value: "dual_pitch", label: "Dual pitch" },
  { value: "mono_pitch", label: "Mono pitch" },
]

const TRUSS_MATERIALS = {
  "LSF trusses": {
    fabricatedRatePerMeter: 344.88,
    connectionPackPerTruss: 220,
    engineeringBase: 2400,
    engineeringPerTruss: 85,
    installRatePerSqm: 95,
    deliveryRatePerKm: 19,
  },
  "CFLC trusses": {
    fabricatedRatePerMeter: 286,
    connectionPackPerTruss: 190,
    engineeringBase: 2200,
    engineeringPerTruss: 75,
    installRatePerSqm: 88,
    deliveryRatePerKm: 19,
  },
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
  return `${roundMoney(value)}m`
}

function getRoofStyleLabel(value) {
  return TRUSS_ROOF_STYLE_OPTIONS.find((option) => option.value === value)?.label || "Dual pitch"
}

function validateTrussEstimateInput(input) {
  const productType = TRUSS_PRODUCT_TYPES.includes(input?.productType) ? input.productType : "LSF trusses"
  const width = Number(input?.width)
  const length = Number(input?.length)
  const quantity = Math.max(1, Math.round(Number(input?.quantity) || 1))
  const roofStyle = input?.roofStyle || "dual_pitch"
  const roofPitch = Number(input?.roofPitch || DEFAULT_PITCH)
  const trussSpacing = Number(input?.trussSpacing || DEFAULT_SPACING)
  const deliveryDistance = Math.max(Number(input?.deliveryDistance) || 0, 0)
  const installIncluded = Boolean(input?.claddingInstalled)

  if (!Number.isFinite(width) || width <= 0) {
    throw new Error("Please enter a valid truss span.")
  }

  if (!Number.isFinite(length) || length <= 0) {
    throw new Error("Please enter a valid building length.")
  }

  if (!TRUSS_ROOF_STYLE_OPTIONS.some((option) => option.value === roofStyle)) {
    throw new Error("Please choose a valid roof style.")
  }

  if (!Number.isFinite(roofPitch) || roofPitch <= 0) {
    throw new Error("Please enter a valid roof pitch.")
  }

  if (!Number.isFinite(trussSpacing) || trussSpacing <= 0) {
    throw new Error("Please enter a valid truss spacing.")
  }

  return {
    productType,
    width,
    length,
    quantity,
    roofStyle,
    roofPitch,
    trussSpacing,
    deliveryDistance,
    claddingInstalled: installIncluded,
  }
}

export function calculateTrussEstimate(input) {
  const normalized = validateTrussEstimateInput(input)
  const {
    productType,
    width,
    length,
    quantity,
    roofStyle,
    roofPitch,
    trussSpacing,
    deliveryDistance,
    claddingInstalled,
  } = normalized

  const rates = TRUSS_MATERIALS[productType]
  const pitchRadians = (roofPitch * Math.PI) / 180
  const roofStyleLabel = getRoofStyleLabel(roofStyle)
  const slopeLength =
    roofStyle === "mono_pitch"
      ? width / Math.cos(pitchRadians)
      : width / 2 / Math.cos(pitchRadians)
  const topChordLength = roofStyle === "mono_pitch" ? slopeLength : slopeLength * 2
  const bottomChordLength = width
  const webbingFactor = roofStyle === "mono_pitch" ? 0.35 : 0.45
  const memberLengthPerTruss = (topChordLength + bottomChordLength) * (1 + webbingFactor)

  const trussCountPerSet = Math.max(2, Math.ceil(length / trussSpacing) + 1)
  const areaPerSet = width * length
  const totalTrussCount = trussCountPerSet * quantity
  const totalMemberLength = memberLengthPerTruss * totalTrussCount
  const fabricatedCost = totalMemberLength * rates.fabricatedRatePerMeter
  const connectionCost = totalTrussCount * rates.connectionPackPerTruss
  const engineeringCost =
    quantity * rates.engineeringBase + totalTrussCount * rates.engineeringPerTruss
  const installationCost = claddingInstalled ? areaPerSet * quantity * rates.installRatePerSqm : 0
  const deliveryCost =
    deliveryDistance > 0
      ? Math.max(DEFAULT_DELIVERY_MINIMUM, deliveryDistance * rates.deliveryRatePerKm)
      : 0

  const baseTotal = fabricatedCost + connectionCost + engineeringCost + installationCost + deliveryCost
  const estimatedTotal = roundMoney(baseTotal * DEFAULT_MARKUP)

  const lineItems = [
    buildLineItem({
      code: "fabricated_trusses",
      label: `${productType} fabricated trusses`,
      quantity: roundMoney(totalMemberLength),
      unit: "m",
      unitRate: rates.fabricatedRatePerMeter,
      total: fabricatedCost,
    }),
    buildLineItem({
      code: "connections",
      label: "Connection pack, cleats and fasteners",
      quantity: totalTrussCount,
      unit: "trusses",
      unitRate: rates.connectionPackPerTruss,
      total: connectionCost,
    }),
    buildLineItem({
      code: "engineering",
      label: "Engineering drawings and detailing",
      quantity,
      unit: "set",
      unitRate: engineeringCost / quantity,
      total: engineeringCost,
    }),
  ]

  if (deliveryCost > 0) {
    lineItems.push(
      buildLineItem({
        code: "delivery",
        label: "Delivery",
        quantity: deliveryDistance,
        unit: "km",
        unitRate: deliveryCost / Math.max(deliveryDistance, 1),
        total: deliveryCost,
      })
    )
  }

  if (installationCost > 0) {
    lineItems.push(
      buildLineItem({
        code: "installation",
        label: "Installation",
        quantity: roundMoney(areaPerSet * quantity),
        unit: "m²",
        unitRate: rates.installRatePerSqm,
        total: installationCost,
      })
    )
  }

  const title = `${quantity > 1 ? `${quantity} x ` : ""}${formatDimension(width)} ${roofStyleLabel} ${productType}`
  const estimateRequestParts = [
    `${quantity > 1 ? `${quantity} x ` : ""}${productType}`,
    `${formatDimension(width)} span`,
    `${formatDimension(length)} building length`,
    `${roofStyleLabel.toLowerCase()} roof`,
    `${roofPitch}° pitch`,
    `${formatDimension(trussSpacing)} spacing`,
    claddingInstalled ? "installation included" : "supply only",
  ]

  if (deliveryDistance > 0) {
    estimateRequestParts.push(`delivery ${deliveryDistance}km`)
  }

  return {
    input: normalized,
    metrics: {
      totalTrussCount,
      memberLengthPerTruss: roundMoney(memberLengthPerTruss),
      totalMemberLength: roundMoney(totalMemberLength),
      areaPerSet: roundMoney(areaPerSet),
      totalArea: roundMoney(areaPerSet * quantity),
    },
    pricing: {
      baseTotal: roundMoney(baseTotal),
      markupMultiplier: DEFAULT_MARKUP,
      estimatedTotal,
      deliveryCost: roundMoney(deliveryCost),
      installationCost: roundMoney(installationCost),
      engineeringCost: roundMoney(engineeringCost),
    },
    lineItems,
    summary: {
      title,
      shortDescription: `${productType} for a ${formatDimension(width)} span, ${formatDimension(length)} building length, ${roofStyleLabel.toLowerCase()} roof, ${roofPitch}° pitch`,
      estimateRequest: estimateRequestParts.join(" · "),
      layoutNote: "",
    },
    totals: {
      baseTotal: roundMoney(baseTotal),
      estimatedTotal,
      estimatedTotalLabel: formatCurrency(estimatedTotal),
    },
  }
}
