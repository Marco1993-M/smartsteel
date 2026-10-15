"use client"

import { useMemo, useState } from "react"
import { MONTH_LABELS, sastYearMonth } from "../../lib/annualPlan.mjs"
import { EXECUTION_STATUSES, emptyExecutionModel, summarizeExecution } from "../../lib/annualExecution.mjs"
import { summarizeCommercialModel } from "../../lib/annualCommercialPlan.mjs"

const panel = "rounded-2xl border border-slate-200 bg-white p-5"
const field = "mt-1 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
const money = (value) => value == null ? "—" : `R ${Math.round(value).toLocaleString("en-ZA")}`
const number = (value) => value == null ? "—" : Number(value).toLocaleString("en-ZA", { maximumFractionDigits: 1 })

function Input({ label, value, onChange, type = "text", min, max, step, rows, placeholder, disabled = false }) {
  const props = { value: value ?? "", onChange: (event) => onChange(type === "number" ? event.target.value === "" ? null : Number(event.target.value) : event.target.value), className: field, placeholder }
  return <label className="block text-xs font-semibold text-slate-600">{label}{rows ? <textarea {...props} rows={rows} maxLength={1500} disabled={disabled} /> : <input {...props} type={type} min={min} max={max} step={step} disabled={disabled} maxLength={type === "text" ? 500 : undefined} />}</label>
}

function Select({ label, value, onChange, options }) {
  return <label className="block text-xs font-semibold text-slate-600">{label}<select className={field} value={value || ""} onChange={(event) => onChange(event.target.value)}>{options.map(([key, name]) => <option key={key} value={key}>{name}</option>)}</select></label>
}

function Summary({ label, value, note }) {
  return <div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-500">{label}</p><p className="mt-1 text-xl font-bold text-slate-950">{value}</p><p className="mt-1 text-[11px] leading-4 text-slate-500">{note}</p></div>
}

function Section({ eyebrow, title, description, children }) {
  return <section className={panel}><p className="text-[10px] font-bold uppercase tracking-[.18em] text-blue-700">{eyebrow}</p><h2 className="mt-1 text-lg font-bold text-slate-950">{title}</h2><p className="mt-1 text-xs leading-5 text-slate-600">{description}</p><div className="mt-5">{children}</div></section>
}

export default function AnnualExecutionWorkspace({ plan, onChange, selectedMonth, onMonthChange }) {
  const [tab, setTab] = useState("initiatives")
  const model = plan.commercialModel
  const execution = model.execution || emptyExecutionModel()
  const report = useMemo(() => summarizeCommercialModel(model, plan), [model, plan])
  const summary = useMemo(() => summarizeExecution(execution), [execution])
  const setExecution = (changes) => onChange({ ...model, execution: { ...execution, ...changes } })
  const update = (collection, id, changes) => setExecution({ [collection]: execution[collection].map((item) => item.id === id ? { ...item, ...changes } : item) })
  const remove = (collection, id) => setExecution({ [collection]: execution[collection].filter((item) => item.id !== id) })
  const add = (collection, item) => setExecution({ [collection]: [...execution[collection], { id: crypto.randomUUID(), ...item }] })
  const owners = [["", "Unassigned"], ...execution.owners.map((item) => [item.id, item.name || "Unnamed owner"])]
  const statusOptions = EXECUTION_STATUSES
  const nameOf = (id) => execution.owners.find((item) => item.id === id)?.name || "Unassigned"
  const futureYear = plan.year > sastYearMonth().year

  return <div className="space-y-5">
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Summary label="Initiatives with detail" value={summary.initiativesActive} note={`${summary.initiativesOnTrack} on track or complete`} />
      <Summary label="Overdue milestones" value={summary.overdueMilestones.length} note="Open milestones past their deadline" />
      <Summary label="High-rated risks" value={summary.highRisks.length} note="Probability × impact ≥ 15" />
      <Summary label="Capital requested" value={money(summary.capitalRequired)} note="Management-entered needs; no funding implied" />
    </div>
    <nav aria-label="Execution and investment sections" className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-2">{[
      ["initiatives", "Initiatives"], ["milestones", "Milestones"], ["capacity", "Capacity"], ["risks", "Risks"],
      ["review", "Monthly review"], ["capital", "Capital plan"], ["markets", "Markets"], ["customers", "Customers"], ["assumptions", "Assumption evidence"], ["evidence", "Investment readiness"], ["owners", "Owners"],
    ].map(([key, label]) => <button type="button" key={key} onClick={() => setTab(key)} aria-current={tab === key ? "page" : undefined} className={`rounded-lg px-3 py-2 text-xs font-bold ${tab === key ? "bg-[#001d2e] text-white" : "text-slate-600 hover:bg-slate-100"}`}>{label}</button>)}</nav>

    {tab === "initiatives" && <Section eyebrow="Growth drivers · accountable actions" title="Strategic initiatives" description="Track outcomes, ownership, budget and next action. Names are starting points; leave unknown numbers empty.">
      <div className="space-y-3">{execution.initiatives.map((item) => <article key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4"><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Input label="Initiative" value={item.name} onChange={(name) => update("initiatives", item.id, { name })} />
        <Select label="Owner" value={item.ownerId} onChange={(ownerId) => update("initiatives", item.id, { ownerId })} options={owners} />
        <Select label="Status" value={item.status} onChange={(status) => update("initiatives", item.id, { status })} options={statusOptions} />
        <Input label="Target date" type="date" value={item.targetDate} onChange={(targetDate) => update("initiatives", item.id, { targetDate })} />
        <Input label="Strategic objective" value={item.objective} onChange={(objective) => update("initiatives", item.id, { objective })} />
        <Input label="Measure / KPI" value={item.kpi} onChange={(kpi) => update("initiatives", item.id, { kpi })} />
        <Input label="KPI target" type="number" min="0" value={item.kpiTarget} onChange={(kpiTarget) => update("initiatives", item.id, { kpiTarget })} />
        <Input label="KPI actual" type="number" min="0" disabled={futureYear} value={item.kpiActual} onChange={(kpiActual) => update("initiatives", item.id, { kpiActual })} />
        <Input label="Budget · R" type="number" min="0" value={item.budget} onChange={(budget) => update("initiatives", item.id, { budget })} />
        <Input label="Actual spend · R" type="number" min="0" disabled={futureYear} value={item.actualSpend} onChange={(actualSpend) => update("initiatives", item.id, { actualSpend })} />
        <Input label="Revenue enabled · R" type="number" min="0" value={item.revenueEnabled} onChange={(revenueEnabled) => update("initiatives", item.id, { revenueEnabled })} />
        <Input label="GP enabled · R" type="number" min="0" value={item.gpEnabled} onChange={(gpEnabled) => update("initiatives", item.id, { gpEnabled })} />
        <div className="md:col-span-2"><Input label="Next action" value={item.nextAction} onChange={(nextAction) => update("initiatives", item.id, { nextAction })} /></div>
        <div className="md:col-span-2"><Input label="Main risk or dependency" value={item.risk} onChange={(risk) => update("initiatives", item.id, { risk })} /></div>
      </div><label className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-700"><input type="checkbox" checked={Boolean(item.partnership?.enabled)} onChange={(event) => update("initiatives", item.id, { partnership: { ...item.partnership, enabled: event.target.checked } })} />Track partner rollout and commercial results</label>
      {item.partnership?.enabled && <div className="mt-3 grid gap-3 rounded-xl border border-sky-100 bg-white p-4 md:grid-cols-2 xl:grid-cols-4">{[
        ["branchesTarget", "Participating branches · target"], ["branchesActive", "Branches active"], ["leads", "Leads generated"], ["quotes", "Quotes issued"],
        ["quotedValue", "Quoted value · R"], ["orders", "Orders won"], ["orderValue", "Won order value · R"], ["recognisedRevenue", "Recognised revenue · R"],
        ["grossProfit", "Recognised gross profit · R"], ["workingCapital", "Working capital used · R"],
      ].map(([key, label]) => <Input key={key} label={label} type="number" min="0" disabled={futureYear && key !== "branchesTarget"} value={item.partnership[key]} onChange={(value) => update("initiatives", item.id, { partnership: { ...item.partnership, [key]: value } })} />)}<Input label="Launch date" type="date" value={item.partnership.launchDate} onChange={(launchDate) => update("initiatives", item.id, { partnership: { ...item.partnership, launchDate } })} /><div className="self-end text-xs text-slate-600">Orders / leads: <strong>{item.partnership.leads > 0 && item.partnership.orders != null ? `${(item.partnership.orders / item.partnership.leads * 100).toFixed(1)}%` : "—"}</strong></div><p className="text-[11px] text-slate-500 md:col-span-2 xl:col-span-4">Partner results are management-entered. Reconcile revenue and GP with accounting records before external use.</p></div>}
      <button type="button" onClick={() => remove("initiatives", item.id)} className="mt-3 text-xs font-semibold text-rose-700">Remove initiative</button></article>)}</div>
      <button type="button" onClick={() => add("initiatives", { name: "New initiative", status: "not_started" })} className="mt-3 rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold">Add initiative</button>
    </Section>}

    {tab === "milestones" && <Section eyebrow="Quarterly roadmap" title="Measurable milestones" description="Each milestone should have a result, owner and due date. Completion is recorded separately from its target date.">
      <div className="space-y-3">{execution.milestones.map((item) => <article key={item.id} className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-3 xl:grid-cols-6">
        <Select label="Quarter" value={String(item.quarter)} onChange={(quarter) => update("milestones", item.id, { quarter: Number(quarter) })} options={[["1", "Q1 · Prove"], ["2", "Q2 · Validate"], ["3", "Q3 · Scale"], ["4", "Q4 · Optimise"]]} />
        <div className="md:col-span-2"><Input label="Measurable result" value={item.result} onChange={(result) => update("milestones", item.id, { result })} /></div>
        <Select label="Owner" value={item.ownerId} onChange={(ownerId) => update("milestones", item.id, { ownerId })} options={owners} />
        <Input label="Deadline" type="date" value={item.deadline} onChange={(deadline) => update("milestones", item.id, { deadline })} />
        <Select label="Status" value={item.status} onChange={(status) => update("milestones", item.id, { status })} options={statusOptions} />
        <Input label="Completed on" type="date" value={item.completedAt} onChange={(completedAt) => update("milestones", item.id, { completedAt })} />
        <div className="md:col-span-2 xl:col-span-4"><Input label="Evidence / notes" value={item.notes} onChange={(notes) => update("milestones", item.id, { notes })} /></div>
        <button type="button" onClick={() => remove("milestones", item.id)} className="self-end py-2 text-left text-xs font-semibold text-rose-700">Remove</button>
      </article>)}</div><button type="button" onClick={() => add("milestones", { quarter: 1, result: "", status: "not_started" })} className="mt-3 rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold">Add milestone</button>
    </Section>}

    {tab === "capacity" && <Section eyebrow="Growth constraints" title="Capacity and interventions" description="Use one consistent unit per constraint. Utilisation is required ÷ current capacity; blank capacity stays unknown.">
      <div className="space-y-3">{execution.constraints.map((item) => <article key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4"><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Input label="Constraint" value={item.name} onChange={(name) => update("constraints", item.id, { name })} placeholder="Manufacturing, logistics, funding…" />
        <Input label="Unit" value={item.unit} onChange={(unit) => update("constraints", item.id, { unit })} placeholder="jobs / month" />
        <Input label="Current capacity" type="number" min="0" value={item.currentCapacity} onChange={(currentCapacity) => update("constraints", item.id, { currentCapacity })} />
        <Input label="Required capacity" type="number" min="0" value={item.requiredCapacity} onChange={(requiredCapacity) => update("constraints", item.id, { requiredCapacity })} />
        <Select label="Severity" value={item.severity} onChange={(severity) => update("constraints", item.id, { severity })} options={[["low", "Low"], ["medium", "Medium"], ["high", "High"]]} />
        <Select label="Owner" value={item.ownerId} onChange={(ownerId) => update("constraints", item.id, { ownerId })} options={owners} />
        <Input label="Intervention cost · R" type="number" min="0" value={item.cost} onChange={(cost) => update("constraints", item.id, { cost })} />
        <Input label="Deadline" type="date" value={item.deadline} onChange={(deadline) => update("constraints", item.id, { deadline })} />
        <div className="md:col-span-2 xl:col-span-3"><Input label="Intervention" value={item.intervention} onChange={(intervention) => update("constraints", item.id, { intervention })} /></div>
        <Select label="Status" value={item.status} onChange={(status) => update("constraints", item.id, { status })} options={statusOptions} />
      </div><div className="mt-2 flex justify-between text-xs text-slate-600"><span>Required / current: {item.currentCapacity > 0 && item.requiredCapacity != null ? `${number(item.requiredCapacity / item.currentCapacity * 100)}%` : "Insufficient data"}</span><button type="button" onClick={() => remove("constraints", item.id)} className="font-semibold text-rose-700">Remove</button></div></article>)}</div><button type="button" onClick={() => add("constraints", { name: "", severity: "medium", status: "not_started" })} className="mt-3 rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold">Add constraint</button>
    </Section>}

    {tab === "risks" && <Section eyebrow="Risk register" title="Risks and dependencies" description="Probability and impact use a 1–5 management scale. A score is a prioritisation aid, not a quantified loss estimate.">
      <div className="space-y-3">{execution.risks.map((item) => <article key={item.id} className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2 xl:grid-cols-4">
        <Input label="Risk" value={item.name} onChange={(name) => update("risks", item.id, { name })} />
        <Input label="Category" value={item.category} onChange={(category) => update("risks", item.id, { category })} placeholder="Working capital, supplier…" />
        <Select label="Owner" value={item.ownerId} onChange={(ownerId) => update("risks", item.id, { ownerId })} options={owners} />
        <Select label="Status" value={item.status} onChange={(status) => update("risks", item.id, { status })} options={statusOptions} />
        <Input label="Probability · 1–5" type="number" min="1" max="5" step="1" value={item.probability} onChange={(probability) => update("risks", item.id, { probability })} />
        <Input label="Impact · 1–5" type="number" min="1" max="5" step="1" value={item.impact} onChange={(impact) => update("risks", item.id, { impact })} />
        <div className="md:col-span-2"><Input label="Mitigation" value={item.mitigation} onChange={(mitigation) => update("risks", item.id, { mitigation })} /></div>
        <p className="text-xs text-slate-600">Rating: <strong>{item.probability && item.impact ? item.probability * item.impact : "—"}</strong></p>
        <button type="button" onClick={() => remove("risks", item.id)} className="text-left text-xs font-semibold text-rose-700">Remove</button>
      </article>)}</div><button type="button" onClick={() => add("risks", { name: "", status: "not_started" })} className="mt-3 rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold">Add risk</button>
    </Section>}

    {tab === "review" && <Section eyebrow="Management decision log" title="Monthly review and forecast history" description="Record what happened, the cause of variance and the corrective action. Saving a changed monthly forecast also records a dated snapshot automatically.">
      {futureYear ? <p className="rounded-xl bg-sky-50 p-4 text-xs text-sky-900">Monthly performance reviews unlock when {plan.year} begins. Forecast snapshots still record planning changes now.</p> : <>
      <div className="max-w-xs"><Select label="Review month" value={String(selectedMonth)} onChange={(value) => onMonthChange(Number(value))} options={MONTH_LABELS.map((name, index) => [String(index), `${name} ${plan.year}`])} /></div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">{[
        ["performance", "What happened?"], ["variance", "Variance from target"], ["cause", "Likely cause"],
        ["action", "Corrective action"], ["forecastImpact", "Impact on annual forecast"],
      ].map(([key, label]) => <Input key={key} label={label} rows={3} value={execution.reviews[selectedMonth]?.[key]} onChange={(value) => setExecution({ reviews: execution.reviews.map((item, index) => index === selectedMonth ? { ...item, [key]: value } : item) })} />)}
        <div className="grid content-start gap-4"><Select label="Action owner" value={execution.reviews[selectedMonth]?.ownerId} onChange={(ownerId) => setExecution({ reviews: execution.reviews.map((item, index) => index === selectedMonth ? { ...item, ownerId } : item) })} options={owners} /><Input label="Action deadline" type="date" value={execution.reviews[selectedMonth]?.deadline} onChange={(deadline) => setExecution({ reviews: execution.reviews.map((item, index) => index === selectedMonth ? { ...item, deadline } : item) })} /></div>
      </div>
      </>}
      <h3 className="mt-7 text-sm font-bold">Saved forecast snapshots</h3><p className="mt-1 text-xs text-slate-500">Recorded on save when a monthly management forecast changes. Partial annual forecasts stay unvalued until all twelve months are entered.</p>
      {execution.forecastSnapshots.length ? <div className="mt-3 overflow-x-auto"><table className="w-full min-w-[500px] text-left text-xs"><thead className="bg-slate-100"><tr><th className="p-2">Saved</th><th>Revision</th><th>Annual forecast</th><th>Months entered</th></tr></thead><tbody>{[...execution.forecastSnapshots].reverse().map((item, index) => <tr key={`${item.savedAt}-${index}`} className="border-b"><td className="p-2">{new Date(item.savedAt).toLocaleString("en-ZA")}</td><td>{item.revision}</td><td>{money(item.annualForecast)}</td><td>{item.monthly.filter((value) => value != null).length}/12</td></tr>)}</tbody></table></div> : <p className="mt-3 text-xs text-slate-500">No forecast revision has been saved yet.</p>}
    </Section>}

    {tab === "capital" && <Section eyebrow="Use of funds" title="Capital requirements" description="Enter proposed funding uses and the commercial result each could enable. Ratios appear only where both capital and enabled values are entered.">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Summary label="Total capital requested" value={money(summary.capitalRequired)} note="All entered requests" /><Summary label="Capital with quantified case" value={money(summary.evidenceCapital || null)} note="Rows with both revenue and GP enabled" /><Summary label="Revenue enabled / R capital" value={summary.revenuePerCapital == null ? "—" : `${number(summary.revenuePerCapital)}×`} note="Management estimate for quantified rows" /><Summary label="GP enabled / R capital" value={summary.gpPerCapital == null ? "—" : `${number(summary.gpPerCapital)}×`} note="Management estimate for quantified rows" /></div>
      <div className="mt-4 space-y-3">{execution.capital.map((item) => <article key={item.id} className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2 xl:grid-cols-4">
        <Input label="Purpose" value={item.purpose} onChange={(purpose) => update("capital", item.id, { purpose })} />
        <Input label="Category" value={item.category} onChange={(category) => update("capital", item.id, { category })} placeholder="Working capital, stock, depot…" />
        <Input label="Required · R" type="number" min="0" value={item.required} onChange={(required) => update("capital", item.id, { required })} />
        <Input label="Needed by" type="date" value={item.neededBy} onChange={(neededBy) => update("capital", item.id, { neededBy })} />
        <Input label="Revenue enabled · R" type="number" min="0" value={item.revenueEnabled} onChange={(revenueEnabled) => update("capital", item.id, { revenueEnabled })} />
        <Input label="GP enabled · R" type="number" min="0" value={item.gpEnabled} onChange={(gpEnabled) => update("capital", item.id, { gpEnabled })} />
        <Input label="Payback estimate · months" type="number" min="0" value={item.paybackMonths} onChange={(paybackMonths) => update("capital", item.id, { paybackMonths })} />
        <Select label="Owner" value={item.ownerId} onChange={(ownerId) => update("capital", item.id, { ownerId })} options={owners} />
        <div className="md:col-span-2 xl:col-span-3"><Input label="Basis / supporting evidence" value={item.evidence} onChange={(evidence) => update("capital", item.id, { evidence })} /></div>
        <Select label="Status" value={item.status} onChange={(status) => update("capital", item.id, { status })} options={statusOptions} />
        <button type="button" onClick={() => remove("capital", item.id)} className="text-left text-xs font-semibold text-rose-700">Remove</button>
      </article>)}</div><button type="button" onClick={() => add("capital", { purpose: "", status: "not_started" })} className="mt-3 rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold">Add funding use</button>
    </Section>}

    {tab === "markets" && <Section eyebrow="Market opportunity" title="Segments and routes to market" description="Describe the customer problem and how Smart Steel plans to reach the segment. Add sourced market-size evidence when available; no market size is assumed here.">
      <div className="space-y-3">{execution.markets.map((item) => <article key={item.id} className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2 xl:grid-cols-4">
        <Input label="Segment" value={item.name} onChange={(name) => update("markets", item.id, { name })} />
        <Input label="Target customer" value={item.customer} onChange={(customer) => update("markets", item.id, { customer })} />
        <Input label="Relevant product" value={item.product} onChange={(product) => update("markets", item.id, { product })} />
        <Input label="Priority" value={item.priority} onChange={(priority) => update("markets", item.id, { priority })} placeholder="High / medium / low" />
        <Input label="Customer problem" value={item.problem} onChange={(problem) => update("markets", item.id, { problem })} />
        <Input label="Competitive advantage · evidence" value={item.advantage} onChange={(advantage) => update("markets", item.id, { advantage })} />
        <Input label="Route to market" value={item.route} onChange={(route) => update("markets", item.id, { route })} />
        <Input label="Evidence / source" value={item.source} onChange={(source) => update("markets", item.id, { source })} />
        <Input label="Average transaction · R" type="number" min="0" value={item.averageTicket} onChange={(averageTicket) => update("markets", item.id, { averageTicket })} />
        <Input label="Sales cycle · days" type="number" min="0" value={item.salesCycleDays} onChange={(salesCycleDays) => update("markets", item.id, { salesCycleDays })} />
        <Input label="Annual revenue target · R" type="number" min="0" value={item.revenueTarget} onChange={(revenueTarget) => update("markets", item.id, { revenueTarget })} />
        <button type="button" onClick={() => remove("markets", item.id)} className="self-end pb-2 text-left text-xs font-semibold text-rose-700">Remove</button>
      </article>)}</div><button type="button" onClick={() => add("markets", { name: "New segment" })} className="mt-3 rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold">Add segment</button>
    </Section>}

    {tab === "customers" && <Section eyebrow="Concentration evidence" title="Recognised revenue by customer" description="Allocate accounting revenue to customers once the year is under way. Shares below use allocated customer revenue only; reconcile that total to accounting actuals before treating them as company-wide concentration.">
      <div className="grid gap-3 sm:grid-cols-3"><Summary label="Allocated customer revenue" value={money(summary.allocatedCustomerRevenue)} note="Management-entered annual actual allocation" /><Summary label="Largest customer share" value={summary.largestCustomerShare == null ? "—" : `${(summary.largestCustomerShare * 100).toFixed(1)}%`} note="Of allocated customer revenue" /><Summary label="Top three share" value={summary.topThreeCustomerShare == null ? "—" : `${(summary.topThreeCustomerShare * 100).toFixed(1)}%`} note="Of allocated customer revenue" /></div>
      {futureYear ? <p className="mt-4 rounded-xl bg-sky-50 p-4 text-xs text-sky-900">Customer actuals unlock when {plan.year} begins. Future sales targets are not recognised revenue.</p> : <><div className="mt-4 space-y-3">{execution.customerActuals.map((item) => <div key={item.id} className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[1fr_1fr_auto]"><Input label="Customer" value={item.name} onChange={(name) => update("customerActuals", item.id, { name })} /><Input label="Recognised revenue · R" type="number" min="0" value={item.revenue} onChange={(revenue) => update("customerActuals", item.id, { revenue })} /><button type="button" onClick={() => remove("customerActuals", item.id)} className="self-end pb-2 text-left text-xs font-semibold text-rose-700">Remove</button></div>)}</div><button type="button" onClick={() => add("customerActuals", { name: "", revenue: null })} className="mt-3 rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold">Add customer allocation</button></>}
    </Section>}

    {tab === "assumptions" && <Section eyebrow="Assumption provenance" title="Basis for important inputs" description="Record who owns each assumption, why it was chosen, what supports it and when to review it. An entry here does not turn an assumption into an actual result.">
      <div className="space-y-3">{execution.assumptionEvidence.map((item) => <article key={item.id} className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="md:col-span-2"><Input label="Assumption" value={item.assumption} onChange={(assumption) => update("assumptionEvidence", item.id, { assumption })} /></div>
        <Select label="Owner" value={item.ownerId} onChange={(ownerId) => update("assumptionEvidence", item.id, { ownerId })} options={owners} />
        <Input label="Date entered" type="date" value={item.enteredAt} onChange={(enteredAt) => update("assumptionEvidence", item.id, { enteredAt })} />
        <div className="md:col-span-2"><Input label="Rationale" rows={2} value={item.rationale} onChange={(rationale) => update("assumptionEvidence", item.id, { rationale })} /></div>
        <div className="md:col-span-2"><Input label="Supporting evidence / source" rows={2} value={item.evidence} onChange={(evidence) => update("assumptionEvidence", item.id, { evidence })} /></div>
        <Input label="Last reviewed" type="date" value={item.reviewedAt} onChange={(reviewedAt) => update("assumptionEvidence", item.id, { reviewedAt })} />
        <Input label="Next review" type="date" value={item.nextReviewAt} onChange={(nextReviewAt) => update("assumptionEvidence", item.id, { nextReviewAt })} />
        <button type="button" onClick={() => remove("assumptionEvidence", item.id)} className="self-end pb-2 text-left text-xs font-semibold text-rose-700">Remove</button>
      </article>)}</div><button type="button" onClick={() => add("assumptionEvidence", { assumption: "" })} className="mt-3 rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold">Add assumption record</button>
    </Section>}

    {tab === "evidence" && <Section eyebrow="Evidence-based summary" title="Investment readiness" description="This is an internal readiness view, not a valuation or investment offer. Unknown and unverified measures stay visible as gaps.">
      <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-bold text-slate-800">Management status thresholds</p><p className="mt-1 text-[11px] text-slate-500">Revenue status uses a complete management forecast ÷ annual objective. Risk score uses probability × impact.</p><div className="mt-3 grid gap-3 sm:grid-cols-3"><Input label="Revenue · on track from %" type="number" min="0" value={(execution.thresholds?.revenueOnTrack ?? 1) * 100} onChange={(value) => setExecution({ thresholds: { ...execution.thresholds, revenueOnTrack: value == null ? 1 : value / 100 } })} /><Input label="Revenue · watch from %" type="number" min="0" value={(execution.thresholds?.revenueWatch ?? 0.9) * 100} onChange={(value) => setExecution({ thresholds: { ...execution.thresholds, revenueWatch: value == null ? 0.9 : value / 100 } })} /><Input label="High risk score from" type="number" min="1" step="1" value={execution.thresholds?.highRiskScore ?? 15} onChange={(value) => setExecution({ thresholds: { ...execution.thresholds, highRiskScore: value == null ? 15 : value } })} /></div><p className="mt-2 text-xs text-slate-600">Forecast vs objective: <strong>{report.revenueStatus}</strong>. A partial forecast has insufficient data.</p></div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <Summary label="Commercial validation" value={report.backlog.length ? money(report.backlogValue) : "Insufficient data"} note="Committed backlog remaining; check against orders" />
        <Summary label="Product economics" value={report.scenarios.management.modelled ? `${number(report.scenarios.management.margin * 100)}% GP` : "Insufficient data"} note="Modelled management product mix, not accounting actual" />
        <Summary label="Distribution" value={report.channels.some((item) => item.actual != null) ? money(report.channelActualRevenue) : "Insufficient data"} note="Management-allocated channel actuals" />
        <Summary label="Forward pipeline" value={money(report.qualifiedPipeline)} note={`Next 90-day coverage: ${report.pipelineCoverage == null ? "insufficient data" : `${number(report.pipelineCoverage)}×`}`} />
        <Summary label="Peak cash need · clustered" value={money(report.cashFlow.management.clustered?.peakFundingBeforeOpeningCash)} note="Scenario timing estimate before opening cash" />
        <Summary label="Execution" value={`${summary.initiativesOnTrack}/${summary.initiativesActive || 0}`} note={`${summary.overdueMilestones.length} overdue milestones · ${summary.highRisks.length} high-rated risks`} />
        <Summary label="Largest customer share" value={summary.largestCustomerShare == null ? "Insufficient data" : `${(summary.largestCustomerShare * 100).toFixed(1)}%`} note="Of allocated customer revenue; reconcile first" />
        <Summary label="Afgri channel share" value={report.concentration.afgriOfAllocatedChannels == null ? "Insufficient data" : `${(report.concentration.afgriOfAllocatedChannels * 100).toFixed(1)}%`} note="Of allocated channel revenue" />
        <Summary label="Atlas product share" value={report.concentration.atlasOfAllocatedProducts == null ? "Insufficient data" : `${(report.concentration.atlasOfAllocatedProducts * 100).toFixed(1)}%`} note="Of allocated product revenue" />
      </div>
      <p className="mt-4 rounded-xl bg-amber-50 p-4 text-xs leading-5 text-amber-900">Before external use, reconcile accounting revenue and GP, verify customer and channel allocations, replace placeholder payment terms, evidence capital outcomes, and review the risk register. {futureYear ? "Future-year sales are targets or forecasts, not completed orders." : "Current-year outcomes depend on entered actuals."}</p>
    </Section>}

    {tab === "owners" && <Section eyebrow="Accountability" title="Owners and team members" description="Choose an owner here, then assign that person to actions, constraints, capital uses and risks.">
      <div className="space-y-3">{execution.owners.map((item) => <div key={item.id} className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[1fr_1fr_auto]"><Input label="Name" value={item.name} onChange={(name) => update("owners", item.id, { name })} /><Input label="Role" value={item.role} onChange={(role) => update("owners", item.id, { role })} /><button type="button" onClick={() => remove("owners", item.id)} className="self-end pb-2 text-left text-xs font-semibold text-rose-700">Remove</button></div>)}</div><button type="button" onClick={() => add("owners", { name: "", role: "" })} className="mt-3 rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold">Add owner</button>
      <p className="mt-3 text-xs text-slate-500">Assigned owner labels in the plan: {execution.owners.map((item) => nameOf(item.id)).filter(Boolean).join(", ") || "none yet"}.</p>
    </Section>}
  </div>
}
