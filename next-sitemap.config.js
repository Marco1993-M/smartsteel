// next-sitemap.config.js
module.exports = {
  siteUrl: 'https://www.smartsteel.co.za',
  generateRobotsTxt: true,
  generateIndexSitemap: false, // ✅ This is important
  sitemapSize: 5000,
  changefreq: 'monthly',
  priority: 0.7,
};
