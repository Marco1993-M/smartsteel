const BOLT_SIZES = [
  [12, 30],
  [12, 40],
  [12, 50],
  [16, 30],
  [16, 40],
  [16, 50],
]

const DIAMETER_SPEC = {
  12: {
    threadPitchMm: 1.75,
    driveSizeMm: 19,
  },
  16: {
    threadPitchMm: 2,
    driveSizeMm: 24,
  },
}

export const ATLAS_BOLT_OPTIONS = BOLT_SIZES.map(([diameterMm, lengthMm]) => {
  const diameterSpec = DIAMETER_SPEC[diameterMm]
  const code = `ATL-BLT-M${diameterMm}-${lengthMm}`
  return {
    id: code.toLowerCase(),
    code,
    label: `M${diameterMm} × ${lengthMm} mm`,
    fastenerType: "bolt",
    diameterMm,
    lengthMm,
    propertyClass: "8.8",
    threadType: "Metric coarse",
    threadPitchMm: diameterSpec.threadPitchMm,
    headType: "Hexagonal head",
    driveSizeMm: diameterSpec.driveSizeMm,
    finishSpec: "Zinc plated, blue/clear passivated",
    corrosionClass: "Moderate indoor corrosion protection",
    matchingNut: `M${diameterMm} hex nut, Property Class 8`,
    matchingWasher: `M${diameterMm} flat washer`,
    availabilityStatus: "confirmed",
    applicationStatus: "needs_exterior_review",
    sourceLabel: "Smart Steel standard bolt schedule supplied 30 July 2026",
  }
})

export function normalizeAtlasFastener(row) {
  return {
    id: row.id,
    code: row.code,
    label: row.label,
    fastenerType: row.fastener_type,
    diameterMm: Number(row.diameter_mm),
    lengthMm: Number(row.length_mm),
    propertyClass: row.property_class,
    threadType: row.thread_type,
    threadPitchMm: Number(row.thread_pitch_mm),
    headType: row.head_type,
    driveSizeMm: Number(row.drive_size_mm),
    finishSpec: row.finish_spec,
    corrosionClass: row.corrosion_class,
    matchingNut: row.matching_nut,
    matchingWasher: row.matching_washer,
    availabilityStatus: row.availability_status,
    applicationStatus: row.application_status,
    sourceLabel: row.source_label || "",
  }
}

export function formatBoltSpecification(bolt) {
  if (!bolt) return ""
  return `${bolt.label}; Property Class ${bolt.propertyClass}; ${bolt.threadType} ${bolt.threadPitchMm}mm pitch; ${bolt.headType}, ${bolt.driveSizeMm}mm across flats`
}
