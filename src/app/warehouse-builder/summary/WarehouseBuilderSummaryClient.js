"use client"

import Image from "next/image"
import { useMemo } from "react"
import { useSearchParams } from "next/navigation"
import WarehouseBuilderScene from "../../../components/warehouse-builder/WarehouseBuilderScene"
import { WAREHOUSE_SHEETING_COLORS } from "../../../lib/warehouseBuilderStore"

function numberParam(searchParams, key, fallback) {
  const value = Number(searchParams.get(key))
  return Number.isFinite(value) && value > 0 ? value : fallback
}

function createDesignReference(configuration) {
  const source = JSON.stringify(configuration)
  let hash = 2166136261
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return `WB-${(hash >>> 0).toString(36).toUpperCase().padStart(7, "0").slice(0, 7)}`
}

export default function WarehouseBuilderSummaryClient() {
  const searchParams = useSearchParams()
  const configuration = useMemo(() => {
    const productType = "Atlas Warehouse"
    return {
      productType,
      width: numberParam(searchParams, "width", 8),
      length: numberParam(searchParams, "length", 20),
      wallHeight: numberParam(searchParams, "height", 3),
      cladding: searchParams.get("cladding") || "None",
      sheetingProfile: searchParams.get("sheetingProfile") || "IBR",
      sheetingFinish: searchParams.get("sheetingFinish") || "galvanised",
      enclosureType: searchParams.get("enclosure") || "roof_only",
      rollerDoorCount: Math.max(0, Number(searchParams.get("rollerDoors")) || 0),
      garageDoorOpeningType: searchParams.get("openingSize") || "single",
      rollerDoorFace: searchParams.get("rollerFace") || "front",
      pedestrianDoorCount: Math.max(0, Number(searchParams.get("personnelDoors")) || 0),
      pedestrianDoorFace: searchParams.get("personnelFace") || "rear",
      sheetingColor: searchParams.get("sheetingColor") || "galvanised",
      steelFinish: searchParams.get("steelFinish") || "Galv",
      gableMode: searchParams.get("sheeting") || "structure_only",
      roofPitch: 15,
      scope: "supply_only",
    }
  }, [searchParams])

  const isAtlas = configuration.productType === "Atlas Warehouse"
  const createdDate = new Intl.DateTimeFormat("en-ZA", { day: "numeric", month: "long", year: "numeric" }).format(new Date())
  const reference = createDesignReference({
    productType: configuration.productType,
    width: configuration.width,
    length: configuration.length,
    wallHeight: configuration.wallHeight,
    cladding: configuration.cladding,
    sheetingProfile: configuration.sheetingProfile,
    sheetingFinish: configuration.sheetingFinish,
    enclosureType: configuration.enclosureType,
    rollerDoorCount: configuration.rollerDoorCount,
    garageDoorOpeningType: configuration.garageDoorOpeningType,
    rollerDoorFace: configuration.rollerDoorFace,
    pedestrianDoorCount: configuration.pedestrianDoorCount,
    pedestrianDoorFace: configuration.pedestrianDoorFace,
    sheetingColor: configuration.sheetingColor,
    steelFinish: configuration.steelFinish,
    gableMode: configuration.gableMode,
  })
  const systemName = isAtlas ? "Atlas W-Series Warehouse" : "Engineered LSF Warehouse"
  const finishName = isAtlas
    ? `${configuration.steelFinish} · ${configuration.gableMode === "structure_only" ? "Structure only" : configuration.gableMode === "roof_only" ? "Roof sheeting" : configuration.gableMode === "fully_enclosed_with_gables" ? "Fully enclosed" : "Roof and side walls sheeted"}`
    : `${configuration.cladding} · ${configuration.enclosureType.replaceAll("_", " ")}`
  const sheetingFinishLabel = configuration.gableMode === "structure_only"
    ? "Not selected"
    : configuration.sheetingFinish === "chromadek"
      ? `Chromadek · ${WAREHOUSE_SHEETING_COLORS.find((option) => option.value === configuration.sheetingColor)?.label || "Colour to confirm"}`
      : "Galvanised"
  const sceneProps = {
    printReady: true,
    systemVariant: isAtlas ? "atlas" : "lsf",
    width: configuration.width,
    length: configuration.length,
    wallHeight: configuration.wallHeight,
    gableMode: configuration.gableMode,
    roofPitch: 15,
    cladding: configuration.gableMode === "structure_only" ? "None" : configuration.sheetingProfile,
    enclosureType: isAtlas
      ? configuration.gableMode === "structure_only" ? "open_sides" : configuration.gableMode === "roof_only" ? "roof_only" : configuration.gableMode === "fully_enclosed_with_gables" ? "fully_enclosed" : "side_walls"
      : configuration.enclosureType,
    rollerDoorCount: isAtlas ? 0 : configuration.rollerDoorCount,
    garageDoorOpeningType: configuration.garageDoorOpeningType,
    rollerDoorFace: configuration.rollerDoorFace,
    pedestrianDoorCount: isAtlas ? 0 : configuration.pedestrianDoorCount,
    pedestrianDoorFace: configuration.pedestrianDoorFace,
    sheetingColor: configuration.sheetingFinish === "chromadek" ? configuration.sheetingColor : "galvanised",
    steelFinish: configuration.steelFinish,
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-950 print:bg-white print:p-0">
      <div className="no-print mx-auto mb-4 flex max-w-[900px] items-center justify-between gap-4">
        <p className="text-sm font-semibold text-slate-500">Read-only submitted configuration</p>
        <button type="button" onClick={() => window.print()} className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white">Print / Save PDF</button>
      </div>
      <article className="summary-sheet mx-auto max-w-[900px] overflow-hidden bg-white shadow-xl print:shadow-none">
        <header className={`grid gap-6 px-8 py-7 text-white sm:grid-cols-[1fr_auto] ${isAtlas ? "bg-[linear-gradient(120deg,#001d2e,#0043f3)]" : "bg-[linear-gradient(120deg,#020617,#172033)]"}`}>
          <div>
            <Image src={isAtlas ? "/atlas/atlas-logo-horizontal-light.png" : "/LogoWhite.png"} alt={systemName} width={isAtlas ? 250 : 150} height={46} className="h-9 w-auto object-contain object-left" priority />
            <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/65">Warehouse builder design summary</p>
            <h1 className="mt-2 text-3xl font-semibold">{systemName}</h1>
          </div>
          <div className="self-end text-left sm:text-right">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">Design reference</p>
            <p className="mt-1 text-lg font-semibold">{reference}</p>
            <p className="mt-1 text-xs text-white/55">{createdDate}</p>
          </div>
        </header>

        <div className="grid gap-6 p-8 sm:grid-cols-[1.1fr_0.9fr]">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
            <WarehouseBuilderScene {...sceneProps} className="h-[330px]" />
          </div>
          <div className="flex flex-col justify-between rounded-2xl bg-slate-950 p-6 text-white">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Configuration overview</p>
              <p className="mt-3 text-3xl font-semibold">{configuration.width}m × {configuration.length}m</p>
              <p className="mt-2 text-sm text-slate-300">{configuration.wallHeight}m eave height · 15° roof pitch</p>
            </div>
            <p className="mt-6 text-xs leading-5 text-slate-300">Indicative project view for scope discussion. Final setting-out and construction details follow approved drawings.</p>
          </div>
        </div>

        <div className="grid gap-6 px-8 pb-8 sm:grid-cols-2">
          <section>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Configuration</p>
            <dl className="mt-3 divide-y divide-slate-200 border-y border-slate-200">
              {[
                ["System", systemName],
                ["Size", `${configuration.width}m × ${configuration.length}m × ${configuration.wallHeight}m`],
                ["Finish", finishName],
                ["Sheeting profile", configuration.gableMode === "structure_only" ? "Not selected" : configuration.sheetingProfile],
                ["Sheeting finish", sheetingFinishLabel],
                ["Roof pitch", "15 degrees"],
                ...(!isAtlas ? [["Openings", `${configuration.rollerDoorCount} main (${configuration.rollerDoorFace}) · ${configuration.pedestrianDoorCount} personnel (${configuration.pedestrianDoorFace})`]] : []),
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 py-3 text-sm"><dt className="text-slate-500">{label}</dt><dd className="text-right font-semibold">{value}</dd></div>
              ))}
            </dl>
          </section>
          <section>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Installer review</p>
            <div className="mt-3 rounded-2xl border border-slate-200 p-5 text-sm leading-6 text-slate-600">
              <p className="font-semibold text-slate-950">Use this view to discuss the selected scope.</p>
              <p className="mt-2">Confirm site dimensions, foundations, access, delivery and installation requirements against the approved project drawings before construction.</p>
            </div>
          </section>
        </div>
      </article>
      <style jsx global>{`
        @media print {
          body > header, body > footer, .no-print { display: none !important; }
          @page { size: A4 portrait; margin: 0; }
          .summary-sheet { width: 210mm; min-height: 297mm; max-width: none; }
        }
      `}</style>
    </main>
  )
}
