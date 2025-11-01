/** @type {import('next').NextConfig} */
const nextConfig = {
  // 设置Turbopack的工作目录为项目根目录
  turbopack: {
    root: __dirname,
  },
  // 启用实验性功能
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

module.exports = nextConfig;
