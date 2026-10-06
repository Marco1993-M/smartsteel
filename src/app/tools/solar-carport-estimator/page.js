import SolarCarportEstimatorClient from "./SolarCarportEstimatorClient"

const SITE_URL = "https://www.smartsteel.co.za"
const PAGE_PATH = "/tools/solar-carport-estimator"
const SHARE_IMAGE = `${SITE_URL}/atlas-solar-carports-share.png`

export const metadata = {
  title: "Solar Carport 3D Builder & Price Estimator | Smart Steel",
  description:
    "Build an Atlas solar carport in 3D. Choose parking bays and row layouts, preview the steel structure and see a supply-only guide price excluding VAT in South Africa.",
  alternates: {
    canonical: PAGE_PATH,
  },
  openGraph: {
    title: "Solar Carport 3D Builder & Price Estimator | Smart Steel",
    description:
      "Explore parking layouts in 3D and see a steel structure guide price before requesting a reviewed quote.",
    url: `${SITE_URL}${PAGE_PATH}`,
    siteName: "Smart Steel",
    locale: "en_ZA",
    type: "website",
    images: [
      {
        url: SHARE_IMAGE,
        width: 1200,
        height: 630,
        alt: "Atlas solar carport estimator by Smart Steel",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Solar Carport 3D Builder & Price Estimator | Smart Steel",
    description:
      "Get an Atlas solar carport structure-only starting budget before you enquire.",
    images: [SHARE_IMAGE],
  },
}

export default async function SolarCarportEstimatorPage({ searchParams }) {
  const params = await searchParams

  return (
    <SolarCarportEstimatorClient
      initialInput={{
        width: params?.width,
        length: params?.length,
        quantity: params?.quantity,
        wallHeight: params?.wallHeight,
        moduleCount: params?.moduleCount,
        deliveryDistance: params?.deliveryDistance,
        scope: params?.scope,
      }}
    />
  )
}
