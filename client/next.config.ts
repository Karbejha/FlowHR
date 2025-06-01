import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  // Ensure proper handling of environment variables
  publicRuntimeConfig: {
    apiUrl: process.env.NEXT_PUBLIC_API_URL,
  }
};

export default nextConfig;
