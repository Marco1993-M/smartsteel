export const CRM_STAGE_SOP = {
  new: {
    label: "New lead",
    goal: "Respond quickly, qualify the request, assign ownership, and set the first follow-up.",
    nextStep: "Contact the lead and confirm what they need.",
    checklist: [
      { key: "contact", label: "Phone or email captured", isDone: (lead) => Boolean(lead.phone || lead.email) },
      { key: "lead_source", label: "Lead source captured", isDone: (lead) => Boolean(lead.lead_source) },
      { key: "product_type", label: "Product type selected", isDone: (lead) => Boolean(lead.product_type) },
      { key: "allocated_to", label: "Owner assigned", isDone: (lead) => Boolean(lead.allocated_to) },
      { key: "next_action", label: "Next action written", isDone: (lead) => Boolean(lead.next_action) },
    ],
    actions: [
      { label: "Call and qualify", nextAction: "Call client to confirm requirement, location, timeline and decision maker.", followUpOffsetDays: 0 },
      { label: "Request project info", nextAction: "Request site address, dimensions, drawings/photos and intended use.", followUpOffsetDays: 1 },
      { label: "Assign and follow up", nextAction: "Assign owner and follow up to complete missing lead details.", followUpOffsetDays: 1 },
    ],
  },
  contacted: {
    label: "Contacted",
    goal: "Collect enough information to quote accurately and avoid back-and-forth delays.",
    nextStep: "Gather missing project details and prepare the estimate.",
    checklist: [
      { key: "product_type", label: "Product type confirmed", isDone: (lead) => Boolean(lead.product_type) },
      { key: "estimate_request", label: "Requirements/dimensions captured", isDone: (lead) => Boolean(lead.estimate_request || lead.width || lead.length) },
      { key: "allocated_to", label: "Owner assigned", isDone: (lead) => Boolean(lead.allocated_to) },
      { key: "follow_up_at", label: "Follow-up date set", isDone: (lead) => Boolean(lead.follow_up_at) },
      { key: "next_action", label: "Next action written", isDone: (lead) => Boolean(lead.next_action) },
    ],
    actions: [
      { label: "Ask for missing info", nextAction: "Ask client for missing dimensions, site details, budget range and timeline.", followUpOffsetDays: 1 },
      { label: "Prepare estimate", nextAction: "Prepare estimate using confirmed requirements and send to client.", followUpOffsetDays: 1 },
      { label: "Confirm budget/timeline", nextAction: "Confirm budget, timeline and whether the client is ready to proceed.", followUpOffsetDays: 2 },
    ],
  },
  quoted: {
    label: "Quoted",
    goal: "Confirm the client received the quote and drive a clear yes/no/revision decision.",
    nextStep: "Follow up on the quote and capture the decision date.",
    checklist: [
      { key: "quote_value", label: "Quote value captured", isDone: (lead) => Boolean(lead.quote_value) },
      { key: "follow_up_at", label: "Follow-up date set", isDone: (lead) => Boolean(lead.follow_up_at) },
      { key: "next_action", label: "Next action written", isDone: (lead) => Boolean(lead.next_action) },
    ],
    actions: [
      { label: "Confirm receipt", nextAction: "Confirm client received the estimate and ask if anything needs clarification.", followUpOffsetDays: 1 },
      { label: "Quote follow-up", nextAction: "Follow up on the quote decision and confirm the next step with the client.", followUpOffsetDays: 2 },
      { label: "Revise quote", nextAction: "Revise estimate based on client feedback and resend updated version.", followUpOffsetDays: 1 },
    ],
  },
  won: {
    label: "Won",
    goal: "Move from sale to handover without losing commercial or delivery details.",
    nextStep: "Confirm order/admin requirements and hand over for production or delivery.",
    checklist: [
      { key: "quote_value", label: "Final value captured", isDone: (lead) => Boolean(lead.quote_value) },
      { key: "next_action", label: "Handover/admin action written", isDone: (lead) => Boolean(lead.next_action) },
    ],
    actions: [
      { label: "Confirm order admin", nextAction: "Confirm PO/deposit, invoice details and delivery or installation requirements.", followUpOffsetDays: 0 },
      { label: "Production handover", nextAction: "Hand project details to production with confirmed specs, dates and contact person.", followUpOffsetDays: 1 },
    ],
  },
  lost: {
    label: "Lost",
    goal: "Capture why the lead was lost so Smart Steel can learn and improve.",
    nextStep: "Record the lost reason and decide whether to nurture later.",
    checklist: [
      { key: "lost_reason", label: "Lost reason captured", isDone: (lead) => Boolean(lead.lost_reason) },
      { key: "next_action", label: "Close-out or nurture action written", isDone: (lead) => Boolean(lead.next_action) },
    ],
    actions: [
      { label: "Capture reason", nextAction: "Capture why the client did not proceed and close the lead.", followUpOffsetDays: null },
      { label: "Nurture later", nextAction: "Add nurture follow-up for future project timing or revised budget.", followUpOffsetDays: 30 },
    ],
  },
}

export const CRM_STATUS_LABELS = {
  new: "New",
  contacted: "Qualified",
  quoted: "Quoted",
  won: "Won",
  lost: "Lost",
}

export function normalizeCrmStatus(status) {
  return String(status || "new").trim().toLowerCase()
}

export function formatCrmStatusLabel(status) {
  return CRM_STATUS_LABELS[normalizeCrmStatus(status)] || CRM_STATUS_LABELS.new
}

export function getLeadSop(lead) {
  const status = normalizeCrmStatus(lead?.status)
  const stage = CRM_STAGE_SOP[status] || CRM_STAGE_SOP.new
  const checklist = stage.checklist.map((item) => ({
    ...item,
    done: item.isDone(lead || {}),
  }))
  const completed = checklist.filter((item) => item.done).length

  return {
    ...stage,
    status,
    checklist,
    completed,
    total: checklist.length,
    completionLabel: `${completed}/${checklist.length}`,
    isComplete: completed === checklist.length,
  }
}

export function getLeadStageBlockers(lead, targetStatus = lead?.status) {
  return getLeadSop({ ...(lead || {}), status: normalizeCrmStatus(targetStatus) }).checklist
    .filter((item) => !item.done)
    .map((item) => item.label)
}

export function getLeadStageValidationMessage(lead, targetStatus = lead?.status) {
  const blockers = getLeadStageBlockers(lead, targetStatus)
  if (blockers.length === 0) return null
  return `Before moving this lead to ${formatCrmStatusLabel(targetStatus)}, complete: ${blockers.join(", ")}.`
}

export function getFollowUpIsoDate(offsetDays) {
  if (offsetDays === null || offsetDays === undefined) return null
  const date = new Date()
  date.setDate(date.getDate() + offsetDays)
  date.setHours(9, 0, 0, 0)
  return date.toISOString()
}

function getLeadFreshnessDate(lead) {
  return lead?.last_activity_at || lead?.follow_up_at || lead?.updated_at || lead?.created_at || null
}

function getDaysSince(dateValue) {
  if (!dateValue) return Number.POSITIVE_INFINITY
  const diff = Date.now() - new Date(dateValue).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

function isOverdue(dateValue) {
  if (!dateValue) return false
  const date = new Date(dateValue)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)
  return date < today
}

function isFuture(dateValue) {
  if (!dateValue) return false
  const date = new Date(dateValue)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)
  return date > today
}

export function getLeadNextBestAction(lead) {
  const status = normalizeCrmStatus(lead?.status)
  const followUpState = String(lead?.client_follow_up_state || "").trim()
  const staleDays = getDaysSince(getLeadFreshnessDate(lead))
  const hasContact = Boolean(lead?.phone?.trim() || lead?.email?.trim())
  const hasOwner = Boolean(lead?.allocated_to?.trim())
  const hasNextAction = Boolean(lead?.next_action?.trim())
  const hasRequirements = Boolean(lead?.estimate_request || lead?.width || lead?.length)
  const hasQuoteValue = Boolean(String(lead?.quote_value || "").trim())
  const hasFollowUp = Boolean(lead?.follow_up_at)

  if (!hasContact) {
    return {
      title: "Capture contact info",
      reason: "Add a phone number or email address before the team can move this lead properly.",
      shortLabel: "Capture contact info",
      tone: "rose",
    }
  }

  if (!hasOwner) {
    return {
      title: "Assign an owner",
      reason: "This lead needs clear ownership before anyone can follow through consistently.",
      shortLabel: "Assign owner",
      tone: "amber",
    }
  }

  if (!hasNextAction) {
    return {
      title: "Write the next action",
      reason: "The team needs one clear next step so this lead does not drift.",
      shortLabel: "Add next action",
      tone: "amber",
    }
  }

  if (hasFollowUp && isOverdue(lead.follow_up_at)) {
    return {
      title: "Follow up today",
      reason: "The current follow-up date has already passed, so this lead needs attention now.",
      shortLabel: "Follow up today",
      tone: "rose",
    }
  }

  if (status === "new") {
    return {
      title: "Call and qualify",
      reason: "This is still a new lead, so confirm the requirement, location, and decision-maker first.",
      shortLabel: "Call and qualify",
      tone: "sky",
    }
  }

  if (status === "contacted" && !hasRequirements) {
    return {
      title: "Request missing project info",
      reason: "You still need dimensions, drawings, site photos, or intended use before quoting accurately.",
      shortLabel: "Request info",
      tone: "amber",
    }
  }

  if (status === "contacted" && hasRequirements) {
    return {
      title: "Prepare the estimate",
      reason: "There is enough project detail captured now to move this lead into pricing.",
      shortLabel: "Prepare estimate",
      tone: "sky",
    }
  }

  if (status === "quoted" && !hasQuoteValue) {
    return {
      title: "Capture the quote value",
      reason: "Quoted leads need a value so reporting and follow-up discipline stay accurate.",
      shortLabel: "Capture quote value",
      tone: "amber",
    }
  }

  if (status === "quoted" && !hasFollowUp) {
    return {
      title: "Set a quote follow-up",
      reason: "This quote is live, but there is no follow-up date protecting momentum.",
      shortLabel: "Set follow-up",
      tone: "amber",
    }
  }

  if (status === "quoted" && followUpState === "awaiting_reply" && hasFollowUp && isFuture(lead.follow_up_at)) {
    return {
      title: "No action needed today",
      reason: "The client is still within the follow-up window, so wait for the reply date before nudging again.",
      shortLabel: "Awaiting reply",
      tone: "slate",
    }
  }

  if (status === "quoted" && followUpState === "client_will_revert" && hasFollowUp && isFuture(lead.follow_up_at)) {
    return {
      title: "Hold until follow-up date",
      reason: "The client has already replied positively, so give them space until the agreed check-in date.",
      shortLabel: "Client will revert",
      tone: "sky",
    }
  }

  if (status === "quoted" && staleDays >= 5) {
    return {
      title: "Revive quote momentum",
      reason: "This quoted lead has gone quiet for several days and needs a follow-up or quick call.",
      shortLabel: "Revive quote",
      tone: "rose",
    }
  }

  if (status === "won") {
    return {
      title: "Start handover",
      reason: "Move the sale into admin, production, delivery, or installation without losing momentum.",
      shortLabel: "Start handover",
      tone: "emerald",
    }
  }

  if (status === "lost" && !lead?.lost_reason?.trim()) {
    return {
      title: "Capture the lost reason",
      reason: "You need the outcome reason so Smart Steel can learn from this lost opportunity.",
      shortLabel: "Capture lost reason",
      tone: "rose",
    }
  }

  return {
    title: "Keep the next step moving",
    reason: lead?.next_action?.trim() || "Review the lead and confirm the next commercial step.",
    shortLabel: "Review lead",
    tone: "slate",
  }
}
