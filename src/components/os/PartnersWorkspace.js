"use client"

import { useState } from "react"
import PartnerBranchesWorkspace from "./PartnerBranchesWorkspace"
import PartnerReleaseWorkspace from "./PartnerReleaseWorkspace"
import PartnerOpportunityWorkspace from "./PartnerOpportunityWorkspace"
import PartnerRolodexWorkspace from "./PartnerRolodexWorkspace"

export default function PartnersWorkspace() {
  const [partnerKey, setPartnerKey] = useState("afgri")
  const [view, setView] = useState("opportunities")
  return (
    <div className="min-w-0">
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
        <label className="mb-3 flex items-center gap-3 text-sm font-bold">Sales partner<select value={partnerKey} onChange={(event) => { setPartnerKey(event.target.value); setView("opportunities") }} className="rounded-lg border border-slate-200 bg-white px-3 py-2"><option value="afgri">AFGRI</option><option value="agrimark">Agrimark</option></select></label>
        <div className="flex gap-2 overflow-x-auto">
          {[{ value: "opportunities", label: "Opportunities" }, { value: "rolodex", label: "Rolodex" }, { value: "releases", label: "Commercial releases" }, { value: "network", label: "AFGRI network" }].filter((option) => partnerKey === "afgri" || !["network", "rolodex"].includes(option.value)).map((option) => (
            <button key={option.value} type="button" onClick={() => setView(option.value)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition ${view === option.value ? "bg-[#001d2e] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{option.label}</button>
          ))}
        </div>
      </div>
      {view === "opportunities" ? <PartnerOpportunityWorkspace key={partnerKey} partnerKey={partnerKey} /> : view === "rolodex" ? <PartnerRolodexWorkspace /> : view === "network" ? <PartnerBranchesWorkspace /> : <PartnerReleaseWorkspace key={partnerKey} partnerKey={partnerKey} />}
    </div>
  )
}
