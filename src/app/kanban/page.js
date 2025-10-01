"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../../lib/supabase"
import KanbanBoard from "../../components/KanbanBoard"
import LeadEditorDrawer from "../../components/LeadEditorDrawer"
import PricesDrawer from "../../components/PricesDrawer"

export default function KanbanPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)   // always first after router
  const [leads, setLeads] = useState([])
  const [editingLead, setEditingLead] = useState(null)
  const [isAddingLead, setIsAddingLead] = useState(false)
  const [showPricesDrawer, setShowPricesDrawer] = useState(false) // NEW

  // Check auth on mount
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace("/login")
      } else {
        setUser(session.user)
        fetchLeads()
      }
    }
    fetchUser()
  }, [router])

  const fetchLeads = async () => {
    const { data, error } = await supabase.from("leads").select("*")
    if (!error) setLeads(data)
  }

  // Save for both new and existing leads
  const handleSaveLead = async (leadData, isNew = false) => {
    if (isNew) {
      const { data, error } = await supabase
        .from("leads")
        .insert([{ ...leadData, created_by: user.id }])
        .select()
      if (!error) {
        setLeads((prev) => [...prev, data[0]])
        setIsAddingLead(false)
      } else {
        alert("Error adding lead: " + error.message)
      }
    } else {
      const { error } = await supabase
        .from("leads")
        .update(leadData)
        .eq("id", leadData.id)
      if (!error) fetchLeads()
      setEditingLead(null)
    }
  }

  const handleDeleteLead = async (id) => {
    if (!confirm("Are you sure you want to delete this lead?")) return
    const { error } = await supabase.from("leads").delete().eq("id", id)
    if (!error) fetchLeads()
    setEditingLead(null)
    setIsAddingLead(false)
  }

  // Don’t render until user is checked
  if (!user) return null

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mt-16 mb-6">
        <h1 className="text-2xl font-bold">Smart Steel Leads Centre</h1>

        {/* Buttons group */}
        <div className="flex gap-3">
          <button
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
            onClick={() => setShowPricesDrawer(true)}
          >
            Prices & Templates
          </button>

          <button
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            onClick={() => setIsAddingLead(true)}
          >
            + New Lead
          </button>
        </div>
      </div>

      <KanbanBoard
        leads={leads}
        setEditingLead={setEditingLead}
        fetchLeads={fetchLeads}
      />

      {/* Edit Existing Lead */}
      {editingLead && (
        <LeadEditorDrawer
          lead={editingLead}
          onClose={() => setEditingLead(null)}
          onSave={(lead) => handleSaveLead(lead)}
          onDelete={handleDeleteLead}
        />
      )}

      {/* Add New Lead */}
      {isAddingLead && (
        <LeadEditorDrawer
          lead={{
            name: "",
            last_name: "",
            email: "",
            phone: "",
            estimate_request: "",
            allocated_to: "",
            notes: "",
            status: "new",
          }}
          onClose={() => setIsAddingLead(false)}
          onSave={(lead) => handleSaveLead(lead, true)}
          onDelete={handleDeleteLead}
        />
      )}

      {/* Prices & Templates Drawer */}
      {showPricesDrawer && (
        <PricesDrawer onClose={() => setShowPricesDrawer(false)} />
      )}
    </div>
  )
}
