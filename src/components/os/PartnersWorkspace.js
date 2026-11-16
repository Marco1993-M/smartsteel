"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import PartnerBranchesWorkspace from "./PartnerBranchesWorkspace"
import PartnerReleaseWorkspace from "./PartnerReleaseWorkspace"
import PartnerOpportunityWorkspace from "./PartnerOpportunityWorkspace"

export default function PartnersWorkspace() {
  const [partnerKey, setPartnerKey] = useState("afgri")
  const [view, setView] = useState("opportunities")
  const [headerTarget, setHeaderTarget] = useState(null)
  useEffect(() => {
    setHeaderTarget(document.getElementById("os-partners-header-tools"))
  }, [])

  const views = [
    { value: "opportunities", label: "Opportunities" },
    { value: "releases", label: "Commercial releases" },
    ...(partnerKey === "afgri" ? [{ value: "network", label: "AFGRI network" }] : []),
  ]
  const headerTools = (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <nav aria-label="Partner workspace" className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
        {views.map(option => (
          <button key={option.value} type="button" aria-pressed={view === option.value}
            onClick={() => setView(option.value)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${view === option.value ? "bg-slate-950 text-white" : "text-slate-700 hover:bg-white"}`}>
            {option.label}
          </button>
        ))}
      </nav>
      <select aria-label="Sales partner" value={partnerKey}
        onChange={event => { setPartnerKey(event.target.value); setView("opportunities") }}
        className="min-h-9 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold">
        <option value="afgri">AFGRI</option>
        <option value="agrimark">Agrimark</option>
      </select>
    </div>
  )

  return (
    <div className="min-w-0">
      {headerTarget ? createPortal(headerTools, headerTarget) : <div className="px-4 sm:px-6">{headerTools}</div>}
      {view === "opportunities" ? <PartnerOpportunityWorkspace key={partnerKey} partnerKey={partnerKey} /> : view === "network" ? <PartnerBranchesWorkspace /> : <PartnerReleaseWorkspace key={partnerKey} partnerKey={partnerKey} />}
    </div>
  )
}
