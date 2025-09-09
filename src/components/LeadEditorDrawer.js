"use client"

import { useState, Fragment, useEffect } from "react"
import { Dialog, Transition, Tab } from "@headlessui/react"
import { Phone, Mail, MessageSquare, Trash2, Save } from "lucide-react"

export default function LeadEditorDrawer({ lead, onClose, onSave, onDelete }) {
  // If lead is null, we are adding a new lead
  const isNew = !lead?.id

  const [formData, setFormData] = useState({
    name: "",
    last_name: "",
    email: "",
    phone: "",
    estimate_request: "",
    status: "New",
    allocated_to: "",
    notes: "",
    ...lead
  })
  const [notes, setNotes] = useState(lead?.notes ? [lead.notes] : [])

  useEffect(() => {
    setFormData({
      name: "",
      last_name: "",
      email: "",
      phone: "",
      estimate_request: "",
      status: "New",
      allocated_to: "",
      notes: "",
      ...lead
    })
    setNotes(lead?.notes ? [lead.notes] : [])
  }, [lead])

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAddNote = (note) => {
    setNotes((prev) => [{ text: note, date: new Date() }, ...prev])
  }

  return (
    <Transition.Root show={!!lead || isNew} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-y-0 right-0 flex max-w-lg w-full">
          <Transition.Child
            as={Fragment}
            enter="transform transition ease-in-out duration-300"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transform transition ease-in-out duration-200"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <Dialog.Panel className="flex flex-col bg-white shadow-xl w-full">
              {/* Header */}
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <Dialog.Title className="text-xl font-semibold">
                  {isNew ? "Add New Lead" : `${formData.name} ${formData.last_name}`}
                </Dialog.Title>
                {!isNew && (
                  <div className="flex gap-2">
                    <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
                      <Phone size={18} />
                    </button>
                    <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
                      <Mail size={18} />
                    </button>
                    <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
                      <MessageSquare size={18} />
                    </button>
                  </div>
                )}
              </div>

              {/* Tabs */}
              <Tab.Group>
                <Tab.List className="flex border-b">
                  {["Details", "Notes", "Activity"].map((tab) => (
                    <Tab
                      key={tab}
                      className={({ selected }) =>
                        `flex-1 py-2 text-sm font-medium ${
                          selected ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"
                        }`
                      }
                    >
                      {tab}
                    </Tab>
                  ))}
                </Tab.List>

                <Tab.Panels className="flex-1 overflow-y-auto p-6">
                  {/* Details */}
                  <Tab.Panel className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">First & Last Name</label>
                      <input
                        type="text"
                        value={formData.name || ""}
                        onChange={(e) => handleChange("name", e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                      />
                    </div>
        
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        value={formData.email || ""}
                        onChange={(e) => handleChange("email", e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <input
                        type="tel"
                        value={formData.phone || ""}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                      />
                    </div>
                    {/* Estimate Request */}
{/* Estimate Request */}
<div className="mt-4">
  <label className="block text-sm font-medium text-gray-700 mb-2">Warehouse Size</label>
  <div className="flex gap-2 mb-2">
    <select
      value={formData.width || ""}
      onChange={(e) => handleChange("width", e.target.value)}
      className="border px-3 py-2 rounded"
    >
      <option value="">Select Width</option>
      <option value="8">8m</option>
      <option value="10">10m</option>
      <option value="12">12m</option>
    </select>

    <select
      value={formData.length || ""}
      onChange={(e) => handleChange("length", e.target.value)}
      className="border px-3 py-2 rounded"
    >
      <option value="">Select Length</option>
      {[...Array(20)].map((_, i) => { // lengths from 2.5m to 50m
        const len = (i + 1) * 2.5
        return <option key={len} value={len}>{len}m</option>
      })}
    </select>
  </div>

  <label className="block text-sm font-medium text-gray-700 mb-2">Cladding & Installation</label>
  <div className="flex gap-2 flex-wrap">
    {["IBR", "Chromadek"].map((clad) => (
      <button
        key={clad}
        type="button"
        className={`px-3 py-1 rounded border ${
          formData.cladding === clad ? "bg-blue-200 border-blue-500" : "bg-gray-100"
        }`}
        onClick={() => handleChange("cladding", formData.cladding === clad ? "" : clad)}
      >
        {clad}
      </button>
    ))}
    {["Supply Only", "Installed"].map((option) => (
      <button
        key={option}
        type="button"
        className={`px-3 py-1 rounded border ${
          formData.installation === option ? "bg-blue-200 border-blue-500" : "bg-gray-100"
        }`}
        onClick={() => handleChange("installation", formData.installation === option ? "" : option)}
      >
        {option}
      </button>
    ))}
  </div>


  {/* Custom request textarea */}
  <textarea
    placeholder="Or enter custom request..."
    value={formData.estimate_request || ""}
    onChange={(e) => handleChange("estimate_request", e.target.value)}
    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
  />
</div>

{/* Allocated To */}
<div className="mt-4">
  <label className="block text-sm font-medium text-gray-700 mb-2">Allocated To</label>
  <div className="flex gap-2">
    {["Stefan", "Niel", "Victor", "Marco"].map((member) => {
      const colors = {
        Stefan: "bg-red-200",
        Niel: "bg-blue-200",
        Victor: "bg-green-200",
        Marco: "bg-yellow-200",
      }
      return (
        <button
          key={member}
          type="button"
          className={`px-3 py-1 rounded border font-medium ${
            formData.allocated_to === member
              ? `${colors[member]} border-gray-500`
              : "bg-gray-100"
          }`}
          onClick={() => handleChange("allocated_to", formData.allocated_to === member ? "" : member)}
        >
          {member}
        </button>
      )
    })}
  </div>
</div>


                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <select
                        value={formData.status || "New"}
                        onChange={(e) => handleChange("status", e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                      >
                        <option>New</option>
                        <option>Contacted</option>
                        <option>Proposal</option>
                        <option>Negotiation</option>
                        <option>Closed Won</option>
                        <option>Closed Lost</option>
                      </select>
                    </div>
                  </Tab.Panel>

                  {/* Notes */}
                  <Tab.Panel>
                    <div className="space-y-4">
                      <textarea
                        placeholder="Add a note..."
                        className="w-full rounded-md border-gray-300 shadow-sm"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            if (e.target.value.trim()) {
                              handleAddNote(e.target.value)
                              e.target.value = ""
                            }
                          }
                        }}
                      />
                      <div className="space-y-2">
                        {notes.map((n, i) => (
                          <div key={i} className="p-2 border rounded-md bg-gray-50">
                            <p className="text-sm">{n.text || n}</p>
                            {n.date && (
                              <span className="text-xs text-gray-400">
                                {new Date(n.date).toLocaleString()}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </Tab.Panel>

                  {/* Activity */}
                  <Tab.Panel>
                    <p className="text-sm text-gray-500">No activity yet. Calls, emails, and updates will appear here.</p>
                  </Tab.Panel>
                </Tab.Panels>
              </Tab.Group>

              {/* Footer */}
              <div className="p-4 border-t flex justify-end gap-2">
                {!isNew && (
                  <button
                    onClick={() => onDelete(lead.id)}
                    className="flex items-center gap-1 text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                )}
                <button
                  onClick={() => onSave(formData)}
                  className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  <Save size={16} /> {isNew ? "Add Lead" : "Save"}
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
