"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { CalendarDays, Check, Clock3, Phone } from "lucide-react"
import { REVIEW_HOST, formatReviewTime } from "../../lib/quoteReview.mjs"

export default function QuoteReviewBooking({ token }) {
  const [data, setData] = useState(null)
  const [date, setDate] = useState("")
  const [slot, setSlot] = useState("")
  const [phone, setPhone] = useState("")
  const [question, setQuestion] = useState("")
  const [timezone, setTimezone] = useState(REVIEW_HOST.timeZone)
  const [editing, setEditing] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [localZone, setLocalZone] = useState(REVIEW_HOST.timeZone)
  const load = useCallback(async () => {
    const response = await fetch(`/api/quote-review/${encodeURIComponent(token)}`, { cache: "no-store" })
    const payload = await response.json()
    if (!response.ok) throw new Error(payload.error || "Available times could not be loaded.")
    setData(payload)
    setDate((current) => payload.dates.some((day) => day.date === current) ? current : payload.dates[0]?.date || "")
    setPhone((current) => current || payload.phone || "")
    setQuestion((current) => current || payload.review?.question || "")
    return payload
  }, [token])
  useEffect(() => {
    load().catch((err) => setError(err.message))
    setLocalZone(Intl.DateTimeFormat().resolvedOptions().timeZone || REVIEW_HOST.timeZone)
  }, [load])
  const activeReview = data?.review?.status === "booked" ? data.review : null
  const canChoose = (data?.canBook || activeReview) && (!activeReview || editing)
  const selectedDay = data?.dates.find((day) => day.date === date)
  const dayLabel = (value) => new Intl.DateTimeFormat("en-ZA", { weekday: "short", day: "numeric", month: "short", timeZone: REVIEW_HOST.timeZone }).format(new Date(`${value}T12:00:00+02:00`))

  async function submit(event) {
    event.preventDefault()
    if (!slot || saving) return
    await changeBooking({ action: "book", startsAt: slot, phone, question, timezone, ...(activeReview ? { revision: activeReview.revision } : {}) })
  }
  async function changeBooking(body) {
    setSaving(true); setError(""); setNotice("")
    try {
      const response = await fetch(`/api/quote-review/${encodeURIComponent(token)}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      const payload = await response.json()
      if (!response.ok) {
        await load()
        setSlot("")
        throw new Error(payload.error || "Your booking could not be saved.")
      }
      setEditing(false); setConfirmCancel(false); setSlot("")
      setNotice(payload.notificationPending ? "Your appointment has been saved. The confirmation email is pending; you can check the details here." : body.action === "cancel" ? "Your call has been cancelled. You can choose another time when you’re ready." : "Your call is confirmed. We’ll email the details to you.")
      await load()
    } catch (err) { setError(err.message) } finally { setSaving(false) }
  }

  return <main className="min-h-dvh bg-[#f3f7fa] px-4 py-6 text-[#001d2e] sm:py-12">
    <div className="mx-auto max-w-2xl">
      <Link href="/" className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Smart Steel</Link>
      <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Let’s talk through your proposal</p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">A quick call with Marco</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">We’ll walk through the proposed scope, answer your questions and help you decide on the next step.</p>
        <div className="mt-5 flex flex-wrap gap-3 text-xs font-semibold text-slate-600"><span className="flex items-center gap-1.5"><Clock3 className="h-4 w-4" />15 minutes</span><span className="flex items-center gap-1.5"><Phone className="h-4 w-4" />Marco calls you</span><span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4" />Weekdays · 08:00–17:00 SAST</span></div>
        {data ? <p className="mt-4 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">{data.title} · V{data.version}</p> : !error ? <p className="mt-6 text-sm text-slate-500" role="status">Loading available times…</p> : null}
        {error ? <p role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-800">{error}</p> : null}
        {notice ? <p role="status" className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">{notice}</p> : null}
        {activeReview && !editing ? <div className="mt-6">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><p className="flex items-center gap-2 font-bold text-emerald-900"><Check className="h-5 w-5" />Your call is booked</p><p className="mt-3 font-semibold">{formatReviewTime(activeReview.startsAt)}</p><p className="mt-1 text-xs text-slate-600">South African time · SAST (UTC+2)</p>{activeReview.timezone !== REVIEW_HOST.timeZone ? <p className="mt-2 text-xs text-slate-600">{formatReviewTime(activeReview.startsAt, activeReview.timezone)} · {activeReview.timezone}</p> : null}<p className="mt-3 text-sm text-slate-600">Marco will call you on <strong>{activeReview.phone}</strong>.</p></div>
          {new Date(activeReview.startsAt) > new Date() ? <div className="mt-4 flex flex-wrap gap-3"><button disabled={saving} type="button" onClick={() => setEditing(true)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold disabled:opacity-50">Change time</button><button disabled={saving} type="button" onClick={() => setConfirmCancel(true)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 disabled:opacity-50">Cancel call</button></div> : <p className="mt-4 text-sm text-slate-600">Please contact Marco if you need to arrange another call.</p>}
          {confirmCancel ? <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4"><p className="text-sm text-amber-950">Cancel this call? You can choose another time afterwards.</p><div className="mt-3 flex flex-wrap gap-3"><button type="button" disabled={saving} onClick={() => changeBooking({ action: "cancel", revision: activeReview.revision })} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Yes, cancel call</button><button type="button" disabled={saving} onClick={() => setConfirmCancel(false)} className="px-3 py-2 text-sm font-semibold text-slate-600">Keep call</button></div></div> : null}
        </div> : null}
        {canChoose ? <form onSubmit={submit} className="mt-6 space-y-5">
          <div><label htmlFor="review-date" className="text-sm font-semibold">Choose a day</label><select id="review-date" value={date} onChange={(event) => { setDate(event.target.value); setSlot("") }} className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm">{data.dates.map((day) => <option key={day.date} value={day.date}>{dayLabel(day.date)}</option>)}</select></div>
          <fieldset><legend className="text-sm font-semibold">Choose a start time</legend><p className="mt-1 text-xs text-slate-500">{timezone === REVIEW_HOST.timeZone ? "South African time · SAST (UTC+2)" : `Times shown in ${timezone}; the day above is the South African booking day.`}</p><div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">{selectedDay?.slots.map((value) => <label key={value} className={`cursor-pointer rounded-xl border focus-within:ring-2 focus-within:ring-blue-400 focus-within:ring-offset-2 px-3 py-3 text-center text-sm font-semibold transition ${slot === value ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 hover:border-blue-300"}`}><input type="radio" name="review-time" value={value} checked={slot === value} onChange={() => setSlot(value)} className="sr-only" /><span>{new Intl.DateTimeFormat("en-ZA", { timeZone: timezone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(value))}</span></label>)}</div>{!data.dates.length ? <p className="mt-3 text-sm text-slate-600">No times are available just now. Please reply to your proposal email and we’ll arrange a suitable time.</p> : null}</fieldset>
          {localZone !== REVIEW_HOST.timeZone ? <label className="block text-xs text-slate-500">Show times in<select value={timezone} onChange={(event) => setTimezone(event.target.value)} className="ml-2 rounded-lg border border-slate-200 bg-white p-2"><option value={REVIEW_HOST.timeZone}>South Africa · UTC+2</option><option value={localZone}>My timezone · {localZone}</option></select></label> : null}
          <label className="block text-sm font-semibold" htmlFor="review-phone">Number Marco should call<input id="review-phone" type="tel" required maxLength={40} autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-2 block w-full rounded-xl border border-slate-300 p-3 text-sm font-normal" /></label>
          <details><summary className="cursor-pointer text-sm font-semibold text-slate-500">Anything you’d like us to look at? (optional)</summary><textarea aria-label="Question before the call" value={question} maxLength={1000} onChange={(event) => setQuestion(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 p-3 text-sm" rows={3} /></details>
          <button type="submit" disabled={!slot || !phone.trim() || saving} className="w-full rounded-xl bg-[#0043f3] px-5 py-3.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Saving your call…" : editing ? "Confirm new time" : "Confirm call"}</button>
          {editing ? <button type="button" disabled={saving} onClick={() => setEditing(false)} className="w-full text-sm font-semibold text-slate-500">Keep my current time</button> : null}
        </form> : data && !activeReview ? <p className="mt-5 text-sm leading-6 text-slate-600">{data.canBook ? "" : "Please contact Marco to arrange a call about this project or request the latest proposal."}</p> : null}
        <div className="mt-6 border-t border-slate-100 pt-5 text-xs leading-6 text-slate-500"><p>Prefer email? <a href="mailto:info@smartsteel.co.za" className="font-semibold text-blue-700">info@smartsteel.co.za</a></p><Link href={`/quotes/${encodeURIComponent(token)}`} className="font-semibold text-blue-700">Back to your proposal</Link><p>Booking a call is optional. You can still view and accept your proposal directly.</p></div>
      </section>
    </div>
  </main>
}
