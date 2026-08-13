import { calculateLippedChannelMassKgPerM } from "./atlasLippedChannelProfiles.js"

function profile(webMm, flangeMm, lipMm, thicknessMm) { return { code: `${webMm}x${flangeMm}x${lipMm}x${thicknessMm}`, calculatedMassKgPerM: calculateLippedChannelMassKgPerM({ webMm, flangeMm, lipMm, thicknessMm }) } }
function component(label, profileData, massKg, assembly = "Single channel") { return { label, profile: profileData, massKg, assembly, effectiveInstalledM: Number((massKg / profileData.calculatedMassKgPerM).toFixed(2)) } }

const MAIN_COLUMN = profile(250, 75, 20, 2.5)
const GABLE_COLUMN = profile(300, 75, 20, 2.5)
const RAFTER = profile(300, 75, 20, 2.5)
const APEX_HAUNCH = profile(150, 50, 20, 2)
const BRACING = profile(100, 50, 20, 2)
const PURLIN = profile(175, 65, 20, 2)
const GIRT = profile(150, 50, 20, 2)

export const ATLAS_W12_PRICING_BENCHMARKS = [{
  id: "w12-40x12-5m-2026-08", label: "W12 40m reference structure",
  source: "Estimation - CFLC 6, 8, 10 & 12m Warehouse - CFLC Warehouse - 12m Span.csv",
  widthM: 12, lengthM: 40, eaveHeightM: 5, baySpacingM: 4, portalFrameCount: 11,
  material: "Mild steel", materialRatePerTon: 21000, alternateZamRatePerTon: 28840, markupPercent: 40,
  totalSteelKg: 7344.3, materialCostExclVat: 154229.83, connectionCostExclVat: 32857.14,
  totalCostExclVat: 187086.98, sellingPriceExclVat: 261921.77, sellingPriceInclVat: 301210.03,
  exclusions: ["Cladding", "Installation labour", "Transport"],
  components: [
    component("Main columns", MAIN_COLUMN, 1711.1, "Two channels back-to-back"), component("Gable columns", GABLE_COLUMN, 171),
    component("Rafters", RAFTER, 1266.8), component("Apex and haunch", APEX_HAUNCH, 293.3),
    component("Vertical and roof bay bracing", BRACING, 523), component("Purlins", PURLIN, 1660),
    component("Girts", GIRT, 1382), component("Gable girts", GIRT, 337),
  ],
}]

export function getAtlasW12PrimaryBenchmark() { return ATLAS_W12_PRICING_BENCHMARKS[0] }
