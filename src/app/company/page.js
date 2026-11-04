// app/company/page.js
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Warehouse, SunMedium, Ruler, MessageCircle, ClipboardCheck, Layers } from 'lucide-react';
import SocialIcons from '../../components/SocialIcons';
import { SMART_STEEL_SITE_URL, smartSteelOrganizationSchema } from '../../lib/brandEntity';


// --- Metadata for SEO & canonical ---
export const metadata = {
  title: "About Smart Steel South Africa | Steel Building Systems Company",
  description:
    "Learn about Smart Steel South Africa, the steel building systems company behind lightweight steel warehouses, roof trusses, solar carports, and kit structures.",
  alternates: {
    canonical: '/company',
  },
  openGraph: {
    title: "About Smart Steel South Africa | Steel Building Systems Company",
    description:
      "Learn about Smart Steel South Africa and the team behind our steel building systems, warehouse solutions, and project support.",
    url: "https://www.smartsteel.co.za/company",
    siteName: "Smart Steel",
    locale: "en_ZA",
    type: "website",
  },
};

const companyPageSchema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "@id": `${SMART_STEEL_SITE_URL}/company#aboutpage`,
  url: `${SMART_STEEL_SITE_URL}/company`,
  name: "About Smart Steel South Africa",
  isPartOf: {
    "@id": `${SMART_STEEL_SITE_URL}/#website`,
  },
  about: {
    "@id": `${SMART_STEEL_SITE_URL}/#organization`,
  },
  mainEntity: {
    "@id": `${SMART_STEEL_SITE_URL}/#organization`,
  },
};


const wrap = "mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:py-20";
const label = "text-[10px] font-bold uppercase tracking-[0.2em] text-[#da1a33]";
const heading = "mt-3 text-3xl font-bold leading-[1.12] tracking-[-0.035em] sm:text-4xl";
const action = "inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-[#da1a33] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#b9152b]";

export default function CompanyPage() {
  return <main className="bg-white text-[#242424] [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-4 [&_a:focus-visible]:outline-[#da1a33]">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(smartSteelOrganizationSchema) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(companyPageSchema) }} />

    <section className={wrap}>
      <div className="grid items-center gap-9 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className={label}>About Smart Steel · South Africa</p>
          <h1 className="mt-4 text-4xl font-bold leading-[1.08] tracking-[-0.035em] sm:text-5xl">Practical structures.<br />People you can talk to.</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[#555]">We help businesses, farmers and project teams turn a building requirement into a clearly defined steel structure.</p>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[#666]">From warehouses and farm buildings to roof trusses and solar support structures, Smart Steel brings the building options, supply scope and project conversation together.</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/contact" className={action}>Talk through your project <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/recent" className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl border border-[#ddd] px-5 text-sm font-semibold hover:bg-[#f5f5f5]">See our work <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
        <figure className="overflow-hidden rounded-3xl border border-[#e5e5e5] bg-[#f6f6f6]">
          <Image src="/team.jpg" alt="The three Smart Steel founders together" width={780} height={782} priority sizes="(min-width:1024px) 580px, 100vw" className="h-auto w-full" />
          <figcaption className="px-5 py-4 text-sm leading-6 text-[#555]">Founded by Stefan Steyn, Niel Wannenburg and Marco Gerritsen.</figcaption>
        </figure>
      </div>
    </section>

    <section className="bg-[#f5f5f5]"><div className={wrap}>
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-16">
        <div><p className={label}>Where we started</p><h2 className={heading}>A practical approach<br />to building with steel.</h2></div>
        <div className="space-y-4 text-base leading-7 text-[#555]"><p>Smart Steel began as a dedicated steel building systems division of Pequeno Home. Stefan, Niel and Marco set out to make lightweight and modular steel structures easier to explore, specify and bring into a project.</p><p>That focus shapes the business today: useful building options, clear scope and conversations that help clients understand what their project needs.</p></div>
      </div>
    </div></section>

    <section className={wrap}>
      <p className={label}>How we work with you</p><h2 className={heading}>Clarity at each step.</h2>
      <div className="mt-8 grid gap-4 md:grid-cols-3">{[
        [MessageCircle, "Start with the purpose", "Tell us what the space needs to do, where you want to build and what you know so far. You can start before every detail is settled."],
        [Ruler, "Work through the requirements", "We help define dimensions, layout and the structural package, with site and specialist inputs assessed for the project."],
        [ClipboardCheck, "Agree the scope", "Your quotation sets out the supply and any agreed services, so you can see what is included and what still needs arranging."],
      ].map(([Icon,title,body])=><article key={title} className="rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-6"><Icon aria-hidden="true" className="h-6 w-6 text-[#da1a33]" /><h3 className="mt-4 text-lg font-bold">{title}</h3><p className="mt-3 text-sm leading-7 text-[#666]">{body}</p></article>)}</div>
    </section>

    <section className="px-5 sm:px-8"><div className="mx-auto grid max-w-7xl gap-8 rounded-3xl bg-[#252525] p-7 text-white sm:p-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
      <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#f3a4af]">The company and the system</p><h2 className={heading}>Smart Steel is the team.<br />Atlas is our building system.</h2><p className="mt-4 text-sm leading-7 text-[#ccc]">Atlas brings our modular warehouse and solar structures together in a range you can explore online. Smart Steel is the company you work with to review the design, confirm the scope and arrange the agreed supply.</p></div>
      <div className="space-y-1">{[
        [Warehouse,"Warehouses & farm buildings","Space for storage, business and agricultural use.","/agricultural-buildings"],
        [SunMedium,"Solar support structures","Steel carports and ground mounts for solar arrays.","/solar"],
        [Layers,"Roof trusses & other steel systems","Explore the wider Smart Steel product range.","/products"],
      ].map(([Icon,title,body,href])=><Link key={title} href={href} className="group flex items-start gap-4 border-b border-white/15 py-5 last:border-0"><Icon aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-[#f3a4af]" /><div className="flex-1"><h3 className="text-base font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-[#ccc]">{body}</p></div><ArrowRight aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 transition group-hover:translate-x-1" /></Link>)}</div>
    </div></section>

    <section className={wrap}>
      <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:gap-14">
        <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-[#f5f5f5]"><Image src="/projects/Solar Carports_Centurion Golf Club/7.webp" alt="Completed Smart Steel solar carport project at Centurion Golf Club" fill sizes="(min-width:1024px) 740px, 100vw" className="object-cover" /></div>
        <div><p className={label}>From a plan to a place</p><h2 className={heading}>See the structures<br />in use.</h2><p className="mt-4 text-sm leading-7 text-[#666]">The solar carport installation at Centurion Golf Club brings covered parking and support for a solar array together on a working site.</p><Link href="/recent" className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#da1a33] hover:underline">Explore completed projects <ArrowRight className="h-4 w-4" /></Link></div>
      </div>
    </section>

    <section className="bg-[#f5f5f5]"><div className={wrap}><div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"><div><p className={label}>Stay connected</p><h2 className="mt-3 text-2xl font-bold tracking-tight">Follow the work as it takes shape.</h2><p className="mt-3 max-w-xl text-sm leading-7 text-[#666]">See project updates and examples from Smart Steel.</p></div><SocialIcons /></div></div></section>

    <section className={wrap}><div className="flex flex-col gap-7 rounded-3xl border border-[#e5e5e5] p-7 sm:p-10 lg:flex-row lg:items-center lg:justify-between"><div><p className={label}>Your next project</p><h2 className={heading}>What would you like to build?</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-[#666]">Start with the intended use and site location. We’ll help you work through the building options and next steps.</p></div><Link href="/contact" className={action}>Speak to Smart Steel <ArrowRight className="h-4 w-4" /></Link></div></section>
  </main>;
}
