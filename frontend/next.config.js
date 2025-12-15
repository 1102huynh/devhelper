// Backend URL: https://devhelper-37jw.onrender.com/api
// Build: 2025-12-15T12:20:00Z - Fixed backend URL from devhelper-8i34 to devhelper-37jw

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig

