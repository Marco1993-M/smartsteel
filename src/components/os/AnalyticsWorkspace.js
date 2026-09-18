"use client"

import { useEffect, useState } from "react"
import { ArrowUpRight, Banknote, CircleCheck, Eye, Megaphone, MousePointerClick, Search, Users, RefreshCw, ArrowDownToLine, Clock3, MessageSquare, Layers3, BarChart3 } from "lucide-react"
import { getOsAuthHeaders } from "../../lib/osClientAuth"

const PERIODS = [{ days: 30, label: '30 days' }, { days: 90, label: '90 days' }, { days: 365, label: '12 months' }]
const TABS = [{ key: 'overview', label: 'Overview', icon: BarChart3 }, { key: 'pipeline', label: 'Pipeline & quotes', icon: Layers3 }, { key: 'clients', label: 'Clients & feedback', icon: MessageSquare }, { key: 'marketing', label: 'Marketing', icon: Megaphone }]
const money = (value) => value == null ? '—' : new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', maximumFractionDigits: 0 }).format(value)
const formatCurrency = money
const formatNumber = (value, maximumFractionDigits = 0) => new Intl.NumberFormat('en-ZA', { maximumFractionDigits }).format(value || 0)
const changeLabel = (value) => value == null ? 'No prior baseline' : `${value > 0 ? '+' : ''}${value}%`
const percent = (value) => value == null ? '—' : `${value}%`
const formatSyncDate = (value) => value ? `Updated ${new Date(value).toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' })}` : 'Not synced yet'
const panel = 'min-w-0 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6'
const button = 'inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600'

function Heading({ eyebrow, title, detail, aside }) {
  return <div className="mb-5 flex flex-wrap items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{eyebrow}</p><h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">{title}</h2>{detail && <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-500">{detail}</p>}</div>{aside}</div>
}
function Empty({ children }) { return <p className="rounded-xl border border-dashed border-slate-200 p-6 text-sm leading-6 text-slate-500">{children}</p> }
function Stat({ label, value, note, dark = false }) {
  return <div className={`min-w-0 rounded-2xl border p-5 ${dark ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-950'}`}><p className={`text-[11px] font-semibold ${dark ? 'text-sky-200' : 'text-slate-500'}`}>{label}</p><p className="mt-3 break-words text-3xl font-semibold tracking-tight tabular-nums">{value}</p><p className={`mt-3 text-xs leading-5 ${dark ? 'text-slate-300' : 'text-slate-500'}`}>{note}</p></div>
}
function PerformanceTable({ rows, label }) {
  const [sort, setSort] = useState('wonValue')
  const sorted = [...rows].sort((a, b) => (b[sort] ?? -1) - (a[sort] ?? -1))
  return <section className={panel}><Heading eyebrow="Acquisition cohort" title={label} detail="Leads created in the selected period, using their current outcome. Open opportunities may still convert." aside={<label className="text-xs text-slate-500">Sort by <select className="ml-2 rounded-lg border border-slate-200 p-2 text-slate-800" value={sort} onChange={(event) => setSort(event.target.value)}><option value="wonValue">Won value</option><option value="leads">Lead volume</option><option value="winRate">Win rate</option></select></label>} />
    {!rows.length ? <Empty>No leads in this period.</Empty> : <div className="overflow-x-auto"><table className="w-full min-w-[540px] text-left text-sm"><thead className="border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500"><tr>{['Name', 'Leads', 'Quoted', 'Won', 'Win rate', 'Won value'].map((text) => <th key={text} className="px-2 py-3 first:pl-0">{text}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{sorted.map((row) => <tr key={row.label} className="hover:bg-slate-50"><th scope="row" className="max-w-[220px] py-4 pr-3 font-medium text-slate-800">{row.label}</th><td className="px-2 tabular-nums">{row.leads}</td><td className="px-2 tabular-nums">{row.quoted ?? '—'}</td><td className="px-2 tabular-nums">{row.won}</td><td className="px-2"><span className="rounded-md bg-sky-50 px-2 py-1 text-sky-800">{percent(row.winRate)}</span></td><td className="whitespace-nowrap px-2 font-semibold tabular-nums">{money(row.wonValue)}</td></tr>)}</tbody></table></div>}
  </section>
}
function Ageing({ insights }) {
  const buckets = insights.pipeline.ageBuckets
  const max = Math.max(1, ...buckets.map((bucket) => bucket.value))
  return <section className={panel}><Heading eyebrow="Live pipeline · all open leads" title="How long have quotes been waiting?" detail="Age since the first recorded quote send. Values use the current CRM quote value once per opportunity." aside={<Clock3 className="h-5 w-5 text-sky-600" />} />
    {!insights.estimatesAvailable ? <Empty>Quote data is temporarily unavailable.</Empty> : !insights.pipeline.quotedCount ? <Empty>No open opportunities with a recorded sent quote.</Empty> : <div className="space-y-5">{buckets.map((bucket, index) => <div key={bucket.label}><div className="mb-2 flex justify-between gap-3 text-xs"><span className="font-medium text-slate-700">{bucket.label} <span className="ml-1 text-slate-400">· {bucket.count} quotes</span></span><span className="font-semibold tabular-nums">{money(bucket.value)}</span></div><div className="h-2 rounded-full bg-slate-100"><div className={`h-2 rounded-full ${index >= 3 ? 'bg-amber-400' : 'bg-sky-500'}`} style={{ width: `${bucket.value / max * 100}%` }} /></div></div>)}</div>}
  </section>
}
function ActivityChart({ trend, available }) {
  const max = Math.max(1, ...trend.flatMap((row) => [row.leads, row.estimatesSent]))
  return <section className={panel}><Heading eyebrow="Activity in selected period" title="Enquiries & quotes sent" detail="Quote sends include revisions and can relate to leads from earlier periods." aside={<div className="flex gap-3 text-[10px] text-slate-500"><span>● Enquiries</span><span className="text-sky-600">● Quote sends</span></div>} />
    <div className="flex h-48 items-end gap-2 sm:gap-4">{trend.map((row) => <div key={row.key} className="group relative flex h-full min-w-0 flex-1 flex-col justify-end" tabIndex={0} aria-label={`${row.label}: ${row.leads} enquiries, ${available ? row.estimatesSent : 'unavailable'} quote sends`}><div className="pointer-events-none absolute bottom-full left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 p-2 text-[10px] text-white group-hover:block group-focus:block">{row.leads} enquiries · {available ? row.estimatesSent : '—'} sends</div><div className="flex h-36 items-end justify-center gap-1"><div className="w-5 max-w-[40%] rounded-t bg-slate-800" style={{ height: `${row.leads / max * 100}%` }} /><div className="w-5 max-w-[40%] rounded-t bg-sky-400" style={{ height: `${available ? row.estimatesSent / max * 100 : 0}%` }} /></div><p className="mt-3 truncate text-center text-[9px] text-slate-500 sm:text-[10px]">{row.label}</p></div>)}</div>
    {!available && <p className="mt-3 text-xs text-amber-700">Quote activity is unavailable.</p>}
  </section>
}
function Feedback({ data }) {
  const feedback = data.insights.feedback
  const decline = data.declineFeedback
  return <div className="grid items-start gap-5 lg:grid-cols-2"><section className={panel}><Heading eyebrow="Confirmed client responses" title="What clients are telling us" detail="Latest answer per quote sequence submitted during this period. These responses never automatically move a lead to Lost." />
    {!feedback.available ? <Empty>Client responses are temporarily unavailable.</Empty> : <><div className="mb-6 grid grid-cols-2 gap-3"><Stat label="Follow-up response rate" value={percent(feedback.responseRate)} note={feedback.rateAvailable ? `${feedback.respondedCount} of ${feedback.sentCount} quotes followed up in this period received a CTA response after the send.` : 'Follow-up send records unavailable.'} /><Stat label="Quote sequences with replies" value={feedback.total} note="Includes replies to earlier follow-ups. Direct email replies and phone calls are not counted." /></div><div className="space-y-4">{feedback.choices.map((choice) => <div key={choice.key}><div className="mb-2 flex justify-between text-sm"><span className="text-slate-600">{choice.label}</span><strong>{choice.count}</strong></div><div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-sky-500" style={{ width: `${feedback.total ? choice.count / feedback.total * 100 : 0}%` }} /></div></div>)}</div></>}
  </section><section className={panel}><Heading eyebrow="Learn from every quote" title="Why clients aren’t proceeding" detail="Latest confirmed answer per sequence in this period. Percentages include skipped reasons; this is feedback, not a Lost-column count." />
    {!decline?.available ? <Empty>Decline reasons are unavailable. The decline-feedback database update may still be required.</Empty> : !decline.total ? <Empty>No clients selected “No longer needed” in this period.</Empty> : <><p className="mb-6 text-sm text-slate-600"><strong className="text-slate-900">{decline.total}</strong> not proceeding · <strong className="text-slate-900">{decline.withReason}</strong> supplied a reason</p><div className="space-y-5">{decline.reasons.map((reason) => <div key={reason.key}><div className="mb-2 flex justify-between gap-3 text-xs"><span className="text-slate-600">{reason.label}</span><strong className="shrink-0">{reason.value} · {reason.percentage}%</strong></div><div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-amber-400" style={{ width: `${reason.percentage}%` }} /></div></div>)}</div></>}
  </section></div>
}
function Efficiency({ metric }) {
  return <section className={panel}><Heading eyebrow="Commercial efficiency · partial-cost estimate" title="Lifetime value / acquisition cost" detail={metric.basis} /><div className="grid gap-3 sm:grid-cols-3"><Stat label="LTV:CAC" value={metric.ready ? `${metric.ltvCacRatio.toFixed(2)}:1` : 'Pending'} note={metric.ready ? 'All acquisition sources included' : metric.blocker} dark /><Stat label="Estimated contribution LTV" value={money(metric.contributionLtv)} note="30% assumed margin · one lifetime project" /><Stat label="Blended CAC" value={money(metric.cac)} note={`${metric.wonCustomers} won leads treated as customers`} /></div><p className="mt-4 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-800">{metric.costCoverage}</p></section>
}
function MarketingMetric({ label, value, icon: Icon, helper }) {
  return (
    <div className="min-w-0 p-3.5 sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">{label}</p>
        <Icon className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
      </div>
      <p className="mt-2 truncate text-xl font-bold tracking-tight text-slate-950">{value}</p>
      {helper ? <p className="mt-1 truncate text-[11px] text-slate-500">{helper}</p> : null}
    </div>
  )
}

function MarketingSourceCard({ connection, metrics, type, schemaReady, syncingSource, onSync }) {
  const isSearch = type === "search"
  const connected = connection?.status === "connected"
  const syncing = connection?.status === "syncing"
  const hasData = connected && (metrics?.impressions > 0 || metrics?.clicks > 0 || metrics?.cost > 0)
  const SourceIcon = isSearch ? Search : Megaphone
  const title = isSearch ? "Google Search Console" : "Google Ads"
  const source = isSearch ? "search_console" : "google_ads"
  const isSyncingNow = syncingSource === source
  const accent = isSearch ? "text-sky-700 bg-sky-100" : "text-amber-800 bg-amber-100"

  return (
    <article className={`overflow-hidden bg-white ${isSearch ? "" : "border-t border-slate-200 lg:border-l-0 lg:border-t-0"}`}>
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${accent}`}><SourceIcon className="h-5 w-5" aria-hidden="true" /></span>
            <div className="min-w-0">
              <h3 className="truncate text-lg font-bold text-slate-950">{title}</h3>
              <p className="mt-0.5 truncate text-xs text-slate-500">{connection?.accountLabel || (isSearch ? "Organic search performance" : "Paid campaign performance")}</p>
            </div>
          </div>
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${connected ? "bg-emerald-100 text-emerald-700" : syncing ? "bg-sky-100 text-sky-700" : connection?.status === "error" ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-600"}`}>
            {connected ? "Connected" : syncing ? "Syncing" : connection?.status === "error" ? "Needs attention" : "Ready to connect"}
          </span>
        </div>

        {hasData ? (
          <div className="mt-5 grid grid-cols-2 divide-x divide-y divide-slate-200 overflow-hidden rounded-2xl bg-slate-50 ring-1 ring-slate-200">
            {isSearch ? (
              <>
                <MarketingMetric label="Impressions" value={formatNumber(metrics.impressions)} icon={Eye} helper={changeLabel(metrics.changes.impressions)} />
                <MarketingMetric label="Clicks" value={formatNumber(metrics.clicks)} icon={MousePointerClick} helper={`${metrics.ctr}% CTR`} />
                <MarketingMetric label="Average position" value={metrics.averagePosition ?? "—"} icon={Search} />
                <MarketingMetric label="Click-through rate" value={`${metrics.ctr}%`} icon={Users} helper="Clicks / impressions" />
              </>
            ) : (
              <>
                <MarketingMetric label="Spend" value={formatCurrency(metrics.cost)} icon={Banknote} helper={changeLabel(metrics.changes.cost)} />
                <MarketingMetric label="Conversions" value={formatNumber(metrics.conversions, 1)} icon={CircleCheck} helper={changeLabel(metrics.changes.conversions)} />
                <MarketingMetric label="Cost / conversion" value={formatCurrency(metrics.costPerConversion)} icon={MousePointerClick} />
                <MarketingMetric label="ROAS" value={`${metrics.roas}x`} icon={ArrowUpRight} />
              </>
            )}
          </div>
        ) : (
          <div className="mt-5 border-l-2 border-slate-200 py-1 pl-4">
            <p className="text-sm font-semibold text-slate-800">{connection?.status === "error" ? connection.lastError || "The last sync needs attention." : "The reporting surface is ready."}</p>
            <p className="mt-1.5 text-xs leading-5 text-slate-500">{isSearch ? "Connect the Smart Steel property to bring clicks, impressions, CTR, and search position into this page." : "Connect the advertising account to bring spend, conversions, cost per lead, and campaign return into this page."}</p>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] font-medium text-slate-400">{formatSyncDate(connection?.lastSyncedAt)}</p>
          <button type="button" disabled={!schemaReady || Boolean(syncingSource)} onClick={() => onSync(source)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-50">
            {isSyncingNow ? "Syncing..." : connected ? "Sync now" : "Check connection"}
          </button>
        </div>
      </div>
      <div className={`h-0.5 ${isSearch ? "bg-sky-500" : "bg-amber-400"}`} />
    </article>
  )
}


function exportPerformance(data) {
  const rows = [['Period', data.period.label], ['Basis', 'Leads created in period; current outcomes; won value excl. VAT'], ['Type', 'Name', 'Leads', 'Quoted', 'Won', 'Win rate (%)', 'Won value (ZAR)']]
  for (const [type, records] of [['Product', data.insights.products], ['Source', data.insights.sources]]) {
    records.forEach((row) => rows.push([type, row.label, row.leads, row.quoted, row.won, row.winRate, row.wonValue]))
  }
  const csv = rows.map((row) => row.map((value) => {
    let text = String(value ?? '')
    if (/^[\s]*[=+\-@]/.test(text)) text = `'${text}`
    return `"${text.replaceAll('"', '""')}"`
  }).join(',')).join('\r\n')
  const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `smart-steel-performance-${data.period.days}-days.csv`
  anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export default function AnalyticsWorkspace() {
  const [days, setDays] = useState(30)
  const [tab, setTab] = useState('overview')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [syncingSource, setSyncingSource] = useState('')
  const [syncMessage, setSyncMessage] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      setLoading(true)
      setError('')
      try {
        const response = await fetch(`/api/os/analytics?days=${days}`, { cache: 'no-store', headers: await getOsAuthHeaders(), signal: controller.signal })
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.error || 'Could not load analytics.')
        if (!controller.signal.aborted) setData(payload)
      } catch (failure) {
        if (!controller.signal.aborted) setError(failure.message)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    load()
    return () => controller.abort()
  }, [days, refreshKey])
  async function syncMarketingSource(source) {
    setSyncingSource(source)
    setSyncMessage('')
    try {
      const response = await fetch(`/api/os/analytics/sync/${source === 'search_console' ? 'search-console' : 'google-ads'}`, { method: 'POST', headers: await getOsAuthHeaders() })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Sync failed.')
      setSyncMessage(`${source === 'search_console' ? 'Search Console' : 'Google Ads'} updated: ${payload.imported || 0} daily records.`)
      setRefreshKey((value) => value + 1)
    } catch (failure) { setSyncMessage(failure.message) }
    finally { setSyncingSource('') }
  }
  const insights = data?.insights
  const metrics = data?.metrics
  const connections = Object.fromEntries((data?.marketing?.connections || []).map((item) => [item.source, item]))
  const comparison = (value) => value == null ? 'No prior-period baseline' : `${value > 0 ? '+' : ''}${value}% vs previous period`

  return <div className="min-h-screen min-w-0 bg-[#f5f7fa] px-4 py-6 text-slate-900 sm:px-7 lg:px-9">
    <div className="mx-auto max-w-[1500px] space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div><div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500"><span className="h-1.5 w-1.5 rounded-full bg-sky-500" />Smart Steel / Commercial intelligence</div><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Business performance<span className="text-sky-500">.</span></h1><p className="mt-2 text-sm text-slate-500">Track growth, conversion, and commercial performance.</p></div>
        <div className="flex flex-wrap items-center gap-2"><button type="button" className={button} disabled={loading} onClick={() => setRefreshKey((value) => value + 1)} aria-label="Refresh analytics"><RefreshCw size={14} className={loading ? 'animate-spin' : ''} />Refresh</button><button type="button" className={button} disabled={loading || Boolean(error) || !insights} onClick={() => exportPerformance(data)}><ArrowDownToLine size={14} />Export performance</button><div className="flex rounded-lg border border-slate-200 bg-white p-1">{PERIODS.map((period) => <button key={period.days} type="button" aria-pressed={days === period.days} onClick={() => setDays(period.days)} className={`rounded-md px-3 py-2 text-xs font-semibold transition ${days === period.days ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>{period.label}</button>)}</div></div>
      </header>
      <nav aria-label="Analytics sections" className="flex gap-1 overflow-x-auto border-b border-slate-200">{TABS.map(({ key, label, icon: Icon }) => <button key={key} type="button" aria-current={tab === key ? 'page' : undefined} onClick={() => setTab(key)} className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3.5 text-xs font-semibold transition ${tab === key ? 'border-sky-600 text-sky-700' : 'border-transparent text-slate-500 hover:text-slate-900'}`}><Icon size={15} />{label}</button>)}</nav>
      {loading ? <div role="status" className="space-y-5"><p className="text-sm text-slate-500">Loading business performance…</p><div className="grid animate-pulse gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1, 2, 3, 4].map((key) => <div key={key} className="h-36 rounded-2xl bg-slate-200" />)}</div><div className="h-64 animate-pulse rounded-2xl bg-slate-200" /></div> : error ? <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800"><p>{error}</p><button className={`${button} mt-4`} onClick={() => setRefreshKey((value) => value + 1)}>Try again</button></div> : insights && metrics ? <>
        {!!data.warnings?.length && <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">{data.warnings.join(' ')}</p>}
        <div className="flex flex-wrap justify-between gap-2 text-[11px] text-slate-500"><p><strong className="font-semibold text-slate-700">{data.period.label}</strong> · Acquisition cohorts use lead creation date; live pipeline includes all open leads.</p><p>As of {new Date(data.period.end).toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' })}</p></div>
        {tab === 'overview' && <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Stat label="Live pipeline value" value={money(insights.pipeline.value)} note={`${insights.pipeline.count} open opportunities · CRM quote values, excl. VAT`} dark /><Stat label="New enquiries" value={metrics.leadCount} note={comparison(metrics.changes.leads)} /><Stat label="Cohort won value" value={money(metrics.wonValue)} note={`${metrics.wonCount} wins from leads created in this period; not revenue booked in the period.`} /><Stat label="Quote-to-win conversion" value={insights.estimatesAvailable ? percent(insights.quotes.winRate) : '—'} note={`${insights.quotes.wonCount} won / ${insights.quotes.quotedCount} quoted leads in this acquisition cohort`} /></div>
          <div className="grid items-start gap-5 xl:grid-cols-[1.3fr_1fr]"><ActivityChart trend={data.trend} available={insights.estimatesAvailable} /><section className="rounded-2xl bg-slate-900 p-6 text-white"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-300">Selected-period indicators</p><h2 className="mt-3 text-2xl font-semibold tracking-tight">Conversion & response</h2><div className="mt-6 divide-y divide-white/10">{[
            { label: 'Lead-to-win conversion', value: metrics.leadCount ? percent(metrics.winRate) : '—', note: `${metrics.wonCount} wins / ${metrics.leadCount} leads created in this period` },
            { label: 'Median time to first quote', value: insights.estimatesAvailable && insights.quotes.medianDays != null ? `${insights.quotes.medianDays} days` : '—', note: `${insights.quotes.timingSample} valid timestamps in the lead cohort` },
            { label: 'Follow-up response rate', value: percent(insights.feedback.responseRate), note: insights.feedback.rateAvailable ? `${insights.feedback.respondedCount} of ${insights.feedback.sentCount} quotes followed up received a CTA response` : 'Response or send records unavailable' },
          ].map((item) => <div key={item.label} className="py-4"><div className="flex items-center justify-between gap-4"><span className="text-sm text-slate-300">{item.label}</span><span className="shrink-0 text-xl font-semibold tabular-nums">{item.value}</span></div><p className="mt-1 text-[11px] leading-5 text-slate-400">{item.note}</p></div>)}</div></section></div>
          <div className="grid items-start gap-5 xl:grid-cols-2"><Ageing insights={insights} /><PerformanceTable rows={insights.products} label="Which products turn into business?" /></div>
        </>}
        {tab === 'pipeline' && <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Stat label="Open quoted value" value={insights.estimatesAvailable ? money(insights.pipeline.quotedValue) : '—'} note={`${insights.pipeline.quotedCount} open opportunities with a sent quote · all dates`} dark /><Stat label="Enquiry → first quote" value={insights.estimatesAvailable && insights.quotes.medianDays != null ? `${insights.quotes.medianDays} days` : '—'} note={`Median calendar days · ${insights.quotes.timingSample} valid send timestamps in the lead cohort`} /><Stat label="Awaiting first quote" value={insights.estimatesAvailable ? insights.pipeline.awaitingQuote : '—'} note={insights.pipeline.oldestAwaitingDays == null ? 'No measurable waiting time' : `Oldest open enquiry: ${insights.pipeline.oldestAwaitingDays} days. Includes unqualified leads.`} /><Stat label="Quote sends in period" value={insights.estimatesAvailable ? metrics.sentCount : '—'} note="Send activity, including revisions and older leads" /></div>
          <div className="grid items-start gap-5 lg:grid-cols-2"><Ageing insights={insights} /><section className={panel}><Heading eyebrow="Acquisition cohort" title="From enquiry to outcome" detail="Current outcomes of leads created in the selected period. These counts are not a strict funnel: a win can exist without a recorded quote." /><div className="space-y-5">{[{ label: 'Enquiries received', value: metrics.leadCount }, { label: 'With a sent quote', value: insights.estimatesAvailable ? insights.quotes.quotedCount : null }, { label: 'Currently won', value: metrics.wonCount }].map((row) => <div key={row.label}><div className="mb-2 flex justify-between text-sm"><span className="text-slate-600">{row.label}</span><strong>{row.value ?? '—'}</strong></div><div className="h-3 rounded-full bg-slate-100"><div className="h-3 rounded-full bg-sky-500" style={{ width: `${metrics.leadCount ? (row.value || 0) / metrics.leadCount * 100 : 0}%` }} /></div></div>)}</div><p className="mt-6 text-xs leading-5 text-slate-500">Recent cohorts have had less time to convert. Compare like-for-like periods before drawing conclusions.</p></section></div>
        </>}
        {tab === 'clients' && <><Feedback data={data} /><PerformanceTable rows={insights.products} label="Product performance" /><section className={panel}><Heading eyebrow="Data quality" title="Make the next report more useful" /><div className="flex flex-wrap gap-3 text-sm"><span className="rounded-lg bg-amber-50 px-4 py-3 text-amber-800">{data.attention.missingSource} new leads without a source</span><span className="rounded-lg bg-slate-100 px-4 py-3 text-slate-700">{data.attention.missingProduct} new leads without a product</span></div></section></>}
        {tab === 'marketing' && <><PerformanceTable rows={insights.sources} label="Which sources bring customers?" /><Efficiency metric={data.commercialEfficiency} /><section><Heading eyebrow="Connected channels" title="Search demand & paid acquisition" detail="Platform conversions are separate from CRM wins. Source performance above uses recorded CRM attribution." /><div className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white lg:grid-cols-2 lg:divide-x lg:divide-slate-200"><MarketingSourceCard connection={connections.search_console} metrics={data.marketing.searchConsole} type="search" schemaReady={data.marketing.schemaReady} syncingSource={syncingSource} onSync={syncMarketingSource} /><MarketingSourceCard connection={connections.google_ads} metrics={data.marketing.googleAds} type="ads" schemaReady={data.marketing.schemaReady} syncingSource={syncingSource} onSync={syncMarketingSource} /></div>{syncMessage && <p role="status" className="mt-3 rounded-lg bg-slate-100 p-3 text-sm text-slate-700">{syncMessage}</p>}</section></>}
        <footer className="flex flex-wrap justify-between gap-3 border-t border-slate-200 py-5 text-[11px] leading-5 text-slate-500"><p>CRM values exclude VAT. Pipeline values are opportunities, not guaranteed revenue.</p><p>Live pipeline · Acquisition cohorts · Confirmed feedback</p></footer>
      </> : <Empty>Analytics data is not available. Refresh to try again.</Empty>}
    </div>
  </div>
}
