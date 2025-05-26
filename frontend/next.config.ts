import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/debate",
        destination: "http://localhost:4000/debate", // ← Your Express backend
      },
    ];
  },
};

export default nextConfig;
