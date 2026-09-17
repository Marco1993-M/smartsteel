// The caller supplies the same lead-created cohort and spend period used by Analytics.
export function buildCommercialEfficiency(leads, acquisitionCost) {
  const won = leads.filter((lead) => String(lead.status || "").toLowerCase() === "won")
  const wonValue = won.reduce((sum, lead) => {
    const value = Number(lead.quote_value)
    return sum + (Number.isFinite(value) ? value : 0)
  }, 0)
  const grossMarginRate = 0.3
  const lifetimeProjectsPerCustomer = 1
  const averageWonValue = won.length ? wonValue / won.length : 0
  const contributionLtv = averageWonValue * grossMarginRate * lifetimeProjectsPerCustomer
  const cost = Number(acquisitionCost)
  const hasSpend = Number.isFinite(cost) && cost > 0
  const cac = hasSpend && won.length ? cost / won.length : null
  const ready = contributionLtv > 0 && cac > 0
  const round = (value) => Math.round(value * 100) / 100

  return {
    ready,
    averageWonValue: round(averageWonValue),
    grossMarginRate,
    lifetimeProjectsPerCustomer,
    contributionLtv: round(contributionLtv),
    acquisitionCost: hasSpend ? round(cost) : null,
    wonCustomers: won.length,
    wonValue: round(wonValue),
    cac: cac === null ? null : round(cac),
    ltvCacRatio: ready ? round(contributionLtv / cac) : null,
    basis: "All won leads created in the selected period are included, across paid, organic, referral, and uncategorised sources. Each won lead is treated as one customer. Estimated LTV uses average won value × 30% assumed margin × 1 lifetime project. Blended CAC divides recorded acquisition spend by all these wins.",
    costCoverage: "Only Google Ads spend is currently recorded. Sales salaries, SEO, content, referral fees, and other acquisition costs are excluded, so this is a partial-cost estimate.",
    blocker: !won.length
      ? "No won leads in this period. Leads contribute to this ratio once won."
      : contributionLtv <= 0
        ? "Won leads need a positive quote value to calculate contribution LTV."
        : !hasSpend
          ? "No positive acquisition spend is recorded for this period. All-source won value is included, but CAC and the ratio remain pending."
          : "",
  }
}
