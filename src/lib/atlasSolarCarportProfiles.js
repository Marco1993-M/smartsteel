export const ATLAS_SOLAR_CARPORT_PURLIN_COUNT = 6
export const ATLAS_SOLAR_CARPORT_PARKING_WIDTH_METRES = 2.75
export const ATLAS_SOLAR_CARPORT_RAFTER_LENGTH_METRES = 6

export const ATLAS_SOLAR_CARPORT_PROFILES = {
  column: {
    label: "Post / column",
    section: "150x50x20x2mm",
    webMm: 150,
    flangeMm: 50,
    lipMm: 20,
    thicknessMm: 2,
    status: "confirmed",
  },
  rafter: {
    label: "Rafter",
    section: "175x50x20x2mm",
    webMm: 175,
    flangeMm: 50,
    lipMm: 20,
    thicknessMm: 2,
    status: "confirmed",
  },
  purlin: {
    label: "Purlin",
    section: "150x50x20x2mm",
    webMm: 150,
    flangeMm: 50,
    lipMm: 20,
    thicknessMm: 2,
    status: "confirmed",
  },
  diagonalArm: {
    label: "Diagonal arm",
    section: "150x50x20x2mm",
    webMm: 150,
    flangeMm: 50,
    lipMm: 20,
    thicknessMm: 2,
    status: "confirmed",
  },
}

export function sectionEnvelopeMetres(profile) {
  return {
    web: profile.webMm / 1000,
    flange: profile.flangeMm / 1000,
  }
}

// End purlins close the perimeter using the same section as the rafters.
export function solarCarportPurlinProfile(index) {
  return index === 0 || index === ATLAS_SOLAR_CARPORT_PURLIN_COUNT - 1
    ? ATLAS_SOLAR_CARPORT_PROFILES.rafter
    : ATLAS_SOLAR_CARPORT_PROFILES.purlin
}
