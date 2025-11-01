import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // production build optimizations
  poweredByHeader: false,
  compress: true,
};

export default nextConfig;
