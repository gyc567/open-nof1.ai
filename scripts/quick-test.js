/**
 * 快速测试：手动填充缓存并测试聚合器
 */

import { priceAggregator } from "../lib/services/price-aggregator";
import { priceCache } from "../lib/services/price-cache";

async function quickTest() {
  console.log("\n" + "=".repeat(70));
  console.log("🚀 快速功能测试");
  console.log("=".repeat(70));
  
  // 1. 检查聚合器配置
  console.log("\n📋 聚合器配置:");
  const config = priceAggregator.getConfig();
  console.log(`   健康检查间隔: ${config.healthCheckInterval}ms`);
  console.log(`   超时时间: ${config.timeout}ms`);
  console.log(`   缓存TTL: ${config.cacheTTL}ms`);
  console.log(`   最大重试: ${config.maxRetries}`);
  
  // 2. 检查缓存状态
  console.log("\n💾 缓存状态:");
  const cacheStats = priceCache.getStats();
  console.log(`   活跃项: ${cacheStats.activeItems}`);
  console.log(`   命中率: ${cacheStats.hitRate.toFixed(2)}%`);
  
  // 3. 手动设置一些测试数据到缓存
  console.log("\n🔧 设置测试缓存数据...");
  const testData = {
    btc: {
      current_price: 50000,
      price_change_percentage_24h: 2.5,
      volume: 1234567,
      last_updated: new Date().toISOString(),
      symbol: "BTCUSDT"
    },
    eth: {
      current_price: 3000,
      price_change_percentage_24h: 1.8,
      volume: 876543,
      last_updated: new Date().toISOString(),
      symbol: "ETHUSDT"
    },
    sol: {
      current_price: 100,
      price_change_percentage_24h: 3.2,
      volume: 234567,
      last_updated: new Date().toISOString(),
      symbol: "SOLUSDT"
    },
    bnb: {
      current_price: 350,
      price_change_percentage_24h: 0.5,
      volume: 345678,
      last_updated: new Date().toISOString(),
      symbol: "BNBUSDT"
    },
    doge: {
      current_price: 0.08,
      price_change_percentage_24h: 5.0,
      volume: 123456,
      last_updated: new Date().toISOString(),
      symbol: "DOGEUSDT"
    }
  };
  
  priceCache.set("aggregated", testData, 60000); // 60秒TTL
  console.log("✅ 测试数据已写入缓存");
  
  // 4. 测试缓存读取
  console.log("\n📖 测试缓存读取...");
  const cachedData = priceCache.get("aggregated");
  if (cachedData) {
    console.log("✅ 缓存读取成功:");
    console.log(`   BTC: $${cachedData.btc.current_price}`);
    console.log(`   ETH: $${cachedData.eth.current_price}`);
    console.log(`   SOL: $${cachedData.sol.current_price}`);
  }
  
  // 5. 检查聚合器健康状态
  console.log("\n💓 聚合器健康状态:");
  const healthStatus = priceAggregator.getHealthStatus();
  Object.entries(healthStatus).forEach(([source, health]: [string, any]) => {
    const status = health.isHealthy ? '✅' : '❌';
    console.log(`   ${source}: ${status} (错误: ${health.errorCount}, 延迟: ${health.averageLatency?.toFixed(0) || 'N/A'}ms)`);
  });
  
  // 6. 尝试从缓存获取聚合数据
  console.log("\n🔄 测试聚合器缓存读取...");
  try {
    const aggregatedData = await priceAggregator.getAggregatedPrices();
    console.log("✅ 成功从缓存获取数据:");
    console.log(`   数据源: ${aggregatedData.source}`);
    console.log(`   延迟: ${aggregatedData.latency}ms`);
    console.log(`   BTC: $${aggregatedData.btc.current_price}`);
  } catch (error) {
    console.log(`⚠️ 聚合器错误: ${error.message}`);
  }
  
  console.log("\n" + "=".repeat(70));
  console.log("✨ 快速测试完成");
  console.log("=".repeat(70) + "\n");
}

quickTest()
  .catch(console.error);
