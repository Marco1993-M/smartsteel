import HomePageClient from './HomePageClient';

export const metadata = {
  title: 'Smart Steel | Steel Warehouses, CFLC Kits & LSF Systems',
  description:
    'Smart Steel helps South African clients compare steel warehouses, CFLC DIY kits, and custom LSF systems with clearer pricing, tools, and enquiry paths.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Smart Steel | Steel Warehouses, CFLC Kits & LSF Systems',
    description:
      'Explore Smart Steel steel warehouses, CFLC DIY kits, and custom LSF systems built for South African projects.',
    url: 'https://www.smartsteel.co.za/',
    siteName: 'Smart Steel',
    locale: 'en_ZA',
    type: 'website',
    images: [
      {
        url: '/og-warehouse.jpg',
        width: 1200,
        height: 630,
        alt: 'Smart Steel steel warehouses, CFLC kits and LSF systems',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Smart Steel | Steel Warehouses, CFLC Kits & LSF Systems',
    description:
      'Steel warehouses, CFLC DIY kits, and custom LSF systems for South African projects.',
    images: ['/og-warehouse.jpg'],
  },
};

export default function Page() {
  return <HomePageClient />;
}
