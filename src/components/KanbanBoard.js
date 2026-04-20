"use client"

import { useEffect, useRef, useState } from "react"
import { DndContext, closestCorners, useDraggable, useDroppable } from "@dnd-kit/core"
import { Mail, Phone, Edit3 } from "lucide-react"
import UpcomingTasks from "../components/UpcomingTasks"
import { supabase } from "../lib/supabase"

const statuses = ["new", "contacted", "quoted", "won", "lost"]

const teamColors = {
  Stefan: "bg-red-200",
  Niel: "bg-blue-200",
  Victor: "bg-green-200",
  Marco: "bg-yellow-200",
}

const statusColors = {
  new: "text-gray-500",
  contacted: "text-blue-600",
  quoted: "text-yellow-600",
  won: "text-green-600",
  lost: "text-red-600",
}

function normalizeStatus(status) {
  return String(status || "new").trim().toLowerCase()
}

function formatStatusLabel(status) {
  const normalized = normalizeStatus(status)
  return normalized.charAt(0).toUpperCase() + normalized.slice(1)
}

export default function KanbanBoard({ leads, onEditLead, onLeadStatusChange }) {
  const [recentUpdates, setRecentUpdates] = useState([])
  const [updateFilter, setUpdateFilter] = useState("all")
  const kanbanRef = useRef(null)

  const fetchRecentUpdates = async () => {
    const { data, error } = await supabase
      .from("lead_activities")
      .select(`
        id,
        lead_id,
        type,
        description,
        timestamp,
        leads(id, name, last_name, status)
      `)
      .order("timestamp", { ascending: false })
      .limit(8)

    if (!error) setRecentUpdates(data || [])
  }

  const highlightLead = (leadId) => {
    const el = document.getElementById(String(leadId))
    if (!el) return
    el.scrollIntoView({ behavior: "smooth", block: "center" })
    el.classList.add("ring", "ring-blue-400")
    setTimeout(() => el.classList.remove("ring", "ring-blue-400"), 2000)
  }

  useEffect(() => {
    fetchRecentUpdates()
  }, [])

  useEffect(() => {
    const interval = setInterval(fetchRecentUpdates, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-col gap-2 border-b border-slate-200 pb-4">
        <h2 className="text-xl font-semibold text-slate-900">Pipeline view</h2>
        <p className="text-sm text-slate-600">
          Drag leads across the pipeline, open any card to edit details, and use
          recent updates to jump straight back into active conversations.
        </p>
      </div>

      <div className="flex flex-col gap-6 xl:flex-row">
        <div className="xl:w-[320px] xl:flex-shrink-0">
          <UpcomingTasks leads={leads} />
        </div>

        <div className="min-w-0 flex-1">
          {recentUpdates.length > 0 && (
            <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
              <div className="mb-2 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-slate-800">Recent updates</h3>
                <button
                  className="text-xs font-medium text-slate-500 transition hover:text-slate-700"
                  onClick={() => setRecentUpdates([])}
                >
                  Clear
                </button>
              </div>

              <div className="mb-3 flex flex-wrap gap-2">
                {["all", "follow_up", "email", "call", "status", "note"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setUpdateFilter(type)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                      updateFilter === type
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {type === "all"
                      ? "All"
                      : type.replace("_", " ").replace(/\b\w/g, (char) => char.toUpperCase())}
                  </button>
                ))}
              </div>

              <ul className="max-h-52 space-y-1 overflow-y-auto">
                {recentUpdates
                  .filter((update) => updateFilter === "all" || update.type === updateFilter)
                  .map((update) => (
                    <li
                      key={update.id}
                      className="flex cursor-pointer items-start justify-between gap-3 rounded-xl p-2 transition hover:bg-white"
                      onClick={() => highlightLead(update.lead_id)}
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-slate-800">
                          {update.leads?.name || "Lead"} {update.leads?.last_name || ""}
                        </p>
                        <p className="text-sm text-slate-600">{update.description}</p>
                      </div>
                      <span className="whitespace-nowrap text-xs text-slate-400">
                        {new Date(update.timestamp).toLocaleString([], {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          )}

          <DndContext
            collisionDetection={closestCorners}
            onDragEnd={({ active, over }) => {
              if (!over) return
              onLeadStatusChange(active.id, over.id)
            }}
          >
            <div
              ref={kanbanRef}
              className="flex gap-4 overflow-x-auto scroll-smooth pb-2"
            >
              {statuses.map((status) => (
                <div key={status} id={status} className="w-[260px] flex-shrink-0">
                  <KanbanColumn
                    id={status}
                    title={formatStatusLabel(status)}
                    leads={leads.filter((lead) => normalizeStatus(lead.status) === status)}
                    onEditLead={onEditLead}
                  />
                </div>
              ))}
            </div>
          </DndContext>
        </div>
      </div>
    </div>
  )
}

function KanbanColumn({ id, title, leads, onEditLead }) {
  const { setNodeRef } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className="flex min-h-[460px] flex-col rounded-2xl bg-slate-50 p-3 shadow-sm"
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
            <KanbanCard key={lead.id} lead={lead} onEditLead={onEditLead} />
          ))
        )}
      </div>
    </div>
  )
}

function KanbanCard({ lead, onEditLead }) {
  const [isOpen, setIsOpen] = useState(false)
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: lead.id })
  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      id={String(lead.id)}
      className={`rounded-2xl border border-slate-100 p-3 transition hover:bg-white hover:shadow-md ${
        teamColors[lead.allocated_to] || "bg-white"
      }`}
    >
      <div
        className="mb-2 flex cursor-pointer items-start justify-between gap-2"
        onClick={(event) => {
          event.stopPropagation()
          setIsOpen((open) => !open)
        }}
        onDoubleClick={(event) => {
          event.stopPropagation()
          onEditLead(lead)
        }}
      >
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 sm:text-base">
            {lead.name} {lead.last_name}
          </p>
          <p className={`text-xs font-medium ${statusColors[normalizeStatus(lead.status)] || "text-slate-400"}`}>
            {formatStatusLabel(lead.status)}
          </p>
        </div>
        <div
          className="cursor-grab text-slate-400 transition hover:text-slate-600"
          {...listeners}
          {...attributes}
        >
          ⠿
        </div>
      </div>

      <div className="mb-2 flex flex-wrap gap-1 text-xs">
        {lead.email && (
          <a
            href={`mailto:${lead.email}?subject=Quick update&body=Hi ${lead.name},`}
            className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-blue-700 transition hover:bg-blue-200"
          >
            <Mail size={12} /> Email
          </a>
        )}
        {lead.phone && (
          <a
            href={`tel:${lead.phone}`}
            className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-green-700 transition hover:bg-green-200"
          >
            <Phone size={12} /> Call
          </a>
        )}
        <button
          onClick={() => onEditLead(lead)}
          className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-slate-700 transition hover:bg-slate-200"
        >
          <Edit3 size={12} /> Edit
        </button>
      </div>

      {isOpen && (
        <div className="space-y-1 border-t border-slate-200 pt-2 text-xs text-slate-600">
          <p>
            <span className="font-semibold">Product:</span>{" "}
            {lead.product_type || "Not set"}
          </p>
          <p>
            <span className="font-semibold">Source:</span>{" "}
            {lead.lead_source || "Not set"}
          </p>
          <p>
            <span className="font-semibold">Assigned:</span>{" "}
            {lead.allocated_to || "Unassigned"}
          </p>
          <p>
            <span className="font-semibold">Next action:</span>{" "}
            {lead.next_action || "Not set"}
          </p>
          <p>
            <span className="font-semibold">Follow-up:</span>{" "}
            {lead.follow_up_at
              ? new Date(lead.follow_up_at).toLocaleDateString()
              : "Not set"}
          </p>
          <p>
            <span className="font-semibold">Quote value:</span>{" "}
            {lead.quote_value ? `R ${lead.quote_value}` : "Not set"}
          </p>
          {lead.estimate_request && (
            <p>
              <span className="font-semibold">Request:</span> {lead.estimate_request}
            </p>
          )}
          {lead.notes && (
            <p>
              <span className="font-semibold">Notes:</span> {lead.notes}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
