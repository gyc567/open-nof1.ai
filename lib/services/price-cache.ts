/**
 * 价格数据缓存系统
 *
 * 功能：
 * - 内存缓存存储
 * - TTL (Time To Live) 管理
 * - 自动清理过期数据
 * - 缓存命中统计
 * - LRU (Least Recently Used) 淘汰策略
 */

// 缓存项接口
interface CacheItem<T> {
  value: T;
  expiresAt: number;
  createdAt: number;
  lastAccessed: number;
  accessCount: number;
}

// 缓存统计信息
interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalRequests: number;
  expiredItems: number;
  activeItems: number;
  averageAge: number;
}

// 缓存配置
interface CacheConfig {
  // 默认TTL (毫秒)
  defaultTTL: number;
  
  // 最大缓存项数
  maxItems: number;
  
  // 清理间隔 (毫秒)
  cleanupInterval: number;
  
  // LRU淘汰阈值
  lruThreshold: number;
}

/**
 * 价格缓存管理器
 */
export class PriceCache {
  private store: Map<string, CacheItem<unknown>> = new Map();
  private config: CacheConfig;
  private stats: CacheStats;
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(customConfig?: Partial<CacheConfig>) {
    this.config = {
      defaultTTL: 60000, // 1分钟
      maxItems: 100,
      cleanupInterval: 30000, // 30秒
      lruThreshold: 0.8, // 80%时触发LRU
      ...customConfig,
    };

    this.stats = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalRequests: 0,
      expiredItems: 0,
      activeItems: 0,
      averageAge: 0,
    };

    this.startCleanupTimer();
  }

  /**
   * 设置缓存项
   */
  set<T>(key: string, value: T, ttl?: number): void {
    const now = Date.now();
    const expiresAt = now + (ttl || this.config.defaultTTL);

    // 如果缓存已满，执行LRU淘汰
    if (this.store.size >= this.config.maxItems) {
      this.evictLRU();
    }

    const item: CacheItem<T> = {
      value,
      expiresAt,
      createdAt: now,
      lastAccessed: now,
      accessCount: 0,
    };

    this.store.set(key, item);
    this.updateStats();

    console.log(`💾 Cached item: ${key} (expires in ${(ttl || this.config.defaultTTL) / 1000}s)`);
  }

  /**
   * 获取缓存项
   */
  get<T>(key: string): T | null {
    this.stats.totalRequests++;

    const item = this.store.get(key);

    if (!item) {
      this.stats.misses++;
      this.updateStats();
      return null;
    }

    // 检查是否过期
    if (this.isExpired(item)) {
      this.store.delete(key);
      this.stats.misses++;
      this.stats.expiredItems++;
      this.updateStats();
      console.log(`⏰ Cache expired: ${key}`);
      return null;
    }

    // 更新访问统计
    item.lastAccessed = Date.now();
    item.accessCount++;

    this.stats.hits++;
    this.updateStats();

    console.log(`✅ Cache hit: ${key} (accessed ${item.accessCount} times)`);
    return item.value as T;
  }

  /**
   * 检查缓存项是否存在且未过期
   */
  has(key: string): boolean {
    const item = this.store.get(key);
    return item !== undefined && !this.isExpired(item);
  }

  /**
   * 删除缓存项
   */
  delete(key: string): boolean {
    const existed = this.store.delete(key);
    if (existed) {
      this.updateStats();
      console.log(`🗑️ Deleted cache: ${key}`);
    }
    return existed;
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.store.clear();
    this.updateStats();
    console.log("🧹 Cleared all cache");
  }

  /**
   * 获取缓存项的剩余TTL
   */
  getTTL(key: string): number {
    const item = this.store.get(key);
    if (!item || this.isExpired(item)) {
      return 0;
    }
    return item.expiresAt - Date.now();
  }

  /**
   * 刷新缓存项TTL
   */
  refresh(key: string, ttl?: number): boolean {
    const item = this.store.get(key);
    if (!item || this.isExpired(item)) {
      return false;
    }

    item.expiresAt = Date.now() + (ttl || this.config.defaultTTL);
    item.lastAccessed = Date.now();
    
    console.log(`🔄 Refreshed cache: ${key}`);
    return true;
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): CacheStats {
    this.updateStats();
    return { ...this.stats };
  }

  /**
   * 获取所有缓存键
   */
  getKeys(): string[] {
    return Array.from(this.store.keys());
  }

  /**
   * 获取缓存项信息 (调试用)
   */
  getInfo(key: string): { 
    exists: boolean; 
    age: number; 
    ttl: number; 
    accessCount: number;
    isExpired: boolean;
  } | null {
    const item = this.store.get(key);
    if (!item) {
      return null;
    }

    const now = Date.now();
    return {
      exists: true,
      age: now - item.createdAt,
      ttl: item.expiresAt - now,
      accessCount: item.accessCount,
      isExpired: this.isExpired(item),
    };
  }

  /**
   * 检查缓存项是否过期
   */
  private isExpired(item: CacheItem<unknown>): boolean {
    return Date.now() > item.expiresAt;
  }

  /**
   * LRU (Least Recently Used) 淘汰策略
   */
  private evictLRU(): void {
    if (this.store.size === 0) return;

    // 找到最久未访问的项
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, item] of this.store.entries()) {
      if (item.lastAccessed < oldestTime) {
        oldestTime = item.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.store.delete(oldestKey);
      console.log(`♻️ LRU evicted: ${oldestKey}`);
    }
  }

  /**
   * 清理过期缓存项
   */
  private cleanup(): void {
    let expiredCount = 0;
    const now = Date.now();

    for (const [key, item] of this.store.entries()) {
      if (now > item.expiresAt) {
        this.store.delete(key);
        expiredCount++;
      }
    }

    if (expiredCount > 0) {
      console.log(`🧹 Cleaned up ${expiredCount} expired cache items`);
      this.stats.expiredItems = expiredCount;
    }

    this.updateStats();
  }

  /**
   * 启动定时清理
   */
  private startCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);

    console.log(`⏰ Started cache cleanup timer (interval: ${this.config.cleanupInterval}ms)`);
  }

  /**
   * 停止定时清理
   */
  stopCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
      console.log("⏹️ Stopped cache cleanup timer");
    }
  }

  /**
   * 更新统计信息
   */
  private updateStats(): void {
    this.stats.activeItems = this.store.size;
    this.stats.totalRequests = this.stats.hits + this.stats.misses;
    this.stats.hitRate = this.stats.totalRequests > 0 
      ? (this.stats.hits / this.stats.totalRequests) * 100 
      : 0;

    // 计算平均年龄
    if (this.store.size > 0) {
      const now = Date.now();
      const totalAge = Array.from(this.store.values())
        .reduce((sum, item) => sum + (now - item.createdAt), 0);
      this.stats.averageAge = totalAge / this.store.size;
    } else {
      this.stats.averageAge = 0;
    }
  }

  /**
   * 打印缓存状态 (调试用)
   */
  printStatus(): void {
    console.log("\n" + "=".repeat(60));
    console.log("📊 Price Cache Status");
    console.log("=".repeat(60));
    console.log(`Active Items: ${this.stats.activeItems}`);
    console.log(`Total Requests: ${this.stats.totalRequests}`);
    console.log(`Hits: ${this.stats.hits}`);
    console.log(`Misses: ${this.stats.misses}`);
    console.log(`Hit Rate: ${this.stats.hitRate.toFixed(2)}%`);
    console.log(`Average Age: ${(this.stats.averageAge / 1000).toFixed(2)}s`);
    console.log(`Expired Items: ${this.stats.expiredItems}`);
    console.log("\nCache Keys:");
    this.store.forEach((item, key) => {
      const age = (Date.now() - item.createdAt) / 1000;
      const ttl = (item.expiresAt - Date.now()) / 1000;
      console.log(`  ${key}: age=${age.toFixed(1)}s, ttl=${ttl.toFixed(1)}s, accesses=${item.accessCount}`);
    });
    console.log("=".repeat(60) + "\n");
  }

  /**
   * 销毁缓存实例
   */
  destroy(): void {
    this.stopCleanupTimer();
    this.clear();
    console.log("🗑️ Destroyed cache instance");
  }
}

// 预定义缓存实例
export const priceCache = new PriceCache();

// 导出类型
export type { CacheItem, CacheStats, CacheConfig };
