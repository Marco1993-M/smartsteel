import Link from 'next/link';
import { buildWarehouseCostMetadata, getWarehouseCostPageConfig, getWarehouseCostSlugs } from './warehouseCostData';

export const metadata = {
  ...buildWarehouseCostMetadata('10x10'),
  title: 'Warehouse Cost Guide South Africa | Smart Steel',
  description:
    'Compare Smart Steel warehouse cost guides by size, including structure-only, cladding, and turnkey price ranges for South African projects.',
  alternates: {
    canonical: '/warehouse-cost',
  },
};

export default function WarehouseCostHubPage() {
  const pages = getWarehouseCostSlugs()
    .map((slug) => getWarehouseCostPageConfig(slug))
    .filter(Boolean)
    .sort((a, b) => a.area - b.area);

  return (
    <main className="mx-auto max-w-6xl px-6 py-24 font-sans text-gray-900">
      <section className="max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#da1a33]">Warehouse cost guides</p>
        <h1 className="mt-4 text-4xl font-bold md:text-6xl">Compare steel warehouse costs by size</h1>
        <p className="mt-6 text-lg leading-8 text-gray-700">
          Browse our South African warehouse cost pages to compare structure-only, clad, and turnkey pricing by footprint. Each
          page includes estimated ranges, buyer guidance, FAQs, and nearby warehouse links.
        </p>
      </section>

      <section className="mt-16 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {pages.map((page) => (
          <Link
            key={page.slug}
            href={page.path}
            className="rounded-3xl border border-gray-200 bg-white p-6 transition hover:-translate-y-1 hover:border-[#da1a33] hover:shadow-lg"
          >
            <p className="text-2xl font-bold">{page.displaySize}</p>
            <p className="mt-2 text-sm text-gray-600">{page.areaLabel} steel warehouse</p>
            <p className="mt-5 text-sm text-gray-700">Structure-only: {page.prices.structure.shortLabel}</p>
            <p className="mt-2 text-sm text-gray-700">With cladding: {page.prices.cladding.shortLabel}</p>
            <p className="mt-2 text-sm text-gray-700">Turnkey: {page.prices.turnkey.shortLabel}</p>
            <p className="mt-5 text-sm font-semibold text-[#da1a33]">View cost guide</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
