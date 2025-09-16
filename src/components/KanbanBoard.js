"use client"

import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import { DndContext, closestCorners, useDraggable, useDroppable } from "@dnd-kit/core"
import LeadEditorDrawer from "./LeadEditorDrawer"

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

export default function KanbanBoard() {
  const [leads, setLeads] = useState([])
  const [editingLead, setEditingLead] = useState(null)

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    const { data, error } = await supabase.from("leads").select("*")
    if (!error) setLeads(data)
  }

const updateLeadStatus = async (id, newStatus) => {
  const updates = {
    status: newStatus,
    last_activity_at: new Date().toISOString(),
  };

  if (newStatus === "quoted") {
    updates.follow_up_count = supabase
      .from("leads")
      .select("follow_up_count")
      .eq("id", id)
      .single()
      .then(({ data }) => (data?.follow_up_count || 0) + 1);

    updates.follow_up_at = new Date(
      Date.now() + (updates.follow_up_count === 1 ? 3 : 7) * 24 * 60 * 60 * 1000
    ).toISOString();
  }

  // Lost → ask reason
  if (newStatus === "lost") {
    const reason = prompt("Reason for losing this lead? (e.g., budget, timing, competitor)");
    updates.lost_reason = reason || "unspecified";
  }

  setLeads((prev) =>
    prev.map((lead) => (lead.id === id ? { ...lead, ...updates } : lead))
  );

  await supabase.from("leads").update(updates).eq("id", id);
};


  const scrollToColumn = (id) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
    }
  }

  return (
    <div className="p-4 sm:p-6 relative">
      {/* Sticky header */}
      <h1 className="text-2xl font-bold mb-6 text-center sm:text-left sticky top-0 bg-white z-50 kanban-header">
      </h1>

<DndContext
  collisionDetection={closestCorners}
  onDragEnd={({ active, over }) => {
    if (!over) return
    updateLeadStatus(active.id, over.id)
  }}
>
  {/* Mobile Bento Grid Preview */}
  <div className="grid grid-cols-2 gap-4 sm:hidden mb-6">
    {statuses.map((status) => {
      const filtered = leads.filter((l) => l.status === status)
      return (
        <div key={status} className="bg-gray-100 p-3 rounded-xl">
          <h2 className="text-lg font-semibold mb-3 text-center flex justify-between">
            {status.toUpperCase()}
            <span className="text-xs bg-gray-300 rounded-full px-2">
              {filtered.length}
            </span>
          </h2>
          {filtered.slice(0, 3).map((lead) => (
            <div
              key={lead.id}
              onClick={() => setEditingLead(lead)}
              className={`rounded-lg p-2 mb-2 cursor-pointer shadow hover:bg-gray-50 ${
                teamColors[lead.allocated_to] || "bg-white"
              }`}
            >
              <p className="font-medium text-sm">
                {lead.name} {lead.last_name}
              </p>
              <p className="text-xs text-gray-600 truncate">
                {lead.estimate_request}
              </p>
            </div>
          ))}
          {filtered.length > 3 && (
            <button
              onClick={() => scrollToColumn(status)}
              className="text-blue-600 text-xs mt-2"
            >
              View all →
            </button>
          )}
        </div>
      )
    })}
  </div>

  {/* Mobile scrollable Kanban */}
  <div className="flex overflow-x-auto gap-4 pb-20 sm:hidden">
    {statuses.map((status) => (
      <div key={status} id={status} className="flex-shrink-0 w-64 kanban-column">
        <KanbanColumn
          id={status}
          title={status}
          leads={leads.filter((l) => l.status === status)}
          setEditingLead={setEditingLead}
        />
      </div>
    ))}
  </div>

  {/* Desktop Kanban */}
  <div className="hidden sm:flex overflow-x-auto gap-4 pb-4">
    {statuses.map((status) => (
      <div key={status} id={status} className="flex-shrink-0 w-64">
        <KanbanColumn
          id={status}
          title={status}
          leads={leads.filter((l) => l.status === status)}
          setEditingLead={setEditingLead}
        />
      </div>
    ))}
  </div>
</DndContext>

      {/* Floating Bottom Nav (mobile only) */}
      <div className="sm:hidden fixed bottom-0 left-0 w-full bg-white border-t shadow-md flex justify-around py-2 z-50">
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => scrollToColumn(status)}
            className="text-sm px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 transition"
          >
            {status}
          </button>
        ))}
      </div>

{/* Lead Editor Drawer */}
{editingLead && (
  <LeadEditorDrawer
    lead={editingLead}
    onClose={() => setEditingLead(null)}
onSave={async (updatedLead) => {
  let leadToSave = { ...updatedLead, last_activity_at: new Date().toISOString() };

  if (updatedLead.status === "quoted") {
    const nextFollowUpDays = (updatedLead.follow_up_count || 0) === 0 ? 3 : 7;
    leadToSave.follow_up_at = new Date(
      Date.now() + nextFollowUpDays * 24 * 60 * 60 * 1000
    ).toISOString();
    leadToSave.follow_up_count = (updatedLead.follow_up_count || 0) + 1;
  }

  setLeads((prev) =>
    prev.map((l) => (l.id === leadToSave.id ? { ...l, ...leadToSave } : l))
  );

  const { error } = await supabase.from("leads").update(leadToSave).eq("id", leadToSave.id);

  if (error) {
    console.error("Error updating lead:", error);
    fetchLeads();
  }

  setEditingLead(null);
}}




    onDelete={async (leadId) => {
      const { error } = await supabase.from("leads").delete().eq("id", leadId)
      if (!error) {
        setLeads((prev) => prev.filter((l) => l.id !== leadId))
        setEditingLead(null)
      }
    }}
  />
)}

    </div>
  )
}

// ---------------------- Kanban Column ----------------------
function KanbanColumn({ id, title, leads, setEditingLead }) {
  const { setNodeRef } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className="bg-gray-100 p-3 rounded-xl min-h-[400px] flex flex-col w-full"
    >
      <h2 className="text-lg font-semibold mb-3 text-center sm:text-left">
        {title.toUpperCase()}
      </h2>
      {leads.map((lead) => (
        <KanbanCard key={lead.id} lead={lead} setEditingLead={setEditingLead} />
      ))}
    </div>
  )
}

// ---------------------- Kanban Card ----------------------
function KanbanCard({ lead, setEditingLead }) {
  const [isOpen, setIsOpen] = useState(false)

  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: lead.id })
  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined

  // Helper: format "time since"
  const timeSince = (date) => {
    if (!date) return "No activity yet"
    const seconds = Math.floor((new Date() - new Date(date)) / 1000)
    let interval = Math.floor(seconds / 31536000)
    if (interval > 1) return `${interval} years ago`
    interval = Math.floor(seconds / 2592000)
    if (interval > 1) return `${interval} months ago`
    interval = Math.floor(seconds / 86400)
    if (interval > 1) return `${interval} days ago`
    interval = Math.floor(seconds / 3600)
    if (interval > 1) return `${interval} hours ago`
    interval = Math.floor(seconds / 60)
    if (interval > 1) return `${interval} minutes ago`
    return "Just now"
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`shadow rounded-lg mb-3 border break-words ${
        teamColors[lead.allocated_to] || "bg-white"
      } kanban-card`}
    >
      {/* Header: Name + Status + Drag Handle */}
      <div
        className="flex justify-between items-center p-3 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen((o) => !o)
        }}
        onDoubleClick={(e) => {
          e.stopPropagation()
          setEditingLead(lead)
        }}
      >
        <div>
          <p className="font-medium text-gray-800 text-sm sm:text-base">
            {lead.name} {lead.last_name}
          </p>
          <p
            className={`font-medium text-sm sm:text-base ${
              statusColors[lead.status] || "text-gray-400"
            }`}
          >
            {lead.status}
          </p>
        </div>

        {/* Drag Handle */}
        <div
          className="cursor-grab text-gray-400 hover:text-gray-600"
          {...listeners}
          {...attributes}
        >
          ⠿
        </div>
      </div>

      {/* Follow up */}
      {lead.follow_up_at && lead.email && (
        <div
          className={`text-xs mt-1 px-3 ${
            new Date(lead.follow_up_at) <= new Date()
              ? "text-red-500 font-semibold"
              : "text-gray-500"
          }`}
        >
          Follow up by:{" "}
          <a
            href={`mailto:${lead.email}?subject=Follow up on your request&body=Hi ${lead.name},%0D%0A%0D%0AI just wanted to follow up regarding your request for "${lead.estimate_request}".%0D%0A%0D%0ARegards,%0D%0ASmart Steel Team`}
            className="underline text-blue-600 hover:text-blue-800"
          >
            {new Date(lead.follow_up_at).toLocaleDateString()}
          </a>
        </div>
      )}

      {/* 3. Time since last activity */}
      {lead.last_activity_at && (
        <div className="text-xs text-gray-400 px-3 mt-1">
          Last activity: {timeSince(lead.last_activity_at)}
        </div>
      )}

      {/* Subheader: Estimate Request */}
      <div className="px-3 pb-3 text-sm text-gray-600">
        {lead.estimate_request}
      </div>

  {/* 4. Quick Actions */}
<div className="flex gap-2 px-3 pb-2 pt-2 border-t">
  {lead.email && (
    <a
      href={`mailto:${lead.email}?subject=Quick update&body=Hi ${lead.name},`}
      className="text-xs px-2 py-1 rounded-md bg-white text-blue-700 hover:bg-blue-200 transition"
    >
      Email
    </a>
  )}
  {lead.phone && (
    <a
      href={`tel:${lead.phone}`}
      className="text-xs px-2 py-1 rounded-md bg-white text-green-700 hover:bg-green-200 transition"
    >
      Call
    </a>
  )}
  <button
    onClick={() => setEditingLead(lead)}
    className="text-xs px-2 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-200 transition"
  >
    Edit
  </button>
</div>


      {/* Collapsible Details */}
      {isOpen && (
        <div className="px-3 pb-3 text-sm text-gray-500 border-t pt-2 space-y-1">
          <p>
            <span className="font-semibold">Allocated To:</span>{" "}
            {lead.allocated_to || "—"}
          </p>
          <p>
            <span className="font-semibold">Status:</span> {lead.status}
          </p>
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
