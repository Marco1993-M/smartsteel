const siteUrl = 'https://www.smartsteel.co.za';

const warehouseWidths = [8, 10, 12];
const warehouseLengths = Array.from({ length: 19 }, (_, index) => 5 + index * 2.5);
const warehouseCostPaths = warehouseLengths.flatMap((length) =>
  warehouseWidths.map((width) => `/warehouse-cost/${length}x${width}`)
);

const trussClusterPaths = [
  '/products/lightweight-steel-trusses/steel-trusses-vs-timber',
  '/products/lightweight-steel-trusses/roof-truss-prices',
  '/products/lightweight-steel-trusses/for-houses',
  '/products/lightweight-steel-trusses/for-commercial-buildings',
  '/products/lightweight-steel-trusses/why-builders-switch',
];

const solarCarportRegionPaths = [
  '/bloemfontein-solar-carports',
  '/cape-town-solar-carports',
  '/centurion-solar-carports',
  '/durban-solar-carports',
  '/johannesburg-solar-carports',
  '/midrand-solar-carports',
  '/polokwane-solar-carports',
  '/pretoria-solar-carports',
];

const legacyRegionWarehousePaths = [
  '/bloemfontein-warehouses',
  '/cape-town-warehouses',
  '/durban-warehouses',
  '/east-london-warehouses',
  '/gqeberha-warehouses',
  '/nelspruit-warehouses',
  '/polokwane-warehouses',
  '/pretoria-warehouses',
  '/centurion-warehouses',
  '/johannesburg-warehouses',
  '/midrand-warehouses',
  '/roodepoort-warehouses',
  '/middelburg-warehouses',
  '/hoedspruit-warehouses',
  '/hermanus-warehouses',
  '/rustenburg-warehouses',
];

const highPriorityPages = new Set([
  '/',
  '/lightweight-steel-warehouses',
  '/warehouses',
  '/warehouses/lsf',
  '/warehouses/cflc',
  '/warehouses/lsf-vs-cflc',
  '/solar',
  '/pretoria-solar-carports',
  '/solar-carports',
  '/products',
  '/products/cflc-diy-warehouse-kits',
  '/products/lightweight-steel-trusses',
  '/warehouse-cost',
  '/cflc-warehouse-cost',
  '/warehouse-regions',
]);

const servicePages = new Set([
  '/company',
  '/contact',
  '/resources',
  '/recent',
  '/steel',
  '/architect-advantages',
  '/sustainability',
]);

module.exports = {
  siteUrl,
  generateRobotsTxt: true,
  sitemapSize: 5000,
  exclude: [
    '/api',
    '/api/*',
    '/kanban',
    '/login',
    '/privacy',
    '/return-policy',
    '/news-events',
    '/projects',
    '/case-studies/school-expansion',
    '/case-studies/retail-renovation',
    '/case-studies/eco-home',
    '/warehouse-cost/[size]',
    '/products/lightweight-steel-trusses/[slug]',
    '/[city]/solar-carports',
    '/warehouses/[slug]',
  ],
  transform: async (config, path) => {
    if (path.includes('[') || path.includes(']')) {
      return null;
    }

    let changefreq = 'monthly';
    let priority = 0.7;

    if (highPriorityPages.has(path)) {
      changefreq = 'weekly';
      priority = path === '/' ? 1.0 : 0.9;
    } else if (path.startsWith('/warehouse-cost/')) {
      changefreq = 'monthly';
      priority = 0.85;
    } else if (path.startsWith('/products/cflc-diy-warehouse-kits')) {
      changefreq = 'weekly';
      priority = 0.88;
    } else if (path.startsWith('/products/lightweight-steel-trusses/')) {
      changefreq = 'monthly';
      priority = 0.82;
    } else if (
      legacyRegionWarehousePaths.includes(path) ||
      solarCarportRegionPaths.includes(path)
    ) {
      changefreq = 'monthly';
      priority = 0.78;
    } else if (path.startsWith('/products/')) {
      changefreq = 'monthly';
      priority = 0.8;
    } else if (servicePages.has(path)) {
      changefreq = 'monthly';
      priority = 0.75;
    } else if (path.startsWith('/news/')) {
      changefreq = 'monthly';
      priority = 0.65;
    } else if (path.startsWith('/warehouses/')) {
      changefreq = 'monthly';
      priority = 0.72;
    } else if (path.startsWith('/tools/')) {
      changefreq = 'monthly';
      priority = 0.55;
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: new Date().toISOString(),
      alternateRefs: [],
    };
  },
  additionalPaths: async (config) => {
    const extraPaths = [
      ...warehouseCostPaths,
      ...trussClusterPaths,
      ...legacyRegionWarehousePaths,
      ...solarCarportRegionPaths,
      '/solar-carports',
      '/warehouses',
      '/warehouses/lsf',
      '/warehouses/cflc',
      '/warehouses/lsf-vs-cflc',
      '/products',
      '/products/cflc-diy-warehouse-kits',
      '/cflc-warehouse-cost',
      '/warehouse-regions',
    ];
    const results = [];

    for (const path of extraPaths) {
      const transformed = await config.transform(config, path);
      if (transformed) {
        results.push(transformed);
      }
    }

    return results;
  },
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api', '/api/*', '/kanban', '/login'],
      },
    ],
  },
};
