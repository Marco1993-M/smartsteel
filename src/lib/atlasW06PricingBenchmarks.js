import { calculateLippedChannelMassKgPerM } from "./atlasLippedChannelProfiles.js"

function profile(webMm, flangeMm, lipMm, thicknessMm) {
  return { code: `${webMm}x${flangeMm}x${lipMm}x${thicknessMm}`, calculatedMassKgPerM: calculateLippedChannelMassKgPerM({ webMm, flangeMm, lipMm, thicknessMm }) }
}

function component(label, profileData, massKg, assembly = "Single channel") {
  return { label, profile: profileData, massKg, assembly, effectiveInstalledM: Number((massKg / profileData.calculatedMassKgPerM).toFixed(2)) }
}

const PRIMARY = profile(175, 75, 20, 2)
const BRACING = profile(100, 50, 20, 2)
const PURLIN = profile(175, 65, 20, 2)
const SIDE_GIRT = profile(125, 50, 20, 2)
const GABLE_GIRT = profile(150, 50, 20, 2)

export const ATLAS_W06_PRICING_BENCHMARKS = [{
  id: "w06-20x6-4-5m-2026-08", label: "W06 20m reference structure",
  source: "Estimation - CFLC 6, 8, 10 & 12m Warehouse - CFLC Warehouse - 6m Span.csv",
  widthM: 6, lengthM: 20, eaveHeightM: 4.5, baySpacingM: 4, portalFrameCount: 6,
  material: "ZAM (ZincAluMag)", materialRatePerTon: 28840, markupPercent: 40,
  totalSteelKg: 2491.5, materialCostExclVat: 71854.86, connectionCostExclVat: 16428.57,
  totalCostExclVat: 88283.43, sellingPriceExclVat: 123596.8, sellingPriceInclVat: 142136.32,
  exclusions: ["Cladding", "Installation labour", "Transport"],
  components: [
    component("Main columns", PRIMARY, 546, "Two channels back-to-back"),
    component("Gable columns", PRIMARY, 143), component("Rafters", PRIMARY, 254),
    component("Vertical and roof bay bracing", BRACING, 142.5), component("Purlins", PURLIN, 622),
    component("Girts", SIDE_GIRT, 628), component("Gable girts", GABLE_GIRT, 156),
  ],
}]

export function getAtlasW06PrimaryBenchmark() { return ATLAS_W06_PRICING_BENCHMARKS[0] }
