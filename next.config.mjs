/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    qualities: [75, 85],
  },
  // Resolve aliases and traced files from the project being built on every host.
  turbopack: {
    root: process.cwd(),
  },
  outputFileTracingIncludes: {
    "/api/estimates/*/pdf": [
      "./node_modules/@sparticuz/chromium/**/*",
    ],
  },
};

export default nextConfig;
