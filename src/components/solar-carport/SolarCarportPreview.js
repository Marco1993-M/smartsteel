"use client"

import { Canvas } from "@react-three/fiber"
import { ContactShadows, OrbitControls } from "@react-three/drei"
import { useMemo, useRef } from "react"
import * as THREE from "three"
import ChannelGeometry from "./ChannelGeometry"
import { calculateSolarCarportGeometry } from '@/lib/atlasSolarCarportGeometry'
import {
  ATLAS_SOLAR_CARPORT_PROFILES,
  ATLAS_SOLAR_CARPORT_PURLIN_COUNT,
  ATLAS_SOLAR_CARPORT_PARKING_WIDTH_METRES,
  ATLAS_SOLAR_CARPORT_RAFTER_LENGTH_METRES,
  sectionEnvelopeMetres,
  solarCarportPurlinProfile,
} from "@/lib/atlasSolarCarportProfiles"

const STEEL = { color: "#d4dadd", metalness: 0.55, roughness: 0.38 }
const PANEL = { color: "#173b5c", metalness: 0.35, roughness: 0.2 }
const MODULE_WIDTH = ATLAS_SOLAR_CARPORT_PARKING_WIDTH_METRES
const ROOF_PITCH = THREE.MathUtils.degToRad(5)
const ROOF_DEPTH = ATLAS_SOLAR_CARPORT_RAFTER_LENGTH_METRES * Math.cos(ROOF_PITCH)
const REAR_COLUMN_HEIGHT = 2.44
const FRONT_EDGE_HEIGHT = REAR_COLUMN_HEIGHT + Math.tan(ROOF_PITCH) * (ROOF_DEPTH - 0.1)
const COLUMN_SECTION = sectionEnvelopeMetres(ATLAS_SOLAR_CARPORT_PROFILES.column)
const RAFTER_SECTION = sectionEnvelopeMetres(ATLAS_SOLAR_CARPORT_PROFILES.rafter)

function BeamBetween({ start, end, profile, roll = 0, material = STEEL }) {
  const transform = useMemo(() => {
    const from = new THREE.Vector3(...start)
    const to = new THREE.Vector3(...end)
    const direction = to.clone().sub(from)
    const midpoint = from.clone().add(to).multiplyScalar(0.5)
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      direction.clone().normalize()
    )

    return { midpoint, quaternion, length: direction.length() }
  }, [end, start])

  return (
    <mesh position={transform.midpoint} quaternion={transform.quaternion} castShadow receiveShadow>
      <ChannelGeometry profile={profile} length={transform.length} roll={roll} />
      <meshStandardMaterial {...material} />
    </mesh>
  )
}

function SolarPanel({ x, y, z, width, depth, pitchDirection = 1 }) {
  return (
    <mesh position={[x, y, z]} rotation={[pitchDirection * ROOF_PITCH, 0, 0]} castShadow receiveShadow>
      <boxGeometry args={[width, 0.045, depth]} />
      <meshStandardMaterial {...PANEL} />
    </mesh>
  )
}

function CantileverRow({ parkingCount, direction = 1, offsetZ = 0 }) {
  const structureLength = parkingCount * MODULE_WIDTH
  const schedule = calculateSolarCarportGeometry({ width: structureLength, length: 6 })
  const frameCount = schedule.frames
  const frameSpacing = schedule.frameSpacing
  const rearZ = offsetZ + direction * (ROOF_DEPTH / 2 - 0.1)
  const frontZ = offsetZ - direction * ROOF_DEPTH / 2
  const baseZ = offsetZ + direction * schedule.baseZ
  const rearRoofY = FRONT_EDGE_HEIGHT - Math.tan(ROOF_PITCH) * ROOF_DEPTH
  const roofYAt = (z) => {
    const runFromFront = direction * (z - frontZ)
    return FRONT_EDGE_HEIGHT - Math.tan(ROOF_PITCH) * runFromFront
  }
  const frontArmTopZ = offsetZ + direction * schedule.frontArmZ
  const rearArmTopZ = offsetZ + direction * schedule.rearArmZ
  const panelColumns = parkingCount * 2
  const panelRows = 3
  const panelWidth = structureLength / panelColumns - 0.045
  const panelDepth = ROOF_DEPTH / panelRows - 0.055

  return (
    <group>
      {Array.from({ length: frameCount }, (_, index) => {
        const x = -structureLength / 2 + index * frameSpacing
        const columnX = x + (index === 0 ? -1 : 1) * (RAFTER_SECTION.flange + COLUMN_SECTION.flange) / 2
        return (
          <group key={`frame-${direction}-${index}`}>
            <BeamBetween start={[columnX, 0, rearZ]} end={[columnX, REAR_COLUMN_HEIGHT, rearZ]} profile={ATLAS_SOLAR_CARPORT_PROFILES.column} roll={index === 0 ? 0 : Math.PI} />
            <BeamBetween start={[x, 0.08, baseZ]} end={[x, roofYAt(frontArmTopZ) - 0.07, frontArmTopZ]} profile={ATLAS_SOLAR_CARPORT_PROFILES.diagonalArm} roll={Math.PI / 2} />
            <BeamBetween start={[x, 0.08, baseZ]} end={[x, roofYAt(rearArmTopZ) - 0.07, rearArmTopZ]} profile={ATLAS_SOLAR_CARPORT_PROFILES.diagonalArm} roll={Math.PI / 2} />
            <BeamBetween start={[x, FRONT_EDGE_HEIGHT, frontZ]} end={[x, rearRoofY, rearZ + direction * 0.1]} profile={ATLAS_SOLAR_CARPORT_PROFILES.rafter} roll={index === frameCount - 1 ? Math.PI : 0} />
          </group>
        )
      })}

      {Array.from({ length: ATLAS_SOLAR_CARPORT_PURLIN_COUNT }, (_, index) => {
        const section = sectionEnvelopeMetres(solarCarportPurlinProfile(index))
        const edgeInset = section.flange / 2 * Math.cos(ROOF_PITCH)
        const localZ = -ROOF_DEPTH / 2 + edgeInset
          + index * (ROOF_DEPTH - 2 * edgeInset) / (ATLAS_SOLAR_CARPORT_PURLIN_COUNT - 1)
        const z = offsetZ + direction * localZ
        // Align top faces in the roof plane and cut each purlin between rafter faces.
        const y = roofYAt(z) + (RAFTER_SECTION.web - section.web) / (2 * Math.cos(ROOF_PITCH))
        return Array.from({ length: frameCount - 1 }, (_, bayIndex) => (
          <mesh
            key={`purlin-${direction}-${index}-${bayIndex}`}
            position={[-structureLength / 2 + (bayIndex + 0.5) * frameSpacing, y, z]}
            rotation={[direction * ROOF_PITCH, 0, 0]}
            castShadow
            receiveShadow
          >
            <ChannelGeometry
              profile={solarCarportPurlinProfile(index)}
              length={frameSpacing - RAFTER_SECTION.flange}
              axis="x"
              roll={(index === 0 ? direction === 1 : direction === -1) ? Math.PI : 0}
            />
            <meshStandardMaterial {...STEEL} />
          </mesh>
        ))
      })}

      {Array.from({ length: panelColumns }, (_, column) =>
        Array.from({ length: panelRows }, (_, row) => {
          const x = -structureLength / 2 + panelWidth / 2 + column * (structureLength / panelColumns)
          const localZ = -ROOF_DEPTH / 2 + panelDepth / 2 + row * (ROOF_DEPTH / panelRows)
          const z = offsetZ + direction * localZ
          return (
            <SolarPanel
              key={`panel-${direction}-${column}-${row}`}
              x={x}
              y={roofYAt(z) + (RAFTER_SECTION.web + 0.045) / (2 * Math.cos(ROOF_PITCH))}
              z={z}
              width={panelWidth}
              depth={panelDepth}
              pitchDirection={direction}
            />
          )
        })
      )}
    </group>
  )
}

function SolarCarportModel({ parkingCount, rowLength }) {
  const isDoubleRow = rowLength === 12
  const structureLength = parkingCount * MODULE_WIDTH
  const slabDepth = isDoubleRow ? ROOF_DEPTH * 2 + 1.3 : ROOF_DEPTH + 1.2
  const rearColumnOffset = ROOF_DEPTH / 2 - 0.1
  const centreGap = 0.08

  return (
    <group position={[0, -1.18, 0]} scale={Math.min(1, 8.8 / structureLength)}>
      {isDoubleRow ? (
        <>
          <CantileverRow parkingCount={parkingCount} direction={1} offsetZ={-rearColumnOffset - centreGap} />
          <CantileverRow parkingCount={parkingCount} direction={-1} offsetZ={rearColumnOffset + centreGap} />
        </>
      ) : (
        <CantileverRow parkingCount={parkingCount} />
      )}

      <mesh position={[0, -0.04, 0]} receiveShadow>
        <boxGeometry args={[structureLength + 1.1, 0.07, slabDepth]} />
        <meshStandardMaterial color="#d9dde0" roughness={0.95} />
      </mesh>
    </group>
  )
}

export default function SolarCarportPreview({ parkingCount, rowLength }) {
  const controlsRef = useRef(null)

  return (
    <div className="relative h-[270px] overflow-hidden border border-[#c1d9e5] bg-[#edf3f7] sm:h-[320px]">
      <div className="pointer-events-none absolute left-4 top-4 z-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#0043f3]">Live product preview</p>
        <p className="mt-1 text-sm font-semibold text-[#001d2e]">{parkingCount === 1 ? "Single car" : `${parkingCount} cars`} · {rowLength === 12 ? "Double row butterfly" : "Single row cantilever"}</p>
      </div>
      <button type="button" onClick={() => controlsRef.current?.reset()} className="absolute right-3 top-3 z-10 border border-[#c1d9e5] bg-white/90 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#001d2e] shadow-sm" aria-label="Reset 3D view">Reset view</button>
      <Canvas camera={{ position: [7.4, 4.6, -7.8], fov: 39 }} dpr={[1, 1.35]} performance={{ min: 0.6 }} shadows style={{ touchAction: "none" }}>
        <color attach="background" args={["#edf3f7"]} />
        <ambientLight intensity={1.35} />
        <directionalLight position={[5, 8, 6]} intensity={1.8} castShadow shadow-mapSize-width={512} shadow-mapSize-height={512} />
        <directionalLight position={[-5, 3, -4]} intensity={0.45} />
        <SolarCarportModel parkingCount={parkingCount} rowLength={rowLength} />
        <ContactShadows position={[0, -1.2, 0]} opacity={0.28} scale={14} blur={2.4} far={4} resolution={256} color="#8293a0" />
        <OrbitControls ref={controlsRef} makeDefault enablePan={false} minDistance={6} maxDistance={15} minPolarAngle={Math.PI / 5} maxPolarAngle={Math.PI / 2.05} />
      </Canvas>
      <p className="pointer-events-none absolute bottom-3 left-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#667b91]">Drag to rotate</p>
      <span className="absolute bottom-3 right-3 bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#001d2e]">ZAM steel standard</span>
    </div>
  )
}
