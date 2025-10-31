import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 优化构建配置
  swcMinify: true,
  poweredByHeader: false,
};

export default nextConfig;
