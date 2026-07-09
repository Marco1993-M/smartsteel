import {
  formatCurrency,
  WAREHOUSE_CLADDING_OPTIONS,
  WAREHOUSE_MATERIALS,
} from "./warehouseEstimate"

const LCSS_BAY_SPACING = 2.5
const LCSS_MARKUP_RATE = 0.3
const LCSS_VAT_RATE = 0.15
const LCSS_GALV_RATE_PER_TON = 24840
const LCSS_MILD_RATE_PER_TON = 17250
// Workbook portal pricing carries a higher commercial steel basis than the raw ton rates alone.
// This factor brings the family of portal estimates in line with the current CFLC warehouse sheets.
const LCSS_STEEL_PRICE_FACTOR = 1.6030465742586208
const LCSS_HAT_RATE_PER_METER = 56
const LCSS_LAP_WASTE_FACTOR = 1.04
const LCSS_OVERALL_WASTE_FACTOR = 1.1
const DEFAULT_WALL_HEIGHT = 3
const LCSS_STRUCTURE_INSTALL_RATE = WAREHOUSE_MATERIALS.structureInstallRate
const LCSS_CLADDING_INSTALL_RATE = WAREHOUSE_MATERIALS.claddingInstallRate

export const LCSS_WAREHOUSE_WIDTH_OPTIONS = [3, 6, 8, 10, 12]
export const LCSS_WAREHOUSE_STEEL_FINISH_OPTIONS = ["Galv", "Mild"]
export const LCSS_WAREHOUSE_GABLE_OPTIONS = [
  { value: "roof_only", label: "Roof sheeting" },
  { value: "fully_enclosed", label: "Roof and walls sheeted" },
]

function normalizeLcssSheetingMode(value) {
  if (value === "open_gable") return "roof_only"
  if (value === "sheeted_gable") return "fully_enclosed"
  return value || "fully_enclosed"
}

function getLcssSheetingLabel(value) {
  const normalized = normalizeLcssSheetingMode(value)
  return normalized === "roof_only" ? "Roof sheeting" : "Roof and walls sheeted"
}

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
    rafterKgPerPortal: 59.3,
    braceSection: "100x50x20x2 CFLC",
    braceKgPerLength: 21.55,
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

function applyMarkup(value) {
  return roundMoney(value * (1 + LCSS_MARKUP_RATE))
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
  const cladding = input?.cladding || "IBR"
  const claddingInstalled = Boolean(input?.claddingInstalled)
  const gableMode = normalizeLcssSheetingMode(input?.gableMode || input?.sheetingMode || "fully_enclosed")
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
    throw new Error("Please choose a valid sheeting option.")
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
  const steelRatePerKg = (steelRatePerTon / 1000) * LCSS_STEEL_PRICE_FACTOR
  const columnUnitRate = applyMarkup(columnKg * steelRatePerKg)
  const rafterUnitRate = applyMarkup(span.rafterKgPerPortal * steelRatePerKg)
  const braceUnitRate = applyMarkup(span.braceKgPerLength * 2 * steelRatePerKg)
  const totalColumnCost = applyMarkup(totalColumnKg * steelRatePerKg)
  const totalRafterCost = applyMarkup(totalRafterKg * steelRatePerKg)
  const totalBraceCost = applyMarkup(totalBraceKg * steelRatePerKg)
  const steelCost = totalSteelKg * (steelRatePerTon / 1000)

  const roofPurlins = Math.ceil(span.trussLength / 1) * 2
  const includeWallSheeting = gableMode === "fully_enclosed"
  const longWallHats = includeWallSheeting ? Math.ceil(wallHeight / 1) + 1 : 0
  const gableHats = 0

  const totalHatLengthMeters =
    (
      length * roofPurlins +
      ((longWallHats * length + gableHats * width) * 2) * LCSS_LAP_WASTE_FACTOR
    ) * LCSS_OVERALL_WASTE_FACTOR

  const hatCost = totalHatLengthMeters * LCSS_HAT_RATE_PER_METER
  const roofSheetingArea = span.trussLength * length * 2 * LCSS_OVERALL_WASTE_FACTOR
  const wallSheetingArea =
    includeWallSheeting
      ? ((wallHeight * length) * 2 + (width * wallHeight) * 2 + (width * span.trussHeight) * 2) *
        LCSS_OVERALL_WASTE_FACTOR
      : 0
  const totalSheetingArea = roofSheetingArea + wallSheetingArea
  const claddingSupplyRate = WAREHOUSE_MATERIALS.cladding[cladding]?.supply || 0
  const claddingCost = cladding === "None" ? 0 : totalSheetingArea * claddingSupplyRate
  const totalSteelCost = steelCost * quantity
  const totalHatCost = hatCost * quantity
  const totalCladdingCost = claddingCost * quantity
  const totalFloorArea = width * length * quantity
  const totalCladdingCoverageArea = totalSheetingArea * quantity
  const structureInstallationCost = claddingInstalled ? totalFloorArea * LCSS_STRUCTURE_INSTALL_RATE : 0
  const claddingInstallationCost =
    claddingInstalled && cladding !== "None" ? totalCladdingCoverageArea * LCSS_CLADDING_INSTALL_RATE : 0
  const subTotalBeforeMarkup =
    totalSteelCost +
    totalHatCost +
    totalCladdingCost +
    structureInstallationCost +
    claddingInstallationCost
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
        unitRate: applyMarkup(LCSS_HAT_RATE_PER_METER),
        total: applyMarkup(totalHatCost),
      }),
  ]

  if (cladding !== "None") {
    lineItems.push(
      buildLineItem({
        code: "lcss_cladding",
        label: `${cladding} cladding`,
        quantity: roundMoney(totalSheetingArea * quantity),
        unit: "sqm",
        unitRate: applyMarkup(claddingSupplyRate),
        total: applyMarkup(totalCladdingCost),
      })
    )
  }

  if (claddingInstalled) {
    lineItems.push(
      buildLineItem({
        code: "lcss_structure_installation",
        label: "Structure installation",
        quantity: roundMoney(totalFloorArea),
        unit: "sqm",
        unitRate: applyMarkup(LCSS_STRUCTURE_INSTALL_RATE),
        total: applyMarkup(structureInstallationCost),
      })
    )
  }

  if (claddingInstalled && cladding !== "None") {
    lineItems.push(
      buildLineItem({
        code: "lcss_cladding_installation",
        label: "Cladding installation",
        quantity: roundMoney(totalCladdingCoverageArea),
        unit: "sqm",
        unitRate: applyMarkup(LCSS_CLADDING_INSTALL_RATE),
        total: applyMarkup(claddingInstallationCost),
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
      steelCost: roundMoney(totalSteelCost),
      hatCost: roundMoney(totalHatCost),
      subTotalBeforeMarkup: roundMoney(subTotalBeforeMarkup),
      markupRate: LCSS_MARKUP_RATE,
      markupValue: roundMoney(markupValue),
      vatRate: LCSS_VAT_RATE,
      vatValue: roundMoney(vatValue),
      baseTotal: roundMoney(totalExclVat),
      markupMultiplier: roundMoney(1 + LCSS_MARKUP_RATE),
      estimatedTotal: roundMoney(totalExclVat),
      totalInclVat: roundMoney(totalInclVat),
      claddingCost: roundMoney(totalCladdingCost),
      installationCost: roundMoney(structureInstallationCost + claddingInstallationCost),
      structureInstallationCost: roundMoney(structureInstallationCost),
      structureInstallationArea: roundMoney(totalFloorArea),
      claddingInstallationCost: roundMoney(claddingInstallationCost),
      claddingInstallationArea: roundMoney(totalCladdingCoverageArea),
    },
    sheeting: {
      roofSheetingArea: roundMoney(roofSheetingArea * quantity),
      wallSheetingArea: roundMoney(wallSheetingArea * quantity),
      totalSheetingArea: roundMoney(totalSheetingArea * quantity),
    },
    lineItems,
    summary: {
      title: `${quantity > 1 ? `${quantity} x ` : ""}${width}m x ${length}m LCSS Warehouse`,
      shortDescription: `${quantity > 1 ? `${quantity} x ` : ""}LCSS warehouse ${width}m x ${length}m x ${wallHeight}m, ${steelFinish.toLowerCase()} steel, ${getLcssSheetingLabel(gableMode).toLowerCase()}, ${cladding} sheeting${claddingInstalled ? " with installation" : ", supply only"}`,
      estimateRequest: `${quantity > 1 ? `${quantity} x ` : ""}LCSS warehouse ${width}m x ${length}m x ${wallHeight}m, ${steelFinish}, ${getLcssSheetingLabel(gableMode)}, ${cladding} sheeting${claddingInstalled ? ", sheeting supply and installation" : ", sheeting supply only"}, priced from CFLC workbook model`,
      layoutNote: "",
    },
    labels: {
      steelFinish,
      cladding,
      installation: claddingInstalled ? "Cladding installation included" : "Structure supply only",
      gableMode: getLcssSheetingLabel(gableMode),
    },
    meta: {
      productType: "LCSS Warehouse",
      productGroup: "warehouse",
      sourceModel: "CFLC workbook",
    },
  }
}

export { formatCurrency }
