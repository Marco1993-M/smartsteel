// Display formatting only: retain full precision in stored quantities and totals.
export function compactEstimateNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) ? Number(number.toFixed(2)) : 0
}
export function cleanSolarCarportLineLabel(value) {
  return String(value ?? '').replace(/\s*(?:\(provisional\)|[·-]\s*provisional)\s*$/i, '').trim()
}
export function solarCarportQuoteMoney(value) {
  return `R ${Number(value || 0).toLocaleString('en-ZA', {minimumFractionDigits:2,maximumFractionDigits:2})}`
}
