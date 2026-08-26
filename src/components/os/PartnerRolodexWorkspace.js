"use client"

import { useEffect, useMemo, useState } from "react"
import {
  ArrowRight,
  Building2,
  CalendarClock,
  Check,
  ChevronRight,
  CircleUserRound,
  ContactRound,
  Mail,
  MapPin,
  Plus,
  Search,
  Sparkles,
  Star,
  Target,
  UsersRound,
  X,
} from "lucide-react"
import { getOsAuthHeaders } from "../../lib/osClientAuth"
import {
  ROLODEX_MARKET_SEGMENTS,
  ROLODEX_PERMISSION_OPTIONS,
  ROLODEX_RELATIONSHIP_TYPES,
  ROLODEX_STATUS_META,
  ROLODEX_STATUS_OPTIONS,
} from "../../lib/partnerRolodexData"

const EMPTY_CONTACT = { name: "", role: "", email: "", phone: "", isPrimary: true }
const EMPTY_FORM = {
  name: "",
  website: "",
  relationshipType: "solar_installer",
  status: "identified",
  relationshipStrength: 1,
  priority: "normal",
  owner: "Marco",
  province: "",
  serviceAreas: [],
  marketSegments: [],
  typicalProjectScale: "",
  relevantProducts: [],
  source: "",
  communicationPermission: "unknown",
  permissionSource: "",
  lastInteractionAt: "",
  nextAction: "",
  nextActionDueAt: "",
  notes: "",
  contacts: [{ ...EMPTY_CONTACT }],
}

const TYPE_LABELS = {
  solar_installer: "Solar installer",
  epc: "EPC contractor",
  solar_developer: "Solar developer",
  distributor: "Distributor",
  consultant: "Consultant",
  reseller: "Reseller",
  other: "Other",
}

const PERMISSION_LABELS = {
  unknown: "Permission not recorded",
  relationship_only: "Relationship communication",
  marketing_allowed: "Marketing allowed",
  do_not_contact: "Do not contact",
}

function dateValue(value) {
  return value ? String(value).slice(0, 10) : ""
}

function toForm(record) {
  if (!record) return { ...EMPTY_FORM, contacts: [{ ...EMPTY_CONTACT }] }
  return {
    ...EMPTY_FORM,
    ...record,
    lastInteractionAt: dateValue(record.lastInteractionAt),
    nextActionDueAt: dateValue(record.nextActionDueAt),
    contacts: record.contacts?.length ? record.contacts.map((contact) => ({ ...contact })) : [{ ...EMPTY_CONTACT }],
  }
}

function formatDate(value) {
  if (!value) return "Not scheduled"
  return new Intl.DateTimeFormat("en-ZA", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${String(value).slice(0, 10)}T12:00:00`))
}

function isOverdue(value) {
  if (!value) return false
  return new Date(`${String(value).slice(0, 10)}T23:59:59`) < new Date()
}

function Metric({ icon: Icon, label, value, detail, tone = "slate" }) {
  const tones = {
    slate: "border-slate-200 bg-white text-slate-950",
    blue: "border-blue-200 bg-blue-50 text-[#0043f3]",
    green: "border-emerald-200 bg-emerald-50 text-emerald-800",
  }
  return <div className={`rounded-2xl border p-4 ${tones[tone]}`}><div className="flex items-center justify-between gap-3"><p className="text-[10px] font-black uppercase tracking-[0.16em] opacity-60">{label}</p><Icon className="h-4 w-4 opacity-60" /></div><p className="mt-3 text-3xl font-black tracking-tight">{value}</p><p className="mt-1 text-xs font-semibold opacity-60">{detail}</p></div>
}

export default function PartnerRolodexWorkspace() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [schemaReady, setSchemaReady] = useState(true)
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState("all")
  const [selected, setSelected] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState(toForm())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function loadRecords() {
    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/os/partner-rolodex", { cache: "no-store", headers: await getOsAuthHeaders() })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Could not open Rolodex.")
      setRecords(payload.records || [])
      setSchemaReady(payload.schemaReady !== false)
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadRecords() }, [])

  const metrics = useMemo(() => ({
    total: records.length,
    priority: records.filter((record) => record.priority === "high" && record.status !== "dormant").length,
    active: records.filter((record) => record.status === "active_partner").length,
    followUps: records.filter((record) => record.nextAction && record.status !== "dormant").length,
  }), [records])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return records.filter((record) => {
      const matchesFilter = filter === "all" || (filter === "priority" ? record.priority === "high" : filter === "follow_up" ? Boolean(record.nextAction) && record.status !== "dormant" : record.status === filter)
      const searchable = [record.name, record.owner, record.province, record.relationshipType, ...(record.marketSegments || []), ...(record.serviceAreas || []), ...(record.contacts || []).flatMap((contact) => [contact.name, contact.email])].join(" ").toLowerCase()
      return matchesFilter && (!needle || searchable.includes(needle))
    })
  }, [records, query, filter])

  function openEditor(record = null) {
    setSelected(record)
    setForm(toForm(record))
    setError("")
    setFormOpen(true)
  }

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function toggleList(field, value) {
    setForm((current) => ({
      ...current,
      [field]: current[field].includes(value) ? current[field].filter((item) => item !== value) : [...current[field], value],
    }))
  }

  function updateContact(index, field, value) {
    setForm((current) => ({ ...current, contacts: current.contacts.map((contact, contactIndex) => contactIndex === index ? { ...contact, [field]: value } : contact) }))
  }

  async function save(event) {
    event.preventDefault()
    if (!form.name.trim()) return setError("Add the company name before saving.")
    setSaving(true)
    setError("")
    try {
      const response = await fetch("/api/os/partner-rolodex", {
        method: selected ? "PATCH" : "POST",
        headers: await getOsAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ ...form, id: selected?.id }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Could not save this company.")
      setFormOpen(false)
      setSelected(null)
      await loadRecords()
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setSaving(false)
    }
  }

  return <div className="min-w-0 space-y-5 px-4 py-5 sm:px-6 sm:py-6">
    <section className="relative overflow-hidden rounded-[2rem] border border-[#0043f3] bg-[linear-gradient(125deg,#001d2e_0%,#073776_55%,#0043f3_100%)] p-6 text-white shadow-xl sm:p-8">
      <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border border-white/10" />
      <div className="pointer-events-none absolute -right-8 -top-10 h-52 w-52 rounded-full border border-white/10" />
      <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div><div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em] text-[#c1d9e5]"><ContactRound className="h-4 w-4" /> Smart Steel relationship network</div><h2 className="mt-4 max-w-3xl text-4xl font-black tracking-[-0.05em] sm:text-5xl">Rolodex</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">Build the small number of industry relationships that can repeatedly create strong Atlas opportunities.</p></div>
        <button type="button" onClick={() => openEditor()} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-black text-[#0043f3] shadow-lg"><Plus className="h-4 w-4" /> Add company</button>
      </div>
    </section>

    {!schemaReady ? <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">Previewing the Rolodex structure. Run <code>supabase/smart_steel_os_partner_rolodex.sql</code> to save shared records.</div> : null}
    {error && !formOpen ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">{error}</div> : null}

    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Metric icon={Building2} label="Companies" value={metrics.total} detail="Strategic network records" />
      <Metric icon={Target} label="Priority" value={metrics.priority} detail="Relationships worth focused effort" tone="blue" />
      <Metric icon={UsersRound} label="Active partners" value={metrics.active} detail="Working relationships" tone="green" />
      <Metric icon={CalendarClock} label="Next actions" value={metrics.followUps} detail="Relationships with momentum" />
    </section>

    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <label className="relative block min-w-0 flex-1 lg:max-w-xl"><Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search company, contact, market or location" className="min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-base outline-none transition focus:border-[#0043f3] focus:bg-white" /></label>
        <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">{[
          ["all", "All"], ["priority", "Priority"], ["active_partner", "Active"], ["conversation", "Conversations"], ["follow_up", "Follow-ups"], ["dormant", "Dormant"],
        ].map(([value, label]) => <button key={value} type="button" onClick={() => setFilter(value)} className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-black transition ${filter === value ? "bg-[#001d2e] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{label}</button>)}</div>
      </div>
    </section>

    {loading ? <div className="rounded-[1.75rem] border border-slate-200 bg-white p-10 text-center text-sm font-semibold text-slate-500">Opening the relationship network...</div> : filtered.length ? <section className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">{filtered.map((record) => <CompanyCard key={record.id} record={record} onOpen={() => openEditor(record)} />)}</section> : <section className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white p-10 text-center"><Sparkles className="mx-auto h-6 w-6 text-[#0043f3]" /><h3 className="mt-4 text-xl font-black">No relationships match this view.</h3><p className="mt-2 text-sm text-slate-500">Adjust the search or add the next company worth knowing.</p></section>}

    {formOpen ? <CompanyEditor form={form} selected={selected} error={error} saving={saving} onClose={() => setFormOpen(false)} onSave={save} onUpdate={update} onToggleList={toggleList} onUpdateContact={updateContact} onAddContact={() => update("contacts", [...form.contacts, { ...EMPTY_CONTACT, isPrimary: false }])} onRemoveContact={(index) => update("contacts", form.contacts.filter((_, contactIndex) => contactIndex !== index))} /> : null}
  </div>
}

function CompanyCard({ record, onOpen }) {
  const status = ROLODEX_STATUS_META[record.status] || ROLODEX_STATUS_META.identified
  const primaryContact = record.contacts?.find((contact) => contact.isPrimary) || record.contacts?.[0]
  return <button type="button" onClick={onOpen} className="group min-w-0 rounded-[1.5rem] border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#0043f3] hover:shadow-lg">
    <div className="flex items-start justify-between gap-4"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate text-xl font-black tracking-tight text-slate-950">{record.name}</h3>{record.priority === "high" ? <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-[#0043f3]">Priority</span> : null}</div><p className="mt-1 text-xs font-bold text-slate-500">{TYPE_LABELS[record.relationshipType] || "Industry relationship"}</p></div><span className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] ${status.className}`}>{status.label}</span></div>
    <div className="mt-5 flex items-center gap-1.5" aria-label={`${record.relationshipStrength} out of 5 relationship strength`}>{[1, 2, 3, 4, 5].map((level) => <Star key={level} className={`h-4 w-4 ${level <= record.relationshipStrength ? "fill-[#0043f3] text-[#0043f3]" : "text-slate-200"}`} />)}<span className="ml-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Relationship</span></div>
    <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">{primaryContact ? <div className="flex items-center gap-3"><CircleUserRound className="h-4 w-4 text-slate-400" /><div className="min-w-0"><p className="truncate text-sm font-bold text-slate-900">{primaryContact.name}</p><p className="truncate text-xs text-slate-500">{primaryContact.role || primaryContact.email || "Primary contact"}</p></div></div> : <div className="flex items-center gap-3 text-sm font-semibold text-amber-700"><CircleUserRound className="h-4 w-4" /> Contact still to capture</div>}{record.province || record.serviceAreas?.length ? <div className="flex items-center gap-3 text-xs text-slate-500"><MapPin className="h-4 w-4" />{[record.province, ...(record.serviceAreas || [])].filter(Boolean).join(" · ")}</div> : null}</div>
    <div className={`mt-5 rounded-xl p-4 ${isOverdue(record.nextActionDueAt) ? "bg-rose-50" : "bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Next action</p><p className={`text-[10px] font-black ${isOverdue(record.nextActionDueAt) ? "text-rose-700" : "text-slate-500"}`}>{formatDate(record.nextActionDueAt)}</p></div><p className="mt-2 line-clamp-2 text-sm font-bold leading-5 text-slate-800">{record.nextAction || "Set the next relationship action"}</p></div>
    <div className="mt-4 flex items-center justify-between"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">{PERMISSION_LABELS[record.communicationPermission]}</p><ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#0043f3]" /></div>
  </button>
}

function CompanyEditor({ form, selected, error, saving, onClose, onSave, onUpdate, onToggleList, onUpdateContact, onAddContact, onRemoveContact }) {
  return <div className="fixed inset-0 z-[90] bg-[#001d2e]/45 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><form onSubmit={onSave} className="absolute inset-x-0 bottom-0 flex max-h-[94dvh] flex-col overflow-hidden rounded-t-[2rem] bg-white shadow-2xl sm:inset-y-4 sm:left-auto sm:right-4 sm:w-[min(680px,calc(100vw-2rem))] sm:max-h-none sm:rounded-[2rem]">
    <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-5 sm:px-6"><div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0043f3]">{selected ? "Relationship record" : "New relationship"}</p><h2 className="mt-2 text-2xl font-black tracking-tight">{selected ? selected.name : "Add to Rolodex"}</h2></div><button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-600"><X className="h-5 w-5" /></button></header>
    <div className="min-h-0 flex-1 space-y-7 overflow-y-auto px-5 py-5 sm:px-6">
      {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">{error}</div> : null}
      <EditorSection eyebrow="Company" title="Who should we know?"><div className="grid gap-4 sm:grid-cols-2"><Field label="Company name" required><input value={form.name} onChange={(event) => onUpdate("name", event.target.value)} /></Field><Field label="Website"><input value={form.website} onChange={(event) => onUpdate("website", event.target.value)} placeholder="https://" inputMode="url" /></Field><Field label="Relationship type"><select value={form.relationshipType} onChange={(event) => onUpdate("relationshipType", event.target.value)}>{ROLODEX_RELATIONSHIP_TYPES.map((type) => <option key={type} value={type}>{TYPE_LABELS[type]}</option>)}</select></Field><Field label="Relationship stage"><select value={form.status} onChange={(event) => onUpdate("status", event.target.value)}>{ROLODEX_STATUS_OPTIONS.map((status) => <option key={status} value={status}>{ROLODEX_STATUS_META[status].label}</option>)}</select></Field><Field label="Relationship owner"><input value={form.owner} onChange={(event) => onUpdate("owner", event.target.value)} /></Field><Field label="Province"><input value={form.province} onChange={(event) => onUpdate("province", event.target.value)} /></Field></div><div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="Priority"><select value={form.priority} onChange={(event) => onUpdate("priority", event.target.value)}><option value="normal">Normal</option><option value="high">Priority relationship</option></select></Field><Field label="Relationship strength"><select value={form.relationshipStrength} onChange={(event) => onUpdate("relationshipStrength", Number(event.target.value))}>{[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value} / 5</option>)}</select></Field></div></EditorSection>
      <EditorSection eyebrow="Fit" title="Where could we work together?"><p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Markets</p><div className="flex flex-wrap gap-2">{ROLODEX_MARKET_SEGMENTS.map((segment) => <Toggle key={segment} active={form.marketSegments.includes(segment)} onClick={() => onToggleList("marketSegments", segment)}>{segment}</Toggle>)}</div><div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="Typical project scale"><input value={form.typicalProjectScale} onChange={(event) => onUpdate("typicalProjectScale", event.target.value)} placeholder="Example: 50–500 kWp" /></Field><Field label="Service areas"><input value={form.serviceAreas.join(", ")} onChange={(event) => onUpdate("serviceAreas", event.target.value.split(",").map((item) => item.trim()).filter(Boolean))} placeholder="Gauteng, Mpumalanga" /></Field><Field label="Relevant Atlas products"><input value={form.relevantProducts.join(", ")} onChange={(event) => onUpdate("relevantProducts", event.target.value.split(",").map((item) => item.trim()).filter(Boolean))} placeholder="Atlas Solar Carports" /></Field><Field label="Relationship source"><input value={form.source} onChange={(event) => onUpdate("source", event.target.value)} placeholder="Referral, event, research" /></Field></div></EditorSection>
      <EditorSection eyebrow="People" title="Who do we speak to?"><p className="mb-4 text-sm leading-6 text-slate-500">Add whatever contact detail you have. A name can be completed later.</p><div className="space-y-4">{form.contacts.map((contact, index) => <div key={contact.id || index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-center justify-between"><p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Contact {index + 1}</p>{form.contacts.length > 1 ? <button type="button" onClick={() => onRemoveContact(index)} className="text-xs font-bold text-rose-700">Remove</button> : null}</div><div className="mt-3 grid gap-3 sm:grid-cols-2"><Field label="Name"><input value={contact.name} onChange={(event) => onUpdateContact(index, "name", event.target.value)} /></Field><Field label="Role"><input value={contact.role} onChange={(event) => onUpdateContact(index, "role", event.target.value)} /></Field><Field label="Email"><input type="email" value={contact.email} onChange={(event) => onUpdateContact(index, "email", event.target.value)} /></Field><Field label="Phone"><input type="tel" value={contact.phone} onChange={(event) => onUpdateContact(index, "phone", event.target.value)} /></Field></div></div>)}</div><button type="button" onClick={onAddContact} className="mt-3 inline-flex items-center gap-2 text-sm font-black text-[#0043f3]"><Plus className="h-4 w-4" /> Add another contact</button></EditorSection>
      <EditorSection eyebrow="Communication" title="Respect the relationship"><div className="grid gap-4 sm:grid-cols-2"><Field label="Communication permission"><select value={form.communicationPermission} onChange={(event) => onUpdate("communicationPermission", event.target.value)}>{ROLODEX_PERMISSION_OPTIONS.map((option) => <option key={option} value={option}>{PERMISSION_LABELS[option]}</option>)}</select></Field><Field label="Permission source"><input value={form.permissionSource} onChange={(event) => onUpdate("permissionSource", event.target.value)} placeholder="How permission was established" /></Field></div></EditorSection>
      <EditorSection eyebrow="Momentum" title="Make the next step obvious"><div className="grid gap-4 sm:grid-cols-2"><Field label="Last interaction"><input type="date" value={form.lastInteractionAt} onChange={(event) => onUpdate("lastInteractionAt", event.target.value)} /></Field><Field label="Next action due"><input type="date" value={form.nextActionDueAt} onChange={(event) => onUpdate("nextActionDueAt", event.target.value)} /></Field><Field label="Next action" wide><textarea rows="2" value={form.nextAction} onChange={(event) => onUpdate("nextAction", event.target.value)} placeholder="Call, meeting, introduction or proposal" /></Field><Field label="Relationship notes" wide><textarea rows="3" value={form.notes} onChange={(event) => onUpdate("notes", event.target.value)} /></Field></div></EditorSection>
    </div>
    <footer className="flex items-center justify-between gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:px-6"><p className="hidden text-xs font-semibold text-slate-400 sm:block">Relationship records remain separate from CRM leads.</p><button type="submit" disabled={saving} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0043f3] px-6 text-sm font-black text-white disabled:opacity-60 sm:w-auto"><Check className="h-4 w-4" />{saving ? "Saving..." : selected ? "Save relationship" : "Add to Rolodex"}</button></footer>
  </form></div>
}

function EditorSection({ eyebrow, title, children }) { return <section><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0043f3]">{eyebrow}</p><h3 className="mt-1 text-xl font-black tracking-tight text-slate-950">{title}</h3><div className="mt-4">{children}</div></section> }
function Field({ label, required, wide, children }) { return <label className={`block min-w-0 ${wide ? "sm:col-span-2" : ""}`}><span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">{label}{required ? " *" : ""}</span><span className="mt-2 block [&_input]:min-h-12 [&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:text-base [&_input]:outline-none [&_input:focus]:border-[#0043f3] [&_select]:min-h-12 [&_select]:w-full [&_select]:rounded-xl [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:text-base [&_select]:outline-none [&_textarea]:w-full [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-slate-200 [&_textarea]:bg-white [&_textarea]:p-3 [&_textarea]:text-base [&_textarea]:outline-none">{children}</span></label> }
function Toggle({ active, onClick, children }) { return <button type="button" onClick={onClick} className={`rounded-full border px-3 py-2 text-xs font-bold transition ${active ? "border-[#0043f3] bg-blue-50 text-[#0043f3]" : "border-slate-200 bg-white text-slate-600"}`}>{children}</button> }
