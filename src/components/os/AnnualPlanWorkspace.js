"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowDownToLine, ArrowLeft, Save } from "lucide-react"
import { getOsAuthHeaders } from "../../lib/osClientAuth"
import AnnualCommercialWorkspace from "./AnnualCommercialWorkspace"
import { emptyCommercialModel, summarizeCommercialModel } from "../../lib/annualCommercialPlan.mjs"
import { ANNUAL_ASSUMPTION_SECTIONS, MAX_ANNUAL_ASSUMPTION_LENGTH, MONTH_LABELS, TARGET_GROSS_MARGIN, deriveAnnualPlanTargets, emptyAnnualPlan, summarizeAnnualPlan, sastYearMonth } from "../../lib/annualPlan.mjs"

const money = (value) => value == null || !Number.isFinite(Number(value)) ? "—" : `R ${Number(value).toLocaleString("en-ZA", { maximumFractionDigits: 0 })}`
const num = (value) => value == null || !Number.isFinite(Number(value)) ? "—" : Number(value).toLocaleString("en-ZA", { maximumFractionDigits: 0 })
const fieldClass = "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none disabled:bg-slate-100 disabled:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"

function Metric({ label, value, note, dark }) {
  return <div className={`rounded-2xl border p-5 ${dark ? "border-[#001d2e] bg-[#001d2e] text-white" : "border-slate-200 bg-white text-slate-900"}`}><p className={`text-xs font-bold ${dark ? "text-sky-200" : "text-slate-500"}`}>{label}</p><p className="mt-3 break-words text-2xl font-black tabular-nums">{value}</p><p className={`mt-2 text-xs leading-5 ${dark ? "text-slate-300" : "text-slate-500"}`}>{note}</p></div>
}

function NumberField({ label, value, onChange, hint, integer = false, signed = false, disabled = false }) {
  return <label className="block text-xs font-bold text-slate-600">{label}<input className={fieldClass} type="number" disabled={disabled} min={signed ? undefined : "0"} step={integer ? "1" : "0.01"} value={value ?? ""} onChange={(event) => onChange(event.target.value === "" ? null : event.target.value)} placeholder="Not entered" />{hint && <span className="mt-1 block text-[11px] font-normal leading-4 text-slate-500">{hint}</span>}</label>
}

export default function AnnualPlanWorkspace() {
  const [year, setYear] = useState(2027)
  const [plan, setPlan] = useState({ ...emptyAnnualPlan(2027), commercialModel: emptyCommercialModel() })
  const [previousPlan, setPreviousPlan] = useState({ ...emptyAnnualPlan(2026), commercialModel: emptyCommercialModel() })
  const [orders, setOrders] = useState(null)
  const [previousOrders, setPreviousOrders] = useState(null)
  const [ordersAvailable, setOrdersAvailable] = useState(false)
  const [schemaReady, setSchemaReady] = useState(false)
  const [blocked, setBlocked] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(0)
  const [view, setView] = useState("overview")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const load = useCallback(async (targetYear) => {
    setLoading(true); setError(""); setMessage(""); setBlocked(false)
    try {
      const response = await fetch(`/api/os/annual-plan?year=${targetYear}`, { headers: await getOsAuthHeaders(), cache: "no-store" })
      const payload = await response.json()
      if (!response.ok) { if ([401, 403, 503].includes(response.status)) setBlocked(true); throw new Error(payload.error || "Annual plan could not be loaded.") }
      setPlan(payload.plan); setPreviousPlan(payload.previousPlan)
      setOrders(payload.orders); setPreviousOrders(payload.previousOrders)
      setOrdersAvailable(payload.ordersAvailable); setSchemaReady(payload.schemaReady); setDirty(false)
    } catch (failure) { setError(failure.message) }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { load(year) }, [year, load])

  const summary = useMemo(() => summarizeAnnualPlan(plan, orders || []), [plan, orders])
  const previous = useMemo(() => summarizeAnnualPlan(previousPlan, previousOrders || []), [previousPlan, previousOrders])
  const commercial = useMemo(() => summarizeCommercialModel(plan.commercialModel || emptyCommercialModel(), plan), [plan])
  const selected = summary.months[selectedMonth] || {}
  const now = sastYearMonth()
  const futureMonth = year > now.year || year === now.year && selectedMonth > now.month
  const isCompletePrior = previous.actualRevenueMonths === 12
  const currentCapital = summary.workingCapital ?? previous.workingCapital
  const currentCapitalLabel = summary.workingCapital != null ? `${summary.workingCapitalMonth} ${year}` : previous.workingCapital != null ? `${previous.workingCapitalMonth} ${year - 1}` : null
  const yoy = year - 1 < now.year && isCompletePrior && previous.actualRevenue > 0 && summary.projectionMonths === 12 ? (summary.projectedRevenue / previous.actualRevenue - 1) * 100 : null

  function updateMonth(field, value) {
    setPlan((current) => ({ ...current, months: current.months.map((month, index) => index === selectedMonth ? { ...month, [field]: value, ...deriveAnnualPlanTargets({ ...month, [field]: value }, current.commercialModel?.grossMarginTarget) } : month) }))
    setDirty(true); setMessage("")
  }
  function updatePlan(field, value) { setPlan((current) => ({ ...current, [field]: value })); setDirty(true); setMessage("") }
  function updateAssumption(key, value) {
    setPlan((current) => ({ ...current, assumptions: { ...current.assumptions, [key]: value } }))
    setDirty(true); setMessage("")
  }

  async function save() {
    if (!schemaReady || saving) return
    setSaving(true); setError(""); setMessage("")
    try {
      const response = await fetch(`/api/os/annual-plan?year=${year}`, { method: "PUT", headers: { ...await getOsAuthHeaders(), "Content-Type": "application/json" }, body: JSON.stringify(plan) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Could not save annual plan.")
      setPlan((current) => ({ ...current, revision: result.revision, updatedAt: result.updatedAt }))
      setDirty(false); setMessage("Annual plan saved.")
    } catch (failure) { setError(failure.message) }
    finally { setSaving(false) }
  }

  async function download() {
    setExporting(true); setError("")
    try {
      const response = await fetch(`/api/os/annual-plan/export?year=${year}`, { method: "POST", headers: { ...await getOsAuthHeaders(), "Content-Type": "application/json" }, body: JSON.stringify({ plan, previousPlan, unsaved: dirty || !plan.revision }) })
      if (!response.ok) { const result = await response.json().catch(() => ({})); throw new Error(result.error || "Could not export projection.") }
      const blob = await response.blob(); const url = URL.createObjectURL(blob)
      const anchor = document.createElement("a"); anchor.href = url; anchor.download = `smart-steel-${year}-annual-plan.pdf`; document.body.append(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url)
    } catch (failure) { setError(failure.message) }
    finally { setExporting(false) }
  }

  return <div className="min-h-screen bg-[#f5f7fa] px-4 py-6 text-slate-900 sm:px-7 lg:px-9"><div className="mx-auto max-w-[1500px] space-y-5">
    <header className="flex flex-wrap items-start justify-between gap-4"><div><Link href="/os/analytics" className="inline-flex items-center gap-1 text-xs font-bold text-sky-700"><ArrowLeft size={14} /> Analytics</Link><p className="mt-5 text-[10px] font-black uppercase tracking-[0.2em] text-sky-700">Smart Steel · Annual planning</p><h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">{year} annual commercial plan</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Connect the sales plan to accounting results. Actuals, targets and projections are kept separate.</p></div><div className="flex flex-wrap items-center gap-2"><label className="text-xs font-bold text-slate-600">Year <select value={year} onChange={(event) => { if (dirty && !window.confirm("Discard unsaved changes and change year?")) return; setYear(Number(event.target.value)); setSelectedMonth(0) }} className="ml-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">{Array.from({ length: 76 }, (_, index) => 2025 + index).map((option) => <option key={option}>{option}</option>)}</select></label><button onClick={save} disabled={!dirty || !schemaReady || saving || loading} className="inline-flex items-center gap-2 rounded-lg bg-[#0043f3] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-40"><Save size={15} />{saving ? "Saving…" : "Save plan"}</button><button onClick={download} disabled={loading || exporting} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold disabled:opacity-40"><ArrowDownToLine size={15} />{exporting ? "Exporting…" : "Export PDF"}</button></div></header>
    {loading ? <p role="status" className="rounded-xl bg-white p-6 text-sm text-slate-500">Loading annual plan…</p> : blocked ? <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">{error}</p> : <>
      {!schemaReady && <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Annual planning storage is not installed yet. Run <code>supabase/smart_steel_os_annual_plan.sql</code> in Supabase to enable saving. You can still draft and export locally.</p>}
      {!ordersAvailable && <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Accepted-order counts are unavailable. Jobs sold cannot be verified from the CRM right now.</p>}
      {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">{error}</p>}{message && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">{message}</p>}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Revenue · actual entered" value={summary.actualRevenueMonths ? money(summary.actualRevenue) : "—"} note={`${summary.actualRevenueMonths}/12 months entered · excl. VAT`} dark /><Metric label="Gross profit · projection" value={summary.projectedGrossProfitMonths === 12 ? money(summary.projectedGrossProfit) : "Incomplete"} note={`Actual entered: ${summary.actualGrossProfitMonths ? money(summary.actualGrossProfit) : "—"} · ${summary.actualGrossProfitMonths}/12 months`} /><Metric label="Monthly fixed expenses" value={summary.fixedExpenseMonths ? money(summary.fixedExpenses / summary.fixedExpenseMonths) : "—"} note={`${summary.fixedExpenseCompleteMonths}/12 months fully itemised · salaries + insurance + other`} /><Metric label="Jobs sold · accepted orders" value={ordersAvailable ? num(summary.actualJobs) : "—"} note={ordersAvailable ? `${summary.acceptedOrders} recorded + ${summary.actualJobs - summary.acceptedOrders} manual additions` : "CRM orders unavailable"} /></section>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Gap to management target" value={money(commercial.objectiveGap)} note={commercial.gapBasis ? `${commercial.gapBasis} · ${commercial.objectiveAchievement == null ? "—" : `${(commercial.objectiveAchievement * 100).toFixed(1)}%`} achieved` : "Complete the forecast or planning targets"} /><Metric label="Working capital · latest snapshot" value={money(currentCapital)} note={currentCapitalLabel ? `Latest entered: ${currentCapitalLabel}` : "Enter a month-end snapshot"} /><Metric label={`Successful ${year} turnover`} value={money(summary.turnoverGoal)} note="Leadership's annual revenue goal · excl. VAT" /><Metric label={`${year} current forecast`} value={commercial.forecastRevenue != null ? money(commercial.forecastRevenue) : "Incomplete"} note={commercial.forecastRevenue == null ? `${commercial.forecastMonthsEntered}/12 forecast months · planning proxy ${money(commercial.planningProjection)}` : `${commercial.forecastMonthsEntered}/12 months · accounting actuals + entered future forecast`} dark /></section>
      <div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-lg font-black">Annual assumptions</h2><p className="mt-1 text-xs text-slate-500">Set the turnover that would make {year} a success. Add the commercial context, funding needs and evidence behind the numbers.</p></div><div className="w-full sm:w-64"><NumberField label="Successful turnover goal · R excl. VAT" value={plan.turnoverGoal} onChange={(value) => updatePlan("turnoverGoal", value)} /></div></div><div className="mt-5 grid gap-4 lg:grid-cols-2">{ANNUAL_ASSUMPTION_SECTIONS.map(({ key, label, placeholder }) => <label key={key} className="block rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs font-bold text-slate-700"><span>{label}</span><textarea value={plan.assumptions?.[key] || ""} onChange={(event) => updateAssumption(key, event.target.value)} maxLength={MAX_ANNUAL_ASSUMPTION_LENGTH} rows={3} placeholder={placeholder} className={`${fieldClass} resize-y font-normal`} /></label>)}</div><p className="mt-3 text-xs text-slate-500">Use concrete figures, dates and named dependencies where known. Distinguish confirmed facts from assumptions; save the plan to keep your changes.</p></div>
      <nav className="flex gap-2 border-b border-slate-200" aria-label="Annual plan views">{[["overview", "Year at a glance"], ["commercial", "Commercial model"], ["inputs", "Monthly inputs"]].map(([key, label]) => <button key={key} onClick={() => setView(key)} className={`border-b-2 px-4 py-3 text-sm font-bold ${view === key ? "border-[#0043f3] text-[#0043f3]" : "border-transparent text-slate-500"}`}>{label}</button>)}</nav>
      {view === "commercial" ? <AnnualCommercialWorkspace plan={plan} onChange={(commercialModel) => updatePlan("commercialModel", commercialModel)} selectedMonth={selectedMonth} onMonthChange={setSelectedMonth} /> : view === "overview" ? <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="p-5"><h2 className="text-lg font-black">Monthly plan</h2><p className="mt-1 text-xs text-slate-500">A completed month’s entered actual replaces its calculated target in the projection. Blank accounting fields remain missing, never zero.</p></div><div className="overflow-x-auto"><table className="w-full min-w-[1040px] text-left text-xs"><thead className="bg-[#001d2e] text-white"><tr>{["Month", "Revenue actual", "Revenue target", "Projection", "GP actual", "GP target", "Fixed expenses", "Jobs sold", "Jobs target", "Working capital"].map((name) => <th className="px-3 py-3" key={name}>{name}</th>)}</tr></thead><tbody>{summary.months.map((month) => <tr className="border-t even:bg-slate-50" key={month.month}><th className="px-3 py-3">{month.month}</th><td className="px-3">{money(month.actualRevenue)}</td><td className="px-3">{money(month.targetRevenue)}</td><td className="px-3 font-bold">{money(month.projectedRevenue)}</td><td className="px-3">{money(month.actualGrossProfit)}</td><td className="px-3">{money(month.targetGrossProfit)}</td><td className="px-3">{[month.salaries, month.insurance, month.otherFixedExpenses].some((value) => value != null) ? money(month.fixedExpenses) : "—"}</td><td className="px-3">{ordersAvailable ? month.actualJobs : "—"}</td><td className="px-3">{num(month.targetJobs)}</td><td className="px-3">{money(month.workingCapital)}</td></tr>)}</tbody></table></div><div className="border-t bg-slate-50 p-4 text-xs leading-5 text-slate-600">Previous-year revenue: {previous.actualRevenueMonths === 12 ? money(previous.actualRevenue) : `${previous.actualRevenueMonths}/12 months entered`}. Year-on-year change appears only after all 12 previous-year actual months and all 12 projected months are present. CRM order counts cover orders captured in the OS; use manual additions for earlier or offline sales.</div></section> : <section className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-black">Monthly inputs</h2><p className="mt-1 text-xs text-slate-500">Accounting actuals exclude VAT. Leave unknown values empty; enter zero only when confirmed.</p></div><select aria-label="Input month" value={selectedMonth} onChange={(event) => setSelectedMonth(Number(event.target.value))} className="rounded-lg border border-slate-200 bg-white px-4 py-2 font-bold">{MONTH_LABELS.map((month, index) => <option key={month} value={index}>{month} {year}</option>)}</select></div><div className="mt-5 grid gap-5 lg:grid-cols-2"><div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><h3 className="font-black">Actuals & fixed-cost budget</h3>{futureMonth && <p className="mt-1 text-xs text-slate-500">Actual revenue, profit, working capital and offline jobs unlock when this month begins.</p>}<div className="mt-4 grid gap-4 sm:grid-cols-2"><NumberField label="Revenue · R" disabled={futureMonth} value={selected.actualRevenue} onChange={(value) => updateMonth("actualRevenue", value)} /><NumberField label="Gross profit · R" signed disabled={futureMonth} value={selected.actualGrossProfit} onChange={(value) => updateMonth("actualGrossProfit", value)} /><NumberField label="Salaries · R" value={selected.salaries} onChange={(value) => updateMonth("salaries", value)} /><NumberField label="Insurance · R" value={selected.insurance} onChange={(value) => updateMonth("insurance", value)} /><NumberField label="Other fixed expenses · R" value={selected.otherFixedExpenses} onChange={(value) => updateMonth("otherFixedExpenses", value)} /><NumberField label="Working capital · R" signed disabled={futureMonth} value={selected.workingCapital} onChange={(value) => updateMonth("workingCapital", value)} hint="Month-end current assets less current liabilities." /><NumberField label="Additional jobs sold" disabled={futureMonth} value={selected.additionalJobs} onChange={(value) => updateMonth("additionalJobs", value)} integer hint={`Outside the OS · ${ordersAvailable ? orders?.[selectedMonth]?.count || 0 : "—"} accepted orders recorded.`} /></div></div><div className="rounded-xl border border-slate-200 bg-sky-50 p-4"><h3 className="font-black">Targets & forecast drivers</h3><div className="mt-4 grid gap-4 sm:grid-cols-2"><NumberField label="Jobs sold target" value={selected.targetJobs} onChange={(value) => updateMonth("targetJobs", value)} integer /><NumberField label="Management forecast · R" value={selected.managementForecast} onChange={(value) => updateMonth("managementForecast", value)} hint="Best current revenue estimate for this month. Distinct from target and recognised actual." /><NumberField label="Average selling price · R per job" value={selected.targetSellingPrice} onChange={(value) => updateMonth("targetSellingPrice", value)} hint="Expected accepted order value, excl. VAT." /><div className="rounded-xl border border-sky-200 bg-white p-3"><p className="text-xs font-bold text-slate-600">Revenue target · calculated</p><p className="mt-2 text-lg font-black text-[#001d2e]">{money(selected.targetRevenue)}</p><p className="mt-1 text-[11px] text-slate-500">Jobs target × average selling price</p></div><div className="rounded-xl border border-sky-200 bg-white p-3"><p className="text-xs font-bold text-slate-600">Gross profit target · calculated</p><p className="mt-2 text-lg font-black text-[#001d2e]">{money(selected.targetGrossProfit)}</p><p className="mt-1 text-[11px] text-slate-500">{(plan.commercialModel?.grossMarginTarget ?? TARGET_GROSS_MARGIN) * 100}% of revenue target</p></div></div><p className="mt-5 rounded-lg bg-white p-3 text-xs leading-5 text-slate-600">These are planning proxies based on expected bookings. Actual accounting revenue and gross profit may fall in different months as jobs progress.</p></div></div><div className="mt-5 flex flex-wrap gap-2">{MONTH_LABELS.map((month, index) => <button key={month} onClick={() => setSelectedMonth(index)} className={`rounded-lg px-3 py-2 text-xs font-bold ${selectedMonth === index ? "bg-[#0043f3] text-white" : "bg-slate-100 text-slate-600"}`}>{month}</button>)}</div></section>}
      <p className="pb-6 text-xs leading-5 text-slate-500">Manual financial entries are planning records, not a replacement for signed-off accounts. A saved plan is shared across authorised Smart Steel OS users. {dirty ? "You have unsaved changes." : plan.updatedAt ? `Last saved ${new Date(plan.updatedAt).toLocaleString("en-ZA")}.` : "No saved revision yet."}</p>
    </>}
  </div></div>
}
