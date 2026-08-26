export const OS_SECTIONS = [
  {
    key: "dashboard",
    label: "Dashboard",
    href: "/os",
    description: "Command center for daily focus, commercial movement, and team visibility.",
    status: "live",
    phaseLabel: "Phase 1A",
    items: [],
  },
  {
    key: "crm",
    label: "CRM",
    href: "/os/crm",
    description: "Leads, customers, opportunities, quotes, and activity history.",
    status: "live",
    phaseLabel: "Phase 1A",
    items: ["Leads", "Customers", "Opportunities", "Quotes", "Activities"],
  },
  {
    key: "projects",
    label: "Projects",
    href: "/os/projects",
    description: "Site visits, inspections, project actions, files, and sign-off records.",
    status: "active_build",
    phaseLabel: "Field trial",
    items: ["Active Projects", "Site Visits", "Inspections", "Actions", "Files", "Reports", "Checklists"],
  },
  {
    key: "atlas",
    label: "Atlas",
    href: "/os/atlas",
    description: "Lip channel products, components, pricing, and documents for the Atlas line.",
    status: "active_build",
    phaseLabel: "Next build",
    items: ["Dashboard", "Products", "Components", "BOM", "Pricing", "Engineering", "Media", "Documents", "Rules", "Roadmap", "Revisions"],
  },
  {
    key: "lsf",
    label: "LSF Line",
    href: "/os/lsf",
    description: "Light steel frame products, systems, pricing, and engineering.",
    status: "active_build",
    phaseLabel: "Next build",
    items: ["Products", "Wall Systems", "Roof Systems", "Floor Systems", "Modules", "Pricing", "Engineering", "Documents"],
  },
  {
    key: "partners",
    label: "Partners",
    href: "/os/partners",
    description: "Strategic accounts, dealers, installers, and supplier relationships.",
    status: "active_build",
    phaseLabel: "AFGRI pilot",
    items: ["Opportunities", "Rolodex", "Commercial Releases", "AFGRI Network"],
  },
  {
    key: "manufacturing",
    label: "Manufacturing",
    href: "/os/manufacturing",
    description: "Production, inventory, purchasing, packaging, and deliveries.",
    status: "scaffolded",
    phaseLabel: "Planned",
    items: ["Production", "Inventory", "Purchasing", "Packaging", "Deliveries"],
  },
  {
    key: "analytics",
    label: "Analytics",
    href: "/os/analytics",
    description: "Commercial growth, conversion, product demand, and marketing performance.",
    status: "active_build",
    phaseLabel: "CRM foundation live",
    items: [],
  },
  {
    key: "settings",
    label: "Settings",
    href: "/os/settings",
    description: "Configuration, permissions, and system preferences.",
    status: "scaffolded",
    phaseLabel: "Later phase",
    items: [],
  },
]

export const OS_STATUS_META = {
  live: {
    label: "Live now",
    badgeClassName: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  active_build: {
    label: "Next build",
    badgeClassName: "border-sky-200 bg-sky-50 text-sky-700",
  },
  scaffolded: {
    label: "Scaffolded",
    badgeClassName: "border-slate-200 bg-slate-100 text-slate-600",
  },
}

export function getOsSection(pathname) {
  if (!pathname || pathname === "/os") return OS_SECTIONS[0]
  return (
    OS_SECTIONS.find((section) => pathname === section.href || pathname.startsWith(`${section.href}/`)) ||
    OS_SECTIONS[0]
  )
}
