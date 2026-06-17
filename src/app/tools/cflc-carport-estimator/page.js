import CflcCarportEstimatorClient from "./CflcCarportEstimatorClient"

const SITE_URL = "https://www.smartsteel.co.za"
const PAGE_PATH = "/tools/cflc-carport-estimator"
const SHARE_IMAGE = `${SITE_URL}/CFLC_carport.webp`

export const metadata = {
  title: "CFLC Carport Estimator | Lip Channel Carport Pricing",
  description:
    "Estimate a Smart Steel CFLC and lip channel carport kit online, including single, double, three-bay, and four-bay parking cover options before you enquire.",
  keywords: [
    "CFLC carport estimator",
    "lip channel carport pricing",
    "carport cost estimator South Africa",
    "steel carport quote",
    "carport kit pricing",
  ],
  alternates: {
    canonical: PAGE_PATH,
  },
  openGraph: {
    title: "CFLC Carport Estimator | Lip Channel Carport Pricing",
    description:
      "Use the Smart Steel CFLC carport estimator for a clearer starting budget on single, double, three-bay, and four-bay carport kits.",
    url: `${SITE_URL}${PAGE_PATH}`,
    siteName: "Smart Steel",
    locale: "en_ZA",
    type: "website",
    images: [
      {
        url: SHARE_IMAGE,
        width: 1200,
        height: 630,
        alt: "Smart Steel CFLC carport estimator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CFLC Carport Estimator | Lip Channel Carport Pricing",
    description:
      "Use the Smart Steel CFLC carport estimator for a clearer starting budget on single, double, three-bay, and four-bay carport kits.",
    images: [SHARE_IMAGE],
  },
}

export default async function CflcCarportEstimatorPage({ searchParams }) {
  const params = await searchParams

  return (
    <CflcCarportEstimatorClient
      initialInput={{
        size: params?.size,
        quantity: params?.quantity,
        deliveryDistance: params?.deliveryDistance,
      }}
    />
  )
}
