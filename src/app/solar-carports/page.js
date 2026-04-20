import Link from "next/link";
import {
  buildSolarRegionHubMetadata,
  getSolarRegionConfigs,
} from "../solar-regions/solarRegionData";

export const metadata = buildSolarRegionHubMetadata();

export default function SolarCarportsHubPage() {
  const regions = getSolarRegionConfigs().sort((a, b) => a.name.localeCompare(b.name));

  return (
    <main className="font-sans text-gray-900">
      <section className="bg-[#f6f7f9] px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
              Solar Carport Regions
            </p>
            <h1 className="mt-4 text-4xl font-bold md:text-6xl">
              Compare solar carports by region
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-700">
              Explore Smart Steel solar carport pages by region to compare covered parking
              strategies, pricing context, delivery areas, and project planning across South Africa.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.75rem] bg-white p-6 shadow-sm">
              <p className="text-3xl font-bold text-gray-900">{regions.length}</p>
              <p className="mt-2 text-sm text-gray-600">regional solar carport landing pages live</p>
            </div>
            <div className="rounded-[1.75rem] bg-white p-6 shadow-sm">
              <p className="text-3xl font-bold text-gray-900">3m to 10m</p>
              <p className="mt-2 text-sm text-gray-600">typical width planning across our solar carport system</p>
            </div>
            <div className="rounded-[1.75rem] bg-white p-6 shadow-sm">
              <p className="text-3xl font-bold text-gray-900">South Africa</p>
              <p className="mt-2 text-sm text-gray-600">regional support for solar parking and energy-linked steel structures</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
              Explore Regions
            </p>
            <h2 className="mt-4 text-3xl font-bold md:text-4xl">
              Regional solar carport pages built for real commercial intent
            </h2>
            <p className="mt-4 text-lg text-gray-700">
              Each page is tailored around regional parking demand, local commercial fit, pricing
              context, and next-step planning for solar-ready parking structures.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {regions.map((region) => (
              <Link
                key={region.citySlug}
                href={`/${region.legacySlug}`}
                className="rounded-[2rem] border border-gray-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-[#da1a33] hover:shadow-lg"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#da1a33]">
                  {region.province}
                </p>
                <h3 className="mt-3 text-2xl font-bold text-gray-900">
                  Solar Carports {region.name}
                </h3>
                <p className="mt-4 text-sm leading-6 text-gray-600">{region.description}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {region.localZones.slice(0, 3).map((zone) => (
                    <span
                      key={zone}
                      className="rounded-full bg-[#f6f7f9] px-3 py-1 text-xs font-medium text-gray-700"
                    >
                      {zone}
                    </span>
                  ))}
                </div>
                <p className="mt-6 text-sm font-semibold text-[#da1a33]">
                  View regional solar carport page
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#111111] px-6 py-20 text-white">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#f0a1ab]">
              Why This Matters
            </p>
            <h2 className="mt-4 text-3xl font-bold md:text-4xl">
              One solar hub makes the regional cluster stronger
            </h2>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-white/80">
              This hub helps buyers compare regions, discover nearby delivery areas, and move into
              the right solar carport page faster. It also gives Google a clear parent page for the
              regional solar-carport cluster.
            </p>
          </div>

          <div className="rounded-[2rem] bg-white/5 p-8">
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
                Stronger crawl paths from one page into every priority solar carport region
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
                Better internal linking between the solar hub, city pages, and core Smart Steel services
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
                Cleaner topical authority around solar carports in South Africa
              </div>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/solar"
                className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#da1a33] hover:text-white"
              >
                View solar overview
              </Link>
              <Link
                href="/contact"
                className="rounded-full border border-white px-5 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-black"
              >
                Request a quote
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
