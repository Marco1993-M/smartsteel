import { groupEstimateQuotes } from '../../lib/estimateAlternatives.mjs'

export default function QuoteRevisionGroups({ estimates, renderEstimate }) {
 return groupEstimateQuotes(estimates).map(group => {
  const visible = [group.accepted, group.latest].filter((q,index,rows) => q && rows.findIndex(row => row?.id === q.id) === index)
  const history = group.versions.filter(q => !visible.some(row => row.id === q.id))
  return <section key={group.id} className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
   <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h5 className="min-w-0 break-words text-sm font-semibold text-[#001d2e]">{group.latest.title.replace(/\s+V\d+$/i,'')}</h5><span className="text-xs text-slate-500">{group.accepted ? `Accepted V${group.accepted.version_no}` : 'Not yet accepted'} · {group.versions.length} {group.versions.length===1?'version':'versions'}</span></div>
   <div className="space-y-3">{visible.map(renderEstimate)}</div>
   {history.length>0&&<details className="mt-3"><summary className="cursor-pointer py-2 text-xs font-semibold text-slate-500">Previous versions · {history.length}</summary><div className="mt-2 space-y-3">{history.map(renderEstimate)}</div></details>}
  </section>
 })
}
