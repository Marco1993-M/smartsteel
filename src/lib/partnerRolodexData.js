export const ROLODEX_STATUS_OPTIONS = [
  "identified",
  "researched",
  "contacted",
  "conversation",
  "active_partner",
  "dormant",
]

export const ROLODEX_RELATIONSHIP_TYPES = [
  "sales_partner",
  "supplier",
  "manufacturer",
  "installer",
  "specifier",
  "engineer",
  "developer",
  "referral_partner",
  "industry_contact",
  "epc",
  "distributor",
  "consultant",
  "reseller",
  "other",
]

export const ROLODEX_MARKET_SEGMENTS = [
  "Solar",
  "Warehousing",
  "Agriculture",
  "Construction",
  "Manufacturing",
  "Residential",
  "Logistics",
  "Engineering",
  "Commercial property",
]

export const ROLODEX_PERMISSION_OPTIONS = ["unknown", "relationship_only", "marketing_allowed", "do_not_contact"]

export const ROLODEX_STATUS_META = {
  identified: { label: "Identified", className: "bg-slate-100 text-slate-700" },
  researched: { label: "Researched", className: "bg-sky-100 text-sky-800" },
  contacted: { label: "Contacted", className: "bg-amber-100 text-amber-800" },
  conversation: { label: "In conversation", className: "bg-blue-100 text-blue-800" },
  active_partner: { label: "Active partner", className: "bg-emerald-100 text-emerald-800" },
  dormant: { label: "Dormant", className: "bg-slate-200 text-slate-600" },
}

export const FALLBACK_ROLODEX_COMPANIES = [
  {
    id: "rolodex-solafi",
    name: "Solafi",
    website: "",
    relationshipType: "installer",
    status: "active_partner",
    relationshipStrength: 4,
    priority: "high",
    owner: "Marco",
    province: "",
    serviceAreas: [],
    marketSegments: ["Solar"],
    typicalProjectScale: "",
    relevantProducts: ["Atlas Solar Carports", "Atlas Solar Ground Mounts"],
    source: "Existing Smart Steel relationship",
    communicationPermission: "relationship_only",
    permissionSource: "Existing business relationship",
    lastInteractionAt: null,
    nextAction: "Capture the current relationship contacts and agree the next collaboration opportunity.",
    nextActionDueAt: null,
    notes: "Reference relationship for the Smart Steel strategic relationship profile.",
    contacts: [],
    createdAt: "2026-08-26T08:00:00.000Z",
    updatedAt: "2026-08-26T08:00:00.000Z",
  },
]

export function normalizeRolodexCompany(row) {
  return {
    id: row.id,
    name: row.name,
    website: row.website || "",
    relationshipType: row.relationship_type || "other",
    status: row.status || "identified",
    relationshipStrength: Number(row.relationship_strength) || 1,
    priority: row.priority || "normal",
    owner: row.owner || "",
    province: row.province || "",
    serviceAreas: row.service_areas || [],
    marketSegments: row.market_segments || [],
    typicalProjectScale: row.typical_project_scale || "",
    relevantProducts: row.relevant_products || [],
    source: row.source || "",
    communicationPermission: row.communication_permission || "unknown",
    permissionSource: row.permission_source || "",
    lastInteractionAt: row.last_interaction_at,
    nextAction: row.next_action || "",
    nextActionDueAt: row.next_action_due_at,
    notes: row.notes || "",
    contacts: (row.os_partner_rolodex_contacts || row.contacts || []).map((contact) => ({
      id: contact.id,
      name: contact.name,
      role: contact.role || "",
      email: contact.email || "",
      phone: contact.phone || "",
      isPrimary: Boolean(contact.is_primary ?? contact.isPrimary),
    })),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
