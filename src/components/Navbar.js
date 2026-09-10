'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const productLinks = [
  { href: '/warehouse-builder', title: 'Atlas Warehouses', copy: 'Configure and price a modular steel warehouse in 3D.' },
  { href: '/products/cflc-solar-carports', title: 'Atlas Solar Carports', copy: 'Plan commercial solar parking with a live 3D layout.' },
  { href: '/products/cflc-ground-mounts', title: 'Atlas Ground Mounts', copy: 'Build modular solar arrays from six-panel bays.' },
  { href: '/products', title: 'All Products', copy: 'Explore the complete Smart Steel product range.' },
]

const professionalLinks = [
  { href: '/architect-advantages', title: 'Architects & Specifiers', copy: 'Product advantages and specification support.' },
  { href: '/steel-fabrication-installation', title: 'Builders & Installers', copy: 'Fabrication, installation, and project capability.' },
  { href: '/resources', title: 'Technical Resources', copy: 'Guides and useful project information.' },
]

function Chevron({ open }) {
  return <svg viewBox="0 0 20 20" aria-hidden="true" className={`h-3.5 w-3.5 transition ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m5 7.5 5 5 5-5" /></svg>
}

function DesktopMenu({ label, name, openMenu, setOpenMenu, children }) {
  const open = openMenu === name
  return (
    <div>
      <button type="button" onClick={() => setOpenMenu(open ? null : name)} aria-expanded={open} className={`flex items-center gap-1.5 rounded-full px-3 py-2 transition ${open ? 'bg-[#edf4ff] text-[#0043f3]' : 'text-[#001d2e] hover:bg-slate-100'}`}>
        {label}<Chevron open={open} />
      </button>
      {open ? children : null}
    </div>
  )
}

export default function Navbar() {
  const pathname = usePathname()
  const navRef = useRef(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState(null)

  useEffect(() => {
    setMobileOpen(false)
    setOpenMenu(null)
  }, [pathname])

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!navRef.current?.contains(event.target)) setOpenMenu(null)
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpenMenu(null)
        setMobileOpen(false)
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const desktopLinkClass = (href) => `rounded-full px-3 py-2 transition ${pathname === href || pathname.startsWith(`${href}/`) ? 'bg-[#edf4ff] text-[#0043f3]' : 'text-[#001d2e] hover:bg-slate-100'}`

  return (
    <nav ref={navRef} className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 bg-white/95 text-[#001d2e] shadow-[0_12px_30px_-28px_rgba(0,29,46,0.65)] backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-10">
        <Link href="/" aria-label="Smart Steel home" className="flex shrink-0 items-center">
          <Image src="/Logo.png" alt="Smart Steel" width={132} height={72} priority className="h-14 w-auto object-contain" />
        </Link>

        <div className="hidden items-center gap-1 text-sm font-semibold lg:flex">
          <DesktopMenu label="Products" name="products" openMenu={openMenu} setOpenMenu={setOpenMenu}>
            <div className="absolute inset-x-0 top-full border-b border-slate-200 bg-white shadow-[0_24px_45px_-32px_rgba(0,29,46,0.55)]">
              <div className="mx-auto grid max-w-[1440px] grid-cols-4 gap-3 px-10 py-6">
                {productLinks.map((item, index) => <Link key={item.href} href={item.href} className="group rounded-2xl border border-slate-200 bg-slate-50/70 p-5 transition hover:border-[#0043f3]/35 hover:bg-white"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#0043f3]">0{index + 1}</p><p className="mt-3 text-base font-bold">{item.title}</p><p className="mt-2 text-xs font-normal leading-5 text-slate-500">{item.copy}</p></Link>)}
              </div>
            </div>
          </DesktopMenu>

          <Link href="/solar" className={desktopLinkClass('/solar')}>Solar</Link>

          <DesktopMenu label="For Professionals" name="professionals" openMenu={openMenu} setOpenMenu={setOpenMenu}>
            <div className="absolute inset-x-0 top-full border-b border-slate-200 bg-white shadow-[0_24px_45px_-32px_rgba(0,29,46,0.55)]">
              <div className="mx-auto grid max-w-5xl grid-cols-3 gap-3 px-8 py-6">
                {professionalLinks.map((item) => <Link key={item.href} href={item.href} className="rounded-2xl border border-slate-200 p-5 transition hover:border-[#0043f3]/35 hover:bg-slate-50"><p className="text-base font-bold">{item.title}</p><p className="mt-2 text-xs font-normal leading-5 text-slate-500">{item.copy}</p></Link>)}
              </div>
            </div>
          </DesktopMenu>

          <Link href="/company" className={desktopLinkClass('/company')}>About</Link>
          <Link href="/contact" className="ml-2 rounded-full bg-[#001d2e] px-5 py-2.5 text-white transition hover:bg-[#0043f3]">Contact</Link>
        </div>

        <button type="button" onClick={() => setMobileOpen((open) => !open)} aria-expanded={mobileOpen} aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'} className="grid h-11 w-11 place-items-center rounded-full border border-slate-200 bg-white text-[#001d2e] shadow-sm lg:hidden">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2">{mobileOpen ? <path d="m6 6 12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}</svg>
        </button>
      </div>

      {mobileOpen ? (
        <div className="max-h-[calc(100dvh-5rem)] overflow-y-auto border-t border-slate-200 bg-white lg:hidden">
          <div className="mx-auto max-w-xl px-5 py-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Explore</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link href="/warehouse-builder" className="rounded-2xl bg-[#001d2e] p-4 text-white"><span className="text-sm font-bold">Warehouses</span><span className="mt-1 block text-xs text-white/60">Build in 3D</span></Link>
              <Link href="/solar" className="rounded-2xl bg-[#0043f3] p-4 text-white"><span className="text-sm font-bold">Solar Solutions</span><span className="mt-1 block text-xs text-white/65">Carports & ground mounts</span></Link>
            </div>

            <div className="mt-5 divide-y divide-slate-200 border-y border-slate-200">
              <Link href="/products" className="flex items-center justify-between py-4 text-sm font-semibold">All products <span aria-hidden="true">→</span></Link>
              <Link href="/architect-advantages" className="flex items-center justify-between py-4 text-sm font-semibold">For professionals <span aria-hidden="true">→</span></Link>
              <Link href="/resources" className="flex items-center justify-between py-4 text-sm font-semibold">Resources <span aria-hidden="true">→</span></Link>
              <Link href="/company" className="flex items-center justify-between py-4 text-sm font-semibold">About Smart Steel <span aria-hidden="true">→</span></Link>
            </div>

            <Link href="/contact" className="mt-5 flex min-h-12 items-center justify-center rounded-xl bg-[#001d2e] px-5 text-sm font-bold text-white">Talk to Smart Steel</Link>
          </div>
        </div>
      ) : null}
    </nav>
  )
}
