/**
 * Next.js config to prefer TypeScript pages and ignore legacy .js pages.
 * This prevents duplicate page warnings when both .js and .tsx exist in `pages/`.
 */
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['tsx', 'ts'],
}

module.exports = nextConfig
