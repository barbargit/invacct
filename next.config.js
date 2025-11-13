const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  //output: 'standalone', // For Vercel deployment
  images: {
    unoptimized: true, // For Vercel deployment
  },
  outputFileTracingRoot: path.resolve(__dirname),
  // Removed rewrites for production - API calls go directly to backend
  // For development, use .env.local with localhost URLs
  env: {
    CUSTOM_KEY: 'value',
  },
};

module.exports = nextConfig;
