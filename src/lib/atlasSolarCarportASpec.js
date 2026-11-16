import {
  ATLAS_SOLAR_CARPORT_PARKING_WIDTH_METRES,
  ATLAS_SOLAR_CARPORT_PROFILES,
  ATLAS_SOLAR_CARPORT_PURLIN_COUNT,
  ATLAS_SOLAR_CARPORT_RAFTER_LENGTH_METRES,
} from "./atlasSolarCarportProfiles.js"
import { calculateLippedChannelMassKgPerM } from "./atlasLippedChannelProfiles.js"

export const A_SPEC_SPLICE_SELL_PRICE = 150
export const A_SPEC_FOOTING_SELL_PRICE = 1000
export const A_SPEC_MAX_BAYS = 10

// Internal planning schedule. Connection and footing details require approval.
export function buildSolarCarportASpecDraft(bays) {
  if (!Number.isInteger(bays) || bays < 1 || bays > A_SPEC_MAX_BAYS) {
    throw new RangeError("Choose between 1 and 10 bays.")
  }

  const frames = bays + 1
  const bayWidth = ATLAS_SOLAR_CARPORT_PARKING_WIDTH_METRES * 2
  const rafterLength = ATLAS_SOLAR_CARPORT_RAFTER_LENGTH_METRES
  const embedmentM = 0.6
  const lowHeight = 2.7
  const pitch = 5
  const highHeight = lowHeight + rafterLength * Math.sin(pitch * Math.PI / 180)
  const { column, rafter, purlin } = ATLAS_SOLAR_CARPORT_PROFILES
  const members = [
    ["Low-side columns", column, frames, lowHeight + embedmentM],
    ["High-side columns", column, frames, highHeight + embedmentM],
    ["Rafters", rafter, frames, rafterLength],
    ["Perimeter purlins", rafter, bays * 2, bayWidth],
    ["Internal purlins", purlin, bays * (ATLAS_SOLAR_CARPORT_PURLIN_COUNT - 2), bayWidth],
  ].map(([label, profile, quantity, nominalLength]) => ({
    label, profile: profile.section, quantity, nominalLength,
    massKg: calculateLippedChannelMassKgPerM(profile) * quantity * nominalLength,
  }))
  const purlinToRafterJoints = bays * ATLAS_SOLAR_CARPORT_PURLIN_COUNT * 2
  const purlinBoltSetsPerJoint = 1
  const spliceCount = (bays - 1) * ATLAS_SOLAR_CARPORT_PURLIN_COUNT
  return {
    width: bays * bayWidth,
    depth: rafterLength,
    pitch,
    columnCount: frames * 2,
    embedmentM,
    footings: {
      count: frames * 2,
      widthM: 0.35,
      lengthM: 0.35,
      depthM: embedmentM,
      grossConcreteM3: frames * 2 * 0.35 * 0.35 * embedmentM,
    },
    rafterConnectionBoltSets: frames * 2 * 4,
    purlinToRafterJoints,
    purlinBoltSetsPerJoint,
    purlinBoltSetCount: purlinToRafterJoints * purlinBoltSetsPerJoint,
    members,
    steelKg: members.reduce((total, member) => total + member.massKg, 0),
    kneeBraces: {
      profile: purlin.section,
      quantity: frames * 2,
      angleDeg: 45,
      budgetLengthsM: [0.45, 0.50],
      budgetMassKg: [0.45, 0.50].map(length => length * frames * 2 * calculateLippedChannelMassKgPerM(purlin)),
      boltsPerEnd: 4,
      boltSetCount: frames * 2 * 8,
    },
    spliceCount,
    spliceSellTotal: spliceCount * A_SPEC_SPLICE_SELL_PRICE,
  }
}

// The CRM asks for one priced layout. Its order quantity is applied separately.
export function calculateSolarCarportASpecEstimate(input, release) {
  const runs = Array.isArray(input.parkingRuns) && input.parkingRuns.length ? input.parkingRuns : [input]
  const drafts = runs.map(run => {
    if (Number(run.length) !== ATLAS_SOLAR_CARPORT_RAFTER_LENGTH_METRES) {
      throw new Error("A-spec uses single-sided 6m runs. Select a 6m layout.")
    }
    return buildSolarCarportASpecDraft(Number(run.width) / (ATLAS_SOLAR_CARPORT_PARKING_WIDTH_METRES * 2))
  })
  const costs = release.costs
  const round = value => Math.round((value + Number.EPSILON) * 100) / 100
  const sum = getter => drafts.reduce((total, draft) => total + getter(draft), 0)
  const lineItems = []
  function add(code, label, quantity, unit, unitRate, priceIncludesMarkup = false) {
    if (quantity > 0 && unitRate > 0) {
      lineItems.push({ code: `SC-A-${code}`, label, quantity, unit, unitRate, total: round(quantity * unitRate), priceIncludesMarkup })
    }
  }
  const steelRate = costs.zamRatePerTon / 1000
  const memberCodes = ["COL-L", "COL-H", "RAF", "PER", "PUR"]
  drafts[0].members.forEach((member, index) => {
    add(memberCodes[index], `${member.label} · ${member.profile}`, sum(draft => draft.members[index].massKg), "kg", steelRate)
  })
  const braceKg = sum(draft => draft.kneeBraces.budgetMassKg[1])
  add("BRACE", "Diagonal knee braces · 500mm", braceKg, "kg", steelRate)
  const steelKg = sum(draft => draft.steelKg) + braceKg
  add("WASTE", "Steel waste allowance", steelKg, "kg", steelRate * costs.wastePercent / 100)
  add("FAB", "Fabrication", steelKg, "kg", costs.fabricationPerKg)
  add("BRACE-BOLT", "Knee brace bolt sets", sum(draft => draft.kneeBraces.boltSetCount), "set", costs.connectionBoltSetEach)
  add("RAF-BOLT", "Rafter-to-column bolt sets", sum(draft => draft.rafterConnectionBoltSets), "set", costs.connectionBoltSetEach)
  add("PUR-BOLT", "Purlin-to-rafter bolt sets", sum(draft => draft.purlinBoltSetCount), "set", costs.connectionBoltSetEach)
  add("SPLICE", "Purlin splice brackets", sum(draft => draft.spliceCount), "each", A_SPEC_SPLICE_SELL_PRICE, true)
  const totalModules = sum(draft => draft.width / ATLAS_SOLAR_CARPORT_PARKING_WIDTH_METRES * 6)
  add("MODULE", "Panel support interfaces", totalModules, "each", costs.moduleSupportEach)
  const area = sum(draft => draft.width * draft.depth)
  const installed = input.scope === "supply_install"
  if (installed) {
    add("INSTALL", "Solar carport structure erection", area, "m²", costs.installationSellPerSquareMetre, true)
    add("FOOTING", "Planted column footings · 350 × 350 × 600mm", sum(draft => draft.footings.count), "each", A_SPEC_FOOTING_SELL_PRICE, true)
  }
  if (Number(input.deliveryDistance) > 0) {
    add("DELIVERY", "Delivery", 1, "lot", Math.max(costs.deliveryMinimum, Number(input.deliveryDistance) * costs.deliveryPerKm))
  }
  const markupMultiplier = 1 + costs.upliftPercent / 100
  const baseTotal = lineItems.filter(item => !item.priceIncludesMarkup).reduce((total, item) => total + item.total, 0)
  const estimatedTotal = round(lineItems.reduce((total, item) => total + round(item.total * (item.priceIncludesMarkup ? 1 : markupMultiplier)), 0))
  const title = drafts.length === 1
    ? `${drafts[0].width}m x ${drafts[0].depth}m Atlas Solar Carport | A-Spec`
    : `${drafts.length}-run Atlas Solar Carport | A-Spec`
  const scope = installed ? "Supply + installation" : "Supply only"
  return {
    input: { ...input, quantity: 1, solarCarportSpec: "A", moduleCount: totalModules },
    lineItems,
    summary: { title, estimateRequest: `${title} · ZAM · ${scope}` },
    pricing: { baseTotal, markupMultiplier, estimatedTotal },
    totals: { area, totalArea: area, totalModules, steelKg },
    labels: { area: `${area} m²`, scope, modules: String(totalModules), delivery: input.deliveryDistance > 0 ? `${input.deliveryDistance} km` : "Collection / not specified" },
    meta: { productType: "Solar carport", productGroup: "solar", pricingRevision: release.revision },
  }
}
