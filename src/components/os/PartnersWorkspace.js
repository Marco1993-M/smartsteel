"use client"

import { useState } from "react"
import PartnerBranchesWorkspace from "./PartnerBranchesWorkspace"
import PartnerReleaseWorkspace from "./PartnerReleaseWorkspace"
import PartnerOpportunityWorkspace from "./PartnerOpportunityWorkspace"

export default function PartnersWorkspace() {
  const [partnerKey, setPartnerKey] = useState("afgri")
  const [view, setView] = useState("opportunities")
  return (
    <div className="min-w-0">
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-[#001d2e]">{partnerKey === "afgri" ? "AFGRI" : "Agrimark"}</h2>
            <p className="mt-1 text-sm text-slate-500">Review incoming projects and track orders through fulfilment.</p>
          </div>
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            Sales partner
            <select value={partnerKey} onChange={(event) => { setPartnerKey(event.target.value); setView("opportunities") }} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
              <option value="afgri">AFGRI</option>
              <option value="agrimark">Agrimark</option>
            </select>
          </label>
        </div>
        <nav aria-label="Partner workspace" className="flex flex-wrap gap-2">
          {[{ value: "opportunities", label: "Opportunities" }, { value: "releases", label: "Commercial releases" }, { value: "network", label: "AFGRI network" }].filter((option) => partnerKey === "afgri" || option.value !== "network").map((option) => (
            <button key={option.value} type="button" aria-pressed={view === option.value} onClick={() => setView(option.value)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition ${view === option.value ? "bg-[#001d2e] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{option.label}</button>
          ))}
        </nav>
      </div>
      {view === "opportunities" ? <PartnerOpportunityWorkspace key={partnerKey} partnerKey={partnerKey} /> : view === "network" ? <PartnerBranchesWorkspace /> : <PartnerReleaseWorkspace key={partnerKey} partnerKey={partnerKey} />}
    </div>
  )
}
