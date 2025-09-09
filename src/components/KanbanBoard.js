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
  "new": "text-gray-500",
  "contacted": "text-blue-600",
  "quoted": "text-yellow-600",
  "won": "text-green-600",
  "lost": "text-red-600"
};


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
    setLeads((prev) =>
      prev.map((lead) => (lead.id === id ? { ...lead, status: newStatus } : lead))
    )
    await supabase.from("leads").update({ status: newStatus }).eq("id", id)
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Smart Steel Leads Centre</h1>

      <DndContext
        collisionDetection={closestCorners}
        onDragEnd={({ active, over }) => {
          if (!over) return
          updateLeadStatus(active.id, over.id)
        }}
      >
        <div className="grid grid-cols-5 gap-4">
          {statuses.map((status) => (
            <KanbanColumn
              key={status}
              id={status}
              title={status}
              leads={leads.filter((l) => l.status === status)}
              setEditingLead={setEditingLead}
            />
          ))}
        </div>
      </DndContext>

      {editingLead && (
        <LeadEditorDrawer
          lead={editingLead}
          onClose={() => setEditingLead(null)}
          onSave={async (updatedLead) => {
            const { error } = await supabase
              .from("leads")
              .update(updatedLead)
              .eq("id", updatedLead.id)
            if (!error) {
              fetchLeads()
              setEditingLead(null)
            }
          }}
          onDelete={async (leadId) => {
            const { error } = await supabase.from("leads").delete().eq("id", leadId)
            if (!error) {
              fetchLeads()
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
    <div ref={setNodeRef} className="bg-gray-100 p-4 rounded-xl min-h-[400px] flex flex-col">
      <h2 className="text-lg font-semibold mb-3">{title.toUpperCase()}</h2>
      {leads.map((lead) => (
        <KanbanCard key={lead.id} lead={lead} setEditingLead={setEditingLead} />
      ))}
    </div>
  )
}

// ---------------------- Kanban Card ----------------------
function KanbanCard({ lead, setEditingLead }) {
  const [isOpen, setIsOpen] = useState(false)

  // Make this card draggable
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: lead.id })
  const style = transform ? { transform: `translate(${transform.x}px, ${transform.y}px)` } : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`shadow rounded-lg mb-3 cursor-pointer hover:bg-gray-50 border ${teamColors[lead.allocated_to] || "bg-white"}`}
      onClick={() => setIsOpen(!isOpen)}           // single click: toggle dropdown
      onDoubleClick={() => setEditingLead(lead)}  // double click: open drawer
    >
      {/* Header: Name + Status */}
      <div className="flex justify-between items-center p-3">
        <p className="font-medium text-gray-800">{lead.name} {lead.last_name}</p>
        <p className={`font-medium ${statusColors[lead.status_board] || "text-gray-400"}`}>
          {lead.status_board}
        </p>
      </div>

      {/* Subheader: Estimate Request */}
      <div className="px-3 pb-3 text-sm text-gray-600">
        {lead.estimate_request}
      </div>

      {/* Collapsible Details */}
      {isOpen && (
        <div className="px-3 pb-3 text-sm text-gray-500 border-t pt-2 space-y-1">
          <p><span className="font-semibold">Allocated To:</span> {lead.allocated_to || "—"}</p>
          <p><span className="font-semibold">Status:</span> {lead.status}</p>
          {lead.notes && <p><span className="font-semibold">Notes:</span> {lead.notes}</p>}
        </div>
      )}
    </div>
  )
}