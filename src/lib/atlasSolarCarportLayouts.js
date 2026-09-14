import { ATLAS_SOLAR_CARPORT_PARKING_WIDTH_METRES } from "./atlasSolarCarportProfiles.js"

export const ATLAS_SOLAR_CARPORT_PARKING_COUNTS = Object.freeze([
  1, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20,
])
export const ATLAS_SOLAR_CARPORT_ROW_LENGTHS = Object.freeze([6, 12])
export const ATLAS_SOLAR_CARPORT_PANELS_PER_BAY_SIDE = 6

export function getAtlasSolarCarportWidth(parkingCount) {
  return Number(parkingCount) * ATLAS_SOLAR_CARPORT_PARKING_WIDTH_METRES
}

export function getAtlasSolarCarportPanelCount(width, length) {
  const parkingBaysPerSide = Number(width) / ATLAS_SOLAR_CARPORT_PARKING_WIDTH_METRES
  const cantileverSides = Number(length) / 6

  if (
    !ATLAS_SOLAR_CARPORT_PARKING_COUNTS.includes(parkingBaysPerSide) ||
    ![1, 2].includes(cantileverSides)
  ) return 0

  return Math.round(parkingBaysPerSide * ATLAS_SOLAR_CARPORT_PANELS_PER_BAY_SIDE * cantileverSides)
}
