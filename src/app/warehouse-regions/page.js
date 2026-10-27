import Link from "next/link";
import {
  buildRegionWarehouseHubMetadata,
  getRegionWarehouseConfigs,
  REGION_WAREHOUSE_WIDTHS,
} from "./regionWarehouseData";

export const metadata = buildRegionWarehouseHubMetadata();

export default function WarehouseRegionsHubPage() {
  const regions = getRegionWarehouseConfigs().sort((a, b) => a.name.localeCompare(b.name));

  return (
    <main className="font-sans text-gray-900">
      <section className="bg-[#f6f7f9] px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#da1a33]">
              Warehouse Regions
            </p>
            <h1 className="mt-4 text-4xl font-bold md:text-6xl">
              Compare lightweight steel warehouses by region
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-700">
              Explore Smart Steel warehouse pages by region to compare delivery areas, buyer
              guidance, sizing options, and warehouse planning considerations across South Africa.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.75rem] bg-white p-6 shadow-sm">
              <p className="text-3xl font-bold text-gray-900">{regions.length}</p>
              <p className="mt-2 text-sm text-gray-600">regional warehouse guides</p>
            </div>
            <div className="rounded-[1.75rem] bg-white p-6 shadow-sm">
              <p className="text-3xl font-bold text-gray-900">{REGION_WAREHOUSE_WIDTHS.map((width) => `${width}m`).join(", ")}</p>
              <p className="mt-2 text-sm text-gray-600">modular widths used across our planning system</p>
            </div>
            <div className="rounded-[1.75rem] bg-white p-6 shadow-sm">
              <p className="text-3xl font-bold text-gray-900">South Africa</p>
              <p className="mt-2 text-sm text-gray-600">regional coverage for warehouse enquiries and delivery support</p>
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
              Find the warehouse guide for your area
            </h2>
            <p className="mt-4 text-lg text-gray-700">
              Compare Atlas sizes and supply-only prices, with local planning context and the
              information needed to quote for your site.
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
                  Steel Warehouses {region.name}
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
                  View regional warehouse page
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
              Planning your project
            </p>
            <h2 className="mt-4 text-3xl font-bold md:text-4xl">
              Plan your building around its site
            </h2>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-white/80">
              Choose your area to compare building sizes and prices. Then share your exact
              address, intended use and access requirements so we can review delivery,
              installation and the final scope with you.
            </p>
          </div>

          <div className="rounded-[2rem] bg-white/5 p-8">
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
                Local planning context for your area
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
                Live supply-only guides from the Atlas pricing model
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
                Delivery, installation and site-specific work confirmed separately
              </div>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/warehouses"
                className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#da1a33] hover:text-white"
              >
                View warehouse systems
              </Link>
              <Link
                href="/warehouse-cost"
                className="rounded-full border border-white px-5 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-black"
              >
                View warehouse cost guides
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
