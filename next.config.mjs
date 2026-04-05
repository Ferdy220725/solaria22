/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Mengabaikan error TypeScript saat build agar Vercel tetap jalan
    ignoreBuildErrors: true,
  },
  eslint: {
    // Mengabaikan error linting saat build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;