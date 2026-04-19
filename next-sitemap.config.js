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

const cityWarehousePaths = ['/midrand/warehouses', '/centurion/warehouses', '/pretoria/warehouses', '/hoedspruit/warehouses'];

const highPriorityPages = new Set([
  '/',
  '/lightweight-steel-warehouses',
  '/solar',
  '/pretoria-solar-carports',
  '/products/lightweight-steel-trusses',
  '/warehouse-cost',
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
    } else if (path.startsWith('/products/lightweight-steel-trusses/')) {
      changefreq = 'monthly';
      priority = 0.82;
    } else if (cityWarehousePaths.includes(path) || path.endsWith('-warehouses')) {
      changefreq = 'monthly';
      priority = 0.78;
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
    const extraPaths = [...warehouseCostPaths, ...trussClusterPaths, ...cityWarehousePaths];
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
    additionalSitemaps: [`${siteUrl}/sitemap.xml`],
  },
};
