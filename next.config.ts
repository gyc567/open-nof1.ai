import type { NextConfig } from "next";

/**
 * Next.js应用配置
 * 
 * 关键配置说明：
 * 1. 处理Node.js特定库（ccxt、technicalindicators等）不被打包到客户端
 * 2. 优化生产构建性能
 * 3. 修复多lockfile警告
 */
const nextConfig: NextConfig = {
  // 生产构建优化
  poweredByHeader: false,  // 禁用Next.js标识头
  compress: true,           // 启用Gzip压缩

  // 修复多lockfile警告：指定项目根目录
  // 防止Next.js误认为工作区根目录在其他位置
  outputFileTracingRoot: __dirname,

  // Webpack配置：处理Node.js特定库
  // 原因：某些库（如ccxt）只能在Node.js运行，不能打包到浏览器bundle
  webpack: (config, { isServer }) => {
    // 仅在服务器端构建时处理
    if (isServer) {
      // 配置externals：告诉webpack不要打包这些模块
      // 它们将在运行时通过CommonJS require加载
      config.externals = config.externals || [];
      
      // 需要外部化的Node.js特定库列表
      const nodeModules = [
        'ccxt',                // 加密货币交易库
        'technicalindicators', // 技术指标计算库
        'protobufjs',          // Protocol Buffers序列化
        'node-cron'            // 定时任务调度
      ];
      
      // 将每个模块添加到externals配置
      nodeModules.forEach((module) => {
        config.externals.push({
          [module]: `commonjs ${module}`,
        });
      });
    }

    // 优化配置：代码分割
    config.optimization = {
      ...config.optimization,
      // 将node_modules分离为独立的vendor chunk
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

    // 解决ccxt的Node.js依赖问题
    // 为客户端bundle提供polyfill（返回false表示使用browser polyfill）
    config.resolve = config.resolve || {};
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,      // 文件系统
      net: false,      // 网络
      tls: false,      // TLS/SSL
      crypto: false,   // 加密
    };

    return config;
  },

  // 实验性功能：优化包导入
  // 仅导入实际使用的组件，减少bundle大小
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
    // 禁用Turbopack，确保与Vercel构建一致
    turbo: false,
  },
};

export default nextConfig;
