/**
 * Next.js config to prefer TypeScript pages and ignore legacy .js pages.
 * This prevents duplicate page warnings when both .js and .tsx exist in `pages/`.
 */
/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['tsx', 'ts'],
  // Set outputFileTracingRoot to the project root so Next doesn't try to infer workspace root
  outputFileTracingRoot: path.resolve(__dirname),
}

module.exports = nextConfig
