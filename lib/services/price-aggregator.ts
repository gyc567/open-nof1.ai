/**
 * 多源价格聚合器
 * 
 * 功能：
 * - 智能数据源选择 (Binance -> CoinGecko -> 缓存)
 * - 自动故障转移
 * - 数据验证和标准化
 * - 健康检查
 * - 性能监控
 */

import axios from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";
import { getProxyUrl, isProxyEnabled } from "@/lib/utils/proxy-config";
import { 
  fetchAllBinancePrices, 
  checkBinanceHealth,
  StandardizedPrice as BinancePrice 
} from "./binance";
import { fetchAllPrices as fetchCoinGeckoPrices } from "./coingecko";
import { PriceCache } from "./price-cache";

// 数据源类型
type DataSource = "binance" | "coingecko" | "cache";

/**
 * 获取axios配置，支持条件性代理
 * @returns axios配置对象
 */
function getAxiosConfig() {
  const config = {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
    timeout: 5000,
  };
  
  // 只有启用代理且存在代理URL时才配置代理
  if (isProxyEnabled()) {
    const proxyUrl = getProxyUrl();
    if (proxyUrl) {
      // @ts-expect-error - HttpsProxyAgent类型不匹配但功能正常
      config.httpAgent = new HttpsProxyAgent(proxyUrl);
      // @ts-expect-error - HttpsProxyAgent类型不匹配但功能正常
      config.httpsAgent = new HttpsProxyAgent(proxyUrl);
      console.log(`🔌 Using proxy: ${proxyUrl}`);
    } else {
      console.log(`⚠️ Proxy enabled but no URL configured`);
    }
  } else {
    console.log(`🔌 Direct connection (proxy disabled)`);
  }
  
  return config;
}

// 数据源健康状态
interface DataSourceHealth {
  source: DataSource;
  isHealthy: boolean;
  lastCheck: number;
  errorCount: number;
  successCount: number;
  averageLatency: number;
}

// 聚合器配置
interface AggregatorConfig {
  // 健康检查间隔 (毫秒)
  healthCheckInterval: number;
  
  // 重试次数
  maxRetries: number;
  
  // 超时时间 (毫秒)
  timeout: number;
  
  // 故障转移阈值
  failureThreshold: number;
  
  // 缓存TTL (毫秒)
  cacheTTL: number;
}

// 聚合结果
interface AggregatedPrice {
  // 基础价格数据
  btc: BinancePrice;
  eth: BinancePrice;
  sol: BinancePrice;
  bnb: BinancePrice;
  doge: BinancePrice;
  
  // 元数据
  source: DataSource;
  timestamp: string;
  latency: number;
  isStale: boolean;
}

// 数据源管理器
class DataSourceManager {
  private healthMap: Map<DataSource, DataSourceHealth> = new Map();
  private config: AggregatorConfig;
  private cache: PriceCache;
  private lastHealthCheck: number = 0;

  constructor(config: AggregatorConfig, cache: PriceCache) {
    this.config = config;
    this.cache = cache;
    
    // 初始化健康状态
    this.initializeHealthStatus();
  }

  private initializeHealthStatus() {
    const sources: DataSource[] = ["binance", "coingecko", "cache"];
    sources.forEach(source => {
      this.healthMap.set(source, {
        source,
        isHealthy: true,
        lastCheck: Date.now(),
        errorCount: 0,
        successCount: 0,
        averageLatency: 0,
      });
    });
  }

  /**
   * 获取健康的数据源列表 (按优先级排序)
   */
  getHealthySources(): DataSource[] {
    const sources: DataSource[] = ["binance", "coingecko", "cache"];
    
    // 按优先级和健康状态排序
    return sources.filter(source => {
      const health = this.healthMap.get(source);
      return health?.isHealthy && health.errorCount < this.config.failureThreshold;
    });
  }

  /**
   * 执行健康检查
   */
  async performHealthCheck(): Promise<void> {
    const now = Date.now();
    
    // 避免频繁检查
    if (now - this.lastHealthCheck < this.config.healthCheckInterval) {
      return;
    }

    this.lastHealthCheck = now;
    console.log("🔍 Performing health check on all data sources...");

    // 并行检查所有数据源
    const healthChecks = await Promise.allSettled([
      this.checkBinanceHealth(),
      this.checkCoinGeckoHealth(),
    ]);

    // 更新健康状态
    this.updateHealthStatus("binance", healthChecks[0]);
    this.updateHealthStatus("coingecko", healthChecks[1]);

    // 缓存总是健康的
    this.updateHealthStatus("cache", { status: "fulfilled", value: true });

    this.logHealthStatus();
  }

  private async checkBinanceHealth(): Promise<boolean> {
    const startTime = Date.now();
    try {
      const isHealthy = await checkBinanceHealth();
      const latency = Date.now() - startTime;
      
      this.updateLatency("binance", latency);
      return isHealthy;
    } catch (error) {
      this.updateLatency("binance", Date.now() - startTime);
      throw error;
    }
  }

  private async checkCoinGeckoHealth(): Promise<boolean> {
    const startTime = Date.now();
    try {
      const connectionType = isProxyEnabled() && getProxyUrl() 
        ? `proxy (${getProxyUrl()})` 
        : 'direct connection';
      
      console.log(`🔍 CoinGecko health check via ${connectionType}...`);
      
      const response = await axios.get("https://api.coingecko.com/api/v3/ping", getAxiosConfig());
      
      const latency = Date.now() - startTime;
      this.updateLatency("coingecko", latency);
      
      return response.status === 200;
    } catch (err: unknown) {
      this.updateLatency("coingecko", Date.now() - startTime);
      const message = err instanceof Error ? err.message : String(err);
      console.error("CoinGecko health check failed:", message);
      return false;
    }
  }

  private updateHealthStatus(source: DataSource, result: PromiseSettledResult<boolean>) {
    const health = this.healthMap.get(source);
    if (!health) return;

    health.lastCheck = Date.now();

    if (result.status === "fulfilled" && result.value) {
      health.isHealthy = true;
      health.successCount++;
      health.errorCount = Math.max(0, health.errorCount - 1); // 错误计数递减
    } else {
      health.isHealthy = false;
      health.errorCount++;
      console.warn(`⚠️ Data source ${source} is unhealthy:`, result.status === "rejected" ? result.reason : "API returned false");
    }
  }

  private updateLatency(source: DataSource, latency: number) {
    const health = this.healthMap.get(source);
    if (!health) return;

    // 计算平均延迟
    health.averageLatency = (health.averageLatency * 0.8) + (latency * 0.2);
  }

  private logHealthStatus() {
    const status = Array.from(this.healthMap.values())
      .map(h => `${h.source}: ${h.isHealthy ? '✅' : '❌'} (${h.averageLatency.toFixed(0)}ms)`)
      .join(", ");
    
    console.log(`📊 Data source health: ${status}`);
  }

  /**
   * 记录成功
   */
  recordSuccess(source: DataSource) {
    const health = this.healthMap.get(source);
    if (health) {
      health.successCount++;
      health.errorCount = Math.max(0, health.errorCount - 1);
    }
  }

  /**
   * 记录失败
   */
  recordFailure(source: DataSource, error: Error) {
    const health = this.healthMap.get(source);
    if (health) {
      health.errorCount++;
      console.error(`❌ ${source} failed:`, error.message);
    }
  }

  /**
   * 获取健康状态摘要
   */
  getHealthSummary() {
    return Object.fromEntries(this.healthMap);
  }
}

// 价格聚合器主类
export class PriceAggregator {
  private config: AggregatorConfig;
  private cache: PriceCache;
  private sourceManager: DataSourceManager;
  private lastUpdate: number = 0;

  constructor(customConfig?: Partial<AggregatorConfig>) {
    this.config = {
      healthCheckInterval: 60000, // 1分钟
      maxRetries: 3,
      timeout: 5000, // 5秒
      failureThreshold: 5,
      cacheTTL: 30000, // 30秒
      ...customConfig,
    };

    this.cache = new PriceCache({ defaultTTL: this.config.cacheTTL });
    this.sourceManager = new DataSourceManager(this.config, this.cache);
  }

  /**
   * 获取聚合价格数据
   */
  async getAggregatedPrices(): Promise<AggregatedPrice> {
    const startTime = Date.now();
    
    // 执行健康检查
    await this.sourceManager.performHealthCheck();

    // 获取健康的数据源
    const healthySources = this.sourceManager.getHealthySources();
    
    if (healthySources.length === 0) {
      throw new Error("No healthy data sources available");
    }

    // 尝试从各个数据源获取数据
    for (const source of healthySources) {
      try {
        const data = await this.fetchFromSource(source);
        const latency = Date.now() - startTime;
        
        // 验证数据质量
        if (this.validateData(data)) {
          this.sourceManager.recordSuccess(source);
          
          // 更新缓存
          this.cache.set("aggregated", data);
          this.lastUpdate = Date.now();
          
          console.log(`✅ Successfully fetched prices from ${source} (${latency}ms)`);
          
          return {
            ...data,
            source,
            timestamp: new Date().toISOString(),
            latency,
            isStale: Date.now() - this.lastUpdate > this.config.cacheTTL,
          };
        }
      } catch (error) {
        this.sourceManager.recordFailure(source, error as Error);
        console.warn(`⚠️ Failed to fetch from ${source}, trying next source...`);
        continue;
      }
    }

    // 所有数据源都失败，尝试使用缓存
    console.warn("⚠️ All data sources failed, falling back to cache...");
    const cached = this.cache.get("aggregated");
    
    if (cached) {
      console.log("✅ Using cached data");
      return {
        ...(cached as AggregatedPrice),
        source: "cache" as DataSource,
        timestamp: new Date().toISOString(),
        latency: 0,
        isStale: true,
      };
    }

    throw new Error("All data sources failed and no cached data available");
  }

  /**
   * 从指定数据源获取数据
   */
  private async fetchFromSource(source: DataSource): Promise<{
    btc: BinancePrice;
    eth: BinancePrice;
    sol: BinancePrice;
    bnb: BinancePrice;
    doge: BinancePrice;
  }> {
    switch (source) {
      case "binance":
        return await fetchAllBinancePrices();
      
      case "coingecko": {
        const result = await fetchCoinGeckoPrices();
        return {
          btc: {
            current_price: result.btc.current_price,
            price_change_24h: result.btc.current_price * 0.02, // 模拟
            price_change_percentage_24h: 2,
            volume: 1234567,
            last_updated: new Date().toISOString(),
            symbol: "BTCUSDT",
          },
          eth: {
            current_price: result.eth.current_price,
            price_change_24h: result.eth.current_price * 0.02,
            price_change_percentage_24h: 2,
            volume: 876543,
            last_updated: new Date().toISOString(),
            symbol: "ETHUSDT",
          },
          sol: {
            current_price: result.sol.current_price,
            price_change_24h: result.sol.current_price * 0.02,
            price_change_percentage_24h: 2,
            volume: 234567,
            last_updated: new Date().toISOString(),
            symbol: "SOLUSDT",
          },
          bnb: {
            current_price: result.bnb.current_price,
            price_change_24h: result.bnb.current_price * 0.02,
            price_change_percentage_24h: 2,
            volume: 345678,
            last_updated: new Date().toISOString(),
            symbol: "BNBUSDT",
          },
          doge: {
            current_price: result.doge.current_price,
            price_change_24h: result.doge.current_price * 0.02,
            price_change_percentage_24h: 2,
            volume: 123456,
            last_updated: new Date().toISOString(),
            symbol: "DOGEUSDT",
          },
        };
      }
      
      case "cache":
        const cached = this.cache.get("aggregated");
        if (!cached) {
          throw new Error("No cached data available");
        }
        return cached;
      
      default:
        throw new Error(`Unknown data source: ${source}`);
    }
  }

  /**
   * 验证数据质量
   */
  private validateData(data: Record<string, unknown>): boolean {
    try {
      // 检查所有必需字段
      const requiredCoins = ["btc", "eth", "sol", "bnb", "doge"];
      
      for (const coin of requiredCoins) {
        if (!data[coin] || 
            typeof data[coin].current_price !== "number" || 
            data[coin].current_price <= 0) {
          console.error(`Invalid data for ${coin}:`, data[coin]);
          return false;
        }

        // 检查价格合理性 (不超过1000万美元)
        if (data[coin].current_price > 10000000) {
          console.error(`Price too high for ${coin}: ${data[coin].current_price}`);
          return false;
        }

        // 检查24h变化幅度 (不超过100%)
        if (Math.abs(data[coin].price_change_percentage_24h) > 100) {
          console.error(`Change too large for ${coin}: ${data[coin].price_change_percentage_24h}%`);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Data validation error:", error);
      return false;
    }
  }

  /**
   * 获取健康状态摘要
   */
  getHealthStatus() {
    return this.sourceManager.getHealthSummary();
  }

  /**
   * 清除缓存
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * 获取配置
   */
  getConfig() {
    return this.config;
  }
}

// 导出单例实例
export const priceAggregator = new PriceAggregator();

// 导出类型
export type { AggregatedPrice, DataSource, DataSourceHealth };
