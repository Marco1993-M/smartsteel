"use client"

import { useState, useEffect, useMemo, Fragment } from "react"
import { Dialog, Transition, Tab } from "@headlessui/react"
import {
  ArrowLeft,
  Building2,
  CarFront,
  Component,
  FileText,
  Link2,
  Mail,
  MessageSquare,
  MoreHorizontal,
  PanelsTopLeft,
  Phone,
  Save,
  Shapes,
  Sun,
  Trash2,
} from "lucide-react"
import { supabase } from "../lib/supabase" 
import { getOsAuthHeaders } from "../lib/osClientAuth"
import {
  formatCrmStatusLabel,
  getFollowUpIsoDate,
  getLeadNextBestAction,
  getLeadSop,
  getLeadStageBlockers,
} from "../lib/crmSop"
import {
  getOpportunitySummary,
  LEAD_SOURCE_OPTIONS,
  PRODUCT_TYPE_OPTIONS,
  TEAM_MEMBERS,
} from "../lib/crmReferenceData"
import {
  ATLAS_LENGTH_OPTIONS,
} from "../lib/atlasConfiguration"
import { ATLAS_WAREHOUSE_WIDTH_OPTIONS } from "../lib/estimates/atlasWarehouseOptions"
import {
  WAREHOUSE_LENGTH_OPTIONS,
  WAREHOUSE_WIDTH_OPTIONS,
} from "../lib/estimates/warehouseEstimate"
import { addBusinessDays, format, isToday, isYesterday } from "date-fns";

const STATUS_OPTIONS = ["new", "contacted", "quoted", "won", "lost"];
const ESTIMATE_STATUS_OPTIONS = [
  { value: "prepared", label: "Prepared" },
  { value: "sent", label: "Sent" },
  { value: "accepted", label: "Accepted" },
  { value: "declined", label: "Declined" },
]

const ATLAS_WAREHOUSE_PRODUCT_TYPES = [
  "Atlas Warehouse",
  "LCSS Warehouse",
  "LCSS warehouse",
  "CFLC Warehouse",
  "CFLC warehouse",
]
const WAREHOUSE_PRODUCT_TYPES = ["LSF Warehouse", ...ATLAS_WAREHOUSE_PRODUCT_TYPES]
const TRUSS_PRODUCT_TYPES = ["LSF trusses", "CFLC trusses"]
const SOLAR_PRODUCT_TYPES = ["Solar carport", "Solar ground mount", "Solar structure"]
const ATLAS_STEEL_FINISH_OPTIONS = [
  { value: "Mild", label: "Mild steel" },
  { value: "ZAM", label: "ZAM" },
  { value: "Galv", label: "Galvanised" },
]

const SCOPE_PRESET_OPTIONS = {
  "LSF Warehouse": [
    "Supply only",
    "Installed",
    "IBR cladding",
    "Chromadek cladding",
    "Open-sided",
    "Enclosed shell",
  ],
  "LCSS Warehouse": [
    "Supply only",
    "Installed",
    "Open-gable",
    "Sheeted-gable",
    "Galv finish",
    "Mild steel finish",
  ],
  "Atlas Warehouse": [
    "Storage warehouse",
    "Workshop",
    "Agricultural building",
    "Poultry building",
    "Commercial building",
    "Other",
  ],
  "Solar carport": [
    "Single bay",
    "Double bay",
    "Structure only",
    "Solar-ready structure",
    "Supply only",
    "Installed",
  ],
  "Solar ground mount": [
    "30 panel structure",
    "60 panel structure",
    "120 panel structure",
    "Galv finish",
    "Mild steel finish",
    "Supply only",
  ],
  "Solar structure": [
    "Structure only",
    "Solar-ready support steel",
    "Custom steel support frame",
    "Supply only",
    "Installed",
  ],
  "LSF trusses": [
    "Mono pitch",
    "Dual pitch",
    "Supply only",
    "Installed",
    "Engineering drawings",
  ],
  "CFLC trusses": [
    "Mono pitch",
    "Dual pitch",
    "Supply only",
    "Installed",
    "Engineering drawings",
  ],
  Bracketry: [
    "Standard bracket set",
    "Custom fabrication",
    "Galvanized",
    "Powder coated",
    "Supply only",
  ],
  Other: [
    "Custom steel project",
    "Site-specific scope",
    "Supply only",
    "Installed",
  ],
}

function getScopeSectionConfig(productType) {
  if (WAREHOUSE_PRODUCT_TYPES.includes(productType)) {
    return {
      title: "Capture the warehouse scope up front",
      sizeLabel: "Warehouse Size",
      widthLabel: "Select Width",
      lengthLabel: "Select Length",
      note: "Use the buttons and size selectors for the main shell scope, then add any custom notes below.",
      showWarehouseOptions: true,
      showSizeSelectors: true,
      customPlaceholder: "Custom warehouse request & notes...",
    }
  }

  if (TRUSS_PRODUCT_TYPES.includes(productType)) {
    return {
      title: "Capture the truss job scope up front",
      sizeLabel: "Truss Size",
      widthLabel: "Select Span",
      lengthLabel: "Select Building Length",
      note: "Capture the truss style, supply/install direction, and any sizing notes that will affect pricing.",
      showWarehouseOptions: false,
      showSizeSelectors: true,
      customPlaceholder: "Custom truss request, roof pitch, or site notes...",
    }
  }

  if (SOLAR_PRODUCT_TYPES.includes(productType)) {
    return {
      title: "Capture the solar structure scope up front",
      sizeLabel: "Structure Footprint",
      widthLabel: "Select Width",
      lengthLabel: "Select Length",
      note: "Capture the structure type, supply/install direction, and any panel or site notes that affect scope.",
      showWarehouseOptions: false,
      showSizeSelectors: true,
      customPlaceholder: "Panel count, layout notes, or custom solar structure request...",
    }
  }

  if (productType === "Bracketry") {
    return {
      title: "Capture the bracketry scope up front",
      sizeLabel: "",
      widthLabel: "",
      lengthLabel: "",
      note: "Capture the bracket type, finish, and fabrication notes clearly so quoting starts in the right lane.",
      showWarehouseOptions: false,
      showSizeSelectors: false,
      customPlaceholder: "Bracket type, finish, quantity, or fabrication notes...",
    }
  }

  return {
    title: "Capture the job details up front",
    sizeLabel: "",
    widthLabel: "",
    lengthLabel: "",
    note: "Use the preset scope buttons where they help, then describe the project clearly below.",
    showWarehouseOptions: false,
    showSizeSelectors: false,
    customPlaceholder: "Custom project request & notes...",
  }
}

function includeStoredOption(options, storedValue) {
  const numericValue = Number(storedValue)
  if (!Number.isFinite(numericValue) || numericValue <= 0 || options.includes(numericValue)) return options
  return [...options, numericValue].sort((a, b) => a - b)
}

function getScopeSizeOptions(productType, storedWidth, storedLength) {
  if (ATLAS_WAREHOUSE_PRODUCT_TYPES.includes(productType)) {
    return {
      widths: includeStoredOption(ATLAS_WAREHOUSE_WIDTH_OPTIONS, storedWidth),
      lengths: includeStoredOption(ATLAS_LENGTH_OPTIONS, storedLength),
    }
  }

  if (productType === "LSF Warehouse") {
    return {
      widths: includeStoredOption(WAREHOUSE_WIDTH_OPTIONS, storedWidth),
      lengths: includeStoredOption(WAREHOUSE_LENGTH_OPTIONS, storedLength),
    }
  }

  return {
    widths: includeStoredOption([3, 5, 6, 8, 10, 12, 15, 20], storedWidth),
    lengths: includeStoredOption([5, 7.5, 10, 12.5, 15, 17.5, 20, 25, 30, 40, 50, 60], storedLength),
  }
}

function normalizeSteelFinish(value) {
  const normalized = String(value || "").trim().toLowerCase()
  if (normalized.includes("mild")) return "Mild"
  if (normalized.includes("zam")) return "ZAM"
  if (normalized.includes("galv")) return "Galv"
  return ""
}

function getSteelFinishFromNotes(notes) {
  const match = String(notes || "").match(/^Steel finish:\s*(.+)$/im)
  return normalizeSteelFinish(match?.[1])
}

function setControlledNoteValue(notes, label, value) {
  const source = String(notes || "").trim()
  const controlledLine = `${label}: ${value}`
  const matcher = new RegExp(`^${label}:\\s*.*$`, "im")
  if (matcher.test(source)) return source.replace(matcher, controlledLine)
  return [source, controlledLine].filter(Boolean).join("\n")
}

function appendScopePreset(currentValue, preset) {
  const existing = String(currentValue || "").trim()
  if (!existing) return preset
  if (existing.toLowerCase().includes(preset.toLowerCase())) return existing
  return `${existing}\n• ${preset}`
}

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

function getClientFollowUpStateLabel(state) {
  switch (String(state || "").trim()) {
    case "awaiting_reply":
      return "Awaiting reply"
    case "client_will_revert":
      return "Client will be in touch"
    case "unresponsive":
      return "Unresponsive"
    default:
      return ""
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

function formatLeadCreatedAt(createdAt) {
  if (!createdAt) return "Not yet saved"
  return new Date(createdAt).toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatZar(value) {
  const parsed = Number(String(value || 0).replace(/[^0-9.-]/g, ""))
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(parsed) ? parsed : 0)
}

function normalizeEstimateStatus(status) {
  const normalized = String(status || "prepared").trim().toLowerCase()
  return normalized === "draft" ? "prepared" : normalized
}

function formatEstimateStatus(status) {
  const normalized = normalizeEstimateStatus(status)
  return normalized.charAt(0).toUpperCase() + normalized.slice(1)
}

function getEstimateStatusClass(status) {
  switch (normalizeEstimateStatus(status)) {
    case "sent":
      return "bg-sky-100 text-sky-700"
    case "accepted":
      return "bg-emerald-100 text-emerald-700"
    case "declined":
      return "bg-rose-100 text-rose-700"
    case "superseded":
      return "bg-slate-200 text-slate-600"
    default:
      return "bg-amber-100 text-amber-700"
  }
}

function buildEstimatePreviewUrl(estimateId) {
  if (!estimateId) return ""
  return `/kanban/estimates/${estimateId}`
}

function buildEstimatePdfUrl(estimateId) {
  if (!estimateId) return ""
  return `/api/estimates/${estimateId}/pdf`
}

function getBusinessFollowUpIsoDate(offsetDays = 3) {
  const nextDate = addBusinessDays(new Date(), offsetDays)
  nextDate.setHours(9, 0, 0, 0)
  return nextDate.toISOString()
}

function toTitleCase(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function normalizePersonName(value) {
  return String(value || "")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => toTitleCase(part))
    .join(" ")
}

const FOLLOW_UP_TEMPLATE_OPTIONS = [
  { key: "estimate_request_acknowledgement", label: "Acknowledge estimate request" },
  { key: "enquiry_follow_up", label: "General follow-up" },
  { key: "estimate_follow_up", label: "Estimate follow-up" },
  { key: "missing_info", label: "Request missing info" },
  { key: "quote_check_in", label: "Quote check-in" },
  { key: "reactivation", label: "Reactivation" },
]

function stripEstimateVersionSuffix(title) {
  return String(title || "").replace(/\s+V\d+$/i, "").trim()
}

function toClientFacingSystemName(value) {
  return String(value || "")
    .replace(/\bCFLC\b/gi, "Cold Formed Lipped Channel")
    .trim()
}

function getLeadFirstName(lead) {
  return normalizePersonName(lead?.name || "there") || "there"
}

function getLeadFullName(lead) {
  return normalizePersonName([lead?.name, lead?.last_name].filter(Boolean).join(" ")) || "Client"
}

function getProjectReference(lead) {
  const productType = toClientFacingSystemName(lead?.product_type)
  const estimateRequest = toClientFacingSystemName(lead?.estimate_request)

  if (productType) {
    if (/trusses/i.test(productType)) return `${productType} project`
    if (/warehouse/i.test(productType)) return `${productType} project`
    if (/solar/i.test(productType)) return `${productType} project`
    return productType
  }

  if (estimateRequest) {
    const firstChunk = estimateRequest.split("·")[0]?.trim()
    if (firstChunk) return firstChunk
    return estimateRequest
  }

  return "your project"
}

function getSuggestedFollowUpTemplate(lead) {
  const status = normalizeStatus(lead?.status)
  if (status === "quoted") return "estimate_follow_up"
  if (status === "lost") return "reactivation"
  if (!String(lead?.estimate_request || "").trim()) return "missing_info"
  return "enquiry_follow_up"
}

function buildFollowUpTemplate(templateKey, lead) {
  const firstName = getLeadFirstName(lead)
  const ownerName = String(lead?.allocated_to || "Smart Steel").trim() || "Smart Steel"
  const projectReference = getProjectReference(lead)
  const quoteValue = String(lead?.quote_value || "").trim()
    ? formatZar(lead.quote_value)
    : ""

  switch (templateKey) {
    case "estimate_request_acknowledgement":
      return {
        subject: "Smart Steel | Estimate request received",
        body: `Good day ${getLeadFullName(lead)},

Thank you for sending through your estimate request for ${projectReference}.

We have received the project information and will review the scope before preparing your estimate. If we need any additional measurements, drawings, site information, or clarification, we will contact you.

If there is anything else you would like us to consider, you are welcome to reply to this email and send it through.`,
      }
    case "estimate_follow_up":
      return {
        subject: "Following up on your Smart Steel estimate",
        body: `Hi ${firstName},

I’m just following up on the estimate we prepared for ${projectReference}${quoteValue ? `, currently at ${quoteValue}` : ""}.

If you have any questions, need an adjustment, or would like us to talk through the next step, I’d be happy to help.

If you'd like, I can revise the estimate, answer any questions, or help you with the next step. If easier, just reply with "call me" and I’ll give you a ring.`,
      }
    case "missing_info":
      return {
        subject: "A few details needed for your Smart Steel quote",
        body: `Hi ${firstName},

Thanks again for your enquiry.

To prepare the right recommendation and pricing for ${projectReference}, we still need a few project details from you.

When you have a moment, please send through any dimensions, drawings, site photos, or notes that will help us quote accurately.

As soon as we have that, we can move this forward properly.

Kind regards,
${ownerName}
Smart Steel`,
      }
    case "quote_check_in":
      return {
        subject: "Checking in on your Smart Steel quote",
        body: `Hi ${firstName},

I just wanted to check in regarding the quote we sent for ${projectReference}.

If you need anything clarified, updated, or broken down further, please let me know and I’ll help you with it.

If you'd like to keep this moving, I can help with the next step. If easier, just reply with "call me" and I’ll give you a ring.`,
      }
    case "reactivation":
      return {
        subject: "Checking in on your steel project",
        body: `Hi ${firstName},

I wanted to check in to see whether your plans for ${projectReference} are still active.

If the project is back on the table, we’d be happy to help you pick things up again and advise on the best next step.

If your requirements have changed, feel free to reply and we can update things accordingly.

Kind regards,
${ownerName}
Smart Steel`,
      }
    case "enquiry_follow_up":
    default:
      return {
        subject: "Following up on your Smart Steel enquiry",
        body: `Hi ${firstName},

I’m just following up on your enquiry about ${projectReference}.

If you’d like to move forward, need pricing, or want help choosing the right option, please reply and I’ll help you from there.

Kind regards,
${ownerName}
Smart Steel`,
      }
  }
}

function buildEstimateEmailTemplate(lead, estimate, builderSubmission) {
  const clientName = getLeadFullName(lead)
  const projectReference =
    toClientFacingSystemName(stripEstimateVersionSuffix(estimate?.title)) ||
    getProjectReference(lead)
  const atlasIdentity = `${lead?.product_type || ""} ${estimate?.product_type_display || ""} ${estimate?.title || ""}`.toLowerCase()
  const isAtlas = ["atlas", "lcss", "cflc", "lip channel", "lipped channel", "solar carport", "solar ground mount"]
    .some((term) => atlasIdentity.includes(term))
  const configuration = builderSubmission?.configuration || {}
  const summary = builderSubmission?.summary || {}
  const designReference = configuration.designReference || summary.designReference || ""
  const dimensions = configuration.width && configuration.length
    ? `${configuration.width}m x ${configuration.length}m${configuration.wallHeight ? ` x ${configuration.wallHeight}m` : ""}`
    : ""

  if (isAtlas) {
    return {
      subject: `Your Atlas project proposal${designReference ? ` | ${designReference}` : ""}`,
      body: `Good day ${clientName},

Your reviewed Atlas project proposal is ready${dimensions ? ` for the ${dimensions} configuration` : ""}.

The attached estimate outlines the proposed scope and budget based on the project information currently available. Please review the included items, exclusions, validity, and commercial terms.

If you would like to adjust the configuration, compare another option, or discuss the next step, please reply and we will help you refine the proposal.`,
    }
  }

  return {
    subject: `Your Smart Steel estimate | ${projectReference}`,
    body: `Good day ${clientName},

Please find the estimate for ${projectReference} attached.

The estimate is based on the project information currently available and outlines the proposed scope and budget.

If you would like to adjust the scope, compare an alternative option, or discuss a different approach to suit your budget or project requirements, we would be happy to revise it with you.

Once you have reviewed the estimate, please reply with any questions or let us know if you would like to discuss the next step.`,
  }
}

function getFollowUpTemplateLabel(templateKey) {
  return FOLLOW_UP_TEMPLATE_OPTIONS.find((template) => template.key === templateKey)?.label || "Follow-up"
}

function getWaitingSummaryForTemplate(templateKey, lead) {
  const projectReference = getProjectReference(lead)

  switch (templateKey) {
    case "estimate_request_acknowledgement":
      return `Prepare the estimate for ${projectReference}.`
    case "missing_info":
      return `Awaiting the client's missing project details for ${projectReference}.`
    case "quote_check_in":
      return `Awaiting the client's reply on whether they want to proceed or need revisions for ${projectReference}.`
    case "reactivation":
      return `Awaiting the client's reply on whether ${projectReference} is still active.`
    case "estimate_follow_up":
      return `Awaiting the client's review of the estimate and the next step for ${projectReference}.`
    case "enquiry_follow_up":
    default:
      return `Awaiting the client's reply regarding ${projectReference}.`
  }
}

function getGuidedLeadAction(nextBestAction, lead, latestEstimate) {
  const title = String(nextBestAction?.title || "").toLowerCase()
  const nextAction = String(lead?.next_action || "").toLowerCase()

  if (latestEstimate && /review and send estimate|send estimate/.test(nextAction)) {
    return { type: "estimate_email", label: `Review and send Estimate V${latestEstimate.version_no || 1}` }
  }
  if (/prepare the estimate/.test(title)) return { type: "estimate", label: "Open estimate builder" }
  if (/request missing project info/.test(title)) return { type: "missing_info_email", label: "Prepare information request" }
  if (/follow up|revive quote momentum/.test(title)) return { type: "follow_up_email", label: "Prepare follow-up email" }
  if (/call and qualify/.test(title)) return { type: "call", label: "Call client" }
  if (/start handover/.test(title)) return { type: "project", label: "Prepare project handoff" }
  if (/no action needed|hold until/.test(title)) return { type: "wait", label: nextBestAction.shortLabel }
  return { type: "details", label: "Review lead details" }
}

const NEW_LEAD_PRODUCT_OPTIONS = [
  { value: "LSF Warehouse", label: "LSF Warehouse", note: "Engineered warehouse", icon: Building2 },
  { value: "LCSS Warehouse", label: "Atlas Warehouse", note: "Lip channel system", icon: Building2 },
  { value: "Solar carport", label: "Solar Carport", note: "Parking and solar", icon: CarFront },
  { value: "Solar ground mount", label: "Ground Mount", note: "Open-site solar", icon: PanelsTopLeft },
  { value: "LSF trusses", label: "Steel Trusses", note: "Roof structure", icon: Shapes },
  { value: "Bracketry", label: "Bracketry", note: "Standard or custom", icon: Component },
  { value: "Other", label: "Custom Project", note: "Something different", icon: Sun },
]

const NEW_LEAD_NEXT_ACTIONS = [
  "Contact client and confirm project requirements.",
  "Request drawings, dimensions or site information.",
  "Prepare a starting estimate.",
  "Arrange a site meeting or project call.",
]

function NewLeadIntake({ formData, handleChange, validationErrors, inputClass, fieldLabelClass, onSave }) {
  const setProductType = (productType) => {
    handleChange("product_type", productType)
    if (ATLAS_WAREHOUSE_PRODUCT_TYPES.includes(productType) && !getSteelFinishFromNotes(formData.notes)) {
      handleChange("notes", setControlledNoteValue(formData.notes, "Steel finish", "ZAM"))
    }
    if (!formData.next_action) {
      handleChange("next_action", NEW_LEAD_NEXT_ACTIONS[0])
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-slate-50">
      <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-600">Fast lead intake</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Capture the opportunity, not the paperwork.</h2>
            </div>
            <p className="max-w-xs text-sm leading-5 text-slate-500">Enough detail for the next person to understand the enquiry and act immediately.</p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[0.9fr_1.35fr]">
            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white">1</span>
                <div>
                  <h3 className="font-bold text-slate-950">Who is enquiring?</h3>
                  <p className="text-xs text-slate-500">Name and one reliable contact method.</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className={fieldLabelClass}>Client name</label>
                  <input
                    autoFocus
                    type="text"
                    value={formData.name || ""}
                    onChange={(event) => handleChange("name", event.target.value)}
                    placeholder="First and last name"
                    className={inputClass}
                  />
                  {validationErrors.name ? <p className="mt-1 text-xs text-red-600">{validationErrors.name}</p> : null}
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  <div>
                    <label className={fieldLabelClass}>Phone</label>
                    <input type="tel" value={formData.phone || ""} onChange={(event) => handleChange("phone", event.target.value)} placeholder="Contact number" className={inputClass} />
                  </div>
                  <div>
                    <label className={fieldLabelClass}>Email</label>
                    <input type="email" value={formData.email || ""} onChange={(event) => handleChange("email", event.target.value)} placeholder="Email address" className={inputClass} />
                  </div>
                </div>
                {validationErrors.contact ? <p className="text-xs text-red-600">{validationErrors.contact}</p> : null}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white">2</span>
                <div>
                  <h3 className="font-bold text-slate-950">What do they need?</h3>
                  <p className="text-xs text-slate-500">Choose the closest product, then capture the brief.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {NEW_LEAD_PRODUCT_OPTIONS.map((option) => {
                  const Icon = option.icon
                  const selected = formData.product_type === option.value
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setProductType(option.value)}
                      className={`min-h-[112px] rounded-2xl border p-3 text-left transition ${selected ? "border-slate-950 bg-slate-950 text-white shadow-md" : "border-slate-200 bg-slate-50 text-slate-900 hover:border-slate-400 hover:bg-white"}`}
                    >
                      <Icon size={22} strokeWidth={1.8} className={selected ? "text-amber-300" : "text-red-600"} />
                      <p className="mt-3 text-sm font-bold leading-4">{option.label}</p>
                      <p className={`mt-1 text-[11px] leading-4 ${selected ? "text-slate-300" : "text-slate-500"}`}>{option.note}</p>
                    </button>
                  )
                })}
              </div>
              {validationErrors.product_type ? <p className="mt-2 text-xs text-red-600">{validationErrors.product_type}</p> : null}
              <div className="mt-3">
                <label className={fieldLabelClass}>Project brief</label>
                <textarea
                  value={formData.estimate_request || ""}
                  onChange={(event) => handleChange("estimate_request", event.target.value)}
                  placeholder="What is the client looking for? Include dimensions, location or timing if known."
                  rows={3}
                  className={`${inputClass} min-h-[92px] resize-none`}
                />
              </div>
              {ATLAS_WAREHOUSE_PRODUCT_TYPES.includes(formData.product_type) ? (
                <div className="mt-3">
                  <label className={fieldLabelClass}>Structural steel</label>
                  <select
                    value={getSteelFinishFromNotes(formData.notes) || "ZAM"}
                    onChange={(event) => handleChange("notes", setControlledNoteValue(formData.notes, "Steel finish", event.target.value))}
                    className={inputClass}
                  >
                    {ATLAS_STEEL_FINISH_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                  <p className="mt-1.5 text-xs text-slate-500">This selection carries into the Atlas estimate and pricing.</p>
                </div>
              ) : null}
            </section>
          </div>

          <section className="mt-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white">3</span>
              <div>
                <h3 className="font-bold text-slate-950">Route the next move</h3>
                <p className="text-xs text-slate-500">Make ownership and follow-through clear from the start.</p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className={fieldLabelClass}>Lead source</label>
                <select value={formData.lead_source || ""} onChange={(event) => handleChange("lead_source", event.target.value)} className={inputClass}>
                  <option value="">Select source</option>
                  {LEAD_SOURCE_OPTIONS.map((source) => <option key={source} value={source}>{source}</option>)}
                </select>
                {validationErrors.lead_source ? <p className="mt-1 text-xs text-red-600">{validationErrors.lead_source}</p> : null}
              </div>
              <div>
                <label className={fieldLabelClass}>Allocated to</label>
                <select value={formData.allocated_to || ""} onChange={(event) => handleChange("allocated_to", event.target.value)} className={inputClass}>
                  <option value="">Choose team member</option>
                  {TEAM_MEMBERS.map((member) => <option key={member} value={member}>{member}</option>)}
                </select>
                {validationErrors.allocated_to ? <p className="mt-1 text-xs text-red-600">{validationErrors.allocated_to}</p> : null}
              </div>
              <div>
                <label className={fieldLabelClass}>Next action</label>
                <select value={formData.next_action || ""} onChange={(event) => handleChange("next_action", event.target.value)} className={inputClass}>
                  <option value="">Choose next action</option>
                  {NEW_LEAD_NEXT_ACTIONS.map((action) => <option key={action} value={action}>{action}</option>)}
                </select>
                {validationErrors.next_action ? <p className="mt-1 text-xs text-red-600">{validationErrors.next_action}</p> : null}
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6 sm:py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
          <p className="hidden text-sm text-slate-500 sm:block">The full workspace opens after the lead is saved.</p>
          <button type="button" onClick={onSave} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 sm:w-auto">
            <Save size={16} /> Add lead
          </button>
        </div>
      </div>
    </div>
  )
}

export default function LeadEditorDrawer({
  lead,
  onClose,
  onSave,
  onDelete,
  onBack,
  onCreateEstimate,
  onCreateInvoice,
  onCreateProject,
  onEstimateStatusChange,
}) {
  const isNew = !lead?.id;
  const backHandler = onBack || onClose;

  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [savedEstimates, setSavedEstimates] = useState([]);
  const [loadingEstimates, setLoadingEstimates] = useState(false);
  const [builderSubmission, setBuilderSubmission] = useState(null)
  const [loadingBuilderSubmission, setLoadingBuilderSubmission] = useState(false)
  const [emailEvents, setEmailEvents] = useState([]);
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  const [emailTemplateKey, setEmailTemplateKey] = useState(getSuggestedFollowUpTemplate(lead));
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailComposerMode, setEmailComposerMode] = useState("follow_up");
  const [selectedEstimateEmail, setSelectedEstimateEmail] = useState(null);
  const [emailDraftOpened, setEmailDraftOpened] = useState(false);
  const [confirmingEmailSent, setConfirmingEmailSent] = useState(false);
  const [sendingBrandedProposal, setSendingBrandedProposal] = useState(false)
  const [validationErrors, setValidationErrors] = useState({});
  const [creatingProject, setCreatingProject] = useState(false);
  const [projectHandoffError, setProjectHandoffError] = useState("");
  const [updatingEstimateStatus, setUpdatingEstimateStatus] = useState(false)
  const [followUpSequence, setFollowUpSequence] = useState(null)
  const [followUpPlan, setFollowUpPlan] = useState([])
  const [loadingFollowUpSequence, setLoadingFollowUpSequence] = useState(false)
  const [cancellingFollowUps, setCancellingFollowUps] = useState(false)
  const [previewingFollowUp, setPreviewingFollowUp] = useState(false)

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
    client_follow_up_state: "",
    quote_value: "",
    lost_reason: "",
    google_sheet_url: "",
    notes: "",
    ...lead
  });

  const [notes, setNotes] = useState(lead?.notes ? [lead.notes] : []);
  const leadSop = getLeadSop(formData);
  const nextBestAction = getLeadNextBestAction(formData)
  const clientFollowUpStateLabel = getClientFollowUpStateLabel(formData.client_follow_up_state)
  const lastFollowUpEmailActivity = useMemo(() => {
    return [...activities]
      .filter(
        (activity) =>
          activity.type === "email" &&
          /Follow-up email/i.test(String(activity.description || ""))
      )
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0] || null
  }, [activities])
  const selectedStageBlockers = getLeadStageBlockers(formData, formData.status);
  const createdAtLabel = formatLeadCreatedAt(formData.created_at);
  const scopeConfig = getScopeSectionConfig(formData.product_type)
  const scopeSizeOptions = getScopeSizeOptions(formData.product_type, formData.width, formData.length)
  const scopePresetOptions = SCOPE_PRESET_OPTIONS[formData.product_type] || SCOPE_PRESET_OPTIONS.Other
  const fieldLabelClass = "mb-1 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500";
  const inputClass = "block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-400 focus:ring-0";
  const sectionClass = "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm";
  const opportunitySummary = getOpportunitySummary(formData)
  const latestEstimate = savedEstimates[0] || null
  const builderConfiguration = builderSubmission?.configuration || {}
  const selectedSteelFinish = normalizeSteelFinish(
    getSteelFinishFromNotes(formData.notes) || builderConfiguration.steelFinish
  ) || "ZAM"
  const builderSummary = builderSubmission?.summary || {}
  const builderDesignReference = builderConfiguration.designReference || builderSummary.designReference || ""
  const builderConfigurationUrl = builderConfiguration.configurationUrl || builderSummary.configurationUrl || ""
  const builderDimensions = builderConfiguration.width && builderConfiguration.length
    ? `${builderConfiguration.width}m x ${builderConfiguration.length}m${builderConfiguration.wallHeight ? ` x ${builderConfiguration.wallHeight}m` : ""}`
    : ""
  const guidedAction = getGuidedLeadAction(nextBestAction, formData, latestEstimate)
  const isUnresponsive = formData.client_follow_up_state === "unresponsive"

  const openEstimateCreator = () => {
    onCreateEstimate?.({
      ...lead,
      ...formData,
      width: formData.width || lead?.width || builderConfiguration.width || "",
      length: formData.length || lead?.length || builderConfiguration.length || "",
      wall_height:
        formData.wall_height ||
        lead?.wall_height ||
        builderConfiguration.wallHeight ||
        builderConfiguration.eaveHeight ||
        "",
      cladding:
        formData.cladding ||
        lead?.cladding ||
        builderConfiguration.sheetingProfile ||
        builderConfiguration.cladding ||
        "",
      steelFinish: selectedSteelFinish,
      builder_configuration: builderConfiguration,
    })
  }

  const createProjectFromLead = async () => {
    setCreatingProject(true)
    setProjectHandoffError("")
    try {
      await onCreateProject?.({ ...lead, ...formData })
    } catch (error) {
      setProjectHandoffError(error.message || "Could not create the project.")
      setCreatingProject(false)
    }
  }

  const markLeadUnresponsive = () => {
    setFormData((current) => ({
      ...current,
      status: "lost",
      client_follow_up_state: "unresponsive",
      lost_reason: "Client unresponsive after follow-ups",
      follow_up_at: null,
      next_action: "Archived as unresponsive. Reopen if the client returns.",
    }))
    setValidationErrors((current) => ({
      ...current,
      lost_reason: "",
      next_action: "",
    }))
  }

  const reopenUnresponsiveLead = () => {
    const hasEstimate = savedEstimates.length > 0 || Boolean(String(formData.quote_value || "").trim())
    setFormData((current) => ({
      ...current,
      status: hasEstimate ? "quoted" : "contacted",
      client_follow_up_state: "",
      lost_reason: "",
      follow_up_at: getFollowUpIsoDate(1),
      next_action: "Follow up with the client and confirm the next step.",
    }))
  }

  const confirmLatestEstimateStatus = async (event) => {
    if (!latestEstimate || !onEstimateStatusChange) return
    setUpdatingEstimateStatus(true)
    const updatedEstimate = await onEstimateStatusChange(formData, latestEstimate, event.target.value)
    if (updatedEstimate) {
      setSavedEstimates((current) => current.map((estimate) =>
        estimate.id === updatedEstimate.id ? updatedEstimate : estimate
      ))
    }
    setUpdatingEstimateStatus(false)
  }

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

  useEffect(() => {
    if (!lead?.id) {
      setEmailEvents([])
      return
    }

    const fetchEmailEvents = async () => {
      const { data, error } = await supabase
        .from("crm_email_events")
        .select("*")
        .eq("lead_id", lead.id)
        .order("sent_at", { ascending: false })

      if (error) {
        if (/crm_email_events|schema cache|does not exist/i.test(error.message || "")) {
          setEmailEvents([])
          return
        }
        console.error("Error fetching CRM email history:", error)
        return
      }

      setEmailEvents(data || [])
    }

    fetchEmailEvents()
  }, [lead?.id])

  useEffect(() => {
    if (!lead?.id) {
      setFollowUpSequence(null)
      setFollowUpPlan([])
      return
    }

    const fetchFollowUpSequence = async () => {
      setLoadingFollowUpSequence(true)
      try {
        const response = await fetch(`/api/crm/estimate-follow-ups?leadId=${encodeURIComponent(lead.id)}`, {
          cache: "no-store",
          headers: await getOsAuthHeaders(),
        })
        const result = await response.json().catch(() => ({}))
        if (response.ok) {
          setFollowUpSequence(result.sequence || null)
          setFollowUpPlan(result.plan || [])
        } else {
          console.error("Error fetching estimate follow-up sequence:", result.error)
        }
      } catch (error) {
        console.error("Error fetching estimate follow-up sequence:", error)
      } finally {
        setLoadingFollowUpSequence(false)
      }
    }

    fetchFollowUpSequence()
  }, [lead?.id])

  useEffect(() => {
    if (!lead?.id) {
      setBuilderSubmission(null)
      return
    }

    const fetchBuilderSubmission = async () => {
      setLoadingBuilderSubmission(true)
      const { data, error } = await supabase
        .from("warehouse_builder_submissions")
        .select("id, configuration, summary, created_at")
        .eq("lead_id", lead.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) {
        if (!/warehouse_builder_submissions|schema cache|does not exist/i.test(error.message || "")) {
          console.error("Error fetching warehouse builder submission:", error)
        }
        setBuilderSubmission(null)
      } else {
        setBuilderSubmission(data || null)
      }
      setLoadingBuilderSubmission(false)
    }

    fetchBuilderSubmission()
  }, [lead?.id])

  useEffect(() => {
    if (!lead?.id) {
      setSavedEstimates([])
      return
    }

    const fetchEstimates = async () => {
      setLoadingEstimates(true)
      try {
        const { data, error } = await supabase
          .from("estimates")
          .select("*")
          .eq("lead_id", lead.id)
          .order("version_no", { ascending: false })

        if (error) {
          if (/relation .*estimates.* does not exist/i.test(error.message || "")) {
            setSavedEstimates([])
            return
          }
          throw error
        }

        setSavedEstimates(data || [])
      } catch (error) {
        console.error("Error fetching estimates:", error)
        setSavedEstimates([])
      } finally {
        setLoadingEstimates(false)
      }
    }

    fetchEstimates()
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
      client_follow_up_state: "",
      quote_value: "",
      lost_reason: "",
      google_sheet_url: "",
      notes: "",
      ...lead
    });
    setNotes(lead?.notes ? [lead.notes] : []);
    const suggestedTemplate = getSuggestedFollowUpTemplate(lead)
    const template = buildFollowUpTemplate(suggestedTemplate, lead)
    setEmailTemplateKey(suggestedTemplate)
    setEmailSubject(template.subject)
    setEmailBody(template.body)
    setEmailComposerMode("follow_up")
    setSelectedEstimateEmail(null)
    setEmailDraftOpened(false)
    setConfirmingEmailSent(false)
    setShowEmailComposer(false)
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

    onSave({
      ...formData,
      name: normalizePersonName(formData.name),
      last_name: normalizePersonName(formData.last_name),
      status: normalizeStatus(formData.status),
      quote_value: isNew ? null : formData.quote_value,
    });
  };

  const applyEmailTemplate = (templateKey) => {
    const template = buildFollowUpTemplate(templateKey, formData)
    setEmailTemplateKey(templateKey)
    setEmailSubject(template.subject)
    setEmailBody(template.body)
  }

  const openEmailComposer = (templateOverride = "") => {
    if (!formData.email?.trim()) {
      alert("Add an email address for this lead first.")
      return
    }

    if (emailComposerMode !== "follow_up" || !emailSubject || !emailBody || templateOverride) {
      const suggestedTemplate = templateOverride || getSuggestedFollowUpTemplate(formData)
      const template = buildFollowUpTemplate(suggestedTemplate, formData)
      setEmailTemplateKey(suggestedTemplate)
      setEmailSubject(template.subject)
      setEmailBody(template.body)
    }

    setEmailComposerMode("follow_up")
    setSelectedEstimateEmail(null)
    setEmailDraftOpened(false)
    setShowEmailComposer(true)
  }

  const openEstimateEmailComposer = (estimate) => {
    if (!formData.email?.trim()) {
      alert("Add an email address for this lead first.")
      return
    }

    const template = buildEstimateEmailTemplate(formData, estimate, builderSubmission)
    setEmailComposerMode("estimate")
    setSelectedEstimateEmail(estimate || null)
    setEmailSubject(template.subject)
    setEmailBody(template.body)
    setEmailDraftOpened(false)
    setShowEmailComposer(true)
  }

  const handleCopyFollowUpEmail = async () => {
    const combined = `Subject: ${emailSubject}\n\n${emailBody}`
    try {
      await navigator.clipboard.writeText(combined)
      if (lead?.id) {
        await addActivity({
          type: "email",
          description:
            emailComposerMode === "estimate"
              ? `Generated and copied an estimate email for ${formData.name || "client"}.`
              : `Generated and copied a follow-up email for ${formData.name || "client"}.`,
        })
      }
    } catch (error) {
      console.error("Error copying email:", error)
      alert("Could not copy the email. Please try again.")
    }
  }

  const handleOpenEmailDraft = () => {
    const mailtoUrl = `mailto:${encodeURIComponent(formData.email)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`
    setEmailDraftOpened(true)
    window.location.href = mailtoUrl
  }

  const handleConfirmEmailSent = async () => {
    if (!lead?.id || confirmingEmailSent) return false

    setConfirmingEmailSent(true)
    const nextFollowUpAt = getBusinessFollowUpIsoDate(3)
    const isEstimateEmail = emailComposerMode === "estimate"
    const isEstimateRequestAcknowledgement =
      !isEstimateEmail && emailTemplateKey === "estimate_request_acknowledgement"
    const estimateLabel = selectedEstimateEmail?.title || "the latest estimate"
    const templateLabel = getFollowUpTemplateLabel(emailTemplateKey)
    const nextAction = isEstimateEmail
      ? `Awaiting the client's review of ${estimateLabel}. Follow up if no reply.`
      : getWaitingSummaryForTemplate(emailTemplateKey, formData)
    const updatedLead = {
      ...formData,
      status: isEstimateEmail ? "quoted" : formData.status,
      quote_value: isEstimateEmail
        ? selectedEstimateEmail?.total || formData.quote_value
        : formData.quote_value,
      client_follow_up_state: isEstimateRequestAcknowledgement
        ? formData.client_follow_up_state
        : "awaiting_reply",
      follow_up_at: isEstimateRequestAcknowledgement ? formData.follow_up_at : nextFollowUpAt,
      next_action: nextAction,
    }

    const saved = await onSave(updatedLead)
    if (!saved) {
      setConfirmingEmailSent(false)
      return false
    }

    const sentAt = new Date().toISOString()
    const senderName = formData.allocated_to || "Smart Steel"

    if (isEstimateEmail && selectedEstimateEmail?.id && !String(selectedEstimateEmail.id).startsWith("local-")) {
      let estimateUpdate = await supabase
        .from("estimates")
        .update({ status: "sent", sent_at: sentAt, sent_by_name: senderName })
        .eq("id", selectedEstimateEmail.id)

      if (estimateUpdate.error && /sent_at|sent_by_name|schema cache/i.test(estimateUpdate.error.message || "")) {
        estimateUpdate = await supabase
          .from("estimates")
          .update({ status: "sent" })
          .eq("id", selectedEstimateEmail.id)
      }

      if (estimateUpdate.error) {
        console.error("Error marking estimate as sent:", estimateUpdate.error)
      } else {
        await supabase
          .from("estimates")
          .update({ status: "superseded" })
          .eq("lead_id", lead.id)
          .neq("id", selectedEstimateEmail.id)
          .in("status", ["draft", "prepared", "sent"])
      }
    }

    const followUpNumber = emailEvents.filter((event) => event.email_type === "follow_up").length + 1
    const emailType = isEstimateEmail
      ? "estimate"
      : emailTemplateKey === "estimate_request_acknowledgement"
        ? "estimate_request_acknowledgement"
      : emailTemplateKey === "missing_info"
        ? "information_request"
        : emailTemplateKey === "reactivation"
          ? "reactivation"
          : "follow_up"

    const emailEvent = {
      estimate_id: isEstimateEmail && selectedEstimateEmail?.id && !String(selectedEstimateEmail.id).startsWith("local-")
        ? selectedEstimateEmail.id
        : null,
      lead_id: lead.id,
      estimate_version: isEstimateEmail ? Number(selectedEstimateEmail?.version_no || 0) || null : null,
      email_type: emailType,
      recipient: formData.email,
      subject: emailSubject,
      body: emailBody,
      sent_at: sentAt,
      sent_by_name: senderName,
      follow_up_number: emailType === "follow_up" ? followUpNumber : 0,
      channel: "email",
    }

    const emailEventResult = await supabase.from("crm_email_events").insert([emailEvent]).select()
    if (!emailEventResult.error && emailEventResult.data?.[0]) {
      setEmailEvents((current) => [emailEventResult.data[0], ...current])
    } else if (emailEventResult.error && !/crm_email_events|schema cache|does not exist/i.test(emailEventResult.error.message || "")) {
      console.error("Error saving CRM email event:", emailEventResult.error)
    }

    if (isEstimateEmail) {
      try {
        await fetch("/api/crm-notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventType: "estimate_sent",
            lead: updatedLead,
            estimate: {
              id: selectedEstimateEmail?.id,
              title: estimateLabel,
              version_no: selectedEstimateEmail?.version_no,
              recipient: formData.email,
            },
            actor: senderName,
            summary: `${estimateLabel} was confirmed as sent to ${formData.email}.`,
          }),
        })
      } catch (error) {
        console.error("Error sending estimate notification:", error)
      }
    }

    await supabase.from("lead_activities").insert([{
      lead_id: lead.id,
      type: "email",
      user_name: "System",
      description: `${isEstimateEmail ? `${estimateLabel} sent` : `Email sent (${templateLabel})`}. Subject: ${emailSubject}\n\nEmail copy:\n${emailBody}`,
      timestamp: new Date().toISOString(),
    }])
    setConfirmingEmailSent(false)
    setShowEmailComposer(false)
    setEmailDraftOpened(false)
    return true
  }

  const handleSendBrandedProposal = async () => {
    if (emailComposerMode !== "estimate" || !selectedEstimateEmail?.id || sendingBrandedProposal) return
    if (!emailSubject.trim() || !emailBody.trim()) {
      alert("Add a subject and email message before sending the proposal.")
      return
    }

    const approved = window.confirm(
      `Send ${selectedEstimateEmail.title || "this estimate"} to ${formData.email}?\n\nThis will email the reviewed PDF and move the lead to Quoted.`
    )
    if (!approved) return

    setSendingBrandedProposal(true)
    try {
      const response = await fetch("/api/crm/estimate-proposal", {
        method: "POST",
        headers: await getOsAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          leadId: lead.id,
          estimateId: selectedEstimateEmail.id,
          subject: emailSubject,
          body: emailBody,
        }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || "Could not send the proposal.")

      const sentAt = result.sentAt || new Date().toISOString()
      const updatedLead = {
        ...formData,
        status: "quoted",
        quote_value: selectedEstimateEmail?.total || formData.quote_value,
        next_action: `Awaiting the client's review of ${selectedEstimateEmail.title || "the estimate"}. Follow up if no reply.`,
      }
      setFormData(updatedLead)
      setSavedEstimates((current) => current.map((estimate) => estimate.id === selectedEstimateEmail.id
        ? { ...estimate, status: "sent", sent_at: sentAt, sent_by_name: "Smart Steel" }
        : estimate))
      setEmailEvents((current) => [{
        id: result.emailId || `sent-${sentAt}`,
        estimate_id: selectedEstimateEmail.id,
        estimate_version: selectedEstimateEmail.version_no,
        email_type: "estimate",
        recipient: formData.email,
        subject: emailSubject,
        body: emailBody,
        sent_at: sentAt,
        sent_by_name: "Smart Steel",
        channel: "email",
      }, ...current])
      setFollowUpSequence(result.followUpSequence || null)
      setShowEmailComposer(false)
      setEmailDraftOpened(false)

      if (result.lifecycleRecorded) {
        alert(`Proposal sent to ${formData.email}. The estimate is recorded as Sent and the lead moved to Quoted.`)
      } else {
        alert(`Proposal sent to ${formData.email} (delivery ID: ${result.emailId || "recorded"}). Some CRM records need attention: ${(result.lifecycleWarnings || []).join("; ")}`)
      }
    } catch (error) {
      console.error("Error sending branded proposal:", error)
      alert(error.message || "Could not send the proposal.")
    } finally {
      setSendingBrandedProposal(false)
    }
  }

  const cancelAutomaticFollowUps = async () => {
    if (!followUpSequence?.id || followUpSequence.status !== "active" || cancellingFollowUps) return
    const approved = window.confirm("Cancel the remaining automatic estimate follow-ups? Use this when the client has replied or the sequence is no longer appropriate.")
    if (!approved) return

    setCancellingFollowUps(true)
    try {
      const response = await fetch("/api/crm/estimate-follow-ups", {
        method: "PATCH",
        headers: await getOsAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          action: "cancel",
          sequenceId: followUpSequence.id,
          cancelledByName: formData.allocated_to || "Smart Steel",
          reason: "Client replied or the team stopped the sequence manually.",
        }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || "Could not cancel the follow-ups.")
      setFollowUpSequence(result.sequence)
      setFormData((current) => ({
        ...current,
        follow_up_at: null,
        next_action: "Client replied. Review the response and set the next appropriate action.",
      }))
    } catch (error) {
      alert(error.message || "Could not cancel the follow-ups.")
    } finally {
      setCancellingFollowUps(false)
    }
  }

  const previewFirstFollowUp = async () => {
    if (!lead?.id || previewingFollowUp) return
    const previewWindow = window.open("", "_blank")
    if (!previewWindow) {
      alert("Allow pop-ups for Smart Steel to open the email preview.")
      return
    }
    previewWindow.document.write('<main style="padding:32px;font-family:Arial,sans-serif;color:#334155;">Preparing the follow-up email preview...</main>')
    setPreviewingFollowUp(true)
    try {
      const response = await fetch(`/api/crm/estimate-follow-ups?leadId=${encodeURIComponent(lead.id)}&preview=1`, {
        cache: "no-store",
        headers: await getOsAuthHeaders(),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || "Could not prepare the email preview.")

      previewWindow.document.open()
      previewWindow.document.write(result.html)
      previewWindow.document.close()
      previewWindow.document.title = result.subject || "Follow-up email preview"
    } catch (error) {
      previewWindow.close()
      alert(error.message || "Could not prepare the email preview.")
    } finally {
      setPreviewingFollowUp(false)
    }
  }

  const handleEstimateOutcome = async (estimate, outcome) => {
    if (!estimate?.id || String(estimate.id).startsWith("local-")) {
      alert("This estimate must be saved online before its outcome can be recorded.")
      return
    }

    const now = new Date().toISOString()
    const declineReason = outcome === "declined"
      ? window.prompt("Why was this estimate declined? Leave blank if the reason is not yet known.", "")
      : ""

    if (outcome === "declined" && declineReason === null) return

    const updatePayload = outcome === "accepted"
      ? { status: "accepted", accepted_at: now }
      : { status: "declined", declined_at: now, decline_reason: declineReason || null }

    const { error } = await supabase.from("estimates").update(updatePayload).eq("id", estimate.id)
    if (error) {
      alert("Could not update the estimate outcome: " + error.message)
      return
    }

    const updatedLead = outcome === "accepted"
      ? {
          ...formData,
          status: "won",
          quote_value: estimate.total || formData.quote_value,
          client_follow_up_state: "",
          follow_up_at: null,
          next_action: "Confirm order administration and prepare the project handoff.",
        }
      : {
          ...formData,
          next_action: "Review the client's feedback and decide whether to revise the estimate or close the opportunity.",
        }

    await onSave(updatedLead)
    await supabase.from("lead_activities").insert([{
      lead_id: lead.id,
      type: "status",
      user_name: "System",
      description: `${estimate.title || `Estimate V${estimate.version_no}`} marked ${outcome}${declineReason ? `: ${declineReason}` : "."}`,
      timestamp: now,
    }])
  }

  const handleMarkWaitingOnClient = async () => {
    const nextFollowUpAt = getBusinessFollowUpIsoDate(5)
    const nextAction = "Client said they will be in touch. Follow up next week if no reply."
    const updatedLead = {
      ...formData,
      client_follow_up_state: "client_will_revert",
      follow_up_at: nextFollowUpAt,
      next_action: nextAction,
    }
    setFormData(updatedLead)
    await onSave({
      ...updatedLead,
      client_follow_up_state: "client_will_revert",
    })
  }

  const handleGuidedAction = () => {
    switch (guidedAction.type) {
      case "estimate_email":
        openEstimateEmailComposer(latestEstimate)
        break
      case "estimate":
        openEstimateCreator()
        break
      case "missing_info_email":
        openEmailComposer("missing_info")
        break
      case "follow_up_email":
        openEmailComposer(normalizeStatus(formData.status) === "quoted" ? "estimate_follow_up" : "enquiry_follow_up")
        break
      case "call":
        window.location.href = `tel:${formData.phone || ""}`
        break
      case "project":
        onCreateProject?.({ ...lead, ...formData })
        break
      case "details":
        document.getElementById("lead-editor-details")?.scrollIntoView({ behavior: "smooth", block: "start" })
        break
      default:
        break
    }
  }

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
            <Dialog.Panel className="relative flex h-dvh w-screen max-w-full flex-col overflow-hidden bg-slate-50 shadow-2xl sm:h-full sm:w-[min(96vw,960px)] sm:max-w-[960px]">
              {/* Header */}
<div className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-3 py-2.5 backdrop-blur sm:px-6 sm:py-4">
  <div className="flex min-w-0 items-center gap-2 sm:gap-3">
    {/* Back Button */}
    <button onClick={backHandler} className="shrink-0 rounded-full p-2 hover:bg-gray-100">
      <ArrowLeft size={20} />
    </button>

    {/* Lead Name + Status */}
    <div className="min-w-0">
      <p className="hidden text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 sm:block">
        Lead workspace
      </p>
      <div className="flex min-w-0 items-center gap-2 sm:mt-1 sm:flex-wrap">
        <Dialog.Title className="truncate text-base font-bold tracking-tight text-slate-950 sm:text-2xl">
          {isNew ? "Add New Lead" : `${formData.name} ${formData.last_name}`}
        </Dialog.Title>
        {!isNew && (
          <span
            className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadgeClass(formData.status)}`}
          >
            {formatStatusLabel(formData.status)}
          </span>
        )}
        {clientFollowUpStateLabel && (
          <span className="hidden shrink-0 items-center rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700 sm:inline-flex">
            {clientFollowUpStateLabel}
          </span>
        )}
      </div>
      {!isNew && (
        <p className="mt-1 hidden text-xs text-slate-500 sm:block">
          Added {createdAtLabel}
        </p>
      )}
    </div>
  </div>

{/* Action Buttons */}
	{!isNew && (
	  <div className="hidden flex-wrap gap-2 sm:flex sm:flex-nowrap">
      <button
        type="button"
        className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm transition hover:bg-slate-100"
        onClick={openEstimateCreator}
        title="Create estimate"
      >
        <FileText size={18} />
      </button>
	    {/* Call */}
    <button
      type="button"
      className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm transition hover:bg-slate-100"
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
      className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm transition hover:bg-slate-100"
      onClick={openEmailComposer}
      title="Create follow-up email"
    >
      <Mail size={18} />
    </button>

    {/* WhatsApp */}
    <button
      type="button"
      className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm transition hover:bg-slate-100"
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

              {isNew ? (
                <NewLeadIntake
                  formData={formData}
                  handleChange={handleChange}
                  validationErrors={validationErrors}
                  inputClass={inputClass}
                  fieldLabelClass={fieldLabelClass}
                  onSave={handleSaveClick}
                />
              ) : null}

              {/* Scrollable Body */}
<div className={`${isNew ? "hidden" : "min-h-0 flex-1"} w-full max-w-full overflow-y-auto overscroll-contain bg-slate-50`}>
  {!isNew ? (
    <details className="group border-b border-slate-200 bg-white sm:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-2.5 text-sm font-semibold text-slate-700">
        <span className="inline-flex items-center gap-2">
          <MoreHorizontal size={17} />
          Lead actions
        </span>
        <span className="text-xs font-medium text-slate-400 group-open:hidden">Open</span>
        <span className="hidden text-xs font-medium text-slate-400 group-open:inline">Close</span>
      </summary>
      <div className="grid grid-cols-4 gap-2 border-t border-slate-100 px-3 py-3">
        <button type="button" onClick={openEstimateCreator} className="flex min-w-0 flex-col items-center gap-1.5 rounded-xl bg-slate-100 px-2 py-2.5 text-[11px] font-semibold text-slate-700">
          <FileText size={17} />
          Estimate
        </button>
        <button
          type="button"
          onClick={() => {
            addActivity({ type: "call", description: `Called ${formData.name}` })
            window.location.href = `tel:${formData.phone}`
          }}
          className="flex min-w-0 flex-col items-center gap-1.5 rounded-xl bg-slate-100 px-2 py-2.5 text-[11px] font-semibold text-slate-700"
        >
          <Phone size={17} />
          Call
        </button>
        <button type="button" onClick={openEmailComposer} className="flex min-w-0 flex-col items-center gap-1.5 rounded-xl bg-slate-100 px-2 py-2.5 text-[11px] font-semibold text-slate-700">
          <Mail size={17} />
          Email
        </button>
        <button
          type="button"
          onClick={() => {
            addActivity({ type: "whatsapp", description: `Messaged ${formData.name} on WhatsApp` })
            window.open(`https://wa.me/${formData.phone?.replace(/\D/g, "")}`, "_blank")
          }}
          className="flex min-w-0 flex-col items-center gap-1.5 rounded-xl bg-slate-100 px-2 py-2.5 text-[11px] font-semibold text-slate-700"
        >
          <MessageSquare size={17} />
          WhatsApp
        </button>
      </div>
    </details>
  ) : null}
  <Tab.Group>
    <Tab.List className="sticky top-0 z-20 grid grid-cols-3 gap-1 border-b border-slate-200 bg-white/95 px-3 py-2.5 backdrop-blur sm:px-5">
      {["Overview", "Commercial", "Activity"].map((tab) => (
        <Tab
          key={tab}
          className={({ selected }) =>
            `rounded-xl px-3 py-2.5 text-sm font-semibold whitespace-nowrap transition ${
              selected ? "bg-slate-950 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`
          }
        >
          {tab}
        </Tab>
      ))}
    </Tab.List>
    <Tab.Panels className="mx-auto w-full max-w-5xl space-y-4 p-0">
      {/* Details Panel */}
      <Tab.Panel className="w-full max-w-full space-y-4 p-4 sm:p-5">
        <section className="rounded-3xl bg-slate-950 p-5 text-white shadow-sm sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">Best next move</p>
                <h3 className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">{nextBestAction.title}</h3>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">{nextBestAction.reason}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${leadSop.isComplete ? "bg-emerald-400/20 text-emerald-200" : "bg-amber-300/15 text-amber-200"}`}>
                  {leadSop.completionLabel}
                </span>
                <button
                  type="button"
                  disabled={guidedAction.type === "wait"}
                  onClick={handleGuidedAction}
                  className="inline-flex items-center justify-center rounded-xl bg-amber-300 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-amber-200 disabled:cursor-default disabled:bg-white/10 disabled:text-slate-400"
                >
                  {guidedAction.label}
                </button>
              </div>
            </div>
        </section>

        <details className="group rounded-2xl border border-slate-200 bg-white shadow-sm">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3.5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Lead readiness</p>
              <p className="mt-1 text-sm font-bold text-slate-900">{leadSop.nextStep}</p>
            </div>
            <span className="text-xs font-semibold text-slate-400 group-open:hidden">Review</span>
            <span className="hidden text-xs font-semibold text-slate-400 group-open:inline">Close</span>
          </summary>
          <div className="grid gap-4 border-t border-slate-100 px-4 py-4 sm:grid-cols-2">
            <div className="space-y-2.5">
              {leadSop.checklist.map((item) => (
                <div key={item.key} className="flex items-center gap-2.5 text-sm">
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${item.done ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>{item.done ? "✓" : "·"}</span>
                  <span className={item.done ? "text-slate-400 line-through" : "text-slate-700"}>{item.label}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap content-start gap-2">
              {leadSop.actions.map((action) => (
                <button key={action.label} type="button" onClick={() => applySopAction(action)} className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200">
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </details>

        <details id="lead-editor-details" className="group scroll-mt-24 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-red-600">Client</p>
              <p className="mt-1 truncate text-sm font-bold text-slate-900">{formData.email || formData.phone || "Contact details not complete"}</p>
            </div>
            <span className="text-xs font-semibold text-slate-400 group-open:hidden">Edit</span>
            <span className="hidden text-xs font-semibold text-slate-400 group-open:inline">Close</span>
          </summary>
          <div className="space-y-4 border-t border-slate-100 px-4 py-4">
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
        </details>

        {(loadingBuilderSubmission || builderSubmission) ? (
          <details className="group overflow-hidden rounded-2xl border border-[#9fc3d5] bg-[#eef6fa] shadow-sm">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#0043f3]">Builder handoff</p>
                <p className="mt-1 truncate text-sm font-bold text-[#001d2e]">{builderDimensions || builderDesignReference || "Original warehouse configuration"}</p>
              </div>
              <span className="text-xs font-semibold text-[#527083] group-open:hidden">View</span>
              <span className="hidden text-xs font-semibold text-[#527083] group-open:inline">Close</span>
            </summary>
            {loadingBuilderSubmission ? (
              <p className="border-t border-[#bdd5e1] p-4 text-sm text-slate-600">Loading the submitted configuration...</p>
            ) : (
              <div className="grid gap-3 border-t border-[#bdd5e1] p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <p className="font-semibold text-slate-950">
                    {builderDesignReference || builderSummary.productType || "Warehouse builder submission"}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {[builderDimensions, builderSummary.enclosure, builderSummary.sheetingProfile || builderConfiguration.sheetingProfile]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    Submitted {builderSubmission?.created_at ? new Date(builderSubmission.created_at).toLocaleString() : "from the warehouse builder"}
                  </p>
                </div>
                {/^https?:\/\//i.test(builderConfigurationUrl) ? (
                  <a
                    href={builderConfigurationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#78a9c1] bg-white px-4 py-2.5 text-sm font-semibold text-[#001d2e] transition hover:border-[#0043f3] hover:text-[#0043f3]"
                  >
                    <Link2 size={15} /> Open configuration
                  </a>
                ) : null}
              </div>
            )}
          </details>
        ) : null}

        <details className="group rounded-2xl border border-slate-200 bg-white shadow-sm">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-red-600">Project scope</p>
              <p className="mt-1 truncate text-sm font-bold text-slate-900">
                {[formData.product_type, formData.width && formData.length ? `${formData.width}m x ${formData.length}m` : "", formData.cladding]
                  .filter(Boolean)
                  .join(" · ") || "Scope not complete"}
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-400 group-open:hidden">Edit</span>
            <span className="hidden text-xs font-semibold text-slate-400 group-open:inline">Close</span>
          </summary>
          <div className="border-t border-slate-100 px-4 py-4">
          <p className="mb-4 text-sm leading-6 text-slate-600">{scopeConfig.note}</p>
          {scopeConfig.showSizeSelectors ? (
            <>
              <label className={`${fieldLabelClass} mb-2`}>{scopeConfig.sizeLabel}</label>
              <div className="mb-3 flex gap-2 flex-wrap">
                <select
                  value={formData.width || ""}
                  onChange={(e) => handleChange("width", e.target.value)}
                  className={`${inputClass} min-w-[100px] flex-1`}
                >
                  <option value="">{scopeConfig.widthLabel}</option>
                  {scopeSizeOptions.widths.map((width) => (
                    <option key={width} value={width}>{width}m</option>
                  ))}
                </select>
                <select
                  value={formData.length || ""}
                  onChange={(e) => handleChange("length", e.target.value)}
                  className={`${inputClass} min-w-[100px] flex-1`}
                >
                  <option value="">{scopeConfig.lengthLabel}</option>
                  {scopeSizeOptions.lengths.map((length) => (
                    <option key={length} value={length}>{length}m</option>
                  ))}
                </select>
              </div>
            </>
          ) : null}

          {scopeConfig.showWarehouseOptions ? (
            <>
              {ATLAS_WAREHOUSE_PRODUCT_TYPES.includes(formData.product_type) ? (
                <div className="mb-4">
                  <label className={`${fieldLabelClass} mb-2`}>Structural steel</label>
                  <select
                    value={selectedSteelFinish}
                    onChange={(event) => handleChange("notes", setControlledNoteValue(formData.notes, "Steel finish", event.target.value))}
                    className={inputClass}
                  >
                    {ATLAS_STEEL_FINISH_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                  <p className="mt-1.5 text-xs text-slate-500">This selection controls the Atlas material rate used when the estimate is prepared.</p>
                </div>
              ) : null}
              <label className={`${fieldLabelClass} mb-2`}>Cladding & Installation</label>
              <div className="mb-3 flex gap-2 flex-wrap">
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
            </>
          ) : null}

          <label className={`${fieldLabelClass} mb-2`}>Scope presets</label>
          <div className="mb-3 flex gap-2 flex-wrap">
            {scopePresetOptions.map((preset) => (
              <button
                key={preset}
                type="button"
                className="rounded-full border border-slate-300 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-200"
                onClick={() => handleChange("estimate_request", appendScopePreset(formData.estimate_request, preset))}
              >
                {preset}
              </button>
            ))}
          </div>
          <textarea
            placeholder={scopeConfig.customPlaceholder}
            value={formData.estimate_request || ""}
            onChange={(e) => handleChange("estimate_request", e.target.value)}
            className={`${inputClass} mt-3 min-h-[110px]`}
          />
          </div>
        </details>

        <details className="group rounded-2xl border border-slate-200 bg-white shadow-sm">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-red-600">Lead direction</p>
            <p className="mt-1 truncate text-sm font-bold text-slate-900">
              {[formatStatusLabel(formData.status), formData.allocated_to || "Unassigned", formData.lead_source]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-400 group-open:hidden">Edit</span>
          <span className="hidden text-xs font-semibold text-slate-400 group-open:inline">Close</span>
        </summary>
        <div className="border-t border-slate-100 px-4 py-4">
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
            <p className="mt-1 text-xs text-slate-500">
              This places the work into the correct Smart Steel line and working lane.
            </p>
          </div>
        </div>
        {!isNew && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={fieldLabelClass}>Estimate value</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.quote_value || ""}
                onChange={(e) => handleChange("quote_value", e.target.value)}
                placeholder="Added from the estimate"
                className={inputClass}
              />
              {validationErrors.quote_value && (
                <p className="mt-1 text-xs text-red-600">{validationErrors.quote_value}</p>
              )}
              <p className="mt-1 text-xs text-slate-500">
                Leave this blank until an estimate has been prepared.
              </p>
            </div>
          </div>
        )}
        <div className="mt-4">
          <label className={`${fieldLabelClass} mb-2`}>Allocated To</label>
          <div className="flex gap-2 flex-wrap">
            {TEAM_MEMBERS.map((member) => {
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
        <div className="mt-4">
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
        </div>
        </details>

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

      <Tab.Panel className="w-full max-w-full space-y-4 p-4 sm:p-5">
        <section className="rounded-2xl border border-slate-200 bg-[linear-gradient(135deg,_#ffffff,_#f8fafc_55%,_#eff6ff)] p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Execution workspace
              </p>
              <h3 className="mt-1 text-base font-semibold text-slate-900">Keep the next step obvious</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Follow-up timing, working links, and the immediate action all live here so the team can move faster.
              </p>
            </div>
            {!isNew && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={openEmailComposer}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  <Mail size={16} />
                  Follow-up email
                </button>
                <button
                  type="button"
                  onClick={handleMarkWaitingOnClient}
                  className="inline-flex items-center justify-center rounded-xl bg-sky-100 px-4 py-2.5 text-sm font-semibold text-sky-700 transition hover:bg-sky-200"
                >
                  Mark waiting on client
                </button>
              </div>
            )}
          </div>
        </section>

        <section className={sectionClass}>
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
        </section>

        <section className={sectionClass}>
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
        </section>

        <section className={sectionClass}>
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
        </section>

        <section className={sectionClass}>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Client response state
          </p>
          <div className="mt-3 space-y-3">
            <div className="rounded-2xl bg-slate-50 p-3">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                    clientFollowUpStateLabel ? "bg-sky-100 text-sky-700" : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {clientFollowUpStateLabel || "Active follow-up"}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-700">
                {formData.next_action || "No next step captured yet."}
              </p>
            </div>

            {loadingFollowUpSequence ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
                Checking automatic follow-ups...
              </div>
            ) : followUpSequence ? (
              <div className={`rounded-2xl border p-4 ${
                followUpSequence.status === "active"
                  ? "border-sky-200 bg-sky-50"
                  : followUpSequence.status === "completed"
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-slate-200 bg-slate-50"
              }`}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">Estimate follow-up sequence</p>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${
                        followUpSequence.status === "active"
                          ? "bg-sky-600 text-white"
                          : followUpSequence.status === "completed"
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-200 text-slate-600"
                      }`}>
                        {followUpSequence.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-700">
                      {followUpSequence.status === "active"
                        ? `Follow-up ${Number(followUpSequence.current_step || 0) + 1} of 3 is scheduled for ${new Date(followUpSequence.next_send_at).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}.`
                        : followUpSequence.status === "completed"
                          ? "All three scheduled follow-ups have been sent."
                          : `The sequence stopped after ${followUpSequence.current_step || 0} of 3 follow-ups.`}
                    </p>
                    {followUpSequence.last_response_label ? (
                      <p className="mt-2 border-l-2 border-[#0043f3] pl-3 text-sm font-semibold text-slate-900">
                        Latest client response: {followUpSequence.last_response_label}
                      </p>
                    ) : null}
                    {followUpSequence.status === "active" && followUpPlan.length ? (
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Schedule: 3 business days, 3 business days, then 5 business days. Cancel it as soon as the client replies.
                      </p>
                    ) : null}
                    {followUpSequence.cancellation_reason ? (
                      <p className="mt-1 text-xs leading-5 text-slate-500">{followUpSequence.cancellation_reason}</p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                    <button
                      type="button"
                      onClick={previewFirstFollowUp}
                      disabled={previewingFollowUp}
                      className="rounded-xl border border-[#0043f3]/25 bg-white px-4 py-2.5 text-sm font-semibold text-[#0043f3] transition hover:bg-[#eef4ff] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {previewingFollowUp ? "Opening preview..." : "Preview email 1"}
                    </button>
                    {followUpSequence.status === "active" ? (
                      <button
                        type="button"
                        onClick={cancelAutomaticFollowUps}
                        disabled={cancellingFollowUps}
                        className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {cancellingFollowUps ? "Cancelling..." : "Client replied - cancel"}
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Last follow-up email
              </p>
              {lastFollowUpEmailActivity ? (
                <>
                  <p className="mt-2 text-sm text-slate-700">
                    {lastFollowUpEmailActivity.description}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    {new Date(lastFollowUpEmailActivity.timestamp).toLocaleString()}
                  </p>
                </>
              ) : (
                <p className="mt-2 text-sm text-slate-500">
                  No follow-up email has been logged yet.
                </p>
              )}
            </div>

            <div className={`rounded-2xl border p-3 ${isUnresponsive ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-white"}`}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {isUnresponsive ? "This lead is archived as unresponsive" : "Has the client gone silent?"}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {isUnresponsive
                      ? "The full client history is preserved and the lead no longer appears in active follow-up work."
                      : "Use this after the planned follow-ups have been completed without a response."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={isUnresponsive ? reopenUnresponsiveLead : markLeadUnresponsive}
                  className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                    isUnresponsive
                      ? "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                      : "bg-slate-900 text-white hover:bg-slate-700"
                  }`}
                >
                  {isUnresponsive ? "Reopen follow-up" : "Mark unresponsive"}
                </button>
              </div>
              {!isUnresponsive ? (
                <p className="mt-2 text-[11px] text-slate-400">
                  Review the change, then select Save Changes.
                </p>
              ) : null}
            </div>
          </div>
        </section>

        <section className={sectionClass}>
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-600">Commercial timeline</p>
              <h4 className="mt-1 text-base font-semibold text-slate-900">Confirmed client emails</h4>
            </div>
            <span className="text-xs text-slate-400">{emailEvents.length} recorded</span>
          </div>
          <div className="mt-4 space-y-3">
            {emailEvents.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                Confirmed estimate and follow-up emails will appear here after the lifecycle migration is active.
              </p>
            ) : emailEvents.map((event) => (
              <div key={event.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{event.subject}</p>
                    <p className="mt-1 text-xs capitalize text-slate-500">
                      {event.email_type === "estimate"
                        ? `Estimate V${event.estimate_version || "-"}`
                        : event.email_type === "follow_up"
                          ? `Follow-up ${event.follow_up_number || ""}`
                          : String(event.email_type || "Email").replaceAll("_", " ")}
                      {` · ${event.recipient}`}
                    </p>
                  </div>
                  <p className="text-xs text-slate-400">
                    {new Date(event.sent_at || event.created_at).toLocaleString()}
                    {event.sent_by_name ? ` · ${event.sent_by_name}` : ""}
                  </p>
                </div>
                <details className="mt-3">
                  <summary className="cursor-pointer text-xs font-semibold text-slate-600">View sent copy</summary>
                  <p className="mt-3 whitespace-pre-wrap rounded-xl bg-white p-3 text-sm leading-6 text-slate-700">{event.body}</p>
                </details>
              </div>
            ))}
          </div>
        </section>
        <div className="border-t border-slate-200 pt-4">
        <section className="rounded-2xl border border-slate-200 bg-[linear-gradient(135deg,_#ffffff,_#fff7ed_55%,_#fef2f2)] p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Estimate workspace
              </p>
              <h3 className="mt-1 text-base font-semibold text-slate-900">Quote history and pricing actions</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Keep estimate versions, quote value, and quote actions in one place so pricing work stays organized.
              </p>
            </div>
            {!isNew && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={openEstimateCreator}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  <FileText size={16} />
                  Open estimate
                </button>
                <button
                  type="button"
                  onClick={() => onCreateInvoice?.({ ...lead, ...formData })}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  <FileText size={16} />
                  Create invoice
                </button>
                <button
                  type="button"
                  disabled={creatingProject}
                  onClick={createProjectFromLead}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-2.5 text-sm font-semibold text-sky-800 transition hover:bg-sky-100 disabled:opacity-50"
                >
                  <Building2 size={16} />
                  {creatingProject ? "Creating..." : "Create project"}
                </button>
              </div>
            )}
          </div>
          {projectHandoffError ? <p className="mt-3 text-sm text-rose-700">{projectHandoffError}</p> : null}

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Current quote value</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {String(formData.quote_value || "").trim() ? formatZar(formData.quote_value) : "Not captured"}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Estimate versions</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{savedEstimates.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Latest estimate</p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="min-w-0 truncate text-sm font-semibold text-slate-900">
                  {latestEstimate ? `V${latestEstimate.version_no || 1}` : "No estimate"}
                </p>
                <select
                  value={latestEstimate ? normalizeEstimateStatus(latestEstimate.status) : ""}
                  onChange={confirmLatestEstimateStatus}
                  disabled={!latestEstimate || !onEstimateStatusChange || updatingEstimateStatus}
                  className="max-w-[130px] rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-semibold text-slate-700 outline-none transition focus:border-slate-400 disabled:cursor-not-allowed disabled:text-slate-400"
                  aria-label="Latest estimate status"
                >
                  {!latestEstimate ? <option value="">Not prepared</option> : null}
                  {ESTIMATE_STATUS_OPTIONS.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
                </select>
              </div>
            </div>
          </div>
        </section>

        <section className={sectionClass}>
          <h4 className="text-base font-semibold text-slate-900">Saved estimate versions</h4>
          <p className="mt-1 text-sm text-slate-600">
            Preview the working document, open the PDF, or jump to the share view when you need the client-facing version.
          </p>

          <div className="mt-4 space-y-3">
            {loadingEstimates ? (
              <p className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                Loading estimate history...
              </p>
            ) : savedEstimates.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                No saved estimates yet. Create the first estimate to start a proper quote trail for this lead.
              </p>
            ) : (
              savedEstimates.map((estimate) => (
                <div key={estimate.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900">{estimate.title}</p>
                        <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] ${getEstimateStatusClass(estimate.status)}`}>
                          {formatEstimateStatus(estimate.status)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-600">
                        Version {estimate.version_no} · {formatZar(estimate.total || 0)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {estimate.sent_at
                          ? `Sent ${new Date(estimate.sent_at).toLocaleString()}${estimate.sent_by_name ? ` by ${estimate.sent_by_name}` : ""}`
                          : estimate.prepared_at || estimate.created_at
                            ? `Prepared ${new Date(estimate.prepared_at || estimate.created_at).toLocaleString()}`
                            : "Saved estimate"}
                      </p>
                      {estimate.decline_reason ? <p className="mt-2 text-xs text-rose-700">Reason: {estimate.decline_reason}</p> : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openEstimateEmailComposer(estimate)}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                      >
                        Email draft
                      </button>
                      <a
                        href={buildEstimatePreviewUrl(estimate.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                      >
                        Preview
                      </a>
                      <a
                        href={buildEstimatePdfUrl(estimate.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                      >
                        PDF
                      </a>
                      {estimate.share_token ? (
                        <a
                          href={`/quotes/${estimate.share_token}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                        >
                          Share view
                        </a>
                      ) : null}
                      {normalizeEstimateStatus(estimate.status) === "sent" ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleEstimateOutcome(estimate, "accepted")}
                            className="rounded-xl bg-emerald-100 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-200"
                          >
                            Mark accepted
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEstimateOutcome(estimate, "declined")}
                            className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                          >
                            Mark declined
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
        </div>
      </Tab.Panel>


{/* Notes Panel */}
<Tab.Panel className="w-full max-w-full space-y-6 p-4 sm:p-5">
  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Working record</p>
      <h3 className="mt-1 text-lg font-bold text-slate-950">Notes and activity</h3>
    </div>
    <div className="flex flex-wrap gap-1.5">
      {[
        { key: "called_client", label: "Called" },
        { key: "requested_info", label: "Requested info" },
        { key: "sent_quote", label: "Sent quote" },
        { key: "follow_tomorrow", label: "Follow tomorrow" },
      ].map((action) => (
        <button key={action.key} type="button" onClick={() => handleQuickLogAction(action.key)} className="rounded-lg bg-slate-100 px-2.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200">
          {action.label}
        </button>
      ))}
    </div>
  </div>
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
      <section className="border-t border-slate-200 pt-6">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">History</p>
            <h3 className="mt-1 text-base font-bold text-slate-950">Recorded activity</h3>
          </div>
          <span className="text-xs text-slate-400">{activities.length} entries</span>
        </div>
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
      </section>
      </Tab.Panel>




                  </Tab.Panels>

                  {showEmailComposer && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-2 sm:p-6">
                      <div className="flex max-h-[calc(100dvh-1rem)] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:max-h-[calc(100dvh-3rem)] sm:rounded-3xl">
                        <div className="shrink-0 border-b border-slate-200 px-4 py-3 sm:px-5 sm:py-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                {emailComposerMode === "estimate" ? "Estimate email" : "Follow-up email"}
                              </p>
                              <h3 className="mt-1 text-lg font-semibold text-slate-900">
                                {emailComposerMode === "estimate" ? "Review and send proposal" : "Generate, edit, and send"}
                              </h3>
                              <p className="mt-1 hidden text-sm text-slate-600 sm:block">
                                {emailComposerMode === "estimate"
                                  ? "Review the message, attach the correct estimate PDF, and confirm only after it has been sent."
                                  : "Review and edit the prepared message before opening it in your email app."}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setShowEmailComposer(false)}
                              className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
                            >
                              Close
                            </button>
                          </div>
                        </div>

                        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-5">
                          {emailComposerMode === "follow_up" ? (
                            <div>
                              <label className={fieldLabelClass}>Template</label>
                              <select
                                value={emailTemplateKey}
                                onChange={(e) => applyEmailTemplate(e.target.value)}
                                className={inputClass}
                              >
                                {FOLLOW_UP_TEMPLATE_OPTIONS.map((template) => (
                                  <option key={template.key} value={template.key}>
                                    {template.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ) : null}

                          <div>
                            <label className={fieldLabelClass}>Subject</label>
                            <input
                              type="text"
                              value={emailSubject}
                              onChange={(e) => setEmailSubject(e.target.value)}
                              className={inputClass}
                            />
                          </div>

                          <div>
                            <label className={fieldLabelClass}>Email body</label>
                            <textarea
                              value={emailBody}
                              onChange={(e) => setEmailBody(e.target.value)}
                              className={`${inputClass} min-h-[210px] resize-y sm:min-h-[260px]`}
                              rows={12}
                            />
                          </div>

                          <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
                            Sending to <span className="font-semibold text-slate-900">{formData.email || "No email set"}</span>
                            {emailComposerMode === "estimate" && selectedEstimateEmail?.title ? (
                              <p className="mt-2">
                                Estimate: <span className="font-semibold text-slate-900">{selectedEstimateEmail.title}</span>
                              </p>
                            ) : null}
                          </div>
                        </div>

                        <div className="grid shrink-0 grid-cols-2 gap-2 border-t border-slate-200 bg-white px-3 py-3 sm:flex sm:justify-end sm:px-5 sm:py-4">
                          <button
                            type="button"
                            onClick={handleCopyFollowUpEmail}
                            className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:px-4"
                          >
                            Copy email
                          </button>
                          <button
                            type="button"
                            onClick={handleOpenEmailDraft}
                            className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:px-4"
                          >
                            Open email app
                          </button>
                          <button
                            type="button"
                            disabled={confirmingEmailSent || sendingBrandedProposal}
                            onClick={handleConfirmEmailSent}
                            className={`${emailComposerMode === "estimate" ? "" : "col-span-2"} inline-flex items-center justify-center rounded-xl bg-slate-900 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50 sm:px-4`}
                          >
                            {confirmingEmailSent ? "Saving..." : "Confirm email sent"}
                          </button>
                          {emailComposerMode === "estimate" ? (
                            <button
                              type="button"
                              disabled={sendingBrandedProposal || confirmingEmailSent || String(selectedEstimateEmail?.id || "").startsWith("local-")}
                              onClick={handleSendBrandedProposal}
                              className="col-span-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[#0043f3] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0037c9] disabled:cursor-not-allowed disabled:opacity-50 sm:order-last"
                            >
                              <Mail size={16} /> {sendingBrandedProposal ? "Sending proposal..." : "Send branded proposal"}
                            </button>
                          ) : null}
                        </div>
                        <p className="hidden shrink-0 px-4 pb-4 text-xs leading-5 text-slate-500 sm:block sm:px-5">
                          {emailDraftOpened
                            ? "Your email app was opened. Confirm only after you have reviewed and sent the message."
                            : "Review the draft first. Opening the email app does not change the pipeline."}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="sticky bottom-0 z-20 border-t border-slate-200 bg-white/95 px-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] pt-2.5 backdrop-blur sm:p-4 sm:px-6">
                    <div className="mx-auto flex max-w-5xl flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="hidden sm:block">
                        {!isNew && (
                          <button
                            onClick={() => onDelete(lead.id)}
                            className="inline-flex w-full items-center justify-center gap-1 rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 sm:w-auto"
                          >
                            <Trash2 size={16} /> Delete lead
                          </button>
                        )}
                      </div>
                      <button
                        onClick={handleSaveClick}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 sm:w-auto"
                      >
                        <Save size={16} /> {isNew ? "Add lead" : "Save changes"}
                      </button>
                    </div>
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
