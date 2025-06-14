// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  experimental: {
    // Use this to explicitly opt-in to more recent transpilation options
    swcPlugins: [],
  },
  images: {
    domains: ['flowhr.s3.eu-north-1.amazonaws.com'],
  },
};

module.exports = nextConfig;
