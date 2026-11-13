"use client"

import { useEffect, useState } from "react"
import { getOsAuthHeaders } from "../../lib/osClientAuth"
import { normalizePilotPlan, PILOT_CHECKLIST, PILOT_CONVERSATION, PILOT_STAGES } from "../../lib/partnerPilotPlan"

const fieldClass = "mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2"

export default function PartnerPilotWorkspace({ branch, onSaved, onClose, onEdit }) {
  const [plan, setPlan] = useState(() => normalizePilotPlan(branch.pilotPlan || {}))
  const [stats, setStats] = useState(null)
  const [activityError, setActivityError] = useState("")
  const [feedback, setFeedback] = useState("")
  const [saving, setSaving] = useState(false)
  const endpoint = "/api/os/partner-branches"

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        const params = new URLSearchParams({ partnerKey: branch.partnerKey, pilotBranch: branch.id })
        const response = await fetch(`${endpoint}?${params}`, { headers: await getOsAuthHeaders(), signal: controller.signal })
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.error)
        setStats(payload)
      } catch (error) {
        if (!controller.signal.aborted) setActivityError(error.message)
      }
    }
    load()
    return () => controller.abort()
  }, [branch.id, branch.partnerKey])

  function update(key, value) {
    setPlan(current => ({ ...current, [key]: value }))
    setFeedback("")
  }

  async function save(event) {
    event.preventDefault()
    setSaving(true)
    setFeedback("")
    try {
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: await getOsAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ id: branch.id, pilotPlan: plan }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error)
      onSaved(payload.record)
      setFeedback("Pilot plan saved.")
    } catch (error) {
      setFeedback(error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div><p className="text-sm font-semibold text-[#0043f3]">Pilot workspace</p><h3 className="text-2xl font-bold text-[#001d2e]">{branch.name}</h3></div>
        <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onEdit} disabled={saving} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold">Edit branch details</button>
        <button type="button" onClick={onClose} disabled={saving} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold">Back to network</button>
        </div>
      </header>
      <div className="my-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {[["open", "Open for review"], ["quoted", "Price approved"], ["orders", "Orders opened"]].map(([key, label]) => (
          <div key={key} className="rounded-xl bg-slate-50 p-3"><p className="text-sm text-slate-600">{label}</p><p className="mt-1 text-xl font-bold">{stats?.[key] ?? "—"}</p></div>
        ))}
      </div>
      <p className="text-xs text-slate-500">{activityError || "Counts cover opportunities created with this branch assigned to the salesperson."}</p>
      <form onSubmit={save} className="mt-6 space-y-5">
        <fieldset disabled={saving} className="grid gap-5 lg:grid-cols-2">
          <section className="rounded-xl border border-blue-100 bg-blue-50 p-4 lg:col-span-2">
            <h4 className="font-bold text-[#001d2e]">Next agreed action</h4>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["nextAction", "Action", "text", 300],
                ["owner", "Owner", "text", 120],
                ["dueDate", "Due date", "date"],
                ["reviewDate", "Review date", "date"],
              ].map(([key, label, type, maxLength]) => (
                <label key={key} className={`block text-sm ${key === "nextAction" ? "sm:col-span-2 lg:col-span-4" : ""}`}>
                  {label}<input className={fieldClass} type={type} maxLength={maxLength} value={plan[key]} onChange={event => update(key, event.target.value)} />
                </label>
              ))}
              <label className="block text-sm">Launch date<input className={fieldClass} type="date" value={plan.launchDate} onChange={event => update("launchDate", event.target.value)} /></label>
            </div>
          </section>
          <div className="self-start space-y-3 rounded-xl border border-slate-200 p-4">
            <h4 className="font-bold">Launch readiness <span className="ml-2 text-sm font-medium text-slate-500">{plan.checks.length} / {Object.keys(PILOT_CHECKLIST).length}</span></h4>
            <label className="block text-sm">Rollout stage<select className={fieldClass} value={plan.stage} onChange={event => update("stage", event.target.value)}>
              {Object.entries(PILOT_STAGES).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select></label>
            {Object.entries(PILOT_CHECKLIST).map(([key, label]) => (
              <label key={key} className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1" checked={plan.checks.includes(key)} onChange={event => update("checks", event.target.checked ? [...plan.checks, key] : plan.checks.filter(item => item !== key))} />{label}</label>
            ))}
          </div>
          <section className="rounded-xl border border-slate-200 p-4">
            <h4 className="font-bold text-[#001d2e]">Launch conversation</h4>
            <div className="mt-4 space-y-4">
              {PILOT_CONVERSATION.map(([key, label, prompt]) => (
                <label key={key} className="block text-sm">
                  <span className="font-semibold">{label}</span>
                  <span className="mt-1 block text-slate-600">{prompt}</span>
                  <textarea className={fieldClass} rows={2} maxLength={2000} value={plan.conversation[key]}
                    onChange={event => update("conversation", { ...plan.conversation, [key]: event.target.value })} />
                </label>
              ))}
            </div>
          </section>
          <label className="block text-sm lg:col-span-2">Meeting notes and decisions<textarea className={fieldClass} rows={4} maxLength={4000} value={plan.notes} onChange={event => update("notes", event.target.value)} /></label>
        </fieldset>
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" disabled={saving} className="rounded-xl bg-[#0043f3] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving…" : "Save pilot plan"}</button>
          <p role="status" className="text-sm text-slate-600">{feedback}</p>
        </div>
      </form>
    </section>
  )
}
