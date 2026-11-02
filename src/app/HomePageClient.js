'use client';

import WarehouseHomeHero from '../components/atlas/WarehouseHomeHero';
import HomepageSections from '../components/atlas/HomepageSections';
import { smartSteelOrganizationSchema, smartSteelWebsiteSchema } from '../lib/brandEntity';

const homepageQuestions = [
  { question: 'How much does a steel warehouse cost in South Africa?', answer: 'The price depends on the span, length, eave height, steel finish and sheeting scope. Use our warehouse cost guides to compare common sizes, or configure an Atlas warehouse in 3D for a supply-only guide price excluding VAT. Foundations, delivery and installation are reviewed separately.' },
  { question: 'Can I build and price a warehouse online?', answer: 'Yes. The Atlas 3D warehouse builder lets you choose dimensions, steel finish and sheeting, explore the structure and request a reviewed quote from your configuration. Atlas uses standard 4m building bays; cost guides explain the closest module when your target length differs.' },
  { question: 'Can I configure a solar carport in 3D?', answer: 'Yes. Choose your parking bays and row layouts in the Atlas solar carport builder, view the steel structure, check panel capacity and see a structure-only guide price excluding VAT. Solar panels and electrical work are not included in that guide.' },
  { question: 'Do you supply standard structures and custom projects?', answer: 'Smart Steel supplies Atlas modular steel structures and supports custom warehouse enquiries across South Africa. Discuss requirements outside the standard range with our team, including the delivery and installation scope for your site.' },
];

const structuredData = [
  smartSteelOrganizationSchema,
  smartSteelWebsiteSchema,
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.smartsteel.co.za/',
      },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: homepageQuestions.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  },
];

export default function HomePageClient() {
  return (
    <main className="font-sans text-gray-900">
      {structuredData.map((schema) => (
        <script
          key={schema['@type']}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <WarehouseHomeHero />

      <HomepageSections questions={homepageQuestions} />
    </main>
  );
}
