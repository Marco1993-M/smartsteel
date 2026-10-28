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

const DAY = 86400000
export function analyticsDateKey(value = new Date()) {
  return new Date(new Date(value).getTime() + OFFSET).toISOString().slice(0, 10)
}
export function shiftAnalyticsDay(day, count) {
  return new Date(Date.parse(`${day}T12:00:00Z`) + count * DAY).toISOString().slice(0, 10)
}
function validDay(day) {
  return /^\d{4}-\d{2}-\d{2}$/.test(day || '') && Number.isFinite(Date.parse(`${day}T00:00:00Z`)) && new Date(`${day}T00:00:00Z`).toISOString().slice(0, 10) === day
}
export function analyticsPeriodQuery(selection) {
  if (!selection.range || selection.range === 'month') return new URLSearchParams({month: selection.month || currentAnalyticsMonth()}).toString()
  const params = new URLSearchParams({range: selection.range})
  if (selection.range === 'custom') { params.set('from', selection.from || ''); params.set('to', selection.to || '') }
  return params.toString()
}
export function buildAnalyticsSelection(params, now = new Date()) {
  const range = params.get('range') || 'month'
  if (range === 'month') return {...buildAnalyticsPeriod(params.get('month'), now),kind:'month',range:'month'}
  const today = analyticsDateKey(now)
  let from, to = today
  if (range === 'last7') from = shiftAnalyticsDay(today, -6)
  else if (range === 'last30') from = shiftAnalyticsDay(today, -29)
  else if (range === 'last3months') {
    const previous = shiftMonth(today.slice(0,7), -3)
    const lastDay = new Date(Date.UTC(Number(previous.slice(0,4)), Number(previous.slice(5)), 0)).getUTCDate()
    const aligned = `${previous}-${String(Math.min(Number(today.slice(8)), lastDay)).padStart(2,'0')}`
    from = shiftAnalyticsDay(aligned, 1)
  } else if (range === 'custom') { from = params.get('from'); to = params.get('to') }
  else throw new Error('Choose a supported reporting period.')
  if (!validDay(from) || !validDay(to) || from < '2000-01-01' || to > today || from > to) throw new Error('Choose a valid start and end date between 1 January 2000 and today.')
  const start = new Date(`${from}T00:00:00+02:00`)
  const endOfRange = new Date(`${shiftAnalyticsDay(to,1)}T00:00:00+02:00`)
  const end = new Date(Math.min(endOfRange.getTime(), now.getTime()))
  const days = Math.round((endOfRange - start) / DAY)
  const previousStart = new Date(start.getTime() - days * DAY)
  const previousEnd = new Date(previousStart.getTime() + (end - start))
  const fmt = value => new Date(value).toLocaleDateString('en-ZA',{day:'numeric',month:'short',year:'numeric',timeZone:'Africa/Johannesburg'})
  return {
    kind:'range',range,from,to,days,month:to.slice(0,7),start:start.toISOString(),end:end.toISOString(),previousStart:previousStart.toISOString(),previousEnd:previousEnd.toISOString(),
    label:`${fmt(start)} – ${fmt(new Date(`${to}T12:00:00+02:00`))}${to === today ? ' · to date' : ''}`,
    isCurrent:to === today,comparisonLabel:`Previous ${days} day${days === 1 ? '' : 's'}${to === today ? ' · matched elapsed time' : ''}`,
    comparisonDetail:`Compared with ${fmt(previousStart)} to ${fmt(new Date(previousEnd.getTime() - 1))}. ${to === today ? 'The final comparison day is cut off at the same South African time as today.' : 'Both periods contain the same number of complete calendar days.'} All boundaries use South African time.`,asOf:now.toISOString(),
  }
}
