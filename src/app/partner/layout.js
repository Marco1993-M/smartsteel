import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { portalForKey } from '../../lib/partnerPortals.mjs'
import { PartnerPortalProvider } from '../../components/partner/PartnerPortalContext'
async function currentPortal() { return portalForKey((await headers()).get('x-smartsteel-partner')) }
export async function generateMetadata() {
  const portal = await currentPortal()
  if (!portal) return { robots: { index: false, follow: false } }
  const title = `${portal.name} Atlas Partner Sales Portal`
  const description = `The ${portal.name} and Smart Steel partner portal for Atlas product configuration, indicative pricing and quote requests.`
  const image = portal.key === 'afgri' ? '/afgri-atlas-partner-share.png' : portal.logo
  return {
    metadataBase: new URL(`https://${portal.host}`),
    title: { default: title, template: `%s | ${portal.name} Atlas Portal` }, description,
    robots: { index: false, follow: false }, alternates: { canonical: '/partner' },
    openGraph: { title, description, url: '/partner', siteName: title, locale: 'en_ZA', type: 'website', images: [{url: image, alt: title}] },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  }
}
export default async function PartnerLayout({ children }) {
  const portal = await currentPortal()
  if (!portal) notFound()
  return <PartnerPortalProvider portal={portal}>{children}</PartnerPortalProvider>
}
