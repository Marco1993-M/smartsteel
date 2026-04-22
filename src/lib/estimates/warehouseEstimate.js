const BAY_LENGTH = 2.5
const DEFAULT_MARKUP = 1.32
const DEFAULT_DELIVERY_MINIMUM = 1350
const DEFAULT_WALL_HEIGHT = 3

export const WAREHOUSE_WIDTH_OPTIONS = [8, 10, 12]
export const WAREHOUSE_LENGTH_OPTIONS = Array.from({ length: 19 }, (_, index) => 5 + index * 2.5)
export const WAREHOUSE_CLADDING_OPTIONS = ["None", "IBR", "Chromadek"]

export const WAREHOUSE_MATERIALS = {
  columns: { length: 3, rate: 467 },
  trusses: {
    8: { length: 4.141, rate: 344.88 },
    10: { length: 5.176, rate: 344.88 },
    12: { length: 6.212, rate: 344.88 },
  },
  topHats: { length: 5.2, rate: 56, rows: 10 },
  postBracket: 155,
  ridgeBracket: 155,
  screw: 0.8,
  cladding: {
    None: { supply: 0, installed: 0 },
    IBR: { supply: 225, installed: 450 },
    Chromadek: { supply: 350, installed: 450 },
  },
  installRate: 200,
  deliveryRate: 19,
  competitorLowRate: 1100,
  competitorHighRate: 1400,
}

function roundMoney(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100
}

export function formatCurrency(value) {
  return `R ${Math.round(Number(value) || 0).toLocaleString()}`
}

export function validateWarehouseEstimateInput(input) {
  const width = Number(input?.width)
  const length = Number(input?.length)
  const cladding = input?.cladding || "None"
  const deliveryDistance = Math.max(Number(input?.deliveryDistance) || 0, 0)

  if (!WAREHOUSE_WIDTH_OPTIONS.includes(width)) {
    throw new Error("Warehouse width must be 8m, 10m, or 12m.")
  }

  if (!WAREHOUSE_LENGTH_OPTIONS.includes(length)) {
    throw new Error("Warehouse length must be between 5m and 50m in 2.5m increments.")
  }

  if (!WAREHOUSE_CLADDING_OPTIONS.includes(cladding)) {
    throw new Error("Please choose a valid cladding option.")
  }

  return {
    width,
    length,
    cladding,
    claddingInstalled: Boolean(input?.claddingInstalled),
    deliveryDistance,
  }
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

export function calculateWarehouseEstimate(input) {
  const normalized = validateWarehouseEstimateInput(input)
  const { width, length, cladding, claddingInstalled, deliveryDistance } = normalized

  const totalBays = length / BAY_LENGTH
  const totalColumns = totalBays * 2 + 2
  const totalTrusses = totalColumns
  const totalScrews = totalBays * 160 * 2
  const totalPostBrackets = totalColumns
  const totalRidgeBrackets = totalTrusses

  const totalTopHatLengthMeters = WAREHOUSE_MATERIALS.topHats.rows * length
  const topHatUnitsNeeded = Math.ceil(totalTopHatLengthMeters / WAREHOUSE_MATERIALS.topHats.length)
  const totalTopHatLengthSold = topHatUnitsNeeded * WAREHOUSE_MATERIALS.topHats.length

  const area = width * length
  const wallArea = 2 * (width + length) * DEFAULT_WALL_HEIGHT
  const cladArea = area + wallArea

  const costColumns = totalColumns * WAREHOUSE_MATERIALS.columns.length * WAREHOUSE_MATERIALS.columns.rate
  const costTrusses =
    totalTrusses * WAREHOUSE_MATERIALS.trusses[width].length * WAREHOUSE_MATERIALS.trusses[width].rate
  const costPostBrackets = totalPostBrackets * WAREHOUSE_MATERIALS.postBracket
  const costRidgeBrackets = totalRidgeBrackets * WAREHOUSE_MATERIALS.ridgeBracket
  const costScrews = totalScrews * WAREHOUSE_MATERIALS.screw
  const costTopHats = totalTopHatLengthSold * WAREHOUSE_MATERIALS.topHats.rate
  const costCladdingSupply = cladArea * WAREHOUSE_MATERIALS.cladding[cladding].supply
  const costInstallation = claddingInstalled ? area * WAREHOUSE_MATERIALS.installRate : 0
  const deliveryCost = Math.max(
    deliveryDistance * WAREHOUSE_MATERIALS.deliveryRate,
    DEFAULT_DELIVERY_MINIMUM
  )

  const baseTotal =
    costColumns +
    costTrusses +
    costPostBrackets +
    costRidgeBrackets +
    costScrews +
    costTopHats +
    costCladdingSupply +
    costInstallation +
    deliveryCost

  const estimatedTotal = roundMoney(baseTotal * DEFAULT_MARKUP)
  const competitorLow = roundMoney(area * WAREHOUSE_MATERIALS.competitorLowRate)
  const competitorHigh = roundMoney(area * WAREHOUSE_MATERIALS.competitorHighRate)
  const savingLow = roundMoney(competitorLow - estimatedTotal)
  const savingHigh = roundMoney(competitorHigh - estimatedTotal)

  const lineItems = [
    buildLineItem({
      code: "columns",
      label: "Columns",
      quantity: totalColumns,
      unit: "items",
      unitRate: WAREHOUSE_MATERIALS.columns.length * WAREHOUSE_MATERIALS.columns.rate,
      total: costColumns,
    }),
    buildLineItem({
      code: "trusses",
      label: "Trusses",
      quantity: totalTrusses,
      unit: "items",
      unitRate:
        WAREHOUSE_MATERIALS.trusses[width].length * WAREHOUSE_MATERIALS.trusses[width].rate,
      total: costTrusses,
    }),
    buildLineItem({
      code: "post_brackets",
      label: "Post brackets",
      quantity: totalPostBrackets,
      unit: "items",
      unitRate: WAREHOUSE_MATERIALS.postBracket,
      total: costPostBrackets,
    }),
    buildLineItem({
      code: "ridge_brackets",
      label: "Ridge brackets",
      quantity: totalRidgeBrackets,
      unit: "items",
      unitRate: WAREHOUSE_MATERIALS.ridgeBracket,
      total: costRidgeBrackets,
    }),
    buildLineItem({
      code: "screws",
      label: "Fasteners and screws",
      quantity: totalScrews,
      unit: "items",
      unitRate: WAREHOUSE_MATERIALS.screw,
      total: costScrews,
    }),
    buildLineItem({
      code: "top_hats",
      label: "Top hats",
      quantity: topHatUnitsNeeded,
      unit: "lengths",
      unitRate: WAREHOUSE_MATERIALS.topHats.length * WAREHOUSE_MATERIALS.topHats.rate,
      total: costTopHats,
    }),
  ]

  if (cladding !== "None") {
    lineItems.push(
      buildLineItem({
        code: "cladding",
        label: `${cladding} cladding`,
        quantity: cladArea,
        unit: "sqm",
        unitRate: WAREHOUSE_MATERIALS.cladding[cladding].supply,
        total: costCladdingSupply,
      })
    )
  }

  if (claddingInstalled) {
    lineItems.push(
      buildLineItem({
        code: "installation",
        label: "Installation",
        quantity: area,
        unit: "sqm",
        unitRate: WAREHOUSE_MATERIALS.installRate,
        total: costInstallation,
      })
    )
  }

  lineItems.push(
    buildLineItem({
      code: "delivery",
      label: "Delivery",
      quantity: deliveryDistance,
      unit: "km",
      unitRate: WAREHOUSE_MATERIALS.deliveryRate,
      total: deliveryCost,
    })
  )

  return {
    input: normalized,
    dimensions: {
      width,
      length,
      area,
      wallArea: roundMoney(wallArea),
      claddingArea: roundMoney(cladArea),
      bayLength: BAY_LENGTH,
      totalBays,
    },
    materials: {
      totalColumns,
      totalTrusses,
      totalScrews,
      totalPostBrackets,
      totalRidgeBrackets,
      topHatUnitsNeeded,
      totalTopHatLengthSold: roundMoney(totalTopHatLengthSold),
    },
    pricing: {
      baseTotal: roundMoney(baseTotal),
      markupMultiplier: DEFAULT_MARKUP,
      estimatedTotal,
      deliveryCost: roundMoney(deliveryCost),
      claddingCost: roundMoney(costCladdingSupply),
      installationCost: roundMoney(costInstallation),
    },
    marketComparison: {
      competitorLow,
      competitorHigh,
      savingLow,
      savingHigh,
      maxSaving: Math.max(savingLow, savingHigh),
    },
    lineItems,
    summary: {
      title: `${width}m x ${length}m warehouse`,
      shortDescription: `Warehouse ${width}m x ${length}m with ${cladding}${claddingInstalled ? " and installation" : ""}`,
      estimateRequest: `Warehouse ${width}m x ${length}m, ${cladding}${claddingInstalled ? ", installed" : ""}, ${deliveryDistance}km delivery`,
    },
  }
}

