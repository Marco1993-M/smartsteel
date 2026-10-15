import { NextResponse } from "next/server"
import { getAnnualPlanContext } from "lib/annualPlanAuth"
import { supabaseServer } from "lib/supabase-server"
import { ANNUAL_ASSUMPTION_SECTIONS, MAX_ANNUAL_ASSUMPTION_LENGTH, ANNUAL_PLAN_FIELDS, SIGNED_ANNUAL_PLAN_FIELDS, emptyAnnualPlan, normalizeAnnualPlan, sastYearMonth } from "lib/annualPlan.mjs"
import { normalizeCommercialModel } from "lib/annualCommercialPlan.mjs"

export const runtime = "nodejs"
const schemaMissing = (error) => ["42P01", "PGRST205", "PGRST116"].includes(error?.code) && /os_annual_plans/i.test(error?.message || "")
const assumptionsMissing = (error) => ["42703", "PGRST204"].includes(error?.code) && /assumptions/i.test(error?.message || "")
const commercialMissing = (error) => ["42703", "PGRST204"].includes(error?.code) && /commercial_model/i.test(error?.message || "")

function yearFrom(request) {
  const year = Number(new URL(request.url).searchParams.get("year") || 2027)
  return Number.isInteger(year) && year >= 2020 && year <= 2100 ? year : null
}

function orderMonths(orders, year) {
  const result = Array.from({ length: 12 }, () => ({ count: 0 }))
  for (const order of orders || []) {
    if (order.status === "cancelled") continue
    const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Johannesburg", year: "numeric", month: "2-digit" }).formatToParts(new Date(order.accepted_at))
    const orderYear = Number(parts.find((part) => part.type === "year")?.value)
    const month = Number(parts.find((part) => part.type === "month")?.value) - 1
    if (orderYear === year && month >= 0 && month < 12) result[month].count++
  }
  return result
}

async function allOrders(startYear, endYear) {
  const rows = []
  for (let from = 0; ; from += 1000) {
    const result = await supabaseServer.from("sales_orders").select("accepted_at,status")
      .gte("accepted_at", `${startYear - 1}-12-31T22:00:00Z`)
      .lt("accepted_at", `${endYear}-12-31T22:00:00Z`)
      .order("accepted_at", { ascending: true }).range(from, from + 999)
    if (result.error) return result
    rows.push(...(result.data || []))
    if ((result.data || []).length < 1000) return { data: rows, error: null }
  }
}

export async function GET(request) {
  const context = await getAnnualPlanContext(request)
  if (context.response) return context.response
  const year = yearFrom(request)
  if (!year) return NextResponse.json({ error: "Choose a valid year." }, { status: 400 })
  const [plans, orders] = await Promise.all([
    supabaseServer.from("os_annual_plans").select("year,turnover_goal,notes,assumptions,commercial_model,months,revision,updated_at").in("year", [year - 1, year]),
    allOrders(year - 1, year),
  ])
  if (assumptionsMissing(plans.error)) return NextResponse.json({ error: "Run supabase/smart_steel_os_annual_plan_assumptions.sql in Supabase to enable the new assumptions fields." }, { status: 503 })
  if (commercialMissing(plans.error)) return NextResponse.json({ error: "Run supabase/smart_steel_os_annual_plan_v2_phase1.sql in Supabase to enable the commercial model." }, { status: 503 })
  if (plans.error && !schemaMissing(plans.error)) return NextResponse.json({ error: "Annual plan could not be loaded." }, { status: 500 })
  const rows = plans.data || []
  const toPlan = (target) => {
    const row = rows.find((item) => item.year === target)
    return row ? { ...normalizeAnnualPlan({ year: target, turnoverGoal: row.turnover_goal, notes: row.notes, commercialModel: row.commercial_model, assumptions: row.assumptions, months: row.months, revision: row.revision, updatedAt: row.updated_at }, target), commercialModel: normalizeCommercialModel(row.commercial_model) } : { ...emptyAnnualPlan(target), commercialModel: normalizeCommercialModel() }
  }
  return NextResponse.json({
    plan: toPlan(year), previousPlan: toPlan(year - 1),
    orders: orders.error ? null : orderMonths(orders.data, year),
    previousOrders: orders.error ? null : orderMonths(orders.data, year - 1),
    schemaReady: !plans.error,
    ordersAvailable: !orders.error,
    canEdit: context.accessLevel === "edit",
  }, { headers: { "Cache-Control": "private, no-store" } })
}

function validate(payload, year) {
  if (!payload || !Array.isArray(payload.months) || payload.months.length !== 12) return "Enter twelve calendar months."
  if (!payload.assumptions || typeof payload.assumptions !== "object" || Array.isArray(payload.assumptions) || ANNUAL_ASSUMPTION_SECTIONS.some(({ key }) => typeof payload.assumptions[key] !== "string" || payload.assumptions[key].length > MAX_ANNUAL_ASSUMPTION_LENGTH)) return "Check the annual assumptions fields."
  if (!payload.commercialModel || typeof payload.commercialModel !== "object" || Array.isArray(payload.commercialModel) || JSON.stringify(payload.commercialModel).length > 200000) return "Check the commercial model."
  if (["products", "channels", "productPlans", "productActuals", "channelTargets", "channelActuals", "opportunities", "backlog", "funnel"].some((key) => !Array.isArray(payload.commercialModel[key])) || payload.commercialModel.funnel.length !== 12) return "Check the commercial model structure."
  const model = payload.commercialModel
  if (model.products.some((item) => !String(item?.id || "").trim() || !String(item?.name || "").trim()) ||
      model.channels.some((item) => !String(item?.id || "").trim() || !String(item?.name || "").trim()) ||
      model.opportunities.some((item) => !String(item?.id || "").trim() || !String(item?.name || "").trim()) ||
      model.backlog.some((item) => !String(item?.id || "").trim() || !String(item?.name || "").trim())) return "Name each product, channel, opportunity and committed order before saving."
  const validMonth = (value) => Number.isInteger(Number(value)) && Number(value) >= 0 && Number(value) < 12
  if (["productPlans", "productActuals", "channelActuals", "opportunities"].some((key) => model[key].some((row) => !validMonth(key === "opportunities" ? row?.expectedCloseMonth : row?.month))) ||
      model.backlog.some((row) => !validMonth(row?.deliveryMonth))) return "Check the month assigned to each commercial item."
  if (model.productPlans.some((row) => row?.units != null && row.units !== "" && !Number.isInteger(Number(row.units))) ||
      model.productActuals.some((row) => row?.units != null && row.units !== "" && !Number.isInteger(Number(row.units))) ||
      model.funnel.some((row) => ["leads", "qualified", "quotes", "negotiations", "won"].some((field) => row?.[field] != null && row[field] !== "" && !Number.isInteger(Number(row[field]))))) return "Product units and funnel counts must be whole numbers."
  const invalidAmount = (value) => value != null && value !== "" && (!Number.isFinite(Number(value)) || Number(value) < 0 || Number(value) > 1e12)
  if (model.productPlans.some((row) => ["units", "price", "directCost"].some((field) => invalidAmount(row?.[field]))) ||
      model.productActuals.some((row) => ["units", "revenue", "directCost"].some((field) => invalidAmount(row?.[field]))) ||
      model.channelTargets.some((row) => invalidAmount(row?.revenue)) ||
      model.channelActuals.some((row) => invalidAmount(row?.revenue)) ||
      model.opportunities.some((row) => invalidAmount(row?.value)) ||
      model.backlog.some((row) => ["orderValue", "recognizedRevenue", "expectedGp"].some((field) => invalidAmount(row?.[field])))) return "Commercial amounts must be non-negative numbers."
  if (model.opportunities.some((row) => row?.probability != null && (invalidAmount(row.probability) || Number(row.probability) > 1)) ||
      model.products.some((row) => row?.minimumMargin != null && (invalidAmount(row.minimumMargin) || Number(row.minimumMargin) > 1)) ||
      invalidAmount(model.grossMarginTarget) || Number(model.grossMarginTarget) > 1 ||
      model.installationAttachRate != null && (invalidAmount(model.installationAttachRate) || Number(model.installationAttachRate) > 1)) return "Probabilities and margin targets must be between 0% and 100%."
  if (invalidAmount(model.pipelineThresholds?.amber) || invalidAmount(model.pipelineThresholds?.green) ||
      Number(model.pipelineThresholds?.green) <= Number(model.pipelineThresholds?.amber)) return "The on-track pipeline threshold must exceed the watch threshold."
  const lowMultiple = model.valuation?.lowMultiple
  const highMultiple = model.valuation?.highMultiple
  if ([lowMultiple, highMultiple].some((value) => value != null && value !== "" && (!Number.isFinite(Number(value)) || Number(value) <= 0 || Number(value) > 100)) ||
      (lowMultiple != null && highMultiple != null && Number(highMultiple) < Number(lowMultiple)) ||
      String(model.valuation?.rationale || "").length > 500) return "Enter a positive EV/EBITDA multiple range (low to high, up to 100×) and a short rationale."
  const funding = model.funding
  if (funding && (invalidAmount(funding.largestSupplyOrder) ||
      !Number.isFinite(Number(funding.costRatio)) || Number(funding.costRatio) < 0 || Number(funding.costRatio) > 1 ||
      !Number.isInteger(Number(funding.daysLow)) || !Number.isInteger(Number(funding.daysHigh)) ||
      Number(funding.daysLow) < 1 || Number(funding.daysHigh) > 120 || Number(funding.daysHigh) < Number(funding.daysLow) ||
      !Array.isArray(funding.afgriMonthlySupply) || funding.afgriMonthlySupply.length !== 12 || funding.afgriMonthlySupply.some(invalidAmount))) return "Check the Afgri bridge assumptions and twelve monthly supply amounts."
  const cash = model.cashFlow
  if (cash && (cash.openingCash != null && cash.openingCash !== "" && (!Number.isFinite(Number(cash.openingCash)) || Math.abs(Number(cash.openingCash)) > 1e12) ||
      [cash.customerDepositRate, cash.supplierUpfrontRate].some((value) => !Number.isFinite(Number(value)) || Number(value) < 0 || Number(value) > 1) ||
      [cash.customerBalanceDays, cash.supplierBalanceDays].some((value) => !Number.isInteger(Number(value)) || Number(value) < 0 || Number(value) > 180))) return "Check customer and supplier cash-flow terms."
  if (payload.turnoverGoal != null && payload.turnoverGoal !== "" && (!Number.isFinite(Number(payload.turnoverGoal)) || Number(payload.turnoverGoal) < 0 || Number(payload.turnoverGoal) > 1e12)) return "Enter a non-negative turnover goal below R1 trillion."
  if (payload.months.some((month) => ANNUAL_PLAN_FIELDS.some((field) => {
    const value = month?.[field]
    return value != null && value !== "" && (!Number.isFinite(Number(value)) || Math.abs(Number(value)) > 1e12 || Number(value) < 0 && !SIGNED_ANNUAL_PLAN_FIELDS.has(field))
  }))) return "Check the monthly values. Gross profit and working capital may be negative."
  if (payload.months.some((month) => ["additionalJobs", "targetJobs"].some((field) => month?.[field] != null && month[field] !== "" && !Number.isInteger(Number(month[field]))))) return "Job counts must be whole numbers."
  const now = sastYearMonth()
  if (payload.months.some((month, index) => (year > now.year || year === now.year && index > now.month) && ["actualRevenue", "actualGrossProfit", "workingCapital", "additionalJobs"].some((field) => month?.[field] != null && month[field] !== ""))) return "Future months cannot contain actual results or current working capital."
  const future = (index) => year > now.year || year === now.year && Number(index) > now.month
  if ((payload.commercialModel.productActuals || []).some((row) => future(row.month) && ["units", "revenue", "directCost"].some((field) => row[field] != null && row[field] !== "")) ||
      (payload.commercialModel.channelActuals || []).some((row) => future(row.month) && row.revenue != null && row.revenue !== "") ||
      (payload.commercialModel.funnel || []).some((row, index) => future(index) && Object.values(row || {}).some((value) => value != null && value !== ""))) return "Future months cannot contain actual product, channel or funnel results."
  if (!Number.isInteger(Number(payload.revision || 0)) || Number(payload.revision || 0) < 0) return "Invalid plan revision."
  if (year < 2020 || year > 2100) return "Choose a valid year."
  return null
}

export async function PUT(request) {
  const context = await getAnnualPlanContext(request, true)
  if (context.response) return context.response
  const year = yearFrom(request)
  if (!year) return NextResponse.json({ error: "Choose a valid year." }, { status: 400 })
  let body
  try { body = await request.json() } catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }) }
  const problem = validate(body, year)
  if (problem) return NextResponse.json({ error: problem }, { status: 400 })
  const plan = normalizeAnnualPlan(body, year)
  const row = { year, turnover_goal: plan.turnoverGoal, notes: "", assumptions: plan.assumptions, commercial_model: normalizeCommercialModel(body.commercialModel), months: plan.months, updated_by: context.user.id }
  let result
  if (plan.revision === 0) {
    result = await supabaseServer.from("os_annual_plans").insert({ ...row, revision: 1 }).select("revision,updated_at").single()
  } else {
    result = await supabaseServer.from("os_annual_plans").update({ ...row, revision: plan.revision + 1 })
      .eq("year", year).eq("revision", plan.revision).select("revision,updated_at").maybeSingle()
  }
  if (result.error?.code === "23505" || !result.error && !result.data) return NextResponse.json({ error: "This plan changed elsewhere. Reload before saving." }, { status: 409 })
  if (result.error) return NextResponse.json({ error: commercialMissing(result.error) ? "Run supabase/smart_steel_os_annual_plan_v2_phase1.sql in Supabase first." : assumptionsMissing(result.error) ? "Run supabase/smart_steel_os_annual_plan_assumptions.sql in Supabase first." : schemaMissing(result.error) ? "Run the annual-plan SQL migration in Supabase first." : "Annual plan could not be saved." }, { status: 500 })
  return NextResponse.json({ revision: result.data.revision, updatedAt: result.data.updated_at })
}
