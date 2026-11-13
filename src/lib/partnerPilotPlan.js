export const PILOT_STAGES = {
  preparing: "Preparing",
  ready: "Ready to launch",
  live: "Live",
}

export const PILOT_CHECKLIST = {
  contact: "Confirm branch contact and rollout owner",
  access: "Test salesperson sign-in and opportunity creation",
  pricing: "Confirm Atlas range and pricing are available",
  workflow: "Walk through quoting and order submission",
  promotion: "Agree how the branch will introduce Atlas",
}

export const PILOT_CONVERSATION = [
  ["demand", "Local demand", "Who is likely to buy first, and what are they looking to build?"],
  ["marketing", "Marketing", "Where do local farmers go for advice? Which channel does the branch already use, and what should we try first?"],
  ["display", "Demo or display", "What would customers need to see in person before taking the next step?"],
  ["staff", "Staff readiness", "Who will introduce Atlas, and what do they need to explain it confidently?"],
  ["handoff", "Enquiry handoff", "Who captures the enquiry, who follows up, and how quickly?"],
  ["review", "Results and lessons", "What did we try, what enquiries and quotes came from it, and what should other branches repeat?"],
]

export function normalizePilotPlan(plan = {}) {
  const clean = (value, max) => typeof value === "string" ? value.trim().slice(0, max) : ""
  const date = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value || "") &&
    Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value ? value : ""
  return {
    stage: Object.hasOwn(PILOT_STAGES, plan.stage) ? plan.stage : "preparing",
    checks: Array.isArray(plan.checks) ? Object.keys(PILOT_CHECKLIST).filter(key => plan.checks.includes(key)) : [],
    owner: clean(plan.owner, 120),
    nextAction: clean(plan.nextAction, 300),
    dueDate: date(plan.dueDate),
    launchDate: date(plan.launchDate),
    reviewDate: date(plan.reviewDate),
    conversation: Object.fromEntries(PILOT_CONVERSATION.map(([key]) => [key, clean(plan.conversation?.[key], 2000)])),
    notes: clean(plan.notes, 4000),
  }
}
