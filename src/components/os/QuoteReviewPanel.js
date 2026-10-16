"use client"
import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { CalendarDays, Phone } from "lucide-react"
import { getOsAuthHeaders } from "../../lib/osClientAuth"
import { formatReviewTime, REVIEW_OUTCOME_LABELS, reviewSlots } from "../../lib/quoteReview.mjs"

export default function QuoteReviewPanel({ leadId, compact = false }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const [blockTime, setBlockTime] = useState("")
  const [editing, setEditing] = useState("")
  const [outcome, setOutcome] = useState("awaiting_decision")
  const [notes, setNotes] = useState("")
  const [nextAction, setNextAction] = useState("")
  const [nextAt, setNextAt] = useState("")
  const load = useCallback(async () => {
    const response = await fetch(`/api/os/quote-reviews${leadId ? `?leadId=${encodeURIComponent(leadId)}` : ""}`, { headers: await getOsAuthHeaders(), cache: "no-store" })
    const payload = await response.json()
    if (!response.ok) throw new Error(payload.error || "Reviews could not be loaded.")
    setData(payload)
  }, [leadId])
  useEffect(() => {
    const refresh = () => load().catch((err) => setError(err.message))
    refresh()
    const timer = setInterval(refresh, 60000)
    window.addEventListener("focus", refresh)
    return () => { clearInterval(timer); window.removeEventListener("focus", refresh) }
  }, [load])
  async function update(body) {
    if (busy) return
    setBusy(true); setError("")
    try {
      const response = await fetch("/api/os/quote-reviews", { method: "POST", headers: await getOsAuthHeaders({ "Content-Type": "application/json" }), body: JSON.stringify(body) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Review could not be updated.")
      setEditing(""); setNotes(""); setNextAction(""); setNextAt(""); setBlockTime("")
      await load()
      window.dispatchEvent(new Event("os:schedule-updated"))
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }
  const reviews = data?.records || []
  const active = reviews.filter((review) => review.status === "booked").sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at))
  const visible = [...active, ...reviews.filter((review) => review.status !== "booked" && review.notificationError)]
  const unavailable = [...(data?.blocks || []).map((item) => item.starts_at), ...active.map((item) => item.starts_at)]
  const options = reviewSlots(new Date(), unavailable)
  if (data?.setupRequired) return <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Quote-review booking needs its database setup before it can be enabled.</section>
  if (compact && !reviews.length && !error) return null
  return <section id={compact ? undefined : "quote-reviews"} className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="flex items-center gap-2 text-lg font-bold text-[#001d2e]"><CalendarDays className="h-5 w-5 text-blue-700" />Quote review calls</h2><p className="mt-1 text-xs leading-5 text-slate-500">Marco · 15-minute phone calls · weekdays 08:00–17:00 SAST</p></div><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{active.length} booked</span></div>
    {data && data.mailReady === false ? <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">The email service is not configured. Appointment emails remain pending.</p> : null}
    {error ? <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{error}</p> : null}
    {!data && !error ? <p className="mt-4 text-sm text-slate-500">Loading calls…</p> : null}
    {data && !active.length ? <p className="mt-4 text-sm text-slate-500">No quote review calls are currently booked.</p> : null}
    <div className="mt-4 space-y-3">{(compact ? reviews.slice(0, 3) : visible).map((review) => {
      const elapsed = new Date(review.starts_at) <= new Date()
      return <article key={review.id} className={`rounded-xl border p-4 ${elapsed && review.status === "booked" ? "border-amber-200 bg-amber-50/50" : "border-slate-200"}`}>
        <div className="flex flex-wrap items-start justify-between gap-2"><div><p className="font-semibold text-slate-900">{[review.lead?.name, review.lead?.last_name].filter(Boolean).join(" ") || "Client"}</p><p className="mt-1 text-sm text-slate-700">{formatReviewTime(review.starts_at)} SAST</p><p className="mt-1 text-xs text-slate-500">{review.quote_title} · booked against V{review.quote_version}</p></div><span className={`rounded-full px-2 py-1 text-xs font-semibold ${review.status === "booked" ? "bg-blue-50 text-blue-800" : "bg-slate-100 text-slate-600"}`}>{review.status === "booked" && elapsed ? "Outcome needed" : review.status.replaceAll("_", " ")}</span></div>
        <p className="mt-3 flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-slate-400" /><a href={`tel:${review.phone}`}>{review.phone}</a></p>
        {review.question ? <p className="mt-2 text-sm leading-6 text-slate-600">Client question: {review.question}</p> : null}
        {review.latestVersion > review.quote_version ? <p className="mt-3 rounded-lg bg-amber-50 p-2 text-xs text-amber-900">A newer proposal exists: V{review.latestVersion}. Review the latest scope before the call.</p> : null}
        {["won", "lost"].includes(review.lead?.status) && review.status === "booked" ? <p className="mt-3 rounded-lg bg-amber-50 p-2 text-xs text-amber-900">This lead is now {review.lead.status}. Confirm whether to keep or cancel the call.</p> : null}
        {review.notificationError ? <div className="mt-3 rounded-lg bg-rose-50 p-3 text-xs text-rose-800">An appointment email needs attention.{data.canManage ? <button type="button" disabled={busy} onClick={() => update({ action: "retry_notifications", reviewId: review.id })} className="ml-2 font-bold underline">Retry delivery</button> : null}</div> : null}
        <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold"><Link href={`/os/crm?leadId=${review.lead_id}`} className="text-blue-700">Open lead</Link>{review.token ? <Link href={`/quotes/${review.token}`} target="_blank" className="text-blue-700">View booked proposal</Link> : null}{data.canManage && review.token && review.status === "booked" && !elapsed ? <Link href={`/quote-review/${review.token}`} target="_blank" className="text-blue-700">Change time</Link> : null}{data.canManage && review.status === "booked" ? <button type="button" disabled={busy} onClick={() => { if (window.confirm("Cancel this call and notify the client?")) update({ action: "cancel", reviewId: review.id, revision: review.revision, notes: "Cancelled by Marco." }) }} className="text-slate-500">Cancel call</button> : null}{data.canManage && review.status === "booked" && elapsed ? <><button type="button" disabled={busy} onClick={() => setEditing(editing === review.id ? "" : review.id)} className="text-blue-700">Record outcome</button><button type="button" disabled={busy} onClick={() => { if (window.confirm("Record this call as a no-show and create a personal follow-up?")) update({ action: "no_show", reviewId: review.id, revision: review.revision, notes: "Client did not attend; Marco to contact personally." }) }} className="text-slate-500">Client did not attend</button></> : null}</div>
        {editing === review.id ? <form className="mt-4 space-y-3 border-t border-slate-100 pt-4" onSubmit={(event) => { event.preventDefault(); update({ action: "complete", reviewId: review.id, revision: review.revision, outcome, notes, nextAction, nextAt: nextAt ? new Date(`${nextAt}+02:00`).toISOString() : null }) }}><label className="block text-xs font-semibold text-slate-600">Outcome<select value={outcome} onChange={(event) => setOutcome(event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-300 bg-white p-2 text-sm">{Object.entries(REVIEW_OUTCOME_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="block text-xs font-semibold text-slate-600">Review notes / buying obstacle<textarea required minLength={3} maxLength={4000} rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-300 p-2 text-sm" /></label>{outcome !== "lost" ? <><label className="block text-xs font-semibold text-slate-600">Next action<input required value={nextAction} onChange={(event) => setNextAction(event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-300 p-2 text-sm" /></label><label className="block text-xs font-semibold text-slate-600">Follow-up date and time (SAST)<input required type="datetime-local" value={nextAt} onChange={(event) => setNextAt(event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-300 p-2 text-sm" /></label></> : <p className="text-xs text-slate-500">This records the review outcome. Confirm the Lost status and reason in the lead separately.</p>}<button type="submit" disabled={busy} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Save outcome</button></form> : null}
      </article>
    })}</div>
    {!compact && data?.canManage ? <details className="mt-5 border-t border-slate-100 pt-4"><summary className="cursor-pointer text-sm font-semibold text-slate-600">Block unavailable times</summary><form className="mt-3 flex flex-wrap gap-2" onSubmit={(event) => { event.preventDefault(); update({ action: "block", startsAt: blockTime }) }}><select aria-label="Time to block" required value={blockTime} onChange={(event) => setBlockTime(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white p-2 text-sm"><option value="">Choose a weekday hour…</option>{options.map((day) => <optgroup key={day.date} label={day.date}>{day.slots.map((slot) => <option key={slot} value={slot}>{formatReviewTime(slot)} SAST</option>)}</optgroup>)}</select><button disabled={busy || !blockTime} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Block time</button></form><div className="mt-3 space-y-2">{data.blocks.map((block) => <div key={block.id} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-3 text-xs"><span>{formatReviewTime(block.starts_at)} SAST</span><button type="button" disabled={busy} onClick={() => update({ action: "unblock", blockId: block.id })} className="font-semibold text-blue-700">Make available</button></div>)}</div></details> : null}
  </section>
}
