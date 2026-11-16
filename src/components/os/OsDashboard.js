"use client"

import { createPortal } from "react-dom"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getOsAuthHeaders } from "../../lib/osClientAuth"
import WeeklySchedule from "./WeeklySchedule"
import QuoteReviewPanel from "./QuoteReviewPanel"

function priorityTone(tone) {
  if (tone === "urgent") return "border-rose-200 bg-rose-50 text-rose-800"
  if (tone === "today") return "border-amber-200 bg-amber-50 text-amber-900"
  return "border-slate-200 bg-slate-50 text-slate-800"
}

export default function OsDashboard() {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [headerTarget, setHeaderTarget] = useState(null)

  useEffect(() => {
    setHeaderTarget(document.getElementById("os-dashboard-header-stats"))
  }, [])

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true)
      setError("")

      try {
        const response = await fetch("/api/os/dashboard", {
          cache: "no-store",
          headers: await getOsAuthHeaders(),
        })
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.error || "Could not load your daily dashboard.")
        setDashboard(payload)
      } catch (loadError) {
        setError(loadError.message)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  const priorities = dashboard?.priorities || []
  const pulse = dashboard?.pulse
  const stats = (
    <dl aria-label="Dashboard activity" className="flex w-fit max-w-full flex-wrap items-center gap-x-4 gap-y-1 py-1.5">
      <div className="flex items-baseline gap-2">
        <dt className="text-xs text-slate-600">New leads this week</dt>
        <dd className="font-mono text-base font-semibold tabular-nums text-[#0043f3]">{loading || error ? "—" : pulse?.newLeadsThisWeek ?? "—"}</dd>
      </div>
      <div className="flex items-baseline gap-2 sm:border-l sm:border-slate-200 sm:pl-4">
        <dt className="text-xs text-slate-600">Active quotes</dt>
        <dd className="font-mono text-base font-semibold tabular-nums text-slate-950">{loading || error ? "—" : pulse?.activeQuotes ?? "—"}</dd>
      </div>
    </dl>
  )

  return (
    <div className="w-full min-w-0 max-w-full space-y-4 overflow-x-hidden px-4 pb-6 pt-3 sm:space-y-6 sm:px-6">
      {headerTarget ? createPortal(stats, headerTarget) : stats}
      <WeeklySchedule />
      <QuoteReviewPanel />

      {error ? (
        <section className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700 shadow-sm">
          {error}
        </section>
      ) : null}
      {dashboard?.warnings?.length ? (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {dashboard.warnings.join(" ")}
        </section>
      ) : null}

      <section className="grid w-full min-w-0 max-w-full gap-4 overflow-hidden">
        <div className="w-full min-w-0 max-w-full overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Today&apos;s focus</p>
              <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">Three useful next moves</h1>
            </div>
            <Link href="/os/crm" className="text-sm font-semibold text-sky-700 transition hover:text-sky-800">
              View CRM
            </Link>
          </div>

          <div className="mt-4 space-y-3 sm:mt-5">
            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">Loading priorities...</div>
            ) : priorities.length > 0 ? (
              priorities.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex w-full min-w-0 max-w-full items-center justify-between gap-3 overflow-hidden rounded-2xl border px-4 py-3.5 transition hover:brightness-[0.99] ${priorityTone(item.tone)}`}
                >
                  <div className="min-w-0">
                    <p className="break-words text-sm font-semibold">{item.title}</p>
                    <p className="mt-1 max-w-full break-words text-sm leading-5 opacity-80">{item.helper}</p>
                  </div>
                  <span aria-hidden="true" className="shrink-0 text-lg font-semibold">&rarr;</span>
                </Link>
              ))
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
                Nothing urgent is competing for attention right now. Use the planner to keep the week moving.
              </div>
            )}
          </div>
        </div>

      </section>
    </div>
  )
}
