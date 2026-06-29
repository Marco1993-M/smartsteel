const BAY_LENGTH = 2.5
const DEFAULT_MARKUP = 1.32
const DEFAULT_DELIVERY_MINIMUM = 1350
const DEFAULT_WALL_HEIGHT = 3

export const WAREHOUSE_WIDTH_OPTIONS = [8, 10, 12]
export const WAREHOUSE_LENGTH_OPTIONS = Array.from({ length: 19 }, (_, index) => 5 + index * 2.5)
export const WAREHOUSE_CLADDING_OPTIONS = ["None", "IBR", "Chromadek"]
export const WAREHOUSE_HEIGHT_OPTIONS = [3, 4, 5]
export const WAREHOUSE_SCOPE_OPTIONS = [
  { value: "supply_only", label: "Supply only" },
  { value: "supply_install", label: "Supply + installation" },
]
export const WAREHOUSE_GARAGE_OPENING_OPTIONS = [
  { value: "single", label: "Single door opening" },
  { value: "double", label: "Double door opening" },
  { value: "custom", label: "Custom opening" },
]
export const WAREHOUSE_ENCLOSURE_OPTIONS = [
  { value: "roof_only", label: "Roof only" },
  { value: "open_sides", label: "Open gable ends" },
  { value: "fully_enclosed", label: "Fully enclosed" },
]

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
  structureInstallRate: 280,
  claddingInstallRate: 80,
  deliveryRate: 19,
  competitorLowRate: 1100,
  competitorHighRate: 1400,
  garageDoorOpeningRates: {
    single: 1800,
    double: 3200,
    custom: 4800,
  },
  pedestrianDoorOpeningRate: 950,
}

export const LSF_WAREHOUSE_MATERIALS = WAREHOUSE_MATERIALS

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
  const roofType = input?.roofType || "dual_pitch"
  const roofPitch = Number(input?.roofPitch || 15)
  const enclosureType = input?.enclosureType || "fully_enclosed"
  const scope = input?.scope || (input?.claddingInstalled ? "supply_install" : "supply_only")
  const rollerDoorCount = Math.max(0, Math.round(Number(input?.rollerDoorCount) || 0))
  const garageDoorOpeningType = input?.garageDoorOpeningType || "single"
  const pedestrianDoorCount = Math.max(0, Math.round(Number(input?.pedestrianDoorCount) || 0))
  const deliveryRequired = Boolean(
    typeof input?.deliveryRequired === "boolean" ? input.deliveryRequired : deliveryDistance > 0
  )
  const province = String(input?.province || "")
  const location = String(input?.location || "")

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

  if (!["dual_pitch"].includes(roofType)) {
    throw new Error("Please choose a valid roof type.")
  }

  if (!WAREHOUSE_ENCLOSURE_OPTIONS.some((option) => option.value === enclosureType)) {
    throw new Error("Please choose a valid enclosure option.")
  }

  if (!WAREHOUSE_SCOPE_OPTIONS.some((option) => option.value === scope)) {
    throw new Error("Please choose a valid project scope.")
  }

  if (!WAREHOUSE_GARAGE_OPENING_OPTIONS.some((option) => option.value === garageDoorOpeningType)) {
    throw new Error("Please choose a valid garage opening size.")
  }

  return {
    width,
    length,
    wallHeight,
    quantity,
    cladding,
    claddingInstalled: scope === "supply_install",
    deliveryDistance,
    roofType,
    roofPitch,
    enclosureType,
    scope,
    rollerDoorCount,
    garageDoorOpeningType,
    pedestrianDoorCount,
    deliveryRequired,
    province,
    location,
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

function interpolateTrussLength(width, materials = WAREHOUSE_MATERIALS) {
  const widths = Object.keys(materials.trusses)
    .map(Number)
    .sort((a, b) => a - b)

  if (materials.trusses[width]) {
    return materials.trusses[width].length
  }

  if (width <= widths[0]) {
    const [w1, w2] = widths
    const l1 = materials.trusses[w1].length
    const l2 = materials.trusses[w2].length
    return l1 + ((width - w1) * (l2 - l1)) / (w2 - w1)
  }

  if (width >= widths[widths.length - 1]) {
    const [w1, w2] = widths.slice(-2)
    const l1 = materials.trusses[w1].length
    const l2 = materials.trusses[w2].length
    return l2 + ((width - w2) * (l2 - l1)) / (w2 - w1)
  }

  for (let index = 0; index < widths.length - 1; index += 1) {
    const lowerWidth = widths[index]
    const upperWidth = widths[index + 1]

    if (width >= lowerWidth && width <= upperWidth) {
      const lowerLength = materials.trusses[lowerWidth].length
      const upperLength = materials.trusses[upperWidth].length

      return (
        lowerLength +
        ((width - lowerWidth) * (upperLength - lowerLength)) / (upperWidth - lowerWidth)
      )
    }
  }

  return width * 0.5176
}

export function calculateWarehouseEstimateWithMaterials(
  input,
  {
    materials = WAREHOUSE_MATERIALS,
    productLabel = "LSF Warehouse",
  } = {}
) {
  const normalized = validateWarehouseEstimateInput(input)
  const {
    width,
    length,
    wallHeight,
    quantity,
    cladding,
    claddingInstalled,
    deliveryDistance,
    roofType,
    roofPitch,
    enclosureType,
    scope,
    rollerDoorCount,
    garageDoorOpeningType,
    pedestrianDoorCount,
    deliveryRequired,
    province,
    location,
  } = normalized

  const effectiveLength = Math.ceil(length / BAY_LENGTH) * BAY_LENGTH
  const lengthRounded = effectiveLength !== length
  const totalBays = effectiveLength / BAY_LENGTH
  const totalColumns = totalBays * 2 + 2
  const totalTrusses = totalColumns
  const totalScrews = totalBays * 160 * 2
  const totalPostBrackets = totalColumns
  const totalRidgeBrackets = totalTrusses
  const trussLength = interpolateTrussLength(width, materials)

  const totalTopHatLengthMeters = materials.topHats.rows * effectiveLength
  const topHatUnitsNeeded = Math.ceil(totalTopHatLengthMeters / materials.topHats.length)
  const totalTopHatLengthSold = topHatUnitsNeeded * materials.topHats.length

  const area = width * length
  const totalArea = area * quantity
  const wallArea = 2 * (width + length) * wallHeight
  const roofHalfSpan = Math.sqrt((width / 2) ** 2 + (Math.tan((roofPitch * Math.PI) / 180) * (width / 2)) ** 2)
  const roofArea = roofHalfSpan * 2 * length
  const sideWallArea = 2 * length * wallHeight
  const gableWallArea = 2 * width * wallHeight
  const claddingArea =
    enclosureType === "fully_enclosed"
      ? roofArea + sideWallArea + gableWallArea
      : enclosureType === "open_sides"
        ? roofArea + sideWallArea
        : roofArea
  const totalCladdingArea = claddingArea * quantity

  const trussRate = materials.trusses[width]?.rate || materials.trusses[8].rate
  const costColumns = totalColumns * wallHeight * materials.columns.rate * quantity
  const costTrusses = totalTrusses * trussLength * trussRate * quantity
  const costPostBrackets = totalPostBrackets * materials.postBracket * quantity
  const costRidgeBrackets = totalRidgeBrackets * materials.ridgeBracket * quantity
  const costScrews = totalScrews * materials.screw * quantity
  const costTopHats = totalTopHatLengthSold * materials.topHats.rate * quantity
  const costCladdingSupply = totalCladdingArea * materials.cladding[cladding].supply
  const structureInstallationArea = totalArea
  const claddingInstallationArea = totalCladdingArea
  const costStructureInstallation = claddingInstalled
    ? structureInstallationArea * materials.structureInstallRate
    : 0
  const costCladdingInstallation = claddingInstalled && cladding !== "None"
    ? claddingInstallationArea * materials.claddingInstallRate
    : 0
  const rawDeliveryCost = deliveryDistance * materials.deliveryRate
  const usesDeliveryMinimum = deliveryRequired && rawDeliveryCost < DEFAULT_DELIVERY_MINIMUM
  const deliveryCost = deliveryRequired
    ? Math.max(rawDeliveryCost, DEFAULT_DELIVERY_MINIMUM)
    : 0
  const garageOpeningRate =
    materials.garageDoorOpeningRates[garageDoorOpeningType] ||
    materials.garageDoorOpeningRates.single
  const costRollerDoors = rollerDoorCount * garageOpeningRate
  const costPedestrianDoors = pedestrianDoorCount * materials.pedestrianDoorOpeningRate

  const baseTotal =
    costColumns +
    costTrusses +
    costPostBrackets +
    costRidgeBrackets +
    costScrews +
    costTopHats +
    costCladdingSupply +
    costStructureInstallation +
    costCladdingInstallation +
    deliveryCost +
    costRollerDoors +
    costPedestrianDoors

  const estimatedTotal = roundMoney(baseTotal * DEFAULT_MARKUP)
  const competitorLow = roundMoney(totalArea * materials.competitorLowRate)
  const competitorHigh = roundMoney(totalArea * materials.competitorHighRate)
  const savingLow = roundMoney(competitorLow - estimatedTotal)
  const savingHigh = roundMoney(competitorHigh - estimatedTotal)

  const lineItems = [
    buildLineItem({
      code: "columns",
      label: "Columns",
      quantity: totalColumns * quantity,
      unit: "items",
      unitRate: wallHeight * materials.columns.rate,
      total: costColumns,
    }),
    buildLineItem({
      code: "trusses",
      label: "Trusses",
      quantity: totalTrusses * quantity,
      unit: "items",
      unitRate: trussLength * trussRate,
      total: costTrusses,
    }),
    buildLineItem({
      code: "post_brackets",
      label: "Post brackets",
      quantity: totalPostBrackets * quantity,
      unit: "items",
      unitRate: materials.postBracket,
      total: costPostBrackets,
    }),
    buildLineItem({
      code: "ridge_brackets",
      label: "Ridge brackets",
      quantity: totalRidgeBrackets * quantity,
      unit: "items",
      unitRate: materials.ridgeBracket,
      total: costRidgeBrackets,
    }),
    buildLineItem({
      code: "screws",
      label: "Fasteners and screws",
      quantity: totalScrews * quantity,
      unit: "items",
      unitRate: materials.screw,
      total: costScrews,
    }),
    buildLineItem({
      code: "top_hats",
      label: "Top hats",
      quantity: topHatUnitsNeeded * quantity,
      unit: "lengths",
      unitRate: materials.topHats.length * materials.topHats.rate,
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
        unitRate: materials.cladding[cladding].supply,
        total: costCladdingSupply,
      })
    )
  }

  if (claddingInstalled) {
    lineItems.push(
      buildLineItem({
        code: "structure_installation",
        label: "Structure installation",
        quantity: structureInstallationArea,
        unit: "sqm",
        unitRate: materials.structureInstallRate,
        total: costStructureInstallation,
      })
    )
  }

  if (claddingInstalled && cladding !== "None") {
    lineItems.push(
      buildLineItem({
        code: "cladding_installation",
        label: "Cladding installation",
        quantity: claddingInstallationArea,
        unit: "sqm",
        unitRate: materials.claddingInstallRate,
        total: costCladdingInstallation,
      })
    )
  }

  if (rollerDoorCount > 0) {
    lineItems.push(
      buildLineItem({
        code: "roller_doors",
        label: `Garage door openings (${WAREHOUSE_GARAGE_OPENING_OPTIONS.find((option) => option.value === garageDoorOpeningType)?.label || garageDoorOpeningType})`,
        quantity: rollerDoorCount,
        unit: "items",
        unitRate: garageOpeningRate,
        total: costRollerDoors,
      })
    )
  }

  if (pedestrianDoorCount > 0) {
    lineItems.push(
      buildLineItem({
        code: "pedestrian_doors",
        label: "Pedestrian door openings",
        quantity: pedestrianDoorCount,
        unit: "items",
        unitRate: materials.pedestrianDoorOpeningRate,
        total: costPedestrianDoors,
      })
    )
  }

  if (deliveryRequired) {
    lineItems.push(
      usesDeliveryMinimum
        ? buildLineItem({
            code: "delivery",
            label: "Delivery (minimum charge)",
            quantity: 1,
            unit: "charge",
            unitRate: DEFAULT_DELIVERY_MINIMUM,
            total: deliveryCost,
          })
        : buildLineItem({
            code: "delivery",
            label: "Delivery",
            quantity: deliveryDistance,
            unit: "km",
            unitRate: materials.deliveryRate,
            total: deliveryCost,
          })
    )
  }

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
      roofArea: roundMoney(roofArea),
      totalArea: roundMoney(totalArea),
      wallArea: roundMoney(wallArea),
      sideWallArea: roundMoney(sideWallArea),
      gableWallArea: roundMoney(gableWallArea),
      claddingArea: roundMoney(claddingArea),
      totalCladdingArea: roundMoney(totalCladdingArea),
      bayLength: BAY_LENGTH,
      totalBays,
      lengthRounded,
      roofType,
      roofPitch,
      enclosureType,
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
      installationCost: roundMoney(costStructureInstallation + costCladdingInstallation),
      structureInstallationCost: roundMoney(costStructureInstallation),
      structureInstallationArea: roundMoney(structureInstallationArea),
      claddingInstallationCost: roundMoney(costCladdingInstallation),
      claddingInstallationArea: roundMoney(claddingInstallationArea),
      garageDoorOpeningCost: roundMoney(costRollerDoors),
      garageDoorOpeningType,
      pedestrianDoorOpeningCost: roundMoney(costPedestrianDoors),
      usesDeliveryMinimum,
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
      title: `${quantity > 1 ? `${quantity} x ` : ""}${width}m x ${length}m ${productLabel}`,
      shortDescription: `${quantity > 1 ? `${quantity} x ` : ""}${productLabel} ${width}m x ${length}m x ${wallHeight}m, ${WAREHOUSE_ENCLOSURE_OPTIONS.find((option) => option.value === enclosureType)?.label?.toLowerCase() || enclosureType}, ${cladding}${claddingInstalled ? ", supply and installation" : ", supply only"}`,
      estimateRequest: `${quantity > 1 ? `${quantity} x ` : ""}${productLabel} ${width}m x ${length}m x ${wallHeight}m, ${WAREHOUSE_ENCLOSURE_OPTIONS.find((option) => option.value === enclosureType)?.label || enclosureType}, ${cladding}, ${WAREHOUSE_SCOPE_OPTIONS.find((option) => option.value === scope)?.label || scope}, ${rollerDoorCount} garage door openings${rollerDoorCount > 0 ? ` (${WAREHOUSE_GARAGE_OPENING_OPTIONS.find((option) => option.value === garageDoorOpeningType)?.label || garageDoorOpeningType})` : ""}, ${pedestrianDoorCount} pedestrian door openings${deliveryRequired ? `, ${deliveryDistance}km delivery` : ", no delivery"}${province ? `, ${province}` : ""}${location ? `, ${location}` : ""}${lengthRounded ? `, priced on ${effectiveLength}m structural bay layout` : ""}`,
      layoutNote: lengthRounded
        ? `Requested depth ${length}m is priced against a practical ${effectiveLength}m bay layout.`
        : "",
    },
  }
}

export function calculateWarehouseEstimate(input) {
  return calculateWarehouseEstimateWithMaterials(input, {
    materials: LSF_WAREHOUSE_MATERIALS,
    productLabel: "LSF Warehouse",
  })
}
