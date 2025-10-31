import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // 确保在生产环境中不使用turbopack
    turbo: false,
  },
  // 优化构建配置
  swcMinify: true,
  poweredByHeader: false,
};

export default nextConfig;
