/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Ignore old Vite files
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
}

module.exports = nextConfig

