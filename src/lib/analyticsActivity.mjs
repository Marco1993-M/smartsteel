import { analyticsDateKey, monthLabel, monthStart, shiftAnalyticsDay, shiftMonth } from './analyticsPeriods.mjs'

export function buildDailyAnalyticsActivity(leads, estimates, period) {
  const start = Date.parse(period.start), end = Date.parse(period.end)
  const first = analyticsDateKey(period.start)
  const last = period.kind === 'range' ? period.to : period.isCurrent ? analyticsDateKey(period.asOf) : analyticsDateKey(new Date(Math.max(start, end - 1)))
  const rows = []
  for(let key=first;key<=last;key=shiftAnalyticsDay(key,1)) {
    const date = new Date(`${key}T12:00:00+02:00`)
    rows.push({key,label:date.toLocaleDateString('en-ZA',{day:'numeric',month:'short',timeZone:'Africa/Johannesburg'}),fullLabel:date.toLocaleDateString('en-ZA',{weekday:'short',day:'numeric',month:'long',year:'numeric',timeZone:'Africa/Johannesburg'}),leads:0,estimatesSent:0,partial:period.isCurrent && key===last})
  }
  const byDay = new Map(rows.map(row=>[row.key,row]))
  const add = (value,field) => {
    const timestamp = value ? Date.parse(value) : NaN
    if(!Number.isFinite(timestamp) || timestamp<start || timestamp>=end) return
    const row=byDay.get(analyticsDateKey(new Date(timestamp)))
    if(row)row[field]++
  }
  for(const lead of leads)add(lead.created_at,'leads')
  // Only actual sent timestamps count; preparation and status alone do not invent activity.
  for(const estimate of estimates)add(estimate.sent_at,'estimatesSent')
  return rows
}
export function buildMonthlyRangeActivity(daily, period) {
  const groups=new Map()
  for(const row of daily) {
    const key=row.key.slice(0,7)
    if(!groups.has(key))groups.set(key,{key,label:monthStart(key).toLocaleDateString('en-ZA',{month:'short',year:'2-digit',timeZone:'Africa/Johannesburg'}),fullLabel:monthLabel(key),leads:0,estimatesSent:0,partial:false})
    const group=groups.get(key);group.leads+=row.leads;group.estimatesSent+=row.estimatesSent
  }
  for(const row of groups.values())row.partial=Date.parse(period.start)>monthStart(row.key).getTime() || Date.parse(period.end)<monthStart(shiftMonth(row.key,1)).getTime()
  return [...groups.values()]
}
export function analyticsAxisMaximum(values) {
  const maximum=Math.max(0,...values.filter(Number.isFinite))
  if(maximum<=4)return 4
  const rough=maximum/4, magnitude=10**Math.floor(Math.log10(rough))
  const step=[1,2,5,10].map(x=>x*magnitude).find(x=>x>=rough)
  return step*4
}
