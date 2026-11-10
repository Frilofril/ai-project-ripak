import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        "friendly-space-palm-tree-pjvwrxqprv44cr75p-3000.app.github.dev",
        "*.app.github.dev",
        "localhost:3000",
      ],
    },
  },
};

export default nextConfig;