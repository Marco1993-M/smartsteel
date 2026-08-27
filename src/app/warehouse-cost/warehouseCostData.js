import { ATLAS_LENGTH_OPTIONS } from "../../lib/atlasConfiguration.js"
import { calculateAtlasWarehouseEstimate } from "../../lib/estimates/atlasWarehouseEstimate.js"

const SITE_URL = "https://www.smartsteel.co.za"
const AVAILABLE_WIDTHS = [8, 10, 12]
// Preserve every established search URL while Atlas maps the searched length
// to a released 4m production module.
const SEARCH_LENGTHS = Array.from({ length: 19 }, (_, index) => 5 + index * 2.5)
const FINISHES = ["ZAM", "Galv", "Mild"]
const SCOPES = [
  { key: "structure_only", label: "Structure only", description: "Atlas frame, purlins, bracing and connection hardware." },
  { key: "roof_only", label: "Roof sheeted", description: "Atlas structure with galvanised IBR roof sheeting." },
  { key: "fully_enclosed", label: "Roof and walls sheeted", description: "Atlas structure with galvanised IBR roof and wall sheeting." },
]

const formatDimension = (value) => `${Number.isInteger(value) ? value : value.toFixed(1)}m`
const formatArea = (value) => `${Number.isInteger(value) ? value : value.toFixed(1)} m²`
export const formatWarehouseCurrency = (value) => `R ${Math.round(value).toLocaleString("en-ZA")}`

function parseWarehouseSlug(slug) {
  const match = /^(\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)$/.exec(slug)
  if (!match) return null
  const length = Number(match[1])
  const width = Number(match[2])
  if (!AVAILABLE_WIDTHS.includes(width) || !SEARCH_LENGTHS.includes(length)) return null
  return { length, width }
}

function getAtlasLengths(targetLength) {
  const lower = [...ATLAS_LENGTH_OPTIONS].reverse().find((length) => length <= targetLength) ?? ATLAS_LENGTH_OPTIONS[0]
  const upper = ATLAS_LENGTH_OPTIONS.find((length) => length >= targetLength) ?? ATLAS_LENGTH_OPTIONS.at(-1)
  return [...new Set([lower, upper])]
}

function getDefaultHeight(width) {
  return width >= 10 ? 4.5 : 3
}

function buildBuilderUrl({ width, length, wallHeight, steelFinish, gableMode }) {
  const params = new URLSearchParams({
    productType: "LCSS Warehouse",
    width: String(width),
    length: String(length),
    wallHeight: String(wallHeight),
    steelFinish,
    gableMode,
    sheetingProfile: "IBR",
    sheetingFinish: "galvanised",
  })
  return `/warehouse-builder?${params.toString()}`
}

function buildAtlasOption(width, length) {
  const wallHeight = getDefaultHeight(width)
  const prices = Object.fromEntries(FINISHES.map((finish) => [finish, Object.fromEntries(SCOPES.map((scope) => {
    const estimate = calculateAtlasWarehouseEstimate({ width, length, wallHeight, steelFinish: finish, gableMode: scope.key, sheetingProfile: "IBR", sheetingFinish: "galvanised" })
    return [scope.key, {
      total: estimate.pricing.estimatedTotal,
      label: formatWarehouseCurrency(estimate.pricing.estimatedTotal),
      url: buildBuilderUrl({ width, length, wallHeight, steelFinish: finish, gableMode: scope.key }),
    }]
  }))]))

  return { width, length, wallHeight, area: width * length, areaLabel: formatArea(width * length), productCode: `W${String(width).padStart(2, "0")}`, prices }
}

function getUseCase(area) {
  if (area >= 350) return ["bulk storage", "agricultural operations", "distribution and logistics"]
  if (area >= 200) return ["commercial storage", "fleet and equipment cover", "industrial workshops"]
  if (area >= 100) return ["growing business storage", "trade workshops", "agricultural storage"]
  return ["secure storage", "small workshops", "farm equipment cover"]
}

export function getWarehouseCostPageConfig(slug) {
  const parsed = parseWarehouseSlug(slug)
  if (!parsed) return null

  const searchedArea = parsed.width * parsed.length
  const atlasOptions = getAtlasLengths(parsed.length).map((length) => buildAtlasOption(parsed.width, length))
  const recommendedIndex = atlasOptions.reduce((bestIndex, option, index) => {
    const best = atlasOptions[bestIndex]
    const optionDistance = Math.abs(option.length - parsed.length)
    const bestDistance = Math.abs(best.length - parsed.length)
    return optionDistance < bestDistance || (optionDistance === bestDistance && option.length > best.length) ? index : bestIndex
  }, 0)
  const displaySize = `${formatDimension(parsed.length)} x ${formatDimension(parsed.width)}`
  const path = `/warehouse-cost/${slug}`
  const exactModule = atlasOptions.length === 1 && atlasOptions[0].length === parsed.length
  const recommended = atlasOptions[recommendedIndex]

  return {
    ...parsed,
    slug,
    path,
    fullUrl: `${SITE_URL}${path}`,
    displaySize,
    altSize: `${parsed.width}x${parsed.length}`,
    searchedArea,
    areaLabel: formatArea(searchedArea),
    atlasOptions,
    recommendedIndex,
    exactModule,
    scopes: SCOPES,
    finishes: FINISHES,
    bestFor: getUseCase(searchedArea),
    faqs: [
      {
        q: `How much does a ${displaySize} Atlas warehouse cost?`,
        a: exactModule
          ? `The current ${recommended.productCode} ${recommended.length}m structure-only guide starts at ${recommended.prices.ZAM.structure_only.label} excl. VAT in ZAM steel. Roof and wall sheeting can be added in the live builder.`
          : `Atlas warehouses use 4m modular bays. The closest standard options to ${displaySize} are ${atlasOptions.map((option) => `${option.length}m x ${option.width}m`).join(" and ")}. Current supply-only prices are shown on this page and update by scope and steel finish.`,
      },
      { q: `Why is a ${parsed.length}m Atlas warehouse shown as a different length?`, a: "The searched size is retained as a useful planning target, while Atlas production lengths follow 4m bays. We show the nearest standard option and, where useful, the next size on either side." },
      { q: "What is included in the online Atlas warehouse price?", a: "The guide is supply only and excludes VAT. Structure pricing includes the selected Atlas frame members, purlins, bracing and priced connection hardware. Sheeting is included only when a sheeted option is selected." },
      { q: "Are installation and delivery included?", a: "No. Delivery and installation are reviewed separately because distance, access, ground conditions and project scope can materially change those costs." },
    ],
  }
}

export function buildWarehouseCostMetadata(slug) {
  const config = getWarehouseCostPageConfig(slug)
  if (!config) return {}
  const title = `${config.displaySize} Atlas Warehouse Cost South Africa | Smart Steel`
  const description = `Plan a ${config.displaySize} warehouse with current Atlas modular pricing. Compare structure-only, roof-sheeted and enclosed options in ZAM, galvanised or mild steel.`
  return {
    title,
    description,
    keywords: [`${config.displaySize} warehouse cost`, `${config.altSize} warehouse cost`, `${config.displaySize} steel warehouse price`, "Atlas warehouse price", "steel warehouse cost South Africa", "lip channel warehouse price"],
    alternates: { canonical: config.path },
    openGraph: { title, description, url: config.fullUrl, siteName: "Smart Steel", locale: "en_ZA", type: "article", images: [{ url: "/og-warehouse.jpg", width: 1200, height: 630, alt: `${config.displaySize} Atlas warehouse cost guide` }] },
    twitter: { card: "summary_large_image", title, description, images: ["/og-warehouse.jpg"] },
  }
}

export function getWarehouseCostSlugs() {
  return SEARCH_LENGTHS.flatMap((length) => AVAILABLE_WIDTHS.map((width) => `${length}x${width}`))
}
