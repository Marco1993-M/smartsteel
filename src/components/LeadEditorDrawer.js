"use client"

import { useState, useEffect, Fragment } from "react"
import { Dialog, Transition, Tab } from "@headlessui/react"
import { Phone, Mail, MessageSquare, Trash2, Save, ArrowLeft, FileText, Link2 } from "lucide-react"
import { supabase } from "../lib/supabase" 
import {
  formatCrmStatusLabel,
  getFollowUpIsoDate,
  getLeadSop,
  getLeadStageBlockers,
} from "../lib/crmSop"
import { format, isToday, isYesterday } from "date-fns";

const STATUS_OPTIONS = ["new", "contacted", "quoted", "won", "lost"];
const LEAD_SOURCE_OPTIONS = [
  "Website form",
  "Warehouse Builder",
  "Estimator",
  "WhatsApp",
  "Phone call",
  "Referral",
  "Google Ads",
  "Organic search",
  "Repeat client",
];
const PRODUCT_TYPE_OPTIONS = [
  "LSF Warehouse",
  "LCSS Warehouse",
  "Solar carport",
  "Solar ground mount",
  "Solar structure",
  "LSF trusses",
  "Bracketry",
  "Other",
];

function normalizeStatus(status) {
  return String(status || "new").trim().toLowerCase();
}

function formatStatusLabel(status) {
  return formatCrmStatusLabel(status);
}

function getStatusBadgeClass(status) {
  switch (normalizeStatus(status)) {
    case "won":
      return "bg-green-100 text-green-800";
    case "lost":
      return "bg-red-100 text-red-800";
    case "quoted":
      return "bg-yellow-100 text-yellow-800";
    case "contacted":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

// Pure function: only groups activities by date
function groupActivities(activities) {
  const groups = {};
  activities.forEach((activity) => {
    const date = new Date(activity.timestamp);

    let label;
    if (isToday(date)) label = "Today";
    else if (isYesterday(date)) label = "Yesterday";
    else label = format(date, "MMMM d, yyyy");

    if (!groups[label]) groups[label] = [];
    groups[label].push(activity);
  });

  return Object.entries(groups).map(([dateLabel, items]) => ({ dateLabel, items }));
}

export default function LeadEditorDrawer({ lead, onClose, onSave, onDelete, onBack, onCreateEstimate }) {
  const isNew = !lead?.id;
  const backHandler = onBack || onClose;

  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [validationErrors, setValidationErrors] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    last_name: "",
    email: "",
    phone: "",
    estimate_request: "",
    status: "new",
    allocated_to: "",
    next_action: "",
    lead_source: "",
    product_type: "",
    quote_value: "",
    expected_close_date: "",
    lost_reason: "",
    google_sheet_url: "",
    notes: "",
    ...lead
  });

  const [notes, setNotes] = useState(lead?.notes ? [lead.notes] : []);
  const leadSop = getLeadSop(formData);
  const selectedStageBlockers = getLeadStageBlockers(formData, formData.status);
  const fieldLabelClass = "mb-1 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500";
  const inputClass = "block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-400 focus:ring-0";
  const sectionClass = "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm";

  // Fetch notes and activities from Supabase
  useEffect(() => {
    if (!lead?.id) return;

    const fetchActivities = async () => {
      setLoadingActivities(true);
      try {
        const { data: notesData, error: notesError } = await supabase
          .from("lead_notes")
          .select("id, text, created_at")
          .eq("lead_id", lead.id)
          .order("created_at", { ascending: false });

        if (notesError) throw notesError;

        const { data: activitiesData, error: activitiesError } = await supabase
          .from("lead_activities")
          .select("*")
          .eq("lead_id", lead.id)
          .order("timestamp", { ascending: false });

        if (activitiesError) throw activitiesError;

        const mappedNotes = notesData.map((n) => ({
          id: n.id,
          type: "note",
          user_name: "Smart Steel",
          description: n.text,
          timestamp: n.created_at,
        }));

        setActivities([...mappedNotes, ...activitiesData]);
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setLoadingActivities(false);
      }
    };

    fetchActivities();
  }, [lead?.id]);

  // Add a new activity
  const addActivity = async ({ type, description }) => {
    if (!lead?.id) return;

    const newActivity = {
      lead_id: lead.id,
      type,
      user_name: "System",
      description,
      timestamp: new Date().toISOString(),
    };

    const tempId = Math.random();
    setActivities((prev) => [{ ...newActivity, id: tempId }, ...prev]);

    try {
      const { data, error } = await supabase
        .from("lead_activities")
        .insert([newActivity])
        .select();

      if (error) throw error;

      setActivities((prev) =>
        prev.map((a) => (a.id === tempId ? { ...a, id: data[0].id } : a))
      );
    } catch (error) {
      console.error("Error saving activity:", error);
      setActivities((prev) => prev.filter((a) => a.id !== tempId));
    }
  };

  // Reset form when lead changes
  useEffect(() => {
    setFormData({
      name: "",
      last_name: "",
      email: "",
      phone: "",
      estimate_request: "",
      status: "new",
      allocated_to: "",
      next_action: "",
      lead_source: "",
      product_type: "",
      quote_value: "",
      expected_close_date: "",
      lost_reason: "",
      google_sheet_url: "",
      notes: "",
      ...lead
    });
    setNotes(lead?.notes ? [lead.notes] : []);
    setValidationErrors({});
  }, [lead]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setValidationErrors((prev) => {
      if (!prev[field]) return prev;
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  };

  const applySopAction = (action) => {
    setFormData((prev) => ({
      ...prev,
      next_action: action.nextAction,
      follow_up_at:
        action.followUpOffsetDays === null
          ? prev.follow_up_at
          : getFollowUpIsoDate(action.followUpOffsetDays) || prev.follow_up_at,
    }));
    setValidationErrors((prev) => {
      const updated = { ...prev };
      delete updated.next_action;
      return updated;
    });
  };

  const handleQuickLogAction = async (actionKey) => {
    const quickActions = {
      called_client: {
        type: "call",
        description: `Called ${formData.name || "client"}`,
        nextAction: "Send follow-up summary and confirm outstanding project details.",
        followUpAt: getFollowUpIsoDate(1),
      },
      requested_info: {
        type: "update",
        description: `Requested additional project information from ${formData.name || "client"}`,
        nextAction: "Wait for drawings, dimensions, site photos or address from the client.",
        followUpAt: getFollowUpIsoDate(1),
      },
      sent_quote: {
        type: "email",
        description: `Sent quote to ${formData.name || "client"}`,
        nextAction: "Follow up on the quote and confirm receipt with the client.",
        followUpAt: getFollowUpIsoDate(2),
      },
      follow_tomorrow: {
        type: "follow_up",
        description: `Follow-up moved to tomorrow for ${formData.name || "client"}`,
        nextAction: formData.next_action || "Follow up with the client tomorrow.",
        followUpAt: getFollowUpIsoDate(1),
      },
    };

    const selected = quickActions[actionKey];
    if (!selected) return;

    setFormData((prev) => ({
      ...prev,
      next_action: selected.nextAction,
      follow_up_at: selected.followUpAt ?? prev.follow_up_at,
    }));

    if (lead?.id) {
      await addActivity({ type: selected.type, description: selected.description });
    }
  };

  const handleSaveClick = () => {
    const errors = {};

    if (!formData.name?.trim()) errors.name = "First name is required.";
    if (!formData.phone?.trim() && !formData.email?.trim()) {
      errors.contact = "Add either a phone number or an email address.";
    }
    if (!formData.lead_source?.trim()) {
      errors.lead_source = "Capture where the lead came from.";
    }
    if (!formData.product_type?.trim()) {
      errors.product_type = "Select the product category.";
    }
    if (!formData.allocated_to?.trim()) {
      errors.allocated_to = "Assign this lead to someone on the team.";
    }
    if (!formData.next_action?.trim()) {
      errors.next_action = "Set the next action so the team knows what happens next.";
    }
    if (normalizeStatus(formData.status) === "quoted" && !String(formData.quote_value || "").trim()) {
      errors.quote_value = "Quoted leads need a quote value.";
    }
    if (normalizeStatus(formData.status) === "lost" && !formData.lost_reason?.trim()) {
      errors.lost_reason = "Please capture why this lead was lost.";
    }

    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) return;

    onSave({ ...formData, status: normalizeStatus(formData.status) });
  };

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
            <Dialog.Panel className="flex h-full w-screen max-w-full flex-col overflow-hidden bg-slate-50 shadow-xl sm:w-[450px] sm:max-w-[450px]">
              {/* Header */}
<div className="sticky top-0 z-10 flex flex-col justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:flex-row sm:items-center sm:px-6 sm:py-4">
  <div className="flex min-w-0 items-center gap-2 sm:gap-3">
    {/* Back Button */}
    <button onClick={backHandler} className="shrink-0 rounded-full p-2 hover:bg-gray-100">
      <ArrowLeft size={20} />
    </button>

    {/* Lead Name + Status */}
    <div className="min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        Lead workspace
      </p>
      <Dialog.Title className="mt-1 flex min-w-0 flex-wrap items-center gap-2 text-lg font-semibold text-slate-900 sm:text-xl">
        {isNew ? "Add New Lead" : `${formData.name} ${formData.last_name}`}

      {/* Status Badge */}
      {!isNew && (
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadgeClass(formData.status)}`}
        >
          {formatStatusLabel(formData.status)}
        </span>
      )}
      </Dialog.Title>
    </div>
  </div>

{/* Action Buttons */}
	{!isNew && (
	  <div className="flex flex-wrap gap-2 sm:flex-nowrap">
      <button
        type="button"
        className="rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-700 hover:bg-slate-100"
        onClick={() => onCreateEstimate?.(lead)}
        title="Create estimate"
      >
        <FileText size={18} />
      </button>
	    {/* Call */}
    <button
      type="button"
      className="rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-700 hover:bg-slate-100"
      onClick={async () => {
        const description = `Called ${formData.name}`;
        addActivity({ type: "call", description });
        // Optional: open phone dialer
        window.location.href = `tel:${formData.phone}`;
      }}
    >
      <Phone size={18} />
    </button>

    {/* Email */}
    <button
      type="button"
      className="rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-700 hover:bg-slate-100"
      onClick={async () => {
        const description = `Emailed ${formData.name}`;
        addActivity({ type: "email", description });
        // Optional: open mail client
        window.location.href = `mailto:${formData.email}`;
      }}
    >
      <Mail size={18} />
    </button>

    {/* WhatsApp */}
    <button
      type="button"
      className="rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-700 hover:bg-slate-100"
      onClick={async () => {
        const description = `Messaged ${formData.name} on WhatsApp`;
        addActivity({ type: "whatsapp", description });
        // Open WhatsApp chat in new tab
        window.open(`https://wa.me/${formData.phone?.replace(/\D/g, "")}`, "_blank");
      }}
    >
      <MessageSquare size={18} />
    </button>
  </div>
)}



</div>

              {/* Scrollable Body */}
<div className="flex-1 overflow-y-auto w-full max-w-full bg-slate-50">
  <Tab.Group>
    <Tab.List className="flex overflow-x-auto border-b border-slate-200 bg-white px-2 no-scrollbar -webkit-overflow-scrolling-touch sm:px-4">
      {["Details", "Notes", "Activity"].map((tab) => (
        <Tab
          key={tab}
          className={({ selected }) =>
            `flex-shrink-0 rounded-t-xl px-4 py-3 text-sm font-medium whitespace-nowrap ${
              selected ? "border-b-2 border-red-600 text-red-600" : "text-slate-500"
            }`
          }
        >
          {tab}
        </Tab>
      ))}
    </Tab.List>
    <Tab.Panels className="space-y-4 w-full max-w-full p-0">
      {/* Details Panel */}
      <Tab.Panel className="w-full max-w-full space-y-4 p-4 sm:p-5">
        <div className="rounded-3xl border border-slate-200 bg-[linear-gradient(135deg,_#ffffff,_#f8fafc_55%,_#fff1f2)] p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                SOP next step
              </p>
              <h3 className="mt-1 text-base font-semibold text-slate-900">
                {leadSop.nextStep}
              </h3>
              <p className="mt-1 text-sm leading-5 text-slate-600">{leadSop.goal}</p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
                leadSop.isComplete
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {leadSop.completionLabel}
            </span>
          </div>

          <div className="mt-3 grid gap-2">
            {leadSop.checklist.map((item) => (
              <div key={item.key} className="flex items-center gap-2 text-sm">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
                    item.done ? "bg-emerald-100 text-emerald-700" : "bg-white text-slate-400"
                  }`}
                >
                  {item.done ? "✓" : "•"}
                </span>
                <span className={item.done ? "text-slate-400 line-through" : "text-slate-700"}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Quick next actions
            </p>
            <div className="flex flex-wrap gap-2">
              {leadSop.actions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => applySopAction(action)}
                  className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {!isNew && (
            <div className="mt-4 border-t border-slate-200 pt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                One-tap logged actions
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: "called_client", label: "Called client" },
                  { key: "requested_info", label: "Requested info" },
                  { key: "sent_quote", label: "Sent quote" },
                  { key: "follow_tomorrow", label: "Tomorrow" },
                ].map((action) => (
                  <button
                    key={action.key}
                    type="button"
                    onClick={() => handleQuickLogAction(action.key)}
                    className="rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <section className={sectionClass}>
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Client & brief</p>
            <h3 className="mt-1 text-base font-semibold text-slate-900">Who is this lead and what do they need?</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className={fieldLabelClass}>First & Last Name</label>
              <input
                type="text"
                value={formData.name || ""}
                onChange={(e) => handleChange("name", e.target.value)}
                className={inputClass}
              />
              {validationErrors.name && (
                <p className="mt-1 text-xs text-red-600">{validationErrors.name}</p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={fieldLabelClass}>Email</label>
                <input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={fieldLabelClass}>Phone</label>
                <input
                  type="tel"
                  value={formData.phone || ""}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className={inputClass}
                />
                {validationErrors.contact && (
                  <p className="mt-1 text-xs text-red-600">{validationErrors.contact}</p>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className={sectionClass}>
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Project scope</p>
            <h3 className="mt-1 text-base font-semibold text-slate-900">Capture the job details up front</h3>
          </div>
          <label className={`${fieldLabelClass} mb-2`}>Warehouse Size</label>
          <div className="flex gap-2 mb-2 flex-wrap">
            <select
              value={formData.width || ""}
              onChange={(e) => handleChange("width", e.target.value)}
              className={`${inputClass} min-w-[100px] flex-1`}
            >
              <option value="">Select Width</option>
              <option value="8">8m</option>
              <option value="10">10m</option>
              <option value="12">12m</option>
            </select>
            <select
              value={formData.length || ""}
              onChange={(e) => handleChange("length", e.target.value)}
              className={`${inputClass} min-w-[100px] flex-1`}
            >
              <option value="">Select Length</option>
              {[...Array(19)].map((_, i) => {
                const len = 5 + i * 2.5;
                return <option key={len} value={len}>{len}m</option>;
              })}
            </select>
          </div>
          <label className={`${fieldLabelClass} mb-2`}>Cladding & Installation</label>
          <div className="flex gap-2 flex-wrap">
            {["IBR", "Chromadek"].map((clad) => (
              <button
                key={clad}
                type="button"
                className={`rounded-full border px-3 py-2 text-sm font-medium ${
                  formData.cladding === clad ? "border-red-300 bg-red-50 text-red-700" : "bg-slate-100 text-slate-700"
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
                className={`rounded-full border px-3 py-2 text-sm font-medium ${
                  formData.installation === option ? "border-red-300 bg-red-50 text-red-700" : "bg-slate-100 text-slate-700"
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
            className={`${inputClass} mt-3 min-h-[110px]`}
          />
        </section>

        <section className={sectionClass}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={fieldLabelClass}>Lead Source</label>
            <select
              value={formData.lead_source || ""}
              onChange={(e) => handleChange("lead_source", e.target.value)}
              className={inputClass}
            >
              <option value="">Select source</option>
              {LEAD_SOURCE_OPTIONS.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
            {validationErrors.lead_source && (
              <p className="mt-1 text-xs text-red-600">{validationErrors.lead_source}</p>
            )}
          </div>
          <div>
            <label className={fieldLabelClass}>Product Type</label>
            <select
              value={formData.product_type || ""}
              onChange={(e) => handleChange("product_type", e.target.value)}
              className={inputClass}
            >
              <option value="">Select product</option>
              {PRODUCT_TYPE_OPTIONS.map((product) => (
                <option key={product} value={product}>
                  {product}
                </option>
              ))}
            </select>
            {validationErrors.product_type && (
              <p className="mt-1 text-xs text-red-600">{validationErrors.product_type}</p>
            )}
          </div>
        </div>
        <div>
          <label className={`${fieldLabelClass} mb-2`}>Follow-up Date</label>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="date"
              value={formData.follow_up_at ? new Date(formData.follow_up_at).toISOString().split("T")[0] : ""}
              onChange={(e) =>
                handleChange(
                  "follow_up_at",
                  e.target.value ? new Date(e.target.value).toISOString() : null
                )
              }
              className={`${inputClass} sm:w-auto`}
            />
            <div className="flex flex-wrap gap-1">
              {[
                { label: "Today", offset: 0 },
                { label: "+1 Day", offset: 1 },
                { label: "+1 Week", offset: 7 },
              ].map(({ label, offset }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() + offset);
                    handleChange("follow_up_at", d.toISOString());
                  }}
                  className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200"
                >
                  {label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleChange("follow_up_at", null)}
                className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={fieldLabelClass}>Quote Value</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.quote_value || ""}
              onChange={(e) => handleChange("quote_value", e.target.value)}
              placeholder="0.00"
              className={inputClass}
            />
            {validationErrors.quote_value && (
              <p className="mt-1 text-xs text-red-600">{validationErrors.quote_value}</p>
            )}
          </div>
          <div>
            <label className={fieldLabelClass}>Expected Close Date</label>
            <input
              type="date"
              value={
                formData.expected_close_date
                  ? new Date(formData.expected_close_date).toISOString().split("T")[0]
                  : ""
              }
              onChange={(e) =>
                handleChange(
                  "expected_close_date",
                  e.target.value ? new Date(e.target.value).toISOString() : ""
                )
              }
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label className={fieldLabelClass}>Google Sheet Link</label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="url"
              value={formData.google_sheet_url || ""}
              onChange={(e) => handleChange("google_sheet_url", e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/..."
              className={`${inputClass} flex-1`}
            />
            {formData.google_sheet_url ? (
              <a
                href={formData.google_sheet_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                <Link2 size={16} />
                Open Sheet
              </a>
            ) : null}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Link the working Google Sheet here so the team can open it directly from the CRM.
          </p>
        </div>
        <div>
          <label className={fieldLabelClass}>Next Action</label>
          <textarea
            value={formData.next_action || ""}
            onChange={(e) => handleChange("next_action", e.target.value)}
            placeholder="Example: Send revised quote, call on Thursday, request site address..."
            className={`${inputClass} min-h-[110px]`}
            rows={3}
          />
          {validationErrors.next_action && (
            <p className="mt-1 text-xs text-red-600">{validationErrors.next_action}</p>
          )}
        </div>
        <div className="mt-4">
          <label className={`${fieldLabelClass} mb-2`}>Allocated To</label>
          <div className="flex gap-2 flex-wrap">
            {["Stefan", "Niel", "Victor", "Marco"].map((member) => {
              const colors = {
                Stefan: "bg-red-200",
                Niel: "bg-blue-200",
                Victor: "bg-green-200",
                Marco: "bg-yellow-200",
              };
              return (
                <button
                  key={member}
                  type="button"
                  className={`rounded-full border px-3 py-2 text-sm font-medium ${
                    formData.allocated_to === member
                      ? `${colors[member]} border-slate-400 text-slate-900`
                      : "bg-slate-100 text-slate-700"
                  }`}
                  onClick={() => handleChange("allocated_to", formData.allocated_to === member ? "" : member)}
                >
                  {member}
                </button>
              );
            })}
          </div>
          {validationErrors.allocated_to && (
            <p className="mt-1 text-xs text-red-600">{validationErrors.allocated_to}</p>
          )}
        </div>
        <div>
          <label className={fieldLabelClass}>Status</label>
          <select
            value={normalizeStatus(formData.status)}
            onChange={(e) => handleChange("status", e.target.value)}
            className={inputClass}
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {formatStatusLabel(status)}
              </option>
            ))}
          </select>
          <div
            className={`mt-2 rounded-xl border px-3 py-3 text-sm ${
              selectedStageBlockers.length === 0
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-amber-200 bg-amber-50 text-amber-800"
            }`}
          >
            <p className="font-semibold">
              {selectedStageBlockers.length === 0
                ? `${formatStatusLabel(formData.status)} is ready.`
                : `Before moving to ${formatStatusLabel(formData.status)}:`}
            </p>
            {selectedStageBlockers.length > 0 ? (
              <ul className="mt-2 space-y-1 text-sm">
                {selectedStageBlockers.map((blocker) => (
                  <li key={blocker}>• {blocker}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-sm">All required information for this stage is captured.</p>
            )}
          </div>
        </div>
        </section>

        {normalizeStatus(formData.status) === "lost" && (
          <section className={sectionClass}>
            <label className={fieldLabelClass}>Lost Reason</label>
            <textarea
              value={formData.lost_reason || ""}
              onChange={(e) => handleChange("lost_reason", e.target.value)}
              placeholder="Example: Budget too low, went with timber, delayed project..."
              className={`${inputClass} min-h-[110px]`}
              rows={3}
            />
            {validationErrors.lost_reason && (
              <p className="mt-1 text-xs text-red-600">{validationErrors.lost_reason}</p>
            )}
          </section>
        )}
      </Tab.Panel>


{/* Notes Panel */}
<Tab.Panel className="flex h-full w-full max-w-full flex-col p-4 sm:p-5">
  {/* Sticky Add Note */}
  <div className="sticky top-0 z-10 mb-3 w-full max-w-full rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
    <textarea
      placeholder="Add a note..."
      className={`${inputClass} min-h-[96px] resize-none`}
      rows={3}
      onKeyDown={async (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          const text = e.target.value.trim();
          if (!text) return;
          if (!lead?.id) {
            alert("Please save the lead before adding notes");
            return;
          }

          const tempId = Math.random();
          const newNote = {
            id: tempId,
            text,
            created_at: new Date().toISOString(),
          };
          setNotes((prev) => [newNote, ...prev]);
          e.target.value = "";

          // Insert into notes table
          const { data, error } = await supabase
            .from("lead_notes")
            .insert([{ lead_id: lead.id, text }])
            .select();

          if (error) {
            console.error("Error adding note:", error);
            setNotes((prev) => prev.filter((n) => n.id !== tempId));
          } else if (data && data[0]) {
            setNotes((prev) =>
              prev.map((n) =>
                n.id === tempId
                  ? { ...n, id: data[0].id, created_at: data[0].created_at }
                  : n
              )
            );

            // ➕ Add to recent updates
            await supabase.from("lead_activities").insert([{
              lead_id: lead.id,
              type: "note",
              user_name: "System",
              description: `Added a note: "${text}"`,
              timestamp: new Date().toISOString(),
            }]);
          }
        }
      }}
    />
  </div>

  {/* Notes List */}
  <div className="flex-1 overflow-y-auto w-full max-w-full space-y-3">
    {notes.length === 0 ? (
      <p className="text-sm text-gray-500">
        No notes yet. Add your first note above.
      </p>
    ) : (
      notes.map((note) => (
        <div
          key={note.id}
          className="flex w-full items-start justify-between rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
        >
          <div className="flex-1">
            {note.isEditing ? (
              <textarea
                value={note.text}
                onChange={(e) =>
                  setNotes((prev) =>
                    prev.map((n) =>
                      n.id === note.id ? { ...n, text: e.target.value } : n
                    )
                  )
                }
                onBlur={async () => {
                  const updatedNote = notes.find((n) => n.id === note.id);
                  if (!updatedNote) return;
                  setNotes((prev) =>
                    prev.map((n) =>
                      n.id === note.id ? { ...n, isEditing: false } : n
                    )
                  );
                  const { error } = await supabase
                    .from("lead_notes")
                    .update({ text: updatedNote.text })
                    .eq("id", note.id);
                  if (error) console.error("Error updating note:", error);
                }}
                className={`${inputClass} resize-none`}
                autoFocus
                rows={2}
              />
            ) : (
              <p
                className="cursor-pointer break-words text-sm text-slate-700"
                onClick={() =>
                  setNotes((prev) =>
                    prev.map((n) =>
                      n.id === note.id ? { ...n, isEditing: true } : n
                    )
                  )
                }
              >
                {note.text}
              </p>
            )}
            {note.created_at && (
              <span className="mt-1 block text-xs text-slate-400">
                {new Date(note.created_at).toLocaleString()}
              </span>
            )}
          </div>
          <button
            onClick={async () => {
              const noteId = note.id;
              setNotes((prev) => prev.filter((n) => n.id !== noteId));
              const { error } = await supabase
                .from("lead_notes")
                .delete()
                .eq("id", noteId);
              if (error) {
                console.error("Error deleting note:", error);
                setNotes((prev) => [note, ...prev]);
              }
            }}
            className="ml-2 flex-shrink-0 rounded-full bg-red-50 p-2 text-red-600 hover:bg-red-100 hover:text-red-800"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))
    )}
  </div>
</Tab.Panel>

      {/* Activity Panel */}
      <Tab.Panel className="space-y-6 w-full max-w-full p-4 sm:p-5">
        {loadingActivities ? (
          <p className="text-sm text-gray-400">Loading activity…</p>
        ) : activities.length === 0 ? (
          <p className="text-sm text-gray-500">
            No activity yet. Calls, emails, and updates will appear here.
          </p>
        ) : (
          <div className="space-y-8 w-full">
            {groupActivities(
              activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            ).map((group, idx) => (
              <div key={idx} className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {group.dateLabel}
                </h3>
                <div className="space-y-6">
                  {group.items.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg">
                        {activity.type === "call" && "📞"}
                        {activity.type === "email" && "✉️"}
                        {activity.type === "note" && "📝"}
                        {activity.type === "update" && "🔄"}
                        {activity.type === "whatsapp" && "💬"}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-800">
                          <span className="font-medium">{activity.user_name}</span>{" "}
                          {activity.description}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(activity.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Tab.Panel>




                  </Tab.Panels>

                  {/* Footer */}
                  <div className="sticky bottom-0 z-10 flex flex-col-reverse gap-2 border-t bg-white p-4 sm:flex-row sm:justify-end">
                    {!isNew && (
                      <button
                        onClick={() => onDelete(lead.id)}
                        className="inline-flex items-center justify-center gap-1 rounded-lg border border-red-200 px-4 py-2 text-red-600 hover:bg-red-50 hover:text-red-800"
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    )}
                    <button
                      onClick={handleSaveClick}
                      className="inline-flex items-center justify-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
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
