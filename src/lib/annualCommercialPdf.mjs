import { normalizeCommercialModel, summarizeCommercialModel } from "./annualCommercialPlan.mjs"

const money = (value) => value == null ? "—" : `R ${Math.round(Number(value)).toLocaleString("en-ZA")}`
const pct = (value) => value == null ? "—" : `${(value * 100).toFixed(1)}%`
const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character])
const chunks = (items, size) => Array.from({ length: Math.ceil(items.length / size) }, (_, index) => items.slice(index * size, (index + 1) * size))
export function buildCommercialPdfSections(plan, asOf) {
  const model = normalizeCommercialModel(plan.commercialModel)
  const report = summarizeCommercialModel(model, plan, asOf)
  const sections = []
  const futurePlan = plan.year > Number(new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Johannesburg", year: "numeric" }).format(asOf))
  const revenueProductIds = new Set(model.products.filter((item) => item.includeInPlanRevenue !== false).map((item) => item.id))
  const hasProducts = model.productPlans.some((row) => revenueProductIds.has(row.productId) && row.units != null && row.price != null && row.directCost != null) || model.productActuals.some((row) => row.revenue != null)
  if (hasProducts) {
    const productRows = report.products.filter((item) => item.includeInPlanRevenue !== false && (item.scenarios.base.complete || item.scenarios.management.complete || item.scenarios.stretch.complete || item.actual.hasData))
    for (const [index, products] of chunks(productRows, 13).entries()) {
      sections.push({
        eyebrow: "REVENUE PLAN & PRODUCT MIX",
        title: index ? "Product mix continued" : "Where revenue & GP come from",
        body: `${index === 0 ? `<div class="commercial-cards"><div><small>Base case</small><strong>${money(report.scenarios.base.modelled ? report.scenarios.base.revenue : null)}</strong></div><div><small>Management product plan</small><strong>${money(report.scenarios.management.modelled ? report.scenarios.management.revenue : null)}</strong></div><div><small>Stretch case</small><strong>${money(report.scenarios.stretch.modelled ? report.scenarios.stretch.revenue : null)}</strong></div><div><small>Management objective gap</small><strong>${money(report.unassignedProductTarget)}</strong></div></div>` : ""}<table class="commercial-table"><thead><tr><th>Product</th><th>Plan units</th><th>Plan revenue</th><th>Plan GP</th><th>Plan GP%</th>${futurePlan ? "" : "<th>Actual units</th><th>Actual revenue</th><th>Actual GP</th>"}</tr></thead><tbody>${products.map((item) => `<tr><th>${esc(item.name)}</th><td>${item.scenarios.management.complete ? item.scenarios.management.units : "—"}</td><td>${item.scenarios.management.complete ? money(item.scenarios.management.revenue) : "—"}</td><td>${item.scenarios.management.complete ? money(item.scenarios.management.gp) : "—"}</td><td>${pct(item.scenarios.management.margin)}</td>${futurePlan ? "" : `<td>${item.actual.hasData ? item.actual.units : "—"}</td><td>${item.actual.hasData ? money(item.actual.revenue) : "—"}</td><td>${money(item.actual.gp)}</td>`}</tr>`).join("")}</tbody></table><p class="commercial-note">${futurePlan ? "Supply-only planning values; no future order is treated as booked revenue. Prices and direct costs require validation against actual jobs." : "Product actuals are management allocations and require reconciliation to accounting actuals. Blank GP means direct costs are incomplete."}</p>`,
      })
    }
  }
  const hasFunnel = model.funnel.some((entry) => Object.values(entry).some((value) => value != null)) || model.opportunities.length || model.backlog.length
  if (hasFunnel) {
    const funnelRows = model.funnel.map((row, index) => ({ ...row, label: new Date(plan.year, index, 1).toLocaleString("en", { month: "short" }) })).filter((row) => ["leads", "qualified", "quotes", "quotedValue", "negotiations", "won", "wonValue", "salesCycleDays"].some((key) => row[key] != null))
    sections.push({
      eyebrow: "SALES FUNNEL & PIPELINE",
      title: "Forward commercial visibility",
      body: `<div class="commercial-cards"><div><small>Open pipeline</small><strong>${money(report.pipelineValue)}</strong></div><div><small>Probability-weighted</small><strong>${money(report.weightedPipeline)}</strong></div><div><small>Qualified pipeline</small><strong>${money(report.qualifiedPipeline)}</strong></div><div><small>Next 90-day coverage</small><strong>${report.pipelineCoverage == null ? "Insufficient data" : `${report.pipelineCoverage.toFixed(1)}×`}</strong></div></div>${funnelRows.length ? `<table class="commercial-table"><thead><tr><th>Month</th><th>Leads</th><th>Qualified</th><th>Quotes</th><th>Quoted value</th><th>Won</th><th>Won value</th><th>Count conversion</th></tr></thead><tbody>${funnelRows.map((row) => `<tr><th>${row.label}</th><td>${row.leads ?? "—"}</td><td>${row.qualified ?? "—"}</td><td>${row.quotes ?? "—"}</td><td>${money(row.quotedValue)}</td><td>${row.won ?? "—"}</td><td>${money(row.wonValue)}</td><td>${pct(row.leads > 0 && row.won != null ? row.won / row.leads : null)}</td></tr>`).join("")}</tbody></table>` : `<p class="commercial-note">Monthly funnel stage counts have not yet been entered.</p>`}<p class="commercial-note">Pipeline and won orders are not recognised accounting revenue. Funnel figures are management-entered until reconciled to CRM stage data.</p>`,
    })
    if (model.backlog.length) sections.push({
      eyebrow: "COMMITTED ORDER BOOK",
      title: "Backlog awaiting recognition",
      body: `<div class="commercial-cards"><div><small>Remaining committed value</small><strong>${money(report.backlogValue)}</strong></div><div><small>Recorded orders</small><strong>${report.backlog.length}</strong></div></div><table class="commercial-table"><thead><tr><th>Customer / project</th><th>Order value</th><th>Recognised</th><th>Remaining</th><th>Expected GP</th><th>Delivery month</th></tr></thead><tbody>${report.backlog.slice(0, 18).map((item) => `<tr><th>${esc(item.name)}</th><td>${money(item.orderValue)}</td><td>${money(item.recognizedRevenue)}</td><td>${money(item.remaining)}</td><td>${money(item.expectedGp)}</td><td>${item.deliveryMonth + 1}</td></tr>`).join("")}</tbody></table><p class="commercial-note">Backlog is management-entered and should be checked against accepted sales orders, invoices and recognition dates. ${report.backlog.length > 18 ? "Additional rows remain in the OS." : ""}</p>`,
    })
  }
  const hasChannels = model.channelTargets.some((row) => row.revenue != null) || model.channelActuals.some((row) => row.revenue != null)
  if (hasChannels) {
    const channels = report.channels.filter((item) => Object.values(item.targets).some((value) => value > 0) || item.actual > 0)
    for (const [index, group] of chunks(channels, 18).entries()) sections.push({
      eyebrow: "GROWTH DRIVERS & CHANNELS",
      title: index ? "Revenue bridge continued" : "How the target is intended to be won",
      body: `${index === 0 ? `<div class="commercial-cards"><div><small>Management objective</small><strong>${money(report.managementTarget)}</strong></div><div><small>Assigned to channels</small><strong>${money(report.channelAssigned)}</strong></div><div><small>Unassigned target</small><strong>${money(report.unassignedChannelTarget)}</strong></div></div>` : ""}<table class="commercial-table"><thead><tr><th>Growth driver</th><th>Base target</th><th>Management target</th><th>Stretch target</th>${futurePlan ? "" : "<th>Actual allocation</th><th>Weighted open</th><th>Backlog</th><th>Management variance</th>"}</tr></thead><tbody>${group.map((item) => `<tr><th>${esc(item.name)}</th><td>${money(item.targets.base)}</td><td>${money(item.targets.management)}</td><td>${money(item.targets.stretch)}</td>${futurePlan ? "" : `<td>${money(item.actual)}</td><td>${money(item.weightedPipeline)}</td><td>${money(item.backlogRemaining)}</td><td>${money(item.actual != null && item.targets.management != null ? item.actual - item.targets.management : null)}</td>`}</tr>`).join("")}</tbody></table><p class="commercial-note">${futurePlan ? "Channel values are unconfirmed supply-sales prospects, not booked orders. Direct Smart Steel sales include the 3D Builder." : "Channel actuals are management allocations. Their sum must reconcile to accounting revenue before external use."}</p>`,
    })
  }
  if (report.scenarios.management.modelled) {
    const rows = [["Base case", report.scenarios.base], ["Management target", report.scenarios.management], ["Stretch / growth", report.scenarios.stretch]]
    const low = model.valuation?.lowMultiple
    const high = model.valuation?.highMultiple
    sections.push({
      eyebrow: "EARNINGS & VALUATION",
      title: "EBITDA and indicative enterprise value",
      body: `<div class="commercial-cards"><div><small>Management GP</small><strong>${money(report.scenarios.management.gp)}</strong></div><div><small>Annual operating expenses</small><strong>${money(report.scenarios.management.operatingExpenses)}</strong></div><div><small>EBITDA proxy</small><strong>${money(report.scenarios.management.ebitda)}</strong></div><div><small>Selected EV / EBITDA range</small><strong>${low != null && high != null && high >= low ? `${low.toFixed(1)}×–${high.toFixed(1)}×` : "Not entered"}</strong></div></div><table class="commercial-table"><thead><tr><th>Scenario</th><th>Revenue</th><th>Gross profit</th><th>EBITDA proxy</th><th>EBITDA margin</th><th>EV · low</th><th>EV · high</th></tr></thead><tbody>${rows.map(([name, item]) => `<tr><th>${name}</th><td>${money(item.revenue)}</td><td>${money(item.gp)}</td><td>${money(item.ebitda)}</td><td>${pct(item.ebitdaMargin)}</td><td>${money(item.enterpriseValueLow)}</td><td>${money(item.enterpriseValueHigh)}</td></tr>`).join("")}</tbody></table><p class="commercial-note">${futurePlan ? "" : `Actual EBITDA proxy to date: ${money(report.actualEbitda)} (${report.actualEbitdaMonths}/${report.actualEbitdaRequiredMonths} elapsed months fully entered). `}Planning EBITDA proxy = product gross profit less the 12-month operating-expense budget. Salary, insurance and other fixed-expense inputs must exclude depreciation, amortisation, interest and tax. Confirm against financial statements before external use.</p><p class="commercial-note">EV is an illustrative operating-business value (EBITDA proxy × selected multiple), not equity value, an appraisal or an offer. It requires a positive EBITDA proxy and an entered multiple range. ${model.valuation?.rationale ? `Multiple rationale: ${esc(model.valuation.rationale)}.` : "No multiple rationale entered."}</p>`,
    })
  }
  if (report.funding.scheduledSupply != null) {
    sections.push({
      eyebrow: "AFGRI WORKING CAPITAL",
      title: "Indicative supply-cost bridge",
      body: `<div class="commercial-cards"><div><small>Scheduled supply revenue</small><strong>${money(report.funding.scheduledSupply)}</strong></div><div><small>Cost share</small><strong>${pct(report.funding.costRatio)}</strong></div><div><small>${report.funding.daysLow}-day peak · even pace</small><strong>${money(report.funding.bridgeLow)}</strong></div><div><small>${report.funding.daysHigh}-day peak · even pace</small><strong>${money(report.funding.bridgeHigh)}</strong></div></div><table class="commercial-table"><thead><tr><th>Month</th>${Array.from({ length: 12 }, (_, index) => `<th>${new Date(plan.year, index, 1).toLocaleString("en", { month: "short" })}</th>`).join("")}</tr></thead><tbody><tr><th>Supply revenue · R</th>${model.funding.afgriMonthlySupply.map((value) => `<td>${money(value)}</td>`).join("")}</tr></tbody></table><p class="commercial-note">Largest single-job cost floor: ${money(report.funding.singleOrderFloor)}. This model spreads each month's material cost evenly across its calendar days and measures the maximum cost paid but uncollected within the selected 21–28 day windows. There are no confirmed Afgri jobs in this schedule. Actual funding needs depend on order clustering, deposits, supplier terms, installation cash costs, VAT and customer payment timing.</p>`,
    })
  }
  if (report.cashFlow.management.even?.monthly) {
    const terms = model.cashFlow
    const scenarioRows = [["Base case", report.cashFlow.base], ["Management target", report.cashFlow.management], ["Stretch / growth", report.cashFlow.stretch]]
    sections.push({
      eyebrow: "CASH FLOW & WORKING CAPITAL",
      title: "Supply-order funding forecast",
      body: `<div class="commercial-cards"><div><small>Customer deposit</small><strong>${pct(terms.customerDepositRate)}</strong></div><div><small>Balance collection</small><strong>${terms.customerBalanceDays} days</strong></div><div><small>Supply cost upfront</small><strong>${pct(terms.supplierUpfrontRate)}</strong></div><div><small>Opening cash</small><strong>${money(terms.openingCash)}</strong></div></div><table class="commercial-table"><thead><tr><th>Scenario</th><th>Supply sales</th><th>Even-pace peak need</th><th>Month-end cluster peak</th><th>Additional funding after opening cash</th><th>Year-end cash</th></tr></thead><tbody>${scenarioRows.map(([name, item]) => `<tr><th>${name}</th><td>${money(item.even?.supplyRevenue)}</td><td>${money(item.even?.peakFundingBeforeOpeningCash)}</td><td>${money(item.clustered?.peakFundingBeforeOpeningCash)}</td><td>${money(item.clustered?.additionalFundingAfterOpeningCash)}</td><td>${money(item.clustered?.yearEndCash)}</td></tr>`).join("")}</tbody></table><p class="commercial-note">The cluster case places every month's planned orders on its final day; the even-pace case distributes them across that month. Clustering is a timing comparison, not a guaranteed worst case. Supplier balance is due ${terms.supplierBalanceDays} day(s) after order. Fixed expenses are paid at month-end. This is a planning model, not a project-level cash schedule. VAT, delivery, third-party installation, financing charges and taxes are excluded. Replace assumed terms with signed order and supplier terms before using these figures externally.</p>`,
    })
  }
  return sections
}
