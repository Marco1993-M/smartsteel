"use client"

import { useEffect, useDeferredValue, useState } from "react"
import {
  AlertTriangle,
  Building2,
  Check,
  ChevronRight,
  CircleDot,
  LocateFixed,
  Map,
  MapPin,
  Navigation,
  Search,
  RefreshCw,
  Truck,
  X,
} from "lucide-react"
import { getOsAuthHeaders } from "../../lib/osClientAuth"

const EMPTY_BRANCH = {
  status: "active",
  territory: "",
  deliveryZone: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  notes: "",
  latitude: "",
  longitude: "",
}

const STATUS_OPTIONS = [
  { value: "active", label: "Active branch" },
  { value: "pilot", label: "Atlas pilot" },
  { value: "paused", label: "Paused" },
  { value: "inactive", label: "Inactive" },
]

const PRETORIA_HUB = {
  name: "Smart Steel planning origin",
  detail: "Waverley, Pretoria",
  latitude: -25.7028,
  longitude: 28.2597,
}

const PLANNING_RADII_KM = [100, 200, 300]

const NETWORK_BOUNDS = {
  minLat: -29.15,
  maxLat: -24.75,
  minLng: 26.75,
  maxLng: 31.65,
}

function statusTone(status) {
  if (status === "pilot") return "border-amber-300 bg-amber-100 text-amber-900"
  if (status === "active") return "border-emerald-200 bg-emerald-50 text-emerald-700"
  return "border-slate-200 bg-slate-100 text-slate-600"
}

function statusLabel(status) {
  return STATUS_OPTIONS.find((option) => option.value === status)?.label || status
}

function branchPosition(branch, bounds) {
  if (branch.latitude === null || branch.longitude === null) return null
  const x = ((branch.longitude - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 84 + 8
  const y = ((bounds.maxLat - branch.latitude) / (bounds.maxLat - bounds.minLat)) * 78 + 11
  return { left: `${x}%`, top: `${y}%` }
}

function distanceFromHub(branch) {
  if (branch.latitude === null || branch.longitude === null) return null
  const toRadians = (value) => (value * Math.PI) / 180
  const earthRadiusKm = 6371
  const latitudeDelta = toRadians(branch.latitude - PRETORIA_HUB.latitude)
  const longitudeDelta = toRadians(branch.longitude - PRETORIA_HUB.longitude)
  const originLatitude = toRadians(PRETORIA_HUB.latitude)
  const branchLatitude = toRadians(branch.latitude)
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(originLatitude) *
      Math.cos(branchLatitude) *
      Math.sin(longitudeDelta / 2) ** 2
  return Math.round(earthRadiusKm * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine)))
}

function automaticPlanningZone(branch) {
  const distance = distanceFromHub(branch)
  if (distance === null) {
    return { code: "Review", label: "Location review", detail: "Coordinates required" }
  }
  if (distance <= 100) return { code: "A", label: "Zone A", detail: "Within 100 km" }
  if (distance <= 200) return { code: "B", label: "Zone B", detail: "101–200 km" }
  if (distance <= 300) return { code: "C", label: "Zone C", detail: "201–300 km" }
  return { code: "D", label: "Zone D", detail: "More than 300 km" }
}

function radiusStyle(radiusKm) {
  return {
    width: `min(${radiusKm / 4}%, ${radiusKm * 1.6}px)`,
    aspectRatio: "1 / 1",
  }
}

function Metric({ label, value, detail, tone = "slate", icon: Icon }) {
  const tones = {
    slate: "border-slate-200 bg-white",
    blue: "border-sky-200 bg-sky-50",
    amber: "border-amber-200 bg-amber-50",
  }

  return (
    <div className={`min-w-0 rounded-2xl border p-4 shadow-sm ${tones[tone]}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.17em] text-slate-500">{label}</p>
        {Icon ? <Icon className="h-4 w-4 text-slate-500" aria-hidden="true" /> : null}
      </div>
      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
      <p className="mt-1 text-xs leading-5 text-slate-600">{detail}</p>
    </div>
  )
}

export default function PartnerBranchesWorkspace() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [schemaReady, setSchemaReady] = useState(true)
  const [error, setError] = useState("")
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState("all")
  const [view, setView] = useState("list")
  const [selectedId, setSelectedId] = useState("")
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(EMPTY_BRANCH)
  const deferredQuery = useDeferredValue(query.trim().toLowerCase())

  async function loadRecords() {
    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/os/partner-branches?partnerKey=afgri", {
        cache: "no-store",
        headers: await getOsAuthHeaders(),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Could not load AFGRI branches.")
      setRecords(payload.records || [])
      setSchemaReady(payload.schemaReady !== false)
      setSelectedId((current) => current || payload.records?.[0]?.id || "")
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRecords()
  }, [])

  const selected = records.find((branch) => branch.id === selectedId) || null
  const mappedRecords = records.filter(
    (branch) => branch.latitude !== null && branch.longitude !== null
  )
  const pilotCount = records.filter((branch) => branch.status === "pilot").length
  const territoryCount = new Set(records.map((branch) => branch.territory).filter(Boolean)).size
  const bounds = NETWORK_BOUNDS
  const hubPosition = branchPosition(PRETORIA_HUB, bounds)
  const selectedDistance = selected ? distanceFromHub(selected) : null
  const selectedAutomaticZone = selected ? automaticPlanningZone(selected) : null

  const filteredRecords = records.filter((branch) => {
    const matchesQuery =
      !deferredQuery ||
      `${branch.name} ${branch.branchCode} ${branch.address} ${branch.territory} ${branch.deliveryZone} ${branch.contactName} ${branch.contactEmail} ${branch.contactPhone}`
        .toLowerCase()
        .includes(deferredQuery)
    const matchesFilter =
      filter === "all" ||
      (filter === "mapped" && branch.coordinateStatus === "verified") ||
      (filter === "needs_review" && branch.coordinateStatus !== "verified") ||
      branch.status === filter
    return matchesQuery && matchesFilter
  })

  function openEditor(branch) {
    setSelectedId(branch.id)
    setForm({
      status: branch.status,
      territory: branch.territory,
      deliveryZone: branch.deliveryZone,
      contactName: branch.contactName,
      contactEmail: branch.contactEmail,
      contactPhone: branch.contactPhone,
      notes: branch.notes,
      latitude: branch.latitude ?? "",
      longitude: branch.longitude ?? "",
    })
    setEditing(true)
  }

  async function saveBranch(event) {
    event.preventDefault()
    if (!selected) return
    setSaving(true)
    setError("")
    try {
      const response = await fetch("/api/os/partner-branches", {
        method: "PATCH",
        headers: await getOsAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ id: selected.id, ...form }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Could not save branch.")
      setRecords((current) =>
        current.map((branch) => (branch.id === payload.record.id ? payload.record : branch))
      )
      setEditing(false)
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-w-0 space-y-5 px-4 py-5 sm:px-6 sm:py-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-xl font-bold tracking-tight text-[#001d2e]">AFGRI branch network</h2><p className="mt-1 text-sm text-slate-500">Find branch contacts, manage rollout status and plan coverage.</p></div>
        <button type="button" disabled={loading} onClick={loadRecords} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />Refresh</button>
      </header>

      {!schemaReady ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
          The verified AFGRI branch register is live in preview mode. Run the partner branch SQL to
          save territories, contacts, pilot status, and routing notes for the whole team.
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Metric label="Network" value={loading ? "—" : records.length} detail="AFGRI retail locations" icon={Building2} />
        <Metric label="Mapped" value={loading ? "—" : mappedRecords.length} detail="Coordinates available" tone="blue" icon={MapPin} />
        <Metric label="Pilot branches" value={loading ? "—" : pilotCount} detail="Selected for Atlas rollout" icon={CircleDot} />
        <Metric
          label="Territories"
          value={loading ? "—" : territoryCount}
          detail={territoryCount ? "Delivery areas assigned" : "Ready to be assigned"}
          tone={territoryCount ? "blue" : "amber"}
          icon={Truck}
        />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Branch directory</p>
            <h3 className="mt-1 text-base font-bold text-[#001d2e]">{loading ? "Loading branches…" : `${filteredRecords.length} branches`}</h3>
          </div>
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
            <label className="relative min-w-0 sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <span className="sr-only">Search branches</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Branch, contact or location…"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-base text-slate-900 outline-none transition focus:border-[#0043f3] focus:bg-white sm:text-sm"
              />
            </label>
            <select
              aria-label="Filter branches"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#0043f3]"
            >
              <option value="all">All locations</option>
              <option value="active">Active branches</option>
              <option value="pilot">Atlas pilot</option>
              <option value="inactive">Inactive branches</option>
              <option value="mapped">Verified coordinates</option>
              <option value="needs_review">Needs location review</option>
              <option value="paused">Paused</option>
            </select>
            <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                aria-pressed={view === "network"}
                onClick={() => setView("network")}
                className={`rounded-lg px-3 py-2 text-xs font-semibold ${view === "network" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"}`}
              >
                Coverage
              </button>
              <button
                type="button"
                aria-pressed={view === "list"}
                onClick={() => setView("list")}
                className={`rounded-lg px-3 py-2 text-xs font-semibold ${view === "list" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"}`}
              >
                Directory
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-sm text-slate-500">Loading AFGRI branch records...</div>
        ) : view === "network" ? (
          <div className="grid min-w-0 gap-0 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
            <div className="min-w-0 border-b border-slate-200 p-4 sm:p-5 xl:border-b-0 xl:border-r">
              <div className="relative min-h-[420px] overflow-hidden rounded-2xl border border-slate-200 bg-[radial-gradient(circle_at_center,_rgba(14,165,233,0.08),_transparent_55%),linear-gradient(180deg,_#f8fafc,_#eef4f8)] sm:min-h-[560px]">
                <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(148,163,184,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.2)_1px,transparent_1px)] [background-size:44px_44px]" />
                <div className="absolute left-4 top-4 rounded-xl border border-white/80 bg-white/90 px-3 py-2 shadow-sm backdrop-blur">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <Map className="h-4 w-4 text-sky-600" />
                    Indicative coverage
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">Schematic only · distances are straight-line estimates</p>
                </div>
                {PLANNING_RADII_KM.slice().reverse().map((radius) => (
                  <div
                    key={radius}
                    style={{
                      ...hubPosition,
                      ...radiusStyle(radius),
                    }}
                    className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-dashed border-sky-500/30 bg-sky-400/[0.025]"
                  >
                    <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-200 bg-white/95 px-2 py-0.5 text-[9px] font-bold text-sky-800 shadow-sm">
                      {radius} km
                    </span>
                  </div>
                ))}
                <div
                  style={hubPosition}
                  className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
                >
                  <div className="relative flex h-7 w-7 items-center justify-center rounded-full border-4 border-white bg-slate-950 shadow-lg ring-4 ring-sky-400/25">
                    <Navigation className="h-3 w-3 fill-white text-white" aria-hidden="true" />
                    <span className="absolute left-1/2 top-8 w-max -translate-x-1/2 rounded-lg bg-slate-950 px-2.5 py-1.5 text-[10px] font-semibold text-white shadow-xl">
                      Smart Steel · Waverley
                    </span>
                  </div>
                </div>
                {mappedRecords.map((branch) => {
                  const position = branchPosition(branch, bounds)
                  const active = branch.id === selectedId
                  const visible = filteredRecords.some((record) => record.id === branch.id)
                  return (
                    <button
                      key={branch.id}
                      type="button"
                      onClick={() => setSelectedId(branch.id)}
                      style={position}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 transition ${
                        visible ? "opacity-100" : "pointer-events-none opacity-10"
                      }`}
                      aria-label={`Open ${branch.name} branch`}
                    >
                      <span
                        className={`block rounded-full border-2 shadow-md transition ${
                          active
                            ? "h-5 w-5 border-white bg-amber-400 ring-4 ring-amber-300/30"
                            : branch.status === "pilot"
                              ? "h-4 w-4 border-white bg-amber-400 hover:scale-125"
                              : "h-3.5 w-3.5 border-white bg-sky-600 hover:scale-125"
                        }`}
                      />
                      {active ? (
                        <span className="absolute left-1/2 top-7 w-max max-w-40 -translate-x-1/2 rounded-lg bg-slate-950 px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-xl">
                          {branch.name} · {branch.branchCode}
                        </span>
                      ) : null}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="min-w-0 p-4 sm:p-5">
              {selected ? (
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0043f3]">
                        Branch {selected.branchCode}
                      </p>
                      <h4 className="mt-2 text-2xl font-bold text-slate-950">{selected.name}</h4>
                    </div>
                    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${statusTone(selected.status)}`}>
                      {statusLabel(selected.status)}
                    </span>
                  </div>
                  <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                      <p className="text-sm leading-6 text-slate-700">{selected.address}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-4 rounded-2xl border border-sky-200 bg-sky-50 p-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#0043f3]">
                        From Waverley, Pretoria
                      </p>
                      <p className="mt-1 text-2xl font-bold text-slate-950">
                        {selectedDistance === null ? "Not mapped" : `~${selectedDistance} km`}
                      </p>
                    </div>
                    <Navigation className="h-5 w-5 text-[#0043f3]" aria-hidden="true" />
                  </div>
                  <dl className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-slate-200 p-3">
                      <dt className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">Territory</dt>
                      <dd className="mt-1 text-sm font-semibold text-slate-900">{selected.territory || "Unassigned"}</dd>
                    </div>
                    <div className="rounded-xl border border-slate-200 p-3">
                      <dt className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">Planning zone</dt>
                      <dd className="mt-1 text-sm font-semibold text-slate-900">
                        {selected.deliveryZone || selectedAutomaticZone?.label}
                      </dd>
                      <dd className="mt-0.5 text-[11px] text-slate-500">
                        {selected.deliveryZone ? "Manual override" : selectedAutomaticZone?.detail}
                      </dd>
                    </div>
                    <div className="col-span-2 rounded-xl border border-slate-200 p-3">
                      <dt className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">Branch contact</dt>
                      <dd className="mt-1 text-sm font-semibold text-slate-900">{selected.contactName || "Not captured yet"}</dd>
                    </div>
                  </dl>
                  {selected.coordinateStatus !== "verified" ? (
                    <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                      Confirm this branch’s coordinates before route planning.
                    </div>
                  ) : null}
                  {selected.contactEmail ? <a href={`mailto:${selected.contactEmail}`} className="mt-3 block break-all text-sm font-semibold text-[#0043f3]">{selected.contactEmail}</a> : null}
                  {selected.contactPhone ? <a href={`tel:${selected.contactPhone}`} className="mt-2 block text-sm font-semibold text-[#0043f3]">{selected.contactPhone}</a> : null}
                  {selected.notes ? <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600">{selected.notes}</p> : null}
                  <button
                    type="button"
                    onClick={() => openEditor(selected)}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Update branch record <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <p className="text-sm text-slate-500">Select a branch to inspect its record.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredRecords.map((branch) => (
              <button
                key={branch.id}
                type="button"
                onClick={() => openEditor(branch)}
                className="grid w-full gap-3 p-4 text-left transition hover:bg-slate-50 lg:grid-cols-[70px_minmax(0,1fr)_minmax(0,0.8fr)_150px_24px] sm:items-center sm:px-5"
              >
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#0043f3]">{branch.branchCode}</span>
                <span className="min-w-0">
                  <span className="block font-semibold text-slate-950">{branch.name}</span>
                  <span className="mt-1 block truncate text-sm text-slate-500">{branch.address}</span>
                </span>
                <span className="min-w-0 text-sm"><span className="block font-medium text-slate-700">{branch.contactName || "Contact not captured"}</span><span className="mt-1 block truncate text-xs text-slate-500">{branch.contactEmail || branch.contactPhone || "Add a branch contact"}</span></span>
                <span className={`w-fit rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${statusTone(branch.status)}`}>
                  {statusLabel(branch.status)}
                </span>
                <ChevronRight className="hidden h-4 w-4 text-slate-400 sm:block" />
              </button>
            ))}
            {!filteredRecords.length ? (
              <div className="p-8 text-center text-sm text-slate-500">No branches match this view.</div>
            ) : null}
          </div>
        )}
      </section>

      {editing && selected ? (
        <div className="fixed inset-0 z-[80] flex items-end justify-end bg-slate-950/45 p-0 backdrop-blur-sm sm:p-4">
          <button
            type="button"
            className="absolute inset-0"
            onClick={() => setEditing(false)}
            aria-label="Close branch editor"
          />
          <form
            onSubmit={saveBranch}
            className="relative flex max-h-[94dvh] w-full flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl sm:max-w-xl sm:rounded-[28px]"
          >
            <div className="flex items-start justify-between border-b border-slate-200 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0043f3]">
                  Branch {selected.branchCode}
                </p>
                <h3 className="mt-1 text-2xl font-bold text-slate-950">{selected.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-full bg-slate-100 p-2 text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
              {error ? <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Network status</span>
                <select
                  value={form.status}
                  onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
                  className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-3 text-base text-slate-900 outline-none focus:border-[#0043f3]"
                >
                  {STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Territory</span>
                  <input value={form.territory} onChange={(event) => setForm((current) => ({ ...current, territory: event.target.value }))} placeholder="e.g. Highveld East" className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-3 text-base outline-none focus:border-[#0043f3]" />
                </label>
                <label>
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Planning-zone override</span>
                  <input value={form.deliveryZone} onChange={(event) => setForm((current) => ({ ...current, deliveryZone: event.target.value }))} placeholder={automaticPlanningZone(selected).label} className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-3 text-base outline-none focus:border-[#0043f3]" />
                  <span className="mt-1 block text-xs text-slate-500">
                    Leave blank to use {automaticPlanningZone(selected).label} automatically.
                  </span>
                </label>
              </div>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Branch contact</span>
                <input value={form.contactName} onChange={(event) => setForm((current) => ({ ...current, contactName: event.target.value }))} placeholder="Contact name" className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-3 text-base outline-none focus:border-[#0043f3]" />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Email</span>
                  <input type="email" value={form.contactEmail} onChange={(event) => setForm((current) => ({ ...current, contactEmail: event.target.value }))} className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-3 text-base outline-none focus:border-[#0043f3]" />
                </label>
                <label>
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Phone</span>
                  <input value={form.contactPhone} onChange={(event) => setForm((current) => ({ ...current, contactPhone: event.target.value }))} className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-3 text-base outline-none focus:border-[#0043f3]" />
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Latitude</span>
                  <input type="number" step="any" value={form.latitude} onChange={(event) => setForm((current) => ({ ...current, latitude: event.target.value }))} className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-3 text-base outline-none focus:border-[#0043f3]" />
                </label>
                <label>
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Longitude</span>
                  <input type="number" step="any" value={form.longitude} onChange={(event) => setForm((current) => ({ ...current, longitude: event.target.value }))} className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-3 text-base outline-none focus:border-[#0043f3]" />
                </label>
              </div>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Operational notes</span>
                <textarea value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} rows={4} placeholder="Pilot readiness, delivery access, local opportunities..." className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-base outline-none focus:border-[#0043f3]" />
              </label>
            </div>
            <div className="flex gap-3 border-t border-slate-200 bg-white p-4">
              <button type="button" onClick={() => setEditing(false)} className="h-12 flex-1 rounded-xl border border-slate-200 font-semibold text-slate-700">Cancel</button>
              <button type="submit" disabled={saving || !schemaReady} className="inline-flex h-12 flex-[1.4] items-center justify-center gap-2 rounded-xl bg-slate-950 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
                <Check className="h-4 w-4" /> {saving ? "Saving..." : "Save branch"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  )
}
