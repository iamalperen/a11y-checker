/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // This disables ESLint during the build process
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
