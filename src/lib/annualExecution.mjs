const text = (value, length = 500) => String(value ?? "").trim().slice(0, length)
const amount = (value) => value === "" || value == null ? null : Number.isFinite(Number(value)) && Number(value) >= 0 && Number(value) <= 1e12 ? Number(value) : null
const date = (value) => /^\d{4}-\d{2}-\d{2}$/.test(String(value || "")) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) ? String(value) : ""
const status = (value) => ["not_started", "on_track", "watch", "off_track", "complete"].includes(value) ? value : "not_started"
const list = (value, limit, convert) => Array.isArray(value) ? value.slice(0, limit).map(convert).filter((item) => item.id) : []
const rating = (value) => Number.isInteger(Number(value)) && Number(value) >= 1 && Number(value) <= 5 ? Number(value) : null

export const EXECUTION_STATUSES = [
  ["not_started", "Not started"], ["on_track", "On track"], ["watch", "Watch"],
  ["off_track", "Off track"], ["complete", "Complete"],
]

export const DEFAULT_INITIATIVES = [
  "Afgri launch", "Atlas depot", "15m Atlas commercialisation", "20m Atlas development",
  "Solar market expansion", "Installation capacity", "3D Builder / digital sales",
].map((name, index) => ({ id: `initiative-${index + 1}`, name, objective: "", ownerId: "", targetDate: "", budget: null, actualSpend: null, revenueEnabled: null, gpEnabled: null, kpi: "", kpiTarget: null, kpiActual: null, status: "not_started", nextAction: "", risk: "", partnership: { enabled: index === 0 } }))

export const DEFAULT_MARKETS = ["Agriculture", "Commercial & industrial", "Solar infrastructure", "Dealer / distribution"]
  .map((name, index) => ({ id: `market-${index + 1}`, name, customer: "", problem: "", product: "", advantage: "", route: "", averageTicket: null, salesCycleDays: null, revenueTarget: null, priority: "", source: "" }))

export function emptyExecutionModel() {
  return {
    owners: [], initiatives: DEFAULT_INITIATIVES.map((item) => ({ ...item })), markets: DEFAULT_MARKETS.map((item) => ({ ...item })), assumptionEvidence: [], customerActuals: [],
    milestones: [], constraints: [], risks: [], capital: [],
    reviews: Array.from({ length: 12 }, (_, month) => ({ month, performance: "", variance: "", cause: "", action: "", ownerId: "", deadline: "", forecastImpact: "" })),
    thresholds: { revenueOnTrack: 1, revenueWatch: 0.9, highRiskScore: 15 },
    forecastSnapshots: [],
  }
}

export function normalizeExecutionModel(value) {
  const source = value && typeof value === "object" && !Array.isArray(value) ? value : {}
  const defaults = emptyExecutionModel()
  return {
    owners: list(source.owners, 40, (item) => ({ id: text(item.id, 64), name: text(item.name, 100), role: text(item.role, 100) })),
    initiatives: Array.isArray(source.initiatives) ? list(source.initiatives, 60, (item) => ({
      id: text(item.id, 64), name: text(item.name, 120), objective: text(item.objective), ownerId: text(item.ownerId, 64), targetDate: date(item.targetDate),
      budget: amount(item.budget), actualSpend: amount(item.actualSpend), revenueEnabled: amount(item.revenueEnabled), gpEnabled: amount(item.gpEnabled),
      kpi: text(item.kpi, 120), kpiTarget: amount(item.kpiTarget), kpiActual: amount(item.kpiActual), status: status(item.status),
      nextAction: text(item.nextAction), risk: text(item.risk),
      partnership: { enabled: Boolean(item.partnership?.enabled), launchDate: date(item.partnership?.launchDate), branchesTarget: amount(item.partnership?.branchesTarget),
        branchesActive: amount(item.partnership?.branchesActive), leads: amount(item.partnership?.leads), quotes: amount(item.partnership?.quotes),
        quotedValue: amount(item.partnership?.quotedValue), orders: amount(item.partnership?.orders), orderValue: amount(item.partnership?.orderValue),
        recognisedRevenue: amount(item.partnership?.recognisedRevenue), grossProfit: amount(item.partnership?.grossProfit),
        workingCapital: amount(item.partnership?.workingCapital) },
    })) : defaults.initiatives,
    markets: Array.isArray(source.markets) ? list(source.markets, 40, (item) => ({
      id: text(item.id, 64), name: text(item.name, 120), customer: text(item.customer), problem: text(item.problem), product: text(item.product),
      advantage: text(item.advantage), route: text(item.route), averageTicket: amount(item.averageTicket), salesCycleDays: amount(item.salesCycleDays),
      revenueTarget: amount(item.revenueTarget), priority: text(item.priority, 80), source: text(item.source),
    })) : defaults.markets,
    assumptionEvidence: list(source.assumptionEvidence, 100, (item) => ({
      id: text(item.id, 64), assumption: text(item.assumption), ownerId: text(item.ownerId, 64), rationale: text(item.rationale, 1000),
      evidence: text(item.evidence, 1000), enteredAt: date(item.enteredAt), reviewedAt: date(item.reviewedAt), nextReviewAt: date(item.nextReviewAt),
    })),
    customerActuals: list(source.customerActuals, 250, (item) => ({ id: text(item.id, 64), name: text(item.name, 160), revenue: amount(item.revenue) })),
    milestones: list(source.milestones, 100, (item) => ({
      id: text(item.id, 64), quarter: rating(item.quarter) && Number(item.quarter) <= 4 ? Number(item.quarter) : 1,
      result: text(item.result), ownerId: text(item.ownerId, 64), deadline: date(item.deadline), completedAt: date(item.completedAt), status: status(item.status), notes: text(item.notes),
    })),
    constraints: list(source.constraints, 60, (item) => ({
      id: text(item.id, 64), name: text(item.name, 120), currentCapacity: amount(item.currentCapacity), requiredCapacity: amount(item.requiredCapacity),
      unit: text(item.unit, 60), severity: ["low", "medium", "high"].includes(item.severity) ? item.severity : "medium", intervention: text(item.intervention),
      cost: amount(item.cost), ownerId: text(item.ownerId, 64), deadline: date(item.deadline), status: status(item.status),
    })),
    risks: list(source.risks, 100, (item) => ({
      id: text(item.id, 64), name: text(item.name, 160), category: text(item.category, 80), probability: rating(item.probability),
      impact: rating(item.impact), mitigation: text(item.mitigation), ownerId: text(item.ownerId, 64), status: status(item.status),
    })),
    capital: list(source.capital, 60, (item) => ({
      id: text(item.id, 64), purpose: text(item.purpose, 160), category: text(item.category, 80), required: amount(item.required),
      neededBy: date(item.neededBy), revenueEnabled: amount(item.revenueEnabled), gpEnabled: amount(item.gpEnabled),
      paybackMonths: amount(item.paybackMonths), ownerId: text(item.ownerId, 64), status: status(item.status), evidence: text(item.evidence),
    })),
    reviews: Array.from({ length: 12 }, (_, month) => {
      const item = Array.isArray(source.reviews) ? source.reviews.find((entry) => Number(entry.month) === month) || {} : {}
      return { month, performance: text(item.performance, 1500), variance: text(item.variance, 1500), cause: text(item.cause, 1500),
        action: text(item.action, 1500), ownerId: text(item.ownerId, 64), deadline: date(item.deadline), forecastImpact: text(item.forecastImpact, 1500) }
    }),
    forecastSnapshots: Array.isArray(source.forecastSnapshots) ? source.forecastSnapshots.slice(-60).map((item) => ({
      savedAt: text(item.savedAt, 40), revision: amount(item.revision), annualForecast: amount(item.annualForecast),
      monthly: Array.from({ length: 12 }, (_, month) => amount(item.monthly?.[month])),
    })).filter((item) => item.savedAt) : [],
    thresholds: {
      revenueOnTrack: amount(source.thresholds?.revenueOnTrack) ?? 1,
      revenueWatch: amount(source.thresholds?.revenueWatch) ?? 0.9,
      highRiskScore: amount(source.thresholds?.highRiskScore) ?? 15,
    },
  }
}

export function summarizeExecution(execution, asOf = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Johannesburg", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(asOf)
  const today = ["year", "month", "day"].map((part) => parts.find((item) => item.type === part)?.value).join("-")
  const active = execution.initiatives.filter((item) => item.objective || item.ownerId || item.targetDate || item.kpi || item.nextAction)
  const overdueMilestones = execution.milestones.filter((item) => item.deadline && item.deadline < today && item.status !== "complete")
  const openRisks = execution.risks.filter((item) => item.status !== "complete")
  const capitalRequired = execution.capital.some((item) => item.required != null) ? execution.capital.reduce((sum, item) => sum + (item.required || 0), 0) : null
  const capitalWithEvidence = execution.capital.filter((item) => item.required > 0 && item.revenueEnabled != null && item.gpEnabled != null)
  const evidenceCapital = capitalWithEvidence.reduce((sum, item) => sum + item.required, 0)
  const enabledRevenue = capitalWithEvidence.reduce((sum, item) => sum + item.revenueEnabled, 0)
  const enabledGp = capitalWithEvidence.reduce((sum, item) => sum + item.gpEnabled, 0)
  const customerRevenue = execution.customerActuals.filter((item) => item.revenue != null).sort((a, b) => b.revenue - a.revenue)
  const allocatedCustomerRevenue = customerRevenue.reduce((sum, item) => sum + item.revenue, 0)
  return {
    initiativesActive: active.length, initiativesOnTrack: active.filter((item) => ["on_track", "complete"].includes(item.status)).length,
    overdueMilestones, openRisks, highRisks: openRisks.filter((item) => (item.probability || 0) * (item.impact || 0) >= (execution.thresholds?.highRiskScore ?? 15)),
    capitalRequired, evidenceCapital, revenueEnabled: evidenceCapital ? enabledRevenue : null, gpEnabled: evidenceCapital ? enabledGp : null,
    revenuePerCapital: evidenceCapital ? enabledRevenue / evidenceCapital : null, gpPerCapital: evidenceCapital ? enabledGp / evidenceCapital : null,
    allocatedCustomerRevenue: customerRevenue.length ? allocatedCustomerRevenue : null,
    largestCustomerShare: allocatedCustomerRevenue > 0 ? customerRevenue[0].revenue / allocatedCustomerRevenue : null,
    topThreeCustomerShare: allocatedCustomerRevenue > 0 ? customerRevenue.slice(0, 3).reduce((sum, item) => sum + item.revenue, 0) / allocatedCustomerRevenue : null,
    latestReview: [...execution.reviews].reverse().find((item) => item.performance || item.variance || item.cause || item.action) || null,
  }
}
