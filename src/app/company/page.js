// app/company/page.js
import Image from 'next/image';
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

export default function CompanyPage() {
  return (
    <main className="font-sans text-gray-800">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(smartSteelOrganizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(companyPageSchema) }}
      />
      {/* About Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-2/3">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#da1a33]">
              Smart Steel South Africa
            </p>
            <h1 className="text-4xl font-bold mb-6 text-left">About Smart Steel</h1>
            <p className="text-lg mb-4 text-left">
              Smart Steel is a South African steel building systems company focused on lightweight steel warehouses, steel roof trusses, solar carports, lip channel kits, and practical steel structures for local projects.
            </p>
            <p className="text-lg mb-4 text-left">
              Smart Steel was established as a dedicated division of Pequeñohome.com by our founders, Stefan Steyn, Niel Wannenburg, and Marco Gerritsen. With a shared passion for innovation and quality, we set out to create a smarter, more efficient approach to steel construction in South Africa.
            </p>
            <p className="text-lg mb-4 text-left">
              Our mission is simple: to provide our clients with superior steel structures that outperform traditional options in efficiency, durability, and cost-effectiveness. By reimagining the alternative building sector, we aim to make high-quality steel solutions accessible, reliable, and affordable for everyone.
            </p>
            <p className="text-lg mb-4 text-left">
              At Smart Steel South Africa, we believe in transforming challenges into opportunities. Whether you are looking for sheds, warehousing, roof trusses, solar-ready structures, or custom-built steel solutions, our lightweight and modular designs are engineered to simplify construction, minimize costs, and deliver lasting results.
            </p>
            <p className="text-lg text-left">
              Our commitment to excellence drives us to continually refine our products and processes, ensuring that every client experiences unparalleled value and service. With Smart Steel, building better isn’t just a goal—it’s our promise.
            </p>
          </div>
          <div className="md:w-1/3">
            <Image
              src="/team.jpg"
              alt="About Smart Steel"
              width={500}
              height={500}
              className="rounded-lg object-cover w-full h-auto"
            />
          </div>
        </div>
      </section>

      <section className="bg-gray-50 px-6 py-16">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          {[
            {
              title: "What Smart Steel supplies",
              text: "Lightweight steel warehouses, steel roof trusses, solar carports, CFLC kit structures, and related steel building systems.",
            },
            {
              title: "Where Smart Steel works",
              text: "Smart Steel supports projects across South Africa, with warehouse, solar, truss, and steel structure enquiries handled through the smartsteel.co.za website.",
            },
            {
              title: "Who founded Smart Steel",
              text: "Smart Steel was founded by Stefan Steyn, Niel Wannenburg, and Marco Gerritsen as a dedicated steel building systems division of Pequeno Home.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-950">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-gray-700">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Follow Us Section */}
      <section className="bg-gray-100 py-20 px-6">
        <div className="max-w-5xl mx-auto text-left">
          <h2 className="text-3xl font-bold mb-4">Follow us on our socials!</h2>
          <p className="text-lg mb-8">
            Discover the latest projects featuring frames made from lightweight steel. Follow us for examples and inspiration on how lightweight steel is helping bring designs to life.
          </p>

          {/* Social Icons (client component) */}
          <SocialIcons />
        </div>
      </section>
    </main>
  );
}
