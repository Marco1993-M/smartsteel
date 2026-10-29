import { SMART_STEEL_SITE_URL as SITE, smartSteelContact } from './brandEntity.js'
import { isAtlasWarehouseProductType } from './atlasProductIdentity.js'

const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]))
const positive = value => Number.isFinite(Number(value)) && Number(value)>0
const money = value => `R${Number(value).toLocaleString('en-ZA',{minimumFractionDigits:2,maximumFractionDigits:2})}`
const dimensions = values => values.filter(([,value])=>positive(value))

export function getAtlasProposalScope(estimate) {
  const input=estimate.input_data || {}, lines=Array.isArray(estimate.line_items)?estimate.line_items:[]
  const type=estimate.product_type || input.productType || ''
  const warehouse=isAtlasWarehouseProductType(type)
  const solar=/solar carport/i.test(type)
  const rows=[]
  const dims=dimensions([['Span',input.width],['Length',input.length],['Eave height',warehouse?input.wallHeight:null]])
  const runs=Array.isArray(input.parkingRuns)?input.parkingRuns:[]
  if(solar && runs.length){
    dims.length=0
    rows.push(['Parking runs',String(runs.length)])
    runs.forEach((run,index)=>{
      const count=Number(run.parkingCount),sides=Number(run.length)===12?2:1
      const size=positive(run.width)&&positive(run.length)?`${run.width}m × ${run.length}m`:''
      const spaces=positive(count)?`${count*sides} spaces`:''
      const value=[size,spaces].filter(Boolean).join(' · ')
      if(value)rows.push([`Run ${index+1}`,value])
    })
  }
  if(input.steelFinish)rows.push(['Steel',({Galv:'Galvanised',Mild:'Mild steel'})[input.steelFinish]||input.steelFinish])
  const mode=input.gableMode || input.sheetingMode
  const enclosure={structure_only:'Steel structure only',roof_only:'Roof sheeting',open_gable:'Roof sheeting',fully_enclosed:'Roof and side walls',sheeted_gable:'Roof and side walls',roof_and_sides:'Roof and side walls',fully_enclosed_with_gables:'Roof, side walls & gables'}[mode]
  if(warehouse && enclosure)rows.push(['Enclosure',enclosure])
  if(warehouse && mode && mode!=='structure_only'){
    const finish=String(input.sheetingFinish||input.cladding||'').toLowerCase()
    const finishLabel=finish==='chromadek'?'Chromadek':finish==='galvanised'?'Galvanised':''
    const sheeting=[input.sheetingProfile,finishLabel].filter(Boolean).join(' ')
    if(sheeting)rows.push(['Sheeting',sheeting])
  }
  // Only show explicitly recorded openings; never invent custom project details.
  if(positive(input.gableOpeningWidth)&&positive(input.gableOpeningHeight))rows.push(['Opening',`${input.gableOpeningWidth} × ${input.gableOpeningHeight}m`])
  const service=(label,pattern,deferred,requested)=>{
    const matching=lines.filter(item=>pattern.test(`${item.code||''} ${item.label||''}`))
    const value=matching.some(item=>Number(item.total)>0)?'Included as quoted':deferred?'Excluded · quoted separately later':matching.length?'Refer to proposal':requested?'Requested · refer to proposal':'Not included'
    rows.push([label,value])
  }
  service('Delivery',/delivery|transport/i,input.deliveryDeferred,input.deliveryRequested)
  service('Installation',/install|erection|assembly/i,input.installationDeferred,input.installationRequested)
  const footing=lines.filter(item=>/footing|foundation|concrete/i.test(`${item.code||''} ${item.label||''}`))
  rows.push(['Foundations',footing.some(item=>Number(item.total)>0)?'Included as quoted':footing.length?'Refer to proposal':warehouse||solar?'Not included':'Refer to proposal'])
  return {dims,rows,showWarehousePhoto:warehouse}
}

export function buildAtlasProposalHtml({lead={},estimate={},body='',shareUrl,bookingUrl='',senderName='',now=new Date()}) {
  const title=estimate.title || estimate.product_type_display || estimate.product_type || 'Your Atlas proposal'
  const {dims,rows:scopeRows,showWarehousePhoto}=getAtlasProposalScope(estimate)
  const total=Number(estimate.total || 0)
  const date=now.toLocaleDateString('en-ZA',{day:'2-digit',month:'long',year:'numeric',timeZone:'Africa/Johannesburg'}).toUpperCase()
  const cleanBody=String(body||'').replace(/\n\s*Kind regards,?\s*\nThe Smart Steel Team\s*$/i,'').trim()
  const name=String(lead.name||'there').trim().split(/\s+/)[0]
  const defaultBody=`Hi ${name},\n\nThanks for considering Atlas for your project. Here’s your proposal, with the scope and pricing ready to review.`
  const message=(cleanBody||defaultBody).split(/\r?\n\s*\r?\n/).map(paragraph=>`<p style="margin:20px 0 0;font-size:15px;line-height:1.75;color:#334d5e;">${escape(paragraph).replace(/\r?\n/g,'<br>')}</p>`).join('')
  const changesUrl=`mailto:${smartSteelContact.email}?subject=${encodeURIComponent(`Changes to ${title}`)}`
  const acceptance=new URL(shareUrl);acceptance.hash='accept-quote';const acceptanceUrl=acceptance.toString()
  const dimensionsHtml=dims.length?`<table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin:16px 0 12px;"><tr>${dims.map(([label,value],index)=>`<td width="${Math.floor(100/dims.length)}%" valign="top" style="padding:0 ${index<dims.length-1?'14':'0'}px 0 ${index?'18':'0'}px;${index<dims.length-1?'border-right:1px solid #d5e1e8;':''}"><p style="margin:0 0 6px;font-size:30px;font-weight:700;line-height:1.1;color:#001d2e;">${escape(value)}m</p><p style="margin:0;font-size:10px;font-weight:700;letter-spacing:1px;line-height:1.5;color:#526878;">${escape(label.toUpperCase())}</p></td>`).join('')}</tr></table>`:''
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${escape(title)} | Atlas by Smart Steel</title>
<style>
@media only screen and (max-width:600px){.outer{padding:0!important}.pad{padding-left:24px!important;padding-right:24px!important}.headline{font-size:38px!important;line-height:1.06!important}.dimensions{font-size:30px!important}.stack{display:block!important;width:100%!important}.step{padding:16px 0!important;border-bottom:1px solid #d9e4eb}.last-step{border:0!important}.header-note{text-align:left!important;padding-top:14px!important}.footer-right{text-align:left!important;padding-top:16px!important}.full-button{width:100%!important;text-align:center!important}.spec-detail{padding:0 10px 18px 0!important}.logo{width:150px!important}.header-note{font-size:9px!important;text-align:right!important;padding-top:0!important}.price{font-size:32px!important}.hide-small{display:none!important}}
</style></head>
<body style="margin:0;padding:0;background:#edf2f5;color:#001d2e;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;">
<div style="display:none;font-size:1px;line-height:1px;color:#edf2f5;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">Your Atlas specification, estimate and next steps, ready to review.</div>
<table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="width:100%;background:#edf2f5;border-collapse:collapse;"><tr><td class="outer" align="center" style="padding:28px 12px;">
<!--[if mso]><table role="presentation" width="680" border="0" cellspacing="0" cellpadding="0"><tr><td><![endif]-->
<table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="width:100%;max-width:680px;background:#ffffff;border-collapse:collapse;">
<tr><td height="5" bgcolor="#0043f3" style="height:5px;font-size:0;line-height:0;">&nbsp;</td></tr>
<tr><td class="pad" style="padding:28px 40px 24px;">
<table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td valign="middle"><img class="logo" src="${SITE}/atlas/email/atlas-logo.png" alt="Atlas System. Developed by Smart Steel." width="182" style="display:block;width:182px;max-width:100%;height:auto;border:0;"></td><td class="header-note" align="right" valign="middle" style="font-family:Arial,Helvetica,sans-serif;font-size:10px;line-height:1.65;letter-spacing:1px;color:#526878;">YOUR PROJECT PROPOSAL<br><strong style="color:#001d2e;font-weight:700;">${escape(date)}</strong></td></tr></table>
</td></tr>
<tr><td class="pad" style="padding:14px 40px 30px;">
<p style="margin:0 0 13px;font-size:11px;font-weight:700;line-height:1.5;letter-spacing:2px;color:#526878;">BUILT AROUND YOUR NEXT STEP</p>
<h1 class="headline" style="margin:0;font-size:48px;line-height:1.04;font-weight:700;letter-spacing:-1.8px;color:#001d2e;">Your project,<br><span style="color:#001d2e;">taking shape.</span></h1>
${message}
</td></tr>
<tr><td bgcolor="#f3f7fa" class="pad" style="padding:28px 40px 30px;background:#f3f7fa;">
<p style="margin:0 0 16px;font-size:11px;font-weight:700;letter-spacing:1px;line-height:1.6;color:#526878;">${escape(title)} · VERSION ${escape(estimate.version_no || 1)}</p>
${dimensionsHtml}
<table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">${scopeRows.map(([label,value])=>`<tr><td width="30%" valign="top" style="padding:8px 12px 8px 0;border-top:1px solid #d5e1e8;font-size:12px;line-height:1.5;color:#526878;">${escape(label)}</td><td valign="top" style="padding:8px 0;border-top:1px solid #d5e1e8;font-size:13px;font-weight:700;line-height:1.5;color:#001d2e;">${escape(value)}</td></tr>`).join('')}</table>
<p style="margin:12px 0 20px;font-size:12px;line-height:1.6;color:#526878;">Please review the full proposal for all inclusions and exclusions.</p>
<table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="border-top:1px solid #d5e1e8;"><tr><td style="padding-top:20px;">
<p style="margin:0 0 6px;font-size:10px;font-weight:700;letter-spacing:1.5px;line-height:1.5;color:#526878;">YOUR ESTIMATE · EXCLUDING VAT</p>
<p class="price" style="margin:0;font-size:36px;font-weight:700;line-height:1.2;letter-spacing:-0.8px;color:#001d2e;">${money(total)}</p>
<p style="margin:8px 0 22px;font-size:12px;line-height:1.6;color:#526878;">${money(total * 1.15)} including 15% VAT</p>
<table role="presentation" border="0" cellspacing="0" cellpadding="0" class="full-button"><tr><td bgcolor="#0043f3" align="center" style="background:#0043f3;"><a class="full-button" href="${escape(shareUrl)}" style="display:inline-block;box-sizing:border-box;padding:16px 24px;font-size:15px;font-weight:700;line-height:1.4;color:#ffffff;text-decoration:none;">View your proposal &nbsp; &rarr;</a></td></tr></table>
<p style="margin:12px 0 0;font-size:12px;line-height:1.6;color:#526878;">Your PDF estimate is attached for easy reference.</p>
</td></tr></table>
</td></tr>
${showWarehousePhoto ? `<tr><td class="pad" style="padding:30px 40px 28px;">
<p style="margin:0 0 12px;font-size:10px;font-weight:700;letter-spacing:1.7px;line-height:1.5;color:#526878;">A CLOSER LOOK AT ATLAS</p>
<img src="${SITE}/atlas/email/atlas-steel-detail.jpg" alt="Atlas steel frame showing the ridge connection and galvanised members against a blue sky." width="600" height="337" style="display:block;width:100%;max-width:600px;height:auto;border:0;">
<p style="margin:10px 0 0;font-size:12px;line-height:1.65;color:#526878;">Real Atlas frame and ridge connection detail. Your supplied specification is defined in your proposal.</p>
</td></tr>
` : ""}
<tr><td class="pad" style="padding:0 40px 28px;">
<h2 style="margin:0 0 8px;font-size:23px;line-height:1.25;letter-spacing:-0.4px;color:#001d2e;">A clear way forward.</h2>
<p style="margin:0 0 18px;font-size:13px;line-height:1.6;color:#526878;">Choose your next step below.</p>
<table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="border-top:1px solid #d9e4eb;"><tr>
<td class="stack step" width="33%" valign="top" style="padding:18px 16px 0 0;"><p style="margin:0 0 9px;font-size:10px;font-weight:700;letter-spacing:1px;color:#526878;">01 / REVIEW</p><p style="margin:0 0 8px;font-size:13px;line-height:1.65;color:#334d5e;">Check the scope and pricing against your plans.</p><a data-next-step="review" href="${escape(shareUrl)}" style="display:inline-block;padding:8px 0;font-size:13px;font-weight:700;line-height:1.5;color:#001d2e;text-decoration:underline;">View your proposal &rarr;</a></td>
<td class="stack step" width="34%" valign="top" style="padding:18px 16px 0 0;"><p style="margin:0 0 9px;font-size:10px;font-weight:700;letter-spacing:1px;color:#526878;">02 / REFINE</p><p style="margin:0 0 8px;font-size:13px;line-height:1.65;color:#334d5e;">Need an adjustment? Let’s work through it.</p><a data-next-step="refine" href="${escape(changesUrl)}" style="display:inline-block;padding:8px 0;font-size:13px;font-weight:700;line-height:1.5;color:#001d2e;text-decoration:underline;">Discuss a change &rarr;</a></td>
<td class="stack step last-step" width="33%" valign="top" style="padding:18px 0 0;"><p style="margin:0 0 9px;font-size:10px;font-weight:700;letter-spacing:1px;color:#526878;">03 / CONFIRM</p><p style="margin:0 0 8px;font-size:13px;line-height:1.65;color:#334d5e;">Ready? Review and accept your quote online.</p><a data-next-step="confirm" href="${escape(acceptanceUrl)}" style="display:inline-block;padding:8px 0;font-size:13px;font-weight:700;line-height:1.5;color:#001d2e;text-decoration:underline;">Review &amp; accept &rarr;</a></td>
</tr></table>
<p style="margin:16px 0 0;font-size:12px;line-height:1.6;color:#526878;">After acceptance, we’ll confirm your order and payment arrangements.</p>
</td></tr>
<tr><td class="pad" style="padding:0 40px 30px;">
${bookingUrl ? `<table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="border-top:1px solid #c1d9e5;"><tr><td style="padding:22px 0 24px;">
<h2 style="margin:0 0 8px;font-size:20px;font-weight:700;line-height:1.3;letter-spacing:-0.3px;color:#001d2e;">Prefer to talk it through?</h2>
<p style="margin:0 0 15px;font-size:14px;line-height:1.7;color:#334d5e;">Book a 15-minute call with Marco to review the scope, ask questions or explore an adjustment.</p>
<table role="presentation" border="0" cellspacing="0" cellpadding="0"><tr><td style="border:1px solid #001d2e;"><a href="${escape(bookingUrl)}" style="display:inline-block;padding:13px 18px;font-size:13px;font-weight:700;line-height:1.5;color:#001d2e;text-decoration:none;">Book a 15-minute call &nbsp; &rarr;</a></td></tr></table>
<p style="margin:11px 0 0;font-size:12px;line-height:1.6;color:#526878;">Or just reply to this email. I’d be happy to help.</p>
</td></tr></table>
` : `<p style="margin:0 0 20px;font-size:14px;line-height:1.7;color:#334d5e;">Questions or changes? Simply reply to this email and we’ll work through them with you.</p>`}
<p style="margin:0;font-size:14px;line-height:1.6;color:#001d2e;">Kind regards,<br><strong>${escape(senderName || "The Smart Steel Team")}</strong><br><span style="font-size:12px;color:#526878;">Smart Steel · The team behind Atlas</span></p>
</td></tr>
<tr><td class="pad" bgcolor="#edf4f8" style="padding:22px 40px;background:#edf4f8;border-top:1px solid #c1d9e5;">
<table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td class="stack" valign="top"><p style="margin:0 0 8px;font-size:13px;font-weight:700;line-height:1.5;color:#001d2e;">ATLAS BY SMART STEEL</p><p style="margin:0;font-size:11px;line-height:1.7;color:#526878;">SMART STEEL SOLUTIONS (Pty) Ltd<br>Reg. 2025/739075/07 · VAT 4390325704</p></td><td class="stack footer-right" align="right" valign="top"><p style="margin:0;font-size:12px;line-height:1.9;"><a href="mailto:${escape(smartSteelContact.email)}" style="color:#001d2e;text-decoration:none;">${escape(smartSteelContact.email)}</a><br><a href="tel:${escape(smartSteelContact.telephone)}" style="color:#001d2e;text-decoration:none;">${escape(smartSteelContact.displayTelephone)}</a></p></td></tr></table>
<p style="margin:16px 0 0;font-size:10px;line-height:1.7;color:#667e8d;">Please refer to the estimate for the full scope, exclusions, validity and commercial terms. Images are illustrative and do not replace the quoted specification.</p>
</td></tr></table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr></table></body></html>`
}
