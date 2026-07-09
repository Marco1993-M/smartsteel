import { ATLAS_FAMILIES, LSF_FAMILIES } from "./osProductData"

export const PLATFORM_META = {
  atlas: {
    key: "atlas",
    label: "Atlas (CFLC)",
    shortLabel: "Atlas",
    description: "Lip channel systems, products, and documents.",
  },
  lsf: {
    key: "lsf",
    label: "LSF Line",
    shortLabel: "LSF",
    description: "Light steel frame products, systems, and documents.",
  },
}

export const PRODUCT_FAMILY_STATUS_OPTIONS = ["active", "draft", "needs_review"]
export const DOCUMENT_STATUS_OPTIONS = ["draft", "needs_review", "reviewed", "issued"]
export const DOCUMENT_TYPE_OPTIONS = [
  "product_sheet",
  "estimate_template",
  "invoice_template",
  "scope_reference",
  "technical_reference",
  "installation_guide",
  "revision_record",
]
export const CATALOG_ITEM_KIND_OPTIONS = ["component", "module"]
export const CATALOG_ITEM_STATUS_OPTIONS = ["active", "draft", "needs_review"]

const FAMILY_SOURCE = {
  atlas: ATLAS_FAMILIES,
  lsf: LSF_FAMILIES,
}

const DEFAULT_DOCUMENTS = {
  atlas: [
    {
      id: "atlas-doc-1",
      platformKey: "atlas",
      title: "Atlas Warehouse Scope Reference",
      documentType: "scope_reference",
      status: "reviewed",
      revisionCode: "R1",
      owner: "Marco",
      clientVisible: true,
      productFamilyKey: "warehouses",
      productFamilyName: "Atlas Warehouses",
      reviewDueAt: null,
      lastSentAt: "2026-07-01T09:00:00.000Z",
      notes: "Use this when warehouse scope and exclusions need a consistent client-facing issue point.",
      createdAt: "2026-06-28T09:00:00.000Z",
      updatedAt: "2026-07-01T09:00:00.000Z",
    },
    {
      id: "atlas-doc-2",
      platformKey: "atlas",
      title: "Atlas Solar Structure Product Sheet",
      documentType: "product_sheet",
      status: "needs_review",
      revisionCode: "R2",
      owner: "Stefan",
      clientVisible: true,
      productFamilyKey: "solar",
      productFamilyName: "Atlas Solar Structures",
      reviewDueAt: "2026-07-15T09:00:00.000Z",
      lastSentAt: null,
      notes: "Review against current solar structure positioning before the next issue.",
      createdAt: "2026-06-27T09:00:00.000Z",
      updatedAt: "2026-07-02T09:00:00.000Z",
    },
    {
      id: "atlas-doc-3",
      platformKey: "atlas",
      title: "Atlas Truss Revision Register",
      documentType: "revision_record",
      status: "draft",
      revisionCode: "R0",
      owner: "Victor",
      clientVisible: false,
      productFamilyKey: "trusses",
      productFamilyName: "Atlas Trusses",
      reviewDueAt: "2026-07-19T09:00:00.000Z",
      lastSentAt: null,
      notes: "Capture scope changes between truss estimate revisions before client issue.",
      createdAt: "2026-07-03T09:00:00.000Z",
      updatedAt: "2026-07-03T09:00:00.000Z",
    },
  ],
  lsf: [
    {
      id: "lsf-doc-1",
      platformKey: "lsf",
      title: "LSF Warehouse System Sheet",
      documentType: "product_sheet",
      status: "issued",
      revisionCode: "R3",
      owner: "Marco",
      clientVisible: true,
      productFamilyKey: "warehouses",
      productFamilyName: "LSF Warehouses",
      reviewDueAt: null,
      lastSentAt: "2026-07-04T09:00:00.000Z",
      notes: "Current client-facing system sheet for warehouse projects.",
      createdAt: "2026-06-20T09:00:00.000Z",
      updatedAt: "2026-07-04T09:00:00.000Z",
    },
    {
      id: "lsf-doc-2",
      platformKey: "lsf",
      title: "LSF Wall System Reference",
      documentType: "technical_reference",
      status: "reviewed",
      revisionCode: "R1",
      owner: "Niel",
      clientVisible: false,
      productFamilyKey: "wall-systems",
      productFamilyName: "LSF Wall Systems",
      reviewDueAt: "2026-07-20T09:00:00.000Z",
      lastSentAt: null,
      notes: "Internal reference for wall framing assumptions and standard detailing.",
      createdAt: "2026-06-24T09:00:00.000Z",
      updatedAt: "2026-06-30T09:00:00.000Z",
    },
    {
      id: "lsf-doc-3",
      platformKey: "lsf",
      title: "LSF Module Estimate Template",
      documentType: "estimate_template",
      status: "needs_review",
      revisionCode: "R2",
      owner: "Stefan",
      clientVisible: true,
      productFamilyKey: "modules",
      productFamilyName: "LSF Modules",
      reviewDueAt: "2026-07-12T09:00:00.000Z",
      lastSentAt: "2026-06-29T09:00:00.000Z",
      notes: "Update after the next module pricing review.",
      createdAt: "2026-06-25T09:00:00.000Z",
      updatedAt: "2026-07-02T09:00:00.000Z",
    },
  ],
}

const DEFAULT_CATALOG_ITEMS = {
  atlas: {
    component: [
      {
        id: "atlas-component-1",
        platformKey: "atlas",
        kind: "component",
        category: "Primary framing",
        title: "Warehouse primary frame set",
        summary: "Main structural members used across standard Atlas warehouse families.",
        status: "active",
        owner: "Marco",
        productFamilyKey: "warehouses",
        productFamilyName: "Atlas Warehouses",
        tags: ["Columns", "Rafters", "Frame set"],
        createdAt: "2026-07-03T09:00:00.000Z",
        updatedAt: "2026-07-05T09:00:00.000Z",
      },
      {
        id: "atlas-component-2",
        platformKey: "atlas",
        kind: "component",
        category: "Secondary steel",
        title: "Roof purlin and girt pack",
        summary: "Secondary steel package for recurring roof and wall support logic.",
        status: "active",
        owner: "Stefan",
        productFamilyKey: "warehouses",
        productFamilyName: "Atlas Warehouses",
        tags: ["Purlins", "Girts", "Secondary steel"],
        createdAt: "2026-07-03T09:00:00.000Z",
        updatedAt: "2026-07-05T09:00:00.000Z",
      },
      {
        id: "atlas-component-3",
        platformKey: "atlas",
        kind: "component",
        category: "Connections and fittings",
        title: "Solar bracket support kit",
        summary: "Bracket and connection group used across Atlas solar structure scope.",
        status: "needs_review",
        owner: "Victor",
        productFamilyKey: "solar",
        productFamilyName: "Atlas Solar Structures",
        tags: ["Bracketry", "Supports", "Solar"],
        createdAt: "2026-07-04T09:00:00.000Z",
        updatedAt: "2026-07-06T09:00:00.000Z",
      },
    ],
  },
  lsf: {
    module: [
      {
        id: "lsf-module-1",
        platformKey: "lsf",
        kind: "module",
        category: "Structural shell modules",
        title: "Warehouse shell frame module",
        summary: "Repeatable framing shell used as the starting point for standard LSF warehouse scope.",
        status: "active",
        owner: "Marco",
        productFamilyKey: "warehouses",
        productFamilyName: "LSF Warehouses",
        tags: ["Warehouse shell", "Primary frame", "Repeatable"],
        createdAt: "2026-07-04T09:00:00.000Z",
        updatedAt: "2026-07-06T09:00:00.000Z",
      },
      {
        id: "lsf-module-2",
        platformKey: "lsf",
        kind: "module",
        category: "Openings and support modules",
        title: "Door opening reinforcement module",
        summary: "Reusable strengthening set for recurring opening conditions.",
        status: "draft",
        owner: "Niel",
        productFamilyKey: "wall-systems",
        productFamilyName: "LSF Wall Systems",
        tags: ["Openings", "Reinforcement", "Wall systems"],
        createdAt: "2026-07-04T09:00:00.000Z",
        updatedAt: "2026-07-06T09:00:00.000Z",
      },
      {
        id: "lsf-module-3",
        platformKey: "lsf",
        kind: "module",
        category: "Roof and truss modules",
        title: "Dual-pitch roof pack",
        summary: "Standard roof framing pack used before jobs move into custom roof review.",
        status: "needs_review",
        owner: "Stefan",
        productFamilyKey: "roof-systems",
        productFamilyName: "LSF Roof Systems",
        tags: ["Roof pack", "Dual pitch", "Trusses"],
        createdAt: "2026-07-04T09:00:00.000Z",
        updatedAt: "2026-07-06T09:00:00.000Z",
      },
    ],
  },
}

function getFocusStatus(focus) {
  if (String(focus || "").toLowerCase().includes("priority")) return "active"
  if (String(focus || "").toLowerCase().includes("growth")) return "needs_review"
  return "draft"
}

export function getFallbackProductFamilies(platformKey) {
  const families = FAMILY_SOURCE[platformKey] || []

  return families.map((family, index) => ({
    id: `${platformKey}-${family.key}`,
    platformKey,
    key: family.key,
    name: family.label,
    summary: family.summary,
    status: getFocusStatus(family.focus),
    owner: index % 2 === 0 ? "Marco" : "Stefan",
    quoteReady: index < 2,
    sortOrder: index + 1,
    sampleProducts: family.products,
    metadata: {
      focus: family.focus,
      tone: family.tone,
      sampleProducts: family.products,
    },
    createdAt: "2026-07-01T09:00:00.000Z",
    updatedAt: "2026-07-05T09:00:00.000Z",
  }))
}

export function getFallbackDocuments(platformKey) {
  return DEFAULT_DOCUMENTS[platformKey] || []
}

export function getFallbackCatalogItems(platformKey, kind) {
  return DEFAULT_CATALOG_ITEMS[platformKey]?.[kind] || []
}

export function isSchemaMissingError(error) {
  const code = String(error?.code || "")
  const message = String(error?.message || "").toLowerCase()

  return (
    code === "42P01" ||
    code === "PGRST205" ||
    message.includes("could not find the table") ||
    message.includes("relation") && message.includes("does not exist")
  )
}

export function formatStatusLabel(value) {
  return String(value || "")
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export function createRecordKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}
