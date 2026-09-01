"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Link2 } from "lucide-react"
import KanbanBoard from "../../components/KanbanBoard.js"
import LeadEditorDrawer from "../../components/LeadEditorDrawer.js"
import PricesDrawer from "../../components/PricesDrawer.js"
import EstimateDrawer from "../../components/EstimateDrawer.js"
import InvoiceDrawer from "../../components/InvoiceDrawer.js"
import UpcomingTasks from "../../components/UpcomingTasks.js"
import {
  formatCrmStatusLabel,
  getLeadSop,
  getLeadStageValidationMessage,
} from "./crmSop.js"
import {
  getOpportunitySummary,
  LEAD_SOURCE_OPTIONS,
  matchesOpportunityQuickView,
  PRODUCT_TYPE_OPTIONS,
  TEAM_MEMBERS,
} from "./crmReferenceData.js"
import { supabase } from "./supabase.js"
import { getOsAuthHeaders } from "../../lib/osClientAuth.js"

const STATUS_OPTIONS = ["all", "new", "contacted", "quoted", "won", "lost"]
const PRODUCT_LINE_FILTER_OPTIONS = ["all", "atlas", "lsf", "general"]
const NEXT_ACTION_STORAGE_KEY = "smartsteel.crm.next-actions"
const CRM_FALLBACK_STORAGE_KEY = "smartsteel.crm.custom-fields"
const CRM_ESTIMATES_STORAGE_KEY = "smartsteel.crm.estimates"
const CRM_INVOICES_STORAGE_KEY = "smartsteel.crm.invoices"
const CRM_LEADS_SNAPSHOT_STORAGE_KEY = "smartsteel.crm.leads-snapshot"
const CRM_TASKS_SNAPSHOT_STORAGE_KEY = "smartsteel.crm.tasks-snapshot"
const CRM_FALLBACK_FIELDS = [
  "next_action",
  "lead_source",
  "product_type",
  "client_follow_up_state",
  "quote_value",
  "lost_reason",
  "google_sheet_url",
  "width",
  "length",
  "wall_height",
]
const METRIC_FILTER_OPTIONS = ["all", "quoted", "won", "follow_up_today", "missing_next_step", "overdue_follow_up"]
const CRM_VIEW_OPTIONS = [
  { key: "pipeline", label: "Pipeline", helper: "Move and review leads" },
  { key: "my_work", label: "Team Queue", helper: "Clear follow-ups, tasks, and loose ends together" },
  { key: "quotes", label: "Quotes", helper: "Manage priced work and quoted momentum" },
  { key: "insights", label: "Insights", helper: "Check workload and risk" },
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

function buildLeadPersistencePayload(lead) {
  const optionalNumericFields = ["quote_value", "width", "length", "wall_height"]
  const payload = { ...lead }

  optionalNumericFields.forEach((field) => {
    if (!Object.prototype.hasOwnProperty.call(payload, field)) return

    const value = payload[field]
    if (value === undefined || value === null || String(value).trim() === "") {
      payload[field] = null
      return
    }

    const numericValue = Number(value)
    payload[field] = Number.isFinite(numericValue) ? numericValue : null
  })

  return payload
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

function isCoveredByAutomatedFollowUp(lead, sequencesByLead) {
  const sequence = sequencesByLead[String(lead?.id || "")]
  return sequence?.status === "active" && Boolean(sequence.next_send_at) && !sequence.last_error
}

function startOfDay(dateValue) {
  const date = new Date(dateValue)
  date.setHours(0, 0, 0, 0)
  return date
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

function readLeadSnapshots() {
  if (typeof window === "undefined") return []

  try {
    return JSON.parse(window.localStorage.getItem(CRM_LEADS_SNAPSHOT_STORAGE_KEY) || "[]")
  } catch {
    return []
  }
}

function writeLeadSnapshots(data) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(CRM_LEADS_SNAPSHOT_STORAGE_KEY, JSON.stringify(data))
}

function readTaskSnapshots() {
  if (typeof window === "undefined") return []

  try {
    return JSON.parse(window.localStorage.getItem(CRM_TASKS_SNAPSHOT_STORAGE_KEY) || "[]")
  } catch {
    return []
  }
}

function writeTaskSnapshots(data) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(CRM_TASKS_SNAPSHOT_STORAGE_KEY, JSON.stringify(data))
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

function isNetworkLoadError(error) {
  const message = String(error?.message || error || "")
  return (
    /load failed/i.test(message) ||
    /failed to fetch/i.test(message) ||
    /network/i.test(message) ||
    /fetch failed/i.test(message)
  )
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

function addDays(dateValue, days) {
  const date = new Date(dateValue)
  date.setDate(date.getDate() + days)
  return date
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

function TodayWorkColumn({ title, helper, tone, items, emptyText, renderItem, priority = false }) {
  const toneClasses = {
    rose: "bg-rose-50 text-rose-700 border-rose-100",
    sky: "bg-sky-50 text-sky-700 border-sky-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
  }

  return (
    <div className={`rounded-2xl border p-3 sm:p-4 ${
      priority ? "border-slate-300 bg-white shadow-sm" : "border-slate-200 bg-slate-50"
    }`}>
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
  const opportunitySummary = getOpportunitySummary(lead)

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">
            {lead.name} {lead.last_name}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            {opportunitySummary.line} · {lead.product_type || "No product"} · {lead.allocated_to || "Unassigned"}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
          {formatStatusLabel(lead.status)}
        </span>
      </div>

      <div className="mt-2 rounded-lg bg-slate-50 p-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Next move
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

function getQueueActionLabel(lead) {
  const action = String(lead?.next_action || "").toLowerCase()
  if (action.includes("email") || action.includes("follow up")) return "Prepare follow-up"
  if (action.includes("estimate") || action.includes("quote")) return "Review estimate"
  if (action.includes("call") || action.includes("contact")) return "Open call details"
  if (!lead?.next_action?.trim()) return "Set next step"
  return "Open next step"
}

function getQueueTiming(lead) {
  if (!lead?.follow_up_at) return { label: "Needs a date", tone: "amber", score: 30 }
  const followUp = startOfDay(lead.follow_up_at)
  const today = startOfDay(new Date())
  const days = Math.round((today.getTime() - followUp.getTime()) / 86400000)

  if (days > 0) {
    return {
      label: `${days} day${days === 1 ? "" : "s"} overdue`,
      tone: "rose",
      score: 100 + days,
    }
  }
  if (days === 0) return { label: "Due today", tone: "sky", score: 80 }
  return {
    label: `Due ${new Date(lead.follow_up_at).toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}`,
    tone: "slate",
    score: 10,
  }
}

function QueueLeadRow({ lead, onOpen, onSnooze, compact = false }) {
  const timing = getQueueTiming(lead)
  const opportunity = getOpportunitySummary(lead)
  const toneClasses = {
    rose: "bg-rose-50 text-rose-700 ring-rose-100",
    sky: "bg-sky-50 text-sky-700 ring-sky-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    slate: "bg-slate-100 text-slate-600 ring-slate-200",
  }

  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-slate-300 hover:shadow-md sm:p-4">
      <div className="flex items-start gap-3">
        <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
          timing.tone === "rose" ? "bg-rose-500" : timing.tone === "sky" ? "bg-sky-500" : "bg-amber-500"
        }`} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-slate-950">{lead.name} {lead.last_name}</h3>
              <p className="mt-0.5 text-xs text-slate-500">
                {opportunity.line} · {lead.product_type || "Project not selected"}
              </p>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${toneClasses[timing.tone]}`}>
              {timing.label}
            </span>
          </div>

          <div className={`${compact ? "mt-2" : "mt-3"} rounded-xl bg-slate-50 px-3 py-2.5`}>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Next move</p>
            <p className="mt-1 text-sm font-medium leading-5 text-slate-700">
              {lead.next_action || "Decide and capture the next action for this lead."}
            </p>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-500">
              Owner: <span className="text-slate-800">{lead.allocated_to || "Unassigned"}</span>
            </span>
            <div className="flex gap-2">
              {!compact && (
                <button
                  type="button"
                  onClick={onSnooze}
                  className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                >
                  Tomorrow
                </button>
              )}
              <button
                type="button"
                onClick={onOpen}
                className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
              >
                {getQueueActionLabel(lead)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

function QueueTaskRow({ task, onComplete }) {
  const overdue = task.due_date && task.due_date < new Date().toISOString().split("T")[0]
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-bold text-slate-950">{task.title}</p>
          <p className="mt-1 text-xs text-slate-500">
            {task.assignee || "Unassigned"} · {task.priority || "Normal priority"}
          </p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
          overdue ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"
        }`}>
          {overdue ? "Task overdue" : "Task due"}
        </span>
      </div>
      <button
        type="button"
        onClick={onComplete}
        className="mt-3 w-full rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
      >
        Mark complete
      </button>
    </article>
  )
}

export default function CrmWorkspace({ mode = "legacy" }) {
  const router = useRouter()
  const isOsCrmRoute = mode === "os"
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
  const [statusFilter, setStatusFilter] = useState("all")
  const [assigneeFilter, setAssigneeFilter] = useState("all")
  const [productLineFilter, setProductLineFilter] = useState("all")
  const [opportunityQuickView, setOpportunityQuickView] = useState("all")
  const [metricFilter, setMetricFilter] = useState("all")
  const [ownershipView, setOwnershipView] = useState("all")
  const [crmView, setCrmView] = useState("pipeline")
  const [nextActionFallbacks, setNextActionFallbacks] = useState({})
  const [fallbackFieldValues, setFallbackFieldValues] = useState({})
  const [leadEstimates, setLeadEstimates] = useState({})
  const [leadInvoices, setLeadInvoices] = useState({})
  const [estimatingLead, setEstimatingLead] = useState(null)
  const [invoicingLead, setInvoicingLead] = useState(null)
  const [dailyTasks, setDailyTasks] = useState([])
  const [tasksLoading, setTasksLoading] = useState(true)
  const [crmLoadWarning, setCrmLoadWarning] = useState("")
  const [teamQueueOwner, setTeamQueueOwner] = useState("all")
  const [showTeamPlanner, setShowTeamPlanner] = useState(false)
  const [followUpSequencesByLead, setFollowUpSequencesByLead] = useState({})

  const fetchFollowUpSequences = async () => {
    const { data, error } = await supabase
      .from("crm_estimate_follow_up_sequences")
      .select("lead_id, status, next_send_at, last_error, created_at")
      .order("created_at", { ascending: false })

    if (error) {
      console.warn("Could not load automated follow-up coverage:", error)
      return
    }

    const latestByLead = {}
    for (const sequence of data || []) {
      const leadId = String(sequence.lead_id || "")
      if (leadId && !latestByLead[leadId]) latestByLead[leadId] = sequence
    }
    setFollowUpSequencesByLead(latestByLead)
  }

  useEffect(() => {
    if (!isOsCrmRoute || typeof window === "undefined") return

    const params = new URLSearchParams(window.location.search)
    if (params.get("newLead") === "1") {
      setIsAddingLead(true)
      window.history.replaceState({}, "", window.location.pathname)
    }
  }, [isOsCrmRoute])

  useEffect(() => {
    if (!isOsCrmRoute || loading || typeof window === "undefined") return

    const params = new URLSearchParams(window.location.search)
    const leadId = params.get("leadId")
    if (!leadId) return

    const lead = leads.find((item) => String(item.id) === leadId)
    if (lead) {
      setCrmView("pipeline")
      setEditingLead(lead)
      window.history.replaceState({}, "", window.location.pathname)
    }
  }, [isOsCrmRoute, leads, loading])

  const fetchLeads = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching leads:", error)
      const cachedLeads = readLeadSnapshots()
      if (cachedLeads.length > 0) {
        setLeads(cachedLeads)
      }
      setCrmLoadWarning("Live CRM connection issue. Showing cached lead data where available.")
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
      writeLeadSnapshots(
        (data || []).map((lead) =>
          withFallbackFields(withFallbackNextAction(lead, fallbackActions), fallbackFields)
        )
      )
      setCrmLoadWarning("")
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
      const cachedTasks = readTaskSnapshots()
      if (cachedTasks.length > 0) {
        setDailyTasks(cachedTasks)
      }
      setCrmLoadWarning((current) => current || "Live CRM connection issue. Showing cached data where available.")
    } else {
      setDailyTasks(data || [])
      writeTaskSnapshots(data || [])
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
      fetchFollowUpSequences()
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

  useEffect(() => {
    if (!user || typeof window === "undefined") return
    const interval = window.setInterval(fetchFollowUpSequences, 5 * 60 * 1000)
    window.addEventListener("focus", fetchFollowUpSequences)
    return () => {
      window.clearInterval(interval)
      window.removeEventListener("focus", fetchFollowUpSequences)
    }
  }, [user])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace("/login")
  }

  const handleCreateProjectFromLead = async (lead) => {
    const productType = String(lead?.product_type || "")
    const normalizedProduct = productType.toLowerCase()
    const companyKey = normalizedProduct.includes("lsf") || normalizedProduct.includes("lightweight")
      ? "lsf"
      : normalizedProduct.includes("atlas") ||
          normalizedProduct.includes("cflc") ||
          normalizedProduct.includes("lcss") ||
          normalizedProduct.includes("lip channel") ||
          normalizedProduct.includes("carport") ||
          normalizedProduct.includes("ground mount")
        ? "atlas"
        : "smart-steel"
    const clientName = [lead?.name, lead?.last_name].filter(Boolean).join(" ").trim() || "Client"
    const estimates = leadEstimates[lead.id] || []
    const latestEstimate = estimates[0]

    const response = await fetch("/api/os/projects", {
      method: "POST",
      headers: await getOsAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({
        sourceLeadId: lead.id,
        companyKey,
        name: `${clientName} - ${productType || "Project"}`,
        clientName,
        system: productType,
        siteContact: [lead.phone, lead.email].filter(Boolean).join(" · "),
        projectManager: lead.allocated_to,
        scope: lead.estimate_request || lead.notes || "",
        references: latestEstimate
          ? `${latestEstimate.title || "Estimate"}${latestEstimate.version_no ? ` · V${latestEstimate.version_no}` : ""}`
          : "",
      }),
    })
    const payload = await response.json()
    if (!response.ok) throw new Error(payload.error || "Could not create the project.")

    setEditingLead(null)
    router.push(`/os/projects?projectId=${encodeURIComponent(payload.record.id)}`)
    return payload
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
      quote_value: isNew ? null : leadData.quote_value,
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
      const persistencePayload = buildLeadPersistencePayload(payload)
      if (isNew) {
        return supabase.from("leads").insert([persistencePayload]).select()
      }

      return supabase.from("leads").update(persistencePayload).eq("id", normalizedLead.id)
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
        response = await supabase.from("leads").insert([buildLeadPersistencePayload(fallbackPayload)]).select()
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
        .update(buildLeadPersistencePayload(fallbackPayload))
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

  const handleOpenEstimate = async (lead) => {
    if (!lead?.id || lead.builder_submission_id || lead.design_reference) {
      setEstimatingLead(lead)
      return
    }

    const { data, error } = await supabase
      .from("warehouse_builder_submissions")
      .select("id, configuration, summary")
      .eq("lead_id", lead.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) console.warn("Could not load the builder reference for this estimate:", error)
    const configuration = data?.configuration || {}
    const summary = data?.summary || {}
    setEstimatingLead({
      ...lead,
      builder_submission_id: data?.id || "",
      design_reference: configuration.designReference || summary.designReference || "",
      builder_configuration: configuration,
    })
  }

  const handleOpenInvoice = (lead) => {
    setInvoicingLead(lead)
  }

  const handleEstimateStatusChange = async (lead, estimate, status) => {
    if (!estimate?.id || String(estimate.id).startsWith("local-")) {
      alert("This estimate must be saved online before its status can be confirmed.")
      return false
    }

    const now = new Date().toISOString()
    const statusPayload = { status }
    if (status === "prepared") statusPayload.prepared_at = estimate.prepared_at || now
    if (status === "sent") statusPayload.sent_at = estimate.sent_at || now
    if (status === "accepted") statusPayload.accepted_at = estimate.accepted_at || now

    const { data: updatedRows, error } = await supabase
      .from("estimates")
      .update(statusPayload)
      .eq("id", estimate.id)
      .select()

    if (error) {
      alert("Could not update estimate status: " + error.message)
      return false
    }

    const updatedEstimate = updatedRows?.[0] || { ...estimate, ...statusPayload }
    const leadId = String(lead.id)
    setStoredEstimatesForLead(
      leadId,
      (leadEstimates[leadId] || []).map((item) =>
        item.id === estimate.id ? updatedEstimate : item
      )
    )

    const currentLeadStatus = normalizeStatus(lead.status)
    const shouldMoveLeadToQuoted =
      status === "sent" && !["quoted", "won", "lost"].includes(currentLeadStatus)

    if (shouldMoveLeadToQuoted) {
      const leadUpdate = {
        status: "quoted",
        quote_value: Number(updatedEstimate.total || estimate.total || lead.quote_value || 0),
        next_action: `Awaiting the client's review of ${updatedEstimate.title || `estimate V${estimate.version_no || 1}`}.`,
        client_follow_up_state: "awaiting_reply",
      }
      const leadPersistencePayload = { ...leadUpdate }
      const unsupportedFields = []
      let leadUpdateResult

      while (true) {
        leadUpdateResult = await supabase
          .from("leads")
          .update(leadPersistencePayload)
          .eq("id", lead.id)
          .select()
        if (!leadUpdateResult.error) break

        const missingColumn = parseMissingColumn(leadUpdateResult.error)
        if (!missingColumn || !CRM_FALLBACK_FIELDS.includes(missingColumn)) break
        unsupportedFields.push(missingColumn)
        delete leadPersistencePayload[missingColumn]
      }

      const { data: updatedLeadRows, error: leadUpdateError } = leadUpdateResult

      if (leadUpdateError) {
        alert(`Estimate marked as sent, but the lead could not be moved to Quoted: ${leadUpdateError.message}`)
        return false
      }

      if (unsupportedFields.length > 0) {
        persistFallbackFields(lead.id, { ...lead, ...leadUpdate })
      }

      const updatedLead = updatedLeadRows?.[0] || { ...lead, ...leadUpdate }
      const mergedUpdatedLead = { ...updatedLead, ...leadUpdate }
      setLeads((current) => current.map((item) => (item.id === lead.id ? normalizeLead(mergedUpdatedLead) : item)))
      await logLeadActivity({
        lead_id: lead.id,
        type: "status",
        user_name: "System",
        description: `Lead moved automatically from ${formatStatusLabel(currentLeadStatus)} to Quoted when estimate V${estimate.version_no || 1} was marked as sent.`,
        timestamp: now,
      })
    }

    await logLeadActivity({
      lead_id: lead.id,
      type: "estimate_status",
      user_name: user?.email || "Smart Steel CRM",
      description: `Estimate V${estimate.version_no || 1} confirmed as ${status}.`,
      timestamp: now,
    })
    return updatedEstimate
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
      product_type_display: estimateDraft.product_type_display || estimateDraft.product_type || "",
      title: `${estimateBaseTitle} V${initialVersion}`,
      source_submission_id: estimateDraft.source_submission_id || null,
      design_reference: estimateDraft.design_reference || null,
      input_data: estimateDraft.input_data,
      original_line_items: estimateDraft.original_line_items || [],
      line_items: estimateDraft.line_items,
      subtotal: estimateDraft.subtotal,
      markup_multiplier: estimateDraft.markup_multiplier,
      total: estimateDraft.total,
      notes: estimateDraft.notes || "",
      status: "prepared",
      prepared_at: new Date().toISOString(),
      sent_at: null,
      created_by: user?.id || null,
      share_token: shareToken,
      shared_at: new Date().toISOString(),
    }

    const buildLocalEstimate = () =>
      isEstimateUpdate
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

    let savedEstimate = null
    let estimateInsertPayload = { ...estimatePayload }
    let insertResult = null

    try {
      insertResult = isEstimateUpdate
        ? await supabase
            .from("estimates")
            .update(estimateInsertPayload)
            .eq("id", estimateDraft.id)
            .select()
        : await supabase.from("estimates").insert([estimateInsertPayload]).select()

      while (insertResult.error) {
        const message = insertResult.error.message || ""
        const missingColumn = parseMissingColumn(insertResult.error)

        if (/estimates_status_check|violates check constraint/i.test(message) && estimateInsertPayload.status === "prepared") {
          estimateInsertPayload.status = "draft"
          delete estimateInsertPayload.prepared_at
          delete estimateInsertPayload.sent_at
          insertResult = isEstimateUpdate
            ? await supabase.from("estimates").update(estimateInsertPayload).eq("id", estimateDraft.id).select()
            : await supabase.from("estimates").insert([estimateInsertPayload]).select()
          continue
        }

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
          savedEstimate = buildLocalEstimate()
          setStoredEstimatesForLead(
            leadId,
            isEstimateUpdate
              ? existingForLead.map((estimate) => (estimate.id === savedEstimate.id ? savedEstimate : estimate))
              : [savedEstimate, ...existingForLead]
          )
          break
        }

        if (!missingColumn || !["share_token", "shared_at", "prepared_at", "sent_at", "accepted_at", "accepted_by_name", "accepted_by_email", "pdf_url", "product_type_display", "original_line_items", "source_submission_id", "design_reference"].includes(missingColumn)) {
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
    } catch (error) {
      if (!isNetworkLoadError(error)) {
        throw error
      }

      savedEstimate = buildLocalEstimate()
      setStoredEstimatesForLead(
        leadId,
        isEstimateUpdate
          ? existingForLead.map((estimate) => (estimate.id === savedEstimate.id ? savedEstimate : estimate))
          : [savedEstimate, ...existingForLead]
      )
      alert("Live save connection dropped. The estimate was saved locally and can be retried once Supabase is stable.")
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
      quote_value: estimateDraft.total,
      product_type: estimateDraft.product_type || currentLead?.product_type,
      next_action: `Review and send Estimate V${estimatePayload.version_no} to the client.`,
      estimate_request: estimateDraft.estimate_request,
    })

    const updatePayload = {
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
        retryResult = await supabase.from("leads").update(buildLeadPersistencePayload(fallbackPayload)).eq("id", leadId)
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
        description: `Estimate V${estimatePayload.version_no} ${isEstimateUpdate ? "updated" : "prepared"}. It has not been marked as sent.`,
        timestamp: new Date().toISOString(),
      },
    ])

    await sendCrmNotification({
      eventType: "lead_updated",
      lead: updatedLead,
      previousLead: currentLead,
      actor: user?.email || "Smart Steel CRM",
      changedFields: ["quote_value", "next_action"],
      summary: isEstimateUpdate
        ? `Estimate V${estimatePayload.version_no} updated and lead quote data refreshed.`
        : `Estimate V${estimatePayload.version_no} prepared and ready for review before sending.`,
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
      const leadLine = getOpportunitySummary(lead).line.toLowerCase()
      const matchesProductLine =
        productLineFilter === "all" || leadLine === productLineFilter
      const matchesQuickView = matchesOpportunityQuickView(lead, opportunityQuickView)
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

      return (
        matchesSearch &&
        matchesStatus &&
        matchesAssignee &&
        matchesProductLine &&
        matchesQuickView &&
        matchesOwnership &&
        matchesMetric
      )
    })
  }, [assigneeFilter, currentTeamMember, leads, metricFilter, opportunityQuickView, ownershipView, productLineFilter, searchTerm, statusFilter])

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

    return {
      total: quotedLeads.length,
      missingValue,
      missingFollowUp,
      stale,
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
    const teamQueueLeads = activeLeads.filter(
      (lead) => !isCoveredByAutomatedFollowUp(lead, followUpSequencesByLead)
    )
    const overdueFollowUps = teamQueueLeads
      .filter((lead) => isBeforeToday(lead.follow_up_at))
      .sort((a, b) => new Date(a.follow_up_at).getTime() - new Date(b.follow_up_at).getTime())
      .slice(0, 6)
    const dueToday = teamQueueLeads
      .filter((lead) => isSameDay(lead.follow_up_at))
      .sort((a, b) => String(a.allocated_to || "").localeCompare(String(b.allocated_to || "")))
      .slice(0, 6)
    const needsDecision = teamQueueLeads
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
  }, [currentTeamMember, dailyTasks, followUpSequencesByLead, leads, ownershipView])

  const teamCommandQueue = useMemo(() => {
    const ownerMatches = (item) =>
      teamQueueOwner === "all" || item.allocated_to === teamQueueOwner || item.assignee === teamQueueOwner
    const activeLeads = leads.filter(
      (lead) => !["won", "lost"].includes(normalizeStatus(lead.status)) && ownerMatches(lead)
    )
    const teamQueueLeads = activeLeads.filter(
      (lead) => !isCoveredByAutomatedFollowUp(lead, followUpSequencesByLead)
    )

    const urgentLeads = teamQueueLeads
      .filter((lead) => isBeforeToday(lead.follow_up_at) || isSameDay(lead.follow_up_at))
      .map((lead) => ({
        type: "lead",
        record: lead,
        score:
          getQueueTiming(lead).score +
          (normalizeStatus(lead.status) === "quoted" ? 20 : 0),
      }))

    const dueTasks = dailyTasks
      .filter(ownerMatches)
      .filter((task) => !task.due_date || task.due_date <= new Date().toISOString().split("T")[0])
      .map((task) => ({
        type: "task",
        record: task,
        score:
          70 +
          (task.priority === "High" ? 20 : task.priority === "Medium" ? 10 : 0) +
          (task.due_date && task.due_date < new Date().toISOString().split("T")[0] ? 20 : 0),
      }))

    const urgentLeadIds = new Set(urgentLeads.map((item) => item.record.id))
    const needsDirection = teamQueueLeads
      .filter((lead) => !urgentLeadIds.has(lead.id))
      .filter((lead) => {
        const staleDays = getDaysSince(getLeadFreshnessDate(lead))
        return !lead.next_action?.trim() || !lead.allocated_to?.trim() || staleDays > 5
      })
      .sort((a, b) => getDaysSince(getLeadFreshnessDate(b)) - getDaysSince(getLeadFreshnessDate(a)))

    const inSevenDays = addDays(startOfDay(new Date()), 7).getTime()
    const upcomingLeads = teamQueueLeads
      .filter((lead) => {
        if (!lead.follow_up_at || urgentLeadIds.has(lead.id)) return false
        const due = startOfDay(lead.follow_up_at).getTime()
        return due > startOfDay(new Date()).getTime() && due <= inSevenDays
      })
      .sort((a, b) => new Date(a.follow_up_at) - new Date(b.follow_up_at))

    return {
      now: [...urgentLeads, ...dueTasks].sort((a, b) => b.score - a.score),
      needsDirection,
      upcomingLeads,
    }
  }, [dailyTasks, followUpSequencesByLead, leads, teamQueueOwner])

  const topOwnerRow = useMemo(() => {
    return [...accountabilityRows].sort((a, b) => b.owned - a.owned)[0] || null
  }, [accountabilityRows])

  const workflowShortcutActions = useMemo(
    () => [
      {
        key: "open-work",
        label: "Open work",
        helper: `${todaysWork.total} items ready now`,
        onClick: () => {
          setCrmView("my_work")
          setMetricFilter("all")
          setOpportunityQuickView("all")
        },
      },
      {
        key: "follow-up",
        label: "Follow up",
        helper: `${todaysWork.overdueFollowUps.length + todaysWork.dueToday.length} general follow-ups due`,
        onClick: () => {
          setCrmView("my_work")
          setMetricFilter("follow_up_today")
          setOpportunityQuickView("all")
        },
      },
      {
        key: "quote",
        label: "Quote",
        helper: `${quoteWorkspaceSummary.total} quoted opportunities`,
        onClick: () => {
          setCrmView("quotes")
          setMetricFilter("quoted")
          setOpportunityQuickView("all")
        },
      },
      {
        key: "stalled",
        label: "Review stalled",
        helper: `${atRiskLeads.length} need attention`,
        onClick: () => {
          setCrmView("pipeline")
          setMetricFilter("all")
          setStatusFilter("all")
          setAssigneeFilter("all")
          setProductLineFilter("all")
          setSearchTerm("")
          setOpportunityQuickView("stalled")
        },
      },
      {
        key: "pipeline",
        label: "Move pipeline",
        helper: `${filteredLeads.length} opportunities in view`,
        onClick: () => {
          setCrmView("pipeline")
          setMetricFilter("all")
        },
      },
    ],
    [
      atRiskLeads.length,
      filteredLeads.length,
      quoteWorkspaceSummary.total,
      todaysWork.dueToday.length,
      todaysWork.overdueFollowUps.length,
      todaysWork.total,
    ]
  )

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
      <div className={`mx-auto max-w-7xl space-y-5 overflow-x-hidden sm:space-y-6 ${isOsCrmRoute ? "mt-0" : "mt-12 sm:mt-16"}`}>
        {crmLoadWarning ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm">
            {crmLoadWarning}
          </div>
        ) : null}
        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">CRM</p>
              <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">Sales pipeline</h1>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setShowMobileAdminPanel((current) => !current)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Tools
              </button>
              <button
                type="button"
                onClick={() => setIsAddingLead(true)}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                + New Lead
              </button>
            </div>
          </div>

          {showMobileAdminPanel ? (
            <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-200 pt-3">
              <button type="button" onClick={() => setShowPricesDrawer(true)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                Prices & Templates
              </button>
              {GENERAL_GOOGLE_SHEET_URL ? (
                <button type="button" onClick={() => window.open(GENERAL_GOOGLE_SHEET_URL, "_blank", "noopener,noreferrer")} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                  <Link2 size={16} /> General Sheet
                </button>
              ) : null}
              <button type="button" onClick={handleLogout} className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                Sign out
              </button>
            </div>
          ) : null}

          <div className="mt-4 flex gap-2 overflow-x-auto border-t border-slate-200 pt-4">
            {CRM_VIEW_OPTIONS.map((view) => (
              <button
                key={view.key}
                type="button"
                onClick={() => setCrmView(view.key)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  crmView === view.key ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {view.label}
              </button>
            ))}
          </div>

          {crmView === "pipeline" ? (
            <>
              <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-end">
                <div className="flex-1">
                  <label className="sr-only" htmlFor="crm-pipeline-search">Search opportunities</label>
                  <input
                    id="crm-pipeline-search"
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search opportunities"
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-base shadow-sm outline-none transition focus:border-slate-500 sm:text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 lg:w-[380px]">
                  <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm shadow-sm outline-none focus:border-slate-500" aria-label="Pipeline stage">
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>{status === "all" ? "All stages" : formatStatusLabel(status)}</option>
                    ))}
                  </select>
                  <select value={productLineFilter} onChange={(event) => setProductLineFilter(event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm shadow-sm outline-none focus:border-slate-500" aria-label="Product line">
                    {PRODUCT_LINE_FILTER_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option === "all" ? "All lines" : option.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <p>Showing <span className="font-semibold text-slate-900">{filteredLeads.length}</span> of {leads.length} opportunities</p>
                {(searchTerm || statusFilter !== "all" || productLineFilter !== "all" || opportunityQuickView !== "all" || metricFilter !== "all") ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm("")
                      setStatusFilter("all")
                      setAssigneeFilter("all")
                      setProductLineFilter("all")
                      setOpportunityQuickView("all")
                      setMetricFilter("all")
                      setOwnershipView("all")
                    }}
                    className="font-semibold text-slate-700 underline underline-offset-4"
                  >
                    Clear filters
                  </button>
                ) : null}
              </div>
            </>
          ) : null}
        </section>

        {!isOsCrmRoute ? (
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 shadow-sm">
          <div className="bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.24),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(34,197,94,0.2),_transparent_28%),linear-gradient(135deg,_#0f172a,_#111827_58%,_#1e293b)] p-4 text-white sm:p-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-200">
                  Dashboard
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                  Smart Steel OS command view
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  Start here for today&apos;s workload, quoted momentum, line-level visibility, and the next place the team should focus.
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setCrmView("my_work")}
                  className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-left backdrop-blur transition hover:bg-white/15"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">Today</p>
                  <p className="mt-1 text-lg font-bold text-white">{todaysWork.total} open items</p>
                </button>
                <button
                  type="button"
                  onClick={() => setCrmView("quotes")}
                  className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-left backdrop-blur transition hover:bg-white/15"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">Quotes</p>
                  <p className="mt-1 text-lg font-bold text-white">
                    {quoteWorkspaceSummary.missingFollowUp + quoteWorkspaceSummary.stale} need action
                  </p>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white p-3 sm:p-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Working modules
                  </p>
                  <h3 className="mt-1 text-base font-semibold text-slate-900">
                    Move straight into the right workspace
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {CRM_VIEW_OPTIONS.find((view) => view.key === crmView)?.helper}
                  </p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                  {CRM_VIEW_OPTIONS.find((view) => view.key === crmView)?.label}
                </span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Busiest owner
                  </p>
                  <p className="mt-1 text-lg font-bold text-slate-900">
                    {topOwnerRow ? topOwnerRow.member : "No owner"}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {topOwnerRow ? `${topOwnerRow.owned} live leads in queue.` : "No assigned leads yet."}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Team risk
                  </p>
                  <p className="mt-1 text-lg font-bold text-slate-900">
                    {atRiskLeads.length}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Leads currently overdue, stale, or missing a next step.
                  </p>
                </div>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                {workflowShortcutActions.map((action) => (
                  <button
                    key={action.key}
                    type="button"
                    onClick={action.onClick}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{action.label}</p>
                      <p className="mt-1 text-xs text-slate-600">{action.helper}</p>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">Open</span>
                  </button>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {CRM_VIEW_OPTIONS.map((view) => (
                  <button
                    key={view.key}
                    type="button"
                    onClick={() => setCrmView(view.key)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      crmView === view.key
                        ? "bg-slate-900 text-white"
                        : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {view.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
        ) : null}

        {crmView === "insights" && (
          <>
            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Insights
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-slate-900">
                    Commercial health at a glance
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Use this view to spot pipeline quality, risk, and where follow-through is slipping.
                  </p>
                </div>
                <p className="text-sm text-slate-500">
                  All CRM records
                </p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-6">
              {metrics.map((metric) => (
                <button
                  key={metric.label}
                  type="button"
                  onClick={() => handleMetricShortcut(metric.key)}
                  className={`rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md sm:p-4 ${
                    metric.tone
                  } ${metricFilter === metric.key ? "ring-2 ring-slate-900/15" : ""}`}
                >
                  <p className="text-xs text-slate-600 sm:text-sm">{metric.label}</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">{metric.value}</p>
                </button>
              ))}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Quoted value
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-slate-900">
                    Value currently sitting in quoted work
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
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3.5">
                  <p className="text-sm font-semibold text-slate-900">Total quoted value</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {formatZar(quotedValueSummary.totalQuotedValue)}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Across {quotedValueSummary.leadCount} quoted lead{quotedValueSummary.leadCount === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
                  <p className="text-sm font-semibold text-slate-900">Average quoted lead</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {formatZar(quotedValueSummary.averageQuotedValue)}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Useful as a quick quality check on current pipeline value
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
                  <p className="text-sm font-semibold text-slate-900">Quoted leads with value</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">
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
                  Priority watch
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
          <div className="space-y-5">
            <section className="overflow-hidden rounded-3xl bg-slate-950 text-white shadow-xl shadow-slate-300/30">
              <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-end">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-sky-300">Team command centre</p>
                  <h2 className="mt-2 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
                    Finish the right work first.
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
                    Client commitments and operational tasks ranked by urgency for the whole team.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/10">
                  <div className="bg-white/5 px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Now</p>
                    <p className="mt-1 text-2xl font-bold">{teamCommandQueue.now.length}</p>
                  </div>
                  <div className="bg-white/5 px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Decide</p>
                    <p className="mt-1 text-2xl font-bold">{teamCommandQueue.needsDirection.length}</p>
                  </div>
                  <div className="bg-white/5 px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Next</p>
                    <p className="mt-1 text-2xl font-bold">{teamCommandQueue.upcomingLeads.length}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 overflow-x-auto border-t border-white/10 px-5 py-3 sm:px-7">
                {["all", ...TEAM_MEMBERS].map((owner) => (
                  <button
                    key={owner}
                    type="button"
                    onClick={() => setTeamQueueOwner(owner)}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition ${
                      teamQueueOwner === owner
                        ? "bg-white text-slate-950"
                        : "bg-white/10 text-slate-300 hover:bg-white/15"
                    }`}
                  >
                    {owner === "all" ? "Whole team" : owner}
                  </button>
                ))}
              </div>
            </section>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
              <section className="rounded-3xl border border-slate-200 bg-slate-100/70 p-3 sm:p-4">
                <div className="mb-3 flex items-end justify-between gap-3 px-1">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-600">Now</p>
                    <h3 className="mt-1 text-xl font-bold text-slate-950">Ranked action queue</h3>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600 shadow-sm">
                    {teamCommandQueue.now.length} remaining
                  </span>
                </div>
                <div className="space-y-3">
                  {teamCommandQueue.now.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-emerald-300 bg-emerald-50 p-8 text-center">
                      <p className="font-bold text-emerald-800">The immediate queue is clear.</p>
                      <p className="mt-1 text-sm text-emerald-700">No overdue work or commitments due today.</p>
                    </div>
                  ) : (
                    teamCommandQueue.now.map((item) =>
                      item.type === "lead" ? (
                        <QueueLeadRow
                          key={`lead-${item.record.id}`}
                          lead={item.record}
                          onOpen={() => setEditingLead(item.record)}
                          onSnooze={() => handleSnoozeLeadToTomorrow(item.record)}
                        />
                      ) : (
                        <QueueTaskRow
                          key={`task-${item.record.id}`}
                          task={item.record}
                          onComplete={() => handleCompleteDailyTask(item.record.id)}
                        />
                      )
                    )
                  )}
                </div>
              </section>

              <div className="space-y-5">
                <section className="rounded-3xl border border-amber-200 bg-amber-50/60 p-4 sm:p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">Needs direction</p>
                  <h3 className="mt-1 text-lg font-bold text-slate-950">Decide the next move</h3>
                  <div className="mt-4 space-y-3">
                    {teamCommandQueue.needsDirection.length === 0 ? (
                      <p className="rounded-xl bg-white/70 p-4 text-sm text-slate-500">No unclear or stale leads.</p>
                    ) : (
                      teamCommandQueue.needsDirection.slice(0, 5).map((lead) => (
                        <QueueLeadRow
                          key={lead.id}
                          lead={lead}
                          compact
                          onOpen={() => setEditingLead(lead)}
                          onSnooze={() => handleSnoozeLeadToTomorrow(lead)}
                        />
                      ))
                    )}
                  </div>
                </section>

                <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-700">Next</p>
                      <h3 className="mt-1 text-lg font-bold text-slate-950">Coming up this week</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowTeamPlanner((current) => !current)}
                      className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                    >
                      {showTeamPlanner ? "Hide planner" : "Open planner"}
                    </button>
                  </div>
                  <div className="mt-4 space-y-2">
                    {teamCommandQueue.upcomingLeads.length === 0 ? (
                      <p className="text-sm text-slate-500">No follow-ups scheduled in the next seven days.</p>
                    ) : (
                      teamCommandQueue.upcomingLeads.slice(0, 5).map((lead) => (
                        <button
                          key={lead.id}
                          type="button"
                          onClick={() => setEditingLead(lead)}
                          className="flex w-full items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-3 text-left transition hover:bg-slate-100"
                        >
                          <span>
                            <span className="block text-sm font-bold text-slate-900">{lead.name} {lead.last_name}</span>
                            <span className="mt-0.5 block text-xs text-slate-500">{lead.allocated_to || "Unassigned"}</span>
                          </span>
                          <span className="shrink-0 text-xs font-bold text-slate-600">{getQueueTiming(lead).label}</span>
                        </button>
                      ))
                    )}
                  </div>
                </section>
              </div>
            </div>

            {showTeamPlanner ? (
              <section className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm sm:p-5">
                <UpcomingTasks onTasksChanged={setDailyTasks} />
              </section>
            ) : null}
          </div>
        )}

        {crmView === "quotes" && (
          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Quotes
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-slate-900">
                    Stay on top of the money already in motion
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    This is the quoted-work lane: keep quote follow-ups tight, spot missing value quickly, and protect active momentum.
                  </p>
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

              <div className="mt-4 grid gap-3 md:grid-cols-3">
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
                  <p className="text-sm font-semibold text-slate-900">Need quote follow-up</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{quoteWorkspaceSummary.missingFollowUp}</p>
                  <p className="mt-1 text-sm text-slate-600">Quoted leads without a next follow-up date</p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Quoted opportunities</h2>
                  <p className="text-sm text-slate-600">
                    Work quote follow-ups here, adjust estimates fast, and keep quoted momentum moving.
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
        {loading ? (
          <div ref={boardSectionRef} className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
            Loading opportunities...
          </div>
        ) : (
        <div ref={boardSectionRef} className="scroll-mt-20">
          <KanbanBoard
            leads={filteredLeads}
            onEditLead={setEditingLead}
            onLeadStatusChange={handleLeadStatusChange}
            onCreateEstimate={handleOpenEstimate}
          />
        </div>
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
          onCreateProject={handleCreateProjectFromLead}
          onEstimateStatusChange={handleEstimateStatusChange}
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
