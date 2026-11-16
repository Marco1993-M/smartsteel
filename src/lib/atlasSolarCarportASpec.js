import {
  ATLAS_SOLAR_CARPORT_PARKING_WIDTH_METRES,
  ATLAS_SOLAR_CARPORT_PROFILES,
  ATLAS_SOLAR_CARPORT_PURLIN_COUNT,
  ATLAS_SOLAR_CARPORT_RAFTER_LENGTH_METRES,
} from "./atlasSolarCarportProfiles.js"
import { calculateLippedChannelMassKgPerM } from "./atlasLippedChannelProfiles.js"

export const A_SPEC_SPLICE_SELL_PRICE = 150
export const A_SPEC_MAX_BAYS = 10

// Internal planning schedule. Connection and footing details require approval.
export function buildSolarCarportASpecDraft(bays) {
  if (!Number.isInteger(bays) || bays < 1 || bays > A_SPEC_MAX_BAYS) {
    throw new RangeError("Choose between 1 and 10 bays.")
  }

  const frames = bays + 1
  const bayWidth = ATLAS_SOLAR_CARPORT_PARKING_WIDTH_METRES * 2
  const rafterLength = ATLAS_SOLAR_CARPORT_RAFTER_LENGTH_METRES
  const lowHeight = 2.7
  const pitch = 5
  const highHeight = lowHeight + rafterLength * Math.sin(pitch * Math.PI / 180)
  const { column, rafter, purlin } = ATLAS_SOLAR_CARPORT_PROFILES
  const members = [
    ["Low-side columns", column, frames, lowHeight],
    ["High-side columns", column, frames, highHeight],
    ["Rafters", rafter, frames, rafterLength],
    ["Perimeter purlins", rafter, bays * 2, bayWidth],
    ["Internal purlins", purlin, bays * (ATLAS_SOLAR_CARPORT_PURLIN_COUNT - 2), bayWidth],
  ].map(([label, profile, quantity, nominalLength]) => ({
    label, profile: profile.section, quantity, nominalLength,
    massKg: calculateLippedChannelMassKgPerM(profile) * quantity * nominalLength,
  }))
  const spliceCount = (bays - 1) * ATLAS_SOLAR_CARPORT_PURLIN_COUNT
  return {
    width: bays * bayWidth,
    depth: rafterLength,
    pitch,
    columnCount: frames * 2,
    members,
    steelKg: members.reduce((total, member) => total + member.massKg, 0),
    spliceCount,
    spliceSellTotal: spliceCount * A_SPEC_SPLICE_SELL_PRICE,
  }
}
