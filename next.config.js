const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add any custom Next.js configuration here
  reactStrictMode: true,
  webpack(config) {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    return config;
  },
  output: 'standalone',
  images: {
    domains: [
      'i.seadn.io',
      'assets.coingecko.com',
      'avatars.githubusercontent.com'
    ],
  }
};

module.exports = nextConfig; 