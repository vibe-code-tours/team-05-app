import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@crossmart/shared"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.r2.dev",
      },
      {
        protocol: "https",
        hostname: "*.cloudflarestorage.com",
      },
    ],
  },
};

export default nextConfig;
