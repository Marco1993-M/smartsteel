import SolarCarportEstimatorClient from "./SolarCarportEstimatorClient"

export const metadata = {
  title: "Solar Carport Estimator | Smart Steel",
  description:
    "Estimate a Smart Steel solar carport online with a clearer starting budget before you send your enquiry through.",
  alternates: {
    canonical: "/tools/solar-carport-estimator",
  },
  openGraph: {
    title: "Solar Carport Estimator | Smart Steel",
    description:
      "Use the Smart Steel solar carport estimator for a quicker budget starting point before you enquire.",
    url: "https://www.smartsteel.co.za/tools/solar-carport-estimator",
    siteName: "Smart Steel",
    locale: "en_ZA",
    type: "website",
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
