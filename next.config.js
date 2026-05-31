/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { domains: ['firebasestorage.googleapis.com'] },
  transpilePackages: ['three'],
}
module.exports = nextConfig
