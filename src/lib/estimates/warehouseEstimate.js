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
  const wallHeight = Number(input?.wallHeight || DEFAULT_WALL_HEIGHT)
  const quantity = Math.max(1, Math.round(Number(input?.quantity) || 1))
  const cladding = input?.cladding || "None"
  const deliveryDistance = Math.max(Number(input?.deliveryDistance) || 0, 0)

  if (!Number.isFinite(width) || width <= 0) {
    throw new Error("Please enter a valid structure width.")
  }

  if (!Number.isFinite(length) || length <= 0) {
    throw new Error("Please enter a valid structure length.")
  }

  if (!Number.isFinite(wallHeight) || wallHeight <= 0) {
    throw new Error("Please enter a valid structure height.")
  }

  if (!WAREHOUSE_CLADDING_OPTIONS.includes(cladding)) {
    throw new Error("Please choose a valid cladding option.")
  }

  return {
    width,
    length,
    wallHeight,
    quantity,
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

function interpolateTrussLength(width) {
  const widths = Object.keys(WAREHOUSE_MATERIALS.trusses)
    .map(Number)
    .sort((a, b) => a - b)

  if (WAREHOUSE_MATERIALS.trusses[width]) {
    return WAREHOUSE_MATERIALS.trusses[width].length
  }

  if (width <= widths[0]) {
    const [w1, w2] = widths
    const l1 = WAREHOUSE_MATERIALS.trusses[w1].length
    const l2 = WAREHOUSE_MATERIALS.trusses[w2].length
    return l1 + ((width - w1) * (l2 - l1)) / (w2 - w1)
  }

  if (width >= widths[widths.length - 1]) {
    const [w1, w2] = widths.slice(-2)
    const l1 = WAREHOUSE_MATERIALS.trusses[w1].length
    const l2 = WAREHOUSE_MATERIALS.trusses[w2].length
    return l2 + ((width - w2) * (l2 - l1)) / (w2 - w1)
  }

  for (let index = 0; index < widths.length - 1; index += 1) {
    const lowerWidth = widths[index]
    const upperWidth = widths[index + 1]

    if (width >= lowerWidth && width <= upperWidth) {
      const lowerLength = WAREHOUSE_MATERIALS.trusses[lowerWidth].length
      const upperLength = WAREHOUSE_MATERIALS.trusses[upperWidth].length

      return (
        lowerLength +
        ((width - lowerWidth) * (upperLength - lowerLength)) / (upperWidth - lowerWidth)
      )
    }
  }

  return width * 0.5176
}

export function calculateWarehouseEstimate(input) {
  const normalized = validateWarehouseEstimateInput(input)
  const { width, length, wallHeight, quantity, cladding, claddingInstalled, deliveryDistance } = normalized

  const effectiveLength = Math.ceil(length / BAY_LENGTH) * BAY_LENGTH
  const lengthRounded = effectiveLength !== length
  const totalBays = effectiveLength / BAY_LENGTH
  const totalColumns = totalBays * 2 + 2
  const totalTrusses = totalColumns
  const totalScrews = totalBays * 160 * 2
  const totalPostBrackets = totalColumns
  const totalRidgeBrackets = totalTrusses
  const trussLength = interpolateTrussLength(width)

  const totalTopHatLengthMeters = WAREHOUSE_MATERIALS.topHats.rows * effectiveLength
  const topHatUnitsNeeded = Math.ceil(totalTopHatLengthMeters / WAREHOUSE_MATERIALS.topHats.length)
  const totalTopHatLengthSold = topHatUnitsNeeded * WAREHOUSE_MATERIALS.topHats.length

  const area = width * length
  const totalArea = area * quantity
  const wallArea = 2 * (width + length) * wallHeight
  const claddingArea = area + wallArea
  const totalCladdingArea = claddingArea * quantity

  const costColumns = totalColumns * wallHeight * WAREHOUSE_MATERIALS.columns.rate * quantity
  const costTrusses = totalTrusses * trussLength * WAREHOUSE_MATERIALS.trusses[8].rate * quantity
  const costPostBrackets = totalPostBrackets * WAREHOUSE_MATERIALS.postBracket * quantity
  const costRidgeBrackets = totalRidgeBrackets * WAREHOUSE_MATERIALS.ridgeBracket * quantity
  const costScrews = totalScrews * WAREHOUSE_MATERIALS.screw * quantity
  const costTopHats = totalTopHatLengthSold * WAREHOUSE_MATERIALS.topHats.rate * quantity
  const costCladdingSupply = totalCladdingArea * WAREHOUSE_MATERIALS.cladding[cladding].supply
  const costInstallation = claddingInstalled ? totalArea * WAREHOUSE_MATERIALS.installRate : 0
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
  const competitorLow = roundMoney(totalArea * WAREHOUSE_MATERIALS.competitorLowRate)
  const competitorHigh = roundMoney(totalArea * WAREHOUSE_MATERIALS.competitorHighRate)
  const savingLow = roundMoney(competitorLow - estimatedTotal)
  const savingHigh = roundMoney(competitorHigh - estimatedTotal)

  const lineItems = [
    buildLineItem({
      code: "columns",
      label: "Columns",
      quantity: totalColumns * quantity,
      unit: "items",
      unitRate: wallHeight * WAREHOUSE_MATERIALS.columns.rate,
      total: costColumns,
    }),
    buildLineItem({
      code: "trusses",
      label: "Trusses",
      quantity: totalTrusses * quantity,
      unit: "items",
      unitRate: trussLength * WAREHOUSE_MATERIALS.trusses[8].rate,
      total: costTrusses,
    }),
    buildLineItem({
      code: "post_brackets",
      label: "Post brackets",
      quantity: totalPostBrackets * quantity,
      unit: "items",
      unitRate: WAREHOUSE_MATERIALS.postBracket,
      total: costPostBrackets,
    }),
    buildLineItem({
      code: "ridge_brackets",
      label: "Ridge brackets",
      quantity: totalRidgeBrackets * quantity,
      unit: "items",
      unitRate: WAREHOUSE_MATERIALS.ridgeBracket,
      total: costRidgeBrackets,
    }),
    buildLineItem({
      code: "screws",
      label: "Fasteners and screws",
      quantity: totalScrews * quantity,
      unit: "items",
      unitRate: WAREHOUSE_MATERIALS.screw,
      total: costScrews,
    }),
    buildLineItem({
      code: "top_hats",
      label: "Top hats",
      quantity: topHatUnitsNeeded * quantity,
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
        quantity: totalCladdingArea,
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
        quantity: totalArea,
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
    input: {
      ...normalized,
      effectiveLength,
      lengthRounded,
    },
    dimensions: {
      width,
      length,
      effectiveLength,
      wallHeight,
      quantity,
      area,
      totalArea: roundMoney(totalArea),
      wallArea: roundMoney(wallArea),
      claddingArea: roundMoney(claddingArea),
      totalCladdingArea: roundMoney(totalCladdingArea),
      bayLength: BAY_LENGTH,
      totalBays,
      lengthRounded,
    },
    materials: {
      totalColumns: totalColumns * quantity,
      totalTrusses: totalTrusses * quantity,
      totalScrews: totalScrews * quantity,
      totalPostBrackets: totalPostBrackets * quantity,
      totalRidgeBrackets: totalRidgeBrackets * quantity,
      topHatUnitsNeeded: topHatUnitsNeeded * quantity,
      totalTopHatLengthSold: roundMoney(totalTopHatLengthSold * quantity),
      trussLength: roundMoney(trussLength),
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
      title: `${quantity > 1 ? `${quantity} x ` : ""}${width}m x ${length}m structure`,
      shortDescription: `${quantity > 1 ? `${quantity} x ` : ""}Structure ${width}m x ${length}m x ${wallHeight}m with ${cladding}${claddingInstalled ? " and installation" : ""}`,
      estimateRequest: `${quantity > 1 ? `${quantity} x ` : ""}Structure ${width}m x ${length}m x ${wallHeight}m, ${cladding}${claddingInstalled ? ", installed" : ""}, ${deliveryDistance}km delivery${lengthRounded ? `, priced on ${effectiveLength}m structural bay layout` : ""}`,
      layoutNote: lengthRounded
        ? `Requested depth ${length}m is priced against a practical ${effectiveLength}m bay layout.`
        : "",
    },
  }
}
