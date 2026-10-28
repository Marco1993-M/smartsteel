"use client"
import { useEffect, useId, useRef, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import AnalyticsMonthPicker from './AnalyticsMonthPicker'
import { analyticsDateKey, analyticsPeriodQuery, buildAnalyticsSelection, currentAnalyticsMonth, monthLabel, shiftAnalyticsDay, shiftMonth } from '../../lib/analyticsPeriods.mjs'

const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const control='min-h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600'
const dateLabel=day=>day ? new Date(`${day}T12:00:00+02:00`).toLocaleDateString('en-ZA',{day:'numeric',month:'short',year:'numeric',timeZone:'Africa/Johannesburg'}) : 'Choose date'

export default function AnalyticsPeriodPicker({ value, onChange }) {
 const [open,setOpen]=useState(false)
 const [from,setFrom]=useState('')
 const [to,setTo]=useState('')
 const [phase,setPhase]=useState('from')
 const [view,setView]=useState(currentAnalyticsMonth)
 const root=useRef(null),trigger=useRef(null),periodControl=useRef(null),days=useRef(null)
 const id=useId(),today=analyticsDateKey(),maxYear=Number(today.slice(0,4))
 const year=Number(view.slice(0,4)),month=Number(view.slice(5))
 const firstWeekday=(new Date(`${view}-01T12:00:00Z`).getUTCDay()+6)%7
 const dayCount=new Date(Date.UTC(year,month,0)).getUTCDate()
 const close=(restore=true)=>{setOpen(false);if(restore)(value.range==='custom'?trigger.current:periodControl.current)?.focus()}
 function begin() {
  const period=buildAnalyticsSelection(new URLSearchParams(analyticsPeriodQuery(value)))
  const initial=period.from || analyticsDateKey(period.start)
  const last=period.to || (period.isCurrent?today:analyticsDateKey(new Date(Date.parse(period.end)-1)))
  setFrom(initial);setTo(last);setView(initial.slice(0,7));setPhase('from');setOpen(true)
 }
 useEffect(()=>{
  if(!open)return
  days.current?.querySelector('button[aria-pressed="true"]:not(:disabled)')?.focus()
  const outside=event=>{if(!root.current?.contains(event.target))setOpen(false)}
  document.addEventListener('pointerdown',outside)
  return()=>document.removeEventListener('pointerdown',outside)
 },[open])
 function pick(day) {
  if(phase==='from' || !from || day<from) {setFrom(day);setTo('');setPhase('to')}
  else {setTo(day);setPhase('from')}
 }
 const ready=from && to && from<=to && to<=today && from>='2000-01-01'
 return <div ref={root} className="relative flex flex-wrap items-center gap-2" onKeyDown={event=>{
  if(event.key==='Escape' && open){event.preventDefault();close()}
  if(event.key==='Tab')requestAnimationFrame(()=>{if(!root.current?.contains(document.activeElement))setOpen(false)})
 }}>
  <select ref={periodControl} aria-label="Reporting period" value={open?'custom':value.range} onChange={event=>{
   const range=event.target.value
   if(range==='custom')begin()
   else {setOpen(false);onChange(range==='month'?{range,month:value.month || currentAnalyticsMonth()}:{range})}
  }} className={control}>
   <option value="month">Calendar month</option><option value="last7">Last 7 days</option><option value="last30">Last 30 days</option><option value="last3months">Last 3 months</option><option value="custom">Custom range</option>
  </select>
  {value.range==='month' && !open ? <AnalyticsMonthPicker value={value.month} onChange={month=>onChange({range:'month',month})} /> : null}
  {value.range==='custom' || open ? <button ref={trigger} type="button" onClick={()=>open?close():begin()} aria-label="Choose custom reporting dates" aria-haspopup="dialog" aria-expanded={open} aria-controls={open?id:undefined} className={`${control} inline-flex items-center gap-2`}><CalendarDays size={15} className="text-sky-700" aria-hidden="true" />{value.range==='custom'?`${dateLabel(value.from)} – ${dateLabel(value.to)}`:'Choose dates'}</button> : null}
  {open && <div id={id} role="dialog" aria-label="Custom reporting range" className="absolute left-0 top-full z-50 mt-2 w-[min(23rem,calc(100vw-2.5rem))] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:left-auto sm:right-0">
   <p className="text-sm font-bold text-slate-900">Choose your reporting dates</p>
   <div className="mt-3 grid grid-cols-2 gap-2">{[['from','Start date',from],['to','End date',to]].map(([key,label,date])=><button key={key} type="button" onClick={()=>setPhase(key)} aria-pressed={phase===key} className={`rounded-lg border p-3 text-left ${phase===key?'border-sky-600 bg-sky-50':'border-slate-200'}`}><span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</span><span className="mt-1 block text-xs font-semibold text-slate-900">{dateLabel(date)}</span></button>)}</div>
   <div className="mt-4 flex items-center justify-between gap-2">
    <button type="button" aria-label="Previous calendar month" disabled={view<='2000-01'} onClick={()=>setView(shiftMonth(view,-1))} className="grid h-9 w-8 place-items-center rounded-lg hover:bg-slate-100 disabled:opacity-30"><ChevronLeft size={16} /></button>
    <select aria-label="Calendar month" value={month} onChange={event=>{const candidate=`${year}-${String(event.target.value).padStart(2,'0')}`;setView(candidate>currentAnalyticsMonth()?currentAnalyticsMonth():candidate)}} className="min-h-9 min-w-0 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold">{MONTHS.map((label,index)=><option key={label} value={index+1} disabled={year===maxYear && index+1>Number(today.slice(5,7))}>{label}</option>)}</select>
    <select aria-label="Calendar year" value={year} onChange={event=>{const candidate=`${event.target.value}-${String(month).padStart(2,'0')}`;setView(candidate>currentAnalyticsMonth()?currentAnalyticsMonth():candidate)}} className="min-h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold">{Array.from({length:maxYear-1999},(_,i)=>maxYear-i).map(y=><option key={y} value={y}>{y}</option>)}</select>
    <button type="button" aria-label="Next calendar month" disabled={view>=currentAnalyticsMonth()} onClick={()=>setView(shiftMonth(view,1))} className="grid h-9 w-8 place-items-center rounded-lg hover:bg-slate-100 disabled:opacity-30"><ChevronRight size={16} /></button>
   </div>
   <div className="mt-3 grid grid-cols-7 text-center text-[10px] font-semibold text-slate-400">{['M','T','W','T','F','S','S'].map((day,i)=><span key={i}>{day}</span>)}</div>
   <div ref={days} aria-label={monthLabel(view)} className="mt-1 grid grid-cols-7 gap-y-1" onKeyDown={event=>{
    const delta={ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7}[event.key]
    if(delta==null || !event.target.dataset.day)return
    event.preventDefault()
    const next=shiftAnalyticsDay(event.target.dataset.day,delta)
    const target=days.current.querySelector(`[data-day="${next}"]:not(:disabled)`)
    if(target)target.focus()
   }}>
    {Array.from({length:firstWeekday},(_,i)=><span key={`blank-${i}`} />)}
    {Array.from({length:dayCount},(_,i)=>{
     const day=`${view}-${String(i+1).padStart(2,'0')}`,endpoint=day===from || day===to,inside=from && to && day>from && day<to
     return <button key={day} type="button" data-day={day} disabled={day>today} aria-label={dateLabel(day)} aria-pressed={endpoint} onClick={()=>pick(day)} className={`min-h-9 rounded-lg text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sky-600 disabled:cursor-not-allowed disabled:text-slate-300 ${endpoint?'bg-sky-700 text-white':inside?'bg-sky-50 text-sky-800':'text-slate-700 hover:bg-slate-100 disabled:hover:bg-transparent'}`}>{i+1}</button>
    })}
   </div>
   <p role="status" className="mt-3 text-[11px] text-slate-500">{phase==='to'?'Now choose the end date.':'Choose a start date, then an end date.'} Dates use South African time.</p>
   <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-3"><button type="button" onClick={()=>close()} className={control}>Cancel</button><button type="button" disabled={!ready} onClick={()=>{onChange({range:'custom',from,to});close()}} className="min-h-10 rounded-lg bg-sky-700 px-4 text-xs font-semibold text-white hover:bg-sky-800 disabled:opacity-40">Apply range</button></div>
  </div>}
 </div>
}
