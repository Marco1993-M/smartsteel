import assert from "node:assert/strict"
import { deriveAnnualPlanTargets, emptyAnnualPlan, normalizeAnnualPlan, summarizeAnnualPlan } from "../src/lib/annualPlan.mjs"
import { buildAnnualPlanHtml } from "../src/lib/annualPlanPdf.mjs"

const asOf = new Date("2027-03-15T12:00:00+02:00")
const plan = emptyAnnualPlan(2027)
plan.months = plan.months.map(() => ({ targetJobs: 4, targetSellingPrice: 25 }))
plan.months[0].actualRevenue = 110
plan.months[0].actualGrossProfit = -5
plan.months[1].actualRevenue = 0
plan.months[2].actualRevenue = 50 // Current-month entry is an actual, but projection remains at target until month close.
plan.months[0].workingCapital = -20
plan.months[11].workingCapital = 999 // Future-month snapshots cannot become current working capital.
const report = summarizeAnnualPlan(plan, [{ count: 2 }], asOf)
assert.equal(report.actualRevenue, 160)
assert.equal(report.actualRevenueMonths, 3)
assert.equal(report.projectedRevenue, 1110)
assert.equal(report.projectedGrossProfit, 435)
assert.equal(report.targetRevenue, 1200)
assert.equal(report.months[0].targetGrossProfit, 40)
assert.equal(report.workingCapital, -20)
assert.equal(report.actualJobs, 2)

const empty = summarizeAnnualPlan(emptyAnnualPlan(2027), [], asOf)
assert.equal(empty.actualRevenueMonths, 0)
assert.equal(empty.projectionMonths, 0)
assert.equal(empty.workingCapital, null)
assert.deepEqual(deriveAnnualPlanTargets({ targetJobs: 0, targetSellingPrice: 250000 }), { targetRevenue: 0, targetGrossProfit: 0 })
assert.deepEqual(deriveAnnualPlanTargets({ targetJobs: 4 }), { targetRevenue: null, targetGrossProfit: null })

const normalized = normalizeAnnualPlan({ months: plan.months, turnoverGoal: "1200", notes: "<private>" }, 2027)
assert.equal(normalized.turnoverGoal, 1200)
assert.equal(normalized.months[0].actualGrossProfit, -5)
assert.equal(normalized.months[0].targetRevenue, 100)
assert.equal(normalized.months[0].targetGrossProfit, 40)
assert.equal(normalized.assumptions.keyAssumptions, "<private>")
assert.equal(normalized.assumptions.risks, "")
const html = buildAnnualPlanHtml({ plan: normalized, previousPlan: emptyAnnualPlan(2026), asOf, unsaved: true })
assert.match(html, /Draft snapshot · unsaved changes/)
assert.match(html, /&lt;private&gt;/)
assert.doesNotMatch(html, /<private>/)
assert.match(html, /Key assumptions/)
const structured = normalizeAnnualPlan({ months: plan.months, notes: "legacy", assumptions: { keyAssumptions: "", marketOpportunity: "Regional warehouse demand", growthStrategy: "Agrimark distribution", risks: "Delayed approvals", capacityLimits: "Two crews", investments: "New press", fundingNeeds: "Afgri bridge financing", milestones: "Pilot in Q1" } }, 2027)
assert.equal(structured.assumptions.keyAssumptions, "")
assert.equal(structured.assumptions.fundingNeeds, "Afgri bridge financing")
const structuredHtml = buildAnnualPlanHtml({ plan: structured, previousPlan: emptyAnnualPlan(2026), asOf })
assert.match(structuredHtml, /Afgri bridge financing/)
assert.match(structuredHtml, /Capacity limits/)
assert.match(structuredHtml, /Market opportunity/)
assert.match(structuredHtml, /Growth strategy &amp; partnerships/)
assert.match(structuredHtml, /Milestones &amp; evidence/)
assert.match(structuredHtml, /2 \/ 2/)
assert.equal((structuredHtml.match(/class="page context-page"/g) || []).length, 1)
const futureHtml = buildAnnualPlanHtml({ plan: structured, previousPlan: emptyAnnualPlan(2026), asOf: new Date("2026-10-09T12:00:00+02:00") })
assert.match(futureHtml, /<th>Planned orders<\/th>/)
assert.doesNotMatch(futureHtml, /<th>Jobs sold<\/th>/)
assert.doesNotMatch(structuredHtml, /legacy/)

console.log("Annual plan calculation and export checks passed.")
