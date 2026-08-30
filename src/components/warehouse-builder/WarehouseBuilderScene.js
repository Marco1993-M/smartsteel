"use client"

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { ContactShadows, OrbitControls } from "@react-three/drei"
import { RotateCw } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { DataTexture, DoubleSide, ExtrudeGeometry, LinearFilter, Path, Quaternion, RepeatWrapping, Shape, Vector3 } from "three"
import { ATLAS_W06_PROFILES } from "../../lib/atlasW06Geometry"
import { ATLAS_W08_PROFILES } from "../../lib/atlasW08Geometry"
import { ATLAS_W10_PROFILES } from "../../lib/atlasW10Geometry"
import { ATLAS_W12_PROFILES } from "../../lib/atlasW12Geometry"
import { WAREHOUSE_SHEETING_COLORS } from "../../lib/warehouseBuilderStore"

const ATLAS_PROFILES_BY_SPAN = {
  6: ATLAS_W06_PROFILES,
  8: ATLAS_W08_PROFILES,
  10: ATLAS_W10_PROFILES,
  12: ATLAS_W12_PROFILES,
}

function createLippedChannelGeometry(profile, length, scale) {
  const web = (profile.webMm / 1000) * scale
  const flange = (profile.flangeMm / 1000) * scale
  const lip = (profile.lipMm / 1000) * scale
  const thickness = (profile.thicknessMm / 1000) * scale
  const halfWeb = web / 2
  const halfFlange = flange / 2
  const shape = new Shape()

  shape.moveTo(-halfFlange, -halfWeb)
  shape.lineTo(halfFlange, -halfWeb)
  shape.lineTo(halfFlange, -halfWeb + lip)
  shape.lineTo(halfFlange - thickness, -halfWeb + lip)
  shape.lineTo(halfFlange - thickness, -halfWeb + thickness)
  shape.lineTo(-halfFlange + thickness, -halfWeb + thickness)
  shape.lineTo(-halfFlange + thickness, halfWeb - thickness)
  shape.lineTo(halfFlange - thickness, halfWeb - thickness)
  shape.lineTo(halfFlange - thickness, halfWeb - lip)
  shape.lineTo(halfFlange, halfWeb - lip)
  shape.lineTo(halfFlange, halfWeb)
  shape.lineTo(-halfFlange, halfWeb)
  shape.closePath()

  const geometry = new ExtrudeGeometry(shape, {
    depth: length,
    bevelEnabled: false,
    curveSegments: 1,
  })
  geometry.translate(0, 0, -length / 2)
  geometry.computeVertexNormals()
  return geometry
}

function LippedChannelMember({
  profile,
  length,
  scale,
  materialProps,
  rotation = [0, 0, 0],
  backToBack = false,
}) {
  const geometry = useMemo(() => createLippedChannelGeometry(profile, length, scale), [length, profile, scale])
  const pairOffset = ((profile.flangeMm - profile.thicknessMm) / 2000) * scale

  useEffect(() => () => geometry.dispose(), [geometry])

  if (!backToBack) {
    return (
      <mesh geometry={geometry} rotation={rotation} castShadow>
        <meshPhysicalMaterial {...materialProps} side={DoubleSide} />
      </mesh>
    )
  }

  return (
    <group rotation={rotation}>
      <mesh geometry={geometry} position={[pairOffset, 0, 0]} castShadow>
        <meshPhysicalMaterial {...materialProps} side={DoubleSide} />
      </mesh>
      <mesh geometry={geometry} position={[-pairOffset, 0, 0]} scale={[-1, 1, 1]} castShadow>
        <meshPhysicalMaterial {...materialProps} side={DoubleSide} />
      </mesh>
    </group>
  )
}

function BraceBetween({ start, end, thickness, materialProps }) {
  const geometry = useMemo(() => {
    const startPoint = new Vector3(...start)
    const endPoint = new Vector3(...end)
    const direction = endPoint.clone().sub(startPoint)
    const length = direction.length()
    const midpoint = startPoint.clone().add(endPoint).multiplyScalar(0.5)
    const quaternion = new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), direction.normalize())
    return { length, midpoint, quaternion }
  }, [end, start])

  return (
    <mesh position={geometry.midpoint} quaternion={geometry.quaternion} castShadow>
      <boxGeometry args={[thickness, thickness, geometry.length]} />
      <meshPhysicalMaterial {...materialProps} />
    </mesh>
  )
}

function createSteelSurfaceMap() {
  const size = 128
  const data = new Uint8Array(size * size * 4)
  const crystals = Array.from({ length: 54 }, (_, index) => {
    const seed = Math.sin((index + 1) * 91.731) * 43758.5453
    const nextSeed = Math.sin((index + 1) * 47.219) * 24634.6345
    return {
      x: (seed - Math.floor(seed)) * size,
      y: (nextSeed - Math.floor(nextSeed)) * size,
      tone: 112 + ((index * 37) % 48),
    }
  })

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const index = (y * size + x) * 4
      let nearestDistance = Infinity
      let secondDistance = Infinity
      let crystalTone = 128

      crystals.forEach((crystal) => {
        const dx = Math.min(Math.abs(x - crystal.x), size - Math.abs(x - crystal.x))
        const dy = Math.min(Math.abs(y - crystal.y), size - Math.abs(y - crystal.y))
        const distance = dx * dx + dy * dy
        if (distance < nearestDistance) {
          secondDistance = nearestDistance
          nearestDistance = distance
          crystalTone = crystal.tone
        } else if (distance < secondDistance) {
          secondDistance = distance
        }
      })

      const crystalEdge = Math.sqrt(secondDistance) - Math.sqrt(nearestDistance)
      const edgeHighlight = crystalEdge < 1.15 ? 18 : 0
      const fineVariation = Math.sin(x * 1.91 + y * 2.37) * 2.5
      const value = Math.max(98, Math.min(180, crystalTone + edgeHighlight + fineVariation))
      data[index] = value
      data[index + 1] = value
      data[index + 2] = value
      data[index + 3] = 255
    }
  }

  const texture = new DataTexture(data, size, size)
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.repeat.set(5, 5)
  texture.minFilter = LinearFilter
  texture.magFilter = LinearFilter
  texture.needsUpdate = true
  return texture
}

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
  steelFinish,
  structureView = false,
}) {
  const scale = 0.18
  const w = width * scale
  const l = length * scale
  const h = wallHeight * scale
  const ridgeRise = Math.tan((roofPitch * Math.PI) / 180) * (w / 2)
  const isAtlas = systemVariant === "atlas"
  const atlasProfiles = ATLAS_PROFILES_BY_SPAN[Number(width)] || ATLAS_W08_PROFILES
  const selectedSteelFinish = steelFinish || (isAtlas ? "ZAM" : "Mild")
  const isMildSteel = selectedSteelFinish === "Mild"
  const isGalvanisedSteel = selectedSteelFinish === "Galv"
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
  const steelColor = isMildSteel ? "#262d31" : isGalvanisedSteel ? "#c9d1d4" : "#d8dfe1"
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
  const steelSurfaceMap = useMemo(() => createSteelSurfaceMap(), [])

  useEffect(() => () => steelSurfaceMap.dispose(), [steelSurfaceMap])

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
    metalness: isMildSteel ? 0.4 : isGalvanisedSteel ? 0.54 : 0.58,
    roughness: isMildSteel ? 0.62 : isGalvanisedSteel ? 0.62 : 0.54,
    roughnessMap: isMildSteel ? undefined : steelSurfaceMap,
    bumpMap: isMildSteel ? undefined : steelSurfaceMap,
    bumpScale: isGalvanisedSteel ? 0.0014 : 0.0025,
    clearcoat: isMildSteel ? 0 : 0.04,
    clearcoatRoughness: isGalvanisedSteel ? 0.84 : 0.78,
  }

  const braceMaterialProps = {
    color: isMildSteel ? "#30383c" : isGalvanisedSteel ? "#bec8cc" : "#cdd6d9",
    metalness: isMildSteel ? 0.38 : isGalvanisedSteel ? 0.52 : 0.56,
    roughness: isMildSteel ? 0.66 : isGalvanisedSteel ? 0.64 : 0.56,
    roughnessMap: isMildSteel ? undefined : steelSurfaceMap,
    bumpMap: isMildSteel ? undefined : steelSurfaceMap,
    bumpScale: isGalvanisedSteel ? 0.0012 : 0.002,
    clearcoat: isMildSteel ? 0 : 0.035,
    clearcoatRoughness: isGalvanisedSteel ? 0.86 : 0.8,
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
          {isAtlas ? (
            <>
              <group position={[-w / 2, h / 2, 0]}>
                <LippedChannelMember profile={atlasProfiles.column} length={h} scale={scale} materialProps={frameMaterialProps} rotation={[-Math.PI / 2, 0, Math.PI / 2]} backToBack />
              </group>
              <group position={[w / 2, h / 2, 0]}>
                <LippedChannelMember profile={atlasProfiles.column} length={h} scale={scale} materialProps={frameMaterialProps} rotation={[-Math.PI / 2, 0, Math.PI / 2]} backToBack />
              </group>
              <group position={[-w / 4, h + ridgeRise / 2, 0]} rotation={[0, 0, roofAngle]}>
                <LippedChannelMember profile={atlasProfiles.rafter} length={roofHalfSpan} scale={scale} materialProps={frameMaterialProps} rotation={[0, Math.PI / 2, 0]} />
              </group>
              <group position={[w / 4, h + ridgeRise / 2, 0]} rotation={[0, 0, -roofAngle]}>
                <LippedChannelMember profile={atlasProfiles.rafter} length={roofHalfSpan} scale={scale} materialProps={frameMaterialProps} rotation={[0, Math.PI / 2, 0]} />
              </group>
            </>
          ) : (
            <>
              <mesh position={[-w / 2, h / 2, 0]} castShadow>
                <boxGeometry args={[columnThickness, h, columnThickness]} />
                <meshPhysicalMaterial {...frameMaterialProps} />
              </mesh>
              <mesh position={[w / 2, h / 2, 0]} castShadow>
                <boxGeometry args={[columnThickness, h, columnThickness]} />
                <meshPhysicalMaterial {...frameMaterialProps} />
              </mesh>
              <mesh position={[-w / 4, h + ridgeRise / 2, 0]} rotation={[0, 0, roofAngle]} castShadow>
                <boxGeometry args={[roofHalfSpan, rafterThickness, rafterThickness]} />
                <meshPhysicalMaterial {...frameMaterialProps} />
              </mesh>
              <mesh position={[w / 4, h + ridgeRise / 2, 0]} rotation={[0, 0, -roofAngle]} castShadow>
                <boxGeometry args={[roofHalfSpan, rafterThickness, rafterThickness]} />
                <meshPhysicalMaterial {...frameMaterialProps} />
              </mesh>
            </>
          )}
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
                <group
                  key={`purlin-${bayIndex}-${fraction}-${side}`}
                  position={[side * xDistanceFromRidge, roofY + roofSecondaryOffset, bayCenterZ]}
                >
                  <LippedChannelMember profile={atlasProfiles.purlin} length={bayDepth} scale={scale} materialProps={frameMaterialProps} />
                </group>
              ))
            })}

            {(enclosureType === "fully_enclosed" || enclosureType === "side_walls") ? [0.08, 0.5, 0.92].flatMap((fraction) => [-1, 1].map((side) => (
              <group
                key={`girt-${bayIndex}-${fraction}-${side}`}
                position={[side * (w / 2 + wallSecondaryOffset), h * fraction, bayCenterZ]}
              >
                <LippedChannelMember profile={atlasProfiles.sideGirt} length={bayDepth} scale={scale} materialProps={frameMaterialProps} />
              </group>
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
            {isAtlas ? [-1, 1].flatMap((side) => {
              const roofBraceOffset = 0.012
              const eave = [side * w / 2, h + roofBraceOffset, 0]
              const ridge = [0, h + ridgeRise + roofBraceOffset, 0]

              return [
                <BraceBetween
                  key={`roof-brace-${bayIndex}-${side}-forward`}
                  start={[eave[0], eave[1], -bayDepth / 2]}
                  end={[ridge[0], ridge[1], bayDepth / 2]}
                  thickness={braceThickness}
                  materialProps={braceMaterialProps}
                />,
                <BraceBetween
                  key={`roof-brace-${bayIndex}-${side}-reverse`}
                  start={[ridge[0], ridge[1], -bayDepth / 2]}
                  end={[eave[0], eave[1], bayDepth / 2]}
                  thickness={braceThickness}
                  materialProps={braceMaterialProps}
                />,
              ]
            }) : null}
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
