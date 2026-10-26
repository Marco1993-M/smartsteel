'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, LoaderCircle, Pencil, Send } from 'lucide-react'
import { AGRICULTURAL_FORM_STEPS, agriculturalFormKind, agriculturalFormProfile, buildAgriculturalEnquiry } from '../../lib/agriculturalEnquiry.mjs'

const initialForm = {
  name: '', email: '', phone: '', location: '', projectNeed: '', capacity: '', birdCapacity: '',
  briefStatus: 'Not sure yet', projectStage: 'Not sure yet', timeline: '', notes: '', scope: [],
  ventilation: 'Not sure yet', ventilationLayout: 'Not sure yet', proposedSize: '',
  insulation: 'Not sure yet', insulationSpecification: '', equipment: 'Not sure yet',
  deliveryAccess: 'Not sure yet', siteReadiness: 'To be confirmed',
}
const defaultProjectOptions = ['20-sow piggery starting point', 'Different piggery capacity', 'Custom piggery layout', 'Another agricultural structure']
const defaultBriefOptions = ['I am starting with the 20-sow concept', 'I have a farm or production brief', 'I have a preliminary layout', 'I have professional drawings']
const scopeOptions = ['Structural frame', 'Roof sheeting', 'Wall cladding', 'Roof insulation review', 'Delivery', 'Installation review']
const fieldClass = 'mt-2 min-h-12 w-full min-w-0 border border-[#9fb7c3] bg-white px-4 text-base text-[#001d2e] outline-none transition placeholder:text-[#8295a0] focus:border-[#0043f3] focus:ring-2 focus:ring-[#0043f3]/15'
const optionClass = 'flex min-h-12 cursor-pointer items-center gap-3 border px-4 py-3 text-sm font-bold transition'

export default function AgriculturalQuoteForm({ content, projectOptions = defaultProjectOptions, defaultProjectNeed = defaultProjectOptions[0], briefOptions = defaultBriefOptions, leadSource = 'Agricultural Structure Page', poultryBrief = false, formKind = 'auto' }) {
  const freshForm = () => ({ ...initialForm, scope: [], projectNeed: defaultProjectNeed })
  const [form, setForm] = useState(freshForm)
  const [step, setStep] = useState(0)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const headingRef = useRef(null)
  const successRef = useRef(null)
  const previousStep = useRef(0)
  const sendingRef = useRef(false)
  const kind = agriculturalFormKind(poultryBrief ? 'poultry' : formKind, form.projectNeed)
  const profile = agriculturalFormProfile(kind)
  const isPoultry = kind === 'poultry'
  const hasInsulation = isPoultry || form.scope.includes('Roof insulation review')
  const isLastStep = step === 2
  const capacity = isPoultry ? form.birdCapacity : form.capacity
  const informationOptions = [...new Set(['Not sure yet', ...briefOptions])]

  useEffect(() => {
    if (previousStep.current === step) return
    previousStep.current = step
    headingRef.current?.focus({ preventScroll: true })
    headingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [step])

  useEffect(() => {
    if (status !== 'sent') return
    successRef.current?.focus({ preventScroll: true })
    successRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [status])

  function update(event) {
    const { name, value } = event.target
    setError('')
    setForm(current => {
      // Changing application starts a fresh application brief while keeping contact/site details.
      if (name === 'projectNeed' && value !== current.projectNeed) return { ...current, ...{
        capacity: '', birdCapacity: '', ventilation: 'Not sure yet', ventilationLayout: 'Not sure yet',
        proposedSize: '', insulation: 'Not sure yet', insulationSpecification: '', equipment: 'Not sure yet',
        briefStatus: 'Not sure yet',
      }, projectNeed: value }
      return { ...current, [name]: value }
    })
  }

  function toggleScope(item) {
    setForm(current => ({ ...current, scope: current.scope.includes(item) ? current.scope.filter(value => value !== item) : [...current.scope, item] }))
  }

  async function submit(event) {
    event.preventDefault()
    if (sendingRef.current) return
    setError('')
    if (step === 0) {
      if (!form.location.trim()) { setError('Please add the town, province or farm area.'); return }
      setStep(1)
      return
    }
    if (step === 1) { setStep(2); return }
    if (!form.location.trim()) { setError('Please add the project location.'); setStep(0); return }
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) { setError('Please add your name, email and mobile number.'); return }
    sendingRef.current = true
    setStatus('sending')
    try {
      const response = await fetch('/api/leads', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildAgriculturalEnquiry(form, { planLabel: content?.planLabel, kind, leadSource })),
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok) throw new Error(payload?.error || 'We could not submit the project brief.')
      setForm(freshForm())
      setStatus('sent')
    } catch (submissionError) {
      setStatus('error')
      setError(submissionError.message || 'Something went wrong. Please try again or call Smart Steel.')
    } finally { sendingRef.current = false }
  }

  const select = (name, label, options) => <label className="block min-w-0 text-sm font-bold">{label}<select name={name} value={form[name]} onChange={update} className={fieldClass}>{options.map(option => <option key={option} value={option}>{option || 'To be confirmed'}</option>)}</select></label>
  const choiceClass = selected => `${optionClass} ${selected ? 'border-[#0043f3] bg-white text-[#0043f3]' : 'border-[#b8cdd7] bg-white/60 text-[#264554] hover:border-[#0043f3]'}`

  if (status === 'sent') return <div role="status" className="border-l-4 border-[#ffcf1a] bg-[#001d2e] p-8 text-white sm:p-10">
    <span className="grid h-12 w-12 place-items-center bg-[#ffcf1a] text-[#001d2e]"><Check className="h-6 w-6" /></span>
    <h3 ref={successRef} tabIndex={-1} className="mt-6 scroll-mt-44 text-2xl font-black outline-none">Project brief received</h3>
    <p className="mt-3 text-sm leading-7 text-[#c1d9e5]">Here is what happens next:</p>
    <ol className="mt-4 space-y-3 text-sm leading-6 text-[#c1d9e5]"><li>1. We look at your farming plans, site and building requirements.</li><li>2. We get in touch to work through the options and any outstanding details.</li><li>3. We prepare a structural proposal with the scope and pricing clearly set out.</li></ol>
    <button type="button" onClick={() => { setStep(0); setStatus('idle') }} className="mt-6 min-h-11 text-sm font-bold text-[#ffcf1a]">Send another agricultural enquiry</button>
  </div>

  return <form onSubmit={submit} aria-label="Agricultural project enquiry" aria-busy={status === 'sending'} className="min-w-0 border border-[#9fb7c3] bg-[#edf5f8] p-5 sm:p-8">
    <ol aria-label="Enquiry progress" className="mb-7 grid grid-cols-3 gap-2 border-b border-[#9fb7c3] pb-6">
      {AGRICULTURAL_FORM_STEPS.map((label, index) => <li key={label} aria-current={step === index ? 'step' : undefined} className={`min-w-0 ${step === index ? 'text-[#0043f3]' : index < step ? 'text-[#001d2e]' : 'text-[#708893]'}`}><span className={`mb-2 grid h-7 w-7 place-items-center text-xs font-black ${step === index ? 'bg-[#0043f3] text-white' : index < step ? 'bg-[#001d2e] text-white' : 'border border-[#9fb7c3]'}`}>{index < step ? <Check className="h-3.5 w-3.5" /> : index + 1}</span><span className="block text-[11px] font-bold leading-4 sm:text-xs">{label}</span></li>)}
    </ol>
    <div className="mb-6"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#526c79]">Step {step + 1} of 3</p><h3 ref={headingRef} tabIndex={-1} className="mt-2 scroll-mt-44 text-2xl font-black text-[#001d2e] outline-none">{AGRICULTURAL_FORM_STEPS[step]}</h3><p className="mt-2 text-sm leading-6 text-[#526c79]">{step === 0 ? 'Tell us what you want to build and what it needs to make possible. Approximate details are welcome.' : step === 1 ? 'Share what you know. “Not sure yet” is a useful starting point too.' : 'Check your brief, then tell us how to reach you.'}</p></div>
    <fieldset disabled={status === 'sending'} className="min-w-0">
      {step === 0 ? <div className="space-y-6">
        <fieldset><legend className="text-sm font-black">What are you planning?</legend><div className="mt-3 grid gap-2 sm:grid-cols-2">{projectOptions.map(item => <label key={item} className={choiceClass(form.projectNeed === item)}><input type="radio" name="projectNeed" value={item} checked={form.projectNeed === item} onChange={update} className="h-4 w-4 shrink-0 accent-[#0043f3]" />{item}</label>)}</div></fieldset>
        <label className="block text-sm font-bold">Farm or project location *<input required name="location" value={form.location} onChange={update} placeholder="Town, province or farm area" className={fieldClass} /></label>
        <label className="block text-sm font-bold">{profile.capacityLabel} <span className="font-normal text-[#526c79]">(optional)</span><input type={isPoultry ? 'number' : 'text'} min={isPoultry ? 1 : undefined} max={isPoultry ? 10000000 : undefined} step={isPoultry ? 1 : undefined} name={isPoultry ? 'birdCapacity' : 'capacity'} value={capacity} onChange={update} placeholder={profile.capacityPlaceholder} className={fieldClass} /></label>
        <p className="border-l-2 border-[#0043f3] pl-3 text-xs leading-6 text-[#526c79]">Capacity helps us understand the operation. Building dimensions are confirmed from the layout, site and specialist requirements.</p>
      </div> : null}
      {step === 1 ? <div className="space-y-6">
        <fieldset><legend className="text-sm font-black">Where would you like our help?</legend><div className="mt-3 grid gap-2 sm:grid-cols-2">{scopeOptions.map(item => <label key={item} className={choiceClass(form.scope.includes(item))}><input type="checkbox" checked={form.scope.includes(item)} onChange={() => toggleScope(item)} className="h-4 w-4 shrink-0 accent-[#0043f3]" />{item}</label>)}</div><p className="mt-2 text-xs leading-5 text-[#526c79]">Select what you need, or leave this open for discussion.</p></fieldset>
        {isPoultry ? <div className="space-y-4 border-l-2 border-[#0043f3] pl-4">
          {select('ventilation', 'Ventilation approach', ['Not sure yet', 'Natural ventilation', 'Mechanical ventilation', 'Combination / specialist design'])}
          {form.ventilation === 'Natural ventilation' ? <label className="block text-sm font-bold">Proposed size or site layout <span className="font-normal text-[#526c79]">(optional)</span><input name="proposedSize" value={form.proposedSize} onChange={update} placeholder="Share a proposed size or describe the site" className={fieldClass} /><span className="mt-2 block text-xs font-normal leading-5 text-[#526c79]">The width and openings need to suit the ventilation brief.</span></label> : null}
          {['Mechanical ventilation', 'Combination / specialist design'].includes(form.ventilation) ? select('ventilationLayout', 'Ventilation supplier layout', ['Not sure yet', 'Supplier layout available', 'Supplier appointed; layout pending', 'No supplier appointed yet']) : null}
        </div> : null}
        <div className="grid gap-5 sm:grid-cols-2">
          {select('equipment', profile.equipmentLabel, ['Not sure yet', 'Supplier layout available', 'Supplier appointed; layout pending', 'No supplier appointed yet'])}
          {select('briefStatus', 'Information available', informationOptions)}
          {hasInsulation ? select('insulation', 'Roof insulation', ['Not sure yet', 'Please include an insulation review', 'Specification available', 'Not requested at this stage']) : null}
          {hasInsulation && form.insulation === 'Specification available' ? <label className="text-sm font-bold">Insulation specification <span className="font-normal text-[#526c79]">(optional)</span><input name="insulationSpecification" value={form.insulationSpecification} onChange={update} placeholder="Product or specification, if known" className={fieldClass} /></label> : null}
          {form.scope.includes('Delivery') ? select('deliveryAccess', 'Delivery access', ['Not sure yet', 'Truck access available', 'Site access needs review']) : null}
          {form.scope.includes('Installation review') ? select('siteReadiness', 'Site readiness', ['To be confirmed', 'Site ready', 'Groundworks planned', 'Site preparation needs review']) : null}
        </div>
        <label className="block text-sm font-bold">What would you like this project to help you achieve? <span className="font-normal text-[#526c79]">(optional)</span><textarea name="notes" rows="3" value={form.notes} onChange={update} placeholder="Tell us about your plans, preferred size, site constraints or anything you would like help with" className={`${fieldClass} py-3`} /></label>
      </div> : null}
      {step === 2 ? <div className="space-y-6">
        <div className="border border-[#b8cdd7] bg-white p-4 sm:p-5"><div className="flex items-center justify-between gap-3"><h4 className="text-sm font-black">Your brief at a glance</h4><button type="button" onClick={() => setStep(0)} className="inline-flex min-h-11 items-center gap-1 text-xs font-bold text-[#0043f3]"><Pencil className="h-3 w-3" />Edit project</button></div><dl className="mt-3 space-y-3 text-sm">
          {[
            ['Project', form.projectNeed], ['Location', form.location],
            [profile.capacityLabel, capacity ? `${capacity}${isPoultry ? ' birds per house' : ''}` : 'To be confirmed'],
            ['Requested scope', form.scope.join(', ') || 'To discuss with Smart Steel'],
            ...(isPoultry ? [['Ventilation', form.ventilation]] : []),
            [profile.equipmentLabel, form.equipment],
            ...(hasInsulation ? [['Roof insulation', form.insulation]] : []),
          ].map(([label, value]) => <div key={label} className="grid gap-1 sm:grid-cols-[140px_1fr]"><dt className="text-[#526c79]">{label}</dt><dd className="break-words font-semibold text-[#001d2e]">{value}</dd></div>)}
        </dl><button type="button" onClick={() => setStep(1)} className="mt-3 min-h-11 text-xs font-bold text-[#0043f3]">Edit building requirements</button></div>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-bold">Full name *<input required name="name" autoComplete="name" value={form.name} onChange={update} className={fieldClass} /></label>
          <label className="text-sm font-bold">Mobile number *<input required name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={update} className={fieldClass} /></label>
          <label className="text-sm font-bold sm:col-span-2">Email address *<input required name="email" type="email" autoComplete="email" value={form.email} onChange={update} className={fieldClass} /></label>
          {select('projectStage', 'Project stage', ['Not sure yet', 'Budget planning', 'Professional design underway', 'Ready for structural quotation', 'Procurement underway'])}
          {select('timeline', 'Target timing', ['', 'Within 3 months', '3 to 6 months', '6 to 12 months', 'More than 12 months'])}
        </div>
      </div> : null}
    </fieldset>
    {error ? <p role="alert" className="mt-5 border-l-4 border-red-600 bg-white px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}
    <div className="mt-7 border-t border-[#9fb7c3] pt-5"><div className="flex items-center justify-between gap-3">
      {step > 0 ? <button type="button" disabled={status === 'sending'} onClick={() => { setError(''); setStep(value => value - 1) }} className="inline-flex min-h-12 items-center gap-2 px-1 text-sm font-bold text-[#264554] disabled:opacity-50"><ArrowLeft className="h-4 w-4" />Back</button> : <span className="text-xs text-[#526c79]">Contact details in step 3</span>}
      <button type="submit" disabled={status === 'sending'} className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 bg-[#0043f3] px-5 text-sm font-black text-white transition hover:bg-[#001d2e] disabled:cursor-wait disabled:opacity-65">{status === 'sending' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : isLastStep ? <Send className="h-4 w-4" /> : null}{status === 'sending' ? 'Sending brief...' : isLastStep ? 'Send project brief' : 'Continue'}{!isLastStep ? <ArrowRight className="h-4 w-4" /> : null}</button>
    </div>{isLastStep ? <p className="mt-4 text-xs leading-5 text-[#526c79]">We will get in touch to discuss your plans, work through the building requirements and prepare a clear structural proposal.</p> : null}</div>
  </form>
}
