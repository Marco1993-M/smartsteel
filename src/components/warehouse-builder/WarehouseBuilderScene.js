"use client"

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { ContactShadows, OrbitControls } from "@react-three/drei"
import { RotateCw } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { DoubleSide, Path, Shape, Vector3 } from "three"
import { WAREHOUSE_SHEETING_COLORS } from "../../lib/warehouseBuilderStore"

function getOpeningPositions(total, span, kind) {
  if (total <= 0) return []
  const usableSpan = span * (kind === "personnel" ? 0.76 : 0.68)
  if (total === 1) return [kind === "personnel" ? span * 0.32 : 0]
  return Array.from({ length: total }, (_, index) => -usableSpan / 2 + (index * usableSpan) / (total - 1))
}

function createWallShape({ span, height, garagePositions, pedestrianPositions, garageWidth }) {
  const shape = new Shape()
  shape.moveTo(-span / 2, 0)
  shape.lineTo(span / 2, 0)
  shape.lineTo(span / 2, height)
  shape.lineTo(-span / 2, height)
  shape.closePath()

  garagePositions.forEach((position) => {
    const hole = new Path()
    const halfWidth = Math.min(garageWidth, span * 0.72) / 2
    const openingHeight = height * 0.72
    hole.moveTo(position - halfWidth, 0)
    hole.lineTo(position + halfWidth, 0)
    hole.lineTo(position + halfWidth, openingHeight)
    hole.lineTo(position - halfWidth, openingHeight)
    hole.closePath()
    shape.holes.push(hole)
  })

  pedestrianPositions.forEach((position) => {
    const hole = new Path()
    const halfWidth = 0.18 / 2
    const openingHeight = height * 0.54
    hole.moveTo(position - halfWidth, 0)
    hole.lineTo(position + halfWidth, 0)
    hole.lineTo(position + halfWidth, openingHeight)
    hole.lineTo(position - halfWidth, openingHeight)
    hole.closePath()
    shape.holes.push(hole)
  })

  return shape
}

function CameraRig({ position, target, controlsRef }) {
  const { camera } = useThree()
  const movingRef = useRef(true)
  const destination = useMemo(() => new Vector3(...position), [position])
  const targetDestination = useMemo(() => new Vector3(...target), [target])

  useEffect(() => {
    movingRef.current = true
  }, [destination, targetDestination])

  useFrame(() => {
    if (!movingRef.current) return
    camera.position.lerp(destination, 0.09)
    controlsRef.current?.target.lerp(targetDestination, 0.09)
    controlsRef.current?.update()

    if (camera.position.distanceTo(destination) < 0.015 && (!controlsRef.current || controlsRef.current.target.distanceTo(targetDestination) < 0.015)) {
      camera.position.copy(destination)
      controlsRef.current?.target.copy(targetDestination)
      movingRef.current = false
    }
  })

  return null
}

function WarehouseMesh({
  systemVariant = "lsf",
  width,
  length,
  wallHeight,
  roofPitch,
  cladding,
  enclosureType,
  rollerDoorCount,
  garageDoorOpeningType,
  pedestrianDoorCount,
  rollerDoorFace = "front",
  pedestrianDoorFace = "rear",
  sheetingColor = "kalahari-red",
  structureView = false,
}) {
  const scale = 0.18
  const w = width * scale
  const l = length * scale
  const h = wallHeight * scale
  const ridgeRise = Math.tan((roofPitch * Math.PI) / 180) * (w / 2)
  const isAtlas = systemVariant === "atlas"
  const baySpacing = isAtlas ? 4 : 2.5
  const frameCount = Math.max(2, Math.round(length / baySpacing) + 1)

  const framePositions = useMemo(() => {
    const step = frameCount === 1 ? 0 : l / (frameCount - 1)
    return Array.from({ length: frameCount }, (_, index) => -l / 2 + index * step)
  }, [frameCount, l])
  const bracedBayIndices = useMemo(() => {
    const totalBays = Math.max(frameCount - 1, 1)

    if (isAtlas) {
      return Array.from({ length: totalBays }, (_, bayIndex) => bayIndex).filter((bayIndex) => bayIndex % 4 === 0)
    }

    if (totalBays <= 4) {
      return [Math.max(0, Math.floor(totalBays / 2) - 1 + (totalBays % 2 === 0 ? 0 : 1))]
    }

    const indices = []
    for (let bayIndex = 3; bayIndex < totalBays; bayIndex += 4) {
      indices.push(bayIndex)
    }

    return indices.length > 0 ? indices : [0]
  }, [frameCount, isAtlas])

  const garageDoorOpeningWidth =
    garageDoorOpeningType === "double" ? 5 * scale : garageDoorOpeningType === "custom" ? 4 * scale : 2.5 * scale

  const gableShape = useMemo(() => {
    const shape = new Shape()
    shape.moveTo(-w / 2, 0)
    shape.lineTo(0, ridgeRise)
    shape.lineTo(w / 2, 0)
    shape.closePath()
    return shape
  }, [ridgeRise, w])
  const wallShapes = useMemo(() => {
    const build = (face, span) => createWallShape({
      span,
      height: h,
      garagePositions: rollerDoorFace === face ? getOpeningPositions(rollerDoorCount, span, "garage") : [],
      pedestrianPositions: pedestrianDoorFace === face ? getOpeningPositions(pedestrianDoorCount, span, "personnel") : [],
      garageWidth: garageDoorOpeningWidth,
    })
    return {
      front: build("front", w),
      rear: build("rear", w),
      left: build("left", l),
      right: build("right", l),
    }
  }, [garageDoorOpeningWidth, h, l, pedestrianDoorCount, pedestrianDoorFace, rollerDoorCount, rollerDoorFace, w])
  const selectedSheetingColor = WAREHOUSE_SHEETING_COLORS.find((option) => option.value === sheetingColor)
  const roofColor = selectedSheetingColor?.hex || (isAtlas ? "#6689a3" : "#b91c1c")
  const wallColor = roofColor
  const steelColor = "#707d8f"
  const roofHalfSpan = Math.sqrt((w / 2) ** 2 + ridgeRise ** 2)
  const roofAngle = Math.atan2(ridgeRise, w / 2)
  const hasCladding = cladding !== "None" && !structureView
  const columnThickness = 0.042
  const rafterThickness = 0.028
  const roofSheetThickness = 0.018
  const ridgeThickness = 0.022
  const wallSheetThickness = 0.022
  const braceThickness = 0.018
  const secondaryMemberThickness = 0.022
  const secondaryMemberDepth = 0.035
  const sheetingClearance = 0.018
  const roofSecondaryOffset = isAtlas ? rafterThickness / 2 + secondaryMemberDepth / 2 : 0
  const wallSecondaryOffset = isAtlas ? columnThickness / 2 + secondaryMemberDepth / 2 : 0
  const roofSheetOffset = rafterThickness / 2 + (isAtlas ? secondaryMemberDepth : 0) + sheetingClearance + roofSheetThickness / 2
  const wallSheetOffset = columnThickness / 2 + (isAtlas ? secondaryMemberDepth : 0) + sheetingClearance + wallSheetThickness / 2

  const concreteMaterialProps = {
    color: "#d9e1e8",
    roughness: 0.96,
    metalness: 0.02,
  }

  const slabMaterialProps = {
    color: "#eef3f7",
    roughness: 0.9,
    metalness: 0.01,
  }

  const frameMaterialProps = {
    color: steelColor,
    metalness: 0.72,
    roughness: 0.34,
  }

  const braceMaterialProps = {
    color: "#97a6b8",
    metalness: 0.58,
    roughness: 0.4,
  }

  const roofMaterialProps = {
    color: roofColor,
    metalness: 0.44,
    roughness: 0.42,
    clearcoat: 0.18,
    clearcoatRoughness: 0.4,
  }

  const wallMaterialProps = {
    color: wallColor,
    metalness: 0.22,
    roughness: 0.58,
    clearcoat: 0.08,
    clearcoatRoughness: 0.48,
  }

  const ridgeMaterialProps = {
    color: isAtlas ? "#315b78" : "#7f1d1d",
    metalness: 0.4,
    roughness: 0.44,
    clearcoat: 0.16,
    clearcoatRoughness: 0.38,
  }

  return (
    <group position={[0, -0.55, 0]}>
      <mesh position={[0, -0.035, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[9, 9]} />
        <meshPhysicalMaterial {...concreteMaterialProps} />
      </mesh>

      <mesh position={[0, 0.016, 0]} receiveShadow>
        <boxGeometry args={[w + 0.25, 0.032, l + 0.25]} />
        <meshPhysicalMaterial {...slabMaterialProps} />
      </mesh>

      {framePositions.map((z) => (
        <group key={z} position={[0, 0, z]}>
          <mesh position={[-w / 2, h / 2, 0]} castShadow>
            <boxGeometry args={[columnThickness, h, columnThickness]} />
            <meshPhysicalMaterial {...frameMaterialProps} />
          </mesh>
          <mesh position={[w / 2, h / 2, 0]} castShadow>
            <boxGeometry args={[columnThickness, h, columnThickness]} />
            <meshPhysicalMaterial {...frameMaterialProps} />
          </mesh>
          <mesh
            position={[-w / 4, h + ridgeRise / 2, 0]}
            rotation={[0, 0, roofAngle]}
            castShadow
          >
            <boxGeometry args={[roofHalfSpan, rafterThickness, rafterThickness]} />
            <meshPhysicalMaterial {...frameMaterialProps} />
          </mesh>
          <mesh
            position={[w / 4, h + ridgeRise / 2, 0]}
            rotation={[0, 0, -roofAngle]}
            castShadow
          >
            <boxGeometry args={[roofHalfSpan, rafterThickness, rafterThickness]} />
            <meshPhysicalMaterial {...frameMaterialProps} />
          </mesh>
          <mesh position={[0, h + ridgeRise, 0]} castShadow>
            <boxGeometry args={[rafterThickness * 1.1, rafterThickness * 1.1, rafterThickness * 1.1]} />
            <meshPhysicalMaterial {...frameMaterialProps} />
          </mesh>
        </group>
      ))}

      {isAtlas ? framePositions.slice(0, -1).map((startZ, bayIndex) => {
        const endZ = framePositions[bayIndex + 1]
        const bayDepth = Math.abs(endZ - startZ)
        const bayCenterZ = (startZ + endZ) / 2

        return (
          <group key={`secondary-members-${bayIndex}`}>
            {[0.08, 0.5, 0.92].flatMap((fraction) => {
              const xDistanceFromRidge = (w / 2) * fraction
              const roofY = h + ridgeRise * (1 - fraction)

              return [-1, 1].map((side) => (
                <mesh
                  key={`purlin-${bayIndex}-${fraction}-${side}`}
                  position={[side * xDistanceFromRidge, roofY + roofSecondaryOffset, bayCenterZ]}
                  castShadow
                >
                  <boxGeometry args={[secondaryMemberThickness, secondaryMemberDepth, bayDepth]} />
                  <meshPhysicalMaterial {...frameMaterialProps} />
                </mesh>
              ))
            })}

            {(enclosureType === "fully_enclosed" || enclosureType === "side_walls") ? [0.08, 0.5, 0.92].flatMap((fraction) => [-1, 1].map((side) => (
              <mesh
                key={`girt-${bayIndex}-${fraction}-${side}`}
                position={[side * (w / 2 + wallSecondaryOffset), h * fraction, bayCenterZ]}
                castShadow
              >
                <boxGeometry args={[secondaryMemberDepth, secondaryMemberThickness, bayDepth]} />
                <meshPhysicalMaterial {...frameMaterialProps} />
              </mesh>
            ))) : null}
          </group>
        )
      }) : null}

      {bracedBayIndices.map((bayIndex) => {
        const startZ = framePositions[bayIndex]
        const endZ = framePositions[Math.min(bayIndex + 1, framePositions.length - 1)]
        const bayCenterZ = (startZ + endZ) / 2
        const bayDepth = Math.abs(endZ - startZ)
        const braceLength = Math.sqrt(h ** 2 + bayDepth ** 2)
        const braceAngle = Math.atan2(h, bayDepth)

        return (
          <group key={`brace-${bayIndex}`} position={[0, 0, bayCenterZ]}>
            {[-w / 2, w / 2].map((x) => (
              <group key={`brace-side-${bayIndex}-${x}`} position={[x, 0, 0]}>
                <mesh
                  position={[0, h / 2, 0]}
                  rotation={[braceAngle, 0, 0]}
                  castShadow
                >
                  <boxGeometry args={[braceThickness, braceThickness, braceLength]} />
                  <meshPhysicalMaterial {...braceMaterialProps} />
                </mesh>
                <mesh
                  position={[0, h / 2, 0]}
                  rotation={[-braceAngle, 0, 0]}
                  castShadow
                >
                  <boxGeometry args={[braceThickness, braceThickness, braceLength]} />
                  <meshPhysicalMaterial {...braceMaterialProps} />
                </mesh>
              </group>
            ))}
          </group>
        )
      })}

      {hasCladding ? (
        <>
          <group position={[-w / 4, h + ridgeRise / 2, 0]} rotation={[0, 0, roofAngle]}>
            <mesh position={[0, roofSheetOffset, 0]} receiveShadow>
              <boxGeometry args={[roofHalfSpan + 0.08, roofSheetThickness, l + 0.12]} />
              <meshPhysicalMaterial {...roofMaterialProps} />
            </mesh>
          </group>
          <group position={[w / 4, h + ridgeRise / 2, 0]} rotation={[0, 0, -roofAngle]}>
            <mesh position={[0, roofSheetOffset, 0]} receiveShadow>
              <boxGeometry args={[roofHalfSpan + 0.08, roofSheetThickness, l + 0.12]} />
              <meshPhysicalMaterial {...roofMaterialProps} />
            </mesh>
          </group>
          <mesh position={[0, h + ridgeRise + roofSheetOffset, 0]} receiveShadow>
            <boxGeometry args={[0.045, ridgeThickness, l + 0.08]} />
            <meshPhysicalMaterial {...ridgeMaterialProps} />
          </mesh>
        </>
      ) : null}

      {hasCladding && enclosureType === "fully_enclosed" ? (
        <>
          <mesh position={[0, 0, -l / 2 - wallSheetOffset]} receiveShadow>
            <shapeGeometry args={[wallShapes.front]} />
            <meshPhysicalMaterial {...wallMaterialProps} side={DoubleSide} />
          </mesh>
          <mesh position={[0, 0, l / 2 + wallSheetOffset]} receiveShadow>
            <shapeGeometry args={[wallShapes.rear]} />
            <meshPhysicalMaterial {...wallMaterialProps} side={DoubleSide} />
          </mesh>
          <mesh position={[-w / 2 - wallSheetOffset, 0, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
            <shapeGeometry args={[wallShapes.left]} />
            <meshPhysicalMaterial {...wallMaterialProps} side={DoubleSide} />
          </mesh>
          <mesh position={[w / 2 + wallSheetOffset, 0, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
            <shapeGeometry args={[wallShapes.right]} />
            <meshPhysicalMaterial {...wallMaterialProps} side={DoubleSide} />
          </mesh>
          <mesh position={[0, h, -l / 2 - wallSheetOffset]} receiveShadow>
            <shapeGeometry args={[gableShape]} />
            <meshPhysicalMaterial {...wallMaterialProps} side={DoubleSide} />
          </mesh>
          <mesh
            position={[0, h, l / 2 + wallSheetOffset]}
            rotation={[0, Math.PI, 0]}
            receiveShadow
          >
            <shapeGeometry args={[gableShape]} />
            <meshPhysicalMaterial {...wallMaterialProps} side={DoubleSide} />
          </mesh>
        </>
      ) : null}

      {hasCladding && (enclosureType === "open_sides" || enclosureType === "side_walls") ? (
        <>
          <mesh position={[-w / 2 - wallSheetOffset, 0, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
            <shapeGeometry args={[wallShapes.left]} />
            <meshPhysicalMaterial {...wallMaterialProps} side={DoubleSide} />
          </mesh>
          <mesh position={[w / 2 + wallSheetOffset, 0, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
            <shapeGeometry args={[wallShapes.right]} />
            <meshPhysicalMaterial {...wallMaterialProps} side={DoubleSide} />
          </mesh>
        </>
      ) : null}

    </group>
  )
}

export default function WarehouseBuilderScene(props) {
  const { width, length, wallHeight, className = "", printReady = false } = props
  const [hasInteracted, setHasInteracted] = useState(false)
  const [cameraView, setCameraView] = useState("exterior")
  const [sceneVisible, setSceneVisible] = useState(true)
  const controlsRef = useRef(null)
  const previousSystemRef = useRef(props.systemVariant)
  const scale = 0.18
  const w = width * scale
  const l = length * scale
  const h = wallHeight * scale
  const cameraPositions = useMemo(() => {
    const diagonal = Math.sqrt(w ** 2 + l ** 2)
    const distance = Math.max(4.4, diagonal * 1.18)
    return {
      exterior: [distance * 0.7, Math.max(2.6, h * 2.15), distance * 0.84],
      structure: [-distance * 0.62, Math.max(2.25, h * 1.8), distance * 0.72],
      front: [0, Math.max(1.7, h * 1.35), distance],
    }
  }, [h, l, w])
  const orbitTarget = useMemo(() => [0, Math.max(0.3, h * 0.58), 0], [h])
  const cameraPosition = cameraPositions[cameraView]
  const minDistance = Math.max(3.4, Math.sqrt(w ** 2 + l ** 2) * 0.62)
  const maxDistance = Math.max(8.5, Math.sqrt(w ** 2 + l ** 2) * 1.55)

  useEffect(() => {
    if (previousSystemRef.current === props.systemVariant) return
    previousSystemRef.current = props.systemVariant
    setSceneVisible(false)
    setCameraView("exterior")
    const timeoutId = window.setTimeout(() => setSceneVisible(true), 90)
    return () => window.clearTimeout(timeoutId)
  }, [props.systemVariant])

  return (
    <div className={`relative h-[min(46vh,320px)] w-full touch-none overflow-hidden rounded-[2rem] border border-slate-200 bg-[radial-gradient(circle_at_top,_#ffffff_0%,_#edf3f8_58%,_#d8e2eb_100%)] shadow-inner sm:h-[460px] lg:h-[640px] ${className}`}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(255,255,255,0))]" />
      {!printReady ? <div
        className={`pointer-events-none absolute right-4 top-4 z-10 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/85 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600 shadow-sm backdrop-blur transition-all duration-500 ${
          hasInteracted ? "translate-y-[-0.5rem] opacity-0" : "translate-y-0 opacity-100"
        }`}
      >
        <RotateCw className="h-3.5 w-3.5" />
        Drag to rotate
      </div> : null}
      {!printReady ? <div className="absolute left-3 top-3 z-20 flex overflow-hidden rounded-full border border-white/70 bg-white/88 p-1 shadow-sm backdrop-blur sm:left-4 sm:top-4">
        {[
          ["exterior", "Exterior"],
          ["structure", "Structure"],
          ["front", "Front"],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setCameraView(value)
              setHasInteracted(true)
            }}
            className={`rounded-full px-2.5 py-1.5 text-[10px] font-semibold transition sm:px-3 sm:text-[11px] ${cameraView === value ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-white"}`}
          >
            {label}
          </button>
        ))}
      </div> : null}
      {!printReady ? <div className="pointer-events-none absolute bottom-4 left-4 z-10 hidden rounded-full border border-white/70 bg-white/85 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600 shadow-sm backdrop-blur xl:block">
        Live 3D build view
      </div> : null}
      <Canvas
        camera={{ position: cameraPosition, fov: 40 }}
        gl={printReady ? { preserveDrawingBuffer: true } : undefined}
        dpr={printReady ? 1.5 : [1, 1.5]}
        performance={{ min: 0.55 }}
        shadows
        style={{ touchAction: "none", opacity: sceneVisible ? 1 : 0.12, transition: "opacity 280ms ease" }}
        onPointerDown={() => setHasInteracted(true)}
      >
        <color attach="background" args={["#edf3f8"]} />
        <fog attach="fog" args={["#edf3f8", 8.5, 14]} />
        <ambientLight intensity={1.15} />
        <directionalLight
          position={[5.5, 7.5, 4.8]}
          intensity={1.5}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-4.5, 4.5, -3.2]} intensity={0.48} />
        <spotLight position={[0, 6.4, 2.6]} angle={0.42} penumbra={0.6} intensity={0.46} />
        <CameraRig position={cameraPosition} target={orbitTarget} controlsRef={controlsRef} />
        <WarehouseMesh {...props} structureView={cameraView === "structure"} />
        <ContactShadows
          position={[0, -0.53, 0]}
          opacity={0.3}
          scale={7.4}
          blur={2.2}
          far={3.2}
          resolution={printReady ? 1024 : 512}
          color="#98a5b5"
        />
        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          target={orbitTarget}
          minDistance={minDistance}
          maxDistance={maxDistance}
          minPolarAngle={Math.PI / 5}
          maxPolarAngle={Math.PI / 2.1}
        />
      </Canvas>
    </div>
  )
}
