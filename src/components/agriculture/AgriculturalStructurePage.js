import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Check, ClipboardCheck, FileText, MapPin, ShieldCheck, Sprout } from "lucide-react"
import { agriculturalCategories } from "../../app/agricultural-buildings/agriculturalStructureData"
import AgriculturalQuoteForm from "./AgriculturalQuoteForm"

const SITE_URL = "https://www.smartsteel.co.za"

function builderHref(configuration) {
  const params = new URLSearchParams({
    productType: "Atlas Warehouse",
    width: String(configuration.width),
    length: String(configuration.length),
    height: String(configuration.height),
    sheeting: "roof_only",
  })
  return `/warehouse-builder?${params.toString()}`
}

export default function AgriculturalStructurePage({ content }) {
  const pageUrl = `${SITE_URL}/agricultural-buildings/${content.slug}`
  const hasBuilderConfigurations = content.builderConfigurations.length > 0
  const primaryBuilderUrl = hasBuilderConfigurations ? builderHref(content.builderConfigurations[0]) : "/warehouse-builder?productType=Atlas+Warehouse"
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: content.title,
        description: content.metaDescription,
        url: pageUrl,
        areaServed: { "@type": "Country", name: "South Africa" },
        provider: { "@type": "Organization", name: "Smart Steel", url: SITE_URL },
        serviceType: "Agricultural structural steel supply",
        offers: {
          "@type": "Offer",
          availability: "https://schema.org/InStock",
          url: pageUrl,
          description: "Project-specific structural quotation subject to plan, site and scope review.",
        },
      },
      {
        "@type": "WebPage",
        name: content.metaTitle,
        description: content.metaDescription,
        url: pageUrl,
        dateModified: content.lastReviewedIso,
        inLanguage: "en-ZA",
        isPartOf: { "@type": "WebSite", name: "Smart Steel South Africa", url: SITE_URL },
        about: { "@type": "Thing", name: content.planLabel },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Agricultural buildings", item: `${SITE_URL}/agricultural-buildings` },
          { "@type": "ListItem", position: 3, name: content.planLabel, item: pageUrl },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: content.faqs.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      },
    ],
  }

  return <main className="bg-white pt-20 text-[#001d2e]">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

    <section className="relative isolate min-h-[68vh] overflow-hidden border-b border-[#b8cdd7] bg-white text-[#001d2e]">
      <div className="relative mx-auto flex min-h-[68vh] max-w-[1500px] flex-col justify-between px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
        <div className="flex items-center justify-between gap-4 border-b border-[#b8cdd7] pb-5">
          <Image src="/atlas/atlas-logo-horizontal-dark.png" alt="Atlas System developed by Smart Steel" width={238} height={44} className="max-w-full" />
          <span className="hidden border border-[#b8cdd7] bg-[#edf5f8] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#264554] sm:block">Agricultural structures</span>
        </div>
        <div className="max-w-4xl py-8 lg:max-w-[760px] lg:py-16 xl:max-w-[820px]">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0043f3]">{content.eyebrow}</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-black leading-[1.02] sm:mt-5 sm:text-5xl lg:text-7xl">{content.title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#526c79] sm:mt-6 sm:text-lg">{content.summary}</p>
          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row">
            <a href="#agricultural-quote" className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#0043f3] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#001d2e]">{content.primaryCta} <ArrowRight className="h-4 w-4" /></a>
            <Link href={primaryBuilderUrl} className="inline-flex min-h-12 items-center justify-center border border-[#001d2e] bg-white px-6 py-3 text-sm font-bold text-[#001d2e] transition hover:bg-[#edf5f8]">{content.heroBuilderLabel}</Link>
          </div>
        </div>
        <div className="pointer-events-none absolute right-12 top-[170px] hidden w-[270px] border-l border-[#b8cdd7] pl-8 xl:block">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#526c79]">Production basis</p>
          <p className="mt-1 text-[128px] font-black leading-none text-[#0043f3]">{content.heroMetric}</p>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#001d2e]">{content.heroMetricLabel}</p>
          <dl className="mt-8 divide-y divide-[#b8cdd7] border-y border-[#b8cdd7] text-xs">
            {content.heroFacts.map(([label, value]) => <div key={label} className="flex justify-between gap-4 py-3"><dt className="text-[#708893]">{label}</dt><dd className="font-bold">{value}</dd></div>)}
          </dl>
        </div>
        <div className="grid border-t border-[#b8cdd7] sm:grid-cols-3">
          {[content.planLabel, content.systemLabel, content.locationLabel].map((item, index) => <div key={item} className={`py-3 text-sm font-semibold text-[#264554] sm:px-5 sm:py-4 ${index ? "sm:border-l sm:border-[#b8cdd7]" : "sm:pl-0"}`}>{item}</div>)}
        </div>
      </div>
    </section>

    <nav aria-label="Page sections" className="sticky top-20 z-30 border-b border-[#b8cdd7] bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1500px] items-center gap-5 overflow-x-auto px-5 sm:px-8 lg:px-12">
        {[["#overview", "Overview"], ["#scope", "Structural scope"], ["#responsibilities", "Responsibilities"], ["#project-inputs", "Project inputs"], ["#faqs", "FAQs"]].map(([href, label]) => <a key={href} href={href} className="shrink-0 whitespace-nowrap border-b-2 border-transparent px-2 py-4 text-xs font-bold text-[#526c79] transition hover:border-[#0043f3] hover:text-[#0043f3] first:pl-0">{label}</a>)}
        <a href="#agricultural-quote" className="ml-auto hidden min-h-10 shrink-0 items-center gap-2 bg-[#0043f3] px-4 text-xs font-bold text-white transition hover:bg-[#001d2e] 2xl:inline-flex">Request quote <ArrowRight className="h-3.5 w-3.5" /></a>
      </div>
    </nav>

    <section id="overview" className="scroll-mt-20 border-b border-[#b8cdd7] bg-[#edf5f8]">
      <div className="mx-auto grid max-w-[1500px] gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-12 lg:py-24">
        <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0043f3]">Operation-led delivery</p><h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">{content.introTitle}</h2></div>
        <div className="space-y-5 text-base leading-8 text-[#264554]">{content.intro.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
      </div>
    </section>

    <section className="border-b border-[#b8cdd7] bg-white">
      <div className="mx-auto grid max-w-[1500px] gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[0.72fr_1.28fr] lg:px-12 lg:py-20">
        <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0043f3]">Published planning basis</p><h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">{content.planningBasis.title}</h2><p className="mt-5 text-sm leading-7 text-[#526c79]">{content.planningBasis.description}</p><div className="mt-6 flex flex-col items-start gap-3"><a href={content.planningBasis.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-[#0043f3]">{content.planningBasis.sourceLabel} <ArrowRight className="h-4 w-4" /></a><a href={content.planningBasis.supportingSourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-[#0043f3]">{content.planningBasis.supportingSourceLabel} <ArrowRight className="h-4 w-4" /></a></div></div>
        <div className="border-y border-[#b8cdd7]">{content.planningBasis.points.map((item, index) => <div key={item} className="grid grid-cols-[40px_1fr] gap-4 border-b border-[#b8cdd7] py-4 last:border-b-0"><span className="font-mono text-xs font-bold text-[#0043f3]">0{index + 1}</span><p className="text-sm font-semibold leading-6 text-[#264554]">{item}</p></div>)}</div>
      </div>
    </section>

    <section className="bg-[#001d2e] text-white">
      <div className="mx-auto max-w-[1500px] px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
        <div className="max-w-4xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#73a8ff]">Atlas building pathway</p><h2 className="mt-3 text-2xl font-black sm:text-3xl">{content.builderSectionTitle}</h2><p className="mt-3 text-sm leading-7 text-[#c1d9e5]">{content.builderSectionDescription}</p></div>
        <div className="mt-9 border-y border-[#315364]">
          {hasBuilderConfigurations ? content.builderConfigurations.map((configuration, index) => <div key={configuration.code} className="grid gap-5 border-b border-[#315364] py-6 last:border-b-0 md:grid-cols-[80px_1fr_auto] md:items-center md:gap-8"><span className="font-mono text-sm font-bold text-[#ffcf1a]">0{index + 1}</span><div><div className="flex flex-wrap items-baseline gap-x-4 gap-y-1"><h3 className="text-lg font-black">{configuration.title}</h3><span className="font-mono text-sm font-bold text-[#73a8ff]">{configuration.width}m × {configuration.length}m × {configuration.height}m</span></div><p className="mt-2 max-w-3xl text-sm leading-6 text-[#9fbbc8]">{configuration.note}</p><p className="mt-2 max-w-3xl text-xs leading-5 text-white/55">Sizing basis: {configuration.basis}</p></div><Link href={builderHref(configuration)} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 border border-white/50 px-5 text-sm font-bold text-white transition hover:border-[#ffcf1a] hover:bg-[#ffcf1a] hover:text-[#001d2e]">View in 3D <ArrowRight className="h-4 w-4" /></Link></div>) : <div className="grid gap-6 py-7 md:grid-cols-[1fr_auto] md:items-center"><div><h3 className="text-lg font-black">Size the shell from the operating brief</h3><p className="mt-2 max-w-3xl text-sm leading-7 text-[#9fbbc8]">{content.sizingGuidance}</p></div><a href="#agricultural-quote" className="inline-flex min-h-11 items-center justify-center gap-2 border border-[#ffcf1a] px-5 text-sm font-bold text-[#ffcf1a] transition hover:bg-[#ffcf1a] hover:text-[#001d2e]">Send the project brief <ArrowRight className="h-4 w-4" /></a></div>}
        </div>
      </div>
    </section>

    <section id="scope" className="mx-auto max-w-[1500px] scroll-mt-20 px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
      <div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0043f3]">Smart Steel scope</p><h2 className="mt-4 text-3xl font-black sm:text-4xl">A structural package with clear boundaries</h2><p className="mt-4 text-base leading-7 text-[#526c79]">The quotation starts with the building shell and records exactly what Smart Steel will supply, coordinate and deliver.</p></div>
      <div className="mt-10 grid border-y border-[#b8cdd7] md:grid-cols-3">{content.scope.map((item, index) => <article key={item.title} className={`relative py-8 md:px-8 ${index ? "border-t border-[#b8cdd7] md:border-l md:border-t-0" : "md:pl-0"}`}><span className="font-mono text-xs font-bold text-[#0043f3]">0{index + 1}</span><h3 className="mt-8 text-xl font-black">{item.title}</h3><p className="mt-3 text-sm leading-7 text-[#526c79]">{item.text}</p><span className="absolute bottom-0 left-0 h-1 w-12 bg-[#0043f3] md:left-8" /></article>)}</div>
      <div className="mt-10 flex flex-col gap-5 border-l-4 border-[#ffcf1a] bg-[#001d2e] px-6 py-7 text-white sm:flex-row sm:items-center sm:justify-between sm:px-8"><div><h3 className="text-xl font-black">{content.ctaPrompt}</h3><p className="mt-2 max-w-3xl text-sm leading-6 text-[#c1d9e5]">{content.ctaDetail}</p></div><a href="#agricultural-quote" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 bg-[#ffcf1a] px-5 py-3 text-sm font-bold text-[#001d2e] transition hover:bg-white">Start the quote request <ArrowRight className="h-4 w-4" /></a></div>
    </section>

    <section id="agricultural-quote" className="scroll-mt-44 border-y border-[#b8cdd7] bg-white">
      <div className="mx-auto grid max-w-[1500px] gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.7fr_1.3fr] lg:px-12 lg:py-24">
        <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0043f3]">Agricultural project brief</p><h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">Request an Atlas review for your {content.planLabel}</h2><p className="mt-5 text-base leading-8 text-[#526c79]">Share the farm location, production intent and structural package you need. You do not need a finished plan to start the conversation.</p><div className="mt-8 border-t border-[#b8cdd7] pt-6 text-sm leading-7 text-[#264554]"><p className="font-black">Useful before you start</p><p className="mt-2">{content.formGuidance}</p></div></div>
        <AgriculturalQuoteForm content={{ planLabel: content.planLabel }} {...content.quoteForm} />
      </div>
    </section>

    <section id="responsibilities" className="scroll-mt-20 bg-[#001d2e] text-white">
      <div className="mx-auto max-w-[1500px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ffcf1a]">Responsibility matrix</p><h2 className="mt-4 text-3xl font-black sm:text-4xl">Know who carries each part of the project</h2></div>
        <div className="mt-10 grid border border-[#315364] lg:grid-cols-2">
          <div className="relative p-6 sm:p-8"><span className="absolute right-6 top-5 font-mono text-5xl font-black text-white/5">01</span><div className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-[#ffcf1a]" /><h3 className="text-lg font-black">Smart Steel structural scope</h3></div><ul className="mt-6 space-y-4">{content.responsibilities.smartSteel.map((item) => <li key={item} className="flex gap-3 text-sm leading-6 text-[#dbe8ee]"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#ffcf1a]" />{item}</li>)}</ul></div>
          <div className="relative border-t border-[#315364] p-6 sm:p-8 lg:border-l lg:border-t-0"><span className="absolute right-6 top-5 font-mono text-5xl font-black text-white/5">02</span><div className="flex items-center gap-3"><ClipboardCheck className="h-5 w-5 text-[#73a8ff]" /><h3 className="text-lg font-black">Client and professional team</h3></div><ul className="mt-6 space-y-4">{content.responsibilities.client.map((item) => <li key={item} className="flex gap-3 text-sm leading-6 text-[#dbe8ee]"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#73a8ff]" />{item}</li>)}</ul></div>
        </div>
        <p className="mt-5 border-l-2 border-[#ffcf1a] pl-4 text-xs leading-6 text-[#9fbbc8]">{content.disclaimer}</p>
      </div>
    </section>

    <section className="mx-auto max-w-[1500px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
      <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr]">
        <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0043f3]">Agricultural design inputs</p><h2 className="mt-4 text-3xl font-black sm:text-4xl">The structure has to support the operation</h2><p className="mt-4 text-base leading-7 text-[#526c79]">These considerations shape the brief before a steel package can be responsibly confirmed.</p></div>
        <div className="grid border-t border-[#b8cdd7] sm:grid-cols-2">{content.considerations.map((item, index) => <article key={item.title} className={`border-b border-[#b8cdd7] py-7 sm:px-7 ${index % 2 ? "sm:border-l" : "sm:pl-0"}`}><div className="flex items-baseline justify-between gap-4"><h3 className="text-lg font-black">{item.title}</h3><span className="font-mono text-xs font-bold text-[#0043f3]">0{index + 1}</span></div><p className="mt-3 text-sm leading-7 text-[#526c79]">{item.text}</p></article>)}</div>
      </div>
    </section>

    <section id="project-inputs" className="scroll-mt-20 bg-[#edf5f8]">
      <div className="mx-auto grid max-w-[1500px] gap-12 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:px-12 lg:py-24">
        <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0043f3]">What to send</p><h2 className="mt-4 text-3xl font-black sm:text-4xl">Information for a useful first review</h2><ul className="mt-8 divide-y divide-[#b8cdd7] border-y border-[#b8cdd7]">{content.inputs.map((item) => <li key={item} className="flex gap-3 py-4 text-sm font-semibold text-[#264554]"><FileText className="h-5 w-5 shrink-0 text-[#0043f3]" />{item}</li>)}</ul></div>
        <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0043f3]">Delivery roadmap</p><div className="mt-6 border-t border-[#b8cdd7]">{content.process.map((item) => <div key={item.number} className="grid grid-cols-[44px_1fr] gap-4 border-b border-[#b8cdd7] py-5"><span className="font-mono text-sm font-bold text-[#0043f3]">{item.number}</span><div><h3 className="font-black">{item.title}</h3><p className="mt-2 text-sm leading-6 text-[#526c79]">{item.text}</p></div></div>)}</div></div>
      </div>
    </section>

    <section className="mx-auto max-w-[1500px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
      <div className="flex flex-wrap items-end justify-between gap-6"><div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0043f3]">Agricultural building system</p><h2 className="mt-4 text-3xl font-black sm:text-4xl">One template, distinct farming applications</h2></div><Link href="/agricultural-buildings" className="inline-flex items-center gap-2 text-sm font-bold text-[#0043f3]">View the category roadmap <ArrowRight className="h-4 w-4" /></Link></div>
      <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{agriculturalCategories.filter((item) => item.href !== `/agricultural-buildings/${content.slug}`).map((item) => { const body = <><Sprout className="h-5 w-5 text-[#0043f3]" /><h3 className="mt-5 text-xl font-black">{item.title}</h3><p className="mt-3 text-sm leading-7 text-[#526c79]">{item.description}</p><p className="mt-6 text-[10px] font-bold uppercase tracking-[0.16em] text-[#8295a0]">{item.status}</p></>; return item.href ? <Link key={item.title} href={item.href} className="border border-[#b8cdd7] p-6 transition hover:border-[#0043f3] hover:bg-[#f7fafb]">{body}</Link> : <article key={item.title} className="border border-[#b8cdd7] p-6">{body}</article> })}</div>
    </section>

    <section id="faqs" className="scroll-mt-20 border-y border-[#b8cdd7] bg-[#f7fafb]">
      <div className="mx-auto max-w-[1100px] px-5 py-16 sm:px-8 lg:py-24"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0043f3]">Questions before quotation</p><h2 className="mt-4 text-3xl font-black sm:text-4xl">{content.planLabel} FAQs</h2><div className="mt-8 divide-y divide-[#b8cdd7] border-y border-[#b8cdd7]">{content.faqs.map((item) => <details key={item.question} className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold"><span>{item.question}</span><span className="text-xl text-[#0043f3] group-open:rotate-45">+</span></summary><p className="max-w-3xl pt-4 text-sm leading-7 text-[#526c79]">{item.answer}</p></details>)}</div></div>
    </section>

    <section className="bg-[#0043f3] text-white"><div className="mx-auto flex max-w-[1500px] flex-col gap-8 px-5 py-14 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-12"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#cfe0ff]">Start with the plan and site</p><h2 className="mt-3 max-w-3xl text-3xl font-black">Bring us the agricultural brief. We’ll define the structural next step.</h2><p className="mt-3 flex items-center gap-2 text-sm text-[#e2ebff]"><MapPin className="h-4 w-4" />Project reviews across South Africa · Reviewed {content.lastReviewed}</p></div><div className="flex flex-col gap-3 sm:flex-row"><a href="#agricultural-quote" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 bg-white px-6 py-3 text-sm font-bold text-[#001d2e] transition hover:bg-[#ffcf1a]">{content.primaryCta} <ArrowRight className="h-4 w-4" /></a><a href={`tel:+27828464555`} className="inline-flex min-h-12 items-center justify-center border border-white/70 px-6 py-3 text-sm font-bold text-white transition hover:bg-white hover:text-[#001d2e]">Call +27 82 846 4555</a></div></div></section>
  </main>
}
