export const ATLAS_SHOWCASE_OFFER = Object.freeze({
 enabled: true, id: 'atlas-showcase-2027', name: 'Atlas Showcase Offer', termsVersion: '2026-10-v1',
 rate: .1, capacity: 5, deadline: '2027-01-31T21:59:59.999Z', // 31 January, 23:59:59 SAST
})
export const SHOWCASE_REVIEW_LABELS = { pending: 'Assessment pending', approved: 'Approved for quotation', declined: 'Not eligible' }
export const SHOWCASE_PHOTOGRAPHY_LABELS = { yes: 'Open to agreed photography and marketing use', discuss: 'Would like to discuss photography', no: 'Not willing to participate' }
export function showcaseOfferOpen(now = new Date()) { return ATLAS_SHOWCASE_OFFER.enabled && Number.isFinite(+new Date(now)) && +new Date(now) <= Date.parse(ATLAS_SHOWCASE_OFFER.deadline) }
export const showcaseSaving = value => typeof value === 'number' && Number.isFinite(value) && value > 0 ? Math.round((value * ATLAS_SHOWCASE_OFFER.rate + Number.EPSILON) * 100) / 100 : null
export function validateShowcaseInterest(interest, now = new Date()) {
 if (!interest || typeof interest !== 'object' || Array.isArray(interest) || interest.campaignId !== ATLAS_SHOWCASE_OFFER.id || interest.termsVersion !== ATLAS_SHOWCASE_OFFER.termsVersion) throw new Error('Refresh the builder to review the current Showcase Offer.')
 if (!showcaseOfferOpen(now)) throw new Error('The Showcase Offer has ended. You can still request a standard quotation.')
 if (typeof interest.projectUse !== 'string' || !interest.projectUse.trim() || interest.projectUse.length > 1000) throw new Error('Tell us what the building will be used for.')
 if (!Object.hasOwn(SHOWCASE_PHOTOGRAPHY_LABELS, interest.photographyPreference)) throw new Error('Select your photography preference so our team can review it.')
 return { projectUse: interest.projectUse.trim(), photographyPreference: interest.photographyPreference }
}
export function createShowcaseApplication(interest, supplyTotal, configuration, now = new Date()) {
 const details = validateShowcaseInterest(interest, now)
 const saving = showcaseSaving(supplyTotal)
 if (saving === null) throw new Error('Your supply price is unavailable. Please refresh the builder.')
 return { campaignId: ATLAS_SHOWCASE_OFFER.id, name: ATLAS_SHOWCASE_OFFER.name, termsVersion: ATLAS_SHOWCASE_OFFER.termsVersion,
  status: 'pending', revision: 1, submittedAt: new Date(now).toISOString(), deadline: ATLAS_SHOWCASE_OFFER.deadline,
  ...details, supplyTotal, potentialSaving: saving, discountRate: ATLAS_SHOWCASE_OFFER.rate,
  priceBasis: 'Supply only, excluding VAT, delivery and installation', configuration, reviewHistory: [],
 }
}
export function showcaseApplicationNotes(offer) {
 if (!offer) return []
 return [ATLAS_SHOWCASE_OFFER.name + ' — assessment pending', `Offer terms: ${offer.termsVersion}`, `Proposed building use: ${offer.projectUse}`, `Photography preference: ${SHOWCASE_PHOTOGRAPHY_LABELS[offer.photographyPreference]}`, `Standard supply guide excl. VAT: R ${offer.supplyTotal.toFixed(2)}`, `Potential 10% supply saving excl. VAT: R ${offer.potentialSaving.toFixed(2)}`, 'Internal review required. No discount applied or showcase place reserved. Photography permission and marketing usage must be agreed separately.']
}
