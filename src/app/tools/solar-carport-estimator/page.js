import SolarCarportEstimatorClient from "./SolarCarportEstimatorClient"

const SITE_URL = "https://www.smartsteel.co.za"
const PAGE_PATH = "/tools/solar-carport-estimator"
const SHARE_IMAGE = `${SITE_URL}/solar_carport_hero.webp`

export const metadata = {
  title: "Solar Carport Estimator | Smart Steel",
  description:
    "Estimate a Smart Steel solar carport online with a clearer starting budget before you send your enquiry through.",
  alternates: {
    canonical: PAGE_PATH,
  },
  openGraph: {
    title: "Solar Carport Estimator | Smart Steel",
    description:
      "Use the Smart Steel solar carport estimator for a quicker budget starting point before you enquire.",
    url: `${SITE_URL}${PAGE_PATH}`,
    siteName: "Smart Steel",
    locale: "en_ZA",
    type: "website",
    images: [
      {
        url: SHARE_IMAGE,
        width: 1200,
        height: 630,
        alt: "Smart Steel solar carport estimator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Solar Carport Estimator | Smart Steel",
    description:
      "Use the Smart Steel solar carport estimator for a quicker budget starting point before you enquire.",
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
