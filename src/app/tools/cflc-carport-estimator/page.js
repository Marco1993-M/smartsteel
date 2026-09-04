import CflcCarportEstimatorClient from "./CflcCarportEstimatorClient"

const SITE_URL = "https://www.smartsteel.co.za"
const PAGE_PATH = "/tools/cflc-carport-estimator"
const SHARE_IMAGE = `${SITE_URL}/CFLC_carport.webp`

const calculatorSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Atlas Carport Price Calculator",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Any",
  description:
    "Calculate a starting price for an Atlas steel carport covering one to four parking bays in South Africa.",
  url: `${SITE_URL}${PAGE_PATH}`,
  provider: {
    "@type": "Organization",
    name: "Smart Steel",
    url: SITE_URL,
  },
}

export const metadata = {
  title: "Atlas Carport Price Calculator | Steel Carports South Africa",
  description:
    "Calculate an Atlas steel carport starting price for one to four parking bays. Compare practical lip channel carport sizes before requesting a reviewed quote.",
  keywords: [
    "Atlas carport calculator",
    "steel carport prices South Africa",
    "lip channel carport pricing",
    "carport cost estimator South Africa",
    "steel carport quote",
    "carport kit pricing",
  ],
  alternates: {
    canonical: PAGE_PATH,
  },
  openGraph: {
    title: "Atlas Carport Price Calculator | Smart Steel",
    description:
      "Choose one to four parking bays and see an immediate Atlas steel carport starting price before you enquire.",
    url: `${SITE_URL}${PAGE_PATH}`,
    siteName: "Smart Steel",
    locale: "en_ZA",
    type: "website",
    images: [
      {
        url: SHARE_IMAGE,
        width: 1200,
        height: 630,
        alt: "Atlas steel carport price calculator by Smart Steel",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Atlas Carport Price Calculator | Smart Steel",
    description:
      "Choose one to four parking bays and see an immediate Atlas steel carport starting price before you enquire.",
    images: [SHARE_IMAGE],
  },
}

export default async function CflcCarportEstimatorPage({ searchParams }) {
  const params = await searchParams

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorSchema) }}
      />
      <CflcCarportEstimatorClient
        initialInput={{
          size: params?.size,
          quantity: params?.quantity,
          projectLocation: params?.location,
        }}
      />
    </>
  )
}
