import HomePageClient from './HomePageClient';

export const metadata = {
  title: {
    absolute: 'Steel Warehouses South Africa | Build & Price Online | Smart Steel',
  },
  description:
    'Build and price an Atlas modular steel warehouse online. Smart Steel supplies warehouse structures, solar carports, ground mounts, trusses, and steel building solutions across South Africa.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Steel Warehouses South Africa | Build & Price Online | Smart Steel',
    description:
      'Build and price an Atlas modular steel warehouse online, then refine your structure in 3D and request a reviewed quote from Smart Steel.',
    url: 'https://www.smartsteel.co.za/',
    siteName: 'Smart Steel',
    locale: 'en_ZA',
    type: 'website',
    images: [
      {
        url: '/images/hero.webp',
        width: 1200,
        height: 630,
        alt: 'Smart Steel Atlas modular steel warehouse system in South Africa',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Steel Warehouses South Africa | Build & Price Online | Smart Steel',
    description:
      'Build and price an Atlas modular steel warehouse online with Smart Steel.',
    images: ['/images/hero.webp'],
  },
};

export default function Page() {
  return <HomePageClient />;
}
