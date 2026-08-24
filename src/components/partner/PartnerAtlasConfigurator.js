"use client"

import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, ArrowRight, Check, PackageCheck, Send, X } from "lucide-react"
import WarehouseBuilderScene from "../warehouse-builder/WarehouseBuilderScene"
import { getPartnerAuthHeaders } from "../../lib/partnerClientAuth"
import { normalizeAtlasConfiguration } from "../../lib/atlasConfiguration"

const PILOT_LENGTHS = [4, 8, 12, 16, 20]
const HEIGHTS = [3, 4, 5]
const FINISHES = ["Mild", "ZAM", "Galv"]
const SHEETING = [
  ["structure_only", "Structure only"],
  ["roof_only", "Roof sheeted"],
  ["fully_enclosed", "Roof and walls"],
]
const money = new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 })

function getReleasedWidth(product) {
  return Number(String(product?.productCode || "").match(/W(06|08|10|12)/i)?.[1] || 8)
}

export default function PartnerAtlasConfigurator({ product, initialOpportunity = null, onClose, onCreated }) {
  const width = getReleasedWidth(product)
  const [step, setStep] = useState(1)
  const [configuration, setConfiguration] = useState(() => normalizeAtlasConfiguration(initialOpportunity?.configuration || { width, length: 20, wallHeight: 3 }))
  const [preview, setPreview] = useState(null)
  const [previewing, setPreviewing] = useState(true)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [customer, setCustomer] = useState({
    customerName: initialOpportunity?.customer_name || "",
    customerPhone: initialOpportunity?.customer_phone || "",
    customerEmail: initialOpportunity?.customer_email || "",
    siteLocation: initialOpportunity?.site_location || "",
    notes: initialOpportunity?.notes || "",
  })

  function update(field, value) {
    setConfiguration((current) => normalizeAtlasConfiguration({ ...current, [field]: value }))
  }

  useEffect(() => {
    let cancelled = false
    const timeoutId = window.setTimeout(async () => {
      setPreviewing(true)
      setError("")
      try {
        const response = await fetch("/api/partner/configuration-preview", {
          method: "POST",
          headers: await getPartnerAuthHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify({ productReleaseId: product.id, configuration }),
        })
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.error || "This configuration could not be priced.")
        if (!cancelled) setPreview(payload.preview)
      } catch (previewError) {
        if (!cancelled) { setPreview(null); setError(previewError.message) }
      } finally {
        if (!cancelled) setPreviewing(false)
      }
    }, 280)
    return () => { cancelled = true; window.clearTimeout(timeoutId) }
  }, [configuration, product.id])

  const sceneProps = useMemo(() => ({
    systemVariant: "atlas",
    width: configuration.width,
    length: configuration.length,
    wallHeight: configuration.wallHeight,
    roofPitch: 15,
    cladding: configuration.gableMode === "structure_only" ? "None" : configuration.sheetingProfile,
    enclosureType: configuration.gableMode === "structure_only" ? "open_sides" : configuration.gableMode === "roof_only" ? "roof_only" : "side_walls",
    rollerDoorCount: 0,
    garageDoorOpeningType: "single",
    pedestrianDoorCount: 0,
    sheetingColor: configuration.sheetingFinish === "chromadek" ? "charcoal-grey" : "galvanised",
  }), [configuration])

  async function saveOpportunity(submit) {
    if (!customer.customerName.trim()) return setError("Add the customer name before continuing.")
    setSaving(true)
    setError("")
    try {
      const response = await fetch("/api/partner/opportunities", {
        method: initialOpportunity ? "PATCH" : "POST",
        headers: await getPartnerAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ ...customer, id: initialOpportunity?.id, productReleaseId: product.id, configuration, submit }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "The opportunity could not be saved.")
      await onCreated(payload.opportunity)
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#eef4f8]">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3"><button type="button" onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-slate-200" aria-label="Back"><ArrowLeft className="h-4 w-4" /></button><Image src="/atlas/atlas-logo-horizontal-dark.png" alt="Atlas" width={150} height={45} className="h-9 w-auto object-contain" /></div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-slate-100" aria-label="Close"><X className="h-5 w-5" /></button>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 lg:px-10">
        <div className="mb-5"><p className="text-xs font-black uppercase tracking-[0.2em] text-[#0043f3]">{initialOpportunity ? `Continue ${initialOpportunity.reference}` : "New AFGRI opportunity"}</p><h1 className="mt-2 text-3xl font-black tracking-[-0.045em] text-[#001d2e] sm:text-4xl">Configure the Atlas W{String(width).padStart(2, "0")}</h1></div>
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_440px] xl:items-start">
          <section className="xl:sticky xl:top-20">
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
              <WarehouseBuilderScene {...sceneProps} className="h-[330px] sm:h-[500px] xl:h-[620px]" />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#001d2e] px-4 py-3 text-white sm:px-5"><div><p className="text-[9px] font-bold uppercase tracking-[0.17em] text-[#c1d9e5]">Live AFGRI guide · excl. VAT</p><p className="mt-1 text-2xl font-black">{previewing ? "Updating..." : preview ? money.format(preview.commercial.amountExVat) : "Review required"}</p>{preview?.commercial?.partnerAdjustmentRate ? <p className="mt-1 text-[10px] font-semibold text-white/55">Includes the agreed {Math.round(preview.commercial.partnerAdjustmentRate * 100)}% partner adjustment</p> : null}</div><p className="text-sm font-bold text-white/70">{configuration.width}m × {configuration.length}m × {configuration.wallHeight}m</p></div>
            </div>
          </section>

          <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
            <div className="grid grid-cols-3 border-b border-slate-200">{["Size", "Finish", "Customer"].map((label, index) => <button key={label} type="button" onClick={() => index + 1 <= step && setStep(index + 1)} className={`min-h-14 border-r border-slate-200 px-2 text-xs font-black last:border-r-0 ${step === index + 1 ? "bg-[#c1d9e5] text-[#0043f3]" : index + 1 < step ? "text-[#0043f3]" : "text-slate-400"}`}>{index + 1 < step ? <Check className="mx-auto h-4 w-4" /> : label}</button>)}</div>
            <div className="p-5 sm:p-6">
              {step === 1 ? <SizeStep configuration={configuration} update={update} /> : null}
              {step === 2 ? <FinishStep configuration={configuration} update={update} /> : null}
              {step === 3 ? <CustomerStep customer={customer} setCustomer={setCustomer} preview={preview} /> : null}
              {error ? <p className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
              <div className="mt-7 grid grid-cols-2 gap-3">
                <button type="button" onClick={step > 1 ? () => setStep((current) => current - 1) : onClose} className="min-h-12 rounded-xl border border-slate-300 text-sm font-black">{step > 1 ? "Back" : "Cancel"}</button>
                {step < 3 ? <button type="button" disabled={!preview || previewing} onClick={() => setStep((current) => current + 1)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#0043f3] text-sm font-black text-white disabled:opacity-50">Next <ArrowRight className="h-4 w-4" /></button> : <button type="button" disabled={saving || !preview || !customer.customerName.trim()} onClick={() => saveOpportunity(true)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#0043f3] px-3 text-sm font-black text-white disabled:opacity-50"><Send className="h-4 w-4" /> {saving ? "Sending..." : "Send for review"}</button>}
              </div>
              {step === 3 ? <button type="button" disabled={saving || !preview || !customer.customerName.trim()} onClick={() => saveOpportunity(false)} className="mt-3 min-h-11 w-full text-sm font-bold text-slate-500">Save as draft instead</button> : null}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

function SizeStep({ configuration, update }) {
  return <div><StepHeading number="1" title="Set the warehouse size" /><OptionGroup label="Length">{PILOT_LENGTHS.map((value) => <Option key={value} active={configuration.length === value} onClick={() => update("length", value)}>{value}m</Option>)}</OptionGroup><OptionGroup label="Eave height">{HEIGHTS.map((value) => <Option key={value} active={configuration.wallHeight === value} onClick={() => update("wallHeight", value)}>{value}m</Option>)}</OptionGroup><div className="mt-6 rounded-xl bg-[#eef4f8] p-4"><p className="text-xs font-bold text-slate-500">Current footprint</p><p className="mt-1 text-xl font-black">{configuration.width}m × {configuration.length}m × {configuration.wallHeight}m</p></div></div>
}

function FinishStep({ configuration, update }) {
  return <div><StepHeading number="2" title="Choose finish and cover" /><OptionGroup label="Structural steel">{FINISHES.map((value) => <Option key={value} active={configuration.steelFinish === value} onClick={() => update("steelFinish", value)}>{value === "Galv" ? "Galvanised" : value}</Option>)}</OptionGroup><OptionGroup label="Sheeting">{SHEETING.map(([value, label]) => <Option key={value} active={configuration.gableMode === value} onClick={() => update("gableMode", value)}>{label}</Option>)}</OptionGroup>{configuration.gableMode !== "structure_only" ? <><OptionGroup label="Profile">{["Corrugated", "IBR", "Concealed Fix"].map((value) => <Option key={value} active={configuration.sheetingProfile === value} onClick={() => update("sheetingProfile", value)}>{value}</Option>)}</OptionGroup><OptionGroup label="Sheet finish">{[["galvanised", "Galvanised"], ["chromadek", "Colour coated"]].map(([value, label]) => <Option key={value} active={configuration.sheetingFinish === value} onClick={() => update("sheetingFinish", value)}>{label}</Option>)}</OptionGroup></> : null}</div>
}

function CustomerStep({ customer, setCustomer, preview }) {
  const field = (key) => ({ value: customer[key], onChange: (event) => setCustomer((current) => ({ ...current, [key]: event.target.value })) })
  return <div><StepHeading number="3" title="Review and add the customer" />{preview?.lineItem ? <div className="mt-5 overflow-hidden rounded-2xl border border-blue-200 bg-[#eef4f8]"><div className="flex items-center gap-3 border-b border-blue-100 px-4 py-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-[#0043f3]"><PackageCheck className="h-4 w-4" /></span><div className="min-w-0"><p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">Proposed AFGRI line item</p><p className="truncate font-mono text-xs font-black text-[#0043f3]">{preview.sku}</p></div></div><div className="px-4 py-4"><p className="text-sm font-bold leading-6 text-[#001d2e]">{preview.lineItem.description}</p><div className="mt-3 flex items-end justify-between gap-3 border-t border-blue-100 pt-3"><div><p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">Quantity</p><p className="mt-1 text-sm font-black">1 structure</p></div><div className="text-right"><p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">AFGRI guide excl. VAT</p><p className="mt-1 text-lg font-black text-[#0043f3]">{money.format(preview.commercial.amountExVat)}</p></div></div></div></div> : null}<p className="mt-5 text-sm leading-6 text-slate-500">Only the customer name is required to save a draft.</p><div className="mt-5 space-y-4"><Field label="Customer name" required><input {...field("customerName")} /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Mobile"><input {...field("customerPhone")} inputMode="tel" /></Field><Field label="Email"><input {...field("customerEmail")} type="email" /></Field></div><Field label="Project location"><input {...field("siteLocation")} placeholder="Town or farm" /></Field><Field label="Useful note"><textarea {...field("notes")} rows="3" placeholder="What will the building be used for?" /></Field></div></div>
}

function StepHeading({ number, title }) { return <><p className="text-xs font-black uppercase tracking-[0.17em] text-[#0043f3]">Step {number}</p><h2 className="mt-2 text-2xl font-black">{title}</h2></> }
function OptionGroup({ label, children }) { return <div className="mt-6"><p className="mb-2 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">{label}</p><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{children}</div></div> }
function Option({ active, onClick, children }) { return <button type="button" onClick={onClick} className={`min-h-12 rounded-xl border px-2 text-sm font-black transition ${active ? "border-[#0043f3] bg-[#0043f3] text-white" : "border-slate-200 bg-white text-slate-700 hover:border-blue-300"}`}>{children}</button> }
function Field({ label, required, children }) { return <label className="block text-sm font-bold text-slate-800">{label}{required ? " *" : ""}<span className="mt-2 block [&>input]:min-h-12 [&>input]:w-full [&>input]:rounded-xl [&>input]:border [&>input]:border-slate-300 [&>input]:px-4 [&>input]:text-base [&>input]:outline-none [&>textarea]:w-full [&>textarea]:rounded-xl [&>textarea]:border [&>textarea]:border-slate-300 [&>textarea]:p-4 [&>textarea]:text-base [&>textarea]:outline-none focus-within:[&>*]:border-[#0043f3]">{children}</span></label> }
