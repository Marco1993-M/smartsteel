"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { AlertTriangle, Check, ChevronDown, ChevronUp, Save, Scale } from "lucide-react"
import { getOsAuthHeaders } from "../../lib/osClientAuth"
import { getAtlasProduct, withAtlasProduct } from "../../lib/atlasProductRange"
import { matchLippedChannelProfile } from "../../lib/atlasLippedChannelProfiles"
import { formatBoltSpecification } from "../../lib/atlasFasteners"
import {
  calculateAtlasPricingLine,
  getAtlasPricingCompleteness,
  summarizeAtlasPricing,
} from "../../lib/atlasCosting"
import { getAtlasW08PrimaryBenchmark } from "../../lib/atlasW08PricingBenchmarks"
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

function formatMoney(value) {
  return `R ${Number(value || 0).toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
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
  const [fasteners, setFasteners] = useState([])
  const [revisions, setRevisions] = useState([])
  const [profileSchemaReady, setProfileSchemaReady] = useState(true)
  const [fastenerSchemaReady, setFastenerSchemaReady] = useState(true)
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
        const [response, profilesResponse, fastenersResponse] = await Promise.all([
          fetch(`/api/os/atlas-pricing?product=${encodeURIComponent(productCode)}`, {
            cache: "no-store",
            headers,
          }),
          fetch("/api/os/atlas-profiles", { cache: "no-store", headers }),
          fetch("/api/os/atlas-fasteners", { cache: "no-store", headers }),
        ])
        const [payload, profilesPayload, fastenersPayload] = await Promise.all([
          response.json(),
          profilesResponse.json(),
          fastenersResponse.json(),
        ])
        if (!response.ok) throw new Error(payload.error || "Could not load Atlas pricing.")
        if (!profilesResponse.ok) throw new Error(profilesPayload.error || "Could not load Atlas profiles.")
        if (!fastenersResponse.ok) throw new Error(fastenersPayload.error || "Could not load Atlas fasteners.")
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
          setRevisions(payload.revisions || [])
          setProfiles(profilesPayload.records || [])
          setProfileSchemaReady(profilesPayload.schemaReady !== false)
          setFasteners(fastenersPayload.records || [])
          setFastenerSchemaReady(fastenersPayload.schemaReady !== false)
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
  const assembledSummary = useMemo(() => summarizeAtlasPricing(records), [records])
  const pricingBenchmark = productCode === "W08" ? getAtlasW08PrimaryBenchmark() : null
  const benchmarkVariance = pricingBenchmark
    ? assembledSummary.totalCost - pricingBenchmark.sellingPriceExclVat
    : 0

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

  function selectPricingBolt(recordId, fastenerId) {
    const bolt = fasteners.find((item) => item.id === fastenerId)
    setRecords((current) =>
      current.map((record) =>
        record.id === recordId
          ? {
              ...record,
              fastenerId: bolt?.id || "",
              profileSpec: bolt ? formatBoltSpecification(bolt) : "",
            }
          : record
      )
    )
    if (bolt) {
      setRecords((current) =>
        current.map((record) => {
          if (record.componentCode === "W08-NUT") {
            return { ...record, profileSpec: bolt.matchingNut }
          }
          if (record.componentCode === "W08-WSH") {
            return { ...record, profileSpec: bolt.matchingWasher }
          }
          return record
        })
      )
    }
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
      {!fastenerSchemaReady ? (
        <div className="border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          The bolt selector is using the local Atlas library. Run <strong>supabase/smart_steel_os_atlas_fasteners.sql</strong> before saving controlled bolt pricing.
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

      <section className="overflow-hidden border border-slate-900 bg-slate-950 text-white shadow-xl">
        <div className="grid gap-px bg-white/10 lg:grid-cols-[minmax(0,1.35fr)_repeat(3,minmax(150px,0.55fr))]">
          <div className="bg-slate-950 p-5 sm:p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-300">Live assembled W08 baseline</p>
            <div className="mt-3 flex flex-wrap items-end gap-4">
              <p className="text-3xl font-bold tracking-tight sm:text-4xl">{formatMoney(assembledSummary.totalCost)}</p>
              <span className={`mb-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${assembledSummary.holdCount ? "bg-amber-300 text-slate-950" : "bg-emerald-300 text-emerald-950"}`}>
                {assembledSummary.holdCount ? `${assembledSummary.holdCount} holds` : "Quote ready"}
              </span>
            </div>
            <p className="mt-2 max-w-xl text-xs leading-5 text-slate-400">Calculated from the controlled baseline quantity and member length on every pricing line. It is not released to estimates until every line is complete and confirmed.</p>
          </div>
          {[
            ["Raw material", assembledSummary.rawCost],
            ["Waste + fabrication + coating", assembledSummary.wasteCost + assembledSummary.fabricationCost + assembledSummary.coatingCost],
            ["Margin allowance", assembledSummary.marginCost],
          ].map(([label, value]) => (
            <div key={label} className="bg-slate-950 p-5 sm:p-6">
              <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-slate-500">{label}</p>
              <p className="mt-2 text-lg font-bold">{formatMoney(value)}</p>
            </div>
          ))}
        </div>
      </section>

      {pricingBenchmark ? (
        <section className="overflow-hidden border border-[#0043f3]/20 bg-white shadow-sm">
          <div className="grid gap-px bg-slate-200 lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)]">
            <div className="bg-white p-5 sm:p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#0043f3]">Verified pricing benchmark</p>
              <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-950">{pricingBenchmark.label}</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {pricingBenchmark.widthM}m × {pricingBenchmark.lengthM}m × {pricingBenchmark.eaveHeightM}m · {pricingBenchmark.portalFrameCount} portals at {pricingBenchmark.baySpacingM}m spacing
                  </p>
                </div>
                <div className="text-left lg:text-right">
                  <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">Selling price excl. VAT</p>
                  <p className="mt-1 text-2xl font-bold text-slate-950">{formatMoney(pricingBenchmark.sellingPriceExclVat)}</p>
                </div>
              </div>
              <div className="mt-5 grid gap-px border border-slate-200 bg-slate-200 sm:grid-cols-4">
                {[
                  ["Structure steel", `${pricingBenchmark.totalSteelKg.toLocaleString("en-ZA")}kg`],
                  ["ZAM rate", formatRate(pricingBenchmark.materialRatePerTon, "ton")],
                  ["Cost excl. VAT", formatMoney(pricingBenchmark.totalCostExclVat)],
                  ["Sheet uplift", `${pricingBenchmark.markupPercent}%`],
                ].map(([label, value]) => (
                  <div key={label} className="bg-slate-50 p-3.5">
                    <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">{label}</p>
                    <p className="mt-1 text-sm font-bold text-slate-900">{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 overflow-x-auto border border-slate-200">
                <table className="min-w-[760px] w-full border-collapse text-left text-xs">
                  <thead className="bg-slate-950 text-white">
                    <tr>
                      {["Component", "Controlled profile", "Assembly", "Calculated kg/m", "Sheet weight", "Effective metres"].map((heading) => (
                        <th key={heading} className="px-3 py-2.5 text-[9px] font-bold uppercase tracking-[0.1em]">{heading}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {pricingBenchmark.components.map((component) => (
                      <tr key={component.label} className="bg-white">
                        <td className="px-3 py-2.5 font-bold text-slate-900">{component.label}</td>
                        <td className="px-3 py-2.5 font-mono text-slate-700">{component.profile.code}</td>
                        <td className="px-3 py-2.5 text-slate-600">{component.assembly}</td>
                        <td className="px-3 py-2.5 font-semibold text-slate-800">{component.profile.calculatedMassKgPerM.toFixed(3)}</td>
                        <td className="px-3 py-2.5 font-semibold text-slate-800">{component.massKg.toLocaleString("en-ZA")}kg</td>
                        <td className="px-3 py-2.5 font-semibold text-slate-800">{component.effectiveInstalledM.toLocaleString("en-ZA")}m</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-xs leading-5 text-slate-500">
                Profile mass uses developed section width × thickness × 7,850kg/m³. Effective metres reconcile the sheet weight against that calculated mass; they are a validation aid until the approved member-length schedule is entered. Benchmark excludes {pricingBenchmark.exclusions.join(", ").toLowerCase()} and does not change public builder pricing.
              </p>
            </div>
            <aside className="bg-[#001d2e] p-5 text-white sm:p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#c1d9e5]">Current baseline variance</p>
              <p className="mt-3 text-3xl font-bold">{formatMoney(benchmarkVariance)}</p>
              <p className="mt-2 text-xs leading-5 text-white/65">
                Current assembled pricing minus the verified benchmark selling price. A zero variance is only meaningful once the component quantities match this exact 20m × 8m × 4.5m configuration.
              </p>
              <div className="mt-5 border-t border-white/15 pt-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/45">Source</p>
                <p className="mt-1 break-words text-xs font-semibold leading-5 text-white/80">{pricingBenchmark.source}</p>
              </div>
            </aside>
          </div>
        </section>
      ) : null}

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
              const usesLippedChannelProfile = record.pricingUnit === "ton"
              const selectedProfile = profiles.find((profile) => profile.id === record.profileId)
              const usesBoltSelection = record.componentCode === "W08-BLT"
              const selectedBolt = fasteners.find((fastener) => fastener.id === record.fastenerId)
              const primaryValuePerM = materialValuePerM(record.massKgPerM, record.galvanisedRate)
              const lineCost = calculateAtlasPricingLine(record)
              const completeness = getAtlasPricingCompleteness(record)
              const hasHold = record.status !== "confirmed" || !completeness.ready
              const inheritsComponentQuantityRule = record.linkedComponentCode !== "W08-CON" || record.componentCode === "W08-CON"
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
                      <span className="mt-1 block text-xs font-bold text-sky-700">{formatMoney(lineCost.totalCost)} baseline</span>
                    </span>
                    <span>
                      <span className="block text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">Galv / primary</span>
                      <span className="mt-1 block text-sm font-semibold text-slate-800">{formatRate(record.galvanisedRate, record.pricingUnit)}</span>
                    </span>
                    <span className={`inline-flex w-fit items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] ${hasHold ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-700"}`}>
                      {hasHold ? <AlertTriangle className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                      {completeness.ready ? STATUS_LABELS[record.status] : `${completeness.missing.length} missing`}
                    </span>
                    {expanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                  </button>

                  {expanded ? (
                    <div className="border-t border-sky-100 bg-sky-50/40 p-4 sm:p-5">
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <Field label="Component name">
                          <input value={record.componentName} onChange={(event) => updateRecord(record.id, "componentName", event.target.value)} className={inputClass} disabled={Boolean(record.componentId)} />
                        </Field>
                        <Field label="Category">
                          <input value={record.category} onChange={(event) => updateRecord(record.id, "category", event.target.value)} className={inputClass} disabled={Boolean(record.componentId)} />
                        </Field>
                        <Field label="Pricing unit">
                          <select value={record.pricingUnit} onChange={(event) => updateRecord(record.id, "pricingUnit", event.target.value)} className={inputClass}>
                            {["ton", "kg", "m", "each", "set"].map((unit) => <option key={unit}>{unit}</option>)}
                          </select>
                        </Field>
                        <Field label="Status">
                          <select value={record.status} onChange={(event) => updateRecord(record.id, "status", event.target.value)} className={inputClass}>
                            {Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value} disabled={value === "confirmed" && !completeness.ready}>{label}</option>)}
                          </select>
                        </Field>
                        {record.componentId ? (
                          <div className="border border-sky-200 bg-white p-4 md:col-span-2 xl:col-span-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-sky-700">Inherited technical source</p>
                                <p className="mt-1 text-base font-bold text-slate-950">{record.linkedComponentCode} · Technical revision {record.componentRevision}</p>
                                <p className="mt-1 text-xs text-slate-500">Profile, mass, grade, coating, and the applicable quantity rule are controlled in Components.</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] ${record.technicalApproved ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{record.technicalApproved ? `Approved by ${record.technicalApprovedBy}` : "Technical approval required"}</span>
                                <Link href="/os/atlas/components" className="border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-sky-400 hover:text-sky-700">Open Components</Link>
                              </div>
                            </div>
                            <div className="mt-4 grid gap-px border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-5">
                              {[
                                ["Profile", record.technicalSpecification?.profileSpec || record.profileSpec || "Not specified"],
                                ["Thickness", record.technicalSpecification?.thicknessSpec || "Not specified"],
                                ["Mass", record.massKgPerM === "" ? "Not specified" : `${record.massKgPerM} kg/m`],
                                ["Grade", record.technicalSpecification?.gradeSpec || "Not specified"],
                                ["Coating", record.technicalSpecification?.coatingSpec || "Not specified"],
                              ].map(([label, value]) => <div key={label} className="bg-slate-50 p-3"><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">{label}</p><p className="mt-1 text-xs font-bold leading-5 text-slate-800">{value}</p></div>)}
                            </div>
                            {record.technicalStale ? <p className="mt-3 border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900">The component changed after this pricing line was last acknowledged. Saving will inherit revision {record.componentRevision} and keep the line in review.</p> : null}
                          </div>
                        ) : usesLippedChannelProfile ? (
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
                        ) : usesBoltSelection ? (
                          <>
                            <Field label="Standard bolt" wide>
                              <select value={record.fastenerId || ""} onChange={(event) => selectPricingBolt(record.id, event.target.value)} className={inputClass}>
                                <option value="">Custom bolt</option>
                                {fasteners.map((bolt) => <option key={bolt.id} value={bolt.id}>{bolt.label} · Property Class {bolt.propertyClass}</option>)}
                              </select>
                            </Field>
                            {selectedBolt ? (
                              <div className="grid gap-3 border border-amber-200 bg-amber-50 p-3 md:col-span-2 xl:col-span-4 sm:grid-cols-2 xl:grid-cols-4">
                                <div><p className="text-[9px] font-bold uppercase tracking-[0.13em] text-amber-800">Selected bolt</p><p className="mt-1 text-sm font-bold text-slate-950">{selectedBolt.label}</p><p className="mt-0.5 text-[10px] text-slate-500">Property Class {selectedBolt.propertyClass}</p></div>
                                <div><p className="text-[9px] font-bold uppercase tracking-[0.13em] text-amber-800">Thread and head</p><p className="mt-1 text-sm font-bold text-slate-950">{selectedBolt.threadPitchMm}mm coarse pitch</p><p className="mt-0.5 text-[10px] text-slate-500">{selectedBolt.driveSizeMm}mm hex drive</p></div>
                                <div><p className="text-[9px] font-bold uppercase tracking-[0.13em] text-amber-800">Matching set</p><p className="mt-1 text-xs font-bold text-slate-950">{selectedBolt.matchingNut}</p><p className="mt-0.5 text-[10px] text-slate-500">{selectedBolt.matchingWasher}</p></div>
                                <div><p className="text-[9px] font-bold uppercase tracking-[0.13em] text-amber-800">Finish review</p><p className="mt-1 text-xs font-bold text-amber-950">{selectedBolt.finishSpec}</p><p className="mt-0.5 text-[10px] text-amber-800">Confirm suitability for exterior exposure</p></div>
                              </div>
                            ) : (
                              <Field label="Custom bolt specification" wide>
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
                          <input value={record.quantityRule} onChange={(event) => updateRecord(record.id, "quantityRule", event.target.value)} className={inputClass} disabled={Boolean(record.componentId && inheritsComponentQuantityRule)} />
                        </Field>
                        <Field label="Baseline quantity">
                          <input type="number" min="0" step="0.01" value={record.baselineQuantity} onChange={(event) => updateRecord(record.id, "baselineQuantity", event.target.value)} className={inputClass} />
                        </Field>
                        <Field label="Baseline member length (m)">
                          <input type="number" min="0" step="0.001" value={record.baselineLengthM} onChange={(event) => updateRecord(record.id, "baselineLengthM", event.target.value)} className={inputClass} disabled={!["ton", "m"].includes(record.pricingUnit)} />
                        </Field>
                        <Field label="Galvanised / primary rate">
                          <input type="number" min="0" step="0.01" value={record.galvanisedRate} onChange={(event) => updateRecord(record.id, "galvanisedRate", event.target.value)} className={inputClass} />
                        </Field>
                        <Field label="Mild-steel / alternate rate">
                          <input type="number" min="0" step="0.01" value={record.mildSteelRate} onChange={(event) => updateRecord(record.id, "mildSteelRate", event.target.value)} className={inputClass} />
                        </Field>
                        <Field label={selectedProfile ? "Verified mass override kg/m" : "Mass kg/m"}>
                          <input type="number" min="0" step="0.0001" value={record.massKgPerM} onChange={(event) => updateMassOverride(record.id, event.target.value)} className={inputClass} disabled={Boolean(record.componentId)} />
                          {selectedProfile && !record.componentId ? <span className="mt-1 flex items-start justify-between gap-3 text-[10px] leading-4 text-slate-500"><span>The selected profile supplied {selectedProfile.calculatedMassKgPerM.toFixed(4)} kg/m. Editing this field marks the value as verified/manual.</span><button type="button" onClick={() => restoreProfileMass(record.id)} className="shrink-0 font-bold text-sky-700 hover:text-sky-900">Use profile mass</button></span> : null}
                        </Field>
                        <Field label="Waste %">
                          <input type="number" min="0" step="0.1" value={record.wastePercent} onChange={(event) => updateRecord(record.id, "wastePercent", event.target.value)} className={inputClass} />
                        </Field>
                        <Field label="Fabrication allowance">
                          <input type="number" min="0" step="0.01" value={record.fabricationAllowance} onChange={(event) => updateRecord(record.id, "fabricationAllowance", event.target.value)} className={inputClass} />
                        </Field>
                        <Field label="Coating allowance">
                          <input type="number" min="0" step="0.01" value={record.coatingAllowance} onChange={(event) => updateRecord(record.id, "coatingAllowance", event.target.value)} className={inputClass} />
                        </Field>
                        <Field label="Margin %">
                          <input type="number" min="0" step="0.1" value={record.marginPercent} onChange={(event) => updateRecord(record.id, "marginPercent", event.target.value)} className={inputClass} />
                        </Field>
                        <Field label="Supplier">
                          <input value={record.supplierName} onChange={(event) => updateRecord(record.id, "supplierName", event.target.value)} placeholder="Supplier name" className={inputClass} />
                        </Field>
                        <Field label="Supplier quote / reference">
                          <input value={record.supplierQuoteReference} onChange={(event) => updateRecord(record.id, "supplierQuoteReference", event.target.value)} placeholder="Quote, price list, or reference" className={inputClass} />
                        </Field>
                        <Field label="Effective date">
                          <input type="date" value={record.effectiveDate} onChange={(event) => updateRecord(record.id, "effectiveDate", event.target.value)} className={inputClass} />
                        </Field>
                        <Field label="Approved by">
                          <input value={record.approvedBy} onChange={(event) => updateRecord(record.id, "approvedBy", event.target.value)} placeholder="Required to confirm" className={inputClass} />
                        </Field>
                        <Field label="Notes" wide>
                          <textarea rows={2} value={record.notes} onChange={(event) => updateRecord(record.id, "notes", event.target.value)} className={inputClass} />
                        </Field>
                      </div>
                      <div className="mt-5 grid gap-px border border-slate-200 bg-slate-200 sm:grid-cols-3 lg:grid-cols-6">
                        {[
                          ["Raw", lineCost.rawCost],
                          ["Waste", lineCost.wasteCost],
                          ["Fabrication", lineCost.fabricationCost],
                          ["Coating", lineCost.coatingCost],
                          ["Margin", lineCost.marginCost],
                          ["Line total", lineCost.totalCost],
                        ].map(([label, value]) => <div key={label} className={label === "Line total" ? "bg-slate-950 p-3 text-white" : "bg-white p-3"}><p className="text-[9px] font-bold uppercase tracking-[0.12em] opacity-55">{label}</p><p className="mt-1 text-sm font-bold">{formatMoney(value)}</p></div>)}
                      </div>
                      {!completeness.ready ? <div className="mt-4 border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900"><strong>Complete before approval:</strong> {completeness.missing.join(", ")}.</div> : null}
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[10px] text-slate-500"><span>Revision {record.revisionNumber || 1}{record.approvedAt ? ` · approved ${new Date(record.approvedAt).toLocaleDateString("en-ZA")}` : ""}</span><span>Every save records the previous values in pricing history.</span></div>
                      {revisions.some((revision) => revision.pricingItemId === record.id) ? (
                        <div className="mt-4 border-t border-slate-200 pt-4">
                          <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-slate-400">Recent revisions</p>
                          <div className="mt-2 grid gap-2 sm:grid-cols-2">
                            {revisions.filter((revision) => revision.pricingItemId === record.id).slice(0, 4).map((revision) => (
                              <div key={revision.id} className="border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
                                <div className="flex items-center justify-between gap-3"><strong className="text-slate-900">Revision {revision.revisionNumber}</strong><span>{new Date(revision.createdAt).toLocaleDateString("en-ZA")}</span></div>
                                <p className="mt-1">{revision.changedBy || "Smart Steel team"} · {revision.changeNote}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
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
