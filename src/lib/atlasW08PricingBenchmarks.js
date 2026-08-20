import { calculateLippedChannelMassKgPerM } from "./atlasLippedChannelProfiles.js"

function profile(webMm, flangeMm, lipMm, thicknessMm) {
  return {
    code: `${webMm}x${flangeMm}x${lipMm}x${thicknessMm}`,
    webMm,
    flangeMm,
    lipMm,
    thicknessMm,
    calculatedMassKgPerM: calculateLippedChannelMassKgPerM({
      webMm,
      flangeMm,
      lipMm,
      thicknessMm,
    }),
  }
}

function component(label, profileData, massKg, assembly = "Single channel") {
  return {
    label,
    profile: profileData,
    massKg,
    assembly,
    effectiveInstalledM: Number((massKg / profileData.calculatedMassKgPerM).toFixed(2)),
  }
}

const W08_COLUMN_PROFILE = profile(200, 75, 20, 2)
const W08_RAFTER_PROFILE = profile(200, 75, 20, 2.5)
const W08_BRACING_PROFILE = profile(100, 50, 20, 2)
const W08_PURLIN_PROFILE = profile(175, 65, 20, 2)
const W08_GIRT_PROFILE = profile(150, 50, 20, 2)

export const ATLAS_W08_PRICING_BENCHMARKS = [
  {
    id: "w08-20x8-3m-2026-08",
    label: "W08 20m reference structure",
    source: "Estimation - CFLC 6, 8, 10 & 12m Warehouse - CFLC Warehouse - 8m Span.csv",
    widthM: 8,
    lengthM: 20,
    eaveHeightM: 3,
    baySpacingM: 4,
    portalFrameCount: 5,
    material: "ZAM (ZincAluMag)",
    materialRatePerTon: 28840,
    markupPercent: 40,
    totalSteelKg: 2819,
    materialCostExclVat: 81299.96,
    connectionCostExclVat: 16428.57,
    totalCostExclVat: 97728.53,
    sellingPriceExclVat: 136819.94,
    sellingPriceInclVat: 157342.94,
    exclusions: ["Cladding", "Installation labour", "Transport"],
    components: [
      component("Main columns", W08_COLUMN_PROFILE, 588, "Two channels back-to-back"),
      component("Gable columns", W08_COLUMN_PROFILE, 147),
      component("Rafters", W08_RAFTER_PROFILE, 363),
      component("Vertical and roof bay bracing", W08_BRACING_PROFILE, 196),
      component("Purlins", W08_PURLIN_PROFILE, 622),
      component("Girts", W08_GIRT_PROFILE, 691),
      component("Gable girts", W08_GIRT_PROFILE, 212),
    ],
  },
]

export function getAtlasW08PrimaryBenchmark() {
  return ATLAS_W08_PRICING_BENCHMARKS[0]
}
