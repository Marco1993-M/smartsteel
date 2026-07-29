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
  Store,
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
  minLng: 25,
  maxLng: 31.55,
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

function radiusStyle(radiusKm, bounds) {
  const latitudeRadius = radiusKm / 111.32
  const longitudeRadius =
    radiusKm / (111.32 * Math.cos((PRETORIA_HUB.latitude * Math.PI) / 180))
  const width = (longitudeRadius * 2 * 84) / (bounds.maxLng - bounds.minLng)
  const height = (latitudeRadius * 2 * 78) / (bounds.maxLat - bounds.minLat)
  return {
    width: `${width}%`,
    height: `${height}%`,
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
  const [view, setView] = useState("network")
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

  const filteredRecords = records.filter((branch) => {
    const matchesQuery =
      !deferredQuery ||
      `${branch.name} ${branch.branchCode} ${branch.address} ${branch.territory} ${branch.deliveryZone}`
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
      <section className="overflow-hidden rounded-[28px] border border-slate-800 bg-[radial-gradient(circle_at_80%_10%,_rgba(56,189,248,0.18),_transparent_30%),linear-gradient(135deg,_#07111f_0%,_#0f2740_55%,_#102033_100%)] text-white shadow-xl">
        <div className="relative grid gap-6 p-5 sm:p-7 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)] xl:items-end">
          <div className="absolute inset-x-0 top-[58%] h-px bg-gradient-to-r from-transparent via-sky-300/50 to-transparent" />
          <div className="relative">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-sky-300/30 bg-sky-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-100">
                Strategic partner network
              </span>
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-200">
                AFGRI Retail
              </span>
            </div>
            <h3 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">
              Turn branch reach into a working delivery network.
            </h3>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              One operational view for AFGRI locations, pilot branches, branch contacts, territories,
              and the delivery planning data we will use as the partnership grows.
            </p>
          </div>
          <div className="relative grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/7 p-4 backdrop-blur">
              <Store className="h-5 w-5 text-sky-200" aria-hidden="true" />
              <p className="mt-3 text-3xl font-bold">{records.length || "—"}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-300">Retail branches</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/7 p-4 backdrop-blur">
              <LocateFixed className="h-5 w-5 text-amber-300" aria-hidden="true" />
              <p className="mt-3 text-3xl font-bold">{mappedRecords.length || "—"}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-300">Route-ready</p>
            </div>
          </div>
        </div>
      </section>

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
        <Metric label="Network" value={records.length} detail="AFGRI retail locations" icon={Building2} />
        <Metric label="Mapped" value={mappedRecords.length} detail="Coordinates available" tone="blue" icon={MapPin} />
        <Metric label="Pilot branches" value={pilotCount} detail="Selected for Atlas rollout" icon={CircleDot} />
        <Metric
          label="Territories"
          value={territoryCount}
          detail={territoryCount ? "Delivery areas assigned" : "Ready to be assigned"}
          tone={territoryCount ? "blue" : "amber"}
          icon={Truck}
        />
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Branch directory</p>
            <h3 className="mt-1 text-xl font-bold text-slate-950">AFGRI network</h3>
          </div>
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
            <label className="relative min-w-0 sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <span className="sr-only">Search branches</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Branch, number, address..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-base text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white sm:text-sm"
              />
            </label>
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none focus:border-sky-400"
            >
              <option value="all">All locations</option>
              <option value="pilot">Atlas pilot</option>
              <option value="mapped">Mapped</option>
              <option value="needs_review">Needs location review</option>
              <option value="paused">Paused</option>
            </select>
            <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setView("network")}
                className={`rounded-lg px-3 py-2 text-xs font-semibold ${view === "network" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"}`}
              >
                Network
              </button>
              <button
                type="button"
                onClick={() => setView("list")}
                className={`rounded-lg px-3 py-2 text-xs font-semibold ${view === "list" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"}`}
              >
                List
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
                    Pretoria planning radii
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">Straight-line distance, not driving distance</p>
                </div>
                {PLANNING_RADII_KM.slice().reverse().map((radius) => (
                  <div
                    key={radius}
                    style={{
                      ...hubPosition,
                      ...radiusStyle(radius, bounds),
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
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
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
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-700">
                        From Waverley, Pretoria
                      </p>
                      <p className="mt-1 text-2xl font-bold text-slate-950">
                        {selectedDistance === null ? "Not mapped" : `~${selectedDistance} km`}
                      </p>
                    </div>
                    <Navigation className="h-5 w-5 text-sky-700" aria-hidden="true" />
                  </div>
                  <dl className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-slate-200 p-3">
                      <dt className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">Territory</dt>
                      <dd className="mt-1 text-sm font-semibold text-slate-900">{selected.territory || "Unassigned"}</dd>
                    </div>
                    <div className="rounded-xl border border-slate-200 p-3">
                      <dt className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">Delivery zone</dt>
                      <dd className="mt-1 text-sm font-semibold text-slate-900">{selected.deliveryZone || "Unassigned"}</dd>
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
                className="grid w-full gap-3 p-4 text-left transition hover:bg-slate-50 sm:grid-cols-[80px_minmax(0,1fr)_180px_32px] sm:items-center sm:px-5"
              >
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700">{branch.branchCode}</span>
                <span className="min-w-0">
                  <span className="block font-semibold text-slate-950">{branch.name}</span>
                  <span className="mt-1 block truncate text-sm text-slate-500">{branch.address}</span>
                </span>
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

      <section className="grid gap-4 lg:grid-cols-3">
        {[
          {
            icon: CircleDot,
            title: "Choose the pilot",
            copy: "Mark the branches that will introduce Atlas first, then keep rollout ownership visible.",
          },
          {
            icon: Navigation,
            title: "Build delivery territories",
            copy: "Group branches into practical delivery zones before we calculate depot-to-branch and branch-to-site routes.",
          },
          {
            icon: Truck,
            title: "Connect commercial activity",
            copy: "The same branch IDs can later connect leads, estimates, projects, stock, training, and deliveries.",
          },
        ].map(({ icon: Icon, title, copy }) => (
          <div key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Icon className="h-5 w-5 text-sky-700" />
            <h4 className="mt-4 font-bold text-slate-950">{title}</h4>
            <p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p>
          </div>
        ))}
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
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
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
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Network status</span>
                <select
                  value={form.status}
                  onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
                  className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-3 text-base text-slate-900 outline-none focus:border-sky-400"
                >
                  {STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Territory</span>
                  <input value={form.territory} onChange={(event) => setForm((current) => ({ ...current, territory: event.target.value }))} placeholder="e.g. Highveld East" className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-3 text-base outline-none focus:border-sky-400" />
                </label>
                <label>
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Delivery zone</span>
                  <input value={form.deliveryZone} onChange={(event) => setForm((current) => ({ ...current, deliveryZone: event.target.value }))} placeholder="e.g. Zone A" className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-3 text-base outline-none focus:border-sky-400" />
                </label>
              </div>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Branch contact</span>
                <input value={form.contactName} onChange={(event) => setForm((current) => ({ ...current, contactName: event.target.value }))} placeholder="Contact name" className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-3 text-base outline-none focus:border-sky-400" />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Email</span>
                  <input type="email" value={form.contactEmail} onChange={(event) => setForm((current) => ({ ...current, contactEmail: event.target.value }))} className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-3 text-base outline-none focus:border-sky-400" />
                </label>
                <label>
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Phone</span>
                  <input value={form.contactPhone} onChange={(event) => setForm((current) => ({ ...current, contactPhone: event.target.value }))} className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-3 text-base outline-none focus:border-sky-400" />
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Latitude</span>
                  <input type="number" step="any" value={form.latitude} onChange={(event) => setForm((current) => ({ ...current, latitude: event.target.value }))} className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-3 text-base outline-none focus:border-sky-400" />
                </label>
                <label>
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Longitude</span>
                  <input type="number" step="any" value={form.longitude} onChange={(event) => setForm((current) => ({ ...current, longitude: event.target.value }))} className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-3 text-base outline-none focus:border-sky-400" />
                </label>
              </div>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Operational notes</span>
                <textarea value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} rows={4} placeholder="Pilot readiness, delivery access, local opportunities..." className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-base outline-none focus:border-sky-400" />
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
