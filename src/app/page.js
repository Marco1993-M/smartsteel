import HomePageClient from './HomePageClient';

export const metadata = {
  title: 'Smart Steel | Warehouses, Solar Carports & LSF Trusses',
  description:
    'Smart Steel designs and supplies lightweight steel warehouses, solar carports, and LSF roof trusses across South Africa.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Smart Steel | Warehouses, Solar Carports & LSF Trusses',
    description:
      'Explore Smart Steel lightweight steel warehouses, solar-ready carports, and LSF truss systems built for South African projects.',
    url: 'https://www.smartsteel.co.za/',
    siteName: 'Smart Steel',
    locale: 'en_ZA',
    type: 'website',
    images: [
      {
        url: '/og-warehouse.jpg',
        width: 1200,
        height: 630,
        alt: 'Smart Steel warehouses, solar carports and trusses',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Smart Steel | Warehouses, Solar Carports & LSF Trusses',
    description:
      'Lightweight steel structures for South African warehouses, solar carports, and roof trusses.',
    images: ['/og-warehouse.jpg'],
  },
};

export default function Page() {
  return <HomePageClient />;
}
