import HomePageClient from './HomePageClient';

export const metadata = {
  title: {
    absolute: 'Smart Steel South Africa | Lightweight Steel Warehouses & Building Systems',
  },
  description:
    'Smart Steel South Africa supplies lightweight steel warehouses, steel roof trusses, solar carports, lip channel kits, and steel building systems for local projects.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Smart Steel South Africa | Lightweight Steel Warehouses & Building Systems',
    description:
      'Smart Steel South Africa supplies lightweight steel warehouses, steel roof trusses, solar carports, lip channel kits, and steel building systems for local projects.',
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
    title: 'Smart Steel South Africa | Lightweight Steel Warehouses & Building Systems',
    description:
      'Estimate, compare, and plan Smart Steel lightweight steel warehouse systems for South African projects.',
    images: ['/images/hero.webp'],
  },
};

export default function Page() {
  return <HomePageClient />;
}
