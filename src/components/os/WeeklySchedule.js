"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { getOsAuthHeaders } from "../../lib/osClientAuth"

function toDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function startOfWeek(date) {
  const next = new Date(date)
  const day = next.getDay() || 7
  next.setDate(next.getDate() - day + 1)
  next.setHours(0, 0, 0, 0)
  return next
}

function addDays(date, days) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function formatWeekRange(start) {
  const end = addDays(start, 4)
  const options = { day: "numeric", month: "short" }
  return `${start.toLocaleDateString("en-ZA", options)} - ${end.toLocaleDateString("en-ZA", options)}`
}

function formatDay(date) {
  return {
    weekday: date.toLocaleDateString("en-ZA", { weekday: "short" }),
    date: date.toLocaleDateString("en-ZA", { day: "numeric", month: "short" }),
  }
}

export default function WeeklySchedule() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()))
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [activeDate, setActiveDate] = useState("")
  const [note, setNote] = useState("")
  const [editingId, setEditingId] = useState("")
  const [editingTitle, setEditingTitle] = useState("")
  const swipeStart = useRef(null)

  const days = useMemo(() => Array.from({ length: 5 }, (_, index) => addDays(weekStart, index)), [weekStart])
  const startKey = toDateKey(days[0])
  const endKey = toDateKey(days[4])
  const todayKey = toDateKey(new Date())

  useEffect(() => {
    async function loadSchedule() {
      setLoading(true)
      setError("")
      setRecords([])
      try {
        const response = await fetch(`/api/os/schedule?start=${startKey}&end=${endKey}`, {
          cache: "no-store",
          headers: await getOsAuthHeaders(),
        })
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.error || "Could not load this week's schedule.")
        setRecords(payload.records || [])
      } catch (loadError) {
        setError(loadError.message)
      } finally {
        setLoading(false)
      }
    }

    loadSchedule()
  }, [endKey, startKey])

  useEffect(() => {
    function openToday() {
      const currentWeek = startOfWeek(new Date())
      setWeekStart(currentWeek)
      setActiveDate(toDateKey(new Date()))
      setNote("")
      window.setTimeout(() => {
        const prefix = window.innerWidth < 1024 ? "schedule-note-mobile" : "schedule-note"
        document.getElementById(`${prefix}-${toDateKey(new Date())}`)?.focus()
      }, 100)
    }

    window.addEventListener("os:add-reminder", openToday)
    return () => window.removeEventListener("os:add-reminder", openToday)
  }, [])

  function changeWeek(offset) {
    setActiveDate("")
    setNote("")
    setWeekStart((current) => addDays(current, offset))
  }

  function returnToCurrentWeek() {
    setActiveDate("")
    setNote("")
    setWeekStart(startOfWeek(new Date()))
  }

  function handleSwipeStart(event) {
    const touch = event.touches[0]
    swipeStart.current = { x: touch.clientX, y: touch.clientY }
  }

  function handleSwipeEnd(event) {
    if (!swipeStart.current) return
    const touch = event.changedTouches[0]
    const deltaX = touch.clientX - swipeStart.current.x
    const deltaY = touch.clientY - swipeStart.current.y
    swipeStart.current = null

    if (Math.abs(deltaX) < 55 || Math.abs(deltaX) <= Math.abs(deltaY) * 1.25) return
    changeWeek(deltaX < 0 ? 7 : -7)
  }

  function openDay(event, dateKey) {
    if (event.target.closest("button, input, form, a, select, textarea")) return
    setActiveDate(dateKey)
    setNote("")
  }

  async function addNote(event) {
    event.preventDefault()
    if (!activeDate || !note.trim()) return

    setSaving(true)
    setError("")
    try {
      const response = await fetch("/api/os/schedule", {
        method: "POST",
        headers: await getOsAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ title: note.trim(), dueDate: activeDate }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Could not add this note.")
      setRecords((current) => [...current, payload.record])
      setNote("")
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setSaving(false)
    }
  }

  const firstScheduledDate = days.find((day) => records.some((record) => record.date === toDateKey(day)))
  const activeDateIsVisible = days.some((day) => toDateKey(day) === activeDate)
  const fallbackFocusDate = firstScheduledDate
    ? toDateKey(firstScheduledDate)
    : days.some((day) => toDateKey(day) === todayKey)
      ? todayKey
      : startKey
  const focusedDate = activeDateIsVisible ? activeDate : fallbackFocusDate

  async function deleteNote(id) {
    setSaving(true)
    setError("")
    try {
      const response = await fetch(`/api/os/schedule?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: await getOsAuthHeaders(),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Could not remove this note.")
      setRecords((current) => current.filter((record) => record.id !== id))
    } catch (deleteError) {
      setError(deleteError.message)
    } finally {
      setSaving(false)
    }
  }

  async function updateNote(id, patch) {
    setSaving(true)
    setError("")
    try {
      const response = await fetch("/api/os/schedule", {
        method: "PATCH",
        headers: await getOsAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ id, ...patch }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Could not update this reminder.")
      if (payload.completed) {
        setRecords((current) => current.filter((record) => record.id !== id))
      } else {
        setRecords((current) => current.map((record) => record.id === id ? payload.record : record))
      }
      setEditingId("")
      setEditingTitle("")
    } catch (updateError) {
      setError(updateError.message)
    } finally {
      setSaving(false)
    }
  }

  const focusedDay = days.find((day) => toDateKey(day) === focusedDate) || days[0]
  const focusedDayLabel = formatDay(focusedDay)
  const focusedItems = records.filter((record) => record.date === focusedDate)

  return (
    <section id="weekly-note-board" className="min-w-0 max-w-full scroll-mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Reminders</h3>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => changeWeek(-7)} className="grid h-9 w-9 place-items-center rounded-full border border-slate-300 text-lg font-semibold text-slate-700 transition hover:bg-slate-50" aria-label="Previous week">&larr;</button>
          <button type="button" onClick={returnToCurrentWeek} className="rounded-full border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">This week</button>
          <button type="button" onClick={() => changeWeek(7)} className="grid h-9 w-9 place-items-center rounded-full border border-slate-300 text-lg font-semibold text-slate-700 transition hover:bg-slate-50" aria-label="Next week">&rarr;</button>
        </div>
      </div>

      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{formatWeekRange(weekStart)}</p>
      {error ? <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

      <div
        className="mt-4 touch-pan-y lg:hidden"
        onTouchStart={handleSwipeStart}
        onTouchEnd={handleSwipeEnd}
      >
        <div className="grid grid-cols-5 gap-1.5">
          {days.map((day) => {
            const dateKey = toDateKey(day)
            const dayLabel = formatDay(day)
            const dayItems = records.filter((record) => record.date === dateKey)
            const isToday = dateKey === todayKey
            const isFocused = dateKey === focusedDate

            return (
              <button
                key={dateKey}
                type="button"
                onClick={() => {
                  setActiveDate(dateKey)
                  setNote("")
                }}
                className={`relative min-w-0 rounded-xl border px-1 py-2.5 text-center transition ${
                  isFocused
                    ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                    : isToday
                      ? "border-sky-300 bg-sky-50 text-sky-800"
                      : "border-slate-200 bg-slate-50 text-slate-600"
                }`}
              >
                <span className="block truncate text-[10px] font-bold uppercase tracking-[0.08em]">{isToday ? "Today" : dayLabel.weekday}</span>
                <span className="mt-1 block text-sm font-bold">{day.getDate()}</span>
                {dayItems.length ? (
                  <span className={`absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] font-bold ${isFocused ? "bg-sky-400 text-slate-950" : "bg-slate-900 text-white"}`}>
                    {dayItems.length}
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>

        <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{focusedDayLabel.weekday}</p>
              <p className="mt-1 text-base font-bold text-slate-900">{focusedDayLabel.date}</p>
            </div>
            <span className="text-xs font-semibold text-slate-500">{focusedItems.length || "No"} reminder{focusedItems.length === 1 ? "" : "s"}</span>
          </div>

          <div className="mt-3 space-y-2">
            {loading ? <p className="text-sm text-slate-400">Loading...</p> : null}
            {!loading && focusedItems.length === 0 ? <p className="rounded-xl border border-dashed border-slate-300 bg-white p-3 text-sm text-slate-500">Nothing scheduled.</p> : null}
            {!loading && focusedItems.map((item) => (
              <div key={item.id} className="rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
                {editingId === item.id ? (
                  <form onSubmit={(event) => { event.preventDefault(); if (editingTitle.trim()) updateNote(item.id, { title: editingTitle }) }} className="flex gap-2">
                    <input autoFocus value={editingTitle} onChange={(event) => setEditingTitle(event.target.value)} className="min-w-0 flex-1 rounded-lg border border-slate-300 px-2 py-2 text-base outline-none" />
                    <button type="submit" disabled={saving || !editingTitle.trim()} className="text-xs font-semibold text-sky-700">Save</button>
                  </form>
                ) : (
                  <div className="flex items-start gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-900" />
                    <p className="min-w-0 flex-1 text-sm leading-6 text-slate-800">{item.title}</p>
                    <button type="button" onClick={() => updateNote(item.id, { completed: true })} disabled={saving} className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-700 disabled:opacity-40" aria-label={`Complete ${item.title}`}>✓</button>
                    <button type="button" onClick={() => { setEditingId(item.id); setEditingTitle(item.title) }} disabled={saving} className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sky-50 text-sky-700 disabled:opacity-40" aria-label={`Edit ${item.title}`}>✎</button>
                    <button type="button" onClick={() => deleteNote(item.id)} disabled={saving} className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-rose-50 text-rose-600 disabled:opacity-40" aria-label={`Delete ${item.title}`}>×</button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {activeDate === focusedDate ? (
            <form onSubmit={addNote} className="mt-3 border-t border-slate-200 pt-3">
              <label className="sr-only" htmlFor={`schedule-note-mobile-${focusedDate}`}>Add note for {focusedDayLabel.date}</label>
              <input id={`schedule-note-mobile-${focusedDate}`} autoFocus value={note} onChange={(event) => setNote(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-base outline-none focus:border-slate-500" placeholder="Add a reminder" />
              <div className="mt-2 flex gap-2">
                <button type="button" onClick={() => { setActiveDate(""); setNote("") }} className="flex-1 rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-semibold text-slate-700">Cancel</button>
                <button type="submit" disabled={saving || !note.trim()} className="flex-1 rounded-xl bg-slate-900 px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving..." : "Add"}</button>
              </div>
            </form>
          ) : (
            <button type="button" onClick={() => setActiveDate(focusedDate)} className="mt-3 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white">+ Add reminder</button>
          )}
        </div>
      </div>

      <div className="mt-4 hidden grid-cols-5 gap-3 lg:grid">
        {days.map((day) => {
          const dateKey = toDateKey(day)
          const dayItems = records.filter((record) => record.date === dateKey)
          const dayLabel = formatDay(day)
          const isToday = dateKey === todayKey
          const isActive = activeDate === dateKey

          return (
            <div
              key={dateKey}
              onClick={(event) => openDay(event, dateKey)}
              className={`min-h-[210px] min-w-0 cursor-pointer border p-4 transition ${isActive ? "ring-2 ring-sky-400 ring-offset-1" : ""} ${isToday ? "border-sky-300 bg-sky-50/60" : "border-slate-200 bg-slate-50/60"}`}
            >
              <button type="button" onClick={() => setActiveDate(isActive ? "" : dateKey)} className="flex w-full items-start justify-between gap-3 text-left">
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${isToday ? "text-sky-700" : "text-slate-500"}`}>{isToday ? "Today" : dayLabel.weekday}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{dayLabel.date}</p>
                </div>
                <span className="grid h-7 w-7 place-items-center rounded-full border border-slate-300 bg-white text-lg leading-none text-slate-500 transition hover:border-slate-400">+</span>
              </button>
              <div className="mt-4 space-y-2">
                {loading ? <p className="text-sm text-slate-400">Loading...</p> : null}
                {!loading && dayItems.map((item) => (
                  <div key={item.id} className="group rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
                    {editingId === item.id ? (
                      <form onSubmit={(event) => { event.preventDefault(); if (editingTitle.trim()) updateNote(item.id, { title: editingTitle }) }} className="flex gap-2">
                        <input autoFocus value={editingTitle} onChange={(event) => setEditingTitle(event.target.value)} className="min-w-0 flex-1 rounded-lg border border-slate-300 px-2 py-1.5 text-base outline-none sm:text-sm" />
                        <button type="submit" disabled={saving || !editingTitle.trim()} className="text-xs font-semibold text-sky-700">Save</button>
                      </form>
                    ) : (
                    <div className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-900" />
                    <p className="min-w-0 flex-1 text-sm leading-5 text-slate-800">{item.title}</p>
                    <button type="button" onClick={() => updateNote(item.id, { completed: true })} disabled={saving} className="text-slate-400 transition hover:text-emerald-600 disabled:opacity-40" aria-label={`Complete ${item.title}`}>✓</button>
                    <button type="button" onClick={() => { setEditingId(item.id); setEditingTitle(item.title) }} disabled={saving} className="text-slate-400 transition hover:text-sky-600 disabled:opacity-40" aria-label={`Edit ${item.title}`}>✎</button>
                    <button type="button" onClick={() => deleteNote(item.id)} disabled={saving} className="-mr-1 text-slate-300 transition hover:text-rose-600 disabled:opacity-40" aria-label={`Delete ${item.title}`}>×</button>
                    </div>
                    )}
                  </div>
                ))}
              </div>

              {isActive ? (
                <form onSubmit={addNote} className="mt-3 border-t border-slate-200 pt-3">
                  <label className="sr-only" htmlFor={`schedule-note-${dateKey}`}>Add note for {dayLabel.date}</label>
                  <input id={`schedule-note-${dateKey}`} autoFocus value={note} onChange={(event) => setNote(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-base outline-none transition focus:border-slate-500 sm:text-sm" placeholder="Call Tommy" />
                  <button type="submit" disabled={saving || !note.trim()} className="mt-2 w-full rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Saving..." : "Add note"}</button>
                </form>
              ) : null}
            </div>
          )
        })}
      </div>
    </section>
  )
}
