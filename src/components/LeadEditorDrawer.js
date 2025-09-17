"use client"

import { useState, useEffect, Fragment } from "react"
import { Dialog, Transition, Tab } from "@headlessui/react"
import { Phone, Mail, MessageSquare, Trash2, Save, ArrowLeft } from "lucide-react"
import { supabase } from "../lib/supabase" 

export default function LeadEditorDrawer({ lead, onClose, onSave, onDelete, onBack }) {
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

  const handleChange = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }))
  const backHandler = onBack || onClose

  return (
    <Transition.Root show={!!lead || isNew} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex justify-end">
          <Transition.Child
            as="div"
            enter="transform transition ease-in-out duration-300"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transform transition ease-in-out duration-200"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <Dialog.Panel className="flex flex-col bg-white shadow-xl w-full max-w-[450px] h-full overflow-hidden sm:w-full md:max-w-[450px]">
              {/* Header */}
              <div className="px-6 py-4 border-b flex items-center justify-between sticky top-0 bg-white z-10">
                <div className="flex items-center gap-3">
                  <button onClick={backHandler} className="p-2 rounded-full hover:bg-gray-100">
                    <ArrowLeft size={20} />
                  </button>
                  <Dialog.Title className="flex items-center gap-2 text-xl font-semibold truncate">
                    {isNew ? "Add New Lead" : `${formData.name} ${formData.last_name}`}
                    {!isNew && (
                      <span
                        className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                          formData.status === "Won"
                            ? "bg-green-100 text-green-800"
                            : formData.status === "Lost"
                            ? "bg-red-100 text-red-800"
                            : formData.status === "Quoted"
                            ? "bg-yellow-100 text-yellow-800"
                            : formData.status === "Contacted"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {formData.status || "New"}
                      </span>
                    )}
                  </Dialog.Title>
                </div>
                {!isNew && (
                  <div className="flex gap-2">
                    <a href={`tel:${formData.phone}`} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
                      <Phone size={18} />
                    </a>
                    <a href={`mailto:${formData.email}`} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
                      <Mail size={18} />
                    </a>
                    <a
                      href={`https://wa.me/${formData.phone?.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
                    >
                      <MessageSquare size={18} />
                    </a>
                  </div>
                )}
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto">
                <Tab.Group>
                  <Tab.List className="flex overflow-x-auto no-scrollbar -webkit-overflow-scrolling-touch border-b">
                    {["Details", "Notes", "Activity"].map((tab) => (
                      <Tab
                        key={tab}
                        className={({ selected }) =>
                          `flex-shrink-0 px-4 py-2 text-sm font-medium whitespace-nowrap ${
                            selected ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"
                          }`
                        }
                      >
                        {tab}
                      </Tab>
                    ))}
                  </Tab.List>

                  <Tab.Panels className="p-6 space-y-4 w-full">
                    {/* Details Panel */}
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

                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Warehouse Size</label>
                        <div className="flex gap-2 mb-2 flex-wrap">
                          <select
                            value={formData.width || ""}
                            onChange={(e) => handleChange("width", e.target.value)}
                            className="border px-3 py-2 rounded flex-1 min-w-[100px]"
                          >
                            <option value="">Select Width</option>
                            <option value="8">8m</option>
                            <option value="10">10m</option>
                            <option value="12">12m</option>
                          </select>

                          <select
                            value={formData.length || ""}
                            onChange={(e) => handleChange("length", e.target.value)}
                            className="border px-3 py-2 rounded flex-1 min-w-[100px]"
                          >
                            <option value="">Select Length</option>
                            {[...Array(20)].map((_, i) => {
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

                        <textarea
                          placeholder="Custom request & notes..."
                          value={formData.estimate_request || ""}
                          onChange={(e) => handleChange("estimate_request", e.target.value)}
                          className="mt-3 block w-full text-gray-400 rounded-md border-gray-300 shadow-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Date</label>
                        <div className="flex gap-2 items-center">
                          <input
                            type="date"
                            value={formData.follow_up_at ? new Date(formData.follow_up_at).toISOString().split("T")[0] : ""}
                            onChange={(e) =>
                              handleChange(
                                "follow_up_at",
                                e.target.value ? new Date(e.target.value).toISOString() : null
                              )
                            }
                            className="block rounded-md border-gray-300 shadow-sm"
                          />
                          <div className="flex gap-1">
                            {[
                              { label: "Today", offset: 0 },
                              { label: "+1 Day", offset: 1 },
                              { label: "+1 Week", offset: 7 },
                            ].map(({ label, offset }) => (
                              <button
                                key={label}
                                type="button"
                                onClick={() => {
                                  const d = new Date()
                                  d.setDate(d.getDate() + offset)
                                  handleChange("follow_up_at", d.toISOString())
                                }}
                                className="px-2 py-1 text-xs rounded border bg-gray-100 hover:bg-gray-200"
                              >
                                {label}
                              </button>
                            ))}
                            <button
                              type="button"
                              onClick={() => handleChange("follow_up_at", null)}
                              className="px-2 py-1 text-xs rounded border bg-red-100 text-red-700 hover:bg-red-200"
                            >
                              Clear
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Allocated To</label>
                        <div className="flex gap-2 flex-wrap">
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
                          <option>Quoted</option>
                          <option>Won</option>
                          <option>Lost</option>
                        </select>
                      </div>
                    </Tab.Panel>

{/* Notes Panel */}
<Tab.Panel className="space-y-4 w-full">
  {/* Add new note */}
  <textarea
    placeholder="Add a note..."
    className="w-full rounded-md border-gray-300 shadow-sm"
    onKeyDown={async (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        const text = e.target.value.trim()
        if (!text) return

        if (!lead?.id) {
          alert("Please save the lead before adding notes")
          return
        }

        // Optimistic UI update
        const tempId = Math.random()
        setNotes((prev) => [{ id: tempId, text, created_at: new Date() }, ...prev])
        e.target.value = ""

        // Save to Supabase
        const { data, error } = await supabase
          .from("lead_notes")
          .insert([{ lead_id: lead.id, text }])
          .select()

        if (error) {
          console.error("Error adding note:", error)
          // Rollback UI update
          setNotes((prev) => prev.filter((n) => n.id !== tempId))
        } else {
          // Replace temp ID with real ID
          setNotes((prev) =>
            prev.map((n) =>
              n.id === tempId ? { ...n, id: data[0].id, created_at: data[0].created_at } : n
            )
          )
        }
      }
    }}
  />

  {/* Notes list */}
  <div className="space-y-2 w-full">
    {notes.map((note, i) => (
      <div
        key={note.id}
        className="p-2 border rounded-md bg-gray-50 flex justify-between items-start w-full"
      >
        <div className="flex-1 w-full">
          {note.isEditing ? (
            <textarea
              value={note.text}
              onChange={(e) => {
                const updatedText = e.target.value
                setNotes((prev) =>
                  prev.map((n, idx) => (idx === i ? { ...n, text: updatedText } : n))
                )
              }}
              onBlur={async () => {
                setNotes((prev) =>
                  prev.map((n, idx) => (idx === i ? { ...n, isEditing: false } : n))
                )
                const { error } = await supabase
                  .from("lead_notes")
                  .update({ text: note.text })
                  .eq("id", note.id)
                if (error) console.error("Error updating note:", error)
              }}
              className="w-full rounded-md border-gray-300 shadow-sm"
            />
          ) : (
            <p
              className="text-sm cursor-pointer"
              onClick={() =>
                setNotes((prev) =>
                  prev.map((n, idx) => (idx === i ? { ...n, isEditing: true } : n))
                )
              }
            >
              {note.text}
            </p>
          )}
          {note.created_at && (
            <span className="text-xs text-gray-400">
              {new Date(note.created_at).toLocaleString()}
            </span>
          )}
        </div>

        <button
          onClick={async () => {
            setNotes((prev) => prev.filter((_, idx) => idx !== i))
            const { error } = await supabase.from("lead_notes").delete().eq("id", note.id)
            if (error) console.error("Error deleting note:", error)
          }}
          className="ml-2 text-red-600 hover:text-red-800"
        >
          <Trash2 size={16} />
        </button>
      </div>
    ))}
  </div>
</Tab.Panel>



                    {/* Activity Panel */}
                    <Tab.Panel>
                      <p className="text-sm text-gray-500">
                        No activity yet. Calls, emails, and updates will appear here.
                      </p>
                    </Tab.Panel>
                  </Tab.Panels>

                  {/* Footer */}
                  <div className="p-4 border-t flex justify-end gap-2 sticky bottom-0 bg-white z-10">
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
                </Tab.Group>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
