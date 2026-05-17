/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.dsmcdn.com",
      },
      {
        protocol: "https",
        hostname: "**.dsmcdn.com",
      },
      {
        protocol: "https",
        hostname: "img.trendyol.com",
      },
    ],
    unoptimized: false,
  },
};

module.exports = nextConfig;
