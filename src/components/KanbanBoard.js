"use client"

import { useState } from "react"
import { DndContext, closestCorners, useDraggable, useDroppable } from "@dnd-kit/core"
import { Edit3, FileText, GripVertical } from "lucide-react"
import { formatCrmStatusLabel } from "../lib/crmSop"

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

export default function KanbanBoard({
  leads,
  onEditLead,
  onLeadStatusChange,
  onCreateEstimate,
}) {
  const [mobileStage, setMobileStage] = useState(statuses[0])

  const getStageLeads = (status) =>
    leads.filter((lead) => normalizeStatus(lead.status) === status)

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
          const count = getStageLeads(status).length
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
                draggable
              />
            </div>
          ))}
        </div>
      </DndContext>
    </div>
  )
}

function KanbanColumn({ id, title, leads, onEditLead, onCreateEstimate, draggable = true }) {
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
  const followUpLabel = formatFollowUpLabel(lead.follow_up_at)

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
          <p className="mt-0.5 truncate text-xs text-slate-500">
            {lead.product_type || "No product"} · {lead.allocated_to || "Unassigned"}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold ${
            statusBadgeColors[normalizedStatus] || "bg-slate-100 text-slate-600"
          }`}
        >
          {formatStatusLabel(lead.status)}
        </span>
      </div>

      <button
        type="button"
        onClick={() => onEditLead(lead)}
        className="w-full rounded-xl border border-slate-200 bg-white/85 p-2 text-left transition hover:border-slate-300"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          Next action
        </p>
        <p className="mt-1 line-clamp-2 text-xs font-medium leading-5 text-slate-700">
          {lead.next_action || "Open this lead and capture the next step."}
        </p>
      </button>

      <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] font-semibold">
        <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">
          Follow-up: {followUpLabel}
        </span>
        {isQuoted && (
          <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-700">
            {lead.quote_value ? `R ${lead.quote_value}` : "Quote value missing"}
          </span>
        )}
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
