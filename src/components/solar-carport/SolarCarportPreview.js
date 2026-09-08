"use client"

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { ContactShadows, Html, OrbitControls } from "@react-three/drei"
import { useEffect, useMemo, useRef, useState } from "react"
import * as THREE from "three"
import Atlas3DViewerShell from "../atlas/Atlas3DViewerShell"
import ChannelGeometry from "./ChannelGeometry"
import { calculateSolarCarportGeometry } from 'lib/atlasSolarCarportGeometry'
import {
  ATLAS_SOLAR_CARPORT_PROFILES,
  ATLAS_SOLAR_CARPORT_PURLIN_COUNT,
  ATLAS_SOLAR_CARPORT_PARKING_WIDTH_METRES,
  ATLAS_SOLAR_CARPORT_RAFTER_LENGTH_METRES,
  sectionEnvelopeMetres,
  solarCarportPurlinProfile,
} from "lib/atlasSolarCarportProfiles"

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

function CameraRig({ position, target, controlsRef }) {
  const { camera } = useThree()
  const movingRef = useRef(true)
  const destination = useMemo(() => new THREE.Vector3(...position), [position])
  const targetDestination = useMemo(() => new THREE.Vector3(...target), [target])

  useEffect(() => {
    movingRef.current = true
  }, [destination, targetDestination])

  useFrame(() => {
    if (!movingRef.current) return
    camera.position.lerp(destination, 0.1)
    controlsRef.current?.target.lerp(targetDestination, 0.1)
    controlsRef.current?.update()
    if (camera.position.distanceTo(destination) < 0.02) movingRef.current = false
  })

  return null
}

function CantileverRow({ parkingCount, direction = 1, offsetZ = 0, structureView = false }) {
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

      {!structureView && Array.from({ length: panelColumns }, (_, column) =>
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

function SolarCarportModel({ parkingCount, rowLength, structureView, modelScale = 1, positionZ = 0, label, selected, onSelect }) {
  const isDoubleRow = rowLength === 12
  const structureLength = parkingCount * MODULE_WIDTH
  const slabDepth = isDoubleRow ? ROOF_DEPTH * 2 + 1.3 : ROOF_DEPTH + 1.2
  const rearColumnOffset = ROOF_DEPTH / 2 - 0.1
  const centreGap = 0.08

  return (
    <group
      position={[0, -1.18, positionZ]}
      scale={modelScale}
      onClick={(event) => {
        event.stopPropagation()
        onSelect?.()
      }}
      onPointerOver={() => { document.body.style.cursor = "pointer" }}
      onPointerOut={() => { document.body.style.cursor = "default" }}
    >
      {isDoubleRow ? (
        <>
          <CantileverRow parkingCount={parkingCount} direction={1} offsetZ={-rearColumnOffset - centreGap} structureView={structureView} />
          <CantileverRow parkingCount={parkingCount} direction={-1} offsetZ={rearColumnOffset + centreGap} structureView={structureView} />
        </>
      ) : (
        <CantileverRow parkingCount={parkingCount} structureView={structureView} />
      )}

      <mesh position={[0, -0.04, 0]} receiveShadow>
        <boxGeometry args={[structureLength + 1.1, 0.07, slabDepth]} />
        <meshStandardMaterial color="#d9dde0" roughness={0.95} />
      </mesh>
      {selected ? (
        <mesh position={[0, 1.3, 0]}>
          <boxGeometry args={[structureLength + 0.5, 3.4, slabDepth + 0.35]} />
          <meshBasicMaterial color="#0043f3" transparent opacity={0.08} depthWrite={false} />
        </mesh>
      ) : null}
      <Html position={[0, 3.25, 0]} center distanceFactor={8} style={{ pointerEvents: "none" }}>
        <span className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] shadow-sm ${selected ? "border-[#0043f3] bg-[#0043f3] text-white" : "border-slate-200 bg-white/95 text-[#001d2e]"}`}>
          {label}
        </span>
      </Html>
    </group>
  )
}

export default function SolarCarportPreview({ parkingCount, rowLength, parkingRuns, selectedRunId, onSelectRun }) {
  const controlsRef = useRef(null)
  const [cameraView, setCameraView] = useState("overview")
  const runs = parkingRuns?.length ? parkingRuns : [{ parkingCount, length: rowLength }]
  const maxStructureLength = Math.max(...runs.map((run) => run.parkingCount * MODULE_WIDTH))
  const modelScale = Math.min(1, 8.8 / maxStructureLength)
  // Planning clearance between parallel parking runs; site layouts remain subject to review.
  const runGap = 7.5
  const runDepths = runs.map((run) => Number(run.length) === 12 ? ROOF_DEPTH * 2 + 0.4 : ROOF_DEPTH)
  const totalDepth = runDepths.reduce((sum, depth) => sum + depth, 0) + Math.max(0, runs.length - 1) * runGap
  const runOffsets = runDepths.map((depth, index) => {
    const before = runDepths.slice(0, index).reduce((sum, item) => sum + item, 0) + index * runGap
    return -totalDepth / 2 + before + depth / 2
  })
  const displayWidth = maxStructureLength * modelScale
  const displayDepth = totalDepth * modelScale
  const cameraDistance = Math.max(7.4, Math.sqrt(displayWidth ** 2 + displayDepth ** 2) * 1.02)
  const cameraPositions = useMemo(() => ({
    overview: [cameraDistance * 0.72, cameraDistance * 0.46, -cameraDistance * 0.78],
    structure: [-cameraDistance * 0.7, cameraDistance * 0.42, -cameraDistance * 0.72],
    front: [0, cameraDistance * 0.3, -cameraDistance],
    side: [cameraDistance, cameraDistance * 0.32, 0],
  }), [cameraDistance])
  const orbitTarget = [0, -0.05, 0]
  const totalSpaces = runs.reduce((sum, run) => sum + run.parkingCount * (Number(run.length) === 12 ? 2 : 1), 0)
  const configurationLabel = runs.length === 1
    ? `${totalSpaces === 1 ? "Single car" : `${totalSpaces} cars`} · ${Number(runs[0].length) === 12 ? "Double row butterfly" : "Single row cantilever"}`
    : `${runs.length} parking runs · ${totalSpaces} spaces`
  const description = `Interactive 3D model of an Atlas ${configurationLabel.toLowerCase()} solar carport in ZAM steel. Use the view controls or drag to rotate.`

  const resetView = () => {
    setCameraView("overview")
    controlsRef.current?.reset()
  }

  return (
    <Atlas3DViewerShell
      title="Live Atlas configuration"
      subtitle={configurationLabel}
      badge="ZAM steel"
      description={description}
      views={[
        { value: "overview", label: "Overview" },
        { value: "structure", label: "Structure" },
        { value: "front", label: "Front" },
        { value: "side", label: "Side" },
      ]}
      activeView={cameraView}
      onViewChange={setCameraView}
      onReset={resetView}
    >
      <Canvas camera={{ position: [7.4, 4.6, -7.8], fov: 39 }} dpr={[1, 1.35]} performance={{ min: 0.6 }} shadows style={{ touchAction: "none" }}>
        <color attach="background" args={["#edf3f7"]} />
        <ambientLight intensity={1.35} />
        <directionalLight position={[5, 8, 6]} intensity={1.8} castShadow shadow-mapSize-width={512} shadow-mapSize-height={512} />
        <directionalLight position={[-5, 3, -4]} intensity={0.45} />
        <CameraRig position={cameraPositions[cameraView]} target={orbitTarget} controlsRef={controlsRef} />
        {runs.map((run, index) => (
          <SolarCarportModel
            key={run.id || index}
            parkingCount={run.parkingCount}
            rowLength={run.length}
            structureView={cameraView === "structure"}
            modelScale={modelScale}
            positionZ={runOffsets[index] * modelScale}
            label={`Run ${String.fromCharCode(65 + index)}`}
            selected={run.id === selectedRunId}
            onSelect={() => onSelectRun?.(run.id)}
          />
        ))}
        <ContactShadows position={[0, -1.2, 0]} opacity={0.28} scale={Math.max(14, displayDepth * 1.3)} blur={2.4} far={4} resolution={256} color="#8293a0" />
        <OrbitControls ref={controlsRef} makeDefault enablePan={false} target={orbitTarget} minDistance={5.5} maxDistance={cameraDistance * 1.7} minPolarAngle={Math.PI / 5} maxPolarAngle={Math.PI / 2.05} />
      </Canvas>
    </Atlas3DViewerShell>
  )
}
