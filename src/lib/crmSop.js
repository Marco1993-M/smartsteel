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
      { key: "expected_close_date", label: "Expected close date captured", isDone: (lead) => Boolean(lead.expected_close_date) },
      { key: "follow_up_at", label: "Follow-up date set", isDone: (lead) => Boolean(lead.follow_up_at) },
      { key: "next_action", label: "Next action written", isDone: (lead) => Boolean(lead.next_action) },
    ],
    actions: [
      { label: "Confirm receipt", nextAction: "Confirm client received the estimate and ask if anything needs clarification.", followUpOffsetDays: 1 },
      { label: "Quote follow-up", nextAction: "Follow up on quote decision and capture expected close date.", followUpOffsetDays: 2 },
      { label: "Revise quote", nextAction: "Revise estimate based on client feedback and resend updated version.", followUpOffsetDays: 1 },
    ],
  },
  won: {
    label: "Won",
    goal: "Move from sale to handover without losing commercial or delivery details.",
    nextStep: "Confirm order/admin requirements and hand over for production or delivery.",
    checklist: [
      { key: "quote_value", label: "Final value captured", isDone: (lead) => Boolean(lead.quote_value) },
      { key: "expected_close_date", label: "Project timing captured", isDone: (lead) => Boolean(lead.expected_close_date) },
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
