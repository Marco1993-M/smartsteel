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

export const ATLAS_SOLAR_CARPORT_AISLE_METRES = 7.5

const round = (value) => Math.round(value * 100) / 100

export function getAtlasSolarCarportRunCorners(run) {
  const halfWidth = Number(run.width) / 2
  const halfLength = Number(run.length) / 2
  const radians = Number(run.rotationDeg || 0) * Math.PI / 180
  const cosine = Math.cos(radians)
  const sine = Math.sin(radians)
  return [[-halfWidth, -halfLength], [halfWidth, -halfLength], [halfWidth, halfLength], [-halfWidth, halfLength]]
    .map(([x, z]) => ({ x: Number(run.x) + x * cosine - z * sine, z: Number(run.z) + x * sine + z * cosine }))
}

function bounds(corners) {
  return {
    minX: Math.min(...corners.map((corner) => corner.x)), maxX: Math.max(...corners.map((corner) => corner.x)),
    minZ: Math.min(...corners.map((corner) => corner.z)), maxZ: Math.max(...corners.map((corner) => corner.z)),
  }
}

function pointToSegmentDistance(point, start, end) {
  const dx = end.x - start.x
  const dz = end.z - start.z
  const fraction = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.z - start.z) * dz) / (dx * dx + dz * dz)))
  return Math.hypot(point.x - start.x - fraction * dx, point.z - start.z - fraction * dz)
}

function polygonsOverlap(first, second) {
  for (const polygon of [first, second]) {
    for (let index = 0; index < polygon.length; index += 1) {
      const start = polygon[index]
      const end = polygon[(index + 1) % polygon.length]
      const axis = { x: -(end.z - start.z), z: end.x - start.x }
      const projected = (corners) => corners.map((corner) => corner.x * axis.x + corner.z * axis.z)
      const a = projected(first)
      const b = projected(second)
      if (Math.max(...a) < Math.min(...b) || Math.max(...b) < Math.min(...a)) return false
    }
  }
  return true
}

export function getAtlasSolarCarportClearance(firstRun, secondRun) {
  const first = getAtlasSolarCarportRunCorners(firstRun)
  const second = getAtlasSolarCarportRunCorners(secondRun)
  if (polygonsOverlap(first, second)) return 0
  let distance = Infinity
  for (const [points, edges] of [[first, second], [second, first]]) {
    for (const point of points) {
      for (let index = 0; index < edges.length; index += 1) {
        distance = Math.min(distance, pointToSegmentDistance(point, edges[index], edges[(index + 1) % edges.length]))
      }
    }
  }
  return distance
}

export function isAtlasSolarCarportLayoutValid(runs) {
  return runs.every((run, index) =>
    Number.isFinite(Number(run.x)) && Number.isFinite(Number(run.z)) && Number.isFinite(Number(run.rotationDeg ?? 0))
    && Number(run.width) > 0 && Number(run.length) > 0
    && Math.abs(Number(run.x)) <= 500 && Math.abs(Number(run.z)) <= 500
    && runs.slice(index + 1).every((other) => getAtlasSolarCarportClearance(run, other) >= ATLAS_SOLAR_CARPORT_AISLE_METRES - 0.01)
  )
}

export function placeAtlasSolarCarportRun(existingRuns, run) {
  if (!existingRuns.length) return { ...run, x: 0, z: 0, rotationDeg: 0 }
  const current = getAtlasSolarCarportSiteLayout(existingRuns)
  const placed = { ...run, x: 0, z: round(current.maxZ + ATLAS_SOLAR_CARPORT_AISLE_METRES + Number(run.length) / 2), rotationDeg: 0 }
  while (!isAtlasSolarCarportLayoutValid([...existingRuns, placed])) placed.z = round(placed.z + 1)
  return placed
}

// Migrate older saved plans, whose runs only contained width and length.
export function normalizeAtlasSolarCarportRuns(runs) {
  return runs.reduce((placed, run) => {
    const hasPosition = Number.isFinite(Number(run.x)) && Number.isFinite(Number(run.z)) && run.x != null && run.z != null
    const candidate = hasPosition ? { ...run, x: Number(run.x), z: Number(run.z), rotationDeg: Number(run.rotationDeg ?? 0) } : placeAtlasSolarCarportRun(placed, run)
    placed.push(isAtlasSolarCarportLayoutValid([...placed, candidate]) ? candidate : placeAtlasSolarCarportRun(placed, run))
    return placed
  }, [])
}

// Nominal parking envelopes, distinct from roof projection and slab extents.
export function getAtlasSolarCarportSiteLayout(runs) {
  const positionedRuns = normalizeAtlasSolarCarportRuns(runs)
  if (!positionedRuns.length) return { width: 0, depth: 0, minX: 0, minZ: 0, maxX: 0, maxZ: 0, aisle: ATLAS_SOLAR_CARPORT_AISLE_METRES, runs: [] }
  const extents = positionedRuns.map((run) => bounds(getAtlasSolarCarportRunCorners(run)))
  const minX = Math.min(...extents.map((box) => box.minX))
  const maxX = Math.max(...extents.map((box) => box.maxX))
  const minZ = Math.min(...extents.map((box) => box.minZ))
  const maxZ = Math.max(...extents.map((box) => box.maxZ))
  return { width: round(maxX - minX), depth: round(maxZ - minZ), minX, minZ, maxX, maxZ, aisle: ATLAS_SOLAR_CARPORT_AISLE_METRES, runs: positionedRuns }
}
