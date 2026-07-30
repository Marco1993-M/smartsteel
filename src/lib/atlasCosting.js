export const ATLAS_PRICING_REQUIRED_FIELDS = [
  ["componentName", "component name"],
  ["quantityRule", "quantity rule"],
  ["pricingUnit", "pricing unit"],
  ["galvanisedRate", "primary rate"],
  ["supplierName", "supplier"],
  ["effectiveDate", "effective date"],
]

function numberOrZero(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

export function calculateAtlasPricingLine(record) {
  const quantity = numberOrZero(record.baselineQuantity)
  const lengthM = numberOrZero(record.baselineLengthM)
  const massKgPerM = numberOrZero(record.massKgPerM)
  const rate = numberOrZero(record.galvanisedRate)
  const unit = record.pricingUnit

  let rawCost = 0
  if (unit === "ton") rawCost = quantity * lengthM * massKgPerM * (rate / 1000)
  else if (unit === "kg") rawCost = quantity * rate
  else if (unit === "m") rawCost = quantity * lengthM * rate
  else rawCost = quantity * rate

  const wasteCost = rawCost * (numberOrZero(record.wastePercent) / 100)
  const fabricationCost = numberOrZero(record.fabricationAllowance)
  const coatingCost = numberOrZero(record.coatingAllowance)
  const costBeforeMargin = rawCost + wasteCost + fabricationCost + coatingCost
  const marginCost = costBeforeMargin * (numberOrZero(record.marginPercent) / 100)

  return {
    rawCost,
    wasteCost,
    fabricationCost,
    coatingCost,
    marginCost,
    totalCost: costBeforeMargin + marginCost,
  }
}

export function getAtlasPricingCompleteness(record) {
  const missing = ATLAS_PRICING_REQUIRED_FIELDS
    .filter(([field]) => record[field] === "" || record[field] === null || record[field] === undefined)
    .map(([, label]) => label)

  if (record.pricingUnit === "ton") {
    if (!Number(record.massKgPerM)) missing.push("mass per metre")
    if (!Number(record.baselineLengthM)) missing.push("baseline member length")
  }
  if (!Number(record.baselineQuantity)) missing.push("baseline quantity")
  if (record.componentCode === "W08-BLT" && !record.fastenerId) missing.push("controlled bolt")

  const uniqueMissing = [...new Set(missing)]
  return {
    missing: uniqueMissing,
    completed: Math.max(0, ATLAS_PRICING_REQUIRED_FIELDS.length + 2 - uniqueMissing.length),
    total: ATLAS_PRICING_REQUIRED_FIELDS.length + 2,
    ready: uniqueMissing.length === 0,
  }
}

export function summarizeAtlasPricing(records) {
  return records.reduce(
    (summary, record) => {
      const costs = calculateAtlasPricingLine(record)
      const completeness = getAtlasPricingCompleteness(record)
      summary.rawCost += costs.rawCost
      summary.wasteCost += costs.wasteCost
      summary.fabricationCost += costs.fabricationCost
      summary.coatingCost += costs.coatingCost
      summary.marginCost += costs.marginCost
      summary.totalCost += costs.totalCost
      summary.readyCount += completeness.ready ? 1 : 0
      summary.holdCount += completeness.ready && record.status === "confirmed" ? 0 : 1
      return summary
    },
    {
      rawCost: 0,
      wasteCost: 0,
      fabricationCost: 0,
      coatingCost: 0,
      marginCost: 0,
      totalCost: 0,
      readyCount: 0,
      holdCount: 0,
    }
  )
}
