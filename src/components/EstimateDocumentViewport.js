"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import EstimateDocumentLayout from "./EstimateDocumentLayout"

export default function EstimateDocumentViewport({ documentModel, estimate }) {
  const shellRef = useRef(null)
  const contentRef = useRef(null)
  const [scale, setScale] = useState(1)
  const [scaledHeight, setScaledHeight] = useState(null)
  const [isPrintMode, setIsPrintMode] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    const handleBeforePrint = () => setIsPrintMode(true)
    const handleAfterPrint = () => setIsPrintMode(false)

    window.addEventListener("beforeprint", handleBeforePrint)
    window.addEventListener("afterprint", handleAfterPrint)

    return () => {
      window.removeEventListener("beforeprint", handleBeforePrint)
      window.removeEventListener("afterprint", handleAfterPrint)
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return

    const updateScale = () => {
      const shell = shellRef.current
      const content = contentRef.current
      if (!shell || !content) return

      const isMobile = window.innerWidth < 768
      if (!isMobile || isPrintMode) {
        setScale(1)
        setScaledHeight(null)
        return
      }

      const availableWidth = Math.max(shell.clientWidth - 8, 0)
      const naturalWidth = content.offsetWidth
      const naturalHeight = content.offsetHeight
      if (!naturalWidth || !naturalHeight) return

      const nextScale = Math.min(1, availableWidth / naturalWidth)
      setScale(nextScale)
      setScaledHeight(naturalHeight * nextScale)
    }

    updateScale()

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => updateScale())
        : null

    if (resizeObserver && shellRef.current) resizeObserver.observe(shellRef.current)
    if (resizeObserver && contentRef.current) resizeObserver.observe(contentRef.current)

    window.addEventListener("resize", updateScale)

    return () => {
      resizeObserver?.disconnect()
      window.removeEventListener("resize", updateScale)
    }
  }, [documentModel, estimate, isPrintMode])

  const shellStyle = useMemo(() => {
    if (scale === 1 || isPrintMode || scaledHeight === null) return undefined
    return { height: `${scaledHeight}px` }
  }, [isPrintMode, scale, scaledHeight])

  const contentStyle = useMemo(() => {
    if (scale === 1 || isPrintMode) return undefined
    return {
      transform: `scale(${scale})`,
      transformOrigin: "top center",
    }
  }, [isPrintMode, scale])

  return (
    <div ref={shellRef} className="mx-auto w-full print:w-auto" style={shellStyle}>
      <div ref={contentRef} className="mx-auto w-fit print:w-auto" style={contentStyle}>
        <EstimateDocumentLayout documentModel={documentModel} estimate={estimate} />
      </div>
    </div>
  )
}
