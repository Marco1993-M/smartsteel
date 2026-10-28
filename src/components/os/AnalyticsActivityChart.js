"use client"
import { useEffect, useId, useRef, useState } from 'react'
import { analyticsAxisMaximum } from '../../lib/analyticsActivity.mjs'

const SERIES=[{key:'leads',label:'New enquiries',short:'Enquiries',color:'#001d2e',fill:'bg-[#001d2e]',metric:'leadCount',change:'leads'}, {key:'estimatesSent',label:'Quote sends',short:'Quote sends',color:'#0043f3',fill:'bg-[#0043f3]',metric:'sentCount',change:'sent'}]
const changeLabel=value=>value==null?'No prior baseline':`${value>0?'+':''}${value}%`

export default function AnalyticsActivityChart({ trend=[], dailyTrend, available, metrics, period }) {
 const [view,setView]=useState(period.kind==='range'?'daily':'monthly')
 const [shown,setShown]=useState({leads:true,estimatesSent:true})
 const [active,setActive]=useState(null)
 const [tableOpen,setTableOpen]=useState(false)
 const [width,setWidth]=useState(640)
 const plot=useRef(null),titleId=useId()
 useEffect(()=>{const observer=new ResizeObserver(entries=>setWidth(Math.max(240,Math.round(entries[0].contentRect.width))));observer.observe(plot.current);return()=>observer.disconnect()},[])
 const dailyAvailable=Array.isArray(dailyTrend) && dailyTrend.length>0
 const effectiveView=view==='daily' && dailyAvailable?'daily':'monthly'
 const rows=effectiveView==='daily'?dailyTrend:trend
 const visible=SERIES.filter(s=>shown[s.key] && (s.key!=='estimatesSent' || available))
 const maximum=analyticsAxisMaximum(rows.flatMap(row=>visible.map(s=>row[s.key])))
 const gutter=32,right=12,top=22,bottom=38,height=245,plotHeight=height-top-bottom,plotWidth=width-gutter-right
 const x=index=>gutter+(rows.length>1?index/(rows.length-1):0.5)*plotWidth
 const y=value=>top+plotHeight-(Number(value)||0)/maximum*plotHeight
 const focused=active==null?null:rows[Math.min(active,rows.length-1)]
 const comparison=period.kind==='range'?'in the comparison period':period.isCurrent?'at this time last month':'in the prior month'
 const tickEvery=Math.max(1,Math.ceil((rows.length-1)/(width<480?4:7)))
 const heading=effectiveView==='daily'?'Daily activity':period.kind==='range'?'Monthly activity in selected range':'12-month activity'
 function inspect(event){const rect=plot.current.getBoundingClientRect();const position=(event.clientX-rect.left-gutter)/plotWidth;setActive(Math.max(0,Math.min(rows.length-1,Math.round(position*(rows.length-1)))))}
 return <section className="min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm" aria-labelledby={titleId}>
  <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-5 sm:px-7"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#0043f3]">Selected period · {period.label}</p><h2 id={titleId} className="mt-2 text-xl font-semibold tracking-tight text-[#001d2e]">Enquiries & quote sends</h2></div><label className="text-xs font-medium text-slate-500"><span className="sr-only">Activity chart interval</span><select aria-label="Activity chart interval" value={effectiveView} onChange={event=>{setView(event.target.value);setActive(null)}} className="min-h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700"><option value="daily" disabled={!dailyAvailable}>Daily</option><option value="monthly">Monthly</option></select></label></div>
  <div className="grid grid-cols-2 border-y border-slate-200">
   {SERIES.map(s=>{const enabled=s.key!=='estimatesSent'||available,checked=enabled&&shown[s.key];return <label key={s.key} className={`min-w-0 cursor-pointer p-4 transition sm:p-6 ${checked?`${s.fill} text-white`:'bg-white text-slate-700'} ${!enabled?'cursor-not-allowed opacity-65':''}`}><span className="flex items-center gap-2 text-xs font-semibold"><input type="checkbox" aria-label={`Show ${s.short.toLowerCase()}`} checked={checked} disabled={!enabled} onChange={()=>setShown({...shown,[s.key]:!shown[s.key]})} className="h-4 w-4 shrink-0 accent-white" />{s.label}</span><span className="mt-3 block text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl">{enabled?metrics[s.metric]:'—'}</span><span className={`mt-2 block text-[11px] leading-5 ${checked?'text-white/90':'text-slate-500'}`}>{enabled?<><strong className="font-semibold">{metrics.previous?.[s.metric]??'—'}</strong> {comparison}<span className="block font-semibold">{changeLabel(metrics.changes?.[s.change])}</span></>:'Quote activity unavailable'}</span></label>})}
  </div>
  <div className="px-4 pt-5 sm:px-7">
   <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500"><span>{heading}{rows.length?` · ${rows[0].label} – ${rows.at(-1).label}`:''}</span><span>Shared scale · counts</span></div>
   <div ref={plot} className="relative mt-3 min-h-[245px] min-w-0 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#0043f3]" tabIndex={0} role="group" aria-label={`${heading}. Use left and right arrows to inspect counts.`} onPointerMove={inspect} onPointerDown={inspect} onPointerLeave={()=>setActive(null)} onBlur={()=>setActive(null)} onKeyDown={event=>{
    if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();setActive(index=>Math.max(0,Math.min(rows.length-1,(index??rows.length-1)+(event.key==='ArrowLeft'?-1:1))))}
    if(event.key==='Home'){event.preventDefault();setActive(0)}
    if(event.key==='End'){event.preventDefault();setActive(rows.length-1)}
    if(event.key==='Escape')setActive(null)
   }}>
    {!visible.length?<p className="flex h-[245px] items-center justify-center text-center text-sm text-slate-500" role="status">Select a metric above to show its activity.</p>:!rows.length?<p className="flex h-[245px] items-center justify-center text-sm text-slate-500">No activity dates available.</p>:<svg role="img" aria-label={`${heading}: ${visible.map(s=>s.short).join(' and ')}. Exact values are available in the figures table.`} width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
     {[0,1,2,3,4].map(i=>{const value=maximum*i/4;return <g key={i} aria-hidden="true"><line x1={gutter} x2={width-right} y1={y(value)} y2={y(value)} stroke="#e2e8f0" strokeWidth="1" /><text x={gutter-8} y={y(value)+4} textAnchor="end" fontSize="10" fill="#64748b">{value}</text></g>})}
     {rows.map((row,index)=>index%tickEvery===0 || index===rows.length-1?<text key={row.key} x={x(index)} y={height-10} textAnchor={index===0?'start':index===rows.length-1?'end':'middle'} fontSize="10" fill="#64748b">{row.label}</text>:null)}
     {visible.map(s=><g key={s.key} data-series={s.key}><path d={rows.map((row,index)=>`${index?'L':'M'}${x(index)},${y(row[s.key])}`).join(' ')} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />{rows.length===1?<circle cx={x(0)} cy={y(rows[0][s.key])} r="4" fill={s.color} />:null}<circle cx={x(rows.length-1)} cy={y(rows.at(-1)[s.key])} r="3" fill="white" stroke={s.color} strokeWidth="2" /></g>)}
     {focused?<g aria-hidden="true"><line x1={x(active)} x2={x(active)} y1={top} y2={height-bottom} stroke="#94a3b8" strokeDasharray="3 3" />{visible.map(s=><circle key={s.key} cx={x(active)} cy={y(focused[s.key])} r="4" fill={s.color} stroke="white" strokeWidth="2" />)}</g>:null}
    </svg>}
    {focused&&visible.length>0?<div role="status" className="pointer-events-none absolute top-1 z-10 w-[210px] rounded-xl border border-slate-200 bg-white/95 p-3 text-[11px] leading-5 shadow-lg" style={{left:Math.max(0,Math.min(width-210,x(active)-105))}}><p className="font-semibold text-slate-900">{focused.fullLabel}{focused.partial?' · partial':''}</p>{visible.map(s=><p key={s.key} className="flex justify-between gap-3" style={{color:s.color}}><span>{s.short}</span><strong>{focused[s.key]}</strong></p>)}</div>:null}
   </div>
   <p className="pb-4 text-[11px] leading-5 text-slate-500">Cards show the selected period. {period.kind!=='range'&&effectiveView==='monthly'?'The lines show the previous 11 months for context. ':''}Quote sends include revisions and may relate to earlier enquiries. {period.isCurrent?'The latest period is incomplete.':''}</p>
   {!available?<p className="pb-4 text-xs text-amber-700">Quote activity is unavailable; it is not plotted as zero.</p>:null}
   {!dailyAvailable?<p className="pb-4 text-xs text-slate-500">Daily activity will be available when the Analytics API update is deployed.</p>:null}
  </div>
  <details className="border-t border-slate-100 px-5 py-3 text-xs text-slate-600 sm:px-7" open={tableOpen} onToggle={event=>setTableOpen(event.currentTarget.open)}><summary className="cursor-pointer font-semibold text-slate-700">View {effectiveView==='daily'?'daily':'monthly'} figures</summary>{tableOpen?<div className="mt-3 max-h-80 overflow-auto"><table className="w-full text-left"><caption className="sr-only">Exact activity counts for {heading.toLowerCase()}</caption><thead><tr><th scope="col" className="py-2">{effectiveView==='daily'?'Date':'Month'}</th><th scope="col">Enquiries</th><th scope="col">Quote sends</th></tr></thead><tbody>{rows.map(row=><tr key={row.key} className="border-t border-slate-100"><th scope="row" className="py-2 pr-3 font-normal">{row.fullLabel}{row.partial?' (partial)':''}</th><td>{row.leads}</td><td>{available?row.estimatesSent:'—'}</td></tr>)}</tbody></table></div>:null}</details>
 </section>
}
