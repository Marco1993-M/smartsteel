export const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export const ANNUAL_PLAN_FIELDS = [
  "actualRevenue", "actualGrossProfit", "salaries", "insurance", "otherFixedExpenses",
  "workingCapital", "additionalJobs", "targetRevenue", "targetGrossProfit",
  "targetJobs", "targetSellingPrice", "managementForecast",
]
export const SIGNED_ANNUAL_PLAN_FIELDS = new Set(["actualGrossProfit", "targetGrossProfit", "workingCapital"])
export const TARGET_GROSS_MARGIN = 0.4
export const ANNUAL_ASSUMPTION_SECTIONS = [
  { key: "keyAssumptions", label: "Key assumptions", placeholder: "What needs to hold true for this plan?" },
  { key: "marketOpportunity", label: "Market opportunity", placeholder: "Customer demand, segments and the size of the opportunity" },
  { key: "growthStrategy", label: "Growth strategy & partnerships", placeholder: "How we will win work and expand our reach" },
  { key: "capacityLimits", label: "Capacity limits", placeholder: "Production, staffing or supplier constraints" },
  { key: "investments", label: "Investment priorities", placeholder: "Equipment, people or systems needed" },
  { key: "fundingNeeds", label: "Funding & working capital", placeholder: "e.g. Afgri bridge financing and its intended use" },
  { key: "risks", label: "Risks & mitigations", placeholder: "What could go wrong, and how we will respond" },
  { key: "milestones", label: "Milestones & evidence", placeholder: "Key dates, proof points and decisions for the year" },
]
export const MAX_ANNUAL_ASSUMPTION_LENGTH = 2000

export function deriveAnnualPlanTargets(entry = {}, grossMargin = TARGET_GROSS_MARGIN) {
  const jobs = entry.targetJobs === "" || entry.targetJobs == null ? null : Number(entry.targetJobs)
  const ticket = entry.targetSellingPrice === "" || entry.targetSellingPrice == null ? null : Number(entry.targetSellingPrice)
  if (!Number.isInteger(jobs) || jobs < 0 || !Number.isFinite(ticket) || ticket < 0) return { targetRevenue: null, targetGrossProfit: null }
  const targetRevenue = Math.round(jobs * ticket * 100) / 100
  const margin = Number.isFinite(Number(grossMargin)) && Number(grossMargin) >= 0 && Number(grossMargin) <= 1 ? Number(grossMargin) : TARGET_GROSS_MARGIN
  return { targetRevenue, targetGrossProfit: Math.round(targetRevenue * margin * 100) / 100 }
}

export function sastYearMonth(asOf = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Johannesburg", year: "numeric", month: "2-digit" }).formatToParts(asOf)
  return { year: Number(parts.find((part) => part.type === "year")?.value), month: Number(parts.find((part) => part.type === "month")?.value) - 1 }
}

export function emptyAnnualPlan(year) {
  return { year, turnoverGoal: null, assumptions: Object.fromEntries(ANNUAL_ASSUMPTION_SECTIONS.map(({ key }) => [key, ""])), months: Array.from({ length: 12 }, () => ({})), revision: 0 }
}

export function normalizeAnnualPlan(value, year) {
  const source = value || {}
  const grossMargin = source.commercialModel?.grossMarginTarget ?? TARGET_GROSS_MARGIN
  const months = Array.from({ length: 12 }, (_, index) => {
    const entry = Array.isArray(source.months) ? source.months[index] || {} : {}
    const normalized = Object.fromEntries(ANNUAL_PLAN_FIELDS.map((field) => {
      const raw = entry[field]
      const number = raw === "" || raw == null ? null : Number(raw)
      return [field, Number.isFinite(number) && (number >= 0 || SIGNED_ANNUAL_PLAN_FIELDS.has(field)) ? number : null]
    }))
    return { ...normalized, ...deriveAnnualPlanTargets(normalized, grossMargin) }
  })
  const turnoverGoal = source.turnoverGoal === "" || source.turnoverGoal == null ? null : Number(source.turnoverGoal)
  const rawAssumptions = source.assumptions && typeof source.assumptions === "object" && !Array.isArray(source.assumptions) ? source.assumptions : {}
  const hasStructuredNotes = ANNUAL_ASSUMPTION_SECTIONS.some(({ key }) => String(rawAssumptions[key] || "").trim())
  const assumptions = Object.fromEntries(ANNUAL_ASSUMPTION_SECTIONS.map(({ key }) => [
    key, String(rawAssumptions[key] || (key === "keyAssumptions" && !hasStructuredNotes ? source.notes || "" : "")).slice(0, MAX_ANNUAL_ASSUMPTION_LENGTH),
  ]))
  return {
    year,
    turnoverGoal: Number.isFinite(turnoverGoal) && turnoverGoal >= 0 ? turnoverGoal : null,
    assumptions,
    months,
    revision: Number(source.revision || 0),
    updatedAt: source.updatedAt || null,
  }
}

const sum = (values) => values.reduce((total, value) => total + (Number(value) || 0), 0)
const count = (values) => values.filter((value) => value != null).length

export function summarizeAnnualPlan(plan, acceptedOrders = [], asOf = new Date()) {
  const year = Number(plan.year)
  const { year: nowYear, month: nowMonth } = sastYearMonth(asOf)
  const months = plan.months.map((entry, index) => {
    const targets = deriveAnnualPlanTargets(entry, plan.commercialModel?.grossMarginTarget ?? TARGET_GROSS_MARGIN)
    const accepted = acceptedOrders[index] || { count: 0, value: 0 }
    const fixedExpenses = sum([entry.salaries, entry.insurance, entry.otherFixedExpenses])
    const actualJobs = Number(accepted.count || 0) + Number(entry.additionalJobs || 0)
    const periodPassed = year < nowYear || year === nowYear && index < nowMonth
    const isActualMonth = year < nowYear || year === nowYear && index <= nowMonth
    return {
      ...entry, ...targets, month: MONTH_LABELS[index], index,
      acceptedOrders: Number(accepted.count || 0), actualJobs,
      fixedExpenses,
      isActualMonth,
      projectedRevenue: periodPassed && entry.actualRevenue != null ? entry.actualRevenue : targets.targetRevenue,
      projectedGrossProfit: periodPassed && entry.actualGrossProfit != null ? entry.actualGrossProfit : targets.targetGrossProfit,
      source: periodPassed && entry.actualRevenue != null ? "actual" : "target",
    }
  })
  const targetJobs = sum(months.map((month) => month.targetJobs))
  const sellingValue = sum(months.map((month) => month.targetJobs != null && month.targetSellingPrice != null ? month.targetJobs * month.targetSellingPrice : 0))
  const sellingJobs = sum(months.map((month) => month.targetJobs != null && month.targetSellingPrice != null ? month.targetJobs : 0))
  const capitalSnapshots = months.filter((month) => month.isActualMonth && month.workingCapital != null)
  return {
    months,
    actualRevenue: sum(months.map((month) => month.isActualMonth ? month.actualRevenue : null)),
    actualGrossProfit: sum(months.map((month) => month.isActualMonth ? month.actualGrossProfit : null)),
    actualRevenueMonths: count(months.map((month) => month.isActualMonth ? month.actualRevenue : null)),
    actualGrossProfitMonths: count(months.map((month) => month.isActualMonth ? month.actualGrossProfit : null)),
    fixedExpenses: sum(months.map((month) => month.fixedExpenses)),
    fixedExpenseMonths: months.filter((month) => [month.salaries, month.insurance, month.otherFixedExpenses].some((value) => value != null)).length,
    fixedExpenseCompleteMonths: months.filter((month) => [month.salaries, month.insurance, month.otherFixedExpenses].every((value) => value != null)).length,
    actualJobs: sum(months.map((month) => month.actualJobs)),
    acceptedOrders: sum(months.map((month) => month.acceptedOrders)),
    targetJobs,
    typicalSellingPrice: sellingJobs > 0 ? sellingValue / sellingJobs : null,
    typicalSellingPriceCoverage: sellingJobs,
    workingCapital: capitalSnapshots.length ? capitalSnapshots.at(-1).workingCapital : null,
    workingCapitalMonth: capitalSnapshots.length ? capitalSnapshots.at(-1).month : null,
    turnoverGoal: plan.turnoverGoal,
    targetRevenue: sum(months.map((month) => month.targetRevenue)),
    targetRevenueMonths: count(months.map((month) => month.targetRevenue)),
    projectedRevenue: sum(months.map((month) => month.projectedRevenue)),
    projectionMonths: count(months.map((month) => month.projectedRevenue)),
    projectedGrossProfit: sum(months.map((month) => month.projectedGrossProfit)),
    projectedGrossProfitMonths: count(months.map((month) => month.projectedGrossProfit)),
  }
}
