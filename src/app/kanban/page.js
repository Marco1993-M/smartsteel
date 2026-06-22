"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Link2 } from "lucide-react"
import KanbanBoard from "../../components/KanbanBoard"
import LeadEditorDrawer from "../../components/LeadEditorDrawer"
import PricesDrawer from "../../components/PricesDrawer"
import EstimateDrawer from "../../components/EstimateDrawer"
import InvoiceDrawer from "../../components/InvoiceDrawer"
import UpcomingTasks from "../../components/UpcomingTasks"
import {
  formatCrmStatusLabel,
  getLeadSop,
  getLeadStageValidationMessage,
} from "../../lib/crmSop"
import { supabase } from "../../lib/supabase"

const TEAM_MEMBERS = ["Stefan", "Niel", "Victor", "Marco"]
const STATUS_OPTIONS = ["all", "new", "contacted", "quoted", "won", "lost"]
const NEXT_ACTION_STORAGE_KEY = "smartsteel.crm.next-actions"
const CRM_FALLBACK_STORAGE_KEY = "smartsteel.crm.custom-fields"
const CRM_ESTIMATES_STORAGE_KEY = "smartsteel.crm.estimates"
const CRM_INVOICES_STORAGE_KEY = "smartsteel.crm.invoices"
const CRM_FALLBACK_FIELDS = [
  "next_action",
  "lead_source",
  "product_type",
  "client_follow_up_state",
  "quote_value",
  "lost_reason",
  "google_sheet_url",
]
const LEAD_SOURCE_OPTIONS = [
  "Website form",
  "Warehouse Builder",
  "Estimator",
  "WhatsApp",
  "Phone call",
  "Referral",
  "Google Ads",
  "Organic search",
  "Repeat client",
]
const PRODUCT_TYPE_OPTIONS = [
  "LSF Warehouse",
  "LCSS Warehouse",
  "Solar carport",
  "Solar ground mount",
  "Solar structure",
  "LSF trusses",
  "CFLC trusses",
  "Bracketry",
  "Other",
]
const METRIC_FILTER_OPTIONS = ["all", "quoted", "won", "follow_up_today", "missing_next_step", "overdue_follow_up"]
const CRM_VIEW_OPTIONS = [
  { key: "pipeline", label: "Pipeline", helper: "Move and review leads" },
  { key: "my_work", label: "My Work", helper: "Handle follow-ups, tasks, and loose ends" },
  { key: "quotes", label: "Quotes", helper: "Manage priced work and quoted momentum" },
  { key: "insights", label: "Insights", helper: "Check workload and risk" },
]
const LEAD_FLOW_VIEW_OPTIONS = [
  { key: "month", label: "Month" },
  { key: "week", label: "Week" },
]
const GENERAL_GOOGLE_SHEET_URL = ""

const emptyLead = {
  name: "",
  last_name: "",
  email: "",
  phone: "",
  estimate_request: "",
  allocated_to: "",
  next_action: "",
  lead_source: "",
  product_type: "",
  client_follow_up_state: "",
  quote_value: "",
  lost_reason: "",
  google_sheet_url: "",
  notes: "",
  status: "new",
}

function normalizeStatus(status) {
  return String(status || "new").trim().toLowerCase()
}

function normalizeLead(lead) {
  return {
    ...lead,
    status: normalizeStatus(lead.status),
    next_action: lead.next_action || "",
    lead_source: lead.lead_source || "",
    product_type: lead.product_type || "",
    client_follow_up_state: lead.client_follow_up_state || "",
    quote_value: lead.quote_value || "",
    lost_reason: lead.lost_reason || "",
    google_sheet_url: lead.google_sheet_url || "",
    follow_up_at: lead.follow_up_at || null,
  }
}

function stripEstimateVersionSuffix(title) {
  return String(title || "").replace(/\s+V\d+$/i, "").trim()
}

function formatStatusLabel(status) {
  return formatCrmStatusLabel(status)
}

function isSameDay(dateValue, comparisonDate = new Date()) {
  if (!dateValue) return false
  const date = new Date(dateValue)
  return date.toDateString() === comparisonDate.toDateString()
}

function isBeforeToday(dateValue) {
  if (!dateValue) return false
  const date = new Date(dateValue)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)
  return date < today
}

function readLocalNextActions() {
  if (typeof window === "undefined") return {}

  try {
    return JSON.parse(window.localStorage.getItem(NEXT_ACTION_STORAGE_KEY) || "{}")
  } catch {
    return {}
  }
}

function writeLocalNextActions(nextActions) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(NEXT_ACTION_STORAGE_KEY, JSON.stringify(nextActions))
}

function readFallbackFields() {
  if (typeof window === "undefined") return {}

  try {
    return JSON.parse(window.localStorage.getItem(CRM_FALLBACK_STORAGE_KEY) || "{}")
  } catch {
    return {}
  }
}

function writeFallbackFields(data) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(CRM_FALLBACK_STORAGE_KEY, JSON.stringify(data))
}

function readStoredEstimates() {
  if (typeof window === "undefined") return {}

  try {
    return JSON.parse(window.localStorage.getItem(CRM_ESTIMATES_STORAGE_KEY) || "{}")
  } catch {
    return {}
  }
}

function writeStoredEstimates(data) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(CRM_ESTIMATES_STORAGE_KEY, JSON.stringify(data))
}

function readStoredInvoices() {
  if (typeof window === "undefined") return {}

  try {
    return JSON.parse(window.localStorage.getItem(CRM_INVOICES_STORAGE_KEY) || "{}")
  } catch {
    return {}
  }
}

function writeStoredInvoices(data) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(CRM_INVOICES_STORAGE_KEY, JSON.stringify(data))
}

function withFallbackNextAction(lead, nextActions) {
  if (!lead?.id) return normalizeLead(lead)

  return normalizeLead({
    ...lead,
    next_action: lead.next_action || nextActions[lead.id] || "",
  })
}

function withFallbackFields(lead, fallbackFields) {
  if (!lead?.id) return normalizeLead(lead)

  const fallback = fallbackFields[lead.id] || {}
  return normalizeLead({
    ...lead,
    ...Object.fromEntries(
      CRM_FALLBACK_FIELDS.map((field) => [field, lead[field] || fallback[field] || ""])
    ),
  })
}

function validateLead(lead) {
  if (!lead.name?.trim()) return "Please add the lead's first name."
  if (!lead.phone?.trim() && !lead.email?.trim()) {
    return "Please add at least a phone number or email address."
  }
  if (!lead.lead_source?.trim()) return "Please capture where this lead came from."
  if (!lead.product_type?.trim()) return "Please choose the product type for this lead."
  if (!lead.allocated_to?.trim()) return "Please assign this lead to a team member."
  if (!lead.next_action?.trim()) return "Please add the next action for this lead."
  if (normalizeStatus(lead.status) === "quoted" && !String(lead.quote_value || "").trim()) {
    return "Please capture the quote value before saving a quoted lead."
  }
  if (normalizeStatus(lead.status) === "lost" && !lead.lost_reason?.trim()) {
    return "Please capture why the lead was lost."
  }
  return null
}

function parseMissingColumn(error) {
  const message = error?.message || ""
  const inverseMatch = message.match(/["']([a-zA-Z0-9_]+)["'] column/i)
  if (inverseMatch?.[1]) return inverseMatch[1]

  const directMatch = message.match(/column\s+["']?([a-zA-Z0-9_]+)["']?/i)
  if (directMatch?.[1] && directMatch[1].toLowerCase() !== "of") return directMatch[1]

  return null
}

function getLeadFreshnessDate(lead) {
  return lead.last_activity_at || lead.follow_up_at || lead.updated_at || lead.created_at || null
}

function getDaysSince(dateValue) {
  if (!dateValue) return Number.POSITIVE_INFINITY
  const diff = Date.now() - new Date(dateValue).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

function getTomorrowIsoDate() {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(9, 0, 0, 0)
  return tomorrow.toISOString()
}

function getStartOfDay(dateValue) {
  const date = new Date(dateValue)
  date.setHours(0, 0, 0, 0)
  return date
}

function getStartOfWeek(dateValue) {
  const date = getStartOfDay(dateValue)
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)
  return date
}

function getStartOfMonth(dateValue) {
  const date = getStartOfDay(dateValue)
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function getStartOfQuarter(dateValue) {
  const date = getStartOfDay(dateValue)
  const quarterStartMonth = Math.floor(date.getMonth() / 3) * 3
  return new Date(date.getFullYear(), quarterStartMonth, 1)
}

function addDays(dateValue, days) {
  const date = new Date(dateValue)
  date.setDate(date.getDate() + days)
  return date
}

function addMonths(dateValue, months) {
  const date = new Date(dateValue)
  date.setMonth(date.getMonth() + months)
  return date
}

function addQuarters(dateValue, quarters) {
  return addMonths(dateValue, quarters * 3)
}

function countLeadsCreatedBetween(leads, startDate, endDate) {
  const start = startDate.getTime()
  const end = endDate.getTime()

  return leads.filter((lead) => {
    if (!lead.created_at) return false
    const createdAt = new Date(lead.created_at).getTime()
    return createdAt >= start && createdAt < end
  }).length
}

function getChangeLabel(currentValue, previousValue) {
  if (previousValue === 0 && currentValue === 0) return "No change"
  if (previousValue === 0) return `+${currentValue} from last period`

  const diff = currentValue - previousValue
  const percentage = Math.round((diff / previousValue) * 100)

  if (diff === 0) return "No change"
  return `${diff > 0 ? "+" : ""}${diff} (${diff > 0 ? "+" : ""}${percentage}%) vs last period`
}

function parseQuoteValue(value) {
  if (value == null) return 0
  if (typeof value === "number") return Number.isFinite(value) ? value : 0

  const normalized = String(value)
    .replace(/[^0-9.,-]/g, "")
    .replace(/,/g, "")
    .trim()

  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

function formatZar(value) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}

function getNextEstimateVersion(estimates = []) {
  const maxVersion = estimates.reduce((highest, estimate) => {
    const version = Number(estimate?.version_no || 0)
    return Number.isFinite(version) ? Math.max(highest, version) : highest
  }, 0)

  return maxVersion + 1
}

function getNextInvoiceSequenceValue(invoices = []) {
  const maxSequence = invoices.reduce((highest, invoice) => {
    const sequence = Number(invoice?.sequence_no || 0)
    return Number.isFinite(sequence) ? Math.max(highest, sequence) : highest
  }, 0)

  return maxSequence + 1
}

function getTeamMemberFromUser(user) {
  const email = String(user?.email || "").toLowerCase()
  if (!email) return ""

  return (
    TEAM_MEMBERS.find((member) => email.includes(member.toLowerCase())) || ""
  )
}

function generateShareToken() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }

  return `share-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

async function sendCrmNotification(payload) {
  try {
    await fetch("/api/crm-notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
  } catch (error) {
    console.error("Error sending CRM notification:", error)
  }
}

function TodayWorkColumn({ title, helper, tone, items, emptyText, renderItem }) {
  const toneClasses = {
    rose: "bg-rose-50 text-rose-700 border-rose-100",
    sky: "bg-sky-50 text-sky-700 border-sky-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900">{title}</h3>
          <p className="mt-1 text-xs text-slate-500">{helper}</p>
        </div>
        <span className={`rounded-full border px-2 py-1 text-xs font-bold ${toneClasses[tone]}`}>
          {items.length}
        </span>
      </div>

      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white p-3 text-sm text-slate-400">
            {emptyText}
          </p>
        ) : (
          items.map(renderItem)
        )}
      </div>
    </div>
  )
}

function TodayLeadCard({ lead, onOpen, onSnooze }) {
  const cleanPhone = lead.phone?.replace(/\D/g, "")
  const leadSop = getLeadSop(lead)

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">
            {lead.name} {lead.last_name}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            {lead.product_type || "No product"} · {lead.allocated_to || "Unassigned"}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
          {formatStatusLabel(lead.status)}
        </span>
      </div>

      <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-600">
        {lead.next_action || "No next action captured yet."}
      </p>

      <div className="mt-2 rounded-lg bg-slate-50 p-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              SOP next
            </p>
            <p className="mt-1 text-xs font-medium leading-4 text-slate-700">
              {lead.next_action || leadSop.nextStep}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-bold ${
              leadSop.isComplete
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {leadSop.completionLabel}
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {lead.phone && (
          <a
            href={`tel:${lead.phone}`}
            className="rounded-full bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700"
          >
            Call
          </a>
        )}
        {cleanPhone && (
          <a
            href={`https://wa.me/${cleanPhone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-green-50 px-2.5 py-1.5 text-xs font-semibold text-green-700"
          >
            WhatsApp
          </a>
        )}
        {lead.email && (
          <a
            href={`mailto:${lead.email}`}
            className="rounded-full bg-sky-50 px-2.5 py-1.5 text-xs font-semibold text-sky-700"
          >
            Email
          </a>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onOpen}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Open
        </button>
        <button
          type="button"
          onClick={onSnooze}
          className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
        >
          Tomorrow
        </button>
      </div>
    </div>
  )
}

function TodayTaskCard({ task, onComplete }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">{task.title}</p>
          <p className="mt-1 text-xs text-slate-500">
            {task.assignee || "Unassigned"} · {task.priority || "No priority"}
          </p>
          {task.due_date && (
            <p className="mt-1 text-xs font-medium text-slate-600">Due: {task.due_date}</p>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={onComplete}
        className="mt-3 w-full rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
      >
        Mark done
      </button>
    </div>
  )
}

export default function KanbanPage() {
  const router = useRouter()
  const boardSectionRef = useRef(null)
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingLead, setEditingLead] = useState(null)
  const [isAddingLead, setIsAddingLead] = useState(false)
  const [showPricesDrawer, setShowPricesDrawer] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showMobileAdminPanel, setShowMobileAdminPanel] = useState(false)
  const [leadFlowView, setLeadFlowView] = useState("month")
  const [statusFilter, setStatusFilter] = useState("all")
  const [assigneeFilter, setAssigneeFilter] = useState("all")
  const [metricFilter, setMetricFilter] = useState("all")
  const [ownershipView, setOwnershipView] = useState("mine")
  const [crmView, setCrmView] = useState("pipeline")
  const [nextActionFallbacks, setNextActionFallbacks] = useState({})
  const [fallbackFieldValues, setFallbackFieldValues] = useState({})
  const [leadEstimates, setLeadEstimates] = useState({})
  const [leadInvoices, setLeadInvoices] = useState({})
  const [estimatingLead, setEstimatingLead] = useState(null)
  const [invoicingLead, setInvoicingLead] = useState(null)
  const [dailyTasks, setDailyTasks] = useState([])
  const [tasksLoading, setTasksLoading] = useState(true)

  const fetchLeads = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching leads:", error)
    } else {
      const fallbackActions = readLocalNextActions()
      const fallbackFields = readFallbackFields()
      const fallbackEstimates = readStoredEstimates()
      const fallbackInvoices = readStoredInvoices()
      setNextActionFallbacks(fallbackActions)
      setFallbackFieldValues(fallbackFields)
      setLeadEstimates(fallbackEstimates)
      setLeadInvoices(fallbackInvoices)
      setLeads(
        (data || []).map((lead) =>
          withFallbackFields(withFallbackNextAction(lead, fallbackActions), fallbackFields)
        )
      )
    }

    setLoading(false)
  }

  const fetchDailyTasks = async () => {
    setTasksLoading(true)
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("completed", false)
      .order("due_date", { ascending: true })

    if (error) {
      console.error("Error fetching daily tasks:", error)
    } else {
      setDailyTasks(data || [])
    }

    setTasksLoading(false)
  }

  useEffect(() => {
    const bootstrapSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        router.replace("/login")
        setAuthLoading(false)
        return
      }

      setUser(session.user)
      setAuthLoading(false)
      fetchLeads()
      fetchDailyTasks()
    }

    bootstrapSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setUser(null)
        router.replace("/login")
        return
      }

      setUser(session.user)
    })

    return () => subscription.unsubscribe()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace("/login")
  }

  const persistFallbackNextAction = (leadId, nextAction) => {
    const updatedFallbacks = {
      ...nextActionFallbacks,
      [leadId]: nextAction,
    }
    setNextActionFallbacks(updatedFallbacks)
    writeLocalNextActions(updatedFallbacks)
  }

  const persistFallbackFields = (leadId, values) => {
    const updatedFallbacks = {
      ...fallbackFieldValues,
      [leadId]: {
        ...(fallbackFieldValues[leadId] || {}),
        ...Object.fromEntries(
          CRM_FALLBACK_FIELDS.map((field) => [field, values[field] || ""])
        ),
      },
    }
    setFallbackFieldValues(updatedFallbacks)
    writeFallbackFields(updatedFallbacks)
  }

  const clearFallbackFields = (leadId, fields = CRM_FALLBACK_FIELDS) => {
    if (!fallbackFieldValues[leadId]) return
    const updatedLeadFallback = { ...(fallbackFieldValues[leadId] || {}) }
    fields.forEach((field) => delete updatedLeadFallback[field])

    const updatedFallbacks = { ...fallbackFieldValues }
    if (Object.keys(updatedLeadFallback).length === 0) {
      delete updatedFallbacks[leadId]
    } else {
      updatedFallbacks[leadId] = updatedLeadFallback
    }
    setFallbackFieldValues(updatedFallbacks)
    writeFallbackFields(updatedFallbacks)
  }

  const clearFallbackNextAction = (leadId) => {
    if (!nextActionFallbacks[leadId]) return
    const updatedFallbacks = { ...nextActionFallbacks }
    delete updatedFallbacks[leadId]
    setNextActionFallbacks(updatedFallbacks)
    writeLocalNextActions(updatedFallbacks)
  }

  const setStoredEstimatesForLead = (leadId, estimates) => {
    const updated = {
      ...leadEstimates,
      [leadId]: estimates,
    }
    setLeadEstimates(updated)
    writeStoredEstimates(updated)
  }

  const setStoredInvoicesForLead = (leadId, invoices) => {
    const updated = {
      ...leadInvoices,
      [leadId]: invoices,
    }
    setLeadInvoices(updated)
    writeStoredInvoices(updated)
  }

  const logLeadActivity = async (activity) => {
    const payload = Array.isArray(activity) ? activity.filter(Boolean) : [activity].filter(Boolean)
    if (payload.length === 0) return

    const { error } = await supabase.from("lead_activities").insert(payload)
    if (error) {
      console.error("Error logging lead activity:", error)
    }
  }

  const handleSaveLead = async (leadData, isNew = false) => {
    const normalizedLead = normalizeLead({
      ...leadData,
      created_by: leadData.created_by || user?.id || null,
    })
    const validationError = validateLead(normalizedLead)
    if (validationError) {
      alert(validationError)
      return false
    }

    const stageValidationError = getLeadStageValidationMessage(normalizedLead, normalizedLead.status)
    if (stageValidationError) {
      alert(stageValidationError)
      return false
    }

    const currentLead = normalizedLead.id
      ? leads.find((lead) => lead.id === normalizedLead.id)
      : null

    const persistLead = async (payload) => {
      if (isNew) {
        return supabase.from("leads").insert([payload]).select()
      }

      return supabase.from("leads").update(payload).eq("id", normalizedLead.id)
    }

    if (isNew) {
      let response = await persistLead(normalizedLead)
      const unsupportedFields = []

      while (response.error) {
        const missingColumn = parseMissingColumn(response.error)
        if (!missingColumn || !CRM_FALLBACK_FIELDS.includes(missingColumn)) break
        unsupportedFields.push(missingColumn)
        const fallbackPayload = { ...normalizedLead }
        unsupportedFields.forEach((field) => delete fallbackPayload[field])
        response = await supabase.from("leads").insert([fallbackPayload]).select()
      }

      if (response.error) {
        alert("Error adding lead: " + response.error.message)
        return false
      }

      const savedLead = normalizeLead(response.data[0])
      const mergedLead = {
        ...savedLead,
        ...Object.fromEntries(
          CRM_FALLBACK_FIELDS.map((field) => [field, normalizedLead[field] || ""])
        ),
      }

      if (unsupportedFields.includes("next_action")) {
        persistFallbackNextAction(savedLead.id, normalizedLead.next_action)
      } else {
        clearFallbackNextAction(savedLead.id)
      }
      if (unsupportedFields.length > 0) {
        persistFallbackFields(savedLead.id, normalizedLead)
      } else {
        clearFallbackFields(savedLead.id)
      }

      setLeads((prev) => [mergedLead, ...prev])
      setIsAddingLead(false)
      await logLeadActivity({
        lead_id: savedLead.id,
        type: "update",
        user_name: "System",
        description: `Lead added to CRM. Next action: ${normalizedLead.next_action}`,
        timestamp: new Date().toISOString(),
      })
      await sendCrmNotification({
        eventType: "new_lead",
        lead: mergedLead,
        actor: user?.email || "Smart Steel CRM",
        summary: `New lead added and assigned to ${mergedLead.allocated_to || "the team"}.`,
      })
      return true
    }

    let error = null
    let updateResult = await persistLead(normalizedLead)
    const unsupportedFields = []

    while (updateResult.error) {
      const missingColumn = parseMissingColumn(updateResult.error)
      if (!missingColumn || !CRM_FALLBACK_FIELDS.includes(missingColumn)) break
      unsupportedFields.push(missingColumn)
      const fallbackPayload = { ...normalizedLead }
      unsupportedFields.forEach((field) => delete fallbackPayload[field])
      updateResult = await supabase
        .from("leads")
        .update(fallbackPayload)
        .eq("id", normalizedLead.id)
    }

    error = updateResult.error

    if (error) {
      alert("Error saving lead: " + error.message)
      return false
    }

    if (unsupportedFields.includes("next_action")) {
      persistFallbackNextAction(normalizedLead.id, normalizedLead.next_action)
    } else {
      clearFallbackNextAction(normalizedLead.id)
    }
    if (unsupportedFields.length > 0) {
      persistFallbackFields(normalizedLead.id, normalizedLead)
    } else {
      clearFallbackFields(normalizedLead.id)
    }

    setLeads((prev) =>
      prev.map((lead) => (lead.id === normalizedLead.id ? normalizedLead : lead))
    )

    const activityEntries = []
    if (currentLead && normalizeStatus(currentLead.status) !== normalizeStatus(normalizedLead.status)) {
      activityEntries.push({
        lead_id: normalizedLead.id,
        type: "status",
        user_name: "System",
        description: `Status changed from ${formatStatusLabel(currentLead.status)} to ${formatStatusLabel(normalizedLead.status)}`,
        timestamp: new Date().toISOString(),
      })
    }

    if (currentLead?.next_action !== normalizedLead.next_action) {
      activityEntries.push({
        lead_id: normalizedLead.id,
        type: "update",
        user_name: "System",
        description: `Next action updated to: ${normalizedLead.next_action}`,
        timestamp: new Date().toISOString(),
      })
    }

    if (currentLead?.client_follow_up_state !== normalizedLead.client_follow_up_state) {
      activityEntries.push({
        lead_id: normalizedLead.id,
        type: "update",
        user_name: "System",
        description: normalizedLead.client_follow_up_state
          ? `Client response state updated to ${String(normalizedLead.client_follow_up_state)
              .replaceAll("_", " ")
              .trim()}.`
          : "Client response state cleared.",
        timestamp: new Date().toISOString(),
      })
    }

    if (currentLead?.follow_up_at !== normalizedLead.follow_up_at && normalizedLead.follow_up_at) {
      activityEntries.push({
        lead_id: normalizedLead.id,
        type: "follow_up",
        user_name: "System",
        description: `Follow-up date set for ${new Date(normalizedLead.follow_up_at).toLocaleDateString()}`,
        timestamp: new Date().toISOString(),
      })
    }

    await logLeadActivity(activityEntries)
    const changedFields = [
      currentLead?.status !== normalizedLead.status ? "status" : null,
      currentLead?.allocated_to !== normalizedLead.allocated_to ? "allocated_to" : null,
      currentLead?.next_action !== normalizedLead.next_action ? "next_action" : null,
      currentLead?.follow_up_at !== normalizedLead.follow_up_at ? "follow_up_at" : null,
      currentLead?.quote_value !== normalizedLead.quote_value ? "quote_value" : null,
      currentLead?.google_sheet_url !== normalizedLead.google_sheet_url
        ? "google_sheet_url"
        : null,
      currentLead?.client_follow_up_state !== normalizedLead.client_follow_up_state
        ? "client_follow_up_state"
        : null,
    ].filter(Boolean)

    if (changedFields.length > 0) {
      await sendCrmNotification({
        eventType: "lead_updated",
        lead: normalizedLead,
        previousLead: currentLead,
        actor: user?.email || "Smart Steel CRM",
        changedFields,
        summary: `Lead updated: ${changedFields.join(", ").replaceAll("_", " ")}.`,
      })
    }
    setEditingLead(null)
    return true
  }

  const handleDeleteLead = async (id) => {
    if (!confirm("Are you sure you want to delete this lead?")) return

    const { error } = await supabase.from("leads").delete().eq("id", id)
    if (error) {
      alert("Error deleting lead: " + error.message)
      return
    }

    setLeads((prev) => prev.filter((lead) => lead.id !== id))
    clearFallbackNextAction(id)
    clearFallbackFields(id)
    setEditingLead(null)
    setIsAddingLead(false)
  }

  const handleLeadStatusChange = async (leadId, newStatus) => {
    const normalizedStatus = normalizeStatus(newStatus)
    const previousLead = leads.find((lead) => lead.id === leadId)
    const stageValidationError = getLeadStageValidationMessage(
      { ...previousLead, status: normalizedStatus },
      normalizedStatus
    )

    if (stageValidationError) {
      alert(stageValidationError)
      if (previousLead) {
        setEditingLead(previousLead)
      }
      return
    }

    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId ? { ...lead, status: normalizedStatus } : lead
      )
    )

    const { error } = await supabase
      .from("leads")
      .update({ status: normalizedStatus })
      .eq("id", leadId)

    if (error) {
      console.error("Error updating lead status:", error)
      if (previousLead) {
        setLeads((prev) =>
          prev.map((lead) => (lead.id === leadId ? previousLead : lead))
        )
      }
      return
    }

    if (previousLead && normalizeStatus(previousLead.status) !== normalizedStatus) {
      await logLeadActivity({
        lead_id: leadId,
        type: "status",
        user_name: "System",
        description: `Status changed from ${formatStatusLabel(previousLead.status)} to ${formatStatusLabel(normalizedStatus)}`,
        timestamp: new Date().toISOString(),
      })
      await sendCrmNotification({
        eventType: "status_changed",
        lead: { ...previousLead, status: normalizedStatus },
        previousLead,
        actor: user?.email || "Smart Steel CRM",
        changedFields: ["status"],
        summary: `Lead moved from ${formatStatusLabel(previousLead.status)} to ${formatStatusLabel(normalizedStatus)}.`,
      })
    }
  }

  const handleOpenEstimate = (lead) => {
    setEstimatingLead(lead)
  }

  const handleOpenInvoice = (lead) => {
    setInvoicingLead(lead)
  }

  const handleSnoozeLeadToTomorrow = async (lead) => {
    const followUpAt = getTomorrowIsoDate()
    const { error } = await supabase
      .from("leads")
      .update({ follow_up_at: followUpAt })
      .eq("id", lead.id)

    if (error) {
      alert("Could not move follow-up to tomorrow: " + error.message)
      return
    }

    const updatedLead = normalizeLead({ ...lead, follow_up_at: followUpAt })
    setLeads((prev) => prev.map((item) => (item.id === lead.id ? updatedLead : item)))
    await logLeadActivity({
      lead_id: lead.id,
      type: "follow_up",
      user_name: "System",
      description: "Follow-up moved to tomorrow from Today's Work.",
      timestamp: new Date().toISOString(),
    })
  }

  const handleCompleteDailyTask = async (taskId) => {
    const { error } = await supabase
      .from("tasks")
      .update({ completed: true })
      .eq("id", taskId)

    if (error) {
      alert("Could not complete task: " + error.message)
      return
    }

    setDailyTasks((prev) => prev.filter((task) => task.id !== taskId))
  }

  const handleSaveEstimate = async (estimateDraft) => {
    if (!estimateDraft?.lead?.id) {
      alert("Please save the lead before creating an estimate.")
      return false
    }

    const leadId = estimateDraft.lead.id
    const existingForLead = leadEstimates[leadId] || []
    const isEstimateUpdate = estimateDraft.save_mode === "update" && Boolean(estimateDraft.id)
    const initialVersion = Number(estimateDraft.version_no) || getNextEstimateVersion(existingForLead)
    const shareToken = estimateDraft.share_token || generateShareToken()
    const estimateBaseTitle =
      stripEstimateVersionSuffix(estimateDraft.title) ||
      `${estimateDraft.product_type || "Estimate"} Estimate`
    let estimatePayload = {
      lead_id: leadId,
      version_no: initialVersion,
      product_type: estimateDraft.product_type,
      title: `${estimateBaseTitle} V${initialVersion}`,
      input_data: estimateDraft.input_data,
      line_items: estimateDraft.line_items,
      subtotal: estimateDraft.subtotal,
      markup_multiplier: estimateDraft.markup_multiplier,
      total: estimateDraft.total,
      notes: estimateDraft.notes || "",
      created_by: user?.id || null,
      share_token: shareToken,
      shared_at: new Date().toISOString(),
    }

    let savedEstimate = null
    let estimateInsertPayload = { ...estimatePayload }
    let insertResult = isEstimateUpdate
      ? await supabase
          .from("estimates")
          .update(estimateInsertPayload)
          .eq("id", estimateDraft.id)
          .select()
      : await supabase.from("estimates").insert([estimateInsertPayload]).select()

    while (insertResult.error) {
      const message = insertResult.error.message || ""
      const missingColumn = parseMissingColumn(insertResult.error)

      if (!isEstimateUpdate && (/estimates_lead_version_idx/i.test(message) || /duplicate key value/i.test(message))) {
        const { data: existingDbEstimates } = await supabase
          .from("estimates")
          .select("id, version_no")
          .eq("lead_id", leadId)

        const nextVersion = getNextEstimateVersion([
          ...existingForLead,
          ...(existingDbEstimates || []),
        ])

        estimatePayload = {
          ...estimatePayload,
          version_no: nextVersion,
          title: `${estimateBaseTitle} V${nextVersion}`,
        }
        estimateInsertPayload = { ...estimatePayload }
        insertResult = await supabase.from("estimates").insert([estimateInsertPayload]).select()
        continue
      }

      if (/relation .*estimates.* does not exist/i.test(message) || /Could not find the table/i.test(message)) {
        savedEstimate = isEstimateUpdate
          ? {
              ...(existingForLead.find((estimate) => estimate.id === estimateDraft.id) || {}),
              ...estimatePayload,
              id: estimateDraft.id,
              created_at:
                existingForLead.find((estimate) => estimate.id === estimateDraft.id)?.created_at ||
                new Date().toISOString(),
            }
          : {
              id: `local-${leadId}-${Date.now()}`,
              created_at: new Date().toISOString(),
              ...estimatePayload,
            }
        setStoredEstimatesForLead(
          leadId,
          isEstimateUpdate
            ? existingForLead.map((estimate) => (estimate.id === savedEstimate.id ? savedEstimate : estimate))
            : [savedEstimate, ...existingForLead]
        )
        break
      }

      if (!missingColumn || !["share_token", "shared_at", "accepted_at", "accepted_by_name", "accepted_by_email", "pdf_url"].includes(missingColumn)) {
        alert("Error saving estimate: " + insertResult.error.message)
        return false
      }

      delete estimateInsertPayload[missingColumn]
      insertResult = isEstimateUpdate
        ? await supabase
            .from("estimates")
            .update(estimateInsertPayload)
            .eq("id", estimateDraft.id)
            .select()
        : await supabase.from("estimates").insert([estimateInsertPayload]).select()
    }

    if (!savedEstimate && !insertResult.error) {
      savedEstimate = insertResult.data?.[0]
      if (!savedEstimate?.share_token) {
        savedEstimate = {
          ...savedEstimate,
          share_token: shareToken,
        }
      }
      setStoredEstimatesForLead(
        leadId,
        isEstimateUpdate
          ? existingForLead
              .map((estimate) => (estimate.id === savedEstimate.id ? savedEstimate : estimate))
              .sort((a, b) => Number(b.version_no || 0) - Number(a.version_no || 0))
          : [savedEstimate, ...existingForLead].sort(
              (a, b) => Number(b.version_no || 0) - Number(a.version_no || 0)
            )
      )
    }

    const currentLead = leads.find((lead) => lead.id === leadId)
    const updatedLead = normalizeLead({
      ...currentLead,
      status: "quoted",
      quote_value: estimateDraft.total,
      product_type: estimateDraft.product_type || currentLead?.product_type,
      next_action: "Send estimate to client and follow up",
      estimate_request: estimateDraft.estimate_request,
    })

    const updatePayload = {
      status: "quoted",
      quote_value: estimateDraft.total,
      product_type: updatedLead.product_type,
      next_action: updatedLead.next_action,
      estimate_request: updatedLead.estimate_request,
    }

    const updateResult = await supabase.from("leads").update(updatePayload).eq("id", leadId)
    if (updateResult.error) {
      const unsupportedColumns = []
      let retryResult = updateResult

      while (retryResult.error) {
        const missingColumn = parseMissingColumn(retryResult.error)
        if (!missingColumn || !CRM_FALLBACK_FIELDS.includes(missingColumn)) break
        unsupportedColumns.push(missingColumn)
        const fallbackPayload = { ...updatePayload }
        unsupportedColumns.forEach((field) => delete fallbackPayload[field])
        retryResult = await supabase.from("leads").update(fallbackPayload).eq("id", leadId)
      }

      if (retryResult.error) {
        alert("Estimate saved, but lead update failed: " + retryResult.error.message)
      } else {
        if (unsupportedColumns.includes("next_action")) {
          persistFallbackNextAction(leadId, updatedLead.next_action)
        } else {
          clearFallbackNextAction(leadId)
        }
        if (unsupportedColumns.length > 0) {
          persistFallbackFields(leadId, updatedLead)
        } else {
          clearFallbackFields(leadId)
        }
      }
    } else {
      clearFallbackNextAction(leadId)
      clearFallbackFields(leadId)
    }

    setLeads((prev) => prev.map((lead) => (lead.id === leadId ? updatedLead : lead)))

    await logLeadActivity([
      {
        lead_id: leadId,
        type: "update",
        user_name: "System",
        description: `Estimate V${estimatePayload.version_no} ${isEstimateUpdate ? "updated" : "created"} for ${formatStatusLabel(updatedLead.status)} stage.`,
        timestamp: new Date().toISOString(),
      },
      currentLead?.status !== "quoted"
        ? {
            lead_id: leadId,
            type: "status",
            user_name: "System",
            description: `Status changed from ${formatStatusLabel(currentLead?.status)} to Quoted`,
            timestamp: new Date().toISOString(),
          }
        : null,
    ])

    await sendCrmNotification({
      eventType: "lead_updated",
      lead: updatedLead,
      previousLead: currentLead,
      actor: user?.email || "Smart Steel CRM",
      changedFields: ["status", "quote_value", "next_action"],
      summary: isEstimateUpdate
        ? `Estimate V${estimatePayload.version_no} updated and lead quote data refreshed.`
        : `Estimate V${estimatePayload.version_no} created and lead moved to quoted.`,
    })

    setEditingLead(updatedLead)
    return savedEstimate
  }

  const handleSaveInvoice = async (invoiceDraft) => {
    if (!invoiceDraft?.lead?.id) {
      alert("Please save the lead before creating an invoice.")
      return false
    }

    const leadId = invoiceDraft.lead.id
    const existingForLead = leadInvoices[leadId] || []
    const isInvoiceUpdate = invoiceDraft.save_mode === "update" && Boolean(invoiceDraft.id)
    let initialSequence = Number(invoiceDraft.sequence_no) || getNextInvoiceSequenceValue(existingForLead)
    const shareToken = invoiceDraft.share_token || generateShareToken()

    if (!isInvoiceUpdate) {
      const { data: existingDbInvoices } = await supabase
        .from("invoices")
        .select("sequence_no")
        .order("sequence_no", { ascending: false })
        .limit(1)

      initialSequence = Math.max(
        initialSequence,
        getNextInvoiceSequenceValue(existingDbInvoices || [])
      )
    }

    let invoicePayload = {
      lead_id: leadId,
      sequence_no: initialSequence,
      invoice_number: invoiceDraft.invoice_number || `INV-${String(initialSequence).padStart(3, "0")}`,
      title: invoiceDraft.title,
      invoice_for: invoiceDraft.invoice_for,
      product_type: invoiceDraft.product_type || "",
      product_type_display: invoiceDraft.product_type_display || invoiceDraft.product_type || "",
      reference_no: invoiceDraft.reference_no || "",
      issue_date: invoiceDraft.issue_date,
      due_date: invoiceDraft.due_date,
      payment_terms: invoiceDraft.payment_terms || "",
      input_data: invoiceDraft.input_data || {},
      line_items: invoiceDraft.line_items || [],
      subtotal: invoiceDraft.subtotal || 0,
      vat_rate: invoiceDraft.vat_rate || 0.15,
      total: invoiceDraft.total || 0,
      notes: invoiceDraft.notes || "",
      created_by: user?.id || null,
      share_token: shareToken,
      shared_at: new Date().toISOString(),
    }

    let savedInvoice = null
    let invoiceInsertPayload = { ...invoicePayload }
    let insertResult = isInvoiceUpdate
      ? await supabase
          .from("invoices")
          .update(invoiceInsertPayload)
          .eq("id", invoiceDraft.id)
          .select()
      : await supabase.from("invoices").insert([invoiceInsertPayload]).select()

    while (insertResult.error) {
      const message = insertResult.error.message || ""
      const missingColumn = parseMissingColumn(insertResult.error)

      if (!isInvoiceUpdate && /duplicate key value/i.test(message)) {
        const { data: existingDbInvoices } = await supabase
          .from("invoices")
          .select("sequence_no")
          .order("sequence_no", { ascending: false })
          .limit(1)

        const nextSequence = getNextInvoiceSequenceValue([
          ...existingForLead,
          ...(existingDbInvoices || []),
        ])

        invoicePayload = {
          ...invoicePayload,
          sequence_no: nextSequence,
          invoice_number: `INV-${String(nextSequence).padStart(3, "0")}`,
        }
        invoiceInsertPayload = { ...invoicePayload }
        insertResult = await supabase.from("invoices").insert([invoiceInsertPayload]).select()
        continue
      }

      if (/relation .*invoices.* does not exist/i.test(message) || /Could not find the table/i.test(message)) {
        savedInvoice = isInvoiceUpdate
          ? {
              ...(existingForLead.find((invoice) => invoice.id === invoiceDraft.id) || {}),
              ...invoicePayload,
              id: invoiceDraft.id,
              created_at:
                existingForLead.find((invoice) => invoice.id === invoiceDraft.id)?.created_at ||
                new Date().toISOString(),
            }
          : {
              id: `local-${leadId}-${Date.now()}`,
              created_at: new Date().toISOString(),
              ...invoicePayload,
            }
        setStoredInvoicesForLead(
          leadId,
          isInvoiceUpdate
            ? existingForLead.map((invoice) => (invoice.id === savedInvoice.id ? savedInvoice : invoice))
            : [savedInvoice, ...existingForLead]
        )
        break
      }

      if (
        !missingColumn ||
        ![
          "invoice_number",
          "sequence_no",
          "invoice_for",
          "reference_no",
          "issue_date",
          "due_date",
          "payment_terms",
          "input_data",
          "line_items",
          "subtotal",
          "vat_rate",
          "share_token",
          "shared_at",
          "pdf_url",
          "product_type_display",
        ].includes(missingColumn)
      ) {
        alert("Error saving invoice: " + insertResult.error.message)
        return false
      }

      delete invoiceInsertPayload[missingColumn]
      insertResult = isInvoiceUpdate
        ? await supabase
            .from("invoices")
            .update(invoiceInsertPayload)
            .eq("id", invoiceDraft.id)
            .select()
        : await supabase.from("invoices").insert([invoiceInsertPayload]).select()
    }

    if (!savedInvoice && !insertResult.error) {
      savedInvoice = insertResult.data?.[0]
      if (!savedInvoice?.share_token) {
        savedInvoice = {
          ...savedInvoice,
          share_token: shareToken,
        }
      }
      setStoredInvoicesForLead(
        leadId,
        isInvoiceUpdate
          ? existingForLead
              .map((invoice) => (invoice.id === savedInvoice.id ? savedInvoice : invoice))
              .sort((a, b) => Number(b.sequence_no || 0) - Number(a.sequence_no || 0))
          : [savedInvoice, ...existingForLead].sort(
              (a, b) => Number(b.sequence_no || 0) - Number(a.sequence_no || 0)
            )
      )
    }

    await logLeadActivity({
      lead_id: leadId,
      type: "update",
      user_name: "System",
      description: `Invoice ${invoicePayload.invoice_number} ${isInvoiceUpdate ? "updated" : "created"} for ${invoicePayload.invoice_for || "this lead"}.`,
      timestamp: new Date().toISOString(),
    })

    const currentLead = leads.find((lead) => lead.id === leadId)
    await sendCrmNotification({
      eventType: "lead_updated",
      lead: currentLead,
      previousLead: currentLead,
      actor: user?.email || "Smart Steel CRM",
      changedFields: ["invoice"],
      summary: isInvoiceUpdate
        ? `Invoice ${invoicePayload.invoice_number} updated.`
        : `Invoice ${invoicePayload.invoice_number} created.`,
    })

    setEditingLead(currentLead || null)
    return savedInvoice
  }

  const assigneeOptions = useMemo(() => {
    const seen = new Set(TEAM_MEMBERS)
    leads.forEach((lead) => {
      if (lead.allocated_to) {
        seen.add(lead.allocated_to)
      }
    })
    return ["all", ...Array.from(seen)]
  }, [leads])

  const currentTeamMember = useMemo(() => getTeamMemberFromUser(user), [user])

  const filteredLeads = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    return leads.filter((lead) => {
      const matchesSearch =
        !query ||
        [
          lead.name,
          lead.last_name,
          lead.email,
          lead.phone,
          lead.estimate_request,
          lead.notes,
          lead.next_action,
          lead.lead_source,
          lead.product_type,
          lead.quote_value,
          lead.lost_reason,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query))

      const matchesStatus =
        statusFilter === "all" || normalizeStatus(lead.status) === statusFilter
      const matchesAssignee =
        assigneeFilter === "all" || lead.allocated_to === assigneeFilter
      const matchesOwnership =
        ownershipView === "all" ||
        !currentTeamMember ||
        lead.allocated_to === currentTeamMember
      const matchesMetric =
        metricFilter === "all" ||
        (metricFilter === "quoted" && normalizeStatus(lead.status) === "quoted") ||
        (metricFilter === "won" && normalizeStatus(lead.status) === "won") ||
        (metricFilter === "follow_up_today" && isSameDay(lead.follow_up_at)) ||
        (metricFilter === "missing_next_step" && !lead.next_action?.trim()) ||
        (metricFilter === "overdue_follow_up" && isBeforeToday(lead.follow_up_at))

      return matchesSearch && matchesStatus && matchesAssignee && matchesOwnership && matchesMetric
    })
  }, [assigneeFilter, currentTeamMember, leads, metricFilter, ownershipView, searchTerm, statusFilter])

  const metrics = useMemo(() => {
    const todayCount = leads.filter((lead) => isSameDay(lead.follow_up_at)).length
    const overdueCount = leads.filter((lead) => isBeforeToday(lead.follow_up_at)).length

    return [
      {
        key: "all",
        label: "Total leads",
        value: leads.length,
        tone: "border-slate-200 bg-white",
      },
      {
        key: "quoted",
        label: "Quoted",
        value: leads.filter((lead) => normalizeStatus(lead.status) === "quoted").length,
        tone: "border-amber-200 bg-amber-50",
      },
      {
        key: "won",
        label: "Won",
        value: leads.filter((lead) => normalizeStatus(lead.status) === "won").length,
        tone: "border-emerald-200 bg-emerald-50",
      },
      {
        key: "follow_up_today",
        label: "Follow-up today",
        value: todayCount,
        tone: "border-sky-200 bg-sky-50",
      },
      {
        key: "missing_next_step",
        label: "Missing next step",
        value: leads.filter((lead) => !lead.next_action?.trim()).length,
        tone: "border-violet-200 bg-violet-50",
      },
      {
        key: "overdue_follow_up",
        label: "Overdue follow-ups",
        value: overdueCount,
        tone: "border-rose-200 bg-rose-50",
      },
    ]
  }, [leads])

  const quotedValueSummary = useMemo(() => {
    const quotedLeads = leads.filter((lead) => normalizeStatus(lead.status) === "quoted")
    const totalQuotedValue = quotedLeads.reduce(
      (sum, lead) => sum + parseQuoteValue(lead.quote_value),
      0
    )

    return {
      leadCount: quotedLeads.length,
      totalQuotedValue,
      averageQuotedValue: quotedLeads.length > 0 ? totalQuotedValue / quotedLeads.length : 0,
    }
  }, [leads])

  const leadFlowSummary = useMemo(() => {
    const now = new Date()
    const currentWeekStart = getStartOfWeek(now)
    const nextWeekStart = addDays(currentWeekStart, 7)
    const previousWeekStart = addDays(currentWeekStart, -7)

    const currentMonthStart = getStartOfMonth(now)
    const nextMonthStart = addMonths(currentMonthStart, 1)
    const previousMonthStart = addMonths(currentMonthStart, -1)

    const currentQuarterStart = getStartOfQuarter(now)
    const nextQuarterStart = addQuarters(currentQuarterStart, 1)
    const previousQuarterStart = addQuarters(currentQuarterStart, -1)

    const currentWeek = countLeadsCreatedBetween(leads, currentWeekStart, nextWeekStart)
    const previousWeek = countLeadsCreatedBetween(leads, previousWeekStart, currentWeekStart)
    const currentMonth = countLeadsCreatedBetween(leads, currentMonthStart, nextMonthStart)
    const previousMonth = countLeadsCreatedBetween(leads, previousMonthStart, currentMonthStart)
    const currentQuarter = countLeadsCreatedBetween(leads, currentQuarterStart, nextQuarterStart)
    const previousQuarter = countLeadsCreatedBetween(leads, previousQuarterStart, currentQuarterStart)

    return {
      currentWeek,
      previousWeek,
      currentMonth,
      previousMonth,
      currentQuarter,
      previousQuarter,
    }
  }, [leads])

  const leadFlowCards = useMemo(() => {
    const isMonthView = leadFlowView === "month"
    const currentValue = isMonthView ? leadFlowSummary.currentMonth : leadFlowSummary.currentWeek
    const previousValue = isMonthView ? leadFlowSummary.previousMonth : leadFlowSummary.previousWeek

    return [
      {
        label: isMonthView ? "New leads this month" : "New leads this week",
        value: currentValue,
        helper: isMonthView
          ? "All new leads created this month."
          : "All new leads created this week.",
        tone: "border-slate-200 bg-white",
      },
      {
        label: isMonthView ? "Previous month" : "Previous week",
        value: previousValue,
        helper: getChangeLabel(currentValue, previousValue),
        tone: "border-sky-200 bg-sky-50",
      },
      {
        label: "This quarter",
        value: leadFlowSummary.currentQuarter,
        helper: "New leads created this quarter so far.",
        tone: "border-amber-200 bg-amber-50",
      },
      {
        label: "Previous quarter",
        value: leadFlowSummary.previousQuarter,
        helper: getChangeLabel(leadFlowSummary.currentQuarter, leadFlowSummary.previousQuarter),
        tone: "border-emerald-200 bg-emerald-50",
      },
    ]
  }, [leadFlowSummary, leadFlowView])

  const quotedLeads = useMemo(() => {
    return [...leads]
      .filter((lead) => normalizeStatus(lead.status) === "quoted")
      .sort((a, b) => {
        const quoteDiff = parseQuoteValue(b.quote_value) - parseQuoteValue(a.quote_value)
        if (quoteDiff !== 0) return quoteDiff
        return new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0)
      })
  }, [leads])

  const quoteWorkspaceSummary = useMemo(() => {
    const missingValue = quotedLeads.filter((lead) => parseQuoteValue(lead.quote_value) <= 0).length
    const missingFollowUp = quotedLeads.filter((lead) => !lead.follow_up_at).length
    const stale = quotedLeads.filter((lead) => getDaysSince(getLeadFreshnessDate(lead)) >= 5).length
    const biggestQuote = quotedLeads.reduce((highest, lead) => {
      const value = parseQuoteValue(lead.quote_value)
      return value > highest ? value : highest
    }, 0)

    return {
      total: quotedLeads.length,
      missingValue,
      missingFollowUp,
      stale,
      biggestQuote,
    }
  }, [quotedLeads])

  const slaMetrics = useMemo(() => {
    const scopedLeads = leads.filter((lead) => {
      if (ownershipView === "all" || !currentTeamMember) return true
      return lead.allocated_to === currentTeamMember
    })

    return [
      {
        label: "New leads untouched",
        value: scopedLeads.filter(
          (lead) => normalizeStatus(lead.status) === "new" && getDaysSince(lead.created_at) >= 1
        ).length,
        helper: "New leads older than one day still sitting in New.",
        tone: "border-rose-200 bg-rose-50 text-rose-700",
      },
      {
        label: "Quoted no follow-up",
        value: scopedLeads.filter(
          (lead) =>
            normalizeStatus(lead.status) === "quoted" &&
            (!lead.follow_up_at || getDaysSince(lead.follow_up_at) >= 2)
        ).length,
        helper: "Quoted leads need a live follow-up date within 48 hours.",
        tone: "border-amber-200 bg-amber-50 text-amber-700",
      },
      {
        label: "Stale over 5 days",
        value: scopedLeads.filter((lead) => getDaysSince(getLeadFreshnessDate(lead)) > 5).length,
        helper: "Leads with no movement in the last five days.",
        tone: "border-sky-200 bg-sky-50 text-sky-700",
      },
    ]
  }, [currentTeamMember, leads, ownershipView])

  const metricFilterLabel = useMemo(() => {
    const match = metrics.find((metric) => metric.key === metricFilter)
    return match?.label || "All leads"
  }, [metricFilter, metrics])

  const handleMetricShortcut = (nextMetricFilter) => {
    if (!METRIC_FILTER_OPTIONS.includes(nextMetricFilter)) return

    setCrmView("pipeline")
    setMetricFilter(nextMetricFilter)

    window.setTimeout(() => {
      boardSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 60)
  }

  const attentionItems = useMemo(() => {
    return [
      {
        label: "Unassigned leads",
        value: leads.filter((lead) => !lead.allocated_to?.trim()).length,
        helper: "No one owns these leads yet.",
      },
      {
        label: "Quoted without value",
        value: leads.filter(
          (lead) =>
            normalizeStatus(lead.status) === "quoted" &&
            !String(lead.quote_value || "").trim()
        ).length,
        helper: "Quoted deals need a number for reporting.",
      },
      {
        label: "Waiting on client",
        value: leads.filter(
          (lead) => Boolean(String(lead.client_follow_up_state || "").trim())
        ).length,
        helper: "Leads where the next move is with the client, either awaiting reply or waiting for them to revert.",
      },
      {
        label: "Lost without reason",
        value: leads.filter(
          (lead) =>
            normalizeStatus(lead.status) === "lost" &&
            !lead.lost_reason?.trim()
        ).length,
        helper: "You need loss reasons to learn from missed deals.",
      },
    ]
  }, [leads])

  const accountabilityRows = useMemo(() => {
    return TEAM_MEMBERS.map((member) => {
      const ownedLeads = leads.filter((lead) => lead.allocated_to === member)
      const overdue = ownedLeads.filter((lead) => isBeforeToday(lead.follow_up_at)).length
      const noNextStep = ownedLeads.filter((lead) => !lead.next_action?.trim()).length
      const stale = ownedLeads.filter((lead) => getDaysSince(getLeadFreshnessDate(lead)) > 5).length
      const won = ownedLeads.filter((lead) => normalizeStatus(lead.status) === "won").length

      return {
        member,
        owned: ownedLeads.length,
        overdue,
        noNextStep,
        stale,
        won,
      }
    })
  }, [leads])

  const atRiskLeads = useMemo(() => {
    return leads
      .filter((lead) => {
        const staleDays = getDaysSince(getLeadFreshnessDate(lead))
        return (
          isBeforeToday(lead.follow_up_at) ||
          !lead.next_action?.trim() ||
          staleDays > 5 ||
          (!lead.allocated_to?.trim() && normalizeStatus(lead.status) !== "won")
        )
      })
      .sort((a, b) => getDaysSince(getLeadFreshnessDate(b)) - getDaysSince(getLeadFreshnessDate(a)))
      .slice(0, 8)
  }, [leads])

  const todaysWork = useMemo(() => {
    const scopedLeads = leads.filter((lead) => {
      if (ownershipView === "all" || !currentTeamMember) return true
      return lead.allocated_to === currentTeamMember
    })
    const activeLeads = scopedLeads.filter((lead) => !["won", "lost"].includes(normalizeStatus(lead.status)))
    const overdueFollowUps = activeLeads
      .filter((lead) => isBeforeToday(lead.follow_up_at))
      .sort((a, b) => new Date(a.follow_up_at).getTime() - new Date(b.follow_up_at).getTime())
      .slice(0, 6)
    const dueToday = activeLeads
      .filter((lead) => isSameDay(lead.follow_up_at))
      .sort((a, b) => String(a.allocated_to || "").localeCompare(String(b.allocated_to || "")))
      .slice(0, 6)
    const needsDecision = activeLeads
      .filter((lead) => {
        const staleDays = getDaysSince(getLeadFreshnessDate(lead))
        return !lead.next_action?.trim() || !lead.allocated_to?.trim() || staleDays > 5
      })
      .sort((a, b) => getDaysSince(getLeadFreshnessDate(b)) - getDaysSince(getLeadFreshnessDate(a)))
      .slice(0, 6)
    const openTasks = dailyTasks
      .filter((task) => {
        if (ownershipView === "all" || !currentTeamMember) return true
        return !task.assignee || task.assignee === currentTeamMember
      })
      .filter((task) => !task.due_date || task.due_date <= new Date().toISOString().split("T")[0])
      .slice(0, 6)

    return {
      overdueFollowUps,
      dueToday,
      needsDecision,
      openTasks,
      total:
        overdueFollowUps.length +
        dueToday.length +
        needsDecision.length +
        openTasks.length,
    }
  }, [currentTeamMember, dailyTasks, leads, ownershipView])

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="rounded-3xl border border-slate-200 bg-white px-8 py-6 text-sm text-slate-600 shadow-sm">
          Loading Smart Steel CRM...
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 px-3 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto mt-12 max-w-7xl space-y-5 overflow-x-hidden sm:mt-16 sm:space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                Smart Steel CRM
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Smart Steel Leads Centre
              </h1>
              <p className="text-sm leading-6 text-slate-600 sm:text-base">
                Manage leads, next actions, pipeline movement, and team
                accountability from one central workspace.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setOwnershipView("mine")}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    ownershipView === "mine"
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  My Work{currentTeamMember ? `: ${currentTeamMember}` : ""}
                </button>
                <button
                  type="button"
                  onClick={() => setOwnershipView("all")}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    ownershipView === "all"
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  Whole Team
                </button>
              </div>
            </div>

            <div className="sm:hidden">
              <div className="grid gap-2">
                <button
                  className="inline-flex w-full items-center justify-center rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                  onClick={() => setIsAddingLead(true)}
                >
                  + New Lead
                </button>
                <button
                  type="button"
                  onClick={() => setShowMobileAdminPanel((current) => !current)}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  {showMobileAdminPanel ? "Hide tools" : "Show tools"}
                </button>
              </div>
              {showMobileAdminPanel ? (
                <div className="mt-2 grid gap-2">
                  <button
                    className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                    onClick={handleLogout}
                  >
                    Sign out
                  </button>
                  <button
                    className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                    onClick={() => setShowPricesDrawer(true)}
                  >
                    Prices & Templates
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!GENERAL_GOOGLE_SHEET_URL) {
                        alert("Add your shared Google Sheet URL in src/app/kanban/page.js to enable this shortcut.")
                        return
                      }
                      window.open(GENERAL_GOOGLE_SHEET_URL, "_blank", "noopener,noreferrer")
                    }}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    <Link2 size={16} />
                    General Sheet
                  </button>
                </div>
              ) : null}
            </div>

            <div className="hidden sm:flex sm:flex-wrap sm:gap-3">
              <button
                className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 sm:w-auto sm:py-2"
                onClick={handleLogout}
              >
                Sign out
              </button>
              <button
                className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 sm:w-auto sm:py-2"
                onClick={() => setShowPricesDrawer(true)}
              >
                Prices & Templates
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!GENERAL_GOOGLE_SHEET_URL) {
                    alert("Add your shared Google Sheet URL in src/app/kanban/page.js to enable this shortcut.")
                    return
                  }
                  window.open(GENERAL_GOOGLE_SHEET_URL, "_blank", "noopener,noreferrer")
                }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 sm:w-auto sm:py-2"
              >
                <Link2 size={16} />
                General Sheet
              </button>
              <button
                className="inline-flex w-full items-center justify-center rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 sm:w-auto sm:py-2"
                onClick={() => setIsAddingLead(true)}
              >
                + New Lead
              </button>
            </div>
          </div>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Lead flow
              </p>
              <h2 className="mt-1 text-lg font-semibold text-slate-900">
                New lead momentum for the team
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Quick visibility on lead volume this week, this month, and against previous periods.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {LEAD_FLOW_VIEW_OPTIONS.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setLeadFlowView(option.key)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    leadFlowView === option.key
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {leadFlowCards.map((card) => (
              <div key={card.label} className={`rounded-2xl border p-4 ${card.tone}`}>
                <p className="text-sm font-semibold text-slate-900">{card.label}</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{card.value}</p>
                <p className="mt-2 text-sm text-slate-600">{card.helper}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Workspace view
              </p>
              <h2 className="mt-1 text-lg font-semibold text-slate-900">Choose the lens you need right now</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {CRM_VIEW_OPTIONS.map((view) => (
                <button
                  key={view.key}
                  type="button"
                  onClick={() => setCrmView(view.key)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    crmView === view.key
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {view.label}
                </button>
              ))}
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            {CRM_VIEW_OPTIONS.find((view) => view.key === crmView)?.helper}
          </p>
        </section>

        {crmView === "insights" && (
          <>
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-6">
              {metrics.map((metric) => (
                <button
                  key={metric.label}
                  type="button"
                  onClick={() => handleMetricShortcut(metric.key)}
                  className={`rounded-2xl border p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-4 ${
                    metric.tone
                  } ${metricFilter === metric.key ? "ring-2 ring-slate-900/15" : ""}`}
                >
                  <p className="text-xs text-slate-600 sm:text-sm">{metric.label}</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">{metric.value}</p>
                </button>
              ))}
            </div>

            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Quoted value
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-slate-900">
                    Total value currently sitting in quoted leads
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => handleMetricShortcut("quoted")}
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  Open quoted leads
                </button>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">Total quoted value</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {formatZar(quotedValueSummary.totalQuotedValue)}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Across {quotedValueSummary.leadCount} quoted lead{quotedValueSummary.leadCount === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">Average quoted lead</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {formatZar(quotedValueSummary.averageQuotedValue)}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Useful as a quick quality check on current pipeline value
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">Quoted leads with value</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {leads.filter(
                      (lead) =>
                        normalizeStatus(lead.status) === "quoted" && parseQuoteValue(lead.quote_value) > 0
                    ).length}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Helps spot how complete your quoted-stage reporting is
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    SLA watch
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-slate-900">Where response discipline is slipping</h2>
                </div>
                <p className="text-sm text-slate-500">
                  {ownershipView === "mine" && currentTeamMember ? `${currentTeamMember}'s queue` : "Whole team"} priority watch
                </p>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {slaMetrics.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                        <p className="mt-1 text-sm text-slate-500">{item.helper}</p>
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-sm font-bold ${item.tone}`}>
                        {item.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {crmView === "my_work" && (
          <>
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 shadow-sm">
          <div className="bg-[radial-gradient(circle_at_top_left,_rgba(248,113,113,0.25),_transparent_34%),linear-gradient(135deg,_#0f172a,_#111827_55%,_#1f2937)] p-4 text-white sm:p-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-red-200">
                  Today&apos;s work
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                  My work queue
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-200">
                  Start here each morning: overdue follow-ups, today&apos;s calls, loose ends,
                  and open tasks that need to move before the day disappears.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-300">
                  {ownershipView === "mine" && currentTeamMember ? `${currentTeamMember}'s queue` : "Open items"}
                </p>
                <p className="mt-1 text-3xl font-bold">{todaysWork.total}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 bg-white p-3 sm:p-4 xl:grid-cols-4">
            <TodayWorkColumn
              title="Overdue"
              helper="Follow-ups already slipping"
              tone="rose"
              items={todaysWork.overdueFollowUps}
              emptyText="No overdue follow-ups."
              renderItem={(lead) => (
                <TodayLeadCard
                  key={lead.id}
                  lead={lead}
                  onOpen={() => setEditingLead(lead)}
                  onSnooze={() => handleSnoozeLeadToTomorrow(lead)}
                />
              )}
            />
            <TodayWorkColumn
              title="Due today"
              helper="Calls and follow-ups for today"
              tone="sky"
              items={todaysWork.dueToday}
              emptyText="Nothing due today."
              renderItem={(lead) => (
                <TodayLeadCard
                  key={lead.id}
                  lead={lead}
                  onOpen={() => setEditingLead(lead)}
                  onSnooze={() => handleSnoozeLeadToTomorrow(lead)}
                />
              )}
            />
            <TodayWorkColumn
              title="Needs decision"
              helper="Missing owner, next step, or stale"
              tone="amber"
              items={todaysWork.needsDecision}
              emptyText="No loose ends showing."
              renderItem={(lead) => (
                <TodayLeadCard
                  key={lead.id}
                  lead={lead}
                  onOpen={() => setEditingLead(lead)}
                  onSnooze={() => handleSnoozeLeadToTomorrow(lead)}
                />
              )}
            />
            <TodayWorkColumn
              title="Tasks"
              helper={tasksLoading ? "Loading tasks..." : "CRM tasks due now"}
              tone="emerald"
              items={todaysWork.openTasks}
              emptyText="No open tasks due."
              renderItem={(task) => (
                <TodayTaskCard
                  key={task.id}
                  task={task}
                  onComplete={() => handleCompleteDailyTask(task.id)}
                />
              )}
            />
          </div>
        </section>
            <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <UpcomingTasks onTasksChanged={setDailyTasks} />

              <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <h2 className="text-lg font-semibold text-slate-900">Stalled leads</h2>
                <p className="mt-1 text-sm text-slate-600">
                  These leads are overdue, stale, unassigned, or missing a next step.
                </p>
                <div className="mt-4 space-y-3">
                  {atRiskLeads.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                      No stalled leads right now.
                    </p>
                  ) : (
                    atRiskLeads.map((lead) => (
                      <div key={lead.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-900">
                              {lead.name} {lead.last_name}
                            </p>
                            <p className="text-sm text-slate-600">
                              {lead.product_type || "No product"} · {lead.allocated_to || "Unassigned"}
                            </p>
                          </div>
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                            {formatStatusLabel(lead.status)}
                          </span>
                        </div>
                        <div className="mt-3 grid gap-2 text-sm text-slate-600">
                          <p>
                            <span className="font-medium text-slate-900">Next step:</span>{" "}
                            {lead.next_action || "Missing"}
                          </p>
                          <p>
                            <span className="font-medium text-slate-900">Follow-up:</span>{" "}
                            {lead.follow_up_at
                              ? new Date(lead.follow_up_at).toLocaleDateString()
                              : "Not set"}
                          </p>
                          <p>
                            <span className="font-medium text-slate-900">Last movement:</span>{" "}
                            {Number.isFinite(getDaysSince(getLeadFreshnessDate(lead)))
                              ? `${getDaysSince(getLeadFreshnessDate(lead))} day(s) ago`
                              : "Unknown"}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditingLead(lead)}
                          className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 sm:w-auto"
                        >
                          Review lead
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {crmView === "quotes" && (
          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Quote workspace
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-slate-900">
                    Stay on top of the money already in motion
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("quoted")
                    setCrmView("pipeline")
                  }}
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  Open quoted pipeline
                </button>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-4">
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">Quoted leads</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{quoteWorkspaceSummary.total}</p>
                  <p className="mt-1 text-sm text-slate-600">Active quoted opportunities</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">Total quoted value</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {formatZar(quotedValueSummary.totalQuotedValue)}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">Current value on the table</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">Need follow-up</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{quoteWorkspaceSummary.missingFollowUp}</p>
                  <p className="mt-1 text-sm text-slate-600">Quoted leads without a next date</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">Largest live quote</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {formatZar(quoteWorkspaceSummary.biggestQuote)}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">Biggest opportunity currently quoted</p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Quoted leads</h2>
                  <p className="text-sm text-slate-600">
                    Keep follow-ups tight, adjust estimates fast, and protect quoted momentum.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700">
                    Missing value: {quoteWorkspaceSummary.missingValue}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700">
                    Missing follow-up: {quoteWorkspaceSummary.missingFollowUp}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700">
                    Stale 5+ days: {quoteWorkspaceSummary.stale}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                {quotedLeads.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                    No quoted leads yet. As soon as quotes are created, they&apos;ll show up here as a working queue.
                  </p>
                ) : (
                  quotedLeads.map((lead) => (
                    <div key={lead.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {lead.name} {lead.last_name}
                          </p>
                          <p className="text-sm text-slate-600">
                            {lead.product_type || "No product"} · {lead.allocated_to || "Unassigned"}
                          </p>
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                          {formatStatusLabel(lead.status)}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl bg-white p-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                            Quote value
                          </p>
                          <p className="mt-1 text-2xl font-bold text-slate-900">
                            {parseQuoteValue(lead.quote_value) > 0 ? formatZar(lead.quote_value) : "Missing"}
                          </p>
                        </div>
                        <div className="rounded-xl bg-white p-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                            Follow-up
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-900">
                            {lead.follow_up_at
                              ? new Date(lead.follow_up_at).toLocaleDateString()
                              : "Not scheduled"}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Last movement{" "}
                            {Number.isFinite(getDaysSince(getLeadFreshnessDate(lead)))
                              ? `${getDaysSince(getLeadFreshnessDate(lead))} day(s) ago`
                              : "unknown"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 rounded-xl bg-white p-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                          Next step
                        </p>
                        <p className="mt-1 text-sm text-slate-700">
                          {lead.next_action || "No next step captured yet."}
                        </p>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingLead(lead)}
                          className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                        >
                          Open lead
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEstimate(lead)}
                          className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                        >
                          Open estimate
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenInvoice(lead)}
                          className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                        >
                          Create invoice
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSnoozeLeadToTomorrow(lead)}
                          className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                        >
                          Move to tomorrow
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        )}

        {crmView === "insights" && (
          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Team accountability</h2>
                  <p className="text-sm text-slate-600">
                    This shows who owns pipeline workload and where follow-through is slipping.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-[620px] text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-slate-500">
                      <th className="pb-3 font-medium">Owner</th>
                      <th className="pb-3 font-medium">Leads</th>
                      <th className="pb-3 font-medium">Overdue</th>
                      <th className="pb-3 font-medium">No next step</th>
                      <th className="pb-3 font-medium">Stale</th>
                      <th className="pb-3 font-medium">Won</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accountabilityRows.map((row) => (
                      <tr key={row.member} className="border-b border-slate-100 last:border-b-0">
                        <td className="py-3 font-semibold text-slate-900">{row.member}</td>
                        <td className="py-3 text-slate-700">{row.owned}</td>
                        <td className="py-3 text-rose-600">{row.overdue}</td>
                        <td className="py-3 text-violet-600">{row.noNextStep}</td>
                        <td className="py-3 text-amber-600">{row.stale}</td>
                        <td className="py-3 text-emerald-600">{row.won}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <h2 className="text-lg font-semibold text-slate-900">Needs attention</h2>
                <div className="mt-4 grid gap-3">
                  {attentionItems.map((item) => (
                    <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-slate-900">{item.label}</p>
                        <span className="text-2xl font-bold text-slate-900">{item.value}</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-600">{item.helper}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {crmView === "pipeline" && (
        <>
        <div ref={boardSectionRef} className="scroll-mt-20 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Pipeline view</h2>
              <p className="mt-1 text-sm text-slate-600">
                Search quickly, filter fast, and move leads without extra scrolling.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search leads"
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm shadow-sm outline-none transition focus:border-slate-500"
                aria-label="Search leads"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:w-[360px]">
              <div>
                <label className="mb-1 hidden text-sm font-medium text-slate-700 sm:block">
                  Pipeline stage
                </label>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm shadow-sm outline-none transition focus:border-slate-500"
                  aria-label="Pipeline stage"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status === "all" ? "All stages" : formatStatusLabel(status)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 hidden text-sm font-medium text-slate-700 sm:block">
                  Assigned to
                </label>
                <select
                  value={assigneeFilter}
                  onChange={(event) => setAssigneeFilter(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm shadow-sm outline-none transition focus:border-slate-500"
                  aria-label="Assigned to"
                >
                  {assigneeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option === "all" ? "Everyone" : option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
            <p>
              Showing <span className="font-semibold text-slate-900">{filteredLeads.length}</span>{" "}
              of <span className="font-semibold text-slate-900">{leads.length}</span> leads
            </p>
            <div className="flex flex-wrap items-center gap-3">
              {metricFilter !== "all" && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  Shortcut: {metricFilterLabel}
                </span>
              )}
              {(searchTerm || statusFilter !== "all" || assigneeFilter !== "all" || metricFilter !== "all" || ownershipView !== "mine") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("")
                    setStatusFilter("all")
                    setAssigneeFilter("all")
                    setMetricFilter("all")
                    setOwnershipView("mine")
                  }}
                  className="font-medium text-slate-700 underline underline-offset-4"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
            Loading leads...
          </div>
        ) : (
        <KanbanBoard
          leads={filteredLeads}
          onEditLead={setEditingLead}
          onLeadStatusChange={handleLeadStatusChange}
          onCreateEstimate={handleOpenEstimate}
        />
        )}
        </>
        )}
      </div>

      {editingLead && (
        <LeadEditorDrawer
          lead={editingLead}
          onClose={() => setEditingLead(null)}
          onSave={(lead) => handleSaveLead(lead)}
          onDelete={handleDeleteLead}
          onCreateEstimate={handleOpenEstimate}
          onCreateInvoice={handleOpenInvoice}
        />
      )}

      {isAddingLead && (
        <LeadEditorDrawer
          lead={emptyLead}
          onClose={() => setIsAddingLead(false)}
          onSave={(lead) => handleSaveLead(lead, true)}
          onDelete={handleDeleteLead}
        />
      )}

      {estimatingLead && (
        <EstimateDrawer
          lead={estimatingLead}
          estimates={leadEstimates[estimatingLead.id] || []}
          onClose={() => setEstimatingLead(null)}
          onSaveEstimate={handleSaveEstimate}
        />
      )}

      {invoicingLead && (
        <InvoiceDrawer
          lead={invoicingLead}
          invoices={leadInvoices[invoicingLead.id] || []}
          estimates={leadEstimates[invoicingLead.id] || []}
          onClose={() => setInvoicingLead(null)}
          onSaveInvoice={handleSaveInvoice}
        />
      )}

      {showPricesDrawer && (
        <PricesDrawer onClose={() => setShowPricesDrawer(false)} />
      )}
    </div>
  )
}
