import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // production build optimizations
  poweredByHeader: false,
  compress: true,

  // webpack配置：处理Node.js特定库
  webpack: (config, { isServer }) => {
    // 如果是服务器端构建，排除Node.js特定模块
    if (isServer) {
      // 配置Node.js模块的externals
      config.externals = config.externals || [];
      
      // 添加Node.js特定库到externals
      const nodeModules = [
        'ccxt',
        'technicalindicators',
        'protobufjs',
        'node-cron'
      ];
      
      nodeModules.forEach((module) => {
        config.externals.push({
          [module]: `commonjs ${module}`,
        });
      });
    }

    // 优化配置
    config.optimization = {
      ...config.optimization,
      // 减小bundle大小
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
          },
        },
      },
    };

    // 解决ccxt的依赖问题
    config.resolve = config.resolve || {};
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    };

    return config;
  },

  // 实验性功能
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
};

export default nextConfig;
