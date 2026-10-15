const round = (value) => Math.round(value * 100) / 100
const sum = (values) => values.reduce((total, value) => total + (Number(value) || 0), 0)

export const DEFAULT_CASH_FLOW = {
  openingCash: null,
  customerDepositRate: 0,
  customerBalanceDays: 28,
  supplierUpfrontRate: 1,
  supplierBalanceDays: 0,
  productTerms: [],
}

export function normalizeCashFlow(value) {
  const source = value && typeof value === "object" && !Array.isArray(value) ? value : {}
  const rate = (key) => Number.isFinite(Number(source[key])) && Number(source[key]) >= 0 && Number(source[key]) <= 1 ? Number(source[key]) : DEFAULT_CASH_FLOW[key]
  const days = (key) => Number.isInteger(Number(source[key])) && Number(source[key]) >= 0 && Number(source[key]) <= 180 ? Number(source[key]) : DEFAULT_CASH_FLOW[key]
  const cash = source.openingCash === "" || source.openingCash == null ? null : Number(source.openingCash)
  return {
    openingCash: Number.isFinite(cash) && Math.abs(cash) <= 1e12 ? cash : null,
    customerDepositRate: rate("customerDepositRate"),
    customerBalanceDays: days("customerBalanceDays"),
    supplierUpfrontRate: rate("supplierUpfrontRate"),
    supplierBalanceDays: days("supplierBalanceDays"),
    productTerms: Array.isArray(source.productTerms) ? source.productTerms.slice(0, 40).map((item) => ({
      productId: String(item.productId || "").slice(0, 64),
      customerDepositRate: item.customerDepositRate != null && item.customerDepositRate !== "" && Number.isFinite(Number(item.customerDepositRate)) && Number(item.customerDepositRate) >= 0 && Number(item.customerDepositRate) <= 1 ? Number(item.customerDepositRate) : rate("customerDepositRate"),
      customerBalanceDays: item.customerBalanceDays != null && item.customerBalanceDays !== "" && Number.isInteger(Number(item.customerBalanceDays)) && Number(item.customerBalanceDays) >= 0 && Number(item.customerBalanceDays) <= 180 ? Number(item.customerBalanceDays) : days("customerBalanceDays"),
      supplierUpfrontRate: item.supplierUpfrontRate != null && item.supplierUpfrontRate !== "" && Number.isFinite(Number(item.supplierUpfrontRate)) && Number(item.supplierUpfrontRate) >= 0 && Number(item.supplierUpfrontRate) <= 1 ? Number(item.supplierUpfrontRate) : rate("supplierUpfrontRate"),
      supplierBalanceDays: item.supplierBalanceDays != null && item.supplierBalanceDays !== "" && Number.isInteger(Number(item.supplierBalanceDays)) && Number(item.supplierBalanceDays) >= 0 && Number(item.supplierBalanceDays) <= 180 ? Number(item.supplierBalanceDays) : days("supplierBalanceDays"),
    })).filter((item) => item.productId) : [],
  }
}

export function forecastAnnualCashFlow(model, plan, scenario, timing = "even") {
  const terms = normalizeCashFlow(model.cashFlow)
  const allowed = new Set(model.products.filter((item) => item.includeInPlanRevenue !== false && item.id !== "product-7").map((item) => item.id))
  const rows = model.productPlans.filter((item) => item.scenario === scenario && allowed.has(item.productId) && item.units != null && item.price != null && item.directCost != null && item.units > 0)
  if (!rows.length) return null
  const start = Date.UTC(plan.year, 0, 1)
  const end = Date.UTC(plan.year + 1, 0, 1)
  const horizon = end + 181 * 86400000
  const events = new Map()
  const add = (date, field, amount) => {
    const day = Math.floor((date - start) / 86400000)
    if (!events.has(day)) events.set(day, { receipts: 0, supplyCosts: 0, fixedCosts: 0 })
    events.get(day)[field] += amount
  }
  for (const row of rows) {
    const rowTerms = terms.productTerms.find((item) => item.productId === row.productId) || terms
    const first = Date.UTC(plan.year, row.month, 1)
    const daysInMonth = new Date(Date.UTC(plan.year, row.month + 1, 0)).getUTCDate()
    for (let unit = 0; unit < row.units; unit++) {
      const dayOffset = timing === "clustered" ? daysInMonth - 1 : Math.floor((unit + 0.5) * daysInMonth / row.units)
      const date = first + dayOffset * 86400000
      add(date, "receipts", row.price * rowTerms.customerDepositRate)
      add(date + rowTerms.customerBalanceDays * 86400000, "receipts", row.price * (1 - rowTerms.customerDepositRate))
      add(date, "supplyCosts", row.directCost * rowTerms.supplierUpfrontRate)
      add(date + rowTerms.supplierBalanceDays * 86400000, "supplyCosts", row.directCost * (1 - rowTerms.supplierUpfrontRate))
    }
  }
  for (let month = 0; month < 12; month++) {
    const entry = plan.months[month] || {}
    if ([entry.salaries, entry.insurance, entry.otherFixedExpenses].some((value) => value == null)) return { incompleteExpenses: true }
    const lastDay = Date.UTC(plan.year, month + 1, 0)
    add(lastDay, "fixedCosts", sum([entry.salaries, entry.insurance, entry.otherFixedExpenses]))
  }
  const monthly = Array.from({ length: 12 }, () => ({ receipts: 0, supplyCosts: 0, fixedCosts: 0, net: 0, closing: null }))
  let cumulative = 0
  let trough = 0
  let peakDate = null
  let yearEnd = null
  for (let date = start; date < horizon; date += 86400000) {
    const day = Math.floor((date - start) / 86400000)
    const event = events.get(day)
    if (event) {
      cumulative += event.receipts - event.supplyCosts - event.fixedCosts
      if (date < end) {
        const month = new Date(date).getUTCMonth()
        for (const field of ["receipts", "supplyCosts", "fixedCosts"]) monthly[month][field] += event[field]
      }
    }
    if (cumulative < trough) { trough = cumulative; peakDate = new Date(date).toISOString().slice(0, 10) }
    if (date < end && new Date(date + 86400000).getUTCMonth() !== new Date(date).getUTCMonth()) {
      const month = new Date(date).getUTCMonth()
      monthly[month].net = round(monthly[month].receipts - monthly[month].supplyCosts - monthly[month].fixedCosts)
      monthly[month].closing = round((terms.openingCash || 0) + cumulative)
      if (month === 11) yearEnd = cumulative
    }
  }
  return {
    timing, monthly,
    supplyRevenue: round(sum(rows.map((row) => row.units * row.price))),
    directCost: round(sum(rows.map((row) => row.units * row.directCost))),
    peakFundingBeforeOpeningCash: round(-trough),
    additionalFundingAfterOpeningCash: terms.openingCash == null ? null : round(Math.max(0, -trough - terms.openingCash)),
    peakDate,
    yearEndCashBeforeOpeningCash: round(yearEnd),
    yearEndCash: terms.openingCash == null ? null : round(terms.openingCash + yearEnd),
    closingReceivables: round(sum([...events].filter(([day]) => start + day * 86400000 >= end).map(([, event]) => event.receipts))),
  }
}
