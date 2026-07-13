import { formatCurrency } from "../../../lib/estimates/warehouseEstimate"
import { calculateLcssWarehouseEstimate } from "../../../lib/estimates/warehouseEstimateLcss"
import { ATLAS_W_SERIES } from "../../../lib/atlasProductData"

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
    audience: "Larger footprint kits for warehousing and agricultural use where a standard size still makes sense.",
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
    title: `${width}m x ${length}m Atlas warehouse kit`,
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
  title: "Atlas Lip Channel Warehouse Kits South Africa | Smart Steel",
  description:
    "Browse Atlas W-Series modular warehouse kits in South Africa from Smart Steel, including practical W08, W10, and W12 options for storage, workshops, agriculture, and commercial projects.",
  keywords: [
    "steel warehouse kits south africa",
    "self-build warehouse",
    "DIY steel warehouse kits",
    "Atlas lip channel warehouse kits",
    "warehouse kits",
    "lip channel warehouse kits",
    "steel shed kits south africa",
  ],
  alternates: {
    canonical: CATEGORY_PATH,
  },
  openGraph: {
    title: "Atlas Lip Channel Warehouse Kits | Smart Steel",
    description:
      "Explore Smart Steel Atlas W-Series modular warehouse kits in practical sizes for storage, workshop, agricultural, and commercial projects.",
    url: `${SITE_URL}${CATEGORY_PATH}`,
    siteName: "Smart Steel",
    locale: "en_ZA",
    type: "website",
  },
}

export const cflcCatalogueIntroPoints = [
  "These warehouse kits suit clients who want a practical steel building kit for smaller warehouses, covered work areas, and simpler enquiries.",
  "The range focuses on standard warehouse kit sizes that are easier to compare before you enquire.",
  "These prices give you a useful guide before final delivery, finish, and project details are confirmed.",
]

export const cflcStarterKits = STARTER_KITS.map(buildStarterKit)

function buildFeaturedSelection({
  id,
  title,
  modelCode,
  family,
  bestFor,
  productType = "Supply-only guide",
  priceFrom,
  width,
  length,
  weight,
  packInfo,
  leadTime = DEFAULT_LEAD_TIME,
  ctaHref = "/contact",
  ctaLabel = "Request this product",
}) {
  return {
    id,
    title,
    modelCode,
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
    ctaHref,
    ctaLabel,
  }
}

function buildWarehouseFeaturedSelection({ modelCode, width, length, family, bestFor, packInfo }) {
  const model = ATLAS_W_SERIES.find((item) => item.code === modelCode)
  const estimate = calculateLcssWarehouseEstimate({
    ...DEFAULT_PRODUCT_INPUT,
    width,
    length,
  })

  return buildFeaturedSelection({
    id: `${modelCode.toLowerCase()}-${width}x${length}`,
    title: `Atlas ${model?.code || modelCode} · ${width}m x ${length}m`,
    family,
    bestFor,
    width,
    length,
    priceFrom: formatCurrency(estimate.pricing.totalInclVat),
    weight: `${estimate.materials.totalSteelKg}kg steel before optional extras`,
    packInfo,
    modelCode,
    ctaHref: `/warehouse-builder?productType=LCSS%20Warehouse&width=${width}&length=${length}`,
    ctaLabel: "Configure this model",
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
    modelCode: "W08",
    width: 8,
    length: 10,
    family: "Atlas W08 · 8m span",
    bestFor: "Compact storage buildings, workshops, agricultural utility space, and covered work areas.",
    packInfo:
      "Estimated 2 bundles. Structural bundle approximately 3.2m x 1.1m x 0.7m plus a long hat/purlin bundle.",
  }),
  buildWarehouseFeaturedSelection({
    modelCode: "W08",
    width: 8,
    length: 20,
    family: "Atlas W08 · 8m span",
    bestFor: "Longer workshops, farm utility buildings, and compact warehouse expansion space.",
    packInfo:
      "Estimated flat-packed structural bundle plus one longer hat/purlin bundle for the extended depth.",
  }),
  buildWarehouseFeaturedSelection({
    modelCode: "W10",
    width: 10,
    length: 10,
    family: "Atlas W10 · 10m span",
    bestFor: "Operational storage, wider workshop space, and covered work areas that need more width.",
    packInfo:
      "Estimated flat-packed structural and purlin bundles for collection or arranged delivery.",
  }),
  buildWarehouseFeaturedSelection({
    modelCode: "W10",
    width: 10,
    length: 20,
    family: "Atlas W10 · 10m span",
    bestFor: "Mid-range storage, equipment cover, and commercial workshop or yard support space.",
    packInfo:
      "Estimated flat-packed structural and purlin bundles for collection or arranged delivery.",
  }),
  buildWarehouseFeaturedSelection({
    modelCode: "W12",
    width: 12,
    length: 10,
    family: "Atlas W12 · 12m span",
    bestFor: "Wider warehouse and agricultural storage projects that need a stronger footprint from the start.",
    packInfo:
      "Estimated flat-packed structural and purlin bundles for collection or arranged delivery.",
  }),
  buildWarehouseFeaturedSelection({
    modelCode: "W12",
    width: 12,
    length: 20,
    family: "Atlas W12 · 12m span",
    bestFor: "Larger warehouse, commercial storage, and agricultural cover projects.",
    packInfo:
      "Estimated flat-packed structural and purlin bundles for collection or arranged delivery.",
  }),
]

export const cflcCarportSelections = cflcFeaturedSelections.filter((item) => item.family === "Carport kits")
export const cflcWarehouseSelections = cflcFeaturedSelections.filter((item) => item.family !== "Carport kits")
