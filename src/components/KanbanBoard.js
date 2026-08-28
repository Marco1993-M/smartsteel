"use client"

import { useEffect, useMemo, useState } from "react"
import { DndContext, closestCorners, useDraggable, useDroppable } from "@dnd-kit/core"
import { ArrowRight, FileText, GripVertical } from "lucide-react"
import { formatCrmStatusLabel, getLeadNextBestAction } from "../lib/crmSop"
import { getOpportunitySummary } from "../lib/crmReferenceData"
import { getOsAuthHeaders } from "../lib/osClientAuth"

const statuses = ["new", "contacted", "quoted", "won", "lost"]
const teamDotColors = {
  Stefan: "bg-red-500",
  Niel: "bg-blue-500",
  Victor: "bg-emerald-500",
  Marco: "bg-amber-400",
}

const sequenceFilters = [
  { key: "all", label: "All leads" },
  { key: "active", label: "Follow-up active" },
  { key: "attention", label: "Needs attention" },
  { key: "responded", label: "Client responded" },
  { key: "completed", label: "Sequence complete" },
]

function getFollowUpTiming(lead) {
  if (!lead?.follow_up_at) return "none"
  const followUp = new Date(lead.follow_up_at)
  if (!Number.isFinite(followUp.getTime())) return "none"
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dueDay = new Date(followUp)
  dueDay.setHours(0, 0, 0, 0)
  if (dueDay < today) return "overdue"
  if (dueDay.getTime() === today.getTime()) return "today"
  return "future"
}

function matchesSequenceFilter(lead, sequence, filter) {
  if (filter === "all") return true
  if (filter === "attention") {
    return Boolean(sequence?.last_response_key) || sequence?.status === "failed" || Boolean(sequence?.last_error) || ["overdue", "today"].includes(getFollowUpTiming(lead)) || !lead?.next_action?.trim()
  }
  if (!sequence) return false
  if (filter === "active") return sequence.status === "active" && !sequence.last_response_key
  if (filter === "responded") return Boolean(sequence.last_response_key)
  if (filter === "completed") return sequence.status === "completed"
  return true
}

function getCardAttention(lead, sequence) {
  if (sequence?.last_response_key) return { label: "Client response", rail: "bg-emerald-500", score: 600 }
  if (sequence?.status === "failed" || sequence?.last_error) return { label: "Follow-up error", rail: "bg-rose-600", score: 550 }
  const timing = getFollowUpTiming(lead)
  if (timing === "overdue") return { label: "Overdue", rail: "bg-rose-500", score: 500 }
  if (timing === "today") return { label: "Due today", rail: "bg-amber-400", score: 450 }
  if (!lead?.next_action?.trim()) return { label: "Needs direction", rail: "bg-amber-400", score: 400 }
  if (sequence?.status === "active") return { label: "Sequence active", rail: "bg-blue-500", score: 250 }
  return { label: "On track", rail: "bg-slate-200", score: 0 }
}

function getContextualAction(lead, sequence) {
  if (sequence?.last_response_key) return { label: "Review response", type: "open" }
  if (sequence?.status === "failed" || sequence?.last_error) return { label: "Resolve follow-up", type: "open" }
  switch (normalizeStatus(lead.status)) {
    case "new":
      return { label: "Acknowledge lead", type: "open" }
    case "contacted":
      return { label: "Prepare estimate", type: "estimate" }
    case "quoted":
      return { label: "Review follow-up", type: "open" }
    case "won":
      return { label: "Open project handoff", type: "open" }
    default:
      return { label: "Review record", type: "open" }
  }
}

function shouldShowCreatedAt(lead) {
  if (normalizeStatus(lead.status) === "new") return true
  const activity = new Date(lead.last_activity_at || lead.updated_at || lead.created_at || 0)
  if (!Number.isFinite(activity.getTime())) return false
  return Date.now() - activity.getTime() > 14 * 86400000
}

function getSequencePresentation(sequence) {
  if (!sequence) return null
  if (sequence.last_response_key) {
    return { label: sequence.last_response_label || "Client responded", tone: "emerald", step: Number(sequence.current_step || 0) }
  }
  if (sequence.status === "failed" || sequence.last_error) {
    return { label: "Follow-up needs attention", tone: "rose", step: Number(sequence.current_step || 0) }
  }
  if (sequence.status === "completed") return { label: "Follow-up sequence complete", tone: "slate", step: 3 }
  if (sequence.status === "cancelled") return { label: "Follow-ups stopped", tone: "slate", step: Number(sequence.current_step || 0) }
  const nextDate = sequence.next_send_at
    ? new Date(sequence.next_send_at).toLocaleDateString("en-ZA", { day: "numeric", month: "short" })
    : "scheduled"
  return { label: `Next email ${nextDate}`, tone: "blue", step: Number(sequence.current_step || 0) }
}

function normalizeStatus(status) {
  return String(status || "new").trim().toLowerCase()
}

function formatStatusLabel(status) {
  return formatCrmStatusLabel(status)
}

function formatFollowUpLabel(followUpAt) {
  if (!followUpAt) return "No follow-up"
  return new Date(followUpAt).toLocaleDateString()
}

function formatCreatedAtLabel(createdAt) {
  if (!createdAt) return "Added recently"
  return new Date(createdAt).toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatZar(value) {
  const parsed = Number(String(value || 0).replace(/[^0-9.-]/g, ""))
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(parsed) ? parsed : 0)
}

function getClientFollowUpStateLabel(state) {
  switch (String(state || "").trim()) {
    case "awaiting_reply":
      return "Awaiting reply"
    case "client_will_revert":
      return "Client will be in touch"
    default:
      return ""
  }
}

function isOlderQuotedLead(lead) {
  if (normalizeStatus(lead.status) !== "quoted") return false

  const followUpDate = lead.follow_up_at ? new Date(lead.follow_up_at) : null
  const endOfToday = new Date()
  endOfToday.setHours(23, 59, 59, 999)

  // A future follow-up is still active work and must remain in view.
  if (followUpDate && Number.isFinite(followUpDate.getTime()) && followUpDate > endOfToday) return false

  const activityDate = new Date(lead.last_activity_at || lead.updated_at || lead.created_at || 0)
  if (!Number.isFinite(activityDate.getTime())) return false

  const latestWorkingDate =
    followUpDate && Number.isFinite(followUpDate.getTime()) && followUpDate > activityDate
      ? followUpDate
      : activityDate

  const shelfDate = new Date(endOfToday)
  shelfDate.setDate(shelfDate.getDate() - 30)
  return latestWorkingDate < shelfDate
}

export default function KanbanBoard({
  leads,
  onEditLead,
  onLeadStatusChange,
  onCreateEstimate,
}) {
  const [mobileStage, setMobileStage] = useState(statuses[0])
  const [showOlderQuoted, setShowOlderQuoted] = useState(false)
  const [sequenceFilter, setSequenceFilter] = useState("all")
  const [sequencesByLead, setSequencesByLead] = useState({})

  useEffect(() => {
    let cancelled = false

    async function loadSequences() {
      try {
        await fetch("/api/crm/estimate-follow-ups", {
          method: "POST",
          headers: await getOsAuthHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify({ action: "process_due" }),
        })
        const response = await fetch("/api/crm/estimate-follow-ups", {
          cache: "no-store",
          headers: await getOsAuthHeaders(),
        })
        const payload = await response.json().catch(() => ({}))
        if (!response.ok || cancelled) return
        setSequencesByLead(Object.fromEntries((payload.sequences || []).map((sequence) => [String(sequence.lead_id), sequence])))
      } catch {
        // The pipeline remains fully usable if follow-up summaries are temporarily unavailable.
      }
    }

    loadSequences()
    const interval = window.setInterval(loadSequences, 5 * 60000)
    const refreshOnFocus = () => loadSequences()
    window.addEventListener("focus", refreshOnFocus)
    return () => {
      cancelled = true
      window.clearInterval(interval)
      window.removeEventListener("focus", refreshOnFocus)
    }
  }, [])

  const visibleLeads = useMemo(
    () => leads.filter((lead) => matchesSequenceFilter(lead, sequencesByLead[String(lead.id)], sequenceFilter)),
    [leads, sequenceFilter, sequencesByLead]
  )

  const getAllStageLeads = (status) =>
    visibleLeads.filter((lead) => normalizeStatus(lead.status) === status)

  const olderQuotedLeads = getAllStageLeads("quoted").filter(isOlderQuotedLead)
  const getStageLeads = (status) => {
    const stageLeads = getAllStageLeads(status)
    const activeStageLeads = status !== "quoted" || showOlderQuoted
      ? stageLeads
      : stageLeads.filter((lead) => !isOlderQuotedLead(lead))
    return activeStageLeads.sort((left, right) => {
      if (status === "new") {
        return new Date(right.created_at || 0).getTime() - new Date(left.created_at || 0).getTime()
      }
      const scoreDifference = getCardAttention(right, sequencesByLead[String(right.id)]).score - getCardAttention(left, sequencesByLead[String(left.id)]).score
      if (scoreDifference !== 0) return scoreDifference
      return new Date(right.updated_at || right.created_at || 0).getTime() - new Date(left.updated_at || left.created_at || 0).getTime()
    })
  }

  const mobileStageLeads = getStageLeads(mobileStage)

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-col gap-2 border-b border-slate-200 pb-4">
        <h2 className="text-xl font-semibold text-slate-900">Pipeline view</h2>
        <p className="text-sm text-slate-600">
          Keep the board for awareness and movement. Open a lead to handle the
          detail work in the drawer.
        </p>
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
        {sequenceFilters.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => setSequenceFilter(option.key)}
            className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold transition ${
              sequenceFilter === option.key
                ? "bg-slate-950 text-white"
                : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-2 md:hidden">
        {statuses.map((status) => {
          const count = getAllStageLeads(status).length
          const isActive = mobileStage === status

          return (
            <button
              key={status}
              type="button"
              onClick={() => setMobileStage(status)}
              className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition ${
                isActive
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              {formatStatusLabel(status)}
              <span
                className={`rounded-full px-2 py-0.5 ${
                  isActive ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      <div className="md:hidden">
        <KanbanColumn
          id={mobileStage}
          title={formatStatusLabel(mobileStage)}
          leads={mobileStageLeads}
          onEditLead={onEditLead}
          onCreateEstimate={onCreateEstimate}
          shelvedCount={mobileStage === "quoted" ? olderQuotedLeads.length : 0}
          showShelf={showOlderQuoted}
          onToggleShelf={() => setShowOlderQuoted((current) => !current)}
          draggable={false}
          sequencesByLead={sequencesByLead}
        />
      </div>

      <DndContext
        collisionDetection={closestCorners}
        onDragEnd={({ active, over }) => {
          if (!over) return
          onLeadStatusChange(active.id, over.id)
        }}
      >
        <div className="hidden gap-4 overflow-x-auto scroll-smooth pb-2 md:flex">
          {statuses.map((status) => (
            <div key={status} id={status} className="w-[265px] flex-shrink-0">
              <KanbanColumn
                id={status}
                title={formatStatusLabel(status)}
                leads={getStageLeads(status)}
                onEditLead={onEditLead}
                onCreateEstimate={onCreateEstimate}
                shelvedCount={status === "quoted" ? olderQuotedLeads.length : 0}
                showShelf={showOlderQuoted}
                onToggleShelf={() => setShowOlderQuoted((current) => !current)}
                draggable
                sequencesByLead={sequencesByLead}
              />
            </div>
          ))}
        </div>
      </DndContext>
    </div>
  )
}

function KanbanColumn({
  id,
  title,
  leads,
  onEditLead,
  onCreateEstimate,
  shelvedCount = 0,
  showShelf = false,
  onToggleShelf,
  draggable = true,
  sequencesByLead = {},
}) {
  const { setNodeRef } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className="flex min-h-[320px] flex-col rounded-2xl bg-slate-50 p-3 shadow-sm sm:min-h-[460px]"
    >
      <div className="sticky top-0 z-10 mb-3 flex items-center justify-between rounded-xl bg-slate-50 pb-2">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-700">
          {title}
        </h2>
        <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-slate-500">
          {leads.length}
        </span>
      </div>

      {id === "quoted" && shelvedCount > 0 ? (
        <button
          type="button"
          onClick={onToggleShelf}
          className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-left text-xs font-semibold text-amber-900 transition hover:bg-amber-100"
        >
          <span>{showShelf ? "Hide older quotes" : `Older quoted (${shelvedCount})`}</span>
          <span aria-hidden="true">{showShelf ? "−" : "+"}</span>
        </button>
      ) : null}

      <div className="space-y-2">
        {leads.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 p-4 text-sm text-slate-400">
            No leads in this stage yet.
          </div>
        ) : (
          leads.map((lead) => (
            <KanbanCard
              key={lead.id}
              lead={lead}
              onEditLead={onEditLead}
              onCreateEstimate={onCreateEstimate}
              draggable={draggable}
              sequence={sequencesByLead[String(lead.id)]}
            />
          ))
        )}
      </div>
    </div>
  )
}

function KanbanCard({ lead, onEditLead, onCreateEstimate, draggable = true, sequence = null }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: lead.id })
  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined

  const normalizedStatus = normalizeStatus(lead.status)
  const isQuoted = normalizedStatus === "quoted"
  const clientFollowUpStateLabel = getClientFollowUpStateLabel(lead?.client_follow_up_state)
  const nextBestAction = getLeadNextBestAction(lead)
  const followUpLabel = formatFollowUpLabel(lead.follow_up_at)
  const createdAtLabel = formatCreatedAtLabel(lead.created_at)
  const opportunitySummary = getOpportunitySummary(lead)
  const hasQuoteValue = String(lead.quote_value || "").trim().length > 0
  const sequencePresentation = getSequencePresentation(sequence)
  const attention = getCardAttention(lead, sequence)
  const contextualAction = getContextualAction(lead, sequence)
  const showCreatedAt = shouldShowCreatedAt(lead)

  const handleContextualAction = (event) => {
    event.stopPropagation()
    if (contextualAction.type === "estimate") {
      onCreateEstimate?.(lead)
      return
    }
    onEditLead(lead)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      id={String(lead.id)}
      role="button"
      tabIndex={0}
      onClick={() => onEditLead(lead)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") onEditLead(lead)
      }}
      className="relative cursor-pointer overflow-hidden rounded-[1.15rem] border border-slate-200 bg-white p-3.5 pl-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg"
    >
      <span className={`absolute inset-y-0 left-0 w-1 ${attention.rail}`} aria-hidden="true" />
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-black tracking-[-0.02em] text-slate-950">
            {lead.name} {lead.last_name}
          </p>
          <p className="mt-1 line-clamp-1 text-xs font-medium text-slate-500">{lead.product_type || "Project not selected"}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-600">
          <span className={`h-2 w-2 rounded-full ${teamDotColors[lead.allocated_to] || "bg-slate-300"}`} />
          {lead.allocated_to || "Unassigned"}
        </div>
      </div>

      <div className="mt-2 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
        <span>{opportunitySummary.line}</span>
        <span>·</span>
        <span className="truncate">{opportunitySummary.family}</span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-slate-600">
        {isQuoted && hasQuoteValue ? <span className="font-black text-slate-900">{formatZar(lead.quote_value)}</span> : null}
        {isQuoted && hasQuoteValue ? <span className="text-slate-300">•</span> : null}
        <span>{clientFollowUpStateLabel || followUpLabel}</span>
      </div>

      {sequencePresentation ? (
        <div className={`mt-3 rounded-xl border px-3 py-2.5 ${
          sequencePresentation.tone === "emerald"
            ? "border-emerald-200 bg-emerald-50"
            : sequencePresentation.tone === "rose"
              ? "border-rose-200 bg-rose-50"
              : sequencePresentation.tone === "blue"
                ? "border-blue-200 bg-blue-50"
                : "border-slate-200 bg-slate-50"
        }`}>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[11px] font-bold text-slate-700">{sequencePresentation.label}</p>
              <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">{sequencePresentation.step} of 3 sent</p>
            </div>
            <div className="flex shrink-0 gap-1" aria-label={`${sequencePresentation.step} of 3 follow-ups sent`}>
              {[1, 2, 3].map((step) => (
                <span key={step} className={`h-1.5 w-5 rounded-full ${step <= sequencePresentation.step ? "bg-[#0043f3]" : "bg-slate-200"}`} />
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-3 w-full rounded-xl bg-[#f1f5f9] px-3 py-2.5 text-left">
        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
          Next move
        </p>
        <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-slate-700">
          {lead.next_action || nextBestAction.shortLabel}
        </p>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] font-semibold">
        <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">{attention.label}</span>
        {showCreatedAt ? <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">Added: {createdAtLabel}</span> : null}
        {draggable ? (
          <div
            onClick={(event) => event.stopPropagation()}
            className="ml-auto inline-flex cursor-grab items-center justify-center rounded-full bg-slate-100 px-2 py-1 text-slate-500 transition hover:text-slate-700"
            {...listeners}
            {...attributes}
          >
            <GripVertical size={12} />
          </div>
        ) : null}
      </div>

      <button
        type="button"
        onClick={handleContextualAction}
        className={`mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl px-3 text-xs font-bold transition ${
          contextualAction.type === "estimate"
            ? "bg-[#0043f3] text-white shadow-sm hover:bg-blue-700"
            : "bg-[#001d2e] text-white shadow-sm hover:bg-slate-800"
        }`}
      >
        {contextualAction.type === "estimate" ? <FileText size={13} /> : <ArrowRight size={13} />}
        {contextualAction.label}
      </button>
    </div>
  )
}
