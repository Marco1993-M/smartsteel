"use client"

import { useState } from "react"
import { DndContext, closestCorners, useDraggable, useDroppable } from "@dnd-kit/core"
import { Edit3, FileText, GripVertical } from "lucide-react"
import { formatCrmStatusLabel, getLeadNextBestAction } from "../lib/crmSop"
import { getOpportunitySummary } from "../lib/crmReferenceData"

const statuses = ["new", "contacted", "quoted", "won", "lost"]
const teamColors = {
  Stefan: "bg-red-100",
  Niel: "bg-blue-100",
  Victor: "bg-green-100",
  Marco: "bg-yellow-100",
}

const statusBadgeColors = {
  new: "bg-slate-100 text-slate-600",
  contacted: "bg-blue-100 text-blue-700",
  quoted: "bg-amber-100 text-amber-700",
  won: "bg-emerald-100 text-emerald-700",
  lost: "bg-rose-100 text-rose-700",
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

  const getAllStageLeads = (status) =>
    leads.filter((lead) => normalizeStatus(lead.status) === status)

  const olderQuotedLeads = getAllStageLeads("quoted").filter(isOlderQuotedLead)
  const getStageLeads = (status) => {
    const stageLeads = getAllStageLeads(status)
    if (status !== "quoted" || showOlderQuoted) return stageLeads
    return stageLeads.filter((lead) => !isOlderQuotedLead(lead))
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
            />
          ))
        )}
      </div>
    </div>
  )
}

function KanbanCard({ lead, onEditLead, onCreateEstimate, draggable = true }) {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      id={String(lead.id)}
      className={`rounded-2xl border border-slate-100 p-3 transition hover:bg-white hover:shadow-md ${
        teamColors[lead.allocated_to] || "bg-white"
      }`}
    >
      <div className="mb-2 flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900 sm:text-base">
            {lead.name} {lead.last_name}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-700">
              {opportunitySummary.line}
            </span>
            <span className="rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              {opportunitySummary.family}
            </span>
            <p className="truncate text-xs text-slate-500">
              {lead.product_type || "No product"} · {lead.allocated_to || "Unassigned"}
            </p>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold ${
            statusBadgeColors[normalizedStatus] || "bg-slate-100 text-slate-600"
          }`}
        >
          {formatStatusLabel(lead.status)}
        </span>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-slate-200 bg-white/85 p-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Quote value
          </p>
          <p className="mt-1 text-sm font-bold text-slate-900">
            {isQuoted
              ? hasQuoteValue
                ? formatZar(lead.quote_value)
                : "Missing"
              : "Not quoted"}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white/85 p-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Follow-up
          </p>
          <p className="mt-1 text-sm font-bold text-slate-900">
            {clientFollowUpStateLabel || followUpLabel}
          </p>
        </div>
      </div>

      <button type="button" onClick={() => onEditLead(lead)} className="mt-2 w-full rounded-xl bg-slate-900 px-3 py-2 text-left text-white transition hover:bg-slate-800">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
          Next move
        </p>
        <p className="mt-1 line-clamp-2 text-xs font-medium leading-5 text-white">
          {lead.next_action || nextBestAction.shortLabel}
        </p>
      </button>

      <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] font-semibold">
        <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">
          Added: {createdAtLabel}
        </span>
        {draggable ? (
          <div
            className="ml-auto inline-flex cursor-grab items-center justify-center rounded-full bg-slate-100 px-2 py-1 text-slate-500 transition hover:text-slate-700"
            {...listeners}
            {...attributes}
          >
            <GripVertical size={12} />
          </div>
        ) : null}
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => onEditLead(lead)}
          className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          <Edit3 size={12} /> Open
        </button>
        <button
          type="button"
          onClick={() => onCreateEstimate?.(lead)}
          className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl bg-rose-100 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-200"
        >
          <FileText size={12} /> Estimate
        </button>
      </div>
    </div>
  )
}
