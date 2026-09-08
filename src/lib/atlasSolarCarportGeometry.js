import { ATLAS_SOLAR_CARPORT_PROFILES as profiles, ATLAS_SOLAR_CARPORT_PARKING_WIDTH_METRES as parkingWidth, ATLAS_SOLAR_CARPORT_RAFTER_LENGTH_METRES as rafterLength } from './atlasSolarCarportProfiles.js'
import { calculateLippedChannelMassKgPerM } from './atlasLippedChannelProfiles.js'

export function calculateSolarCarportGeometry({ width = 5.5, length = 6 } = {}) {
  const cars = Number(width) / parkingWidth
  if (![1, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20].includes(cars) || ![6, 12].includes(Number(length))) throw new Error('Choose a supported Atlas parking layout.')
  const pitch = 5 * Math.PI / 180
  const depth = rafterLength * Math.cos(pitch)
  const rearColumnHeight = 2.44
  const frontHeight = rearColumnHeight + Math.tan(pitch) * (depth - 0.1)
  const rearZ = depth / 2 - 0.1
  const baseZ = rearZ - 3.23
  const roofYAt = z => frontHeight - Math.tan(pitch) * (z + depth / 2)
  const armRise = roofYAt(baseZ) - 0.07 - 0.08
  const armSlope = Math.tan(Math.PI / 3)
  const frontRun = armRise / (armSlope - Math.tan(pitch))
  const rearRun = armRise / (armSlope + Math.tan(pitch))
  const bays = Math.ceil(cars / 2)
  const frames = bays + 1
  const rows = Number(length) === 12 ? 2 : 1
  const frameSpacing = Number(width) / bays
  const purlinLength = frameSpacing - profiles.rafter.flangeMm / 1000
  const member = (code, label, profile, quantity, cutLengthM) => {
    const massKgPerM = calculateLippedChannelMassKgPerM(profile)
    return { code, label, profile, quantity: quantity * rows, cutLengthM, massKgPerM, totalLengthM: quantity * rows * cutLengthM, totalMassKg: quantity * rows * cutLengthM * massKgPerM }
  }
  const members = [
    member('SC-COL', 'Columns', profiles.column, frames, rearColumnHeight),
    member('SC-ARM-F', 'Front diagonal arms', profiles.diagonalArm, frames, frontRun / Math.cos(Math.PI / 3)),
    member('SC-ARM-R', 'Rear diagonal arms', profiles.diagonalArm, frames, rearRun / Math.cos(Math.PI / 3)),
    member('SC-RAF', 'Rafters', profiles.rafter, frames, rafterLength),
    member('SC-PER', 'Front and rear perimeter purlins', profiles.rafter, 2 * bays, purlinLength),
    member('SC-PUR', 'Internal purlins', profiles.purlin, 4 * bays, purlinLength),
  ]
  const connection = (code, label, quantity, basis) => ({ code, label, quantity, unit: 'each', basis, status: 'provisional' })
  const baseBrackets = frames * rows
  const armBrackets = frames * rows * 2
  const purlinBrackets = bays * rows * 6 * 2
  const connections = [
    connection('SC-BRK-BASE', 'Column anchoring brackets', baseBrackets, `${frames} frames × ${rows} row(s)`),
    connection('SC-BRK-ARM', 'Diagonal-arm connection brackets', armBrackets, `${frames} frames × 2 arms × ${rows} row(s)`),
    connection('SC-BRK-PUR', 'Purlin connection brackets', purlinBrackets, `${bays * rows * 6} purlin lengths × 2 ends`),
    connection('SC-ANC', 'Foundation anchor bolts', baseBrackets * 4, `${baseBrackets} anchoring brackets × 4 anchors`),
    connection('SC-BLT', 'Complete connection bolt sets', armBrackets * 2 + purlinBrackets, `${armBrackets} arm brackets × 2 plus ${purlinBrackets} purlin brackets × 1`),
  ]
  return { cars, rows, bays, frames, frameSpacing, depth, pitch, frontHeight, rearColumnHeight, rearZ, baseZ, frontArmZ: baseZ - frontRun, rearArmZ: baseZ + rearRun, members, connections, totalSteelKg: members.reduce((sum, m) => sum + m.totalMassKg, 0) }
}
