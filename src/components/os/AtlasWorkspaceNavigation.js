'use client'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { getAtlasProduct, withAtlasProduct } from '../../lib/atlasProductRange'
export default function AtlasWorkspaceNavigation() {
  const pathname = usePathname()
  const params = useSearchParams()
  const requested = params.get('product')
  const product = getAtlasProduct(requested || (pathname.endsWith('/solar-pricing') ? 'SOLAR-CARPORT' : pathname === '/os/atlas' || pathname === '/os/atlas/products' ? '' : 'W08'))
  if (!product) return null
  const warehouse = /^W\d{2}$/.test(product.code)
  const sections = [ ['Overview','products'], ['Configuration & pricing',warehouse?'pricing':'solar-pricing'], ['Materials & connections',warehouse?'materials':'solar-pricing#schedule'], ['Engineering','engineering'], ['Documents','documents'] ]
  return <div className="border-b border-slate-200 bg-white px-4 py-5 sm:px-6 print:hidden">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><Link href="/os/atlas" className="text-xs font-bold text-blue-700">Atlas / All product families</Link><h1 className="mt-2 text-2xl font-bold text-slate-950">{product.family} <span className="font-normal text-slate-400">/</span> {warehouse?`${Number(product.code.slice(1))}m span`:product.name}</h1><p className="mt-1 text-xs text-slate-500">{product.code} · {product.status}</p></div>{warehouse&&<nav aria-label="Warehouse size" className="flex gap-2">{['W06','W08','W10','W12'].map(code=><Link key={code} aria-current={code===product.code?'page':undefined} href={withAtlasProduct(pathname.includes('solar-pricing')?'/os/atlas/products':pathname,code)} className={`rounded-xl border px-4 py-3 text-sm font-bold ${code===product.code?'border-blue-700 bg-blue-700 text-white':'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{Number(code.slice(1))}m</Link>)}</nav>}</div>
    <nav aria-label="Product workspace sections" className="mt-5 flex gap-2 overflow-x-auto">{sections.filter((_,index)=>product.available||index===0).map(([label,route])=>{const [page,anchor]=route.split('#');const href=withAtlasProduct(`/os/atlas/${page}`,product.code)+(anchor?`#${anchor}`:'');const active=(pathname===`/os/atlas/${page}`||page==='materials'&&['/os/atlas/bom','/os/atlas/components'].includes(pathname))&&!anchor;return <Link key={label} href={href} aria-current={active?'page':undefined} className={`shrink-0 rounded-lg px-4 py-2.5 text-sm font-semibold ${active?'bg-slate-950 text-white':'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{label}</Link>})}</nav>
  </div>
}
