const BASE_PROFILE_SIZES = [
  [75, 50, 20],
  [100, 50, 20],
  [125, 50, 20],
  [100, 75, 20],
  [125, 75, 20],
  [150, 75, 20],
  [175, 65, 20],
  [175, 75, 20],
  [200, 75, 20],
  [225, 75, 20],
  [250, 75, 20],
  [275, 75, 20],
  [300, 75, 20],
]

const THICKNESSES = [2, 2.5, 3]

const CONFIRMED_PROFILE_CODES = new Set([
  "75x50x20x2",
  "75x50x20x2.5",
  "100x50x20x2",
  "100x50x20x2.5",
  "125x50x20x2",
  "100x75x20x2",
  "100x75x20x2.5",
  "125x75x20x2",
  "125x75x20x2.5",
  "125x75x20x3",
  "150x75x20x2",
  "150x75x20x2.5",
  "150x75x20x3",
  "175x65x20x2",
  "175x75x20x2",
  "175x75x20x2.5",
  "175x75x20x3",
  "200x75x20x2",
  "200x75x20x2.5",
  "200x75x20x3",
  "225x75x20x2.5",
  "225x75x20x3",
  "250x75x20x2.5",
  "250x75x20x3",
  "275x75x20x3",
  "300x75x20x3",
])

export function calculateLippedChannelMassKgPerM({
  webMm,
  flangeMm,
  lipMm,
  thicknessMm,
}) {
  const developedWidthMm = webMm + flangeMm * 2 + lipMm * 2
  return Number((developedWidthMm * thicknessMm * 0.00785).toFixed(4))
}

function formatDimension(value) {
  return Number.isInteger(value) ? String(value) : String(value).replace(".", ",")
}

export const ATLAS_LIPPED_CHANNEL_PROFILES = BASE_PROFILE_SIZES.flatMap(
  ([webMm, flangeMm, lipMm]) =>
    THICKNESSES.map((thicknessMm) => {
      const code = `${webMm}x${flangeMm}x${lipMm}x${thicknessMm}`
      return {
        id: `atlas-lc-${code.replaceAll(".", "-")}`,
        code,
        label: `${webMm} × ${flangeMm} × ${lipMm} × ${formatDimension(thicknessMm)} mm`,
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
        verifiedMassKgPerM: null,
        availabilityStatus: CONFIRMED_PROFILE_CODES.has(code) ? "confirmed" : "assumed",
        sourceLabel: "Supplier standard-size table supplied 30 July 2026",
      }
    })
)

export function normalizeAtlasProfile(row) {
  return {
    id: row.id,
    code: row.code,
    label: row.label,
    webMm: Number(row.web_mm),
    flangeMm: Number(row.flange_mm),
    lipMm: Number(row.lip_mm),
    thicknessMm: Number(row.thickness_mm),
    calculatedMassKgPerM: Number(row.calculated_mass_kg_per_m),
    verifiedMassKgPerM:
      row.verified_mass_kg_per_m === null ? null : Number(row.verified_mass_kg_per_m),
    availabilityStatus: row.availability_status,
    sourceLabel: row.source_label || "",
    updatedAt: row.updated_at,
  }
}

export function effectiveProfileMass(profile) {
  return profile?.verifiedMassKgPerM ?? profile?.calculatedMassKgPerM ?? null
}

export function matchLippedChannelProfile(value, profiles = ATLAS_LIPPED_CHANNEL_PROFILES) {
  const dimensions = String(value || "")
    .replaceAll(",", ".")
    .match(/\d+(?:\.\d+)?/g)
    ?.slice(0, 4)
    .map(Number)

  if (dimensions?.length !== 4) return null
  return (
    profiles.find(
      (profile) =>
        profile.webMm === dimensions[0] &&
        profile.flangeMm === dimensions[1] &&
        profile.lipMm === dimensions[2] &&
        profile.thicknessMm === dimensions[3]
    ) || null
  )
}
