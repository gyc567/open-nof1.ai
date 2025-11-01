/**
 * Binance API 服务
 * 获取实时加密货币价格数据
 * 
 * 特性：
 * - 获取所有主要交易对价格
 * - 24小时统计数据
 * - 自动重试机制
 * - 数据验证
 */

import axios, { AxiosRequestConfig } from "axios";
import { withRetry } from "@/lib/utils/retry";
import { HttpsProxyAgent } from "https-proxy-agent";
import { getProxyUrl, isProxyEnabled } from "@/lib/utils/proxy-config";

// Binance REST API 端点
const BINANCE_API_BASE = "https://api.binance.com/api/v3";
const BINANCE_API_TESTNET = "https://testnet.binance.vision/api/v3";

/**
 * 获取axios配置，支持条件性代理
 * @returns AxiosRequestConfig axios配置对象
 */
function getAxiosConfig(): AxiosRequestConfig {
  const config: AxiosRequestConfig = {
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
      // @ts-expect-error - axios支持httpAgent和httpsAgent
      config.httpAgent = new HttpsProxyAgent(proxyUrl);
      // @ts-expect-error - axios支持httpAgent和httpsAgent
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

// 交易对映射 (Symbol -> CoinGecko ID)
const SYMBOL_MAP = {
  BTCUSDT: "bitcoin",
  ETHUSDT: "ethereum",
  SOLUSDT: "solana",
  BNBUSDT: "binancecoin",
  DOGEUSDT: "dogecoin",
};

// 币种反向映射
const COIN_MAP = {
  bitcoin: "BTCUSDT",
  ethereum: "ETHUSDT",
  solana: "SOLUSDT",
  binancecoin: "BNBUSDT",
  dogecoin: "DOGEUSDT",
};

// Binance API 响应类型
interface BinanceTickerResponse {
  symbol: string;              // 交易对
  priceChange: string;         // 价格变化
  priceChangePercent: string;  // 变化百分比
  weightedAvgPrice: string;    // 加权平均价
  prevClosePrice: string;      // 前收盘价
  lastPrice: string;           // 最新价格
  lastQty: string;             // 最新成交量
  bidPrice: string;            // 买一价
  bidQty: string;              // 买一量
  askPrice: string;            // 卖一价
  askQty: string;              // 卖一量
  openPrice: string;           // 开盘价
  highPrice: string;           // 最高价
  lowPrice: string;            // 最低价
  volume: string;              // 成交量
  quoteVolume: string;         // 成交额
  openTime: number;            // 开始时间
  closeTime: number;           // 结束时间
  count: number;               // 交易对数量
}

// 标准化价格数据
interface StandardizedPrice {
  current_price: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  volume: number;
  last_updated: string;
  symbol: string;
}

/**
 * 验证价格数据是否有效
 */
function isValidPriceData(data: any): boolean {
  return (
    data &&
    typeof data.lastPrice === "string" &&
    typeof data.priceChangePercent === "string" &&
    parseFloat(data.lastPrice) > 0
  );
}

/**
 * 从Binance API获取单个交易对价格
 */
async function fetchSymbolPrice(symbol: string): Promise<StandardizedPrice> {
  const connectionType = isProxyEnabled() && getProxyUrl() 
    ? `proxy (${getProxyUrl()})` 
    : 'direct connection';
  
  console.log(`📡 Fetching price for ${symbol} via ${connectionType}`);
  
  const response = await axios.get(`${BINANCE_API_BASE}/ticker/24hr?symbol=${symbol}`, getAxiosConfig());

  if (response.status !== 200) {
    throw new Error(`Binance API error: ${response.status} for ${symbol}`);
  }

  const data = response.data;

  if (!isValidPriceData(data)) {
    throw new Error(`Invalid price data for ${symbol}`);
  }

  const lastPrice = parseFloat(data.lastPrice);
  const priceChangePercent = parseFloat(data.priceChangePercent);
  const volume = parseFloat(data.volume);

  return {
    current_price: lastPrice,
    price_change_24h: lastPrice * (priceChangePercent / 100),
    price_change_percentage_24h: priceChangePercent,
    volume: volume,
    last_updated: new Date().toISOString(),
    symbol: symbol,
  };
}

/**
 * 从Binance API获取所有目标交易对价格
 * 使用批量请求优化性能
 */
export async function fetchAllBinancePrices(): Promise<{
  btc: StandardizedPrice;
  eth: StandardizedPrice;
  sol: StandardizedPrice;
  bnb: StandardizedPrice;
  doge: StandardizedPrice;
}> {
  try {
    const connectionType = isProxyEnabled() && getProxyUrl() 
      ? `proxy (${getProxyUrl()})` 
      : 'direct connection';
    
    console.log(`📡 Fetching prices from Binance API via ${connectionType}...`);
    
    // axios默认5秒超时，这里可以调整
    const response = await axios.get(`${BINANCE_API_BASE}/ticker/24hr`, {
      ...getAxiosConfig(),
      timeout: 8000,
    });

    if (response.status !== 200) {
      throw new Error(`Binance API error: ${response.status}`);
    }

    const allTickers: BinanceTickerResponse[] = response.data;

    // 提取我们需要的交易对数据
    const targetSymbols = Object.values(SYMBOL_MAP).map((symbol) => symbol.replace("USDT", "USDT"));
    const targetData: { [key: string]: BinanceTickerResponse } = {};

    allTickers.forEach((ticker) => {
      if (SYMBOL_MAP[ticker.symbol as keyof typeof SYMBOL_MAP]) {
        targetData[ticker.symbol] = ticker;
      }
    });

    // 验证所有必需的交易对都已获取
    const requiredSymbols = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "DOGEUSDT"];
    const missingSymbols = requiredSymbols.filter((symbol) => !targetData[symbol]);

    if (missingSymbols.length > 0) {
      throw new Error(`Missing price data for symbols: ${missingSymbols.join(", ")}`);
    }

    // 标准化数据格式
    const formatPrice = (ticker: BinanceTickerResponse, coinKey: string): StandardizedPrice => {
      const lastPrice = parseFloat(ticker.lastPrice);
      const priceChangePercent = parseFloat(ticker.priceChangePercent);
      const volume = parseFloat(ticker.volume);

      return {
        current_price: lastPrice,
        price_change_24h: lastPrice * (priceChangePercent / 100),
        price_change_percentage_24h: priceChangePercent,
        volume: volume,
        last_updated: new Date().toISOString(),
        symbol: ticker.symbol,
      };
    };

    console.log("✅ Successfully fetched Binance prices:");
    console.log(`   BTC: $${parseFloat(targetData.BTCUSDT.lastPrice).toLocaleString()}`);
    console.log(`   ETH: $${parseFloat(targetData.ETHUSDT.lastPrice).toLocaleString()}`);
    console.log(`   SOL: $${parseFloat(targetData.SOLUSDT.lastPrice).toFixed(2)}`);
    console.log(`   BNB: $${parseFloat(targetData.BNBUSDT.lastPrice).toFixed(2)}`);
    console.log(`   DOGE: $${parseFloat(targetData.DOGEUSDT.lastPrice).toFixed(4)}`);

    return {
      btc: formatPrice(targetData.BTCUSDT, "btc"),
      eth: formatPrice(targetData.ETHUSDT, "eth"),
      sol: formatPrice(targetData.SOLUSDT, "sol"),
      bnb: formatPrice(targetData.BNBUSDT, "bnb"),
      doge: formatPrice(targetData.DOGEUSDT, "doge"),
    };

  } catch (error) {
    console.error("❌ Error fetching Binance prices:", error);
    throw error;
  }
}

/**
 * 带重试机制的Binance价格获取
 */
export async function getBinancePricesWithRetry(): Promise<{
  btc: StandardizedPrice;
  eth: StandardizedPrice;
  sol: StandardizedPrice;
  bnb: StandardizedPrice;
  doge: StandardizedPrice;
}> {
  return withRetry(
    async () => await fetchAllBinancePrices(),
    {
      maxAttempts: 3,
      delayMs: 1000,
      retryCondition: (error) => {
        // 只在网络错误或5xx错误时重试
        return (
          error.message.includes("Binance API error") ||
          error.message.includes("fetch") ||
          error.message.includes("network") ||
          error.message.includes("502") ||
          error.message.includes("503") ||
          error.message.includes("504")
        );
      },
    }
  );
}

/**
 * 健康检查：验证Binance API是否可用
 */
export async function checkBinanceHealth(): Promise<boolean> {
  try {
    const connectionType = isProxyEnabled() && getProxyUrl() 
      ? `proxy (${getProxyUrl()})` 
      : 'direct connection';
    
    console.log(`🔍 Health check via ${connectionType}...`);
    
    const response = await axios.get(`${BINANCE_API_BASE}/ping`, {
      ...getAxiosConfig(),
      timeout: 5000,
    });
    
    const isHealthy = response.status === 200;
    
    if (isHealthy) {
      console.log(`✅ Binance API healthy`);
    } else {
      console.log(`❌ Binance API unhealthy: ${response.status}`);
    }
    
    return isHealthy;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Binance health check failed:", message);
    return false;
  }
}

/**
 * 获取特定币种价格 (单个)
 */
export async function getBinancePrice(symbol: keyof typeof COIN_MAP): Promise<StandardizedPrice> {
  const binanceSymbol = COIN_MAP[symbol];
  return fetchSymbolPrice(binanceSymbol);
}

/**
 * 导出币种映射配置
 */
export { SYMBOL_MAP, COIN_MAP };

/**
 * 币种精度配置
 */
export const PRICE_PRECISION = {
  BTC: 2,
  ETH: 2,
  SOL: 2,
  BNB: 2,
  DOGE: 4,
} as const;
