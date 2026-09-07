import { useEffect, useMemo } from "react"
import { ExtrudeGeometry, Shape } from "three"

export default function ChannelGeometry({ profile, length, axis = "y", roll = 0 }) {
  const geometry = useMemo(() => {
    const w = profile.webMm / 2000
    const f = profile.flangeMm / 2000
    const t = profile.thicknessMm / 1000
    const lip = profile.lipMm / 1000
    const shape = new Shape()
    const points = [[-f, -w], [f, -w], [f, -w + lip], [f-t, -w+lip],
      [f-t, -w+t], [-f+t, -w+t], [-f+t, w-t], [f-t, w-t],
      [f-t, w-lip], [f, w-lip], [f, w], [-f, w]]
    shape.moveTo(...points[0])
    points.slice(1).forEach((point) => shape.lineTo(...point))
    shape.closePath()
    const result = new ExtrudeGeometry(shape, { depth: length, bevelEnabled: false, curveSegments: 1 })
    result.translate(0, 0, -length / 2)
    if (axis === "x") {
      result.rotateY(Math.PI / 2)
      result.rotateX(roll)
    }
    else {
      result.rotateX(-Math.PI / 2)
      result.rotateY(roll)
    }
    return result
  }, [profile, length, axis, roll])
  useEffect(() => () => geometry.dispose(), [geometry])
  return <primitive object={geometry} attach="geometry" />
}
