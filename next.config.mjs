import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: path.resolve(process.cwd()),
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
};

export default nextConfig;
