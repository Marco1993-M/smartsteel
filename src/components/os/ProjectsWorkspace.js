"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { getOsAuthHeaders } from "../../lib/osClientAuth"

const STORAGE_KEY = "smart-solutions-project-operations-v1"

const COMPANY_OPTIONS = [
  { key: "smart-steel", label: "Smart Steel", prefix: "SS", accent: "#e31d2b", reportName: "Smart Steel Site Record", contact: "info@smartsteel.co.za" },
  { key: "atlas", label: "Atlas", prefix: "ATL", accent: "#e7ad19", reportName: "Atlas System Site Record", contact: "info@smartsteel.co.za" },
  { key: "lsf", label: "LSF", prefix: "LSF", accent: "#2f6bc2", reportName: "Smart Steel LSF Site Record", contact: "info@smartsteel.co.za" },
  { key: "pequeno", label: "Pequeno", prefix: "PEQ", accent: "#c45734", reportName: "Pequeno Project Site Record", contact: "info@pequenohome.com" },
]

const VISIT_TYPES = [
  { label: "General site visit", recordType: "Site visit" },
  { label: "Installation progress review", recordType: "Site visit" },
  { label: "Pre-start inspection", recordType: "Inspection" },
  { label: "Foundations inspection", recordType: "Inspection" },
  { label: "Structural frame inspection", recordType: "Inspection" },
  { label: "Roof and cladding inspection", recordType: "Inspection" },
  { label: "Practical completion", recordType: "Inspection" },
]

const RECORD_STATES = ["Draft", "Ready for review", "Issued", "Superseded"]

const CHECKLISTS = {
  "General site visit": [
    "Work completed since the previous visit",
    "Current work quality and visible defects",
    "Site access, safety, and working conditions",
    "Materials delivered and still required",
    "Decisions or information needed from the client",
  ],
  "Pre-start inspection": [
    "Latest drawings and project scope available",
    "Site access and working area ready",
    "Building position and reference levels confirmed",
    "Responsibilities and client-supplied work confirmed",
    "Safety and site requirements in place",
  ],
  "Foundations inspection": [
    "Building position and grid lines confirmed",
    "Excavations and founding conditions checked",
    "Levels and dimensions match the issued information",
    "Reinforcement, anchors, and cast-ins checked",
    "Foundations ready for the next stage",
  ],
  "Structural frame inspection": [
    "Frame layout matches the issued information",
    "Columns and frames are plumb and aligned",
    "Connections, bolts, and fasteners are complete",
    "Bracing and tie-downs are installed",
    "No unacceptable damage or unapproved alterations visible",
  ],
  "Roof and cladding inspection": [
    "Purlins and cladding supports are complete",
    "Roof and wall sheets are aligned and securely fixed",
    "Flashings, closures, and weatherproofing are complete",
    "Openings and interfaces match the project scope",
    "Roof drainage routes are clear",
  ],
  "Installation progress review": [
    "Installed work matches the agreed scope",
    "Progress is aligned with the current programme",
    "Outstanding materials and access needs are recorded",
    "Quality issues and corrective work are recorded",
    "Next site activity and responsibility are confirmed",
  ],
  "Practical completion": [
    "Agreed project scope is substantially complete",
    "Snag items are recorded and assigned",
    "Structure and finishes have been inspected",
    "Site has been cleared of project waste",
    "Handover documents and final actions are confirmed",
  ],
}

const emptyProject = {
  companyKey: "smart-steel",
  name: "",
  projectNumber: "",
  clientName: "",
  address: "",
  system: "Atlas Warehouse",
  siteContact: "",
  contractor: "",
  projectManager: "",
  scope: "",
  references: "",
}

function createVisit(project, selectedType) {
  const date = new Date().toISOString().slice(0, 10)
  const visitType = selectedType.label
  return {
    id: `visit-${Date.now()}`,
    projectId: project.id,
    visitNumber: `${project.projectNumber || "SITE"}-${String((project.visits?.length || 0) + 1).padStart(3, "0")}`,
    visitType,
    recordType: selectedType.recordType,
    recordState: "Draft",
    date,
    inspector: "",
    weather: "",
    summary: "",
    outcome: "Open",
    acknowledgement: "",
    items: (CHECKLISTS[visitType] || CHECKLISTS["General site visit"]).map((label) => ({
      label,
      status: "Not checked",
      note: "",
    })),
    actions: [],
    photos: [],
  }
}

function normalizeVisit(visit) {
  return {
    ...visit,
    recordType: visit.recordType || (visit.visitType?.includes("inspection") || visit.visitType === "Practical completion" ? "Inspection" : "Site visit"),
    recordState: visit.recordState || "Draft",
    acknowledgement: visit.acknowledgement || "",
    items: (visit.items || []).map((item) => ({ status: "Not checked", note: "", ...item })),
    actions: (visit.actions || []).map((action) => ({ priority: "Normal", status: action.closed ? "Resolved" : "Open", ...action })),
    photos: (visit.photos || []).map((photo) => ({ caption: "", linkedItem: "", ...photo })),
  }
}

function normalizeProject(project) {
  return {
    ...emptyProject,
    ...project,
    archived: Boolean(project.archived),
    visits: (project.visits || []).map(normalizeVisit),
  }
}

function getVisitProgress(visit) {
  const required = [
    Boolean(visit.inspector?.trim()),
    Boolean(visit.date),
    Boolean(visit.summary?.trim()),
    visit.items.length > 0 && visit.items.every((item) => item.status !== "Not checked"),
  ]
  const completed = required.filter(Boolean).length
  return { completed, total: required.length, percent: Math.round((completed / required.length) * 100) }
}

function getNextProjectNumber(projects, companyKey) {
  const year = new Date().getFullYear()
  const company = COMPANY_OPTIONS.find((item) => item.key === companyKey) || COMPANY_OPTIONS[0]
  const prefix = `${company.prefix}-${year}-`
  const highestSequence = projects.reduce((highest, project) => {
    if (!project.projectNumber?.startsWith(prefix)) return highest
    const sequence = Number(project.projectNumber.slice(prefix.length))
    return Number.isFinite(sequence) ? Math.max(highest, sequence) : highest
  }, 0)

  return `${prefix}${String(highestSequence + 1).padStart(3, "0")}`
}

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = () => {
      const image = new Image()
      image.onerror = reject
      image.onload = () => {
        const maxDimension = 1200
        const scale = Math.min(1, maxDimension / Math.max(image.width, image.height))
        const canvas = document.createElement("canvas")
        canvas.width = Math.round(image.width * scale)
        canvas.height = Math.round(image.height * scale)
        canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height)
        resolve({
          id: `photo-${Date.now()}-${file.name}`,
          name: file.name,
          src: canvas.toDataURL("image/jpeg", 0.7),
          caption: "",
          linkedItem: "",
        })
      }
      image.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}

function Field({ label, children, wide = false }) {
  return (
    <label className={wide ? "block sm:col-span-2" : "block"}>
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</span>
      {children}
    </label>
  )
}

const inputClass = "mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 sm:text-sm"

function SaveStateBadge({ state }) {
  const tone = state === "Saved"
    ? "bg-emerald-100 text-emerald-700"
    : state === "Saving"
      ? "bg-sky-100 text-sky-700"
      : "bg-amber-100 text-amber-800"

  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${tone}`}>
      <span className={`h-2 w-2 rounded-full ${state === "Saved" ? "bg-emerald-500" : state === "Saving" ? "animate-pulse bg-sky-500" : "bg-amber-500"}`} />
      {state}
    </span>
  )
}

function formatReportDate(value) {
  if (!value) return "Not recorded"
  return new Date(`${value}T12:00:00`).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function chunkItems(items, size) {
  return Array.from({ length: Math.ceil(items.length / size) }, (_, index) =>
    items.slice(index * size, index * size + size)
  )
}

function ReportFooter({ project, visit, company, pageLabel }) {
  return (
    <footer className="mt-auto flex items-end justify-between gap-6 border-t border-slate-200 pt-4 text-[10px] leading-4 text-slate-500">
      <div>
        <p className="font-bold uppercase tracking-[0.16em] text-slate-700">{company.label}</p>
        <p>{company.contact}</p>
      </div>
      <div className="text-right">
        <p>{project.projectNumber} · {visit.visitNumber}</p>
        <p>{pageLabel}</p>
      </div>
    </footer>
  )
}

function SiteReportDocument({ project, visit, company }) {
  const checkedItems = visit.items.filter((item) => item.status !== "Not checked")
  const attentionItems = visit.items.filter((item) => ["Attention", "Action required", "Fail"].includes(item.status))
  const openActions = visit.actions.filter((action) => action.status !== "Resolved")
  const photoPages = visit.photos.length ? chunkItems(visit.photos, 4) : [[]]
  const meta = [
    ["Client", project.clientName || "Not recorded"],
    ["Site", project.address || "Not recorded"],
    ["System / project type", project.system || "Not recorded"],
    ["Inspector", visit.inspector || "Not recorded"],
    ["Site contact", project.siteContact || "Not recorded"],
    ["Contractor", project.contractor || "Not recorded"],
    ["Project manager", project.projectManager || "Not recorded"],
    ["Weather", visit.weather || "Not recorded"],
  ]

  return (
    <article className="site-report mx-auto w-full max-w-[210mm] bg-white text-slate-950 shadow-xl print:shadow-none">
      <section className="site-report-page flex min-h-[277mm] flex-col px-[14mm] py-[12mm]">
        <header className="border-t-[7px] pt-7" style={{ borderColor: company.accent }}>
          <div className="flex items-start justify-between gap-8 border-b border-slate-200 pb-7">
            <div className="flex items-center gap-4">
              {company.key !== "pequeno" ? <Image src="/Logo.png" alt="Smart Steel" width={118} height={48} className="h-11 w-auto object-contain" /> : null}
              <div className={company.key !== "pequeno" ? "border-l border-slate-200 pl-4" : ""}>
                <p className="text-[10px] font-bold uppercase tracking-[0.24em]" style={{ color: company.accent }}>{company.reportName}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">Project Operations</p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em]" style={{ borderColor: company.accent, color: company.accent }}>{visit.recordState}</span>
              <p className="mt-3 font-mono text-xs text-slate-500">{visit.visitNumber}</p>
            </div>
          </div>
          <div className="py-10">
            <p className="text-xs font-bold uppercase tracking-[0.22em]" style={{ color: company.accent }}>{visit.recordType}</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-[1.05] tracking-[-0.045em]">{visit.visitType}</h1>
            <div className="mt-6 flex flex-wrap gap-x-7 gap-y-2 text-sm text-slate-600">
              <span className="font-semibold text-slate-950">{project.name}</span>
              <span>{project.projectNumber}</span>
              <span>{formatReportDate(visit.date)}</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-4 border-y border-slate-200">
          {[
            ["Outcome", visit.outcome || "Open"],
            ["Checks completed", `${checkedItems.length}/${visit.items.length}`],
            ["Items requiring attention", attentionItems.length],
            ["Open actions", openActions.length],
          ].map(([label, value], index) => (
            <div key={label} className={`px-4 py-5 ${index < 3 ? "border-r border-slate-200" : ""}`}>
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">{label}</p>
              <p className="mt-2 text-xl font-bold">{value}</p>
            </div>
          ))}
        </div>

        <section className="mt-8">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Visit summary</h2>
          <p className="mt-4 whitespace-pre-wrap text-base leading-7 text-slate-700">{visit.summary || "No summary recorded."}</p>
        </section>

        <section className="mt-8 grid grid-cols-2 gap-x-10 gap-y-5 border-t border-slate-200 pt-6">
          {meta.map(([label, value]) => (
            <div key={label} className="break-inside-avoid">
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">{label}</p>
              <p className="mt-1.5 text-sm font-semibold leading-5 text-slate-800">{value}</p>
            </div>
          ))}
        </section>

        {(project.scope || project.references) ? (
          <section className="mt-8 grid grid-cols-2 gap-8 border-t border-slate-200 pt-6">
            <div><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">Project scope</p><p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-slate-700">{project.scope || "Not recorded"}</p></div>
            <div><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">Document references</p><p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-slate-700">{project.references || "Not recorded"}</p></div>
          </section>
        ) : null}

        <ReportFooter project={project} visit={visit} company={company} pageLabel="Report summary" />
      </section>

      <section className="site-report-page flex min-h-[277mm] flex-col px-[14mm] py-[12mm]">
        <div className="flex items-end justify-between border-b border-slate-200 pb-5">
          <div><p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: company.accent }}>Inspection record</p><h2 className="mt-2 text-2xl font-bold tracking-[-0.03em]">Findings and required actions</h2></div>
          <p className="font-mono text-xs text-slate-400">{visit.visitNumber}</p>
        </div>

        <section className="mt-7">
          <div className="grid grid-cols-[1fr_34mm] border-b-2 border-slate-900 pb-2 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500"><span>Inspection item and finding</span><span>Status</span></div>
          {visit.items.map((item, index) => (
            <div key={`${item.label}-${index}`} className="grid break-inside-avoid grid-cols-[1fr_34mm] border-b border-slate-200 py-3.5">
              <div className="pr-6"><p className="text-sm font-semibold text-slate-900">{item.label}</p>{item.note ? <p className="mt-1.5 whitespace-pre-wrap text-xs leading-5 text-slate-600">{item.note}</p> : null}</div>
              <div><span className="inline-flex border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-700">{item.status}</span></div>
            </div>
          ))}
        </section>

        <section className="mt-8">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Action register</h2>
          {visit.actions.length ? (
            <div className="mt-4 border-t-2 border-slate-900">
              {visit.actions.map((action, index) => (
                <div key={action.id} className="grid break-inside-avoid grid-cols-[8mm_1fr_35mm] gap-3 border-b border-slate-200 py-3.5">
                  <span className="font-mono text-xs text-slate-400">{String(index + 1).padStart(2, "0")}</span>
                  <div><p className="text-sm font-semibold">{action.text || "Action not described"}</p><p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-slate-500">{action.priority} priority · Owner: {action.owner || "Unassigned"} · Due: {action.dueDate ? formatReportDate(action.dueDate) : "Not set"}</p></div>
                  <p className="text-right text-xs font-bold text-slate-700">{action.status}</p>
                </div>
              ))}
            </div>
          ) : <p className="mt-4 border-y border-slate-200 py-5 text-sm text-slate-500">No follow-up actions were recorded during this visit.</p>}
        </section>

        <section className="mt-8 grid grid-cols-2 gap-8 border-t border-slate-200 pt-6">
          <div><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">Acknowledged by</p><p className="mt-3 text-sm font-semibold">{visit.acknowledgement || "Not recorded"}</p></div>
          <div><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">Record status</p><p className="mt-3 text-sm font-semibold">{visit.recordState}{visit.issuedAt ? ` · Issued ${new Date(visit.issuedAt).toLocaleDateString("en-ZA")}` : ""}</p></div>
        </section>

        <ReportFooter project={project} visit={visit} company={company} pageLabel="Findings and actions" />
      </section>

      {photoPages.map((photos, pageIndex) => (
        <section key={`photos-${pageIndex}`} className="site-report-page flex min-h-[277mm] flex-col px-[14mm] py-[12mm]">
          <div className="flex items-end justify-between border-b border-slate-200 pb-5">
            <div><p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: company.accent }}>Photo evidence</p><h2 className="mt-2 text-2xl font-bold tracking-[-0.03em]">Site photo record</h2></div>
            <p className="text-xs text-slate-500">{visit.photos.length} photo{visit.photos.length === 1 ? "" : "s"}</p>
          </div>
          <div className="mt-7 grid grid-cols-2 gap-x-5 gap-y-7">
            {!photos.length ? (
              <div className="col-span-2 border-y border-slate-200 py-10 text-center">
                <p className="text-sm font-semibold text-slate-700">No site photos were recorded for this visit.</p>
              </div>
            ) : null}
            {photos.map((photo, photoIndex) => {
              const number = pageIndex * 4 + photoIndex + 1
              return (
                <figure key={photo.id} className="break-inside-avoid">
                  <div className="relative overflow-hidden border border-slate-200 bg-slate-100"><img src={photo.src} alt={photo.caption || photo.name} className="aspect-[4/3] w-full object-cover" /><span className="absolute left-0 top-0 bg-slate-950 px-3 py-2 font-mono text-xs font-bold text-white">{String(number).padStart(2, "0")}</span></div>
                  <figcaption className="border-x border-b border-slate-200 px-3 py-3"><p className="text-xs font-semibold leading-5 text-slate-800">{photo.caption || `Site photo ${number}`}</p>{photo.linkedItem ? <p className="mt-1 text-[10px] leading-4 text-slate-500">Linked finding: {photo.linkedItem}</p> : null}</figcaption>
                </figure>
              )
            })}
          </div>
          <ReportFooter project={project} visit={visit} company={company} pageLabel={`Photo record ${pageIndex + 1}/${photoPages.length}`} />
        </section>
      ))}
    </article>
  )
}

export default function ProjectsWorkspace() {
  const [projects, setProjects] = useState([])
  const [ready, setReady] = useState(false)
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [projectForm, setProjectForm] = useState(emptyProject)
  const [activeProjectId, setActiveProjectId] = useState(null)
  const [activeVisitId, setActiveVisitId] = useState(null)
  const [visitType, setVisitType] = useState(VISIT_TYPES[0].label)
  const [showArchived, setShowArchived] = useState(false)
  const [reportPreview, setReportPreview] = useState(false)
  const [editingProject, setEditingProject] = useState(false)
  const [editProjectForm, setEditProjectForm] = useState(emptyProject)
  const [syncReady, setSyncReady] = useState(false)
  const [saveState, setSaveState] = useState("Loading")
  const [saveError, setSaveError] = useState("")
  const [photoState, setPhotoState] = useState("")
  const saveSequence = useRef(0)

  useEffect(() => {
    async function loadProjects() {
      let localProjects = []
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY)
        if (stored) localProjects = JSON.parse(stored).map(normalizeProject)
      } catch {
        localProjects = []
      }

      try {
        const response = await fetch("/api/os/projects", {
          cache: "no-store",
          headers: await getOsAuthHeaders(),
        })
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.error || "Could not load shared projects.")

        if (!payload.schemaReady) {
          setProjects(localProjects)
          setSaveState("Local only")
          setSaveError("Run the Projects SQL to enable shared records.")
        } else if (payload.records?.length) {
          setProjects(payload.records.map(normalizeProject))
          setSaveState("Saved")
        } else if (localProjects.length) {
          const migrationResponse = await fetch("/api/os/projects", {
            method: "PUT",
            headers: await getOsAuthHeaders({ "Content-Type": "application/json" }),
            body: JSON.stringify({ records: localProjects }),
          })
          const migrationPayload = await migrationResponse.json()
          if (!migrationResponse.ok) throw new Error(migrationPayload.error || "Could not migrate local projects.")
          setProjects((migrationPayload.records || localProjects).map(normalizeProject))
          setSaveState("Saved")
        } else {
          setProjects([])
          setSaveState("Saved")
        }
      } catch (loadError) {
        setProjects(localProjects)
        setSaveState("Offline")
        setSaveError(loadError.message)
      } finally {
        setReady(true)
        setSyncReady(true)
      }
    }

    loadProjects()
  }, [])

  useEffect(() => {
    if (!ready || typeof window === "undefined") return
    const projectId = new URLSearchParams(window.location.search).get("projectId")
    if (!projectId || !projects.some((project) => project.id === projectId)) return
    setActiveProjectId(projectId)
    window.history.replaceState({}, "", window.location.pathname)
  }, [projects, ready])

  useEffect(() => {
    if (!ready || !syncReady) return

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
    } catch {
      setSaveError("This browser could not keep the local project backup.")
    }

    if (!projects.length || saveState === "Local only") return
    setSaveState("Saving")
    const sequence = saveSequence.current + 1
    saveSequence.current = sequence
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/os/projects", {
          method: "PUT",
          headers: await getOsAuthHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify({ records: projects }),
        })
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.error || "Could not save shared projects.")
        if (sequence === saveSequence.current) {
          setSaveState("Saved")
          setSaveError("")
        }
      } catch (saveFailure) {
        if (sequence === saveSequence.current) {
          setSaveState("Offline")
          setSaveError(saveFailure.message)
        }
      }
    }, 700)

    return () => window.clearTimeout(timer)
  }, [projects, ready, syncReady])

  useEffect(() => {
    if (saveState !== "Saving") return
    const protectUnsavedSync = (event) => {
      event.preventDefault()
      event.returnValue = ""
    }
    window.addEventListener("beforeunload", protectUnsavedSync)
    return () => window.removeEventListener("beforeunload", protectUnsavedSync)
  }, [saveState])

  const activeProject = projects.find((project) => project.id === activeProjectId) || null
  const activeVisit = activeProject?.visits?.find((visit) => visit.id === activeVisitId) || null
  const company = COMPANY_OPTIONS.find((item) => item.key === activeProject?.companyKey) || COMPANY_OPTIONS[0]
  const visibleProjects = projects.filter((project) => showArchived ? project.archived : !project.archived)
  const progress = activeVisit ? getVisitProgress(activeVisit) : null
  const nextProjectNumber = getNextProjectNumber(projects, projectForm.companyKey)

  function addProject(event) {
    event.preventDefault()
    const next = {
      ...projectForm,
      projectNumber: getNextProjectNumber(projects, projectForm.companyKey),
      id: `project-${Date.now()}`,
      createdAt: new Date().toISOString(),
      visits: [],
    }
    setProjects((current) => [next, ...current])
    setProjectForm(emptyProject)
    setShowProjectForm(false)
    setActiveProjectId(next.id)
  }

  function updateVisit(updater) {
    setProjects((current) => current.map((project) => {
      if (project.id !== activeProjectId) return project
      return {
        ...project,
        visits: project.visits.map((visit) => visit.id === activeVisitId ? updater(visit) : visit),
      }
    }))
  }

  function startVisit() {
    if (!activeProject) return
    const selectedType = VISIT_TYPES.find((item) => item.label === visitType) || VISIT_TYPES[0]
    const next = createVisit(activeProject, selectedType)
    setProjects((current) => current.map((project) => project.id === activeProject.id
      ? { ...project, visits: [next, ...(project.visits || [])] }
      : project))
    setActiveVisitId(next.id)
  }

  function addAction() {
    updateVisit((visit) => ({
      ...visit,
      actions: [...visit.actions, { id: `action-${Date.now()}`, text: "", owner: "", dueDate: "", priority: "Normal", status: "Open" }],
    }))
  }

  async function addPhotos(event) {
    const files = Array.from(event.target.files || [])
    if (!files.length) return
    event.target.value = ""
    setPhotoState(`Preparing ${files.length} photo${files.length === 1 ? "" : "s"}...`)
    try {
      const photos = await Promise.all(files.map(compressImage))
      updateVisit((visit) => ({ ...visit, photos: [...visit.photos, ...photos] }))
      setPhotoState(`${files.length} photo${files.length === 1 ? "" : "s"} added`)
      window.setTimeout(() => setPhotoState(""), 2500)
    } catch {
      setPhotoState("A photo could not be added. Please try it again.")
    }
  }

  function addChecklistItem() {
    updateVisit((visit) => ({
      ...visit,
      items: [...visit.items, { label: "Custom site check", status: "Not checked", note: "", custom: true }],
    }))
  }

  function archiveProject(projectId) {
    setProjects((current) => current.map((project) => project.id === projectId ? { ...project, archived: !project.archived } : project))
    setEditingProject(false)
    setActiveProjectId(null)
    setActiveVisitId(null)
  }

  function beginProjectEdit() {
    if (!activeProject) return
    setEditProjectForm({ ...emptyProject, ...activeProject })
    setEditingProject(true)
  }

  function saveProjectEdit(event) {
    event.preventDefault()
    setProjects((current) => current.map((project) => project.id === activeProjectId
      ? { ...project, ...editProjectForm, id: project.id, visits: project.visits, archived: project.archived }
      : project))
    setEditingProject(false)
  }

  function updateRecordState(nextState) {
    if (!activeVisit) return
    const currentProgress = getVisitProgress(activeVisit)
    if (["Ready for review", "Issued"].includes(nextState) && currentProgress.percent < 100) {
      window.alert("Complete the inspector, summary, and every checklist item before moving this record forward.")
      return
    }
    if (nextState === "Superseded" && activeVisit.recordState !== "Issued") {
      window.alert("Only an issued record can be superseded.")
      return
    }

    updateVisit((visit) => ({
      ...visit,
      recordState: nextState,
      issuedAt: nextState === "Issued" ? new Date().toISOString() : visit.issuedAt || null,
    }))
  }

  if (!ready) return <div className="p-6 text-sm text-slate-500">Loading projects...</div>

  if (activeVisit && activeProject && reportPreview) {
    return (
      <div className="site-report-preview min-h-screen bg-slate-200/70 p-3 sm:p-6 lg:p-8 print:min-h-0 print:bg-white print:p-0">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <button type="button" onClick={() => setReportPreview(false)} className="text-sm font-semibold text-slate-600 hover:text-slate-950">← Continue editing</button>
          <button type="button" onClick={() => window.print()} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white">Print / Save PDF</button>
        </div>
        <SiteReportDocument project={activeProject} visit={activeVisit} company={company} />
      </div>
    )
  }

  if (activeVisit && activeProject) {
    return (
      <div className="mx-auto w-full max-w-6xl p-3 sm:p-6 lg:p-8">
        <div className="sticky top-0 z-20 -mx-1 flex items-center justify-between gap-3 bg-slate-50/95 px-1 py-2 backdrop-blur print:hidden">
          <button type="button" onClick={() => setActiveVisitId(null)} className="min-h-11 text-sm font-semibold text-slate-600 hover:text-slate-950">← Back to project</button>
          <SaveStateBadge state={saveState} />
        </div>
        <article className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm print:mt-0 print:border-0 print:shadow-none">
          <header className="border-b border-slate-200 p-5 sm:p-8" style={{ borderTop: `6px solid ${company.accent}` }}>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: company.accent }}>{company.label} site record</p>
                <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-4xl">{activeVisit.visitType}</h1>
                <p className="mt-2 text-sm text-slate-600">{activeProject.name} · {activeVisit.visitNumber}</p>
              </div>
              <button type="button" onClick={() => setReportPreview(true)} className="print:hidden rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white">Review report</button>
            </div>
            <div className="mt-5 rounded-xl bg-slate-50 p-4 print:hidden">
              <div className="flex items-center justify-between gap-4">
                <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{activeVisit.recordType} completion</p><p className="mt-1 text-sm text-slate-600">{progress.completed === progress.total ? "Ready to review." : `${progress.total - progress.completed} required section${progress.total - progress.completed === 1 ? "" : "s"} still need attention.`}</p></div>
                <span className="text-lg font-bold text-slate-900">{progress.percent}%</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-sky-600 transition-all" style={{ width: `${progress.percent}%` }} /></div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <Field label="Visit date"><input type="date" className={inputClass} value={activeVisit.date} onChange={(e) => updateVisit((v) => ({ ...v, date: e.target.value }))} /></Field>
              <Field label="Inspector"><input className={inputClass} value={activeVisit.inspector} onChange={(e) => updateVisit((v) => ({ ...v, inspector: e.target.value }))} placeholder="Your name" /></Field>
              <Field label="Weather"><input className={inputClass} value={activeVisit.weather} onChange={(e) => updateVisit((v) => ({ ...v, weather: e.target.value }))} placeholder="Clear, light wind" /></Field>
              <Field label="Outcome"><select className={inputClass} value={activeVisit.outcome} onChange={(e) => updateVisit((v) => ({ ...v, outcome: e.target.value }))}><option>Open</option><option>Accepted</option><option>Accepted with actions</option><option>Reinspection required</option></select></Field>
              <Field label="Record state"><select className={inputClass} value={activeVisit.recordState} onChange={(e) => updateRecordState(e.target.value)}>{RECORD_STATES.map((state) => <option key={state}>{state}</option>)}</select></Field>
            </div>
          </header>

          <section className="p-5 sm:p-8">
            <div className="flex items-end justify-between gap-4">
              <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{activeVisit.recordType} checklist</p><h2 className="mt-1 text-xl font-bold text-slate-950">Record what you found on site</h2></div>
              <span className="text-sm font-semibold text-slate-500">{activeVisit.items.filter((item) => item.status !== "Not checked").length}/{activeVisit.items.length}</span>
            </div>
            <div className="mt-5 space-y-3">
              {activeVisit.items.map((item, index) => (
                <div key={`${item.label}-${index}`} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    {item.custom ? <input className="min-w-0 flex-1 border-0 p-0 font-semibold text-slate-900 outline-none" value={item.label} onChange={(e) => updateVisit((visit) => ({ ...visit, items: visit.items.map((current, i) => i === index ? { ...current, label: e.target.value } : current) }))} /> : <p className="font-semibold text-slate-900">{index + 1}. {item.label}</p>}
                    {item.custom ? <button type="button" onClick={() => updateVisit((visit) => ({ ...visit, items: visit.items.filter((_, i) => i !== index) }))} className="print:hidden text-xs font-semibold text-rose-600">Remove</button> : null}
                  </div>
                  <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.2fr)]">
                    <div className="grid grid-cols-3 gap-2" aria-label={`Result for ${item.label}`}>
                      {["Pass", "Attention required", "Not applicable"].map((status) => {
                        const selected = item.status === status
                        const shortLabel = status === "Attention required" ? "Attention" : status === "Not applicable" ? "N/A" : status
                        const selectedTone = status === "Pass" ? "border-emerald-600 bg-emerald-600 text-white" : status === "Attention required" ? "border-amber-500 bg-amber-400 text-slate-950" : "border-slate-700 bg-slate-700 text-white"
                        return <button key={status} type="button" onClick={() => updateVisit((visit) => ({ ...visit, items: visit.items.map((current, i) => i === index ? { ...current, status: selected ? "Not checked" : status } : current) }))} className={`min-h-11 rounded-xl border px-2 py-2 text-xs font-semibold transition ${selected ? selectedTone : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"}`} aria-pressed={selected}>{shortLabel}</button>
                      })}
                    </div>
                    <input className={`${inputClass} mt-0`} value={item.note} onChange={(e) => updateVisit((visit) => ({ ...visit, items: visit.items.map((current, i) => i === index ? { ...current, note: e.target.value } : current) }))} placeholder="Add a finding or note" />
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={addChecklistItem} className="print:hidden mt-4 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">+ Add custom check</button>
          </section>

          <section className="border-t border-slate-200 p-5 sm:p-8">
            <Field label="Visit summary"><textarea rows={4} className={inputClass} value={activeVisit.summary} onChange={(e) => updateVisit((v) => ({ ...v, summary: e.target.value }))} placeholder="Summarise progress, concerns, decisions, and the next step." /></Field>
            <div className="mt-7 flex items-center justify-between gap-4"><h2 className="text-xl font-bold text-slate-950">Actions</h2><button type="button" onClick={addAction} className="print:hidden rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold">+ Add action</button></div>
            <div className="mt-3 space-y-3">
              {activeVisit.actions.length ? activeVisit.actions.map((action, index) => (
                <div key={action.id} className="rounded-xl bg-slate-50 p-3">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_160px_130px_150px]">
                    <input className={inputClass} value={action.text} onChange={(e) => updateVisit((v) => ({ ...v, actions: v.actions.map((a, i) => i === index ? { ...a, text: e.target.value } : a) }))} placeholder="What needs to happen?" />
                    <input className={inputClass} value={action.owner} onChange={(e) => updateVisit((v) => ({ ...v, actions: v.actions.map((a, i) => i === index ? { ...a, owner: e.target.value } : a) }))} placeholder="Responsible person" />
                    <select className={inputClass} value={action.priority} onChange={(e) => updateVisit((v) => ({ ...v, actions: v.actions.map((a, i) => i === index ? { ...a, priority: e.target.value } : a) }))}><option>Low</option><option>Normal</option><option>High</option><option>Urgent</option></select>
                    <input type="date" className={inputClass} value={action.dueDate} onChange={(e) => updateVisit((v) => ({ ...v, actions: v.actions.map((a, i) => i === index ? { ...a, dueDate: e.target.value } : a) }))} />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <select className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold" value={action.status} onChange={(e) => updateVisit((v) => ({ ...v, actions: v.actions.map((a, i) => i === index ? { ...a, status: e.target.value } : a) }))}><option>Open</option><option>In progress</option><option>Resolved</option></select>
                    <button type="button" onClick={() => updateVisit((v) => ({ ...v, actions: v.actions.filter((_, i) => i !== index) }))} className="print:hidden text-xs font-semibold text-rose-600">Delete action</button>
                  </div>
                </div>
              )) : <p className="text-sm text-slate-500">No follow-up actions recorded.</p>}
            </div>

            <div className="mt-8"><h2 className="text-xl font-bold text-slate-950">Site photos</h2><div className="mt-3 flex flex-wrap items-center gap-3"><label className="print:hidden inline-flex min-h-11 cursor-pointer items-center rounded-full bg-sky-600 px-5 py-3 text-sm font-semibold text-white"><input type="file" accept="image/*" capture="environment" multiple className="sr-only" onChange={addPhotos} />Add photos</label>{photoState ? <p className={`text-xs font-semibold ${photoState.includes("could not") ? "text-rose-700" : "text-slate-500"}`}>{photoState}</p> : null}</div></div>
            {activeVisit.photos.length ? <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">{activeVisit.photos.map((photo, index) => <figure key={photo.id} className="overflow-hidden rounded-xl border border-slate-200"><img src={photo.src} alt={photo.caption || photo.name} className="aspect-[4/3] w-full object-cover" /><div className="space-y-2 p-2"><input className="w-full border-0 px-1 py-1 text-sm outline-none" value={photo.caption} onChange={(e) => updateVisit((v) => ({ ...v, photos: v.photos.map((p, i) => i === index ? { ...p, caption: e.target.value } : p) }))} placeholder="Photo caption" /><select className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs" value={photo.linkedItem} onChange={(e) => updateVisit((v) => ({ ...v, photos: v.photos.map((p, i) => i === index ? { ...p, linkedItem: e.target.value } : p) }))}><option value="">General photo</option>{activeVisit.items.map((item) => <option key={item.label} value={item.label}>{item.label}</option>)}</select><div className="flex items-center justify-between"><div className="flex gap-2"><button type="button" disabled={index === 0} onClick={() => updateVisit((v) => { const photos = [...v.photos]; [photos[index - 1], photos[index]] = [photos[index], photos[index - 1]]; return { ...v, photos } })} className="text-xs font-semibold disabled:opacity-30">←</button><button type="button" disabled={index === activeVisit.photos.length - 1} onClick={() => updateVisit((v) => { const photos = [...v.photos]; [photos[index], photos[index + 1]] = [photos[index + 1], photos[index]]; return { ...v, photos } })} className="text-xs font-semibold disabled:opacity-30">→</button></div><button type="button" onClick={() => updateVisit((v) => ({ ...v, photos: v.photos.filter((_, i) => i !== index) }))} className="text-xs font-semibold text-rose-600">Delete</button></div></div></figure>)}</div> : null}

            <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4"><Field label="Acknowledged by"><input className={inputClass} value={activeVisit.acknowledgement} onChange={(e) => updateVisit((v) => ({ ...v, acknowledgement: e.target.value }))} placeholder="Client, contractor, or site representative" /></Field><p className="mt-3 text-xs leading-5 text-slate-500">This field records who received or reviewed the site findings. Formal digital signatures will follow in the production data phase.</p></div>
          </section>
        </article>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl p-3 sm:p-6 lg:p-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Smart Solutions project operations</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Projects and site records</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Create practical site-visit records, capture findings, assign actions, and keep each report under the correct company and system.</p></div>
          <div className="flex items-center gap-3">
            <SaveStateBadge state={saveState} />
            <button type="button" onClick={() => setShowProjectForm((current) => !current)} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white">{showProjectForm ? "Close" : "+ New project"}</button>
          </div>
        </div>
        {saveError ? <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">{saveError}</p> : null}
      </section>

      {showProjectForm ? <form onSubmit={addProject} className="mt-4 rounded-2xl border border-sky-200 bg-sky-50 p-5 sm:p-7"><h2 className="text-xl font-bold text-slate-950">Create a project record</h2><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Operating company"><select className={inputClass} value={projectForm.companyKey} onChange={(e) => setProjectForm((f) => ({ ...f, companyKey: e.target.value }))}>{COMPANY_OPTIONS.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}</select></Field>
        <Field label="Project name"><input required className={inputClass} value={projectForm.name} onChange={(e) => setProjectForm((f) => ({ ...f, name: e.target.value }))} /></Field>
        <Field label="Project number"><div className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-900">{nextProjectNumber}</div><p className="mt-1.5 text-xs text-slate-500">Generated automatically when the project is created.</p></Field>
        <Field label="Client"><input required className={inputClass} value={projectForm.clientName} onChange={(e) => setProjectForm((f) => ({ ...f, clientName: e.target.value }))} /></Field>
        <Field label="System or project type"><input className={inputClass} value={projectForm.system} onChange={(e) => setProjectForm((f) => ({ ...f, system: e.target.value }))} /></Field>
        <Field label="Site address"><input required className={inputClass} value={projectForm.address} onChange={(e) => setProjectForm((f) => ({ ...f, address: e.target.value }))} /></Field>
        <Field label="Site contact"><input className={inputClass} value={projectForm.siteContact} onChange={(e) => setProjectForm((f) => ({ ...f, siteContact: e.target.value }))} placeholder="Name and contact number" /></Field>
        <Field label="Contractor"><input className={inputClass} value={projectForm.contractor} onChange={(e) => setProjectForm((f) => ({ ...f, contractor: e.target.value }))} /></Field>
        <Field label="Project manager"><input className={inputClass} value={projectForm.projectManager} onChange={(e) => setProjectForm((f) => ({ ...f, projectManager: e.target.value }))} /></Field>
        <Field label="Project scope" wide><textarea rows={3} className={inputClass} value={projectForm.scope} onChange={(e) => setProjectForm((f) => ({ ...f, scope: e.target.value }))} placeholder="Short description of the agreed project scope" /></Field>
        <Field label="Drawing and document references"><textarea rows={3} className={inputClass} value={projectForm.references} onChange={(e) => setProjectForm((f) => ({ ...f, references: e.target.value }))} placeholder="Drawing numbers, revisions, estimate, purchase order, or contract references" /></Field>
      </div><button type="submit" className="mt-5 rounded-full bg-sky-700 px-5 py-3 text-sm font-semibold text-white">Create project</button></form> : null}

      <div className="mt-5 grid min-w-0 gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><div className="flex items-center justify-between gap-4"><div><h2 className="text-lg font-bold text-slate-950">Project register</h2><button type="button" onClick={() => setShowArchived((current) => !current)} className="mt-1 text-xs font-semibold text-slate-500 hover:text-slate-900">{showArchived ? "Show active projects" : `Archived (${projects.filter((project) => project.archived).length})`}</button></div><span className="text-sm text-slate-500">{visibleProjects.length}</span></div><div className="mt-4 space-y-2">{visibleProjects.length ? visibleProjects.map((project) => { const brand = COMPANY_OPTIONS.find((item) => item.key === project.companyKey) || COMPANY_OPTIONS[0]; return <button key={project.id} type="button" onClick={() => { setActiveProjectId(project.id); setActiveVisitId(null); setEditingProject(false) }} className={`w-full rounded-xl border p-4 text-left transition ${activeProjectId === project.id ? "border-sky-400 bg-sky-50" : "border-slate-200 hover:border-slate-300"}`}><div className="flex items-start justify-between gap-3"><div><p className="font-bold text-slate-950">{project.name}</p><p className="mt-1 text-sm text-slate-600">{project.clientName} · {project.projectNumber}</p></div><span className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white" style={{ backgroundColor: brand.accent }}>{brand.label}</span></div><p className="mt-3 text-xs text-slate-500">{project.system} · {project.visits?.length || 0} site records</p></button> }) : <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center"><p className="font-semibold text-slate-800">{showArchived ? "No archived projects" : "No projects yet"}</p><p className="mt-1 text-sm text-slate-500">{showArchived ? "Archived projects can be restored from here." : "Create the project you plan to visit next week."}</p></div>}</div></section>

        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          {activeProject ? (
            editingProject ? (
              <form onSubmit={saveProjectEdit}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">Edit project</p>
                    <h2 className="mt-1 text-2xl font-bold text-slate-950">{activeProject.name}</h2>
                  </div>
                  <button type="button" onClick={() => setEditingProject(false)} className="text-sm font-semibold text-slate-500">Cancel</button>
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <Field label="Operating company"><input readOnly className={`${inputClass} cursor-not-allowed bg-slate-100 text-slate-500`} value={COMPANY_OPTIONS.find((item) => item.key === editProjectForm.companyKey)?.label || editProjectForm.companyKey} /><p className="mt-1.5 text-xs text-slate-500">Company identity and numbering stay fixed after creation.</p></Field>
                  <Field label="Project name"><input required className={inputClass} value={editProjectForm.name} onChange={(e) => setEditProjectForm((form) => ({ ...form, name: e.target.value }))} /></Field>
                  <Field label="Project number"><input readOnly className={`${inputClass} cursor-not-allowed bg-slate-100 text-slate-500`} value={editProjectForm.projectNumber} /><p className="mt-1.5 text-xs text-slate-500">Stable project reference</p></Field>
                  <Field label="Client"><input required className={inputClass} value={editProjectForm.clientName} onChange={(e) => setEditProjectForm((form) => ({ ...form, clientName: e.target.value }))} /></Field>
                  <Field label="System or project type"><input className={inputClass} value={editProjectForm.system} onChange={(e) => setEditProjectForm((form) => ({ ...form, system: e.target.value }))} /></Field>
                  <Field label="Site address"><input required className={inputClass} value={editProjectForm.address} onChange={(e) => setEditProjectForm((form) => ({ ...form, address: e.target.value }))} /></Field>
                  <Field label="Site contact"><input className={inputClass} value={editProjectForm.siteContact} onChange={(e) => setEditProjectForm((form) => ({ ...form, siteContact: e.target.value }))} /></Field>
                  <Field label="Contractor"><input className={inputClass} value={editProjectForm.contractor} onChange={(e) => setEditProjectForm((form) => ({ ...form, contractor: e.target.value }))} /></Field>
                  <Field label="Project manager"><input className={inputClass} value={editProjectForm.projectManager} onChange={(e) => setEditProjectForm((form) => ({ ...form, projectManager: e.target.value }))} /></Field>
                  <Field label="Project scope" wide><textarea rows={3} className={inputClass} value={editProjectForm.scope} onChange={(e) => setEditProjectForm((form) => ({ ...form, scope: e.target.value }))} /></Field>
                  <Field label="Drawing and document references" wide><textarea rows={3} className={inputClass} value={editProjectForm.references} onChange={(e) => setEditProjectForm((form) => ({ ...form, references: e.target.value }))} /></Field>
                </div>
                <button type="submit" className="mt-5 rounded-full bg-sky-700 px-5 py-3 text-sm font-semibold text-white">Save project details</button>
              </form>
            ) : (
              <>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{company.label} · {activeProject.system}</p>
                    <h2 className="mt-1 text-2xl font-bold text-slate-950">{activeProject.name}</h2>
                    <p className="mt-2 text-sm text-slate-600">{activeProject.address}</p>
                    {activeProject.scope ? <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{activeProject.scope}</p> : null}
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={beginProjectEdit} className="text-xs font-semibold text-sky-700 hover:text-sky-900">Edit details</button>
                    <button type="button" onClick={() => archiveProject(activeProject.id)} className="text-xs font-semibold text-slate-500 hover:text-rose-600">{activeProject.archived ? "Restore project" : "Archive project"}</button>
                  </div>
                </div>
                <div className="mt-6 rounded-xl bg-slate-50 p-4">
                  <p className="text-sm font-bold text-slate-900">Start a site record</p>
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                    <select className={inputClass} value={visitType} onChange={(e) => setVisitType(e.target.value)}>{VISIT_TYPES.map((item) => <option key={item.label} value={item.label}>{item.recordType} · {item.label}</option>)}</select>
                    <button type="button" onClick={startVisit} className="shrink-0 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white">Start record</button>
                  </div>
                </div>
                <div className="mt-6">
                  <h3 className="font-bold text-slate-950">Site-record history</h3>
                  <div className="mt-3 space-y-2">
                    {activeProject.visits?.length ? activeProject.visits.map((visit) => (
                      <button key={visit.id} type="button" onClick={() => setActiveVisitId(visit.id)} className="flex w-full items-center justify-between gap-4 rounded-xl border border-slate-200 p-4 text-left hover:border-sky-300">
                        <div><p className="font-semibold text-slate-900">{visit.visitType}</p><p className="mt-1 text-xs text-slate-500">{visit.recordType} · {visit.visitNumber} · {visit.date}</p></div>
                        <div className="text-right"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{visit.recordState}</span><p className="mt-2 text-xs text-slate-500">{getVisitProgress(visit).percent}% complete</p></div>
                      </button>
                    )) : <p className="text-sm text-slate-500">No site records have been created for this project.</p>}
                  </div>
                </div>
              </>
            )
          ) : (
            <div className="flex min-h-72 items-center justify-center text-center"><div><p className="text-lg font-bold text-slate-900">Select a project</p><p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">Its site visits, inspections, actions, and reports will appear here.</p></div></div>
          )}
        </section>
      </div>
    </div>
  )
}
