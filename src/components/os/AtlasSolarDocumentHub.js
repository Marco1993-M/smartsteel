'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Download, LockKeyhole, Plus, Ruler, Trash2, Truck, Map } from 'lucide-react'
import { getOsAuthHeaders } from '../../lib/osClientAuth'
import { supabase } from '../../lib/supabase'
import { getSolarDocumentSchedule, parseSolarDocumentRuns } from '../../lib/atlasSolarCarportDocuments'
import { ATLAS_SOLAR_CARPORT_PARKING_COUNTS, getAtlasSolarCarportWidth } from '../../lib/atlasSolarCarportLayouts'
import AtlasSolarCarportPlan from '../atlas/AtlasSolarCarportPlan'

export default function AtlasSolarDocumentHub(){
 const [runs,setRuns]=useState([{parkingCount:2,length:6}]),[owner,setOwner]=useState(false),[busy,setBusy]=useState(''),[error,setError]=useState('')
 useEffect(()=>{let active=true;supabase.auth.getUser().then(({data})=>{if(active)setOwner(String(data?.user?.email||'').toLowerCase()==='info@smartsteel.co.za')});return()=>{active=false}},[])
 const encoded=runs.map(run=>`${getAtlasSolarCarportWidth(run.parkingCount)}x${run.length}`).join(',')
 const placed=useMemo(()=>parseSolarDocumentRuns(encoded),[encoded])
 const schedule=useMemo(()=>getSolarDocumentSchedule(placed),[placed])
 const totals=schedule.reduce((sum,run)=>({spaces:sum.spaces+run.spaces,footings:sum.footings+run.footings,panels:sum.panels+run.moduleCount}),{spaces:0,footings:0,panels:0})
 const params=new URLSearchParams({runs:encoded})
 const documents=[
  {id:'transport',title:'Transport & profile data sheet',icon:Truck,detail:'Member profiles and gauges, cut lengths, steel mass and provisional connection schedule. No pricing.',endpoint:`/api/os/solar-carport-pricing/datasheet?${params}`},
  {id:'layout',title:'Indicative parking layout',icon:Map,detail:'One dimensioned planning page per run, showing frame lines, parking spaces and indicative panel capacity.',endpoint:`/api/os/solar-carport-documents?${params}&kind=layout`},
  {id:'foundation',title:'Preliminary foundation guide',icon:Ruler,detail:'Strip-footing counts by frame line and side, schematic layout and the details your engineer must confirm. Not for construction.',endpoint:`/api/os/solar-carport-documents?${params}&kind=foundation`},
  ...(owner?[{id:'ctc',title:'Internal costing basis',icon:LockKeyhole,detail:'Modelled material, connection and interface costs from the current published solar pricing release, with its cost buffer retained.',endpoint:`/api/os/solar-carport-documents?${params}&kind=ctc`}]:[]),
 ]
 function update(index,field,value){setRuns(current=>current.map((run,i)=>i===index?{...run,[field]:Number(value)}:run))}
 async function download(item){
  setBusy(item.id);setError('')
  try{
   const response=await fetch(item.endpoint,{headers:await getOsAuthHeaders(),cache:'no-store'})
   if(!response.ok){const payload=await response.json().catch(()=>({}));throw new Error(payload.error||'Could not generate this document.')}
   const blob=await response.blob(),url=URL.createObjectURL(blob),anchor=document.createElement('a')
   anchor.href=url;anchor.download=response.headers.get('content-disposition')?.match(/filename="([^"]+)"/)?.[1]||`atlas-solar-carport-${item.id}.pdf`
   document.body.appendChild(anchor);anchor.click();anchor.remove();URL.revokeObjectURL(url)
  }catch(failure){setError(failure.message)}finally{setBusy('')}
 }
 return <div className="space-y-6 px-3 py-4 sm:px-6 sm:py-6">
  <section className="rounded-[1.75rem] bg-[#001d2e] p-6 text-white sm:p-8"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c1d9e5]">Atlas document library · Solar Carports</p><h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Documents for your parking layout</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Configure the parking runs once, then download matching logistics, layout and foundation references. Shareable documents contain no project pricing.</p></section>
  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-bold text-[#001d2e]">Selected specification</h2><p className="mt-1 text-sm text-slate-500">ZAM steel · standard single-sided and butterfly layouts</p></div><button type="button" disabled={runs.length>=8} onClick={()=>setRuns(current=>[...current,{parkingCount:2,length:6}])} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold disabled:opacity-40"><Plus size={16}/>Add run</button></div>
   <div className="mt-4 space-y-3">{runs.map((run,index)=><div key={index} className="flex flex-wrap items-end gap-3 rounded-xl bg-slate-50 p-3"><p className="mr-auto py-2 text-sm font-bold text-[#001d2e]">Run {String.fromCharCode(65+index)}</p><label className="text-xs font-semibold text-slate-600">Spaces per side<select aria-label={`Run ${String.fromCharCode(65+index)} spaces per side`} value={run.parkingCount} onChange={e=>update(index,'parkingCount',e.target.value)} className="mt-1 block rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">{ATLAS_SOLAR_CARPORT_PARKING_COUNTS.map(count=><option key={count} value={count}>{count} spaces · {getAtlasSolarCarportWidth(count)}m</option>)}</select></label><label className="text-xs font-semibold text-slate-600">Arrangement<select aria-label={`Run ${String.fromCharCode(65+index)} arrangement`} value={run.length} onChange={e=>update(index,'length',e.target.value)} className="mt-1 block rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"><option value={6}>Single-sided · 6m</option><option value={12}>Butterfly · 12m</option></select></label><button type="button" aria-label={`Remove run ${String.fromCharCode(65+index)}`} disabled={runs.length===1} onClick={()=>setRuns(current=>current.filter((_,i)=>i!==index))} className="rounded-lg p-2 text-slate-500 disabled:opacity-30"><Trash2 size={18}/></button></div>)}</div>
   <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">{[['Parking runs',runs.length],['Total spaces',totals.spaces],['Strip footings',totals.footings],['Indicative panels',totals.panels]].map(([label,value])=><div key={label} className="rounded-xl border border-slate-200 p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-xl font-bold text-[#001d2e]">{value}</p></div>)}</div>
   <details className="mt-4 rounded-xl border border-slate-200"><summary className="cursor-pointer p-3 text-sm font-semibold">Preview nominal run arrangement</summary><div className="h-64 p-3"><AtlasSolarCarportPlan runs={placed} className="h-full w-full"/></div><p className="px-3 pb-3 text-xs leading-5 text-slate-500">Runs are automatically arranged for illustration. Exported layout and foundation pages show each run separately; they do not establish an approved site layout.</p></details>
  </section>
  {error?<p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</p>:null}
  <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{documents.map(item=><article key={item.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-2"><item.icon className="h-6 w-6 text-[#0043f3]"/><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${item.id==='ctc'?'bg-amber-100 text-amber-900':'bg-emerald-100 text-emerald-800'}`}>{item.id==='ctc'?'Internal · owner only':'Shareable planning reference'}</span></div><h3 className="mt-5 text-lg font-bold text-[#001d2e]">{item.title}</h3><p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{item.detail}</p><button type="button" disabled={Boolean(busy)} onClick={()=>download(item)} className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#0043f3] px-4 py-3 text-sm font-bold text-white disabled:opacity-50"><Download size={16}/>{busy===item.id?'Generating…':'Download PDF'}</button></article>)}</section>
  <p className="text-xs leading-5 text-slate-500">Foundation dimensions, reinforcement and anchors require project-specific engineering confirmation. The internal costing sheet needs a published pricing release. <Link className="font-semibold text-[#0043f3]" href="/os/atlas/pricing?product=SOLAR-CARPORT">Open solar pricing</Link></p>
 </div>
}
