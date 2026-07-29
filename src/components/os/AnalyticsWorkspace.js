"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowRight, ArrowUpRight, Banknote, CircleCheck, Eye, Megaphone, MousePointerClick, Search, Send, Target, TrendingUp, Users } from "lucide-react"
import { getOsAuthHeaders } from "../../lib/osClientAuth"

const PERIODS = [
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
  { days: 365, label: "12 months" },
]

function formatCurrency(value) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}

function formatNumber(value, maximumFractionDigits = 0) {
  return new Intl.NumberFormat("en-ZA", { maximumFractionDigits }).format(Number(value || 0))
}

function formatSyncDate(value) {
  if (!value) return "Not synced yet"
  return `Updated ${new Date(value).toLocaleString("en-ZA", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}`
}

function ChangeBadge({ value, dark = false }) {
  const number = Number(value || 0)
  const positive = number > 0
  const negative = number < 0
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${positive ? (dark ? "text-emerald-300" : "text-emerald-700") : negative ? (dark ? "text-rose-300" : "text-rose-700") : dark ? "text-slate-400" : "text-slate-500"}`}>
      {positive ? <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" /> : null}
      {positive ? "+" : ""}{number}% vs previous period
    </span>
  )
}

function MetricCard({ eyebrow, value, helper, changeValue, tone = "white", icon: Icon }) {
  const accents = { white: "text-white", blue: "text-sky-300", dark: "text-amber-300", green: "text-emerald-300" }
  return (
    <article className="relative min-w-0 px-4 py-5 sm:px-6 sm:py-6">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 sm:text-[11px]">{eyebrow}</p>
        {Icon ? <Icon className={`h-4 w-4 shrink-0 ${accents[tone]}`} aria-hidden="true" /> : null}
      </div>
      <p className="mt-3 break-words text-[1.45rem] font-bold leading-none tracking-[-0.04em] text-white sm:text-3xl">{value}</p>
      <p className="mt-2 truncate text-xs text-slate-400 sm:text-sm">{helper}</p>
      {changeValue !== undefined ? <div className="mt-3"><ChangeBadge value={changeValue} dark /></div> : null}
    </article>
  )
}

function GrowthSignals({ data }) {
  const metrics = data.metrics
  const topProduct = data.products?.[0]
  const topSource = data.sources?.[0]
  const signals = [
    {
      label: "Lead growth",
      value: `${metrics.changes.leads > 0 ? "+" : ""}${metrics.changes.leads}%`,
      target: "Target: positive growth",
      healthy: metrics.changes.leads >= 0,
      note: metrics.changes.leads >= 0 ? "Demand is holding above the previous period." : "New demand has softened versus the previous period.",
    },
    {
      label: "Leads receiving estimates",
      value: `${metrics.quoteRate}%`,
      target: "Working target: 50%+",
      healthy: metrics.quoteRate >= 50,
      note: metrics.quoteRate >= 50 ? "At least half of new leads are reaching an estimate." : "More qualified leads need to progress to an estimate.",
    },
    {
      label: "Lead-to-win conversion",
      value: `${metrics.winRate}%`,
      target: "Working target: 15%+",
      healthy: metrics.winRate >= 15,
      note: metrics.winRate >= 15 ? "The current cohort is converting at a healthy starting rate." : "Review quote fit and follow-up quality for this cohort.",
    },
    {
      label: "Follow-up discipline",
      value: data.attention.overdueFollowUps === 0 ? "Clear" : `${data.attention.overdueFollowUps} overdue`,
      target: "Target: zero overdue",
      healthy: data.attention.overdueFollowUps === 0,
      note: data.attention.overdueFollowUps === 0 ? "Every active follow-up is currently accounted for." : "These leads need attention before more demand is added.",
    },
  ]
  const healthyCount = signals.filter((signal) => signal.healthy).length
  const priority = signals.find((signal) => !signal.healthy)

  return (
    <section className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.06)]">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_310px]">
        <div className="p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Growth signals</p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">Performance against our KPIs</h2>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
              <Target className="h-3.5 w-3.5" aria-hidden="true" /> {healthyCount} of {signals.length} on track
            </span>
          </div>
          <div className="mt-5 grid gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-2 xl:grid-cols-4">
            {signals.map((signal) => (
              <article key={signal.label} className="min-w-0 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className={`h-2.5 w-2.5 rounded-full ${signal.healthy ? "bg-emerald-500" : "bg-amber-400"}`} aria-hidden="true" />
                  <span className={`text-[10px] font-bold uppercase tracking-[0.12em] ${signal.healthy ? "text-emerald-700" : "text-amber-800"}`}>{signal.healthy ? "On track" : "Needs focus"}</span>
                </div>
                <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">{signal.label}</p>
                <p className="mt-1 text-2xl font-bold tracking-tight text-slate-950">{signal.value}</p>
                <p className="mt-1 text-[11px] font-semibold text-slate-500">{signal.target}</p>
                <p className="mt-3 text-xs leading-5 text-slate-600">{signal.note}</p>
              </article>
            ))}
          </div>
        </div>
        <aside className="flex flex-col justify-between bg-[linear-gradient(150deg,_#082f49,_#0f172a)] p-5 text-white sm:p-7">
          <div>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-sky-400 text-slate-950"><TrendingUp className="h-5 w-5" aria-hidden="true" /></span>
            <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-300">Recommended action</p>
            <h3 className="mt-2 text-xl font-bold leading-tight text-white">{priority ? priority.label : "Protect the momentum"}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-300">{priority?.note || `${topProduct?.label || "The leading product"} is creating the strongest demand. Keep response time and estimate quality consistent.`}</p>
          </div>
          <div className="mt-6 border-t border-white/10 pt-5">
            <p className="text-xs text-slate-400">Leading signal</p>
            <p className="mt-1 text-sm font-semibold text-white">{topProduct?.label || "Product demand pending"}{topSource ? ` via ${topSource.label}` : ""}</p>
            <Link href="/os/crm" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-sky-300 transition hover:text-white">Review the pipeline <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
        </aside>
      </div>
    </section>
  )
}

function TrendChart({ data }) {
  const [activeIndex, setActiveIndex] = useState(Math.max(0, data.length - 1))
  const width = 760
  const height = 260
  const inset = { top: 20, right: 22, bottom: 28, left: 46 }
  const maxValue = Math.max(1, ...data.flatMap((item) => [item.leads, item.estimatesSent]))
  const chartMax = Math.max(4, Math.ceil(maxValue / 4) * 4)
  const baseline = height - inset.bottom
  const point = (value, index) => {
    const x = data.length === 1 ? width / 2 : inset.left + (index / (data.length - 1)) * (width - inset.left - inset.right)
    const y = baseline - (value / chartMax) * (baseline - inset.top)
    return [x, y]
  }
  const smoothPath = (key) => {
    const points = data.map((item, index) => point(item[key], index))
    if (!points.length) return ""
    if (points.length === 1) return `M ${points[0][0]} ${points[0][1]}`
    return points.slice(1).reduce((pathValue, current, index) => {
      const previous = points[index]
      const controlOffset = (current[0] - previous[0]) * 0.42
      return `${pathValue} C ${previous[0] + controlOffset} ${previous[1]}, ${current[0] - controlOffset} ${current[1]}, ${current[0]} ${current[1]}`
    }, `M ${points[0][0]} ${points[0][1]}`)
  }
  const leadPath = smoothPath("leads")
  const estimatePath = smoothPath("estimatesSent")
  const safeActiveIndex = Math.min(activeIndex, Math.max(0, data.length - 1))
  const activeItem = data[safeActiveIndex]
  const [activeX, activeLeadY] = activeItem ? point(activeItem.leads, safeActiveIndex) : [0, 0]
  const [, activeEstimateY] = activeItem ? point(activeItem.estimatesSent, safeActiveIndex) : [0, 0]
  const totalLeads = data.reduce((sum, item) => sum + item.leads, 0)
  const totalEstimates = data.reduce((sum, item) => sum + item.estimatesSent, 0)

  return (
    <div className="mt-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap gap-5 text-xs font-semibold text-slate-600">
          <span className="inline-flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-sky-600 shadow-[0_0_0_4px_rgba(2,132,199,0.1)]" />Leads <strong className="text-slate-950">{totalLeads}</strong></span>
          <span className="inline-flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-amber-400 shadow-[0_0_0_4px_rgba(251,191,36,0.12)]" />Estimates <strong className="text-slate-950">{totalEstimates}</strong></span>
        </div>
        {activeItem ? (
          <div className="flex items-center gap-4 rounded-xl bg-slate-950 px-3.5 py-2 text-white shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">{activeItem.label}</p>
            <p className="text-xs"><strong className="text-sky-300">{activeItem.leads}</strong> leads</p>
            <p className="text-xs"><strong className="text-amber-300">{activeItem.estimatesSent}</strong> sent</p>
          </div>
        ) : null}
      </div>
      <div className="mt-3 overflow-hidden rounded-[1.35rem] border border-slate-200 bg-[radial-gradient(circle_at_15%_0%,_rgba(14,165,233,0.08),_transparent_32%),linear-gradient(180deg,_#f8fafc,_#ffffff)] px-1 pt-3 shadow-inner sm:px-2">
        <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Lead and estimate trend" className="h-auto w-full">
          <defs>
            <linearGradient id="lead-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
            </linearGradient>
            <filter id="line-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#0284c7" floodOpacity="0.18" />
            </filter>
          </defs>
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = baseline - ratio * (baseline - inset.top)
            return <g key={ratio}><line x1={inset.left} x2={width - inset.right} y1={y} y2={y} stroke="#e2e8f0" strokeWidth="1" strokeDasharray={ratio === 0 ? "0" : "4 8"} /><text x={inset.left - 12} y={y + 4} textAnchor="end" fill="#94a3b8" fontSize="11" fontWeight="600">{Math.round(chartMax * ratio)}</text></g>
          })}
          {data.length ? <path d={`${leadPath} L ${point(0, data.length - 1)[0]} ${baseline} L ${point(0, 0)[0]} ${baseline} Z`} fill="url(#lead-area)" /> : null}
          {activeItem ? <line x1={activeX} x2={activeX} y1={inset.top} y2={baseline} stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 6" /> : null}
          <path d={leadPath} fill="none" stroke="#0284c7" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" filter="url(#line-glow)" />
          <path d={estimatePath} fill="none" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          {data.map((item, index) => {
            const [leadX, leadY] = point(item.leads, index)
            const [sentX, sentY] = point(item.estimatesSent, index)
            const selected = index === safeActiveIndex
            return (
              <g key={item.key}>
                {selected ? <><circle cx={leadX} cy={leadY} r="10" fill="#0284c7" opacity="0.14" /><circle cx={sentX} cy={sentY} r="10" fill="#f59e0b" opacity="0.14" /></> : null}
                <circle cx={leadX} cy={leadY} r={selected ? "5.5" : "3.5"} fill="#0284c7" stroke="white" strokeWidth="2"><title>{`${item.label}: ${item.leads} leads`}</title></circle>
                <circle cx={sentX} cy={sentY} r={selected ? "5.5" : "3.5"} fill="#f59e0b" stroke="white" strokeWidth="2"><title>{`${item.label}: ${item.estimatesSent} estimates sent`}</title></circle>
                <circle cx={leadX} cy={(leadY + sentY) / 2} r="20" fill="transparent" tabIndex="0" role="button" aria-label={`${item.label}: ${item.leads} leads and ${item.estimatesSent} estimates sent`} onMouseEnter={() => setActiveIndex(index)} onFocus={() => setActiveIndex(index)} onClick={() => setActiveIndex(index)} className="cursor-pointer outline-none" />
              </g>
            )
          })}
          {activeItem ? <><circle cx={activeX} cy={activeLeadY} r="2" fill="white" pointerEvents="none" /><circle cx={activeX} cy={activeEstimateY} r="2" fill="white" pointerEvents="none" /></> : null}
        </svg>
        <div className="grid grid-cols-3 gap-2 px-11 pb-3 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400 sm:text-[10px]">
          <span>{data[0]?.label}</span>
          <span className="text-center">{data[Math.floor(data.length / 2)]?.label}</span>
          <span className="text-right">{data[data.length - 1]?.label}</span>
        </div>
      </div>
    </div>
  )
}

function RankedList({ items, emptyLabel, accent = "sky" }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const max = Math.max(1, ...items.map((item) => item.value))
  const total = items.reduce((sum, item) => sum + item.value, 0)
  const safeActiveIndex = Math.min(activeIndex, Math.max(0, items.length - 1))
  const activeItem = items[safeActiveIndex]
  const activeShare = activeItem && total > 0 ? Math.round((activeItem.value / total) * 1000) / 10 : 0
  const isAmber = accent === "amber"
  const barClass = isAmber ? "bg-[linear-gradient(90deg,_#fbbf24,_#f59e0b)]" : "bg-[linear-gradient(90deg,_#38bdf8,_#0284c7)]"
  const selectedClass = isAmber ? "border-amber-300 bg-amber-50/70" : "border-sky-300 bg-sky-50/70"
  const readoutClass = isAmber ? "bg-amber-400 text-slate-950" : "bg-slate-950 text-white"
  if (!items.length) return <p className="mt-5 text-sm text-slate-500">{emptyLabel}</p>
  return (
    <div className="mt-5">
      {activeItem ? (
        <div className={`flex items-end justify-between gap-4 rounded-2xl px-4 py-3.5 ${readoutClass}`}>
          <div className="min-w-0">
            <p className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${isAmber ? "text-slate-700" : "text-slate-400"}`}>Current leader</p>
            <p className="mt-1 truncate text-sm font-bold">{activeItem.label}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-2xl font-bold leading-none">{activeItem.value}</p>
            <p className={`mt-1 text-[10px] font-semibold ${isAmber ? "text-slate-700" : "text-slate-400"}`}>{activeShare}% of demand</p>
          </div>
        </div>
      ) : null}
      <div className="mt-3 space-y-2">
      {items.map((item, index) => (
        <button key={item.label} type="button" onMouseEnter={() => setActiveIndex(index)} onFocus={() => setActiveIndex(index)} onClick={() => setActiveIndex(index)} className={`w-full rounded-xl border p-3 text-left transition ${index === safeActiveIndex ? selectedClass : "border-transparent hover:border-slate-200 hover:bg-slate-50"}`} aria-pressed={index === safeActiveIndex}>
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="flex min-w-0 items-center gap-2.5 truncate font-semibold text-slate-800"><i className={`grid h-6 w-6 shrink-0 place-items-center rounded-lg text-[10px] not-italic ${index === safeActiveIndex ? (isAmber ? "bg-amber-400 text-slate-950" : "bg-sky-600 text-white") : "bg-slate-100 text-slate-500"}`}>{index + 1}</i><span className="truncate">{item.label}</span></span>
            <span className="shrink-0 text-xs font-bold text-slate-500">{total > 0 ? Math.round((item.value / total) * 100) : 0}%</span>
          </div>
          <div className="mt-2.5 h-2.5 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200/60">
            <div className={`h-full rounded-full transition-[width] duration-500 ${barClass}`} style={{ width: `${Math.max(4, (item.value / max) * 100)}%` }} />
          </div>
        </button>
      ))}
      </div>
    </div>
  )
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
                <MarketingMetric label="Impressions" value={formatNumber(metrics.impressions)} icon={Eye} helper={`${metrics.changes.impressions >= 0 ? "+" : ""}${metrics.changes.impressions}%`} />
                <MarketingMetric label="Clicks" value={formatNumber(metrics.clicks)} icon={MousePointerClick} helper={`${metrics.ctr}% CTR`} />
                <MarketingMetric label="Average position" value={metrics.averagePosition ?? "—"} icon={Search} />
                <MarketingMetric label="Organic leads" value="Next" icon={Users} helper="Attribution wave" />
              </>
            ) : (
              <>
                <MarketingMetric label="Spend" value={formatCurrency(metrics.cost)} icon={Banknote} helper={`${metrics.changes.cost >= 0 ? "+" : ""}${metrics.changes.cost}%`} />
                <MarketingMetric label="Conversions" value={formatNumber(metrics.conversions, 1)} icon={CircleCheck} helper={`${metrics.changes.conversions >= 0 ? "+" : ""}${metrics.changes.conversions}%`} />
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

function LtvCacCard({ metric, periodLabel }) {
  const ratio = Number(metric?.ltvCacRatio || 0)
  const healthy = ratio >= 3
  const developing = ratio > 0 && ratio < 3

  return (
    <section className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.06)]">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Commercial efficiency</p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">Lifetime value to acquisition cost</h2>
            </div>
            <span className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] ${
              metric?.ready
                ? healthy
                  ? "bg-emerald-100 text-emerald-700"
                  : developing
                    ? "bg-amber-100 text-amber-800"
                    : "bg-rose-100 text-rose-700"
                : "bg-slate-100 text-slate-600"
            }`}>
              {metric?.ready ? (healthy ? "Healthy" : developing ? "Developing" : "Needs attention") : "Awaiting data"}
            </span>
          </div>

          <div className="mt-6 grid gap-px overflow-hidden border border-slate-200 bg-slate-200 sm:grid-cols-3">
            <div className="bg-slate-950 p-5 text-white">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-sky-300">LTV:CAC ratio</p>
              <p className="mt-3 text-4xl font-bold tracking-[-0.05em]">{metric?.ready ? `${ratio.toFixed(2)}:1` : "Pending"}</p>
              <p className="mt-2 text-xs text-slate-400">{periodLabel}</p>
            </div>
            <div className="bg-white p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Contribution LTV</p>
              <p className="mt-3 text-2xl font-bold tracking-tight text-slate-950">{formatCurrency(metric?.contributionLtv)}</p>
              <p className="mt-2 text-xs text-slate-500">{Math.round(Number(metric?.grossMarginRate || 0) * 100)}% margin · {metric?.lifetimeProjectsPerCustomer || 1} lifetime project</p>
            </div>
            <div className="bg-white p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Paid CAC</p>
              <p className="mt-3 text-2xl font-bold tracking-tight text-slate-950">{metric?.cac ? formatCurrency(metric.cac) : "Pending"}</p>
              <p className="mt-2 text-xs text-slate-500">{metric?.paidWonCustomers || 0} paid-attributed won customer{metric?.paidWonCustomers === 1 ? "" : "s"}</p>
            </div>
          </div>

          <p className="mt-4 text-xs leading-5 text-slate-500">{metric?.basis}</p>
        </div>
        <aside className={`p-5 sm:p-7 ${metric?.ready ? (healthy ? "bg-emerald-50" : "bg-amber-50") : "bg-slate-50"}`}>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Reading the metric</p>
          <p className="mt-3 text-lg font-bold text-slate-950">
            {metric?.ready
              ? healthy
                ? "Acquisition is producing healthy contribution value."
                : "The ratio needs more margin, repeat value, or lower acquisition cost."
              : "Complete the missing attribution before using this ratio."}
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {metric?.ready
              ? `${formatCurrency(metric.averageWonValue)} average won value and ${formatCurrency(metric.paidAcquisitionCost)} paid spend are included in this period.`
              : metric?.blocker}
          </p>
        </aside>
      </div>
    </section>
  )
}

export default function AnalyticsWorkspace() {
  const [days, setDays] = useState(30)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)
  const [syncingSource, setSyncingSource] = useState("")
  const [syncMessage, setSyncMessage] = useState("")

  useEffect(() => {
    let active = true
    async function loadAnalytics() {
      setLoading(true)
      setError("")
      try {
        const response = await fetch(`/api/os/analytics?days=${days}`, {
          cache: "no-store",
          headers: await getOsAuthHeaders(),
        })
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.error || "Could not load analytics.")
        if (active) setData(payload)
      } catch (loadError) {
        if (active) setError(loadError.message)
      } finally {
        if (active) setLoading(false)
      }
    }
    loadAnalytics()
    return () => { active = false }
  }, [days, refreshKey])

  async function syncMarketingSource(source) {
    setSyncingSource(source)
    setSyncMessage("")
    const route = source === "search_console" ? "search-console" : "google-ads"
    try {
      const response = await fetch(`/api/os/analytics/sync/${route}`, {
        method: "POST",
        headers: await getOsAuthHeaders(),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "The sync could not be completed.")
      setSyncMessage(`${source === "search_console" ? "Search Console" : "Google Ads"} updated with ${payload.imported || 0} daily records.`)
      setRefreshKey((current) => current + 1)
    } catch (syncError) {
      setSyncMessage(syncError.message)
      setRefreshKey((current) => current + 1)
    } finally {
      setSyncingSource("")
    }
  }

  const metrics = data?.metrics
  const maxFunnel = Math.max(1, ...(data?.funnel || []).map((item) => item.value))
  const marketingConnections = Object.fromEntries((data?.marketing?.connections || []).map((connection) => [connection.source, connection]))

  return (
    <div className="w-full min-w-0 max-w-full space-y-5 overflow-x-hidden px-3 py-4 sm:space-y-7 sm:px-6 sm:py-6">
      <section className="relative overflow-hidden rounded-[1.75rem] bg-[radial-gradient(circle_at_88%_0%,_rgba(14,165,233,0.2),_transparent_28%),radial-gradient(circle_at_72%_110%,_rgba(251,191,36,0.12),_transparent_30%),linear-gradient(145deg,_#020617,_#111827)] text-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.03))]" aria-hidden="true" />
        <div className="relative grid gap-5 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-300">Commercial intelligence</p>
            <h1 className="mt-2 max-w-3xl text-2xl font-bold tracking-[-0.04em] text-white sm:text-4xl">Know what is moving the business.</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Follow lead flow, estimate activity, conversion, and the product lines creating demand.
            </p>
          </div>
          <div className="grid grid-cols-3 rounded-xl border border-white/10 bg-white/5 p-1 backdrop-blur">
            {PERIODS.map((period) => (
              <button
                key={period.days}
                type="button"
                onClick={() => setDays(period.days)}
                className={`rounded-lg px-3 py-2.5 text-xs font-semibold transition sm:px-4 ${days === period.days ? "bg-white text-slate-950 shadow-sm" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>
        {metrics ? (
          <div className="relative grid grid-cols-2 divide-x divide-y divide-white/10 border-t border-white/10 lg:grid-cols-4 lg:divide-y-0">
            <MetricCard eyebrow="New leads" value={metrics.leadCount} helper={data.period.label} changeValue={metrics.changes.leads} tone="blue" icon={Users} />
            <MetricCard eyebrow="Estimates sent" value={metrics.sentCount} helper={`${metrics.preparedCount} prepared`} changeValue={metrics.changes.sent} icon={Send} />
            <MetricCard eyebrow="Won opportunities" value={metrics.wonCount} helper={`${metrics.winRate}% of new leads`} changeValue={metrics.changes.won} tone="green" icon={CircleCheck} />
            <MetricCard eyebrow="Won value excl. VAT" value={formatCurrency(metrics.wonValue)} helper={`${formatCurrency(metrics.pipelineValue)} active pipeline`} changeValue={metrics.changes.wonValue} tone="dark" icon={Banknote} />
          </div>
        ) : null}
      </section>

      {error ? <section className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">{error}</section> : null}
      {data?.warnings?.length ? <section className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">{data.warnings.join(" ")}</section> : null}

      {loading || !metrics ? (
        <section className="rounded-3xl border border-slate-200 bg-white px-5 py-12 text-center text-sm text-slate-500 shadow-sm">Loading commercial performance...</section>
      ) : (
        <>
          <GrowthSignals data={data} />

          <section>
            <div className="mb-3 flex flex-wrap items-end justify-between gap-3 px-1 sm:mb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Marketing performance</p>
                <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">Search demand and paid growth</h2>
              </div>
              {!data.marketing?.schemaReady ? <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800">Analytics SQL required</span> : null}
            </div>
            <div className="grid overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.06)] lg:grid-cols-2 lg:divide-x lg:divide-slate-200">
              <MarketingSourceCard connection={marketingConnections.search_console} metrics={data.marketing?.searchConsole} type="search" schemaReady={data.marketing?.schemaReady} syncingSource={syncingSource} onSync={syncMarketingSource} />
              <MarketingSourceCard connection={marketingConnections.google_ads} metrics={data.marketing?.googleAds} type="ads" schemaReady={data.marketing?.schemaReady} syncingSource={syncingSource} onSync={syncMarketingSource} />
            </div>
            {syncMessage ? <p className={`mt-3 rounded-xl px-4 py-3 text-sm ${syncMessage.includes("updated with") ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>{syncMessage}</p> : null}
          </section>

          <LtvCacCard metric={data.commercialEfficiency} periodLabel={data.period.label} />

          <section className="grid overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.06)] xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)]">
            <article className="min-w-0 p-5 sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Commercial movement</p>
                  <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">Lead and estimate activity</h2>
                </div>
                <p className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">{data.period.label}</p>
              </div>
              <TrendChart data={data.trend} />
            </article>

            <article className="bg-[linear-gradient(155deg,_#020617,_#172033)] p-5 text-white sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">Lead cohort</p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-white">Conversion path</h2>
              <div className="mt-5 space-y-4">
                {data.funnel.map((item, index) => (
                  <div key={item.key} className="relative">
                    <div className="flex items-end justify-between gap-4">
                      <div className="flex items-center gap-3"><span className={`grid h-8 w-8 place-items-center rounded-xl text-xs font-bold ${index === data.funnel.length - 1 ? "bg-amber-400 text-slate-950" : "bg-white/10 text-white"}`}>{index + 1}</span><div><p className="text-sm font-semibold text-white">{item.label}</p><p className="text-xs text-slate-400">{item.rate}% of leads</p></div></div>
                      <p className="text-2xl font-bold text-white">{item.value}</p>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"><div className={`h-full rounded-full ${index === data.funnel.length - 1 ? "bg-amber-400" : "bg-sky-400"}`} style={{ width: `${(item.value / maxFunnel) * 100}%` }} /></div>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="grid overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.06)] lg:grid-cols-2 lg:divide-x lg:divide-slate-200">
            <article className="p-5 sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Where demand starts</p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">Lead sources</h2>
              <RankedList items={data.sources} emptyLabel="No lead-source data in this period." />
            </article>
            <article className="border-t border-slate-200 p-5 sm:p-7 lg:border-t-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">What clients want</p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">Product demand</h2>
              <RankedList items={data.products} emptyLabel="No product data in this period." accent="amber" />
            </article>
          </section>

          <section className="grid gap-4 border-t border-slate-200 px-1 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Keep the data useful</p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">CRM housekeeping</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="border-l-2 border-rose-400 py-1 pl-3 text-xs font-semibold text-rose-700">{data.attention.overdueFollowUps} overdue follow-ups</span>
                <span className="border-l-2 border-amber-400 py-1 pl-3 text-xs font-semibold text-amber-800">{data.attention.missingSource} missing sources</span>
                <span className="border-l-2 border-slate-300 py-1 pl-3 text-xs font-semibold text-slate-700">{data.attention.missingProduct} missing products</span>
              </div>
            </div>
            <Link href="/os/crm" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800">Open CRM <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
          </section>
        </>
      )}
    </div>
  )
}
