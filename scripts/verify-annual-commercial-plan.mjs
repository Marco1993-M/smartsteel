import assert from "node:assert/strict"
import { emptyAnnualPlan, summarizeAnnualPlan } from "../src/lib/annualPlan.mjs"
import { emptyCommercialModel, estimateBridgeExposure, normalizeCommercialModel, summarizeCommercialModel } from "../src/lib/annualCommercialPlan.mjs"
import { buildAnnualPlanHtml } from "../src/lib/annualPlanPdf.mjs"
import { forecastAnnualCashFlow } from "../src/lib/annualCashFlow.mjs"

const model = emptyCommercialModel()
assert.equal(model.channels.some((channel) => channel.id === "channel-3"), false)
assert.match(model.channels.find((channel) => channel.id === "channel-2").name, /3D Builder/)
const plan = { ...emptyAnnualPlan(2027), turnoverGoal: 15000000, commercialModel: model }
plan.months[0] = { targetRevenue: 3000000, managementForecast: 3400000 }
model.productPlans = [
  { productId: "product-1", scenario: "management", month: 0, units: 2, price: 500000, directCost: 300000 },
  { productId: "product-2", scenario: "management", month: 0, units: 1, price: 1000000, directCost: null },
]
model.productActuals = [{ productId: "product-1", month: 0, units: 1, revenue: 500000, directCost: null }]
model.channelTargets = [{ channelId: "channel-1", scenario: "management", revenue: 4000000 }]
model.opportunities = [
  { id: "a", name: "Afgri branch", productId: "product-1", channelId: "channel-1", stage: "qualified", value: 9000000, probability: 0.5, expectedCloseMonth: 0 },
  { id: "later", name: "Later project", productId: "product-1", channelId: "channel-1", stage: "qualified", value: 1000000, probability: 0.5, expectedCloseMonth: 9 },
  { id: "b", name: "Signed job", productId: "product-1", channelId: "channel-1", stage: "committed", value: 200000, probability: 1, expectedCloseMonth: 0 },
]
model.backlog = [{ id: "c", name: "Committed job", productId: "product-1", channelId: "channel-1", orderValue: 500000, recognizedRevenue: 100000, expectedGp: 200000, deliveryMonth: 1 }]
const report = summarizeCommercialModel(model, plan, new Date("2026-10-07T12:00:00+02:00"))
assert.equal(report.scenarios.management.revenue, 1000000)
assert.equal(report.scenarios.management.gp, 400000)
assert.equal(report.scenarios.management.units, 2)
assert.equal(report.installationCoverage.management.structureUnits, 2)
assert.equal(report.installationCoverage.management.desiredUnits, 1)
assert.equal(report.products[0].actual.gp, null)
assert.equal(report.unassignedProductTarget, 14000000)
assert.equal(report.unassignedChannelTarget, 11000000)
assert.equal(report.pipelineValue, 10000000)
assert.equal(report.weightedPipeline, 5000000)
assert.equal(report.next90QualifiedPipeline, 9000000)
assert.equal(report.pipelineCoverage, 9)
assert.equal(report.backlogValue, 400000)
assert.equal(report.forecastRevenue, null)
assert.equal(report.objectiveGap, null)
assert.equal(report.scenarios.management.operatingProfit, null)
assert.equal(report.scenarios.management.ebitda, null)
assert.equal(report.scenarios.management.enterpriseValueLow, null)

const legacyInstallationModel = normalizeCommercialModel({ ...model, products: model.products.map(({ includeInPlanRevenue, ...item }) => item), productPlans: [...model.productPlans, { productId: "product-7", scenario: "management", month: 0, units: 2, price: 75000, directCost: 30000 }] })
const legacyInstallationReport = summarizeCommercialModel(legacyInstallationModel, plan, new Date("2026-10-07T12:00:00+02:00"))
assert.equal(legacyInstallationModel.products.find((item) => item.id === "product-7").includeInPlanRevenue, false)
assert.equal(legacyInstallationReport.scenarios.management.revenue, 1000000)
assert.equal(legacyInstallationReport.scenarios.management.gp, 400000)
assert.equal(legacyInstallationReport.scenarios.management.units, 2)
assert.equal(legacyInstallationReport.installationCoverage.management.desiredUnits, 1)
const cashPlan = { ...emptyAnnualPlan(2027), months: Array.from({ length: 12 }, () => ({ salaries: 0, insurance: 0, otherFixedExpenses: 0 })) }
const cashModel = normalizeCommercialModel({ ...model, productPlans: [
  { productId: "product-1", scenario: "management", month: 0, units: 2, price: 100, directCost: 60 },
  { productId: "product-7", scenario: "management", month: 0, units: 2, price: 75, directCost: 30 },
], cashFlow: { openingCash: 20, customerDepositRate: 0, customerBalanceDays: 28, supplierUpfrontRate: 1, supplierBalanceDays: 0 } })
const evenCash = forecastAnnualCashFlow(cashModel, cashPlan, "management", "even")
const clusteredCash = forecastAnnualCashFlow(cashModel, cashPlan, "management", "clustered")
assert.equal(evenCash.supplyRevenue, 200)
assert.equal(evenCash.directCost, 120)
assert.equal(evenCash.peakFundingBeforeOpeningCash, 120)
assert.equal(clusteredCash.peakFundingBeforeOpeningCash, 120)
assert.equal(clusteredCash.additionalFundingAfterOpeningCash, 100)
assert.equal(clusteredCash.monthly[0].receipts, 0)
assert.equal(clusteredCash.monthly[0].supplyCosts, 120)
assert.equal(clusteredCash.monthly[0].net, -120)
assert.equal(summarizeCommercialModel(cashModel, cashPlan, new Date("2026-10-07T12:00:00+02:00")).scenarios.management.workingCapitalRequirement, 120)
assert.equal(forecastAnnualCashFlow({ ...cashModel, cashFlow: { ...cashModel.cashFlow, customerDepositRate: 0.5 } }, cashPlan, "management", "clustered").peakFundingBeforeOpeningCash, 20)
const productOverride = normalizeCommercialModel({ ...cashModel, cashFlow: { ...cashModel.cashFlow, productTerms: [{ productId: "product-1", customerDepositRate: 0.5, customerBalanceDays: 28, supplierUpfrontRate: 1, supplierBalanceDays: 0 }] } })
assert.equal(forecastAnnualCashFlow(productOverride, cashPlan, "management", "clustered").peakFundingBeforeOpeningCash, 20)

const valuationPlan = { ...plan, months: Array.from({ length: 12 }, () => ({ salaries: 10000, insurance: 1000, otherFixedExpenses: 2000 })) }
const valuationModel = { ...model, valuation: { lowMultiple: 3, highMultiple: 5, rationale: "Illustrative test range" } }
const valuation = summarizeCommercialModel(valuationModel, valuationPlan, new Date("2026-10-07T12:00:00+02:00"))
assert.equal(valuation.scenarios.management.ebitda, 244000)
assert.equal(valuation.scenarios.management.enterpriseValueLow, 732000)
assert.equal(valuation.scenarios.management.enterpriseValueHigh, 1220000)
assert.equal(valuation.breakEven.annualRevenue, 390000)
assert.equal(valuation.breakEven.monthlyRevenue, 32500)
assert.equal(normalizeCommercialModel(valuationModel).valuation.rationale, "Illustrative test range")
const actualPlan = { ...valuationPlan, months: valuationPlan.months.map((month, index) => index < 3 ? { ...month, actualGrossProfit: 20000 } : month) }
const actualReport = summarizeCommercialModel(valuationModel, actualPlan, new Date("2027-03-15T12:00:00+02:00"))
assert.equal(actualReport.actualEbitda, 21000)
assert.equal(actualReport.actualEbitdaMonths, 3)
assert.equal(estimateBridgeExposure([310000, ...Array(11).fill(0)], 2027, 0.6, 28), 168000)
assert.equal(estimateBridgeExposure([310000, ...Array(11).fill(null)], 2027, 0.6, 28), null)
const bridgeModel = normalizeCommercialModel({ ...valuationModel, funding: { costRatio: 0.6, daysLow: 21, daysHigh: 28, largestSupplyOrder: 450000, afgriMonthlySupply: [310000, ...Array(11).fill(0)] } })
const bridgeReport = summarizeCommercialModel(bridgeModel, valuationPlan, new Date("2026-10-07T12:00:00+02:00"))
assert.equal(bridgeReport.funding.singleOrderFloor, 270000)
assert.equal(bridgeReport.funding.bridgeHigh, 168000)

const projectedPlan = { ...plan, months: Array.from({ length: 12 }, () => ({ targetJobs: 1, targetSellingPrice: 283333.3333 })) }
const projected = summarizeCommercialModel(model, projectedPlan, new Date("2026-10-07T12:00:00+02:00"))
assert.equal(projected.forecastRevenue, null)
assert.equal(projected.gapBasis, "target-based planning projection")
assert.ok(Math.abs(projected.objectiveGap - 11600000) < 1)
const marginPlan = { ...projectedPlan, commercialModel: { ...model, grossMarginTarget: 0.35 } }
assert.equal(summarizeCommercialModel(model, marginPlan, new Date("2026-10-07T12:00:00+02:00")).planningProjection, projected.planningProjection)
assert.equal(summarizeAnnualPlan(marginPlan, [], new Date("2026-10-07T12:00:00+02:00")).months[0].targetGrossProfit, 99166.67)

const normalized = normalizeCommercialModel(model)
assert.equal(normalized.opportunities.length, 3)
const html = buildAnnualPlanHtml({ plan: { ...plan, commercialModel: normalized }, previousPlan: emptyAnnualPlan(2026), asOf: new Date("2026-10-07T12:00:00+02:00") })
assert.match(html, /REVENUE PLAN &amp; PRODUCT MIX|REVENUE PLAN & PRODUCT MIX/)
assert.match(html.replace(/\s/g, " "), /R 14 000 000/)
assert.match(html, /Backlog awaiting recognition/)
assert.match(html, /Planning values remain distinct from actuals/)
const valuationHtml = buildAnnualPlanHtml({ plan: { ...valuationPlan, commercialModel: valuationModel }, previousPlan: emptyAnnualPlan(2026), asOf: new Date("2026-10-07T12:00:00+02:00") })
assert.match(valuationHtml, /EBITDA and indicative enterprise value/)
assert.match(valuationHtml, /Illustrative test range/)
const bridgeHtml = buildAnnualPlanHtml({ plan: { ...valuationPlan, commercialModel: bridgeModel }, previousPlan: emptyAnnualPlan(2026), asOf: new Date("2026-10-07T12:00:00+02:00") })
assert.match(bridgeHtml, /Indicative supply-cost bridge/)
const executionModel = normalizeCommercialModel({ ...valuationModel, execution: {
  ...model.execution,
  owners: [{ id: "owner-1", name: "Management" }],
  initiatives: [{ id: "initiative-1", name: "Afgri launch", objective: "Pilot", ownerId: "owner-1", status: "on_track" }],
  milestones: [{ id: "milestone-1", quarter: 1, result: "First branch", deadline: "2026-01-01", status: "watch" }],
  risks: [{ id: "risk-1", name: "Bridge funding delay", probability: 4, impact: 5, status: "watch" }],
  capital: [{ id: "capital-1", purpose: "Bridge", required: 1000000, revenueEnabled: 4000000, gpEnabled: 1600000 }],
  forecastSnapshots: [{ savedAt: "2026-10-07T10:00:00Z", revision: 2, annualForecast: 12000000, monthly: Array(12).fill(1000000) }],
} })
const executionReport = summarizeCommercialModel(executionModel, valuationPlan, new Date("2026-10-07T12:00:00+02:00"))
assert.equal(executionReport.execution.overdueMilestones.length, 1)
assert.equal(executionReport.execution.highRisks.length, 1)
assert.equal(executionReport.execution.revenuePerCapital, 4)
const executionHtml = buildAnnualPlanHtml({ plan: { ...valuationPlan, commercialModel: executionModel }, previousPlan: emptyAnnualPlan(2026), asOf: new Date("2026-10-07T12:00:00+02:00") })
assert.match(executionHtml, /Capital required and what it enables/)
assert.match(executionHtml, /How the outlook changed/)
console.log("Annual commercial model checks passed.")
