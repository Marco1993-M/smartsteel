"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"
import KanbanBoard from "../../components/KanbanBoard"
import LeadEditorDrawer from "../../components/LeadEditorDrawer"

export default function KanbanPage() {
  const [leads, setLeads] = useState([])
  const [editingLead, setEditingLead] = useState(null)
  const [showAddLeadModal, setShowAddLeadModal] = useState(false)

  // Fetch leads
  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    const { data, error } = await supabase.from("leads").select("*")
    if (!error) setLeads(data)
  }

  const handleSaveLead = async (updatedLead) => {
    const { error } = await supabase.from("leads").update(updatedLead).eq("id", updatedLead.id)
    if (!error) fetchLeads()
    setEditingLead(null)
  }

  const handleDeleteLead = async (id) => {
    if (!confirm("Are you sure you want to delete this lead?")) return
    const { error } = await supabase.from("leads").delete().eq("id", id)
    if (!error) fetchLeads()
    setEditingLead(null)
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mt-16 mb-6">
        <h1 className="text-2xl font-bold">Smart Steel Leads Centre</h1>
        <button
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          onClick={() => setShowAddLeadModal(true)}
        >
          + New Lead
        </button>
      </div>

      <KanbanBoard
        leads={leads}
        setEditingLead={setEditingLead}
        fetchLeads={fetchLeads} // optional, if KanbanBoard needs to trigger refresh
      />

      {editingLead && (
        <LeadEditorDrawer
          lead={editingLead}
          onClose={() => setEditingLead(null)}
          onSave={handleSaveLead}
          onDelete={handleDeleteLead}
        />
      )}

      {/* TODO: Add "AddLeadModal" component if needed */}
    </div>
  )
}
