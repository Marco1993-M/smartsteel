// Both wrappers use the same Atlas product, pricing and sales workflow.
const PORTALS = [
  { key: 'afgri', name: 'AFGRI', host: 'afgri.smartsteel.co.za', logo: '/afgri-logo-colour-cropped.png', lightLogo: '/afgri-logo-white-cropped.png' },
  { key: 'agrimark', name: 'Agrimark', host: 'agrimark.smartsteel.co.za', logo: '/agrimark-logo.jpg', lightLogo: '/agrimark-logo.jpg' },
]
export function getPartnerPortals() {
  return PORTALS.map(portal => ({ ...portal, host: portal.key === 'afgri' ? process.env.AFGRI_PORTAL_HOST || portal.host : portal.host }))
}
export function portalForKey(key) { return getPartnerPortals().find(portal => portal.key === key) || null }
export function portalForHost(host) {
  const hostname = String(host || '').split(':')[0].toLowerCase()
  if (['localhost', '127.0.0.1'].includes(hostname) && process.env.NODE_ENV !== 'production') return portalForKey(process.env.LOCAL_PARTNER_KEY || 'afgri')
  return getPartnerPortals().find(portal => portal.host.toLowerCase() === hostname) || null
}
export function membershipMatchesPortal(portal, organization) {
  return Boolean(portal && organization?.key === portal.key && ['pilot', 'active'].includes(organization.status))
}
