"use client";

import Image from "next/image";
import Link from "../../components/BuilderEntryLink";
import Script from "next/script";
import {
  ArrowRight,
  Building2,
  Calculator,
  CarFront,
  Check,
  MapPin,
  Mountain,
  PanelsTopLeft,
  Ruler,
  ShieldCheck,
  Truck,
} from "lucide-react";

const solutions = [
  {
    eyebrow: "Parking plus solar generation",
    title: "Atlas solar carports",
    description:
      "Turn open parking areas into productive solar infrastructure. Atlas solar carports provide a purpose-designed steel support system for PV panels while adding shade and weather protection for vehicles.",
    image: "/solar_carport_model.webp",
    imageAlt: "Atlas solar carport 3D builder showing a six-car single-row steel structure",
    href: "/products/cflc-solar-carports",
    builderHref: "/tools/solar-carport-estimator",
    builderCta: "Build a solar carport in 3D",
    detailsCta: "View carport details",
    points: [
      "Commercial parking areas and office parks",
      "Retail centres, schools and fleet facilities",
      "Layouts planned around bays, access and panel coverage",
    ],
    icon: CarFront,
  },
  {
    eyebrow: "Open-land solar arrays",
    title: "Atlas solar ground mounts",
    description:
      "Build a stable support platform for ground-mounted PV arrays where roof space is limited, unsuitable or simply not the best option. The structure can be configured around the site, array size and project requirements.",
    image: "/solar_ground_mount_model.webp",
    imageAlt: "Atlas solar ground mount 3D builder showing a 36-panel steel structure",
    href: "/products/cflc-ground-mounts",
    builderHref: "/products/cflc-ground-mounts#ground-mount-estimator",
    builderCta: "Build a ground mount in 3D",
    detailsCta: "View ground mount details",
    points: [
      "Farms, commercial sites and open land",
      "Scalable rows for small and large arrays",
      "Designed around terrain, wind and foundation conditions",
    ],
    icon: PanelsTopLeft,
  },
];

const comparisonRows = [
  ["Best suited to", "Existing or planned parking areas", "Open ground with good solar exposure"],
  ["Primary benefit", "Solar support plus covered parking", "Dedicated, scalable panel support"],
  ["Layout starts with", "Parking bays, circulation and panel count", "Available land, row spacing and panel count"],
  ["Typical users", "Businesses, schools, retail and fleets", "Farms and commercial sites"],
];

const projectFactors = [
  { icon: Ruler, title: "Layout", text: "Bay count, row length, panel quantity and usable site area." },
  { icon: Mountain, title: "Site", text: "Ground conditions, levels, access and foundation requirements." },
  { icon: ShieldCheck, title: "Engineering", text: "Wind region, structural loads and project-specific design inputs." },
  { icon: Truck, title: "Delivery", text: "Project location, installation scope and required finish." },
];

const faqs = [
  {
    question: "Does Smart Steel supply solar panels and electrical equipment?",
    answer:
      "Smart Steel focuses on the steel support structure. Solar panels, inverters, batteries, cabling and electrical installation are normally supplied by your solar or electrical contractor unless specifically included in a project quotation.",
  },
  {
    question: "Should I choose a solar carport or a ground mount?",
    answer:
      "Choose a solar carport when you want to use a parking area and gain covered bays at the same time. Choose a ground mount when suitable open land is available and the priority is an efficient, scalable solar array. Our team can help compare the options for your site.",
  },
  {
    question: "Can I estimate a solar carport online?",
    answer:
      "Yes. The Smart Steel solar carport estimator gives you a practical starting point based on your parking layout. A final quotation follows once the site, engineering inputs and project scope have been confirmed.",
  },
  {
    question: "What affects the price of a solar support structure?",
    answer:
      "The main factors are the number of bays or panels, structural layout, site and foundation conditions, wind loads, finish, delivery location and whether installation is included.",
  },
  {
    question: "Where are Atlas solar structures available?",
    answer:
      "Smart Steel supports solar structure projects across South Africa. Delivery and installation scope depend on the project location and requirements, so contact us with the site address for accurate guidance.",
  },
];

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Solar carports and solar ground mount structures",
  provider: {
    "@type": "Organization",
    name: "Smart Steel South Africa",
    url: "https://www.smartsteel.co.za",
  },
  areaServed: { "@type": "Country", name: "South Africa" },
  serviceType: "Steel support structures for solar PV installations",
  description: "Atlas steel structures for solar carports and ground-mounted solar arrays in South Africa.",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Atlas solar structures",
    itemListElement: solutions.map((solution) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: solution.title,
        url: `https://www.smartsteel.co.za${solution.href}`,
      },
    })),
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://www.smartsteel.co.za" },
    { "@type": "ListItem", position: 2, name: "Solar structures", item: "https://www.smartsteel.co.za/solar" },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
};

export default function SolarClient() {
  return (
    <main className="bg-white text-[#001d2e] [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-4 [&_a:focus-visible]:outline-[#0043f3]">
      <Script id="solar-service-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <Script id="solar-breadcrumb-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Script id="solar-faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 py-10 sm:px-8 lg:grid-cols-2 lg:gap-14 lg:py-16">
          <div>
            <Image src="/atlas/atlas-logo-horizontal-dark.png" alt="Atlas System developed by Smart Steel" width={238} height={44} className="mb-8 h-auto w-52" />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0043f3]">Steel structures for solar</p>
            <h1 className="mt-4 text-4xl font-bold leading-[1.08] tracking-[-0.035em] sm:text-5xl">Solar carports and ground mounts in South Africa.</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#526a78]">Make more of your parking or open land. Atlas provides the steel support structure for your solar array, with layouts you can explore and price online.</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/tools/solar-carport-estimator" className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-[#0043f3] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0036c4]">Plan a solar carport <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/products/cflc-ground-mounts#ground-mount-estimator" className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl border border-[#dce6ed] px-5 py-3 text-sm font-semibold transition hover:bg-[#f3f7fa]">Plan a ground mount <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <p className="mt-4 max-w-lg text-xs leading-6 text-[#526a78]">Steel structure supply. Panels and electrical systems are arranged with your solar contractor unless expressly quoted.</p>
          </div>
          <div className="overflow-hidden rounded-3xl border border-[#dce6ed] bg-[#f3f7fa]">
            <div className="relative aspect-[4/3]"><Image src="/solar_carport_hero.webp" alt="Atlas solar carport steel structure installed in South Africa" fill priority className="object-cover" sizes="(min-width:1024px) 600px, 100vw" /></div>
            <div className="flex items-center gap-3 px-5 py-4"><CarFront aria-hidden="true" className="h-5 w-5 shrink-0 text-[#0043f3]" /><p className="text-sm font-semibold">Covered parking. A platform for solar.</p></div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#c1d9e5] bg-[#f3f7fa]">
        <div className="mx-auto grid max-w-7xl gap-4 px-6 py-6 text-sm font-semibold text-[#264554] sm:grid-cols-3 sm:px-10 lg:px-12">
          <span className="flex items-center gap-2"><Check className="h-4 w-4 text-[#0043f3]" /> South African project support</span>
          <span className="flex items-center gap-2"><Check className="h-4 w-4 text-[#0043f3]" /> Engineered steel systems</span>
          <span className="flex items-center gap-2"><Check className="h-4 w-4 text-[#0043f3]" /> Layout and budget guidance</span>
        </div>
      </section>

      <section id="solutions" className="scroll-mt-24 bg-[#f3f7fa] py-12 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0043f3]">Choose by site</p>
            <h2 className="mt-4 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">Two practical ways to support a solar array</h2>
            <p className="mt-5 text-base leading-7 text-[#526a78] sm:text-lg">The right structure starts with how your property is used. A carport makes parking work harder; a ground mount turns available land into a dedicated solar platform.</p>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {solutions.map((solution) => {
              const Icon = solution.icon;
              return (
                <article key={solution.title} className="overflow-hidden rounded-3xl border border-[#dce6ed] bg-white">
                  <div className="bg-white p-2 sm:p-3">
                    <Image
                      src={solution.image}
                      alt={solution.imageAlt}
                      width={2480}
                      height={1624}
                      className="h-auto w-full"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                  <div className="p-6 sm:p-8">
                    <div className="flex items-start justify-between gap-5">
                      <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0043f3]">{solution.eyebrow}</p><h3 className="mt-3 text-2xl font-bold tracking-[-0.035em] sm:text-3xl">{solution.title}</h3></div>
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#edf3ff] text-[#0043f3]"><Icon className="h-5 w-5" /></span>
                    </div>
                    <p className="mt-5 leading-7 text-[#526a78]">{solution.description}</p>
                    <ul className="mt-6 space-y-3 text-sm text-[#264554]">
                      {solution.points.map((point) => <li key={point} className="flex gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#0043f3]" />{point}</li>)}
                    </ul>
                    <div className="mt-6 flex flex-col items-start gap-3">
                      <Link href={solution.builderHref} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#0043f3] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#001d2e]"><Calculator className="h-4 w-4" />{solution.builderCta}</Link>
                      <Link href={solution.href} className="inline-flex items-center gap-2 text-sm font-bold text-[#264554] transition hover:text-[#0043f3]">{solution.detailsCta} <ArrowRight className="h-4 w-4" /></Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-12 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0043f3]">Quick comparison</p>
              <h2 className="mt-4 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">Which solar structure fits your property?</h2>
              <p className="mt-5 leading-7 text-[#526a78]">Both systems support PV panels. The useful difference is the space they put to work.</p>
              <Link href="/contact" className="mt-8 inline-flex items-center gap-2 font-bold text-[#0043f3] hover:underline">Discuss your site <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="overflow-hidden rounded-2xl border border-[#dce6ed]">
              <table className="hidden sm:table w-full table-fixed border-collapse text-left text-sm">
                <thead><tr className="bg-[#f3f7fa]"><th className="p-3 sm:p-5 font-semibold text-[#526a78]">Consideration</th><th className="p-3 sm:p-5 text-sm font-bold">Solar carport</th><th className="p-3 sm:p-5 text-sm font-bold">Ground mount</th></tr></thead>
                <tbody>{comparisonRows.map(([label, carport, ground]) => <tr key={label} className="border-t border-[#dce6ed]"><th className="p-3 sm:p-5 font-semibold text-[#526a78]">{label}</th><td className="p-3 sm:p-5 text-[#001d2e]">{carport}</td><td className="p-3 sm:p-5 text-[#001d2e]">{ground}</td></tr>)}</tbody>
              </table>
              <dl className="divide-y divide-[#dce6ed] sm:hidden">{comparisonRows.map(([label, carport, ground]) => <div key={label} className="p-4"><dt className="text-xs font-bold uppercase tracking-wide text-[#526a78]">{label}</dt><dd className="mt-3 space-y-2 text-sm leading-6"><p><strong>Carport: </strong>{carport}</p><p><strong>Ground mount: </strong>{ground}</p></dd></div>)}</dl>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="grid grid-cols-2 gap-3">
              <div className="relative col-span-2 aspect-[16/9] overflow-hidden rounded-3xl bg-[#dce9ef]"><Image src="/solar_car_port_1.jpg" alt="Completed commercial solar carport project at Centurion Golf Club" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" /></div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#dce9ef]"><Image src="/solar_car_port_2.jpg" alt="Solar carport steel columns and covered parking bays" fill className="object-cover" sizes="25vw" /></div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#dce9ef]"><Image src="/solar_car_port_3.jpg" alt="Atlas solar carport structure supporting a PV array" fill className="object-cover" sizes="25vw" /></div>
            </div>
            <div className="lg:pl-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0043f3]">Built example</p>
              <h2 className="mt-4 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">Solar parking at Centurion Golf Club</h2>
              <p className="mt-6 text-lg leading-8 text-[#526a78]">A solar carport needs to work as both infrastructure and usable parking. This installation shows how the steel structure creates clear parking bays while supporting the PV array above.</p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="border-l-4 border-[#0043f3] pl-4"><Building2 className="h-5 w-5 text-[#0043f3]" /><p className="mt-2 font-bold">Commercial application</p><p className="mt-1 text-sm leading-6 text-[#526a78]">Designed around daily site use and vehicle access.</p></div>
                <div className="border-l-4 border-[#dce6ed] pl-4"><PanelsTopLeft className="h-5 w-5 text-[#0043f3]" /><p className="mt-2 font-bold">PV-ready support</p><p className="mt-1 text-sm leading-6 text-[#526a78]">A dedicated steel platform for the solar array.</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#c1d9e5] bg-[#f3f7fa] py-12 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0043f3]">Budget planning</p>
              <h2 className="mt-4 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">What determines the structure price?</h2>
              <p className="mt-5 leading-7 text-[#526a78]">There is no useful one-price-fits-all figure for a solar structure. A credible estimate starts with the intended array, site and project scope.</p>
              <Link href="/tools/solar-carport-estimator" className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0043f3] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#001d2e] hover:text-white"><Calculator className="h-4 w-4" /> Estimate a solar carport</Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {projectFactors.map(({ icon: Icon, title, text }) => <div key={title} className="rounded-2xl border border-[#dce6ed] bg-white p-6 sm:p-7"><Icon className="h-6 w-6 text-[#0043f3]" /><h3 className="mt-4 text-lg font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-[#526a78]">{text}</p></div>)}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0043f3]">South Africa</p>
              <h2 className="mt-4 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">Local solar structure support</h2>
              <p className="mt-5 leading-7 text-[#526a78]">Smart Steel works with homeowners, contractors and commercial project teams. Share the site location early so delivery, installation and local conditions can be considered from the start.</p>
              <div className="mt-6 flex items-center gap-3 text-sm font-semibold text-[#264554]"><MapPin className="h-5 w-5 text-[#0043f3]" /> Projects supported across South Africa</div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Link href="/gauteng/solar" className="group rounded-2xl border border-[#dce6ed] bg-[#f7f9fb] p-6 transition hover:border-[#0043f3]"><span className="text-xs font-bold uppercase tracking-[0.16em] text-[#0043f3]">Regional guide</span><h3 className="mt-3 text-xl font-bold">Solar structures in Gauteng</h3><span className="mt-6 inline-flex items-center gap-2 text-sm font-bold">View Gauteng options <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span></Link>
              <Link href="/pretoria-solar-carports" className="group rounded-2xl border border-[#dce6ed] bg-[#f7f9fb] p-6 transition hover:border-[#0043f3]"><span className="text-xs font-bold uppercase tracking-[0.16em] text-[#0043f3]">Local guide</span><h3 className="mt-3 text-xl font-bold">Solar carports in Pretoria</h3><span className="mt-6 inline-flex items-center gap-2 text-sm font-bold">View Pretoria options <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f4f8fa] py-12 lg:py-20">
        <div className="mx-auto max-w-4xl px-6 sm:px-10">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-[#0043f3]">Common questions</p>
          <h2 className="mt-4 text-center text-3xl font-bold tracking-[-0.035em] sm:text-4xl">Planning a solar support structure</h2>
          <div className="mt-8 space-y-3">
            {faqs.map((faq) => <details key={faq.question} className="group rounded-2xl border border-[#dce6ed] bg-white p-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-sm font-semibold marker:hidden [&::-webkit-details-marker]:hidden">{faq.question}<span className="text-2xl font-light text-[#0043f3] transition group-open:rotate-45">+</span></summary><p className="mt-4 max-w-3xl leading-7 text-[#526a78]">{faq.answer}</p></details>)}
          </div>
        </div>
      </section>

      <section className="px-5 py-12 sm:px-8 lg:py-20">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 rounded-3xl bg-[#001d2e] p-7 text-white sm:p-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c9d8ff]">Start with your site</p><h2 className="mt-3 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">Plan the steel structure behind your solar project</h2><p className="mt-4 leading-7 text-[#e3eaff]">Tell us whether you are working with parking or open land, where the project is located and how many panels or bays you have in mind.</p></div>
          <Link href="/contact" className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-xl bg-[#0043f3] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#0036c4]">Request project guidance <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
    </main>
  );
}
