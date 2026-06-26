import HomePageClient from './HomePageClient';

export const metadata = {
  title: {
    absolute: 'Lightweight Steel Warehouses South Africa | Smart Steel',
  },
  description:
    'Smart Steel supplies lightweight steel warehouse systems across South Africa, with estimate tools, lip channel kit options, and guidance for choosing the right steel structure.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Lightweight Steel Warehouses South Africa | Smart Steel',
    description:
      'Smart Steel supplies lightweight steel warehouse systems across South Africa, with estimate tools, lip channel kit options, and guidance for choosing the right steel structure.',
    url: 'https://www.smartsteel.co.za/',
    siteName: 'Smart Steel',
    locale: 'en_ZA',
    type: 'website',
    images: [
      {
        url: '/images/hero.webp',
        width: 1200,
        height: 630,
        alt: 'Smart Steel lightweight steel warehouse systems in South Africa',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lightweight Steel Warehouses South Africa | Smart Steel',
    description:
      'Estimate, compare, and plan lightweight steel warehouse systems for South African projects.',
    images: ['/images/hero.webp'],
  },
};

export default function Page() {
  return <HomePageClient />;
}
