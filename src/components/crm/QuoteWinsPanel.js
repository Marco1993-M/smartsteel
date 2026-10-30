'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { planQuoteAcceptance } from '../../lib/estimateAlternatives.mjs'
import { getOsAuthHeaders } from '../../lib/osClientAuth'
const money=value=>`R ${Number(value||0).toLocaleString('en-ZA',{minimumFractionDigits:2,maximumFractionDigits:2})}`
export default function QuoteWinsPanel({leadId,onRecorded,acceptanceRequest}) {
 const [data,setData]=useState(null),[added,setAdded]=useState([]),[replacements,setReplacements]=useState({}),[note,setNote]=useState(''),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[error,setError]=useState(''),[success,setSuccess]=useState('')
 useEffect(()=>{let active=true;async function load(){setLoading(true);setError('');try{const r=await fetch(`/api/crm/quote-wins?leadId=${leadId}`,{headers:await getOsAuthHeaders(),cache:'no-store'}),p=await r.json();if(!r.ok)throw new Error(p.error);if(active){setData(p);setAdded([]);setReplacements({})}}catch(e){if(active)setError(e.message)}finally{if(active)setLoading(false)}}load();return()=>{active=false}},[leadId])
 useEffect(()=>{
  if (!data || !acceptanceRequest?.id) return
  const quote=data.estimates.find(q=>q.id===acceptanceRequest.id)
  const plan=planQuoteAcceptance(quote,data.orders||[])
  setError('');setAdded([]);setReplacements({})
  if(plan.action==='replace') {setReplacements({[plan.orderId]:quote.id});setSuccess(`V${quote.version_no} selected as the replacement. Confirm with Update won quotes below.`)}
  else if(plan.action==='add') {setAdded([quote.id]);setSuccess(`V${quote.version_no} selected. Confirm with Update won quotes below.`)}
  else if(plan.action==='recorded')setSuccess(`V${quote.version_no} is already recorded as Won.`)
  else if(plan.action==='choose')setSuccess(`Choose which existing order V${quote.version_no} replaces, or select it as additional work below.`)
  else setError('This version cannot be marked won. Choose a current saved quote with a positive value.')
 },[data,acceptanceRequest])
 const estimates=data?.estimates||[],orders=data?.orders||[]
 const available=estimates.filter(q=>!q.won_superseded_by&&!orders.some(o=>o.estimate_id===q.id)&&['draft','prepared','sent','accepted'].includes(q.status)&&Number(q.total)>0)
 const used=new Set([...added,...Object.values(replacements).filter(Boolean)])
 const changes=[...added.map(id=>({id,action:'add'})),...Object.entries(replacements).filter(([,id])=>id).map(([orderId,id])=>({id,action:'replace',orderId}))]
 const total=orders.filter(o=>o.status!=='cancelled').reduce((sum,o)=>sum+Number(estimates.find(q=>q.id===(replacements[o.id]||o.estimate_id))?.total||o.quote_snapshot?.total||0),0)+added.reduce((sum,id)=>sum+Number(estimates.find(q=>q.id===id)?.total||0),0)
 async function save(){
  setError('');setSuccess('');setSaving(true)
  try{
   const payload=changes.map(change=>{const q=estimates.find(q=>q.id===change.id),o=orders.find(o=>o.id===change.orderId);return {...change,expectedUpdatedAt:q.updated_at,...(o?{expectedOrderUpdatedAt:o.updated_at,previousEstimateId:o.estimate_id}:{})}})
   const r=await fetch('/api/crm/quote-wins',{method:'POST',headers:await getOsAuthHeaders({'Content-Type':'application/json'}),body:JSON.stringify({leadId,changes:payload,note})}),p=await r.json()
   if(!r.ok)throw new Error(p.error||'Could not update won quotes.')
   setData(p);setAdded([]);setReplacements({});setNote('');setSuccess('Won quotes updated. Manufacturing now uses the selected versions.');onRecorded?.(p)
  }catch(e){setError(e.message)}finally{setSaving(false)}
 }
 return <section id="crm-quote-wins" className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
  <div className="flex flex-wrap items-start justify-between gap-3"><div><h4 className="text-base font-semibold text-[#001d2e]">Won quotes</h4><p className="mt-1 text-sm text-slate-500">Update an accepted version, or add another accepted quote.</p></div><Link href="/os/manufacturing" className="text-xs font-semibold text-[#0043f3] underline underline-offset-4">Manufacturing →</Link></div>
  {loading?<p className="mt-4 text-sm text-slate-500">Loading quotes…</p>:<div className="mt-4 space-y-4">
   {orders.filter(o=>o.status!=='cancelled').map(o=>{const current=estimates.find(q=>q.id===o.estimate_id),version=current?.version_no||o.quote_snapshot?.version_no;const closed=['complete','delivered'].includes(o.status);return <div key={o.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3"><div className="flex flex-wrap items-start justify-between gap-2"><div className="min-w-0"><p className="break-words text-sm font-semibold text-[#001d2e]">{current?.title||o.quote_snapshot?.title||o.order_number}</p><p className="mt-1 text-xs text-slate-500">{o.order_number} · V{version} · {money(current?.total||o.quote_snapshot?.total)} excl. VAT</p></div><span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800">{closed?'Completed':'Won'}</span></div>
    {!closed&&<label className="mt-3 block text-xs font-semibold text-slate-600">Replace won version<select aria-label={`Replace version for ${o.order_number}`} disabled={saving} value={replacements[o.id]||''} onChange={e=>setReplacements(old=>({...old,[o.id]:e.target.value}))} className="mt-1.5 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal"><option value="">Keep V{version}</option>{available.filter(q=>Number(q.version_no)>Number(version)&&(!used.has(q.id)||replacements[o.id]===q.id)).map(q=><option key={q.id} value={q.id}>V{q.version_no} · {q.title} · {money(q.total)}</option>)}</select></label>}
   </div>})}
   <div><h5 className="text-sm font-semibold text-[#001d2e]">Add won quote</h5><p className="mt-1 text-xs text-slate-500">Additional accepted work becomes its own order.</p><div className="mt-3 space-y-2">{available.filter(q=>!Object.values(replacements).includes(q.id)).map(q=><label key={q.id} className={`flex items-start gap-3 rounded-xl border p-3 text-sm ${added.includes(q.id)?'border-[#0043f3] bg-blue-50':'border-slate-200'}`}><input type="checkbox" aria-label={`Add V${q.version_no} as won`} disabled={saving} checked={added.includes(q.id)} onChange={e=>setAdded(ids=>e.target.checked?[...ids,q.id]:ids.filter(id=>id!==q.id))} className="mt-1 shrink-0 accent-[#0043f3]"/><span className="min-w-0"><strong className="block break-words text-slate-800">{q.title}</strong><span className="mt-1 block text-xs text-slate-500">V{q.version_no} · {money(q.total)} excl. VAT</span></span></label>)}{!available.length&&<p className="text-xs text-slate-500">No other saved versions available.</p>}</div></div>
  </div>}
  {!!Object.values(replacements).filter(Boolean).length&&<p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">The old version stays in history. Payments, supplier records and the original cost allowance stay on the same order. Specifications, invoice linkage, drawings and readiness must be checked against the updated scope.</p>}
  <div className="mt-4 border-t border-slate-100 pt-4"><label className="block text-xs font-semibold text-slate-600">Client confirmation / update note (optional)<input value={note} maxLength={2000} disabled={saving} onChange={e=>setNote(e.target.value)} placeholder="Client approved revised scope…" className="mt-1.5 block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal"/></label>
  <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p className="text-sm font-semibold text-[#001d2e]">{changes.length? 'Updated won value':'Won value'} · {money(total)} excl. VAT</p><button type="button" disabled={loading||saving||!changes.length} onClick={save} className="rounded-xl bg-[#0043f3] px-4 py-3 text-sm font-semibold text-white disabled:opacity-40">{saving?'Updating…':'Update won quotes'}</button></div><p className="mt-3 text-xs leading-5 text-slate-400">No client email is sent.</p></div>
  {error&&<p role="alert" className="mt-3 text-sm text-rose-700">{error}</p>}{success&&<p role="status" className="mt-3 text-sm text-emerald-700">{success}</p>}
 </section>
}
