import { formatCurrency } from "../../../lib/estimates/warehouseEstimate"
import { calculateLcssWarehouseEstimate } from "../../../lib/estimates/warehouseEstimateLcss"

const SITE_URL = "https://www.smartsteel.co.za"
const CATEGORY_PATH = "/products/cflc-diy-warehouse-kits"
const DEFAULT_LEAD_TIME = "Made to order in 5-8 working days if stock is not in store."
const DEFAULT_INCLUDED = [
  "Main frame",
  "Bracing",
  "Purlins / hats",
  "Fasteners",
  "Drawings / installation guide",
]
const DEFAULT_EXCLUDED = [
  "Sheeting",
  "Flashings",
  "Concrete / foundations",
  "Delivery",
  "Installation",
  "Tools and accessories",
]

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
    "Browse Smart Steel CFLC DIY warehouse kits in practical repeatable sizes, including 6m, 10m, and 12m span options built for easy product enquiries and a clearer lipped channel steel buying path.",
  alternates: {
    canonical: CATEGORY_PATH,
  },
  openGraph: {
    title: "CFLC DIY Warehouse Kits | Smart Steel",
    description:
      "Explore Smart Steel CFLC DIY warehouse kits in practical sizes for smaller-span value, easy product enquiries, and a clearer lipped channel steel route.",
    url: `${SITE_URL}${CATEGORY_PATH}`,
    siteName: "Smart Steel",
    locale: "en_ZA",
    type: "website",
  },
}

export const cflcCatalogueIntroPoints = [
  "CFLC suits buyers who want a practical lipped channel steel kit for smaller warehouses, covered work areas, and simpler product enquiries.",
  "The range includes standard warehouse kit sizes as well as smaller cover and carport options.",
  "These prices give you a useful starting point before final delivery, finish, and project details are confirmed.",
]

export const cflcStarterKits = STARTER_KITS.map(buildStarterKit)

function buildFeaturedSelection({
  id,
  title,
  family,
  bestFor,
  productType = "DIY supply only",
  priceFrom,
  width,
  length,
  weight,
  packInfo,
  leadTime = DEFAULT_LEAD_TIME,
}) {
  return {
    id,
    title,
    family,
    bestFor,
    productType,
    priceFrom,
    size: `${width}m x ${length}m`,
    width,
    length,
    weight,
    packInfo,
    leadTime,
    included: DEFAULT_INCLUDED,
    excluded: DEFAULT_EXCLUDED,
    ctaHref: "/contact",
    ctaLabel: "Request this product",
  }
}

function buildWarehouseFeaturedSelection({ width, length, family, bestFor, packInfo }) {
  const estimate = calculateLcssWarehouseEstimate({
    ...DEFAULT_PRODUCT_INPUT,
    width,
    length,
  })

  return buildFeaturedSelection({
    id: `${width}x${length}`,
    title: `${width}m x ${length}m CFLC warehouse kit`,
    family,
    bestFor,
    width,
    length,
    priceFrom: formatCurrency(estimate.pricing.totalInclVat),
    weight: `${estimate.materials.totalSteelKg}kg steel before optional extras`,
    packInfo,
  })
}

export const cflcFeaturedSelections = [
  buildFeaturedSelection({
    id: "3x6-carport",
    title: "CFLC Single carport kit",
    family: "Carport kits",
    bestFor: "Single vehicle cover, compact side shelter, and smaller utility cover projects.",
    width: 3,
    length: 6,
    priceFrom: "R14,386.64",
    weight: "235.8kg steel before optional extras",
    packInfo: "Estimated 2 bundles. Main bundle approximately 3.2m x 0.9m x 0.45m.",
  }),
  buildFeaturedSelection({
    id: "5x6-carport",
    title: "CFLC Double carport kit",
    family: "Carport kits",
    bestFor: "Two vehicles, wider side-by-side parking cover, and practical utility shelter use.",
    width: 5,
    length: 6,
    priceFrom: "R16,848.48",
    weight: "278.01kg steel before optional extras",
    packInfo: "Estimated 2 bundles. Main bundle approximately 3.2m x 1.0m x 0.5m.",
  }),
  buildWarehouseFeaturedSelection({
    width: 6,
    length: 10,
    family: "6m span warehouse kits",
    bestFor: "Smaller storage buildings, workshops, and practical utility warehouse use.",
    packInfo:
      "Estimated 2 bundles. Structural bundle approximately 3.2m x 1.1m x 0.7m plus a long hat/purlin bundle.",
  }),
  buildWarehouseFeaturedSelection({
    width: 6,
    length: 15,
    family: "6m span warehouse kits",
    bestFor: "Longer workshops, farm utility buildings, and compact warehouse expansion space.",
    packInfo:
      "Estimated flat-packed structural bundle plus one longer hat/purlin bundle for the extended depth.",
  }),
  buildWarehouseFeaturedSelection({
    width: 10,
    length: 10,
    family: "10m span warehouse kits",
    bestFor: "Operational storage, wider workshop space, and covered work areas that need more width.",
    packInfo:
      "Estimated flat-packed structural and purlin bundles for collection or arranged delivery.",
  }),
  buildWarehouseFeaturedSelection({
    width: 10,
    length: 20,
    family: "10m span warehouse kits",
    bestFor: "Mid-range storage, equipment cover, and commercial workshop or yard support space.",
    packInfo:
      "Estimated flat-packed structural and purlin bundles for collection or arranged delivery.",
  }),
  buildWarehouseFeaturedSelection({
    width: 12,
    length: 10,
    family: "12m span warehouse kits",
    bestFor: "Wider warehouse and agricultural storage projects that need a stronger footprint from the start.",
    packInfo:
      "Estimated flat-packed structural and purlin bundles for collection or arranged delivery.",
  }),
  buildWarehouseFeaturedSelection({
    width: 12,
    length: 20,
    family: "12m span warehouse kits",
    bestFor: "Larger warehouse, commercial storage, and agricultural cover projects.",
    packInfo:
      "Estimated flat-packed structural and purlin bundles for collection or arranged delivery.",
  }),
]
