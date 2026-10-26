export const AGRICULTURAL_FORM_STEPS = ['Your project', 'Building requirements', 'Review & contact']

const profiles = {
  piggery: { capacityLabel: 'Breeding or housing capacity', capacityPlaceholder: 'For example: 20 sows plus grower accommodation', equipmentLabel: 'Pen or production layout' },
  poultry: { capacityLabel: 'Birds per house', capacityPlaceholder: 'Approximate target', equipmentLabel: 'Poultry equipment layout' },
  dairy: { capacityLabel: 'Herd and parlour capacity', capacityPlaceholder: 'For example: 80 cows, 8-point parlour', equipmentLabel: 'Parlour or equipment layout' },
  cattle: { capacityLabel: 'Cattle numbers and use', capacityPlaceholder: 'For example: shade for 100 cattle', equipmentLabel: 'Pen or handling layout' },
  sheep: { capacityLabel: 'Flock size and intended use', capacityPlaceholder: 'For example: lambing cover for 200 ewes', equipmentLabel: 'Pen, race or equipment layout' },
  storage: { capacityLabel: 'What will you store, and how much?', capacityPlaceholder: 'For example: 200 pallets of bagged grain', equipmentLabel: 'Storage and handling layout' },
  general: { capacityLabel: 'Approximate capacity or size', capacityPlaceholder: 'Tell us what the building needs to accommodate', equipmentLabel: 'Production or equipment layout' },
}

export function agriculturalFormKind(kind, projectNeed = '') {
  if (kind && kind !== 'auto') return profiles[kind] ? kind : 'general'
  const text = projectNeed.toLowerCase()
  if (/poultry|broiler|layer|pullet|brooding/.test(text)) return 'poultry'
  if (/pig|sow|farrow/.test(text)) return 'piggery'
  if (/dairy|milking/.test(text)) return 'dairy'
  if (/cattle|feedlot/.test(text)) return 'cattle'
  if (/sheep|small.stock|lambing|shearing/.test(text)) return 'sheep'
  if (/storage|grain|machinery|warehouse/.test(text)) return 'storage'
  return 'general'
}

export function agriculturalFormProfile(kind) { return profiles[kind] || profiles.general }

export function buildAgriculturalEnquiry(form, { planLabel, kind, leadSource }) {
  const profile = agriculturalFormProfile(kind)
  const capacity = String((kind === 'poultry' ? form.birdCapacity : form.capacity) || '').trim()
  const scope = form.scope || []
  const roofReview = kind === 'poultry' || scope.includes('Roof insulation review')
  const ventilation = kind === 'poultry' ? form.ventilation : null
  const notes = [
    `Agricultural topic: ${planLabel || form.projectNeed}`,
    `Site location: ${form.location.trim()}`,
    `Project need: ${form.projectNeed}`,
    `${kind === 'poultry' ? 'Target bird capacity' : profile.capacityLabel}: ${capacity ? `${capacity}${kind === 'poultry' ? ' birds per house' : ''}` : 'To be confirmed'}`,
    `Information available: ${form.briefStatus || 'Not sure yet'}`,
    `Project stage: ${form.projectStage || 'Not sure yet'}`,
    `Target timing: ${form.timeline || 'To be confirmed'}`,
    `Requested scope: ${scope.length ? scope.join(', ') : 'To be confirmed'}`,
    `Delivery support requested: ${scope.includes('Delivery') ? 'Yes' : 'No'}`,
    `Installation support requested: ${scope.includes('Installation review') ? 'Yes' : 'No'}`,
    `${profile.equipmentLabel}: ${form.equipment}`,
    ventilation ? `Ventilation approach: ${ventilation}` : null,
    ventilation === 'Natural ventilation' && form.proposedSize.trim() ? `Proposed size or site layout: ${form.proposedSize.trim()}` : null,
    ['Mechanical ventilation', 'Combination / specialist design'].includes(ventilation) ? `Ventilation supplier layout: ${form.ventilationLayout}` : null,
    roofReview ? `Roof insulation brief: ${form.insulation}` : null,
    roofReview && form.insulation === 'Specification available' && form.insulationSpecification.trim() ? `Insulation specification: ${form.insulationSpecification.trim()}` : null,
    scope.includes('Delivery') ? `Delivery access: ${form.deliveryAccess}` : null,
    scope.includes('Installation review') ? `Site readiness: ${form.siteReadiness}` : null,
    form.notes.trim() ? `Project notes: ${form.notes.trim()}` : null,
  ].filter(Boolean).join('\n')
  return {
    name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(),
    estimate_request: `${form.projectNeed} structural quotation${capacity ? ` · ${capacity}${kind === 'poultry' ? ' birds per house' : ''}` : ''}`,
    notes, status: 'new', lead_source: leadSource,
    product_type: `Agricultural Structure - ${form.projectNeed}`,
    next_action: `Review the agricultural project brief, define the Atlas building-shell scope, and contact the client about the requested ${form.projectNeed}.`,
  }
}
