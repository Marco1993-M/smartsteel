"use client"

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { ContactShadows, Html, OrbitControls } from "@react-three/drei"
import { useEffect, useMemo, useRef, useState } from "react"
import * as THREE from "three"
import Atlas3DViewerShell from "../atlas/Atlas3DViewerShell"
import ChannelGeometry from "../solar-carport/ChannelGeometry"
import { GROUND_MOUNT_BAY_WIDTH_METERS } from "../../lib/estimates/solarEstimate"

const PANEL_WIDTH = 1.13
const PANEL_DEPTH = 2.28
const PANEL_COLUMN_GAP = 0.02
const PANEL_ROW_GAP = 0.03
const BAY_WIDTH = GROUND_MOUNT_BAY_WIDTH_METERS
const SLOPE_LENGTH = PANEL_DEPTH * 2 + PANEL_ROW_GAP
const ROW_DEPTH = SLOPE_LENGTH * Math.cos(THREE.MathUtils.degToRad(15))
const ROW_GAP = 2
const TILT = THREE.MathUtils.degToRad(15)
const FRONT_POST_HEIGHT = 0.6
const REAR_POST_HEIGHT = FRONT_POST_HEIGHT + SLOPE_LENGTH * Math.sin(TILT)
const STEEL = { color: "#d4dadd", metalness: 0.58, roughness: 0.36 }
const PANEL = { color: "#12395d", metalness: 0.35, roughness: 0.22 }
const PROFILES = {
  post: { webMm: 75, flangeMm: 50, lipMm: 20, thicknessMm: 2 },
  rafter: { webMm: 100, flangeMm: 50, lipMm: 20, thicknessMm: 2 },
  purlin: { webMm: 75, flangeMm: 50, lipMm: 20, thicknessMm: 2 },
}
const PURLIN_SLOPE_POSITIONS = [0.2, PANEL_DEPTH - 0.2, PANEL_DEPTH + PANEL_ROW_GAP + 0.2, SLOPE_LENGTH - 0.2]

function BeamBetween({ start, end, profile, roll = 0 }) {
  const transform = useMemo(() => {
    const from = new THREE.Vector3(...start)
    const to = new THREE.Vector3(...end)
    const direction = to.clone().sub(from)
    return {
      midpoint: from.clone().add(to).multiplyScalar(0.5),
      quaternion: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize()),
      length: direction.length(),
    }
  }, [end, start])

  return (
    <mesh position={transform.midpoint} quaternion={transform.quaternion} castShadow receiveShadow>
      <ChannelGeometry profile={profile} length={transform.length} roll={roll} />
      <meshStandardMaterial {...STEEL} />
    </mesh>
  )
}

function CameraRig({ position, target, controlsRef }) {
  const { camera } = useThree()
  const destination = useMemo(() => new THREE.Vector3(...position), [position])
  const targetDestination = useMemo(() => new THREE.Vector3(...target), [target])
  const moving = useRef(true)

  useEffect(() => { moving.current = true }, [destination, targetDestination])
  useFrame(() => {
    if (!moving.current) return
    camera.position.lerp(destination, 0.1)
    controlsRef.current?.target.lerp(targetDestination, 0.1)
    controlsRef.current?.update()
    if (camera.position.distanceTo(destination) < 0.02) moving.current = false
  })
  return null
}

function GroundMountArray({ layouts, selectedRunId, onSelectRun, structureView }) {
  const rows = layouts.slice(0, 6).flatMap((layout, runIndex) => {
    const displayedRows = Math.min(layout.rows, 2)
    const panelsRemaining = Math.min(layout.pricedPanelCount, displayedRows * 60)
    return Array.from({ length: displayedRows }, (_, rowIndex) => {
      const panels = Math.min(60, Math.max(0, panelsRemaining - rowIndex * 60))
      return { id: layout.id, runIndex, rowIndex, bays: Math.ceil(panels / 6), panels }
    })
  }).filter((row) => row.panels > 0)
  const totalDepth = rows.length * ROW_DEPTH + Math.max(0, rows.length - 1) * ROW_GAP

  return (
    <group position={[0, -1.1, 0]}>
      {rows.map((row, displayIndex) => {
        const width = row.bays * BAY_WIDTH
        const zOffset = -totalDepth / 2 + ROW_DEPTH / 2 + displayIndex * (ROW_DEPTH + ROW_GAP)
        const isSelected = row.id === selectedRunId
        const frontZ = -ROW_DEPTH / 2
        const rearZ = ROW_DEPTH / 2
        return (
          <group key={`${row.id}-${row.rowIndex}`} position={[0, 0, zOffset]} onClick={(event) => { event.stopPropagation(); onSelectRun?.(row.id) }}>
            {row.rowIndex === 0 ? (
              <Html position={[-width / 2, 2.6, -2.4]} center distanceFactor={12}>
                <button type="button" onClick={() => onSelectRun?.(row.id)} className={`whitespace-nowrap rounded-full border px-3 py-1 text-[10px] font-bold shadow-sm ${isSelected ? "border-[#0043f3] bg-[#0043f3] text-white" : "border-slate-200 bg-white text-[#001d2e]"}`}>Run {String.fromCharCode(65 + row.runIndex)}</button>
              </Html>
            ) : null}
            {Array.from({ length: row.bays + 1 }, (_, frameIndex) => {
              const x = -width / 2 + frameIndex * BAY_WIDTH
              return (
                <group key={frameIndex} position={[x, 0, 0]}>
                  <BeamBetween start={[0, 0, frontZ]} end={[0, FRONT_POST_HEIGHT, frontZ]} profile={PROFILES.post} roll={frameIndex === row.bays ? Math.PI : 0} />
                  <BeamBetween start={[0, 0, rearZ]} end={[0, REAR_POST_HEIGHT, rearZ]} profile={PROFILES.post} roll={frameIndex === row.bays ? Math.PI : 0} />
                  <BeamBetween start={[0, FRONT_POST_HEIGHT, frontZ]} end={[0, REAR_POST_HEIGHT, rearZ]} profile={PROFILES.rafter} roll={frameIndex === row.bays ? Math.PI : 0} />
                </group>
              )
            })}
            {PURLIN_SLOPE_POSITIONS.map((slopePosition, purlinIndex) => {
              const z = frontZ + slopePosition * Math.cos(TILT)
              const y = FRONT_POST_HEIGHT + slopePosition * Math.sin(TILT) + 0.055
              return Array.from({ length: row.bays }, (_, bayIndex) => (
                <mesh key={`purlin-${purlinIndex}-${bayIndex}`} position={[-width / 2 + (bayIndex + 0.5) * BAY_WIDTH, y, z]} rotation={[-TILT, 0, 0]} castShadow receiveShadow>
                  <ChannelGeometry profile={PROFILES.purlin} length={BAY_WIDTH - 0.05} axis="x" roll={purlinIndex < 2 ? 0 : Math.PI} />
                  <meshStandardMaterial {...STEEL} />
                </mesh>
              ))
            })}
            {!structureView && Array.from({ length: row.bays }, (_, bayIndex) =>
              Array.from({ length: 3 }, (_, column) =>
                Array.from({ length: 2 }, (_, panelRow) => {
                  const x = -width / 2 + bayIndex * BAY_WIDTH + PANEL_WIDTH / 2 + column * (PANEL_WIDTH + PANEL_COLUMN_GAP)
                  const slopePosition = PANEL_DEPTH / 2 + panelRow * (PANEL_DEPTH + PANEL_ROW_GAP)
                  const z = frontZ + slopePosition * Math.cos(TILT)
                  const y = FRONT_POST_HEIGHT + slopePosition * Math.sin(TILT) + 0.105
                  return (
                    <mesh key={`panel-${bayIndex}-${column}-${panelRow}`} position={[x, y, z]} rotation={[-TILT, 0, 0]} castShadow receiveShadow>
                      <boxGeometry args={[PANEL_WIDTH, 0.045, PANEL_DEPTH]} />
                      <meshStandardMaterial {...PANEL} />
                    </mesh>
                  )
                })
              )
            )}
            <mesh position={[0, -0.04, 0]} receiveShadow><boxGeometry args={[width + 0.7, 0.06, ROW_DEPTH]} /><meshStandardMaterial color={isSelected ? "#dbe8ff" : "#dce2e5"} roughness={0.96} /></mesh>
          </group>
        )
      })}
    </group>
  )
}

export default function GroundMountPreview({ layouts, selectedRunId, onSelectRun }) {
  const controlsRef = useRef(null)
  const [view, setView] = useState("overview")
  const safeLayouts = layouts?.length ? layouts : []
  const displayRows = Math.min(safeLayouts.reduce((total, layout) => total + layout.rows, 0), 6)
  const width = Math.min(Math.max(...safeLayouts.map((layout) => layout.width), 2.4), 24)
  const depth = displayRows * ROW_DEPTH + Math.max(0, displayRows - 1) * ROW_GAP
  const distance = Math.max(8, Math.sqrt(width ** 2 + depth ** 2) * 0.86)
  const positions = useMemo(() => ({
    overview: [distance * 0.72, distance * 0.52, -distance * 0.78],
    structure: [-distance * 0.7, distance * 0.46, -distance * 0.72],
    front: [0, distance * 0.28, -distance],
    side: [distance, distance * 0.3, 0],
  }), [distance])
  const totalPanels = safeLayouts.reduce((total, layout) => total + layout.requestedPanels, 0)
  const totalBays = safeLayouts.reduce((total, layout) => total + layout.bayCount, 0)
  const subtitle = `${totalPanels} panels · ${totalBays} bays · ${safeLayouts.length} run${safeLayouts.length === 1 ? "" : "s"}`

  return (
    <Atlas3DViewerShell
      title="Live Atlas configuration"
      subtitle={subtitle}
      badge="Indicative 3D"
      description="Representative Atlas ground-mount layout generated from the selected panel count. Final member and connection detailing remains subject to project review."
      views={[{ value: "overview", label: "Overview" }, { value: "structure", label: "Structure" }, { value: "front", label: "Front" }, { value: "side", label: "Side" }]}
      activeView={view}
      onViewChange={setView}
      onReset={() => { setView("overview"); controlsRef.current?.reset() }}
    >
      <Canvas camera={{ position: [8, 5, -9], fov: 40 }} dpr={[1, 1.35]} performance={{ min: 0.6 }} shadows style={{ touchAction: "none" }}>
        <color attach="background" args={["#edf3f7"]} />
        <ambientLight intensity={1.35} />
        <directionalLight position={[6, 9, 5]} intensity={1.8} castShadow shadow-mapSize-width={512} shadow-mapSize-height={512} />
        <directionalLight position={[-4, 3, -5]} intensity={0.4} />
        <CameraRig position={positions[view]} target={[0, -0.05, 0]} controlsRef={controlsRef} />
        <GroundMountArray layouts={safeLayouts} selectedRunId={selectedRunId} onSelectRun={onSelectRun} structureView={view === "structure"} />
        <ContactShadows position={[0, -1.15, 0]} opacity={0.25} scale={Math.max(14, width, depth)} blur={2.4} far={4} resolution={256} color="#8293a0" />
        <OrbitControls ref={controlsRef} makeDefault enablePan={false} target={[0, -0.05, 0]} minDistance={5} maxDistance={distance * 1.8} minPolarAngle={Math.PI / 5} maxPolarAngle={Math.PI / 2.05} />
      </Canvas>
    </Atlas3DViewerShell>
  )
}
