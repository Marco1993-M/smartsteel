/** @type {import('next').NextConfig} */
const nextConfig = {
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
