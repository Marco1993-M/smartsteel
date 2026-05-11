import { formatCurrency } from "../../../lib/estimates/warehouseEstimate"
import { calculateLcssWarehouseEstimate } from "../../../lib/estimates/warehouseEstimateLcss"

const SITE_URL = "https://www.smartsteel.co.za"
const CATEGORY_PATH = "/products/cflc-diy-warehouse-kits"

const DEFAULT_PRODUCT_INPUT = {
  wallHeight: 3,
  steelFinish: "Galv",
  gableMode: "sheeted_gable",
  quantity: 1,
}

const LAUNCH_SPANS = [
  {
    width: 6,
    label: "6m span kits",
    image: "/CFLC.webp",
    audience: "Smaller storage, workshop, and utility structures where a practical DIY-friendly kit makes sense.",
    lengths: [5, 7.5, 10, 12.5, 15],
  },
  {
    width: 10,
    label: "10m span kits",
    image: "/CFLC.webp",
    audience: "A stronger mid-range warehouse kit category for operational storage, covered work areas, and commercial utility use.",
    lengths: [10, 12.5, 15, 20, 25],
  },
  {
    width: 12,
    label: "12m span kits",
    image: "/CFLC.webp",
    audience: "Larger footprint kits for warehousing, agricultural use, and buyers who still want a repeatable product-style route.",
    lengths: [10, 15, 20, 25, 30],
  },
]

const STARTER_KITS = [
  {
    title: "CFLC Single carport kit",
    size: "3m x 6m",
    description:
      "A practical starter product for a single vehicle cover, smaller parking bay, or narrow utility shelter.",
    width: 3,
    length: 6,
  },
  {
    title: "CFLC Double carport kit",
    size: "5m x 6m",
    description:
      "A strong next-step product for two vehicles, side-by-side cover, or a small multipurpose parking shelter.",
  },
  {
    title: "CFLC Utility cover kit",
    size: "6m x 6m",
    description:
      "A useful crossover product for covered work space, compact storage, or mixed vehicle and utility use.",
  },
]

function buildKit(width, length) {
  const estimate = calculateLcssWarehouseEstimate({
    ...DEFAULT_PRODUCT_INPUT,
    width,
    length,
  })

  return {
    title: `${width}m x ${length}m CFLC kit`,
    width,
    length,
    path: CATEGORY_PATH,
    priceFrom: formatCurrency(estimate.pricing.totalInclVat),
    estimate,
  }
}

function buildStarterKit(kit) {
  if (!kit.width || !kit.length) {
    return kit
  }

  const estimate = calculateLcssWarehouseEstimate({
    ...DEFAULT_PRODUCT_INPUT,
    width: kit.width,
    length: kit.length,
    gableMode: "open_gable",
  })

  return {
    ...kit,
    priceFrom: formatCurrency(estimate.pricing.totalInclVat),
    estimate,
  }
}

export const cflcLaunchRanges = LAUNCH_SPANS.map((span) => {
  const kits = span.lengths.map((length) => buildKit(span.width, length))
  return {
    ...span,
    kits,
    fromPrice: kits[0]?.priceFrom,
  }
})

export const cflcCatalogueMetadata = {
  title: "CFLC DIY Warehouse Kits | Smart Steel",
  description:
    "Browse Smart Steel CFLC DIY warehouse kits in practical repeatable sizes, including 6m, 10m, and 12m span options built for easy product enquiries.",
  alternates: {
    canonical: CATEGORY_PATH,
  },
  openGraph: {
    title: "CFLC DIY Warehouse Kits | Smart Steel",
    description:
      "Explore Smart Steel CFLC DIY warehouse kits in practical sizes for smaller-span value and easy product enquiries.",
    url: `${SITE_URL}${CATEGORY_PATH}`,
    siteName: "Smart Steel",
    locale: "en_ZA",
    type: "website",
  },
}

export const cflcCatalogueIntroPoints = [
  "CFLC is the lead DIY warehouse system because it is especially practical for smaller, lower-ticket enquiries.",
  "Warehouse kits follow 2.5m bay increments, while dedicated CFLC carport products can use a deliberate 6m depth rule where needed.",
  "These prices are useful starting points for supply-only CFLC kits.",
]

export const cflcStarterKits = STARTER_KITS.map(buildStarterKit)
