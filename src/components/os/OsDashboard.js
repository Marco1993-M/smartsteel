"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { getOsAuthHeaders } from "../../lib/osClientAuth"
import WeeklySchedule from "./WeeklySchedule"

function priorityTone(tone) {
  if (tone === "urgent") return "border-rose-200 bg-rose-50 text-rose-800"
  if (tone === "today") return "border-amber-200 bg-amber-50 text-amber-900"
  return "border-slate-200 bg-slate-50 text-slate-800"
}

export default function OsDashboard() {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

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
  const pulse = dashboard?.pulse || { newLeadsThisWeek: 0, activeQuotes: 0 }

  return (
    <div className="max-w-full space-y-4 overflow-x-hidden px-4 py-4 sm:space-y-6 sm:px-6 sm:py-6">
      <WeeklySchedule />

      {error ? (
        <section className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700 shadow-sm">
          {error}
        </section>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
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
                  className={`flex items-center justify-between gap-4 rounded-2xl border px-4 py-3.5 transition hover:brightness-[0.99] ${priorityTone(item.tone)}`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{item.title}</p>
                    <p className="mt-1 text-sm leading-5 opacity-80">{item.helper}</p>
                  </div>
                  <span aria-hidden="true" className="text-lg font-semibold">&rarr;</span>
                </Link>
              ))
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
                Nothing urgent is competing for attention right now. Use the planner to keep the week moving.
              </div>
            )}
          </div>
        </div>

        <aside className="rounded-3xl border border-slate-200 bg-slate-950 p-4 text-white shadow-sm sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Quick actions</p>
          <div className="mt-4 grid gap-2">
            <Link href="/os/crm?newLead=1" className="rounded-2xl bg-white px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-slate-100">
              New lead
            </Link>
            <a href="#weekly-note-board" className="rounded-2xl border border-white/25 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10">
              Add reminder
            </a>
            <Link href="/os/crm" className="rounded-2xl border border-white/25 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10">
              Open CRM
            </Link>
          </div>
          <div className="mt-5 border-t border-white/15 pt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">This week</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <p className="text-2xl font-bold tracking-tight">{loading ? "..." : pulse.newLeadsThisWeek}</p>
                <p className="mt-1 text-xs leading-5 text-slate-300">New leads</p>
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight">{loading ? "..." : pulse.activeQuotes}</p>
                <p className="mt-1 text-xs leading-5 text-slate-300">Active quotes</p>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </div>
  )
}
