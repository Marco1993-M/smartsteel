import { calculateLippedChannelMassKgPerM } from "./atlasLippedChannelProfiles.js"

function profile(webMm, flangeMm, lipMm, thicknessMm) { return { code: `${webMm}x${flangeMm}x${lipMm}x${thicknessMm}`, calculatedMassKgPerM: calculateLippedChannelMassKgPerM({ webMm, flangeMm, lipMm, thicknessMm }) } }
function component(label, profileData, massKg, assembly = "Single channel") { return { label, profile: profileData, massKg, assembly, effectiveInstalledM: Number((massKg / profileData.calculatedMassKgPerM).toFixed(2)) } }

const COLUMN = profile(250, 75, 20, 2.5)
const RAFTER = profile(200, 75, 20, 2.5)
const APEX_HAUNCH = profile(175, 50, 20, 2)
const BRACING = profile(100, 50, 20, 2)
const PURLIN = profile(175, 65, 20, 2)
const GIRT = profile(150, 50, 20, 2)

export const ATLAS_W10_PRICING_BENCHMARKS = [{
  id: "w10-20x10-4-5m-2026-08", label: "W10 20m reference structure",
  source: "Estimation - CFLC 6, 8, 10 & 12m Warehouse - CFLC Warehouse - 10m Span.csv",
  widthM: 10, lengthM: 20, eaveHeightM: 4.5, baySpacingM: 4, portalFrameCount: 6,
  material: "ZAM (ZincAluMag)", materialRatePerTon: 28840, markupPercent: 40,
  totalSteelKg: 3645.5, materialCostExclVat: 105136.22, connectionCostExclVat: 16428.57,
  totalCostExclVat: 121564.79, sellingPriceExclVat: 170190.71, sellingPriceInclVat: 195719.31,
  exclusions: ["Cladding", "Installation labour", "Transport"],
  components: [
    component("Main columns", COLUMN, 840, "Two channels back-to-back"), component("Gable columns", COLUMN, 171),
    component("Rafters", RAFTER, 512), component("Apex and haunch", APEX_HAUNCH, 128),
    component("Vertical and roof bay bracing", BRACING, 205.5), component("Purlins", PURLIN, 830),
    component("Girts", GIRT, 691), component("Gable girts", GIRT, 268),
  ],
}]

export function getAtlasW10PrimaryBenchmark() { return ATLAS_W10_PRICING_BENCHMARKS[0] }
