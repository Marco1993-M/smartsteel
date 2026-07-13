import WarehouseSystemsComparePage from "../../../components/warehouses/WarehouseSystemsComparePage"

export const metadata = {
  title: "LSF vs Atlas Lip Channel Warehouses | Smart Steel",
  description:
    "Compare Smart Steel LSF and Atlas lip channel warehouses side by side. See where each system fits and choose the right warehouse path for your project.",
  keywords: [
    "LSF vs Atlas warehouse",
    "LSF vs CFLC warehouse",
    "warehouse system comparison",
    "LSF warehouse vs CFLC warehouse",
    "steel warehouse systems South Africa",
  ],
  alternates: {
    canonical: "/warehouses/lsf-vs-cflc",
  },
  openGraph: {
    title: "LSF vs Atlas Lip Channel Warehouses | Smart Steel",
    description:
      "Compare Smart Steel LSF and Atlas lip channel warehouse systems side by side before you choose your warehouse path.",
    url: "https://www.smartsteel.co.za/warehouses/lsf-vs-cflc",
    siteName: "Smart Steel",
    locale: "en_ZA",
    type: "website",
  },
}

export default function LsfVsCflcPage() {
  return <WarehouseSystemsComparePage />
}
