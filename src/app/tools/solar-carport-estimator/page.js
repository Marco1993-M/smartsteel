import SolarCarportEstimatorClient from "./SolarCarportEstimatorClient"

const SITE_URL = "https://www.smartsteel.co.za"
const PAGE_PATH = "/tools/solar-carport-estimator"
const SHARE_IMAGE = `${SITE_URL}/atlas-solar-carports-share.png`

export const metadata = {
  title: "Atlas Solar Carport Estimator | Smart Steel",
  description:
    "Price an Atlas solar carport online with Smart Steel. Choose your parking layout and get a practical structure-only starting budget before you enquire.",
  alternates: {
    canonical: PAGE_PATH,
  },
  openGraph: {
    title: "Atlas Solar Carport Estimator | Smart Steel",
    description:
      "Choose an Atlas solar carport parking layout and get a structure-only starting budget before you enquire.",
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
    title: "Atlas Solar Carport Estimator | Smart Steel",
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
