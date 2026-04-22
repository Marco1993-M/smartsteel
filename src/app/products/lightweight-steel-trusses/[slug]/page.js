import { notFound } from 'next/navigation';
import TrussSupportPageClient from '../TrussSupportPageClient';
import { buildTrussMetadata, getTrussPage, getTrussSupportPages } from '../trussClusterData';

export function generateStaticParams() {
  return getTrussSupportPages().map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const page = getTrussPage(slug);

  if (!page) {
    return {};
  }

  return buildTrussMetadata(slug);
}

export default async function Page({ params }) {
  const { slug } = await params;
  const page = getTrussPage(slug);

  if (!page) {
    notFound();
  }

  return <TrussSupportPageClient slug={slug} />;
}
