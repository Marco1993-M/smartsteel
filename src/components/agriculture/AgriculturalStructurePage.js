import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Check, ClipboardCheck, FileText, MapPin, ShieldCheck, PiggyBank, Bird, Milk, Beef, Fence, Wheat, Warehouse } from "lucide-react"
import { agriculturalCategories } from "../../app/agricultural-buildings/agriculturalStructureData"
import AgriculturalQuoteForm from "./AgriculturalQuoteForm"
import PoultryPlanningSection from "./PoultryPlanningSection"

const CATEGORY_ICONS = {
  "/agricultural-buildings/20-sow-piggery": PiggyBank,
  "/agricultural-buildings/poultry-houses": Bird,
  "/agricultural-buildings/dairy-milking-sheds": Milk,
  "/agricultural-buildings/cattle-feedlot-sheds": Beef,
  "/agricultural-buildings/sheep-small-stock-sheds": Fence,
  "/agricultural-buildings/grain-farm-storage": Wheat,
}

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

  return <main className="bg-white pt-20 text-[#001d2e] [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-4 [&_a:focus-visible]:outline-[#0043f3] [&_summary:focus-visible]:outline-2 [&_summary:focus-visible]:outline-offset-4 [&_summary:focus-visible]:outline-[#0043f3]">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

    <section className="relative isolate min-h-[68vh] overflow-hidden border-b border-[#b8cdd7] bg-white text-[#001d2e]">
      <div className="relative mx-auto flex min-h-[68vh] max-w-[1500px] flex-col justify-between px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
        <div className="flex items-center justify-between gap-4 border-b border-[#b8cdd7] pb-5">
          <Image src="/atlas/atlas-logo-horizontal-dark.png" alt="Atlas System developed by Smart Steel" width={238} height={44} className="max-w-full" />
          <span className="hidden border border-[#b8cdd7] bg-[#edf5f8] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#264554] sm:block">Agricultural structures</span>
        </div>
        <div className="grid items-center gap-10 py-10 lg:py-16 xl:grid-cols-[minmax(0,1fr)_270px] xl:gap-16">
        <div className="min-w-0 max-w-[820px]">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0043f3]">{content.eyebrow}</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-black leading-[1.06] tracking-tight text-balance sm:mt-5 sm:text-5xl lg:text-6xl 2xl:text-7xl">{content.title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#526c79] sm:mt-6 sm:text-lg">{content.summary}</p>
          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row">
            <a href="#agricultural-quote" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#0043f3] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#001d2e]">{content.primaryCta} <ArrowRight className="h-4 w-4" /></a>
            <Link href={primaryBuilderUrl} className="inline-flex min-h-12 items-center justify-center rounded-lg border border-[#001d2e] bg-white px-6 py-3 text-sm font-bold text-[#001d2e] transition hover:bg-[#edf5f8]">{content.heroBuilderLabel}</Link>
          </div>
        </div>
        <div className="hidden min-w-0 border-l border-[#b8cdd7] pl-8 xl:block">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#526c79]">Production basis</p>
          <p className="mt-1 text-[104px] font-black leading-none text-[#0043f3]">{content.heroMetric}</p>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#001d2e]">{content.heroMetricLabel}</p>
          <dl className="mt-8 divide-y divide-[#b8cdd7] border-y border-[#b8cdd7] text-xs">
            {content.heroFacts.map(([label, value]) => <div key={label} className="flex justify-between gap-4 py-3"><dt className="text-[#708893]">{label}</dt><dd className="font-bold">{value}</dd></div>)}
          </dl>
        </div>
        </div>
        <div className="grid border-t border-[#b8cdd7] sm:grid-cols-3">
          {[content.planLabel, content.systemLabel, content.locationLabel].map((item, index) => <div key={item} className={`py-3 text-sm font-semibold text-[#264554] sm:px-5 sm:py-4 ${index ? "sm:border-l sm:border-[#b8cdd7]" : "sm:pl-0"}`}>{item}</div>)}
        </div>
      </div>
    </section>

    <nav aria-label="Page sections" className="sticky top-20 z-30 border-b border-[#b8cdd7] bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1500px] items-center gap-5 overflow-x-auto px-5 sm:px-8 lg:px-12">
        {[["#overview", "Overview"], ...(content.poultryPlanning ? [["#poultry-planning", "Poultry planning"]] : []), ["#scope", "Building package"], ["#agricultural-quote", "Your project"], ["#responsibilities", "Who does what"], ["#project-inputs", "Project inputs"], ["#faqs", "FAQs"]].map(([href, label]) => <a key={href} href={href} className="shrink-0 whitespace-nowrap border-b-2 border-transparent px-2 py-4 text-sm font-semibold text-[#526c79] transition hover:border-[#0043f3] hover:text-[#0043f3] first:pl-0">{label}</a>)}
        <a href="#agricultural-quote" className="ml-auto hidden min-h-10 shrink-0 items-center gap-2 bg-[#0043f3] px-4 text-xs font-bold text-white transition hover:bg-[#001d2e] 2xl:inline-flex">Request quote <ArrowRight className="h-3.5 w-3.5" /></a>
      </div>
    </nav>

    <section id="overview" className="scroll-mt-44 border-b border-[#b8cdd7] bg-[#edf5f8]">
      <div className="mx-auto grid max-w-[1500px] gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-12 lg:py-24">
        <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0043f3]">Built around your plans</p><h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">{content.introTitle}</h2></div>
        <div className="space-y-5 text-base leading-8 text-[#264554]">{content.intro.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
      </div>
    </section>

    {content.poultryPlanning ? <PoultryPlanningSection content={content.poultryPlanning} /> : null}

    {!content.poultryPlanning ? <section className="border-b border-[#b8cdd7] bg-white">
      <details className="group mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-12">
        <summary className="flex min-h-20 cursor-pointer list-none items-center justify-between gap-4 py-6 font-bold [&::-webkit-details-marker]:hidden"><span>Planning guidance and technical references<span className="mt-1 block text-sm font-normal text-[#526c79]">Explore the published background behind this building application.</span></span><span aria-hidden="true" className="shrink-0 text-2xl text-[#0043f3] transition-transform group-open:rotate-45">+</span></summary>
      <div className="grid gap-8 pt-6 pb-8 lg:grid-cols-[0.72fr_1.28fr]">
        <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0043f3]">Published planning basis</p><h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">{content.planningBasis.title}</h2><p className="mt-5 text-sm leading-7 text-[#526c79]">{content.planningBasis.description}</p><div className="mt-6 flex flex-col items-start gap-3"><a href={content.planningBasis.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-[#0043f3]">{content.planningBasis.sourceLabel} <ArrowRight className="h-4 w-4" /></a><a href={content.planningBasis.supportingSourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-[#0043f3]">{content.planningBasis.supportingSourceLabel} <ArrowRight className="h-4 w-4" /></a></div></div>
        <div className="border-y border-[#b8cdd7]">{content.planningBasis.points.map((item, index) => <div key={item} className="grid grid-cols-[40px_1fr] gap-4 border-b border-[#b8cdd7] py-4 last:border-b-0"><span className="font-mono text-xs font-bold text-[#0043f3]">0{index + 1}</span><p className="text-sm font-semibold leading-6 text-[#264554]">{item}</p></div>)}</div>
      </div>
      </details>
    </section> : null}

    <section className="bg-[#001d2e] text-white">
      <div className="mx-auto max-w-[1500px] px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
        <div className="max-w-4xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#73a8ff]">Atlas building pathway</p><h2 className="mt-3 text-2xl font-black sm:text-3xl">{content.builderSectionTitle}</h2><p className="mt-3 text-sm leading-7 text-[#c1d9e5]">{content.builderSectionDescription}</p></div>
        <div className="mt-9 border-y border-[#315364]">
          {hasBuilderConfigurations ? content.builderConfigurations.map((configuration, index) => <div key={configuration.code} className="grid gap-5 border-b border-[#315364] py-6 last:border-b-0 md:grid-cols-[80px_1fr_auto] md:items-center md:gap-8"><span className="font-mono text-sm font-bold text-[#ffcf1a]">0{index + 1}</span><div><div className="flex flex-wrap items-baseline gap-x-4 gap-y-1"><h3 className="text-lg font-black">{configuration.title}</h3><span className="font-mono text-sm font-bold text-[#73a8ff]">{configuration.width}m × {configuration.length}m × {configuration.height}m</span></div><p className="mt-2 max-w-3xl text-sm leading-6 text-[#9fbbc8]">{configuration.note}</p><p className="mt-2 max-w-3xl text-xs leading-5 text-white/55">Sizing basis: {configuration.basis}</p></div><Link href={builderHref(configuration)} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 border border-white/50 px-5 text-sm font-bold text-white transition hover:border-[#ffcf1a] hover:bg-[#ffcf1a] hover:text-[#001d2e]">View in 3D <ArrowRight className="h-4 w-4" /></Link></div>) : <div className="grid gap-6 py-7 md:grid-cols-[1fr_auto] md:items-center"><div><h3 className="text-lg font-black">Let’s find a building size that works for your plans</h3><p className="mt-2 max-w-3xl text-sm leading-7 text-[#9fbbc8]">{content.sizingGuidance}</p></div><a href="#agricultural-quote" className="inline-flex min-h-11 items-center justify-center gap-2 border border-[#ffcf1a] px-5 text-sm font-bold text-[#ffcf1a] transition hover:bg-[#ffcf1a] hover:text-[#001d2e]">Tell us what you have in mind <ArrowRight className="h-4 w-4" /></a></div>}
        </div>
      </div>
    </section>

    <section id="scope" className="mx-auto max-w-[1500px] scroll-mt-44 px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
      <div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0043f3]">Smart Steel scope</p><h2 className="mt-4 text-3xl font-black sm:text-4xl">A clear building package for your next step</h2><p className="mt-4 text-base leading-7 text-[#526c79]">We help you work through the building options and understand what is included, so you can budget for the steel package and plan the work around it.</p></div>
      <div className="mt-10 grid border-y border-[#b8cdd7] md:grid-cols-3">{content.scope.map((item, index) => <article key={item.title} className={`relative py-8 md:px-8 ${index ? "border-t border-[#b8cdd7] md:border-l md:border-t-0" : "md:pl-0"}`}><span className="font-mono text-xs font-bold text-[#0043f3]">0{index + 1}</span><h3 className="mt-8 text-xl font-black">{item.title}</h3><p className="mt-3 text-sm leading-7 text-[#526c79]">{item.text}</p><span className="absolute bottom-0 left-0 h-1 w-12 bg-[#0043f3] md:left-8" /></article>)}</div>
      <div className="mt-10 flex flex-col gap-5 border-l-4 border-[#ffcf1a] bg-[#001d2e] px-6 py-7 text-white sm:flex-row sm:items-center sm:justify-between sm:px-8"><div><h3 className="text-xl font-black">{content.ctaPrompt}</h3><p className="mt-2 max-w-3xl text-sm leading-6 text-[#c1d9e5]">{content.ctaDetail}</p></div><a href="#agricultural-quote" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#ffcf1a] px-5 py-3 text-sm font-bold text-[#001d2e] transition hover:bg-white">Tell us about your project <ArrowRight className="h-4 w-4" /></a></div>
    </section>

    <section id="agricultural-quote" className="scroll-mt-44 border-y border-[#b8cdd7] bg-white">
      <div className="mx-auto grid max-w-[1500px] gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.7fr_1.3fr] lg:px-12 lg:py-24">
        <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0043f3]">Agricultural project brief</p><h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">Let’s plan your {content.planLabel}</h2><p className="mt-5 text-base leading-8 text-[#526c79]">Tell us what you want to achieve, where you want to build and what you know so far. We will help you work through the building options and what to do next.</p><div className="mt-8 border-t border-[#b8cdd7] pt-6 text-sm leading-7 text-[#264554]"><p className="font-black">A few details help us get started</p><p className="mt-2">{content.formGuidance}</p></div>
          <div className="mt-8 rounded-xl bg-[#edf5f8] p-6">
            <h3 className="text-lg font-black">What happens next?</h3>
            <ol className="mt-5 space-y-5">
              {[
                ["Share your plans", "Tell us about your site and what you want to achieve. It’s fine if some details are still undecided."],
                ["Work through the scope", "We’ll get in touch to clarify the building requirements and discuss the options with you."],
                ["Receive your proposal", "Once the scope is clear, we’ll prepare a proposal showing the pricing, inclusions and next steps."],
              ].map(([title, text], index) => <li key={title} className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-[#0043f3]">{index + 1}</span><div><h4 className="text-sm font-bold">{title}</h4><p className="mt-1 text-sm leading-6 text-[#526c79]">{text}</p></div></li>)}
            </ol>
          </div>
        </div>
        <AgriculturalQuoteForm key={content.slug} content={{ planLabel: content.planLabel }} {...content.quoteForm} />
      </div>
    </section>

    <section id="responsibilities" className="scroll-mt-44 bg-[#001d2e] text-white">
      <div className="mx-auto max-w-[1500px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ffcf1a]">Planning the project together</p><h2 className="mt-4 text-3xl font-black sm:text-4xl">A shared plan, with everyone’s role clear</h2></div>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[#c1d9e5]">We help define the steel building package. Your farm and specialist team coordinate the operational requirements, site preparation and approvals. The agreed quotation confirms the scope.</p>
        <details className="group mt-6 border-y border-[#315364]">
          <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-4 font-bold [&::-webkit-details-marker]:hidden"><span>View detailed roles and responsibilities</span><span aria-hidden="true" className="text-2xl text-[#ffcf1a] transition-transform group-open:rotate-45">+</span></summary>
        <div className="mb-6 grid border border-[#315364] lg:grid-cols-2">
          <div className="relative p-6 sm:p-8"><span className="absolute right-6 top-5 font-mono text-5xl font-black text-white/5">01</span><div className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-[#ffcf1a]" /><h3 className="text-lg font-black">Smart Steel structural scope</h3></div><ul className="mt-6 space-y-4">{content.responsibilities.smartSteel.map((item) => <li key={item} className="flex gap-3 text-sm leading-6 text-[#dbe8ee]"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#ffcf1a]" />{item}</li>)}</ul></div>
          <div className="relative border-t border-[#315364] p-6 sm:p-8 lg:border-l lg:border-t-0"><span className="absolute right-6 top-5 font-mono text-5xl font-black text-white/5">02</span><div className="flex items-center gap-3"><ClipboardCheck className="h-5 w-5 text-[#73a8ff]" /><h3 className="text-lg font-black">Your farm and specialist team</h3></div><ul className="mt-6 space-y-4">{content.responsibilities.client.map((item) => <li key={item} className="flex gap-3 text-sm leading-6 text-[#dbe8ee]"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#73a8ff]" />{item}</li>)}</ul></div>
        </div>
        </details>
        <p className="mt-5 border-l-2 border-[#ffcf1a] pl-4 text-xs leading-6 text-[#9fbbc8]">{content.disclaimer}</p>
      </div>
    </section>

    {!content.poultryPlanning ? <section className="mx-auto max-w-[1500px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
      <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr]">
        <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0043f3]">Agricultural design inputs</p><h2 className="mt-4 text-3xl font-black sm:text-4xl">Plan the details around your daily farm work</h2><p className="mt-4 text-base leading-7 text-[#526c79]">Working through these details early helps us shape a building proposal around how you will use the space.</p></div>
        <div className="grid border-t border-[#b8cdd7] sm:grid-cols-2">{content.considerations.map((item, index) => <article key={item.title} className={`border-b border-[#b8cdd7] py-7 sm:px-7 ${index % 2 ? "sm:border-l" : "sm:pl-0"}`}><div className="flex items-baseline justify-between gap-4"><h3 className="text-lg font-black">{item.title}</h3><span className="font-mono text-xs font-bold text-[#0043f3]">0{index + 1}</span></div><p className="mt-3 text-sm leading-7 text-[#526c79]">{item.text}</p></article>)}</div>
      </div>
    </section> : null}

    <section id="project-inputs" className="scroll-mt-44 bg-[#edf5f8]">
      <div className="mx-auto grid max-w-[1500px] gap-12 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:px-12 lg:py-24">
        <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0043f3]">What to send</p><h2 className="mt-4 text-3xl font-black sm:text-4xl">Information for a useful first review</h2><ul className="mt-8 divide-y divide-[#b8cdd7] border-y border-[#b8cdd7]">{content.inputs.map((item) => <li key={item} className="flex gap-3 py-4 text-sm font-semibold text-[#264554]"><FileText className="h-5 w-5 shrink-0 text-[#0043f3]" />{item}</li>)}</ul></div>
        <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0043f3]">Delivery roadmap</p><div className="mt-6 border-t border-[#b8cdd7]">{content.process.map((item) => <div key={item.number} className="grid grid-cols-[44px_1fr] gap-4 border-b border-[#b8cdd7] py-5"><span className="font-mono text-sm font-bold text-[#0043f3]">{item.number}</span><div><h3 className="font-black">{item.title}</h3><p className="mt-2 text-sm leading-6 text-[#526c79]">{item.text}</p></div></div>)}</div></div>
      </div>
    </section>

    <section id="faqs" className="scroll-mt-44 border-y border-[#b8cdd7] bg-[#f7fafb]">
      <div className="mx-auto max-w-[1100px] px-5 py-16 sm:px-8 lg:py-24"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0043f3]">Questions as you plan</p><h2 className="mt-4 text-3xl font-black sm:text-4xl">{content.planLabel} FAQs</h2><div className="mt-8 divide-y divide-[#b8cdd7] border-y border-[#b8cdd7]">{content.faqs.map((item) => <details key={item.question} className="group py-1"><summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-4 font-bold [&::-webkit-details-marker]:hidden"><span>{item.question}</span><span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-xl text-[#0043f3] transition-transform group-open:rotate-45">+</span></summary><p className="max-w-3xl pb-5 text-sm leading-7 text-[#526c79]">{item.answer}</p></details>)}</div></div>
    </section>

    <section className="mx-auto max-w-[1500px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
      <div className="flex flex-wrap items-end justify-between gap-6"><div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0043f3]">Agricultural building system</p><h2 className="mt-4 text-3xl font-black sm:text-4xl">More ways to build for your farm</h2></div><Link href="/agricultural-buildings" className="inline-flex items-center gap-2 text-sm font-bold text-[#0043f3]">Explore agricultural buildings <ArrowRight className="h-4 w-4" /></Link></div>
      <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{agriculturalCategories.filter((item) => item.href !== `/agricultural-buildings/${content.slug}`).map((item) => { const Icon = CATEGORY_ICONS[item.href] || Warehouse; const body = <><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#edf5f8] text-[#0043f3]"><Icon className="h-5 w-5" aria-hidden="true" /></span><h3 className="mt-5 text-xl font-black">{item.title}</h3><p className="mt-3 text-sm leading-7 text-[#526c79]">{item.description}</p><span className="mt-auto flex items-center gap-2 pt-6 text-sm font-bold text-[#0043f3]">Explore this building <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" /></span></>; return item.href ? <Link key={item.title} href={item.href} className="group flex flex-col rounded-xl border border-[#b8cdd7] p-6 transition hover:border-[#0043f3] hover:bg-[#f7fafb] hover:shadow-sm">{body}</Link> : <article key={item.title} className="border border-[#b8cdd7] p-6">{body}</article> })}</div>
    </section>

    <section className="bg-[#0043f3] text-white"><div className="mx-auto flex max-w-[1500px] flex-col gap-8 px-5 py-14 sm:px-8 xl:flex-row xl:items-center xl:justify-between lg:px-12"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#cfe0ff]">Your farm. Your next step.</p><h2 className="mt-3 max-w-3xl text-3xl font-black">Tell us where you want to take your farm. We’ll help plan the building.</h2><p className="mt-3 flex items-center gap-2 text-sm text-[#e2ebff]"><MapPin className="h-4 w-4" />Project reviews across South Africa · Reviewed {content.lastReviewed}</p></div><div className="flex flex-col gap-3 sm:flex-row xl:shrink-0 xl:flex-col"><a href="#agricultural-quote" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-bold text-[#001d2e] transition hover:bg-[#ffcf1a]">{content.primaryCta} <ArrowRight className="h-4 w-4" /></a><a href={`tel:+27828464555`} className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/70 px-6 py-3 text-sm font-bold text-white transition hover:bg-white hover:text-[#001d2e]">Call +27 82 846 4555</a></div></div></section>
  </main>
}
