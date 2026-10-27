"use client"

import { useEffect, useId, useRef, useState } from "react"
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import { currentAnalyticsMonth, monthLabel, shiftMonth } from "../../lib/analyticsPeriods.mjs"

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MIN_MONTH = '2000-01'
const control = 'inline-flex min-h-10 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600'

export default function AnalyticsMonthPicker({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const [year, setYear] = useState(Number(value.slice(0, 4)))
  const root = useRef(null)
  const trigger = useRef(null)
  const grid = useRef(null)
  const popupId = useId()
  const current = currentAnalyticsMonth()
  const maxYear = Number(current.slice(0, 4))

  useEffect(() => {
    if (!open) return
    const selected = grid.current?.querySelector('[aria-pressed="true"]:not(:disabled)')
    ;(selected || grid.current?.querySelector('button:not(:disabled)'))?.focus()
    const outside = (event) => {
      if (!root.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', outside)
    return () => document.removeEventListener('pointerdown', outside)
  }, [open])

  function choose(month) {
    if (month < MIN_MONTH || month > current) return
    onChange(month)
    setOpen(false)
    trigger.current?.focus()
  }

  function navigateMonths(event) {
    const buttons = [...grid.current.querySelectorAll('button')]
    const index = buttons.indexOf(event.target)
    if (index < 0) return
    let target
    if (event.key === 'ArrowLeft') target = index - 1
    if (event.key === 'ArrowRight') target = index + 1
    if (event.key === 'ArrowUp') target = index - 3
    if (event.key === 'ArrowDown') target = index + 3
    if (event.key === 'Home') target = 0
    if (event.key === 'End') target = buttons.findLastIndex(button => !button.disabled)
    if (target == null) return
    event.preventDefault()
    if (buttons[target] && !buttons[target].disabled) buttons[target].focus()
  }

  return <div ref={root} className="relative" onKeyDown={(event) => {
    if (event.key === 'Escape' && open) {
      event.preventDefault()
      event.stopPropagation()
      setOpen(false)
      trigger.current?.focus()
    }
    if (event.key === 'Tab') {
      // This is a non-modal picker: normal tab order can leave it.
      requestAnimationFrame(() => {
        if (!root.current?.contains(document.activeElement)) setOpen(false)
      })
    }
  }}>
    <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-0.5">
      <button type="button" aria-label="Previous reporting month" disabled={value <= MIN_MONTH} onClick={() => choose(shiftMonth(value, -1))} className={`${control} w-9`}><ChevronLeft size={16} aria-hidden="true" /></button>
      <button ref={trigger} type="button" aria-label={`Reporting month: ${monthLabel(value)}`} aria-haspopup="dialog" aria-expanded={open} aria-controls={open ? popupId : undefined} onClick={() => { if (!open) setYear(Number(value.slice(0, 4))); setOpen(!open) }} className={`${control} gap-2 px-2 text-xs font-semibold text-slate-900`}>
        <CalendarDays size={16} className="text-sky-700" aria-hidden="true" /><span>{monthLabel(value)}</span><ChevronDown size={13} aria-hidden="true" />
      </button>
      <button type="button" aria-label="Next reporting month" disabled={value >= current} onClick={() => choose(shiftMonth(value, 1))} className={`${control} w-9`}><ChevronRight size={16} aria-hidden="true" /></button>
    </div>
    {open && <div id={popupId} role="dialog" aria-label="Choose reporting month" className="absolute left-0 top-full sm:left-auto sm:right-0 z-50 mt-2 w-[min(20rem,calc(100vw-2.5rem))] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
      <div className="flex items-center justify-between gap-3">
        <button type="button" aria-label="Previous year" disabled={year <= 2000} onClick={() => setYear(year - 1)} className={`${control} w-10`}><ChevronLeft size={17} aria-hidden="true" /></button>
        <select aria-label="Reporting year" value={year} onChange={(event) => setYear(Number(event.target.value))} className="min-h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 focus-visible:outline-sky-600">
          {Array.from({ length: maxYear - 1999 }, (_, index) => maxYear - index).map(option => <option key={option} value={option}>{option}</option>)}
        </select>
        <button type="button" aria-label="Next year" disabled={year >= maxYear} onClick={() => setYear(year + 1)} className={`${control} w-10`}><ChevronRight size={17} aria-hidden="true" /></button>
      </div>
      <div ref={grid} onKeyDown={navigateMonths} className="mt-3 grid grid-cols-3 gap-2">
        {MONTHS.map((label, index) => {
          const month = `${year}-${String(index + 1).padStart(2, '0')}`
          const selected = month === value
          return <button key={month} type="button" disabled={month > current} aria-label={monthLabel(month)} aria-pressed={selected} onClick={() => choose(month)} className={`min-h-11 rounded-lg px-3 py-2.5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 disabled:cursor-not-allowed disabled:text-slate-300 ${selected ? 'bg-sky-700 text-white hover:bg-sky-800' : 'text-slate-700 hover:bg-slate-100 disabled:hover:bg-transparent'}`}>{label}</button>
        })}
      </div>
      <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3">
        <button type="button" onClick={() => choose(current)} className={`${control} flex-1 border border-slate-200 px-3 text-xs font-semibold`}>This month</button>
        <button type="button" onClick={() => choose(shiftMonth(current, -1))} className={`${control} flex-1 border border-slate-200 px-3 text-xs font-semibold`}>Last month</button>
      </div>
      <p className="mt-3 text-[11px] leading-4 text-slate-500">Calendar months · South African time. This month shows progress to date.</p>
    </div>}
  </div>
}
