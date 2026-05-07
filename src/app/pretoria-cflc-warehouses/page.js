import CflcRegionPage from "../../components/warehouses/CflcRegionPage"

export const metadata = {
  title: "CFLC Warehouses Pretoria | Smart Steel",
  description:
    "Explore CFLC warehouses in Pretoria with Smart Steel. Start the right warehouse enquiry path for Gauteng storage, workshop, and industrial projects.",
  keywords: [
    "CFLC warehouses Pretoria",
    "cold formed warehouse Pretoria",
    "steel warehouses Pretoria",
    "CFLC warehouse Gauteng",
  ],
  alternates: {
    canonical: "/pretoria-cflc-warehouses",
  },
  openGraph: {
    title: "CFLC Warehouses Pretoria | Smart Steel",
    description:
      "Explore the Smart Steel CFLC warehouse path for Pretoria and surrounding Gauteng projects.",
    url: "https://www.smartsteel.co.za/pretoria-cflc-warehouses",
    siteName: "Smart Steel",
    locale: "en_ZA",
    type: "website",
  },
}

export default function PretoriaCflcWarehousesPage() {
  return (
    <CflcRegionPage
      city="Pretoria"
      province="Gauteng"
      heroLabel="CFLC warehouse systems for Pretoria and surrounding Gauteng zones"
      intro="Pretoria remains one of the strongest industrial and storage markets in Gauteng, which makes it a natural fit for a dedicated CFLC warehouse page. If your project needs a clearer cold formed steel option before the quotation is refined, this is the right place to start."
      marketFocus="Pretoria clients often need warehouse systems that balance speed, practicality, and a cleaner structural starting point. The CFLC page helps buyers who already know they want a cold formed option, or who need to compare it against LSF before they go further."
      localZones={["Rosslyn", "Silverton", "Montana", "Centurion", "Irene"]}
      industries={["manufacturing", "distribution", "industrial storage"]}
      relatedCityLinks={[
        {
          href: "/johannesburg-cflc-warehouses",
          title: "Johannesburg CFLC warehouses",
          description: "Explore the Johannesburg CFLC warehouse page if your project footprint extends across Gauteng.",
        },
        {
          href: "/pretoria-warehouses",
          title: "Pretoria warehouse systems",
          description: "See the broader Pretoria warehouse page if you still need to compare beyond the CFLC option.",
        },
      ]}
    />
  )
}
