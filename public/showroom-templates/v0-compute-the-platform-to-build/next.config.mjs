/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/showroom-templates/v0-compute-the-platform-to-build',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
