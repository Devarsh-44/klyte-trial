import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Lets a production build sit beside a running dev server (NEXT_DIST_DIR=.next-prod).
  distDir: process.env.NEXT_DIST_DIR || ".next",
  transpilePackages: ["three"],
};

export default nextConfig;
