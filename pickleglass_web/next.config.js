/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Remove output: 'export' to enable server-side features (API routes, etc.)
  // output: 'export',

  images: { unoptimized: true },
  
  // Ensure path aliases work
  webpack: (config) => {
    config.resolve.alias['@'] = require('path').resolve(__dirname, '.');
    return config;
  },
}

module.exports = nextConfig 