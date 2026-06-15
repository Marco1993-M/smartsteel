/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    qualities: [75, 85],
  },
  turbopack: {
    root: '/Users/marcogerritsen/Desktop/Dev Files/smartsteel',
  },
  outputFileTracingIncludes: {
    "/api/estimates/*/pdf": [
      "./node_modules/@sparticuz/chromium/**/*",
    ],
  },
};

export default nextConfig;
