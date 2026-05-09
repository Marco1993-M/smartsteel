import WarehouseBuilderClient from "./WarehouseBuilderClient"

export const metadata = {
  title: "Warehouse Builder South Africa | Design A Steel Warehouse",
  description:
    "Design a steel warehouse online with the Smart Steel warehouse builder. See an indicative budget and send a structured South African warehouse enquiry.",
  alternates: {
    canonical: "/warehouse-builder",
  },
  openGraph: {
    title: "Warehouse Builder South Africa | Design A Steel Warehouse",
    description:
      "Shape a Smart Steel warehouse online, see an indicative budget, and send a structured enquiry.",
    url: "https://www.smartsteel.co.za/warehouse-builder",
    siteName: "Smart Steel",
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Warehouse Builder South Africa | Smart Steel",
    description:
      "Design a steel warehouse online and send a stronger enquiry with the Smart Steel builder.",
  },
}

export default function WarehouseBuilderPage() {
  return <WarehouseBuilderClient />
}
