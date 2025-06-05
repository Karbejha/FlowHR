import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  // Ensure proper handling of environment variables
  publicRuntimeConfig: {
    apiUrl: process.env.NEXT_PUBLIC_API_URL,
  },
  // Configure external image domains for S3
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'flowhr.s3.eu-north-1.amazonaws.com',
        port: '',
        pathname: '/avatars/**',
      },
      {
        protocol: 'https',
        hostname: '*.s3.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.s3.*.amazonaws.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
  // Increase body size limit for file uploads (5MB)
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb'
    }
  }
};

export default nextConfig;
