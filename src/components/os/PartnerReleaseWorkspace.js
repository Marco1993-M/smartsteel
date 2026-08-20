"use client"

import { useEffect, useState } from "react"
import { BadgeCheck, CalendarDays, CheckCircle2, LockKeyhole, PackageCheck, Send, ShieldCheck } from "lucide-react"
import { getOsAuthHeaders } from "../../lib/osClientAuth"
import { buildPartnerSafeAtlasRelease } from "../../lib/partnerAtlasRelease"
import { ATLAS_LENGTH_OPTIONS, ATLAS_HEIGHT_OPTIONS } from "../../lib/atlasConfiguration"
import {
  ATLAS_WAREHOUSE_SHEETING_OPTIONS,
  ATLAS_WAREHOUSE_STEEL_FINISH_OPTIONS,
  ATLAS_WAREHOUSE_WIDTH_OPTIONS,
} from "../../lib/estimates/atlasWarehouseOptions"

const DEFAULT_FORM = {
  width: 8,
  length: 20,
  wallHeight: 3,
  steelFinish: "ZAM",
  gableMode: "structure_only",
  sheetingProfile: "IBR",
  sheetingFinish: "galvanised",
  sheetingColor: "galvanised",
  approvedBy: "",
  validFrom: new Date().toISOString().slice(0, 10),
  validUntil: "",
}

function money(value) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(Number(value) || 0)
}

function SelectField({ label, value, onChange, children }) {
  return (
    <label className="block min-w-0">
      <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">{label}</span>
      <select value={value} onChange={onChange} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-blue-500">
        {children}
      </select>
    </label>
  )
}

export default function PartnerReleaseWorkspace() {
  const [records, setRecords] = useState([])
  const [form, setForm] = useState(DEFAULT_FORM)
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const preview = buildPartnerSafeAtlasRelease(form)

  async function loadRecords() {
    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/os/partner-releases?partner=afgri", {
        cache: "no-store",
        headers: await getOsAuthHeaders(),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Could not load partner releases.")
      setRecords(payload.records || [])
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRecords()
  }, [])

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
    setSuccess("")
  }

  async function publishRelease(event) {
    event.preventDefault()
    if (!form.approvedBy.trim()) {
      setError("Record who approved this commercial release before publishing it.")
      return
    }
    setPublishing(true)
    setError("")
    setSuccess("")
    try {
      const response = await fetch("/api/os/partner-releases", {
        method: "POST",
        headers: await getOsAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          partnerKey: "afgri",
          approvedBy: form.approvedBy,
          validFrom: form.validFrom,
          validUntil: form.validUntil || null,
          configuration: form,
        }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Could not publish the partner release.")
      setSuccess(`${payload.productRelease.name} was published to the AFGRI release register.`)
      await loadRecords()
    } catch (publishError) {
      setError(publishError.message)
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div className="min-w-0 space-y-5 px-4 py-5 sm:px-6 sm:py-6">
      <section className="overflow-hidden rounded-[28px] border border-[#0043f3] bg-[linear-gradient(130deg,#001d2e_0%,#063379_54%,#0043f3_100%)] text-white shadow-xl">
        <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#c1d9e5]">
              <LockKeyhole className="h-4 w-4" /> Controlled commercial publishing
            </div>
            <h2 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">Release only what AFGRI is approved to sell.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">Every published configuration receives an immutable product snapshot, final indicative amount, approver and validity period.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="border border-white/20 bg-white/10 p-4 backdrop-blur">
              <p className="text-3xl font-bold">{records.length}</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-100">Released snapshots</p>
            </div>
            <div className="border border-white/20 bg-white/10 p-4 backdrop-blur">
              <ShieldCheck className="h-6 w-6 text-[#c1d9e5]" />
              <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-100">Costs remain protected</p>
            </div>
          </div>
        </div>
      </section>

      {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</div> : null}
      {success ? <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"><CheckCircle2 className="h-4 w-4" />{success}</div> : null}

      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(420px,1.05fr)]">
        <form onSubmit={publishRelease} className="min-w-0 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-600">New release</p>
              <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Configure the pilot snapshot</h3>
            </div>
            <PackageCheck className="h-7 w-7 text-blue-600" />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <SelectField label="Atlas product" value={form.width} onChange={(event) => update("width", Number(event.target.value))}>
              {ATLAS_WAREHOUSE_WIDTH_OPTIONS.map((width) => <option key={width} value={width}>W{String(width).padStart(2, "0")} · {width}m span</option>)}
            </SelectField>
            <SelectField label="Length" value={form.length} onChange={(event) => update("length", Number(event.target.value))}>
              {ATLAS_LENGTH_OPTIONS.map((length) => <option key={length} value={length}>{length}m · {length / 4} bays</option>)}
            </SelectField>
            <SelectField label="Eave height" value={form.wallHeight} onChange={(event) => update("wallHeight", Number(event.target.value))}>
              {ATLAS_HEIGHT_OPTIONS.map((height) => <option key={height} value={height}>{height}m</option>)}
            </SelectField>
            <SelectField label="Steel finish" value={form.steelFinish} onChange={(event) => update("steelFinish", event.target.value)}>
              {ATLAS_WAREHOUSE_STEEL_FINISH_OPTIONS.map((finish) => <option key={finish}>{finish}</option>)}
            </SelectField>
            <SelectField label="Sheeting scope" value={form.gableMode} onChange={(event) => update("gableMode", event.target.value)}>
              {ATLAS_WAREHOUSE_SHEETING_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </SelectField>
            {form.gableMode !== "structure_only" ? (
              <SelectField label="Sheeting profile" value={form.sheetingProfile} onChange={(event) => update("sheetingProfile", event.target.value)}>
                {["Corrugated", "IBR", "Concealed Fix"].map((profile) => <option key={profile}>{profile}</option>)}
              </SelectField>
            ) : null}
          </div>

          <div className="my-6 h-px bg-slate-200" />
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Approved by</span>
              <input value={form.approvedBy} onChange={(event) => update("approvedBy", event.target.value)} placeholder="Name of commercial approver" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500" />
            </label>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Valid from</span>
              <input type="date" value={form.validFrom} onChange={(event) => update("validFrom", event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500" />
            </label>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Valid until</span>
              <input type="date" value={form.validUntil} min={form.validFrom} onChange={(event) => update("validUntil", event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500" />
            </label>
          </div>

          <button disabled={publishing} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0043f3] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#0036c4] disabled:cursor-wait disabled:opacity-60">
            <Send className="h-4 w-4" /> {publishing ? "Publishing release..." : "Publish approved snapshot"}
          </button>
        </form>

        <div className="min-w-0 space-y-5">
          <section className="border border-[#0043f3] bg-[#c1d9e5] p-5 sm:p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0043f3]">Partner-safe preview</p>
            <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold tracking-tight text-[#001d2e]">{preview.summary.product}</h3>
                <p className="mt-1 text-sm font-semibold text-slate-700">{preview.summary.size} · {preview.summary.structure}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold tracking-tight text-[#001d2e]">{money(preview.commercial.amountExVat)}</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">Indicative · excl. VAT</p>
              </div>
            </div>
            <div className="mt-5 grid gap-px bg-blue-300 sm:grid-cols-3">
              {[["Reference", preview.configurationReference], ["Pricing release", preview.sourcePricingRelease], ["Scope", "Supply only"]].map(([label, value]) => (
                <div key={label} className="bg-white/75 p-3"><p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">{label}</p><p className="mt-1 break-words text-xs font-bold text-slate-900">{value}</p></div>
              ))}
            </div>
          </section>

          <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between gap-4"><div><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Release register</p><h3 className="mt-2 text-xl font-bold text-slate-950">AFGRI commercial snapshots</h3></div><BadgeCheck className="h-6 w-6 text-blue-600" /></div>
            <div className="mt-5 space-y-3">
              {loading ? <p className="text-sm text-slate-500">Loading releases...</p> : records.length === 0 ? <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">No configurations have been released yet.</p> : records.map((record) => (
                <article key={record.id} className="grid gap-3 rounded-xl border border-slate-200 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div><div className="flex flex-wrap items-center gap-2"><p className="font-bold text-slate-950">{record.name}</p><span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-emerald-700">{record.status}</span></div><p className="mt-1 text-xs text-slate-500">Release {record.releaseVersion} · {record.priceRelease?.configurationKey || "Price pending"}</p></div>
                  <div className="sm:text-right"><p className="font-bold text-slate-950">{record.priceRelease ? money(record.priceRelease.amountExVat) : "—"}</p><p className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-slate-500 sm:justify-end"><CalendarDays className="h-3 w-3" /> From {record.validFrom}</p></div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

