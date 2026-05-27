/** @type {import('next').NextConfig} */

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

const nextConfig = {
  // Expose BACKEND_URL to server components via env
  env: {
    BACKEND_URL,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.dsmcdn.com" },
      { protocol: "https", hostname: "**.dsmcdn.com" },
      { protocol: "https", hostname: "img.trendyol.com" },
      // Allow generated AI images served from the backend
      { protocol: "http", hostname: "localhost", port: "8000" },
      // Railway backend (production)
      { protocol: "https", hostname: "*.railway.app" },
      { protocol: "https", hostname: "*.up.railway.app" },
    ],
    unoptimized: false,
  },
  // Proxy /assets/* and /api/* to the FastAPI backend so generated images
  // (stored as /assets/{store}/generated/{file}) load correctly in the demo frontend.
  async rewrites() {
    return [
      {
        source: "/assets/:path*",
        destination: `${BACKEND_URL}/assets/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
