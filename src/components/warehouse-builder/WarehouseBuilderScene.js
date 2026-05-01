"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { RotateCw } from "lucide-react"
import { useMemo } from "react"

function WarehouseMesh({
  width,
  length,
  wallHeight,
  roofPitch,
  cladding,
  enclosureType,
  rollerDoorCount,
  garageDoorOpeningType,
  pedestrianDoorCount,
}) {
  const scale = 0.18
  const w = width * scale
  const l = length * scale
  const h = wallHeight * scale
  const ridgeRise = Math.tan((roofPitch * Math.PI) / 180) * (w / 2)
  const frameCount = Math.max(2, Math.round(length / 2.5) + 1)

  const framePositions = useMemo(() => {
    const step = frameCount === 1 ? 0 : l / (frameCount - 1)
    return Array.from({ length: frameCount }, (_, index) => -l / 2 + index * step)
  }, [frameCount, l])
  const bracedBayIndices = useMemo(() => {
    const totalBays = Math.max(frameCount - 1, 1)

    if (totalBays <= 4) {
      return [Math.max(0, Math.floor(totalBays / 2) - 1 + (totalBays % 2 === 0 ? 0 : 1))]
    }

    const indices = []
    for (let bayIndex = 3; bayIndex < totalBays; bayIndex += 4) {
      indices.push(bayIndex)
    }

    return indices.length > 0 ? indices : [0]
  }, [frameCount])

  const frontDoorPositions = useMemo(() => {
    const total = Math.max(rollerDoorCount, 0)
    if (total === 0) return []
    return Array.from({ length: total }, (_, index) => {
      const span = w * 0.74
      const offset = total === 1 ? 0 : -span / 2 + (index * span) / (total - 1)
      return offset
    })
  }, [rollerDoorCount, w])

  const pedestrianDoorPositions = useMemo(() => {
    const total = Math.max(pedestrianDoorCount, 0)
    if (total === 0) return []
    return Array.from({ length: total }, (_, index) => {
      const span = w * 0.82
      const offset = total === 1 ? w * 0.3 : -span / 2 + (index * span) / Math.max(total - 1, 1)
      return offset
    })
  }, [pedestrianDoorCount, w])

  const wallColor = enclosureType === "roof_only" ? "#f8fafc" : "#d7dee6"
  const roofColor = "#b91c1c"
  const steelColor = "#667085"
  const roofHalfSpan = Math.sqrt((w / 2) ** 2 + ridgeRise ** 2)
  const roofAngle = Math.atan2(ridgeRise, w / 2)
  const hasCladding = cladding !== "None"
  const personHeight = 1.75 * scale
  const personX = Math.min(w * 0.22, 0.42)
  const personZ = Math.max(-l / 2 + 0.35, -0.85)
  const columnThickness = 0.042
  const rafterThickness = 0.028
  const roofSheetThickness = 0.018
  const ridgeThickness = 0.022
  const wallSheetThickness = 0.022
  const braceThickness = 0.018
  const garageDoorOpeningWidth =
    garageDoorOpeningType === "double" ? Math.min(0.92, w * 0.3) : garageDoorOpeningType === "custom" ? Math.min(1.08, w * 0.34) : Math.min(0.58, w * 0.18)

  return (
    <group position={[0, -0.55, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[9, 9]} />
        <meshStandardMaterial color="#dbe4eb" />
      </mesh>

      <mesh position={[0, 0.01, 0]} receiveShadow>
        <boxGeometry args={[w + 0.25, 0.02, l + 0.25]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>

      {framePositions.map((z) => (
        <group key={z} position={[0, 0, z]}>
          <mesh position={[-w / 2, h / 2, 0]} castShadow>
            <boxGeometry args={[columnThickness, h, columnThickness]} />
            <meshStandardMaterial color={steelColor} metalness={0.25} roughness={0.55} />
          </mesh>
          <mesh position={[w / 2, h / 2, 0]} castShadow>
            <boxGeometry args={[columnThickness, h, columnThickness]} />
            <meshStandardMaterial color={steelColor} metalness={0.25} roughness={0.55} />
          </mesh>
          <mesh
            position={[-w / 4, h + ridgeRise / 2, 0]}
            rotation={[0, 0, roofAngle]}
            castShadow
          >
            <boxGeometry args={[roofHalfSpan, rafterThickness, rafterThickness]} />
            <meshStandardMaterial color={steelColor} metalness={0.25} roughness={0.55} />
          </mesh>
          <mesh
            position={[w / 4, h + ridgeRise / 2, 0]}
            rotation={[0, 0, -roofAngle]}
            castShadow
          >
            <boxGeometry args={[roofHalfSpan, rafterThickness, rafterThickness]} />
            <meshStandardMaterial color={steelColor} metalness={0.25} roughness={0.55} />
          </mesh>
          <mesh position={[0, h + ridgeRise, 0]} castShadow>
            <boxGeometry args={[rafterThickness * 1.1, rafterThickness * 1.1, rafterThickness * 1.1]} />
            <meshStandardMaterial color={steelColor} metalness={0.25} roughness={0.55} />
          </mesh>
        </group>
      ))}

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
                  <meshStandardMaterial color="#94a3b8" metalness={0.22} roughness={0.56} />
                </mesh>
                <mesh
                  position={[0, h / 2, 0]}
                  rotation={[-braceAngle, 0, 0]}
                  castShadow
                >
                  <boxGeometry args={[braceThickness, braceThickness, braceLength]} />
                  <meshStandardMaterial color="#94a3b8" metalness={0.22} roughness={0.56} />
                </mesh>
              </group>
            ))}
          </group>
        )
      })}

      {hasCladding ? (
        <>
          <mesh
            position={[-w / 4, h + ridgeRise / 2, 0]}
            rotation={[0, 0, roofAngle]}
            receiveShadow
          >
            <boxGeometry args={[roofHalfSpan + 0.08, roofSheetThickness, l + 0.12]} />
            <meshStandardMaterial color={roofColor} metalness={0.12} roughness={0.65} />
          </mesh>
          <mesh
            position={[w / 4, h + ridgeRise / 2, 0]}
            rotation={[0, 0, -roofAngle]}
            receiveShadow
          >
            <boxGeometry args={[roofHalfSpan + 0.08, roofSheetThickness, l + 0.12]} />
            <meshStandardMaterial color={roofColor} metalness={0.12} roughness={0.65} />
          </mesh>
          <mesh position={[0, h + ridgeRise + 0.015, 0]} receiveShadow>
            <boxGeometry args={[0.045, ridgeThickness, l + 0.08]} />
            <meshStandardMaterial color="#7f1d1d" metalness={0.14} roughness={0.62} />
          </mesh>
        </>
      ) : null}

      {hasCladding && enclosureType === "fully_enclosed" ? (
        <>
          <mesh position={[0, h / 2, -l / 2]} receiveShadow>
            <boxGeometry args={[w, h, wallSheetThickness]} />
            <meshStandardMaterial color={wallColor} />
          </mesh>
          <mesh position={[0, h / 2, l / 2]} receiveShadow>
            <boxGeometry args={[w, h, wallSheetThickness]} />
            <meshStandardMaterial color={wallColor} />
          </mesh>
          <mesh position={[-w / 2, h / 2, 0]} receiveShadow>
            <boxGeometry args={[wallSheetThickness, h, l]} />
            <meshStandardMaterial color={wallColor} />
          </mesh>
          <mesh position={[w / 2, h / 2, 0]} receiveShadow>
            <boxGeometry args={[wallSheetThickness, h, l]} />
            <meshStandardMaterial color={wallColor} />
          </mesh>
        </>
      ) : null}

      {hasCladding && enclosureType === "open_sides" ? (
        <>
          <mesh position={[-w / 2, h / 2, 0]} receiveShadow>
            <boxGeometry args={[wallSheetThickness, h, l]} />
            <meshStandardMaterial color={wallColor} />
          </mesh>
          <mesh position={[w / 2, h / 2, 0]} receiveShadow>
            <boxGeometry args={[wallSheetThickness, h, l]} />
            <meshStandardMaterial color={wallColor} />
          </mesh>
        </>
      ) : null}

      {frontDoorPositions.map((x) => (
        <mesh key={`roller-${x}`} position={[x, h * 0.38, -l / 2 - 0.025]}>
          <boxGeometry args={[garageDoorOpeningWidth, h * 0.72, 0.03]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
      ))}

      {pedestrianDoorPositions.map((x) => (
        <mesh key={`ped-${x}`} position={[x, h * 0.27, l / 2 + 0.025]}>
          <boxGeometry args={[0.18, h * 0.54, 0.03]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
      ))}

      <group position={[personX, 0, personZ]}>
        <mesh position={[0, personHeight * 0.84, 0]} castShadow>
          <sphereGeometry args={[0.09, 20, 20]} />
          <meshStandardMaterial color="#f1c7a3" roughness={0.92} />
        </mesh>
        <mesh position={[0, personHeight * 0.56, 0]} castShadow>
          <capsuleGeometry args={[0.1, personHeight * 0.34, 8, 16]} />
          <meshStandardMaterial color="#2563eb" roughness={0.84} />
        </mesh>
        <mesh position={[-0.17, personHeight * 0.56, 0]} rotation={[0, 0, 0.18]} castShadow>
          <capsuleGeometry args={[0.028, personHeight * 0.22, 6, 12]} />
          <meshStandardMaterial color="#f1c7a3" roughness={0.9} />
        </mesh>
        <mesh position={[0.17, personHeight * 0.56, 0]} rotation={[0, 0, -0.18]} castShadow>
          <capsuleGeometry args={[0.028, personHeight * 0.22, 6, 12]} />
          <meshStandardMaterial color="#f1c7a3" roughness={0.9} />
        </mesh>
        <mesh position={[-0.06, personHeight * 0.19, 0]} rotation={[0, 0, 0.08]} castShadow>
          <capsuleGeometry args={[0.035, personHeight * 0.28, 6, 12]} />
          <meshStandardMaterial color="#1e293b" roughness={0.86} />
        </mesh>
        <mesh position={[0.06, personHeight * 0.19, 0]} rotation={[0, 0, -0.08]} castShadow>
          <capsuleGeometry args={[0.035, personHeight * 0.28, 6, 12]} />
          <meshStandardMaterial color="#1e293b" roughness={0.86} />
        </mesh>
        <mesh position={[0, personHeight * 0.36, 0.075]} castShadow>
          <boxGeometry args={[0.11, 0.11, 0.03]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.88} />
        </mesh>
      </group>
    </group>
  )
}

export default function WarehouseBuilderScene(props) {
  const { width, length, wallHeight } = props
  const scale = 0.18
  const w = width * scale
  const l = length * scale
  const h = wallHeight * scale
  const cameraPosition = useMemo(() => {
    const diagonal = Math.sqrt(w ** 2 + l ** 2)
    const distance = Math.max(4.4, diagonal * 1.18)
    return [distance * 0.7, Math.max(2.6, h * 2.15), distance * 0.84]
  }, [h, l, w])
  const orbitTarget = useMemo(() => [0, Math.max(0.3, h * 0.58), 0], [h])
  const minDistance = Math.max(3.4, Math.sqrt(w ** 2 + l ** 2) * 0.62)
  const maxDistance = Math.max(8.5, Math.sqrt(w ** 2 + l ** 2) * 1.55)

  return (
    <div className="relative h-[320px] w-full overflow-hidden rounded-[2rem] border border-slate-200 bg-[radial-gradient(circle_at_top,_#ffffff,_#e2e8f0_68%)] shadow-inner sm:h-[420px] lg:h-[560px]">
      <div className="pointer-events-none absolute right-4 top-4 z-10 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/85 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600 shadow-sm backdrop-blur">
        <RotateCw className="h-3.5 w-3.5" />
        Drag to rotate
      </div>
      <Canvas camera={{ position: cameraPosition, fov: 40 }} shadows>
        <ambientLight intensity={1.28} />
        <directionalLight
          position={[5.5, 7.5, 4.8]}
          intensity={1.45}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-4.5, 4.5, -3.2]} intensity={0.42} />
        <WarehouseMesh {...props} />
        <OrbitControls
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
