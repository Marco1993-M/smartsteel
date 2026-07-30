"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { AlertTriangle, Check, ChevronDown, ChevronUp, Save, Scale } from "lucide-react"
import { getOsAuthHeaders } from "../../lib/osClientAuth"
import { getAtlasProduct, withAtlasProduct } from "../../lib/atlasProductRange"
import { matchLippedChannelProfile } from "../../lib/atlasLippedChannelProfiles"
import AtlasModuleHero from "./AtlasModuleHero"

const STATUS_LABELS = {
  draft: "Draft",
  needs_review: "Needs review",
  confirmed: "Confirmed",
  superseded: "Superseded",
}

function formatRate(value, unit) {
  if (value === "" || value === null || value === undefined) return "Not set"
  return `R ${Number(value).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / ${unit}`
}

function materialValuePerM(massKgPerM, ratePerTon) {
  const mass = Number(massKgPerM)
  const rate = Number(ratePerTon)
  if (!Number.isFinite(mass) || !Number.isFinite(rate)) return null
  return (mass * rate) / 1000
}

function Field({ label, children, wide = false }) {
  return (
    <label className={wide ? "md:col-span-2" : ""}>
      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">{label}</span>
      {children}
    </label>
  )
}

const inputClass = "mt-1.5 w-full border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"

export default function AtlasPricingWorkspace() {
  const searchParams = useSearchParams()
  const productCode = getAtlasProduct(searchParams.get("product"))?.code || "W08"
  const product = getAtlasProduct(productCode)
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [schemaReady, setSchemaReady] = useState(true)
  const [profiles, setProfiles] = useState([])
  const [profileSchemaReady, setProfileSchemaReady] = useState(true)
  const [expandedId, setExpandedId] = useState("")
  const [savingId, setSavingId] = useState("")
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  useEffect(() => {
    let active = true
    async function loadPricing() {
      setLoading(true)
      setError("")
      try {
        const headers = await getOsAuthHeaders()
        const [response, profilesResponse] = await Promise.all([
          fetch(`/api/os/atlas-pricing?product=${encodeURIComponent(productCode)}`, {
            cache: "no-store",
            headers,
          }),
          fetch("/api/os/atlas-profiles", { cache: "no-store", headers }),
        ])
        const [payload, profilesPayload] = await Promise.all([
          response.json(),
          profilesResponse.json(),
        ])
        if (!response.ok) throw new Error(payload.error || "Could not load Atlas pricing.")
        if (!profilesResponse.ok) throw new Error(profilesPayload.error || "Could not load Atlas profiles.")
        if (active) {
          setRecords(
            (payload.records || []).map((record) => {
              const matchedProfile =
                profilesPayload.records?.find((profile) => profile.id === record.profileId) ||
                matchLippedChannelProfile(record.profileSpec, profilesPayload.records || [])
              return matchedProfile && !record.profileId
                ? { ...record, profileId: matchedProfile.id }
                : record
            })
          )
          setSchemaReady(payload.schemaReady !== false)
          setProfiles(profilesPayload.records || [])
          setProfileSchemaReady(profilesPayload.schemaReady !== false)
        }
      } catch (loadError) {
        if (active) setError(loadError.message)
      } finally {
        if (active) setLoading(false)
      }
    }
    loadPricing()
    return () => { active = false }
  }, [productCode])

  const confirmedCount = records.filter((record) => record.status === "confirmed").length
  const missingMassCount = records.filter((record) => record.pricingUnit === "ton" && record.massKgPerM === "").length
  const groupedRecords = useMemo(() => Object.entries(records.reduce((groups, record) => {
    groups[record.category] = [...(groups[record.category] || []), record]
    return groups
  }, {})), [records])

  function updateRecord(id, field, value) {
    setRecords((current) => current.map((record) => record.id === id ? { ...record, [field]: value } : record))
  }

  function selectPricingProfile(recordId, profileId) {
    if (!profileId) {
      setRecords((current) =>
        current.map((record) =>
          record.id === recordId
            ? {
                ...record,
                profileId: "",
                profileSpec: "",
                massKgPerM: "",
                massSource: "custom",
              }
            : record
        )
      )
      return
    }

    const profile = profiles.find((item) => item.id === profileId)
    if (!profile) return
    setRecords((current) =>
      current.map((record) =>
        record.id === recordId
          ? {
              ...record,
              profileId: profile.id,
              profileSpec: profile.label,
              massKgPerM:
                profile.verifiedMassKgPerM ?? profile.calculatedMassKgPerM,
              massSource:
                profile.verifiedMassKgPerM === null ? "calculated" : "verified",
            }
          : record
      )
    )
  }

  function updateMassOverride(recordId, value) {
    setRecords((current) =>
      current.map((record) =>
        record.id === recordId
          ? {
              ...record,
              massKgPerM: value,
              massSource: value === "" ? (record.profileId ? "calculated" : "custom") : "verified",
            }
          : record
      )
    )
  }

  function restoreProfileMass(recordId) {
    const record = records.find((item) => item.id === recordId)
    const profile = profiles.find((item) => item.id === record?.profileId)
    if (!profile) return
    setRecords((current) =>
      current.map((item) =>
        item.id === recordId
          ? {
              ...item,
              massKgPerM:
                profile.verifiedMassKgPerM ?? profile.calculatedMassKgPerM,
              massSource:
                profile.verifiedMassKgPerM === null ? "calculated" : "verified",
            }
          : item
      )
    )
  }

  async function saveRecord(record) {
    setSavingId(record.id)
    setError("")
    setMessage("")
    try {
      const response = await fetch("/api/os/atlas-pricing", {
        method: "PATCH",
        headers: await getOsAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(record),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Could not save the pricing record.")
      setRecords((current) => current.map((item) => item.id === record.id ? payload.record : item))
      setMessage(`${record.componentName} pricing saved.`)
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setSavingId("")
    }
  }

  return (
    <div className="space-y-5 px-3 py-4 sm:space-y-6 sm:px-6 sm:py-6">
      <AtlasModuleHero
        eyebrow={`${productCode} pricing control`}
        title={`Control every ${product?.name || "Atlas product"} input.`}
        description="Maintain material rates, component prices, quantity rules and effective dates in one traceable register. Unconfirmed technical inputs remain visible instead of silently entering estimates."
        status={productCode === "W08" ? "Component pricing" : "Product record pending"}
        actionHref={withAtlasProduct("/os/atlas/bom", productCode)}
        actionLabel="Review product BOM"
      />

      {!schemaReady ? (
        <div className="border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          Run <strong>supabase/smart_steel_os_atlas_pricing.sql</strong> to activate editable Atlas pricing records.
        </div>
      ) : null}
      {!profileSchemaReady ? (
        <div className="border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          The profile selector is using the local Atlas library. Run <strong>supabase/smart_steel_os_atlas_lipped_channel_profiles.sql</strong> before saving profile-linked pricing.
        </div>
      ) : null}
      {error ? <div className="border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div> : null}
      {message ? <div className="border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{message}</div> : null}

      <section className="grid gap-px overflow-hidden border border-slate-200 bg-slate-200 sm:grid-cols-3">
        <div className="bg-white p-4 sm:p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Pricing lines</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{loading ? "--" : records.length}</p>
          <p className="mt-1 text-xs text-slate-500">Components and fixings</p>
        </div>
        <div className="bg-white p-4 sm:p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Confirmed</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{loading ? "--" : `${confirmedCount}/${records.length}`}</p>
          <p className="mt-1 text-xs text-slate-500">Approved pricing inputs</p>
        </div>
        <div className="bg-amber-50 p-4 sm:p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-800">Technical holds</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{loading ? "--" : missingMassCount}</p>
          <p className="mt-1 text-xs text-slate-600">Steel profiles missing kg/m</p>
        </div>
      </section>

      {!loading && records.length === 0 ? (
        <section className="border border-slate-200 bg-white p-6">
          <p className="font-bold text-slate-950">No controlled pricing register exists for {product?.name} yet.</p>
          <p className="mt-2 text-sm text-slate-600">Build the product definition and component schedule before adding commercial rates.</p>
        </section>
      ) : null}

      {groupedRecords.map(([category, items]) => (
        <section key={category} className="overflow-hidden border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 sm:px-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700">{category}</p>
              <p className="mt-0.5 text-xs text-slate-500">{items.length} pricing line{items.length === 1 ? "" : "s"}</p>
            </div>
            <Scale className="h-5 w-5 text-slate-400" />
          </div>
          <div className="divide-y divide-slate-200">
            {items.map((record) => {
              const expanded = expandedId === record.id
              const hasHold = record.status !== "confirmed" || (record.pricingUnit === "ton" && record.massKgPerM === "")
              const usesLippedChannelProfile = record.pricingUnit === "ton"
              const selectedProfile = profiles.find((profile) => profile.id === record.profileId)
              const primaryValuePerM = materialValuePerM(record.massKgPerM, record.galvanisedRate)
              return (
                <article key={record.id}>
                  <button
                    type="button"
                    onClick={() => setExpandedId(expanded ? "" : record.id)}
                    className="grid w-full gap-3 p-4 text-left transition hover:bg-slate-50 sm:grid-cols-[110px_minmax(0,1.4fr)_minmax(150px,0.8fr)_minmax(150px,0.8fr)_32px] sm:items-center sm:px-5"
                  >
                    <span className="font-mono text-xs font-bold text-sky-700">{record.componentCode}</span>
                    <span>
                      <span className="block font-bold text-slate-950">{record.componentName}</span>
                      <span className="mt-1 block text-xs text-slate-500">{record.quantityRule}</span>
                    </span>
                    <span>
                      <span className="block text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">Galv / primary</span>
                      <span className="mt-1 block text-sm font-semibold text-slate-800">{formatRate(record.galvanisedRate, record.pricingUnit)}</span>
                    </span>
                    <span className={`inline-flex w-fit items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] ${hasHold ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-700"}`}>
                      {hasHold ? <AlertTriangle className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                      {STATUS_LABELS[record.status]}
                    </span>
                    {expanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                  </button>

                  {expanded ? (
                    <div className="border-t border-sky-100 bg-sky-50/40 p-4 sm:p-5">
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <Field label="Component name">
                          <input value={record.componentName} onChange={(event) => updateRecord(record.id, "componentName", event.target.value)} className={inputClass} />
                        </Field>
                        <Field label="Category">
                          <input value={record.category} onChange={(event) => updateRecord(record.id, "category", event.target.value)} className={inputClass} />
                        </Field>
                        <Field label="Pricing unit">
                          <select value={record.pricingUnit} onChange={(event) => updateRecord(record.id, "pricingUnit", event.target.value)} className={inputClass}>
                            {["ton", "kg", "m", "each", "set"].map((unit) => <option key={unit}>{unit}</option>)}
                          </select>
                        </Field>
                        <Field label="Status">
                          <select value={record.status} onChange={(event) => updateRecord(record.id, "status", event.target.value)} className={inputClass}>
                            {Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                          </select>
                        </Field>
                        {usesLippedChannelProfile ? (
                          <>
                            <Field label="Standard lipped-channel profile" wide>
                              <select value={record.profileId || ""} onChange={(event) => selectPricingProfile(record.id, event.target.value)} className={inputClass}>
                                <option value="">Custom profile</option>
                                <optgroup label="Supplier-confirmed sizes">
                                  {profiles.filter((profile) => profile.availabilityStatus === "confirmed").map((profile) => <option key={profile.id} value={profile.id}>{profile.label} · {profile.calculatedMassKgPerM.toFixed(3)} kg/m</option>)}
                                </optgroup>
                                <optgroup label="Assumed thickness variants">
                                  {profiles.filter((profile) => profile.availabilityStatus === "assumed").map((profile) => <option key={profile.id} value={profile.id}>{profile.label} · {profile.calculatedMassKgPerM.toFixed(3)} kg/m</option>)}
                                </optgroup>
                              </select>
                            </Field>
                            {selectedProfile ? (
                              <div className="grid gap-3 border border-sky-200 bg-sky-50 p-3 md:col-span-2 xl:col-span-4 sm:grid-cols-2 xl:grid-cols-4">
                                <div><p className="text-[9px] font-bold uppercase tracking-[0.13em] text-sky-700">Selected profile</p><p className="mt-1 text-sm font-bold text-slate-950">{selectedProfile.label}</p></div>
                                <div><p className="text-[9px] font-bold uppercase tracking-[0.13em] text-sky-700">Pricing mass</p><p className="mt-1 text-sm font-bold text-slate-950">{record.massKgPerM} kg/m</p><p className="mt-0.5 text-[10px] text-slate-500">{record.massSource === "verified" ? "Verified/manual mass" : "Calculated fallback"}</p></div>
                                <div><p className="text-[9px] font-bold uppercase tracking-[0.13em] text-sky-700">Availability</p><p className="mt-1 text-sm font-bold capitalize text-slate-950">{selectedProfile.availabilityStatus}</p><p className="mt-0.5 text-[10px] text-slate-500">{selectedProfile.availabilityStatus === "confirmed" ? "Visible in supplier list" : "Confirm before procurement"}</p></div>
                                <div><p className="text-[9px] font-bold uppercase tracking-[0.13em] text-sky-700">Raw steel value</p><p className="mt-1 text-sm font-bold text-slate-950">{primaryValuePerM === null ? "Set rate" : `R ${primaryValuePerM.toFixed(2)} / m`}</p><p className="mt-0.5 text-[10px] text-slate-500">Before waste and fabrication</p></div>
                              </div>
                            ) : (
                              <Field label="Custom profile / specification" wide>
                                <textarea rows={2} value={record.profileSpec} onChange={(event) => updateRecord(record.id, "profileSpec", event.target.value)} className={inputClass} />
                              </Field>
                            )}
                          </>
                        ) : (
                          <Field label="Profile / specification" wide>
                            <textarea rows={2} value={record.profileSpec} onChange={(event) => updateRecord(record.id, "profileSpec", event.target.value)} className={inputClass} />
                          </Field>
                        )}
                        <Field label="Length rule">
                          <input value={record.lengthRule} onChange={(event) => updateRecord(record.id, "lengthRule", event.target.value)} className={inputClass} />
                        </Field>
                        <Field label="Quantity rule">
                          <input value={record.quantityRule} onChange={(event) => updateRecord(record.id, "quantityRule", event.target.value)} className={inputClass} />
                        </Field>
                        <Field label="Galvanised / primary rate">
                          <input type="number" min="0" step="0.01" value={record.galvanisedRate} onChange={(event) => updateRecord(record.id, "galvanisedRate", event.target.value)} className={inputClass} />
                        </Field>
                        <Field label="Mild-steel / alternate rate">
                          <input type="number" min="0" step="0.01" value={record.mildSteelRate} onChange={(event) => updateRecord(record.id, "mildSteelRate", event.target.value)} className={inputClass} />
                        </Field>
                        <Field label={selectedProfile ? "Verified mass override kg/m" : "Mass kg/m"}>
                          <input type="number" min="0" step="0.0001" value={record.massKgPerM} onChange={(event) => updateMassOverride(record.id, event.target.value)} className={inputClass} />
                          {selectedProfile ? <span className="mt-1 flex items-start justify-between gap-3 text-[10px] leading-4 text-slate-500"><span>The selected profile supplied {selectedProfile.calculatedMassKgPerM.toFixed(4)} kg/m. Editing this field marks the value as verified/manual.</span><button type="button" onClick={() => restoreProfileMass(record.id)} className="shrink-0 font-bold text-sky-700 hover:text-sky-900">Use profile mass</button></span> : null}
                        </Field>
                        <Field label="Waste %">
                          <input type="number" min="0" step="0.1" value={record.wastePercent} onChange={(event) => updateRecord(record.id, "wastePercent", event.target.value)} className={inputClass} />
                        </Field>
                        <Field label="Fabrication allowance">
                          <input type="number" min="0" step="0.01" value={record.fabricationAllowance} onChange={(event) => updateRecord(record.id, "fabricationAllowance", event.target.value)} className={inputClass} />
                        </Field>
                        <Field label="Effective date">
                          <input type="date" value={record.effectiveDate} onChange={(event) => updateRecord(record.id, "effectiveDate", event.target.value)} className={inputClass} />
                        </Field>
                        <Field label="Notes" wide>
                          <textarea rows={2} value={record.notes} onChange={(event) => updateRecord(record.id, "notes", event.target.value)} className={inputClass} />
                        </Field>
                      </div>
                      <div className="mt-5 flex justify-end">
                        <button
                          type="button"
                          disabled={savingId === record.id || !schemaReady}
                          onClick={() => saveRecord(record)}
                          className="inline-flex items-center gap-2 bg-slate-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Save className="h-4 w-4" /> {savingId === record.id ? "Saving..." : "Save pricing line"}
                        </button>
                      </div>
                    </div>
                  ) : null}
                </article>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
