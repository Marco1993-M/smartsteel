"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowUpRight, Banknote, CircleCheck, Eye, Megaphone, MousePointerClick, Search, Send, Users } from "lucide-react"
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
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${positive ? "text-emerald-700" : negative ? "text-rose-700" : dark ? "text-slate-400" : "text-slate-500"}`}>
      {positive ? <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" /> : null}
      {positive ? "+" : ""}{number}% vs previous period
    </span>
  )
}

function MetricCard({ eyebrow, value, helper, changeValue, tone = "white", icon: Icon }) {
  const tones = {
    white: "border-slate-200 bg-white text-slate-950",
    blue: "border-sky-200 bg-[linear-gradient(145deg,_#f0f9ff,_#ffffff)] text-slate-950",
    dark: "border-slate-950 bg-[linear-gradient(145deg,_#020617,_#172033)] text-white",
    green: "border-emerald-200 bg-[linear-gradient(145deg,_#ecfdf5,_#ffffff)] text-slate-950",
  }
  return (
    <article className={`relative min-w-0 overflow-hidden rounded-[1.6rem] border p-4 shadow-[0_8px_30px_rgba(15,23,42,0.05)] sm:p-5 ${tones[tone]}`}>
      <div className="flex items-start justify-between gap-3">
        <p className={`text-[10px] font-semibold uppercase tracking-[0.18em] sm:text-[11px] ${tone === "dark" ? "text-slate-400" : "text-slate-500"}`}>{eyebrow}</p>
        {Icon ? <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl ${tone === "dark" ? "bg-white/10 text-sky-300" : "bg-slate-950 text-white"}`}><Icon className="h-4 w-4" aria-hidden="true" /></span> : null}
      </div>
      <p className="mt-3 break-words text-[1.35rem] font-bold leading-none tracking-[-0.04em] sm:text-3xl">{value}</p>
      <p className={`mt-2 truncate text-xs sm:text-sm ${tone === "dark" ? "text-slate-300" : "text-slate-600"}`}>{helper}</p>
      {changeValue !== undefined ? <div className={`mt-3 border-t pt-3 ${tone === "dark" ? "border-white/10" : "border-slate-200/70"}`}><ChangeBadge value={changeValue} dark={tone === "dark"} /></div> : null}
    </article>
  )
}

function TrendChart({ data }) {
  const width = 720
  const height = 220
  const inset = 26
  const maxValue = Math.max(1, ...data.flatMap((item) => [item.leads, item.estimatesSent]))
  const point = (value, index) => {
    const x = data.length === 1 ? width / 2 : inset + (index / (data.length - 1)) * (width - inset * 2)
    const y = height - inset - (value / maxValue) * (height - inset * 2)
    return [x, y]
  }
  const path = (key) => data.map((item, index) => point(item[key], index).join(",")).join(" ")

  return (
    <div className="mt-5">
      <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-600">
        <span className="inline-flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-sky-600" />Leads created</span>
        <span className="inline-flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-amber-400" />Estimates sent</span>
      </div>
      <div className="mt-3 overflow-hidden rounded-[1.4rem] border border-slate-100 bg-[linear-gradient(180deg,_#f8fafc,_#ffffff)] px-2 pt-3">
        <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Lead and estimate trend" className="h-auto w-full">
          <defs>
            <linearGradient id="lead-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((ratio) => (
            <line key={ratio} x1={inset} x2={width - inset} y1={height * ratio} y2={height * ratio} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="5 7" />
          ))}
          <polygon points={`${point(0, 0).join(",")} ${path("leads")} ${point(0, data.length - 1).join(",")}`} fill="url(#lead-area)" />
          <polyline points={path("leads")} fill="none" stroke="#0284c7" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points={path("estimatesSent")} fill="none" stroke="#fbbf24" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          {data.map((item, index) => {
            const [leadX, leadY] = point(item.leads, index)
            const [sentX, sentY] = point(item.estimatesSent, index)
            return (
              <g key={item.key}>
                <circle cx={leadX} cy={leadY} r="5" fill="#0284c7"><title>{`${item.label}: ${item.leads} leads`}</title></circle>
                <circle cx={sentX} cy={sentY} r="5" fill="#fbbf24"><title>{`${item.label}: ${item.estimatesSent} estimates sent`}</title></circle>
              </g>
            )
          })}
        </svg>
        <div className="grid grid-cols-3 gap-2 px-3 pb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400 sm:text-xs">
          <span>{data[0]?.label}</span>
          <span className="text-center">{data[Math.floor(data.length / 2)]?.label}</span>
          <span className="text-right">{data[data.length - 1]?.label}</span>
        </div>
      </div>
    </div>
  )
}

function RankedList({ items, emptyLabel, accent = "sky" }) {
  const max = Math.max(1, ...items.map((item) => item.value))
  const barClass = accent === "amber" ? "bg-amber-400" : "bg-sky-600"
  const numberClass = accent === "amber" ? "bg-amber-50 text-amber-900" : "bg-sky-50 text-sky-800"
  if (!items.length) return <p className="mt-5 text-sm text-slate-500">{emptyLabel}</p>
  return (
    <div className="mt-5 space-y-4">
      {items.map((item, index) => (
        <div key={item.label}>
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="flex min-w-0 items-center gap-2.5 truncate font-semibold text-slate-800"><i className={`grid h-6 w-6 shrink-0 place-items-center rounded-lg text-[10px] not-italic ${numberClass}`}>{index + 1}</i><span className="truncate">{item.label}</span></span>
            <span className="shrink-0 font-bold text-slate-950">{item.value}</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className={`h-full rounded-full ${barClass}`} style={{ width: `${Math.max(5, (item.value / max) * 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function MarketingMetric({ label, value, icon: Icon, helper }) {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-200/80 bg-white/80 p-3.5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">{label}</p>
        <Icon className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
      </div>
      <p className="mt-2 truncate text-xl font-bold tracking-tight text-slate-950">{value}</p>
      {helper ? <p className="mt-1 truncate text-[11px] text-slate-500">{helper}</p> : null}
    </div>
  )
}

function MarketingSourceCard({ connection, metrics, type }) {
  const isSearch = type === "search"
  const connected = connection?.status === "connected"
  const syncing = connection?.status === "syncing"
  const hasData = connected && (metrics?.impressions > 0 || metrics?.clicks > 0 || metrics?.cost > 0)
  const SourceIcon = isSearch ? Search : Megaphone
  const title = isSearch ? "Google Search Console" : "Google Ads"
  const accent = isSearch ? "text-sky-700 bg-sky-100" : "text-amber-800 bg-amber-100"

  return (
    <article className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-[linear-gradient(145deg,_#ffffff,_#f8fafc)] shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
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
          <div className="mt-5 grid grid-cols-2 gap-2.5">
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
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white/70 p-4">
            <p className="text-sm font-semibold text-slate-800">{connection?.status === "error" ? connection.lastError || "The last sync needs attention." : "The reporting surface is ready."}</p>
            <p className="mt-1.5 text-xs leading-5 text-slate-500">{isSearch ? "Connect the Smart Steel property to bring clicks, impressions, CTR, and search position into this page." : "Connect the advertising account to bring spend, conversions, cost per lead, and campaign return into this page."}</p>
          </div>
        )}

        <p className="mt-4 text-[11px] font-medium text-slate-400">{formatSyncDate(connection?.lastSyncedAt)}</p>
      </div>
      <div className={`h-1 ${isSearch ? "bg-sky-500" : "bg-amber-400"}`} />
    </article>
  )
}

export default function AnalyticsWorkspace() {
  const [days, setDays] = useState(30)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

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
  }, [days])

  const metrics = data?.metrics
  const maxFunnel = Math.max(1, ...(data?.funnel || []).map((item) => item.value))
  const marketingConnections = Object.fromEntries((data?.marketing?.connections || []).map((connection) => [connection.source, connection]))

  return (
    <div className="w-full min-w-0 max-w-full space-y-4 overflow-x-hidden px-3 py-4 sm:space-y-6 sm:px-6 sm:py-6">
      <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-[radial-gradient(circle_at_88%_12%,_rgba(56,189,248,0.16),_transparent_28%),linear-gradient(135deg,_#ffffff_0%,_#f8fafc_70%)] shadow-[0_14px_45px_rgba(15,23,42,0.06)]">
        <div className="absolute -right-12 -top-14 h-40 w-40 rounded-full border-[22px] border-sky-100/70" aria-hidden="true" />
        <div className="relative grid gap-5 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">Commercial growth</p>
            <h1 className="mt-2 max-w-3xl text-2xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl">Know what is moving the business.</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Follow lead flow, estimate activity, conversion, and the product lines creating demand.
            </p>
          </div>
          <div className="grid grid-cols-3 rounded-2xl border border-slate-200 bg-white/80 p-1 shadow-sm backdrop-blur">
            {PERIODS.map((period) => (
              <button
                key={period.days}
                type="button"
                onClick={() => setDays(period.days)}
                className={`rounded-xl px-3 py-2.5 text-xs font-semibold transition sm:px-4 ${days === period.days ? "bg-slate-950 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>
        <div className="h-1 bg-[linear-gradient(90deg,_#0284c7,_#38bdf8_55%,_#fbbf24)]" />
      </section>

      {error ? <section className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">{error}</section> : null}
      {data?.warnings?.length ? <section className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">{data.warnings.join(" ")}</section> : null}

      {loading || !metrics ? (
        <section className="rounded-3xl border border-slate-200 bg-white px-5 py-12 text-center text-sm text-slate-500 shadow-sm">Loading commercial performance...</section>
      ) : (
        <>
          <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <MetricCard eyebrow="New leads" value={metrics.leadCount} helper={data.period.label} changeValue={metrics.changes.leads} tone="blue" icon={Users} />
            <MetricCard eyebrow="Estimates sent" value={metrics.sentCount} helper={`${metrics.preparedCount} prepared`} changeValue={metrics.changes.sent} icon={Send} />
            <MetricCard eyebrow="Won opportunities" value={metrics.wonCount} helper={`${metrics.winRate}% of new leads`} changeValue={metrics.changes.won} tone="green" icon={CircleCheck} />
            <MetricCard eyebrow="Won value excl. VAT" value={formatCurrency(metrics.wonValue)} helper={`${formatCurrency(metrics.pipelineValue)} active pipeline`} changeValue={metrics.changes.wonValue} tone="dark" icon={Banknote} />
          </section>

          <section>
            <div className="mb-3 flex flex-wrap items-end justify-between gap-3 px-1 sm:mb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Marketing performance</p>
                <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">Search demand and paid growth</h2>
              </div>
              {!data.marketing?.schemaReady ? <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800">Analytics SQL required</span> : null}
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <MarketingSourceCard connection={marketingConnections.search_console} metrics={data.marketing?.searchConsole} type="search" />
              <MarketingSourceCard connection={marketingConnections.google_ads} metrics={data.marketing?.googleAds} type="ads" />
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)]">
            <article className="min-w-0 rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.05)] sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Commercial movement</p>
                  <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">Lead and estimate activity</h2>
                </div>
                <p className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">{data.period.label}</p>
              </div>
              <TrendChart data={data.trend} />
            </article>

            <article className="rounded-[1.75rem] border border-slate-950 bg-[linear-gradient(155deg,_#020617,_#172033)] p-5 text-white shadow-[0_14px_40px_rgba(15,23,42,0.16)] sm:p-6">
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

          <section className="grid gap-4 lg:grid-cols-2">
            <article className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.05)] sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Where demand starts</p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">Lead sources</h2>
              <RankedList items={data.sources} emptyLabel="No lead-source data in this period." />
            </article>
            <article className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.05)] sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">What clients want</p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">Product demand</h2>
              <RankedList items={data.products} emptyLabel="No product data in this period." accent="amber" />
            </article>
          </section>

          <section className="grid gap-4 rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.05)] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Keep the data useful</p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">CRM housekeeping</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">{data.attention.overdueFollowUps} overdue follow-ups</span>
                <span className="rounded-full bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">{data.attention.missingSource} missing sources</span>
                <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">{data.attention.missingProduct} missing products</span>
              </div>
            </div>
            <Link href="/os/crm" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800">Open CRM <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
          </section>
        </>
      )}
    </div>
  )
}
