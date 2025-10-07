// next-sitemap.config.js
module.exports = {
  siteUrl: 'https://www.smartsteel.co.za',
  generateRobotsTxt: true,
  sitemapSize: 5000,
  changefreq: 'monthly',
  priority: 0.7,
  exclude: [
    '/news-events',
    '/projects',
    '/case-studies/school-expansion',
    '/case-studies/retail-renovation',
    '/case-studies/eco-home',
  ],
};
