'use client'

import { Dialog } from '@headlessui/react'
import { XMarkIcon, ArrowRightIcon } from '@heroicons/react/24/outline'

// Local concept only. Savings are indicative; the standard price is never modified.
export function AtlasShowcaseOfferTrigger({ onClick }) {
 return <><button type="button" onClick={onClick} aria-haspopup="dialog" className="atlas-offer-trigger inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-[#0043f3]/25 bg-blue-50 px-4 py-2 text-xs font-semibold text-[#0043f3] shadow-[0_0_18px_rgba(0,67,243,0.16)] transition hover:bg-blue-100 hover:shadow-[0_0_22px_rgba(0,67,243,0.25)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0043f3]"><span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#0043f3]" />Want to save 10%?<ArrowRightIcon aria-hidden="true" className="h-3.5 w-3.5" /></button>
  <style jsx>{`
   .atlas-offer-trigger { animation: atlas-offer-glow 3.4s ease-in-out infinite; }
   @keyframes atlas-offer-glow {
    0%, 100% { box-shadow: 0 0 12px rgba(0,67,243,.12), 0 0 0 0 rgba(0,67,243,.13); }
    55% { box-shadow: 0 0 22px rgba(0,67,243,.24), 0 0 0 5px rgba(0,67,243,0); }
   }
   @media (prefers-reduced-motion: reduce) {
    .atlas-offer-trigger { animation: none; }
   }
  `}</style>
 </>
}

export default function AtlasShowcaseOffer({ open, onClose, onAssess, supplyTotal, scopeLabel, includesSheeting = false }) {
 const validTotal = typeof supplyTotal === 'number' && Number.isFinite(supplyTotal) && supplyTotal > 0
 const saving = validTotal ? Math.round((supplyTotal * .1 + Number.EPSILON) * 100) / 100 : null
 const money = value => `R ${value.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
 return <Dialog open={open} onClose={onClose} className="relative z-[90]" aria-labelledby="atlas-showcase-title">
  <div className="fixed inset-0 bg-[#001d2e]/65 backdrop-blur-sm" aria-hidden="true" />
  <div className="fixed inset-0 flex items-end justify-center p-0 sm:items-center sm:p-6">
   <Dialog.Panel className="relative max-h-[92dvh] w-full max-w-5xl overflow-y-auto rounded-t-[1.6rem] shadow-2xl sm:rounded-[2rem]">
    <button type="button" aria-label="Close Showcase offer" onClick={onClose} className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-[#001d2e] transition hover:bg-slate-100 sm:right-4 sm:top-4"><XMarkIcon className="h-5 w-5" /></button>
    <section id="atlas-showcase-offer" aria-labelledby="atlas-showcase-title" className="relative scroll-mt-24 overflow-hidden rounded-t-[1.6rem] border border-[#0043f3]/20 bg-[#f1f6fa] shadow-sm sm:rounded-[2rem]">
  <div className="absolute inset-x-0 top-0 h-1 bg-[#0043f3]" />
  <div className="grid gap-7 p-5 sm:p-7 md:grid-cols-[1.5fr_1fr] md:gap-8 lg:p-8">
   <div>
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pr-10"><p className="text-[11px] font-bold uppercase tracking-[.2em] text-[#0043f3]">Atlas Showcase Offer</p><span className="rounded-full border border-[#001d2e]/15 px-3 py-1 text-[11px] font-semibold text-[#001d2e]">5 qualifying projects</span></div>
    <Dialog.Title id="atlas-showcase-title" className="mt-4 max-w-2xl text-2xl font-semibold leading-[1.12] tracking-tight text-[#001d2e] sm:text-3xl">Save <span className="text-[#0043f3]">10%</span> on your agricultural warehouse supply.</Dialog.Title>
    <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600">We’re selecting five agricultural projects to help showcase Atlas. Configure your warehouse and submit your project for assessment.</p>
    <button type="button" onClick={onAssess} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-xl bg-[#0043f3] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0036c7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0043f3] sm:w-auto">Check if my project qualifies<ArrowRightIcon aria-hidden="true" className="h-4 w-4 shrink-0" /></button>
    <p className="mt-3 text-xs leading-5 text-slate-500">We’ll review your project and confirm eligibility before preparing your discounted quotation.</p>
   </div>
   <div className="flex flex-col justify-center border-t border-[#001d2e]/10 pt-6 md:border-l md:border-t-0 md:pl-7 md:pt-6">
    <p className="text-[11px] font-semibold uppercase tracking-[.16em] text-slate-500">Your potential saving</p>
    <div aria-live="polite" aria-atomic="true">
     <p data-offer-saving={saving ?? ''} className={`mt-3 font-semibold tabular-nums tracking-tight text-[#001d2e] ${validTotal ? "whitespace-nowrap text-3xl sm:text-4xl" : "text-xl"}`}>{saving === null ? 'Configure your warehouse' : money(saving)}<span className="mt-1 block whitespace-normal text-lg font-medium tracking-normal text-[#0043f3]">{saving === null ? 'to see your potential saving' : 'off your supply package'}</span></p>
     {validTotal && <p data-offer-supply-total={supplyTotal} className="mt-3 text-sm leading-6 text-slate-600">10% of your {money(supplyTotal)} supply-only guide.</p>}
     {scopeLabel && <p className="mt-2 text-xs leading-5 text-slate-500">{scopeLabel}</p>}
    </div>
    <p className="mt-3 max-w-xs text-xs leading-5 text-slate-500">Excludes VAT, installation and delivery. Indicative saving only, subject to qualification and your approved quotation. Your builder price remains unchanged.</p>
    <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1 border-t border-[#001d2e]/10 pt-4 text-xs font-semibold text-[#001d2e]"><span>Steel</span><span>Connections</span>{includesSheeting && <span>Sheeting</span>}</div>
   </div>
  </div>
  <div className="border-t border-[#001d2e]/10 px-5 py-4 sm:px-7 lg:px-9">
   <div className="hidden sm:block"><p className="max-w-6xl text-xs leading-5 text-slate-500">Supply only. Installation and delivery excluded. Agreed photography access and marketing usage required. Secure your place with a signed quotation and required deposit by <strong className="font-semibold text-[#001d2e]">31 January 2027</strong>, or until all five places are secured. Delivery and installation programme agreed separately. Subject to assessment, availability and offer terms.</p></div>
   <details className="sm:hidden"><summary className="cursor-pointer text-xs font-semibold leading-5 text-[#001d2e]">Supply only · Photography required · Offer terms</summary><div className="mt-3"><p className="max-w-6xl text-xs leading-5 text-slate-500">Supply only. Installation and delivery excluded. Agreed photography access and marketing usage required. Secure your place with a signed quotation and required deposit by <strong className="font-semibold text-[#001d2e]">31 January 2027</strong>, or until all five places are secured. Delivery and installation programme agreed separately. Subject to assessment, availability and offer terms.</p></div></details>
  </div>
 </section>
   </Dialog.Panel>
  </div>
 </Dialog>
}
