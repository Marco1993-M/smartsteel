"use client"

import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  ArrowRight,
  Boxes,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleDotDashed,
  Layers3,
  Ruler,
  ShieldCheck,
  SunMedium,
  Warehouse,
  Wrench,
} from "lucide-react"
import { ATLAS_PRODUCT_RANGE, getAtlasProduct, withAtlasProduct } from "../../lib/atlasProductRange"

const FAMILY_META = [
  {
    key: "warehouses",
    name: "Warehouses",
    eyebrow: "Primary product family",
    detail: "Modular bolted warehouse structures built around controlled spans and repeatable 4m bays.",
    codes: ["W06", "W08", "W10", "W12"],
    icon: Warehouse,
    accent: "blue",
  },
  {
    key: "solar",
    name: "Solar structures",
    eyebrow: "Energy infrastructure",
    detail: "Purpose-built steel support systems for parking and open-site solar installations.",
    codes: ["SOLAR-CARPORT", "GROUND-MOUNT"],
    icon: SunMedium,
    accent: "amber",
  },
  {
    key: "carports",
    name: "Carports",
    eyebrow: "Covered parking",
    detail: "Single, double and repeatable multi-bay parking structures.",
    codes: ["CARPORT"],
    icon: Building2,
    accent: "slate",
  },
  {
    key: "systems",
    name: "Trusses & connections",
    eyebrow: "Structural systems",
    detail: "Roof trusses, standard brackets and the connection systems that unite the range.",
    codes: ["TRUSS", "BRACKETRY"],
    icon: Wrench,
    accent: "slate",
  },
]

const ACCENTS = {
  blue: {
    icon: "bg-blue-50 text-[#0043f3] ring-blue-100",
    card: "hover:border-blue-300 hover:shadow-blue-950/10",
    product: "border-blue-100 bg-blue-50/70 hover:border-[#0043f3] hover:bg-white",
  },
  amber: {
    icon: "bg-amber-50 text-amber-700 ring-amber-100",
    card: "hover:border-amber-300 hover:shadow-amber-950/10",
    product: "border-amber-100 bg-amber-50/70 hover:border-amber-500 hover:bg-white",
  },
  slate: {
    icon: "bg-slate-100 text-slate-600 ring-slate-200",
    card: "hover:border-slate-300 hover:shadow-slate-950/10",
    product: "border-slate-200 bg-slate-50",
  },
}

function ProductTile({ item, accent }) {
  if (!item.available) {
    return <div className={`rounded-xl border p-4 ${accent.product}`}>
      <div className="flex items-start justify-between gap-3">
        <div><p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{item.code}</p><p className="mt-1 text-sm font-bold text-slate-700">{item.name}</p></div>
        <span className="rounded-full bg-white px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-500 ring-1 ring-slate-200">Planned</span>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500">Workspace awaiting controlled product records.</p>
    </div>
  }

  return <Link href={withAtlasProduct("/os/atlas/products", item.code)} className={`group rounded-xl border p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg ${accent.product}`}>
    <div className="flex items-start justify-between gap-3">
      <div><p className="font-mono text-[10px] font-black uppercase tracking-[0.16em] text-[#0043f3]">{item.code}</p><p className="mt-1 text-sm font-bold text-slate-950">{item.name}</p></div>
      <ChevronRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#0043f3]" />
    </div>
    <div className="mt-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" />Workspace available</div>
  </Link>
}

function FamilyCard({ family, featured = false }) {
  const Icon = family.icon
  const accent = ACCENTS[family.accent]
  const products = family.codes.map((code) => ATLAS_PRODUCT_RANGE.find((product) => product.code === code)).filter(Boolean)
  const activeCount = products.filter((product) => product.available).length

  return <section className={`group rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-xl sm:p-6 ${accent.card} ${featured ? "xl:col-span-3" : ""}`}>
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-4">
        <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ring-1 ${accent.icon}`}><Icon className="h-6 w-6" /></span>
        <div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">{family.eyebrow}</p><h2 className="mt-1 text-xl font-black tracking-tight text-[#001d2e] sm:text-2xl">{family.name}</h2></div>
      </div>
      <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">{activeCount} of {products.length} live</span>
    </div>
    <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">{family.detail}</p>
    <div className={`mt-5 grid gap-3 ${featured ? "sm:grid-cols-2 xl:grid-cols-4" : "sm:grid-cols-2"}`}>{products.map((item) => <ProductTile key={item.code} item={item} accent={accent} />)}</div>
  </section>
}

function ProductOverview({ product }) {
  const warehouse = /^W\d{2}$/.test(product.code)
  const primaryHref = withAtlasProduct(warehouse ? "/os/atlas/pricing" : "/os/atlas/solar-pricing", product.code)
  const metrics = warehouse
    ? [["Span", `${Number(product.code.slice(1))}m`, Ruler], ["Construction", "Modular bolted frame", Layers3], ["Bay method", "4m warehouse bays", Boxes]]
    : [["Product", "Solar Carport", SunMedium], ["Layouts", "Single or double row", Layers3], ["Configuration", "Parking width and layout", Ruler]]

  return <div className="space-y-6 p-4 sm:p-6">
    <section className="relative overflow-hidden rounded-[1.75rem] border border-[#001d2e] bg-[radial-gradient(circle_at_85%_0%,rgba(193,217,229,0.2),transparent_30%),linear-gradient(135deg,#001d2e_0%,#06308d_58%,#0043f3_100%)] p-6 text-white shadow-[0_25px_65px_-35px_rgba(0,29,46,0.9)] sm:p-9">
      <div className="relative z-10"><p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-200">Atlas system · {product.family}</p><h1 className="mt-4 text-3xl font-black tracking-[-0.04em] sm:text-5xl">{product.name}</h1><p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200">{product.summary}</p><div className="mt-7 flex flex-wrap gap-3"><Link href={primaryHref} className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-[#0043f3] shadow-lg transition hover:bg-sky-50">Open configuration <ArrowRight className="h-4 w-4" /></Link>{product.code === "W08" ? <Link href="/os/atlas/products?product=W08&view=technical" className="rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-bold backdrop-blur transition hover:bg-white/15">Controlled product sheet</Link> : null}</div></div>
    </section>
    <div className="grid gap-4 sm:grid-cols-3">{metrics.map(([label, value, Icon]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><Icon className="h-5 w-5 text-[#0043f3]" /><p className="mt-5 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{label}</p><p className="mt-2 text-lg font-black text-[#001d2e]">{value}</p></div>)}</div>
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-start gap-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><ShieldCheck className="h-5 w-5" /></span><div><h2 className="text-lg font-black text-[#001d2e]">One product, connected information</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Configuration, materials, pricing, engineering and controlled documents remain connected to this product. Its commercial availability stays separate from technical approval and manufacturing release.</p></div></div></section>
  </div>
}

export default function AtlasProductHome() {
  const params = useSearchParams()
  const product = getAtlasProduct(params.get("product"))

  if (product && !product.available) {
    return <div className="p-4 sm:p-6"><section className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"><CircleDotDashed className="mx-auto h-8 w-8 text-slate-400" /><p className="mt-5 text-xs font-bold uppercase tracking-widest text-slate-400">Planned product workspace</p><h1 className="mt-2 text-3xl font-black text-[#001d2e]">{product.name}</h1><p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">This product belongs in the Atlas range, but its controlled product workspace has not yet been completed.</p><Link className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#001d2e] px-5 py-3 text-sm font-bold text-white" href="/os/atlas">Return to Atlas dashboard <ArrowRight className="h-4 w-4" /></Link></section></div>
  }
  if (product) return <ProductOverview product={product} />

  const activeProducts = ATLAS_PRODUCT_RANGE.filter((item) => item.available)
  const warehouseProducts = activeProducts.filter((item) => /^W\d{2}$/.test(item.code))

  return <div className="space-y-6 p-3 sm:p-6">
    <header className="relative overflow-hidden rounded-[1.75rem] border border-[#001d2e] bg-[radial-gradient(circle_at_86%_4%,rgba(193,217,229,0.25),transparent_28%),linear-gradient(135deg,#001d2e_0%,#052d72_55%,#0043f3_100%)] text-white shadow-[0_30px_75px_-40px_rgba(0,29,46,0.95)]">
      <div className="absolute inset-y-0 right-0 hidden w-[42%] opacity-30 lg:block" aria-hidden="true"><div className="absolute right-[-8%] top-[-35%] h-[430px] w-[430px] rotate-45 border border-white/20" /><div className="absolute right-[9%] top-[-14%] h-[300px] w-[300px] rotate-45 border border-white/15" /><div className="absolute right-[20%] top-[8%] h-[170px] w-[170px] rotate-45 border border-white/10" /></div>
      <div className="relative grid gap-8 p-6 sm:p-9 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
        <div><Image src="/atlas/atlas-logo-horizontal-light.png" alt="Atlas System developed by Smart Steel" width={230} height={70} className="h-12 w-auto object-contain object-left" priority /><p className="mt-8 text-xs font-black uppercase tracking-[0.22em] text-sky-200">Product operating system</p><h1 className="mt-3 max-w-3xl text-4xl font-black leading-[1.02] tracking-[-0.045em] sm:text-5xl lg:text-6xl">One system.<br />Every Atlas product under control.</h1><p className="mt-5 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">Choose a product family, open the exact configuration and keep its commercial, material and technical records together.</p></div>
        <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm">{[[activeProducts.length, "Active workspaces"], [warehouseProducts.length, "Warehouse spans"], [ATLAS_PRODUCT_RANGE.length, "Products in range"]].map(([value, label], index) => <div key={label} className={`p-4 text-center ${index ? "border-l border-white/10" : ""}`}><p className="text-3xl font-black">{value}</p><p className="mt-1 text-[9px] font-bold uppercase leading-4 tracking-[0.12em] text-sky-100/75">{label}</p></div>)}</div>
      </div>
    </header>

    <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-[#0043f3]"><ShieldCheck className="h-5 w-5" /></span><div><p className="text-sm font-black text-[#001d2e]">Controlled product selection</p><p className="mt-1 text-xs leading-5 text-slate-500">Available workspaces open live tools. Planned products remain visible so the full Atlas roadmap stays clear.</p></div></div><Link href="/os/atlas/products?product=W08" className="inline-flex shrink-0 items-center gap-2 text-sm font-black text-[#0043f3]">Resume with W08 <ArrowRight className="h-4 w-4" /></Link></section>

    <div className="grid gap-5 xl:grid-cols-3">{FAMILY_META.map((family) => <FamilyCard key={family.key} family={family} featured={family.key === "warehouses"} />)}</div>
  </div>
}
