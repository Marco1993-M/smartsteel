"use client"

import { useState } from "react"
import { supabase } from "../lib/supabase"

export default function AddLeadModal({ onClose, onLeadAdded }) {
  const [lead, setLead] = useState({
    name: "",
    last_name: "",
    estimate_request: "",
    status: "new",
    allocated_to: "",
    notes: "",
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { data, error } = await supabase
      .from("leads")
      .insert([lead])
      .select()
    if (!error) {
      onLeadAdded()
      onClose()
    } else {
      alert("Error adding lead: " + error.message)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        <h2 className="text-xl font-semibold mb-4">Add New Lead</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="First Name"
            value={lead.name}
            onChange={(e) => setLead({ ...lead, name: e.target.value })}
            required
            className="border px-3 py-2 rounded"
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lead.last_name}
            onChange={(e) => setLead({ ...lead, last_name: e.target.value })}
            required
            className="border px-3 py-2 rounded"
          />
          <input
            type="text"
            placeholder="Estimate Request"
            value={lead.estimate_request}
            onChange={(e) => setLead({ ...lead, estimate_request: e.target.value })}
            className="border px-3 py-2 rounded"
          />
          <select
            value={lead.status}
            onChange={(e) => setLead({ ...lead, status: e.target.value })}
            className="border px-3 py-2 rounded"
          >
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="quoted">Quoted</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
          </select>
          <input
            type="text"
            placeholder="Allocated To"
            value={lead.allocated_to}
            onChange={(e) => setLead({ ...lead, allocated_to: e.target.value })}
            className="border px-3 py-2 rounded"
          />
          <textarea
            placeholder="Notes"
            value={lead.notes}
            onChange={(e) => setLead({ ...lead, notes: e.target.value })}
            className="border px-3 py-2 rounded"
          />
          <div className="flex justify-end gap-2 mt-3">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Add</button>
          </div>
        </form>
      </div>
    </div>
  )
}
