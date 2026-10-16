import { summarizeAnnualPlan } from "./annualPlan.mjs"
import { DEFAULT_CASH_FLOW, forecastAnnualCashFlow, normalizeCashFlow } from "./annualCashFlow.mjs"
import { emptyExecutionModel, normalizeExecutionModel, summarizeExecution } from "./annualExecution.mjs"

export const SCENARIOS = [
  { key: "base", label: "Base case" },
  { key: "management", label: "Management target" },
  { key: "stretch", label: "Stretch / growth" },
]

export const DEFAULT_PRODUCTS = [
  "Atlas 8–12m structures", "Atlas 15m structures", "Atlas 20m structures",
  "Solar ground mounts", "Solar carports", "Custom/commercial structures",
  "Installation", "Other",
].map((name, index) => ({ id: `product-${index + 1}`, name, includeInPlanRevenue: index !== 6, minimumMargin: null, leadTimeDays: null, salesCycleDays: null }))

export const DEFAULT_CHANNELS = [
  ["channel-1", "Afgri"], ["channel-2", "Direct Smart Steel sales (incl. 3D Builder)"],
  ["channel-4", "Solar industry"], ["channel-5", "Referral"],
  ["channel-6", "Dealer / reseller"], ["channel-7", "Existing customer"], ["channel-8", "Other"],
].map(([id, name]) => ({ id, name, ownerId: "" }))

export const PIPELINE_STAGES = [
  { key: "early", label: "Early opportunity", probability: 0.1 },
  { key: "qualified", label: "Qualified", probability: 0.25 },
  { key: "quoted", label: "Quoted", probability: 0.45 },
  { key: "negotiation", label: "Negotiation", probability: 0.65 },
  { key: "verbal", label: "Verbally accepted", probability: 0.8 },
  { key: "committed", label: "Signed / committed", probability: 1 },
]

const n = (value) => value === "" || value == null ? null : Number.isFinite(Number(value)) && Number(value) >= 0 && Number(value) <= 1e12 ? Number(value) : null
const sum = (values) => values.reduce((total, value) => total + (Number(value) || 0), 0)
const safeText = (value, limit = 160) => String(value || "").trim().slice(0, limit)
const month = (value) => Number.isInteger(Number(value)) && Number(value) >= 0 && Number(value) < 12 ? Number(value) : 0
const scenario = (value) => SCENARIOS.some((item) => item.key === value) ? value : "management"

export function emptyCommercialModel() {
  return {
    products: DEFAULT_PRODUCTS.map((item) => ({ ...item })),
    channels: DEFAULT_CHANNELS.map((item) => ({ ...item })),
    productPlans: [],
    productActuals: [],
    channelTargets: [],
    channelActuals: [],
    opportunities: [],
    backlog: [],
    funnel: Array.from({ length: 12 }, () => ({})),
    pipelineThresholds: { green: 3, amber: 2 },
    grossMarginTarget: 0.4,
    installationAttachRate: 0.7,
    valuation: { lowMultiple: null, highMultiple: null, rationale: "" },
    funding: { costRatio: 0.6, daysLow: 21, daysHigh: 28, largestSupplyOrder: null, afgriMonthlySupply: Array(12).fill(null) },
    cashFlow: { ...DEFAULT_CASH_FLOW },
    execution: emptyExecutionModel(),
  }
}

export function normalizeCommercialModel(value) {
  const source = value && typeof value === "object" && !Array.isArray(value) ? value : {}
  const defaults = emptyCommercialModel()
  const products = Array.isArray(source.products) ? source.products.slice(0, 40).map((item) => ({
    id: safeText(item.id, 64), name: safeText(item.name), includeInPlanRevenue: item.includeInPlanRevenue !== false && item.id !== "product-7", minimumMargin: n(item.minimumMargin) <= 1 ? n(item.minimumMargin) : null,
    leadTimeDays: n(item.leadTimeDays), salesCycleDays: n(item.salesCycleDays),
  })).filter((item) => item.id && item.name) : defaults.products
  const channels = Array.isArray(source.channels) ? source.channels.slice(0, 40).map((item) => ({
    id: safeText(item.id, 64), name: safeText(item.name), ownerId: safeText(item.ownerId, 64),
  })).filter((item) => item.id && item.name) : defaults.channels
  const productIds = new Set(products.map((item) => item.id))
  const channelIds = new Set(channels.map((item) => item.id))
  const productPlans = Array.isArray(source.productPlans) ? source.productPlans.slice(0, 1440).map((item) => ({
    productId: safeText(item.productId, 64), scenario: scenario(item.scenario), month: month(item.month),
    units: n(item.units), price: n(item.price), directCost: n(item.directCost),
  })).filter((item) => productIds.has(item.productId)) : []
  const productActuals = Array.isArray(source.productActuals) ? source.productActuals.slice(0, 480).map((item) => ({
    productId: safeText(item.productId, 64), month: month(item.month),
    units: n(item.units), revenue: n(item.revenue), directCost: n(item.directCost),
  })).filter((item) => productIds.has(item.productId)) : []
  const channelTargets = Array.isArray(source.channelTargets) ? source.channelTargets.slice(0, 120).map((item) => ({
    channelId: safeText(item.channelId, 64), scenario: scenario(item.scenario), revenue: n(item.revenue),
  })).filter((item) => channelIds.has(item.channelId)) : []
  const channelActuals = Array.isArray(source.channelActuals) ? source.channelActuals.slice(0, 480).map((item) => ({
    channelId: safeText(item.channelId, 64), month: month(item.month), revenue: n(item.revenue),
  })).filter((item) => channelIds.has(item.channelId)) : []
  const opportunities = Array.isArray(source.opportunities) ? source.opportunities.slice(0, 250).map((item) => ({
    id: safeText(item.id, 64), name: safeText(item.name), productId: safeText(item.productId, 64),
    channelId: safeText(item.channelId, 64), stage: PIPELINE_STAGES.some((stage) => stage.key === item.stage) ? item.stage : "early",
    value: n(item.value), probability: n(item.probability) <= 1 ? n(item.probability) : null, expectedCloseMonth: month(item.expectedCloseMonth),
  })).filter((item) => item.id && item.name) : []
  const backlog = Array.isArray(source.backlog) ? source.backlog.slice(0, 250).map((item) => ({
    id: safeText(item.id, 64), name: safeText(item.name), productId: safeText(item.productId, 64),
    channelId: safeText(item.channelId, 64), orderValue: n(item.orderValue),
    recognizedRevenue: n(item.recognizedRevenue), expectedGp: n(item.expectedGp),
    deliveryMonth: month(item.deliveryMonth),
  })).filter((item) => item.id && item.name) : []
  const funnel = Array.from({ length: 12 }, (_, index) => {
    const item = Array.isArray(source.funnel) ? source.funnel[index] || {} : {}
    return Object.fromEntries(["leads", "qualified", "quotes", "quotedValue", "negotiations", "won", "wonValue", "salesCycleDays"].map((key) => [key, n(item[key])]))
  })
  const amber = n(source.pipelineThresholds?.amber) ?? 2
  const green = n(source.pipelineThresholds?.green) ?? 3
  const lowMultiple = n(source.valuation?.lowMultiple)
  const highMultiple = n(source.valuation?.highMultiple)
  const funding = source.funding || {}
  return {
    products, channels, productPlans, productActuals, channelTargets, channelActuals,
    opportunities, backlog, funnel,
    pipelineThresholds: { amber, green },
    grossMarginTarget: n(source.grossMarginTarget) != null && n(source.grossMarginTarget) <= 1 ? n(source.grossMarginTarget) : 0.4,
    installationAttachRate: n(source.installationAttachRate) != null && n(source.installationAttachRate) <= 1 ? n(source.installationAttachRate) : 0.7,
    valuation: {
      lowMultiple: lowMultiple > 0 && lowMultiple <= 100 ? lowMultiple : null,
      highMultiple: highMultiple > 0 && highMultiple <= 100 ? highMultiple : null,
      rationale: safeText(source.valuation?.rationale, 500),
    },
    funding: {
      costRatio: n(funding.costRatio) != null && n(funding.costRatio) <= 1 ? n(funding.costRatio) : 0.6,
      daysLow: Number.isInteger(Number(funding.daysLow)) && Number(funding.daysLow) >= 1 && Number(funding.daysLow) <= 120 ? Number(funding.daysLow) : 21,
      daysHigh: Number.isInteger(Number(funding.daysHigh)) && Number(funding.daysHigh) >= 1 && Number(funding.daysHigh) <= 120 ? Number(funding.daysHigh) : 28,
      largestSupplyOrder: n(funding.largestSupplyOrder),
      afgriMonthlySupply: Array.from({ length: 12 }, (_, index) => n(funding.afgriMonthlySupply?.[index])),
    },
    cashFlow: normalizeCashFlow(source.cashFlow),
    execution: normalizeExecutionModel(source.execution),
  }
}

// Monthly orders are spread evenly across calendar days. This is a planning
// exposure curve, not a project-level cash-flow schedule or a financing limit.
export function estimateBridgeExposure(monthlySupply, year, costRatio, days) {
  if (!Array.isArray(monthlySupply) || monthlySupply.length !== 12 || monthlySupply.some((value) => value == null)) return null
  const dailyCosts = monthlySupply.flatMap((revenue, monthIndex) => {
    const dayCount = new Date(year, monthIndex + 1, 0).getDate()
    return Array(dayCount).fill(Number(revenue) * costRatio / dayCount)
  })
  let outstanding = 0
  let peak = 0
  for (let day = 0; day < dailyCosts.length; day++) {
    outstanding += dailyCosts[day]
    if (day >= days) outstanding -= dailyCosts[day - days]
    peak = Math.max(peak, outstanding)
  }
  return Math.round(peak)
}

export function summarizeProductMonth(model, monthIndex, scenarioKey = "management") {
  const revenueIds = new Set(model.products.filter((product) => product.includeInPlanRevenue !== false).map((product) => product.id))
  const rows = model.productPlans.filter((row) => row.scenario === scenarioKey && row.month === monthIndex && revenueIds.has(row.productId))
  const complete = rows.filter((row) => row.units != null && row.price != null && row.directCost != null)
  return {
    entered: rows.length > 0,
    incomplete: complete.length !== rows.length,
    units: sum(complete.map((row) => row.units)),
    revenue: sum(complete.map((row) => row.units * row.price)),
    gp: sum(complete.map((row) => row.units * (row.price - row.directCost))),
  }
}

export function summarizeCommercialModel(model, plan, asOf = new Date()) {
  const valuation = model.valuation || {}
  const validRange = valuation.lowMultiple > 0 && valuation.highMultiple >= valuation.lowMultiple
  const funding = model.funding || {}
  const bridgeLow = estimateBridgeExposure(funding.afgriMonthlySupply, plan.year, funding.costRatio ?? 0.6, funding.daysLow ?? 21)
  const bridgeHigh = estimateBridgeExposure(funding.afgriMonthlySupply, plan.year, funding.costRatio ?? 0.6, funding.daysHigh ?? 28)
  const currentParts = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Johannesburg", year: "numeric", month: "2-digit" }).formatToParts(asOf)
  const currentYear = Number(currentParts.find((part) => part.type === "year")?.value)
  const currentMonth = Number(currentParts.find((part) => part.type === "month")?.value) - 1
  const products = model.products.map((product) => {
    const scenarios = Object.fromEntries(SCENARIOS.map(({ key }) => {
      const rows = product.includeInPlanRevenue === false ? [] : model.productPlans.filter((row) => row.productId === product.id && row.scenario === key)
      const completeRows = rows.filter((row) => row.units != null && row.price != null && row.directCost != null)
      const complete = completeRows.length > 0
      const units = sum(completeRows.map((row) => row.units))
      const revenue = sum(completeRows.map((row) => row.units * row.price))
      const directCost = sum(completeRows.map((row) => row.units * row.directCost))
      return [key, { complete, units, revenue, directCost, gp: revenue - directCost, margin: revenue > 0 ? (revenue - directCost) / revenue : null }]
    }))
    const actualRows = model.productActuals.filter((row) => row.productId === product.id)
    const actual = {
      units: sum(actualRows.map((row) => row.units)),
      revenue: sum(actualRows.map((row) => row.revenue)),
      directCost: sum(actualRows.map((row) => row.directCost)),
      hasData: actualRows.some((row) => row.revenue != null),
    }
    actual.costComplete = actual.hasData && actualRows.filter((row) => row.revenue != null).every((row) => row.directCost != null)
    actual.gp = actual.costComplete ? actual.revenue - actual.directCost : null
    actual.margin = actual.revenue > 0 && actual.gp != null ? actual.gp / actual.revenue : null
    return { ...product, scenarios, actual }
  })
  const installationProduct = products.find((product) => product.id === "product-7") || products.find((product) => /^installation$/i.test(product.name))
  const installationCoverage = Object.fromEntries(SCENARIOS.map(({ key }) => {
    const structureUnits = sum(products.filter((product) => product.id !== installationProduct?.id && !/^other$/i.test(product.name)).map((product) => product.scenarios[key].units))
    const desiredUnits = Math.round(structureUnits * (model.installationAttachRate ?? 0.7))
    return [key, { structureUnits, desiredUnits }]
  }))
  const scenarios = Object.fromEntries(SCENARIOS.map(({ key }) => {
    const entries = products.filter((product) => product.includeInPlanRevenue !== false).map((product) => product.scenarios[key])
    const revenue = sum(entries.map((entry) => entry.revenue))
    const gp = sum(entries.map((entry) => entry.gp))
    const units = sum(entries.map((entry) => entry.units))
    const fixedMonths = (plan.months || []).filter((entry) => [entry.salaries, entry.insurance, entry.otherFixedExpenses].every((value) => value != null))
    const fixedExpenses = sum(fixedMonths.map((entry) => sum([entry.salaries, entry.insurance, entry.otherFixedExpenses])))
    const ebitda = entries.some((entry) => entry.complete) && fixedMonths.length === 12 ? gp - fixedExpenses : null
    return [key, {
      modelled: entries.some((entry) => entry.complete), revenue, gp, units,
      margin: revenue > 0 ? gp / revenue : null,
      averageOrderValue: units > 0 ? revenue / units : null,
      operatingExpenses: fixedMonths.length === 12 ? fixedExpenses : null, operatingProfit: ebitda,
      ebitda,
      ebitdaMargin: ebitda != null && revenue > 0 ? ebitda / revenue : null,
      enterpriseValueLow: validRange && ebitda > 0 ? ebitda * valuation.lowMultiple : null,
      enterpriseValueHigh: validRange && ebitda > 0 ? ebitda * valuation.highMultiple : null,
      requiredPipeline: revenue * (model.pipelineThresholds?.green ?? 3),
      workingCapitalRequirement: null,
    }]
  }))
  const channels = model.channels.map((channel) => {
    const targets = Object.fromEntries(SCENARIOS.map(({ key }) => {
      const rows = model.channelTargets.filter((row) => row.channelId === channel.id && row.scenario === key && row.revenue != null)
      return [key, rows.length ? sum(rows.map((row) => row.revenue)) : null]
    }))
    const actualRows = model.channelActuals.filter((row) => row.channelId === channel.id && row.revenue != null)
    const actual = actualRows.length ? sum(actualRows.map((row) => row.revenue)) : null
    const open = model.opportunities.filter((row) => row.channelId === channel.id && row.stage !== "committed")
    const weightedPipeline = sum(open.map((row) => {
      const stage = PIPELINE_STAGES.find((item) => item.key === row.stage)
      return (row.value || 0) * (row.probability ?? stage?.probability ?? 0)
    }))
    const backlogRemaining = sum(model.backlog.filter((row) => row.channelId === channel.id).map((row) => Math.max(0, (row.orderValue || 0) - (row.recognizedRevenue || 0))))
    return { ...channel, targets, actual, weightedPipeline, backlogRemaining }
  })
  const managementTarget = n(plan.turnoverGoal) ?? (scenarios.management.modelled ? scenarios.management.revenue : null)
  const accountingActualMonths = (plan.months || []).filter((entry, index) => (plan.year < currentYear || plan.year === currentYear && index <= currentMonth) && entry.actualRevenue != null)
  const accountingActualRevenue = sum(accountingActualMonths.map((entry) => entry.actualRevenue))
  const elapsedMonths = (plan.months || []).filter((entry, index) => plan.year < currentYear || plan.year === currentYear && index <= currentMonth)
  const actualEbitdaComplete = elapsedMonths.length > 0 && elapsedMonths.every((entry) =>
    [entry.actualGrossProfit, entry.salaries, entry.insurance, entry.otherFixedExpenses].every((value) => value != null)
  )
  const actualEbitda = actualEbitdaComplete ? sum(elapsedMonths.map((entry) =>
    Number(entry.actualGrossProfit) - Number(entry.salaries) - Number(entry.insurance) - Number(entry.otherFixedExpenses)
  )) : null
  const productActualRevenue = sum(products.map((product) => product.actual.revenue))
  const channelActualRevenue = sum(channels.map((channel) => channel.actual))
  const productShare = (pattern) => productActualRevenue > 0 ? sum(products.filter((product) => pattern.test(product.name)).map((product) => product.actual.revenue)) / productActualRevenue : null
  const channelShare = (id) => channelActualRevenue > 0 ? (channels.find((channel) => channel.id === id)?.actual || 0) / channelActualRevenue : null
  const channelAssigned = sum(channels.map((channel) => channel.targets.management))
  const productAssigned = scenarios.management.modelled ? scenarios.management.revenue : 0
  const pipeline = model.opportunities.filter((item) => item.stage !== "committed").map((item) => {
    const stage = PIPELINE_STAGES.find((candidate) => candidate.key === item.stage)
    return { ...item, weightedValue: (item.value || 0) * (item.probability ?? stage?.probability ?? 0) }
  })
  const qualifiedPipeline = pipeline.filter((item) => item.stage !== "early")
  const backlog = model.backlog.map((item) => ({ ...item, remaining: Math.max(0, (item.orderValue || 0) - (item.recognizedRevenue || 0)) }))
  const funnel = model.funnel.map((row) => ({
    ...row, conversionCount: row.leads > 0 && row.won != null ? row.won / row.leads : null,
    conversionValue: row.quotedValue > 0 && row.wonValue != null ? row.wonValue / row.quotedValue : null,
  }))
  const futureMonths = plan.months.map((entry, index) => ({ entry, index })).filter(({ index }) => plan.year > currentYear || plan.year === currentYear && index >= currentMonth)
  const next90Months = new Set(futureMonths.slice(0, 3).map(({ index }) => index))
  const next90Target = sum(futureMonths.slice(0, 3).map(({ entry, index }) => {
    const revenueProductIds = new Set(model.products.filter((product) => product.includeInPlanRevenue !== false && product.id !== "product-7").map((product) => product.id))
    const productRows = model.productPlans.filter((row) => row.scenario === "management" && row.month === index && revenueProductIds.has(row.productId) && row.units != null && row.price != null && row.directCost != null)
    return productRows.length ? sum(productRows.map((row) => row.units * row.price)) : Number(entry.targetRevenue) || 0
  }))
  const next90QualifiedPipeline = sum(qualifiedPipeline.filter((item) => next90Months.has(item.expectedCloseMonth)).map((item) => item.value))
  const pipelineCoverage = next90Target > 0 && model.opportunities.length ? next90QualifiedPipeline / next90Target : null
  const pipelineStatus = pipelineCoverage == null ? "Insufficient data" : pipelineCoverage >= model.pipelineThresholds.green ? "On track" : pipelineCoverage >= model.pipelineThresholds.amber ? "Watch" : "Off track"
  const forecastMonths = plan.months.map((entry, index) => {
    const completed = plan.year < currentYear || plan.year === currentYear && index < currentMonth
    return completed ? n(entry.actualRevenue) : n(entry.managementForecast)
  })
  const existingProjection = summarizeAnnualPlan(plan, [], asOf)
  const planningProjection = existingProjection.projectionMonths === 12 ? existingProjection.projectedRevenue : null
  const forecastRevenue = forecastMonths.every((value) => value != null) ? sum(forecastMonths) : null
  const gapBasis = forecastRevenue != null ? "management forecast" : planningProjection != null ? "target-based planning projection" : null
  const gapBase = forecastRevenue ?? planningProjection
  const revenueAchievement = managementTarget > 0 && forecastRevenue != null ? forecastRevenue / managementTarget : null
  const statusThresholds = model.execution?.thresholds || emptyExecutionModel().thresholds
  const revenueStatus = revenueAchievement == null ? "Insufficient data" : revenueAchievement >= statusThresholds.revenueOnTrack ? "On track" : revenueAchievement >= statusThresholds.revenueWatch ? "Watch" : "Off track"
  const cashFlow = Object.fromEntries(SCENARIOS.map(({ key }) => [key, {
    even: forecastAnnualCashFlow(model, plan, key, "even"),
    clustered: forecastAnnualCashFlow(model, plan, key, "clustered"),
  }]))
  for (const { key } of SCENARIOS) scenarios[key].workingCapitalRequirement = cashFlow[key].clustered?.peakFundingBeforeOpeningCash ?? null
  const managementMargin = scenarios.management.margin
  const annualFixedExpenses = scenarios.management.operatingExpenses
  const breakEvenRevenue = managementMargin > 0 && annualFixedExpenses != null ? annualFixedExpenses / managementMargin : null
  return {
    products, scenarios, channels, funnel, pipeline, backlog,
    execution: summarizeExecution(model.execution || emptyExecutionModel(), asOf),
    installationCoverage,
    cashFlow,
    breakEven: {
      weightedGrossMargin: managementMargin,
      monthlyFixedExpenses: annualFixedExpenses == null ? null : annualFixedExpenses / 12,
      monthlyRevenue: breakEvenRevenue == null ? null : breakEvenRevenue / 12,
      annualRevenue: breakEvenRevenue,
      annualOrders: breakEvenRevenue != null && scenarios.management.averageOrderValue > 0 ? Math.ceil(breakEvenRevenue / scenarios.management.averageOrderValue) : null,
      marginOfSafety: breakEvenRevenue == null || !scenarios.management.modelled ? null : scenarios.management.revenue - breakEvenRevenue,
    },
    funding: {
      scheduledSupply: funding.afgriMonthlySupply?.every((value) => value != null) ? sum(funding.afgriMonthlySupply) : null,
      costRatio: funding.costRatio ?? 0.6,
      daysLow: funding.daysLow ?? 21,
      daysHigh: funding.daysHigh ?? 28,
      bridgeLow,
      bridgeHigh,
      singleOrderFloor: funding.largestSupplyOrder != null ? Math.round(funding.largestSupplyOrder * (funding.costRatio ?? 0.6)) : null,
    },
    managementTarget, channelAssigned, productAssigned,
    unassignedChannelTarget: managementTarget == null ? null : managementTarget - channelAssigned,
    unassignedProductTarget: managementTarget == null ? null : managementTarget - productAssigned,
    forecastRevenue,
    forecastMonthsEntered: forecastMonths.filter((value) => value != null).length,
    planningProjection,
    gapBasis,
    objectiveGap: managementTarget != null && gapBase != null ? managementTarget - gapBase : null,
    objectiveAchievement: managementTarget > 0 && gapBase != null ? gapBase / managementTarget : null,
    revenueStatus,
    pipelineValue: model.opportunities.length ? sum(pipeline.map((item) => item.value)) : null,
    weightedPipeline: model.opportunities.length ? sum(pipeline.map((item) => item.weightedValue)) : null,
    qualifiedPipeline: model.opportunities.length ? sum(qualifiedPipeline.map((item) => item.value)) : null,
    next90QualifiedPipeline: model.opportunities.length ? next90QualifiedPipeline : null,
    backlogValue: sum(backlog.map((item) => item.remaining)),
    accountingActualMonths: accountingActualMonths.length,
    accountingActualRevenue,
    actualEbitda,
    actualEbitdaMonths: actualEbitdaComplete ? elapsedMonths.length : 0,
    actualEbitdaRequiredMonths: elapsedMonths.length,
    productActualRevenue,
    channelActualRevenue,
    concentration: {
      afgriOfAllocatedChannels: channelShare("channel-1"), directOfAllocatedChannels: channelShare("channel-2"),
      solarOfAllocatedProducts: productShare(/^Solar\b/i), atlasOfAllocatedProducts: productShare(/^Atlas\b/i),
    },
    productRevenueReconciliation: accountingActualMonths.length ? accountingActualRevenue - productActualRevenue : null,
    channelRevenueReconciliation: accountingActualMonths.length ? accountingActualRevenue - channelActualRevenue : null,
    next90Target, pipelineCoverage, pipelineStatus,
  }
}
