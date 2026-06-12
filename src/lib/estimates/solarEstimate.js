import { formatCurrency } from "./warehouseEstimate"

const DEFAULT_MARKUP = 1.32
const DEFAULT_DELIVERY_MINIMUM = 1350
const CFLC_GROUND_MOUNT_STRUCTURE_PANEL_UNIT = 30
const CFLC_GROUND_MOUNT_STRUCTURE_STEEL_KG_PER_UNIT = 720
const CFLC_GROUND_MOUNT_BOLTS_PER_UNIT = 180
const CFLC_GROUND_MOUNT_STRUCTURE_LABOUR_PANELS_PER_UNIT = 30
const CFLC_GROUND_MOUNT_SOLAR_RAIL_METERS_PER_UNIT = 69
const CFLC_GROUND_MOUNT_END_BRACKETS_PER_UNIT = 12
const CFLC_GROUND_MOUNT_MIDDLE_BRACKETS_PER_UNIT = 54
const CFLC_GROUND_MOUNT_INSTALL_PANELS_PER_UNIT = 30
const CFLC_GROUND_MOUNT_GALV_RATE_PER_TON = 21500
const CFLC_GROUND_MOUNT_MILD_RATE_PER_TON = 15000
const CFLC_GROUND_MOUNT_ZAM_RATE_PER_TON = 20600
const CFLC_GROUND_MOUNT_BOLT_RATE = 15
const CFLC_GROUND_MOUNT_STRUCTURE_LABOUR_RATE_PER_PANEL = 250
// The workbook's solar-rail rate cell is currently zero, so we keep the live rate until that row is confirmed.
const CFLC_GROUND_MOUNT_SOLAR_RAIL_RATE_PER_METER = 80
const CFLC_GROUND_MOUNT_END_BRACKET_RATE = 25
const CFLC_GROUND_MOUNT_MIDDLE_BRACKET_RATE = 30
const CFLC_GROUND_MOUNT_INSTALL_RATE_PER_PANEL = 375
const CFLC_GROUND_MOUNT_TRANSPORT_RATE_PER_KM = 26
const CFLC_GROUND_MOUNT_VAT_RATE = 0.15
const CFLC_GROUND_MOUNT_STEEL_FINISHES = ["Galv", "Mild", "ZAM"]

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

function getCflcGroundMountMarkupRate(panelCount) {
  if (panelCount < 500) return 0.3
  if (panelCount < 1501) return 0.25
  if (panelCount < 5001) return 0.2
  return 0.15
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
  const steelFinish = input?.steelFinish || "Galv"
  const transportTrips = Math.max(0, Math.round(Number(input?.transportTrips) || 0))
  const includeStructureLabour =
    typeof input?.includeStructureLabour === "boolean" ? input.includeStructureLabour : false
  const includeSolarBrackets =
    typeof input?.includeSolarBrackets === "boolean" ? input.includeSolarBrackets : false
  const includeTransport =
    typeof input?.includeTransport === "boolean"
      ? input.includeTransport
      : transportTrips > 0 && deliveryDistance > 0

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

  if (productType === "Solar ground mount" && !CFLC_GROUND_MOUNT_STEEL_FINISHES.includes(steelFinish)) {
    throw new Error("Please choose Galv, Mild, or ZAM steel for the CFLC ground mount.")
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
    steelFinish,
    transportTrips,
    includeStructureLabour,
    includeSolarBrackets,
    includeTransport,
  }
}

function calculateCflcSolarGroundMountEstimate(normalized) {
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
    steelFinish,
    transportTrips,
    includeStructureLabour,
    includeSolarBrackets,
    includeTransport,
  } = normalized

  const totalPanels = moduleCount * quantity
  const structureUnits = Math.max(1, Math.ceil(totalPanels / CFLC_GROUND_MOUNT_STRUCTURE_PANEL_UNIT))
  const markupRate = getCflcGroundMountMarkupRate(totalPanels)
  const markupMultiplier = roundMoney(1 + markupRate)
  const steelRatePerTon =
    steelFinish === "Galv"
      ? CFLC_GROUND_MOUNT_GALV_RATE_PER_TON
      : steelFinish === "Mild"
        ? CFLC_GROUND_MOUNT_MILD_RATE_PER_TON
        : CFLC_GROUND_MOUNT_ZAM_RATE_PER_TON

  const structureSteelCostPerUnit =
    CFLC_GROUND_MOUNT_STRUCTURE_STEEL_KG_PER_UNIT * (steelRatePerTon / 1000)
  const structureSteelCost = structureSteelCostPerUnit * structureUnits

  const boltsQuantity = CFLC_GROUND_MOUNT_BOLTS_PER_UNIT * structureUnits
  const boltsCost = boltsQuantity * CFLC_GROUND_MOUNT_BOLT_RATE

  const structureLabourQuantity = includeStructureLabour
    ? CFLC_GROUND_MOUNT_STRUCTURE_LABOUR_PANELS_PER_UNIT * structureUnits
    : 0
  const structureLabourCost =
    structureLabourQuantity * CFLC_GROUND_MOUNT_STRUCTURE_LABOUR_RATE_PER_PANEL

  const solarRailQuantity = includeSolarBrackets
    ? CFLC_GROUND_MOUNT_SOLAR_RAIL_METERS_PER_UNIT * structureUnits
    : 0
  const solarRailCost = solarRailQuantity * CFLC_GROUND_MOUNT_SOLAR_RAIL_RATE_PER_METER

  const endBracketQuantity = includeSolarBrackets
    ? CFLC_GROUND_MOUNT_END_BRACKETS_PER_UNIT * structureUnits
    : 0
  const endBracketCost = endBracketQuantity * CFLC_GROUND_MOUNT_END_BRACKET_RATE

  const middleBracketQuantity = includeSolarBrackets
    ? CFLC_GROUND_MOUNT_MIDDLE_BRACKETS_PER_UNIT * structureUnits
    : 0
  const middleBracketCost =
    middleBracketQuantity * CFLC_GROUND_MOUNT_MIDDLE_BRACKET_RATE

  const panelInstallationQuantity = claddingInstalled
    ? CFLC_GROUND_MOUNT_INSTALL_PANELS_PER_UNIT * structureUnits
    : 0
  const panelInstallationCost =
    panelInstallationQuantity * CFLC_GROUND_MOUNT_INSTALL_RATE_PER_PANEL

  const transportDistanceTotal =
    includeTransport && transportTrips > 0 && deliveryDistance > 0
      ? transportTrips * deliveryDistance
      : 0
  const transportCost = transportDistanceTotal * CFLC_GROUND_MOUNT_TRANSPORT_RATE_PER_KM

  const baseTotal =
    structureSteelCost +
    boltsCost +
    structureLabourCost +
    solarRailCost +
    endBracketCost +
    middleBracketCost +
    panelInstallationCost +
    transportCost

  const estimatedTotal = roundMoney(baseTotal * markupMultiplier)
  const vatAmount = roundMoney(estimatedTotal * CFLC_GROUND_MOUNT_VAT_RATE)
  const totalInclVat = roundMoney(estimatedTotal + vatAmount)

  const lineItems = [
    buildLineItem({
      code: "ground-mount-structure-steel",
      label: `${steelFinish} CFLC ground mount structure steel`,
      quantity: roundMoney(
        (CFLC_GROUND_MOUNT_STRUCTURE_STEEL_KG_PER_UNIT * structureUnits) / 1000
      ),
      unit: "tons",
      unitRate: steelRatePerTon,
      total: structureSteelCost,
    }),
    buildLineItem({
      code: "ground-mount-bolts",
      label: "Bolts",
      quantity: boltsQuantity,
      unit: "no",
      unitRate: CFLC_GROUND_MOUNT_BOLT_RATE,
      total: boltsCost,
    }),
  ]

  if (includeStructureLabour) {
    lineItems.push(
      buildLineItem({
        code: "ground-mount-structure-labour",
        label: "Structure labour",
        quantity: structureLabourQuantity,
        unit: "panels",
        unitRate: CFLC_GROUND_MOUNT_STRUCTURE_LABOUR_RATE_PER_PANEL,
        total: structureLabourCost,
      })
    )
  }

  if (includeSolarBrackets) {
    lineItems.push(
      buildLineItem({
        code: "ground-mount-solar-rail",
        label: "Solar rail",
        quantity: solarRailQuantity,
        unit: "m",
        unitRate: CFLC_GROUND_MOUNT_SOLAR_RAIL_RATE_PER_METER,
        total: solarRailCost,
      }),
      buildLineItem({
        code: "ground-mount-end-brackets",
        label: "End brackets",
        quantity: endBracketQuantity,
        unit: "no",
        unitRate: CFLC_GROUND_MOUNT_END_BRACKET_RATE,
        total: endBracketCost,
      }),
      buildLineItem({
        code: "ground-mount-middle-brackets",
        label: "Middle brackets",
        quantity: middleBracketQuantity,
        unit: "no",
        unitRate: CFLC_GROUND_MOUNT_MIDDLE_BRACKET_RATE,
        total: middleBracketCost,
      })
    )
  }

  if (claddingInstalled) {
    lineItems.push(
      buildLineItem({
        code: "ground-mount-panel-installation",
        label: "Panel installation",
        quantity: panelInstallationQuantity,
        unit: "panels",
        unitRate: CFLC_GROUND_MOUNT_INSTALL_RATE_PER_PANEL,
        total: panelInstallationCost,
      })
    )
  }

  if (includeTransport && transportCost > 0) {
    lineItems.push(
      buildLineItem({
        code: "ground-mount-transport",
        label: "Transport",
        quantity: transportDistanceTotal,
        unit: "km",
        unitRate: CFLC_GROUND_MOUNT_TRANSPORT_RATE_PER_KM,
        total: transportCost,
      })
    )
  }

  const scopeLabel =
    SOLAR_SCOPE_OPTIONS.find((option) => option.value === scope)?.label || "Supply only"
  const title =
    totalPanels > 0
      ? `${totalPanels} panel CFLC solar ground mount`
      : "CFLC solar ground mount"

  const estimateRequestParts = [
    "CFLC solar ground mount",
    `${totalPanels || moduleCount || "0"} panels total`,
    `${structureUnits} x 30-panel structures`,
    `${steelFinish} steel`,
    scopeLabel,
  ]

  if (width > 0 && length > 0) {
    estimateRequestParts.push(`${formatDimension(width)} wide`)
    estimateRequestParts.push(`${formatDimension(length)} long`)
  }

  if (wallHeight > 0) {
    estimateRequestParts.push(`${formatDimension(wallHeight)} clearance height`)
  }

  if (includeTransport && transportTrips > 0 && deliveryDistance > 0) {
    estimateRequestParts.push(`${transportTrips} trip(s) at ${deliveryDistance}km`)
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
      markupMultiplier,
      estimatedTotal,
      competitorLow: roundMoney(estimatedTotal * 0.92),
      competitorHigh: roundMoney(estimatedTotal * 1.08),
      markupRate,
      vatRate: CFLC_GROUND_MOUNT_VAT_RATE,
      vatAmount,
      totalInclVat,
    },
    totals: {
      area: roundMoney(width * length),
      totalArea: roundMoney(width * length * quantity),
      totalModules: totalPanels,
      structureUnits,
    },
    labels: {
      area:
        width > 0 && length > 0
          ? `${roundMoney(width * length * quantity)} m²`
          : "Not specified",
      scope: scopeLabel,
      delivery:
        includeTransport && transportTrips > 0 && deliveryDistance > 0
          ? `${transportTrips} trip(s) · ${deliveryDistance} km`
          : "Not included",
      modules: totalPanels > 0 ? `${totalPanels}` : "Not specified",
      steelFinish,
    },
    meta: {
      productType,
      productGroup: "solar",
      sourceModel: "CFLC solar ground mount workbook",
    },
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

  if (productType === "Solar ground mount") {
    return calculateCflcSolarGroundMountEstimate(normalized)
  }

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
