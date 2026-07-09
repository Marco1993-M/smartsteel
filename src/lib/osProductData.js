export const ATLAS_FAMILIES = [
  {
    key: "warehouses",
    label: "Atlas Warehouses",
    summary: "Lip channel warehouse systems for practical commercial, agricultural, and storage projects.",
    products: ["Warehouse kits", "Engineered warehouse structures", "Self-build warehouse systems"],
    focus: "Priority family",
    tone: "border-sky-200 bg-sky-50",
  },
  {
    key: "carports",
    label: "Atlas Carports",
    summary: "Vehicle cover structures for residential, commercial, and mixed-use parking applications.",
    products: ["Single carports", "Double carports", "Multi-bay layouts"],
    focus: "Commercial family",
    tone: "border-amber-200 bg-amber-50",
  },
  {
    key: "solar",
    label: "Atlas Solar Structures",
    summary: "Support structures for solar carports and solar ground-mount layouts using Atlas components.",
    products: ["Solar carports", "Ground mounts", "Panel support structures"],
    focus: "Growth family",
    tone: "border-emerald-200 bg-emerald-50",
  },
  {
    key: "trusses",
    label: "Atlas Trusses",
    summary: "Lip channel truss systems for practical roof support across agricultural and light commercial use.",
    products: ["Mono pitch trusses", "Dual pitch trusses", "Custom truss layouts"],
    focus: "Support family",
    tone: "border-rose-200 bg-rose-50",
  },
  {
    key: "bracketry",
    label: "Atlas Bracketry",
    summary: "Fabricated brackets, fittings, and support parts that complete Atlas system delivery.",
    products: ["Bracket sets", "Connection hardware", "Project-specific fittings"],
    focus: "Fabrication family",
    tone: "border-slate-200 bg-slate-100",
  },
]

export const ATLAS_MODULES = [
  {
    key: "products",
    label: "Products",
    description: "Define the working product list and keep naming consistent across the OS.",
    status: "Ready to build",
  },
  {
    key: "components",
    label: "Components",
    description: "Track the base Atlas parts used across warehouses, solar structures, trusses, and bracketry.",
    status: "Ready to build",
  },
  {
    key: "bom",
    label: "BOM",
    description: "Map product defaults into bill-of-material logic so quotes become more structured.",
    status: "Next after components",
  },
  {
    key: "pricing",
    label: "Pricing",
    description: "Centralize rates, inclusions, and product logic instead of scattering it across screens.",
    status: "Next after BOM",
  },
  {
    key: "rules",
    label: "Rules",
    description: "Capture the commercial rules that decide what belongs in scope, what changes pricing, and what needs review.",
    status: "Ready to build",
  },
  {
    key: "engineering",
    label: "Engineering",
    description: "Group design assumptions, standard details, and reference rules in one place.",
    status: "Ready to build",
  },
  {
    key: "documents",
    label: "Documents",
    description: "Keep product sheets, references, and revision-linked documents attached to the line.",
    status: "Ready to build",
  },
]

export const ATLAS_WORKSPACE_PRIORITIES = [
  "Standardize Atlas product families and names so quotes stop drifting.",
  "Introduce reusable component and BOM structure for the first commercially active families.",
  "Pull pricing logic into one Atlas workspace instead of leaving it spread across estimators and pages.",
]

export const ATLAS_NAV_ITEMS = [
  { key: "overview", label: "Overview", href: "/os/atlas" },
  { key: "products", label: "Products", href: "/os/atlas/products" },
  { key: "components", label: "Components", href: "/os/atlas/components" },
  { key: "bom", label: "BOM", href: "/os/atlas/bom" },
  { key: "pricing", label: "Pricing", href: "/os/atlas/pricing" },
  { key: "rules", label: "Rules", href: "/os/atlas/rules" },
  { key: "engineering", label: "Engineering", href: "/os/atlas/engineering" },
  { key: "documents", label: "Documents", href: "/os/atlas/documents" },
]

export const ATLAS_PRODUCT_RULES = [
  "Use one stable product name per family so CRM, quoting, and documents all match.",
  "Group Atlas products by practical family first, then by model or configuration depth second.",
  "Keep warehouse, carport, solar, truss, and bracketry logic separate enough to avoid pricing drift.",
]

export const ATLAS_COMPONENT_GROUPS = [
  {
    key: "primary-framing",
    label: "Primary framing",
    items: ["Columns", "Rafters", "Main structural members"],
  },
  {
    key: "secondary-steel",
    label: "Secondary steel",
    items: ["Purlins", "Girts", "Bracing members"],
  },
  {
    key: "cladding-accessories",
    label: "Cladding and accessories",
    items: ["Roof sheeting", "Wall cladding", "Flashings and closures"],
  },
  {
    key: "connections",
    label: "Connections and fittings",
    items: ["Base plates", "Brackets", "Bolts and fixings"],
  },
]

export const ATLAS_BOM_WORKFLOWS = [
  {
    key: "warehouse-kits",
    label: "Atlas warehouse kits",
    goal: "Turn warehouse enquiries into a repeatable BOM path instead of rebuilding scope from scratch each time.",
    stages: ["Frame family", "Bay layout", "Roof and wall finish", "Openings", "Accessories and fixings"],
  },
  {
    key: "carports",
    label: "Atlas carports",
    goal: "Keep single-bay, double-bay, and multi-bay parking structures on one practical BOM structure.",
    stages: ["Footprint", "Column and rafter set", "Roof finish", "Bracing", "Fixings and closures"],
  },
  {
    key: "solar-structures",
    label: "Atlas solar structures",
    goal: "Separate support structure logic from panel supply so estimates stay commercially accurate.",
    stages: ["Panel-count layout", "Primary steel", "Brackets and supports", "Foundations", "Project-specific extras"],
  },
  {
    key: "trusses",
    label: "Atlas trusses",
    goal: "Standardize mono-pitch and dual-pitch truss take-offs before pricing and documents are finalized.",
    stages: ["Span and pitch", "Truss members", "Bracing", "Connection plates", "Delivery packs"],
  },
]

export const ATLAS_BOM_PRIORITIES = [
  "Start with warehouse kits and solar structures because they are already commercially active and repetitive.",
  "Use one BOM structure per family so quoting, pricing, and future documents all point to the same product logic.",
  "Separate standard parts from project-specific extras so manual edits become exceptions instead of the default workflow.",
]

export const ATLAS_BOM_RULES = [
  "Every Atlas BOM should start from a product family, not from free-typed estimate notes.",
  "Primary steel, secondary steel, cladding, and fixings should stay separated so pricing logic remains traceable.",
  "Project-specific add-ons should be tagged as exceptions instead of being merged into the default kit structure.",
  "The BOM layer should be detailed enough for pricing control without becoming an engineering drawing substitute.",
]

export const ATLAS_PRICING_PILLARS = [
  {
    key: "base-rates",
    label: "Base rates",
    description: "Keep the base structural pricing logic in one place so family updates flow through consistently.",
  },
  {
    key: "inclusions",
    label: "Inclusions",
    description: "Standardize what is included by family so estimates stay comparable and clearer to the team.",
  },
  {
    key: "options",
    label: "Options and add-ons",
    description: "Separate optional extras from base scope so margin and revision control remain visible.",
  },
  {
    key: "exceptions",
    label: "Exceptions",
    description: "Document special-case pricing logic openly instead of hiding it inside manual quote decisions.",
  },
]

export const ATLAS_RULE_GROUPS = [
  {
    key: "scope-defaults",
    label: "Scope defaults",
    summary: "Define what the base Atlas product includes before custom items are added.",
    items: [
      "Base structural scope must be clear by family",
      "Cladding, brackets, and fixings should be declared as included or optional",
      "Supply-only and installed scope should never be blended by default",
    ],
  },
  {
    key: "commercial-adjustments",
    label: "Commercial adjustments",
    summary: "Track the changes that materially affect price, margin, or review time.",
    items: [
      "Non-standard spans or layouts must trigger a manual review",
      "Project-specific accessories should be tagged separately from standard kits",
      "Revision-sensitive items should stay visible between estimate versions",
    ],
  },
  {
    key: "quote-discipline",
    label: "Quote discipline",
    summary: "Create consistency so the same Atlas product is described the same way every time.",
    items: [
      "One product family name should carry through CRM, estimates, and documents",
      "Optional extras should appear as options, not hidden assumptions",
      "Exclusions should be visible where the client could reasonably expect them to be included",
    ],
  },
]

export const ATLAS_RULE_CHECKS = [
  "Does this Atlas product start from an approved family and BOM path?",
  "Are the commercial inclusions and exclusions visible before the estimate is sent?",
  "Have any non-standard dimensions or accessories been separated for review?",
  "Can the next person understand the scope without asking the estimator to explain it?",
]

export const ATLAS_ENGINEERING_STREAMS = [
  {
    key: "design-basis",
    label: "Design basis",
    summary: "Capture the starting assumptions that affect how Atlas products are interpreted before pricing and fabrication follow.",
    items: ["Span ranges", "Pitch assumptions", "Standard eave-height families", "Exposure and loading notes"],
  },
  {
    key: "standard-details",
    label: "Standard details",
    summary: "Keep recurring member logic and connection expectations visible so the team works from the same defaults.",
    items: ["Primary frame logic", "Secondary member spacing", "Bracing expectations", "Typical connection details"],
  },
  {
    key: "review-triggers",
    label: "Engineering review triggers",
    summary: "Flag the jobs that should not move forward as standard Atlas product assumptions.",
    items: [
      "Unusual spans or geometry",
      "Project-specific loading or environmental demands",
      "Atypical opening layouts or accessory loads",
      "Custom support or foundation interfaces",
    ],
  },
]

export const ATLAS_ENGINEERING_REFERENCES = [
  "The engineering layer should support pricing and quoting without forcing the team into full drawing-pack detail on day one.",
  "Standard product families should carry standard assumptions until a review trigger clearly moves the project into custom treatment.",
  "Engineering notes should help the next estimator, reviewer, or fabricator understand why the scope was treated a certain way.",
]

export const ATLAS_DOCUMENT_GROUPS = [
  {
    key: "commercial",
    label: "Commercial documents",
    summary: "The client-facing material that should stay aligned with Atlas product logic and revision control.",
    items: ["Estimate templates", "Invoice templates", "Product sheets", "Scope and exclusions references"],
  },
  {
    key: "technical",
    label: "Technical references",
    summary: "The technical support layer that helps the team explain, check, and hand off Atlas products more consistently.",
    items: ["Standard details", "Connection references", "Engineering assumptions", "Installation guidance notes"],
  },
  {
    key: "revision-control",
    label: "Revision and issue control",
    summary: "The operational layer that makes it easier to understand which document is current and why it changed.",
    items: ["Revision history", "Issued-to-client copies", "Internal working drafts", "Linked project references"],
  },
]

export const ATLAS_DOCUMENT_RULES = [
  "Every Atlas document should point back to a stable product family and scope structure.",
  "Client-facing files and internal working files should be clearly separated so issue control stays cleaner.",
  "Revision history should explain what changed, not just that a new file exists.",
]

export const LSF_FAMILIES = [
  {
    key: "warehouses",
    label: "LSF Warehouses",
    summary: "Light steel frame warehouse systems for practical commercial, agricultural, and industrial building use.",
    products: ["Warehouse systems", "Engineered warehouse structures", "Custom storage layouts"],
    focus: "Priority family",
    tone: "border-sky-200 bg-sky-50",
  },
  {
    key: "wall-systems",
    label: "LSF Wall Systems",
    summary: "Wall framing systems for structured lightweight building applications.",
    products: ["External wall frames", "Internal wall frames", "Project-specific wall layouts"],
    focus: "Core system",
    tone: "border-emerald-200 bg-emerald-50",
  },
  {
    key: "roof-systems",
    label: "LSF Roof Systems",
    summary: "Roof framing and structural roof support systems for lightweight steel builds.",
    products: ["Pitched roof systems", "Roof framing sets", "Custom roof layouts"],
    focus: "Core system",
    tone: "border-amber-200 bg-amber-50",
  },
  {
    key: "floor-systems",
    label: "LSF Floor Systems",
    summary: "Structured floor framing solutions for raised floors and modular lightweight builds.",
    products: ["Raised floor systems", "Floor framing layouts", "Project-specific floor solutions"],
    focus: "Growth family",
    tone: "border-violet-200 bg-violet-50",
  },
  {
    key: "trusses",
    label: "LSF Trusses",
    summary: "Light steel frame truss systems for mono pitch, dual pitch, and custom roof requirements.",
    products: ["Mono pitch trusses", "Dual pitch trusses", "Custom truss layouts"],
    focus: "Commercial family",
    tone: "border-rose-200 bg-rose-50",
  },
]

export const LSF_MODULES = [
  {
    key: "products",
    label: "Products",
    description: "Define the LSF product range and keep line naming aligned across the OS.",
    status: "Ready to build",
  },
  {
    key: "wall-systems",
    label: "Wall Systems",
    description: "Structure the default wall system set used across lightweight projects.",
    status: "Ready to build",
  },
  {
    key: "roof-systems",
    label: "Roof Systems",
    description: "Capture roof framing logic, standard layouts, and system groupings in one place.",
    status: "Ready to build",
  },
  {
    key: "floor-systems",
    label: "Floor Systems",
    description: "Group floor framing logic so raised-floor and modular projects can be handled consistently.",
    status: "Next after wall and roof systems",
  },
  {
    key: "modules",
    label: "Modules",
    description: "Build reusable product modules that can feed future quoting and engineering flows.",
    status: "Ready to build",
  },
  {
    key: "pricing",
    label: "Pricing",
    description: "Bring LSF product pricing control into one structured workspace.",
    status: "Next after modules",
  },
  {
    key: "engineering",
    label: "Engineering",
    description: "Keep system rules, assumptions, and design references attached to the LSF line.",
    status: "Ready to build",
  },
  {
    key: "documents",
    label: "Documents",
    description: "Group product sheets, supporting references, and revision-linked records for LSF.",
    status: "Ready to build",
  },
]

export const LSF_WORKSPACE_PRIORITIES = [
  "Put LSF on equal operating footing with Atlas inside Smart Steel OS.",
  "Structure the first commercially useful LSF families so quoting can point to product logic instead of free text.",
  "Prepare wall, roof, floor, and module groupings for future pricing and engineering control.",
]

export const LSF_NAV_ITEMS = [
  { key: "overview", label: "Overview", href: "/os/lsf" },
  { key: "products", label: "Products", href: "/os/lsf/products" },
  { key: "wall-systems", label: "Wall Systems", href: "/os/lsf/wall-systems" },
  { key: "roof-systems", label: "Roof Systems", href: "/os/lsf/roof-systems" },
  { key: "modules", label: "Modules", href: "/os/lsf/modules" },
  { key: "engineering", label: "Engineering", href: "/os/lsf/engineering" },
  { key: "documents", label: "Documents", href: "/os/lsf/documents" },
  { key: "pricing", label: "Pricing", href: "/os/lsf/pricing" },
]

export const LSF_PRODUCT_RULES = [
  "Use stable product and system names so CRM, quotes, and documents stay aligned.",
  "Group LSF work by practical system family before introducing deeper configuration layers.",
  "Keep warehouse, wall, roof, floor, and truss logic separated clearly enough to avoid estimate drift.",
]

export const LSF_WALL_SYSTEM_GROUPS = [
  {
    key: "external",
    label: "External wall systems",
    items: ["External load-bearing frames", "Cladding-ready wall frames", "Perimeter framing layouts"],
  },
  {
    key: "internal",
    label: "Internal wall systems",
    items: ["Partition frames", "Internal structural walls", "Service-ready wall layouts"],
  },
  {
    key: "openings",
    label: "Openings and reinforcement",
    items: ["Door openings", "Window openings", "Localized strengthening"],
  },
]

export const LSF_ROOF_SYSTEM_GROUPS = [
  {
    key: "pitched",
    label: "Pitched roof systems",
    items: ["Mono pitch framing", "Dual pitch framing", "Custom roof frame geometry"],
  },
  {
    key: "support",
    label: "Roof support members",
    items: ["Rafters", "Purlin support logic", "Bracing layouts"],
  },
  {
    key: "trusses",
    label: "Truss-based roof systems",
    items: ["Mono pitch trusses", "Dual pitch trusses", "Custom truss systems"],
  },
]

export const LSF_MODULE_GROUPS = [
  {
    key: "structural-shell",
    label: "Structural shell modules",
    summary: "Reusable LSF framing groups that define the primary building shell before openings and finishes are layered in.",
    items: ["Warehouse shell frames", "Wall frame sets", "Roof frame sets", "Raised floor base modules"],
  },
  {
    key: "openings-and-support",
    label: "Openings and support modules",
    summary: "Repeatable reinforcement and support groups that can be added without rebuilding the whole design logic.",
    items: ["Door opening modules", "Window opening modules", "Localized strengthening", "Service-ready framing zones"],
  },
  {
    key: "roof-and-truss",
    label: "Roof and truss modules",
    summary: "Standard roof families and truss packs that should become configurable building blocks for future quoting.",
    items: ["Mono-pitch roof packs", "Dual-pitch roof packs", "Truss layout groups", "Bracing support packs"],
  },
]

export const LSF_MODULE_RULES = [
  "Each module should solve one recurring LSF scope instead of mixing unrelated framing logic into one bundle.",
  "Modules should be reusable enough for quoting but still clear enough for engineering review when a job moves beyond standard assumptions.",
  "Product families, wall systems, roof systems, and pricing should all be able to reference the same module names without translation.",
]

export const LSF_ENGINEERING_STREAMS = [
  {
    key: "system-assumptions",
    label: "System assumptions",
    summary: "Capture the starting technical assumptions that frame how the LSF line is interpreted before pricing and documents follow.",
    items: ["Standard spans and heights", "Wall loading assumptions", "Roof geometry assumptions", "Typical floor support logic"],
  },
  {
    key: "detailing-groups",
    label: "Detailing groups",
    summary: "Keep recurring framing and reinforcement patterns visible so the team works from the same technical defaults.",
    items: ["Stud and track logic", "Openings reinforcement", "Roof support detailing", "Module connection expectations"],
  },
  {
    key: "review-points",
    label: "Engineering review points",
    summary: "Flag where standard LSF assumptions stop being enough and the job needs a deeper technical pass.",
    items: [
      "Unusual spans or layout changes",
      "Heavy service loads or special requirements",
      "Non-standard connections or support conditions",
      "Projects that move beyond normal modular framing assumptions",
    ],
  },
]

export const LSF_ENGINEERING_REFERENCES = [
  "The LSF engineering layer should support quoting and scope control without forcing every job into a full technical package too early.",
  "Standard systems should stay easy to quote until a clear review point pushes the project into custom treatment.",
  "Engineering notes should make handoff easier for the next estimator, reviewer, or detailer working on the job.",
]

export const LSF_DOCUMENT_GROUPS = [
  {
    key: "commercial",
    label: "Commercial documents",
    summary: "The quoting and client-facing files that should stay matched to LSF systems, modules, and revisions.",
    items: ["Estimate templates", "Invoice templates", "System summaries", "Scope and exclusions references"],
  },
  {
    key: "system-references",
    label: "System references",
    summary: "The supporting references that help the team quote and explain recurring LSF systems with less drift.",
    items: ["Wall system references", "Roof system references", "Module summaries", "Engineering notes"],
  },
  {
    key: "issue-control",
    label: "Issue and revision control",
    summary: "The operating layer for keeping active LSF files clear across quotes, updates, and client issue points.",
    items: ["Revision history", "Issued copies", "Internal working versions", "Linked project references"],
  },
]

export const LSF_DOCUMENT_RULES = [
  "Every LSF document should stay tied to a clear system, module, or product family reference.",
  "Client issue points and internal working references should be separated so the team knows which file is current.",
  "Document revisions should explain the commercial or technical change that triggered the update.",
]

export const LSF_PRICING_PILLARS = [
  {
    key: "system-rates",
    label: "System rates",
    description: "Control core LSF pricing logic by system family so updates remain consistent across quotes.",
  },
  {
    key: "scope-logic",
    label: "Scope logic",
    description: "Separate supply, fabrication, and install assumptions clearly so commercial scope stays visible.",
  },
  {
    key: "options",
    label: "Options and variations",
    description: "Keep optional extras and custom adjustments traceable instead of burying them in manual quote edits.",
  },
  {
    key: "engineering-adjustments",
    label: "Engineering adjustments",
    description: "Record where engineering-led pricing changes apply so the team can quote more consistently.",
  },
]
