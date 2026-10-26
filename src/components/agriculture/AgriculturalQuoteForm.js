'use client'

import { useState } from 'react'
import { Check, LoaderCircle, Send } from 'lucide-react'

const initialForm = {
  name: '',
  email: '',
  phone: '',
  location: '',
  projectNeed: '20-sow piggery starting point',
  briefStatus: '',
  projectStage: '',
  timeline: '',
  notes: '',
  scope: [],
}

const scopeOptions = [
  'Structural frame',
  'Roof sheeting',
  'Wall cladding',
  'Delivery',
  'Installation review',
]

const fieldClass = 'mt-2 min-h-12 w-full border border-[#9fb7c3] bg-white px-4 text-base text-[#001d2e] outline-none transition placeholder:text-[#8295a0] focus:border-[#0043f3] focus:ring-2 focus:ring-[#0043f3]/15'

export default function AgriculturalQuoteForm({ content }) {
  const [form, setForm] = useState(initialForm)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  function update(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function toggleScope(item) {
    setForm((current) => ({
      ...current,
      scope: current.scope.includes(item)
        ? current.scope.filter((value) => value !== item)
        : [...current.scope, item],
    }))
  }

  async function submit(event) {
    event.preventDefault()
    setStatus('sending')
    setError('')

    const notes = [
      `Agricultural plan: ${content.planLabel}`,
      `Site location: ${form.location}`,
      `Project need: ${form.projectNeed}`,
      `Information available: ${form.briefStatus}`,
      `Project stage: ${form.projectStage}`,
      `Target timing: ${form.timeline || 'To be confirmed'}`,
      `Requested scope: ${form.scope.length ? form.scope.join(', ') : 'To be confirmed'}`,
      form.notes ? `Project notes: ${form.notes}` : null,
    ].filter(Boolean).join('\n')

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          estimate_request: `${form.projectNeed} structural quotation`,
          notes,
          status: 'new',
          lead_source: 'Agricultural Structure Page',
          product_type: `Agricultural Structure - ${form.projectNeed}`,
          next_action: `Review the agricultural project brief, define the Atlas building-shell scope, and contact the client about the requested ${form.projectNeed}.`,
        }),
      })

      const payload = await response.json().catch(() => null)
      if (!response.ok) throw new Error(payload?.error || 'We could not submit the project brief.')

      setForm(initialForm)
      setStatus('sent')
    } catch (submissionError) {
      setStatus('error')
      setError(submissionError.message || 'Something went wrong. Please try again or call Smart Steel.')
    }
  }

  if (status === 'sent') {
    return <div className="border-l-4 border-[#ffcf1a] bg-[#001d2e] p-8 text-white sm:p-10">
      <span className="grid h-12 w-12 place-items-center bg-[#ffcf1a] text-[#001d2e]"><Check className="h-6 w-6" /></span>
      <h3 className="mt-6 text-2xl font-black">Project brief received</h3>
      <p className="mt-3 max-w-xl text-sm leading-7 text-[#c1d9e5]">The Smart Steel team will review the farm brief, site and requested scope before contacting you about an Atlas building-shell proposal.</p>
      <button type="button" onClick={() => setStatus('idle')} className="mt-6 text-sm font-bold text-[#ffcf1a]">Send another agricultural enquiry</button>
    </div>
  }

  return <form onSubmit={submit} className="border border-[#9fb7c3] bg-[#edf5f8] p-5 sm:p-8">
    <fieldset className="mb-7 border-b border-[#9fb7c3] pb-7">
      <legend className="text-sm font-black">What are you planning? *</legend>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {['20-sow piggery starting point', 'Different piggery capacity', 'Custom piggery layout', 'Another agricultural structure'].map((item) => <label key={item} className={`flex min-h-12 cursor-pointer items-center gap-3 border px-4 text-sm font-bold transition ${form.projectNeed === item ? 'border-[#0043f3] bg-white text-[#0043f3]' : 'border-[#b8cdd7] bg-white/60 text-[#264554]'}`}><input required type="radio" name="projectNeed" value={item} checked={form.projectNeed === item} onChange={update} className="h-4 w-4 accent-[#0043f3]" />{item}</label>)}
      </div>
      {form.projectNeed !== '20-sow piggery starting point' ? <p className="mt-3 border-l-2 border-[#0043f3] pl-3 text-xs leading-5 text-[#526c79]">Use the project notes below to describe the capacity, building type or layout you need. Smart Steel will review it as a custom agricultural enquiry.</p> : null}
    </fieldset>
    <div className="grid gap-5 sm:grid-cols-2">
      <label className="text-sm font-bold">Full name *<input required name="name" autoComplete="name" value={form.name} onChange={update} className={fieldClass} /></label>
      <label className="text-sm font-bold">Mobile number *<input required name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={update} className={fieldClass} /></label>
      <label className="text-sm font-bold">Email address *<input required name="email" type="email" autoComplete="email" value={form.email} onChange={update} className={fieldClass} /></label>
      <label className="text-sm font-bold">Farm or project location *<input required name="location" value={form.location} onChange={update} placeholder="Town, province or farm area" className={fieldClass} /></label>
      <label className="text-sm font-bold">Information available *<select required name="briefStatus" value={form.briefStatus} onChange={update} className={fieldClass}><option value="">Select one</option><option>I am starting with the 20-sow concept</option><option>I have a farm or production brief</option><option>I have a preliminary layout</option><option>I have professional drawings</option></select></label>
      <label className="text-sm font-bold">Project stage *<select required name="projectStage" value={form.projectStage} onChange={update} className={fieldClass}><option value="">Select one</option><option>Budget planning</option><option>Professional design underway</option><option>Ready for structural quotation</option><option>Procurement underway</option></select></label>
      <label className="text-sm font-bold sm:col-span-2">Target timing<select name="timeline" value={form.timeline} onChange={update} className={fieldClass}><option value="">To be confirmed</option><option>Within 3 months</option><option>3 to 6 months</option><option>6 to 12 months</option><option>More than 12 months</option></select></label>
    </div>

    <fieldset className="mt-7 border-t border-[#9fb7c3] pt-6">
      <legend className="pr-4 text-sm font-black">What should Smart Steel review?</legend>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {scopeOptions.map((item) => <label key={item} className={`flex min-h-12 cursor-pointer items-center gap-3 border px-4 text-sm font-bold transition ${form.scope.includes(item) ? 'border-[#0043f3] bg-white text-[#0043f3]' : 'border-[#b8cdd7] bg-white/60 text-[#264554]'}`}><input type="checkbox" checked={form.scope.includes(item)} onChange={() => toggleScope(item)} className="h-4 w-4 accent-[#0043f3]" />{item}</label>)}
      </div>
    </fieldset>

    <label className="mt-6 block text-sm font-bold">Need something specific?<textarea name="notes" rows="4" value={form.notes} onChange={update} placeholder="Tell us the capacity, building type, preferred size, site constraints or any other requirements." className={`${fieldClass} py-3`} /></label>

    {error ? <p role="alert" className="mt-5 border-l-4 border-red-600 bg-white px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}

    <div className="mt-6 flex flex-col gap-4 border-t border-[#9fb7c3] pt-6 sm:flex-row sm:items-center sm:justify-between">
      <p className="max-w-md text-xs leading-5 text-[#526c79]">This request starts a project review. Final scope and pricing remain subject to the confirmed layout, site information and professional requirements.</p>
      <button disabled={status === 'sending'} className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 bg-[#0043f3] px-6 text-sm font-black text-white transition hover:bg-[#001d2e] disabled:cursor-wait disabled:opacity-65">{status === 'sending' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}{status === 'sending' ? 'Sending brief...' : 'Send project brief'}</button>
    </div>
  </form>
}
