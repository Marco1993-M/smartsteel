import {
  formatCurrency,
  WAREHOUSE_CLADDING_OPTIONS,
  WAREHOUSE_MATERIALS,
} from "./warehouseEstimate"

const LCSS_BAY_SPACING = 2.5
const LCSS_MARKUP_RATE = 0.3
const LCSS_VAT_RATE = 0.15
const LCSS_GALV_RATE_PER_TON = 21500
const LCSS_MILD_RATE_PER_TON = 15500
const LCSS_HAT_RATE_PER_METER = 56
const LCSS_LAP_WASTE_FACTOR = 1.04
const LCSS_OVERALL_WASTE_FACTOR = 1.1
const DEFAULT_WALL_HEIGHT = 3
const LCSS_INSTALL_RATE = WAREHOUSE_MATERIALS.installRate

export const LCSS_WAREHOUSE_WIDTH_OPTIONS = [3, 6, 8, 10, 12]
export const LCSS_WAREHOUSE_STEEL_FINISH_OPTIONS = ["Galv", "Mild"]
export const LCSS_WAREHOUSE_GABLE_OPTIONS = [
  { value: "sheeted_gable", label: "Sheeted gable" },
  { value: "open_gable", label: "Open gable" },
]

export const LCSS_SPAN_DATA = {
  3: {
    columnSection: "100x50x20x2 CFLC",
    columnKgAt3m: 43.1,
    rafterSection: "175x75x20x2.5 CFLC",
    // 3m is not present in the source workbook. We extend the same 15-degree roof geometry
    // and scale the 6m rafter rule proportionally to keep the commercial model consistent.
    rafterKgPerPortal: 21.1,
    braceSection: "100x50x20x2 CFLC",
    braceKgPerLength: 21.6,
    trussLength: 1.553,
    trussHeight: 0.402,
  },
  6: {
    columnSection: "100x50x20x2 CFLC",
    columnKgAt3m: 43.1,
    rafterSection: "175x75x20x2.5 CFLC",
    rafterKgPerPortal: 42.2,
    braceSection: "100x50x20x2 CFLC",
    braceKgPerLength: 21.6,
    trussLength: 3.106,
    trussHeight: 0.804,
  },
  8: {
    columnSection: "100x50x20x2 CFLC",
    columnKgAt3m: 43.1,
    rafterSection: "175x75x20x2.5 CFLC",
    rafterKgPerPortal: 37.5333333333,
    braceSection: "100x50x20x2 CFLC",
    braceKgPerLength: 21.6,
    trussLength: 4.414,
    trussHeight: 1.072,
  },
  10: {
    columnSection: "100x50x20x2 CFLC",
    columnKgAt3m: 43.1,
    rafterSection: "175x75x20x2.5 CFLC",
    rafterKgPerPortal: 70.4,
    braceSection: "100x50x20x2 CFLC",
    braceKgPerLength: 21.6,
    trussLength: 5.176,
    trussHeight: 1.34,
  },
  12: {
    columnSection: "100x50x20x2 CFLC",
    columnKgAt3m: 43.1,
    rafterSection: "200x75x20x2.5 CFLC",
    rafterKgPerPortal: 36.24,
    braceSection: "100x50x20x2 CFLC",
    braceKgPerLength: 21.6,
    trussLength: 6.212,
    trussHeight: 1.608,
  },
}

function roundMoney(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100
}

function buildLineItem({ code, label, quantity, unit, unitRate, total }) {
  return {
    code,
    label,
    quantity: roundMoney(quantity),
    unit,
    unitRate: roundMoney(unitRate),
    total: roundMoney(total),
  }
}

function getLcssSpanData(width) {
  return LCSS_SPAN_DATA[Number(width)] || null
}

function getLcssLengthRule(width, length) {
  if (Number(width) === 3 && Number(length) === 6) {
    return {
      baySpacing: 3,
      label: "carport_6m_rule",
    }
  }

  return {
    baySpacing: LCSS_BAY_SPACING,
    label: "standard_2_5m_rule",
  }
}

export function validateLcssWarehouseEstimateInput(input) {
  const width = Number(input?.width)
  const length = Number(input?.length)
  const wallHeight = Number(input?.wallHeight || DEFAULT_WALL_HEIGHT)
  const quantity = Math.max(1, Math.round(Number(input?.quantity) || 1))
  const steelFinish = input?.steelFinish || "Galv"
  const cladding = input?.cladding || "None"
  const claddingInstalled = Boolean(input?.claddingInstalled)
  const gableMode = input?.gableMode || "sheeted_gable"
  const lengthRule = getLcssLengthRule(width, length)

  if (!LCSS_WAREHOUSE_WIDTH_OPTIONS.includes(width)) {
    throw new Error("LCSS warehouses currently support 3m, 6m, 8m, 10m, or 12m spans only.")
  }

  if (!Number.isFinite(length) || length <= 0) {
    throw new Error("Please enter a valid structure length.")
  }

  if (!Number.isFinite(wallHeight) || wallHeight <= 0) {
    throw new Error("Please enter a valid structure height.")
  }

  if (Math.abs(length / lengthRule.baySpacing - Math.round(length / lengthRule.baySpacing)) > 0.0001) {
    throw new Error("LCSS lengths must follow 2.5m bay increments, except for the dedicated 3m x 6m carport rule.")
  }

  if (!LCSS_WAREHOUSE_STEEL_FINISH_OPTIONS.includes(steelFinish)) {
    throw new Error("Please choose Galv or Mild steel.")
  }

  if (!WAREHOUSE_CLADDING_OPTIONS.includes(cladding)) {
    throw new Error("Please choose a valid cladding option.")
  }

  if (!LCSS_WAREHOUSE_GABLE_OPTIONS.some((option) => option.value === gableMode)) {
    throw new Error("Please choose a valid gable option.")
  }

  return {
    width,
    length,
    wallHeight,
    quantity,
    steelFinish,
    cladding,
    claddingInstalled,
    gableMode,
    baySpacing: lengthRule.baySpacing,
    lengthRule: lengthRule.label,
  }
}

export function calculateLcssWarehouseEstimate(input) {
  const normalized = validateLcssWarehouseEstimateInput(input)
  const {
    width,
    length,
    wallHeight,
    quantity,
    steelFinish,
    cladding,
    claddingInstalled,
    gableMode,
    baySpacing,
    lengthRule,
  } = normalized
  const span = getLcssSpanData(width)

  const portals = length / baySpacing + 1
  const bays = length / baySpacing
  const columnKg = span.columnKgAt3m * (wallHeight / 3)
  const totalColumnKg = portals * columnKg
  const totalRafterKg = portals * span.rafterKgPerPortal
  const totalBraceKg = span.braceKgPerLength * 2 * (Math.floor(bays / 4) + 1)
  const totalSteelKg = totalColumnKg + totalRafterKg + totalBraceKg

  const steelRatePerTon = steelFinish === "Galv" ? LCSS_GALV_RATE_PER_TON : LCSS_MILD_RATE_PER_TON
  const steelRatePerKg = steelRatePerTon / 1000
  const columnUnitRate = columnKg * steelRatePerKg
  const rafterUnitRate = span.rafterKgPerPortal * steelRatePerKg
  const braceUnitRate = span.braceKgPerLength * 2 * steelRatePerKg
  const totalColumnCost = totalColumnKg * steelRatePerKg
  const totalRafterCost = totalRafterKg * steelRatePerKg
  const totalBraceCost = totalBraceKg * steelRatePerKg
  const steelCost = totalSteelKg * (steelRatePerTon / 1000)

  const roofPurlins = Math.ceil(span.trussLength / 1) * 2
  const longWallHats = Math.ceil(wallHeight / 1) + 1
  const gableHats =
    gableMode === "sheeted_gable" ? Math.ceil((wallHeight + span.trussHeight) / 1) + 1 : 0

  const totalHatLengthMeters =
    (
      length * roofPurlins +
      ((longWallHats * length + gableHats * width) * 2) * LCSS_LAP_WASTE_FACTOR
    ) * LCSS_OVERALL_WASTE_FACTOR

  const hatCost = totalHatLengthMeters * LCSS_HAT_RATE_PER_METER
  const roofSheetingArea = span.trussLength * length * 2 * LCSS_OVERALL_WASTE_FACTOR
  const wallSheetingArea =
    (((wallHeight * length) * 2 + width * (wallHeight + span.trussHeight) * 2) *
      LCSS_OVERALL_WASTE_FACTOR)
  const totalSheetingArea = roofSheetingArea + wallSheetingArea
  const claddingSupplyRate = WAREHOUSE_MATERIALS.cladding[cladding]?.supply || 0
  const claddingCost = cladding === "None" ? 0 : totalSheetingArea * claddingSupplyRate
  const installationChargeArea = claddingInstalled && cladding !== "None" ? totalSheetingArea : 0
  const installationCost = installationChargeArea * LCSS_INSTALL_RATE
  const subTotalBeforeMarkup = steelCost + hatCost + claddingCost + installationCost
  const markupValue = subTotalBeforeMarkup * LCSS_MARKUP_RATE
  const totalExclVat = subTotalBeforeMarkup + markupValue
  const vatValue = totalExclVat * LCSS_VAT_RATE
  const totalInclVat = totalExclVat + vatValue

  const lineItems = [
    buildLineItem({
      code: "lcss_columns",
      label: `Columns (${span.columnSection})`,
      quantity: portals * quantity,
      unit: "portals",
      unitRate: columnUnitRate,
      total: totalColumnCost * quantity,
    }),
    buildLineItem({
      code: "lcss_rafters",
      label: `Rafters (${span.rafterSection})`,
      quantity: portals * quantity,
      unit: "portals",
      unitRate: rafterUnitRate,
      total: totalRafterCost * quantity,
    }),
    buildLineItem({
      code: "lcss_bracing",
      label: `X-bracing (${span.braceSection})`,
      quantity: (Math.floor(bays / 4) + 1) * quantity,
      unit: "brace sets",
      unitRate: braceUnitRate,
      total: totalBraceCost * quantity,
    }),
    buildLineItem({
      code: "lcss_hats",
      label: "Purlins, hats and wall hats",
      quantity: roundMoney(totalHatLengthMeters * quantity),
      unit: "m",
      unitRate: LCSS_HAT_RATE_PER_METER,
      total: hatCost * quantity,
    }),
  ]

  if (cladding !== "None") {
    lineItems.push(
      buildLineItem({
        code: "lcss_cladding",
        label: `${cladding} cladding`,
        quantity: roundMoney(totalSheetingArea * quantity),
        unit: "sqm",
        unitRate: claddingSupplyRate,
        total: claddingCost * quantity,
      })
    )
  }

  if (claddingInstalled) {
    lineItems.push(
      buildLineItem({
        code: "lcss_installation",
        label: "Cladding installation",
        quantity: roundMoney(installationChargeArea * quantity),
        unit: "sqm",
        unitRate: LCSS_INSTALL_RATE,
        total: installationCost * quantity,
      })
    )
  }

  return {
    input: {
      ...normalized,
      steelRatePerTon,
      baySpacing,
    },
    dimensions: {
      width,
      length,
      wallHeight,
      quantity,
      portals,
      bays,
      lengthRule,
      trussLength: span.trussLength,
      trussHeight: span.trussHeight,
      roofPurlins,
      longWallHats,
      gableHats,
    },
    materials: {
      columnSection: span.columnSection,
      rafterSection: span.rafterSection,
      braceSection: span.braceSection,
      columnKg,
      totalColumnKg: roundMoney(totalColumnKg * quantity),
      totalRafterKg: roundMoney(totalRafterKg * quantity),
      totalBraceKg: roundMoney(totalBraceKg * quantity),
      totalSteelKg: roundMoney(totalSteelKg * quantity),
      totalHatLengthMeters: roundMoney(totalHatLengthMeters * quantity),
    },
    pricing: {
      steelCost: roundMoney(steelCost * quantity),
      hatCost: roundMoney(hatCost * quantity),
      subTotalBeforeMarkup: roundMoney(subTotalBeforeMarkup * quantity),
      markupRate: LCSS_MARKUP_RATE,
      markupValue: roundMoney(markupValue * quantity),
      vatRate: LCSS_VAT_RATE,
      vatValue: roundMoney(vatValue * quantity),
      baseTotal: roundMoney(totalExclVat * quantity),
      markupMultiplier: roundMoney(1 + LCSS_MARKUP_RATE),
      estimatedTotal: roundMoney(totalExclVat * quantity),
      totalInclVat: roundMoney(totalInclVat * quantity),
      claddingCost: roundMoney(claddingCost * quantity),
      installationCost: roundMoney(installationCost * quantity),
      installationChargeArea: roundMoney(installationChargeArea * quantity),
    },
    sheeting: {
      roofSheetingArea: roundMoney(roofSheetingArea * quantity),
      wallSheetingArea: roundMoney(wallSheetingArea * quantity),
      totalSheetingArea: roundMoney(totalSheetingArea * quantity),
    },
    lineItems,
    summary: {
      title: `${quantity > 1 ? `${quantity} x ` : ""}${width}m x ${length}m LCSS Warehouse`,
      shortDescription: `${quantity > 1 ? `${quantity} x ` : ""}LCSS warehouse ${width}m x ${length}m x ${wallHeight}m, ${steelFinish.toLowerCase()} steel, ${gableMode === "sheeted_gable" ? "sheeted gable" : "open gable"}${cladding !== "None" ? `, ${cladding} cladding${claddingInstalled ? " with installation" : ", supply only"}` : ""}`,
      estimateRequest: `${quantity > 1 ? `${quantity} x ` : ""}LCSS warehouse ${width}m x ${length}m x ${wallHeight}m, ${steelFinish}, ${gableMode === "sheeted_gable" ? "sheeted gable" : "open gable"}${cladding !== "None" ? `, ${cladding} cladding` : ", no cladding"}${cladding !== "None" ? claddingInstalled ? ", cladding supply and installation" : ", cladding supply only" : ""}, priced from CFLC workbook model`,
      layoutNote: "",
    },
    labels: {
      steelFinish,
      cladding,
      installation: claddingInstalled ? "Cladding installation included" : "Structure supply only",
      gableMode: gableMode === "sheeted_gable" ? "Sheeted gable" : "Open gable",
    },
    meta: {
      productType: "LCSS Warehouse",
      productGroup: "warehouse",
      sourceModel: "CFLC workbook",
    },
  }
}

export { formatCurrency }
