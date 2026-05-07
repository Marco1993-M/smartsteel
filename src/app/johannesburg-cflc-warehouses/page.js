import CflcRegionPage from "../../components/warehouses/CflcRegionPage"

export const metadata = {
  title: "CFLC Warehouses Johannesburg | Smart Steel",
  description:
    "Explore CFLC warehouses in Johannesburg with Smart Steel. Start the right warehouse enquiry for logistics, industrial, and storage projects.",
  keywords: [
    "CFLC warehouses Johannesburg",
    "cold formed warehouse Johannesburg",
    "steel warehouses Johannesburg",
    "CFLC warehouse Gauteng",
  ],
  alternates: {
    canonical: "/johannesburg-cflc-warehouses",
  },
  openGraph: {
    title: "CFLC Warehouses Johannesburg | Smart Steel",
    description:
      "Explore the Smart Steel CFLC warehouse path for Johannesburg logistics, storage, and industrial projects.",
    url: "https://www.smartsteel.co.za/johannesburg-cflc-warehouses",
    siteName: "Smart Steel",
    locale: "en_ZA",
    type: "website",
  },
}

export default function JohannesburgCflcWarehousesPage() {
  return (
    <CflcRegionPage
      city="Johannesburg"
      province="Gauteng"
      heroLabel="CFLC warehouse systems for Johannesburg logistics and industrial demand"
      intro="Johannesburg is one of the most important commercial and industrial warehouse markets in South Africa, so it makes sense to have a dedicated CFLC regional page here. This page gives buyers a cleaner way to start the CFLC warehouse conversation before the quotation is finalised."
      marketFocus="Johannesburg warehouse enquiries usually need speed, scale, and practical direction. The CFLC page helps when the buyer wants a clearer starting point, especially in logistics, industrial, and storage-led projects."
      localZones={["Aeroton", "Wadeville", "City Deep", "Roodepoort", "Midrand"]}
      industries={["distribution", "light industrial", "fleet and logistics"]}
      relatedCityLinks={[
        {
          href: "/pretoria-cflc-warehouses",
          title: "Pretoria CFLC warehouses",
          description: "Explore the Pretoria CFLC warehouse page if your project links into the wider Gauteng market.",
        },
        {
          href: "/johannesburg-warehouses",
          title: "Johannesburg warehouse systems",
          description: "See the broader Johannesburg warehouse page if you still need to compare across systems.",
        },
      ]}
    />
  )
}
