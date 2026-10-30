import { Check } from 'lucide-react'
import { manufacturingMilestones } from '../../lib/manufacturingOperations.mjs'

export default function ManufacturingProgress({ order, data, compact = false, preview = false }) {
  const steps = manufacturingMilestones(order, data)
  const current = steps.find((step) => step.state === 'current')
  return <div className={compact ? 'mt-5' : 'rounded-2xl border border-slate-200 bg-white p-5 sm:p-6'}>
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs">
      <span className="font-semibold text-[#001d2e]">Project progress{preview ? ' · unsaved preview' : ''}</span>
      <span className="text-slate-500">{order.status === 'cancelled' ? 'Cancelled' : order.status === 'complete' ? 'Closed' : current ? `Next: ${current.label}` : 'All milestones recorded'}</span>
    </div>
    <ol aria-label="Project milestones" className={compact ? 'grid grid-cols-7 gap-1.5' : 'grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7'}>
      {steps.map((step) => <li key={step.key} aria-current={step.state === 'current' ? 'step' : undefined} title={`${step.label}: ${step.state === 'done' ? 'Recorded' : step.state === 'current' ? 'Next required milestone' : 'Not recorded'}`} className="min-w-0">
        <div className={`h-2 rounded-full ${step.state === 'done' ? 'bg-[#0043f3]' : step.state === 'current' ? 'bg-blue-100 ring-1 ring-[#0043f3]' : 'bg-slate-200'}`} />
        <span className={`${compact ? 'sr-only' : 'mt-2 flex items-start gap-1 text-xs leading-5'} ${step.state === 'current' ? 'font-semibold text-[#0043f3]' : 'text-slate-600'}`}>
          {step.state === 'done' && <Check aria-hidden="true" size={13} className="mt-1 shrink-0 text-[#0043f3]" />}{step.label}<span className="sr-only"> · {step.state === 'done' ? 'Recorded' : step.state === 'current' ? 'Next required milestone' : 'Not recorded'}</span>
        </span>
      </li>)}
    </ol>
    {!compact && <p className="mt-4 text-xs leading-5 text-slate-500">Blue marks recorded milestones. Outlined marks the next requirement. Progress follows {preview ? 'the changes above until saved' : 'saved payment, drawing, supplier and delivery records'}.</p>}
  </div>
}
