const OFFSET = 2 * 60 * 60 * 1000
export function currentAnalyticsMonth(now = new Date()) {
  return new Date(now.getTime() + OFFSET).toISOString().slice(0, 7)
}
export function monthStart(month) {
  return new Date(`${month}-01T00:00:00+02:00`)
}
export function shiftMonth(month, count) {
  const [year, index] = month.split('-').map(Number)
  return new Date(Date.UTC(year, index - 1 + count, 1)).toISOString().slice(0, 7)
}
export function monthLabel(month) {
  return new Intl.DateTimeFormat('en-ZA', { month: 'long', year: 'numeric', timeZone: 'Africa/Johannesburg' }).format(monthStart(month))
}
export function buildAnalyticsPeriod(requestedMonth, now = new Date()) {
  const current = currentAnalyticsMonth(now)
  const month = requestedMonth || current
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month) || month < '2000-01' || month > current) throw new Error('Choose a calendar month between January 2000 and the current month.')
  const start = monthStart(month)
  const next = monthStart(shiftMonth(month, 1))
  const isCurrent = month === current
  const end = isCurrent ? now : next
  const previousMonth = shiftMonth(month, -1)
  const previousStart = monthStart(previousMonth)
  const localNow = new Date(now.getTime() + OFFSET)
  const previousEnd = isCurrent
    ? new Date(Math.min(start.getTime(), previousStart.getTime() + (localNow.getUTCDate() - 1) * 86400000 + localNow.getUTCHours() * 3600000 + localNow.getUTCMinutes() * 60000 + localNow.getUTCSeconds() * 1000 + localNow.getUTCMilliseconds()))
    : start
  const fmt = (date) => new Intl.DateTimeFormat('en-ZA', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Johannesburg' }).format(date)
  return {
    month, start: start.toISOString(), end: end.toISOString(), previousStart: previousStart.toISOString(), previousEnd: previousEnd.toISOString(),
    label: `${monthLabel(month)}${isCurrent ? ' · month to date' : ''}`, isCurrent,
    comparisonLabel: `${monthLabel(previousMonth)}${isCurrent ? ' · comparable month to date' : ' · full month'}`,
    comparisonDetail: isCurrent ? `Compared with ${fmt(previousStart)} to ${fmt(previousEnd)} SAST, capped at the end of the previous month when it is shorter.` : 'Full calendar month compared with the previous full calendar month. All boundaries use South African time.',
    asOf: now.toISOString(),
  }
}
