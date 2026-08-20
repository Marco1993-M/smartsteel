"use client"

import { useState } from "react"
import PartnerBranchesWorkspace from "./PartnerBranchesWorkspace"
import PartnerReleaseWorkspace from "./PartnerReleaseWorkspace"
import PartnerOpportunityWorkspace from "./PartnerOpportunityWorkspace"

export default function PartnersWorkspace() {
  const [view, setView] = useState("opportunities")
  return (
    <div className="min-w-0">
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="flex gap-2 overflow-x-auto">
          {[{ value: "opportunities", label: "Opportunities" }, { value: "releases", label: "Commercial releases" }, { value: "network", label: "AFGRI network" }].map((option) => (
            <button key={option.value} type="button" onClick={() => setView(option.value)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition ${view === option.value ? "bg-[#001d2e] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{option.label}</button>
          ))}
        </div>
      </div>
      {view === "opportunities" ? <PartnerOpportunityWorkspace /> : view === "network" ? <PartnerBranchesWorkspace /> : <PartnerReleaseWorkspace />}
    </div>
  )
}
